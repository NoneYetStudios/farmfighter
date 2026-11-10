/**
 * FARM FIGHTER IV — Global Leaderboard Client & Local Player Profile Persistence
 * Uses the PHP + SQLite API (api/index.php) with automatic local player name persistence
 * and graceful fallback when previewed on static-only servers.
 */

const PLAYER_NAME_KEY = 'stf_farmfighter4_player_name';
const LOCAL_RECORDS_KEY = 'stf_farmfighter4_local_records_v1';
const LOCAL_FALLBACK_LB_KEY = 'stf_farmfighter4_fallback_lb_v1';
const AUTO_SAVE_KEY = 'stf_farmfighter4_auto_save';

export const HALL_OF_FAME_MESSAGES = [
  '🏆 Automatically entered into the Farm Fighter Hall of Fame!',
  '📝 Officially recognized by the International Federation of Farm-Based Combat Sports.',
  '🏅 This match has been recorded for future agricultural historians.',
  '🐄 Tournament officials have reluctantly accepted your results.',
  '🥊 Another contender enters Farm Fighter history.',
  '📜 The record keepers have updated the scrolls.',
  '🏆 Your accomplishments have been certified as probably legitimate.',
  '🌽 The county fair will be talking about this for weeks.',
  '🏅 Hall of Fame records updated successfully.',
  '🐓 Your victory has been preserved for future generations.',
  '🐔 Your opponent\'s complaints have been ignored.',
  '🐄 Several hay bales were harmed during this match.',
  '🌽 Local farmers remain concerned.',
  '🐐 Billy the Kid still wants to eat your shirt.',
  '🦆 Tournament judges are reviewing the footage.',
  '🐖 The pork commission has no comment.',
  '🚜 The tractor community is divided.',
  '🐄 Moo Tai would like a rematch.',
  '🐓 Cluck Norris has filed an incident report.',
  '🥊 The violence has been officially documented.',
  '🏆 Welcome to Farm Fighter history.',
  '📜 Legends begin somewhere.',
  '🎖 Another contender joins the rankings.',
  '🏅 Your name has been added to the records.',
  '🌟 Future farm fighters may study this match.'
];

export function getRandomHallOfFameMessage() {
  return HALL_OF_FAME_MESSAGES[Math.floor(Math.random() * HALL_OF_FAME_MESSAGES.length)];
}

export function getAutoSavePreference() {
  try {
    const val = localStorage.getItem(AUTO_SAVE_KEY);
    return val !== 'false'; // Defaults to true
  } catch (_e) {
    return true;
  }
}

export function saveAutoSavePreference(enabled) {
  try {
    localStorage.setItem(AUTO_SAVE_KEY, enabled ? 'true' : 'false');
  } catch (_e) {}
  return Boolean(enabled);
}

const DEFAULT_FIGHTER_HANDLES = [
  'BawkChampion',
  'HaymakerHero',
  'TinCanOutlaw',
  'MudPitLegend',
  'StaticFleece',
  'PondMaster99',
  'BarnstormerIV',
  'SiloSurvivor'
];

export function formatTimeMs(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) {
    return '--:--.--';
  }
  const totalCentis = Math.round(ms / 10);
  const mins = Math.floor(totalCentis / 6000);
  const secs = Math.floor((totalCentis % 6000) / 100);
  const centis = totalCentis % 100;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
}

export function getSavedPlayerName() {
  try {
    const existing = localStorage.getItem(PLAYER_NAME_KEY);
    if (existing && existing.trim().length > 0) {
      return existing.trim().slice(0, 20);
    }
  } catch (_e) {}
  const generated = DEFAULT_FIGHTER_HANDLES[Math.floor(Math.random() * DEFAULT_FIGHTER_HANDLES.length)];
  savePlayerName(generated);
  return generated;
}

export function savePlayerName(name) {
  const clean = String(name || '')
    .replace(/[^\w\s\-\.\!\?]/g, '')
    .trim()
    .slice(0, 20);
  const finalName = clean || 'BarnyardBrawler';
  try {
    localStorage.setItem(PLAYER_NAME_KEY, finalName);
  } catch (_e) {}
  return finalName;
}

