"""Checks every word a customer reads: the menu, notifications, cup captions, order groups, and the text
the screen check saw on each screen (tools/qa/out/screen-text.json, written by ui-check.mjs).

Two kinds of finding:
  problems  spelling mistakes and grammar slips that should never ship (fails the run)
  notes     things worth a look (long sentences, shouting, wording house rules)

Spelling uses an offline English dictionary plus tools/qa/words.txt (café, food and brand words).
Run: python3 tools/qa/copy-check.py
"""
import json, os, re, sys
from spellchecker import SpellChecker

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'tools', 'qa', 'out')
os.makedirs(OUT, exist_ok=True)

# ---------- collect the words people read ----------
texts = []  # (where, text)
menu = json.load(open(os.path.join(ROOT, 'data', 'menu.json')))
for c in menu['categories']: texts.append(('menu section', c['name']))
for i in menu['items']:
    texts.append((f"menu · {i['id']} · name", i['name']))
    if i.get('desc'): texts.append((f"menu · {i['id']} · description", i['desc']))
og = json.load(open(os.path.join(ROOT, 'data', 'order-groups.json')))
for m in og['meals']: texts += [(f"meal {m['id']}", m['name']), (f"meal {m['id']} note", m['note'])]
for meal, gs in og['groups'].items():
    for g in gs:
        texts += [(f"{meal} · group", g['name']), (f"{meal} · group line", g['sub'])]
        texts += [(f"{meal} · {g['name']} · kind", s[0]) for s in g['subs']]
# string literals people see in the notification and mascot engines
for rel in ['engine/notifications.ts', 'design-system/mascot/engine.ts']:
    p = os.path.join(ROOT, rel)
    if not os.path.exists(p): continue
    src = open(p, encoding='utf-8').read()
    for m in re.finditer(r"(?:title|body|caption|text|label|cta)\s*:\s*(['\"`])((?:\\.|(?!\1).)+)\1", src):
        texts.append((rel, re.sub(r'\$\{[^}]*\}', '0', m.group(2))))
st = os.path.join(OUT, 'screen-text.json')
if os.path.exists(st):
    for t in json.load(open(st)): texts.append(('on screen', re.sub(r'“[^”]*”', '“…”', t)))   # what a customer typed into search is theirs, not ours
else:
    print('note: run tools/qa/ui-check.mjs first to include on-screen text')

# ---------- the checker checks itself: these must be caught ----------
if '--self-test' in sys.argv:
    texts[:] = [('test', t) for t in ['Add the the cheese', 'A  double space', 'Is it hot ?', 'Milk,oat', 'i want a latte', 'Fresh (orange juice', 'a omelette', 'an burrito', 'Lorem ipsum', 'NaN points', 'Brekfast burrito']]


# ---------- spelling ----------
sp = SpellChecker()
allow = set()
wl = os.path.join(ROOT, 'tools', 'qa', 'words.txt')
if os.path.exists(wl):
    allow = {w.strip().lower() for w in open(wl, encoding='utf-8') if w.strip() and not w.startswith('#')}
WORD = re.compile(r"[A-Za-zÀ-ÿ’']+")

def strip_accents(w):
    import unicodedata
    return ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn')

problems, notes = [], []
unknown = {}
for where, t in texts:
    for w in WORD.findall(t):
        w2 = w.replace('’', "'").strip("'").lower()
        if len(w2) < 3 or w2 in allow or strip_accents(w2) in allow: continue
        if w2.endswith("'s"): w2 = w2[:-2]
        if not w2 or w2 in allow or sp.known([w2]) or sp.known([strip_accents(w2)]): continue
        unknown.setdefault(w2, []).append((where, t))
for w, hits in sorted(unknown.items()):
    sug = sp.correction(w)
    problems.append(f'spelling: “{w}”' + (f' (did you mean “{sug}”?)' if sug and sug != w else '') + f' · {hits[0][0]}: “{hits[0][1][:70]}”' + (f' (+{len(hits) - 1} more)' if len(hits) > 1 else ''))

