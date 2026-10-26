#!/usr/bin/env bash
# contact sheet: sheet.sh out.png in1.png in2.png ... (each scaled to 360x640, one row)
out=$1; shift
args=(); filt=""; i=0
for f in "$@"; do args+=(-i "$f"); filt+="[$i]scale=360:640[v$i];"; i=$((i+1)); done
for ((k=0;k<i;k++)); do filt+="[v$k]"; done
ffmpeg -v error -y "${args[@]}" -filter_complex "${filt}hstack=$i" "$out"
