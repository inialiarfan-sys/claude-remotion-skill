import React from 'react';
import { CalculateMetadataFunction, Composition, staticFile } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { GlassPlanet, GlassPlanetProps } from './GlassPlanet';
import { buildTimeline, TAIL } from './lib/timeline';

const FPS = 30;

/** Length = narration length + 1.5 s. The narration may be .mp3 or .wav in public/. */
const calculateMetadata: CalculateMetadataFunction<GlassPlanetProps> = async () => {
  let audioFile: string | null = null;
  let audioSeconds: number | null = null;
  for (const f of ['narration.mp3', 'narration.wav', 'narration.m4a']) {
    try {
      audioSeconds = await getAudioDurationInSeconds(staticFile(f));
      audioFile = f;
      break;
    } catch {
      /* try the next one */
    }
  }
  let music = false;
  try {
    await getAudioDurationInSeconds(staticFile('audio/score.wav'));
    music = true;
  } catch {
    music = false;
  }
  const tl = buildTimeline(audioSeconds ?? undefined);
  if (tl.missing.length) console.warn(`[glass-planet] missing anchors: ${tl.missing.join(' | ')}`);
  return { durationInFrames: Math.ceil((tl.duration + TAIL) * FPS), props: { audioFile, audioSeconds, music } };
};

const defaults: GlassPlanetProps = { audioFile: null, audioSeconds: null, music: false };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="GlassPlanetVertical"
      component={GlassPlanet}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={300}
      defaultProps={defaults}
      calculateMetadata={calculateMetadata}
    />
    <Composition
      id="GlassPlanetWide"
      component={GlassPlanet}
      width={1920}
      height={1080}
      fps={FPS}
      durationInFrames={300}
      defaultProps={defaults}
      calculateMetadata={calculateMetadata}
    />
  </>
);
