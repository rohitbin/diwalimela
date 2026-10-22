// Interactive Diwali Celebration Mela Canvas Game Engine
// Dynamic lighting, 60fps particle physics, Giant Ferris Wheel, Balloon Shooting, Dhol troupe, real people simulation

import React, { useEffect, useRef, useState } from 'react';
import { ActiveCracker, Particle } from './physics/particles';
import { soundEngine } from '../audio/soundEngine';

export const MELA_ZONES = {
  ENTRANCE: { x: 1000, y: 150, name: 'Grand Entrance Gate (प्रवेश द्वार)' },
  CENTRAL_CHAWK: { x: 1000, y: 650, name: 'Deepotsav Plaza (महा दीया चौक)' },
  CRACKER_SHOP: { x: 1450, y: 450, name: 'Shri Ganesh Patakha Bhandar (पटाखा दुकान)' },
  DHAMAKA_GROUND: { x: 1450, y: 980, name: 'Dhamaka Ground (पटाखा उत्सव मैदान)' },
  SWEETS_STALL: { x: 550, y: 420, name: 'Radhey Sweets Corner (मिठाई दुकान)' },
  TEMPLE: { x: 550, y: 950, name: 'Lakshmi-Ganesh Mandir (शुभ मंदिर)' },
  RANGOLI_PAVILION: { x: 1000, y: 1150, name: 'Rangoli Art Pavilion (रंगोली मंडप)' },
  FERRIS_WHEEL: { x: 1650, y: 220, name: 'Mela Giant Wheel (विशाल झूला)' },
  BALLOON_STALL: { x: 1320, y: 220, name: 'Balloon Shooting Stall (गुब्बारा निशानेबाजी)' },
  CHAI_TAPRI: { x: 380, y: 420, name: 'Sharma Ji Chai Tapri (चाय टपरी)' },
  FORTUNE_WHEEL: { x: 780, y: 650, name: 'Diwali Fortune Spin (धन चक्र)' }
};

