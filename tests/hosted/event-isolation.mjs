import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

export async function verifyEventIsolation({ request, users, sql }) {
  // The pinned Supabase stack grants anon table UPDATE; RLS denies the rows.
  assert.equal(sql("SELECT has_table_privilege('anon', 'public.events', 'UPDATE');").stdout.trim(), 't');
  console.log('ANON_EVENT_UPDATE_PRIVILEGE_VERIFIED');
  const places = [
    { city: 'Austin', state: 'TX', location: 'SRID=4326;POINT(-97.7431 30.2672)', start: '2030-01-15T19:00:00-06:00', utc: '2030-01-16T01:00:00.000Z' },
    { city: 'New York', state: 'NY', location: 'SRID=4326;POINT(-74.0060 40.7128)', start: '2030-01-15T19:00:00-05:00', utc: '2030-01-16T00:00:00.000Z' },
  ];
  const events = [];
  for (const [index, owner] of users.entries()) {
    const place = places[index];
    const [venue] = await request('/rest/v1/venues', owner.token, 'POST', {
      name: `${place.city} fixture venue`, address: 'Synthetic fixture address', city: place.city, state: place.state, location: place.location,
    }, 201);
    assert.equal(venue.city, place.city);
    for (const status of ['published', 'draft', 'cancelled', 'completed']) {
      const [event] = await request('/rest/v1/events', owner.token, 'POST', {
        title: `${place.city} ${status} fixture`, description: 'Synthetic event isolation fixture.',
        organizer_id: owner.profile.id, venue_id: venue.id, start_time: place.start, category: 'music', status,
      }, 201);
      assert.equal(new Date(event.start_time).toISOString(), place.utc);
      assert.equal(event.venue_id, venue.id);
      events.push({ ...event, owner });
    }
  }
  const eventPath = id => `/rest/v1/events?id=eq.${id}`;
  for (const event of events) {
    const other = users.find(user => user !== event.owner);
    for (const viewer of [null, ...users]) {
      const rows = await request(`${eventPath(event.id)}&select=id,status`, viewer?.token);
      assert.deepEqual(rows, event.status === 'published' || viewer === event.owner ? [{ id: event.id, status: event.status }] : []);
    }
    const [updated] = await request(eventPath(event.id), event.owner.token, 'PATCH', { title: 'Owner update control' });
    assert.equal(updated.title, 'Owner update control');
    assert.deepEqual(await request(eventPath(event.id), other.token, 'PATCH', { title: 'Foreign update' }), []);
    assert.deepEqual(await request(eventPath(event.id), null, 'PATCH', { title: 'Anonymous update' }), []);
    await request(eventPath(event.id), event.owner.token, 'PATCH', { organizer_id: other.profile.id }, 403);
    const [unchanged] = await request(eventPath(event.id), event.owner.token);
    assert.equal(unchanged.title, 'Owner update control');
    assert.equal(unchanged.organizer_id, event.owner.profile.id);
    assert.deepEqual(await request(eventPath(event.id), other.token, 'DELETE'), []);
    assert.equal((await request(eventPath(event.id), event.owner.token))[0].id, event.id);
  }
  const [alice, bob] = users;
  const forgedEvent = { title: 'Forged owner fixture', description: 'Synthetic forbidden event.', organizer_id: bob.profile.id, start_time: places[0].start, category: 'music' };
  await request('/rest/v1/events', alice.token, 'POST', forgedEvent, 403);
  await request('/rest/v1/events', null, 'POST', forgedEvent, 401);
  for (const owner of users) {
    const [temporary] = await request('/rest/v1/events', owner.token, 'POST', { ...forgedEvent, organizer_id: owner.profile.id, status: 'draft' }, 201);
    assert.deepEqual(await request(eventPath(temporary.id), null, 'DELETE'), []);
    assert.equal((await request(eventPath(temporary.id), owner.token, 'DELETE'))[0].id, temporary.id);
    assert.deepEqual(await request(eventPath(temporary.id), owner.token), []);
  }
  console.log('EVENT_ISOLATION_VERIFIED');
  const draft = events.find(event => event.owner === bob && event.status === 'draft');
  const published = events.find(event => event.owner === bob && event.status === 'published');
  const interactionPath = id => `/rest/v1/user_event_interactions?id=eq.${id}`;
  const bad = { id: randomUUID(), user_id: alice.profile.id, event_id: draft.id, interaction_type: 'save' };
  // The SAME expected-403 request oracle must fail on the original policies.
  await assert.rejects(request('/rest/v1/user_event_interactions', alice.token, 'POST', bad, 403), error => error instanceof assert.AssertionError && error.actual === 201 && error.expected === 403);
  assert.equal((await request(interactionPath(bad.id), alice.token))[0].event_id, draft.id);
  assert.equal((await request(interactionPath(bad.id), alice.token, 'DELETE'))[0].id, bad.id);
  const [before] = await request('/rest/v1/user_event_interactions', alice.token, 'POST', { ...bad, event_id: published.id }, 201);
  await assert.rejects(request(interactionPath(before.id), alice.token, 'PATCH', { event_id: draft.id }, 403), error => error instanceof assert.AssertionError && error.actual === 200 && error.expected === 403);
  assert.equal((await request(interactionPath(before.id), alice.token))[0].event_id, draft.id);
  await request(interactionPath(before.id), alice.token, 'DELETE');
  const visibleUnpublished = events.filter(event => event.owner === alice && event.status !== 'published');
  for (const event of visibleUnpublished) {
    assert.equal((await request(eventPath(event.id), alice.token))[0].id, event.id);
    const body = { ...bad, event_id: event.id, interaction_type: 'attend' };
    await assert.rejects(request('/rest/v1/user_event_interactions', alice.token, 'POST', body, 403), error => error instanceof assert.AssertionError && error.actual === 201 && error.expected === 403);
    assert.equal((await request(interactionPath(bad.id), alice.token))[0].event_id, event.id);
    assert.equal((await request(interactionPath(bad.id), alice.token, 'DELETE'))[0].id, bad.id);
  }
  console.log('INTERACTION_LEAK_CONTROL_REJECTED');

  sql(readFileSync('supabase/migrations/20260907000200_interaction_visibility.sql', 'utf8'));
  await request('/rest/v1/user_event_interactions', alice.token, 'POST', bad, 403);
  let [interaction] = await request('/rest/v1/user_event_interactions', alice.token, 'POST', { ...bad, event_id: published.id }, 201);
  await request(interactionPath(interaction.id), alice.token, 'PATCH', { event_id: draft.id }, 403);
  for (const event of visibleUnpublished) {
    assert.equal((await request(eventPath(event.id), alice.token))[0].id, event.id);
    await request('/rest/v1/user_event_interactions', alice.token, 'POST', { ...bad, id: randomUUID(), event_id: event.id, interaction_type: 'attend' }, 403);
    await request(interactionPath(interaction.id), alice.token, 'PATCH', { event_id: event.id }, 403);
  }
  const [updated] = await request(interactionPath(interaction.id), alice.token, 'PATCH', { metadata: { source: 'gate-update' } });
  assert.deepEqual(updated.metadata, { source: 'gate-update' });
  assert.equal(updated.event_id, published.id);
  assert.equal(updated.user_id, alice.profile.id);
  interaction = updated;
  await request('/rest/v1/user_event_interactions', alice.token, 'POST', { user_id: bob.profile.id, event_id: published.id, interaction_type: 'view' }, 403);
  await request(interactionPath(interaction.id), alice.token, 'PATCH', { user_id: bob.profile.id }, 403);
  assert.deepEqual(await request(interactionPath(interaction.id), bob.token), []);
  assert.deepEqual(await request(interactionPath(interaction.id), null), []);
  await request('/rest/v1/user_event_interactions', null, 'POST', { ...bad, id: randomUUID(), event_id: published.id }, 401);
  assert.deepEqual(await request(interactionPath(interaction.id), bob.token, 'DELETE'), []);
  assert.deepEqual(await request(interactionPath(interaction.id), alice.token), [interaction]);
  const alicePublished = events.find(event => event.owner === alice && event.status === 'published');
  const [bobInteraction] = await request('/rest/v1/user_event_interactions', bob.token, 'POST', { user_id: bob.profile.id, event_id: alicePublished.id, interaction_type: 'save' }, 201);
  assert.deepEqual(await request(interactionPath(bobInteraction.id), bob.token), [bobInteraction]);
  assert.deepEqual(await request(interactionPath(bobInteraction.id), alice.token), []);
  assert.equal((await request(interactionPath(bobInteraction.id), bob.token, 'DELETE'))[0].id, bobInteraction.id);
  await request(eventPath(published.id), bob.token, 'PATCH', { status: 'cancelled' });
  assert.deepEqual(await request(eventPath(published.id), alice.token), []);
  assert.deepEqual(await request(interactionPath(interaction.id), alice.token), [interaction]);
  await request(interactionPath(interaction.id), alice.token, 'PATCH', { metadata: { source: 'historical-update' } }, 403);
  assert.deepEqual(await request(interactionPath(interaction.id), alice.token), [interaction]);
  assert.equal((await request(interactionPath(interaction.id), alice.token, 'DELETE'))[0].id, interaction.id);
  assert.deepEqual(await request(interactionPath(interaction.id), alice.token), []);
  console.log('INTERACTION_ISOLATION_VERIFIED');
}
