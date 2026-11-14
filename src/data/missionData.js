/**
 * missionData.js
 * C.U.R.I.O. — Caretaker of Unheard Robots In Orbit
 * NASA Space Apps Challenge · Storytelling track
 *
 * Every NASA URL lives in ASSETS (top of file). Swap them there and the
 * rest of the app follows.
 *
 * Conventions
 *  - All machine-readable dates are UTC (ISO 8601). `dateDisplay` is for humans.
 *  - Coordinates: decimal degrees. Mars longitudes are planetocentric °E (0–360).
 *  - `{name}` in any string = the explorer's first name (use fillTemplate()).
 *  - `verified: true` = the URL/ID was checked against the NASA page it came from.
 *    `verified: false` = built from a documented NASA URL pattern; test before demo.
 */

/* ------------------------------------------------------------------ */
/* 0. HELPERS                                                          */
/* ------------------------------------------------------------------ */

export const fillTemplate = (text, vars = {}) =>
  String(text).replace(/\{(\w+)\}/g, (_, key) => (vars[key] ?? `{${key}}`));

/** NASA Image and Video Library item by NASA ID. */
const nasaImage = (nasaId, title, { verified = true, note } = {}) => ({
  source: "NASA Image and Video Library",
  nasaId,
  title,
  detailPage: `https://images.nasa.gov/details/${nasaId}`,
  // Returns JSON listing every real file for this ID (~orig, ~large, ~thumb).
  assetManifest: `https://images-api.nasa.gov/asset/${nasaId}`,
  // Usual pattern for the large JPG. If it 404s, read assetManifest instead.
  imageGuess: `https://images-assets.nasa.gov/image/${nasaId}/${nasaId}~large.jpg`,
  verified,
  ...(note ? { note } : {}),
});

/** Live search against the NASA Image and Video Library API. */
const imageSearch = (label, query) => ({
  label,
  query,
  api: `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`,
  web: `https://images.nasa.gov/search?q=${encodeURIComponent(query)}`,
});

/** JPL Photojournal item (PIA number). */
const photojournal = (pia, title) => ({
  source: "NASA/JPL Photojournal",
  pia,
  title,
  page: `https://photojournal.jpl.nasa.gov/catalog/${pia}`,
  verified: true,
});

/** A direct image file taken from an official NASA page. */
const directImage = (url, title, credit = "NASA") => ({
  source: "science.nasa.gov",
  url,
  title,
  credit,
  verified: true,
});

const nssdc = (cosparId) =>
  `https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=${cosparId}`;

/* ------------------------------------------------------------------ */
/* 1. ASSETS — every NASA URL in one place                             */
/* ------------------------------------------------------------------ */

export const ASSETS = {
  models: {
    apolloLunarModule: {
      label: "Apollo Lunar Module",
      glb: "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/apollo-lunar-module/Apollo%20Lunar%20Module.glb",
      sizeKB: 700,
      pageUrl: "https://science.nasa.gov/3d-resources/apollo-lunar-module/",
      github: "https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Apollo%20Lunar%20Module",
      credit: "NASA/Michael D. Carbajal",
      verified: true,
    },
    marsExplorationRover: {
      label: "Mars Exploration Rover (Spirit & Opportunity twin design)",
      glb: "https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/gltf_files/24883_MER_static.glb",
      usdz: "https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/usdz_files/24883_MER_static.usdz",
      sizeKB: 11630,
      pageUrl: "https://science.nasa.gov/resource/spirit-and-opportunity-rover-3d-model/",
      embed: "https://solarsystem.nasa.gov/gltf_embed/2370/",
      credit: "NASA/JPL-Caltech",
      verified: true,
      // Tiny fallback for slow venue Wi-Fi (36 KB, low-poly).
      lightweightFallback: {
        glb: "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-exploration-rover---opportunity-(mer-b)/Mars%20Exploration%20Rover%20-%20Opportunity%20(MER-B).glb",
        sizeKB: 36,
        pageUrl: "https://science.nasa.gov/3d-resources/mars-exploration-rover-opportunity-mer-b/",
        credit: "NASA/Ames Research Center",
        verified: true,
      },
    },
    pioneer10: {
      label: "Pioneer 10",
      glb: "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/pioneer-10/Pioneer%2010.glb",
      sizeKB: 1997,
      pageUrl: "https://science.nasa.gov/3d-resources/pioneer/",
      github: "https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Pioneer%2010",
      credit: "NASA/JPL/Eyes on the Solar System",
      verified: true,
    },
    vikingLander: {
      label: "Viking Lander",
      glb: "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/viking-lander/Viking%20Lander.glb",
      sizeKB: 1802,
      pageUrl: "https://science.nasa.gov/3d-resources/viking-lander/",
      github: "https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Viking%20Lander",
      credit: "NASA/Michael D. Carbajal",
      verified: true,
    },
    // No NASA .glb was found for these. Use a 2D silhouette sprite in the panorama.
    surveyor: null,
    lunarRovingVehicle: null,
    marsPathfinder: null,
    kepler: {
      label: "Kepler (1/33-scale printable)",
      glb: null,
      stlFolder: "https://science.nasa.gov/3d-resources/kepler-1-33-scale/",
      note: "Only STL print files on the current NASA page. Fine for a locked background device.",
      verified: true,
    },
    voyager: {
      label: "Voyager",
      glb: null,
      note: "NASA 3D Resources lists a Voyager.glb (1.72 MB) but its current asset URL was not confirmed. Search 'Voyager' at science.nasa.gov/3d-resources if you want it.",
      verified: false,
    },
  },

  panoramas: {
    moon: {
      suggestion: "Use a real Apollo 11 surface panorama as the scrolling ground.",
      searches: [
        imageSearch("Apollo 11 surface panorama", "Apollo 11 panorama Tranquility Base"),
        imageSearch("Apollo 11 lunar surface", "Apollo 11 lunar surface Eagle"),
      ],
    },
    mars: {
      suggestion: "Opportunity's own 'Lion King' panorama of Eagle Crater (sols 58–60). Real photo from the hero device.",
      image: directImage(
        "https://science.nasa.gov/wp-content/uploads/2024/03/sol058-to-060-lion-king-pia05755.jpg",
        "'Lion King' panorama, Eagle Crater, Opportunity sols 58 and 60",
        "NASA/JPL/Cornell"
      ),
      alternate: directImage(
        "https://science.nasa.gov/wp-content/uploads/2024/03/mars-pathfinder-presidential-panorama-lg.jpg",
        "Mars Pathfinder 'Presidential' panorama, Ares Vallis",
        "NASA/JPL"
      ),
    },
    deepSpace: {
      suggestion: "A starfield with the Milky Way band. No ground: fake 'horizontal sliding' with parallax star layers.",
      searches: [
        imageSearch("Milky Way panorama", "Milky Way panorama"),
        imageSearch("Pioneer 10 artwork", "Pioneer 10 spacecraft"),
      ],
    },
  },

  // Image library API: GET https://images-api.nasa.gov/search?q=... and /asset/{nasa_id}. No API key needed.
  apiPortal: "https://api.nasa.gov/",
  usageGuidelines: "https://www.nasa.gov/nasa-brand-center/images-and-media/", // NASA media usage guidelines
};

/* ------------------------------------------------------------------ */
/* 2. C.U.R.I.O. + ONBOARDING                                          */
/* ------------------------------------------------------------------ */

export const CURIO = {
  name: "C.U.R.I.O.",
  stands_for: "Caretaker of Unheard Robots In Orbit",
  personality:
    "Old, warm, a little creaky. Remembers cassette tapes. Makes small jokes, never talks down. Short sentences.",
  voiceNotes: "Typewriter text effect, 28ms per character. Occasional *whirr* or *click* sound cues.",
};

export const onboarding = {
  steps: [
    {
      id: "boot",
      sfx: "radio-static-click",
      text: "*click* ... *whirr* ... Oh! A visitor! Sorry, my speakers are a little dusty. Hello there.",
      next: "Hello!",
    },
    {
      id: "intro",
      text: "I'm C.U.R.I.O. That stands for Caretaker of Unheard Robots In Orbit. I've been around since the days of cassette tapes, so please be patient with my old circuits.",
      next: "Nice to meet you",
    },
    {
      id: "askName",
      text: "Before we go anywhere, every explorer on my list needs a name. What should I call you?",
      input: {
        type: "text",
        field: "name",
        placeholder: "Type your first name",
        maxLength: 16,
        fallbackIfEmpty: "Rookie",
        sanitize: "trim, strip HTML, keep letters/numbers/spaces/hyphens",
      },
      next: "That's me",
    },
    {
      id: "confirmName",
      text: "Astronaut {name}. Oh, I like the sound of that. I'm writing it down in permanent ink. Well... permanent pixels.",
      next: "What now?",
    },
    {
      id: "passport",
      ui: "showPassport",
      text: "This is your Space Explorer Passport. See those three empty squares? They're stamp slots. One for the Moon, one for Mars, one for Deep Space. You earn a stamp by hearing a machine's story and answering two questions about it. No free stamps. That's what makes them worth having.",
      next: "Got it",
    },
    {
      id: "whyMachines",
      text: "People always ask me: why did humans send machines first? Think about it. The Moon has no air to breathe. Mars gets colder than a freezer at night, and its dust storms can cover the whole planet. Deep space has no ground at all. Just cold, dark, and radiation that would make a person very sick.",
      next: "So, robots?",
    },
    {
      id: "machinesGoFirst",
      text: "So, robots. A machine doesn't need to breathe. It doesn't get homesick. And it can take a one-way ticket. Machines went ahead like scouts. Before anyone stood on the Moon, a lander called Surveyor 3 dug into the ground to check if it was fluffy powder or firm enough to hold a spaceship. It was firm, like wet sand. Two and a half years later, two astronauts landed right next to it.",
      next: "Then why leave them there?",
    },
    {
      id: "whyLeftBehind",
      text: "Good question. Every kilogram you bring home needs more fuel to lift it, and fuel is heavy too. Most of these machines were built for one-way trips. They did their jobs, their power ran low, and they stayed right where they stopped. A few are still working. Most went quiet a long time ago.",
      next: "That's kind of sad",
    },
    {
      id: "curioJob",
      text: "A little. That's why I have this job. I visit them, I collect their stories, and I make sure somebody still knows their names. Today, that somebody is you.",
      next: "How does it work?",
    },
    {
      id: "howToPlay",
      ui: "showControlsHint",
      text: "On each world, slide sideways across the ground. You'll spot a few old machines. Most of their signals are locked, so I can't open their stories yet. One of them will answer. Click it, listen, then pass my quiz to earn your stamp.",
      next: "Let's go!",
    },
    {
      id: "launch",
      ui: "launchTransition",
      sfx: "countdown",
      text: "Seatbelt on, Astronaut {name}. First stop: the Moon. Countdown in 3... 2... 1...",
      next: null,
    },
  ],

  passport: {
    title: "SPACE EXPLORER PASSPORT",
    issuedBy: "C.U.R.I.O. Office of Unheard Robots",
    holderLabel: "Astronaut {name}",
    numberFormat: "CURIO-XXXX (4 random digits, generated at runtime)",
    issueDate: null, // set at runtime: new Date().toISOString()
    slots: [
      { slot: 1, destinationId: "moon", label: "THE MOON", emptyText: "Awaiting signal..." },
      { slot: 2, destinationId: "mars", label: "MARS", emptyText: "Awaiting signal..." },
      { slot: 3, destinationId: "deepSpace", label: "DEEP SPACE", emptyText: "Awaiting signal..." },
    ],
  },

  finale: {
    text: [
      "Three stamps. Astronaut {name}, your passport is full.",
      "Eagle is still sitting in the Sea of Tranquility. Opportunity is still parked in Perseverance Valley. Pioneer 10 is still heading for a red star it won't reach for two million years.",
      "They're not lost anymore. You know their stories now. That's all a forgotten machine really needs.",
      "Come back anytime. I'll keep the static warm.",
    ],
    actions: ["Download my passport", "Start over"],
  },
};

