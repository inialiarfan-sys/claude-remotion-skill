#!/usr/bin/env bash
# Resumable render for slow (CPU-only) machines: renders muted chunks, then joins
# them and muxes public/narration.mp3. Same output as `npm run render:*`.
#   scripts/render-chunked.sh Vertical   →  out/diamond-rain-vertical.mp4
# Extra renderer flags via REMOTION_FLAGS (e.g. "--gl=swangle").
set -e
fmt=$1; comp="DiamondRain$fmt"; lower=$(echo "$fmt" | tr A-Z a-z)
chunk=${CHUNK:-1000}
mkdir -p out/chunks
[ -d out/bundle ] || npx remotion bundle src/index.ts --out-dir out/bundle >/dev/null
total=$(npx remotion compositions out/bundle $REMOTION_FLAGS 2>/dev/null | awk -v c="$comp" '$1==c {print $4}')
echo "$comp: $total frames"
list=out/chunks/$lower.txt; : > "$list"
for ((s=0; s<total; s+=chunk)); do
  e=$((s+chunk-1)); ((e>=total)) && e=$((total-1))
  f=out/chunks/${lower}_$(printf %05d $s).mp4
  echo "file '$(basename "$f")'" >> "$list"
  [ -f "$f" ] && continue
  npx remotion render out/bundle "$comp" "$f.tmp.mp4" --frames=$s-$e --muted --codec h264 --crf 18 $REMOTION_FLAGS
  mv "$f.tmp.mp4" "$f"
done
audio=()
[ -f public/narration.mp3 ] && audio=(-i public/narration.mp3 -map 0:v -map 1:a -c:a aac -b:a 192k)
ffmpeg -v error -y -f concat -safe 0 -i "$list" "${audio[@]}" -c:v copy -movflags +faststart "out/diamond-rain-$lower.mp4"
echo "done: out/diamond-rain-$lower.mp4"
