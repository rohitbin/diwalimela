// High-Performance Particle Physics Engine for Diwali Crackers
// Renders realistic sparks, smoke, explosions, fountains, and glowing illumination

export class Particle {
  constructor(x, y, vx, vy, color, life, size = 2, gravity = 0.05, drag = 0.98, type = 'spark') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.maxLife = life;
    this.life = life;
    this.size = size;
    this.gravity = gravity;
    this.drag = drag;
    this.type = type; // 'spark', 'smoke', 'paper', 'ember', 'flame', 'flash'
    this.twinkle = Math.random() > 0.3;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 0.2;
    this.bounce = type === 'ember' ? 0.4 : 0;
  }

  update(floorY = null) {
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.vRot;
    this.life--;

    // Ground bounce for heavy embers
    if (floorY !== null && this.y >= floorY && this.bounce > 0) {
      this.y = floorY;
      this.vy = -this.vy * this.bounce;
      this.vx *= 0.8;
    }

    return this.life > 0;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;

    if (this.type === 'spark') {
      const flicker = this.twinkle ? (Math.random() > 0.2 ? 1 : 0.4) : 1;
      const sz = Math.max(0.8, this.size * flicker);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, sz, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'smoke') {
      const currentSize = this.size * (1 + (1 - alpha) * 2.2);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'paper') {
      // Red firecracker paper confetti fluttering
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size, -this.size / 2, this.size * 2, this.size);
    } else if (this.type === 'ring') {
      // Shockwave ring
      const radius = (1 - alpha) * this.size;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(1, 3 * alpha);
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.type === 'star') {
      // 4-point diamond twinkling star
      const sz = this.size * (this.twinkle ? (Math.random() > 0.3 ? 1.3 : 0.6) : 1);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - sz);
      ctx.lineTo(this.x + sz * 0.28, this.y - sz * 0.28);
      ctx.lineTo(this.x + sz, this.y);
      ctx.lineTo(this.x + sz * 0.28, this.y + sz * 0.28);
      ctx.lineTo(this.x, this.y + sz);
      ctx.lineTo(this.x - sz * 0.28, this.y + sz * 0.28);
      ctx.lineTo(this.x - sz, this.y);
      ctx.lineTo(this.x - sz * 0.28, this.y - sz * 0.28);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// Active Cracker Entity on the field
export class ActiveCracker {
  constructor(crackerData, x, y, soundEngine, placedBy = 'Player') {
    this.data = crackerData;
    this.x = x;
    this.y = y;
    this.soundEngine = soundEngine;
    this.placedBy = placedBy;
    this.state = 'FUSE'; // 'FUSE', 'BURSTING', 'DONE'
    this.fuseTime = crackerData.fuseTime * 60; // frames at 60fps
    this.fuseMax = this.fuseTime;
    this.burstTime = crackerData.duration * 60;
    this.burstMax = this.burstTime;
    this.particles = [];
    this.rotation = 0;
    this.rocketY = y;
    this.rocketVy = -1;
    this.rocketExploded = false;
    this.ladiIndex = 0;
    this.skyshotIndex = 0;
    this.skyShotsFired = 0;
    this.lanternY = y;
    this.lanternDrift = 0;
    // Extended states for new Diwali crackers
    this.snakeSegments = [];
    this.hoverY = 0;
    this.bulletDetonated = false;
    this.atomDetonated = false;
    this.popPopsFired = 0;
    this.seetiRocketY = y;
    this.seetiRocketVy = -1;
    this.seetiCorkscrew = 0;
    this.seetiExploded = false;
    this.swarnaShotsFired = 0;
    this.colorShiftAngle = 0;
  }

  update(addParticle, triggerScreenShake, triggerSkyFlash) {
    if (this.state === 'FUSE') {
      this.fuseTime--;
      // Fuse spark and smoke
      if (Math.random() > 0.2) {
        addParticle(new Particle(
          this.x + (Math.random() - 0.5) * 4,
          this.y - 12,
          (Math.random() - 0.5) * 1.5,
          -Math.random() * 2,
          '#fbbf24',
          18,
          1.8,
          0.04,
          0.96,
          'spark'
        ));
      }
      if (Math.random() > 0.6) {
        addParticle(new Particle(
          this.x,
          this.y - 14,
          (Math.random() - 0.5) * 0.6,
          -0.8 - Math.random() * 0.5,
          'rgba(180, 180, 180, 0.4)',
          30,
          3,
          -0.01,
          0.98,
          'smoke'
        ));
      }

      if (this.fuseTime <= 0) {
        this.state = 'BURSTING';
        this.startBurst(triggerScreenShake, triggerSkyFlash);
      }
    } else if (this.state === 'BURSTING') {
      this.burstTime--;
      this.tickBurst(addParticle, triggerScreenShake, triggerSkyFlash);

      if (this.burstTime <= 0) {
        this.state = 'DONE';
      }
    }

    return this.state !== 'DONE';
  }

