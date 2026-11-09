#!/usr/bin/env bash
# Render full-size stills for visual QA.
#   scripts/stills.sh Vertical 120 900 1500
#   scripts/stills.sh Wide 120 900 1500
# Extra renderer flags go in REMOTION_FLAGS (e.g. REMOTION_FLAGS="--gl=swangle").
set -e
comp="GlassPlanet$1"; shift
mkdir -p out/stills
npx remotion bundle src/index.ts --out-dir out/bundle >/dev/null
printf '%s\n' "$@" | xargs -P "${JOBS:-3}" -I{} sh -c \
  "npx remotion still out/bundle $comp out/stills/${comp}_{}.png --frame {} $REMOTION_FLAGS >/dev/null 2>&1 && echo out/stills/${comp}_{}.png || echo 'FAILED frame {}'"
