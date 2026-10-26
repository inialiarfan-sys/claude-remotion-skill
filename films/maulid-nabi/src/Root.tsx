import React from "react";
import { Composition } from "remotion";
import { MaulidNabi } from "./Video";
import { Scene01BookOpening } from "./scenes/Scene01BookOpening";
import { Scene02AncientArabia } from "./scenes/Scene02AncientArabia";
import { Scene03BirthScene } from "./scenes/Scene03BirthScene";
import { Scene04KisraPalace } from "./scenes/Scene04KisraPalace";
import { Scene05PersianFire } from "./scenes/Scene05PersianFire";
import { Scene06MercyToWorlds } from "./scenes/Scene06MercyToWorlds";
import { Scene07Sources } from "./scenes/Scene07Sources";
import { FPS, HEIGHT, SLOTS, TOTAL_FRAMES, WIDTH } from "./timeline";
import { loadAssets } from "./assets";

loadAssets();

// individual scenes are registered too, for previewing and stills
const SCENES = [
  Scene01BookOpening,
  Scene02AncientArabia,
  Scene03BirthScene,
  Scene04KisraPalace,
  Scene05PersianFire,
  Scene06MercyToWorlds,
  Scene07Sources,
];

export const Root: React.FC = () => (
  <>
    <Composition id="MaulidNabi" component={MaulidNabi} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    {SCENES.map((C, i) => (
      <Composition
        key={i}
        id={`Scene0${i + 1}`}
        component={C}
        durationInFrames={SLOTS[i].dur}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ dur: SLOTS[i].dur }}
      />
    ))}
  </>
);