  startBurst(triggerScreenShake, triggerSkyFlash) {
    switch (this.data.id) {
      case 'sutlibomb':
        this.soundEngine?.playSutliBomb();
        if (triggerSkyFlash) triggerSkyFlash('rgba(254, 240, 138, 0.3)', 8);
        if (triggerScreenShake) triggerScreenShake(5);
        break;
      case 'rocket':
        this.soundEngine?.playRocketLaunch();
        break;
      case 'anar':
        this.soundEngine?.playAnarFountain();
        if (triggerSkyFlash) triggerSkyFlash('rgba(251, 146, 60, 0.2)', 6);
        break;
      case 'chakri':
        this.soundEngine?.playChakriWhistle();
        break;
      case 'bulletbomb':
        this.soundEngine?.playBulletBomb();
        if (triggerSkyFlash) triggerSkyFlash('rgba(56, 189, 248, 0.35)', 9);
        if (triggerScreenShake) triggerScreenShake(6);
        break;
      case 'atombomb':
        this.soundEngine?.playAtomBomb();
        if (triggerSkyFlash) triggerSkyFlash('rgba(239, 68, 68, 0.45)', 12);
        if (triggerScreenShake) triggerScreenShake(10);
        break;
      case 'saapgoli':
        this.soundEngine?.playHissingSmoke();
        break;
      case 'mayurpankh':
        this.soundEngine?.playPeacockFountain();
        if (triggerSkyFlash) triggerSkyFlash('rgba(16, 185, 129, 0.25)', 8);
        break;
      case 'tri_chakri':
        this.soundEngine?.playUFOWhir();
        break;
      case 'poppops':
        this.soundEngine?.playPopPopSnaps();
        break;
      case 'seetirocket':
        this.soundEngine?.playWhistlingRocketLaunch();
        break;
      case 'swarnavarsha':
        this.soundEngine?.playGoldenWillow();
        if (triggerSkyFlash) triggerSkyFlash('rgba(251, 191, 36, 0.25)', 8);
        break;
      case 'colorphuljhadi':
        this.soundEngine?.playColorTorch();
        break;
      default:
        break;
    }
  }

  tickBurst(addParticle, triggerScreenShake, triggerSkyFlash) {
    const { id } = this.data;

    // 1. Phuljhadi (Handheld / Ground Sparkler)
    if (id === 'phuljhadi') {
      if (Math.random() > 0.1) this.soundEngine?.playPhuljhadiSparkle();
      const sparkCount = 8;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3.5;
        const color = Math.random() > 0.4 ? '#fde047' : '#fbbf24';
        addParticle(new Particle(
          this.x,
          this.y - 15,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          color,
          15 + Math.floor(Math.random() * 20),
          1.6,
          0.05,
          0.96,
          'spark'
        ));
      }
    }

    // 2. Chakri (Ground Spinner)
    else if (id === 'chakri') {
      this.rotation += 0.45;
      if (this.burstTime % 18 === 0) {
        this.soundEngine?.playChakriWhistle();
      }

      // Dynamic swirling sparks along circle tangent
      const arms = 3;
      for (let a = 0; a < arms; a++) {
        const theta = this.rotation + (a * (Math.PI * 2)) / arms;
        const speed = 4.0 + Math.random() * 3.5;
        const sparkVx = Math.cos(theta + Math.PI / 2) * speed + (Math.random() - 0.5) * 1.5;
        const sparkVy = Math.sin(theta + Math.PI / 2) * speed * 0.4;
        const color = Math.random() > 0.5 ? '#10b981' : (Math.random() > 0.5 ? '#fbbf24' : '#f97316');

        addParticle(new Particle(
          this.x + Math.cos(theta) * 12,
          this.y + Math.sin(theta) * 5,
          sparkVx,
          sparkVy,
          color,
          24,
          2.0,
          0.02,
          0.95,
          'spark'
        ));
      }
    }

    // 3. Anar (Flowerpot Fountain)
    else if (id === 'anar') {
      if (this.burstTime % 22 === 0) {
        this.soundEngine?.playAnarFountain();
      }
      const progress = 1 - (this.burstTime / this.burstMax);
      // Eruption height peaks in the middle
      const heightFactor = Math.sin(progress * Math.PI) * 1.4 + 0.6;
      const count = 10;

      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.75;
        const speed = (5.5 + Math.random() * 7.5) * heightFactor;
        const colors = ['#f59e0b', '#fbbf24', '#f43f5e', '#ffffff', '#38bdf8'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        addParticle(new Particle(
          this.x + (Math.random() - 0.5) * 8,
          this.y - 10,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          color,
          30 + Math.floor(Math.random() * 25),
          2.2,
          0.18, // gravity pulls sparks down into majestic weeping willow
          0.97,
          'ember'
        ));
      }

      // Golden smoke at base
      if (Math.random() > 0.7) {
        addParticle(new Particle(
          this.x,
          this.y - 20,
          (Math.random() - 0.5) * 1.2,
          -1.2,
          'rgba(245, 158, 11, 0.25)',
          40,
          4,
          -0.02,
          0.97,
          'smoke'
        ));
      }
    }

