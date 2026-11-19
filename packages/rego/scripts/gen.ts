import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { regoPolicy } from '@ui-monorepo/rego';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'generated');

interface PolicyFile {
  file: string;
  source: string;
}

/** Define the policies to generate here. */
const policies: PolicyFile[] = [
  {
    file: 'authz.rego',
    source: regoPolicy('authz')
      .default('allow', false)
      .allowIf('input.user.role == "admin"')
      .allowIf(['input.method == "GET"', 'input.path[0] == "public"'])
      .denyIf('input.method == "DELETE"', 'deletes are not permitted')
      .build(),
  },
  {
    file: 'rbac.rego',
    source: regoPolicy('rbac')
      .default('allow', false)
      .rule('is_admin', 'input.user.role == "admin"')
      .allowIf('is_admin')
      .build(),
  },
];

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const { file, source } of policies) {
  const path = join(outDir, file);
  writeFileSync(path, source);
  console.log(`wrote ${path}`);
}

console.log(`\nGenerated ${policies.length} policy file(s) in ${outDir}`);
