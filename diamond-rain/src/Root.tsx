import React from 'react';
import { CalculateMetadataFunction, Composition, staticFile } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { DiamondRain, DiamondRainProps } from './DiamondRain';
import { buildTimeline } from './timing';

const FPS = 30;

/**
 * Auto-time everything from public/narration.mp3 when it exists;
 * otherwise estimate ~2.5 words per second.
 */
const calculateMetadata: CalculateMetadataFunction<DiamondRainProps> = async () => {
  let audioSeconds: number | null = null;
  try {
    audioSeconds = await getAudioDurationInSeconds(staticFile('narration.mp3'));
  } catch {
    audioSeconds = null; // no narration.mp3 → estimate from word count
  }
  const timeline = buildTimeline(audioSeconds, FPS);
  return { durationInFrames: timeline.totalFrames, props: { timeline } };
};

const defaultProps: DiamondRainProps = { timeline: buildTimeline(null, FPS) };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="DiamondRainVertical"
      component={DiamondRain}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={defaultProps.timeline.totalFrames}
      defaultProps={defaultProps}
      calculateMetadata={calculateMetadata}
    />
    <Composition
      id="DiamondRainWide"
      component={DiamondRain}
      width={1920}
      height={1080}
      fps={FPS}
      durationInFrames={defaultProps.timeline.totalFrames}
      defaultProps={defaultProps}
      calculateMetadata={calculateMetadata}
    />
  </>
);
