"""Cut the character sheet(s) into transparent sprites + a contact sheet.

    python scripts/make_sprites.py

Inputs : public/character/sheet.png            (expressions, gestures, outfits, views)
         public/character/sheet-astronaut.png  (astronaut walk cycle + sitting pose)
Outputs: public/character/<name>.png, public/character/sprites.json, public/character/preview.png

Background removal: the paper is flood-filled from the outside of each crop, so
enclosed whites (suit, cat, dress) stay opaque and the outline is never eaten.
Edge pixels get soft alpha and are colour-decontaminated (no white halo).
Helmet glass (enclosed paper-white inside the helmet) is made see-through.
Every body sprite is scaled to the same character height and placed on a common
canvas with the feet on the same baseline. Needs: pip install pillow numpy scipy
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
CH = ROOT / "public" / "character"
SHEET = CH / "sheet.png"
ASTRO = CH / "sheet-astronaut.png"

UP = 3  # upscale factor (sources are small)
CANVAS = (420, 760)  # body sprite canvas (w, h) after scaling
SIZE = {"astronaut_sit": (720, 1000), "astronaut": (480, 760)}  # sprites needing a bigger canvas
# the sitting pose is drawn ~1.55x bigger on the sheet than the walk cycle
SCALE_FIX = {"astronaut_sit": 1.0, "astronaut": 0.86}
BASELINE = 740  # feet y on the canvas
BODY_H = 660  # cat-top → feet height every full-body sprite is scaled to

# (name, sheet, box=(x0, y0, x1, y1), kind)  kind: body | bust | head
WALK_CX = [94, 203, 322, 441, 553, 671, 794, 923]
SPRITES = (
    [(f"walk_{i+1}", "astro", (cx - 64, 34, cx + 64, 256), "body") for i, cx in enumerate(WALK_CX)]
    + [
        ("astronaut_sit", "astro", (1004, 20, 1222, 330), "body"),
        ("astronaut", "sheet", (832, 286, 990, 528), "body"),
        # expression heads
        ("happy", "sheet", (12, 40, 162, 207), "head"),
        ("excited", "sheet", (163, 40, 326, 207), "head"),
        ("angry", "sheet", (327, 40, 478, 207), "head"),
        ("sad", "sheet", (481, 40, 632, 207), "head"),
        ("surprised", "sheet", (634, 40, 785, 207), "head"),
        ("embarrassed", "sheet", (18, 243, 172, 412), "head"),
        ("crying", "sheet", (175, 243, 328, 412), "head"),
        ("sleepy", "sheet", (329, 243, 483, 412), "head"),
        ("confused", "sheet", (485, 243, 638, 412), "head"),
        ("dizzy", "sheet", (639, 243, 790, 412), "head"),
        ("thinking_head", "sheet", (30, 665, 198, 822), "head"),  # for the "thinking" bubble
        # gestures (upper body)
        ("peace", "sheet", (25, 484, 183, 642), "bust"),
        ("thumbs_up", "sheet", (183, 484, 340, 642), "bust"),
        ("pointing", "sheet", (340, 484, 496, 642), "bust"),
        ("waving", "sheet", (496, 474, 650, 642), "bust"),
        ("thinking", "sheet", (30, 665, 198, 822), "bust"),
        ("shy", "sheet", (196, 665, 336, 822), "bust"),
        ("cheering", "sheet", (338, 665, 498, 822), "bust"),
        ("crossed_arms", "sheet", (500, 665, 648, 822), "bust"),
        ("proud", "sheet", (652, 665, 795, 822), "bust"),
        # outfits / views (full body)
        ("casual", "sheet", (832, 40, 990, 258), "body"),
        ("winter", "sheet", (1160, 286, 1306, 528), "body"),
        ("front", "sheet", (822, 622, 948, 818), "body"),
        ("side", "sheet", (948, 622, 1058, 818), "body"),
        ("back", "sheet", (1058, 622, 1184, 818), "body"),
        ("side_other", "sheet", (1184, 622, 1306, 818), "body"),
    ]
)
GLASS = {"astronaut", "astronaut_sit"} | {f"walk_{i}" for i in range(1, 9)}


def paper_distance(rgb):
    """How far each pixel is from the off-white paper (0 = paper)."""
    paper = np.median(np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]]), axis=0)
    paper = np.maximum(paper, 240)
    d = np.max(np.abs(rgb - paper), axis=2)
    return d, paper


def cut(img, box, name):
    rgb = np.asarray(img.crop(box).convert("RGB")).astype(np.float32)
    h, w, _ = rgb.shape
    d, paper = paper_distance(rgb)
    # pale pink ground line / decorations: treat light, low-contrast pixels as paper too
    sat = rgb.max(2) - rgb.min(2)
    lum = rgb.mean(2)
    paperlike = (d < 22) | ((lum > 225) & (sat < 38) & (d < 40))
    # the sheet's pale-pink ground line under the feet (bottom rows only)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    ground = (r > 215) & (g > 160) & (b > 160) & (r - b > 18)
    ground[: int(h * 0.9)] = False
    paperlike |= ground
    # background = paper-like pixels connected to the crop border
    lab, _ = ndi.label(paperlike)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    outside = np.isin(lab, border[border > 0])
    solid = ~outside
    # keep only the character: the component containing the centre (thin touches with
    # neighbouring sprites are broken by an erosion first)
    core = ndi.binary_erosion(solid, iterations=2)
    clab, n = ndi.label(core)
    if n > 1:
        sizes = ndi.sum(core, clab, range(1, n + 1))
        # prefer the component under the centre column, else the biggest
        cy, cx = int(h * 0.55), w // 2
        pick = clab[cy, cx] if clab[cy, cx] > 0 else int(np.argmax(sizes)) + 1
        # also keep big pieces (hair strands, feet) that overlap the main bbox
        main = clab == pick
        ys, xs = np.where(main)
        y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
        keep = main.copy()
        for k in range(1, n + 1):
            if k == pick:
                continue
            comp = clab == k
            cys, cxs = np.where(comp)
            inside = (cys.min() >= y0 - 2) & (cys.max() <= y1 + 2) & (cxs.min() >= x0 - 2) & (cxs.max() <= x1 + 2)
            if inside and sizes[k - 1] > 150:
                keep |= comp
        core = keep
    solid = solid & ndi.binary_dilation(core, iterations=3)
    solid = ndi.binary_fill_holes(solid) | (solid & ~ndi.binary_fill_holes(solid))

    # soft alpha on the outer edge: a 2px band gets alpha from paper distance
    alpha = solid.astype(np.float32)
    band = solid & ~ndi.binary_erosion(solid, iterations=3)
    alpha[band] = np.clip((d[band] - 30) / 45.0, 0.0, 1.0) ** 1.3

    # helmet glass: enclosed paper-white regions in the helmet zone become see-through
    if name in GLASS:
        ys, xs = np.where(solid)
        top, bot = ys.min(), ys.max()
        H = bot - top
        inner = paperlike & solid & ~band
        edge_dist = ndi.distance_transform_edt(solid)  # distance to the outside
        glab, gn = ndi.label(inner)
        for k in range(1, gn + 1):
            comp = glab == k
            area = comp.sum()
            if area < 25:
                continue
            gy = np.where(comp)[0].mean()
            rel = (gy - top) / H
            lo, hi = (0.20, 0.62) if name != "astronaut_sit" else (0.12, 0.55)
            # glass sits just inside the helmet ring; the face is deep inside the hair
            near_ring = edge_dist[comp].min() <= (9 if name != "astronaut_sit" else 12)
            if lo < rel < hi and near_ring:
                alpha[comp] = 0.22
                rgb[comp] = rgb[comp] * 0.6 + np.array([200, 230, 255]) * 0.4

    # colour decontamination: remove the paper colour mixed into soft edge pixels
    a = alpha[..., None]
    with np.errstate(divide="ignore", invalid="ignore"):
        fg = (rgb - (1 - a) * paper) / np.maximum(a, 1e-3)
    fg = np.where(a > 0.98, rgb, np.clip(fg, 0, 255))
    out = np.dstack([fg, alpha * 255]).astype(np.uint8)
    im = Image.fromarray(out, "RGBA")
    bb = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    return im.crop(bb)


def upscale(im, factor):
    im = im.resize((round(im.width * factor), round(im.height * factor)), Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))


def main():
    sheets = {"sheet": Image.open(SHEET), "astro": Image.open(ASTRO)}
    meta = {}
    cut_imgs = {n: (cut(sheets[s], box, n), kind) for n, s, box, kind in SPRITES}

    # one scale for each source sheet: the median body height of that sheet → BODY_H
    def body_h(names):
        return float(np.median([cut_imgs[n][0].height for n in names]))

    sheet_bodies = ["casual", "winter", "astronaut", "front", "back"]
    walk = [f"walk_{i}" for i in range(1, 9)]
    scale = {"sheet": BODY_H / body_h(sheet_bodies), "astro": BODY_H / body_h(walk)}

    for n, s, box, kind in SPRITES:
        im, _ = cut_imgs[n]
        f = scale[s] * SCALE_FIX.get(n, 1)
        big = upscale(im, f)
        if kind == "head":
            big.save(CH / f"{n}.png")
            meta[n] = {"kind": kind, "w": big.width, "h": big.height}
            continue
        cw, chh = SIZE.get(n, CANVAS)
        base = chh - (CANVAS[1] - BASELINE)
        canvas = Image.new("RGBA", (cw, chh), (0, 0, 0, 0))
        x = (cw - big.width) // 2
        # bodies: feet on the baseline. busts: same head height as a standing body
        y = base - big.height if kind == "body" else base - BODY_H
        canvas.alpha_composite(big, (max(0, x), max(0, y)))
        canvas.save(CH / f"{n}.png")
        meta[n] = {"kind": kind, "w": cw, "h": chh, "baseline": base, "figureH": big.height}

    (CH / "sprites.json").write_text(json.dumps(meta, indent=1))
    (ROOT / "src" / "data" / "sprites.json").write_text(json.dumps(meta, indent=1))
    preview(meta)


def preview(meta):
    names = list(meta)
    cols = 8
    cw, chh = 210, 400
    rows = (len(names) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cw, rows * chh), (44, 52, 70))
    # checkerboard so transparency / halos are visible
    tile = Image.new("RGB", (16, 16), (60, 70, 92))
    for yy in range(0, sheet.height, 16):
        for xx in range(0, sheet.width, 16):
            if (xx // 16 + yy // 16) % 2:
                sheet.paste(tile, (xx, yy))
    from PIL import ImageDraw

    dr = ImageDraw.Draw(sheet)
    for i, n in enumerate(names):
        im = Image.open(CH / f"{n}.png")
        im.thumbnail((cw - 10, chh - 40), Image.LANCZOS)
        cx, cy = (i % cols) * cw, (i // cols) * chh
        sheet.paste(im, (cx + (cw - im.width) // 2, cy + chh - 30 - im.height), im)
        dr.line([(cx, cy + chh - 30), (cx + cw, cy + chh - 30)], fill=(255, 120, 120))  # baseline
        dr.text((cx + 8, cy + chh - 24), n, fill=(255, 255, 255))
    sheet.save(CH / "preview.png")
    print("wrote", len(names), "sprites + preview.png")


if __name__ == "__main__":
    main()
