"""Prepare canonical migration inputs; never connect to or adopt a database."""
import sys
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
# Existing timestamped privacy migrations retain their identities. Legacy numbered
# scripts were not a CLI history: these names define only the new canonical path.
MIGRATIONS = (
    ("20251001000001_initial_schema.sql", "src/database/migrations/001_initial_schema.sql"),
    ("20251001000002_enable_rls.sql", "src/database/migrations/002_enable_rls.sql"),
    ("20251002000000_event_designs.sql", "scripts/migrations/event_designs.sql"),
    ("20260907000100_private_profile_reads.sql", "supabase/migrations/20260907000100_private_profile_reads.sql"),
    ("20260907000200_interaction_visibility.sql", "supabase/migrations/20260907000200_interaction_visibility.sql"),
)


def prepare(destination):
    destination = Path(destination)
    # Validate/read inputs before creating output. Existing paths are never reused.
    inputs = [(name, (ROOT / source).read_bytes()) for name, source in MIGRATIONS]
    provenance = json.loads((ROOT / "scripts/migrations/manifest.json").read_text())
    assert [(row['name'], row['source']) for row in provenance] == list(MIGRATIONS), "Manifest mapping drift"
    for (name, data), row in zip(inputs, provenance):
        assert hashlib.sha256(data.replace(b"\r\n", b"\n")).hexdigest() == row['sha256_lf'], f"Source changed: {name}"
    destination.mkdir()
    folder = destination / "supabase/migrations"
    folder.mkdir(parents=True)
    for name, data in inputs:
        (folder / name).write_bytes(data)
    (destination / "provenance.json").write_text(json.dumps([{**row, 'sha256_bytes': hashlib.sha256(data).hexdigest()} for row, (_, data) in zip(provenance, inputs)], indent=2) + "\n", encoding="ascii")
    (destination / "supabase/config.toml").write_text('project_id = "poppin-application-migrations"\n', encoding="ascii")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/migrations/prepare.py NEW_OUTPUT_DIRECTORY")
    prepare(sys.argv[1])
    print("APPLICATION_MIGRATIONS_PREPARED")
