import React, { createContext, useContext } from 'react';
import { useVideoConfig } from 'remotion';

export type SceneLine = { text: string; from: number; to: number };
export type SceneInfo = {
  /** line timings relative to the scene's first visible frame */
  lines: SceneLine[];
  /** visible length of the scene in frames */
  length: number;
};

const Ctx = createContext<SceneInfo>({ lines: [], length: 1 });
export const SceneProvider: React.FC<{ value: SceneInfo; children: React.ReactNode }> = ({ value, children }) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);

/** Scene timing + layout helpers. */
export const useScene = () => {
  const info = useContext(Ctx);
  const { width, height, fps } = useVideoConfig();
  const isV = height > width;
  const beat = (i: number) => info.lines[Math.min(i, info.lines.length - 1)]?.from ?? 0;
  const beatEnd = (i: number) => info.lines[Math.min(i, info.lines.length - 1)]?.to ?? info.length;
  return { ...info, width, height, fps, isV, beat, beatEnd };
};