export default function MelaCanvas({
  player,
  setPlayer,
  inventory,
  setInventory,
  coins,
  setCoins,
  selectedCracker,
  onOpenCrackerShop,
  onOpenSweetsShop,
  onOpenTemple,
  onOpenBalloonGame,
  onOpenFortuneWheel,
  onOpenChaiTapri,
  onTalkToNpc,
  remotePlayers,
  multiplayerManager,
  screenShake,
  setScreenShake,
  activeBuffs,
  onDiyaLit,
  onCrackerBurst,
  isDancing,
  setIsDancing
}) {
  const canvasRef = useRef(null);
  const [isRidingWheel, setIsRidingWheel] = useState(false);

  // Game World State
  const worldRef = useRef({
    width: 2000,
    height: 1400,
    particles: [],
    activeCrackers: [],
    mouse: { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false },
    keys: {},
    camera: { x: 1000, y: 650 },
    cameraZoom: 1.0,
    wheelAngle: 0,
    // Earthen Diyas across the mela
    diyas: [
      { id: 1, x: 880, y: 220, isLit: true },
      { id: 2, x: 1120, y: 220, isLit: true },
      { id: 3, x: 920, y: 550, isLit: false },
      { id: 4, x: 1080, y: 550, isLit: true },
      { id: 5, x: 920, y: 750, isLit: false },
      { id: 6, x: 1080, y: 750, isLit: true },
      { id: 7, x: 1350, y: 520, isLit: false },
      { id: 8, x: 1550, y: 520, isLit: true },
      { id: 9, x: 450, y: 500, isLit: true },
      { id: 10, x: 650, y: 500, isLit: false },
      { id: 11, x: 1320, y: 860, isLit: true },
      { id: 12, x: 1580, y: 860, isLit: false },
      { id: 13, x: 450, y: 880, isLit: true },
      { id: 14, x: 650, y: 880, isLit: false },
      { id: 15, x: 960, y: 1100, isLit: false },
      { id: 16, x: 1040, y: 1100, isLit: true }
    ],
    // Hanging fairy lights
    fairyLights: [],
    // Floating sky lanterns
    floatingLanterns: [],
    // NPCs walking in world
    npcs: [
      {
        id: 'npc_sharma',
        name: 'Sharma Ji',
        role: 'Elder Citizen',
        color: '#f59e0b',
        turban: '#dc2626',
        x: 1380,
        y: 880,
        targetX: 1380,
        targetY: 880,
        bubble: 'Shubh Deepawali beta! 🪔',
        bubbleTimer: 180
      },
      {
        id: 'npc_priya',
        name: 'Priya',
        role: 'Photographer',
        color: '#ec4899',
        turban: null,
        x: 1000,
        y: 600,
        targetX: 1000,
        targetY: 600,
        bubble: 'Look at the golden lights! ✨',
        bubbleTimer: 240
      },
      {
        id: 'npc_aarav',
        name: 'Aarav (Kid)',
        role: 'Excited Boy',
        color: '#3b82f6',
        turban: '#fbbf24',
        x: 1450,
        y: 1020,
        targetX: 1450,
        targetY: 1020,
        bubble: 'Burst more rockets! 🚀',
        bubbleTimer: 300
      },
      {
        id: 'npc_dadi',
        name: 'Dadi Amma',
        role: 'Grandmother',
        color: '#e11d48',
        turban: null,
        x: 550,
        y: 890,
        targetX: 550,
        targetY: 890,
        bubble: 'Lakshmi Mata bless you! 🙏',
        bubbleTimer: 220
      },
      {
        id: 'npc_uncle_dave',
        name: 'Uncle Dave',
        role: 'Tourist',
        color: '#10b981',
        turban: null,
        x: 1400,
        y: 350,
        targetX: 1400,
        targetY: 350,
        bubble: 'What amazing fireworks! 🎆',
        bubbleTimer: 200
      },
      {
        id: 'npc_kabir',
        name: 'Kabir',
        role: 'Firework Master',
        color: '#8b5cf6',
        turban: '#f59e0b',
        x: 1520,
        y: 920,
        targetX: 1520,
        targetY: 920,
        bubble: 'The Sutli bomb is epic! 💥',
        bubbleTimer: 150
      },
      {
        id: 'npc_ananya',
        name: 'Ananya',
        role: 'Rangoli Artist',
        color: '#06b6d4',
        turban: null,
        x: 1000,
        y: 1120,
        targetX: 1000,
        targetY: 1120,
        bubble: 'Rangoli colors look vivid! 🎨',
        bubbleTimer: 260
      },
      {
        id: 'npc_dhol',
        name: 'Lakhwinder (Dholak)',
        role: 'Festive Drummer',
        color: '#e11d48',
        turban: '#f59e0b',
        x: 1080,
        y: 650,
        targetX: 1080,
        targetY: 650,
        bubble: 'Balle Balle! Shubh Deepawali! 🥁',
        bubbleTimer: 120
      }
    ],
    nextAmbientFireworkTime: 140,
    lastFrameTime: performance.now()
  });

  const playerRef = useRef(player);
  playerRef.current = player;

  // Touch joystick state for mobile
  const [touchActive, setTouchActive] = useState(false);
  const touchOrigin = useRef({ x: 0, y: 0 });
  const touchCurrent = useRef({ x: 0, y: 0 });

  // Initialize decorative world items
  useEffect(() => {
    const world = worldRef.current;

    // Create strings of fairy lights (ladiyan)
    world.fairyLights = [];
    for (let x = 160; x <= 1840; x += 32) {
      world.fairyLights.push({
        x,
        y: 160 + Math.sin(x * 0.04) * 10,
        color: ['#fbbf24', '#f43f5e', '#38bdf8', '#4ade80', '#fb923c'][Math.floor(Math.random() * 5)],
        flickerOffset: Math.random() * 10
      });
      world.fairyLights.push({
        x,
        y: 720 + Math.sin(x * 0.03) * 12,
        color: ['#f59e0b', '#ec4899', '#a855f7', '#fbbf24'][Math.floor(Math.random() * 4)],
        flickerOffset: Math.random() * 10
      });
    }

    // Sky lanterns floating high
    world.floatingLanterns = [];
    for (let i = 0; i < 28; i++) {
      world.floatingLanterns.push({
        x: Math.random() * world.width,
        y: Math.random() * 320,
        speedY: 0.12 + Math.random() * 0.22,
        drift: Math.random() * Math.PI * 2,
        scale: 0.5 + Math.random() * 0.6
      });
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      worldRef.current.keys[e.key.toLowerCase()] = true;
      worldRef.current.keys[e.code] = true;

      if (e.key.toLowerCase() === 'e' || e.code === 'Space') {
        checkPlayerProximityInteractions();
      }

      // V key triggers festive dance
      if (e.key.toLowerCase() === 'v') {
        triggerFestiveDance();
      }
    };

    const handleKeyUp = (e) => {
      worldRef.current.keys[e.key.toLowerCase()] = false;
      worldRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Dance emote helper
  const triggerFestiveDance = () => {
    if (isDancing) return;
    setIsDancing(true);
    soundEngine.playDholakBeat(true);
    soundEngine.playCrowdCheer();

    // Throw petals & confetti around player
    const p = playerRef.current;
    const colors = ['#f59e0b', '#fbbf24', '#f43f5e', '#ec4899', '#22c55e', '#38bdf8'];
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 5;
      worldRef.current.particles.push(
        new Particle(
          p.x,
          p.y - 12,
          Math.cos(angle) * spd,
          Math.sin(angle) * spd - 2,
          colors[Math.floor(Math.random() * colors.length)],
          40 + Math.floor(Math.random() * 30),
          2.5,
          0.08,
          0.96,
          'paper'
        )
      );
    }

    setTimeout(() => setIsDancing(false), 3500);
  };

  // Check proximity to shops / stalls / games
  const checkPlayerProximityInteractions = () => {
    const p = playerRef.current;
    const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

    // Giant Ferris Wheel
    if (dist(p.x, p.y, MELA_ZONES.FERRIS_WHEEL.x, MELA_ZONES.FERRIS_WHEEL.y) < 140) {
      toggleFerrisWheelRide();
      return;
    }

    // Balloon Shooting Game
    if (dist(p.x, p.y, MELA_ZONES.BALLOON_STALL.x, MELA_ZONES.BALLOON_STALL.y) < 130) {
      onOpenBalloonGame();
      return;
    }

    // Fortune Spin Wheel
    if (dist(p.x, p.y, MELA_ZONES.FORTUNE_WHEEL.x, MELA_ZONES.FORTUNE_WHEEL.y) < 120) {
      onOpenFortuneWheel();
      return;
    }

    // Chai Tapri
    if (dist(p.x, p.y, MELA_ZONES.CHAI_TAPRI.x, MELA_ZONES.CHAI_TAPRI.y) < 130) {
      onOpenChaiTapri();
      return;
    }

    // Cracker Shop
    if (dist(p.x, p.y, MELA_ZONES.CRACKER_SHOP.x, MELA_ZONES.CRACKER_SHOP.y) < 140) {
      onOpenCrackerShop();
      return;
    }
    // Sweets Stall
    if (dist(p.x, p.y, MELA_ZONES.SWEETS_STALL.x, MELA_ZONES.SWEETS_STALL.y) < 140) {
      onOpenSweetsShop();
      return;
    }
    // Temple
    if (dist(p.x, p.y, MELA_ZONES.TEMPLE.x, MELA_ZONES.TEMPLE.y) < 140) {
      onOpenTemple();
      return;
    }

    // Check nearby unlit diyas
    const world = worldRef.current;
    world.diyas.forEach((diya) => {
      if (!diya.isLit && dist(p.x, p.y, diya.x, diya.y) < 70) {
        diya.isLit = true;
        soundEngine.playDiyaLight();
        soundEngine.playCoinSound();
        setCoins((c) => c + 25);
        if (onDiyaLit) onDiyaLit(diya.id);
        if (multiplayerManager) {
          multiplayerManager.broadcastDiyaUpdate({ id: diya.id, isLit: true });
        }
      }
    });

    // Check nearby NPCs
    world.npcs.forEach((npc) => {
      if (dist(p.x, p.y, npc.x, npc.y) < 80) {
        onTalkToNpc(npc);
      }
    });
  };

  const toggleFerrisWheelRide = () => {
    if (isRidingWheel) {
      setIsRidingWheel(false);
      soundEngine.playTempleBell();
    } else {
      setIsRidingWheel(true);
      soundEngine.playTempleBell();
      soundEngine.playCrowdCheer();
    }
  };

  // Click on Canvas to walk or place cracker
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const world = worldRef.current;
    const worldClickX = (clickX - canvas.width / 2) / (world.cameraZoom || 1) + world.camera.x;
    const worldClickY = (clickY - canvas.height / 2) / (world.cameraZoom || 1) + world.camera.y;

    const p = playerRef.current;
    const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

    // Clicked Ferris Wheel
    if (dist(worldClickX, worldClickY, MELA_ZONES.FERRIS_WHEEL.x, MELA_ZONES.FERRIS_WHEEL.y) < 120) {
      toggleFerrisWheelRide();
      return;
    }

    // Clicked Balloon Stall
    if (dist(worldClickX, worldClickY, MELA_ZONES.BALLOON_STALL.x, MELA_ZONES.BALLOON_STALL.y) < 100) {
      onOpenBalloonGame();
      return;
    }

    // Clicked Fortune Spin Wheel
    if (dist(worldClickX, worldClickY, MELA_ZONES.FORTUNE_WHEEL.x, MELA_ZONES.FORTUNE_WHEEL.y) < 90) {
      onOpenFortuneWheel();
      return;
    }

    // Clicked Chai Tapri
    if (dist(worldClickX, worldClickY, MELA_ZONES.CHAI_TAPRI.x, MELA_ZONES.CHAI_TAPRI.y) < 100) {
      onOpenChaiTapri();
      return;
    }

    // If clicked on an NPC, talk
    for (const npc of world.npcs) {
      if (dist(worldClickX, worldClickY, npc.x, npc.y) < 40) {
        onTalkToNpc(npc);
        return;
      }
    }

    // If clicked on Cracker Shop stall
    if (dist(worldClickX, worldClickY, MELA_ZONES.CRACKER_SHOP.x, MELA_ZONES.CRACKER_SHOP.y) < 120) {
      onOpenCrackerShop();
      return;
    }

    // If clicked on Sweets stall
    if (dist(worldClickX, worldClickY, MELA_ZONES.SWEETS_STALL.x, MELA_ZONES.SWEETS_STALL.y) < 120) {
      onOpenSweetsShop();
      return;
    }

    // If clicked on Temple
    if (dist(worldClickX, worldClickY, MELA_ZONES.TEMPLE.x, MELA_ZONES.TEMPLE.y) < 120) {
      onOpenTemple();
      return;
    }

    // If clicked on unlit diya
    for (const diya of world.diyas) {
      if (dist(worldClickX, worldClickY, diya.x, diya.y) < 35) {
        if (!diya.isLit) {
          diya.isLit = true;
          soundEngine.playDiyaLight();
          soundEngine.playCoinSound();
          setCoins((c) => c + 25);
          if (onDiyaLit) onDiyaLit(diya.id);
          if (multiplayerManager) {
            multiplayerManager.broadcastDiyaUpdate({ id: diya.id, isLit: true });
          }
        }
        return;
      }
    }

    // Check if player wants to place/burst selected cracker
    if (selectedCracker) {
      const invItem = inventory.find((i) => i.id === selectedCracker.id);
      if (invItem && invItem.count > 0) {
        placeAndIgniteCracker(selectedCracker, worldClickX, worldClickY);
        return;
      }
    }

    // Otherwise, move player to target location
    if (!isRidingWheel) {
      setPlayer((prev) => ({
        ...prev,
        targetX: worldClickX,
        targetY: worldClickY,
        isMoving: true
      }));
    }
  };

  // Place and ignite cracker
  const placeAndIgniteCracker = (crackerData, targetX, targetY) => {
    const item = inventory.find((i) => i.id === crackerData.id);
    if (!item || item.count <= 0) return;

    setInventory((prev) =>
      prev.map((i) => (i.id === crackerData.id ? { ...i, count: i.count - 1 } : i))
    );

    if (onCrackerBurst) onCrackerBurst(crackerData.id);

    const activeCracker = new ActiveCracker(
      crackerData,
      targetX,
      targetY,
      soundEngine,
      playerRef.current.name
    );

    worldRef.current.activeCrackers.push(activeCracker);

    if (multiplayerManager) {
      multiplayerManager.broadcastCrackerEvent({
        crackerId: crackerData.id,
        x: targetX,
        y: targetY,
        placedBy: playerRef.current.name
      });
    }

    const world = worldRef.current;
    world.npcs.forEach((npc) => {
      const d = Math.hypot(npc.x - targetX, npc.y - targetY);
      if (d < 300) {
        const angle = Math.atan2(npc.y - targetY, npc.x - targetX);
        npc.targetX = npc.x + Math.cos(angle) * 45;
        npc.targetY = npc.y + Math.sin(angle) * 45;

        const cheers = [
          'Woah! Look at that! 💥',
          'Arrey wah! Zabardast!',
          'Step back everyone! ⚠️',
          'Happy Diwali! 🪔',
          'Super Dhamaka! 🎆'
        ];
        npc.bubble = cheers[Math.floor(Math.random() * cheers.length)];
        npc.bubbleTimer = 180;
      }
    });
  };

  // Remote cracker events
  useEffect(() => {
    if (!multiplayerManager) return;

    multiplayerManager.onCrackerEvent = (evt) => {
      const crackerData = window.__CRACKER_MAP?.[evt.crackerId];
      if (crackerData) {
        const activeCracker = new ActiveCracker(
          crackerData,
          evt.x,
          evt.y,
          soundEngine,
          evt.placedBy
        );
        worldRef.current.activeCrackers.push(activeCracker);
      }
    };

    multiplayerManager.onDiyaUpdate = (diyaData) => {
      const diya = worldRef.current.diyas.find((d) => d.id === diyaData.id);
      if (diya) diya.isLit = diyaData.isLit;
    };
  }, [multiplayerManager]);

  // Main Canvas Animation Loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const world = worldRef.current;
      const p = playerRef.current;

      // Update Giant Wheel Rotation
      world.wheelAngle += 0.008;

      // If riding wheel, attach player to wheel gondola & zoom out
      let targetCamX = p.x;
      let targetCamY = p.y;
      let targetZoom = 1.0;

      if (isRidingWheel) {
        const wheelR = 85;
        const cabinX = MELA_ZONES.FERRIS_WHEEL.x + Math.cos(world.wheelAngle) * wheelR;
        const cabinY = MELA_ZONES.FERRIS_WHEEL.y + Math.sin(world.wheelAngle) * wheelR;
        targetCamX = cabinX;
        targetCamY = cabinY;
        targetZoom = 0.75; // Panoramic high sky view!
      }

      world.cameraZoom += (targetZoom - (world.cameraZoom || 1)) * 0.05;

      // Player Movement from Keyboard / Touch
      if (!isRidingWheel) {
        let moveX = 0;
        let moveY = 0;
        let speed = p.speed || 3.8;

        if (activeBuffs?.kaju_katli) speed *= 1.35;
        if (activeBuffs?.kulhad_chai) speed *= 1.2;

        if (world.keys['w'] || world.keys['arrowup']) moveY -= 1;
        if (world.keys['s'] || world.keys['arrowdown']) moveY += 1;
        if (world.keys['a'] || world.keys['arrowleft']) moveX -= 1;
        if (world.keys['d'] || world.keys['arrowright']) moveX += 1;

        if (touchActive) {
          const dx = touchCurrent.current.x - touchOrigin.current.x;
          const dy = touchCurrent.current.y - touchOrigin.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 10) {
            moveX = dx / dist;
            moveY = dy / dist;
          }
        }

        let newX = p.x;
        let newY = p.y;
        let isMoving = false;

        if (moveX !== 0 || moveY !== 0) {
          const len = Math.hypot(moveX, moveY);
          newX += (moveX / len) * speed;
          newY += (moveY / len) * speed;
          isMoving = true;
        } else if (p.targetX !== undefined && p.targetY !== undefined) {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 4) {
            newX += (dx / dist) * speed;
            newY += (dy / dist) * speed;
            isMoving = true;
          } else {
            isMoving = false;
          }
        }

        newX = Math.max(80, Math.min(world.width - 80, newX));
        newY = Math.max(120, Math.min(world.height - 80, newY));

        if (newX !== p.x || newY !== p.y || isMoving !== p.isMoving) {
          const updated = {
            ...p,
            x: newX,
            y: newY,
            isMoving,
            walkFrame: isMoving ? (p.walkFrame || 0) + 0.2 : 0,
            facing: moveX > 0 ? 'right' : moveX < 0 ? 'left' : p.facing || 'right'
          };
          setPlayer(updated);
          if (multiplayerManager && Math.random() > 0.4) {
            multiplayerManager.broadcastPlayerState(updated);
          }
        }
      }

      // Smooth Camera Easing
      world.camera.x += (targetCamX - world.camera.x) * 0.08;
      world.camera.y += (targetCamY - world.camera.y) * 0.08;

      // Screen Shake effect decay
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (screenShake && screenShake.duration > 0) {
        shakeOffsetX = (Math.random() - 0.5) * screenShake.intensity;
        shakeOffsetY = (Math.random() - 0.5) * screenShake.intensity;
        setScreenShake((prev) => (prev ? { ...prev, duration: prev.duration - 1 } : null));
      }

      // Update NPCs AI & Dholak Beats
      world.npcs.forEach((npc) => {
        if (npc.id === 'npc_dhol') {
          // Play periodic joyful dhol beat
          if (Math.random() > 0.985) {
            soundEngine.playDholakBeat(Math.random() > 0.35);
          }
          return;
        }

        const dx = npc.targetX - npc.x;
        const dy = npc.targetY - npc.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 3) {
          npc.x += (dx / dist) * 1.4;
          npc.y += (dy / dist) * 1.4;
        } else if (Math.random() > 0.99) {
          npc.targetX = npc.x + (Math.random() - 0.5) * 140;
          npc.targetY = npc.y + (Math.random() - 0.5) * 100;
          npc.targetX = Math.max(150, Math.min(world.width - 150, npc.targetX));
          npc.targetY = Math.max(200, Math.min(world.height - 150, npc.targetY));
        }

        if (npc.bubbleTimer > 0) {
          npc.bubbleTimer--;
        } else if (Math.random() > 0.998) {
          const chatter = [
            'Shubh Deepawali! 🪔',
            'Giant wheel ride is amazing! 🎡',
            'Try the balloon game! 🎯',
            'Raju Bhaiya has good crackers! 🧨',
            'Have some garam chai! ☕'
          ];
          npc.bubble = chatter[Math.floor(Math.random() * chatter.length)];
          npc.bubbleTimer = 220;
        }
      });

      // Ambient background fireworks in sky
      world.nextAmbientFireworkTime--;
      if (world.nextAmbientFireworkTime <= 0) {
        world.nextAmbientFireworkTime = 130 + Math.floor(Math.random() * 120);
        const fx = 400 + Math.random() * 1200;
        const fy = 80 + Math.random() * 160;
        const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#22c55e', '#a855f7', '#fb923c'];
        const col = colors[Math.floor(Math.random() * colors.length)];
        for (let p = 0; p < 65; p++) {
          const theta = Math.random() * Math.PI * 2;
          const spd = 1.5 + Math.random() * 5.5;
          world.particles.push(
            new Particle(
              fx,
              fy,
              Math.cos(theta) * spd,
              Math.sin(theta) * spd,
              col,
              40 + Math.floor(Math.random() * 30),
              2.0,
              0.05,
              0.96,
              'spark'
            )
          );
        }
      }

      // Update Active Crackers & Particles
      const addParticle = (pt) => world.particles.push(pt);
      const triggerShake = (intensity, duration) => setScreenShake({ intensity, duration });

      world.activeCrackers = world.activeCrackers.filter((c) =>
        c.update(addParticle, triggerShake)
      );

      world.particles = world.particles.filter((pt) => pt.update());

      // Handheld Phuljhadi spark effect
      if (selectedCracker?.id === 'phuljhadi' && !isRidingWheel) {
        const sparkX = p.x + (p.facing === 'left' ? -18 : 18);
        const sparkY = p.y - 14;
        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 1.0 + Math.random() * 3.0;
          world.particles.push(
            new Particle(
              sparkX,
              sparkY,
              Math.cos(angle) * spd,
              Math.sin(angle) * spd,
              Math.random() > 0.4 ? '#fde047' : '#fbbf24',
              14 + Math.floor(Math.random() * 14),
              1.5,
              0.04,
              0.96,
              'spark'
            )
          );
        }
        if (Math.random() > 0.3) {
          soundEngine.playPhuljhadiSparkle();
        }
      }

      // Sky Lanterns
      world.floatingLanterns.forEach((l) => {
        l.y -= l.speedY;
        l.drift += 0.02;
        l.x += Math.sin(l.drift) * 0.3;
        if (l.y < -50) {
          l.y = world.height + 20;
          l.x = Math.random() * world.width;
        }
      });

      // ==========================================
      // RENDER CANVAS SCENE
      // ==========================================
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply Camera Transform & Screen Shake with Zoom
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(world.cameraZoom || 1, world.cameraZoom || 1);
      ctx.translate(-world.camera.x + shakeOffsetX, -world.camera.y + shakeOffsetY);

      // A. Ground & Festive Red Carpet Walkways
      renderGroundAndCourtyards(ctx, world);

      // B. Grand Entrance Arch & Signages
      renderEntranceArch(ctx);

      // C. Giant Ferris Wheel (विशाल झूला)
      renderGiantFerrisWheel(ctx, world.wheelAngle, isRidingWheel, p);

      // D. Carnival Game Stalls: Balloon Shooting, Chai Tapri, Fortune Wheel
      renderCarnivalAttractions(ctx, p);

      // E. Stalls: Cracker Shop, Sweets Corner, Temple
      renderMelaStalls(ctx, world, p);

      // F. Rangoli Art Pavilions & Floral Carpet
      renderRangoliArtwork(ctx);

      // G. Unlit & Lit Clay Diyas
      renderDiyas(ctx, world.diyas);

      // H. Hanging Strings of Fairy Lights (Ladiyan)
      renderFairyLights(ctx, world.fairyLights);

      // I. Active Crackers (placed on ground / in air)
      world.activeCrackers.forEach((c) => c.draw(ctx));

      // J. NPCs (Real Mela Visitors & Dholak Master)
      world.npcs.forEach((npc) => renderCharacter(ctx, npc, false));

      // K. Remote Real Players (WebRTC Multiplayer)
      if (remotePlayers && remotePlayers.size > 0) {
        remotePlayers.forEach((remPlayer) => {
          renderCharacter(ctx, remPlayer, true);
        });
      }

      // L. Local Player Character (if not riding wheel)
      if (!isRidingWheel) {
        renderCharacter(ctx, p, false, true, selectedCracker, activeBuffs, isDancing);
      }

      // M. Foreground Firecracker Particles (Sparks, Smoke, Embers)
      world.particles.forEach((pt) => pt.draw(ctx));

      // N. Night Sky Floating Lanterns (Kandils)
      renderFloatingLanterns(ctx, world.floatingLanterns);

      // O. Festive Atmospheric Dark Vignette & Dynamic Lighting Overlay
      renderNightLightingGlow(ctx, world, p.x, p.y);

      // P. Visual Direction Compass when far from key spots
      renderDirectionGuides(ctx, p);

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    selectedCracker,
    inventory,
    remotePlayers,
    multiplayerManager,
    screenShake,
    activeBuffs,
    isRidingWheel,
    isDancing
  ]);

  // Touch event handlers for mobile virtual joystick
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchOrigin.current = { x: touch.clientX, y: touch.clientY };
    touchCurrent.current = { x: touch.clientX, y: touch.clientY };
    setTouchActive(true);
  };

  const handleTouchMove = (e) => {
    if (!touchActive) return;
    const touch = e.touches[0];
    touchCurrent.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    setTouchActive(false);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        userSelect: 'none',
        background: '#090815'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: selectedCracker ? 'crosshair' : 'pointer'
        }}
      />

      {/* Floating Banner when riding Giant Wheel */}
      {isRidingWheel && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(23, 16, 36, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '2px solid #fbbf24',
            borderRadius: 24,
            padding: '10px 24px',
            color: '#fef08a',
            fontSize: 14,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.4)',
            zIndex: 60,
            animation: 'pulse 2s infinite'
          }}
        >
          <span>🎡 Riding Mela Giant Wheel • Enjoying Panoramic Sky View!</span>
          <button
            onClick={toggleFerrisWheelRide}
            style={{
              backgroundColor: '#ea580c',
              border: 'none',
              borderRadius: 14,
              padding: '6px 16px',
              color: '#fff',
              fontWeight: 800,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Hop Off Wheel ⬇️
          </button>
        </div>
      )}

      {/* On-screen touch joystick indicator */}
      {touchActive && (
        <div
          style={{
            position: 'absolute',
            left: touchOrigin.current.x - 40,
            top: touchOrigin.current.y - 40,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.25)',
            border: '2px solid rgba(251, 191, 36, 0.6)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#fbbf24',
              boxShadow: '0 0 12px #f59e0b',
              transform: `translate(${Math.min(25, Math.max(-25, touchCurrent.current.x - touchOrigin.current.x))}px, ${Math.min(25, Math.max(-25, touchCurrent.current.y - touchOrigin.current.y))}px)`
            }}
          />
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// RENDER SUB-ROUTINES (CANVAS 2D)
// -------------------------------------------------------------

function renderGroundAndCourtyards(ctx, world) {
  ctx.fillStyle = '#0b0918';
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.06)';
  ctx.lineWidth = 1;
  const tileSize = 60;
  for (let x = 0; x < world.width; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.height);
    ctx.stroke();
  }
  for (let y = 0; y < world.height; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }

  // Grand Red Carpet Walkway (North to South)
  ctx.fillStyle = 'rgba(153, 27, 27, 0.45)';
  ctx.fillRect(880, 160, 240, 1100);

  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3;
  ctx.strokeRect(884, 160, 232, 1100);

  // Marigold Garlands along walkway borders
  for (let my = 180; my <= 1240; my += 30) {
    ctx.fillStyle = my % 60 === 0 ? '#f59e0b' : '#ea580c';
    ctx.beginPath();
    ctx.arc(884, my, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(1116, my, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cross Walkway (West to East)
  ctx.fillStyle = 'rgba(120, 53, 15, 0.35)';
  ctx.fillRect(400, 590, 1200, 120);
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2;
  ctx.strokeRect(400, 590, 1200, 120);

  // Lamp Posts
  const lampPosts = [
    { x: 860, y: 350 },
    { x: 1140, y: 350 },
    { x: 860, y: 850 },
    { x: 1140, y: 850 },
    { x: 680, y: 570 },
    { x: 1320, y: 570 }
  ];

  lampPosts.forEach((lp) => {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(lp.x - 3, lp.y - 28, 6, 28);
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#f59e0b';
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lp.x, lp.y - 30, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Dhamaka Ground
  ctx.save();
  ctx.fillStyle = '#17141f';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(1250, 740, 480, 500, 28);
  ctx.fill();
  ctx.stroke();

  ctx.setLineDash([14, 8]);
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 3;
  ctx.strokeRect(1270, 760, 440, 460);
  ctx.setLineDash([]);

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 20px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎆 DHAMAKA CELEBRATION GROUND 🎆', 1490, 796);
  ctx.font = '12px "Outfit", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('Designated Safe Fireworks Ground • Click to place & burst', 1490, 818);

  // Circular Launch Pads
  const pads = [
    { x: 1370, y: 890, label: 'PAD 1' },
    { x: 1610, y: 890, label: 'PAD 2' },
    { x: 1490, y: 1040, label: 'PAD 3' }
  ];

  pads.forEach((pad) => {
    ctx.fillStyle = 'rgba(234, 88, 12, 0.2)';
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pad.x, pad.y, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.fillText(pad.label, pad.x, pad.y + 4);
  });

  ctx.restore();
}

// -------------------------------------------------------------
// GIANT FERRIS WHEEL (विशाल झूला)
// -------------------------------------------------------------
function renderGiantFerrisWheel(ctx, angle, isRiding, player) {
  ctx.save();
  const wx = MELA_ZONES.FERRIS_WHEEL.x;
  const wy = MELA_ZONES.FERRIS_WHEEL.y;
  const r = 90;

  // A-frame Steel Lattice Legs
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(wx, wy);
  ctx.lineTo(wx - 55, wy + 110);
  ctx.moveTo(wx, wy);
  ctx.lineTo(wx + 55, wy + 110);
  ctx.stroke();

  // Cross support bars
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(wx - 25, wy + 55);
  ctx.lineTo(wx + 25, wy + 55);
  ctx.moveTo(wx - 40, wy + 85);
  ctx.lineTo(wx + 40, wy + 85);
  ctx.stroke();

  // Outer Neon Rings
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#38bdf8';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(wx, wy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(wx, wy, r - 15, 0, Math.PI * 2);
  ctx.stroke();

  // 8 Spokes & Passenger Cabins (Gondolas)
  const spokes = 8;
  const cabinColors = ['#f43f5e', '#fbbf24', '#38bdf8', '#10b981', '#ec4899', '#8b5cf6', '#f97316', '#22c55e'];

  for (let i = 0; i < spokes; i++) {
    const spkAngle = angle + (i * Math.PI * 2) / spokes;
    const cx = wx + Math.cos(spkAngle) * r;
    const cy = wy + Math.sin(spkAngle) * r;

    // Spoke line
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Passenger Gondola Cabin (swings vertically)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = cabinColors[i];
    ctx.beginPath();
    ctx.roundRect(-10, 0, 20, 16, 4);
    ctx.fill();

    // Cabin roof
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(0, -7);
    ctx.lineTo(12, 0);
    ctx.closePath();
    ctx.fill();

    // If local player is riding and this is the first cabin
    if (isRiding && i === 0) {
      ctx.fillStyle = player?.color || '#ea580c';
      ctx.beginPath();
      ctx.arc(0, 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Center axle hub
  ctx.shadowBlur = 16;
  ctx.shadowColor = '#fbbf24';
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(wx, wy, 12, 0, Math.PI * 2);
  ctx.fill();

  // Title Sign
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#f59e0b';
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 13px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎡 विशाल झूला (Giant Wheel)', wx, wy + 128);

  const distToPlayer = Math.hypot(player.x - wx, player.y - (wy + 110));
  if (distToPlayer < 120 && !isRiding) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.fillText('✨ [ Press E or Click ] Ride Giant Wheel!', wx, wy + 144);
  }

  ctx.restore();
}

// -------------------------------------------------------------
// CARNIVAL ATTRACTIONS: BALLOON SHOOTING, CHAI TAPRI, FORTUNE WHEEL
// -------------------------------------------------------------
function renderCarnivalAttractions(ctx, player) {
  const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

  // 1. Balloon Shooting Stall (🎯)
  ctx.save();
  const bx = MELA_ZONES.BALLOON_STALL.x;
  const by = MELA_ZONES.BALLOON_STALL.y;
  const isNearBalloon = dist(player.x, player.y, bx, by) < 130;

  ctx.fillStyle = '#451a03';
  ctx.strokeStyle = isNearBalloon ? '#fbbf24' : '#ca8a04';
  ctx.lineWidth = isNearBalloon ? 3 : 2;
  ctx.beginPath();
  ctx.roundRect(bx - 60, by - 40, 120, 80, 10);
  ctx.fill();
  ctx.stroke();

  // Balloons pinned on board
  const bColors = ['#ef4444', '#3b82f6', '#fbbf24', '#10b981', '#ec4899', '#8b5cf6'];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      ctx.fillStyle = bColors[(r * 3 + c) % bColors.length];
      ctx.beginPath();
      ctx.arc(bx - 36 + c * 36, by - 16 + r * 28, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 12px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎯 गुब्बारा निशानेबाजी', bx, by + 56);
  ctx.font = '10px "Outfit", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('Balloon Shooting Game', bx, by + 70);

  if (isNearBalloon) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.fillText('✨ [ Click / Press E ] Play Balloon Game', bx, by + 86);
  }
  ctx.restore();

  // 2. Sharma Ji Ki Chai Tapri (☕)
  ctx.save();
  const tx = MELA_ZONES.CHAI_TAPRI.x;
  const ty = MELA_ZONES.CHAI_TAPRI.y;
  const isNearChai = dist(player.x, player.y, tx, ty) < 130;

  ctx.fillStyle = '#291b10';
  ctx.strokeStyle = isNearChai ? '#f97316' : '#78350f';
  ctx.lineWidth = isNearChai ? 3 : 2;
  ctx.beginPath();
  ctx.roundRect(tx - 65, ty - 45, 130, 85, 12);
  ctx.fill();
  ctx.stroke();

  // Chai Awning
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(tx - 65, ty - 45, 130, 20);

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 12px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('☕ शर्मा जी चाय टपरी', tx, ty - 12);
  ctx.font = '10px "Outfit", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('Kulhad Chai & Garam Samosa', tx, ty + 4);

  // Steaming kettle
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.arc(tx, ty + 24, 10, 0, Math.PI * 2);
  ctx.fill();

  if (isNearChai) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.fillText('☕ [ Click / Press E ] Sip Masala Chai', tx, ty + 56);
  }
  ctx.restore();

  // 3. Fortune Spin Wheel (🎡)
  ctx.save();
  const fx = MELA_ZONES.FORTUNE_WHEEL.x;
  const fy = MELA_ZONES.FORTUNE_WHEEL.y;
  const isNearFortune = dist(player.x, player.y, fx, fy) < 120;

  ctx.shadowBlur = 18;
  ctx.shadowColor = '#f59e0b';
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.arc(fx, fy, 28, 0, Math.PI * 2);
  ctx.fill();

  // Wheel spokes
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const th = (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + Math.cos(th) * 28, fy + Math.sin(th) * 28);
    ctx.stroke();
  }

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 12px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎡 लक्ष्मी धन चक्र', fx, fy + 45);

  if (isNearFortune) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.fillText('✨ [ Click / Press E ] Spin Fortune Wheel', fx, fy + 60);
  }
  ctx.restore();
}

function renderEntranceArch(ctx) {
  ctx.save();
  const archX = 1000;
  const archY = 160;

  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.fillRect(archX - 160, archY - 90, 36, 120);
  ctx.strokeRect(archX - 160, archY - 90, 36, 120);

  ctx.fillRect(archX + 124, archY - 90, 36, 120);
  ctx.strokeRect(archX + 124, archY - 90, 36, 120);

  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.roundRect(archX - 180, archY - 110, 360, 40, 8);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 18;
  ctx.shadowColor = '#fbbf24';
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 20px "Cinzel Decorative", "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('🪔 शुभ दीपावली • HAPPY DIWALI 🪔', archX, archY - 84);

  for (let gx = archX - 160; gx <= archX + 160; gx += 16) {
    const dip = Math.sin(((gx - (archX - 160)) / 320) * Math.PI) * 22;
    ctx.fillStyle = gx % 32 === 0 ? '#f59e0b' : '#ea580c';
    ctx.beginPath();
    ctx.arc(gx, archY - 65 + dip, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function renderMelaStalls(ctx, world, player) {
  const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

  // 1. Cracker Shop ("Shri Ganesh Patakha Bhandar")
  ctx.save();
  const shopX = MELA_ZONES.CRACKER_SHOP.x;
  const shopY = MELA_ZONES.CRACKER_SHOP.y;
  const isNearShop = dist(player.x, player.y, shopX, shopY) < 140;

  ctx.fillStyle = '#3f0c10';
  ctx.strokeStyle = isNearShop ? '#fbbf24' : '#b45309';
  ctx.lineWidth = isNearShop ? 4 : 2;
  ctx.beginPath();
  ctx.roundRect(shopX - 120, shopY - 90, 240, 145, 14);
  ctx.fill();
  ctx.stroke();

  for (let s = 0; s < 10; s++) {
    ctx.fillStyle = s % 2 === 0 ? '#dc2626' : '#fbbf24';
    ctx.fillRect(shopX - 120 + s * 24, shopY - 90, 24, 30);
  }

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 16px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('🧨 श्री गणेश पटाखा भंडार 🧨', shopX, shopY - 40);
  ctx.font = '11px "Outfit", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('Diwali Fireworks • Phuljhadi, Anar, Rockets', shopX, shopY - 22);

  ctx.fillStyle = '#78350f';
  ctx.fillRect(shopX - 100, shopY + 14, 200, 24);

  const crackerEmojis = ['✨', '🌀', '🪴', '🚀', '🧨', '💣'];
  crackerEmojis.forEach((em, idx) => {
    ctx.font = '16px sans-serif';
    ctx.fillText(em, shopX - 75 + idx * 30, shopY + 32);
  });

  if (isNearShop) {
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#fbbf24';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.fillText('✨ [ Click or Press E ] Enter Cracker Shop', shopX, shopY + 74);
  }
  ctx.restore();

  // 2. Sweets Stall ("Radhey Sweets Corner")
  ctx.save();
  const sweetX = MELA_ZONES.SWEETS_STALL.x;
  const sweetY = MELA_ZONES.SWEETS_STALL.y;
  const isNearSweet = dist(player.x, player.y, sweetX, sweetY) < 140;

  ctx.fillStyle = '#1e163b';
  ctx.strokeStyle = isNearSweet ? '#38bdf8' : '#6366f1';
  ctx.lineWidth = isNearSweet ? 4 : 2;
  ctx.beginPath();
  ctx.roundRect(sweetX - 120, sweetY - 90, 240, 145, 14);
  ctx.fill();
  ctx.stroke();

  for (let s = 0; s < 10; s++) {
    ctx.fillStyle = s % 2 === 0 ? '#f97316' : '#fffbeb';
    ctx.fillRect(sweetX - 120 + s * 24, sweetY - 90, 24, 30);
  }

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 16px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('🥨 RADHEY SWEETS CORNER 🥨', sweetX, sweetY - 40);
  ctx.font = '11px "Outfit", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('Kaju Katli • Garam Jalebi • Gulab Jamun', sweetX, sweetY - 22);

  ctx.fillStyle = '#78350f';
  ctx.fillRect(sweetX - 100, sweetY + 14, 200, 24);

  const sweetEmojis = ['🥨', '💎', '🌰', '🟡'];
  sweetEmojis.forEach((em, idx) => {
    ctx.font = '18px sans-serif';
    ctx.fillText(em, sweetX - 50 + idx * 34, sweetY + 32);
  });

  if (isNearSweet) {
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#f59e0b';
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.fillText('🥨 [ Click or Press E ] Enjoy Diwali Sweets', sweetX, sweetY + 74);
  }
  ctx.restore();

  // 3. Lakshmi-Ganesh Pooja Mandir (Temple)
  ctx.save();
  const templeX = MELA_ZONES.TEMPLE.x;
  const templeY = MELA_ZONES.TEMPLE.y;
  const isNearTemple = dist(player.x, player.y, templeX, templeY) < 140;

  ctx.fillStyle = '#381408';
  ctx.strokeStyle = isNearTemple ? '#f59e0b' : '#b45309';
  ctx.lineWidth = isNearTemple ? 4 : 2;
  ctx.beginPath();
  ctx.roundRect(templeX - 110, templeY - 95, 220, 150, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(templeX, templeY - 140);
  ctx.lineTo(templeX + 40, templeY - 95);
  ctx.lineTo(templeX - 40, templeY - 95);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(templeX, templeY - 55, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 15px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔔 लक्ष्मी-गणेश मंदिर 🪔', templeX, templeY - 16);
  ctx.font = '11px "Outfit", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('Ring Holy Bell for Shagun Blessing', templeX, templeY + 6);

  if (isNearTemple) {
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#fbbf24';
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.fillText('🔔 [ Click or Press E ] Ring Temple Bell', templeX, templeY + 76);
  }
  ctx.restore();

  // 4. Central Diya Monument (Maha Diya Plaza)
  ctx.save();
  const plazaX = MELA_ZONES.CENTRAL_CHAWK.x;
  const plazaY = MELA_ZONES.CENTRAL_CHAWK.y;

  ctx.shadowBlur = 35;
  ctx.shadowColor = '#f59e0b';
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.ellipse(plazaX, plazaY + 12, 54, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  const flameTime = performance.now() * 0.005;
  const flameHeight = 40 + Math.sin(flameTime) * 5;
  const flameWobble = Math.cos(flameTime * 1.5) * 4;

  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.moveTo(plazaX - 18, plazaY + 8);
  ctx.quadraticCurveTo(plazaX - 25, plazaY - 18, plazaX + flameWobble, plazaY - flameHeight);
  ctx.quadraticCurveTo(plazaX + 25, plazaY - 18, plazaX + 18, plazaY + 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(plazaX - 9, plazaY + 5);
  ctx.quadraticCurveTo(plazaX - 12, plazaY - 12, plazaX + flameWobble * 0.5, plazaY - flameHeight * 0.65);
  ctx.quadraticCurveTo(plazaX + 12, plazaY - 12, plazaX + 9, plazaY + 5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 14px "Cinzel", serif';
  ctx.fillText('महा दीपस्तंभ (Maha Diya)', plazaX, plazaY + 50);
  ctx.restore();
}

function renderRangoliArtwork(ctx) {
  ctx.save();
  const rx = MELA_ZONES.RANGOLI_PAVILION.x;
  const ry = MELA_ZONES.RANGOLI_PAVILION.y;

  const layers = [
    { r: 85, c: 'rgba(236, 72, 153, 0.45)' },
    { r: 70, c: 'rgba(245, 158, 11, 0.5)' },
    { r: 50, c: 'rgba(6, 182, 212, 0.55)' },
    { r: 28, c: 'rgba(251, 191, 36, 0.65)' },
    { r: 12, c: '#ffffff' }
  ];

  layers.forEach((l) => {
    ctx.fillStyle = l.c;
    ctx.beginPath();
    ctx.arc(rx, ry, l.r, 0, Math.PI * 2);
    ctx.fill();
  });

  const petals = 8;
  for (let i = 0; i < petals; i++) {
    const angle = (i * Math.PI * 2) / petals;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(
      rx + Math.cos(angle) * 58,
      ry + Math.sin(angle) * 58,
      15,
      8,
      angle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 14px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌸 RANGOLI UTSAV PAVILION 🌸', rx, ry + 115);
  ctx.restore();
}

function renderDiyas(ctx, diyas) {
  ctx.save();
  diyas.forEach((diya) => {
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.ellipse(diya.x, diya.y + 3, 11, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (diya.isLit) {
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#f59e0b';

      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(diya.x, diya.y - 4, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(diya.x, diya.y - 5, 2.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(diya.x, diya.y - 4, 3.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
      ctx.font = '9px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click to light', diya.x, diya.y - 12);
    }
  });
  ctx.restore();
}

function renderFairyLights(ctx, lights) {
  ctx.save();
  const time = performance.now() * 0.003;
  lights.forEach((l) => {
    const flicker = Math.sin(time + l.flickerOffset) * 0.3 + 0.7;
    ctx.globalAlpha = flicker;
    ctx.fillStyle = l.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = l.color;
    ctx.beginPath();
    ctx.arc(l.x, l.y, 2.8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function renderCharacter(
  ctx,
  char,
  isRemote = false,
  isLocal = false,
  selectedCracker = null,
  activeBuffs = null,
  isDancing = false
) {
  ctx.save();
  ctx.translate(char.x, char.y);

  // Dance rotation
  if (isDancing) {
    const danceAngle = Math.sin(performance.now() * 0.015) * 0.3;
    ctx.rotate(danceAngle);
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 13, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isLocal && activeBuffs?.jalebi) {
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#fbbf24';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  const walkOffset = char.isMoving || isDancing ? Math.sin(char.walkFrame || (performance.now() * 0.01)) * 4 : 0;

  ctx.fillStyle = char.outfit?.bottom || char.bottomColor || '#f8fafc';
  ctx.fillRect(-6, 2, 4, 11 + walkOffset);
  ctx.fillRect(2, 2, 4, 11 - walkOffset);

  ctx.fillStyle = char.outfit?.top || char.color || '#ea580c';
  ctx.beginPath();
  ctx.roundRect(-9, -12, 18, 16, [4, 4, 2, 2]);
  ctx.fill();

  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-8, -12, 3, 16);

  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, -18, 8, 0, Math.PI * 2);
  ctx.fill();

  const turbanColor = char.outfit?.turban || char.turbanColor;
  if (turbanColor) {
    ctx.fillStyle = turbanColor;
    ctx.beginPath();
    ctx.arc(0, -22, 9, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-9, -23, 18, 5);
  } else {
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, -21, 8, Math.PI, 0);
    ctx.fill();
  }

  if (isLocal && selectedCracker?.id === 'phuljhadi') {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, -4);
    ctx.lineTo(16, -14);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#fbbf24';
    ctx.beginPath();
    ctx.arc(16, -14, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = 'bold 11px "Outfit", sans-serif';
  ctx.textAlign = 'center';

  if (isLocal) {
    ctx.fillStyle = isDancing ? '#f43f5e' : '#fbbf24';
    ctx.fillText(`${char.name || 'You'} ${isDancing ? '💃 (Dancing!)' : '(You)'}`, 0, -32);
  } else if (isRemote) {
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`🟢 ${char.name || 'Player'} (Online)`, 0, -32);
  } else {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(char.name, 0, -32);
    ctx.font = '9px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(char.role || 'Visitor', 0, -22);
  }

  if (char.bubble) {
    ctx.font = '11px "Outfit", sans-serif';
    const textWidth = ctx.measureText(char.bubble).width;
    const pad = 8;
    const bw = textWidth + pad * 2;
    const bh = 22;
    const bx = -bw / 2;
    const by = -60;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 6);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-4, by + bh);
    ctx.lineTo(0, by + bh + 5);
    ctx.lineTo(4, by + bh);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.fillText(char.bubble, 0, by + 15);
  }

  ctx.restore();
}

function renderFloatingLanterns(ctx, lanterns) {
  ctx.save();
  lanterns.forEach((l) => {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.scale(l.scale, l.scale);

    ctx.shadowBlur = 12;
    ctx.shadowColor = '#f59e0b';
    ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
    ctx.beginPath();
    ctx.roundRect(-8, -12, 16, 20, [4, 4, 2, 2]);
    ctx.fill();

    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
  ctx.restore();
}

function renderNightLightingGlow(ctx, world, playerX, playerY) {
  ctx.save();
  const grad = ctx.createRadialGradient(playerX, playerY, 30, playerX, playerY, 280);
  grad.addColorStop(0, 'rgba(251, 191, 36, 0.14)');
  grad.addColorStop(0.6, 'rgba(245, 158, 11, 0.05)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(playerX, playerY, 280, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderDirectionGuides(ctx, player) {
  const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

  const dShop = dist(player.x, player.y, MELA_ZONES.CRACKER_SHOP.x, MELA_ZONES.CRACKER_SHOP.y);
  if (dShop > 520) {
    drawCompassArrow(ctx, player.x, player.y, MELA_ZONES.CRACKER_SHOP.x, MELA_ZONES.CRACKER_SHOP.y, '🧨 Shop', '#ef4444');
  }

  const dGround = dist(player.x, player.y, MELA_ZONES.DHAMAKA_GROUND.x, MELA_ZONES.DHAMAKA_GROUND.y);
  if (dGround > 560) {
    drawCompassArrow(ctx, player.x, player.y, MELA_ZONES.DHAMAKA_GROUND.x, MELA_ZONES.DHAMAKA_GROUND.y, '🎆 Dhamaka Ground', '#f59e0b');
  }
}

function drawCompassArrow(ctx, px, py, tx, ty, label, color) {
  ctx.save();
  const angle = Math.atan2(ty - py, tx - px);
  const radius = 95;
  const ax = px + Math.cos(angle) * radius;
  const ay = py + Math.sin(angle) * radius;

  ctx.translate(ax, ay);
  ctx.rotate(angle);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(-6, -6);
  ctx.lineTo(-6, 6);
  ctx.closePath();
  ctx.fill();

  ctx.rotate(-angle);
  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.textAlign = 'center';
  ctx.fillText(label, 0, 16);

  ctx.restore();
}