# ---------- grammar and house rules ----------
VOWEL_SOUND_EXCEPT = {'one', 'once', 'uni', 'use', 'usu', 'eu', 'ewe', 'ufo', 'utah'}
CONSONANT_SOUND_EXCEPT = {'hour', 'honest', 'honor', 'heir', 'herb'}
seen = set()
for where, t in texts:
    if (where, t) in seen: continue
    seen.add((where, t))
    say = lambda msg, kind=problems: kind.append(f'{msg} · {where}: “{t[:80]}”')
    if re.search(r'\b(\w+)\s+\1\b', t, re.I) and not re.search(r'\b(that that|had had|bye bye)\b', t, re.I): say('repeated word')
    if '  ' in t: say('double space')
    if re.search(r'\s[,.!?;:](?!\d)', t): say('space before punctuation')
    if re.search(r'[,;:](?=[A-Za-z])', t) and not re.search(r'https?:|\d:\d', t): say('missing space after punctuation')
    if re.search(r'\bi\b', t) and not re.search(r'\bi\.e\.', t): say('lowercase “i”')
    if t.count('(') != t.count(')'): say('unbalanced brackets')
    if t.count('“') != t.count('”'): say('unbalanced quotes')
    if re.search(r'\b(lorem|ipsum|todo|tbd|fixme|xxx)\b', t, re.I): say('placeholder text')
    if re.search(r'\bundefined\b|\bNaN\b|\[object Object\]', t): say('broken value')
    if re.search(r'\$\d+(\.\d)?(?!\d)', t) and not re.search(r'\$\d+(\.\d\d)?\b', t): say('price should have cents, like $4.50', notes)
    for a, w in re.findall(r'\b(a|an)\s+([A-Za-z]+)', t, re.I):
        lw = w.lower()
        vowel = lw[0] in 'aeiou' and not any(lw.startswith(x) for x in VOWEL_SOUND_EXCEPT) or any(lw.startswith(x) for x in CONSONANT_SOUND_EXCEPT)
        if a.lower() == 'a' and vowel and len(lw) > 1: say(f'“a {w}” should be “an {w}”')
        if a.lower() == 'an' and not vowel: say(f'“an {w}” should be “a {w}”')
    # sentences start with a capital (skip labels like "2%", prices, and lower-case UI fragments of one word)
    for s_ in re.split(r'(?<=[.!?])\s+', t):
        s_ = s_.strip('“”"( ')
        if len(s_.split()) >= 4 and s_[0].isalpha() and s_[0].islower(): say('sentence starts with a small letter', notes)
    if len(t.split()) > 35: say('long sentence (over 35 words)', notes)
    if re.search(r'\b[A-Z]{5,}\b', t) and not re.search(r'\b(SDSU|DEMO|OFFER|NEW)\b', t): say('all-caps word', notes)
    if re.search(r'!{2,}|\?{2,}', t): say('repeated ! or ?', notes)

problems = sorted(set(problems)); notes = sorted(set(notes))
json.dump({'checked': len(seen), 'problems': problems, 'notes': notes}, open(os.path.join(OUT, 'copy.json'), 'w'), indent=1, ensure_ascii=False)
print(f'Copy check: {len(seen)} pieces of text, {len(problems)} problem(s), {len(notes)} note(s)')
for x in problems[:120]: print('  ✗ ' + x)
for x in notes[:40]: print('  ! ' + x)
if '--self-test' in sys.argv:
    want = ['repeated word', 'double space', 'space before punctuation', 'missing space after punctuation', 'lowercase “i”', 'unbalanced brackets', '“a omelette”', '“an burrito”', 'placeholder text', 'broken value', 'spelling: “brekfast”']
    missed = [w for w in want if not any(w in x for x in problems)]
    print('self-test:', 'all caught' if not missed else 'MISSED ' + ', '.join(missed)); sys.exit(1 if missed else 0)
sys.exit(1 if problems else 0)