    // 4. Gaganchumbi Rocket
    else if (id === 'rocket') {
      if (!this.rocketExploded) {
        this.rocketVy -= 0.35;
        this.rocketY += this.rocketVy;

        // Rocket flame trail
        for (let i = 0; i < 3; i++) {
          addParticle(new Particle(
            this.x + (Math.random() - 0.5) * 3,
            this.rocketY + 14,
            (Math.random() - 0.5) * 1.0,
            -this.rocketVy * 0.3 + Math.random() * 2,
            Math.random() > 0.3 ? '#f97316' : '#fde047',
            16,
            2.2,
            0.05,
            0.96,
            'spark'
          ));
        }

        // Apex explosion
        if (this.rocketVy <= -11 || this.burstTime < this.burstMax - 70) {
          this.rocketExploded = true;
          this.soundEngine?.playFireworkBang(1.1, 1.2);
          if (triggerSkyFlash) triggerSkyFlash('rgba(251, 191, 36, 0.25)', 8);

          // Radial Peony Flowerburst (120 particles)
          const burstColors = ['#a855f7', '#38bdf8', '#ec4899', '#fde047', '#22c55e', '#ffffff'];
          for (let p = 0; p < 130; p++) {
            const theta = Math.random() * Math.PI * 2;
            const velocity = 2.0 + Math.random() * 8.5;
            const chosenColor = burstColors[Math.floor(Math.random() * burstColors.length)];
            addParticle(new Particle(
              this.x,
              this.rocketY,
              Math.cos(theta) * velocity,
              Math.sin(theta) * velocity,
              chosenColor,
              45 + Math.floor(Math.random() * 35),
              2.4,
              0.08,
              0.96,
              'spark'
            ));
          }
        }
      }
    }

    // 5. 1000-Wala Ladi Garland
    else if (id === 'ladi') {
      // Rapid pops every 5-8 frames
      if (this.burstTime % 6 === 0) {
        this.soundEngine?.playLadiPop();

        const offsetX = (Math.random() - 0.5) * 32;
        const offsetY = (Math.random() - 0.5) * 12;

        // Flash & sparks
        for (let s = 0; s < 8; s++) {
          const theta = Math.random() * Math.PI * 2;
          const spd = 2 + Math.random() * 4;
          addParticle(new Particle(
            this.x + offsetX,
            this.y + offsetY,
            Math.cos(theta) * spd,
            Math.sin(theta) * spd - 1,
            '#fbbf24',
            14,
            2.0,
            0.08,
            0.94,
            'spark'
          ));
        }

        // Red paper scraps fluttering
        for (let r = 0; r < 5; r++) {
          addParticle(new Particle(
            this.x + offsetX,
            this.y + offsetY,
            (Math.random() - 0.5) * 3,
            -Math.random() * 3.5,
            '#dc2626',
            55,
            2.5,
            0.06,
            0.96,
            'paper'
          ));
        }

        // Smoke puff
        addParticle(new Particle(
          this.x + offsetX,
          this.y + offsetY,
          (Math.random() - 0.5) * 0.8,
          -0.8,
          'rgba(220, 220, 220, 0.35)',
          35,
          4,
          -0.01,
          0.97,
          'smoke'
        ));
      }
    }

    // 6. Classic Sutli Bomb
    else if (id === 'sutlibomb') {
      // Explodes in single massive shockwave at the very start of BURSTING
      if (this.burstTime === this.burstMax - 1) {
        // Massive flash ring
        addParticle(new Particle(this.x, this.y, 0, 0, 'rgba(255, 255, 255, 0.95)', 25, 90, 0, 1, 'ring'));
        addParticle(new Particle(this.x, this.y, 0, 0, 'rgba(251, 191, 36, 0.7)', 35, 130, 0, 1, 'ring'));

        // Dust and debris explosion
        for (let i = 0; i < 90; i++) {
          const theta = Math.random() * Math.PI * 2;
          const speed = 3.5 + Math.random() * 9.5;
          const col = Math.random() > 0.4 ? '#84cc16' : (Math.random() > 0.4 ? '#fef08a' : '#d97706');
          addParticle(new Particle(
            this.x,
            this.y,
            Math.cos(theta) * speed,
            Math.sin(theta) * speed - 1.5,
            col,
            35 + Math.floor(Math.random() * 30),
            2.5,
            0.12,
            0.95,
            'ember'
          ));
        }

        // Heavy smoke cloud
        for (let s = 0; s < 18; s++) {
          const theta = Math.random() * Math.PI * 2;
          const spd = 1.0 + Math.random() * 3;
          addParticle(new Particle(
            this.x,
            this.y,
            Math.cos(theta) * spd,
            Math.sin(theta) * spd - 1,
            'rgba(160, 160, 160, 0.5)',
            60,
            7 + Math.random() * 5,
            -0.01,
            0.97,
            'smoke'
          ));
        }
      }
    }

