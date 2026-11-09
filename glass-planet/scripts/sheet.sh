#!/usr/bin/env bash
# Contact sheet of stills: scripts/sheet.sh out.png a.png b.png c.png ...  (3 per row, half size)
out=$1; shift
n=$#; cols=${COLS:-3}
args=(); for f in "$@"; do args+=(-i "$f"); done
filter=""; for i in $(seq 0 $((n-1))); do filter+="[$i:v]scale=iw/2:ih/2[s$i];"; done
layout=""; w=0
for i in $(seq 0 $((n-1))); do c=$((i%cols)); r=$((i/cols)); layout+="${c}_${r}|"; done
inputs=""; for i in $(seq 0 $((n-1))); do inputs+="[s$i]"; done
# xstack needs explicit pixel offsets
first=$(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "$1")
W=$(( ${first%,*} / 2 )); H=$(( ${first#*,} / 2 ))
layout=""; for i in $(seq 0 $((n-1))); do c=$((i%cols)); r=$((i/cols)); layout+="$((c*W))_$((r*H))|"; done
ffmpeg -v error -y "${args[@]}" -filter_complex "${filter}${inputs}xstack=inputs=$n:layout=${layout%|}:fill=black" "$out"
