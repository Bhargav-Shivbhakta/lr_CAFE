// Reads every sentence a customer sees and asks Claude whether each one makes sense, is good English,
// matches the café, and doesn't promise anything the café hasn't confirmed. Rules can catch typos; this catches
// "Freshly grilled iced coffee" or a notification that reads oddly.
// Needs ANTHROPIC_API_KEY (add it as a GitHub secret). Without a key it says so and passes.
// Run: node tools/qa/ai-review.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const OUT = path.join(ROOT, 'tools/qa/out');
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.QA_MODEL || 'claude-haiku-5-5';
if (!KEY) { console.log('AI review: skipped (no ANTHROPIC_API_KEY set)'); process.exit(0); }

const menu = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/menu.json'), 'utf8'));
const screen = fs.existsSync(path.join(OUT, 'screen-text.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'screen-text.json'), 'utf8')) : [];
const texts = [...new Set([...menu.items.flatMap((i) => [i.name, i.desc].filter(Boolean)), ...screen.filter((t) => t.split(' ').length >= 3)])];

const ask = async (batch) => {
  const prompt = `You review the words in a café ordering app (Living Room Coffeehouse, San Diego, near SDSU) before customers see them.
Look at each line below. Report only lines with a real problem:
- it doesn't make sense, contradicts itself, or describes food or drink impossibly
- grammar, spelling or punctuation mistakes
- confusing or unclear wording a customer could misread
- a promise or claim that sounds made up (times, prices, health claims)
Ignore food names, brand names and short labels that are fine as labels.
Answer with JSON only: {"issues":[{"line":"<exact line>","problem":"<short>","suggestion":"<better wording>"}]}. Empty list if all are fine.

${batch.map((t, k) => `${k + 1}. ${t}`).join('\n')}`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!r.ok) throw new Error(`API ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json(), txt = (j.content || []).map((c) => c.text || '').join('');
  const m = txt.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]).issues || [] : [];
};

const issues = [];
for (let i = 0; i < texts.length; i += 80) issues.push(...(await ask(texts.slice(i, i + 80))));
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'ai-review.json'), JSON.stringify({ checked: texts.length, model: MODEL, issues }, null, 1));
console.log(`AI review: ${texts.length} lines read, ${issues.length} to look at`);
issues.forEach((x) => console.log(`  ! “${x.line}” · ${x.problem}${x.suggestion ? ` → ${x.suggestion}` : ''}`));
// findings are for people to judge, so they don't fail the run; they show in the daily report
