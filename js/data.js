/**
 * FARM FIGHTER IV — Fighter Roster, Arena Lore, SVG Portraits, Specials & Tournament Data
 * Official Tournament Edition (Rev 4.02 — International Barnyard Combat Federation)
 */

export const FIGHTERS = [
  {
    id: 'cluck_norris',
    name: 'Cluck Norris',
    emoji: '🐔',
    species: 'Leghorn Grandmaster',
    origin: 'Sector 7 Henhouse, Kentucky',
    weightClass: '7.4 lbs (Roosterweight)',
    fightingStyle: 'Jeet Kune Bawk / Full-Contact Pecking',
    quote: 'The barnyard life chose him.',
    victoryCallout: 'POULTRY VICTORY!',
    winQuotes: [
      'You fought the beak, and the beak won.',
      'I don’t cross the road. The road moves out of my way.',
      'Consider yourself free-ranged into unconsciousness.'
    ],
    bio: 'Four-time defending World Agricultural Combat Champion and the only poultry ever banned from the Geneva Convention. After the infamous 1995 Feed Sack Incident, Cluck Norris spent three years meditating atop a rusty weathervane before returning for the Fourth Tournament to defend his title.',
    tournamentRecord: '142-0-1 (1 Draw against a mirrored patio door)',
    colors: {
      primary: '#ffffff',
      secondary: '#e63946',
      accent: '#ffbe0b',
      belt: '#1d3557',
      aura: '#ff4d6d'
    },
    stats: {
      speed: 9.2,
      power: 7.8,
      defense: 7.0,
      chaos: 9.5,
      hp: 1000,
      walkSpeed: 315,
      jumpForce: 670
    },
    specials: [
      {
        id: 'flying_spin_peck',
        name: 'Flying Spin Peck',
        inputHint: 'G (or Forward + G)',
        type: 'dash_spin',
        damage: 115,
        cooldown: 1.8,
        description: 'Propels horizontally like a feathered drill bit, delivering 3 rapid spinning beak strikes across the stage.'
      },
      {
        id: 'egg_barrage',
        name: 'Egg Barrage',
        inputHint: 'Back/Down + G',
        type: 'projectile_barrage',
        damage: 95,
        cooldown: 1.6,
        description: 'Launches a three-round burst of Grade-AA aerodynamic farm eggs at supersonic velocity.'
      },
      {
        id: 'wakeup_crow',
        name: 'Wake-Up Crow',
        inputHint: 'Up + G (or Cycle)',
        type: 'anti_air_upper',
        damage: 125,
        cooldown: 2.0,
        description: 'A 140-decibel rising rooster uppercut that shatters eardrums and launches airborne challengers.'
      }
    ],
    doNotPress: {
      name: 'RAGE CROWING',
      subtitle: '5:00 AM APOCALYPSE',
      callout: 'RAGE CROWING!!',
      damage: 245,
      selfBackfireChance: 0.18,
      selfBackfireText: 'CLUCK DEAFENED HIMSELF FOR 0.5s!',
      description: 'Summons a blinding blood-orange 5:00 AM sunrise and a stampede of 25 caffeinated hens that carpet-bomb the entire arena.'
    }
  },
  {
    id: 'moo_tai',
    name: 'Moo Tai',
    emoji: '🐄',
    species: 'Holstein Muay Thai Legend',
    origin: 'Sacred Pastures of Wisconsin',
    weightClass: '1,480 lbs (Super-Bovine)',
    fightingStyle: 'Eight Hooves of Dairy Destruction',
    quote: 'Pain is temporary. Hay is forever.',
    victoryCallout: 'MOO TAI WINS!',
    winQuotes: [
      'Your technique lacks calcium.',
      'Twelve winters kicking frozen hay bales prepared me for this moment.',
      'Do not cry over spilled opponents.'
    ],
    bio: 'A stoic martial monk who mastered the art of standing completely still in a thunderstorm until lightning apologized. Wearing braided hemp ankle wraps and a ceremonial brass cowbell, Moo Tai enters the Fourth Tournament to prove that pasture discipline surpasses barnyard brawling.',
    tournamentRecord: '98-4-0 (All 4 losses due to stopping mid-round to chew cud)',
    colors: {
      primary: '#f8f9fa',
      secondary: '#212529',
      accent: '#fb5607',
      belt: '#e63946',
      aura: '#ff9f1c'
    },
    stats: {
      speed: 6.5,
      power: 9.6,
      defense: 9.4,
      chaos: 8.5,
      hp: 1120,
      walkSpeed: 255,
      jumpForce: 610
    },
    specials: [
      {
        id: 'stampede_charge',
        name: 'Stampede Charge',
        inputHint: 'G (or Forward + G)',
        type: 'armored_charge',
        damage: 130,
        cooldown: 2.0,
        description: 'Lowers both horns and charges like a freight train, plowing through projectiles and launching the opponent.'
      },
      {
        id: 'hoof_uppercut',
        name: 'Hoof Uppercut',
        inputHint: 'Up + G',
        type: 'rising_upper',
        damage: 135,
        cooldown: 2.1,
        description: 'The legendary "MOO-RYUKEN"—a rising flaming hind-hoof uppercut that sends rivals into the rafters.'
      },
      {
        id: 'haymaker',
        name: 'Haymaker',
        inputHint: 'Back/Down + G',
        type: 'heavy_slam',
        damage: 120,
        cooldown: 1.9,
        description: 'Hurls a 400-pound compressed square hay bale that crushes anyone in its trajectory.'
      }
    ],
    doNotPress: {
      name: 'MOOPOCALYPSE',
      subtitle: 'ORBITAL DAIRY STRIKE',
      callout: 'MOOPOCALYPSE!!',
      damage: 265,
      selfBackfireChance: 0.15,
      selfBackfireText: 'SLIPPED ON 2% MILK SPILL!',
      description: 'Leaps into the stratosphere and rains down giant aged cheddar wheels, pressurized milk tankers, and a full-scale bovine meteor impact.'
    }
  },
  {
    id: 'ham_solo',
    name: 'Ham Solo',
    emoji: '🐖',
    species: 'Yorkshire Scoundrel',
    origin: 'Trough Sector 12, Iowa',
    weightClass: '620 lbs (Cruiser-Swine)',
    fightingStyle: 'Unsanctioned Mud-Pit Brawler',
    quote: 'Never tell me the odds.',
    victoryCallout: 'SWINE SUPREMACY!',
    winQuotes: [
      'Ham shot first. Check the instant replay.',
      'I made the County Fair Run in less than twelve furlongs.',
      'Sorry about the mess. Keep the truffles.'
    ],
    bio: 'A dashing rogue, mud-pit gambler, and former blue-ribbon fugitive who owes three hundred bushels of corn to a syndicate in Nebraska. Wearing a tactical vest that barely buttons over his belly, Ham Solo fights dirty, slides fast, and always carries a concealed carnival mallet.',
    tournamentRecord: '77-12-0 (Disqualified twice for eating the referee’s clipboard)',
    colors: {
      primary: '#ffafcc',
      secondary: '#3a0ca3',
      accent: '#ffd166',
      belt: '#7209b7',
      aura: '#f72585'
    },
    stats: {
      speed: 7.6,
      power: 8.8,
      defense: 8.5,
      chaos: 9.8,
      hp: 1060,
      walkSpeed: 280,
      jumpForce: 635
    },
    specials: [
      {
        id: 'bacon_blitz',
        name: 'Bacon Blitz',
        inputHint: 'G (or Forward + G)',
        type: 'low_slide',
        damage: 118,
        cooldown: 1.7,
        description: 'Ignites a friction-heated belly slide across the arena floor that sweeps opponents off their feet.'
      },
      {
        id: 'trough_dive',
        name: 'Trough Dive',
        inputHint: 'Up + G',
        type: 'leap_splash',
        damage: 128,
        cooldown: 2.0,
        description: 'Ballistic 600-pound cannonball belly-flop that triggers a mud shockwave on impact.'
      },
      {
        id: 'hammer_time_special',
        name: 'Hammer Time',
        inputHint: 'Back/Down + G',
        type: 'mallet_smash',
        damage: 132,
        cooldown: 2.1,
        description: 'Produces an oversized wooden carnival high-striker mallet from nowhere and flattens the target.'
      }
    ],
    doNotPress: {
      name: 'HAMMER TIME',
      subtitle: '10-TON CARNIVAL BONANZA',
      callout: 'STOP! HAMMER TIME!!',
      damage: 255,
      selfBackfireChance: 0.22,
      selfBackfireText: 'DROPPED THE MALLET ON HIS OWN HOOF!',
      description: 'Drops a disco ball from the ceiling while giant golden carnival mallets and a 10-ton Prize Hog Anvil pummel the entire stage.'
    }
  },
  {
    id: 'billy_the_kid',
    name: 'Billy the Kid',
    emoji: '🐐',
    species: 'Alpine Outlaw Goat',
    origin: 'Tin Can Gulch, Montana',
    weightClass: '165 lbs (Welter-Caprine)',
    fightingStyle: 'Zero-Provocation Cranial Impact',
    quote: 'I will eat your shirt.',
    victoryCallout: 'THE GOAT HAS SPOKEN!',
    winQuotes: [
      'Nice championship belt. Tastes like Cordura nylon and brass.',
      'You were standing upright. I took that personally.',
      'BAAAA MEANS NO MERCY.'
    ],
    bio: 'Wanted in fourteen agricultural jurisdictions for unprovoked headbutting and grand theft laundry. Billy the Kid does not care about prize money, tournament prestige, or martial arts honor—he entered Farm Fighter IV solely because he heard the trophy has a delicious aluminum baseplate.',
    tournamentRecord: '119-2-0 (Once headbutted an oak tree until the tree forfeited)',
    colors: {
      primary: '#e9ecef',
      secondary: '#6c757d',
      accent: '#06d6a0',
      belt: '#d62828',
      aura: '#06d6a0'
    },
    stats: {
      speed: 9.0,
      power: 8.5,
      defense: 7.4,
      chaos: 10.0,
      hp: 990,
      walkSpeed: 325,
      jumpForce: 690
    },
    specials: [
      {
        id: 'headbutt_rush',
        name: 'Headbutt Rush',
        inputHint: 'G (or Forward + G)',
        type: 'battering_ram',
        damage: 122,
        cooldown: 1.6,
        description: 'A relentless three-hit horn-first battering ram rush that crumples guards and sheet metal alike.'
      },
      {
        id: 'fence_vault',
        name: 'Fence Vault',
        inputHint: 'Up + G',
        type: 'acrobatic_dive',
        damage: 118,
        cooldown: 1.8,
        description: 'Springs off an invisible barbed-wire fencepost for a high-velocity diagonal hoof drop.'
      },
      {
        id: 'unprovoked_aggression',
        name: 'Unprovoked Aggression',
        inputHint: 'Back/Down + G',
        type: 'berserk_flurry',
        damage: 126,
        cooldown: 1.9,
        description: 'Enters a chaotic bucking-and-chewing tornado, flinging half-chewed tin cans and license plates.'
      }
    ],
    doNotPress: {
      name: 'UNPROVOKED AGRICULTURE',
      subtitle: 'RUNAWAY COMBINE & TIN CAN STORM',
      callout: 'UNPROVOKED AGRICULTURE!!',
      damage: 250,
      selfBackfireChance: 0.20,
      selfBackfireText: 'ATE A SPICY CAR BATTERY BY MISTAKE!',
      description: 'Summons a runaway tractor-trailer of flying tin cans, overalls, and lawnmower blades while Billy ricochets off every wall at Mach 2.'
    }
  },
  {
    id: 'woolverine',
    name: 'Woolverine',
    emoji: '🐑',
    species: 'Weapon-X Merino',
    origin: 'Classified Highland Grazing Facility',
    weightClass: '240 lbs (85% Pure Lanolin)',
    fightingStyle: 'Electrostatic Fleece & Twin Shears',
    quote: 'The fluff hides the violence.',
    victoryCallout: 'FLUFF FATALITY!',
    winQuotes: [
      '100% Virgin Wool. 0% Remorse.',
      'Dry clean only, bub.',
      'You just got shrunk in a hot wash.'
    ],
    bio: 'Created when a clandestine Scottish sweater factory accidentally infused a champion Merino ram with indestructible grooming shears and 40,000 volts of static electricity. Beneath his cloud-like exterior lies a brooding loner who refuses to be knitted into cardigans.',
    tournamentRecord: '89-6-0 (Undefeated during sweater weather)',
    colors: {
      primary: '#fff8e7',
      secondary: '#2b2d42',
      accent: '#ffbe0b',
      belt: '#3a86ff',
      aura: '#00bbf9'
    },
    stats: {
      speed: 8.2,
      power: 8.6,
      defense: 9.0,
      chaos: 9.1,
      hp: 1050,
      walkSpeed: 295,
      jumpForce: 650
    },
    specials: [
      {
        id: 'rolling_fleece',
        name: 'Rolling Fleece Attack',
        inputHint: 'G (or Forward + G)',
        type: 'cannonball_roll',
        damage: 120,
        cooldown: 1.7,
        description: 'Tucks into a high-density sphere of pressurized wool and ricochets into the opponent like a fuzzy wrecking ball.'
      },
      {
        id: 'rage_shearing',
        name: 'Rage Shearing',
        inputHint: 'Back/Down + G',
        type: 'claw_slash',
        damage: 130,
        cooldown: 1.9,
        description: 'Unsheathes twin chrome sheep-shears ("SNIKT-BAA!") for a blinding cross-slash combo.'
      },
      {
        id: 'fluff_fury',
        name: 'Fluff Fury',
        inputHint: 'Up + G',
        type: 'static_burst',
        damage: 116,
        cooldown: 1.8,
        description: 'Rubs his fleece together to discharge a 50,000-volt static cling lightning dome.'
      }
    ],
    doNotPress: {
      name: 'SHEAR CATACLYSM',
      subtitle: 'STATIC MEGA-FLEECE OVERLOAD',
      callout: 'MAXIMUM OVER-FLEECE!!',
      damage: 250,
      selfBackfireChance: 0.16,
      selfBackfireText: 'TEMPORARY BAD HAIR DAY RECOIL!',
      description: 'Expands into a gargantuan electrostatic wool cumulonimbus cloud that zaps the entire arena with sweater-lightning and flying yarn bombs.'
    }
  },
  {
    id: 'quackie_chan',
    name: 'Quackie Chan',
    emoji: '🦆',
    species: 'Pekin Stunt Grandmaster',
    origin: 'Lotus Duck Pond, Hong Kong',
    weightClass: '9.2 lbs (Featherweight)',
    fightingStyle: 'Five-Pond Drunken Waterfowl Kung Fu',
    quote: 'Be waterfowl, my friend.',
    victoryCallout: 'WATERFOWL SUPREMACY!',
    winQuotes: [
      'Please stay for the end credits to watch my blooper reel.',
      'I did not want trouble, yet trouble brought stale sourdough bread.',
      'Water rolls off my back. Your punches miss my beak.'
    ],
    bio: 'World-renowned martial artist, pond acrobat, and stunt duck who famously performs all his own choreography without insurance. Armed with uncanny reflexes and whatever folding stepladder or minnow bucket happens to be nearby, Quackie Chan turns every fight into an action-comedy masterpiece.',
    tournamentRecord: '134-5-0 (Holds record for most consecutive kicks while holding a porcelain vase)',
    colors: {
      primary: '#ffffff',
      secondary: '#0077b6',
      accent: '#ff9f1c',
      belt: '#111111',
      aura: '#48cae4'
    },
    stats: {
      speed: 9.7,
      power: 7.5,
      defense: 7.5,
      chaos: 9.4,
      hp: 980,
      walkSpeed: 335,
      jumpForce: 700
    },
    specials: [
      {
        id: 'wing_slap',
        name: 'Wing Slap',
        inputHint: 'G (or Back/Down + G)',
        type: 'hundred_slap',
        damage: 116,
        cooldown: 1.5,
        description: 'Unleashes a blur of 40 rapid-fire open-wing slaps that stun-locks anyone within beak range.'
      },
      {
        id: 'rapid_quack_combo',
        name: 'Rapid Quack Combo',
        inputHint: 'Up + G',
        type: 'flip_sonic',
        damage: 122,
        cooldown: 1.8,
        description: 'Performs a backflip stepladder kick followed by a concussive "QUACK-DO-KEN" sonic ring.'
      },
      {
        id: 'flying_feather_kick',
        name: 'Flying Feather Kick',
        inputHint: 'Forward + G',
        type: 'bicycle_kick',
        damage: 126,
        cooldown: 1.8,
        description: 'Flies horizontally across the stage delivering a 5-hit webbed-foot bicycle kick.'
      }
    ],
    doNotPress: {
      name: 'WAY OF THE WATERFOWL',
      subtitle: 'SWAN BOAT PYROTECHNIC STUNT SHOW',
      callout: 'STUNT TEAM GO!!',
      damage: 248,
      selfBackfireChance: 0.18,
      selfBackfireText: 'BLOOPER REEL: BUMPED BEAK ON STEPLADDER!',
      description: 'Floods the stage with a tidal wave of rubber ducks and rides a rocket-powered pedal swan boat firing Roman candles across the screen.'
    }
  },
  {
    id: 'marey_poppins',
    name: 'Marey Poppins',
    emoji: '🐴',
    species: 'Refined Thoroughbred Champion',
    origin: 'Paddock Lane, Royal Haymarket',
    weightClass: '1,150 lbs (Equestrian Elite)',
    fightingStyle: 'Elegant Kicks & Graceful Equine Combat',
    normalAttackName: 'Hoof Jab',
    quote: 'Practically perfect in every hay.',
    victoryCallout: 'MAREY POPPINS WINS!',
    winQuotes: [
      'A spoonful of hoofing helps the medicine go down.',
      'Practically perfect in every hay.',
      'Mind the horse.'
    ],
    bio: 'A distinguished equestrian aristocrat who fights with impeccable Victorian poise, mid-range precision, and polite ruthlessness. Armed with polished bronze horseshoes and an antique sun parasol, Marey Poppins entered Farm Fighter IV to prove that high-society breeding produces the most devastating roundhouse kicks in the federation.',
    tournamentRecord: '104-3-0 (Undefeated on derby turf; 3 forfeits to attend high tea)',
    colors: {
      primary: '#9c6644',
      secondary: '#4a2810',
      accent: '#e0aaff',
      belt: '#c77dff',
      aura: '#e0aaff'
    },
    stats: {
      speed: 9.4,
      power: 8.7,
      defense: 7.8,
      chaos: 9.2,
      hp: 1020,
      walkSpeed: 325,
      jumpForce: 675
    },
    specials: [
      {
        id: 'haystorm',
        name: 'Haystorm',
        inputHint: 'G (or Forward + G)',
        type: 'dash_spin',
        damage: 122,
        cooldown: 1.7,
        description: 'Whirls into a graceful equestrian pirouette, whipping up a torrential cyclone of golden hay and high-speed floral petals across the stage.'
      },
      {
        id: 'carousel_kick',
        name: 'Carousel Kick',
        inputHint: 'Up + G',
        type: 'rising_upper',
        damage: 132,
        cooldown: 2.0,
        description: 'Performs a breathtaking ascending vertical hind-kick with polished bronze horseshoes that launches opponents straight into the rafters.'
      },
      {
        id: 'stable_spin',
        name: 'Stable Spin',
        inputHint: 'Back/Down + G',
        type: 'hundred_slap',
        damage: 118,
        cooldown: 1.8,
        description: 'A rapid 360-degree sweep of devastating equine hoof strikes executed with refined posture and pinpoint accuracy.'
      }
    ],
    doNotPress: {
      name: 'PONY APOCALYPSE',
      subtitle: 'MINIATURE HORSE STAMPEDE',
      callout: 'PONY APOCALYPSE!',
      damage: 260,
      selfBackfireChance: 0.20,
      selfBackfireText: 'STAMPEDE TRAMPLED BOTH SIDES OF THE RING!',
      description: 'Unleashes a thunderous stampede of thirty tiny pastel ponies galloping across the screen in a tidal wave of glitter, horseshoes, and chaotic turf clods that damages everything in their path.'
    }
  },
  {
    id: 'dalai_llama',
    name: 'Dalai Llama',
    emoji: '🦙',
    species: 'High-Altitude Andean Ascetic',
    origin: 'Monastery of the Sacred Alfalfa Ridge',
    weightClass: '310 lbs (Tranquil Camelid)',
    fightingStyle: 'Transcendental Spit & Counter-Striking Zen',
    normalAttackName: 'Llama Slap',
    quote: 'Inner peace. Outer violence.',
    victoryCallout: 'DALAI LLAMA WINS!',
    winQuotes: [
      'The path to enlightenment is surprisingly punchy.',
      'Peace was never an option.',
      'Om.'
    ],
    bio: 'A serene monk from the highest mountain pastures who achieved absolute spiritual enlightenment, only to realize tournament fighting is an extraordinarily efficient method for achieving inner clarity. Clad in saffron prayer beads and traditional woven sashes, Dalai Llama deflects incoming hostility and counters with supersonic projectile saliva and unprovoked headbutts.',
    tournamentRecord: '92-1-0 (Sole loss occurred during a 4-hour state of suspended animation)',
    colors: {
      primary: '#fdf0d5',
      secondary: '#c1121f',
      accent: '#ffb703',
      belt: '#d4a373',
      aura: '#ffb703'
    },
    stats: {
      speed: 7.8,
      power: 8.4,
      defense: 9.6,
      chaos: 8.9,
      hp: 1080,
      walkSpeed: 275,
      jumpForce: 630
    },
    specials: [
      {
        id: 'enlightened_spit',
        name: 'Enlightened Spit',
        inputHint: 'G (or Forward + G)',
        type: 'projectile_barrage',
        damage: 118,
        cooldown: 1.6,
        description: 'Channels profound cosmic chi into a supersonic, glowing orb of projectile saliva that travels full-screen and pierces guards.'
      },
      {
        id: 'zen_headbutt',
        name: 'Zen Headbutt',
        inputHint: 'Back/Down + G',
        type: 'armored_charge',
        damage: 126,
        cooldown: 1.9,
        description: 'Achieves total cranial stillness before launching forward like a serene battering ram with armor properties.'
      },
      {
        id: 'transcendental_kick',
        name: 'Transcendental Kick',
        inputHint: 'Up + G',
        type: 'rising_upper',
        damage: 130,
        cooldown: 2.0,
        description: 'Levitates inches off the turf in lotus posture and delivers a soaring ascending dual-hoof kick flanked by glowing mandalas.'
      }
    ],
    doNotPress: {
      name: 'LLAMAGEDDON',
      subtitle: 'COSMIC SALIVATION & WOOL TEMPEST',
      callout: 'LLAMAGEDDON!',
      damage: 255,
      selfBackfireChance: 0.19,
      selfBackfireText: 'ENLIGHTENMENT TOO POWERFUL: TEMPORARY LEVITATION STUN!',
      description: 'Opens the third eye of the barnyard, filling the entire screen with a blinding blizzard of glowing lotus mandalas, spinning prayer wheels, flying wool clouds, and torrential spiritual spit.'
    }
  }
];

