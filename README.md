# FARM FIGHTER IV — Championship Edition (STF Arcade)

> *"The prestigious fourth installment in the legendary barnyard fighting franchise."*

An arcade fighting game built for the **STF Arcade** platform starring eight farm animals. Designed with late-1990s arcade presentation, ridiculous special moves, procedural 8-bit sound, dynamic canvas graphics, and a giant red button that nobody is supposed to press.

---

## 🎮 Playable Roster (8 Fighters)

1. **Cluck Norris 🐔** — *"The barnyard life chose him."*  
   * **Style:** Karate Leghorn Grandmaster with aerial kicks and projectile eggs.  
   * **Specials:** Flying Spin Peck, Egg Barrage, Wake-Up Crow.  
   * **DO NOT PRESS THIS BUTTON:** **RAGE CROWING** (ear-splitting sonic crowing blizzard).

2. **Moo Tai 🐄** — *"Pain is temporary. Hay is forever."*  
   * **Style:** Heavyweight Holstein Muay Thai legend with devastating close-range knockouts.  
   * **Specials:** Stampede Charge, Hoof Uppercut, Haymaker.  
   * **DO NOT PRESS THIS BUTTON:** **MOOPOCALYPSE** (stampede barrage accompanied by falling aged cheese).

3. **Ham Solo 🐖** — *"Never tell me the odds."*  
   * **Style:** Yorkshire scoundrel sporting aviator shades, rapid trotters, and a giant carnival mallet.  
   * **Specials:** Bacon Blitz, Trough Dive, Hammer Time.  
   * **DO NOT PRESS THIS BUTTON:** **HAMMER TIME** (stop! giant oversized mallets flatten the ring).

4. **Billy the Kid 🐐** — *"I will eat your shirt."*  
   * **Style:** Alpine outlaw goat who charges with erratic battering-ram headbutts.  
   * **Specials:** Headbutt Rush, Fence Vault, Unprovoked Aggression.  
   * **DO NOT PRESS THIS BUTTON:** **UNPROVOKED AGRICULTURE** (airborne tin can and barbed-wire storm).

5. **Woolverine 🐑** — *"The fluff hides the violence."*  
   * **Style:** Weapon-X merino sheep with dense puff armor and titanium sheep-shearing claws.  
   * **Specials:** Rolling Fleece Attack, Rage Shearing, Fluff Fury.  
   * **DO NOT PRESS THIS BUTTON:** **SHEAR CATACLYSM** (screen-clearing lightning storm of sheared fleece).

6. **Quackie Chan 🦆** — *"Be waterfowl, my friend."*  
   * **Style:** Pekin stunt duck executing acrobatic martial-arts combos and sonic quack rings.  
   * **Specials:** Wing Slap, Rapid Quack Combo, Flying Feather Kick.  
   * **DO NOT PRESS THIS BUTTON:** **WAY OF THE WATERFOWL** (rocket-powered swan boat fireworks show).

7. **Marey Poppins 🐴** — *"Practically perfect in every hay."*  
   * **Style:** Refined equestrian aristocrat with polished bronze horseshoes and graceful, high-speed kicks.  
   * **Specials:** Haystorm, Carousel Kick, Stable Spin.  
   * **DO NOT PRESS THIS BUTTON:** **PONY APOCALYPSE** (stampede of miniature ponies that tramples across the arena).

8. **Dalai Llama 🦙** — *"Inner peace. Outer violence."*  
   * **Style:** High-altitude Andean monk specializing in defensive parries, zen palm slaps, and projectile spit.  
   * **Specials:** Enlightened Spit, Zen Headbutt, Transcendental Kick.  
   * **DO NOT PRESS THIS BUTTON:** **LLAMAGEDDON** (cosmic storm of wool, mandalas, and spit with unpredictable gravity effects).

---

## 🏟️ Arenas

- **The Barn** — The classic weathered timber ring featuring dusty sunlight and cheering farm spectators.
- **County Fair** — Blue-ribbon banner arena where rowdy spectators occasionally throw ears of corn into the ring.
- **Tractor Supply Parking Lot** — Asphalt arena where runaway steel shopping carts periodically roll through combat.
- **Corn Maze** — Autumn field enclosed by swaying stalks and harvest fog that partially obscure fighters.
- **Two-Story Indoor Aquarium** — High-end aquatic exhibit with swimming fish and a prominent `NO FISHING` sign that nobody mentions. Ever.

