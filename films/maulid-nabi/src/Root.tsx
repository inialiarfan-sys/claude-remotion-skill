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
import { Chapter1 } from "./chapter1/Chapter1";
import { CH1_SLOTS, CH1_TOTAL } from "./chapter1/timeline";
import { Ch1Scene01Book } from "./chapter1/scenes/Ch1Scene01Book";
import { Ch1Scene02FirstYear } from "./chapter1/scenes/Ch1Scene02FirstYear";
import { Ch1Scene03BaniSaad } from "./chapter1/scenes/Ch1Scene03BaniSaad";
import { Ch1Scene04Abwa } from "./chapter1/scenes/Ch1Scene04Abwa";
import { Ch1Scene05AbdulMuttalib } from "./chapter1/scenes/Ch1Scene05AbdulMuttalib";
import { Ch1Scene06Market } from "./chapter1/scenes/Ch1Scene06Market";
import { Ch1Scene07Years } from "./chapter1/scenes/Ch1Scene07Years";
import { Ch1Scene08Youth } from "./chapter1/scenes/Ch1Scene08Youth";
import { Ch1Scene09NextChapter } from "./chapter1/scenes/Ch1Scene09NextChapter";
import { Chapter2 } from "./chapter2/Chapter2";
import { CH2_SLOTS, CH2_TOTAL } from "./chapter2/timeline";
import { Ch2Scene01Continuation } from "./chapter2/scenes/Ch2Scene01Continuation";
import { Ch2Scene02AbuTalib } from "./chapter2/scenes/Ch2Scene02AbuTalib";
import { Ch2Scene03Shepherd } from "./chapter2/scenes/Ch2Scene03Shepherd";
import { Ch2Scene04Syam } from "./chapter2/scenes/Ch2Scene04Syam";
import { Ch2Scene05AlAmin } from "./chapter2/scenes/Ch2Scene05AlAmin";
import { Ch2Scene06Reflection } from "./chapter2/scenes/Ch2Scene06Reflection";

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

// Bab 1 — Zaman Kanak-kanak (series: Perjalanan Hidup Rasulullah SAW)
const CH1_SCENES = [
  Ch1Scene01Book,
  Ch1Scene02FirstYear,
  Ch1Scene03BaniSaad,
  Ch1Scene04Abwa,
  Ch1Scene05AbdulMuttalib,
  Ch1Scene06Market,
  Ch1Scene07Years,
  Ch1Scene08Youth,
  Ch1Scene09NextChapter,
];

// Bab 2 — Zaman Remaja dan Kehidupan Sebelum Kenabian
const CH2_SCENES = [
  Ch2Scene01Continuation,
  Ch2Scene02AbuTalib,
  Ch2Scene03Shepherd,
  Ch2Scene04Syam,
  Ch2Scene05AlAmin,
  Ch2Scene06Reflection,
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
    <Composition id="Bab1ZamanKanakKanak" component={Chapter1} durationInFrames={CH1_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
    {CH1_SCENES.map((C, i) => (
      <Composition
        key={"ch1-" + i}
        id={`Bab1Scene0${i + 1}`}
        component={C}
        durationInFrames={CH1_SLOTS[i].dur}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ dur: CH1_SLOTS[i].dur }}
      />
    ))}
    <Composition id="Bab2ZamanRemaja" component={Chapter2} durationInFrames={CH2_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
    {CH2_SCENES.map((C, i) => (
      <Composition
        key={"ch2-" + i}
        id={`Bab2Scene0${i + 1}`}
        component={C}
        durationInFrames={CH2_SLOTS[i].dur}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ dur: CH2_SLOTS[i].dur }}
      />
    ))}
  </>
);