export const ARENAS = [
  {
    id: 'the_barn',
    name: 'The Barn',
    subtitle: 'Classic Championship Timber Arena',
    badge: 'CLASSIC ARENA',
    hazardSummary: 'Pure tournament footing. No external interference.',
    description: 'The hollowed-out cathedral of agricultural combat. The floorboards still bear the scorch marks of the 1994 Hayloft Finals.',
    skyTop: '#2c1810',
    skyBottom: '#5c3317',
    floorColor: '#8b5a2b',
    floorTrim: '#d4a373',
    hazardType: 'none'
  },
  {
    id: 'county_fair',
    name: 'County Fair',
    subtitle: 'Midway Grandstand & Blue-Ribbon Ring',
    badge: 'FLYING CORN HAZARD',
    hazardSummary: 'Rowdy spectators occasionally hurl ears of sweet corn into the ring!',
    description: 'Beneath the neon Ferris wheel and funnel-cake smoke, over-caffeinated fairgoers throw roasted corn cobs at the competitors.',
    skyTop: '#1d1145',
    skyBottom: '#7209b7',
    floorColor: '#b5838d',
    floorTrim: '#ffbe0b',
    hazardType: 'corn'
  },
  {
    id: 'tractor_supply',
    name: 'Tractor Supply Parking Lot',
    subtitle: 'Aisle 9 Asphalt Showdown',
    badge: 'RUNAWAY CARTS',
    hazardSummary: 'Loose shopping carts periodically roll across the asphalt at dangerous speeds!',
    description: 'Right between the propane tank cage and the clearance riding mowers. Watch out for runaway steel shopping carts rolling down the 4% grade.',
    skyTop: '#1b263b',
    skyBottom: '#415a77',
    floorColor: '#343a40',
    floorTrim: '#ffbe0b',
    hazardType: 'shopping_cart'
  },
  {
    id: 'corn_maze',
    name: 'Corn Maze',
    subtitle: 'Labyrinth of the Harvest Moon',
    badge: 'VISIBILITY OBSTACLES',
    hazardSummary: 'Dense foreground corn stalks and drifting harvest mist obscure fighter movement!',
    description: 'A claustrophobic clearing deep inside a 90-acre corn maze. Foreground stalks and autumn fog banks obscure vision when fighters cross the center.',
    skyTop: '#081c15',
    skyBottom: '#1b4332',
    floorColor: '#4a3b2c',
    floorTrim: '#52b788',
    hazardType: 'visibility'
  },
  {
    id: 'aquarium',
    name: 'Two-Story Indoor Aquarium',
    subtitle: 'Metropolitan Marine Pavilion',
    badge: 'STRICTLY NO FISHING',
    hazardSummary: 'Features a prominent illuminated NO FISHING sign. Nobody mentions it. Ever.',
    description: 'A two-story panoramic glass tunnel surrounded by sharks, giant halibut, and an enormous backlit regulatory sign.',
    skyTop: '#03045e',
    skyBottom: '#0077b6',
    floorColor: '#023e8a',
    floorTrim: '#00b4d8',
    hazardType: 'aquarium'
  }
];

