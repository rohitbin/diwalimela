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
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.8, this.size * flicker), 0, Math.PI * 2);
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
  }

  update(addParticle, triggerScreenShake) {
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
        this.startBurst(triggerScreenShake);
      }
    } else if (this.state === 'BURSTING') {
      this.burstTime--;
      this.tickBurst(addParticle, triggerScreenShake);

      if (this.burstTime <= 0) {
        this.state = 'DONE';
      }
    }

    return this.state !== 'DONE';
  }

  startBurst(triggerScreenShake) {
    switch (this.data.id) {
      case 'sutlibomb':
        this.soundEngine?.playSutliBomb();
        if (triggerScreenShake) triggerScreenShake(12, 28);
        break;
      case 'rocket':
        this.soundEngine?.playRocketLaunch();
        break;
      case 'anar':
        this.soundEngine?.playAnarFountain();
        break;
      case 'chakri':
        this.soundEngine?.playChakriWhistle();
        break;
      default:
        break;
    }
  }

  tickBurst(addParticle, triggerScreenShake) {
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
          if (triggerScreenShake) triggerScreenShake(6, 16);

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
        if (triggerScreenShake) triggerScreenShake(2, 4);

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
          if (triggerScreenShake) triggerScreenShake(5, 14);

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

    ctx.restore();
  }
}