    // 7. Aakash Ganga 7-Shot
    else if (id === 'skyshot') {
      // 7 staggered shell launches
      if (this.burstTime % 50 === 0 && this.skyShotsFired < 7) {
        this.skyShotsFired++;
        this.soundEngine?.playRocketLaunch();

        const shellColors = ['#f43f5e', '#38bdf8', '#fbbf24', '#22c55e', '#a855f7', '#ec4899', '#ffffff'];
        const shellColor = shellColors[this.skyShotsFired - 1];
        const launchX = this.x + (Math.random() - 0.5) * 40;
        const burstY = this.y - 180 - Math.random() * 60;

        setTimeout(() => {
          this.soundEngine?.playFireworkBang(0.9 + Math.random() * 0.4, 1.1);

          for (let p = 0; p < 75; p++) {
            const theta = Math.random() * Math.PI * 2;
            const vel = 2.5 + Math.random() * 6.5;
            addParticle(new Particle(
              launchX,
              burstY,
              Math.cos(theta) * vel,
              Math.sin(theta) * vel,
              shellColor,
              35 + Math.floor(Math.random() * 30),
              2.2,
              0.06,
              0.96,
              'spark'
            ));
          }
        }, 450);
      }
    }

    // 8. Sky Lantern (Aakash Diya)
    else if (id === 'skylantern') {
      this.lanternY -= 0.8;
      this.lanternDrift += 0.04;
      this.x += Math.sin(this.lanternDrift) * 0.35;

      // Soft amber glow trail
      if (Math.random() > 0.4) {
        addParticle(new Particle(
          this.x + (Math.random() - 0.5) * 6,
          this.lanternY + 12,
          (Math.random() - 0.5) * 0.3,
          0.4,
          '#f59e0b',
          25,
          1.8,
          0.01,
          0.98,
          'spark'
        ));
      }
    }

    // 9. Kala Naag Snake Cracker (Saap Ki Goli)
    else if (id === 'saapgoli') {
      if (this.burstTime % 24 === 0) {
        this.soundEngine?.playHissingSmoke();
      }
      const maxSegments = 32;
      const progress = 1 - (this.burstTime / this.burstMax);
      const targetSegments = Math.min(maxSegments, Math.floor(progress * maxSegments * 1.15));

      while (this.snakeSegments.length < targetSegments) {
        const segIdx = this.snakeSegments.length;
        const prevSeg = segIdx > 0 ? this.snakeSegments[segIdx - 1] : { x: this.x, y: this.y, angle: -Math.PI / 2 };
        const swayAngle = Math.sin(segIdx * 0.5) * 0.45 + (Math.random() - 0.5) * 0.2;
        const segLen = 3.2 + Math.random() * 1.4;
        const newAngle = -Math.PI / 2 + swayAngle;
        const nextX = prevSeg.x + Math.cos(newAngle) * segLen;
        const nextY = prevSeg.y + Math.sin(newAngle) * segLen;
        const segSize = Math.max(2.4, 6.5 - segIdx * 0.12);
        this.snakeSegments.push({ x: nextX, y: nextY, size: segSize, angle: newAngle });
      }

      const tip = this.snakeSegments.length > 0 ? this.snakeSegments[this.snakeSegments.length - 1] : { x: this.x, y: this.y - 4 };

      // Sizzling ember sparks at active tip
      if (Math.random() > 0.3) {
        addParticle(new Particle(
          tip.x + (Math.random() - 0.5) * 3,
          tip.y,
          (Math.random() - 0.5) * 1.2,
          -0.6 - Math.random() * 1.2,
          Math.random() > 0.4 ? '#ea580c' : '#fbbf24',
          18,
          1.5,
          0.04,
          0.96,
          'spark'
        ));
      }

      // Billowing dense gray aromatic smoke
      if (Math.random() > 0.35) {
        addParticle(new Particle(
          tip.x,
          tip.y - 2,
          (Math.random() - 0.5) * 0.8,
          -1.0 - Math.random() * 0.6,
          'rgba(90, 85, 95, 0.45)',
          45,
          4.5,
          -0.02,
          0.98,
          'smoke'
        ));
      }
    }

