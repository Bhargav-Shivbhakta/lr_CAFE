# Frame every menu photo the same way: find the dish (or the cup) with a cut-out model,
# then centre it in each card shape with the same breathing room on every side.
# If a shape needs more picture than the photo has (a tall iced cup in a wide banner),
# the missing edges are filled with a soft blur of the photo itself, never by cutting the dish.
import json, os, sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from rembg import remove, new_session

SESSION = new_session('u2net')
CACHE = '/home/claude/orig/boxes.json'
boxes = json.load(open(CACHE)) if os.path.exists(CACHE) else {}

MASKS = '/home/claude/orig/masks'; os.makedirs(MASKS, exist_ok=True)
def subject_box(path):
    key = MASKS + '/' + path.replace('/', '_') + '.png'
    im = Image.open(path); W, H = im.size
    if os.path.exists(key): m = np.array(Image.open(key)).astype(np.float32) / 255
    else:
        small = im.convert('RGB').resize((512, int(512 * H / W)))
        mk = remove(small, session=SESSION, only_mask=True); mk.save(key); m = np.array(mk).astype(np.float32) / 255
    on = m > 0.5; sx = W / on.shape[1]
    lab, n = ndimage.label(on)
    if n == 0: return [0, 0, W, H, W / 2]
    sizes = ndimage.sum(on, lab, range(1, n + 1)); big = sizes.max()
    keep = np.isin(lab, [k + 1 for k, s in enumerate(sizes) if s >= 0.08 * big])  # the dish plus anything big beside it (a side, a second cup)
    ys, xs = np.where(keep)
    x0, x1 = xs.min(), xs.max() + 1
    # a handle (mug, skillet) is a thin part on one side: if the thin columns hold little of the dish, centre on the body
    col = keep.sum(0).astype(float); solid = np.where(col >= 0.5 * col.max())[0]
    s0, s1 = solid.min(), solid.max() + 1
    thin_left, thin_right = col[x0:s0].sum() / col.sum(), col[s1:x1].sum() / col.sum()
    bl = x0 if thin_left > 0.06 or (s0 - x0) < 0.08 * (x1 - x0) else s0      # keep a wide thin part only if it is light
    br = x1 if thin_right > 0.06 or (x1 - s1) < 0.08 * (x1 - x0) else s1
    out = [float(x0 * sx), float(ys.min() * sx), float(x1 * sx), float((ys.max() + 1) * sx), float((bl + br) / 2 * sx), float(bl * sx), float(br * sx), float(s0 * sx), float(s1 * sx)]
    # the food itself, without the plate: inside the dish, drop the white or pale grey of a plate or bowl
    hsv = np.array(im.convert('RGB').resize((on.shape[1], on.shape[0])).convert('HSV')).astype(np.float32) / 255
    plate = (hsv[..., 1] < 0.20) & (hsv[..., 2] > 0.50)
    food = ndimage.binary_opening(keep & ~plate, iterations=2)
    fl, fn = ndimage.label(food)
    if fn:
        fs = ndimage.sum(food, fl, range(1, fn + 1)); fb = fs.max()
        fk = np.isin(fl, [k + 1 for k, v in enumerate(fs) if v >= 0.10 * fb]); fy, fx = np.where(fk)
        fbox = [fx.min(), fy.min(), fx.max() + 1, fy.max() + 1]
        if (fbox[2] - fbox[0]) * (fbox[3] - fbox[1]) < 0.72 * (x1 - x0) * (ys.max() + 1 - ys.min()):
            out += [float(v * sx) for v in fbox]
    return out

