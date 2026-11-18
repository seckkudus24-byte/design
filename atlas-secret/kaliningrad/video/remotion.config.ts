import { Config } from "@remotion/cli/config";
import fs from "node:fs";

// Chromium préinstallé (pas de téléchargement). Adapter le chemin sur une autre machine.
const shell = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (fs.existsSync(shell)) Config.setBrowserExecutable(shell);
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setConcurrency(Number(process.env.CONCURRENCY || 3));
Config.setDelayRenderTimeoutInMilliseconds(1500000);
