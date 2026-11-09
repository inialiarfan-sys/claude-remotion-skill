import React, { createContext, useContext } from 'react';
import { useVideoConfig } from 'remotion';
import { cue as findCue, Timeline, TimedScene } from '../lib/timeline';

type Info = { tl: Timeline; scene: TimedScene; from: number; length: number };
const Ctx = createContext<Info | null>(null);
export const SceneProvider: React.FC<{ value: Info; children: React.ReactNode }> = ({ value, children }) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);

/**
 * Scene helpers. `at("eggs")` = local frame (relative to this scene's first visible
 * frame) when that phrase is spoken inside this scene — falls back to `fallback`
 * seconds into the scene if the phrase isn't in the recording.
 */
export const useScene = () => {
  const info = useContext(Ctx)!;
  const { width, height, fps } = useVideoConfig();
  const isV = height > width;
  const sceneStart = info.scene.start;
  const at = (phrase: string, fallback = 0): number => {
    const t = findCue(info.tl, phrase, sceneStart - 0.3, info.scene.end + 0.3);
    return Math.round(((t ?? sceneStart + fallback) - sceneStart) * fps) + (Math.round(sceneStart * fps) - info.from);
  };
  /** local frame of an absolute time in seconds */
  const local = (sec: number) => Math.round(sec * fps) - info.from;
  return { ...info, width, height, fps, isV, at, local };
};
