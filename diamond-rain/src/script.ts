/**
 * Narration script, split into the 10 visual scenes.
 *
 * Each scene owns its own lines. Lines are timed automatically from
 * public/narration.mp3 (see src/timing.ts) — keep this text in sync with the
 * recording so the word-count split lines up with the voice.
 *
 * `pauseAfter` lets a line hold a longer beat (e.g. after the spoken title).
 * `onScreen: true` marks a line that the scene already shows as a big
 * on-screen statement, so the caption is hidden for it to avoid saying the
 * same words twice.
 */
export type ScriptLine = {
  text: string;
  onScreen?: boolean;
  /** Override the pause after this line (seconds). */
  pauseAfter?: number;
};
export type SceneId =
  | 'hook'
  | 'giants'
  | 'inside'
  | 'carbon'
  | 'methane'
  | 'rain'
  | 'lab'
  | 'honest'
  | 'earth'
  | 'ending';

export type ScriptScene = { id: SceneId; title: string; lines: ScriptLine[] };

const L = (...texts: string[]): ScriptLine[] => texts.map((text) => ({ text }));

export const SCRIPT: ScriptScene[] = [
  {
    id: 'hook',
    title: 'Hook',
    lines: [
      { text: 'The Planet That Rains Diamonds', onScreen: true, pauseAfter: 1.4 },
      ...L(
        'Imagine a planet where it rains diamonds.',
        'Yes, real diamonds!',
        'Imagine looking up at the sky and seeing diamonds falling from above.',
        'It sounds impossible, right?',
        'But scientists believe something like this could happen on two planets in our solar system.',
      ),
    ],
  },
  {
    id: 'giants',
    title: 'Neptune and Uranus',
    lines: L(
      'They are called Uranus and Neptune.',
      'These planets are very far from Earth.',
      'And they may be hiding one of the strangest secrets in space.',
      "Let's find out why.",
      "First, let's talk about Neptune and Uranus.",
      'Both planets are much bigger than Earth.',
    ),
  },
  {
    id: 'inside',
    title: 'Ice giants',
    lines: L(
      'They are also very cold on the outside.',
      'Scientists call them ice giants.',
      "But don't imagine a giant ball of normal ice.",
      'Deep inside these planets, things are very different.',
      'There is a lot of heat.',
      'There is also huge pressure.',
      'And this is where things get interesting.',
    ),
  },
  {
    id: 'carbon',
    title: 'Carbon',
    lines: L(
      'You probably know that diamonds are very valuable.',
      'But did you know that diamonds are made from carbon?',
      'Carbon is also found in many everyday things.',
      'For example, the black material inside a pencil contains carbon.',
      'So, how can carbon turn into a diamond?',
      'It needs the right conditions.',
      'Very high pressure and very high temperatures can change how carbon atoms are arranged.',
      'Deep inside Neptune and Uranus, these conditions may exist.',
    ),
  },
  {
    id: 'methane',
    title: 'Methane',
    lines: L(
      'Scientists think a gas called methane could break apart under these extreme conditions.',
      'Methane contains carbon.',
      'The carbon could then form tiny diamonds.',
      "And that's how the story of diamond rain begins.",
    ),
  },
  {
    id: 'rain',
    title: 'Diamond rain',
    lines: L(
      'Now, imagine something even more amazing.',
      'What happens after these tiny diamonds are formed?',
      'Scientists think they may slowly sink deeper into the planet.',
      'Why?',
      'Because diamonds are heavier than the material around them.',
      'Imagine rain falling from the sky.',
      'But instead of water, the rain is made of diamonds.',
      'And instead of falling onto the ground, these diamonds fall deeper and deeper into the planet.',
      'It is like an endless diamond storm hidden inside a giant world.',
      "Sounds crazy, doesn't it?",
    ),
  },
  {
    id: 'lab',
    title: 'Lab proof',
    lines: L(
      'But is this really possible?',
      'Scientists wanted to find out.',
      'So, they created special experiments in laboratories.',
      'They used powerful lasers to create conditions similar to those inside these planets.',
      'And something amazing happened.',
      'Tiny diamonds formed during the experiments.',
      'This gave scientists a reason to believe that diamond formation could happen inside Neptune and Uranus.',
    ),
  },
  {
    id: 'honest',
    title: 'Honest note',
    lines: [
      { text: 'However, there is one important thing to remember.' },
      { text: 'Nobody has actually seen diamond rain inside these planets.', onScreen: true },
      { text: 'It is still a scientific idea supported by experiments and research.' },
    ],
  },
  {
    id: 'earth',
    title: 'Earth comparison',
    lines: L(
      'Think about this for a moment.',
      'On Earth, diamonds are rare and expensive.',
      'People wear them as jewellery.',
      'Some are even kept in museums.',
      'But deep inside Neptune and Uranus, diamonds could be forming naturally.',
      'Something that is so special to us might be part of the normal process inside another planet.',
      'And we still have so much to learn about these strange worlds.',
    ),
  },
  {
    id: 'ending',
    title: 'Ending',
    lines: [
      ...L(
        'The universe is full of amazing things.',
        'Some planets may have storms bigger than anything on Earth.',
        'Some have winds faster than sound.',
        'And somewhere in the darkness of space, diamonds may be falling deep inside a giant planet.',
        'Space is truly amazing.',
      ),
      { text: 'And this is only the beginning.', onScreen: true },
    ],
  },
];
