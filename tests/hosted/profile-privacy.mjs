import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

export async function verifyProfilePrivacy({ api, key, sql }) {
  assert.ok(process.platform === 'linux' && process.env.GITHUB_ACTIONS === 'true', 'HOSTED_ONLY');
  assert.ok(['127.0.0.1', 'localhost'].includes(api.hostname));
  assert.equal(api.port, '54321');
  assert.equal(api.protocol, 'http:');
  async function request(path, token, method = 'GET', body, expected = 200) {
    const response = await fetch(new URL(path, api), {
      method,
      headers: { apikey: key, ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json', Prefer: 'return=representation' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(15_000),
    });
    assert.equal(response.status, expected, `${method} ${path} failed`);
    return response.json();
  }
  // Reload the schema created by the baseline before using its REST tables.
  sql("NOTIFY pgrst, 'reload schema';");
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    const response = await fetch(new URL('/rest/v1/profiles?select=id', api), { headers: { apikey: key }, signal: AbortSignal.timeout(15_000) });
    if (response.status === 200) { ready = true; break; }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(ready, 'Profile schema did not become ready');
  const users = [];
  for (const name of ['alice', 'bob']) {
    const session = await request('/auth/v1/signup', null, 'POST', {
      email: `${name}-${randomUUID()}@example.com`, password: `Fixture-${randomUUID()}!`,
    });
    assert.ok(session.access_token && session.user?.id, 'Real signup session required');
    const profile = { id: session.user.id, username: `fixture_${name}`, preferences: { interests: [`private-${name}`] }, location: `SRID=4326;POINT(${name === 'alice' ? '-97.7431 30.2672' : '-74.0060 40.7128'})` };
    const inserted = await request('/rest/v1/profiles', session.access_token, 'POST', profile, 201);
    assert.equal(inserted[0].id, profile.id);
    assert.deepEqual(inserted[0].preferences, profile.preferences);
    users.push({ token: session.access_token, profile: inserted[0] });
  }
  const [alice, bob] = users;
  const path = id => `/rest/v1/profiles?id=eq.${id}&select=*`;
  const requireHidden = rows => assert.deepEqual(rows, [], 'Private profile leaked');
  const event = await request('/rest/v1/events', alice.token, 'POST', {
    title: 'Published privacy control', description: 'Synthetic public event control.', organizer_id: alice.profile.id,
    start_time: '2030-01-15T19:00:00-06:00', category: 'music', status: 'published',
  }, 201);
  const publicPath = `/rest/v1/events?id=eq.${event[0].id}&select=id,organizer:profiles(*)`;
  const requirePublicEvent = rows => assert.deepEqual(rows, [{ id: event[0].id, organizer: null }], 'Private organizer leaked');
  // Known-bad control: use the actual original policies, not a planted mock row.
  for (const token of [null, bob.token]) {
    const leaked = await request(path(alice.profile.id), token);
    assert.deepEqual(leaked, [alice.profile]);
    assert.throws(() => requireHidden(leaked), /Private profile leaked/);
    const embedded = await request(publicPath, token);
    assert.deepEqual(embedded, [{ id: event[0].id, organizer: alice.profile }]);
    assert.throws(() => requirePublicEvent(embedded), /Private organizer leaked/);
  }
  console.log('PROFILE_LEAK_CONTROL_REJECTED');

  sql(readFileSync('supabase/migrations/20260907000100_private_profile_reads.sql', 'utf8'));
  for (const owner of users) {
    const other = owner === alice ? bob : alice;
    requireHidden(await request(path(owner.profile.id), null));
    requireHidden(await request(path(owner.profile.id), other.token));
    assert.deepEqual(await request(path(owner.profile.id), owner.token), [owner.profile]);
    const updated = await request(path(owner.profile.id), owner.token, 'PATCH', { bio: 'owner-update-control' });
    assert.equal(updated[0].bio, 'owner-update-control');
    requireHidden(await request(path(owner.profile.id), other.token, 'PATCH', { bio: 'cross-user-write' }));
    const own = await request(path(owner.profile.id), owner.token);
    assert.equal(own[0].bio, 'owner-update-control');
    assert.deepEqual(own[0].preferences, owner.profile.preferences);
    assert.equal(own[0].location, owner.profile.location);
  }
  for (const token of [null, bob.token]) {
    requirePublicEvent(await request(publicPath, token));
  }
  const owned = await request(publicPath, alice.token);
  assert.equal(owned[0].organizer.id, alice.profile.id);
  console.log('PROFILE_PRIVACY_VERIFIED');
}
