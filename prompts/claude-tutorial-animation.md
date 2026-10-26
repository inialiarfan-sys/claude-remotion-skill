# Prompt: "Hi, I'm Claude!" tutorial animation

Paste everything below the line into Claude Code inside this repo, so the
`remotion-motion-graphics` skill gets loaded.

---

Use the `remotion-motion-graphics` skill (read `SKILL.md`, `references/motion-patterns.md`
and `references/design-rules.md` before you write any code). Build a new composition
inside the existing `examples/` Remotion project. Follow every rule in the skill.

## Goal
A cute, friendly tutorial video in which a mascot named **"Clawdy"** (an original
character inspired by Claude) teaches beginners two things:
1. How to start a new chat properly
2. Step by step, how to connect Claude Code to a GitHub repo

## Specs
- Composition ID: `ClaudeTutorial`
- 1080×1920 (vertical, for Reels/Shorts/TikTok), 30 fps, about 45–55 s
- Files: `examples/src/tutorial/` (Tutorial.tsx, Clawdy.tsx, scenes/*.tsx, theme3.ts)
- Register it in `examples/src/Root.tsx` and add `"render:tutorial"` to `package.json`
- Everything is drawn in code (SVG/CSS). No emoji, no downloaded images, no
  official Anthropic logo and no copied claude.ai screenshots. The UI is a
  simplified illustration of it.

## Character: Clawdy
- A rounded, soft starburst/blob shape in warm terracotta (`#D97757`) with big,
  shiny oval eyes, small blush cheeks and a little smile
- Expressions as props: `happy`, `thinking`, `excited`, `wink`
- Idle: breathes (sin-wave scale 1→1.03) and blinks every ~2.5 s
- Moves with springs: hops into a scene with squash and stretch, points with a
  little arm/nub, waves hello
- Talks through speech bubbles that pop in (spring scale 0→1 with a small
  overshoot) and type the words in

## Look
- Palette: cream background `#F5F0E8`, ink `#1F1E1D`, hero color terracotta
  `#D97757`, soft accent `#E8DCC8`, GitHub-ish dark `#24292F` only in the GitHub scenes
- Fonts: rounded display font for headings (e.g. "Nunito" or "Fredoka" via
  `@remotion/google-fonts`), monospace for code/prompt text
- Five-layer stack in every scene: soft drifting mesh → UI mockup → Clawdy and text
  → light warm grade → light grain and vignette
- Step numbers as round badges ("1", "2", "3"…) that pop in

## Sound (synthesize it, no downloads)
Extend `examples/scripts/gen-sfx.mjs` (or create `gen-tutorial-sfx.mjs`) to generate
16-bit WAVs into `examples/public/sfx/tutorial/`:
- `pop.wav`: cute bubble pop (short sine with a fast pitch drop, ~80 ms), on every
  speech bubble and step badge
- `boop.wav`: soft high "boop" for button clicks
- `type.wav`: very short click for typing (play every 2–3 characters, quietly)
- `sparkle.wav`: rising chime for success moments
- `whoosh.wav`: soft noise whoosh between scenes
- A light, cheerful background loop (ukulele/marimba-like plucks at ~100 BPM,
  quiet, −18 dB under the SFX)
SFX must land exactly on the frame of the visual event (computed from `fps`).

## Storyboard

**Scene 1: Hello (0–4 s)**
Clawdy hops in with a squash, waves. Bubble: "Hi! I'm Clawdy" plus a waving hand (drawn in SVG,
not an emoji). Title pops in: "Using Claude the right way".

**Scene 2: Start a new chat (4–16 s)**
A simplified claude.ai window. Clawdy points at the "New chat" button → cursor
clicks it (boop) → empty chat appears.
Bubble: "One topic = one new chat. Old chats get long and confusing!"
Then a "good prompt" card builds line by line with typing sounds:
- (target icon) **Goal:** what you want
- (page icon) **Context:** files, background, who it's for
- (tick icon) **Format:** how the answer should look
Show a vague prompt (red cross) ("make video") vs a clear prompt (green tick) side by side; the
good one gets a sparkle. Clawdy: `excited`.

**Scene 3: Connect GitHub, step by step (16–42 s)**
Each step = badge pop + a short title + a UI mockup + Clawdy reacting.
1. "Go to claude.ai/code" (browser bar types the URL)
2. "Click Connect GitHub" (button click, boop)
3. "Authorize the Claude GitHub app" (GitHub-style dark permission card, green
   Authorize button)
4. "Pick your repo" (repo list, cursor selects one, check pops)
5. "Choose an environment" (small card with the default env selected)
6. "Type your task and hit Enter" (prompt types in: "Add a README section about
   install")
7. "Claude works on a new branch" (a branch line grows from `main`, commit dots
   pop on it)
8. "Review it and open a Pull Request" (PR card slides in, green "Open PR",
   sparkle + confetti dots in theme colors)
Keep each step on screen long enough to read (≥ 3 s), with a progress bar of 8
dots at the top.

**Scene 4: Recap and outro (42–50 s)**
Checklist with all three tips ticking in one by one (pop each).
Clawdy winks: "You're ready! Go build something cool." Fast exit, end card
"Made with Claude + Remotion".

## Definition of done
1. `npm run audio` and `npm run render:tutorial` work from `examples/` with no
   extra steps
2. Render, then extract frames from every scene (at least 12 frames, including
   the middle of each GitHub step) and LOOK at them. Fix spacing, overflow, text
   readability in the middle 75 % of the frame, missing clamps and layer order,
   then re-render. Repeat until clean.
3. Check that every pop/boop lines up with its visual (inspect the frame at each
   SFX time)
4. Run the checklist at the end of `references/design-rules.md`
5. Add a short "Claude tutorial" entry to `examples/README.md`, and add a GIF
   preview (≤ 5 MB) to `examples/videos/`. Don't commit `out/` or `node_modules/`
6. Commit with a clear message only once all of the above passes
