"""Characterize overlapping CLI pushes in disposable hosted Postgres only."""
import concurrent.futures
import os
import shutil
import subprocess
import sys
import time
import uuid

if not __debug__:
    raise SystemExit('Refusing to run with assertions disabled')

def require_hosted(platform, environment):
    if platform != "linux" or environment.get("GITHUB_ACTIONS") != "true":
        raise RuntimeError("HOSTED_ONLY: no local Docker")


def verify_outcome(results, history, expected_history, rows, token):
    assert history == expected_history, (history, expected_history)
    assert rows == [token], "Canary row mismatch"
    assert len(results) == 2
    failures = [result for result in results if result.returncode != 0]
    if not failures:
        return "both_succeeded"
    assert len(failures) == 1, "Neither migration caller succeeded"
    error = failures[0].stdout + failures[0].stderr
    assert "duplicate key" in error and "migration_concurrency_canary_pkey" in error, error
    return "duplicate_retry_required"


def activity(sql, name, future, excluded_pid=0, allow_completed=False):
    deadline = time.monotonic() + 30
    while (remaining := deadline - time.monotonic()) > 0:
        try:
            observed = sql(f"SELECT pid || ':' || wait_event_type FROM pg_stat_activity WHERE application_name='{name}' AND pid <> {excluded_pid} AND (wait_event='PgSleep' OR cardinality(pg_blocking_pids(pid))>0);", timeout=min(5, remaining)).stdout.strip()
        except subprocess.TimeoutExpired:
            continue
        if observed:
            assert len(observed.splitlines()) == 1, "Expected one matching backend: " + observed
            pid, wait = observed.split(':')
            return int(pid), wait
        if future.done():
            if allow_completed:
                return 0, "completed_before_release"
            raise AssertionError("Caller exited before overlap: " + name)
        time.sleep(0.1)
    raise AssertionError("Database overlap observation timed out: " + name)


def exercise(sql, push, folder, previous_history, mode):
    require_hosted(sys.platform, os.environ)
    token = uuid.uuid4().hex
    holder, migration = ["poppin_" + uuid.uuid4().hex for _ in range(2)]
    version = "20990101000001"
    assert previous_history[-1] < version
    sql("CREATE TABLE public.migration_concurrency_canary(value text PRIMARY KEY);")
    (folder / (version + "_concurrency.sql")).write_text(
        f"SET LOCAL application_name='{migration}'; INSERT INTO public.migration_concurrency_canary VALUES ('{token}');", encoding="ascii")
    # Each CLI has private scratch/config files, with identical migration bytes.
    other = folder.parents[1].with_name("concurrent-copy")
    shutil.copytree(folder.parents[1], other)
    expected_history = previous_history + [version]

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        barrier = pool.submit(sql, f"BEGIN; SET LOCAL application_name='{holder}'; LOCK TABLE public.migration_concurrency_canary IN ACCESS EXCLUSIVE MODE; SELECT pg_sleep(120); COMMIT;", False)
        try:
            assert activity(sql, holder, barrier)[1] == "Timeout"
            a = pool.submit(push, good=False)
            first_pid, first_wait = activity(sql, migration, a)
            assert first_wait == "Lock"
            b = pool.submit(push, good=False, project_dir=other)
            second_pid, observed = activity(sql, migration, b, excluded_pid=first_pid, allow_completed=True)
            assert observed in ("Lock", "completed_before_release"), observed
            assert sql(f"SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE application_name='{holder}';").stdout.strip() == "t"
            released = barrier.result()
            assert released.returncode != 0 and "canceling statement due to user request" in released.stderr
            results = [a.result(), b.result()]
        finally:
            # These unique names are generated here and used only in this CI DB.
            sql(f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE application_name IN ('{holder}','{migration}');", False)

    def history():
        return sql("SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;").stdout.splitlines()

    def rows():
        return sql("SELECT value FROM public.migration_concurrency_canary ORDER BY value;").stdout.splitlines()

    branch = verify_outcome(results, history(), expected_history, rows(), token)
    # Corrupt the actual fixture row, prove the oracle rejects it, then restore.
    sql("UPDATE public.migration_concurrency_canary SET value='wrong';")
    try:
        verify_outcome(results, history(), expected_history, rows(), token)
    except AssertionError as error:
        assert str(error) == "Canary row mismatch", error
    else:
        raise AssertionError("Corrupted database row accepted")
    sql(f"UPDATE public.migration_concurrency_canary SET value='{token}';")
    push()
    push(project_dir=other)
    assert verify_outcome(results, history(), expected_history, rows(), token) == branch
    print("MIGRATION_CONCURRENCY_OUTCOME", mode, branch, observed)
    print("MIGRATION_CONCURRENCY_CHARACTERIZED", mode)