    // 10. Mayur Pankh Peacock Royal Fountain
    else if (id === 'mayurpankh') {
      if (this.burstTime % 24 === 0) {
        this.soundEngine?.playPeacockFountain();
      }
      const progress = 1 - (this.burstTime / this.burstMax);
      const heightFactor = Math.sin(progress * Math.PI) * 1.5 + 0.6;
      const count = 12;

      let colors;
      if (progress < 0.35) {
        colors = ['#10b981', '#34d399', '#059669', '#fde047'];
      } else if (progress < 0.7) {
        colors = ['#06b6d4', '#0284c7', '#38bdf8', '#818cf8', '#ffffff'];
      } else {
        colors = ['#fbbf24', '#f59e0b', '#c084fc', '#38bdf8', '#ffffff'];
      }

      for (let i = 0; i < count; i++) {
        // Wide 140° peacock plumage fan
        const fanSpread = (Math.random() - 0.5) * (Math.PI * 0.75);
        const angle = -Math.PI / 2 + fanSpread;
        const speed = (6.0 + Math.random() * 8.0) * heightFactor;
        const color = colors[Math.floor(Math.random() * colors.length)];

        addParticle(new Particle(
          this.x + (Math.random() - 0.5) * 6,
          this.y - 12,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          color,
          32 + Math.floor(Math.random() * 26),
          2.2,
          0.16,
          0.97,
          Math.random() > 0.4 ? 'star' : 'ember'
        ));
      }

      if (Math.random() > 0.6) {
        addParticle(new Particle(
          this.x,
          this.y - 16,
          (Math.random() - 0.5) * 1.5,
          -1.0,
          'rgba(6, 182, 212, 0.25)',
          38,
          4.5,
          -0.02,
          0.97,
          'smoke'
        ));
      }
    }

    // 11. Triranga UFO Chakri (Levitating Spinner)
    else if (id === 'tri_chakri') {
      this.rotation += 0.55;
      this.hoverY = Math.sin(this.burstTime * 0.12) * 3 - 10;
      if (this.burstTime % 18 === 0) {
        this.soundEngine?.playUFOWhir();
      }

      const arms = [
        { color: '#f97316', secondary: '#fdba74' }, // Saffron
        { color: '#ffffff', secondary: '#bae6fd' }, // Diamond White
        { color: '#10b981', secondary: '#86efac' }  // Emerald Green
      ];

      for (let a = 0; a < 3; a++) {
        const theta = this.rotation + (a * (Math.PI * 2)) / 3;
        const arm = arms[a];
        const speed = 4.8 + Math.random() * 4.0;
        const sparkVx = Math.cos(theta + Math.PI / 2) * speed + (Math.random() - 0.5) * 1.5;
        const sparkVy = Math.sin(theta + Math.PI / 2) * speed * 0.45;
        const chosenColor = Math.random() > 0.3 ? arm.color : arm.secondary;

        addParticle(new Particle(
          this.x + Math.cos(theta) * 14,
          this.y + this.hoverY + Math.sin(theta) * 6,
          sparkVx,
          sparkVy,
          chosenColor,
          26,
          2.2,
          0.02,
          0.95,
          'spark'
        ));
      }
    }

    // 12. Dhamaka Bullet Bomb
    else if (id === 'bulletbomb') {
      if (this.burstTime === this.burstMax - 1) {
        this.bulletDetonated = true;
        addParticle(new Particle(this.x, this.y, 0, 0, 'rgba(56, 189, 248, 0.95)', 25, 100, 0, 1, 'ring'));
        addParticle(new Particle(this.x, this.y, 0, 0, 'rgba(251, 191, 36, 0.75)', 35, 140, 0, 1, 'ring'));

        for (let i = 0; i < 75; i++) {
          const theta = Math.random() * Math.PI * 2;
          const speed = 4.0 + Math.random() * 11.0;
          const col = Math.random() > 0.5 ? '#38bdf8' : (Math.random() > 0.3 ? '#fef08a' : '#84cc16');
          addParticle(new Particle(
            this.x,
            this.y,
            Math.cos(theta) * speed,
            Math.sin(theta) * speed - 1.2,
            col,
            30 + Math.floor(Math.random() * 25),
            2.4,
            0.12,
            0.95,
            'ember'
          ));
        }

        for (let s = 0; s < 14; s++) {
          const theta = Math.random() * Math.PI * 2;
          const spd = 1.0 + Math.random() * 2.8;
          addParticle(new Particle(
            this.x,
            this.y,
            Math.cos(theta) * spd,
            Math.sin(theta) * spd - 0.8,
            'rgba(140, 150, 160, 0.5)',
            50,
            6 + Math.random() * 4,
            -0.01,
            0.97,
            'smoke'
          ));
        }
      }
    }

