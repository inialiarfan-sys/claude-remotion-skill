import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
// WebGL for @remotion/three. "angle" uses the GPU when there is one;
// on a machine without a GPU, pass --gl=swangle on the command line.
Config.setChromiumOpenGlRenderer('angle');
