"""Execute the prepared application migrations only in disposable GitHub Supabase."""
import concurrent.futures
import importlib.util
import os
import json
import hashlib
import subprocess
import sys
import tempfile
import time
import uuid
from pathlib import Path

assert sys.platform == "linux" and os.environ.get("GITHUB_ACTIONS") == "true", "HOSTED_ONLY: no local Docker"
ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("prepare", ROOT / "scripts/migrations/prepare.py")
prepare = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prepare)
MODE = sys.argv[1]
assert MODE in ("fresh", "upgrade")

def command(args, input=None, good=True):
    result = subprocess.run(args, input=input, text=True, capture_output=True, timeout=180)
    if good:
        assert result.returncode == 0, result.stderr + result.stdout
    return result

def sql(text, good=True):
    return command(["docker", "exec", "-i", "supabase_db_whats-poppin-ci", "psql", "-U", "postgres", "-d", "postgres", "-XAt", "-v", "ON_ERROR_STOP=1"], text, good)

assert command(["supabase", "--version"]).stdout.strip() == "2.117.0"
assert sql("SELECT to_regclass('public.events') IS NULL;").stdout.strip() == "t"
A, B, EVENT = [str(uuid.uuid4()) for _ in range(3)]

def seed():
    sql(f"INSERT INTO auth.users(id) VALUES ('{A}'), ('{B}'); INSERT INTO public.profiles(id,username) VALUES ('{A}','alice_canary'),('{B}','bob_canary'); INSERT INTO public.events(id,organizer_id,title,description,start_time,category,price) VALUES ('{EVENT}','{A}','Migration canary','Preserve this event exactly','2030-01-01','music',89.99);")

def owner(query, identity=A, role="authenticated", good=True):
    return sql(f"BEGIN; SET LOCAL ROLE {role}; SELECT set_config('request.jwt.claim.sub','{identity}',true); {query}; COMMIT;", good)

