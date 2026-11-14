/**
 * storyExtras.js
 * Extra data for the book view:
 *   1. GLOSSARY: the clickable words. Each entry has its own short, kid-friendly blurb
 *      (always shown, works offline) and, when one exists, the title of its Wikipedia
 *      article (photo + summary are loaded live when the card opens).
 *   2. FIGURES: one picture per book page. NASA IDs were checked against the
 *      NASA Image and Video Library (images.nasa.gov) on 2026-11-14.
 *
 * kind: person | place | machine | thing | org
 * scope: which story the word is clickable in ("moon" | "mars" | "deepSpace")
 * match: exact words in the story text that become links (case-sensitive)
 * aka: names used in the chapter "people" lists
 */
import { ASSETS } from "./missionData";

export const GLOSSARY = [
  /* ------------------------------ THE MOON ------------------------------ */
  {
    id: "tom-kelly", scope: ["moon"], kind: "person", label: "Engineer", name: "Tom Kelly",
    match: ["Tom Kelly"], aka: ["Thomas J. Kelly"],
    blurb: "The Grumman engineer who led the design of the Lunar Module. NASA called him the 'Father of the Lunar Module.'",
    wiki: "Thomas J. Kelly (aerospace engineer)",
  },
  {
    id: "joseph-gavin", scope: ["moon"], kind: "person", label: "Program director", name: "Joseph G. Gavin Jr.",
    aka: ["Joseph G. Gavin Jr."],
    blurb: "He ran Grumman's Lunar Module program from 1962 to 1972, while Tom Kelly led the engineering.",
    wiki: null,
  },
  {
    id: "grumman", scope: ["moon"], kind: "org", label: "Company", name: "Grumman",
    match: ["Grumman Aircraft", "Grumman"],
    blurb: "The aircraft company in Bethpage, New York, that built the Apollo Lunar Modules.",
    wiki: "Grumman",
  },
  {
    id: "columbia", scope: ["moon"], kind: "machine", label: "Spacecraft", name: "Columbia",
    match: ["Columbia"],
    blurb: "Apollo 11's mother ship. It stayed in orbit around the Moon with Michael Collins, then carried all three astronauts home.",
    wiki: "Command module Columbia",
  },
  {
    id: "sea-of-tranquility", scope: ["moon"], kind: "place", label: "Place on the Moon", name: "Sea of Tranquility",
    match: ["Sea of Tranquility"],
    blurb: "A wide, dark plain of old lava on the Moon. It isn't a real sea. Early astronomers thought the Moon's dark patches were water.",
    wiki: "Mare Tranquillitatis",
  },
  {
    id: "michael-collins", scope: ["moon"], kind: "person", label: "Astronaut", name: "Michael Collins",
    match: ["Michael Collins", "Collins"], aka: ["Michael Collins"],
    blurb: "Apollo 11's command module pilot. He circled the Moon alone in Columbia while Armstrong and Aldrin landed.",
    wiki: "Michael Collins (astronaut)",
  },
  {
    id: "neil-armstrong", scope: ["moon"], kind: "person", label: "Astronaut", name: "Neil Armstrong",
    match: ["Neil Armstrong", "Armstrong"], aka: ["Neil Armstrong"],
    blurb: "Commander of Apollo 11 and the first person to walk on the Moon.",
    wiki: "Neil Armstrong",
  },
  {
    id: "buzz-aldrin", scope: ["moon"], kind: "person", label: "Astronaut", name: "Buzz Aldrin",
    match: ["Buzz Aldrin", "Aldrin"], aka: ["Buzz Aldrin"],
    blurb: "Apollo 11's lunar module pilot and the second person to walk on the Moon. He set up the experiments at Tranquility Base.",
    wiki: "Buzz Aldrin",
  },
  {
    id: "alarm-1202", scope: ["moon"], kind: "thing", label: "Computer", name: "The 1202 alarm",
    match: ["1202"],
    blurb: "A warning from Eagle's guidance computer that it had too much to do. The computer dropped its less important jobs and kept flying the landing.",
    wiki: "Apollo Guidance Computer",
  },
  {
    id: "mission-control", scope: ["moon"], kind: "place", label: "Place on Earth", name: "Mission Control",
    match: ["Mission Control"],
    blurb: "The room in Houston, Texas, where flight controllers watched over every Apollo mission and talked to the crew.",
    wiki: "Christopher C. Kraft Jr. Mission Control Center",
  },
  {
    id: "steve-bales", scope: ["moon"], kind: "person", label: "Flight controller", name: "Steve Bales",
    match: ["Steve Bales"], aka: ["Steve Bales"],
    blurb: "The guidance officer in Mission Control during the Apollo 11 landing. He gave the 'go' to keep landing when the alarms went off.",
    wiki: "Steve Bales",
  },
  {
    id: "jack-garman", scope: ["moon"], kind: "person", label: "Engineer", name: "Jack Garman",
    match: ["Jack Garman", "Garman"], aka: ["Jack Garman"],
    blurb: "A young NASA computer engineer who had written down what every alarm code meant. His quick answer helped save the landing.",
    wiki: "Jack Garman",
  },
  {
    id: "margaret-hamilton", scope: ["moon"], kind: "person", label: "Software engineer", name: "Margaret Hamilton",
    match: ["Margaret Hamilton"], aka: ["Margaret Hamilton"],
    blurb: "She led the MIT team that wrote the flight software for Apollo's guidance computer.",
    wiki: "Margaret Hamilton (software engineer)",
  },
  {
    id: "tranquility-base", scope: ["moon"], kind: "place", label: "Place on the Moon", name: "Tranquility Base",
    match: ["Tranquility Base"],
    blurb: "The name Neil Armstrong gave to the spot where Eagle landed.",
    wiki: "Tranquility Base",
  },
  {
    id: "james-faller", scope: ["moon"], kind: "person", label: "Physicist", name: "James Faller",
    match: ["James Faller"], aka: ["James Faller"],
    blurb: "The physicist who proposed leaving mirrors on the Moon so that lasers from Earth could measure the distance.",
    wiki: "James E. Faller",
  },
  {
    id: "carroll-alley", scope: ["moon"], kind: "person", label: "Physicist", name: "Carroll Alley",
    aka: ["Carroll Alley"],
    blurb: "The physicist who led the Apollo laser ranging experiment.",
    wiki: "Carroll Alley",
  },
  {
    id: "retroreflector", scope: ["moon"], kind: "thing", label: "Experiment", name: "The laser mirror panel",
    match: ["corner cubes"],
    blurb: "A panel of 100 glass corner cubes left by Apollo 11. It bounces laser light straight back to Earth and is still used today.",
    wiki: "Lunar Laser Ranging experiments",
  },
  {
    id: "seismometer", scope: ["moon"], kind: "thing", label: "Experiment", name: "Apollo 11's seismometer",
    match: ["seismometer"],
    blurb: "An instrument that feels the ground shake. Apollo 11's seismometer listened for moonquakes.",
    wiki: "Passive Seismic Experiment Package",
  },
  {
    id: "lunar-plaque", scope: ["moon"], kind: "thing", label: "Left on the Moon", name: "The Apollo 11 plaque",
    match: ["steel plaque", "plaque"],
    blurb: "A stainless steel plate on Eagle's ladder leg, signed by the three astronauts and the U.S. President. It is still on the Moon.",
    wiki: "Lunar plaque",
  },
  {
    id: "lro", scope: ["moon"], kind: "machine", label: "Spacecraft", name: "Lunar Reconnaissance Orbiter",
    match: ["Lunar Reconnaissance Orbiter"],
    blurb: "A NASA spacecraft that has circled the Moon since 2009, mapping it in sharp detail. It has photographed the Apollo landing sites.",
    wiki: "Lunar Reconnaissance Orbiter",
  },

  /* -------------------------------- MARS -------------------------------- */
  {
    id: "steve-squyres", scope: ["mars"], kind: "person", label: "Scientist", name: "Steve Squyres",
    match: ["Steve Squyres", "Squyres"], aka: ["Steve Squyres"],
    blurb: "The Cornell University scientist who led the science team for the twin rovers Spirit and Opportunity.",
    wiki: "Steve Squyres",
  },
  {
    id: "cornell", scope: ["mars"], kind: "org", label: "University", name: "Cornell University",
    match: ["Cornell University"],
    blurb: "A university in Ithaca, New York. Steve Squyres led the rovers' science team from here.",
    wiki: "Cornell University",
  },
  {
    id: "sofi-collis", scope: ["mars"], kind: "person", label: "Student", name: "Sofi Collis",
    match: ["Sofi Collis"], aka: ["Sofi Collis"],
    blurb: "A 9-year-old from Arizona whose essay won NASA's 2003 contest to name the twin rovers.",
    wiki: null,
    source: { label: "NASA Science", url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/" },
  },
  {
    id: "spirit", scope: ["mars"], kind: "machine", label: "Rover", name: "Spirit",
    match: ["Spirit"],
    blurb: "Opportunity's twin. Spirit landed on the other side of Mars three weeks earlier. Its last message came in 2010.",
    wiki: "Spirit (rover)",
  },
  {
    id: "cape-canaveral", scope: ["mars"], kind: "place", label: "Place on Earth", name: "Cape Canaveral",
    match: ["Cape Canaveral"],
    blurb: "The stretch of Florida coast where many American rockets are launched.",
    wiki: "Cape Canaveral Space Force Station",
  },
  {
    id: "eagle-crater", scope: ["mars"], kind: "place", label: "Place on Mars", name: "Eagle Crater",
    match: ["Eagle"],
    blurb: "A small crater on Mars, 22 meters wide, where Opportunity rolled to a stop after landing.",
    wiki: "Eagle (crater)",
  },
  {
    id: "challenger", scope: ["mars"], kind: "machine", label: "Space shuttle", name: "Space Shuttle Challenger",
    match: ["Space Shuttle Challenger"],
    blurb: "A NASA space shuttle that was lost with its seven astronauts shortly after launch on January 28, 1986.",
    wiki: "Space Shuttle Challenger disaster",
  },
  {
    id: "blueberries", scope: ["mars"], kind: "thing", label: "Rocks", name: "Martian 'blueberries'",
    match: ["blueberries"],
    blurb: "Tiny gray balls of the mineral hematite that Opportunity found in the rocks and soil. They were a clue that water was once there.",
    wiki: "Martian spherules",
  },
  {
    id: "hematite", scope: ["mars"], kind: "thing", label: "Mineral", name: "Hematite",
    match: ["hematite"],
    blurb: "An iron mineral. On Earth it often forms where there is water.",
    wiki: "Hematite",
  },
  {
    id: "jarosite", scope: ["mars"], kind: "thing", label: "Mineral", name: "Jarosite",
    match: ["jarosite"],
    blurb: "A yellowish mineral that needs water to form. Finding it on Mars was strong proof of a wet past.",
    wiki: "Jarosite",
  },
  {
    id: "joy-crisp", scope: ["mars"], kind: "person", label: "Scientist", name: "Joy Crisp",
    aka: ["Joy Crisp"],
    blurb: "A planetary geologist at JPL and the project scientist for the Mars Exploration Rovers.",
    wiki: "Joy Crisp",
  },
  {
    id: "dust-storm", scope: ["mars"], kind: "thing", label: "Weather", name: "The 2018 dust storm",
    match: ["dust storm"],
    blurb: "A storm that grew until dust covered the whole planet and blocked the sunlight Opportunity needed for power.",
    wiki: null,
    source: { label: "NASA JPL", url: "https://www.jpl.nasa.gov/news/nasas-opportunity-rover-mission-on-mars-comes-to-end/" },
  },
  {
    id: "thomas-zurbuchen", scope: ["mars"], kind: "person", label: "NASA science chief", name: "Thomas Zurbuchen",
    aka: ["Thomas Zurbuchen"],
    blurb: "NASA's head of science in 2019. He announced the end of Opportunity's mission.",
    wiki: "Thomas Zurbuchen",
  },
  {
    id: "jacob-margolis", scope: ["mars"], kind: "person", label: "Reporter", name: "Jacob Margolis",
    match: ["Jacob Margolis"], aka: ["Jacob Margolis"],
    blurb: "A science reporter who turned Opportunity's last data into the famous words 'My battery is low and it's getting dark.'",
    wiki: null,
  },
  {
    id: "perseverance-valley", scope: ["mars"], kind: "place", label: "Place on Mars", name: "Perseverance Valley",
    match: ["Perseverance Valley"],
    blurb: "A shallow valley on the rim of Endeavour Crater. Opportunity was exploring it when the dust storm arrived, and it is still parked there.",
    wiki: "Endeavour (crater)",
  },
  {
    id: "perseverance-rover", scope: ["mars"], kind: "machine", label: "Rover", name: "Perseverance",
    match: ["Perseverance rover"],
    blurb: "A car-sized NASA rover that landed on Mars in February 2021.",
    wiki: "Perseverance (rover)",
  },

  /* ----------------------------- DEEP SPACE ----------------------------- */
  {
    id: "charles-hall", scope: ["deepSpace"], kind: "person", label: "Project manager", name: "Charles Hall",
    match: ["Charles Hall", "Hall"], aka: ["Charles F. Hall"],
    blurb: "He ran NASA's Pioneer project at Ames Research Center and managed Pioneer 10 from the first plans to Jupiter.",
    wiki: null,
    source: { label: "NASA Science", url: "https://science.nasa.gov/people/charles-hall/" },
  },
  {
    id: "herb-lassen", scope: ["deepSpace"], kind: "person", label: "Engineer", name: "Herb Lassen",
    aka: ["Herb Lassen"],
    blurb: "The TRW engineer who led the proposal to build the spacecraft.",
    wiki: null,
  },
  {
    id: "ames", scope: ["deepSpace"], kind: "place", label: "NASA center", name: "Ames Research Center",
    match: ["Ames Research Center"],
    blurb: "A NASA center in California's Silicon Valley. The Pioneer probes were managed from here.",
    wiki: "Ames Research Center",
  },
  {
    id: "asteroid-belt", scope: ["deepSpace"], kind: "place", label: "Place in space", name: "The asteroid belt",
    match: ["asteroid belt"],
    blurb: "A wide ring of rocky objects that circle the Sun between Mars and Jupiter.",
    wiki: "Asteroid belt",
  },
  {
    id: "jupiter", scope: ["deepSpace"], kind: "place", label: "Planet", name: "Jupiter",
    match: ["Jupiter"],
    blurb: "The biggest planet in the solar system: a giant ball of gas with powerful radiation around it.",
    wiki: "Jupiter",
  },
  {
    id: "trw", scope: ["deepSpace"], kind: "org", label: "Company", name: "TRW",
    match: ["TRW"],
    blurb: "The California company that built Pioneer 10.",
    wiki: "TRW Inc.",
  },
  {
    id: "rtg", scope: ["deepSpace"], kind: "thing", label: "Power source", name: "Nuclear generators (RTGs)",
    match: ["nuclear generators"],
    blurb: "A power source with no moving parts. It turns the heat from plutonium into electricity, so it works far from the Sun.",
    wiki: "Radioisotope thermoelectric generator",
  },
  {
    id: "eric-burgess", scope: ["deepSpace"], kind: "person", label: "Science writer", name: "Eric Burgess",
    match: ["Eric Burgess"], aka: ["Eric Burgess"],
    blurb: "The English science writer who first suggested that Pioneer 10 should carry a message.",
    wiki: "Eric Burgess",
  },
  {
    id: "richard-hoagland", scope: ["deepSpace"], kind: "person", label: "Writer", name: "Richard Hoagland",
    match: ["Richard Hoagland"], aka: ["Richard Hoagland"],
    blurb: "A writer who, together with Eric Burgess, took the idea of a message to Carl Sagan.",
    wiki: null,
  },
  {
    id: "carl-sagan", scope: ["deepSpace"], kind: "person", label: "Astronomer", name: "Carl Sagan",
    match: ["Carl Sagan", "Sagan"], aka: ["Carl Sagan"],
    blurb: "The astronomer and writer who designed the Pioneer plaque with Frank Drake. He spent his life explaining space to everyone.",
    wiki: "Carl Sagan",
  },
  {
    id: "frank-drake", scope: ["deepSpace"], kind: "person", label: "Astronomer", name: "Frank Drake",
    match: ["Frank Drake"], aka: ["Frank Drake"],
    blurb: "The astronomer who drew the plaque's pulsar map. He was a leader in the search for life beyond Earth.",
    wiki: "Frank Drake",
  },
  {
    id: "linda-salzman-sagan", scope: ["deepSpace"], kind: "person", label: "Artist", name: "Linda Salzman Sagan",
    match: ["Linda Salzman Sagan"], aka: ["Linda Salzman Sagan"],
    blurb: "The artist who drew the man and the woman on the Pioneer plaque.",
    wiki: "Linda Salzman Sagan",
  },
  {
    id: "pioneer-plaque", scope: ["deepSpace"], kind: "thing", label: "Message", name: "The Pioneer plaque",
    match: ["plaque"],
    blurb: "A gold-colored aluminum plate, about 15 by 23 centimeters, carrying a picture message from Earth. Pioneer 11 carries one just like it.",
    wiki: "Pioneer plaque",
  },
  {
    id: "pulsars", scope: ["deepSpace"], kind: "thing", label: "Star", name: "Pulsars",
    match: ["pulsars"],
    blurb: "Dead stars that spin very fast and sweep beams of radio waves across space, like lighthouses.",
    wiki: "Pulsar",
  },
  {
    id: "atlas-centaur", scope: ["deepSpace"], kind: "machine", label: "Rocket", name: "Atlas-Centaur",
    match: ["Atlas-Centaur"],
    blurb: "The American rocket that launched Pioneer 10 in 1972.",
    wiki: "Atlas-Centaur",
  },
  {
    id: "ganymede", scope: ["deepSpace"], kind: "place", label: "Moon of Jupiter", name: "Ganymede",
    match: ["Ganymede"],
    blurb: "Jupiter's biggest moon, and the biggest moon in the solar system. It is even larger than the planet Mercury.",
    wiki: "Ganymede (moon)",
  },
  {
    id: "neptune", scope: ["deepSpace"], kind: "place", label: "Planet", name: "Neptune",
    match: ["Neptune"],
    blurb: "The eighth planet from the Sun. From 1979 to 1999 it was the farthest one, because Pluto, then counted as a planet, had moved inside its orbit.",
    wiki: "Neptune",
  },
  {
    id: "solar-wind", scope: ["deepSpace"], kind: "thing", label: "Space weather", name: "Solar wind",
    match: ["solar wind"],
    blurb: "A stream of tiny charged particles that blows outward from the Sun in every direction.",
    wiki: "Solar wind",
  },
  {
    id: "cosmic-rays", scope: ["deepSpace"], kind: "thing", label: "Space weather", name: "Cosmic rays",
    match: ["cosmic rays"],
    blurb: "Very fast particles that fly through space. Many of them come from outside the solar system.",
    wiki: "Cosmic ray",
  },
  {
    id: "aldebaran", scope: ["deepSpace"], kind: "place", label: "Star", name: "Aldebaran",
    match: ["Aldebaran"],
    blurb: "A giant orange-red star about 65 light-years away. It marks the eye of the bull in the constellation Taurus.",
    wiki: "Aldebaran",
  },
  {
    id: "taurus", scope: ["deepSpace"], kind: "place", label: "Constellation", name: "Taurus",
    match: ["Taurus"],
    blurb: "A constellation shaped like a bull.",
    wiki: "Taurus (constellation)",
  },
];

/* ---------------------------------------------------------------------- */
/* FIGURES: 4 picture slots per chapter (opener, then one per paragraph)  */
/* plus spares that step in if a picture fails to load.                   */
/*   { nasa: "<NASA Image Library id>" } | { wiki: "<article title>" }    */
/*   | { url: "<direct NASA image>" }    + caption                        */
/* ---------------------------------------------------------------------- */

export const FIGURES = {
  moon: [
    {
      slots: [
        { nasa: "s69-19644", caption: "Eagle before it had a name: Lunar Module 5's top half is moved for inspection at the factory." },
        { nasa: "LRC-1964-B701_P-11454", caption: "A 1964 model of the lander. The design had already changed since Grumman's first plan in 1962." },
        { nasa: "LRC-1964-B701_P-11511", caption: "A 1964 artist's picture of the lander nearing the Moon." },
        { nasa: "S70-39998", caption: "A lunar module's bottom half at Grumman's Bethpage factory. This one is Lunar Module 9." },
      ],
      spares: [{ wiki: "Apollo Lunar Module", caption: "An Apollo lunar module." }],
    },
    {
      slots: [
        { nasa: "6900992", caption: "Eagle heads down to the Moon while Michael Collins stays in orbit." },
        { nasa: "as11-36-5355", caption: "Earth, photographed by the Apollo 11 crew on their way to the Moon." },
        { nasa: "S69-39593", caption: "Mission Control in Houston during Apollo 11's moonwalk." },
        { nasa: "jsc2007e045375", caption: "The view from Eagle's window after landing." },
      ],
      spares: [
        { wiki: "Apollo Guidance Computer", caption: "The kind of guidance computer that flew on Apollo." },
        { nasa: "S69-44464", caption: "A panorama of the Apollo 11 landing site." },
      ],
    },
    {
      slots: [
        { nasa: "as11-40-5903", caption: "Buzz Aldrin beside Eagle's leg. Neil Armstrong, who took the photo, is reflected in his visor." },
        { nasa: "as11-40-5866", caption: "Buzz Aldrin starts down Eagle's ladder. Photo by Neil Armstrong." },
        { nasa: "as11-40-5948", caption: "Aldrin with the seismometer in front of him and the laser mirror panel beyond it. The flag and Eagle are behind." },
        { nasa: "as11-40-5899", caption: "The plaque on Eagle's ladder leg." },
      ],
      spares: [
        { nasa: "as11-40-5942", caption: "Aldrin carries the two experiments to their spot." },
        { nasa: "as11-40-5880", caption: "A bootprint in the lunar soil." },
        { nasa: "as11-40-5927", caption: "Aldrin unloads the experiments from Eagle's storage bay." },
      ],
    },
    {
      slots: [
        { nasa: "as11-44-6642", caption: "Eagle's top half flies back to Columbia, with Earth rising behind it. Photo by Michael Collins." },
        { nasa: "KSC-as11-40-5964", caption: "Buzz Aldrin sets up an experiment at Tranquility Base, surrounded by bootprints." },
        { nasa: "as11-44-6550", caption: "Earth rising over the Moon's edge, seen from Apollo 11." },
        { nasa: "PIA12909", caption: "Eagle's landing site, photographed from orbit in 2009 by the Lunar Reconnaissance Orbiter." },
      ],
      spares: [{ nasa: "as11-40-5902", caption: "Aldrin and bootprints near Eagle." }],
    },
  ],

  mars: [
    {
      slots: [
        { nasa: "PIA04854", caption: "Opportunity being prepared for launch at Kennedy Space Center in 2003." },
        { nasa: "PIA05171", caption: "Engineers at JPL test how the rover will roll off its lander." },
        { nasa: "KSC-03pd1937", caption: "Workers lower a protective canister around Opportunity before launch." },
        { wiki: "Mars Exploration Rover", caption: "One of the twin Mars Exploration Rovers." },
      ],
      spares: [
        {
          url: "https://science.nasa.gov/wp-content/uploads/2024/03/mer-bythenumbers-infographic-feb2019.jpg",
          caption: "Spirit and Opportunity by the numbers.",
          credit: "NASA/JPL-Caltech",
          link: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
        },
      ],
    },
    {
      slots: [
        { nasa: "KSC-03pd2093", caption: "A Delta II Heavy rocket lifts off from Cape Canaveral with Opportunity on board, July 7, 2003." },
        { nasa: "KSC-03pd1061", caption: "Airbags and lander petals folded around one of the twin rovers before launch." },
        { nasa: "PIA05156", caption: "Inflated landing airbags. Their seams matched the marks Opportunity left in the Martian soil." },
        {
          url: ASSETS.panoramas.mars.image.url,
          caption: "Opportunity's own panorama of Eagle Crater, the tiny crater it rolled into.",
          credit: "NASA/JPL/Cornell",
          link: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
        },
      ],
      spares: [{ nasa: "PIA05251", caption: "Opportunity's landing site seen from orbit." }],
    },
    {
      slots: [
        { nasa: "PIA05273", caption: "'Berries' on the ground: a close-up of the tiny balls in the soil." },
        { nasa: "PIA18885", caption: "A microscope view of a Martian rock with the little balls stuck inside it." },
        { nasa: "PIA05513", caption: "Holes ground into the rock by Opportunity's arm, so its tools could look inside." },
        { nasa: "PIA06779", caption: "More 'blueberries' under Opportunity's microscope." },
      ],
      spares: [{ wiki: "Martian spherules", caption: "Martian 'blueberries'." }],
    },
    {
      slots: [
        { nasa: "PIA22074", caption: "Opportunity's wheel tracks in Perseverance Valley, 2017." },
        { nasa: "PIA20749", caption: "Marathon Valley. Opportunity passed marathon distance on its way here." },
        { nasa: "PIA22521", caption: "How the Sun faded in Opportunity's sky as the 2018 dust storm grew (simulated views)." },
        { nasa: "PIA22929", caption: "Opportunity's last picture: a dark, unfinished image sent on June 10, 2018." },
      ],
      spares: [
        { nasa: "PIA23178", caption: "Opportunity's whole route: 45.16 km from Eagle Crater to Perseverance Valley." },
        { nasa: "PIA19154", caption: "The marathon route, 2004 to 2015." },
      ],
    },
  ],

  deepSpace: [
    {
      slots: [
        { nasa: "ARC-1973-AC73-9019", caption: "Pioneer 10 during final assembly at TRW in California." },
        { nasa: "ARC-1972-A72-5621", caption: "Charles Hall, Hans Mark and Clarence Syvertson of NASA Ames with a copy of the Pioneer 10 plaque, 1972." },
        { nasa: "ARC-1972-AC72-2136", caption: "Pioneer F, soon to be renamed Pioneer 10, is readied for its trip to the launch site." },
        { nasa: "ARC-1972-AC72-2134", caption: "The finished spacecraft arrives in Florida." },
      ],
      spares: [{ wiki: "Pioneer 10", caption: "Pioneer 10." }],
    },
    {
      slots: [
        { nasa: "ARC-1972-AC72-1338", caption: "The plaque: a picture message from Earth." },
        { nasa: "ARC-1972-A72-2137", caption: "The plaque is fitted onto the spacecraft." },
        { wiki: "Pioneer plaque", caption: "The drawing engraved on the plaque." },
        { nasa: "ARC-1972-AC72-2135", caption: "Pioneer 10 in Florida before launch, with the plaque on its antenna struts." },
      ],
      spares: [
        {
          url: "https://assets.science.nasa.gov/content/dam/science/psd/solar/internal_resources/740/Pioneer_plaque_mounted_to_spacecraft.jpeg",
          caption: "The plaque mounted on the spacecraft.",
          credit: "NASA Ames",
          link: "https://science.nasa.gov/mission/pioneer-10/",
        },
      ],
    },
    {
      slots: [
        { nasa: "ARC-1973-AC73-4247", caption: "Rick Guidice's painting of Pioneer 10 passing Jupiter." },
        { nasa: "ARC-1972-AC72-2142", caption: "Liftoff at 8:49 p.m. on March 2, 1972." },
        { nasa: "ARC-1969-AC72-1353", caption: "Don Moore's painting of Pioneer 10 passing the Moon, 11 hours after launch." },
        { nasa: "ARC-1973-AC73-9341", caption: "Jupiter, pieced together from pictures Pioneer 10 took as it flew past." },
      ],
      spares: [{ nasa: "ARC-1973-AC73-9279", caption: "Jupiter's moon Ganymede, seen by Pioneer 10." }],
    },
    {
      slots: [
        { nasa: "ARC-1997-AC97-0036-1", caption: "NASA artwork of Pioneer 10 from 1997, the year regular contact ended." },
        { nasa: "ARC-1982-AC82-0178", caption: "'The Pioneer Family': a NASA painting of the Pioneer probes." },
        { wiki: "Goldstone Deep Space Communications Complex", caption: "Giant dish antennas like those at Goldstone, California, listened for Pioneer 10's fading signal." },
        { wiki: "Aldebaran", caption: "Aldebaran, the red star Pioneer 10 is heading toward." },
      ],
      spares: [{ nasa: "ARC-1997-AC97-0036-3", caption: "NASA artwork of Pioneer 10." }],
    },
  ],
};

/* ------------------------------ lookups ------------------------------- */

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matcherCache = new Map();
/** Regex + lookup table for every clickable word in one story. */
export function matcherFor(scope) {
  if (!matcherCache.has(scope)) {
    const pairs = GLOSSARY.filter((e) => e.match?.length && e.scope.includes(scope))
      .flatMap((e) => e.match.map((m) => [m, e]))
      .sort((a, b) => b[0].length - a[0].length);
    matcherCache.set(scope, {
      re: new RegExp(`\\b(${pairs.map(([m]) => escapeRe(m)).join("|")})\\b`, "g"),
      map: new Map(pairs),
    });
  }
  return matcherCache.get(scope);
}

/** Split text into plain strings and { entry, text } link parts. First mention of each entry only. */
export function splitTerms(text, scope) {
  const { re, map } = matcherFor(scope);
  const parts = [];
  const seen = new Set();
  let last = 0;
  for (const m of text.matchAll(re)) {
    const entry = map.get(m[1]);
    if (!entry || seen.has(entry.id)) continue;
    seen.add(entry.id);
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ entry, text: m[1] });
    last = m.index + m[1].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Glossary entry for a name from a chapter's people list (e.g. "Thomas J. Kelly (1929–2002)"). */
export function entryForPerson(name, scope) {
  const clean = name.replace(/\s*\(.*?\)\s*/g, "").trim();
  return GLOSSARY.find((e) => e.kind === "person" && e.scope.includes(scope) && (e.aka?.includes(clean) || e.name === clean)) ?? null;
}

export function figuresFor(destinationId, chapterIndex) {
  return FIGURES[destinationId]?.[chapterIndex] ?? { slots: [], spares: [] };
}
