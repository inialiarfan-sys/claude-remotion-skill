import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { theme } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// one-shot sound effect placed at an absolute frame
export const Sfx: React.FC<{ at: number; file: string; volume?: number }> = ({ at, file, volume = 1 }) => (
  <Sequence from={Math.max(0, at)} layout="none">
    <Audio src={staticFile(`audio/${file}`)} volume={volume} />
  </Sequence>
);

// Ambient bed with a frame-accurate volume envelope [frame, volume][]
export const Bed: React.FC<{ file: string; from: number; dur: number; env: [number, number][] }> = ({ file, from, dur, env }) => (
  <Sequence from={from} durationInFrames={dur} layout="none">
    <Audio
      src={staticFile(`audio/${file}`)}
      loop
      volume={(f) =>
        interpolate(
          from + f,
          env.map((e) => e[0]),
          env.map((e) => e[1]),
          { ...clamp, easing: theme.ease.inOut },
        )
      }
    />
  </Sequence>
);