export function getLocalRecords() {
  try {
    const raw = localStorage.getItem(LOCAL_RECORDS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (_e) {}
  return {
    bestArcadeScore: 0,
    bestSurvivalStreak: 0,
    bestArcadeTimeMs: null,
    totalKOs: 0,
    redButtonsPressed: 0
  };
}

export function updateLocalRecords(runStats) {
  const current = getLocalRecords();
  const next = {
    bestArcadeScore: Math.max(current.bestArcadeScore || 0, runStats.mode === 'arcade' ? (runStats.score || 0) : 0),
    bestSurvivalStreak: Math.max(current.bestSurvivalStreak || 0, runStats.mode === 'survival' ? (runStats.longestStreak || 0) : 0),
    bestArcadeTimeMs:
      runStats.mode === 'arcade' && runStats.arcadeCleared && runStats.completionTimeMs > 0
        ? current.bestArcadeTimeMs
          ? Math.min(current.bestArcadeTimeMs, runStats.completionTimeMs)
          : runStats.completionTimeMs
        : current.bestArcadeTimeMs,
    totalKOs: (current.totalKOs || 0) + (runStats.knockouts || 0),
    redButtonsPressed: (current.redButtonsPressed || 0) + (runStats.redButtonPresses || 0)
  };
  try {
    localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(next));
  } catch (_e) {}
  return next;
}

const FALLBACK_SEEDS = [
  {
    id: 1,
    playerName: 'GrandmasterBawk',
    fighterId: 'cluck_norris',
    fighterName: 'Cluck Norris',
    mode: 'arcade',
    score: 148500,
    wins: 6,
    knockouts: 12,
    longestStreak: 6,
    arcadeCleared: true,
    completionTimeMs: 164200,
    completionTimeFormatted: '02:44.20',
    redButtonPresses: 5,
    favoriteArena: 'Two-Story Indoor Aquarium',
    createdAt: '2026-11-08T18:00:00Z',
    createdEpoch: 1794160800000
  },
  {
    id: 2,
    playerName: 'DairyDestroyer99',
    fighterId: 'moo_tai',
    fighterName: 'Moo Tai',
    mode: 'arcade',
    score: 136200,
    wins: 6,
    knockouts: 12,
    longestStreak: 6,
    arcadeCleared: true,
    completionTimeMs: 182450,
    completionTimeFormatted: '03:02.45',
    redButtonPresses: 4,
    favoriteArena: 'The Barn',
    createdAt: '2026-11-08T16:30:00Z',
    createdEpoch: 1794155400000
  },
  {
    id: 3,
    playerName: 'TinCanTerror',
    fighterId: 'billy_the_kid',
    fighterName: 'Billy the Kid',
    mode: 'arcade',
    score: 129800,
    wins: 6,
    knockouts: 12,
    longestStreak: 6,
    arcadeCleared: true,
    completionTimeMs: 151800,
    completionTimeFormatted: '02:31.80',
    redButtonPresses: 7,
    favoriteArena: 'Tractor Supply Parking Lot',
    createdAt: '2026-11-08T15:00:00Z',
    createdEpoch: 1794150000000
  },
  {
    id: 4,
    playerName: 'KesselMudRunner',
    fighterId: 'ham_solo',
    fighterName: 'Ham Solo',
    mode: 'arcade',
    score: 121400,
    wins: 6,
    knockouts: 12,
    longestStreak: 6,
    arcadeCleared: true,
    completionTimeMs: 195300,
    completionTimeFormatted: '03:15.30',
    redButtonPresses: 6,
    favoriteArena: 'County Fair',
    createdAt: '2026-11-08T13:30:00Z',
    createdEpoch: 1794144600000
  },
  {
    id: 5,
    playerName: 'ShearLunacy',
    fighterId: 'woolverine',
    fighterName: 'Woolverine',
    mode: 'arcade',
    score: 114900,
    wins: 6,
    knockouts: 12,
    longestStreak: 6,
    arcadeCleared: true,
    completionTimeMs: 173900,
    completionTimeFormatted: '02:53.90',
    redButtonPresses: 3,
    favoriteArena: 'Corn Maze',
    createdAt: '2026-11-08T12:00:00Z',
    createdEpoch: 1794139200000
  },
  {
    id: 6,
    playerName: 'DrunkenMallard',
    fighterId: 'quackie_chan',
    fighterName: 'Quackie Chan',
    mode: 'arcade',
    score: 108600,
    wins: 6,
    knockouts: 12,
    longestStreak: 6,
    arcadeCleared: true,
    completionTimeMs: 144600,
    completionTimeFormatted: '02:24.60',
    redButtonPresses: 4,
    favoriteArena: 'Two-Story Indoor Aquarium',
    createdAt: '2026-11-08T10:30:00Z',
    createdEpoch: 1794133800000
  },
  {
    id: 61,
    playerName: 'DerbyDame',
    fighterId: 'marey_poppins',
    fighterName: 'Marey Poppins',
    mode: 'arcade',
    score: 122400,
    wins: 8,
    knockouts: 16,
    longestStreak: 8,
    arcadeCleared: true,
    completionTimeMs: 138400,
    completionTimeFormatted: '02:18.40',
    redButtonPresses: 5,
    favoriteArena: 'County Fair',
    createdAt: '2026-11-08T09:15:00Z',
    createdEpoch: 1794129300000
  },
  {
    id: 62,
    playerName: 'NirvanaHoof',
    fighterId: 'dalai_llama',
    fighterName: 'Dalai Llama',
    mode: 'arcade',
    score: 119800,
    wins: 8,
    knockouts: 15,
    longestStreak: 8,
    arcadeCleared: true,
    completionTimeMs: 141200,
    completionTimeFormatted: '02:21.20',
    redButtonPresses: 3,
    favoriteArena: 'The Barn',
    createdAt: '2026-11-08T08:45:00Z',
    createdEpoch: 1794127500000
  },
  {
    id: 7,
    playerName: 'ImmortalRooster',
    fighterId: 'cluck_norris',
    fighterName: 'Cluck Norris',
    mode: 'survival',
    score: 214500,
    wins: 19,
    knockouts: 19,
    longestStreak: 19,
    arcadeCleared: false,
    completionTimeMs: null,
    completionTimeFormatted: null,
    redButtonPresses: 12,
    favoriteArena: 'The Barn',
    createdAt: '2026-11-08T09:00:00Z',
    createdEpoch: 1794128400000
  },
  {
    id: 8,
    playerName: 'ShirtEaterXL',
    fighterId: 'billy_the_kid',
    fighterName: 'Billy the Kid',
    mode: 'survival',
    score: 186400,
    wins: 16,
    knockouts: 16,
    longestStreak: 16,
    arcadeCleared: false,
    completionTimeMs: null,
    completionTimeFormatted: null,
    redButtonPresses: 9,
    favoriteArena: 'Tractor Supply Parking Lot',
    createdAt: '2026-11-08T07:30:00Z',
    createdEpoch: 1794123000000
  },
  {
    id: 9,
    playerName: 'MerinoBerserker',
    fighterId: 'woolverine',
    fighterName: 'Woolverine',
    mode: 'survival',
    score: 162900,
    wins: 14,
    knockouts: 14,
    longestStreak: 14,
    arcadeCleared: false,
    completionTimeMs: null,
    completionTimeFormatted: null,
    redButtonPresses: 8,
    favoriteArena: 'Corn Maze',
    createdAt: '2026-11-08T06:00:00Z',
    createdEpoch: 1794117600000
  },
  {
    id: 10,
    playerName: 'PastureSensei',
    fighterId: 'moo_tai',
    fighterName: 'Moo Tai',
    mode: 'survival',
    score: 141200,
    wins: 12,
    knockouts: 12,
    longestStreak: 12,
    arcadeCleared: false,
    completionTimeMs: null,
    completionTimeFormatted: null,
    redButtonPresses: 6,
    favoriteArena: 'County Fair',
    createdAt: '2026-11-08T04:30:00Z',
    createdEpoch: 1794112200000
  }
];

function getFallbackPool() {
  try {
    const raw = localStorage.getItem(LOCAL_FALLBACK_LB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_e) {}
  return [...FALLBACK_SEEDS];
}

function saveFallbackPool(pool) {
  try {
    localStorage.setItem(LOCAL_FALLBACK_LB_KEY, JSON.stringify(pool));
  } catch (_e) {}
}

function filterAndSortFallback(category = 'arcade_score', fighter = 'all') {
  let rows = getFallbackPool();
  if (fighter && fighter !== 'all') {
    rows = rows.filter((r) => r.fighterId === fighter);
  }
  if (category === 'survival_streak') {
    rows = rows
      .filter((r) => r.mode === 'survival')
      .sort((a, b) => b.longestStreak - a.longestStreak || b.score - a.score);
  } else if (category === 'arcade_time') {
    rows = rows
      .filter((r) => r.mode === 'arcade' && r.arcadeCleared && r.completionTimeMs > 0)
      .sort((a, b) => a.completionTimeMs - b.completionTimeMs || b.score - a.score);
  } else {
    rows = rows
      .filter((r) => r.mode === 'arcade')
      .sort((a, b) => b.score - a.score || (a.completionTimeMs || 999999999) - (b.completionTimeMs || 999999999));
  }
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

export async function fetchLeaderboard(category = 'arcade_score', fighter = 'all') {
  const params = new URLSearchParams({
    action: 'leaderboard',
    category,
    fighter,
    limit: '50'
  });

  const endpoints = [`api/index.php?${params.toString()}`, `/api/leaderboard?${params.toString()}`];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const text = await res.text();
        // Ensure we received JSON and not raw PHP source code on a static dev server
        if (text.trim().startsWith('{')) {
          const data = JSON.parse(text);
          if (data && Array.isArray(data.entries)) {
            return data;
          }
        }
      }
    } catch (_e) {
      // Try next endpoint or fallback
    }
  }

  const entries = filterAndSortFallback(category, fighter);
  return {
    ok: true,
    success: true,
    category,
    fighter,
    total: entries.length,
    count: entries.length,
    entries
  };
}

