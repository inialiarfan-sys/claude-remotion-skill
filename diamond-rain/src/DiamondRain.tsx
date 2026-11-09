import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from './theme';
import type { Timeline } from './timing';
import type { SceneId } from './script';
import { SceneProvider } from './components/SceneContext';
import { Captions } from './components/Captions';
import { Grade, Grain, Vignette } from './components/Finish';
import { ease } from './lib/anim';
import { HookScene } from './scenes/Hook';
import { GiantsScene } from './scenes/Giants';
import { InsideScene } from './scenes/Inside';
import { CarbonScene } from './scenes/Carbon';
import { MethaneScene } from './scenes/Methane';
import { RainScene } from './scenes/Rain';
import { LabScene } from './scenes/Lab';
import { HonestScene } from './scenes/Honest';
import { EarthScene } from './scenes/Earth';
import { EndingScene } from './scenes/Ending';

export type DiamondRainProps = { timeline: Timeline };

const SCENES: Record<SceneId, React.FC> = {
  hook: HookScene,
  giants: GiantsScene,
  inside: InsideScene,
  carbon: CarbonScene,
  methane: MethaneScene,
  rain: RainScene,
  lab: LabScene,
  honest: HonestScene,
  earth: EarthScene,
  ending: EndingScene,
};

/** Incoming scene fades in on top of the outgoing one. */
const FadeIn: React.FC<{ frames: number; first: boolean; children: React.ReactNode }> = ({ frames, first, children }) => {
  const frame = useCurrentFrame();
  const o = first ? 1 : ease(frame, [0, frames], [0, 1], theme.ease.inOut);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const DiamondRain: React.FC<DiamondRainProps> = ({ timeline }) => {
  const { fps } = useVideoConfig();
  const fade = Math.round(theme.sceneFade * fps);
  const { scenes, totalFrames } = timeline;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.color.void }}>
      {scenes.map((scene, i) => {
        const from = i === 0 ? 0 : scene.start - fade;
        const until = i === scenes.length - 1 ? totalFrames : scenes[i + 1].start;
        const length = until - from;
        const Comp = SCENES[scene.id];
        return (
          <Sequence key={scene.id} from={from} durationInFrames={length} name={scene.title}>
            <SceneProvider
              value={{
                length,
                lines: scene.lines.map((l) => ({ text: l.text, from: l.start - from, to: l.end - from })),
              }}
            >
              <FadeIn frames={fade} first={i === 0}>
                <Comp />
              </FadeIn>
            </SceneProvider>
          </Sequence>
        );
      })}
      <Grade />
      <Captions timeline={timeline} />
      <Vignette />
      <Grain />
      {timeline.hasAudio ? <Audio src={staticFile('narration.mp3')} /> : null}
    </AbsoluteFill>
  );
};