    // 13. Mahabali Atom Bomb
    else if (id === 'atombomb') {
      if (this.burstTime === this.burstMax - 1) {
        this.atomDetonated = true;
        addParticle(new Particle(this.x, this.y, 0, 0, 'rgba(255, 255, 255, 0.95)', 22, 110, 0, 1, 'ring'));
        addParticle(new Particle(this.x, this.y, 0, 0, 'rgba(239, 68, 68, 0.85)', 32, 160, 0, 1, 'ring'));
        addParticle(new Particle(this.x, this.y, 0, 0, 'rgba(250, 204, 21, 0.7)', 42, 200, 0, 1, 'ring'));

        for (let i = 0; i < 130; i++) {
          const theta = Math.random() * Math.PI * 2;
          const speed = 4.5 + Math.random() * 12.0;
          const col = Math.random() > 0.4 ? '#dc2626' : (Math.random() > 0.4 ? '#facc15' : '#f97316');
          addParticle(new Particle(
            this.x,
            this.y,
            Math.cos(theta) * speed,
            Math.sin(theta) * speed - 2.0,
            col,
            40 + Math.floor(Math.random() * 35),
            2.8,
            0.14,
            0.95,
            'ember'
          ));
        }

        for (let r = 0; r < 45; r++) {
          const theta = Math.random() * Math.PI * 2;
          const spd = 2.0 + Math.random() * 5.0;
          const paperCol = Math.random() > 0.5 ? '#dc2626' : '#facc15';
          addParticle(new Particle(
            this.x,
            this.y,
            Math.cos(theta) * spd,
            -Math.random() * 6.5,
            paperCol,
            75 + Math.floor(Math.random() * 30),
            3.2,
            0.05,
            0.97,
            'paper'
          ));
        }

        for (let s = 0; s < 25; s++) {
          const theta = Math.random() * Math.PI * 2;
          const spd = 1.2 + Math.random() * 3.5;
          addParticle(new Particle(
            this.x,
            this.y,
            Math.cos(theta) * spd,
            Math.sin(theta) * spd - 1.5,
            'rgba(90, 80, 90, 0.6)',
            70,
            8 + Math.random() * 6,
            -0.015,
            0.97,
            'smoke'
          ));
        }
      }
    }

    // 14. Mirchi Pop-Pop Snappers
    else if (id === 'poppops') {
      if (this.burstTime % 9 === 0) {
        this.soundEngine?.playPopPopSnaps();
        const offsetX = (Math.random() - 0.5) * 36;
        const offsetY = (Math.random() - 0.5) * 22;

        for (let s = 0; s < 10; s++) {
          const theta = Math.random() * Math.PI * 2;
          const spd = 1.8 + Math.random() * 3.8;
          const col = ['#ffffff', '#fde047', '#f43f5e', '#38bdf8'][Math.floor(Math.random() * 4)];
          addParticle(new Particle(
            this.x + offsetX,
            this.y + offsetY,
            Math.cos(theta) * spd,
            Math.sin(theta) * spd - 0.8,
            col,
            16,
            1.8,
            0.08,
            0.95,
            'spark'
          ));
        }

        addParticle(new Particle(
          this.x + offsetX,
          this.y + offsetY,
          (Math.random() - 0.5) * 0.6,
          -0.6,
          'rgba(230, 230, 230, 0.4)',
          28,
          3.2,
          -0.01,
          0.97,
          'smoke'
        ));
      }
    }

    // 15. Seeti Whistling Rocket
    else if (id === 'seetirocket') {
      if (!this.seetiExploded) {
        this.seetiRocketVy -= 0.38;
        this.seetiRocketY += this.seetiRocketVy;
        this.seetiCorkscrew += 0.35;
        const corkX = this.x + Math.sin(this.seetiCorkscrew) * 12;

        for (let i = 0; i < 3; i++) {
          addParticle(new Particle(
            corkX + (Math.random() - 0.5) * 2,
            this.seetiRocketY + 12,
            (Math.random() - 0.5) * 0.8,
            -this.seetiRocketVy * 0.25 + Math.random() * 1.5,
            Math.random() > 0.4 ? '#ec4899' : '#fde047',
            16,
            2.0,
            0.04,
            0.96,
            'spark'
          ));
        }
        addParticle(new Particle(
          corkX,
          this.seetiRocketY + 14,
          (Math.random() - 0.5) * 0.5,
          0.5,
          'rgba(240, 240, 240, 0.35)',
          24,
          3.0,
          -0.01,
          0.97,
          'smoke'
        ));

        if (this.seetiRocketVy <= -11.5 || this.burstTime < this.burstMax - 75) {
          this.seetiExploded = true;
          this.soundEngine?.playFireworkBang(1.3, 1.2);
          if (triggerSkyFlash) triggerSkyFlash('rgba(236, 72, 153, 0.3)', 8);

          const starColors = ['#fde047', '#ec4899', '#38bdf8', '#ffffff'];
          for (let p = 0; p < 120; p++) {
            const theta = Math.random() * Math.PI * 2;
            const velocity = 2.2 + Math.random() * 8.5;
            const chosenCol = starColors[Math.floor(Math.random() * starColors.length)];
            addParticle(new Particle(
              corkX,
              this.seetiRocketY,
              Math.cos(theta) * velocity,
              Math.sin(theta) * velocity,
              chosenCol,
              45 + Math.floor(Math.random() * 30),
              2.4,
              0.07,
              0.96,
              'star'
            ));
          }
        }
      }
    }