/* Shared HUD copy for locked devices */
export const LOCKED_HUD = {
  statuses: {
    TELEMETRY_LOST: { label: "TELEMETRY LOST", color: "#FF5A4E" },
    SIGNAL_LOCKED: { label: "SIGNAL LOCKED", color: "#F5B83D" },
  },
  footer: "Decryption key not found in this mission. Story archived for a future update.",
  blinkRateMs: 900,
};

/* ------------------------------------------------------------------ */
/* 3. DESTINATIONS                                                     */
/* ------------------------------------------------------------------ */

const moon = {
  id: "moon",
  order: 1,
  name: "The Moon",
  surfaceName: "Sea of Tranquility (Mare Tranquillitatis)",
  panorama: ASSETS.panoramas.moon,
  arrival:
    "Welcome to the Moon, Astronaut {name}. No air, no wind, no sound. Footprints here can last for millions of years. Slide along and see what's been left behind.",
  departure:
    "Stamp collected! Next stop: Mars. Hold on, it's a lot farther. Like, a LOT farther.",

  heroDevice: {
    id: "apollo11-eagle",
    name: "Apollo 11 Lunar Module 'Eagle'",
    shortName: "Eagle",
    whatYouSee: "Eagle's descent stage (the bottom half), still standing where it landed",
    inProvidedList: true,
    nssdcId: "1969-059C",
    nssdcUrl: nssdc("1969-059C"),
    model: ASSETS.models.apolloLunarModule,
    modelNote:
      "The NASA model shows the full two-stage LM. For chapter 4, hide or fade the upper (ascent) stage if your viewer allows; only the descent stage remains on the Moon.",
    panoramaPosition: { x: 0.58, y: 0.66, scale: 1.0 },
    hotspotLabel: "SIGNAL FOUND · EAGLE",
    heroIntro:
      "Signal found! This one's special, Astronaut {name}. See that gold, spidery thing on four legs? That's what's left of Eagle, the spaceship that carried the first two people down to the Moon. Want to hear how it got here?",

    chapters: [
      {
        number: 1,
        title: "A Ship for One Place Only",
        paragraphs: [
          "It all started when Tom Kelly, an engineer at Grumman Aircraft in Bethpage, New York, was handed a puzzle nobody had ever solved: build a spaceship that could land two people on the Moon and lift them off again. On November 7, 1962, NASA picked Grumman's plan. Kelly's tiny team grew to more than 7,000 people.",
          "This ship would never fly through air. It would never land on Earth. It couldn't even be test-flown on the real Moon before the big day. So it didn't need wings or a pointy nose. It ended up looking like a gold-wrapped spider standing on four legs.",
          "Every extra kilogram needed extra fuel to carry it, so the team fought over every gram: thinner walls, lighter wires, fewer bolts. The finished lander was really two ships stacked together. The bottom half would land. The top half would leave.",
        ],
        curioAside:
          "NASA called Tom Kelly the 'Father of the Lunar Module.' I call him the man who built a spaceship with its own launch pad. Remember that bottom half. It matters later.",
        modelFocus: { cameraOrbit: "35deg 70deg 9m", highlight: "full vehicle" },
        metadata: {
          dateUTC: "1962-11-07",
          dateDisplay: "November 7, 1962 (contract signed January 14, 1963)",
          location: {
            name: "Grumman Aircraft Engineering Corporation, Bethpage, New York, USA",
            body: "Earth",
            lat: 40.744,
            lon: -73.482,
            approximate: true,
          },
          missionSpecs: {
            vehicle: "Lunar Module LM-5 'Eagle' (Apollo 11)",
            builder: "Grumman Aircraft Engineering Corporation",
            workforce: "more than 7,000 engineers at peak",
            launchMassKg: 15103,
            stages: "Descent stage (landed, stayed) + ascent stage (carried crew back to orbit)",
            lmsBuiltByGrumman: 13,
          },
          people: [
            { name: "Thomas J. Kelly (1929–2002)", role: "Grumman LM chief engineer, 'Father of the Lunar Module'" },
            { name: "Joseph G. Gavin Jr.", role: "Grumman LM Program Director, 1962–1972" },
          ],
          images: {
            verified: [],
            searches: [
              imageSearch("Tom Kelly / Grumman engineers", "Grumman lunar module engineers"),
              imageSearch("LM being built", "lunar module LM-5 Grumman Bethpage"),
              imageSearch("LM design drawings", "Apollo lunar module diagram"),
            ],
          },
          model: { ref: "apolloLunarModule", glb: ASSETS.models.apolloLunarModule.glb },
          sources: [
            "https://www.cradleofaviation.org/history/history/lunar-module.html",
            "https://about.proquest.com/en/blog/2019/the-apollo-lunar-module-part-one",
            nssdc("1969-059C"),
          ],
        },
      },
      {
        number: 2,
        title: "Twelve Minutes, Two Alarms",
        paragraphs: [
          "On July 20, 1969, Eagle let go of its mother ship, Columbia, and dropped toward the Sea of Tranquility. Michael Collins stayed behind in orbit. Neil Armstrong and Buzz Aldrin flew down standing up. There were no seats, only straps and two small triangle-shaped windows.",
          "Partway down, an alarm went off: 1202. Then another: 1201. The computer was overloaded. In Mission Control, flight controller Steve Bales turned to engineer Jack Garman, who had made a cheat sheet of every alarm code. Garman knew these meant 'busy,' not 'broken.' The software, written by Margaret Hamilton's team at MIT, was built to drop small jobs and keep the important ones running. The answer went up to the Moon: go.",
          "Then Armstrong looked out and saw the landing spot was covered in boulders. He took more control and flew Eagle onward, hunting for flat ground while the fuel ran low. At 20:17:40 UT, Eagle's feet touched dust. 'Houston, Tranquility Base here. The Eagle has landed.' They had less than a minute of landing fuel to spare.",
        ],
        curioAside:
          "Lots of people helped land Eagle without ever leaving Earth. Some of them were in their twenties. That's not much older than you'll be in ten years.",
        modelFocus: { cameraOrbit: "0deg 85deg 7m", highlight: "descent engine and footpads" },
        metadata: {
          dateUTC: "1969-07-20T20:17:40Z",
          dateDisplay: "July 20, 1969 · 4:17 p.m. EDT",
          location: {
            name: "Tranquility Base, Mare Tranquillitatis",
            body: "Moon",
            lat: 0.67416,
            lon: 23.47314,
          },
          missionSpecs: {
            launch: "1969-07-16, Saturn V, Kennedy Space Center",
            alarms: ["1202", "1201"],
            crew: ["Neil A. Armstrong (Commander)", "Edwin E. 'Buzz' Aldrin Jr. (LM Pilot)"],
            inOrbit: "Michael Collins (Command Module 'Columbia')",
            descentEngine: "Throttleable, so the LM could slow down and hover while choosing a spot",
          },
          people: [
            { name: "Neil Armstrong", role: "Commander, flew the final approach" },
            { name: "Buzz Aldrin", role: "Lunar Module Pilot" },
            { name: "Michael Collins", role: "Command Module Pilot, in orbit" },
            { name: "Steve Bales", role: "Guidance officer, Mission Control" },
            { name: "Jack Garman", role: "Computer support engineer, knew the alarm codes" },
            { name: "Margaret Hamilton", role: "Led software engineering for the Apollo guidance computer at MIT" },
          ],
          images: {
            verified: [
              nasaImage("6900992", "Eagle heads down to the Moon while Michael Collins stays in orbit"),
              nasaImage("S69-39593", "Mission Control in Houston during Apollo 11's moonwalk"),
            ],
            searches: [
              imageSearch("Mission Control during landing", "Apollo 11 mission control landing"),
              imageSearch("Margaret Hamilton", "Margaret Hamilton Apollo software"),
              imageSearch("Eagle in lunar orbit", "Apollo 11 lunar module Eagle lunar orbit"),
            ],
          },
          model: { ref: "apolloLunarModule", glb: ASSETS.models.apolloLunarModule.glb },
          sources: [nssdc("1969-059C")],
        },
      },
      {
        number: 3,
        title: "Mirrors in the Dust",
        paragraphs: [
          "At 02:56 UT on July 21, Neil Armstrong stepped off Eagle's ladder onto the Moon. Buzz Aldrin followed about 20 minutes later. They had about two and a half hours outside and a long to-do list.",
          "One job was a small panel, about 60 centimeters across, holding 100 glass corner cubes. Each cube works like the corner of a room made of glass: shine light into it from almost any angle, and the light bounces straight back to where it came from. Physicist James Faller had proposed the idea years earlier. If it worked, a laser fired from Earth could hit the Moon and come home.",
          "They also set up a seismometer to feel moonquakes, scooped up rocks and soil, and took photos that would become some of the most famous pictures ever made. On Eagle's front leg, next to the ladder, was a steel plaque. Its last line read: 'We came in peace for all mankind.'",
        ],
        curioAside:
          "A mirror that needs no batteries, no fuel, and no software updates. I'm a little jealous.",
        modelFocus: { cameraOrbit: "-20deg 80deg 6m", highlight: "front leg and ladder (plaque location)" },
        metadata: {
          dateUTC: "1969-07-21T02:56:15Z",
          dateDisplay: "July 21, 1969 UT (evening of July 20 in the USA)",
          location: {
            name: "Tranquility Base, Mare Tranquillitatis",
            body: "Moon",
            lat: 0.67416,
            lon: 23.47314,
          },
          missionSpecs: {
            moonwalkLength: "about 2 hours 31 minutes",
            experimentsLeft: "EASEP: passive seismometer + lunar dust detector; plus the Laser Ranging Retroreflector (LRRR)",
            lrrr: "100 fused-silica corner cubes, no power needed, set up a few meters from the seismometer",
            plaque: "Stainless steel, mounted on the ladder leg",
          },
          people: [
            { name: "Neil Armstrong", role: "First person on the Moon" },
            { name: "Buzz Aldrin", role: "Set up EASEP experiments" },
            { name: "James Faller", role: "Proposed the laser retroreflector experiment" },
            { name: "Carroll Alley", role: "Principal investigator, Laser Ranging Retroreflector" },
          ],
          images: {
            verified: [
              nasaImage("as11-40-5903", "Buzz Aldrin near Eagle's leg (Armstrong reflected in visor)"),
              nasaImage("as11-40-5927", "Aldrin unloading the EASEP experiments from Eagle"),
              nasaImage("as11-40-5948", "Aldrin with the seismometer and the laser mirror panel; the flag and Eagle behind"),
              nasaImage("as11-40-5899", "The plaque on Eagle's ladder leg"),
            ],
            searches: [imageSearch("Apollo 11 experiments", "Apollo 11 EASEP seismometer")],
          },
          model: { ref: "apolloLunarModule", glb: ASSETS.models.apolloLunarModule.glb },
          sources: [nssdc("1969-059C"), "https://www.jpl.nasa.gov/news/apollo-11-experiment-still-going-strong-after-35-years/"],
        },
      },
      {
        number: 4,
        title: "The Half That Stayed",
        paragraphs: [
          "At 17:54 UT on July 21, 1969, the top half of Eagle fired its engine and shot upward. The bottom half stayed put. It had become a launch pad, exactly as Tom Kelly's team had planned. As they rose, Buzz Aldrin saw the blast knock their flag over.",
          "Up in orbit, Michael Collins snapped a photo of the little top half flying back to him, with Earth rising over the Moon's edge. People like to say that every human alive at that moment, except Collins himself, was somewhere in that picture.",
          "The bottom half is still there today, in the Sea of Tranquility, with the plaque, the experiments, and their bootprints all around. NASA's Lunar Reconnaissance Orbiter has photographed it from above. And that mirror panel? Observatories on Earth still fire lasers at it. Dust has dimmed it, but it still sends light back, and scientists use it to measure that the Moon drifts about 3.8 centimeters farther from Earth every year. Eagle stopped flying in 1969. Its campsite never stopped working.",
        ],
        curioAside:
          "So why was Eagle left behind? It had to be. It was the launch pad. Every trip home started by leaving half the ship on the Moon.",
        modelFocus: { cameraOrbit: "45deg 75deg 8m", highlight: "descent stage only (hide ascent stage)" },
        metadata: {
          dateUTC: "1969-07-21T17:54:01Z",
          dateDisplay: "July 21, 1969 · liftoff from the Moon",
          location: {
            name: "Tranquility Base, Mare Tranquillitatis",
            body: "Moon",
            lat: 0.67416,
            lon: 23.47314,
          },
          missionSpecs: {
            timeOnSurface: "about 21.5 hours",
            leftOnSurface: "Descent stage, EASEP, Laser Ranging Retroreflector, plaque, US flag, packet of memorial items",
            ascentStageFate: "Jettisoned into lunar orbit after docking; final fate unknown",
            stillOperating: "Laser Ranging Retroreflector (the only Apollo 11 experiment still in use)",
            moonRecession: "about 3.8 cm per year, measured with lunar laser ranging",
          },
          people: [
            { name: "Michael Collins", role: "Photographed Eagle's return (AS11-44-6642)" },
            { name: "Buzz Aldrin", role: "Saw the flag fall at liftoff" },
          ],
          images: {
            verified: [
              nasaImage("as11-44-6642", "Eagle's ascent stage returning to Columbia, Earth above the horizon (photo: Michael Collins)"),
            ],
            searches: [
              imageSearch("LRO view of the landing site", "Lunar Reconnaissance Orbiter Apollo 11 landing site"),
              imageSearch("Lunar laser ranging today", "lunar laser ranging"),
            ],
          },
          model: { ref: "apolloLunarModule", glb: ASSETS.models.apolloLunarModule.glb },
          sources: [
            nssdc("1969-059C"),
            "https://science.nasa.gov/resource/eagles-return",
            "https://jila-pfc.colorado.edu/news-events/news/apollo-11s-last-working-experiment-moon",
          ],
        },
      },
    ],

    missionQuiz: {
      intro: "Quiz time, Astronaut {name}! Two questions. Get both right and this stamp is yours.",
      passScore: 2,
      allowRetry: true,
      questions: [
        {
          id: "moon-q1",
          relatedChapter: 1,
          question: "Why was Eagle built as two ships stacked together?",
          options: [
            { id: "a", text: "The bottom half landed and became a launch pad, the top half flew the astronauts home" },
            { id: "b", text: "Each astronaut got their own half" },
            { id: "c", text: "The top half was a spare, in case the bottom half broke" },
            { id: "d", text: "One half carried food, the other carried the flag" },
          ],
          correctOptionId: "a",
          wrongHints: {
            b: "Ha! Neil and Buzz rode down together, standing side by side. Think about which half stayed on the Moon.",
            c: "Not a spare. Both halves had a job. One of them had to stay behind for the other to leave.",
            d: "Snacks were on board, but that's not why. Think: what did the top half need to push against at liftoff?",
          },
          correctMessage: "Exactly right! The bottom half did its job one last time as a launch pad. That's why it's still there.",
        },
        {
          id: "moon-q2",
          relatedChapter: 3,
          question: "What did Neil and Buzz set up that scientists still use today?",
          options: [
            { id: "a", text: "A solar-powered radio tower" },
            { id: "b", text: "A panel of glass corner cubes that bounces lasers back to Earth" },
            { id: "c", text: "A camera that still streams live video" },
            { id: "d", text: "A weather station that measures moon wind" },
          ],
          correctOptionId: "b",
          wrongHints: {
            a: "Close in spirit, but this thing needs no power at all. It works like a mirror.",
            c: "I wish! No camera from 1969 is still running up there. Think: what needs no batteries?",
            d: "Trick option: the Moon has no air, so there's no wind to measure. Think about lasers.",
          },
          correctMessage: "Yes! 100 little glass corners, no batteries, and still answering lasers more than 50 years later.",
        },
      ],
    },

    stampReward: {
      stampSlot: 1,
      title: "Lunar Relic Archivist",
      subtitle: "Keeper of Tranquility Base",
      unlockCode: "EAGLE-0720",
      unlockCodeMeaning: "Eagle landed on July 20 (07/20), 1969",
      historicalDate: "1969-07-20",
      awardedAt: null, // set at runtime: new Date().toISOString()
      stampText: "VISA · MOON · TRANQUILITY BASE · 20 JUL 1969",
      ink: { color: "#C9CED6", rotationDeg: -6, opacity: 0.92 },
      patch: {
        shape: "circle",
        sizePx: 200,
        palette: {
          rim: "#D4A537",
          sky: "#0B0D12",
          ground: "#8A8F98",
          craters: "#6E737B",
          lander: "#D4A537",
          ascent: "#C9CED6",
          earth: "#3B7BD4",
        },
        elements: [
          "Gold outer ring with 'LUNAR RELIC ARCHIVIST' curved along the top",
          "Black sky, gray lunar ground curving across the bottom",
          "Simplified four-legged lander (gold descent stage, silver ascent stage)",
          "Small blue Earth, half in shadow, upper right",
          "Tiny 4×3 grid square at lower left = the laser mirror panel",
        ],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Lunar Relic Archivist patch">
  <defs>
    <clipPath id="moonInner"><circle cx="100" cy="100" r="80"/></clipPath>
  </defs>
  <circle cx="100" cy="100" r="98" fill="#D4A537"/>
  <circle cx="100" cy="100" r="80" fill="#0B0D12"/>
  <g font-family="Courier New, monospace" font-size="12" font-weight="700" fill="#0B0D12" text-anchor="middle">
    <text x="23.5" y="54.5" transform="rotate(-59.2 23.5 54.5)" dy="4">L</text><text x="28.6" y="46.8" transform="rotate(-53.3 28.6 46.8)" dy="4">U</text><text x="34.5" y="39.7" transform="rotate(-47.4 34.5 39.7)" dy="4">N</text><text x="41.1" y="33.3" transform="rotate(-41.5 41.1 33.3)" dy="4">A</text><text x="48.3" y="27.6" transform="rotate(-35.5 48.3 27.6)" dy="4">R</text><text x="64.2" y="18.5" transform="rotate(-23.7 64.2 18.5)" dy="4">R</text><text x="72.8" y="15.2" transform="rotate(-17.8 72.8 15.2)" dy="4">E</text><text x="81.7" y="12.9" transform="rotate(-11.8 81.7 12.9)" dy="4">L</text><text x="90.8" y="11.5" transform="rotate(-5.9 90.8 11.5)" dy="4">I</text><text x="100.0" y="11.0" transform="rotate(0.0 100.0 11.0)" dy="4">C</text><text x="118.3" y="12.9" transform="rotate(11.8 118.3 12.9)" dy="4">A</text><text x="127.2" y="15.2" transform="rotate(17.8 127.2 15.2)" dy="4">R</text><text x="135.8" y="18.5" transform="rotate(23.7 135.8 18.5)" dy="4">C</text><text x="144.0" y="22.6" transform="rotate(29.6 144.0 22.6)" dy="4">H</text><text x="151.7" y="27.6" transform="rotate(35.5 151.7 27.6)" dy="4">I</text><text x="158.9" y="33.3" transform="rotate(41.5 158.9 33.3)" dy="4">V</text><text x="165.5" y="39.7" transform="rotate(47.4 165.5 39.7)" dy="4">I</text><text x="171.4" y="46.8" transform="rotate(53.3 171.4 46.8)" dy="4">S</text><text x="176.5" y="54.5" transform="rotate(59.2 176.5 54.5)" dy="4">T</text>
  </g>
  <g clip-path="url(#moonInner)">
    <circle cx="40" cy="45" r="1.2" fill="#F4F1E8"/><circle cx="70" cy="35" r="1" fill="#F4F1E8"/>
    <circle cx="120" cy="40" r="1.3" fill="#F4F1E8"/><circle cx="60" cy="70" r="0.9" fill="#F4F1E8"/>
    <ellipse cx="100" cy="200" rx="140" ry="62" fill="#8A8F98"/>
    <ellipse cx="55" cy="156" rx="9" ry="3" fill="#6E737B"/>
    <ellipse cx="150" cy="166" rx="6" ry="2" fill="#6E737B"/>
  </g>
  <circle cx="142" cy="58" r="11" fill="#3B7BD4"/>
  <path d="M142 47 a11 11 0 0 0 0 22 a7 11 0 0 1 0 -22z" fill="#0B0D12" opacity="0.75"/>
  <path d="M88 112 L91 98 L109 98 L112 112 Z" fill="#C9CED6"/>
  <rect x="80" y="112" width="40" height="16" fill="#D4A537"/>
  <g stroke="#D4A537" stroke-width="3" stroke-linecap="round">
    <line x1="82" y1="127" x2="68" y2="144"/><line x1="118" y1="127" x2="132" y2="144"/>
    <line x1="92" y1="128" x2="88" y2="146"/><line x1="108" y1="128" x2="112" y2="146"/>
  </g>
  <g fill="#C9CED6"><rect x="62" y="143" width="10" height="3"/><rect x="128" y="143" width="10" height="3"/></g>
  <g fill="#C9CED6" opacity="0.9">
    <rect x="46" y="136" width="14" height="10"/>
  </g>
  <g stroke="#0B0D12" stroke-width="0.8">
    <line x1="49.5" y1="136" x2="49.5" y2="146"/><line x1="53" y1="136" x2="53" y2="146"/><line x1="56.5" y1="136" x2="56.5" y2="146"/>
    <line x1="46" y1="139.3" x2="60" y2="139.3"/><line x1="46" y1="142.6" x2="60" y2="142.6"/>
  </g>
</svg>`,
      },
    },
  },

  backgroundDevices: [
    {
      id: "surveyor-3",
      name: "Surveyor 3",
      inProvidedList: true,
      missionPage: "https://science.nasa.gov/mission/surveyor-3/",
      nssdcUrl: nssdc("1967-035A"),
      model: ASSETS.models.surveyor,
      sprite: "Three-legged lander with a tall mast and a scoop arm. 2D silhouette.",
      panoramaPosition: { x: 0.22, y: 0.7, scale: 0.6 },
      hud: {
        status: "TELEMETRY_LOST",
        code: "ERR-05041967",
        lastContactUTC: "1967-05-04",
        readout: [
          "LANDED: 1967-04-20 00:04:17 UT",
          "LOC: 3.00°S, 23.41°W · Oceanus Procellarum",
          "EVENT: bounced twice before settling (engine didn't cut off)",
          "TV FRAMES SENT: 6,326",
          "VISITED: 1969-11-20 by Apollo 12 (Conrad & Bean), ~180 m away",
        ],
        curioWhisper: "This little scout tested the ground so astronauts could land. Its story is locked for now.",
      },
      images: [
        directImage(
          "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/07/as12-48-7134_1280.jpg",
          "Apollo 12 astronaut with Surveyor 3, Lunar Module Intrepid in the background (AS12-48-7134)"
        ),
      ],
      teaserForFutureUpdate:
        "The only robot on the Moon ever visited by humans. Astronauts took its camera and scoop home to see what 31 months on the Moon had done to them.",
    },
    {
      id: "apollo15-lrv",
      name: "Apollo 15 Lunar Roving Vehicle",
      inProvidedList: true,
      note: "Part of the Apollo 15 'Falcon' / ALSEP record you provided (NSSDCA 1971-063C).",
      nssdcUrl: nssdc("1971-063C"),
      model: ASSETS.models.lunarRovingVehicle,
      sprite: "Open four-wheeled moon car with a dish antenna. 2D silhouette.",
      panoramaPosition: { x: 0.84, y: 0.72, scale: 0.55 },
      hud: {
        status: "SIGNAL_LOCKED",
        code: "LRV-1 · KEY MISSING",
        lastContactUTC: "1971-08-02",
        readout: [
          "SITE: Hadley–Apennine, 26.13°N, 3.63°E",
          "CREW: David R. Scott & James B. Irwin",
          "DISTANCE DRIVEN: 27.9 km over 3 moonwalks",
          "LEFT ON SURFACE: rover, descent stage, ALSEP",
          "ALSEP SHUT DOWN: 1977-09-30",
        ],
        curioWhisper: "The first car on the Moon. Somebody parked it here and never came back for the keys.",
      },
      images: [],
      teaserForFutureUpdate:
        "Folded up like a lawn chair for the trip, then unfolded on the Moon. Its astronauts also left a small memorial for 14 explorers who died.",
    },
  ],
};

const mars = {
  id: "mars",
  order: 2,
  name: "Mars",
  surfaceName: "Meridiani Planum",
  panorama: ASSETS.panoramas.mars,
  arrival:
    "Welcome to Mars, Astronaut {name}. Butterscotch sky, rusty ground, and a lot of dust. Watch your step. Some of these machines have been waiting a long time.",
  departure:
    "Two stamps! Now for the scariest stop: Deep Space. No ground, no air, no map. I'll hold the flashlight.",

  heroDevice: {
    id: "mer-b-opportunity",
    name: "Mars Exploration Rover 'Opportunity' (MER-B)",
    shortName: "Opportunity",
    nickname: "Oppy",
    inProvidedList: true,
    missionPage: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
    nssdcId: "2003-032A",
    nssdcUrl: nssdc("2003-032A"),
    model: ASSETS.models.marsExplorationRover,
    modelNote:
      "Spirit and Opportunity were identical twins, so this NASA/JPL model is Opportunity. Add a dust-tint shader (#C27A4A, ~35%) for chapter 4.",
    panoramaPosition: { x: 0.52, y: 0.7, scale: 1.0 },
    hotspotLabel: "SIGNAL FOUND · OPPORTUNITY",
    heroIntro:
      "Careful now. Dusty solar panels, six wheels, a camera on a tall neck. This is Opportunity. Her team called her Oppy. She was built to last three months. Guess how long she lasted? Don't guess yet. Listen first.",

    chapters: [
      {
        number: 1,
        title: "A Question and a Name",
        paragraphs: [
          "It all started when Steve Squyres, a planetary scientist at Cornell University, couldn't stop wondering about one thing: did Mars ever have water? For years he and his team designed robot geologists to find out. Some of their plans were turned down. A mission they hoped to fly on was canceled. They kept redrawing and rebuilding. In 2000, NASA finally said yes, and not to one rover but two.",
          "The twins needed names. NASA asked students across the United States, and nearly 10,000 sent ideas. The winner was Sofi Collis, a 9-year-old third grader from Arizona. She had been born in Siberia and lived in an orphanage before she was adopted. At night there, she used to look up at the stars, and it made her feel better. Her essay ended with a thank-you: 'Thank you for the Spirit and the Opportunity.'",
          "On June 8, 2003, NASA announced her names. Each rover was about the size of a golf cart, ran on solar power, and carried a robotic arm with a tiny rock grinder. Its warranty: 90 Martian days.",
        ],
        curioAside:
          "A 9-year-old named two Mars rovers. If you ever think of a good name for a robot, write it down. You never know.",
        modelFocus: { cameraOrbit: "30deg 70deg 4m", highlight: "full rover, solar panels" },
        metadata: {
          dateUTC: "2003-06-08",
          dateDisplay: "June 8, 2003 · names announced",
          location: {
            name: "NASA Jet Propulsion Laboratory, Pasadena, California, USA (rover team home)",
            body: "Earth",
            lat: 34.2013,
            lon: -118.1714,
            approximate: true,
          },
          missionSpecs: {
            roverMassKg: 185,
            size: "about the size of a golf cart",
            power: "Solar panels + rechargeable batteries",
            wheels: 6,
            plannedMission: "90 sols (Martian days), about 1 km of driving",
            scienceTools: ["Pancam", "Microscopic Imager", "Mössbauer spectrometer", "APXS", "Rock Abrasion Tool (RAT)", "Mini-TES"],
            namingContest: "Nearly 10,000 student entries; run by NASA with The Planetary Society and LEGO",
          },
          people: [
            { name: "Steve Squyres", role: "Principal investigator for the rovers' science instruments, Cornell University" },
            { name: "Sofi Collis", role: "Age 9, wrote the winning naming essay" },
          ],
          images: {
            verified: [
              directImage(
                "https://science.nasa.gov/wp-content/uploads/2024/03/mer-bythenumbers-infographic-feb2019.jpg",
                "Spirit & Opportunity by the numbers (NASA infographic, Feb 2019)",
                "NASA/JPL-Caltech"
              ),
            ],
            searches: [
              imageSearch("Steve Squyres", "Steve Squyres Mars rover"),
              imageSearch("Rovers being built", "Mars Exploration Rover assembly JPL"),
            ],
          },
          model: { ref: "marsExplorationRover", glb: ASSETS.models.marsExplorationRover.glb },
          sources: [
            "https://www.astronomy.com/?p=43509",
            "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
          ],
        },
      },
      {
        number: 2,
        title: "A Hole in One, 456 Million Kilometers Long",
        paragraphs: [
          "Opportunity launched from Cape Canaveral late on July 7, 2003, and spent about six and a half months crossing space. On January 25, 2004, it hit the top of the Martian sky at about 19,000 kilometers per hour. A heat shield took the burning heat, a parachute opened, small rockets fired, and then giant airbags puffed up around the rover like a bunch of grapes.",
          "It hit the ground and bounced. And bounced. And rolled... straight into a tiny crater only 22 meters wide. Nobody had aimed for it. Steve Squyres told reporters they had scored a 300-million-mile interplanetary hole in one.",
          "The first pictures showed exactly what geologists hoped for: layers of bare rock poking out of the crater wall, just a few steps away. Layered rock is like the pages of a history book. The team named the little crater Eagle, and the landing site Challenger Memorial Station, after the seven astronauts lost on Space Shuttle Challenger.",
        ],
        curioAside:
          "Eagle the lander on the Moon, Eagle Crater on Mars. Space people really like eagles.",
        modelFocus: { cameraOrbit: "90deg 80deg 4.5m", highlight: "wheels and body (landing scene)" },
        metadata: {
          dateUTC: "2004-01-25T05:05:00Z",
          dateDisplay: "January 25, 2004 UT (9:05 p.m. PST, January 24)",
          location: {
            name: "Eagle Crater, Meridiani Planum",
            body: "Mars",
            lat: -1.95,
            lon: 354.47,
            lonWest: 5.53,
          },
          missionSpecs: {
            launch: "2003-07-08T03:18Z (late July 7, Florida time), Delta II, Cape Canaveral",
            cruise: "about 456 million km, about 6.5 months",
            entrySpeed: "about 19,000 km/h (12,000 mph)",
            landing: "Airbags, rolled into Eagle Crater by chance",
            crater: "about 22 m wide, 3 m deep",
            missedTargetBy: "about 25 km downrange (lucky miss)",
          },
          people: [{ name: "Steve Squyres", role: "Principal investigator, called it an 'interplanetary hole in one'" }],
          images: {
            verified: [
              photojournal("PIA05451", "3D model of Opportunity's landing site in Eagle Crater, with airbag fragments"),
            ],
            searches: [
              imageSearch("First view from Eagle Crater", "Opportunity Eagle crater first image"),
              imageSearch("Airbag landing tests", "Mars Exploration Rover airbag test"),
            ],
            external: [
              {
                title: "Earth's first interplanetary hole-in-one (Opportunity's first Pancam view)",
                page: "https://www.planetary.org/space-images/earths-first-interplanetary-hole-in-one",
                credit: "NASA/JPL-Caltech/Cornell/ASU",
              },
            ],
          },
          model: { ref: "marsExplorationRover", glb: ASSETS.models.marsExplorationRover.glb },
          sources: [
            "https://appel.nasa.gov/2024/01/11/this-month-in-nasa-history-opportunitys-hole-in-one",
            "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
          ],
        },
      },
      {
        number: 3,
        title: "Blueberries in a Muffin",
        paragraphs: [
          "Opportunity rolled off its lander and drove up to the layered rocks. Its microscope camera spotted tiny gray balls, smaller than peas, stuck in the rock and scattered across the ground. Steve Squyres said they looked like blueberries in a muffin. The nickname stuck.",
          "The 'blueberries' were made of hematite, a mineral that often forms in water. Other tools found salts, and a mineral called jarosite that needs water to form. On March 2, 2004, NASA made the big announcement: liquid water had once soaked these rocks.",
          "Think about that. A machine the size of a golf cart, steered from another planet, found proof that Mars, a frozen desert today, was once wet. Opportunity did its main job in about five weeks. Everything after that was a bonus.",
        ],
        curioAside: "They're not real blueberries. I checked. Very disappointing for my snack drawer.",
        modelFocus: { cameraOrbit: "-30deg 65deg 2.5m", highlight: "robotic arm (instrument turret)" },
        metadata: {
          dateUTC: "2004-03-02",
          dateDisplay: "March 2, 2004 · 'water once soaked these rocks' announcement",
          location: {
            name: "Opportunity Ledge outcrop, Eagle Crater, Meridiani Planum",
            body: "Mars",
            lat: -1.95,
            lon: 354.47,
          },
          missionSpecs: {
            spherules: "Hematite-rich concretions up to about 5 mm across ('blueberries')",
            waterClues: ["Hematite spherules", "Jarosite (a hydrated iron sulfate)", "Sulfate salts", "Layering patterns in the rock"],
            keyInstruments: ["Microscopic Imager", "Mössbauer spectrometer", "Pancam", "Rock Abrasion Tool"],
            whyHere: "Orbiters had seen hematite at Meridiani from above, which is why the site was chosen",
          },
          people: [
            { name: "Steve Squyres", role: "Coined the 'blueberries' comparison" },
            { name: "Joy Crisp", role: "MER project scientist, JPL" },
          ],
          images: {
            verified: [
              photojournal("PIA05634", "'Berry Bowl': blueberry-covered rock brushed by Opportunity (sol 48)"),
              photojournal("PIA05588", "Blueberries scattered on the plains beyond Eagle Crater (sol 17)"),
              photojournal("PIA19113", "Microscopic close-up of blueberries near Fram Crater (sol 84)"),
            ],
            searches: [imageSearch("Opportunity blueberries", "Opportunity blueberries hematite")],
          },
          model: { ref: "marsExplorationRover", glb: ASSETS.models.marsExplorationRover.glb },
          sources: ["https://science.nasa.gov/photojournal/discovery-served-up-in-a-bowl/"],
        },
      },
      {
        number: 4,
        title: "The Marathon and the Long Goodnight",
        paragraphs: [
          "Ninety days came and went. Opportunity kept driving. Now and then the wind blew the dust off its solar panels, like a free car wash. On March 24, 2015, it passed marathon distance: 42.195 kilometers, on another planet. It got old the way machines do. In 2015 it lost the use of its flash memory, and the team called it amnesia. In 2017 a front wheel stopped steering.",
          "In June 2018, a dust storm grew until it wrapped the whole planet. The sky over Opportunity went almost black, and with no sunlight its batteries drained. Its last message reached Earth on June 10, 2018, on its 5,111th day on Mars. The team sent more than a thousand commands asking it to wake up. On the night of February 12, 2019, they sent the last ones and played the song 'I'll Be Seeing You' for their rover. The next day, NASA said goodbye.",
          "A science reporter named Jacob Margolis later turned Oppy's last data into words: 'My battery is low and it's getting dark.' The rover never really said that. It sent numbers. But the numbers meant the same thing. Opportunity is still parked in a place called Perseverance Valley, 45.16 kilometers from where it landed. Its driving record lasted more than eight years, until the Perseverance rover beat it on October 11, 2026.",
        ],
        curioAside:
          "Some machines get left behind because they finished. Oppy got left behind because she wore out doing far more than anyone asked. If you ask me, that's the best way to go.",
        modelFocus: { cameraOrbit: "160deg 75deg 4m", highlight: "solar panels (apply dust tint)" },
        metadata: {
          dateUTC: "2018-06-10",
          dateDisplay: "Last contact June 10, 2018 (sol 5,111) · mission declared complete February 13, 2019",
          location: {
            name: "Perseverance Valley, western rim of Endeavour Crater, Meridiani Planum",
            body: "Mars",
            lat: -2.28,
            lon: 354.6,
            approximate: true,
            note: "Endeavour Crater center is 2.28°S, 5.23°W (354.77°E), 22 km wide. Exact final position: PIA23178 traverse map.",
          },
          missionSpecs: {
            plannedLife: "90 sols",
            actualLife: "5,111 sols of contact (about 14.4 Earth years)",
            totalDistanceKm: 45.16,
            marathonPassed: "2015-03-24 (sol 3,968)",
            imagesReturned: "more than 200,000 raw images",
            recoveryCommands: "more than 1,000",
            finalCommands: "2019-02-12 (night), last attempt; mission ended 2019-02-13",
            recordBroken: "Perseverance rover passed 45.22 km on 2026-10-11",
          },
          people: [
            { name: "Steve Squyres", role: "Principal investigator" },
            { name: "Thomas Zurbuchen", role: "NASA science chief who announced the end of the mission" },
            { name: "Jacob Margolis", role: "Science reporter who wrote the famous 'last words' paraphrase" },
          ],
          images: {
            verified: [
              photojournal("PIA23178", "Opportunity's final traverse map: 45.16 km from Eagle Crater to Perseverance Valley"),
              directImage(
                "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/internal_resources/3447/solar_panels_on_rover_seen_from_above.jpeg",
                "Opportunity self-portrait: solar panels cleaned by wind (March 2014)",
                "NASA/JPL-Caltech/Cornell/ASU"
              ),
              directImage(
                "https://assets.science.nasa.gov/content/dam/science/missions/mars2020/2026/JPL_DrivingDistanceRecord_GraphicRecreation_August2026_v3.png",
                "Driving-distance record graphic: Perseverance vs. Opportunity (2026)",
                "NASA/JPL-Caltech"
              ),
            ],
            searches: [
              imageSearch("Perseverance Valley", "Opportunity Perseverance Valley"),
              imageSearch("2018 dust storm", "Mars global dust storm 2018 Opportunity"),
            ],
          },
          model: { ref: "marsExplorationRover", glb: ASSETS.models.marsExplorationRover.glb },
          sources: [
            "https://www.jpl.nasa.gov/news/nasas-opportunity-rover-mission-on-mars-comes-to-end/",
            "https://photojournal.jpl.nasa.gov/catalog/PIA23178",
            "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
          ],
        },
      },
    ],

    missionQuiz: {
      intro: "Okay, Astronaut {name}, Mars quiz. Two questions, and the red stamp is yours.",
      passScore: 2,
      allowRetry: true,
      questions: [
        {
          id: "mars-q1",
          relatedChapter: 1,
          question: "Who gave Opportunity its name?",
          options: [
            { id: "a", text: "The President of the United States" },
            { id: "b", text: "Steve Squyres, after his favorite song" },
            { id: "c", text: "Sofi Collis, a 9-year-old who won a student essay contest" },
            { id: "d", text: "A computer that picked a word at random" },
          ],
          correctOptionId: "c",
          wrongHints: {
            a: "Nope, no presidents involved. The person who named it was a lot younger. Like, third-grade younger.",
            b: "Steve led the science team, but he didn't pick the name. Think about the contest NASA ran for students.",
            d: "No random computers! A real person wrote a short essay about stars and an orphanage.",
          },
          correctMessage: "That's right! Sofi Collis, age 9. She named both twins: Spirit and Opportunity.",
        },
        {
          id: "mars-q2",
          relatedChapter: 4,
          question: "Opportunity was built to work for about 90 days. How long did it actually keep in touch with Earth?",
          options: [
            { id: "a", text: "91 days, just one day extra" },
            { id: "b", text: "About 3 years" },
            { id: "c", text: "It's still driving today" },
            { id: "d", text: "More than 14 years" },
          ],
          correctOptionId: "d",
          wrongHints: {
            a: "Much longer than that! It even ran a full marathon. That takes a while at rover speed.",
            b: "Keep going! It passed marathon distance in 2015, and it landed in 2004.",
            c: "I wish. Remember the giant dust storm in 2018? Oppy is parked in Perseverance Valley now.",
          },
          correctMessage: "Yes! From January 2004 to June 2018. A 90-day warranty, stretched past 14 years.",
        },
      ],
    },

    stampReward: {
      stampSlot: 2,
      title: "Red Dust Marathoner",
      subtitle: "Friend of Oppy",
      unlockCode: "OPPY-5111",
      unlockCodeMeaning: "Sol 5,111, Opportunity's last day in contact with Earth",
      historicalDate: "2004-01-25",
      awardedAt: null, // set at runtime
      stampText: "VISA · MARS · EAGLE CRATER · 25 JAN 2004",
      ink: { color: "#B5532A", rotationDeg: 4, opacity: 0.9 },
      patch: {
        shape: "circle",
        sizePx: 200,
        palette: {
          rim: "#B5532A",
          sky: "#D9A066",
          ground: "#8C3B1E",
          rover: "#2B1A14",
          panels: "#3E4A63",
          blueberries: "#5D6B7A",
          tracks: "#F1D3A8",
        },
        elements: [
          "Rust outer ring with 'RED DUST MARATHONER' curved along the top",
          "Butterscotch sky over rust-red ground",
          "Six-wheeled rover silhouette with flat solar panel and camera mast",
          "Dashed wheel tracks curving behind the rover",
          "Three gray-blue dots in the foreground = blueberries",
        ],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Red Dust Marathoner patch">
  <defs>
    <clipPath id="marsInner"><circle cx="100" cy="100" r="80"/></clipPath>
  </defs>
  <circle cx="100" cy="100" r="98" fill="#B5532A"/>
  <circle cx="100" cy="100" r="80" fill="#D9A066"/>
  <g font-family="Courier New, monospace" font-size="12" font-weight="700" fill="#2B1A14" text-anchor="middle">
    <text x="28.6" y="46.8" transform="rotate(-53.3 28.6 46.8)" dy="4">R</text><text x="34.5" y="39.7" transform="rotate(-47.4 34.5 39.7)" dy="4">E</text><text x="41.1" y="33.3" transform="rotate(-41.5 41.1 33.3)" dy="4">D</text><text x="56.0" y="22.6" transform="rotate(-29.6 56.0 22.6)" dy="4">D</text><text x="64.2" y="18.5" transform="rotate(-23.7 64.2 18.5)" dy="4">U</text><text x="72.8" y="15.2" transform="rotate(-17.8 72.8 15.2)" dy="4">S</text><text x="81.7" y="12.9" transform="rotate(-11.8 81.7 12.9)" dy="4">T</text><text x="100.0" y="11.0" transform="rotate(0.0 100.0 11.0)" dy="4">M</text><text x="109.2" y="11.5" transform="rotate(5.9 109.2 11.5)" dy="4">A</text><text x="118.3" y="12.9" transform="rotate(11.8 118.3 12.9)" dy="4">R</text><text x="127.2" y="15.2" transform="rotate(17.8 127.2 15.2)" dy="4">A</text><text x="135.8" y="18.5" transform="rotate(23.7 135.8 18.5)" dy="4">T</text><text x="144.0" y="22.6" transform="rotate(29.6 144.0 22.6)" dy="4">H</text><text x="151.7" y="27.6" transform="rotate(35.5 151.7 27.6)" dy="4">O</text><text x="158.9" y="33.3" transform="rotate(41.5 158.9 33.3)" dy="4">N</text><text x="165.5" y="39.7" transform="rotate(47.4 165.5 39.7)" dy="4">E</text><text x="171.4" y="46.8" transform="rotate(53.3 171.4 46.8)" dy="4">R</text>
  </g>
  <g clip-path="url(#marsInner)">
    <circle cx="150" cy="62" r="7" fill="#F4E6C8" opacity="0.8"/>
    <path d="M0 128 Q60 112 110 124 T200 120 L200 200 L0 200 Z" fill="#8C3B1E"/>
    <path d="M28 172 Q60 150 84 140" stroke="#F1D3A8" stroke-width="3" stroke-dasharray="5 4" fill="none"/>
  </g>
  <rect x="78" y="112" width="54" height="6" fill="#3E4A63"/>
  <rect x="90" y="118" width="30" height="12" fill="#2B1A14"/>
  <line x1="96" y1="112" x2="96" y2="92" stroke="#2B1A14" stroke-width="3"/>
  <rect x="91" y="86" width="12" height="7" rx="1" fill="#2B1A14"/>
  <g fill="#2B1A14">
    <circle cx="86" cy="136" r="5"/><circle cx="105" cy="136" r="5"/><circle cx="124" cy="136" r="5"/>
  </g>
  <g fill="#5D6B7A"><circle cx="60" cy="160" r="3.2"/><circle cx="70" cy="166" r="2.6"/><circle cx="54" cy="168" r="2.2"/></g>
</svg>`,
      },
    },
  },

  backgroundDevices: [
    {
      id: "viking-1-lander",
      name: "Viking 1 Lander (Thomas Mutch Memorial Station)",
      inProvidedList: true,
      missionPage: "https://science.nasa.gov/mission/viking-1/",
      nssdcUrl: nssdc("1975-075C"),
      model: ASSETS.models.vikingLander,
      panoramaPosition: { x: 0.2, y: 0.68, scale: 0.65 },
      hud: {
        status: "TELEMETRY_LOST",
        code: "ERR-11111982",
        lastContactUTC: "1982-11-11",
        readout: [
          "LANDED: 1976-07-20 11:53:06 UT",
          "LOC: 22.483°N, 47.94°W · Chryse Planitia",
          "FIRST: first photo ever taken on the surface of Mars",
          "LANDER MASS: 978 kg",
          "LOST: a faulty command from Earth cut the link",
        ],
        curioWhisper: "This one took Mars's very first selfie of the ground. Then one wrong command, and silence.",
      },
      images: [
        directImage(
          "https://assets.science.nasa.gov/content/dam/science/psd/photojournal/pia/pia00/pia00381/PIA00381.tif/jcr:content/renditions/cq5dam.web.1280.1280.jpeg",
          "The first photograph from the surface of Mars (Viking 1, PIA00381)",
          "NASA/JPL"
        ),
        directImage(
          "https://assets.science.nasa.gov/content/dam/science/psd/solar/internal_resources/3514/Viking_Lander_Line_Drawing-1.jpeg",
          "Viking lander line drawing",
          "NASA"
        ),
      ],
      teaserForFutureUpdate:
        "Landed seven years to the day after Apollo 11 touched down on the Moon: July 20.",
    },
    {
      id: "mars-pathfinder-sojourner",
      name: "Mars Pathfinder + Sojourner rover",
      inProvidedList: true,
      missionPage: "https://science.nasa.gov/mission/mars-pathfinder/",
      nssdcUrl: nssdc("1996-068A"),
      model: ASSETS.models.marsPathfinder,
      sprite: "Low triangular lander with open petals and deflated airbags; microwave-sized rover beside it. 2D silhouette.",
      panoramaPosition: { x: 0.85, y: 0.71, scale: 0.55 },
      hud: {
        status: "TELEMETRY_LOST",
        code: "ERR-09271997",
        lastContactUTC: "1997-09-27",
        readout: [
          "LANDED: 1997-07-04 · Ares Vallis",
          "LANDING: airbags, about 15 bounces, up to 15 m high",
          "ROVER: Sojourner, 10.6 kg, 30 cm tall",
          "IMAGES: 16,500+ from lander, 550 from rover",
          "LANDER NAME: Carl Sagan Memorial Station",
        ],
        curioWhisper: "The first wheels on Mars. Tiny ones. Its story is locked, but I'm working on it.",
      },
      images: [
        directImage(
          "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/p/i/a/0/PIA01551-1.jpg",
          "Sojourner after rolling off the lander (PIA01551)",
          "NASA/JPL"
        ),
        directImage(
          "https://science.nasa.gov/wp-content/uploads/2017/12/pia00621-pathfinder-and-sojourner-with-airbags-deflated.jpg",
          "Pathfinder with deflated airbags",
          "NASA/JPL"
        ),
      ],
      teaserForFutureUpdate:
        "Sojourner is named after Sojourner Truth, who fought to end slavery and for women's rights. It was the first rover to drive on another planet.",
    },
  ],
};

