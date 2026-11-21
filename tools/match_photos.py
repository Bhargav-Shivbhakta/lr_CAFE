"""Match {name, image} pairs collected from the café's Toast page to menu item ids.
Usage: python3 tools/match_photos.py collected.json  -> writes src/data/photos.json and prints a report."""
import json, re, sys, difflib
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower().replace('&', 'and').replace('®', ''))
menu = json.load(open('src/data/menu.source.json'))['items']
collected = json.load(open(sys.argv[1]))
by_norm = {norm(i['name']): i['id'] for i in menu}
out, unmatched = {}, []
for c in collected:
    n = norm(c['name'])
    hit = by_norm.get(n) or next(iter(difflib.get_close_matches(n, by_norm, n=1, cutoff=0.82)), None)
    hit = by_norm.get(hit, hit) if hit in by_norm else hit
    if hit: out[hit] = c['image']
    else: unmatched.append(c['name'])
json.dump(out, open('src/data/photos.json', 'w'), indent=1)
print(f"matched {len(out)} of {len(collected)} photos; {len(menu) - len(out)} menu items still use illustrations")
if unmatched: print('no menu match for:', ', '.join(unmatched))
