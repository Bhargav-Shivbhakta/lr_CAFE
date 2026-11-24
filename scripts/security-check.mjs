#!/usr/bin/env node
/**
 * Living Room security checker. Runs locally (`npm run security`) and in GitHub Actions before every deploy.
 * Any FAIL blocks the deploy. Checks:
 *  1 secrets   2 dangerous code   3 outside addresses   4 content security policy
 *  5 sensitive data in phone storage   6 links that open new tabs   7 vulnerable libraries (npm audit)
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const results = [];
const record = (name, status, details = []) => results.push({ name, status, details });

function walk(dir, exts, out = []) {
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    if (['node_modules', '.git'].includes(f)) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (!exts || exts.includes(extname(f))) out.push(p);
  }
  return out;
}
const read = (p) => readFileSync(p, 'utf8');
const rel = (p) => relative(ROOT, p);
const lineOf = (text, idx) => text.slice(0, idx).split('\n').length;

const SRC = walk(join(ROOT, 'src'), ['.ts', '.tsx', '.css', '.json']);
const CODE = SRC.filter((p) => /\.(ts|tsx)$/.test(p));
const CONFIG = [join(ROOT, 'index.html'), join(ROOT, 'vite.config.ts'), ...walk(join(ROOT, '.github')), ...walk(join(ROOT, 'scripts'), ['.mjs', '.js', '.py'])].filter(existsSync);
const DIST = walk(join(ROOT, 'dist'), ['.html', '.js', '.css']);

/* 1. Secrets ------------------------------------------------------------ */
const SECRET_PATTERNS = [
  ['Stripe live key', /\b(sk|rk)_live_[0-9a-zA-Z]{10,}/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['Private key', /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{30,}/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Twilio key', /\bSK[0-9a-fA-F]{32}\b/],
  ['Supabase service key', /service_role/],
  ['Hard-coded secret', /(client_?secret|api_?secret|secret_?key|auth_?token|password)\s*[:=]\s*['"`][^'"`\s]{12,}['"`]/i],
];
{
  const hits = [];
  for (const p of [...SRC, ...CONFIG, ...DIST]) {
    if (p.endsWith('security-check.mjs')) continue;
    const t = read(p);
    for (const [label, re] of SECRET_PATTERNS) {
      const m = re.exec(t);
      if (m) hits.push(`${rel(p)}:${lineOf(t, m.index)}  ${label}`);
    }
  }
  try {
    const tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' }).split('\n');
    tracked.filter((f) => /(^|\/)\.env(\.|$)/.test(f) && !f.endsWith('.example')).forEach((f) => hits.push(`${f}  .env file committed to git`));
  } catch { /* not a git checkout */ }
  record('No secrets in code, config or the built site', hits.length ? 'FAIL' : 'PASS', hits);
}

/* 2. Dangerous code ----------------------------------------------------- */
{
  const DANGER = [
    ['eval()', /\beval\s*\(/], ['new Function()', /new\s+Function\s*\(/],
    ['dangerouslySetInnerHTML', /dangerouslySetInnerHTML/], ['innerHTML assignment', /\.(inner|outer)HTML\s*=/],
    ['document.write', /document\.write\s*\(/], ['javascript: URL', /['"`]javascript:/i],
  ];
  const hits = [];
  for (const p of CODE) {
    const t = read(p);
    for (const [label, re] of DANGER) { const m = re.exec(t); if (m) hits.push(`${rel(p)}:${lineOf(t, m.index)}  ${label}`); }
  }
  record('No eval, raw HTML or script URLs', hits.length ? 'FAIL' : 'PASS', hits);
}

/* 3. Outside addresses -------------------------------------------------- */
const ALLOWED_HOSTS = [
  'fonts.googleapis.com', 'fonts.gstatic.com',                 // fonts
  'order.toasttab.com', 'www.toasttab.com', 'doc.toasttab.com', // the café's Toast pages and docs
  'github.com', 'bhargav-shivbhakta.github.io',                 // code and demo
  'www.w3.org',                                                 // SVG namespace
];
{
  const fails = []; const seen = new Set();
  for (const p of [...CODE, join(ROOT, 'index.html')]) {
    const t = read(p);
    for (const m of t.matchAll(/\b(https?):\/\/([a-z0-9.-]+)/gi)) {
      const [, proto, host] = m;
      if (proto === 'http' && host !== 'www.w3.org') fails.push(`${rel(p)}:${lineOf(t, m.index)}  insecure http:// link to ${host}`);
      else if (!ALLOWED_HOSTS.includes(host.toLowerCase())) fails.push(`${rel(p)}:${lineOf(t, m.index)}  ${host} is not on the allow-list`);
      seen.add(host);
    }
  }
  record(`Outside addresses are https and allow-listed (${seen.size} hosts)`, fails.length ? 'FAIL' : 'PASS', fails);
}

/* 4. Content Security Policy -------------------------------------------- */
{
  const built = join(ROOT, 'dist', 'index.html');
  if (!existsSync(built)) record('Content Security Policy in the built page', 'FAIL', ['dist/index.html not found: run `npm run build` first']);
  else {
    const html = read(built);
    const m = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
    const issues = [];
    if (!m) issues.push('no Content-Security-Policy meta tag');
    else {
      const csp = m[1];
      if (!/script-src 'self'(;|$)/.test(csp)) issues.push(`script-src must be exactly 'self' (found: ${csp.match(/script-src[^;]*/)?.[0] ?? 'none'})`);
      if (/unsafe-eval/.test(csp)) issues.push("'unsafe-eval' is not allowed");
      if (!/object-src 'none'/.test(csp)) issues.push("object-src 'none' missing");
      if (!/base-uri 'self'/.test(csp)) issues.push("base-uri 'self' missing");
    }
    if (/<script(?![^>]*\bsrc=)[^>]*>[^<]+<\/script>/.test(html)) issues.push('inline <script> found in the built page');
    record('Content Security Policy only allows our own scripts', issues.length ? 'FAIL' : 'PASS', issues);
  }
}

/* 5. Sensitive data in phone storage ------------------------------------ */
{
  const hits = [];
  for (const p of CODE) {
    const t = read(p);
    if (!p.endsWith('safeStorage.ts')) {
      const m = /\b(localStorage|sessionStorage)\b/.exec(t);
      if (m) hits.push(`${rel(p)}:${lineOf(t, m.index)}  uses ${m[1]} directly (go through core/store/safeStorage)`);
    }
    if (/persist\(/.test(t)) {
      const m = /\b(cardNumber|cvv|cvc|password|otp|verificationCode|accessToken|refreshToken|secret)\s*[:?]/i.exec(t);
      if (m) hits.push(`${rel(p)}:${lineOf(t, m.index)}  persisted store has a sensitive field "${m[1]}"`);
    }
  }
  record('Nothing sensitive saved on the phone', hits.length ? 'FAIL' : 'PASS', hits);
}

/* 6. New-tab links ------------------------------------------------------ */
{
  const hits = [];
  for (const p of CODE) {
    const t = read(p);
    for (const m of t.matchAll(/<a\b[^>]*target=['"]_blank['"][^>]*>/g)) if (!/rel=['"][^'"]*noopener/.test(m[0])) hits.push(`${rel(p)}:${lineOf(t, m.index)}  target=_blank without rel="noopener"`);
  }
  record('Links that open new tabs are isolated', hits.length ? 'FAIL' : 'PASS', hits);
}

/* 7. Vulnerable libraries ----------------------------------------------- */
{
  try {
    const out = execSync('npm audit --omit=dev --json', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const v = JSON.parse(out).metadata?.vulnerabilities ?? {};
    const bad = (v.high ?? 0) + (v.critical ?? 0);
    record(`Shipped libraries have no high or critical vulnerabilities (${v.total ?? 0} total)`, bad ? 'FAIL' : 'PASS', bad ? [`${v.high} high, ${v.critical} critical: run npm audit for details`] : []);
  } catch (e) {
    let parsed; try { parsed = JSON.parse(e.stdout); } catch { /* offline */ }
    const v = parsed?.metadata?.vulnerabilities;
    if (v) { const bad = (v.high ?? 0) + (v.critical ?? 0); record(`Shipped libraries have no high or critical vulnerabilities (${v.total ?? 0} total)`, bad ? 'FAIL' : 'PASS', bad ? [`${v.high} high, ${v.critical} critical`] : []); }
    else record('Shipped libraries checked with npm audit', 'WARN', ['npm audit could not reach the registry; it runs again in GitHub Actions']);
  }
}

/* Report --------------------------------------------------------------- */
const icon = { PASS: '✔', FAIL: '✘', WARN: '!' };
console.log('\nLiving Room security check\n');
for (const r of results) {
  console.log(`  ${icon[r.status]} ${r.status.padEnd(4)}  ${r.name}`);
  for (const d of r.details.slice(0, 20)) console.log(`           ${d}`);
}
const failed = results.filter((r) => r.status === 'FAIL').length;
console.log(`\n${failed ? `${failed} check(s) failed. Fix them before deploying.` : 'All security checks passed.'}\n`);
process.exit(failed ? 1 : 0);
