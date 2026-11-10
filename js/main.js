/**
 * FARM FIGHTER IV — Main Application Controller
 * Connects UI screens, Character/Arena Selection, VS Screen, Fight Engine,
 * Desktop Keyboard (P1 WASD+F/G/H, P2 Arrows+1/2/3), Mobile Virtual Joystick,
 * and Global SQLite Leaderboards.
 */

import { FIGHTERS, ARENAS, RIDICULOUS_TIPS, getFighterById, getArenaById, getFighterSVG } from './data.js';
import { audio } from './audio.js';
import { GameRenderer } from './renderer.js';
import { FightEngine } from './engine.js';
import {
  getSavedPlayerName,
  savePlayerName,
  getLocalRecords,
  fetchLeaderboard,
  submitLeaderboardRun,
  formatTimeMs,
  getAutoSavePreference,
  saveAutoSavePreference,
  getRandomHallOfFameMessage
} from './leaderboard.js';

class FarmFighterApp {
  constructor() {
    this.selectedMode = 'arcade'; // arcade | survival | training | versus
    this.p1FighterId = 'cluck_norris';
    this.p2FighterId = 'moo_tai';
    this.selectingSlot = 1; // 1 or 2
    this.selectedArenaId = 'the_barn';

    // Tournament progression state
    this.arcadeLadder = [];
    this.arcadeStageIndex = 0;
    this.survivalWave = 1;
    this.activeMatchResult = null;
    this.hasSubmittedCurrentRun = false;

    // Live Input State
    this.keysDown = new Set();
    this.touchDir = { up: false, down: false, left: false, right: false };
    this.touchButtons = { normal: false, crazy: false, doNotPress: false };
    this.p1QueuedPresses = { normal: false, crazy: false, doNotPress: false };
    this.p2QueuedPresses = { normal: false, crazy: false, doNotPress: false };

    this.isPaused = false;
    this.vsAutoTimer = null;
    this.activeLbCategory = 'arcade_score';

    this.canvas = document.getElementById('fight-canvas');
    this.renderer = new GameRenderer(this.canvas);
    this.engine = new FightEngine({
      onMatchEnd: (result) => this.handleMatchEnd(result)
    });

    this.lastFrameTime = performance.now();
  }

