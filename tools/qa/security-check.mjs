// Security checks on everything in the repo, every day:
//   - secrets: API keys, tokens, private keys, passwords written into files
//   - links and loads over plain http
//   - the app only talks to sites we expect (no unknown scripts or data calls)
//   - risky code in the app's own engines (eval, new Function, document.write)
//   - .gitignore keeps .env and other private files out
// Known-vulnerable packages are checked by `npm audit` (in the daily workflow) and GitHub's Dependabot.
// Run: node tools/qa/security-check.mjs
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const files = execSync('git ls-files', { cwd: ROOT }).toString().split('\n').filter(Boolean)
  .concat(fs.existsSync(path.join(ROOT, 'mockup/index.html')) ? ['mockup/index.html'] : [])
  .filter((f, i, a) => a.indexOf(f) === i && !/\.(webp|png|jpe?g|gif|ico|woff2?|ttf|otf|zip|pdf)$/i.test(f) && !f.startsWith('node_modules/'));
const problems = [], notes = [];

const SECRETS = [
  ['AWS access key', /AKIA[0-9A-Z]{16}/], ['Anthropic key', /sk-ant-[A-Za-z0-9_-]{20,}/], ['OpenAI-style key', /\bsk-[A-Za-z0-9]{32,}/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{30,}/], ['Google API key', /AIza[0-9A-Za-z_-]{35}/], ['Stripe live key', /\b[rs]k_live_[0-9A-Za-z]{20,}/],
  ['Slack token', /xox[abpr]-[0-9A-Za-z-]{10,}/], ['private key', /-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/],
  ['password in a file', /\b(password|passwd|secret)\s*[:=]\s*['"][^'"\s]{6,}['"]/i],
];
const ALLOWED_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'www.w3.org', 'api.anthropic.com'];
for (const f of files) {
  let s; try { s = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch { continue; }
  if (s.length > 3e6) continue;
  for (const [name, re] of SECRETS) { const m = s.match(re); if (m && !/example|placeholder|xxxx/i.test(m[0])) problems.push(`${name} in ${f}: ${m[0].slice(0, 12)}…`); }
  for (const m of s.matchAll(/http:\/\/(?!localhost|127\.0\.0\.1|www\.w3\.org)[^\s'"`)<>]+/g)) problems.push(`plain http link in ${f}: ${m[0].slice(0, 80)}`);
  if (/^(engine|design-system)\//.test(f) && /\.(m?js|ts)$/.test(f) && !/test/.test(f)) {
    if (/\beval\s*\(|new Function\s*\(|document\.write\s*\(/.test(s)) problems.push(`risky code (eval / new Function / document.write) in ${f}`);
  }
  if (f === 'mockup/index.html') {
    for (const m of s.matchAll(/<script[^>]+src=["']https?:\/\/([^/"']+)/g)) if (!ALLOWED_HOSTS.includes(m[1])) problems.push(`mockup loads a script from ${m[1]}`);
    for (const m of s.matchAll(/fetch\(\s*['"`]https?:\/\/([^/'"`]+)/g)) if (!ALLOWED_HOSTS.includes(m[1])) problems.push(`mockup calls ${m[1]}`);
    const n = (s.match(/\.innerHTML\s*=/g) || []).length;
    notes.push(`mockup sets innerHTML in ${n} places: fine for a demo with our own data; the real app (React Native) must not build screens from strings`);
  }
}
const gi = fs.existsSync(path.join(ROOT, '.gitignore')) ? fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8') : '';
for (const must of ['.env', 'node_modules']) if (!gi.split('\n').some((l) => l.trim().replace(/\/$/, '') === must || l.trim() === must + '*')) problems.push(`.gitignore should list ${must}`);
for (const f of files) if (/(^|\/)\.env(\.|$)|credentials\.json$|\.pem$|id_rsa/.test(f)) problems.push(`private file committed: ${f}`);

fs.mkdirSync(path.join(ROOT, 'tools/qa/out'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'tools/qa/out/security.json'), JSON.stringify({ files: files.length, problems, notes }, null, 1));
console.log(`Security check: ${files.length} files, ${problems.length} problem(s)`);
problems.forEach((x) => console.log('  ✗ ' + x)); notes.forEach((x) => console.log('  ! ' + x));
process.exit(problems.length ? 1 : 0);