---

## 🕹️ Game Modes

- **Arcade Mode**: 8-stage tournament ladder against the entire roster culminating in a mirror grand final. Submits High Score and Fastest Completion Time to Global Leaderboards.
- **Survival Mode**: Endless single-elimination gauntlet with escalating difficulty. Submits Longest Streak and Total Knockouts to Global Leaderboards.
- **Training Mode**: Dojo sparring against a dummy with selectable AI behaviors (Passive, Light Sparring, Counter-Puncher) and auto-refilling health.
- **Local Versus Mode (Desktop only)**: Head-to-head 2-player combat on a shared keyboard (P1 WASD + F/G/H vs P2 Arrows + 1/2/3). Automatically omitted on mobile where only one set of touch controls exists.

---

## ⌨️ Controls

### Desktop (Keyboard)

| Action | Player 1 | Player 2 |
| :--- | :---: | :---: |
| **Move Left / Right** | `A` / `D` | `Left` / `Right` Arrow |
| **Jump** | `W` | `Up` Arrow |
| **Crouch / Low Block** | `S` | `Down` Arrow |
| **Normal Attack** | `F` | `1` (Numpad or Top Row) |
| **Crazy Attack (Special)** | `G` | `2` |
| **DO NOT PRESS THIS BUTTON** | `H` | `3` |

### Mobile & Tablet (Touch)

- **Left Side**: Smooth, full 360-degree virtual movement joystick (walk, jump, and crouch-block).
- **Right Side (Stacked)**:
  - **Top**: 🥊 **NORMAL ATTACK** (high-speed punch/kick combo strings).
  - **Bottom**: ⚡ **CRAZY ATTACK** (signature special moves).
- **Across the Bottom**: Giant red ☢️ **DO NOT PRESS THIS BUTTON** spanning full-width directly beneath the joystick and attack buttons for instant chaotic ultimates.

---

## 🌐 Global Leaderboard System

- **Backend**: Native **PHP 8 + SQLite PDO** backend (`api/index.php`). Zero Node.js or complex server dependencies required.
- **Auto-Save & Manual Modes**: Automatically persists the player's handle locally and submits qualifying runs seamlessly, followed by randomized celebratory Farm Fighter Hall of Fame bulletins and live rank readouts.
- **Rank Categories**:
  1. *Arcade High Score* (Highest total tournament points)
  2. *Survival Longest Streak* (Most consecutive wave victories)
  3. *Fastest Arcade Completion* (Lowest total run time in mm:ss.cc)
- **Offline / Shared Hosting Resilience**: Includes built-in browser local caching and seeded historical records if the backend is temporarily unreachable.

---

## 🚀 Shared Hosting & Jethost Deployment

The game runs immediately on standard shared hosting (Apache / LiteSpeed / cPanel / Jethost):

1. **Upload these files/folders** to your web directory (e.g., `public_html/` or `public_html/farmfighter/`):
   ```
   ├── .htaccess             # Main URL rewrite & file security rules
   ├── index.html            # Main game application
   ├── css/                  # Styling & responsive layout
   │   └── style.css
   ├── js/                   # Game engine, fighters, audio, and renderer
   │   ├── audio.js
   │   ├── data.js
   │   ├── engine.js
   │   ├── leaderboard.js
   │   ├── main.js
   │   └── renderer.js
   ├── api/                  # Leaderboard REST API
   │   ├── .htaccess         # API security & method rules
   │   └── index.php
   └── data/                 # SQLite database storage directory
       └── .htaccess         # Denies direct HTTP downloads of database
   ```
2. **Directory Permissions**:
   - Ensure the `data/` directory has write permissions (`chmod 755` or `chmod 775`) so PHP can write to `leaderboard.sqlite`.
3. **PHP Configuration**:
   - Ensure PHP 7.4+ or 8.x is active with the `pdo_sqlite` extension enabled (default on Jethost/cPanel).
4. **Done!** Open your domain in any modern browser.

---

## 💻 Local Development

Run the included zero-dependency Python server:
```bash
python server.py
# Open http://localhost:8080 in your browser
```
