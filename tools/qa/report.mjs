// Puts the day's results on one page (the GitHub run summary), in plain words.
import fs from 'node:fs';
import path from 'node:path';
const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'out');
const read = (f) => { try { return JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); } catch { return null; } };
const ui = read('ui.json'), copy = read('copy.json'), sec = read('security.json'), ai = read('ai-review.json'), cal = read('calendar.json');
const line = (ok, name, detail) => `| ${ok ? '✅' : '❌'} | ${name} | ${detail} |`;
const md = [`# Daily check · ${new Date().toISOString().slice(0, 10)}`, '', '| | Check | Result |', '|---|---|---|',
  line(ui && !ui.problems.length, 'Screens', ui ? `${ui.problems.length} problems, ${ui.warnings.length} warnings (cut-off text, things off screen, broken pictures, errors, search)` : 'did not run'),
  line(copy && !copy.problems.length, 'Words', copy ? `${copy.checked} pieces of text · ${copy.problems.length} spelling/grammar problems · ${copy.notes.length} notes` : 'did not run'),
  `| ${cal ? (cal.problems.length ? '❌' : cal.warnings.length ? '⚠️' : '✅') : '❌'} | Holiday calendar | ${cal ? `${cal.windows.length} theme windows worked out · ${cal.problems.length} problems · ${cal.warnings.length} dates to add` : 'did not run'} |`,
  line(sec && !sec.problems.length, 'Security', sec ? `${sec.files} files · ${sec.problems.length} problems (secrets, http, unknown sites, risky code)` : 'did not run'),
  `| ${ai ? (ai.issues.length ? '⚠️' : '✅') : '➖'} | Makes sense (AI read) | ${ai ? `${ai.checked} lines read · ${ai.issues.length} to look at` : 'skipped: add the ANTHROPIC_API_KEY secret to turn it on'} |`, ''];
const list = (title, a) => { if (a && a.length) { md.push(`## ${title}`, ...a.slice(0, 60).map((x) => `- ${typeof x === 'string' ? x : `“${x.line}” · ${x.problem}${x.suggestion ? ` → ${x.suggestion}` : ''}`}`), ''); } };
list('Screen problems', ui && ui.problems); list('Word problems', copy && copy.problems); list('Security problems', sec && sec.problems); list('AI read: lines to look at', ai && ai.issues);
list('Holiday calendar problems', cal && cal.problems); list('Holiday dates to add', cal && cal.warnings); list('Screen warnings', ui && ui.warnings); list('Word notes', copy && copy.notes);
const text = md.join('\n'); console.log(text);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
