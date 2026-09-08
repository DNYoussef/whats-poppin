"""Preparation contract; no database, network, or local Docker."""
import hashlib
import json
import importlib.util
import tempfile
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
path = ROOT / "scripts/migrations/prepare.py"
spec = importlib.util.spec_from_file_location("prepare", path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

historical = sorted((ROOT / "src/database/migrations").glob("*.sql")) + sorted((ROOT / "supabase/migrations").glob("*.sql"))
def require_no_root_config(root):
    assert not (root / "supabase/config.toml").exists(), "Historical root must not become a CLI migration project"

require_no_root_config(ROOT)
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
        assert (first / "supabase/migrations" / dest).read_bytes() == (ROOT / source).read_bytes().replace(b"\r\n", b"\n")
    provenance = json.loads((first / "provenance.json").read_text())
    for row in provenance:
        assert hashlib.sha256((first / "supabase/migrations" / row['name']).read_bytes()).hexdigest() == row['sha256_bytes']
    saved_mapping = module.MIGRATIONS
    module.MIGRATIONS = saved_mapping[:-1]
    try:
        module.prepare(Path(temp) / "bad-mapping")
    except ValueError as error:
        assert "Unclassified migration sources" in str(error)
    else:
        raise AssertionError("Omitted migration accepted")
    finally:
        module.MIGRATIONS = saved_mapping
    # Corrupt an isolated copy, never source files in the checkout.
    fixture = Path(temp) / "fixture"
    for path in historical + [ROOT / "scripts/migrations/manifest.json", ROOT / "scripts/migrations/event_designs.sql"]:
        target = fixture / path.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, target)
    config_control = fixture / "supabase/config.toml"
    config_control.write_text('project_id = "unsafe-root"', encoding="ascii")
    try:
        require_no_root_config(fixture)
    except AssertionError as error:
        assert "Historical root" in str(error)
    else:
        raise AssertionError("Root migration project accepted")
    config_control.unlink()
    module.ROOT = fixture
    try:
        manifest_path = fixture / "scripts/migrations/manifest.json"
        original = manifest_path.read_bytes()
        rows = json.loads(original)
        rows[0]['sha256_lf'] = '0' * 64
        manifest_path.write_text(json.dumps(rows), encoding="ascii")
        try:
            module.prepare(Path(temp) / "bad-hash")
        except ValueError as error:
            assert "Source changed:" in str(error)
        else:
            raise AssertionError("Corrupted source hash accepted")
        manifest_path.write_bytes(original)
        extra = fixture / "supabase/migrations/20990101000001_unclassified.sql"
        extra.write_text("SELECT 1;", encoding="ascii")
        try:
            module.prepare(Path(temp) / "unclassified")
        except ValueError as error:
            assert "Unclassified migration sources" in str(error)
        else:
            raise AssertionError("Unclassified source accepted")
        extra.unlink()
        # LF and CRLF checkouts must produce identical output bytes.
        for _, source in module.MIGRATIONS:
            source_path = fixture / source
            source_path.write_bytes(source_path.read_bytes().replace(b"\r\n", b"\n").replace(b"\n", b"\r\n"))
        portable = Path(temp) / "portable"
        module.prepare(portable)
        assert files(portable) == files(first), "Checkout line endings changed the artifact"
    finally:
        module.ROOT = ROOT
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
