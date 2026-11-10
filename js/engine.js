/**
 * FARM FIGHTER IV — Core Arcade Fighting Engine, Physics, Specials, Hazards & AI
 */

import { ROUND_CALLOUTS } from './data.js';
import { audio } from './audio.js';

export class FighterEntity {
  constructor(fighterData, playerIndex, x, facing, isCPU = false) {
    this.data = fighterData;
    this.playerIndex = playerIndex;
    this.isCPU = isCPU;

    this.maxHp = fighterData.stats.hp || 1000;
    this.hp = this.maxHp;

    this.x = x;
    this.y = 445;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;

    this.state = 'idle'; // idle | walk | jump | crouch | attack | special | ultimate | hit | ko | victory
    this.stateTimer = 0;

    this.isGrounded = true;
    this.isBlocking = false;

    this.comboStep = 0;
    this.comboWindowTimer = 0;
    this.specialCycleIndex = 0;

    this.normalCooldown = 0;
    this.specialCooldown = 0;
    this.specialMaxCooldown = 1.8;

    // DO NOT PRESS THIS BUTTON charge (starts at 100% so players can immediately press it!)
    this.redButtonCharge = 100;
    this.redButtonCooldown = 0;

    this.hitFlashTimer = 0;
    this.selfStunTimer = 0;
    this.activeHitbox = null;
    this.hasConnectedCurrentMove = false;

    this.comboCounter = 0;
    this.comboResetTimer = 0;
    this.aiDecisionTimer = 0;
  }

  resetForRound(x, facing, preserveHpPct = null) {
    this.x = x;
    this.y = 445;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;
    if (preserveHpPct !== null) {
      this.hp = Math.min(this.maxHp, Math.max(250, Math.round(this.maxHp * preserveHpPct)));
    } else {
      this.hp = this.maxHp;
    }
    this.state = 'idle';
    this.stateTimer = 0;
    this.isGrounded = true;
    this.isBlocking = false;
    this.normalCooldown = 0;
    this.specialCooldown = 0;
    this.redButtonCharge = 100;
    this.redButtonCooldown = 0;
    this.hitFlashTimer = 0;
    this.selfStunTimer = 0;
    this.activeHitbox = null;
    this.hasConnectedCurrentMove = false;
    this.comboCounter = 0;
    this.comboResetTimer = 0;
  }
}

export class FightEngine {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.width = 960;
    this.height = 540;
    this.groundY = 445;
    this.gravity = 1650;

    this.mode = 'arcade'; // arcade | survival | training | versus
    this.trainingBehaviour = 'passive'; // passive | light | counter
    this.infiniteMeter = false;

    this.arena = null;
    this.p1 = null;
    this.p2 = null;

    this.roundNumber = 1;
    this.p1RoundWins = 0;
    this.p2RoundWins = 0;
    this.roundTimer = 99;
    this.roundPhase = 'intro'; // intro | fight | ko | match_over
    this.phaseTimer = 2.0;

    this.score = 0;
    this.wins = 0;
    this.knockouts = 0;
    this.longestStreak = 0;
    this.redButtonPresses = 0;
    this.runStartTimeMs = 0;
    this.elapsedTime = 0;

