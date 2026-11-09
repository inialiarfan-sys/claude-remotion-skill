import type React from 'react';
import type { SceneId } from '../lib/timeline';
import { HookScene } from './Hook';
import { WelcomeScene } from './Welcome';
import { NameScene } from './Name';
import { ExoplanetsScene } from './Exoplanets';
import { DistanceScene } from './Distance';
import { TransitScene } from './Transit';
import { BlueScene } from './Blue';
import { GiantScene } from './Giant';
import { DayNightScene } from './DayNight';
import { WindsScene } from './Winds';
import { StormScene } from './Storm';
import { SmellScene } from './Smell';
import { RememberScene } from './Remember';
import { MarbleScene } from './Marble';
import { ThingScene } from './Thing';
import { EndingScene } from './Ending';

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  hook: HookScene,
  welcome: WelcomeScene,
  name: NameScene,
  exoplanets: ExoplanetsScene,
  distance: DistanceScene,
  transit: TransitScene,
  blue: BlueScene,
  giant: GiantScene,
  dayNight: DayNightScene,
  winds: WindsScene,
  storm: StormScene,
  smell: SmellScene,
  remember: RememberScene,
  marble: MarbleScene,
  thing: ThingScene,
  ending: EndingScene,
};