  init() {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 760px)').matches) {
      if (this.selectedMode === 'versus') this.selectedMode = 'arcade';
    }
    this.initPlayerProfile();
    this.renderRosterGrid();
    this.renderArenasGrid();
    this.renderFighterDossier();
    this.renderBiosModal();
    this.bindUIEvents();
    this.bindKeyboardInput();
    this.bindTouchControls();
    this.updateSoundButtonUI();

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  initPlayerProfile() {
    const nameInput = document.getElementById('input-player-name');
    const savedName = getSavedPlayerName();
    if (nameInput) {
      nameInput.value = savedName;
      nameInput.addEventListener('change', () => {
        nameInput.value = savePlayerName(nameInput.value);
      });
    }

    const autoSaveToggle = document.getElementById('toggle-auto-save');
    const autoSaveLbToggle = document.getElementById('toggle-auto-save-lb');
    const isAutoSave = getAutoSavePreference();

    if (autoSaveToggle) {
      autoSaveToggle.checked = isAutoSave;
      autoSaveToggle.addEventListener('change', (e) => {
        const val = saveAutoSavePreference(e.target.checked);
        if (autoSaveLbToggle) autoSaveLbToggle.checked = val;
      });
    }

    if (autoSaveLbToggle) {
      autoSaveLbToggle.checked = isAutoSave;
      autoSaveLbToggle.addEventListener('change', (e) => {
        const val = saveAutoSavePreference(e.target.checked);
        if (autoSaveToggle) autoSaveToggle.checked = val;
      });
    }

    this.refreshLocalBestStrip();
  }

  refreshLocalBestStrip() {
    const strip = document.getElementById('local-best-strip');
    if (!strip) return;
    const rec = getLocalRecords();
    const bestTimeStr = rec.bestArcadeTimeMs ? ` • Best Time: <strong>${formatTimeMs(rec.bestArcadeTimeMs)}</strong>` : '';
    strip.innerHTML = `Best Arcade: <strong>${(rec.bestArcadeScore || 0).toLocaleString()}</strong> • Longest Streak: <strong>${rec.bestSurvivalStreak || 0}</strong>${bestTimeStr}`;
  }

  showScreen(screenId) {
    const screens = ['screen-select', 'screen-vs', 'screen-fight', 'screen-victory'];
    for (const id of screens) {
      const el = document.getElementById(id);
      if (el) {
        el.hidden = id !== screenId;
      }
    }
  }

  renderRosterGrid() {
    const grid = document.getElementById('roster-grid');
    if (!grid) return;

    grid.innerHTML = FIGHTERS.map((f) => {
      const isP1 = f.id === this.p1FighterId;
      const isP2 = f.id === this.p2FighterId;
      const classes = ['fighter-card'];
      if (isP1) classes.push('selected-p1');
      if (isP2) classes.push('selected-p2');

      return `
        <button type="button" class="${classes.join(' ')}" data-fighter-id="${f.id}" role="option" aria-selected="${isP1 || isP2}">
          <div class="fighter-card-badges">
            ${isP1 ? '<span class="sel-tag p1">P1</span>' : '<span></span>'}
            ${isP2 ? `<span class="sel-tag p2">${this.selectedMode === 'versus' ? 'P2' : 'FOE'}</span>` : ''}
          </div>
          <div class="fighter-card-svg">${getFighterSVG(f.id, false)}</div>
          <div class="fighter-card-name">${f.emoji} ${f.name}</div>
          <div class="fighter-card-quote">"${f.quote}"</div>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.fighter-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fId = btn.getAttribute('data-fighter-id');
        audio.playUiSelect();
        if (this.selectingSlot === 1) {
          this.p1FighterId = fId;
          // In Versus or Training, allow quick switching to P2 slot if desired
        } else {
          this.p2FighterId = fId;
        }
        this.renderRosterGrid();
        this.renderFighterDossier();
      });
    });
  }

  renderFighterDossier() {
    const card = document.getElementById('fighter-dossier-card');
    if (!card) return;

    const p1 = getFighterById(this.p1FighterId);
    const p2 = getFighterById(this.p2FighterId);
    const focus = this.selectingSlot === 2 ? p2 : p1;

    card.innerHTML = `
      <div class="dossier-matchup-strip">
        <div class="dossier-side">
          <div class="dossier-thumb">${getFighterSVG(p1.id, false)}</div>
          <div>
            <small style="color:var(--accent-yellow);font-weight:900;">PLAYER 1</small>
            <div style="font-weight:900;">${p1.emoji} ${p1.name}</div>
          </div>
        </div>
        <span class="dossier-vs-pill">VS</span>
        <div class="dossier-side right">
          <div class="dossier-thumb">${getFighterSVG(p2.id, true)}</div>
          <div>
            <small style="color:var(--accent-cyan);font-weight:900;">${this.selectedMode === 'versus' ? 'PLAYER 2' : 'OPPONENT'}</small>
            <div style="font-weight:900;">${p2.emoji} ${p2.name}</div>
          </div>
        </div>
      </div>

      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <strong style="color:var(--accent-gold);font-size:0.95rem;">${focus.emoji} ${focus.name} — ${focus.species}</strong>
          <span style="font-size:0.72rem;color:var(--text-muted);">${focus.weightClass}</span>
        </div>
        <p class="dossier-bio-text">${focus.bio}</p>
      </div>

      <div>
        <div style="font-size:0.74rem;font-weight:900;color:var(--accent-yellow);margin-bottom:5px;">
          ⚡ SIGNATURE CRAZY ATTACKS (KEY [G] / [2]):
        </div>
        <div class="dossier-specials-list">
          ${focus.specials
            .map(
              (s) => `
            <div class="special-chip">
              <strong>${s.name}</strong>
              <small>${s.inputHint}</small>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <div class="dossier-ult-banner">
        <strong>☢️ DO NOT PRESS THIS BUTTON: ${focus.doNotPress.name}</strong>
        <div style="color:#f8f9fa;margin-top:2px;">${focus.doNotPress.description}</div>
      </div>
    `;
  }

  renderArenasGrid() {
    const grid = document.getElementById('arenas-grid');
    if (!grid) return;

    grid.innerHTML = ARENAS.map((a) => {
      const isSelected = a.id === this.selectedArenaId;
      return `
        <button type="button" class="arena-card ${isSelected ? 'active' : ''}" data-arena-id="${a.id}" role="radio" aria-checked="${isSelected}">
          <span class="arena-badge">${a.badge}</span>
          <strong>${a.name}</strong>
          <span>${a.hazardSummary}</span>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.arena-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedArenaId = btn.getAttribute('data-arena-id');
        audio.playUiSelect();
        const arena = getArenaById(this.selectedArenaId);
        const hintEl = document.getElementById('arena-hazard-hint');
        if (hintEl) hintEl.textContent = arena.hazardSummary;
        this.renderArenasGrid();
      });
    });
  }

  renderBiosModal() {
    const container = document.getElementById('bios-grid');
    if (!container) return;

    container.innerHTML = FIGHTERS.map(
      (f) => `
      <article class="bio-card">
        <div class="bio-card-top">
          <div class="bio-avatar">${getFighterSVG(f.id, false)}</div>
          <div>
            <h3 style="color:var(--accent-gold);font-size:1rem;">${f.emoji} ${f.name}</h3>
            <div style="font-size:0.75rem;color:var(--accent-cyan);font-weight:800;">${f.fightingStyle}</div>
            <div style="font-size:0.74rem;color:var(--text-muted);font-style:italic;">"${f.quote}"</div>
          </div>
        </div>
        <p style="font-size:0.8rem;color:#dee2e6;line-height:1.38;">${f.bio}</p>
        <div style="font-size:0.74rem;color:var(--accent-green);"><strong>Record:</strong> ${f.tournamentRecord}</div>
        <div style="font-size:0.76rem;border-top:1px solid var(--border-subtle);padding-top:6px;">
          <strong style="color:var(--accent-yellow);">Specials:</strong>
          ${f.specials.map((s) => `${s.name} (${s.inputHint})`).join(' • ')}
        </div>
        <div style="font-size:0.76rem;color:#ffccd5;">
          <strong>☢️ DO NOT PRESS:</strong> ${f.doNotPress.name} — ${f.doNotPress.subtitle}
        </div>
      </article>
    `
    ).join('');
  }

  bindUIEvents() {
    // Mode selector cards
    document.querySelectorAll('.mode-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        if (mode === 'versus' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 760px)').matches) {
          return;
        }
        this.selectedMode = mode;
        audio.playUiSelect();
        document.querySelectorAll('.mode-card').forEach((b) => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-checked', String(active));
        });
        this.updateModeUIHints();
        this.renderRosterGrid();
        this.renderFighterDossier();
      });
    });

    // Picking P1 vs P2 slot buttons
    const btnP1 = document.getElementById('btn-selecting-p1');
    const btnP2 = document.getElementById('btn-selecting-p2');
    if (btnP1 && btnP2) {
      btnP1.addEventListener('click', () => {
        this.selectingSlot = 1;
        btnP1.classList.add('active');
        btnP2.classList.remove('active');
        this.renderFighterDossier();
      });
      btnP2.addEventListener('click', () => {
        this.selectingSlot = 2;
        btnP2.classList.add('active');
        btnP1.classList.remove('active');
        this.renderFighterDossier();
      });
    }

    // Random Name Generator
    document.getElementById('btn-random-name')?.addEventListener('click', () => {
      const randomHandles = [
        'FeatherFury99',
        'PasturePunisher',
        'TinCanChewer',
        'MudPitBaron',
        'HighlandShear',
        'PondGrandmaster',
        'KyotoRooster94',
        'PressedRedBtn'
      ];
      const pick = randomHandles[Math.floor(Math.random() * randomHandles.length)];
      const input = document.getElementById('input-player-name');
      if (input) input.value = savePlayerName(pick);
      audio.playUiSelect();
    });

    // Start Tournament / Match Button
    document.getElementById('btn-start-fight')?.addEventListener('click', () => {
      audio.playUiConfirm();
      this.beginSelectedModeRun();
    });

    // VS Screen Skip / Fight Now Button
    document.getElementById('btn-vs-fight-now')?.addEventListener('click', () => {
      this.launchFightFromVS();
    });

    // Top Nav & Modal Buttons
    document.getElementById('btn-home-title')?.addEventListener('click', () => {
      this.returnToSelectScreen();
    });
    document.getElementById('btn-open-bios')?.addEventListener('click', () => {
      this.openModal('modal-bios');
    });
    document.getElementById('btn-open-controls')?.addEventListener('click', () => {
      this.openModal('modal-controls');
    });
    document.getElementById('btn-open-leaderboards')?.addEventListener('click', () => {
      this.openLeaderboardsModal('arcade_score');
    });
    document.getElementById('btn-toggle-sound')?.addEventListener('click', () => {
      audio.toggleMute();
      this.updateSoundButtonUI();
    });

    // Modal close buttons
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        const modal = document.getElementById(modalId);
        if (modal) modal.hidden = true;
      });
    });

    // Leaderboard Modal Tabs & Filter
    document.querySelectorAll('.lb-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const cat = tab.getAttribute('data-lb-cat');
        this.activeLbCategory = cat;
        document.querySelectorAll('.lb-tab').forEach((t) => {
          const isAct = t === tab;
          t.classList.toggle('active', isAct);
          t.setAttribute('aria-selected', String(isAct));
        });
        this.loadLeaderboardTable();
      });
    });

    document.getElementById('lb-fighter-filter')?.addEventListener('change', () => {
      this.loadLeaderboardTable();
    });
    document.getElementById('btn-refresh-lb')?.addEventListener('click', () => {
      this.loadLeaderboardTable();
    });

    // Fight HUD Pause & Leave
    document.getElementById('btn-fight-pause')?.addEventListener('click', () => {
      this.togglePause(true);
    });
    document.getElementById('btn-fight-leave')?.addEventListener('click', () => {
      this.returnToSelectScreen();
    });

    // Pause Modal Buttons
    document.getElementById('btn-pause-resume')?.addEventListener('click', () => this.togglePause(false));
    document.getElementById('btn-pause-resume-x')?.addEventListener('click', () => this.togglePause(false));
    document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
      this.togglePause(false);
      this.beginSelectedModeRun();
    });
    document.getElementById('btn-pause-bios')?.addEventListener('click', () => {
      this.openModal('modal-bios');
    });
    document.getElementById('btn-pause-exit')?.addEventListener('click', () => {
      this.togglePause(false);
      this.returnToSelectScreen();
    });

    // Training Mode Controls
    document.getElementById('select-training-ai')?.addEventListener('change', (e) => {
      this.engine.trainingBehaviour = e.target.value;
    });
    document.getElementById('check-infinite-meter')?.addEventListener('change', (e) => {
      this.engine.infiniteMeter = e.target.checked;
    });
    document.getElementById('btn-training-reset')?.addEventListener('click', () => {
      this.engine.startRound(null);
    });

    // Victory Screen Actions
    document.getElementById('btn-submit-score')?.addEventListener('click', () => {
      const isArcadeClear =
        this.selectedMode === 'arcade' &&
        this.activeMatchResult?.playerWon &&
        this.arcadeStageIndex >= this.arcadeLadder.length - 1;
      this.submitCurrentRunToLeaderboard(isArcadeClear, false);
    });
    document.getElementById('btn-victory-next')?.addEventListener('click', () => {
      this.handleVictoryPrimaryAction();
    });
    document.getElementById('btn-victory-leaderboard')?.addEventListener('click', () => {
      const defaultCat = this.selectedMode === 'survival' ? 'survival_streak' : 'arcade_score';
      this.openLeaderboardsModal(defaultCat);
    });
    document.getElementById('btn-victory-select')?.addEventListener('click', () => {
      this.returnToSelectScreen();
    });
  }

  updateModeUIHints() {
    const hint = document.getElementById('mode-active-hint');
    const sub = document.getElementById('start-btn-sub');
    const p2Btn = document.getElementById('btn-selecting-p2');

    if (this.selectedMode === 'arcade') {
      if (hint) hint.textContent = 'Fight through all 8 challengers & submit High Score + Best Time to Global Leaderboards!';
      if (sub) sub.textContent = 'ARCADE TOURNAMENT • 8-STAGE CHAMPIONSHIP LADDER';
      if (p2Btn) p2Btn.textContent = 'Picking: First Opponent';
    } else if (this.selectedMode === 'survival') {
      if (hint) hint.textContent = 'Battle endless waves of farm fighters! Track Wins, KOs & Longest Streak!';
      if (sub) sub.textContent = 'ENDLESS SURVIVAL GAUNTLET • WAVE 1';
      if (p2Btn) p2Btn.textContent = 'Picking: First Challenger';
    } else if (this.selectedMode === 'training') {
      if (hint) hint.textContent = 'Practice specials, combos & the forbidden red button with regenerating health.';
      if (sub) sub.textContent = 'TRAINING DOJO • NO LEADERBOARD SUBMISSIONS';
      if (p2Btn) p2Btn.textContent = 'Picking: Sparring Partner';
    } else {
      if (hint) hint.textContent = 'Two human players on the same computer! P1 (WASD + F/G/H) vs P2 (Arrows + 1/2/3).';
      if (sub) sub.textContent = 'LOCAL 2-PLAYER VERSUS SHOWDOWN';
      if (p2Btn) p2Btn.textContent = 'Picking: Player 2';
    }
  }

  updateSoundButtonUI() {
    const btn = document.getElementById('btn-toggle-sound');
    const lbl = document.getElementById('sound-label');
    if (btn) btn.setAttribute('aria-pressed', String(audio.muted));
    if (lbl) lbl.textContent = audio.muted ? 'Sound: OFF' : 'Sound: ON';
  }

  openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.hidden = false;
  }

  async openLeaderboardsModal(category = 'arcade_score') {
    this.activeLbCategory = category;
    document.querySelectorAll('.lb-tab').forEach((t) => {
      const act = t.getAttribute('data-lb-cat') === category;
      t.classList.toggle('active', act);
      t.setAttribute('aria-selected', String(act));
    });
    this.openModal('modal-leaderboards');
    await this.loadLeaderboardTable();
  }

  async loadLeaderboardTable() {
    const tbody = document.getElementById('lb-tbody');
    const theadRow = document.getElementById('lb-thead-row');
    const fighterFilter = document.getElementById('lb-fighter-filter')?.value || 'all';
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" class="lb-empty">Loading global SQLite rankings...</td></tr>';

    if (theadRow) {
      const metricHeader =
        this.activeLbCategory === 'survival_streak'
          ? 'Longest Streak'
          : this.activeLbCategory === 'arcade_time'
          ? 'Best Completion Time'
          : 'Arcade High Score';
      theadRow.innerHTML = `
        <th>Rank</th>
        <th>Contender</th>
        <th>Fighter</th>
        <th>${metricHeader}</th>
        <th>Wins / KOs</th>
        <th>Red Buttons</th>
        <th>Arena</th>
      `;
    }

    const res = await fetchLeaderboard(this.activeLbCategory, fighterFilter);
    const entries = res.entries || [];

    if (entries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="lb-empty">No tournament records found for this filter yet. Be the first!</td></tr>';
      return;
    }

    tbody.innerHTML = entries
      .map((e) => {
        const fighterObj = getFighterById(e.fighterId);
        let metricVal = `${(e.score || 0).toLocaleString()} pts`;
        if (this.activeLbCategory === 'survival_streak') {
          metricVal = `🔥 ${e.longestStreak} Streak (${(e.score || 0).toLocaleString()} pts)`;
        } else if (this.activeLbCategory === 'arcade_time') {
          metricVal = `⚡ ${e.completionTimeFormatted || formatTimeMs(e.completionTimeMs)} (${(e.score || 0).toLocaleString()} pts)`;
        }

        const medal = e.rank === 1 ? '🥇 1' : e.rank === 2 ? '🥈 2' : e.rank === 3 ? '🥉 3' : `#${e.rank}`;

        return `
          <tr>
            <td><strong>${medal}</strong></td>
            <td><strong>${this.escapeHtml(e.playerName)}</strong></td>
            <td>${fighterObj.emoji} ${this.escapeHtml(e.fighterName)}</td>
            <td><strong style="color:var(--accent-gold);">${metricVal}</strong></td>
            <td>${e.wins}W / ${e.knockouts}KO</td>
            <td>🚨 ${e.redButtonPresses || 0}</td>
            <td>${this.escapeHtml(e.favoriteArena || 'The Barn')}</td>
          </tr>
        `;
      })
      .join('');
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------------------------------------------------------------------------
  // Match & Tournament Flow
  // ---------------------------------------------------------------------------
  beginSelectedModeRun() {
    const nameInput = document.getElementById('input-player-name');
    if (nameInput) {
      savePlayerName(nameInput.value);
    }

    this.hasSubmittedCurrentRun = false;

    if (this.selectedMode === 'arcade') {
      // Build 8-stage roster ladder starting with selected opponent, then remaining fighters, ending with grand champion mirror match
      const others = FIGHTERS.map((f) => f.id).filter((id) => id !== this.p1FighterId && id !== this.p2FighterId);
      this.arcadeLadder = [this.p2FighterId, ...others];
      // Ensure 8 total stages (include mirror grand finals match at stage 8)
      while (this.arcadeLadder.length < FIGHTERS.length) {
        this.arcadeLadder.push(this.p1FighterId);
      }
      this.arcadeStageIndex = 0;
      this.p2FighterId = this.arcadeLadder[0];
      this.showVSScreen({ preserveScore: false, preserveP1HpPct: null });
    } else if (this.selectedMode === 'survival') {
      this.survivalWave = 1;
      this.showVSScreen({ preserveScore: false, preserveP1HpPct: null });
    } else {
      this.showVSScreen({ preserveScore: false, preserveP1HpPct: null });
    }
  }

  showVSScreen({ preserveScore = false, preserveP1HpPct = null }) {
    this.pendingMatchOpts = { preserveScore, preserveP1HpPct };
    audio.stopMusic();
    audio.playVsClash();

    const p1 = getFighterById(this.p1FighterId);
    const p2 = getFighterById(this.p2FighterId);
    const arena = getArenaById(this.selectedArenaId);

    const badgeEl = document.getElementById('vs-stage-badge');
    if (badgeEl) {
      if (this.selectedMode === 'arcade') {
        badgeEl.textContent = `ARCADE TOURNAMENT • STAGE ${this.arcadeStageIndex + 1} OF ${this.arcadeLadder.length}`;
      } else if (this.selectedMode === 'survival') {
        badgeEl.textContent = `SURVIVAL MODE • WAVE ${this.survivalWave}`;
      } else if (this.selectedMode === 'training') {
        badgeEl.textContent = 'TRAINING DOJO EXHIBITION';
      } else {
        badgeEl.textContent = 'LOCAL 2-PLAYER VERSUS MATCH';
      }
    }

    document.getElementById('vs-arena-title').textContent = `Arena: ${arena.name} (${arena.badge})`;
    document.getElementById('vs-p1-portrait').innerHTML = getFighterSVG(p1.id, false);
    document.getElementById('vs-p1-name').textContent = `${p1.emoji} ${p1.name}`;
    document.getElementById('vs-p1-quote').textContent = `"${p1.quote}"`;

    document.getElementById('vs-p2-tag').textContent = this.selectedMode === 'versus' ? 'PLAYER 2' : 'CHALLENGER';
    document.getElementById('vs-p2-portrait').innerHTML = getFighterSVG(p2.id, true);
    document.getElementById('vs-p2-name').textContent = `${p2.emoji} ${p2.name}`;
    document.getElementById('vs-p2-quote').textContent = `"${p2.quote}"`;

    const tip = RIDICULOUS_TIPS[Math.floor(Math.random() * RIDICULOUS_TIPS.length)];
    document.getElementById('vs-tip-text').textContent = `"${tip}"`;

    this.showScreen('screen-vs');

    if (this.vsAutoTimer) clearTimeout(this.vsAutoTimer);
    this.vsAutoTimer = setTimeout(() => {
      this.launchFightFromVS();
    }, 3400);
  }

  launchFightFromVS() {
    if (this.vsAutoTimer) {
      clearTimeout(this.vsAutoTimer);
      this.vsAutoTimer = null;
    }

    const p1 = getFighterById(this.p1FighterId);
    const p2 = getFighterById(this.p2FighterId);
    const arena = getArenaById(this.selectedArenaId);
    const isP2CPU = this.selectedMode !== 'versus';

    let aiDifficulty = 1;
    if (this.selectedMode === 'arcade') {
      aiDifficulty = 1 + this.arcadeStageIndex * 0.45;
    } else if (this.selectedMode === 'survival') {
      aiDifficulty = 1 + (this.survivalWave - 1) * 0.35;
    }

    const opts = this.pendingMatchOpts || { preserveScore: false, preserveP1HpPct: null };

    // Configure Training Strip & HUD
    const trainingStrip = document.getElementById('training-strip');
    if (trainingStrip) {
      trainingStrip.hidden = this.selectedMode !== 'training';
    }
    this.engine.trainingBehaviour = document.getElementById('select-training-ai')?.value || 'passive';
    this.engine.infiniteMeter = Boolean(document.getElementById('check-infinite-meter')?.checked);

    document.getElementById('hud-p1-portrait').innerHTML = getFighterSVG(p1.id, false);
    document.getElementById('hud-p1-name').textContent = `${p1.emoji} ${p1.name}`;
    document.getElementById('hud-p2-portrait').innerHTML = getFighterSVG(p2.id, true);
    document.getElementById('hud-p2-name').textContent = `${p2.emoji} ${p2.name}`;

    document.getElementById('btn-crazy-move-label').innerHTML = `${p1.specials[0].name} <kbd>G</kbd>`;
    document.getElementById('btn-dnp-ult-label').textContent = `${p1.doNotPress.name} READY`;

    this.engine.startMatch({
      mode: this.selectedMode,
      p1Fighter: p1,
      p2Fighter: p2,
      arena,
      isP2CPU,
      aiDifficulty,
      preserveScore: opts.preserveScore,
      preserveP1HpPct: opts.preserveP1HpPct
    });

    this.isPaused = false;
    this.showScreen('screen-fight');
    audio.startMusic();
  }

  handleMatchEnd(result) {
    audio.stopMusic();
    this.activeMatchResult = result;

    const winner = result.playerWon ? result.p1.data : result.p2.data;
    const winQuote = winner.winQuotes[Math.floor(Math.random() * winner.winQuotes.length)];

    document.getElementById('victory-callout').textContent = winner.victoryCallout;
    audio.announce(winner.victoryCallout);
    document.getElementById('victory-portrait').innerHTML = getFighterSVG(winner.id, false);
    document.getElementById('victory-quote').textContent = `"${winQuote}"`;

    const modeBadge = document.getElementById('victory-mode-badge');
    const subTitle = document.getElementById('victory-subtitle');
    const nextBtnLabel = document.getElementById('btn-victory-next-label');
    const submitBox = document.getElementById('victory-submit-box');
    const manualSubmitRow = document.getElementById('victory-manual-submit');
    const hofConfirmBox = document.getElementById('victory-hof-confirmation');
    const hofMessageEl = document.getElementById('victory-hof-message');
    const hofRankEl = document.getElementById('victory-hof-rank');
    const nameInput = document.getElementById('victory-player-name');
    const submitBtn = document.getElementById('btn-submit-score');

    if (nameInput) nameInput.value = getSavedPlayerName();

    let qualifiesForLeaderboard = false;
    let isArcadeClear = false;

    if (this.selectedMode === 'arcade') {
      const isFinalStage = this.arcadeStageIndex >= this.arcadeLadder.length - 1;
      if (result.playerWon && !isFinalStage) {
        modeBadge.textContent = `ARCADE STAGE ${this.arcadeStageIndex + 1} CLEARED`;
        subTitle.textContent = `${winner.name} advances to Stage ${this.arcadeStageIndex + 2} of ${this.arcadeLadder.length}!`;
        nextBtnLabel.textContent = `🥊 NEXT CHALLENGER (STAGE ${this.arcadeStageIndex + 2}/${this.arcadeLadder.length}) →`;
        qualifiesForLeaderboard = false;
      } else if (result.playerWon && isFinalStage) {
        modeBadge.textContent = '🏆 GRAND CHAMPION OF FARM FIGHTER IV 🏆';
        subTitle.textContent = `You conquered all ${this.arcadeLadder.length} fighters in ${formatTimeMs(result.elapsedMs)}!`;
        nextBtnLabel.textContent = '🔄 PLAY NEW ARCADE TOURNAMENT';
        qualifiesForLeaderboard = true;
        isArcadeClear = true;
      } else {
        modeBadge.textContent = 'ARCADE RUN ENDED';
        subTitle.textContent = `Eliminated on Stage ${this.arcadeStageIndex + 1} by ${winner.name}.`;
        nextBtnLabel.textContent = '🔄 REMATCH / RETRY ARCADE';
        qualifiesForLeaderboard = result.score > 0;
        isArcadeClear = false;
      }
    } else if (this.selectedMode === 'survival') {
      if (result.playerWon) {
        modeBadge.textContent = `SURVIVAL WAVE ${this.survivalWave} CLEARED!`;
        subTitle.textContent = `Current Win Streak: ${result.longestStreak} • Next challenger approaching!`;
        nextBtnLabel.textContent = `🔥 NEXT WAVE (WAVE ${this.survivalWave + 1}) →`;
        qualifiesForLeaderboard = true;
      } else {
        modeBadge.textContent = 'SURVIVAL GAUNTLET COMPLETE';
        subTitle.textContent = `Final Survival Streak: ${result.longestStreak} Wins (${result.knockouts} KOs)!`;
        nextBtnLabel.textContent = '🔄 START NEW SURVIVAL RUN';
        qualifiesForLeaderboard = result.longestStreak > 0 || result.score > 0;
      }
    } else {
      // Local Versus
      modeBadge.textContent = 'LOCAL VERSUS RESULT';
      subTitle.textContent = `${result.playerWon ? 'PLAYER 1' : 'PLAYER 2'} (${winner.name}) TAKES THE MATCH!`;
      nextBtnLabel.textContent = '⚔️ INSTANT REMATCH!';
      qualifiesForLeaderboard = false;
    }

    if (!qualifiesForLeaderboard) {
      if (submitBox) submitBox.hidden = true;
    } else {
      if (submitBox) submitBox.hidden = false;
      const isAutoSave = getAutoSavePreference();

      if (isAutoSave) {
        // Auto-Save Behavior:
        // Automatically submit the run to the global leaderboard as currently implemented.
        // Do not display the 'Submit to Global Leaderboard' button.
        // Instead, display a randomly selected Hall of Fame / leaderboard message.
        // Continue displaying the player's resulting leaderboard rank when available.
        if (manualSubmitRow) manualSubmitRow.hidden = true;
        if (hofConfirmBox) hofConfirmBox.hidden = false;
        if (hofMessageEl) hofMessageEl.textContent = getRandomHallOfFameMessage();
        if (hofRankEl) hofRankEl.textContent = '⏳ Registering tournament rankings...';

        this.submitCurrentRunToLeaderboard(isArcadeClear, true);
      } else {
        // Manual Submission Behavior:
        // If Auto Save Scores is disabled:
        // Display the existing 'Submit to Global Leaderboard' button.
        // Do not display the random Hall of Fame message initially.
        if (this.hasSubmittedCurrentRun) {
          if (manualSubmitRow) manualSubmitRow.hidden = true;
          if (hofConfirmBox) hofConfirmBox.hidden = false;
        } else {
          if (manualSubmitRow) manualSubmitRow.hidden = false;
          if (hofConfirmBox) hofConfirmBox.hidden = true;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '📡 SUBMIT TO GLOBAL LEADERBOARD';
          }
        }
      }
    }

    const statsGrid = document.getElementById('victory-stats-grid');
    if (statsGrid) {
      statsGrid.innerHTML = `
        <div class="v-stat-pill"><span>SCORE</span><strong>${result.score.toLocaleString()}</strong></div>
        <div class="v-stat-pill"><span>WINS / STREAK</span><strong>${result.wins} / ${result.longestStreak}</strong></div>
        <div class="v-stat-pill"><span>KNOCKOUTS</span><strong>${result.knockouts}</strong></div>
        <div class="v-stat-pill"><span>ELAPSED TIME</span><strong>${formatTimeMs(result.elapsedMs)}</strong></div>
        <div class="v-stat-pill"><span>RED BUTTONS</span><strong>🚨 ${result.redButtonPresses}</strong></div>
      `;
    }

    this.showScreen('screen-victory');
  }

  async submitCurrentRunToLeaderboard(forcedArcadeCleared = null, isAuto = false) {
    if (!this.activeMatchResult) return;
    const manualSubmitRow = document.getElementById('victory-manual-submit');
    const hofConfirmBox = document.getElementById('victory-hof-confirmation');
    const hofMessageEl = document.getElementById('victory-hof-message');
    const hofRankEl = document.getElementById('victory-hof-rank');
    const nameInput = document.getElementById('victory-player-name');
    const submitBtn = document.getElementById('btn-submit-score');

    const playerName = savePlayerName(nameInput ? nameInput.value : getSavedPlayerName());

    const mainNameInput = document.getElementById('input-player-name');
    if (mainNameInput) mainNameInput.value = playerName;

    const p1 = getFighterById(this.p1FighterId);
    const arena = getArenaById(this.selectedArenaId);
    const isArcadeClear =
      forcedArcadeCleared !== null
        ? forcedArcadeCleared
        : this.selectedMode === 'arcade' &&
          this.activeMatchResult.playerWon &&
          this.arcadeStageIndex >= this.arcadeLadder.length - 1;

    if (!isAuto && submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Submitting...';
    }

    const res = await submitLeaderboardRun({
      playerName,
      fighterId: p1.id,
      fighterName: p1.name,
      mode: this.selectedMode,
      score: this.activeMatchResult.score,
      wins: this.activeMatchResult.wins,
      knockouts: this.activeMatchResult.knockouts,
      longestStreak: this.activeMatchResult.longestStreak,
      arcadeCleared: isArcadeClear,
      completionTimeMs: isArcadeClear ? this.activeMatchResult.elapsedMs : null,
      redButtonPresses: this.activeMatchResult.redButtonPresses,
      favoriteArena: arena.name
    });

    this.hasSubmittedCurrentRun = true;
    this.refreshLocalBestStrip();

    if (res && res.success) {
      const rankParts = [];
      if (res.ranks?.arcade_score) rankParts.push(`Arcade Score Rank #${res.ranks.arcade_score}`);
      if (res.ranks?.arcade_time) rankParts.push(`Fastest Time Rank #${res.ranks.arcade_time}`);
      if (res.ranks?.survival_streak) rankParts.push(`Survival Streak Rank #${res.ranks.survival_streak}`);
      const rankStr = rankParts.length > 0 ? `✅ ${rankParts.join(' • ')}` : `✅ Preserved on Global Leaderboard`;

      // Hide the Submit button
      if (manualSubmitRow) manualSubmitRow.hidden = true;
      // Replace it with a randomly selected Hall of Fame / leaderboard message
      if (hofConfirmBox) hofConfirmBox.hidden = false;

      // Select random Hall of Fame message for manual submission, or if not yet set
      if (!isAuto && hofMessageEl) {
        hofMessageEl.textContent = getRandomHallOfFameMessage();
      } else if (hofMessageEl && (!hofMessageEl.textContent || hofMessageEl.textContent.startsWith('⏳'))) {
        hofMessageEl.textContent = getRandomHallOfFameMessage();
      }

      // Display resulting leaderboard rank when available
      if (hofRankEl) {
        hofRankEl.textContent = rankStr;
      }
    } else {
      if (manualSubmitRow) manualSubmitRow.hidden = true;
      if (hofConfirmBox) hofConfirmBox.hidden = false;
      if (hofRankEl) {
        hofRankEl.textContent = '✅ Saved in Local Career Records';
      }
    }
  }

  handleVictoryPrimaryAction() {
    audio.playUiConfirm();
    const res = this.activeMatchResult;
    this.hasSubmittedCurrentRun = false;

    if (this.selectedMode === 'arcade') {
      const isFinalStage = this.arcadeStageIndex >= this.arcadeLadder.length - 1;
      if (res && res.playerWon && !isFinalStage) {
        this.arcadeStageIndex++;
        this.p2FighterId = this.arcadeLadder[this.arcadeStageIndex];
        // Rotate arena through the 5 stages for variety
        this.selectedArenaId = ARENAS[this.arcadeStageIndex % ARENAS.length].id;
        this.showVSScreen({ preserveScore: true, preserveP1HpPct: null });
      } else {
        this.beginSelectedModeRun();
      }
    } else if (this.selectedMode === 'survival') {
      if (res && res.playerWon) {
        this.survivalWave++;
        const nextFoe = FIGHTERS[(this.survivalWave + 1) % FIGHTERS.length];
        this.p2FighterId = nextFoe.id;
        this.selectedArenaId = ARENAS[this.survivalWave % ARENAS.length].id;
        // Survival mode restores 35% of max HP between waves!
        const carryHpPct = Math.min(1, res.p1.hp / res.p1.maxHp + 0.35);
        this.showVSScreen({ preserveScore: true, preserveP1HpPct: carryHpPct });
      } else {
        this.beginSelectedModeRun();
      }
    } else {
      this.showVSScreen({ preserveScore: false, preserveP1HpPct: null });
    }
  }

  returnToSelectScreen() {
    if (this.vsAutoTimer) {
      clearTimeout(this.vsAutoTimer);
      this.vsAutoTimer = null;
    }
    audio.stopMusic();
    this.isPaused = false;
    const pauseModal = document.getElementById('modal-pause');
    if (pauseModal) pauseModal.hidden = true;
    this.refreshLocalBestStrip();
    this.renderRosterGrid();
    this.renderFighterDossier();
    this.showScreen('screen-select');
  }

  togglePause(forceState = null) {
    const screenFight = document.getElementById('screen-fight');
    if (!screenFight || screenFight.hidden) return;

    this.isPaused = forceState !== null ? forceState : !this.isPaused;
    const pauseModal = document.getElementById('modal-pause');
    if (pauseModal) {
      pauseModal.hidden = !this.isPaused;
    }
  }

  // ---------------------------------------------------------------------------
  // Desktop Keyboard Controls (P1: WASD + F/G/H, P2: Arrows + 1/2/3)
  // ---------------------------------------------------------------------------
  bindKeyboardInput() {
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) {
        return;
      }

      const code = e.code;

      if (code === 'Escape' || code === 'KeyP') {
        const fightVisible = !document.getElementById('screen-fight')?.hidden;
        if (fightVisible) {
          e.preventDefault();
          this.togglePause();
          return;
        }
      }

      if (code === 'Space' || code === 'Enter') {
        const vsVisible = !document.getElementById('screen-vs')?.hidden;
        if (vsVisible) {
          e.preventDefault();
          this.launchFightFromVS();
          return;
        }
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
        const fightVisible = !document.getElementById('screen-fight')?.hidden;
        if (fightVisible) e.preventDefault();
      }

      if (!this.keysDown.has(code)) {
        // Edge-triggered attack presses
        if (code === 'KeyF') this.p1QueuedPresses.normal = true;
        if (code === 'KeyG') this.p1QueuedPresses.crazy = true;
        if (code === 'KeyH') this.p1QueuedPresses.doNotPress = true;

        if (code === 'Digit1' || code === 'Numpad1') this.p2QueuedPresses.normal = true;
        if (code === 'Digit2' || code === 'Numpad2') this.p2QueuedPresses.crazy = true;
        if (code === 'Digit3' || code === 'Numpad3') this.p2QueuedPresses.doNotPress = true;
      }

      this.keysDown.add(code);
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keysDown.clear();
    });
  }

  // ---------------------------------------------------------------------------
  // Mobile Touch Controls (Virtual Joystick + D-Pad + Attack Buttons)
  // ---------------------------------------------------------------------------
  bindTouchControls() {
    const base = document.getElementById('joystick-base');
    const knob = document.getElementById('joystick-knob');

    if (base && knob) {
      let dragging = false;

      const updateStick = (clientX, clientY) => {
        const rect = base.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = clientX - cx;
        let dy = clientY - cy;
        const maxR = rect.width * 0.36;
        const dist = Math.hypot(dx, dy);
        if (dist > maxR) {
          dx = (dx / dist) * maxR;
          dy = (dy / dist) * maxR;
        }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;

        const deadzone = 14;
        this.touchDir.left = dx < -deadzone;
        this.touchDir.right = dx > deadzone;
        this.touchDir.up = dy < -deadzone * 1.25;
        this.touchDir.down = dy > deadzone * 1.1;
      };

      const resetStick = () => {
        dragging = false;
        knob.style.transform = 'translate(0px, 0px)';
        this.touchDir = { up: false, down: false, left: false, right: false };
      };

      base.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        dragging = true;
        base.setPointerCapture(e.pointerId);
        updateStick(e.clientX, e.clientY);
      });

      base.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        updateStick(e.clientX, e.clientY);
      });

      base.addEventListener('pointerup', resetStick);
      base.addEventListener('pointercancel', resetStick);
    }

    // D-Pad Fallback Buttons
    document.querySelectorAll('.dpad-btn').forEach((btn) => {
      const dir = btn.getAttribute('data-dir');
      const setDir = (val) => {
        this.touchDir[dir] = val;
        btn.classList.toggle('pressed', val);
      };
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        setDir(true);
      });
      btn.addEventListener('pointerup', () => setDir(false));
      btn.addEventListener('pointerleave', () => setDir(false));
      btn.addEventListener('pointercancel', () => setDir(false));
    });

    // Action Buttons (Normal Attack, Crazy Attack, DO NOT PRESS THIS BUTTON)
    const bindActionBtn = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.p1QueuedPresses[key] = true;
        this.touchButtons[key] = true;
      });
      const release = () => {
        this.touchButtons[key] = false;
      };
      el.addEventListener('pointerup', release);
      el.addEventListener('pointerleave', release);
      el.addEventListener('pointercancel', release);
    };

    bindActionBtn('btn-atk-normal', 'normal');
    bindActionBtn('btn-atk-crazy', 'crazy');
    bindActionBtn('btn-do-not-press', 'doNotPress');
  }

  gatherPlayer1Input() {
    const inSoloMode = this.selectedMode !== 'versus';
    const left =
      this.keysDown.has('KeyA') ||
      (inSoloMode && this.keysDown.has('ArrowLeft')) ||
      this.touchDir.left;
    const right =
      this.keysDown.has('KeyD') ||
      (inSoloMode && this.keysDown.has('ArrowRight')) ||
      this.touchDir.right;
    const up =
      this.keysDown.has('KeyW') ||
      (inSoloMode && this.keysDown.has('ArrowUp')) ||
      this.touchDir.up;
    const down =
      this.keysDown.has('KeyS') ||
      (inSoloMode && this.keysDown.has('ArrowDown')) ||
      this.touchDir.down;

    const normal = this.p1QueuedPresses.normal || this.touchButtons.normal;
    const crazy = this.p1QueuedPresses.crazy || this.touchButtons.crazy;
    const doNotPress = this.p1QueuedPresses.doNotPress || this.touchButtons.doNotPress;

    this.p1QueuedPresses = { normal: false, crazy: false, doNotPress: false };

    return { left, right, up, down, normal, crazy, doNotPress };
  }

  gatherPlayer2Input() {
    const left = this.keysDown.has('ArrowLeft');
    const right = this.keysDown.has('ArrowRight');
    const up = this.keysDown.has('ArrowUp');
    const down = this.keysDown.has('ArrowDown');

    const normal = this.p2QueuedPresses.normal;
    const crazy = this.p2QueuedPresses.crazy;
    const doNotPress = this.p2QueuedPresses.doNotPress;

    this.p2QueuedPresses = { normal: false, crazy: false, doNotPress: false };

    return { left, right, up, down, normal, crazy, doNotPress };
  }

  updateFightHUD() {
    const p1 = this.engine.p1;
    const p2 = this.engine.p2;
    if (!p1 || !p2) return;

    const p1Pct = Math.max(0, Math.round((p1.hp / p1.maxHp) * 100));
    const p2Pct = Math.max(0, Math.round((p2.hp / p2.maxHp) * 100));

    const p1Bar = document.getElementById('hud-p1-hp-bar');
    const p2Bar = document.getElementById('hud-p2-hp-bar');
    if (p1Bar) {
      p1Bar.style.width = `${p1Pct}%`;
      p1Bar.classList.toggle('low-hp', p1Pct <= 30);
    }
    if (p2Bar) {
      p2Bar.style.width = `${p2Pct}%`;
      p2Bar.classList.toggle('low-hp', p2Pct <= 30);
    }

    document.getElementById('hud-p1-hp-text').textContent = `${p1Pct}%`;
    document.getElementById('hud-p2-hp-text').textContent = `${p2Pct}%`;

    document.getElementById('hud-p1-rounds').textContent = '★'.repeat(this.engine.p1RoundWins);
    document.getElementById('hud-p2-rounds').textContent = '★'.repeat(this.engine.p2RoundWins);

    const p1SpecEl = document.getElementById('hud-p1-special-status');
    if (p1SpecEl) {
      p1SpecEl.textContent =
        p1.specialCooldown <= 0 ? '⚡ CRAZY: READY' : `⚡ CRAZY: ${p1.specialCooldown.toFixed(1)}s`;
    }

    const p1RedEl = document.getElementById('hud-p1-red-status');
    const dnpBtn = document.getElementById('btn-do-not-press');
    const dnpLbl = document.getElementById('btn-dnp-ult-label');
    const redReady = p1.redButtonCharge >= 100 && p1.redButtonCooldown <= 0;

    if (p1RedEl) {
      p1RedEl.textContent = redReady
        ? '🚨 RED BUTTON: READY!'
        : `🚨 RED BUTTON: ${Math.floor(p1.redButtonCharge)}%`;
    }
    if (dnpBtn) {
      dnpBtn.classList.toggle('cooldown', !redReady);
    }
    if (dnpLbl) {
      dnpLbl.textContent = redReady
        ? `${p1.data.doNotPress.name} READY!`
        : `RECHARGING (${Math.floor(p1.redButtonCharge)}%)`;
    }

    const p2SpecEl = document.getElementById('hud-p2-special-status');
    if (p2SpecEl) {
      p2SpecEl.textContent =
        p2.specialCooldown <= 0 ? '⚡ CRAZY: READY' : `⚡ CRAZY: ${p2.specialCooldown.toFixed(1)}s`;
    }
    const p2RedEl = document.getElementById('hud-p2-red-status');
    if (p2RedEl) {
      p2RedEl.textContent =
        p2.redButtonCharge >= 100 && p2.redButtonCooldown <= 0
          ? '🚨 RED BUTTON: READY!'
          : `🚨 RED BUTTON: ${Math.floor(p2.redButtonCharge)}%`;
    }

    const timerEl = document.getElementById('hud-timer');
    if (timerEl) {
      timerEl.textContent = this.selectedMode === 'training' ? '∞' : String(Math.ceil(this.engine.roundTimer));
    }

    const matchLabel = document.getElementById('hud-match-label');
    if (matchLabel) {
      if (this.selectedMode === 'arcade') {
        matchLabel.textContent = `ARCADE • STAGE ${this.arcadeStageIndex + 1}/${this.arcadeLadder.length}`;
      } else if (this.selectedMode === 'survival') {
        matchLabel.textContent = `SURVIVAL • WAVE ${this.survivalWave}`;
      } else if (this.selectedMode === 'training') {
        matchLabel.textContent = 'TRAINING DOJO';
      } else {
        matchLabel.textContent = `VERSUS • ROUND ${this.engine.roundNumber}`;
      }
    }

    const scoreLine = document.getElementById('hud-score-line');
    if (scoreLine) {
      scoreLine.textContent =
        this.selectedMode === 'survival'
          ? `STREAK: ${this.engine.longestStreak} • SCORE: ${this.engine.score.toLocaleString()}`
          : `SCORE: ${this.engine.score.toLocaleString()}`;
    }
  }

  gameLoop(timestamp) {
    const dt = Math.min(0.05, Math.max(0.001, (timestamp - this.lastFrameTime) / 1000));
    this.lastFrameTime = timestamp;

    const fightScreen = document.getElementById('screen-fight');
    if (fightScreen && !fightScreen.hidden && !this.isPaused && this.engine.p1 && this.engine.p2) {
      const p1In = this.gatherPlayer1Input();
      const p2In = this.gatherPlayer2Input();
      this.engine.update(dt, p1In, p2In);
      this.renderer.render(this.engine);
      this.updateFightHUD();
    }

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const app = new FarmFighterApp();
    app.init();
    window.FARM_FIGHTER_IV = app;
  });
}
