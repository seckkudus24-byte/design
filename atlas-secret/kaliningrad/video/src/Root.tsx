import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { VideoEpisode } from "./VideoEpisode";
import { FPS, TOTAL_FRAMES } from "./timeline";
import { PROTO_END } from "./config/episode";

export const PROTO_FRAMES = Math.round(PROTO_END * FPS); // 478 : scènes 1–2 validées
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Prototype" component={Video} durationInFrames={PROTO_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="Episode" component={VideoEpisode} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
