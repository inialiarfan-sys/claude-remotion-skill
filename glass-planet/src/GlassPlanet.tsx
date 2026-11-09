import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { theme } from './theme';
import { buildTimeline, cue, SceneId } from './lib/timeline';
import { SceneProvider } from './components/SceneContext';
import { Captions } from './components/Captions';
import { BigNumber } from './components/BigNumber';
import { Grade, Grain, Vignette } from './components/Finish';
import { Bokeh, SceneMotion, TransitionIn } from './components/Motion';
import { Cue, SoundDesign } from './components/Sound';
import { usePreloadSprites } from './three/Host3D';
import { SCENE_COMPONENTS } from './scenes';

export type GlassPlanetProps = { audioFile: string | null; audioSeconds: number | null; music: boolean };

/** Big numbers, shown when they're spoken (first occurrence after the cold open). */
const NUMBERS: { phrase: string; value: string; label: string; color?: string }[] = [
  { phrase: '64 light years', value: '64', label: 'light-years away' },
  { phrase: 'about two earth days', value: '2 days', label: 'one year on HD 189733 b' },
  { phrase: 'around 1000 degrees', value: '1,000°C', label: 'hot enough to melt metal', color: '#ffb36b' },
  { phrase: 'in 2024', value: '2024', label: 'James Webb Space Telescope' },
];

export const GlassPlanet: React.FC<GlassPlanetProps> = ({ audioFile, audioSeconds, music }) => {
  const spritesReady = usePreloadSprites();
  const { fps } = useVideoConfig();
  const tl = useMemo(() => buildTimeline(audioSeconds ?? undefined), [audioSeconds]);
  const fade = Math.round(theme.sceneFade * fps);
  const welcome = tl.scenes[1].start;
  const numbers = NUMBERS.map((n) => ({ ...n, t: cue(tl, n.phrase, welcome) })).filter((n) => n.t !== null);

  const cues: Cue[] = [
    ...tl.scenes.slice(1).map((s) => ({ at: Math.round(s.start * fps) - fade, src: 'whoosh' as const, volume: 0.28 })),
    ...numbers.map((n) => ({ at: Math.round(n.t! * fps), src: 'pop' as const, volume: 0.45 })),
  ];
  // hook: a hit on every punchy line
  for (const ph of ['glass rain', 'winds faster than sound', '1000 degrees', 'smells like rotten eggs']) {
    const t = cue(tl, ph, 0, welcome);
    if (t !== null) cues.push({ at: Math.round(t * fps), src: 'boom', volume: 0.38 });
  }
  const storm = tl.scenes.find((s) => s.id === 'storm')!;
  const blades = cue(tl, 'millions of tiny blades', storm.start);
  if (blades !== null) cues.push({ at: Math.round(blades * fps) - 66, src: 'riser', volume: 0.35 }, { at: Math.round(blades * fps), src: 'boom', volume: 0.5 });
  const marble = tl.scenes.find((s) => s.id === 'marble')!;
  const special = cue(tl, 'special our own blue planet', marble.start);
  if (special !== null) cues.push({ at: Math.round(special * fps), src: 'sparkle', volume: 0.4 });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.color.void }}>
      {spritesReady && tl.scenes.map((scene, i) => {
        const from = i === 0 ? 0 : Math.round(scene.start * fps) - fade;
        const until = i === tl.scenes.length - 1 ? Math.ceil(tl.total * fps) : Math.round(tl.scenes[i + 1].start * fps);
        const length = until - from;
        const Comp = SCENE_COMPONENTS[scene.id as SceneId];
        // camera "breath" on every sentence start inside the scene
        const beats = tl.words
          .filter((w, k) => w.start >= scene.start && w.start < scene.end && (k === 0 || /[.?!]$/.test(tl.words[k - 1].text)))
          .map((w) => Math.round(w.start * fps) - from);
        return (
          <Sequence key={scene.id} from={from} durationInFrames={length} name={`${i + 1}. ${scene.title}`}>
            <SceneProvider value={{ tl, scene, from, length }}>
              <TransitionIn frames={fade} first={i === 0 || scene.id === 'ending'}>
                <SceneMotion beats={beats} length={length} seed={i * 1.3}>
                  <Comp />
                </SceneMotion>
              </TransitionIn>
            </SceneProvider>
          </Sequence>
        );
      })}
      <Bokeh count={16} />
      <Grade />
      {numbers.map((n) => (
        <BigNumber key={n.value} at={Math.round(n.t! * fps)} value={n.value} label={n.label} color={n.color} />
      ))}
      <Captions tl={tl} />
      <Vignette strength={0.55} />
      <Grain opacity={0.08} />
      {audioFile ? <Audio src={staticFile(audioFile)} /> : null}
      {music ? <SoundDesign tl={tl} fps={fps} cues={cues} /> : null}
    </AbsoluteFill>
  );
};
