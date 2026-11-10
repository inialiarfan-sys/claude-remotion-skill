"""Cut the character sheets into clean transparent sprites.

    python scripts/make_sprites.py

Inputs (solid green background):
    public/character/sheet_new.png        12 astronaut poses (3 columns x 4 rows)
    public/character/sheet_new_walk.png   16 astronaut walk frames (4 x 4)
Outputs:
    public/character/<name>.png, sprites.json (also src/data/sprites.json),
    preview.png (every sprite on dark space blue, with its name), walk_test.gif

How it avoids damaging her:
 1. Upscale 2x (Lanczos).
 2. Green-screen key: alpha comes from how green a pixel is (green never appears in
    her art), so the dark outline, the cat's eyes and the white suit are never touched.
    Edge pixels are un-mixed from the green and de-spilled → no green or white fringe.
 3. Characters = connected components of the key (found automatically, then sorted into
    grid order by position; no hard-coded crop boxes).
 4. Decorations drawn touching her (speech bubbles, "?" marks, screens) are cut only where
    they join her through a thin neck, and only if the piece sits beside/above her head.
    Everything removed is listed in the script output so it can be checked.
 5. Helmet glass: light, bluish-grey pixels inside the helmet dome become semi-transparent.
 6. One pixel scale for every sprite. Walk frames share one canvas: feet on one baseline,
    helmet centred on the same x. 20 px transparent padding everywhere.
Requires: pip install pillow numpy scipy
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
CH = ROOT / "public" / "character"
PAD = 20
UP = 2

# Pose sheet in grid order (row-major, 3 columns). Names describe the art.
POSE_NAMES = [
    "pointing", "reading", "idea",
    "presenting", "clipboard", "shrug",
    "astronaut_sit", "pointer_board", "thinking",
    "waving", "explaining", "holding_sign",
]
# Walk cycle: row 1 of the walk sheet is the only run of frames with the same helmet size,
# head height and calm face (the other rows are drawn slightly bigger, taller-legged or
# with a >< face, which would make her pulse, hop or blink while walking). Its 4 frames
# are one full two-step stride; walk_5..8 repeat it so the 8-frame interface stays.
WALK_PICK = [1, 2, 3, 4, 1, 2, 3, 4]
STAND = 9  # walk-sheet frame used for the standing astronaut (feet together)
# Expression heads for the reaction bubbles: cropped (helmet + cat) from these sprites.
# Only sources with nothing attached near the head. The emotion is pushed further by the
# effects drawn in code next to the bubble (tears, anger mark, spiral, zZ ...).
HEADS = {
    "happy": "walk_src_6",
    "excited": "waving",
    "surprised": "reading",
    "confused": "shrug",
    "thinking_head": "thinking",
    "crying": "walk_src_15",
    "embarrassed": "walk_src_7",
    "angry": "walk_src_14",
    "dizzy": "walk_src_6",
    "sleepy": "walk_src_7",
    "sad": "walk_src_1",
}
# Poses whose speech bubble / screen / chart overlaps her helmet: they can't be separated
# without cutting into her, so they are not exported (the video doesn't use them).
SKIP = {"pointing", "idea", "presenting", "pointer_board", "explaining", "shrug"}
GREEN = np.array([4.0, 250.0, 10.0])


def load(name):
    im = Image.open(CH / f"{name}.png").convert("RGB")
    return np.asarray(im.resize((im.width * UP, im.height * UP), Image.LANCZOS)).astype(np.float32)


def key(rgb):
    """Green-screen alpha + de-spilled colour."""
    g = rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2])  # ~240 on the background
    alpha = np.clip(1 - (g - 25) / (200 - 25), 0, 1)
    a3 = np.maximum(alpha, 0.05)[..., None]
    col = np.where((alpha < 0.999)[..., None], (rgb - (1 - a3) * GREEN) / a3, rgb)
    col[..., 1] = np.minimum(col[..., 1], np.maximum(col[..., 0], col[..., 2]) + 6)
    return alpha, np.clip(col, 0, 255)


def components(alpha, min_area=60000):
    m = alpha > 0.5
    lab, n = ndi.label(m, structure=np.ones((3, 3)))
    sizes = ndi.sum(m, lab, range(1, n + 1))
    return [lab == i + 1 for i in range(n) if sizes[i] > min_area]


def grid_sort(parts, cols):
    cents = [ndi.center_of_mass(p) for p in parts]
    order = sorted(range(len(parts)), key=lambda i: cents[i][0])
    rows = [order[i : i + cols] for i in range(0, len(order), cols)]
    return [parts[i] for r in rows for i in sorted(r, key=lambda i: cents[i][1])]


def helmet(m):
    """Helmet dome = the largest inscribed circle of the figure (the chibi head)."""
    edt = ndi.distance_transform_edt(m)
    cy, cx = np.unravel_index(np.argmax(edt), edt.shape)
    return float(cx), float(cy), float(edt.max() * 1.08)


def cut_decorations(m, erode=20):
    """Remove bubbles/marks/screens joined to her by a thin neck. Returns (mask, dropped px)."""
    cx, cy, r = helmet(m)
    core = ndi.binary_erosion(m, iterations=erode)
    clab, cn = ndi.label(core)
    if cn <= 1:
        return m, 0
    sizes = ndi.sum(core, clab, range(1, cn + 1))
    main = int(np.argmax(sizes)) + 1
    drop = []
    for j in range(1, cn + 1):
        if j == main:
            continue
        ys, xs = np.where(clab == j)
        jy, jx = ys.mean(), xs.mean()
        beside_head = jy < cy + 0.35 * r and abs(jx - cx) > 0.85 * r
        above = jy < cy - 0.9 * r and abs(jx - cx) > 0.45 * r  # not the cat (centred)
        if beside_head or above:
            drop.append(j)
    if not drop:
        return m, 0
    _, (iy, ix) = ndi.distance_transform_edt(clab == 0, return_indices=True)
    keep = m & ~np.isin(clab[iy, ix], drop)
    lab, n = ndi.label(keep, structure=np.ones((3, 3)))
    if n > 1:
        s = ndi.sum(keep, lab, range(1, n + 1))
        keep = lab == (int(np.argmax(s)) + 1)
    return keep, int((m & ~keep).sum())


def sprite(alpha, col, part, decorations=True):
    ys, xs = np.where(part)
    p = 6
    y0, y1 = max(0, ys.min() - p), min(part.shape[0], ys.max() + p + 1)
    x0, x1 = max(0, xs.min() - p), min(part.shape[1], xs.max() + p + 1)
    m = part[y0:y1, x0:x1]
    a = alpha[y0:y1, x0:x1].copy()
    c = col[y0:y1, x0:x1].copy()
    m2, dropped = cut_decorations(m) if decorations else (m, 0)
    a = a * ndi.binary_dilation(m2, iterations=2)  # this character + its anti-aliased border only
    # leftover flecks of "!" / "?" / burst lines: strongly red, orange or yellow pixels outside
    # the helmet at head height (her suit badges sit lower and are never touched)
    hx, hy, hr = helmet(m2)
    yy, xx = np.mgrid[0 : m2.shape[0], 0 : m2.shape[1]]
    sat_ = c.max(2) - c.min(2)
    # decoration colours are fully saturated; her pink hair and cheeks are pastel (sat < ~110)
    R, G, B = c[..., 0], c[..., 1], c[..., 2]
    red = (R - G > 110) & (R - B > 90)  # "!" / "?" red; her pink hair is only ~70 above green
    yellow = (R - B > 100) & (G - B > 100)  # burst lines
    warm = red | yellow
    outside = (xx - hx) ** 2 + (yy - hy) ** 2 > (0.9 * hr) ** 2  # incl. the helmet rim itself
    warm2 = warm
    side = (np.abs(xx - hx) > 0.9 * hr) & (yy < hy + 0.9 * hr)  # beside her, down to hand height
    fleck = ndi.binary_dilation((warm & outside & (yy < hy + 0.45 * hr)) | (warm2 & outside & side), iterations=4)
    a = np.where(fleck, 0, a)
    # thin wisps left by a removed mark (outline scraps < ~4 px wide) beside her head:
    # a morphological opening there only (not on the cat, not inside the helmet)
    cat_zone = (np.abs(xx - hx) < 0.8 * hr) & (yy < hy)
    zone = outside & (yy < hy + 0.45 * hr) & ~cat_zone
    opened = ndi.binary_opening(a > 0.4, iterations=2)
    a = np.where(zone & ~ndi.binary_dilation(opened, iterations=1), 0, a)
    # drop anything not solidly connected to her (floating flecks joined only by faint edges)
    solid = a > 0.4
    lab, n = ndi.label(solid, structure=np.ones((3, 3)))
    if n > 1:
        sz = ndi.sum(solid, lab, range(1, n + 1))
        main = ndi.binary_dilation(lab == (int(np.argmax(sz)) + 1), iterations=2)
        a = a * main
    # helmet glass → see-through, highlights stay
    cx, cy, r = helmet(m2)
    yy, xx = np.mgrid[0 : m2.shape[0], 0 : m2.shape[1]]
    lum = c.mean(2)
    sat = c.max(2) - c.min(2)
    inside = ((xx - cx) ** 2 + (yy - cy) ** 2 < (0.95 * r) ** 2) & (yy < cy + 0.1 * r)
    glass = inside & m2 & (lum > 120) & (lum < 236) & (sat < 24) & (c[..., 2] >= c[..., 0] + 2)
    glass = ndi.binary_opening(glass, iterations=1)
    gl, gn = ndi.label(glass)
    if gn:
        sz = ndi.sum(glass, gl, range(1, gn + 1))
        glass = np.isin(gl, [i + 1 for i, v in enumerate(sz) if v > 80])
    t = np.clip((lum - 120) / 116, 0, 1)
    a = np.where(glass, a * (0.3 + 0.55 * t**1.5), a)
    c = np.where(glass[..., None], c * 0.4 + np.array([228, 240, 255]) * 0.6, c)
    im = Image.fromarray(np.dstack([c, a * 255]).astype(np.uint8), "RGBA")
    bb = im.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    return im.crop(bb), (cx - bb[0], cy - bb[1], r), dropped


def pad(im, p=PAD):
    out = Image.new("RGBA", (im.width + 2 * p, im.height + 2 * p), (0, 0, 0, 0))
    out.alpha_composite(im, (p, p))
    return out


def main():
    meta, sprites, report = {}, {}, []
    alpha, col = key(load("sheet_new"))
    poses = grid_sort(components(alpha), cols=3)
    assert len(poses) == 12, f"expected 12 poses, found {len(poses)}"
    for name, part in zip(POSE_NAMES, poses):
        im, head, dropped = sprite(alpha, col, part)
        sprites[name] = (im, head)
        if dropped:
            report.append(f"{name}: removed an attached decoration ({dropped} px)")
    alphaw, colw = key(load("sheet_new_walk"))
    walks = grid_sort(components(alphaw), cols=4)
    assert len(walks) == 16, f"expected 16 walk frames, found {len(walks)}"
    for i, part in enumerate(walks):
        im, head, _ = sprite(alphaw, colw, part, decorations=False)
        sprites[f"walk_src_{i + 1}"] = (im, head)

    # one display scale: the pose sheet is drawn bigger than the walk sheet, so scale the
    # whole pose sheet (one factor) until its helmets match the walk cycle's helmets
    walk_r = float(np.median([sprites[f"walk_src_{i}"][1][2] for i in set(WALK_PICK)]))
    pose_r = float(np.median([sprites[n][1][2] for n in POSE_NAMES]))
    f = walk_r / pose_r
    print(f"pose sheet scaled by {f:.3f} (helmet r {pose_r:.0f} → {walk_r:.0f} px)")
    for n in POSE_NAMES:
        im, (cx, cy, r) = sprites[n]
        sprites[n] = (im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS), (cx * f, cy * f, r * f))

    # walk cycle: one canvas, feet on one baseline, helmet centred on one x
    frames = [sprites[f"walk_src_{i}"] for i in WALK_PICK]
    left = max(h[0] for _, h in frames)
    right = max(im.width - h[0] for im, h in frames)
    height = max(im.height for im, _ in frames)
    W = int(np.ceil(left + right)) + 2 * PAD
    H = height + 2 * PAD
    for k, (im, h) in enumerate(frames):
        c = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        x = int(round(PAD + left - h[0]))
        y = H - PAD - im.height
        c.alpha_composite(im, (x, y))
        c.save(CH / f"walk_{k + 1}.png")
        meta[f"walk_{k + 1}"] = {"kind": "body", "w": W, "h": H, "baseline": H - PAD, "anchorX": PAD + left, "head": [PAD + left, y + h[1], h[2]]}

    def body(name, src):
        im, h = sprites[src]
        p = pad(im)
        p.save(CH / f"{name}.png")
        meta[name] = {"kind": "body", "w": p.width, "h": p.height, "baseline": p.height - PAD, "anchorX": PAD + h[0], "head": [PAD + h[0], PAD + h[1], h[2]]}

    body("astronaut", f"walk_src_{STAND}")
    for n in POSE_NAMES:
        if n not in SKIP:
            body(n, n)
    for expr, src in HEADS.items():
        im, (cx, cy, r) = sprites[src]
        # keep only helmet + cat (nothing held or floating can poke into the bubble)
        a = np.asarray(im.getchannel("A")).astype(np.float32)
        yy, xx = np.mgrid[0 : im.height, 0 : im.width]
        zone = ((xx - cx) ** 2 + (yy - cy) ** 2 < (1.04 * r) ** 2) | ((np.abs(xx - cx) < 0.8 * r) & (yy < cy) & (yy > cy - 1.7 * r))
        zone = ndi.gaussian_filter(zone.astype(np.float32), 1.0)
        im = im.copy()
        im.putalpha(Image.fromarray((a * zone).astype(np.uint8)))
        box = (int(max(0, cx - 1.1 * r)), int(max(0, cy - 1.75 * r)), int(min(im.width, cx + 1.1 * r)), int(min(im.height, cy + 1.05 * r)))
        h = im.crop(box)
        h = pad(h.crop(h.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()))
        h.save(CH / f"{expr}.png")
        meta[expr] = {"kind": "head", "w": h.width, "h": h.height}

    (CH / "sprites.json").write_text(json.dumps(meta, indent=1))
    (ROOT / "src" / "data" / "sprites.json").write_text(json.dumps(meta, indent=1))
    preview(meta)
    walk_gif(meta)
    print(f"wrote {len(meta)} sprites, preview.png, walk_test.gif")
    for line in report:
        print("  " + line)


def preview(meta):
    names = list(meta)
    cols = 6
    cw, chh = 330, 470
    rows = (len(names) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cw, rows * chh), (10, 18, 48))  # dark space blue exposes halos
    d = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 20)
    except OSError:
        font = ImageFont.load_default()
    s = (chh - 70) / max(m["h"] for m in meta.values() if m["kind"] == "body")  # one scale for all bodies
    for i, n in enumerate(names):
        im = Image.open(CH / f"{n}.png")
        k = s if meta[n]["kind"] == "body" else min((cw - 20) / im.width, (chh - 70) / im.height)
        im = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.LANCZOS)
        cx, cy = (i % cols) * cw, (i // cols) * chh
        base = cy + chh - 44
        sheet.paste(im, (cx + (cw - im.width) // 2, base - im.height), im)
        if meta[n]["kind"] == "body":
            y = base - int(PAD * k)
            d.line([(cx + 10, y), (cx + cw - 10, y)], fill=(255, 110, 140), width=1)
        d.text((cx + 12, base + 10), n, fill=(235, 240, 255), font=font)
    sheet.save(CH / "preview.png")


def walk_gif(meta):
    frames = []
    for k in range(1, 9):
        im = Image.open(CH / f"walk_{k}.png")
        bg = Image.new("RGBA", im.size, (10, 18, 48, 255))
        bg.alpha_composite(im)
        d = ImageDraw.Draw(bg)
        y = meta[f"walk_{k}"]["baseline"]
        d.line([(0, y), (im.width, y)], fill=(255, 110, 140, 255), width=2)
        frames.append(bg.convert("RGB").resize((im.width // 2, im.height // 2), Image.LANCZOS))
    frames[0].save(CH / "walk_test.gif", save_all=True, append_images=frames[1:], duration=91, loop=0)  # ~11 fps


if __name__ == "__main__":
    main()