    // 16. Swarna Varsha (12-Shot Golden Willow Cake)
    else if (id === 'swarnavarsha') {
      if (this.burstTime % 44 === 0 && this.swarnaShotsFired < 12) {
        this.swarnaShotsFired++;
        this.soundEngine?.playRocketLaunch();

        const shotIndex = this.swarnaShotsFired;
        const fanAngle = ((shotIndex - 6.5) / 6) * 0.35;
        const launchX = this.x + Math.sin(fanAngle) * 90 + (Math.random() - 0.5) * 20;
        const burstY = this.y - 190 - Math.random() * 70;

        setTimeout(() => {
          this.soundEngine?.playGoldenWillow();
          if (triggerSkyFlash) triggerSkyFlash('rgba(251, 191, 36, 0.28)', 6);

          const goldPalette = ['#fffbeb', '#fef08a', '#fbbf24', '#f59e0b', '#d97706'];
          for (let p = 0; p < 50; p++) {
            const theta = Math.random() * Math.PI * 2;
            const vel = 1.8 + Math.random() * 6.5;
            const col = goldPalette[Math.floor(Math.random() * goldPalette.length)];
            addParticle(new Particle(
              launchX,
              burstY,
              Math.cos(theta) * vel,
              Math.sin(theta) * vel * 0.7 - 1.0,
              col,
              65 + Math.floor(Math.random() * 40),
              2.6,
              0.13,
              0.975,
              'ember'
            ));
          }
        }, 420);
      }
    }