with tempfile.TemporaryDirectory(prefix="poppin-migrations-") as directory:
    project = Path(directory) / "project"
    prepare.prepare(project)
    folder = project / "supabase/migrations"
    provenance = json.loads((project / "provenance.json").read_text())
    def verify_provenance():
        for row in provenance:
            assert hashlib.sha256((folder / row['name']).read_bytes()).hexdigest() == row['sha256_bytes']
    verify_provenance()
    entries = sorted(folder.glob("*.sql"))
    versions = [p.name.split("_",1)[0] for p in entries]
    def push(good=True, dry=False):
        return command(["supabase", "db", "push", "--db-url", "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable", "--workdir", str(project), "--yes"] + (["--dry-run"] if dry else []), good=good)
    if MODE == "upgrade":
        held = [(p, p.read_bytes()) for p in entries[3:]]
        for path, data in held:
            path.unlink()
        push()
        seed()
        owner(f"INSERT INTO public.event_designs(event_id,theme,description,spec) VALUES ('{EVENT}','before','Preserved design','{{}}')")
        before = sql(f"SELECT row_to_json(d) FROM public.event_designs d WHERE event_id='{EVENT}';").stdout
        for path, data in held:
            path.write_bytes(data)
    verify_provenance()
    push(dry=True)
    push()
    if MODE == "fresh":
        seed()
    else:
        assert sql(f"SELECT row_to_json(d) FROM public.event_designs d WHERE event_id='{EVENT}';").stdout == before
    objects = sql("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('profiles','venues','events','user_event_interactions','event_recommendations','event_designs') ORDER BY tablename;").stdout.splitlines()
    assert objects == ['event_designs','event_recommendations','events','profiles','user_event_interactions','venues']
    assert sql("SELECT count(*) FROM pg_policies WHERE schemaname='public' AND permissive='RESTRICTIVE' AND policyname IN ('Private profiles are owner readable','Interactions require published events');").stdout.strip() == "2"
    for role in ("anon", "authenticated", "service_role"):
        for privilege in ("SELECT", "INSERT", "UPDATE", "DELETE"):
            expected = "t" if role != "anon" or privilege == "SELECT" else "f"
            assert sql(f"SELECT has_table_privilege('{role}','public.event_designs','{privilege}');").stdout.strip() == expected
    history = sql("SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;").stdout.splitlines()
    assert history == versions, (history, versions)
    push()
    assert sql("SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;").stdout.splitlines() == history
    assert sql(f"SELECT price::text FROM public.events WHERE id='{EVENT}';").stdout.strip() == "89.99"
    # Invalid historical SQL is a real failure control, executed transactionally.
    broken = sql("BEGIN; " + (ROOT / "supabase/migrations/20251002_event_designs.sql").read_text() + " COMMIT;", False)
    assert broken.returncode != 0 and 'syntax error at or near "WHERE"' in broken.stderr
    for _ in range(2):
        owner(f"INSERT INTO public.event_designs(event_id,theme,description,spec) VALUES ('{EVENT}','inactive','Inactive allowed','{{}}')")
    # Observe real database overlap: the second insert must wait on the first
    # transaction's unique-index lock while the first remains open.
    winner, loser = "winner_" + uuid.uuid4().hex, "loser_" + uuid.uuid4().hex
    def activate(name, delay):
        return owner(f"SET LOCAL application_name='{name}'; INSERT INTO public.event_designs(event_id,theme,description,spec,is_active) VALUES ('{EVENT}','active','Concurrent active','{{}}',true); SELECT pg_sleep({delay})", good=False)
    def await_activity(name, predicate):
        for _ in range(60):
            if sql(f"SELECT count(*) FROM pg_stat_activity WHERE application_name='{name}' AND ({predicate});").stdout.strip() == "1":
                return
            time.sleep(0.1)
        raise AssertionError("Concurrent database activity not observed: " + name)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        first = pool.submit(activate, winner, 15)
        await_activity(winner, "wait_event = 'PgSleep'")
        second = pool.submit(activate, loser, 0)
        await_activity(loser, "wait_event_type = 'Lock'")
        results = [first.result(), second.result()]
    print("ACTIVE_DESIGN_LOCK_OVERLAP_VERIFIED")
    assert sorted(r.returncode == 0 for r in results) == [False, True]
    assert any('duplicate key' in r.stderr for r in results)
    assert sql(f"SELECT count(*) FROM public.event_designs WHERE event_id='{EVENT}' AND is_active;").stdout.strip() == "1"
    for identity, role in [(B,"authenticated"),("","anon")]:
        visible = owner(f"SELECT count(*) FROM public.event_designs WHERE event_id='{EVENT}'", identity, role).stdout.splitlines()
        assert "1" in visible, visible
        denied = owner(f"INSERT INTO public.event_designs(event_id,theme,description,spec) VALUES ('{EVENT}','forged','Unauthorized','{{}}')", identity, role, False)
        assert denied.returncode != 0 and ("row-level security" in denied.stderr or "permission denied" in denied.stderr)
        changed = owner(f"UPDATE public.event_designs SET theme='forged' WHERE event_id='{EVENT}' RETURNING id", identity, role, False)
        assert changed.returncode != 0 or 'UPDATE 0' in changed.stdout
    assert sql("SELECT count(*) FROM public.event_designs WHERE theme='forged';").stdout.strip() == "0"
    owner(f"UPDATE public.events SET status='draft' WHERE id='{EVENT}'")
    for identity, role in [(B,"authenticated"),("","anon")]:
        assert "0" in owner("SELECT count(*) FROM public.event_designs", identity, role).stdout.splitlines()
    # The prepared path must include both restrictive P00 policies, not just tables.
    for identity, role in [(B,"authenticated"),("","anon")]:
        assert "0" in owner(f"SELECT count(*) FROM public.profiles WHERE id='{A}'", identity, role).stdout.splitlines()
    owner(f"UPDATE public.events SET status='published' WHERE id='{EVENT}'")
    owner(f"INSERT INTO public.user_event_interactions(user_id,event_id,interaction_type) VALUES ('{B}','{EVENT}','save')", B)
    owner(f"UPDATE public.events SET status='cancelled' WHERE id='{EVENT}'")
    assert "1" in owner(f"SELECT count(*) FROM public.user_event_interactions WHERE user_id='{B}'", B).stdout.splitlines()
    denied = owner(f"INSERT INTO public.user_event_interactions(user_id,event_id,interaction_type) VALUES ('{B}','{EVENT}','share')", B, good=False)
    assert denied.returncode != 0 and "row-level security" in denied.stderr
    # Failed migration must roll back its DDL and stay out of CLI history.
    failure = folder / "20990101000000_failure_control.sql"
    failure.write_text("CREATE TABLE public.failure_canary(id integer); SELECT 1/0;", encoding="ascii")
    result = push(good=False)
    assert result.returncode != 0 and "division by zero" in result.stderr + result.stdout
    assert sql("SELECT to_regclass('public.failure_canary') IS NULL;").stdout.strip() == "t"
    assert sql("SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;").stdout.splitlines() == history
    failure.write_text("CREATE TABLE public.failure_canary(id integer); INSERT INTO public.failure_canary VALUES (42);", encoding="ascii")
    push()
    assert sql("SELECT id FROM public.failure_canary;").stdout.strip() == "42"
    assert sql("SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;").stdout.splitlines() == history + ['20990101000000']
    verify_provenance()
print("APPLICATION_MIGRATIONS_VERIFIED", MODE)