export async function submitLeaderboardRun(payload) {
  const cleanName = savePlayerName(payload.playerName || getSavedPlayerName());
  const fullPayload = {
    ...payload,
    playerName: cleanName
  };

  updateLocalRecords(fullPayload);

  // Also record in fallback pool so local testing without PHP immediately reflects the new entry
  const pool = getFallbackPool();
  const nowEpoch = Date.now();
  const timeMs =
    fullPayload.mode === 'arcade' && fullPayload.arcadeCleared && fullPayload.completionTimeMs > 0
      ? Math.round(fullPayload.completionTimeMs)
      : null;

  const fallbackEntry = {
    id: pool.length + 1,
    playerName: cleanName,
    fighterId: fullPayload.fighterId || 'cluck_norris',
    fighterName: fullPayload.fighterName || 'Cluck Norris',
    mode: fullPayload.mode || 'arcade',
    score: Number(fullPayload.score) || 0,
    wins: Number(fullPayload.wins) || 0,
    knockouts: Number(fullPayload.knockouts) || 0,
    longestStreak: Number(fullPayload.longestStreak) || 0,
    arcadeCleared: Boolean(fullPayload.arcadeCleared),
    completionTimeMs: timeMs,
    completionTimeFormatted: formatTimeMs(timeMs),
    redButtonPresses: Number(fullPayload.redButtonPresses) || 0,
    favoriteArena: fullPayload.favoriteArena || 'The Barn',
    createdAt: new Date(nowEpoch).toISOString(),
    createdEpoch: nowEpoch
  };
  pool.push(fallbackEntry);
  saveFallbackPool(pool);

  const endpoints = ['api/index.php?action=submit', '/api/leaderboard/submit'];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(fullPayload)
      });
      if (res.ok) {
        const text = await res.text();
        if (text.trim().startsWith('{')) {
          const data = JSON.parse(text);
          if (data && data.success) {
            return data;
          }
        }
      }
    } catch (_e) {
      // Fallback handled below
    }
  }

  return {
    ok: true,
    success: true,
    entryId: fallbackEntry.id,
    entry: fallbackEntry,
    ranks: {
      arcade_score: filterAndSortFallback('arcade_score').findIndex((e) => e.id === fallbackEntry.id) + 1
    }
  };
}