    // 17. Rainbow Mashaal (Magic Sparkler Torch)
    else if (id === 'colorphuljhadi') {
      if (Math.random() > 0.1) this.soundEngine?.playColorTorch();
      this.colorShiftAngle += 0.08;
      const hue = Math.floor((Math.sin(this.colorShiftAngle) * 0.5 + 0.5) * 360);
      const mainCol = `hsl(${hue}, 95%, 62%)`;
      const lightCol = `hsl(${hue}, 95%, 85%)`;

      const sparkCount = 9;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.8 + Math.random() * 4.0;
        const col = Math.random() > 0.3 ? mainCol : lightCol;
        addParticle(new Particle(
          this.x,
          this.y - 16,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed - 0.5,
          col,
          18 + Math.floor(Math.random() * 22),
          2.0,
          0.04,
          0.96,
          Math.random() > 0.4 ? 'star' : 'spark'
        ));
      }
    }
  }

  draw(ctx) {
    ctx.save();

    // Draw base item on ground if not flying high
    if (this.data.id === 'skylantern') {
      // Floating lantern
      ctx.translate(this.x, this.lanternY);
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#f59e0b';

      // Lantern paper body
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.roundRect(-10, -16, 20, 24, [6, 6, 3, 3]);
      ctx.fill();

      // Inner flame
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return;
    }

    if (this.data.id === 'rocket' && !this.rocketExploded && this.state === 'BURSTING') {
      // Rocket in flight
      ctx.translate(this.x, this.rocketY);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(4, 8);
      ctx.lineTo(-4, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    if (this.data.id === 'seetirocket' && !this.seetiExploded && this.state === 'BURSTING') {
      const corkX = this.x + Math.sin(this.seetiCorkscrew || 0) * 12;
      ctx.translate(corkX, this.seetiRocketY);
      ctx.rotate(Math.sin(this.seetiCorkscrew || 0) * 0.3);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-3, -10, 6, 18);
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(4, -10);
      ctx.lineTo(-4, -10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-5, 4, 2, 4);
      ctx.fillRect(3, 4, 2, 4);
      ctx.restore();
      return;
    }

    // Static ground item representation
    ctx.translate(this.x, this.y);

    if (this.data.id === 'chakri' && this.state === 'BURSTING') {
      ctx.rotate(this.rotation);
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#10b981';
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      // Spiral design
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI);
      ctx.stroke();
    } else if (this.data.id === 'anar') {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(9, 6);
      ctx.lineTo(-9, 6);
      ctx.closePath();
      ctx.fill();
    } else if (this.data.id === 'sutlibomb') {
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.roundRect(-8, -8, 16, 16, 3);
      ctx.fill();
      // Jute string cross
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-8, -8, 16, 16);
    } else if (this.data.id === 'ladi') {
      ctx.fillStyle = '#dc2626';
      for (let i = -16; i <= 16; i += 6) {
        ctx.fillRect(i, -3, 4, 6);
      }
    } else if (this.data.id === 'saapgoli') {
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      if (this.snakeSegments && this.snakeSegments.length > 0) {
        for (let s = 0; s < this.snakeSegments.length; s++) {
          const seg = this.snakeSegments[s];
          const isTip = s === this.snakeSegments.length - 1;
          const relX = seg.x - this.x;
          const relY = seg.y - this.y;

          ctx.fillStyle = isTip ? '#ea580c' : (s % 2 === 0 ? '#374151' : '#1f2937');
          ctx.beginPath();
          ctx.arc(relX, relY, seg.size, 0, Math.PI * 2);
          ctx.fill();

          if (isTip) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(relX, relY - 1, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    } else if (this.data.id === 'mayurpankh') {
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(10, 7);
      ctx.lineTo(-10, 7);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-9, 7, 18, 3);

      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.ellipse(0, -2, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -2, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.data.id === 'tri_chakri') {
      if (this.state === 'BURSTING') {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.translate(0, this.hoverY || -8);
        ctx.rotate(this.rotation);
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#f97316';

        const bladeColors = ['#f97316', '#ffffff', '#10b981'];
        for (let b = 0; b < 3; b++) {
          const bAngle = (b * Math.PI * 2) / 3;
          ctx.fillStyle = bladeColors[b];
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(bAngle - 0.25) * 12, Math.sin(bAngle - 0.25) * 12);
          ctx.lineTo(Math.cos(bAngle) * 15, Math.sin(bAngle) * 15);
          ctx.lineTo(Math.cos(bAngle + 0.25) * 8, Math.sin(bAngle + 0.25) * 8);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    } else if (this.data.id === 'bulletbomb') {
      ctx.fillStyle = '#3f6212';
      ctx.beginPath();
      ctx.roundRect(-6, -10, 12, 16, 2);
      ctx.fill();
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-6, -2, 12, 4);
      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(6, -10);
      ctx.lineTo(-6, -10);
      ctx.closePath();
      ctx.fill();
    } else if (this.data.id === 'atombomb') {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(-10, -10, 20, 20, 3);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-10, -10, 20, 20);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', 0, 3);
    } else if (this.data.id === 'poppops') {
      const pCols = ['#ef4444', '#fbbf24', '#38bdf8'];
      [-6, 0, 6].forEach((ox, idx) => {
        ctx.fillStyle = pCols[idx];
        ctx.beginPath();
        ctx.moveTo(ox, 2);
        ctx.lineTo(ox - 3, -4);
        ctx.lineTo(ox + 3, -4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ox, -4);
        ctx.lineTo(ox + (idx - 1) * 2, -9);
        ctx.stroke();
      });
    } else if (this.data.id === 'seetirocket') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-4, -2, 8, 12);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -22);
      ctx.stroke();
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(-3, -22, 6, 10);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(0, -27);
      ctx.lineTo(3, -22);
      ctx.lineTo(-3, -22);
      ctx.closePath();
      ctx.fill();
    } else if (this.data.id === 'swarnavarsha') {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(-16, -10, 32, 20, 3);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-16, -10, 32, 20);
      ctx.fillStyle = '#171123';
      for (let row = -1; row <= 1; row++) {
        for (let col = -1.5; col <= 1.5; col += 1) {
          ctx.beginPath();
          ctx.arc(col * 8, row * 5, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (this.data.id === 'colorphuljhadi') {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(0, -14);
      ctx.stroke();
      const h = Math.floor((Math.sin(this.colorShiftAngle || 0) * 0.5 + 0.5) * 360);
      ctx.fillStyle = `hsl(${h}, 95%, 62%)`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsl(${h}, 95%, 62%)`;
      ctx.beginPath();
      ctx.arc(0, -14, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // Default cracker icon
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.data.icon, 0, 4);
    }

    // Draw fuse if still in FUSE state
    if (this.state === 'FUSE') {
      const fuseAlpha = this.fuseTime / this.fuseMax;
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(3, -12);
      ctx.stroke();

      // Countdown circle
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 16, -Math.PI / 2, -Math.PI / 2 + (1 - fuseAlpha) * Math.PI * 2);
      ctx.stroke();
    }

    // Festive name badge showing who ignited the cracker (only during FUSE countdown; removed while in use / bursting)
    if (this.placedBy && this.state === 'FUSE') {
      const fuseSeconds = Math.max(0, this.fuseTime / 60).toFixed(1);
      const icon = this.data.icon || '🎆';
      const label = `${icon} ${this.placedBy}'s ${this.data.name || 'Cracker'} [⏳ ${fuseSeconds}s]`;

      // Vertical beacon light beam shooting upwards so it can be spotted easily
      ctx.save();
      const grad = ctx.createLinearGradient(0, 0, 0, -140);
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -140);
      ctx.stroke();
      ctx.restore();

      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      const textW = ctx.measureText(label).width;
      const bw = textW + 16;
      const bh = 22;
      const by = -42;

      ctx.fillStyle = 'rgba(15, 10, 26, 0.92)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(-bw / 2, by, bw, bh, 6);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#fef08a';
      ctx.fillText(label, 0, by + 15);
    }

    ctx.restore();
  }
}
