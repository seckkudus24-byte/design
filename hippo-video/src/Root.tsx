import React from 'react';
import {CalculateMetadataFunction, Composition, staticFile} from 'remotion';
import {getAudioDurationInSeconds} from '@remotion/media-utils';
import {HippoVideo, HippoVideoProps} from './HippoVideo';
import {FPS, HEIGHT, WIDTH, computeDurations} from './scenes';

const calculateMetadata: CalculateMetadataFunction<HippoVideoProps> = async () => {
  let audioSeconds: number | null = null;
  try {
    audioSeconds = await getAudioDurationInSeconds(staticFile('voix.mp3'));
  } catch {
    // Pas encore de voix.mp3 : on garde les durées estimées.
  }
  const durations = computeDurations(audioSeconds);
  return {
    durationInFrames: durations.reduce((a, b) => a + b, 0),
    props: {durations, hasAudio: audioSeconds !== null},
  };
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HippoTikTok"
    component={HippoVideo}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    durationInFrames={FPS * 85}
    defaultProps={{durations: computeDurations(null), hasAudio: false}}
    calculateMetadata={calculateMetadata}
  />
);