export const RIDICULOUS_TIPS = [
  'TOURNAMENT RULE #1: Do NOT press the giant red button labeled DO NOT PRESS THIS BUTTON. Our legal department is still paying off the 1997 Silo Finals.',
  'PRO TIP: Cluck Norris’s Wake-Up Crow has 4 frames of invincibility and 140 decibels of unnecessary rudeness.',
  'HISTORICAL FACT: Billy the Kid was briefly banned in 1996 after eating the tournament bracket board and both commentators’ neckties.',
  'STAGE ADVISORY: In the Tractor Supply Parking Lot, runaway shopping carts yield to nobody. Jump over them or accept your receipt.',
  'REMINDER: Blocking (Hold Away or Down) reduces incoming damage by 75% and prevents your feathers from being Embarrassed.',
  'LORE ARCHIVE: Nobody knows why the tournament is held inside a Two-Story Indoor Aquarium, and you are strongly advised not to ask.',
  'FRAME DATA: Moo Tai’s Hoof Uppercut is +12 on block if you measure in metric pastures.',
  'CROWD ETIQUETTE: At the County Fair, spectators throw corn out of respect. Or hostility. Either way, watch your head.',
  'FIGHTER SECRET: Pressing Forward + Crazy Attack, Back/Down + Crazy Attack, or Up + Crazy Attack unleashes each animal’s 3 distinct signature specials!',
  'VETERAN TIP: Ham Solo claims he won the 1993 Regional Mud Pit Championship, though county records show the fairgrounds were a Spirit Halloween that year.',
  'SAFETY BULLETIN: Woolverine’s static electricity is 100% compliant with International Merino Combat Regulations.',
  'DOJO WISDOM: Quackie Chan performs all his own stunts. If he gets knocked out, tell the paramedics it was choreography.',
  'EQUINE ETIQUETTE: Marey Poppins insists that all opponents be kicked with pointed hooves, Victorian posture, and no excuses.',
  'MEDITATION WARNING: If Dalai Llama closes his eyes during a round, step back immediately. The inner peace is highly concussive.'
];

