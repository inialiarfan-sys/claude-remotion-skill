#!/usr/bin/env bash
# Resumable render of a long composition: the video is rendered in fixed
# frame-range chunks (each kept once complete), the audio in one pass, then the
# chunks are joined without re-encoding and the audio is muxed in.
# Re-running after an interruption only renders what is missing.
#
#   scripts/render-chunked.sh <CompositionId> <output.mp4> [chunkFrames] [crf]
set -euo pipefail
cd "$(dirname "$0")/.."

COMP=${1:?composition id}
OUT=${2:?output mp4}
CHUNK=${3:-900}
CRF=${4:-18}
WORK="out/chunks-$COMP"
mkdir -p "$WORK"

TOTAL=$(npx remotion compositions src/index.ts 2>/dev/null | awk -v id="$COMP" '$1 == id { print $4 }')
if [ -z "$TOTAL" ]; then echo "composition $COMP not found" >&2; exit 1; fi
echo "$COMP: $TOTAL frames, chunks of $CHUNK"

: > "$WORK/list.txt"
for ((start = 0; start < TOTAL; start += CHUNK)); do
  end=$((start + CHUNK - 1)); ((end >= TOTAL)) && end=$((TOTAL - 1))
  part="$WORK/part-$(printf %05d "$start").mp4"
  if [ ! -s "$part" ]; then
    echo "rendering frames $start-$end"
    npx remotion render src/index.ts "$COMP" "$part.tmp.mp4" --codec h264 --crf "$CRF" \
      --frames="$start-$end" --muted --overwrite --log=error
    mv "$part.tmp.mp4" "$part"
  else
    echo "frames $start-$end already rendered"
  fi
  echo "file '$(basename "$part")'" >> "$WORK/list.txt"
done

if [ ! -s "$WORK/audio.wav" ]; then
  echo "rendering audio"
  npx remotion render src/index.ts "$COMP" "$WORK/audio.tmp.wav" --codec wav --overwrite --log=error
  mv "$WORK/audio.tmp.wav" "$WORK/audio.wav"
fi

ffmpeg -v error -y -f concat -safe 0 -i "$WORK/list.txt" -c copy "$WORK/video.mp4"
ffmpeg -v error -y -i "$WORK/video.mp4" -i "$WORK/audio.wav" -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 320k -movflags +faststart "$OUT"
echo "done: $OUT"
