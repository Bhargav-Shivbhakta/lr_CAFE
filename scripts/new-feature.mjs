#!/usr/bin/env node
/**
 * Feature generator: `npm run new-feature <id> [-- --hub "At the café" | --hidden]`
 * Creates src/features/<id>/ with a starter screen and its description, registers it,
 * and adds its on/off flag. The new feature appears in the Account hub straight away.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [id, ...rest] = process.argv.slice(2);
const SECTIONS = ['At the café', 'Ordering', 'Your account', 'Café team', 'Help'];
if (!id || !/^[a-z][a-z0-9-]{1,30}$/.test(id)) { console.error('Usage: npm run new-feature <id>   (lowercase letters, digits and hyphens, e.g. gift-cards)'); process.exit(1); }
const root = process.cwd(), dir = join(root, 'src/features', id);
if (existsSync(dir)) { console.error(`src/features/${id} already exists.`); process.exit(1); }
const hidden = rest.includes('--hidden');
const hubIdx = rest.indexOf('--hub');
const section = hubIdx >= 0 ? rest[hubIdx + 1] : 'At the café';
if (!SECTIONS.includes(section)) { console.error(`--hub must be one of: ${SECTIONS.join(', ')}`); process.exit(1); }

const title = id.split('-').map((w, i) => (i ? w : w[0].toUpperCase() + w.slice(1))).join(' ');
const pascal = id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');
const camel = pascal[0].toLowerCase() + pascal.slice(1);

mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, `${pascal}Screen.tsx`), `import { Screen } from '@/core/ui';

/** ${title}: build the screen here using only the UI kit (@/core/ui) and design tokens. */
export function ${pascal}Screen() {
  return (
    <Screen title="${title}" back>
      <p className="muted">Coming together. Describe what this feature does in one sentence.</p>
    </Screen>
  );
}
`);
writeFileSync(join(dir, 'index.ts'), `import { Sparkles } from 'lucide-react';
import type { FeatureModule } from '@/core/registry/types';
import { ${pascal}Screen } from './${pascal}Screen';

export const ${camel}Feature: FeatureModule = {
  id: '${id}', title: '${title}', subtitle: 'One line about what it does', icon: Sparkles,
  status: 'beta', // 'soon' shows a waitlist screen; 'live' when it's ready
  nav: { placement: '${hidden ? 'hidden' : 'hub'}', order: 9${hidden ? '' : `, hubSection: '${section}'`} },
  routes: [{ path: '', element: ${pascal}Screen }],
};
`);

const idx = join(root, 'src/features/index.ts');
let s = readFileSync(idx, 'utf8');
s = s.replace("import { soonFeatures } from './soon';", `import { ${camel}Feature } from './${id}';\nimport { soonFeatures } from './soon';`);
s = s.replace('  ...soonFeatures,', `  ${camel}Feature,\n  ...soonFeatures,`);
writeFileSync(idx, s);

const flags = join(root, 'src/core/config/flags.ts');
let f = readFileSync(flags, 'utf8');
f = f.replace('export const featureFlags: Record<string, boolean> = {', `export const featureFlags: Record<string, boolean> = {\n  '${id}': true,`);
writeFileSync(flags, f);

console.log(`\nCreated src/features/${id}/ and registered it${hidden ? '' : ` in the Account hub under "${section}"`}.`);
console.log(`Open #/${id} in the app. If a placeholder with this id exists in features/soon, delete it there.\n`);