export const ROUND_CALLOUTS = [
  'CLOBBERING COMMENCES!',
  'UNNECESSARY VIOLENCE!',
  'BARNYARD BEDLAM!',
  'AGRICULTURAL AGGRESSION!',
  'SETTLE THIS IN THE DIRT!'
];

/**
 * Generates an inline SVG portrait string for a fighter (used in Character Select, VS Screen, Bios, Leaderboards).
 */
export function getFighterSVG(fighterId, flip = false) {
  const transform = flip ? 'transform="scale(-1,1) translate(-120,0)"' : '';
  switch (fighterId) {
    case 'cluck_norris':
      return `<svg viewBox="0 0 120 120" class="fighter-svg" aria-hidden="true">
        <g ${transform}>
          <rect x="6" y="6" width="108" height="108" rx="18" fill="#2b0912" stroke="#ffbe0b" stroke-width="3.5"/>
          <circle cx="60" cy="64" r="40" fill="#e63946" opacity="0.22"/>
          <!-- Red Comb -->
          <path d="M44 26 C44 12, 56 12, 58 24 C62 10, 74 12, 72 26 C78 15, 86 22, 79 33 Z" fill="#e63946" stroke="#111" stroke-width="2.5"/>
          <!-- Body & Karate Gi -->
          <path d="M28 110 L35 68 L85 68 L92 110 Z" fill="#ffffff" stroke="#111" stroke-width="3"/>
          <path d="M44 68 L60 92 L76 68" fill="none" stroke="#e63946" stroke-width="4"/>
          <rect x="33" y="92" width="54" height="8" rx="3" fill="#111"/>
          <!-- Head -->
          <ellipse cx="60" cy="50" rx="24" ry="22" fill="#ffffff" stroke="#111" stroke-width="3"/>
          <!-- Martial Arts Headband -->
          <rect x="36" y="34" width="48" height="9" rx="3" fill="#e63946" stroke="#111" stroke-width="2"/>
          <path d="M36 37 L18 30 L22 44 Z" fill="#e63946" stroke="#111" stroke-width="2"/>
          <!-- Fierce Eyes & Brow -->
          <polygon points="46,44 58,48 46,51" fill="#111"/>
          <polygon points="74,44 62,48 74,51" fill="#111"/>
          <!-- Wattle & Sharp Beak -->
          <ellipse cx="56" cy="66" rx="5" ry="7" fill="#e63946" stroke="#111" stroke-width="2"/>
          <ellipse cx="65" cy="66" rx="5" ry="7" fill="#e63946" stroke="#111" stroke-width="2"/>
          <polygon points="52,54 84,58 54,64" fill="#ffbe0b" stroke="#111" stroke-width="2.5"/>
        </g>
      </svg>`;

    case 'moo_tai':
      return `<svg viewBox="0 0 120 120" class="fighter-svg" aria-hidden="true">
        <g ${transform}>
          <rect x="6" y="6" width="108" height="108" rx="18" fill="#1b1429" stroke="#fb5607" stroke-width="3.5"/>
          <circle cx="60" cy="64" r="40" fill="#fb5607" opacity="0.22"/>
          <!-- Horns -->
          <path d="M35 34 Q16 18 24 10 Q34 18 43 28 Z" fill="#ffd166" stroke="#111" stroke-width="2.5"/>
          <path d="M85 34 Q104 18 96 10 Q86 18 77 28 Z" fill="#ffd166" stroke="#111" stroke-width="2.5"/>
          <!-- Shoulders & Muay Thai Mongkhon / Sash -->
          <path d="M22 110 L30 66 L90 66 L98 110 Z" fill="#f8f9fa" stroke="#111" stroke-width="3"/>
          <circle cx="42" cy="84" r="9" fill="#212529"/>
          <circle cx="78" cy="92" r="11" fill="#212529"/>
          <!-- Head -->
          <rect x="36" y="26" width="48" height="44" rx="14" fill="#f8f9fa" stroke="#111" stroke-width="3"/>
          <path d="M36 36 Q52 46 48 26 Z" fill="#212529"/>
          <!-- Muay Thai Headband -->
          <rect x="35" y="30" width="50" height="7" rx="3" fill="#e63946" stroke="#111" stroke-width="2"/>
          <!-- Snout & Gold Nose Ring -->
          <rect x="38" y="52" width="44" height="22" rx="10" fill="#ffccd5" stroke="#111" stroke-width="2.5"/>
          <circle cx="49" cy="61" r="3.5" fill="#111"/>
          <circle cx="71" cy="61" r="3.5" fill="#111"/>
          <circle cx="60" cy="71" r="6" fill="none" stroke="#ffbe0b" stroke-width="3.5"/>
          <!-- Determined Eyes -->
          <line x1="43" y1="42" x2="56" y2="46" stroke="#111" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="77" y1="42" x2="64" y2="46" stroke="#111" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="50" cy="47" r="3" fill="#111"/>
          <circle cx="70" cy="47" r="3" fill="#111"/>
        </g>
      </svg>`;

    case 'ham_solo':
      return `<svg viewBox="0 0 120 120" class="fighter-svg" aria-hidden="true">
        <g ${transform}>
          <rect x="6" y="6" width="108" height="108" rx="18" fill="#191233" stroke="#f72585" stroke-width="3.5"/>
          <circle cx="60" cy="64" r="40" fill="#f72585" opacity="0.22"/>
          <!-- Smuggler Vest & Torso -->
          <path d="M24 110 L30 68 L90 68 L96 110 Z" fill="#ffafcc" stroke="#111" stroke-width="3"/>
          <path d="M28 68 L48 68 L45 110 L24 110 Z" fill="#2b2d42" stroke="#111" stroke-width="2.5"/>
          <path d="M72 68 L92 68 L96 110 L75 110 Z" fill="#2b2d42" stroke="#111" stroke-width="2.5"/>
          <!-- Ears -->
          <polygon points="32,38 22,18 45,28" fill="#ffafcc" stroke="#111" stroke-width="2.5"/>
          <polygon points="88,38 98,18 75,28" fill="#ffafcc" stroke="#111" stroke-width="2.5"/>
          <!-- Head -->
          <circle cx="60" cy="50" r="26" fill="#ffafcc" stroke="#111" stroke-width="3"/>
          <!-- Cool Aviator Shades -->
          <rect x="38" y="38" width="19" height="11" rx="3" fill="#111" stroke="#ffd166" stroke-width="2"/>
          <rect x="63" y="38" width="19" height="11" rx="3" fill="#111" stroke="#ffd166" stroke-width="2"/>
          <line x1="57" y1="42" x2="63" y2="42" stroke="#ffd166" stroke-width="2.5"/>
          <!-- Pig Snout & Smirk -->
          <ellipse cx="60" cy="58" rx="13" ry="9" fill="#ff758f" stroke="#111" stroke-width="2.5"/>
          <circle cx="55" cy="58" r="3" fill="#111"/>
          <circle cx="65" cy="58" r="3" fill="#111"/>
          <path d="M48 69 Q62 74 74 66" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
        </g>
      </svg>`;

    case 'billy_the_kid':
      return `<svg viewBox="0 0 120 120" class="fighter-svg" aria-hidden="true">
        <g ${transform}>
          <rect x="6" y="6" width="108" height="108" rx="18" fill="#0d2622" stroke="#06d6a0" stroke-width="3.5"/>
          <circle cx="60" cy="64" r="40" fill="#06d6a0" opacity="0.22"/>
          <!-- Curved Ridged Horns -->
          <path d="M46 28 Q24 8 14 26 Q28 24 38 36 Z" fill="#adb5bd" stroke="#111" stroke-width="2.5"/>
          <path d="M74 28 Q96 8 106 26 Q92 24 82 36 Z" fill="#adb5bd" stroke="#111" stroke-width="2.5"/>
          <!-- Body & Outlaw Bandana -->
          <path d="M30 110 L38 68 L82 68 L90 110 Z" fill="#e9ecef" stroke="#111" stroke-width="3"/>
          <polygon points="36,68 84,68 60,92" fill="#e63946" stroke="#111" stroke-width="2.5"/>
          <!-- Goat Head & Beard -->
          <polygon points="38,30 82,30 74,68 46,68" fill="#e9ecef" stroke="#111" stroke-width="3"/>
          <polygon points="52,68 68,68 60,86" fill="#ced4da" stroke="#111" stroke-width="2"/>
          <!-- Crazy Rectangular Goat Pupils -->
          <circle cx="49" cy="46" r="7" fill="#ffbe0b" stroke="#111" stroke-width="2"/>
          <circle cx="71" cy="46" r="7" fill="#ffbe0b" stroke="#111" stroke-width="2"/>
          <rect x="45" y="44" width="8" height="4" fill="#111"/>
          <rect x="67" y="44" width="8" height="4" fill="#111"/>
          <!-- Chewing a Tin Can / Shirt scrap -->
          <path d="M48 60 L72 60" stroke="#111" stroke-width="3"/>
          <polygon points="64,60 78,56 76,68" fill="#3a86ff" stroke="#111" stroke-width="2"/>
        </g>
      </svg>`;

    case 'woolverine':
      return `<svg viewBox="0 0 120 120" class="fighter-svg" aria-hidden="true">
        <g ${transform}>
          <rect x="6" y="6" width="108" height="108" rx="18" fill="#121e31" stroke="#00bbf9" stroke-width="3.5"/>
          <circle cx="60" cy="64" r="40" fill="#00bbf9" opacity="0.22"/>
          <!-- Giant Fluffy Wool Body & Cloud -->
          <circle cx="38" cy="78" r="20" fill="#fff8e7" stroke="#111" stroke-width="2.5"/>
          <circle cx="82" cy="78" r="20" fill="#fff8e7" stroke="#111" stroke-width="2.5"/>
          <circle cx="60" cy="86" r="24" fill="#fff8e7" stroke="#111" stroke-width="2.5"/>
          <!-- Wolverine Winged Mask Face -->
          <ellipse cx="60" cy="52" rx="22" ry="20" fill="#2b2d42" stroke="#111" stroke-width="3"/>
          <polygon points="38,48 22,26 48,40" fill="#ffbe0b" stroke="#111" stroke-width="2.5"/>
          <polygon points="82,48 98,26 72,40" fill="#ffbe0b" stroke="#111" stroke-width="2.5"/>
          <!-- Fluffy Wool Topknot -->
          <circle cx="50" cy="28" r="11" fill="#fff8e7" stroke="#111" stroke-width="2.5"/>
          <circle cx="70" cy="28" r="11" fill="#fff8e7" stroke="#111" stroke-width="2.5"/>
          <circle cx="60" cy="24" r="13" fill="#fff8e7" stroke="#111" stroke-width="2.5"/>
          <!-- Glowing White Eyes -->
          <polygon points="44,46 56,50 45,54" fill="#ffffff"/>
          <polygon points="76,46 64,50 75,54" fill="#ffffff"/>
          <!-- Chrome Shear Claws -->
          <line x1="20" y1="98" x2="36" y2="78" stroke="#00bbf9" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="26" y1="102" x2="42" y2="82" stroke="#00bbf9" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="32" y1="106" x2="48" y2="86" stroke="#00bbf9" stroke-width="3.5" stroke-linecap="round"/>
        </g>
      </svg>`;

    case 'marey_poppins':
      return `<svg viewBox="0 0 120 120" class="fighter-svg" aria-hidden="true">
        <g ${transform}>
          <rect x="6" y="6" width="108" height="108" rx="18" fill="#24142c" stroke="#f15bb5" stroke-width="3.5"/>
          <circle cx="60" cy="64" r="40" fill="#f15bb5" opacity="0.22"/>
          <!-- Refined Equestrian Outfit / Blazer -->
          <path d="M26 110 L34 68 L86 68 L94 110 Z" fill="#3a0ca3" stroke="#111" stroke-width="3"/>
          <polygon points="46,68 60,86 74,68" fill="#ffffff" stroke="#111" stroke-width="2"/>
          <polygon points="56,76 64,76 60,83" fill="#e63946"/>
          <!-- Flowing Golden Mane -->
          <path d="M38 28 Q30 46 28 66 Q42 56 46 44 Z" fill="#f4a261" stroke="#111" stroke-width="2.5"/>
          <path d="M32 50 Q22 68 26 84 Q38 72 40 60 Z" fill="#f4a261" stroke="#111" stroke-width="2.5"/>
          <!-- Horse Neck & Head -->
          <path d="M42 40 L50 22 L72 26 L88 48 L76 66 L56 66 Z" fill="#b07246" stroke="#111" stroke-width="3"/>
          <polygon points="52,22 58,8 66,22" fill="#b07246" stroke="#111" stroke-width="2.5"/>
          <polygon points="55,20 59,12 64,20" fill="#f4a261"/>
          <!-- Muzzle & Nostril -->
          <ellipse cx="80" cy="54" rx="12" ry="10" fill="#d49b74" stroke="#111" stroke-width="2.5"/>
          <circle cx="83" cy="53" r="2.5" fill="#111"/>
          <!-- Refined Eye with Long Eyelashes -->
          <circle cx="64" cy="38" r="4.5" fill="#111"/>
          <circle cx="66" cy="36" r="1.5" fill="#ffffff"/>
          <path d="M60 33 L67 36 L70 33" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
          <!-- Elegant Derby / Feathered Bonnet -->
          <ellipse cx="60" cy="18" rx="20" ry="6" fill="#f72585" stroke="#111" stroke-width="2.5"/>
          <path d="M48 18 C48 8 72 8 72 18 Z" fill="#7209b7" stroke="#111" stroke-width="2.5"/>
          <path d="M68 14 Q78 2 82 8 Q76 14 70 16" fill="#fee440" stroke="#111" stroke-width="2"/>
        </g>
      </svg>`;

    case 'dalai_llama':
      return `<svg viewBox="0 0 120 120" class="fighter-svg" aria-hidden="true">
        <g ${transform}>
          <rect x="6" y="6" width="108" height="108" rx="18" fill="#1b2416" stroke="#ffd166" stroke-width="3.5"/>
          <circle cx="60" cy="64" r="40" fill="#06d6a0" opacity="0.22"/>
          <!-- Saffron & Maroon Monastic Robes -->
          <path d="M26 110 L36 72 L84 72 L94 110 Z" fill="#9b2226" stroke="#111" stroke-width="3"/>
          <path d="M36 72 L64 72 L82 110 L26 110 Z" fill="#f77f00" stroke="#111" stroke-width="2.5"/>
          <!-- Wooden Prayer Beads (Mala) -->
          <circle cx="48" cy="80" r="3.5" fill="#bb9457" stroke="#111" stroke-width="1.5"/>
          <circle cx="56" cy="84" r="3.5" fill="#bb9457" stroke="#111" stroke-width="1.5"/>
          <circle cx="64" cy="84" r="3.5" fill="#bb9457" stroke="#111" stroke-width="1.5"/>
          <circle cx="72" cy="80" r="3.5" fill="#bb9457" stroke="#111" stroke-width="1.5"/>
          <!-- Long Fluffy Llama Neck & Fleece -->
          <path d="M46 72 L48 38 L72 38 L74 72 Z" fill="#fefae0" stroke="#111" stroke-width="3"/>
          <!-- Tall Llama Ears -->
          <path d="M48 30 L44 8 L54 26 Z" fill="#fefae0" stroke="#111" stroke-width="2.5"/>
          <path d="M47 26 L45 14 L51 24 Z" fill="#dda15e"/>
          <path d="M68 30 L74 8 L64 26 Z" fill="#fefae0" stroke="#111" stroke-width="2.5"/>
          <path d="M69 26 L72 14 L66 24 Z" fill="#dda15e"/>
          <!-- Fluffy Head & Forehead Cloud -->
          <ellipse cx="60" cy="36" rx="18" ry="14" fill="#fefae0" stroke="#111" stroke-width="3"/>
          <circle cx="54" cy="24" r="7" fill="#ffffff" stroke="#111" stroke-width="2"/>
          <circle cx="66" cy="24" r="7" fill="#ffffff" stroke="#111" stroke-width="2"/>
          <circle cx="60" cy="22" r="8" fill="#ffffff" stroke="#111" stroke-width="2"/>
          <!-- Serene Half-Closed Zen Eyes -->
          <path d="M50 36 Q55 40 60 36" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M62 36 Q67 40 72 36" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Llama Snout & Gentle Smirk -->
          <ellipse cx="61" cy="45" rx="8" ry="6" fill="#faedcd" stroke="#111" stroke-width="2"/>
          <circle cx="58" cy="44" r="1.5" fill="#111"/>
          <circle cx="64" cy="44" r="1.5" fill="#111"/>
          <path d="M58 48 Q61 51 64 48" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"/>
          <!-- Transcendent Halo Ring -->
          <ellipse cx="60" cy="12" rx="22" ry="6" fill="none" stroke="#ffd166" stroke-width="3" stroke-dasharray="4 3"/>
        </g>
      </svg>`;

    case 'quackie_chan':
    default:
      return `<svg viewBox="0 0 120 120" class="fighter-svg" aria-hidden="true">
        <g ${transform}>
          <rect x="6" y="6" width="108" height="108" rx="18" fill="#082032" stroke="#48cae4" stroke-width="3.5"/>
          <circle cx="60" cy="64" r="40" fill="#48cae4" opacity="0.22"/>
          <!-- Kung Fu Tang Suit -->
          <path d="M28 110 L36 68 L84 68 L92 110 Z" fill="#0077b6" stroke="#111" stroke-width="3"/>
          <line x1="60" y1="68" x2="60" y2="110" stroke="#ffd166" stroke-width="3"/>
          <line x1="52" y1="78" x2="68" y2="78" stroke="#ffd166" stroke-width="3"/>
          <line x1="52" y1="90" x2="68" y2="90" stroke="#ffd166" stroke-width="3"/>
          <!-- Duck Head & Feather Tuft -->
          <path d="M56 26 Q62 12 72 20 Q64 24 64 28 Z" fill="#ffffff" stroke="#111" stroke-width="2"/>
          <circle cx="60" cy="48" r="22" fill="#ffffff" stroke="#111" stroke-width="3"/>
          <!-- Black Martial Arts Headband -->
          <rect x="38" y="33" width="44" height="7" rx="3" fill="#111"/>
          <!-- Expressive Eyes -->
          <circle cx="51" cy="44" r="3.5" fill="#111"/>
          <circle cx="69" cy="44" r="3.5" fill="#111"/>
          <path d="M45 39 Q51 36 56 40" fill="none" stroke="#111" stroke-width="2.5"/>
          <path d="M64 40 Q69 36 75 39" fill="none" stroke="#111" stroke-width="2.5"/>
          <!-- Wide Orange Duck Bill -->
          <path d="M42 54 Q60 48 84 54 Q86 64 60 65 Q40 64 42 54 Z" fill="#ff9f1c" stroke="#111" stroke-width="2.5"/>
          <line x1="46" y1="59" x2="78" y2="59" stroke="#111" stroke-width="2"/>
        </g>
      </svg>`;
  }
}

export function getFighterById(id) {
  return FIGHTERS.find((f) => f.id === id) || FIGHTERS[0];
}

export function getArenaById(id) {
  return ARENAS.find((a) => a.id === id) || ARENAS[0];
}
