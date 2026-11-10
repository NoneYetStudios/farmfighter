/**
 * FARM FIGHTER IV — Expressive Cartoon Vector/Canvas Stage & Fighter Renderer
 * Renders all 5 interactive arenas (including foreground Corn Maze obstacles and
 * the Two-Story Indoor Aquarium's unmentioned NO FISHING sign), all 6 articulated
 * farm fighters, projectiles, hit-sparks, and DO NOT PRESS THIS BUTTON spectacles.
 */

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.groundY = 445;
  }

  render(state) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const time = state.elapsedTime || 0;

    ctx.save();

    // Screen shake during heavy hits & DO NOT PRESS ultimates
    if (state.screenShake > 0) {
      const mag = state.screenShake;
      const dx = (Math.random() - 0.5) * mag * 2;
      const dy = (Math.random() - 0.5) * mag * 2;
      ctx.translate(dx, dy);
    }

    // 1. Background Arena Layer
    this.renderArenaBackground(ctx, state.arena, time, w, h);

    // 2. Ultimate Spectacle Background Overlay (Anime speedlines / Blood Sun / Disco / Lightning)
    if (state.ultimateEffect && state.ultimateEffect.timer > 0) {
      this.renderUltimateBackdrop(ctx, state.ultimateEffect, time, w, h);
    }

    // 3. Stage Hazards (Flying Corn, Runaway Shopping Carts, Ultimate Chaos Objects)
    if (state.hazards && state.hazards.length > 0) {
      for (const hz of state.hazards) {
        this.renderHazard(ctx, hz, time);
      }
    }

    // 4. Fighter Shadows
    this.renderFighterShadow(ctx, state.p1);
    this.renderFighterShadow(ctx, state.p2);

    // 5. Fighters (draw non-attacking fighter first so attacking fighter is on top)
    if (state.p1.state === 'attack' || state.p1.state === 'special' || state.p1.state === 'ultimate') {
      this.renderFighter(ctx, state.p2, time);
      this.renderFighter(ctx, state.p1, time);
    } else {
      this.renderFighter(ctx, state.p1, time);
      this.renderFighter(ctx, state.p2, time);
    }

    // 6. Projectiles (Eggs, Hay Bales, Tin Cans, Sonic Quacks, Yarn Balls)
    if (state.projectiles && state.projectiles.length > 0) {
      for (const proj of state.projectiles) {
        this.renderProjectile(ctx, proj, time);
      }
    }

    // 7. Foreground Arena Layer (Corn Maze visibility obstacles, dust motes, etc.)
    this.renderArenaForeground(ctx, state.arena, time, w, h);

    // 8. Hit Sparks, Feathers, Wool Puffs & Floating Text Callouts
    if (state.particles && state.particles.length > 0) {
      for (const pt of state.particles) {
        this.renderParticle(ctx, pt);
      }
    }

    if (state.floatingTexts && state.floatingTexts.length > 0) {
      for (const ft of state.floatingTexts) {
        this.renderFloatingText(ctx, ft);
      }
    }

    // 9. Dramatic Center Callout Banner (Round Start, KO, DO NOT PRESS THIS BUTTON!)
    if (state.banner && state.banner.timer > 0) {
      this.renderCenterBanner(ctx, state.banner, w, h);
    }

    ctx.restore();
  }

  renderArenaBackground(ctx, arena, time, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    grad.addColorStop(0, arena.skyTop);
    grad.addColorStop(1, arena.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, this.groundY);

    switch (arena.id) {
      case 'the_barn':
        this.drawBarnBackground(ctx, time, w);
        break;
      case 'county_fair':
        this.drawCountyFairBackground(ctx, time, w);
        break;
      case 'tractor_supply':
        this.drawTractorSupplyBackground(ctx, time, w);
        break;
      case 'corn_maze':
        this.drawCornMazeBackground(ctx, time, w);
        break;
      case 'aquarium':
        this.drawAquariumBackground(ctx, time, w);
        break;
      default:
        this.drawBarnBackground(ctx, time, w);
        break;
    }

    // Stage Floor
    const floorGrad = ctx.createLinearGradient(0, this.groundY, 0, h);
    floorGrad.addColorStop(0, arena.floorColor);
    floorGrad.addColorStop(1, '#140f0b');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, this.groundY, w, h - this.groundY);

    // Top Floor Trim Line
    ctx.fillStyle = arena.floorTrim;
    ctx.fillRect(0, this.groundY - 4, w, 6);

    // Perspective Floor Planks / Markings
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 12; i++) {
      const topX = (w / 12) * i;
      const botX = w / 2 + (topX - w / 2) * 1.45;
      ctx.beginPath();
      ctx.moveTo(topX, this.groundY);
      ctx.lineTo(botX, h);
      ctx.stroke();
    }
  }

  drawBarnBackground(ctx, time, w) {
    // Wooden Barn Wall Planks
    ctx.fillStyle = '#4a2511';
    ctx.fillRect(40, 40, w - 80, this.groundY - 40);

    ctx.strokeStyle = '#2d1508';
    ctx.lineWidth = 3;
    for (let x = 80; x < w - 40; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, this.groundY);
      ctx.stroke();
    }

    // Hayloft Window & Sunbeams
    ctx.fillStyle = '#ffbe0b';
    ctx.fillRect(w / 2 - 70, 55, 140, 85);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(w / 2 - 70, 55, 140, 85);
    ctx.beginPath();
    ctx.moveTo(w / 2, 55);
    ctx.lineTo(w / 2, 140);
    ctx.moveTo(w / 2 - 70, 97);
    ctx.lineTo(w / 2 + 70, 97);
    ctx.stroke();

    // Sunbeam cone
    ctx.fillStyle = 'rgba(255, 209, 102, 0.12)';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 70, 140);
    ctx.lineTo(w / 2 + 70, 140);
    ctx.lineTo(w / 2 + 240, this.groundY);
    ctx.lineTo(w / 2 - 240, this.groundY);
    ctx.closePath();
    ctx.fill();

    // Stacked Hay Bales Left & Right
    const drawHayBale = (bx, by, bw, bh) => {
      ctx.fillStyle = '#e9c46a';
      ctx.strokeStyle = '#7f4f24';
      ctx.lineWidth = 3;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.strokeStyle = '#b5651d';
      ctx.beginPath();
      ctx.moveTo(bx + bw * 0.25, by);
      ctx.lineTo(bx + bw * 0.25, by + bh);
      ctx.moveTo(bx + bw * 0.75, by);
      ctx.lineTo(bx + bw * 0.75, by + bh);
      ctx.stroke();
    };
    drawHayBale(65, this.groundY - 65, 110, 65);
    drawHayBale(180, this.groundY - 55, 95, 55);
    drawHayBale(90, this.groundY - 120, 95, 55);

    drawHayBale(w - 185, this.groundY - 65, 110, 65);
    drawHayBale(w - 285, this.groundY - 55, 95, 55);
    drawHayBale(w - 170, this.groundY - 120, 95, 55);

    // Championship Barn Sign
    ctx.fillStyle = '#780000';
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 3;
    ctx.fillRect(w / 2 - 190, 160, 380, 44);
    ctx.strokeRect(w / 2 - 190, 160, 380, 44);
    ctx.fillStyle = '#ffd166';
    ctx.font = '900 18px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ GRAND BARNYARD DOJO • EST. 1991 ★', w / 2, 188);

    // Swinging Lanterns
    for (const lx of [220, w - 220]) {
      const swing = Math.sin(time * 2.5 + lx) * 8;
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lx, 40);
      ctx.lineTo(lx + swing, 110);
      ctx.stroke();
      ctx.fillStyle = '#ff9f1c';
      ctx.beginPath();
      ctx.arc(lx + swing, 118, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawCountyFairBackground(ctx, time, w) {
    // Rotating Giant Ferris Wheel
    const cx = w - 210;
    const cy = 195;
    const r = 115;
    ctx.save();
    ctx.strokeStyle = '#ffbe0b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const ang = time * 0.55 + (i * Math.PI) / 4;
      const gx = cx + Math.cos(ang) * r;
      const gy = cy + Math.sin(ang) * r;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(gx, gy);
      ctx.stroke();

      ctx.fillStyle = i % 2 === 0 ? '#ef476f' : '#06d6a0';
      ctx.fillRect(gx - 12, gy - 8, 24, 18);
    }
    ctx.restore();

    // Big Top Tent on Left
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.moveTo(60, this.groundY);
    ctx.lineTo(60, 240);
    ctx.lineTo(200, 130);
    ctx.lineTo(340, 240);
    ctx.lineTo(340, this.groundY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(130, this.groundY);
    ctx.lineTo(130, 240);
    ctx.lineTo(200, 130);
    ctx.lineTo(270, 240);
    ctx.lineTo(270, this.groundY);
    ctx.closePath();
    ctx.fill();

    // Cheering Spectator Silhouettes in Grandstand (who throw corn!)
    ctx.fillStyle = '#240046';
    ctx.fillRect(0, this.groundY - 75, w, 75);
    for (let sx = 45; sx < w - 40; sx += 48) {
      const bounce = Math.abs(Math.sin(time * 6 + sx)) * 10;
      ctx.fillStyle = '#3c096c';
      ctx.beginPath();
      ctx.arc(sx, this.groundY - 52 - bounce, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(sx - 15, this.groundY - 38 - bounce, 30, 38);
    }

    // Midway Banner
    ctx.fillStyle = '#3a0ca3';
    ctx.strokeStyle = '#ffbe0b';
    ctx.lineWidth = 3;
    ctx.fillRect(w / 2 - 220, 48, 440, 42);
    ctx.strokeRect(w / 2 - 220, 48, 440, 42);
    ctx.fillStyle = '#ffbe0b';
    ctx.font = '900 17px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌽 TRI-COUNTY FAIRGROUNDS • CORN TOSSING PERMITTED 🌽', w / 2, 75);
  }

  drawTractorSupplyBackground(ctx, time, w) {
    // Storefront Building
    ctx.fillStyle = '#ced4da';
    ctx.fillRect(60, 110, w - 120, this.groundY - 110);

    // Red Storefront Fascia Strip
    ctx.fillStyle = '#d62828';
    ctx.fillRect(45, 75, w - 90, 56);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 75, w - 90, 56);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRACTOR & FEED SUPPLY CO. • PARKING LOT BRAWL', w / 2, 111);

    // Propane Cage on Left
    ctx.fillStyle = '#f8f9fa';
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 3;
    ctx.fillRect(85, this.groundY - 120, 125, 120);
    ctx.strokeRect(85, this.groundY - 120, 125, 120);
    ctx.fillStyle = '#e63946';
    ctx.font = '800 13px Arial';
    ctx.fillText('PROPANE', 147, this.groundY - 95);
    ctx.fillText('NO HEADBUTTING', 147, this.groundY - 78);

    // Sliding Glass Automatic Doors
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(w / 2 - 120, this.groundY - 170, 240, 170);
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 4;
    ctx.strokeRect(w / 2 - 120, this.groundY - 170, 240, 170);
    ctx.beginPath();
    ctx.moveTo(w / 2, this.groundY - 170);
    ctx.lineTo(w / 2, this.groundY);
    ctx.stroke();

    // Cart Corral Warning Sign on Right
    ctx.fillStyle = '#ffbe0b';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.fillRect(w - 245, this.groundY - 140, 155, 65);
    ctx.strokeRect(w - 245, this.groundY - 140, 155, 65);
    ctx.fillStyle = '#111';
    ctx.font = '900 13px Arial';
    ctx.fillText('⚠️ CAUTION:', w - 167, this.groundY - 115);
    ctx.fillText('ROGUE SHOPPING CARTS', w - 167, this.groundY - 94);

    // Yellow Parking Stall Lines on Asphalt
    ctx.strokeStyle = '#ffbe0b';
    ctx.lineWidth = 4;
    for (let px = 160; px < w; px += 220) {
      ctx.beginPath();
      ctx.moveTo(px, this.groundY + 6);
      ctx.lineTo(px - 35, this.height);
      ctx.stroke();
    }
  }

  drawCornMazeBackground(ctx, time, w) {
    // Giant Harvest Moon
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(w / 2, 130, 68, 0, Math.PI * 2);
    ctx.fill();

    // Dense Background Corn Stalks
    for (let cx = 20; cx < w; cx += 28) {
      const sway = Math.sin(time * 2 + cx * 0.05) * 6;
      ctx.strokeStyle = cx % 56 === 0 ? '#2d6a4f' : '#40916c';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx, this.groundY);
      ctx.quadraticCurveTo(cx + sway, 260, cx + sway * 1.6, 130 + (cx % 45));
      ctx.stroke();

      // Golden Corn Tassel
      ctx.fillStyle = '#e9c46a';
      ctx.beginPath();
      ctx.arc(cx + sway * 1.6, 130 + (cx % 45), 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Crooked Wooden Maze Sign
    ctx.save();
    ctx.translate(w / 2, 265);
    ctx.rotate(-0.04);
    ctx.fillStyle = '#6c584c';
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.fillRect(-130, -24, 260, 48);
    ctx.strokeRect(-130, -24, 260, 48);
    ctx.fillStyle = '#ffbe0b';
    ctx.font = '900 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⬅ EXIT?   CORN MAZE   EXIT? ➡', 0, 6);
    ctx.restore();
  }

  drawAquariumBackground(ctx, time, w) {
    // Two-Story Indoor Aquarium Architecture!
    // Upper Story Glass Tank (y: 25..195) & Lower Story Glass Tank (y: 225..groundY)
    const drawTank = (ty, th) => {
      const tGrad = ctx.createLinearGradient(50, ty, 50, ty + th);
      tGrad.addColorStop(0, '#0077b6');
      tGrad.addColorStop(1, '#00b4d8');
      ctx.fillStyle = tGrad;
      ctx.fillRect(50, ty, w - 100, th);

      ctx.strokeStyle = '#90e0ef';
      ctx.lineWidth = 4;
      ctx.strokeRect(50, ty, w - 100, th);
    };

    drawTank(28, 155);
    drawTank(220, this.groundY - 220);

    // Second-Floor Walkway Balcony Divider
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(35, 183, w - 70, 38);
    ctx.strokeStyle = '#48cae4';
    ctx.lineWidth = 3;
    ctx.strokeRect(35, 183, w - 70, 38);

    // Swimming Fish & Sharks in Upper and Lower Tanks
    for (let i = 0; i < 9; i++) {
      const isUpper = i < 4;
      const speed = isUpper ? 55 + i * 12 : 42 + i * 9;
      const dir = i % 2 === 0 ? 1 : -1;
      const rawX = (time * speed + i * 170) % (w - 180);
      const fx = dir === 1 ? 90 + rawX : w - 90 - rawX;
      const fy = isUpper ? 65 + (i % 3) * 35 : 265 + (i % 4) * 38;

      ctx.save();
      ctx.translate(fx, fy);
      ctx.scale(dir, 1);
      ctx.fillStyle = isUpper ? '#03045e' : i % 2 === 0 ? '#ff9f1c' : '#ffbe0b';
      ctx.beginPath();
      ctx.ellipse(0, 0, isUpper ? 28 : 16, isUpper ? 11 : 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(isUpper ? -24 : -14, 0);
      ctx.lineTo(isUpper ? -40 : -25, -10);
      ctx.lineTo(isUpper ? -40 : -25, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Rising Bubbles
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    for (let b = 0; b < 14; b++) {
      const bx = 90 + ((b * 83) % (w - 180));
      const by = this.groundY - 20 - ((time * 45 + b * 40) % (this.groundY - 60));
      ctx.beginPath();
      ctx.arc(bx, by, 3 + (b % 4), 0, Math.PI * 2);
      ctx.fill();
    }

    // THE LARGE PROMINENT "NO FISHING" SIGN (Nobody mentions it. Ever.)
    const signW = 330;
    const signH = 74;
    const signX = w / 2 - signW / 2;
    const signY = 165;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#d62828';
    ctx.lineWidth = 7;
    ctx.fillRect(signX, signY, signW, signH);
    ctx.strokeRect(signX, signY, signW, signH);

    // Red Prohibition Circle-Slash Icon on left of sign
    ctx.strokeStyle = '#d62828';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(signX + 42, signY + signH / 2, 22, 0, Math.PI * 2);
    ctx.moveTo(signX + 27, signY + signH / 2 - 15);
    ctx.lineTo(signX + 57, signY + signH / 2 + 15);
    ctx.stroke();

    ctx.fillStyle = '#d62828';
    ctx.font = '900 34px "Segoe UI", Impact, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NO FISHING', signX + 190, signY + 49);
    ctx.restore();
  }

  renderArenaForeground(ctx, arena, time, w, h) {
    if (arena.id !== 'corn_maze') return;

    // Corn Maze Foreground Visibility Obstacles!
    // Tall foreground corn stalks & drifting harvest mist that partially obscure fighters
    const clusters = [w * 0.27, w * 0.5, w * 0.73];
    for (const baseX of clusters) {
      for (let i = -2; i <= 2; i++) {
        const stalkX = baseX + i * 16;
        const sway = Math.sin(time * 2.6 + stalkX * 0.04) * 10;
        ctx.strokeStyle = 'rgba(27, 67, 50, 0.88)';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(stalkX, h);
        ctx.quadraticCurveTo(stalkX + sway, this.groundY - 90, stalkX + sway * 1.4, this.groundY - 220);
        ctx.stroke();

        // Broad Corn Leaves sticking out
        ctx.fillStyle = 'rgba(45, 106, 79, 0.86)';
        ctx.beginPath();
        ctx.ellipse(stalkX + sway + (i % 2 === 0 ? 22 : -22), this.groundY - 115, 28, 9, i % 2 === 0 ? -0.35 : 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Drifting Ground Harvest Fog
    const fogOffset = Math.sin(time * 0.9) * 60;
    ctx.fillStyle = 'rgba(216, 243, 220, 0.22)';
    ctx.beginPath();
    ctx.ellipse(w * 0.35 + fogOffset, this.groundY - 45, 180, 42, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.65 - fogOffset, this.groundY - 55, 210, 48, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  renderUltimateBackdrop(ctx, ult, time, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(230, 57, 70, 0.26)';
    ctx.fillRect(0, 0, w, h);

    // High-energy diagonal arcade speedlines
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.45)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 18; i++) {
      const y = ((time * 900 + i * 35) % h);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y - 40);
      ctx.stroke();
    }

    // Top Warning Ribbon
    ctx.fillStyle = '#d62828';
    ctx.fillRect(0, 14, w, 34);
    ctx.fillStyle = '#ffd166';
    ctx.font = '900 18px "Segoe UI", Impact, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🚨 RED BUTTON PRESSED: ${ult.title} — ${ult.subtitle} 🚨`, w / 2, 37);
    ctx.restore();
  }

  renderFighterShadow(ctx, f) {
    const heightOffGround = Math.max(0, this.groundY - f.y);
    const scale = Math.max(0.35, 1 - heightOffGround / 350);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(f.x, this.groundY + 6, 44 * scale, 11 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  renderFighter(ctx, f, time) {
    ctx.save();
    ctx.translate(f.x, f.y);

    // Flip horizontally based on facing direction (1 = facing right, -1 = facing left)
    ctx.scale(f.facing, 1);

    // Hit flash
    if (f.hitFlashTimer > 0 && Math.floor(f.hitFlashTimer * 30) % 2 === 0) {
      ctx.filter = 'brightness(2.2) contrast(1.4)';
    }

    // State transforms (breathing, walking bounce, crouch squish, KO tilt)
    let bobY = Math.sin(time * 7 + (f.playerIndex || 0)) * 3;
    let scaleX = 1;
    let scaleY = 1;
    let rot = 0;

    if (f.state === 'walk') {
      bobY = -Math.abs(Math.sin(time * 16)) * 8;
      rot = Math.sin(time * 16) * 0.06;
    } else if (f.state === 'crouch') {
      scaleX = 1.16;
      scaleY = 0.74;
      bobY = 0;
    } else if (f.state === 'hit') {
      rot = -0.22;
      scaleX = 0.92;
      scaleY = 1.08;
    } else if (f.state === 'ko') {
      rot = -Math.PI / 2;
      bobY = -18;
    } else if (f.state === 'victory') {
      bobY = -Math.abs(Math.sin(time * 10)) * 16;
    }

    ctx.translate(0, bobY);
    ctx.rotate(rot);
    ctx.scale(scaleX, scaleY);

    // Special / Ultimate Aura
    if (f.state === 'special' || f.state === 'ultimate') {
      ctx.fillStyle = f.data.colors.aura || '#ffbe0b';
      ctx.globalAlpha = 0.35 + Math.sin(time * 25) * 0.15;
      ctx.beginPath();
      ctx.arc(0, -58, 64, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw Character Body by ID
    const isAttacking = f.state === 'attack' || f.state === 'special' || f.state === 'ultimate';
    const attackReach = isAttacking ? 28 : 0;

    this.drawCharacterSprite(ctx, f.data.id, time, isAttacking, attackReach, f);

    // Block Shield Bubble
    if (f.isBlocking) {
      ctx.strokeStyle = '#00bbf9';
      ctx.fillStyle = 'rgba(0, 187, 249, 0.22)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(14, -56, 56, -Math.PI * 0.65, Math.PI * 0.65);
      ctx.fill();
      ctx.stroke();
    }

    // Dizzy Stars on KO or Self-Backfire Stun
    if (f.state === 'ko' || f.selfStunTimer > 0) {
      for (let s = 0; s < 3; s++) {
        const ang = time * 6 + (s * Math.PI * 2) / 3;
        const sx = Math.cos(ang) * 32;
        const sy = -112 + Math.sin(ang) * 10;
        ctx.fillStyle = '#ffbe0b';
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // Player Indicator Tag above Fighter
    ctx.save();
    ctx.font = '900 12px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    const tagY = f.y - 132;
    ctx.fillStyle = f.playerIndex === 1 ? '#ffbe0b' : '#48cae4';
    ctx.fillText(f.playerIndex === 1 ? '▼ P1' : f.isCPU ? '▼ CPU' : '▼ P2', f.x, tagY);
    ctx.restore();
  }

  drawCharacterSprite(ctx, id, time, isAttacking, reach, fighter) {
    const legSwing = fighter.state === 'walk' ? Math.sin(time * 18) * 14 : 0;

    switch (id) {
      case 'cluck_norris': {
        // Yellow Chicken Legs
        ctx.strokeStyle = '#ff9f1c';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-12, -26);
        ctx.lineTo(-14 - legSwing, 0);
        ctx.moveTo(12, -26);
        ctx.lineTo(14 + legSwing, 0);
        ctx.stroke();

        // White Feathered Body & Karate Gi
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, -52, 34, 32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Black Belt
        ctx.fillStyle = '#111111';
        ctx.fillRect(-32, -46, 64, 9);
        ctx.fillStyle = '#e63946';
        ctx.fillRect(6, -46, 10, 20);

        // Head & Red Comb
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(-6, -106, 9, 0, Math.PI * 2);
        ctx.arc(4, -110, 10, 0, Math.PI * 2);
        ctx.arc(14, -104, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(4, -86, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Red Martial Arts Headband
        ctx.fillStyle = '#e63946';
        ctx.fillRect(-18, -98, 44, 8);
        ctx.beginPath();
        ctx.moveTo(-18, -94);
        ctx.lineTo(-38, -102 + Math.sin(time * 12) * 5);
        ctx.lineTo(-34, -86 + Math.sin(time * 12) * 5);
        ctx.closePath();
        ctx.fill();

        // Beak & Fierce Eye
        ctx.fillStyle = '#ffbe0b';
        ctx.beginPath();
        ctx.moveTo(22, -90);
        ctx.lineTo(44 + reach * 0.4, -84);
        ctx.lineTo(22, -77);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(14, -88, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Striking Wing / Flying Kick
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(18 + reach, -56, 22 + reach * 0.4, 12, isAttacking ? -0.2 : 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'moo_tai': {
        // Thick Bovine Legs with Muay Thai Ankle Wraps
        ctx.fillStyle = '#f8f9fa';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3.5;
        ctx.fillRect(-24 - legSwing * 0.6, -32, 16, 32);
        ctx.strokeRect(-24 - legSwing * 0.6, -32, 16, 32);
        ctx.fillRect(8 + legSwing * 0.6, -32, 16, 32);
        ctx.strokeRect(8 + legSwing * 0.6, -32, 16, 32);

        // Muscular Holstein Torso
        ctx.fillStyle = '#f8f9fa';
        ctx.beginPath();
        ctx.roundRect(-38, -86, 76, 58, 18);
        ctx.fill();
        ctx.stroke();

        // Black Holstein Spots
        ctx.fillStyle = '#212529';
        ctx.beginPath();
        ctx.arc(-18, -64, 13, 0, Math.PI * 2);
        ctx.arc(16, -48, 11, 0, Math.PI * 2);
        ctx.fill();

        // Muay Thai Championship Shorts Trim
        ctx.fillStyle = '#e63946';
        ctx.fillRect(-36, -42, 72, 14);
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(-16, -40, 32, 10);

        // Horns & Bovine Head
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.moveTo(-18, -104);
        ctx.lineTo(-36, -122);
        ctx.lineTo(-8, -112);
        ctx.moveTo(18, -104);
        ctx.lineTo(36, -122);
        ctx.lineTo(8, -112);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8f9fa';
        ctx.beginPath();
        ctx.roundRect(-20, -112, 44, 34, 10);
        ctx.fill();
        ctx.stroke();

        // Pink Snout & Gold Ring
        ctx.fillStyle = '#ffccd5';
        ctx.beginPath();
        ctx.roundRect(2, -98, 28, 18, 7);
        ctx.fill();
        ctx.stroke();

        // Striking Hoof / Uppercut Glove
        ctx.fillStyle = '#fb5607';
        ctx.beginPath();
        ctx.arc(28 + reach * 1.15, isAttacking ? -72 : -58, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'ham_solo': {
        // Trotter Legs
        ctx.fillStyle = '#ffafcc';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3.5;
        ctx.fillRect(-20 - legSwing * 0.6, -26, 14, 26);
        ctx.strokeRect(-20 - legSwing * 0.6, -26, 14, 26);
        ctx.fillRect(8 + legSwing * 0.6, -26, 14, 26);
        ctx.strokeRect(8 + legSwing * 0.6, -26, 14, 26);

        // Round Pig Body & Smuggler Vest
        ctx.fillStyle = '#ffafcc';
        ctx.beginPath();
        ctx.ellipse(0, -56, 38, 34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#2b2d42';
        ctx.fillRect(-28, -82, 22, 46);
        ctx.strokeRect(-28, -82, 22, 46);

        // Head, Cool Shades & Snout
        ctx.fillStyle = '#ffafcc';
        ctx.beginPath();
        ctx.arc(6, -90, 23, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Aviator Sunglasses
        ctx.fillStyle = '#111111';
        ctx.fillRect(6, -98, 22, 9);
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 2;
        ctx.strokeRect(6, -98, 22, 9);

        // Snout
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3;
        ctx.fillStyle = '#ff758f';
        ctx.beginPath();
        ctx.ellipse(28, -86, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Attacking Trotter or Giant Carnival Hammer
        if (isAttacking) {
          ctx.fillStyle = '#ffd166';
          ctx.fillRect(24, -74, 34 + reach, 8);
          ctx.fillStyle = '#e63946';
          ctx.fillRect(46 + reach, -96, 22, 44);
          ctx.strokeRect(46 + reach, -96, 22, 44);
        } else {
          ctx.fillStyle = '#ffafcc';
          ctx.beginPath();
          ctx.arc(22, -56, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        break;
      }

      case 'billy_the_kid': {
        // Agile Goat Hooves
        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-14, -30);
        ctx.lineTo(-16 - legSwing, 0);
        ctx.moveTo(14, -30);
        ctx.lineTo(16 + legSwing, 0);
        ctx.stroke();

        // Outlaw Goat Torso & Red Bandana
        ctx.fillStyle = '#e9ecef';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, -54, 32, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.moveTo(-18, -74);
        ctx.lineTo(24, -74);
        ctx.lineTo(8, -50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Goat Head, Goatee & Battering Horns
        const headShift = isAttacking ? reach * 1.1 : 0;
        ctx.fillStyle = '#adb5bd';
        ctx.beginPath();
        ctx.moveTo(-4 + headShift, -100);
        ctx.quadraticCurveTo(-28 + headShift, -126, -38 + headShift, -104);
        ctx.lineTo(-12 + headShift, -92);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e9ecef';
        ctx.beginPath();
        ctx.roundRect(-8 + headShift, -104, 38, 28, 8);
        ctx.fill();
        ctx.stroke();

        // Crazy Yellow Eye
        ctx.fillStyle = '#ffbe0b';
        ctx.beginPath();
        ctx.arc(16 + headShift, -92, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#111111';
        ctx.fillRect(13 + headShift, -94, 6, 3);
        break;
      }

      case 'woolverine': {
        // Dark Sheep Legs
        ctx.fillStyle = '#2b2d42';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3.5;
        ctx.fillRect(-18 - legSwing * 0.6, -28, 12, 28);
        ctx.fillRect(8 + legSwing * 0.6, -28, 12, 28);

        // Giant Fluffy Cloud of Merino Wool
        ctx.fillStyle = '#fff8e7';
        const puffs = [
          [-20, -60, 22],
          [18, -60, 22],
          [0, -76, 24],
          [-16, -42, 20],
          [16, -42, 20],
          [0, -52, 26]
        ];
        for (const [px, py, pr] of puffs) {
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Masked Wolverine Head & Yellow Fins
        ctx.fillStyle = '#2b2d42';
        ctx.beginPath();
        ctx.arc(10, -90, 19, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffbe0b';
        ctx.beginPath();
        ctx.moveTo(4, -96);
        ctx.lineTo(-14, -116);
        ctx.lineTo(14, -104);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Chrome Sheep-Shear Claws!
        ctx.strokeStyle = '#00bbf9';
        ctx.lineWidth = 4;
        const clawReach = 28 + reach * 1.25;
        for (let c = -1; c <= 1; c++) {
          ctx.beginPath();
          ctx.moveTo(16, -58 + c * 7);
          ctx.lineTo(16 + clawReach, -64 + c * 11);
          ctx.stroke();
        }
        break;
      }

      case 'marey_poppins': {
        // Refined Equine Legs with Golden Horseshoes
        ctx.fillStyle = '#8c5332';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3.5;
        ctx.fillRect(-22 - legSwing * 0.7, -30, 13, 30);
        ctx.strokeRect(-22 - legSwing * 0.7, -30, 13, 30);
        ctx.fillRect(9 + legSwing * 0.7, -30, 13, 30);
        ctx.strokeRect(9 + legSwing * 0.7, -30, 13, 30);

        // Gleaming Gold Horseshoes
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(-24 - legSwing * 0.7, -6, 17, 6);
        ctx.fillRect(7 + legSwing * 0.7, -6, 17, 6);

        // Elegant Victorian Equestrian Blazer & Ascot
        ctx.fillStyle = '#3a0ca3';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, -56, 32, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // White Jabot / Ascot Tie
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-8, -74);
        ctx.lineTo(8, -74);
        ctx.lineTo(4, -54);
        ctx.lineTo(-4, -54);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#e63946';
        ctx.fillRect(-3, -64, 6, 6);

        // Flowing Palomino Mane
        ctx.fillStyle = '#f4a261';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-16, -80);
        ctx.quadraticCurveTo(-34, -65, -28, -45);
        ctx.quadraticCurveTo(-14, -60, -10, -75);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Elegant Horse Head
        ctx.fillStyle = '#b07246';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-6, -82);
        ctx.lineTo(8, -108);
        ctx.lineTo(26, -104);
        ctx.lineTo(36, -82);
        ctx.lineTo(20, -72);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Horse Ears
        ctx.beginPath();
        ctx.moveTo(6, -108);
        ctx.lineTo(10, -122);
        ctx.lineTo(18, -106);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Soft Muzzle & Smile
        ctx.fillStyle = '#d49b74';
        ctx.beginPath();
        ctx.ellipse(32, -82, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(36, -83, 2, 0, Math.PI * 2);
        ctx.fill();

        // Big Eye with Fluttering Lashes
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(17, -92, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(19, -94, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Refined Feathered Derby Bonnet
        ctx.fillStyle = '#f72585';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(14, -114, 18, 5, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillRect(4, -126, 18, 12);
        ctx.strokeRect(4, -126, 18, 12);
        // Yellow Feather
        ctx.fillStyle = '#fee440';
        ctx.beginPath();
        ctx.moveTo(20, -126);
        ctx.quadraticCurveTo(34, -140, 24, -144);
        ctx.quadraticCurveTo(18, -134, 16, -126);
        ctx.closePath();
        ctx.fill();

        // Elegant Hoof Jab / Carousel Kick
        if (isAttacking) {
          ctx.fillStyle = '#b07246';
          ctx.strokeStyle = '#111';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.ellipse(28 + reach * 1.3, -56, 18 + reach * 0.3, 11, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Golden Horseshoe Flash
          ctx.fillStyle = '#ffd166';
          ctx.beginPath();
          ctx.arc(38 + reach * 1.4, -56, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = '#b07246';
          ctx.beginPath();
          ctx.arc(18, -54, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        break;
      }

      case 'dalai_llama': {
        // Soft Fleece Llama Legs
        ctx.fillStyle = '#fefae0';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3.5;
        ctx.fillRect(-20 - legSwing * 0.6, -30, 13, 30);
        ctx.strokeRect(-20 - legSwing * 0.6, -30, 13, 30);
        ctx.fillRect(8 + legSwing * 0.6, -30, 13, 30);
        ctx.strokeRect(8 + legSwing * 0.6, -30, 13, 30);

        // Cloven Dark Hooves
        ctx.fillStyle = '#582f0e';
        ctx.fillRect(-22 - legSwing * 0.6, -6, 15, 6);
        ctx.fillRect(6 + legSwing * 0.6, -6, 15, 6);

        // Monastic Saffron & Maroon Robe Draped Over Wool Body
        ctx.fillStyle = '#9b2226';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, -56, 34, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f77f00';
        ctx.beginPath();
        ctx.moveTo(-24, -74);
        ctx.lineTo(24, -50);
        ctx.lineTo(14, -30);
        ctx.lineTo(-30, -42);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Wooden Prayer Mala Beads
        ctx.fillStyle = '#bb9457';
        for (let b = -2; b <= 2; b++) {
          ctx.beginPath();
          ctx.arc(b * 9, -58 + Math.abs(b) * 4, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Long Fluffy Llama Neck
        ctx.fillStyle = '#fefae0';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(-4, -98, 22, 44, 8);
        ctx.fill();
        ctx.stroke();

        // Banana-Shaped Llama Ears
        ctx.beginPath();
        ctx.moveTo(2, -104);
        ctx.lineTo(-4, -126);
        ctx.lineTo(6, -108);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(14, -106);
        ctx.lineTo(20, -128);
        ctx.lineTo(22, -108);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Fluffy Llama Head & Cloud Topknot
        ctx.beginPath();
        ctx.arc(10, -100, 17, 0, Math.PI * 2);
        ctx.arc(6, -114, 8, 0, Math.PI * 2);
        ctx.arc(14, -114, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Serene Half-Closed Zen Eye
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(16, -100, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Llama Muzzle & Gentle Smirk
        ctx.fillStyle = '#faedcd';
        ctx.beginPath();
        ctx.ellipse(24, -96, 9, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(28, -96, 2, 0, Math.PI * 2);
        ctx.fill();

        // Transcendent Golden Halo Ring
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(10, -132, 22, 6, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Llama Slap / Transcendental Palm Strike
        if (isAttacking) {
          ctx.fillStyle = '#fefae0';
          ctx.strokeStyle = '#111';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.ellipse(26 + reach * 1.3, -64, 18 + reach * 0.35, 12, -0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Zen Palm Aura
          ctx.strokeStyle = '#06d6a0';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(38 + reach * 1.3, -64, 14, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#fefae0';
          ctx.beginPath();
          ctx.arc(16, -56, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        break;
      }

      case 'quackie_chan':
      default: {
        // Webbed Orange Duck Feet
        ctx.strokeStyle = '#ff9f1c';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-10, -26);
        ctx.lineTo(-14 - legSwing, 0);
        ctx.moveTo(10, -26);
        ctx.lineTo(14 + legSwing, 0);
        ctx.stroke();

        // White Duck Body in Blue Kung Fu Jacket
        ctx.fillStyle = '#0077b6';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, -52, 30, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Gold Frog Buttons
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-8, -62);
        ctx.lineTo(12, -62);
        ctx.moveTo(-8, -48);
        ctx.lineTo(12, -48);
        ctx.stroke();

        // Duck Head, Black Belt Headband & Orange Bill
        ctx.strokeStyle = '#111111';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(6, -86, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#111111';
        ctx.fillRect(-14, -97, 40, 6);

        ctx.fillStyle = '#ff9f1c';
        ctx.beginPath();
        ctx.ellipse(28, -82, 14, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(15, -88, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Kung Fu Wing / Flying Webbed Kick
        ctx.fillStyle = isAttacking ? '#ff9f1c' : '#ffffff';
        ctx.beginPath();
        ctx.ellipse(20 + reach * 1.2, -56, 20, 10, isAttacking ? -0.25 : 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
    }
  }

  renderProjectile(ctx, proj, time) {
    ctx.save();
    ctx.translate(proj.x, proj.y);
    ctx.rotate(time * 12);

    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 3;

    switch (proj.kind) {
      case 'egg':
        ctx.fillStyle = '#fff8e7';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      case 'hay':
        ctx.fillStyle = '#e9c46a';
        ctx.fillRect(-22, -16, 44, 32);
        ctx.strokeRect(-22, -16, 44, 32);
        break;
      case 'tincan':
        ctx.fillStyle = '#adb5bd';
        ctx.fillRect(-14, -10, 28, 20);
        ctx.strokeRect(-14, -10, 28, 20);
        break;
      case 'wool_bolt':
        ctx.fillStyle = '#00bbf9';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      case 'spit':
        // Cosmic enlightened spit projectile
        ctx.fillStyle = '#06d6a0';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(4, -3, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'quack_ring':
      default:
        ctx.strokeStyle = '#48cae4';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
    ctx.restore();
  }

  renderHazard(ctx, hz, time) {
    ctx.save();
    ctx.translate(hz.x, hz.y);

    if (hz.type === 'corn') {
      ctx.rotate(time * 8);
      // Golden Ear of Corn with Green Husk
      ctx.fillStyle = '#ffbe0b';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#52b788';
      ctx.beginPath();
      ctx.arc(-14, 0, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (hz.type === 'shopping_cart') {
      // Runaway Steel Shopping Cart!
      const dir = hz.vx >= 0 ? 1 : -1;
      ctx.scale(dir, 1);
      ctx.strokeStyle = '#e9ecef';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(-32, -52, 64, 36);
      // Grid lines
      ctx.beginPath();
      ctx.moveTo(-12, -52);
      ctx.lineTo(-12, -16);
      ctx.moveTo(12, -52);
      ctx.lineTo(12, -16);
      ctx.moveTo(-32, -34);
      ctx.lineTo(32, -34);
      ctx.stroke();
      // Handlebar
      ctx.strokeStyle = '#e63946';
      ctx.beginPath();
      ctx.moveTo(-32, -52);
      ctx.lineTo(-42, -62);
      ctx.stroke();
      // Wheels
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-22, -8, 8, 0, Math.PI * 2);
      ctx.arc(22, -8, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (hz.type === 'pony_stampede') {
      // Stampeding miniature pony!
      const dir = hz.vx >= 0 ? 1 : -1;
      ctx.scale(dir, 1);
      const legRun = Math.sin(time * 26 + (hz.x || 0) * 0.08) * 11;
      // Pony legs
      ctx.fillStyle = '#6c584c';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2.5;
      ctx.fillRect(-14 - legRun * 0.5, -16, 6, 16);
      ctx.fillRect(8 + legRun * 0.5, -16, 6, 16);
      // Tiny pony body
      ctx.fillStyle = '#b07246';
      ctx.beginPath();
      ctx.roundRect(-22, -32, 38, 20, 6);
      ctx.fill();
      ctx.stroke();
      // Tiny golden mane & tail
      ctx.fillStyle = '#f4a261';
      ctx.fillRect(-26, -30, 8, 10);
      ctx.fillRect(8, -38, 8, 10);
      // Tiny head with bonnet
      ctx.fillStyle = '#b07246';
      ctx.beginPath();
      ctx.arc(16, -34, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f72585';
      ctx.fillRect(10, -46, 13, 5);
      // Eye
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(19, -34, 2, 0, Math.PI * 2);
      ctx.fill();
      // Speed dust puffs
      ctx.fillStyle = 'rgba(230, 230, 230, 0.6)';
      ctx.beginPath();
      ctx.arc(-26, -4, 5, 0, Math.PI * 2);
      ctx.arc(-34, -8, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (hz.type === 'ultimate_rain') {
      ctx.rotate(time * 6);
      ctx.fillStyle = hz.color || '#ffbe0b';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hz.emoji || '💥', 0, 2);
    }

    ctx.restore();
  }

  renderParticle(ctx, pt) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderFloatingText(ctx, ft) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, ft.life / 0.4));
    ctx.font = `900 ${ft.size || 22}px "Segoe UI", Impact, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color || '#ffbe0b';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  renderCenterBanner(ctx, banner, w, h) {
    ctx.save();
    const cy = h * 0.36;

    ctx.fillStyle = 'rgba(11, 15, 25, 0.86)';
    ctx.fillRect(0, cy - 52, w, 104);

    ctx.strokeStyle = banner.color || '#ffbe0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, cy - 52);
    ctx.lineTo(w, cy - 52);
    ctx.moveTo(0, cy + 52);
    ctx.lineTo(w, cy + 52);
    ctx.stroke();

    ctx.font = '900 40px "Segoe UI", Impact, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(banner.title, w / 2, cy - 2);
    ctx.fillStyle = banner.color || '#ffbe0b';
    ctx.fillText(banner.title, w / 2, cy - 2);

    if (banner.subtitle) {
      ctx.font = '800 18px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(banner.subtitle, w / 2, cy + 32);
    }

    ctx.restore();
  }
}