    this.projectiles = [];
    this.hazards = [];
    this.particles = [];
    this.floatingTexts = [];
    this.banner = { title: '', subtitle: '', color: '#ffbe0b', timer: 0 };
    this.ultimateEffect = { title: '', subtitle: '', timer: 0 };
    this.screenShake = 0;
    this.hazardSpawnTimer = 4.5;
  }

  startMatch({ mode, p1Fighter, p2Fighter, arena, isP2CPU, aiDifficulty = 1, preserveScore = false, preserveP1HpPct = null }) {
    this.mode = mode;
    this.arena = arena;
    this.aiDifficulty = aiDifficulty;

    if (!preserveScore) {
      this.score = 0;
      this.wins = 0;
      this.knockouts = 0;
      this.longestStreak = 0;
      this.redButtonPresses = 0;
      this.runStartTimeMs = performance.now();
    }

    this.p1 = new FighterEntity(p1Fighter, 1, 240, 1, false);
    this.p2 = new FighterEntity(p2Fighter, 2, 720, -1, isP2CPU);

    if (preserveP1HpPct !== null) {
      this.p1.hp = Math.min(this.p1.maxHp, Math.max(300, Math.round(this.p1.maxHp * preserveP1HpPct)));
    }

    this.roundNumber = 1;
    this.p1RoundWins = 0;
    this.p2RoundWins = 0;

    this.startRound(preserveP1HpPct);
  }

  startRound(preserveP1HpPct = null) {
    this.p1.resetForRound(240, 1, preserveP1HpPct);
    this.p2.resetForRound(720, -1, null);

    this.roundTimer = this.mode === 'training' ? 999 : 99;
    this.roundPhase = 'intro';
    this.phaseTimer = 1.75;

    this.projectiles = [];
    this.hazards = [];
    this.particles = [];
    this.floatingTexts = [];
    this.ultimateEffect = { title: '', subtitle: '', timer: 0 };
    this.screenShake = 0;
    this.hazardSpawnTimer = 3.8;

    const callout = ROUND_CALLOUTS[(this.roundNumber - 1) % ROUND_CALLOUTS.length];
    this.showBanner(
      this.mode === 'training' ? 'TRAINING DOJO' : this.mode === 'survival' ? `WAVE ${this.wins + 1}` : `ROUND ${this.roundNumber}`,
      callout,
      '#ffbe0b',
      1.7
    );
    audio.playRoundBell();
  }

  showBanner(title, subtitle = '', color = '#ffbe0b', duration = 1.6) {
    this.banner = { title, subtitle, color, timer: duration };
    audio.announce(title);
  }

  addFloatingText(x, y, text, color = '#ffbe0b', size = 22) {
    this.floatingTexts.push({ x, y, text, color, size, life: 1.0 });
  }

  spawnParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 80 + Math.random() * 240;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 60,
        color,
        size: 3 + Math.random() * 5,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.6
      });
    }
  }

  update(dt, p1Input = {}, p2Input = {}) {
    this.elapsedTime += dt;

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 28);
    }
    if (this.banner.timer > 0) {
      this.banner.timer = Math.max(0, this.banner.timer - dt);
    }
    if (this.ultimateEffect.timer > 0) {
      this.ultimateEffect.timer = Math.max(0, this.ultimateEffect.timer - dt);
    }

    // Update particles & floating texts
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 400 * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 42 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // Handle Round Phases
    if (this.roundPhase === 'intro') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.roundPhase = 'fight';
        this.showBanner('CLOBBERING COMMENCES!', 'UNNECESSARY VIOLENCE!', '#06d6a0', 0.95);
      }
      return;
    }

    if (this.roundPhase === 'ko') {
      this.phaseTimer -= dt;
      this.updateFighterPhysicsOnly(this.p1, dt);
      this.updateFighterPhysicsOnly(this.p2, dt);
      if (this.phaseTimer <= 0) {
        this.resolvePostKO();
      }
      return;
    }

    if (this.roundPhase === 'match_over') {
      return;
    }

    // Active Fight Phase
    if (this.mode !== 'training') {
      this.roundTimer = Math.max(0, this.roundTimer - dt);
      if (this.roundTimer <= 0) {
        this.triggerRoundEndByTime();
        return;
      }
    } else {
      // Training Mode regenerates HP after 2.5 seconds out of hitstun
      if (this.p2.state === 'idle' && this.p2.hp < this.p2.maxHp && this.p2.comboResetTimer <= 0) {
        this.p2.hp = Math.min(this.p2.maxHp, this.p2.hp + 260 * dt);
      }
      if (this.p1.state === 'idle' && this.p1.hp < this.p1.maxHp) {
        this.p1.hp = Math.min(this.p1.maxHp, this.p1.hp + 260 * dt);
      }
      if (this.infiniteMeter) {
        this.p1.redButtonCharge = 100;
        this.p1.redButtonCooldown = 0;
        this.p1.specialCooldown = 0;
      }
    }

    // Face each other when neutral on ground
    if (this.p1.isGrounded && (this.p1.state === 'idle' || this.p1.state === 'walk' || this.p1.state === 'crouch')) {
      this.p1.facing = this.p2.x >= this.p1.x ? 1 : -1;
    }
    if (this.p2.isGrounded && (this.p2.state === 'idle' || this.p2.state === 'walk' || this.p2.state === 'crouch')) {
      this.p2.facing = this.p1.x >= this.p2.x ? 1 : -1;
    }

    // Compute AI input if P2 is CPU
    const effectiveP2Input = this.p2.isCPU ? this.computeAIInput(this.p2, this.p1, dt) : p2Input;

    this.updateFighter(this.p1, this.p2, p1Input, dt);
    this.updateFighter(this.p2, this.p1, effectiveP2Input, dt);

    // Push fighters apart if overlapping horizontally
    const minSep = 62;
    const dist = Math.abs(this.p1.x - this.p2.x);
    if (dist < minSep && Math.abs(this.p1.y - this.p2.y) < 90) {
      const push = (minSep - dist) * 0.5;
      if (this.p1.x <= this.p2.x) {
        this.p1.x = Math.max(55, this.p1.x - push);
        this.p2.x = Math.min(this.width - 55, this.p2.x + push);
      } else {
        this.p1.x = Math.min(this.width - 55, this.p1.x + push);
        this.p2.x = Math.max(55, this.p2.x - push);
      }
    }

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Stage Hazards (County Fair Corn, Tractor Supply Shopping Carts, Ultimate Rain)
    this.updateStageHazards(dt);

    // Check Melee Hitbox Collisions
    this.checkMeleeHit(this.p1, this.p2);
    this.checkMeleeHit(this.p2, this.p1);

    // Check for Knockouts
    if (this.p1.hp <= 0 || this.p2.hp <= 0) {
      if (this.mode === 'training') {
        // In Training Mode, refill dummy HP on "KO" with a celebratory callout instead of ending match
        if (this.p2.hp <= 0) {
          this.p2.hp = this.p2.maxHp;
          this.addFloatingText(this.p2.x, this.p2.y - 110, 'DUMMY RESET!', '#06d6a0', 24);
        }
        if (this.p1.hp <= 0) {
          this.p1.hp = this.p1.maxHp;
        }
      } else {
        this.triggerKO();
      }
    }
  }

  updateFighterPhysicsOnly(f, dt) {
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    if (!f.isGrounded) {
      f.vy += (this.gravity * (f.gravityMultiplier || 1)) * dt;
      if (f.y >= this.groundY) {
        f.y = this.groundY;
        f.vy = 0;
        f.isGrounded = true;
      }
    }
    f.x = Math.max(55, Math.min(this.width - 55, f.x));
  }

  updateFighter(f, opp, input, dt) {
    // Cooldowns & timers
    f.normalCooldown = Math.max(0, f.normalCooldown - dt);
    f.specialCooldown = Math.max(0, f.specialCooldown - dt);
    f.redButtonCooldown = Math.max(0, f.redButtonCooldown - dt);
    f.hitFlashTimer = Math.max(0, f.hitFlashTimer - dt);
    f.comboWindowTimer = Math.max(0, f.comboWindowTimer - dt);

    if (f.comboResetTimer > 0) {
      f.comboResetTimer -= dt;
      if (f.comboResetTimer <= 0) {
        f.comboCounter = 0;
      }
    }

    // Passive recharge for DO NOT PRESS THIS BUTTON
    if (f.redButtonCharge < 100) {
      f.redButtonCharge = Math.min(100, f.redButtonCharge + dt * 7.5);
    }

    if (f.selfStunTimer > 0) {
      f.selfStunTimer -= dt;
      f.vx *= 0.85;
      this.updateFighterPhysicsOnly(f, dt);
      return;
    }

    // State timer expiration (attack, special, ultimate, hit)
    if (f.stateTimer > 0) {
      f.stateTimer -= dt;
      if (f.stateTimer <= 0) {
        f.activeHitbox = null;
        f.state = f.isGrounded ? 'idle' : 'jump';
      }
    }

    // If in hitstun or executing a move, apply physics and return
    if (f.state === 'hit' || f.state === 'attack' || f.state === 'special' || f.state === 'ultimate') {
      f.vx *= 0.9;
      this.updateFighterPhysicsOnly(f, dt);
      return;
    }

    // Check Action Buttons First:
    // 1. DO NOT PRESS THIS BUTTON (H for P1, 3 for P2)
    if (input.doNotPress && f.redButtonCharge >= 100 && f.redButtonCooldown <= 0) {
      this.executeDoNotPressUltimate(f, opp);
      return;
    }

    // 2. Crazy Attack (G for P1, 2 for P2)
    if (input.crazy && f.specialCooldown <= 0) {
      this.executeCrazyAttack(f, opp, input);
      return;
    }

    // 3. Normal Attack (F for P1, 1 for P2)
    if (input.normal && f.normalCooldown <= 0) {
      this.executeNormalAttack(f, input);
      return;
    }

    // Movement & Blocking
    const moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const holdingBack = moveDir !== 0 && moveDir === -f.facing;
    const oppAttacking = opp.state === 'attack' || opp.state === 'special' || opp.state === 'ultimate' || this.projectiles.length > 0;

    f.isBlocking = (holdingBack || input.down) && f.isGrounded && oppAttacking;

    if (input.down && f.isGrounded) {
      f.state = 'crouch';
      f.vx = 0;
    } else if (moveDir !== 0) {
      const walkSpd = f.data.stats.walkSpeed || 290;
      f.vx = moveDir * (f.isBlocking ? walkSpd * 0.45 : walkSpd);
      if (f.isGrounded) f.state = 'walk';
    } else {
      f.vx = 0;
      if (f.isGrounded) f.state = 'idle';
    }

    if (input.up && f.isGrounded) {
      f.vy = -(f.data.stats.jumpForce || 650);
      f.isGrounded = false;
      f.state = 'jump';
      f.isBlocking = false;
      audio.playJump();
    }

    this.updateFighterPhysicsOnly(f, dt);
  }

  executeNormalAttack(f, input) {
    f.isBlocking = false;
    f.state = 'attack';
    f.hasConnectedCurrentMove = false;

    if (f.comboWindowTimer > 0) {
      f.comboStep = (f.comboStep + 1) % 3;
    } else {
      f.comboStep = 0;
    }
    f.comboWindowTimer = 0.55;

    const isAir = !f.isGrounded;
    const isLow = input.down && f.isGrounded;

    let dmg = 42;
    let knockbackX = 140;
    let knockbackY = -40;
    let label = 'PECK!';

    if (isAir) {
      dmg = 58;
      knockbackX = 210;
      label = 'AIR STRIKE!';
      f.stateTimer = 0.28;
      f.normalCooldown = 0.3;
    } else if (isLow) {
      dmg = 48;
      knockbackX = 180;
      knockbackY = -120;
      label = 'LOW SWEEP!';
      f.stateTimer = 0.26;
      f.normalCooldown = 0.28;
    } else if (f.comboStep === 0) {
      dmg = 38;
      knockbackX = 95;
      label = 'JAB!';
      f.stateTimer = 0.2;
      f.normalCooldown = 0.2;
    } else if (f.comboStep === 1) {
      dmg = 48;
      knockbackX = 135;
      label = 'COMBO HIT!';
      f.stateTimer = 0.24;
      f.normalCooldown = 0.24;
    } else {
      dmg = 68;
      knockbackX = 290;
      knockbackY = -220;
      label = 'BARNYARD SMASH!';
      f.stateTimer = 0.32;
      f.normalCooldown = 0.36;
      f.vx = f.facing * 220;
    }

    // Scale slightly by character power stat
    dmg = Math.round(dmg * (0.85 + (f.data.stats.power || 8) * 0.025));

    f.activeHitbox = {
      rangeX: 98,
      rangeY: 85,
      damage: dmg,
      knockbackX,
      knockbackY,
      hitStun: 0.28,
      label,
      isHeavy: f.comboStep === 2 || isAir
    };
  }

  executeCrazyAttack(f, opp, input) {
    f.isBlocking = false;
    f.state = 'special';
    f.hasConnectedCurrentMove = false;

    const specials = f.data.specials;
    let chosenIdx = 0;
    const holdingForward = (f.facing === 1 && input.right) || (f.facing === -1 && input.left);
    const holdingBack = (f.facing === 1 && input.left) || (f.facing === -1 && input.right);

    if (input.up) {
      chosenIdx = 2 % specials.length;
    } else if (input.down || holdingBack) {
      chosenIdx = 1 % specials.length;
    } else if (holdingForward) {
      chosenIdx = 0;
    } else {
      // Neutral press cycles through all 3 signature specials so every player sees all 3!
      chosenIdx = f.specialCycleIndex % specials.length;
      f.specialCycleIndex = (f.specialCycleIndex + 1) % specials.length;
    }

    const spec = specials[chosenIdx] || specials[0];
    f.specialMaxCooldown = spec.cooldown || 1.8;
    f.specialCooldown = f.specialMaxCooldown;
    f.stateTimer = 0.52;

    audio.playAnimalCry(f.data.id);
    this.addFloatingText(f.x, f.y - 125, `${spec.name.toUpperCase()}!`, f.data.colors.accent || '#ffbe0b', 24);
    this.spawnParticles(f.x, f.y - 55, f.data.colors.aura || '#ffbe0b', 14);

    // Execute behavior based on special type
    switch (spec.type) {
      case 'projectile_barrage':
      case 'heavy_slam':
      case 'berserk_flurry':
      case 'flip_sonic': {
        // Launches signature projectile(s) + close hitbox
        const kindMap = {
          cluck_norris: 'egg',
          moo_tai: 'hay',
          billy_the_kid: 'tincan',
          woolverine: 'wool_bolt',
          quackie_chan: 'quack_ring',
          ham_solo: 'hay',
          marey_poppins: 'hay',
          dalai_llama: 'spit'
        };
        const kind = kindMap[f.data.id] || 'egg';
        const count = spec.type === 'projectile_barrage' ? 3 : 1;

        for (let i = 0; i < count; i++) {
          this.projectiles.push({
            ownerIndex: f.playerIndex,
            kind,
            x: f.x + f.facing * (45 + i * 28),
            y: f.y - 62 - (i % 2) * 14,
            vx: f.facing * (520 + i * 45),
            vy: spec.type === 'heavy_slam' ? -120 : 0,
            gravity: spec.type === 'heavy_slam' ? 420 : 0,
            damage: Math.round(spec.damage / count),
            label: spec.name.toUpperCase()
          });
        }

        if (spec.type === 'flip_sonic') {
          f.vy = -440;
          f.isGrounded = false;
        }

        f.activeHitbox = {
          rangeX: 110,
          rangeY: 95,
          damage: Math.round(spec.damage * 0.75),
          knockbackX: 280,
          knockbackY: -180,
          hitStun: 0.38,
          label: spec.name.toUpperCase(),
          isHeavy: true
        };
        break;
      }

      case 'anti_air_upper':
      case 'rising_upper':
      case 'leap_splash':
      case 'acrobatic_dive': {
        // Rising launcher or diving smash
        f.vx = f.facing * 340;
        f.vy = -590;
        f.isGrounded = false;
        f.activeHitbox = {
          rangeX: 120,
          rangeY: 115,
          damage: spec.damage,
          knockbackX: 320,
          knockbackY: -360,
          hitStun: 0.44,
          label: spec.name.toUpperCase(),
          isHeavy: true
        };
        break;
      }

      case 'dash_spin':
      case 'armored_charge':
      case 'low_slide':
      case 'battering_ram':
      case 'cannonball_roll':
      case 'bicycle_kick':
      case 'claw_slash':
      case 'mallet_smash':
      case 'static_burst':
      case 'hundred_slap':
      default: {
        // High-speed dash / multi-strike / burst special
        f.vx = f.facing * (spec.type === 'static_burst' || spec.type === 'hundred_slap' ? 180 : 540);
        if (spec.type === 'cannonball_roll' || spec.type === 'bicycle_kick') {
          f.vy = -240;
          f.isGrounded = false;
        }
        f.activeHitbox = {
          rangeX: 135,
          rangeY: 100,
          damage: spec.damage,
          knockbackX: 380,
          knockbackY: -220,
          hitStun: 0.42,
          label: spec.name.toUpperCase(),
          isHeavy: true
        };
        break;
      }
    }
  }

  executeDoNotPressUltimate(f, opp) {
    const ult = f.data.doNotPress;
    f.isBlocking = false;
    f.state = 'ultimate';
    f.stateTimer = 0.85;
    f.redButtonCharge = 0;
    f.redButtonCooldown = 5.0;
    f.hasConnectedCurrentMove = false;

    if (f.playerIndex === 1) {
      this.redButtonPresses++;
      this.score += 1500;
    }

    audio.playDoNotPressSiren();
    audio.playAnimalCry(f.data.id);

    this.screenShake = 18;
    this.ultimateEffect = {
      title: ult.name,
      subtitle: ult.subtitle,
      timer: 1.6
    };
    this.showBanner(ult.callout, `${f.data.name.toUpperCase()} PRESSED THE FORBIDDEN BUTTON!`, '#e63946', 1.5);

    // Massive immediate rush + arena-wide chaos barrage!
    f.vx = f.facing * 420;
    f.vy = -340;
    f.isGrounded = false;

    f.activeHitbox = {
      rangeX: 195,
      rangeY: 140,
      damage: Math.round(ult.damage * 0.65),
      knockbackX: 480,
      knockbackY: -380,
      hitStun: 0.55,
      label: ult.name,
      isHeavy: true
    };

    // Spawn ultimate chaos hazards across the arena!
    const emojiMap = {
      cluck_norris: '🐔',
      moo_tai: '🧀',
      ham_solo: '🔨',
      billy_the_kid: '🥫',
      woolverine: '⚡',
      quackie_chan: '🦆',
      marey_poppins: '🐴',
      dalai_llama: '🦙'
    };
    const rainEmoji = emojiMap[f.data.id] || '💥';

    if (f.data.id === 'marey_poppins') {
      // PONY APOCALYPSE: A herd of tiny stampeding horses rushes across the screen!
      // Can occasionally affect both fighters!
      const herdCanHitBoth = Math.random() < 0.45;
      const herdDir = f.facing;
      for (let i = 0; i < 8; i++) {
        const startX = herdDir === 1 ? -40 - i * 75 : this.width + 40 + i * 75;
        this.hazards.push({
          type: 'pony_stampede',
          ownerIndex: herdCanHitBoth ? 0 : f.playerIndex,
          x: startX,
          y: this.groundY - 10,
          vx: herdDir * (480 + Math.random() * 120),
          vy: 0,
          gravity: 0,
          damage: 34,
          label: 'PONY APOCALYPSE!'
        });
      }
      if (herdCanHitBoth) {
        this.addFloatingText(this.width / 2, 175, '⚠️ PONY APOCALYPSE: WILD HERD STAMPEDE!', '#ffd166', 20);
      }
    } else if (f.data.id === 'dalai_llama') {
      // LLAMAGEDDON: Screen-filling storm of flying llamas, wool, enlightenment effects, and spit particles!
      const llamaEmojis = ['🦙', '☁️', '✨', '💧', '🌀'];
      for (let i = 0; i < 10; i++) {
        this.hazards.push({
          type: 'ultimate_rain',
          ownerIndex: f.playerIndex,
          emoji: llamaEmojis[i % llamaEmojis.length],
          color: '#ffd166',
          x: 70 + i * 95 + (Math.random() * 30 - 15),
          y: -30 - i * 40,
          vx: (Math.random() - 0.5) * 140,
          vy: 380 + Math.random() * 180,
          damage: 32,
          label: 'LLAMAGEDDON!'
        });
      }
      // Unpredictable Zen effect: Transcendental Anti-Gravity Float, Spiritual Confusion, or Karmic Restoration!
      const zenRoll = Math.random();
      if (zenRoll < 0.38) {
        f.gravityMultiplier = 0.35;
        opp.gravityMultiplier = 0.35;
        f.vy = -380;
        opp.vy = -380;
        f.isGrounded = false;
        opp.isGrounded = false;
        this.addFloatingText(this.width / 2, 150, '🧘 TRANSCENDENTAL ZERO-GRAVITY! 🧘', '#ffd166', 22);
        setTimeout(() => {
          f.gravityMultiplier = 1;
          opp.gravityMultiplier = 1;
        }, 2600);
      } else if (zenRoll < 0.72) {
        opp.facing *= -1;
        this.addFloatingText(opp.x, opp.y - 120, '🕉️ SPIRITUALLY CONFUSED!', '#06d6a0', 18);
      } else {
        f.hp = Math.min(f.maxHp, f.hp + 65);
        this.addFloatingText(f.x, f.y - 130, '✨ KARMIC RESTORATION (+65 HP)!', '#06d6a0', 20);
      }
    } else {
      for (let i = 0; i < 7; i++) {
        this.hazards.push({
          type: 'ultimate_rain',
          ownerIndex: f.playerIndex,
          emoji: rainEmoji,
          color: f.data.colors.accent || '#ffbe0b',
          x: 110 + i * 120 + (Math.random() * 40 - 20),
          y: -40 - i * 55,
          vx: (Math.random() - 0.5) * 90,
          vy: 420 + Math.random() * 160,
          damage: 38,
          label: ult.name
        });
      }
    }

    // Occasional hilarious self-backfire comedy!
    if (Math.random() < (ult.selfBackfireChance || 0.18)) {
      f.selfStunTimer = 0.65;
      const recoilDmg = 35;
      f.hp = Math.max(1, f.hp - recoilDmg);
      this.addFloatingText(f.x, f.y - 145, ult.selfBackfireText, '#ffbe0b', 18);
    }
  }

  checkMeleeHit(attacker, defender) {
    if (!attacker.activeHitbox || attacker.hasConnectedCurrentMove) return;
    if (defender.state === 'ko') return;

    const hb = attacker.activeHitbox;
    const dx = (defender.x - attacker.x) * attacker.facing;
    const dy = Math.abs(defender.y - attacker.y);

    if (dx >= -25 && dx <= hb.rangeX && dy <= hb.rangeY) {
      attacker.hasConnectedCurrentMove = true;
      this.applyHit(attacker, defender, hb);
    }
  }

  applyHit(attacker, defender, hitInfo) {
    const blocked = defender.isBlocking;
    const rawDamage = hitInfo.damage || 45;
    const finalDamage = blocked ? Math.max(4, Math.round(rawDamage * 0.22)) : rawDamage;

    defender.hp = Math.max(0, defender.hp - finalDamage);
    defender.hitFlashTimer = 0.18;

    // Charge DO NOT PRESS THIS BUTTON meter for both fighters
    if (attacker) {
      attacker.redButtonCharge = Math.min(100, attacker.redButtonCharge + (blocked ? 6 : 14));
    }
    defender.redButtonCharge = Math.min(100, defender.redButtonCharge + 12);

    if (blocked) {
      audio.playBlock();
      defender.vx = (attacker ? attacker.facing : -defender.facing) * 140;
      this.spawnParticles(defender.x, defender.y - 55, '#00bbf9', 8);
      this.addFloatingText(defender.x, defender.y - 95, `BLOCKED (-${finalDamage})`, '#48cae4', 18);
      return;
    }

    if (hitInfo.isHeavy) {
      audio.playHeavyHit();
      this.screenShake = Math.max(this.screenShake, 10);
    } else {
      audio.playNormalHit();
      this.screenShake = Math.max(this.screenShake, 4);
    }

    defender.state = 'hit';
    defender.stateTimer = hitInfo.hitStun || 0.3;
    const pushDir = attacker ? attacker.facing : defender.x < this.width / 2 ? 1 : -1;
    defender.vx = pushDir * (hitInfo.knockbackX || 180);
    if (hitInfo.knockbackY && hitInfo.knockbackY < -100) {
      defender.vy = hitInfo.knockbackY;
      defender.isGrounded = false;
    }

    if (attacker) {
      attacker.comboCounter++;
      attacker.comboResetTimer = 1.6;
      if (attacker.playerIndex === 1) {
        this.score += finalDamage * 12 * Math.min(5, attacker.comboCounter);
      }
    }

    this.spawnParticles(defender.x, defender.y - 60, '#ffbe0b', 14);
    const comboSuffix = attacker && attacker.comboCounter > 1 ? ` (${attacker.comboCounter}x COMBO!)` : '';
    this.addFloatingText(defender.x, defender.y - 102, `${hitInfo.label || 'HIT!'} -${finalDamage}${comboSuffix}`, '#ffbe0b', 20);
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += (p.vy || 0) * dt;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }

      if (p.x < -60 || p.x > this.width + 60 || p.y > this.groundY + 20) {
        this.projectiles.splice(i, 1);
        continue;
      }

      const target = p.ownerIndex === 1 ? this.p2 : this.p1;
      const attacker = p.ownerIndex === 1 ? this.p1 : this.p2;

      if (Math.abs(p.x - target.x) < 46 && Math.abs(p.y - (target.y - 54)) < 54) {
        this.applyHit(attacker, target, {
          damage: p.damage || 45,
          knockbackX: 220,
          knockbackY: -120,
          hitStun: 0.3,
          label: p.label || 'PROJECTILE!',
          isHeavy: true
        });
        this.projectiles.splice(i, 1);
      }
    }
  }

  updateStageHazards(dt) {
    // Periodic stage hazards in County Fair & Tractor Supply Parking Lot
    if (this.arena.hazardType === 'corn' || this.arena.hazardType === 'shopping_cart') {
      this.hazardSpawnTimer -= dt;
      if (this.hazardSpawnTimer <= 0) {
        if (this.arena.hazardType === 'corn') {
          this.hazardSpawnTimer = 3.2 + Math.random() * 2.2;
          const fromLeft = Math.random() < 0.5;
          this.hazards.push({
            type: 'corn',
            ownerIndex: 0,
            x: fromLeft ? 40 : this.width - 40,
            y: 180,
            vx: fromLeft ? 220 + Math.random() * 180 : -(220 + Math.random() * 180),
            vy: -280 - Math.random() * 120,
            gravity: 680,
            damage: 32,
            label: 'SPECTATOR CORN!'
          });
        } else if (this.arena.hazardType === 'shopping_cart') {
          this.hazardSpawnTimer = 5.0 + Math.random() * 2.5;
          const fromLeft = Math.random() < 0.5;
          this.hazards.push({
            type: 'shopping_cart',
            ownerIndex: 0,
            x: fromLeft ? -40 : this.width + 40,
            y: this.groundY,
            vx: fromLeft ? 430 : -430,
            vy: 0,
            gravity: 0,
            damage: 65,
            label: 'ROGUE SHOPPING CART!'
          });
          this.addFloatingText(this.width / 2, 135, '🛒 AISLE 9: RUNAWAY SHOPPING CART!', '#ffbe0b', 20);
        }
      }
    }

    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const hz = this.hazards[i];
      hz.x += hz.vx * dt;
      hz.y += hz.vy * dt;
      if (hz.gravity) {
        hz.vy += hz.gravity * dt;
      }

      if (hz.x < -90 || hz.x > this.width + 90 || hz.y > this.groundY + 35) {
        this.hazards.splice(i, 1);
        continue;
      }

      // Check collision against fighters
      const targets = hz.ownerIndex === 1 ? [this.p2] : hz.ownerIndex === 2 ? [this.p1] : [this.p1, this.p2];
      let hitSomeone = false;

      for (const t of targets) {
        if (t.state === 'ko') continue;
        const hitY = hz.type === 'shopping_cart' || hz.type === 'pony_stampede' ? this.groundY - 28 : hz.y;
        if (Math.abs(hz.x - t.x) < 46 && Math.abs(hitY - (t.y - 46)) < 48) {
          const attacker = hz.ownerIndex === 1 ? this.p1 : hz.ownerIndex === 2 ? this.p2 : null;
          this.applyHit(attacker, t, {
            damage: hz.damage || 40,
            knockbackX: 260,
            knockbackY: -200,
            hitStun: 0.34,
            label: hz.label || 'STAGE HAZARD!',
            isHeavy: true
          });
          hitSomeone = true;
          break;
        }
      }

      if (hitSomeone && hz.type !== 'shopping_cart' && hz.type !== 'pony_stampede') {
        this.hazards.splice(i, 1);
      }
    }
  }

  computeAIInput(ai, opp, dt) {
    const input = { up: false, down: false, left: false, right: false, normal: false, crazy: false, doNotPress: false };

    if (this.mode === 'training') {
      if (this.trainingBehaviour === 'passive') {
        return input;
      }
      if (this.trainingBehaviour === 'counter') {
        const dist = Math.abs(ai.x - opp.x);
        if (dist < 130 && opp.state === 'attack') {
          input.left = ai.facing === 1;
          input.right = ai.facing === -1;
        } else if (dist < 110 && Math.random() < 0.08) {
          input.normal = true;
        }
        return input;
      }
    }

    const diff = this.mode === 'training' ? 0.45 : Math.min(1.6, 0.72 + (this.aiDifficulty - 1) * 0.14);
    const dx = opp.x - ai.x;
    const dist = Math.abs(dx);

    // Jump over incoming shopping carts!
    for (const hz of this.hazards) {
      if (hz.type === 'shopping_cart' && Math.abs(hz.x - ai.x) < 130 && ai.isGrounded) {
        if (Math.random() < 0.35 * diff) {
          input.up = true;
        }
      }
    }

    // Approach opponent if far away
    if (dist > 105) {
      if (dx > 0) input.right = true;
      else input.left = true;

      // Occasional ranged special or jump-in
      if (dist > 220 && ai.specialCooldown <= 0 && Math.random() < 0.025 * diff) {
        input.crazy = true;
        input.down = true;
      } else if (dist < 240 && ai.isGrounded && Math.random() < 0.015 * diff) {
        input.up = true;
      }
    } else {
      // Close range combat decisions
      if ((opp.state === 'attack' || opp.state === 'special') && Math.random() < 0.28 * diff) {
        // Guard by holding back
        if (ai.facing === 1) input.left = true;
        else input.right = true;
        return input;
      }

      if (ai.redButtonCharge >= 100 && ai.redButtonCooldown <= 0 && ai.hp < ai.maxHp * 0.55 && Math.random() < 0.03 * diff) {
        input.doNotPress = true;
      } else if (ai.specialCooldown <= 0 && Math.random() < 0.055 * diff) {
        input.crazy = true;
        if (opp.y < this.groundY - 40) input.up = true;
        else if (Math.random() < 0.5) input.right = ai.facing === 1;
      } else if (ai.normalCooldown <= 0 && Math.random() < 0.14 * diff) {
        input.normal = true;
      }
    }

    return input;
  }

  triggerRoundEndByTime() {
    this.roundPhase = 'ko';
    this.phaseTimer = 2.2;
    audio.playKO();

    if (this.p1.hp >= this.p2.hp) {
      this.p1RoundWins++;
      this.p1.state = 'victory';
      this.showBanner('TIME OVER!', this.p1.data.victoryCallout, '#ffbe0b', 2.1);
    } else {
      this.p2RoundWins++;
      this.p2.state = 'victory';
      this.showBanner('TIME OVER!', this.p2.data.victoryCallout, '#ef476f', 2.1);
    }
  }

  triggerKO() {
    this.roundPhase = 'ko';
    this.phaseTimer = 2.2;
    this.screenShake = 16;
    audio.playKO();

    if (this.p2.hp <= 0) {
      this.p2.state = 'ko';
      this.p1.state = 'victory';
      this.p1RoundWins++;
      this.knockouts++;
      const hpBonus = Math.round(this.p1.hp * 4);
      const timeBonus = Math.round(this.roundTimer * 40);
      this.score += 5000 + hpBonus + timeBonus;
      this.showBanner('K.O.!!', this.p1.data.victoryCallout, '#ffbe0b', 2.1);
    } else {
      this.p1.state = 'ko';
      this.p2.state = 'victory';
      this.p2RoundWins++;
      this.showBanner('K.O.!!', this.p2.data.victoryCallout, '#e63946', 2.1);
    }
  }

  resolvePostKO() {
    // Survival mode is single-round elimination per wave!
    const roundsNeeded = this.mode === 'survival' ? 1 : 2;

    if (this.p1RoundWins >= roundsNeeded || this.p2RoundWins >= roundsNeeded) {
      this.roundPhase = 'match_over';
      const playerWon = this.p1RoundWins >= roundsNeeded;
      if (playerWon) {
        this.wins++;
        this.longestStreak = Math.max(this.longestStreak, this.wins);
        audio.playVictoryFanfare();
      }
      if (this.callbacks.onMatchEnd) {
        this.callbacks.onMatchEnd({
          playerWon,
          p1: this.p1,
          p2: this.p2,
          score: this.score,
          wins: this.wins,
          knockouts: this.knockouts,
          longestStreak: this.longestStreak,
          redButtonPresses: this.redButtonPresses,
          elapsedMs: Math.round(performance.now() - this.runStartTimeMs)
        });
      }
    } else {
      this.roundNumber++;
      this.startRound(null);
    }
  }
}
