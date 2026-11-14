# The Machines We Left Behind · C.U.R.I.O.

NASA Space Apps Challenge · Storytelling track
React 19 · Vite · Tailwind CSS v4 · Framer Motion · Lucide · Google `<model-viewer>` · Web Audio API

## Quick start

### Option A: no install (just look at it)
Double-click **`OPEN-ME.html`**. It's the whole app in one file and works in Chrome, Edge, Firefox or Safari on a laptop.
(Do **not** double-click `index.html`: that's the source page and needs the dev server.)

### Option B: run the project (for editing)
Needs **Node.js 18.18 or newer** (`node -v` to check).

```bash
npm install
npm run fetch-models   # downloads the 3 NASA .glb hero models into public/models (do this before the demo)
npm run dev            # open the address it prints, usually http://localhost:5173
```

Other commands:

```bash
npm run build              # site for hosting → dist/ (drag dist/ onto Netlify, or `vercel deploy`)
npm run build:standalone   # rebuilds OPEN-ME.html → dist-standalone/index.html
```

### If something fails
- **`crypto.hash is not a function` or "Vite requires Node.js…"**: your Node is too old. Install the LTS version from nodejs.org.
- **`Cannot find module @rollup/rollup-…` or `lightningcss…`**: delete `node_modules` and `package-lock.json`, then run `npm install` again.
- **Blank page**: you opened `index.html` directly. Use `OPEN-ME.html` or `npm run dev`.
- **3D panel says "Model feed offline"**: run `npm run fetch-models` (needs internet), then restart `npm run dev`.

## Why `npm run fetch-models` matters

The 3D models live on `assets.science.nasa.gov`. If that server doesn't allow cross-site downloads from your domain, `<model-viewer>` can't load them straight from NASA. The script saves local copies and writes `public/models/manifest.json`, and the app uses the local copy when one exists, falling back to the NASA URL otherwise. If both fail, the 3D panel shows a "Model feed offline" state with a link to the NASA page, and the rest of the app keeps working.

## Where each feature lives

| Feature | File |
|---|---|
| Sound engine (drone, typing clicks, radar pips, whoosh, buzz, chime, stamp thud + chord) | `src/audio/SoundEngine.js` |
| Mute toggle, profile/passport state (saved in localStorage) | `src/context/SoundContext.jsx`, `src/context/ProfileContext.jsx` |
| Top HUD bar (astronaut, stamps x/3, passport button, mute) | `src/components/HudBar.jsx` |
| "Initialize Comms" splash + airlock | `src/views/SplashView.jsx` |
| C.U.R.I.O. robot + live oscilloscope mouth | `src/components/CurioAvatar.jsx` |
| Typewriter dialogue (synced clicks, click to skip) | `src/components/Dialogue.jsx`, `src/hooks/useTypewriter.js` |
| Onboarding (name → passport → intro story) | `src/views/OnboardingView.jsx` |
| Destination cards (stamp Locked / Completed) | `src/views/HubView.jsx`, `src/components/PlanetOrb.jsx` |
| Warp travel + countdown | `src/components/Starfield.jsx`, `src/components/TravelOverlay.jsx` |
| Horizontal parallax surface, locked devices, hero radar, minimap | `src/views/SurfaceView.jsx`, `src/components/DeviceSilhouette.jsx` |
| Story screen: 3D panel + book, draggable divider, full-screen story | `src/views/StoryView.jsx` |
| The book: two-page spread or single page, page-turn animation, corners / keys / scroll / swipe | `src/components/Book.jsx` |
| What is printed on each page (title, chapter openers, text pages, memory check, stamp page) | `src/components/BookPages.jsx` |
| Clickable words with Wikipedia-style info cards | `src/components/TermCard.jsx`, `src/lib/wiki.js` |
| One picture per page, with spares, enlarge on click | `src/components/BookFigure.jsx`, `src/lib/figures.js` |
| The list of clickable words and the picture chosen for each page | `src/data/storyExtras.js` |
| 3D viewer, Blueprint mode, chapter camera moves, telemetry | `src/components/ModelPanel.jsx` |
| Memory-check quiz with C.U.R.I.O. hints | `src/components/Quiz.jsx` |
| STAMP SLAM animation (drop → impact → fly into passport) | `src/components/StampSlam.jsx` |
| Passport modal + Space Relic Historian certificate (print + PNG download) | `src/components/PassportModal.jsx`, `src/components/Certificate.jsx` |
| All story text, dates, coordinates, quiz, stamps, NASA URLs | `src/data/missionData.js` |

## The story book

- **Resize or hide the 3D panel:** drag the bar between the 3D model and the book. Click the bar, or press **Full-screen story**, to hide the model and read the book on the whole screen. With enough room the book opens as a two-page spread; otherwise it shows one page at a time. Phones start with the book full screen.
- **Turn pages:** click a page corner, the **Turn page** button, the arrow keys, the mouse wheel, or swipe on a touch screen. The numbered tabs under the book jump to a chapter.
- **Clickable words:** names of people, places and machines have a dotted underline. Hover or click to open a card. Each card has a short description written for this project (works offline). When the device is online it also loads the photo and the opening lines of the Wikipedia article, with a link to read more.
- **Pictures:** every page has one. Each is a specific item from the NASA Image and Video Library (IDs in `src/data/storyExtras.js`, checked on 2026-11-14). If a picture can't load, a spare is tried, and with no internet the page shows a drawing of the machine instead. Click a picture to enlarge it.
- **Memory check:** the last two pages. The quiz opens over the book and the stamp is pressed onto the final page.

To add a clickable word, add an entry to `GLOSSARY` in `src/data/storyExtras.js`: the exact words to match in the story text, a one- or two-sentence blurb, and the Wikipedia article title (or `null`). To change a picture, edit `FIGURES` in the same file.

## Sound design (no audio files)

Everything is synthesized live in `SoundEngine.js`:

- **Ambient drone:** detuned A-root oscillators (27.5–165 Hz) through a slowly breathing low-pass filter, plus band-passed "solar wind" noise. Starts on **Enter Airlock**.
- **Robot typing:** a band-passed noise relay click + a low "thock" per character, with an occasional square-wave telemetry blip on vowels. It runs on its own voice bus with an `AnalyserNode` that drives C.U.R.I.O.'s mouth.
- **Hover / click:** short sine radar pips.
- **Travel:** looping noise through a resonant low-pass sweep (110 Hz → 3.4 kHz → 80 Hz) with a gliding sub-bass rumble.
- **Wrong / right:** detuned square buzz ×2 / E-minor arpeggio chime.
- **Page turn:** band-passed noise swish with a few crinkles and a soft low thump as the page lands.
- **Stamp:** pitch-dropping kick + noise slap + inharmonic metal partials + ratchet clicks, then a detuned-saw Cmaj9 chord opening through a filter, with tremolo bells. A synthetic convolution reverb is generated in code.

Browsers only allow audio after a click, which is why the first screen is "Click to Initialize Comms."

## Changing content

Edit `src/data/missionData.js` for the story text, quiz and stamps, and `src/data/storyExtras.js` for clickable words and page pictures. Every NASA model URL is in the `ASSETS` block at the top of `missionData.js`. Device positions on the panoramas are `panoramaPosition.x` (0 to 1 across the track) and `.y` (0 to 1 down the screen).

## Notes for judges / NASA usage

- Fonts (Instrument Serif, JetBrains Mono, Inter) are bundled with the app, so nothing is loaded from Google.
- Info cards show text and images loaded live from Wikipedia (text under CC BY-SA, linked to the article). Nothing from Wikipedia is stored in the project.
- Images and 3D models: NASA, used under the [NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). No NASA logos or insignia are used. The mission patches are original SVG designs.
- The certificate is titled "Space Relic Historian" and says it is a NASA Space Apps Challenge project, not an official NASA document. That follows NASA's rule against implying endorsement.
- Voyager 1 (a locked Deep Space device) was added beyond the provided resource list for its live "one light-day from Earth" milestone on 2026-11-18. Swap it for Pioneer 11 in `missionData.js` if you must stay inside the list.
# CurioAppV2