const deepSpace = {
  id: "deepSpace",
  order: 3,
  name: "Deep Space",
  surfaceName: "Beyond the planets (heliosphere and outward)",
  panorama: ASSETS.panoramas.deepSpace,
  arrival:
    "Deep space, Astronaut {name}. No ground to stand on, so we'll drift. Out here the Sun is just a very bright star. The machines that made it this far are the loneliest ones I know.",
  departure: "That's all three. Let's look at that passport.",

  heroDevice: {
    id: "pioneer-10",
    name: "Pioneer 10",
    shortName: "Pioneer 10",
    inProvidedList: true,
    missionPage: "https://science.nasa.gov/mission/pioneer-10/",
    nssdcId: "1972-012A",
    nssdcUrl: nssdc("1972-012A"),
    model: ASSETS.models.pioneer10,
    modelNote: "Slow auto-rotate (about 4 deg/s). In chapter 2, zoom to the antenna struts where the plaque is mounted.",
    panoramaPosition: { x: 0.55, y: 0.45, scale: 0.9, floating: true },
    hotspotLabel: "FAINT SIGNAL · PIONEER 10",
    heroIntro:
      "There's no ground out here, Astronaut {name}. Just dark, and one small dish-shaped probe, very, very far away. Pioneer 10 hasn't said a word since 2003. But I saved its story.",

    chapters: [
      {
        number: 1,
        title: "The Probe Nobody Was Sure About",
        paragraphs: [
          "It all started when Charles Hall, who ran the Pioneer project at NASA's Ames Research Center in California, wanted to send a robot farther than anything had ever gone: past Mars, through the asteroid belt, all the way to Jupiter. In February 1969, NASA approved two probes, called Pioneer F and Pioneer G.",
          "Nobody knew if it could even work. Some scientists worried the asteroid belt was so full of grit that it would sandblast any spacecraft into junk. Others feared Jupiter's radiation would fry it. Hall's team, working with engineers at a company called TRW, kept the design small and tough: 258 kilograms, about as heavy as a big motorcycle.",
          "Solar panels would be almost useless that far from the Sun, so the probe carried two small nuclear generators on long arms. They turned the heat from a lump of plutonium into electricity. On its front sat a dish antenna 2.74 meters wide, always turned toward home. Hall was known for cutting anything that added weight or cost. What was left was a machine built to do one thing: keep going.",
        ],
        curioAside: "Nuclear-powered and shaped like a satellite dish. Honestly? My kind of robot.",
        modelFocus: { cameraOrbit: "20deg 75deg 6m", highlight: "dish antenna and RTG booms" },
        metadata: {
          dateUTC: "1969-02",
          dateDisplay: "February 1969 · Pioneer F and G approved",
          location: {
            name: "NASA Ames Research Center, Moffett Field, California, USA",
            body: "Earth",
            lat: 37.415,
            lon: -122.064,
            approximate: true,
          },
          missionSpecs: {
            massKg: 258,
            power: "Two SNAP-19 radioisotope thermoelectric generators (RTGs), about 140 W at Jupiter",
            antenna: "2.74 m high-gain dish",
            builder: "TRW Systems Group",
            projectOffice: "Pioneer Project Office, NASA Ames (set up in 1962 by Charles Hall)",
          },
          people: [
            { name: "Charles F. Hall (1920–1999)", role: "Pioneer Project Manager, NASA Ames" },
            { name: "Herb Lassen", role: "TRW engineer who led the spacecraft proposal" },
          ],
          images: {
            verified: [],
            searches: [
              imageSearch("Charles Hall at Ames", "Charles Hall Pioneer Ames"),
              imageSearch("Pioneer 10 being built", "Pioneer 10 spacecraft construction"),
              imageSearch("Pioneer F/G testing", "Pioneer 10 space simulation chamber test"),
            ],
          },
          model: { ref: "pioneer10", glb: ASSETS.models.pioneer10.glb },
          sources: [
            "https://science.nasa.gov/people/charles-hall/",
            "https://science.nasa.gov/mission/pioneer-10/",
          ],
        },
      },
      {
        number: 2,
        title: "A Postcard for Strangers",
        paragraphs: [
          "A few months before launch, a space writer named Eric Burgess had an idea. This probe would someday leave the solar system forever. Shouldn't it carry a message, in case someone ever found it? He and Richard Hoagland took the idea to astronomer Carl Sagan. NASA said yes, and gave Sagan about three weeks.",
          "Sagan worked with astronomer Frank Drake and artist Linda Salzman Sagan. They engraved their message into a gold-colored aluminum plate about the size of a postcard. It shows a man and a woman, with the probe drawn behind them for size. It shows the Sun and its planets, with a tiny line tracing the probe's path away from the third one. And it has a starburst of 14 lines pointing to pulsars, spinning stars that blink like lighthouses. Together, they work like a return address.",
          "The plaque was bolted to the antenna struts, where the dish would help shield it from space dust. The design was published in the journal Science on February 25, 1972, about a week before launch. Sagan thought it might outlast everything humans had ever built on Earth.",
        ],
        curioAside:
          "Imagine getting three weeks to write a note from all of humanity. I can't pick a font in three weeks.",
        modelFocus: { cameraOrbit: "180deg 80deg 3.5m", highlight: "antenna support struts (plaque mount)" },
        metadata: {
          dateUTC: "1972-02-25",
          dateDisplay: "February 25, 1972 · plaque design published in Science",
          location: {
            name: "Cornell University, Ithaca, New York, USA (Sagan and Drake's home institution)",
            body: "Earth",
            lat: 42.4534,
            lon: -76.4735,
            approximate: true,
          },
          missionSpecs: {
            plaqueSize: "15.2 × 22.9 cm (6 × 9 in), 1.27 mm thick",
            plaqueMaterial: "6061-T6 gold-anodized aluminum",
            plaqueMassG: 120,
            pulsarsMapped: 14,
            mount: "Antenna support struts, shielded from dust erosion",
            designTime: "about three weeks",
          },
          people: [
            { name: "Carl Sagan", role: "Astronomer, co-designer" },
            { name: "Frank Drake", role: "Astronomer, co-designer (pulsar map)" },
            { name: "Linda Salzman Sagan", role: "Artist, drew the human figures" },
            { name: "Eric Burgess", role: "Space writer who first suggested a message" },
            { name: "Richard Hoagland", role: "Writer who brought the idea to Sagan with Burgess" },
          ],
          images: {
            verified: [
              directImage(
                "https://assets.science.nasa.gov/content/dam/science/psd/solar/internal_resources/740/Pioneer_plaque_mounted_to_spacecraft.jpeg",
                "The Pioneer plaque mounted on the spacecraft",
                "NASA Ames"
              ),
            ],
            searches: [imageSearch("Pioneer plaque", "Pioneer plaque")],
          },
          model: { ref: "pioneer10", glb: ASSETS.models.pioneer10.glb },
          sources: [
            "https://space.physics.uiowa.edu/pioneer/other/plaque.html",
            "https://science.nasa.gov/mission/pioneer-10/",
          ],
        },
      },
      {
        number: 3,
        title: "Through the Gravel, Past the Giant",
        paragraphs: [
          "On the night of March 2, 1972, in Florida, an Atlas-Centaur rocket threw Pioneer 10 off Earth faster than any human-made object before it: about 51,682 kilometers per hour. It passed the Moon's orbit in less than 11 hours. Apollo astronauts needed about three days to get that far.",
          "On July 15, 1972, Pioneer 10 became the first spacecraft to enter the asteroid belt. For about seven months it crossed the zone everyone had been afraid of. It came out the other side in February 1973, still working. The belt was much emptier than people had feared.",
          "On December 4, 1973, it swung past Jupiter, about 130,000 kilometers away, and sent back the first close-up pictures of the biggest planet, plus a view of its moon Ganymede. Jupiter's radiation was stronger than expected and caused glitches, but the little probe held on. Then Jupiter's gravity flung it outward, fast enough to leave the Sun behind forever.",
        ],
        curioAside:
          "Before Pioneer 10, the asteroid belt was a scary unknown. After it, it was a road. That's what scouts are for.",
        modelFocus: { cameraOrbit: "60deg 60deg 7m", highlight: "full spacecraft, Jupiter backdrop" },
        metadata: {
          dateUTC: "1973-12-04T02:26:00Z",
          dateDisplay: "December 4, 1973 UT · closest approach to Jupiter",
          location: {
            name: "Jupiter flyby",
            body: "Jupiter",
            closestApproachKm: 130354,
          },
          missionSpecs: {
            launchUTC: "1972-03-03T01:49:04Z (evening of March 2 in Florida)",
            launchSite: "Cape Canaveral, Launch Complex 36A",
            launchVehicle: "Atlas-Centaur (AC-27)",
            launchSpeed: "about 51,682 km/h (32,114 mph), fastest human-made object at the time",
            moonOrbitPassed: "in under 11 hours",
            asteroidBelt: "entered 1972-07-15, exited February 1973, about 435 million km of travel through it",
          },
          people: [{ name: "Charles F. Hall", role: "Project Manager during the Jupiter encounter" }],
          images: {
            verified: [
              directImage(
                "https://assets.science.nasa.gov/content/dam/science/psd/solar/internal_resources/5211/Pioneer_10_Ganymede-1.jpeg",
                "Ganymede, imaged by Pioneer 10",
                "NASA Ames"
              ),
              directImage(
                "https://assets.science.nasa.gov/content/dam/science/psd/solar/internal_resources/731/Illustrated_Pioneer_10_at_Jupiter.jpeg",
                "Illustration: Pioneer 10 at Jupiter",
                "NASA"
              ),
            ],
            searches: [
              imageSearch("Pioneer 10 Jupiter images", "Pioneer 10 Jupiter"),
              imageSearch("Pioneer 10 launch", "Pioneer 10 launch Atlas Centaur 1972"),
            ],
          },
          model: { ref: "pioneer10", glb: ASSETS.models.pioneer10.glb },
          sources: [
            "https://science.nasa.gov/mission/pioneer-10/",
            "https://www.nasa.gov/history/50-years-ago-pioneer-10-launches-to-explore-jupiter",
          ],
        },
      },
      {
        number: 4,
        title: "The Last Whisper",
        paragraphs: [
          "On June 13, 1983, Pioneer 10 crossed the orbit of Neptune, which was the farthest planet from the Sun at the time. No human-made object had ever gone so far. It kept sending notes home about the solar wind and cosmic rays.",
          "On March 31, 1997, NASA ended regular contact to save money. Pioneer 10 was 67 times farther from us than the Sun is. Every so often, the team still listened. Its signal grew fainter as its nuclear power slowly faded.",
          "On January 23, 2003, it sent one last whisper from 12.23 billion kilometers away. That signal, traveling at the speed of light, took 11 hours and 20 minutes to reach us. After that, silence. Pioneer 10 is still out there, still carrying its golden postcard, heading in the general direction of Aldebaran, the red star that marks the eye of Taurus the bull. It should pass it in about two million years. Nobody may ever read the message. They sent it anyway.",
        ],
        curioAside:
          "Pioneer 10 doesn't have a parking spot. It got left behind the way a message in a bottle gets left behind: on purpose.",
        modelFocus: { cameraOrbit: "200deg 85deg 12m", highlight: "spacecraft small against starfield, slow drift away" },
        metadata: {
          dateUTC: "2003-01-23",
          dateDisplay: "January 23, 2003 · last signal received",
          location: {
            name: "Outer solar system, heading toward Aldebaran (Taurus)",
            body: "Interplanetary space",
            distanceFromEarthKm: 12230000000,
            distanceAU: 81.8,
          },
          missionSpecs: {
            neptuneOrbitCrossed: "1983-06-13",
            routineContactEnded: "1997-03-31 19:35 UT, at 67 AU, for budget reasons",
            lastSignal: "2003-01-23, one-way light time 11 h 20 min",
            heading: "General direction of Aldebaran; passes it in about 2 million years",
            plaqueStatus: "Still aboard",
          },
          people: [{ name: "Pioneer 10 operations team, NASA Ames", role: "Kept listening after official contact ended" }],
          images: {
            verified: [
              directImage(
                "https://science.nasa.gov/wp-content/uploads/2023/04/jupiter_pioneer_10_art-jpg.webp",
                "Artist's concept of Pioneer 10",
                "NASA"
              ),
            ],
            searches: [imageSearch("Pioneer 10 farewell / deep space", "Pioneer 10 deep space")],
          },
          model: { ref: "pioneer10", glb: ASSETS.models.pioneer10.glb },
          sources: ["https://science.nasa.gov/mission/pioneer-10/"],
        },
      },
    ],

    missionQuiz: {
      intro: "Last quiz, Astronaut {name}. Two questions between you and a full passport.",
      passScore: 2,
      allowRetry: true,
      questions: [
        {
          id: "deep-q1",
          relatedChapter: 2,
          question: "What did Carl Sagan, Frank Drake and Linda Salzman Sagan send along on Pioneer 10?",
          options: [
            { id: "a", text: "A golden record full of music" },
            { id: "b", text: "A gold-colored plaque with a map showing where Earth is" },
            { id: "c", text: "A time capsule full of seeds" },
            { id: "d", text: "A radio that plays a hello message on repeat" },
          ],
          correctOptionId: "b",
          wrongHints: {
            a: "Great guess, but that golden record flew five years later, on Voyager. Pioneer 10's message was flat and engraved.",
            c: "No seeds! Think postcard: pictures of people, the planets, and a starburst of pulsar lines.",
            d: "Pioneer's radio was for talking to NASA. The message for strangers needed no power at all.",
          },
          correctMessage: "Correct! A postcard-sized plaque with people, planets, and a pulsar map: Earth's return address.",
        },
        {
          id: "deep-q2",
          relatedChapter: 1,
          question: "Why did Pioneer 10 carry nuclear generators instead of big solar panels?",
          options: [
            { id: "a", text: "Solar panels hadn't been invented yet in 1972" },
            { id: "b", text: "Nuclear generators scare away asteroids" },
            { id: "c", text: "Out past Mars and Jupiter, sunlight is too weak to power it" },
            { id: "d", text: "They were cheaper than solar panels" },
          ],
          correctOptionId: "c",
          wrongHints: {
            a: "Solar panels were already flying in space by 1958. Think about how bright the Sun looks from way out by Jupiter.",
            b: "Ha! Asteroids aren't scared of anything. Think about where the probe was going and how far from the Sun that is.",
            d: "Not about price. The farther you go from the Sun, the dimmer it gets. What does that mean for solar power?",
          },
          correctMessage: "Exactly! Far from the Sun, sunlight is too dim. Plutonium-powered generators kept Pioneer 10 talking for about 30 years.",
        },
      ],
    },

    stampReward: {
      stampSlot: 3,
      title: "Deep Space Postmaster",
      subtitle: "Carrier of Earth's Return Address",
      unlockCode: "P10-ALDEBARAN",
      unlockCodeMeaning: "Pioneer 10 is heading toward the red star Aldebaran",
      historicalDate: "1972-03-03",
      awardedAt: null, // set at runtime
      stampText: "VISA · DEEP SPACE · PIONEER 10 · 03 MAR 1972",
      ink: { color: "#E2B44B", rotationDeg: -3, opacity: 0.95 },
      patch: {
        shape: "circle",
        sizePx: 200,
        palette: {
          rim: "#E2B44B",
          space: "#0A1330",
          stars: "#F4F1E8",
          probe: "#C9CED6",
          pulsarLines: "#E2B44B",
          aldebaran: "#E8743B",
        },
        elements: [
          "Gold outer ring with 'DEEP SPACE POSTMASTER' curved along the top",
          "Navy starfield",
          "Starburst of fine gold lines from one point (nod to the plaque's pulsar map)",
          "Small silver probe with dish antenna and two booms",
          "Dotted trail from the probe toward a small orange-red star (Aldebaran)",
        ],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Deep Space Postmaster patch">
  <defs>
  </defs>
  <circle cx="100" cy="100" r="98" fill="#E2B44B"/>
  <circle cx="100" cy="100" r="80" fill="#0A1330"/>
  <g font-family="Courier New, monospace" font-size="12" font-weight="700" fill="#0A1330" text-anchor="middle">
    <text x="23.5" y="54.5" transform="rotate(-59.2 23.5 54.5)" dy="4">D</text><text x="28.6" y="46.8" transform="rotate(-53.3 28.6 46.8)" dy="4">E</text><text x="34.5" y="39.7" transform="rotate(-47.4 34.5 39.7)" dy="4">E</text><text x="41.1" y="33.3" transform="rotate(-41.5 41.1 33.3)" dy="4">P</text><text x="56.0" y="22.6" transform="rotate(-29.6 56.0 22.6)" dy="4">S</text><text x="64.2" y="18.5" transform="rotate(-23.7 64.2 18.5)" dy="4">P</text><text x="72.8" y="15.2" transform="rotate(-17.8 72.8 15.2)" dy="4">A</text><text x="81.7" y="12.9" transform="rotate(-11.8 81.7 12.9)" dy="4">C</text><text x="90.8" y="11.5" transform="rotate(-5.9 90.8 11.5)" dy="4">E</text><text x="109.2" y="11.5" transform="rotate(5.9 109.2 11.5)" dy="4">P</text><text x="118.3" y="12.9" transform="rotate(11.8 118.3 12.9)" dy="4">O</text><text x="127.2" y="15.2" transform="rotate(17.8 127.2 15.2)" dy="4">S</text><text x="135.8" y="18.5" transform="rotate(23.7 135.8 18.5)" dy="4">T</text><text x="144.0" y="22.6" transform="rotate(29.6 144.0 22.6)" dy="4">M</text><text x="151.7" y="27.6" transform="rotate(35.5 151.7 27.6)" dy="4">A</text><text x="158.9" y="33.3" transform="rotate(41.5 158.9 33.3)" dy="4">S</text><text x="165.5" y="39.7" transform="rotate(47.4 165.5 39.7)" dy="4">T</text><text x="171.4" y="46.8" transform="rotate(53.3 171.4 46.8)" dy="4">E</text><text x="176.5" y="54.5" transform="rotate(59.2 176.5 54.5)" dy="4">R</text>
  </g>
  <g fill="#F4F1E8">
    <circle cx="48" cy="70" r="1.2"/><circle cx="140" cy="150" r="1"/><circle cx="62" cy="150" r="1.3"/>
    <circle cx="120" cy="52" r="0.9"/><circle cx="160" cy="98" r="1.1"/><circle cx="80" cy="40" r="0.8"/>
  </g>
  <g stroke="#E2B44B" stroke-width="0.9" opacity="0.85">
    <line x1="64" y1="128" x2="30" y2="110"/><line x1="64" y1="128" x2="36" y2="146"/>
    <line x1="64" y1="128" x2="58" y2="166"/><line x1="64" y1="128" x2="86" y2="164"/>
    <line x1="64" y1="128" x2="40" y2="92"/><line x1="64" y1="128" x2="98" y2="150"/>
    <line x1="64" y1="128" x2="54" y2="88"/>
  </g>
  <g transform="translate(108 96) rotate(-25)">
    <ellipse cx="0" cy="0" rx="20" ry="7" fill="#C9CED6"/>
    <rect x="-5" y="6" width="10" height="7" fill="#C9CED6"/>
    <line x1="-5" y1="10" x2="-22" y2="20" stroke="#C9CED6" stroke-width="2"/>
    <line x1="5" y1="10" x2="22" y2="20" stroke="#C9CED6" stroke-width="2"/>
  </g>
  <path d="M126 86 L136 78 L146 70 L154 63" stroke="#F4F1E8" stroke-width="2" stroke-dasharray="2 4" fill="none"/>
  <circle cx="160" cy="58" r="5" fill="#E8743B"/>
</svg>`,
      },
    },
  },

  backgroundDevices: [
    {
      id: "kepler",
      name: "Kepler Space Telescope",
      inProvidedList: true,
      missionPage: "https://science.nasa.gov/mission/kepler/",
      nssdcUrl: nssdc("2009-011A"),
      model: ASSETS.models.kepler,
      sprite: "Tube-shaped telescope with an angled sunshade and a flat solar panel. 2D silhouette.",
      panoramaPosition: { x: 0.22, y: 0.35, scale: 0.5, floating: true },
      hud: {
        status: "SIGNAL_LOCKED",
        code: "KPLR · RETIRED",
        lastContactUTC: "2018-10-30",
        readout: [
          "LAUNCHED: 2009-03-06 (local date)",
          "ORBIT: around the Sun, trailing behind Earth",
          "FOUND: more than 2,600 planets around other stars",
          "K2: after two reaction wheels failed, used sunlight pressure to keep pointing",
          "RETIRED: 2018-10-30, out of fuel",
        ],
        curioWhisper: "This one stared at the same patch of stars for years and found thousands of new worlds. Locked for now.",
      },
      images: [
        directImage("https://images-assets.nasa.gov/image/ACD18-0204-002/ACD18-0204-002~large.jpg", "Kepler spacecraft illustration", "NASA"),
        directImage("https://images-assets.nasa.gov/image/PIA18904/PIA18904~large.jpg", "K2 mission artist concept", "NASA/JPL-Caltech"),
      ],
      teaserForFutureUpdate:
        "Its founding scientist, William Borucki, pitched the idea again and again before NASA said yes. His summary of what Kepler found: planets are everywhere.",
    },
    {
      id: "voyager-1",
      name: "Voyager 1",
      inProvidedList: false,
      note: "Not in the list you provided. Added because NASA expects it to reach one light-day from Earth on November 18, 2026, which makes a great live countdown in the HUD. Remove it if you must stay inside the official list (swap in Pioneer 11).",
      missionPage: "https://science.nasa.gov/mission/voyager/",
      nssdcUrl: nssdc("1977-084A"),
      model: ASSETS.models.voyager,
      sprite: "Large dish antenna on a ten-sided body, long magnetometer boom. 2D silhouette.",
      panoramaPosition: { x: 0.86, y: 0.3, scale: 0.55, floating: true },
      hud: {
        status: "SIGNAL_LOCKED",
        code: "VGR1 · STILL TALKING",
        lastContactUTC: null,
        liveMilestone: {
          dateUTC: "2026-11-18",
          label: "1 LIGHT-DAY FROM EARTH",
          countdown: true,
          note: "NASA/JPL: about 25.9 billion km, so a signal takes 24 hours one way. Sources give slightly different times of day; keep the date only.",
        },
        readout: [
          "LAUNCHED: 1977-09-05",
          "INTERSTELLAR SPACE: since 2012-08-25",
          "MILESTONE: one light-day from Earth on 2026-11-18",
          "STATUS: still in contact; most instruments now off to save power",
        ],
        curioWhisper: "This one is still talking to Earth, just very slowly. I can't unlock it yet... but it's not done writing its story.",
      },
      images: [],
      teaserForFutureUpdate: "Carries the Golden Record, the musical cousin of Pioneer's plaque.",
    },
  ],
};

export const destinations = [moon, mars, deepSpace];

/* ------------------------------------------------------------------ */
/* 4. DATA NOTES (for your team, not shown to players)                 */
/* ------------------------------------------------------------------ */

export const DATA_NOTES = {
  heroChoice: {
    moon: "Apollo 11 LM 'Eagle' (NSSDCA 1969-059C from your list). Only Moon device in the list with a NASA .glb. Surveyor 3 and the Apollo 15 rover have none.",
    mars: "Opportunity (MER page from your list). NASA/JPL 11 MB .glb plus a 36 KB fallback.",
    deepSpace: "Pioneer 10 (from your list). NASA Eyes-on-the-Solar-System .glb, about 2 MB.",
  },
  datesAndTimezones:
    "Apollo 11 and 12 events cross midnight UT, so US-local dates can be one day earlier than UT. Some NASA pages mix the two (Surveyor 3's page gives the Apollo 12 visit as Nov 19; NSSDCA puts EVA 2 on Nov 20 UT).",
  famousQuoteCaveat:
    "'My battery is low and it's getting dark' is a reporter's paraphrase of Opportunity's final data, not a transmitted message. Chapter 4 says so.",
  approximateValues:
    "Earth-side coordinates (Grumman Bethpage, JPL, Ames, Cornell) and Opportunity's final spot are approximate and flagged `approximate: true`.",
  imagesToTestBeforeDemo:
    "nasaImage().imageGuess URLs follow NASA's usual file pattern. If one 404s, fetch assetManifest and use the ~large.jpg it lists.",
  usage:
    "NASA images and models are generally free to use. Credit NASA, and don't use NASA logos or insignia in your patches. The patch SVGs above are original designs with no NASA marks.",
};

export default {
  CURIO,
  onboarding,
  LOCKED_HUD,
  destinations,
  ASSETS,
  DATA_NOTES,
  fillTemplate,
};
