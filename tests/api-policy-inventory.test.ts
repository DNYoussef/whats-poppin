import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { expect, it } from 'vitest';

const ts: typeof import('typescript') = createRequire(import.meta.url)('typescript');

function handlers(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return handlers(path);
    if (!/^route\.(tsx?|jsx?)$/.test(entry.name)) return [];
    const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
    return source.statements.flatMap(statement => {
      if (!ts.canHaveModifiers(statement) || !ts.getModifiers(statement)?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) return [];
      const names = ts.isFunctionDeclaration(statement) ? [statement.name?.text] : ts.isVariableStatement(statement) ? statement.declarationList.declarations.map(d => d.name.getText(source)) : [];
      return names.filter((name): name is string => !!name && /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(name)).map(name => `${name} /api/${relative('src/app/api', dirname(path)).replaceAll('\\', '/')}`);
    });
  });
}

it('lists a required policy for every exported API method and detects missing policies', () => {
  const document = readFileSync('docs/crucible-20260907/phases/P00/API-POLICY.md', 'utf8');
  const rows = [...document.matchAll(/^\| (GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) \| (\/api\/[^ ]+) \| (public-read|authenticated-user|organizer|worker) \| .+ \|$/gm)];
  const actual = handlers('src/app/api').sort();
  const listed = rows.map(row => `${row[1]} ${row[2]}`).sort();
  const verify = (inventory: string[]) => expect(inventory).toEqual(actual);
  expect(actual.length).toBeGreaterThan(0);
  verify(listed);
  expect(() => verify(listed.slice(1))).toThrow();
  expect(() => verify([...listed, 'POST /api/unreviewed-canary'])).toThrow();
});
