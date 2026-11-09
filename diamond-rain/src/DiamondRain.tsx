import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { theme } from './theme';
import type { Timeline } from './timing';
import type { SceneId } from './script';
import { SceneProvider } from './components/SceneContext';
import { Captions } from './components/Captions';
import { Grade, Grain, Vignette } from './components/Finish';
import { Bokeh, ChapterTag, LightLeaks, SceneMotion, TransitionIn } from './components/Motion';
import { SoundDesign } from './components/Sound';
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

export type DiamondRainProps = { timeline: Timeline; music?: boolean };

const CHAPTERS: Partial<Record<SceneId, string>> = {
  giants: 'Two distant worlds',
  inside: 'Inside an ice giant',
  carbon: "Carbon's secret",
  methane: 'From gas to gems',
  rain: 'Diamond rain',
  lab: 'The lab test',
  honest: 'An honest note',
  earth: 'Back on Earth',
  ending: 'Beyond',
};

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

export const DiamondRain: React.FC<DiamondRainProps> = ({ timeline, music = false }) => {
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
        const lines = scene.lines.map((l) => ({ text: l.text, from: l.start - from, to: l.end - from }));
        return (
          <Sequence key={scene.id} from={from} durationInFrames={length} name={scene.title}>
            <SceneProvider
              value={{ length, lines }}
            >
              <TransitionIn frames={fade} first={i === 0}>
                <SceneMotion lines={lines} length={length} seed={i * 1.7}>
                  <Comp />
                </SceneMotion>
              </TransitionIn>
            </SceneProvider>
          </Sequence>
        );
      })}
      <Bokeh />
      <LightLeaks cuts={scenes.slice(1).map((s) => s.start - Math.round(fade / 2))} />
      <Grade />
      {scenes.map((s, i) =>
        CHAPTERS[s.id] ? <ChapterTag key={s.id} index={i + 1} title={CHAPTERS[s.id]!} from={s.start - fade + 10} /> : null,
      )}
      <Captions timeline={timeline} />
      <Vignette />
      <Grain />
      {timeline.hasAudio ? <Audio src={staticFile('narration.mp3')} /> : null}
      {music ? <SoundDesign timeline={timeline} fade={fade} /> : null}
    </AbsoluteFill>
  );
};
