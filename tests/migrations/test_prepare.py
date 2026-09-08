"""Preparation contract; no database, network, or local Docker."""
import hashlib
import json
import importlib.util
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
path = ROOT / "scripts/migrations/prepare.py"
spec = importlib.util.spec_from_file_location("prepare", path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

historical = sorted((ROOT / "src/database/migrations").glob("*.sql")) + sorted((ROOT / "supabase/migrations").glob("*.sql"))
assert not (ROOT / "supabase/config.toml").exists(), "Historical root must not become a CLI migration project"
before = {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in historical}
with tempfile.TemporaryDirectory(prefix="poppin-prepare-test-") as temp:
    first, second = Path(temp) / "first", Path(temp) / "second"
    module.prepare(first)
    module.prepare(second)
    files = lambda root: {str(p.relative_to(root)): p.read_bytes() for p in root.rglob("*") if p.is_file()}
    assert files(first) == files(second), "Preparation is not deterministic"
    migrations = sorted((first / "supabase/migrations").glob("*.sql"))
    assert [p.name for p in migrations] == [name for name, source in module.MIGRATIONS]
    for dest, source in module.MIGRATIONS:
        assert (first / "supabase/migrations" / dest).read_bytes() == (ROOT / source).read_bytes()
    provenance = json.loads((first / "provenance.json").read_text())
    for row in provenance:
        assert hashlib.sha256((first / "supabase/migrations" / row['name']).read_bytes()).hexdigest() == row['sha256_bytes']
    saved_mapping = module.MIGRATIONS
    module.MIGRATIONS = saved_mapping[:-1]
    try:
        module.prepare(Path(temp) / "bad-mapping")
    except AssertionError as error:
        assert "Manifest mapping drift" in str(error)
    else:
        raise AssertionError("Omitted migration accepted")
    finally:
        module.MIGRATIONS = saved_mapping
    preserved = files(first)
    try:
        module.prepare(first)
    except FileExistsError:
        pass
    else:
        raise AssertionError("Existing output accepted")
    assert files(first) == preserved, "Collision changed existing output"
    sentinel = Path(temp) / "sentinel"
    sentinel.write_text("keep-me", encoding="ascii")
    try:
        module.prepare(sentinel)
    except FileExistsError:
        pass
    else:
        raise AssertionError("Existing file accepted")
    assert sentinel.read_text() == "keep-me"
assert before == {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in historical}
print("MIGRATION_PREPARATION_VERIFIED")
