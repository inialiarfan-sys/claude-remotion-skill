/**
 * Host placement zones.
 * Vertical: middle third of the screen, clear of the captions (y > ~1140),
 * TikTok's right-hand buttons (x > 910) and the top tabs.
 * Wide: lower-left or lower-right third, clear of the centred captions.
 */
export const hostSpot = (isV: boolean, side: 'left' | 'right' = 'right') =>
  isV
    ? { x: side === 'right' ? 760 : 250, y: 1110, height: 330 }
    : { x: side === 'right' ? 1700 : 220, y: 1000, height: 340 };

/** 3D camera field of view per format. */
export const fovFor = (isV: boolean, wide = 40) => (isV ? wide + 22 : wide);
