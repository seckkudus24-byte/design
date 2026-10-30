import React from 'react';
import {CalculateMetadataFunction, Composition, staticFile} from 'remotion';
import {getAudioDurationInSeconds} from '@remotion/media-utils';
import {NepenthesVideo, NepenthesVideoProps} from './NepenthesVideo';
import {ALIGN_SOURCE, FPS, HEIGHT, WIDTH, WORDS} from './timeline';

const lastWordEnd = WORDS[WORDS.length - 1].e;

const calculateMetadata: CalculateMetadataFunction<NepenthesVideoProps> = async () => {
  let audio: number | null = null;
  try {
    audio = await getAudioDurationInSeconds(staticFile('voix.mp3'));
  } catch {
    // pas encore de voix.mp3
  }
  // Avec la voix : la vidéo dure exactement la longueur de l'audio.
  // Si le minutage n'a pas encore été refait sur la voix (npm run align), on l'étire en attendant.
  const total = audio ?? lastWordEnd + 1.5;
  const k = audio !== null && ALIGN_SOURCE === 'estimate' ? audio / (lastWordEnd + 0.6) : 1;
  return {durationInFrames: Math.round(total * FPS), props: {k, total, hasAudio: audio !== null}};
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="NepenthesTikTok"
    component={NepenthesVideo}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    durationInFrames={Math.round((lastWordEnd + 1.5) * FPS)}
    defaultProps={{k: 1, total: lastWordEnd + 1.5, hasAudio: false}}
    calculateMetadata={calculateMetadata}
  />
);