def backdrop(im, pad):
    """The photo with `pad` px added on every side: mirrored, then blurred, with a soft seam. Only the café behind the dish is ever extended."""
    a = np.array(im); ext = np.pad(a, ((pad, pad), (pad, pad), (0, 0)), mode='edge')   # stretch the café's edge outward (a mirror would copy the dish)
    ext = Image.fromarray(ext).filter(ImageFilter.GaussianBlur(max(14, pad // 6)))
    feather = min(36, pad)
    m = Image.new('L', ext.size, 0); m.paste(255, (pad + feather, pad + feather, pad + im.size[0] - feather, pad + im.size[1] - feather)); m = m.filter(ImageFilter.GaussianBlur(feather / 2))
    sharp = ext.copy(); sharp.paste(im, (pad, pad))
    return Image.composite(sharp, ext, m)

def render(path, box, W, H, fill=0.80, cup=False):
    im = Image.open(path).convert('RGB'); IW, IH = im.size; A = W / H
    m = 0.015 * IW
    touches = box[0] < m or box[1] < m or box[2] > IW - m or box[3] > IH - m
    if not cup and len(box) > 9 and touches:   # only when the whole plate isn't in the photo: then show the food, centred
        # plated food: frame the food, and let the plate's rim run out of the picture
        fx0, fy0, fx1, fy1 = box[9:13]; box = [fx0, fy0, fx1, fy1, (fx0 + fx1) / 2, fx0, fx1, fx0, fx1]; fill = min(0.9, fill + 0.06)
    if not cup: fill = max(fill, 0.92)              # a plate is the frame: fill it, food big, a thin margin of table
    x0, y0, x1, y1 = box[:4]
    b0, b1 = (box[7], box[8]) if cup else (box[5], box[6])     # the body: a cup without its handle, a skillet without its handle
    cx, cy = (b0 + b1) / 2, (y0 + y1) / 2
    hx = max(cx - x0, x1 - cx); bh = y1 - y0
    plate = (b1 - b0) >= 0.97 * (x1 - x0)
    pref = max(2 * hx / fill, bh / fill * A)                                    # the dish with even room all round
    core = max((b1 - b0) / (1.12 if plate else 0.88), bh / 0.84 * A)            # the least we accept: the body whole, room above and below
    cmax = min(2 * min(cx, IW - cx), 2 * min(cy, IH - cy) * A)                  # the biggest crop centred on the dish inside the photo
    # how far past the photo a centred crop of width w reaches, as a share of w
    # how far past the photo a centred crop of width w reaches on each side, as a share of the crop.
    # Above the dish is the blurred café, so it can be extended a little; the table at the sides and front can't.
    def ok(w):
        h = w / A
        side = max(0, w / 2 - min(cx, IW - cx)) / w
        topx = max(0, h / 2 - cy) / h; botx = max(0, cy + h / 2 - IH) / h
        return side <= 0.015 and botx <= 0.02 and topx <= 0.12
    if pref <= cmax: cw = pref
    else:
        # allow up to 6% of soft, blurred café at the edges to keep the dish centred with room round it
        lo, hi = max(cmax, 1), pref
        for _ in range(30):
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if ok(mid) else (lo, mid)
        cw = lo
    ch = cw / A; left, top = cx - cw / 2, cy - ch / 2
    pad = int(np.ceil(max(0, -left, -top, left + cw - IW, top + ch - IH))) + 2
    src = backdrop(im, pad) if pad > 2 else im; o = pad if pad > 2 else 0
    crop = src.crop((round(left + o), round(top + o), round(left + o + cw), round(top + o + ch)))
    room_top = (y0 - top) / ch
    return crop.resize((W, H), Image.LANCZOS), {'pad': pad > 2 and round(pad / cw, 3), 'top': round(room_top, 3), 'fill': round(bh / ch, 2)}

def banner(path, box, W=880, H=440, cup=False):
    """A wide card. If the photo has room, a real wide crop; if not (a tall cup), the square framing in the middle
    over a soft blur of the same café, faded at its sides, so the whole dish shows at the same size every time."""
    sq, info = render(path, box, H, H, 0.72, cup=cup)
    real, rinfo = render(path, box, W, H, 0.78, cup=cup)
    if not rinfo['pad'] and rinfo['fill'] <= 0.84: return real
    # behind it: the same square, enlarged to the banner's width and blurred until only its colours are left
    big = sq.resize((W, W), Image.LANCZOS).crop((0, (W - H) // 2, W, (W - H) // 2 + H))
    bg = big.filter(ImageFilter.GaussianBlur(48))
    a = np.ones((H, H), np.float32); f = int(H * 0.2); ramp = np.linspace(0, 1, f)[None, :]
    a[:, :f] *= ramp; a[:, -f:] *= ramp[:, ::-1]
    bg.paste(sq, ((W - H) // 2, 0), Image.fromarray((a * 255).astype(np.uint8)))
    return bg

SHAPES = {'sq': (600, 600, 0.80), 'th': (240, 240, 0.80), 'card': (600, 450, 0.80), 'wide': (800, 500, 0.82), 'hero': (820, 400, 0.84)}
MENU = {i['id']: i['cat'] for i in json.load(open('/home/claude/lr_cafe/data/menu.json'))['items']}
DRINKS = {'coffee-espresso', 'lattes', 'mochas', 'frappes', 'matcha', 'non-coffee', 'refreshers', 'smoothies', 'teas', 'fall'}

if __name__ == '__main__':
    src = json.load(open('/home/claude/orig/src.json'))
    out = sys.argv[1]; only = sys.argv[2:] or None
    os.makedirs(out + '/new', exist_ok=True)
    report = {}
    for id, path in src['items'].items():
        if only and id not in only: continue
        b = subject_box(path); r = {}
        for k, (W, H, f) in SHAPES.items():
            img, info = render(path, b, W, H, f, cup=MENU.get(id) in DRINKS); img.save(f'{out}/{id}-{k}.webp', quality=82, method=6)
            r[k] = info
        banner(path, b, cup=MENU.get(id) in DRINKS).save(f'{out}/{id}-wide.webp', quality=80, method=6)
        report[id] = r
    for slug, path in src['new'].items():
        if only and slug not in only: continue
        b = subject_box(path); img, p = render(path, b, 600, 600, 0.80); img.save(f'{out}/new/{slug}-sq.webp', quality=82, method=6)
    json.dump(report, open('/home/claude/orig/report.json', 'w'), indent=0)
    padded = {i: r['sq']['pad'] for i, r in report.items() if r['sq']['pad']}
    print(len(report), 'items framed; squares that needed a little extended café:', padded)
