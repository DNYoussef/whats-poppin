"""Use the installed understanding framework; attach reviewed locations via its join."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

repo = Path.cwd()
scripts = Path('C:/Users/17175/.claude/skills/codebase-understand/scripts')
exe = 'C:/Users/17175/.claude/tools/codebase-memory-mcp/codebase-memory-mcp.exe'
mapped = subprocess.run([sys.executable, str(scripts / 'understand.py'), 'map', str(repo)],
                        capture_output=True, text=True, encoding='utf-8', check=True)
overview = json.loads(mapped.stdout)
spec = importlib.util.spec_from_file_location('join_lens', scripts / 'join_lens.py')
join_lens = importlib.util.module_from_spec(spec)
spec.loader.exec_module(join_lens)
nodes = join_lens.load_nodes(exe, overview['project'], str(repo))
anchors = [
    ('C01', 'src/lib/database.ts', "throw new Error('Supabase client not initialized')"),
    ('C02', 'src/app/create-event/CreateEventPageClient.tsx', "organizer_id: 'current-user-id'"),
    ('C03', 'src/app/events/[id]/page.tsx', 'setIsSaved(!isSaved)'),
    ('C04', 'src/lib/ai/database.ts', ".from('user_preferences')"),
    ('C05', 'src/lib/ai/preferences.ts', "const validTypes = ['viewed'"),
    ('C06', 'src/lib/ai/database.ts', "onConflict: 'user_id,event_id'"),
    ('C07', 'src/lib/ai/smart-search.ts', ".select('*')"),
    ('C08', 'src/app/events/EventsPageClient.tsx', 'if (searchQuery)'),
    ('C09', 'src/app/api/cron/update-embeddings/route.ts', 'if (cronSecret &&'),
    ('C10', 'src/app/api/ai/search-conversation/route.ts', 'const { action, messages }'),
    ('C11', 'src/app/api/events/[id]/design/route.ts', '// Deactivate existing active designs'),
]
rows = []
for claim, file, needle in anchors:
    lines = (repo / file).read_text(encoding='utf-8').splitlines()
    line = next(i for i, text in enumerate(lines, 1) if needle in text)
    rows.append({'claim': claim, 'file': file.lower(), 'line': line, 'type': 'manual-source-observation'})
joined = join_lens.join(rows, nodes)
assert joined['joined'] == len(rows), joined['orphans']
assert any(key.endswith('.getSupabase') for key in joined['by_node'])
control = join_lens.join([{'file': 'positive-control.ts', 'line': 4}],
                        [{'file': 'positive-control.ts', 'start': 2, 'end': 8, 'qn': 'canary.fn'}])
assert 'canary.fn' in control['by_node']
assert join_lens.join([{'file': 'missing-canary.ts', 'line': 4}], nodes)['joined'] == 0
result = {'source_commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(),
          'architecture': overview['architecture'], 'joined_observations': joined,
          'limits': ['Manual source observations are attached to graph nodes, not automatically proven documentation claims.',
                     'connascence and rlm-docsync lenses are Python-only; TypeScript semantics are unsupported.',
                     'No runtime tracing is available from the substrate.']}
(repo / 'docs/crucible-20260907/graph-evidence.json').write_text(
    json.dumps(result, indent=2, ensure_ascii=True) + '\n', encoding='ascii')
print('GRAPH_OBSERVATIONS_CAPTURED')
