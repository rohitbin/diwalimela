// Interactive Diwali Celebration Mela Canvas Game Engine
// Dynamic lighting, 60fps particle physics, Giant Ferris Wheel, Balloon Shooting, Dhol troupe, real people simulation

import React, { useEffect, useRef, useState } from 'react';
import { ActiveCracker, Particle } from './physics/particles';
import { soundEngine } from '../audio/soundEngine';
import { CRACKERS } from '../data/crackers';

const CRACKER_MAP = CRACKERS.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

export const MELA_ZONES = {
  ENTRANCE: { x: 1000, y: 150, name: 'Grand Entrance Gate (प्रवेश द्वार)' },
  CENTRAL_CHAWK: { x: 1000, y: 650, name: 'Deepotsav Plaza (महा दीया चौक)' },
  CRACKER_SHOP: { x: 1450, y: 450, name: 'Shri Ganesh Patakha Bhandar (पटाखा दुकान)' },
  TEMPLE: { x: 550, y: 950, name: 'Lakshmi-Ganesh Mandir (शुभ मंदिर)' },
  RANGOLI_PAVILION: { x: 1000, y: 1150, name: 'Rangoli Art Pavilion (रंगोली मंडप)' },
  FERRIS_WHEEL: { x: 1650, y: 220, name: 'Mela Giant Wheel (विशाल झूला)' },
  BALLOON_STALL: { x: 1320, y: 220, name: 'Balloon Shooting Stall (गुब्बारा निशानेबाजी)' },
  CHAI_TAPRI: { x: 380, y: 420, name: 'Sharma Ji Chai Tapri (चाय टपरी)' },
  RAVAN: { x: 1550, y: 980, name: 'Ravan Dahan Ground (रावण दहन - 10M HP)' },
  WEAPON_STALL: { x: 1240, y: 880, name: 'Shastra Armory (शस्त्रागार)' }
};

export default function MelaCanvas({
  player,
  setPlayer,
  inventory,
  setInventory,
  coins,
  setCoins,
  selectedCracker,
  setSelectedCracker,
  onOpenCrackerShop,
  onOpenTemple,
  onOpenBalloonGame,
  onOpenChaiTapri,
  onOpenArmory,
  ravanHp = 10000000,
  setRavanHp,
  onRavanShot,
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
  const wrapperRef = useRef(null);
  const [isRidingWheel, setIsRidingWheel] = useState(false);
  const [placementPreview, setPlacementPreview] = useState(null);
  const [clickSpeedMultiplier, setClickSpeedMultiplier] = useState(1.0);
  const autoFireIntervalRef = useRef(null);
  const speedResetTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (autoFireIntervalRef.current) clearInterval(autoFireIntervalRef.current);
      if (speedResetTimeoutRef.current) clearTimeout(speedResetTimeoutRef.current);
    };
  }, []);

  // iPhone & Mobile Touch Drag Control Ref (Directly read in 60fps loop to avoid React closure lag)
  const touchControlRef = useRef({
    active: false,
    originX: 0,
    originY: 0,
    currentX: 0,
    currentY: 0,
    startX: 0,
    startY: 0,
    startTime: 0,
    isDragging: false,
    touchId: null
  });
  const [touchIndicator, setTouchIndicator] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [joystickKnob, setJoystickKnob] = useState({ x: 0, y: 0, active: false });
  const joystickVectorRef = useRef({ active: false, x: 0, y: 0 });
  const joystickElRef = useRef(null);
  const joystickCenterRef = useRef({ x: 0, y: 0 });
  const joystickPointerIdRef = useRef(null);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth <= 1024
      );
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const updateJoystickFromClientPos = (clientX, clientY) => {
    let { x: cx, y: cy } = joystickCenterRef.current;
    if ((cx === 0 && cy === 0) && joystickElRef.current) {
      const rect = joystickElRef.current.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
      joystickCenterRef.current = { x: cx, y: cy };
    }

    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    const maxR = 32;
    const clampedDist = Math.min(dist, maxR);
    const angle = dist > 0 ? Math.atan2(dy, dx) : 0;
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setJoystickKnob({ x: knobX, y: knobY, active: true });

    if (dist > 3) {
      const intensity = Math.min(1.0, dist / maxR);
      joystickVectorRef.current = {
        active: true,
        x: (dx / dist) * intensity,
        y: (dy / dist) * intensity
      };
      playerRef.current.targetX = undefined;
      playerRef.current.targetY = undefined;
    } else {
      joystickVectorRef.current = { active: false, x: 0, y: 0 };
    }
  };

  const handleJoystickPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    joystickPointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    joystickCenterRef.current = { x: cx, y: cy };

    updateJoystickFromClientPos(e.clientX, e.clientY);
  };

  const handleJoystickPointerMove = (e) => {
    if (joystickPointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    updateJoystickFromClientPos(e.clientX, e.clientY);
  };

  const handleJoystickPointerUp = (e) => {
    if (joystickPointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    joystickPointerIdRef.current = null;
    joystickVectorRef.current = { active: false, x: 0, y: 0 };
    setJoystickKnob({ x: 0, y: 0, active: false });
    playerRef.current.targetX = undefined;
    playerRef.current.targetY = undefined;
  };

  const handleJoystickTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    joystickPointerIdRef.current = touch.identifier;
    if (joystickElRef.current) {
      const rect = joystickElRef.current.getBoundingClientRect();
      joystickCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    updateJoystickFromClientPos(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let touch = null;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === joystickPointerIdRef.current) {
        touch = e.touches[i];
        break;
      }
    }
    if (!touch && e.touches.length > 0) touch = e.touches[0];
    if (touch) {
      updateJoystickFromClientPos(touch.clientX, touch.clientY);
    }
  };

  const handleJoystickTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    joystickPointerIdRef.current = null;
    joystickVectorRef.current = { active: false, x: 0, y: 0 };
    setJoystickKnob({ x: 0, y: 0, active: false });
    playerRef.current.targetX = undefined;
    playerRef.current.targetY = undefined;
  };

  // Game World State
  const worldRef = useRef({
    width: 2000,
    height: 1400,
    particles: [],
    activeCrackers: [],
    projectiles: [],
    floatingTexts: [],
    ravanHitFlash: 0,
    lastShotTime: 0,
    effigyTimer: 0,
    mouse: { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false },
    keys: {},
    camera: { x: 1000, y: 650 },
    cameraZoom: 1.0,
    wheelAngle: 0,
    skyFlash: { color: 'rgba(254, 240, 138, 0.25)', alpha: 0, decay: 0.05 },
    screenShake: { intensity: 0, duration: 0 },
    flowerPetals: [],
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
    // NPCs walking in world (Removed fake NPCs - only real live players)
    npcs: [],
    nextAmbientFireworkTime: 140,
    lastFrameTime: performance.now()
  });

  const playerRef = useRef(player);
  const lastTouchEndTimeRef = useRef(0);
  const touchMovedRef = useRef(false);

  // Sync external property changes (name, color, turban, bubble) without overwriting active canvas x/y
  useEffect(() => {
    if (player.targetX !== undefined && player.targetY !== undefined) {
      playerRef.current.targetX = player.targetX;
      playerRef.current.targetY = player.targetY;
      playerRef.current.isMoving = true;
    } else {
      playerRef.current.targetX = undefined;
      playerRef.current.targetY = undefined;
    }
  }, [player.targetX, player.targetY]);

  useEffect(() => {
    playerRef.current = {
      ...playerRef.current,
      name: player.name,
      color: player.color,
      turbanColor: player.turbanColor,
      speed: player.speed || playerRef.current.speed,
      bubble: player.bubble,
      holdingCracker: player.holdingCracker
    };
  }, [player.name, player.color, player.turbanColor, player.speed, player.bubble, player.holdingCracker]);

  const remotePlayersRef = useRef(remotePlayers);
  remotePlayersRef.current = remotePlayers;
  const lastBroadcastRef = useRef(0);

  // Sync remote fireworks, weapons, diyas, buffs, bells, and global explosions across all real players
  useEffect(() => {
    if (!multiplayerManager) return;

    // 1. Cracker placed/ignited by any user
    const unsubCracker = multiplayerManager.onCracker((event) => {
      if (!event || !event.crackerId) return;
      const crackerData = CRACKER_MAP[event.crackerId] || window.__CRACKER_MAP?.[event.crackerId];
      if (crackerData) {
        const activeCracker = new ActiveCracker(
          crackerData,
          event.x,
          event.y,
          soundEngine,
          event.placedBy || 'Friend'
        );
        worldRef.current.activeCrackers.push(activeCracker);
      }
    });

    // 2. Projectile fired (Divine Bow Arrow or Sparkler Blaster Gun) by any user
    const unsubProj = multiplayerManager.onProjectile((data) => {
      if (!data || data.shooterId === playerRef.current.id) return;
      if (data.weaponId === 'gun') {
        soundEngine.playGunShot();
      } else {
        soundEngine.playBowRelease();
      }

      worldRef.current.projectiles.push({
        id: data.id || `proj_${Date.now()}`,
        x: data.startX,
        y: data.startY,
        startX: data.startX,
        startY: data.startY,
        targetX: data.targetX,
        targetY: data.targetY,
        speed: data.speed || 28,
        speedMultiplier: data.speedMultiplier || 1.0,
        type: data.weaponId,
        shooterName: data.shooterName || 'Warrior',
        color: data.color || (data.weaponId === 'gun' ? '#38bdf8' : '#fbbf24'),
        trail: [],
        isRemote: true
      });
    });

    // 3. Ravan Hit & Boss Impact from any user
    const unsubRavanHit = multiplayerManager.onRavanHit((data) => {
      if (!data) return;
      soundEngine.playRavanHit();
      worldRef.current.ravanHitFlash = 9;
      worldRef.current.screenShake = { intensity: 3, duration: 4 };

      // Impact spark particles at Ravan
      const rx = MELA_ZONES.RAVAN.x + (Math.random() - 0.5) * 35;
      const ry = MELA_ZONES.RAVAN.y + (Math.random() - 0.5) * 45;
      for (let i = 0; i < 24; i++) {
        const theta = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 5.5;
        worldRef.current.particles.push(
          new Particle(
            rx,
            ry,
            Math.cos(theta) * spd,
            Math.sin(theta) * spd,
            Math.random() > 0.4 ? '#fbbf24' : '#ef4444',
            18 + Math.floor(Math.random() * 14),
            1.8,
            0.06,
            0.95,
            'spark'
          )
        );
      }

      // Floating -1 damage number
      worldRef.current.floatingTexts.push({
        x: rx,
        y: ry - 20,
        text: `-1 HP ✨ ${data.shooterName || 'Hero'}`,
        color: data.weapon === 'gun' ? '#38bdf8' : '#fef08a',
        alpha: 1.0,
        vy: -1.7,
        life: 55
      });
    });

    // 4. Diya lighting by any user
    const unsubDiya = multiplayerManager.onDiya((diyaData) => {
      if (!diyaData) return;
      const target = worldRef.current.diyas.find((d) => d.id === diyaData.id);
      if (target) {
        target.isLit = true;
        soundEngine.playDiyaLight();

        // Sparkle burst around diya
        for (let i = 0; i < 16; i++) {
          const theta = Math.random() * Math.PI * 2;
          const spd = 1.0 + Math.random() * 2.5;
          worldRef.current.particles.push(
            new Particle(
              target.x,
              target.y - 4,
              Math.cos(theta) * spd,
              Math.sin(theta) * spd - 0.5,
              '#fbbf24',
              20,
              1.8,
              0.03,
              0.96,
              'spark'
            )
          );
        }

        if (diyaData.litBy) {
          worldRef.current.floatingTexts.push({
            x: target.x,
            y: target.y - 18,
            text: `🪔 Lit by ${diyaData.litBy}!`,
            color: '#fef08a',
            alpha: 1.0,
            vy: -1.2,
            life: 60
          });
        }
      }
    });

    // 5. Temple Bell rung by any user
    const unsubBell = multiplayerManager.onTempleBell((data) => {
      soundEngine.playTempleBell();
      const tx = MELA_ZONES.TEMPLE.x;
      const ty = MELA_ZONES.TEMPLE.y;

      // Golden marigold flower petal shower
      for (let i = 0; i < 35; i++) {
        worldRef.current.flowerPetals.push({
          x: tx + (Math.random() - 0.5) * 120,
          y: ty - 120 + Math.random() * 40,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 0.8 + Math.random() * 1.4,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.08,
          color: Math.random() > 0.5 ? '#f59e0b' : '#ea580c',
          life: 140
        });
      }

      worldRef.current.floatingTexts.push({
        x: tx,
        y: ty - 60,
        text: `🔔 ${data.playerName || 'Devotee'} rang the holy Mandir Bell!`,
        color: '#fef08a',
        alpha: 1.0,
        vy: -1.4,
        life: 70
      });
    });

    // 6. Global Dhamaka (Massive Sutli Bomb explosion felt everywhere)
    const unsubDhamaka = multiplayerManager.onGlobalDhamaka((data) => {
      worldRef.current.skyFlash = {
        color: data?.color || 'rgba(254, 240, 138, 0.3)',
        alpha: 0.28,
        decay: 0.045
      };
      worldRef.current.screenShake = {
        intensity: 0,
        duration: 0
      };
      soundEngine.playSutliBomb();
    });

    // 7. Sweet / Chai Buff used by any user
    const unsubBuff = multiplayerManager.onBuff((data) => {
      if (data && data.playerName) {
        worldRef.current.floatingTexts.push({
          x: MELA_ZONES.CHAI_TAPRI.x,
          y: MELA_ZONES.CHAI_TAPRI.y - 30,
          text: `${data.icon || '☕'} ${data.playerName}: ${data.name || 'Warm Chai Boost'}!`,
          color: '#fed7aa',
          alpha: 1.0,
          vy: -1.2,
          life: 65
        });
      }
    });

    return () => {
      if (unsubCracker) unsubCracker();
      if (unsubProj) unsubProj();
      if (unsubRavanHit) unsubRavanHit();
      if (unsubDiya) unsubDiya();
      if (unsubBell) unsubBell();
      if (unsubDhamaka) unsubDhamaka();
      if (unsubBuff) unsubBuff();
    };
  }, [multiplayerManager]);



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

      if (e.key.toLowerCase() === 'e' || e.code === 'Space' || e.key.toLowerCase() === 'f') {
        const dRavan = Math.hypot(playerRef.current.x - MELA_ZONES.RAVAN.x, playerRef.current.y - MELA_ZONES.RAVAN.y);
        const hasWeapon = selectedCracker?.isWeapon || selectedCracker?.id === 'bow' || selectedCracker?.id === 'gun';
        if (dRavan < 490 && hasWeapon) {
          fireWeaponAtRavan();
          return;
        }
        const interacted = checkPlayerProximityInteractions();
        if (!interacted && selectedCracker && !selectedCracker.isWeapon) {
          const invItem = inventory.find((i) => i.id === selectedCracker.id);
          if (invItem && invItem.count > 0) {
            placeAndIgniteCracker(selectedCracker, playerRef.current.x, playerRef.current.y + 12);
          }
        }
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

  // Fire Bow or Gun projectile at Ravan effigy
  // Dynamically accelerates projectile throwing speed according to how fast the user clicks!
  const fireWeaponAtRavan = () => {
    soundEngine.init();
    const world = worldRef.current;
    const now = performance.now();

    // Guard (35ms) to prevent accidental duplicate synthetic touch+mouse event on exact same frame
    if (now - (world.lastShotTime || 0) < 35) return;

    const timeSinceLastClick = now - (world.lastShotTime || (now - 500));
    world.lastShotTime = now;

    // Track rolling click window (last 1400ms) to compute clicking cadence
    if (!world.recentClicks) world.recentClicks = [];
    world.recentClicks.push(now);
    world.recentClicks = world.recentClicks.filter((t) => now - t <= 1400);

    // Calculate dynamic click speed boost
    // The faster the user clicks, the higher the projectile speed!
    let speedBoost = 1.0;
    if (timeSinceLastClick < 140) {
      // Ultra rapid clicking (7+ clicks/second or held auto-fire)
      speedBoost = 2.75;
    } else if (timeSinceLastClick < 220) {
      // Very fast rapid clicking (4.5 to 7 clicks/second)
      speedBoost = 2.25;
    } else if (timeSinceLastClick < 340) {
      // Fast clicking (3 to 4.5 clicks/second)
      speedBoost = 1.75;
    } else if (timeSinceLastClick < 480) {
      // Medium clicking (~2 clicks/second)
      speedBoost = 1.35;
    } else {
      // Normal single click pace
      speedBoost = 1.0;
    }

    // Additional combo boost based on consecutive rapid clicks in the rolling window
    const comboBoost = Math.min(0.65, (world.recentClicks.length - 1) * 0.1);
    const finalMultiplier = Math.min(3.2, speedBoost + comboBoost);

    setClickSpeedMultiplier(finalMultiplier);
    if (speedResetTimeoutRef.current) clearTimeout(speedResetTimeoutRef.current);
    speedResetTimeoutRef.current = setTimeout(() => {
      setClickSpeedMultiplier(1.0);
    }, 750);

    const p = playerRef.current;
    const hasWeapon = selectedCracker?.isWeapon || selectedCracker?.id === 'bow' || selectedCracker?.id === 'gun';
    const weapon = hasWeapon ? selectedCracker : { id: 'bow', name: 'Ram Dhanush', isWeapon: true };

    // Play shot audio with dynamic pitch scaling according to clicking speed
    if (weapon.id === 'gun') {
      soundEngine.playGunShot(finalMultiplier);
    } else {
      soundEngine.playBowShot(finalMultiplier);
    }

    // Aim at Ravan effigy torso/heads
    const targetX = MELA_ZONES.RAVAN.x + (Math.random() - 0.5) * 55;
    const targetY = MELA_ZONES.RAVAN.y - 120 + (Math.random() - 0.5) * 65;

    // Base projectile speed:
    // Gun base 32 -> up to 85 px/frame!
    // Bow base 25 -> up to 70 px/frame!
    const baseSpeed = weapon.id === 'gun' ? 32 : 25;
    const computedSpeed = Math.round(baseSpeed * finalMultiplier);

    const projId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const projColor = weapon.id === 'gun' ? '#38bdf8' : '#fbbf24';

    world.projectiles.push({
      id: projId,
      x: p.x,
      y: p.y - 14,
      startX: p.x,
      startY: p.y - 14,
      targetX,
      targetY,
      speed: computedSpeed,
      speedMultiplier: finalMultiplier,
      type: weapon.id,
      shooterName: p.name || 'Hero',
      color: projColor,
      trail: [],
      isLocal: true
    });

    if (multiplayerManager) {
      multiplayerManager.broadcastProjectile({
        id: projId,
        weaponId: weapon.id,
        shooterId: p.id,
        shooterName: p.name || 'Hero',
        startX: p.x,
        startY: p.y - 14,
        targetX,
        targetY,
        speed: computedSpeed,
        speedMultiplier: finalMultiplier,
        color: projColor
      });
    }

    if (onRavanShot) onRavanShot(weapon.id);
  };

  // Continuous rapid auto-fire when holding down
  const startAutoFire = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    fireWeaponAtRavan();
    if (autoFireIntervalRef.current) clearInterval(autoFireIntervalRef.current);
    const isGun = selectedCracker?.id === 'gun';
    const repeatRate = isGun ? 85 : 120;
    autoFireIntervalRef.current = setInterval(() => {
      fireWeaponAtRavan();
    }, repeatRate);
  };

  const stopAutoFire = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (autoFireIntervalRef.current) {
      clearInterval(autoFireIntervalRef.current);
      autoFireIntervalRef.current = null;
    }
  };

  // Check proximity to shops / stalls / games
  const checkPlayerProximityInteractions = () => {
    const p = playerRef.current;
    const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

    // Giant Ferris Wheel
    if (dist(p.x, p.y, MELA_ZONES.FERRIS_WHEEL.x, MELA_ZONES.FERRIS_WHEEL.y) < 140) {
      toggleFerrisWheelRide();
      return true;
    }

    // Balloon Shooting Game
    if (dist(p.x, p.y, MELA_ZONES.BALLOON_STALL.x, MELA_ZONES.BALLOON_STALL.y) < 130) {
      onOpenBalloonGame();
      return true;
    }

    // Weapon Armory Stall (Shastra Armory)
    if (dist(p.x, p.y, MELA_ZONES.WEAPON_STALL.x, MELA_ZONES.WEAPON_STALL.y) < 140) {
      if (onOpenArmory) onOpenArmory();
      return true;
    }

    // Ravan Boss Ground (Shoot or open Armory if near)
    const dRavan = dist(p.x, p.y, MELA_ZONES.RAVAN.x, MELA_ZONES.RAVAN.y);
    if (dRavan < 480) {
      const hasWeapon = selectedCracker?.isWeapon || selectedCracker?.id === 'bow' || selectedCracker?.id === 'gun';
      if (hasWeapon) {
        fireWeaponAtRavan();
        return true;
      } else if (dRavan < 240) {
        if (onOpenArmory) onOpenArmory();
        return true;
      }
    }

    // Chai Tapri
    if (dist(p.x, p.y, MELA_ZONES.CHAI_TAPRI.x, MELA_ZONES.CHAI_TAPRI.y) < 130) {
      onOpenChaiTapri();
      return true;
    }

    // Cracker Shop
    if (dist(p.x, p.y, MELA_ZONES.CRACKER_SHOP.x, MELA_ZONES.CRACKER_SHOP.y) < 140) {
      onOpenCrackerShop();
      return true;
    }
    // Temple
    if (dist(p.x, p.y, MELA_ZONES.TEMPLE.x, MELA_ZONES.TEMPLE.y) < 140) {
      onOpenTemple();
      return true;
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

  // Process interaction anywhere on Canvas (Click or Touch)
  const processCanvasInteraction = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const world = worldRef.current;
    const worldClickX = (clickX - canvas.width / 2) / (world.cameraZoom || 1) + world.camera.x;
    const worldClickY = (clickY - canvas.height / 2) / (world.cameraZoom || 1) + world.camera.y;

    const p = playerRef.current;
    const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

    // 0. Weapon Action: If player tapped near Ravan or has weapon armed
    const hasWeapon = selectedCracker?.isWeapon || selectedCracker?.id === 'bow' || selectedCracker?.id === 'gun';
    const distToRavan = dist(p.x, p.y, MELA_ZONES.RAVAN.x, MELA_ZONES.RAVAN.y);
    const clickNearRavan = dist(worldClickX, worldClickY, MELA_ZONES.RAVAN.x, MELA_ZONES.RAVAN.y) < 180;

    if (clickNearRavan) {
      if (hasWeapon && distToRavan <= 490) {
        fireWeaponAtRavan();
        return;
      } else if (!hasWeapon && distToRavan <= 260) {
        if (onOpenArmory) onOpenArmory();
        return;
      }
    }

    if (hasWeapon && distToRavan <= 490) {
      fireWeaponAtRavan();
      return;
    }

    // 1. High Priority: If a normal firecracker is selected, place and ignite it!
    if (selectedCracker && !selectedCracker.isWeapon) {
      const invItem = inventory.find((i) => i.id === selectedCracker.id);
      if (invItem && invItem.count > 0) {
        placeAndIgniteCracker(selectedCracker, worldClickX, worldClickY);
        return;
      }
    }

    // 2. Clicked Ferris Wheel
    if (dist(worldClickX, worldClickY, MELA_ZONES.FERRIS_WHEEL.x, MELA_ZONES.FERRIS_WHEEL.y) < 120) {
      toggleFerrisWheelRide();
      return;
    }

    // 3. Clicked Balloon Stall
    if (dist(worldClickX, worldClickY, MELA_ZONES.BALLOON_STALL.x, MELA_ZONES.BALLOON_STALL.y) < 100) {
      onOpenBalloonGame();
      return;
    }

    // 4. Clicked Weapon Armory Stall
    if (dist(worldClickX, worldClickY, MELA_ZONES.WEAPON_STALL.x, MELA_ZONES.WEAPON_STALL.y) < 120) {
      if (onOpenArmory) onOpenArmory();
      return;
    }

    // 5. Clicked Chai Tapri
    if (dist(worldClickX, worldClickY, MELA_ZONES.CHAI_TAPRI.x, MELA_ZONES.CHAI_TAPRI.y) < 100) {
      onOpenChaiTapri();
      return;
    }

    // 6. If clicked on Cracker Shop stall
    if (dist(worldClickX, worldClickY, MELA_ZONES.CRACKER_SHOP.x, MELA_ZONES.CRACKER_SHOP.y) < 120) {
      onOpenCrackerShop();
      return;
    }

    // 7. If clicked on Temple
    if (dist(worldClickX, worldClickY, MELA_ZONES.TEMPLE.x, MELA_ZONES.TEMPLE.y) < 120) {
      onOpenTemple();
      return;
    }

    // 8. If clicked on unlit diya
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

    // 9. Otherwise, move player to target location (tap to walk)
    if (!isRidingWheel) {
      p.targetX = worldClickX;
      p.targetY = worldClickY;
      p.isMoving = true;
      setPlayer((prev) => ({
        ...prev,
        targetX: worldClickX,
        targetY: worldClickY,
        isMoving: true
      }));
    }
  };

  // Click on Canvas to walk or place cracker (Desktop mouse clicks)
  const handleCanvasClick = (e) => {
    // Suppress synthetic clicks fired right after touch drag / release
    if (performance.now() - lastTouchEndTimeRef.current < 450) {
      return;
    }
    processCanvasInteraction(e.clientX, e.clientY);
  };

  // Place and ignite cracker
  const placeAndIgniteCracker = (crackerData, targetX, targetY) => {
    const item = inventory.find((i) => i.id === crackerData.id);
    if (!item || item.count <= 0) {
      if (setSelectedCracker) setSelectedCracker(null);
      return;
    }

    setInventory((prev) => {
      const next = prev.map((i) => (i.id === crackerData.id ? { ...i, count: i.count - 1 } : i));
      const remaining = next.find((i) => i.id === crackerData.id)?.count || 0;
      if (remaining <= 0 && setSelectedCracker) {
        setSelectedCracker(null);
      }
      return next;
    });

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
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        crackerId: crackerData.id,
        crackerName: crackerData.name,
        icon: crackerData.icon,
        x: targetX,
        y: targetY,
        placedBy: playerRef.current.name
      });
    }
  };

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
      const isMobileScreen = canvas.width < 680 || canvas.height < 500;
      let targetZoom = isMobileScreen ? 0.88 : 1.0;

      if (isRidingWheel) {
        const wheelR = 85;
        const cabinX = MELA_ZONES.FERRIS_WHEEL.x + Math.cos(world.wheelAngle) * wheelR;
        const cabinY = MELA_ZONES.FERRIS_WHEEL.y + Math.sin(world.wheelAngle) * wheelR;
        targetCamX = cabinX;
        targetCamY = cabinY;
        targetZoom = isMobileScreen ? 0.65 : 0.75; // Panoramic high sky view!
      }

      world.cameraZoom += (targetZoom - (world.cameraZoom || 1)) * 0.05;

      // Player Movement from Keyboard / Touch
      if (!isRidingWheel) {
        let moveX = 0;
        let moveY = 0;
        // Smooth, balanced character speed (neither too fast nor too slow)
        let speed = 4.2;
        if (activeBuffs?.kulhad_chai || activeBuffs?.adrak_chai || activeBuffs?.kesar_chai) speed *= 1.2;

        // Frame-rate independent delta time: keeps speed constant and smooth
        const now = performance.now();
        const rawDt = (now - (world.lastFrameTime || now)) / 16.667;
        const dt = Math.min(1.35, Math.max(0.75, rawDt));
        world.lastFrameTime = now;
        const frameSpeed = speed * dt;

        if (world.keys['w'] || world.keys['keyw'] || world.keys['arrowup']) moveY -= 1;
        if (world.keys['s'] || world.keys['keys'] || world.keys['arrowdown']) moveY += 1;
        if (world.keys['a'] || world.keys['keya'] || world.keys['arrowleft']) moveX -= 1;
        if (world.keys['d'] || world.keys['keyd'] || world.keys['arrowright']) moveX += 1;

        // 1. Direct Virtual Joystick Vector (Guaranteed smooth control)
        const jv = joystickVectorRef.current;
        if (jv && jv.active) {
          moveX = jv.x;
          moveY = jv.y;
          p.targetX = undefined;
          p.targetY = undefined;
        } else {
          // 2. Fallback Touch drag control on canvas
          const tc = touchControlRef.current;
          if (tc.active) {
            const dx = tc.currentX - tc.originX;
            const dy = tc.currentY - tc.originY;
            const dist = Math.hypot(dx, dy);
            if (dist > 5) {
              const norm = Math.min(1.0, Math.max(0.85, dist / 22));
              moveX = (dx / dist) * norm;
              moveY = (dy / dist) * norm;
              tc.isDragging = true;
              touchMovedRef.current = true;
              p.targetX = undefined;
              p.targetY = undefined;
            }
          }
        }

        let newX = p.x;
        let newY = p.y;
        let isMoving = false;

        if (moveX !== 0 || moveY !== 0) {
          // Manual movement cancels click-navigation targets permanently
          p.targetX = undefined;
          p.targetY = undefined;

          const len = Math.hypot(moveX, moveY);
          const jvActive = jv && jv.active;
          const moveMult = jvActive ? Math.min(1.0, len) : 1.0;
          newX += (moveX / len) * frameSpeed * moveMult;
          newY += (moveY / len) * frameSpeed * moveMult;
          isMoving = true;

          if (Math.abs(moveX) > Math.abs(moveY)) {
            p.facing = moveX > 0 ? 'right' : 'left';
          } else {
            p.facing = moveY > 0 ? 'down' : 'up';
          }
        } else if (p.targetX !== undefined && p.targetY !== undefined) {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist > frameSpeed + 1) {
            newX += (dx / dist) * frameSpeed;
            newY += (dy / dist) * frameSpeed;
            isMoving = true;
            if (Math.abs(dx) > Math.abs(dy)) {
              p.facing = dx > 0 ? 'right' : 'left';
            } else {
              p.facing = dy > 0 ? 'down' : 'up';
            }
          } else {
            // Target arrived: clear target destination so player NEVER walks back to old targets
            newX = p.targetX;
            newY = p.targetY;
            isMoving = false;
            p.targetX = undefined;
            p.targetY = undefined;
          }
        }

        // Boundary sliding: keep full movement on unclamped axis
        const minX = 70;
        const maxX = world.width - 70;
        const minY = 110;
        const maxY = world.height - 70;

        if (newX < minX || newX > maxX) {
          newX = Math.max(minX, Math.min(maxX, newX));
          if (moveY !== 0) {
            newY = p.y + Math.sign(moveY) * frameSpeed;
          }
        }
        if (newY < minY || newY > maxY) {
          newY = Math.max(minY, Math.min(maxY, newY));
          if (moveX !== 0) {
            newX = p.x + Math.sign(moveX) * frameSpeed;
          }
        }
        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        if (newX !== p.x || newY !== p.y || isMoving !== p.isMoving) {
          const updated = {
            ...p,
            x: newX,
            y: newY,
            isMoving,
            targetX: p.targetX,
            targetY: p.targetY,
            walkFrame: isMoving ? (p.walkFrame || 0) + 0.2 : 0,
            facing: p.facing || 'right'
          };
          // Immediately update playerRef so next 60fps frame reads latest coordinates synchronously!
          playerRef.current = updated;
          setPlayer(updated);

          const now = performance.now();
          if (multiplayerManager && (!lastBroadcastRef.current || now - lastBroadcastRef.current > 40 || !isMoving)) {
            lastBroadcastRef.current = now;
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
      if (world.screenShake && world.screenShake.duration > 0) {
        shakeOffsetX = (Math.random() - 0.5) * world.screenShake.intensity;
        shakeOffsetY = (Math.random() - 0.5) * world.screenShake.intensity;
        world.screenShake.duration--;
      } else if (screenShake && screenShake.duration > 0) {
        shakeOffsetX = (Math.random() - 0.5) * screenShake.intensity;
        shakeOffsetY = (Math.random() - 0.5) * screenShake.intensity;
      }

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
      const triggerShake = () => {
        // Screen vibration disabled after explosions per user preference
      };
      const triggerSkyFlash = (color, durationOrAlpha, customDecay) => {
        let maxAlpha = 0.28;
        let decay = 0.045;

        if (typeof durationOrAlpha === 'number') {
          if (durationOrAlpha > 1.0) {
            // Frame count passed (e.g., 6, 8, 12)
            const frames = Math.max(4, Math.min(durationOrAlpha, 16));
            decay = maxAlpha / frames;
          } else {
            // Normalized opacity passed
            maxAlpha = Math.min(0.28, durationOrAlpha);
            decay = customDecay || 0.045;
          }
        }

        world.skyFlash = {
          color: color || 'rgba(254, 240, 138, 0.3)',
          alpha: maxAlpha,
          decay
        };
      };

      world.activeCrackers = world.activeCrackers.filter((c) => {
        const wasFuse = c.state === 'FUSE';
        const alive = c.update(addParticle, triggerShake, triggerSkyFlash);
        if (wasFuse && c.state === 'BURSTING' && c.onBurst) {
          try { c.onBurst(); } catch (_) {}
        }
        return alive;
      });

      world.particles = world.particles.filter((pt) => pt.update());

      // Handheld Phuljhadi spark effect (Local Player)
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

      // Handheld Phuljhadi spark effect (Remote Live Online Players)
      const peers = remotePlayersRef.current;
      if (peers && peers.size > 0) {
        peers.forEach((remPlayer) => {
          if (remPlayer.holdingCracker === 'phuljhadi') {
            const sparkX = remPlayer.x + (remPlayer.facing === 'left' ? -18 : 18);
            const sparkY = remPlayer.y - 14;
            for (let i = 0; i < 3; i++) {
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
          }
        });
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

      world.effigyTimer = (world.effigyTimer || 0) + 1;
      if (world.ravanHitFlash > 0) world.ravanHitFlash--;

      // Update Projectiles (Fiery Arrows & Spark Bullets flying towards Ravan)
      world.projectiles = (world.projectiles || []).filter((proj) => {
        const dx = proj.targetX - proj.x;
        const dy = proj.targetY - proj.y;
        const distToTarget = Math.hypot(dx, dy);

        proj.trail.push({ x: proj.x, y: proj.y });
        if (proj.trail.length > 5) proj.trail.shift();

        if (distToTarget <= proj.speed) {
          // Direct Impact on Ravan effigy!
          soundEngine.playRavanHit();
          world.ravanHitFlash = 9;

          // 1 shot reduces Ravan's HP by exactly 1
          if (proj.isLocal && setRavanHp) {
            setRavanHp((prevHp) => {
              const nextHp = Math.max(0, prevHp - 1);
              try {
                localStorage.setItem('diwali_ravan_hp', nextHp.toString());
              } catch (_) {}
              return nextHp;
            });
          }

          // Floating -1 damage number rising above Ravan showing who hit
          world.floatingTexts.push({
            x: proj.targetX + (Math.random() - 0.5) * 24,
            y: proj.targetY - 20,
            text: `-1 HP ✨ ${proj.shooterName || 'Hero'}`,
            color: proj.type === 'gun' ? '#38bdf8' : '#fef08a',
            alpha: 1.0,
            vy: -1.7,
            life: 50
          });

          // Spark burst particles at impact
          for (let i = 0; i < 22; i++) {
            const theta = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 5;
            world.particles.push(
              new Particle(
                proj.targetX,
                proj.targetY,
                Math.cos(theta) * spd,
                Math.sin(theta) * spd,
                Math.random() > 0.4 ? '#fbbf24' : '#ef4444',
                18 + Math.floor(Math.random() * 14),
                1.8,
                0.06,
                0.95,
                'spark'
              )
            );
          }

          // Subtle impact screen shake
          world.screenShake = { intensity: 2.2, duration: 3 };

          // Broadcast hit event to live peers if local shooter
          if (proj.isLocal && multiplayerManager) {
            multiplayerManager.broadcastRavanHit({
              damage: 1,
              shooterName: p.name || 'Hero',
              weapon: proj.type
            });
          }

          return false; // Remove projectile
        } else {
          proj.x += (dx / distToTarget) * proj.speed;
          proj.y += (dy / distToTarget) * proj.speed;

          // Spark particle trail
          if (Math.random() > 0.35) {
            world.particles.push(
              new Particle(
                proj.x,
                proj.y,
                (Math.random() - 0.5) * 1.2,
                (Math.random() - 0.5) * 1.2,
                proj.type === 'gun' ? '#38bdf8' : '#fde047',
                8 + Math.floor(Math.random() * 6),
                1.2,
                0.02,
                0.98,
                'spark'
              )
            );
          }
          return true;
        }
      });

      // Update Floating Damage Texts
      world.floatingTexts = (world.floatingTexts || []).filter((ft) => {
        ft.y += ft.vy;
        ft.alpha -= 1 / ft.life;
        return ft.alpha > 0;
      });

      // Update Flower Petals (Temple Bell shower)
      world.flowerPetals = (world.flowerPetals || []).filter((pet) => {
        pet.x += pet.vx;
        pet.y += pet.vy;
        pet.rot += pet.vRot;
        pet.life--;
        return pet.life > 0;
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
      const livePeers = remotePlayersRef.current;
      renderGiantFerrisWheel(ctx, world.wheelAngle, isRidingWheel, p, livePeers);

      // D. Carnival Game Stalls: Balloon Shooting, Chai Tapri
      renderCarnivalAttractions(ctx, p);

      // E. Stalls: Cracker Shop, Temple
      renderMelaStalls(ctx, world, p);

      // E2. Shastra Armory Stall (शस्त्रागार - धनुष व बंदूक)
      renderWeaponArmoryStall(ctx, world, p);

      // E3. 10-Headed Ravan Effigy with 10,000,000 Boss HP Bar (रावण दहन)
      renderRavanEffigy(ctx, world, p, ravanHp);

      // F. Rangoli Art Pavilions & Floral Carpet
      renderRangoliArtwork(ctx);

      // G. Unlit & Lit Clay Diyas
      renderDiyas(ctx, world.diyas);

      // H. Hanging Strings of Fairy Lights (Ladiyan)
      renderFairyLights(ctx, world.fairyLights);

      // I. Active Crackers (placed on ground / in air)
      world.activeCrackers.forEach((c) => c.draw(ctx));

      // I2. Active Projectiles (Flying Arrows and Spark Bullets)
      renderProjectiles(ctx, world.projectiles || []);

      // Real Online Players (WebRTC & Cross-Tab Multiplayer)
      if (livePeers && livePeers.size > 0) {
        livePeers.forEach((remPlayer) => {
          if (remPlayer.id === p.id) return; // Skip own player
          const heldCracker = remPlayer.holdingCracker ? (CRACKER_MAP[remPlayer.holdingCracker] || { id: remPlayer.holdingCracker }) : null;
          renderCharacter(ctx, remPlayer, true, false, heldCracker, remPlayer.activeBuffs, remPlayer.isDancing);
        });
      }

      // L. Local Player Character (if not riding wheel)
      if (!isRidingWheel) {
        renderCharacter(ctx, p, false, true, selectedCracker, activeBuffs, isDancing);
      }

      // M. Foreground Firecracker Particles (Sparks, Smoke, Embers)
      world.particles.forEach((pt) => pt.draw(ctx));

      // M2. Floating Damage Texts (-1 HP)
      renderFloatingTexts(ctx, world.floatingTexts || []);

      // M3. Mandir Holy Flower Petals Shower
      renderFlowerPetals(ctx, world.flowerPetals || []);

      // N. Night Sky Floating Lanterns (Kandils)
      renderFloatingLanterns(ctx, world.floatingLanterns);

      // O. Festive Atmospheric Dark Vignette & Dynamic Lighting Overlay (with Full-sky flash on explosion)
      renderNightLightingGlow(ctx, world, p.x, p.y);

      // P. Visual Direction Compass when far from key spots
      renderDirectionGuides(ctx, p);

      ctx.restore();

      // Q. Off-Screen Active Bomb Radar Beacons (so EVERY user sees and tracks ANY bomb in the mela!)
      renderOffScreenBombBeacons(ctx, world, canvas.width, canvas.height, p);

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
    activeBuffs,
    isRidingWheel,
    isDancing,
    ravanHp
  ]);

  // Native non-passive touch drag event listeners for iPhone / iOS Safari
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (e.target.closest('button') || e.target.closest('#fixed-virtual-joystick')) return;
      if (e.touches.length === 0) return;
      e.preventDefault(); // Stop iOS Safari from scrolling or zooming

      const touch = e.touches[0];
      const rect = el.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      if (selectedCracker) {
        // Placement Mode for Phone: track aiming position
        setPlacementPreview({
          screenX: touch.clientX,
          screenY: touch.clientY,
          touchId: touch.identifier
        });
        touchControlRef.current.active = false;
        return;
      }

      touchMovedRef.current = false;
      touchControlRef.current = {
        active: true,
        originX: x,
        originY: y,
        currentX: x,
        currentY: y,
        startX: x,
        startY: y,
        startTime: performance.now(),
        isDragging: false,
        touchId: touch.identifier
      };

      setTouchIndicator({
        originX: touch.clientX,
        originY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY
      });
    };

    const onTouchMove = (e) => {
      if (e.target.closest('#fixed-virtual-joystick')) return;
      e.preventDefault();
      if (e.touches.length === 0) return;

      if (selectedCracker) {
        let touch = null;
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === placementPreview?.touchId) {
            touch = e.touches[i];
            break;
          }
        }
        if (!touch) touch = e.touches[0];
        if (touch) {
          setPlacementPreview({
            screenX: touch.clientX,
            screenY: touch.clientY,
            touchId: touch.identifier
          });
        }
        return;
      }

      if (!touchControlRef.current.active) return;

      let touch = null;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchControlRef.current.touchId) {
          touch = e.touches[i];
          break;
        }
      }
      if (!touch) touch = e.touches[0];
      if (!touch) return;

      const rect = el.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const dist = Math.hypot(x - touchControlRef.current.originX, y - touchControlRef.current.originY);
      if (dist > 8) {
        touchControlRef.current.isDragging = true;
        touchMovedRef.current = true;
      }

      touchControlRef.current.currentX = x;
      touchControlRef.current.currentY = y;

      // Sync fixed joystick knob to touch movement
      const maxR = 30;
      const angle = dist > 0 ? Math.atan2(y - touchControlRef.current.originY, x - touchControlRef.current.originX) : 0;
      const clampedDist = Math.min(dist, maxR);
      setJoystickKnob({
        x: Math.cos(angle) * clampedDist,
        y: Math.sin(angle) * clampedDist,
        active: true
      });

      setTouchIndicator({
        originX: rect.left + touchControlRef.current.originX,
        originY: rect.top + touchControlRef.current.originY,
        currentX: touch.clientX,
        currentY: touch.clientY
      });
    };

    const onTouchEnd = (e) => {
      if (e.target.closest('#fixed-virtual-joystick')) return;
      e.preventDefault();
      lastTouchEndTimeRef.current = performance.now();

      if (selectedCracker) {
        let touch = null;
        if (e.changedTouches && e.changedTouches.length > 0) {
          touch = e.changedTouches[0];
        } else if (e.touches && e.touches.length > 0) {
          touch = e.touches[0];
        }
        if (touch) {
          processCanvasInteraction(touch.clientX, touch.clientY);
        } else if (placementPreview) {
          processCanvasInteraction(placementPreview.screenX, placementPreview.screenY);
        }
        setPlacementPreview(null);
        return;
      }

      const tc = touchControlRef.current;
      if (!tc.active) return;
      const elapsed = performance.now() - tc.startTime;
      const totalDist = Math.hypot(tc.currentX - tc.startX, tc.currentY - tc.startY);
      const wasMoved = touchMovedRef.current || tc.isDragging || totalDist >= 14;

      tc.active = false;
      tc.isDragging = false;
      setTouchIndicator(null);
      setJoystickKnob({ x: 0, y: 0, active: false });

      if (wasMoved) {
        // Drag movement completed: character stays right where he was released!
        playerRef.current.targetX = undefined;
        playerRef.current.targetY = undefined;
        setPlayer((prev) => (prev.targetX !== undefined ? { ...prev, targetX: undefined, targetY: undefined } : prev));
        return;
      }

      // If legitimate tap on phone, walk or interact!
      if (!wasMoved && totalDist < 14) {
        const rect = el.getBoundingClientRect();
        processCanvasInteraction(tc.startX + rect.left, tc.startY + rect.top);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    el.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [selectedCracker, inventory, setSelectedCracker]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        background: '#090815'
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
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

      {/* Fixed On-Screen Festive Virtual Joystick Centered for Mobile, Tablet & Touch Devices */}
      {(isTouchDevice || (typeof window !== 'undefined' && window.innerWidth <= 1024)) && (
        <div
          ref={joystickElRef}
          id="fixed-virtual-joystick"
          onPointerDown={handleJoystickPointerDown}
          onPointerMove={handleJoystickPointerMove}
          onPointerUp={handleJoystickPointerUp}
          onPointerCancel={handleJoystickPointerUp}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
          style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 'max(74px, calc(env(safe-area-inset-bottom) + 68px))',
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, rgba(20, 12, 34, 0.94) 100%)',
            border: '2.5px solid rgba(251, 191, 36, 0.85)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.8), 0 0 24px rgba(245, 158, 11, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            cursor: 'grab'
          }}
          title="Virtual Joystick: Drag to Move Character"
        >
          {/* Directional Arrow Markers */}
          <span style={{ position: 'absolute', top: 5, fontSize: 10, color: '#fef08a', opacity: 0.9, fontWeight: 900, pointerEvents: 'none' }}>▲</span>
          <span style={{ position: 'absolute', bottom: 5, fontSize: 10, color: '#fef08a', opacity: 0.9, fontWeight: 900, pointerEvents: 'none' }}>▼</span>
          <span style={{ position: 'absolute', left: 6, fontSize: 10, color: '#fef08a', opacity: 0.9, fontWeight: 900, pointerEvents: 'none' }}>◄</span>
          <span style={{ position: 'absolute', right: 6, fontSize: 10, color: '#fef08a', opacity: 0.9, fontWeight: 900, pointerEvents: 'none' }}>►</span>

          {/* Decorative dashed golden ring */}
          <div
            style={{
              position: 'absolute',
              inset: 5,
              borderRadius: '50%',
              border: '1px dashed rgba(254, 240, 138, 0.45)',
              pointerEvents: 'none'
            }}
          />

          {/* Golden Diya Flame Joystick Knob */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #ea580c 100%)',
              border: '2.5px solid #ffffff',
              boxShadow: joystickKnob.active
                ? '0 0 24px #fbbf24, 0 6px 14px rgba(0,0,0,0.8)'
                : '0 0 16px rgba(251, 191, 36, 0.7), 0 4px 10px rgba(0,0,0,0.6)',
              transform: `translate(${joystickKnob.x}px, ${joystickKnob.y}px)`,
              transition: joystickKnob.active ? 'none' : 'transform 0.15s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              fontSize: 18
            }}
          >
            🪔
          </div>

          {/* Helper label below joystick so users immediately see how to move */}
          <div
            style={{
              position: 'absolute',
              bottom: -19,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              fontSize: 9,
              fontWeight: 900,
              color: '#fef08a',
              letterSpacing: 0.8,
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              pointerEvents: 'none'
            }}
          >
            🕹️ DRAG TO MOVE
          </div>
        </div>
      )}

      {/* On-screen Ravan Boss Attack & Armory Bar when near Ravan */}
      {Math.hypot(player.x - MELA_ZONES.RAVAN.x, player.y - MELA_ZONES.RAVAN.y) < 480 && (
        <div
          style={{
            position: 'fixed',
            bottom: 'max(195px, calc(env(safe-area-inset-bottom) + 185px))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 55,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            pointerEvents: 'auto'
          }}
        >
          {selectedCracker?.isWeapon ? (
            <button
              id="shoot-ravan-btn"
              onPointerDown={startAutoFire}
              onPointerUp={stopAutoFire}
              onPointerLeave={stopAutoFire}
              onClick={(e) => {
                e.stopPropagation();
                fireWeaponAtRavan();
              }}
              style={{
                background: clickSpeedMultiplier > 1.3
                  ? 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #eab308 100%)'
                  : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #7c2d12 100%)',
                border: clickSpeedMultiplier > 1.3 ? '2.5px solid #ffffff' : '2.5px solid #fbbf24',
                borderRadius: 28,
                padding: '12px 28px',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: clickSpeedMultiplier > 1.3
                  ? '0 0 35px rgba(249, 115, 22, 0.9), 0 8px 25px rgba(0,0,0,0.7)'
                  : '0 0 25px rgba(220, 38, 38, 0.75), 0 8px 25px rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                letterSpacing: 0.5,
                transform: clickSpeedMultiplier > 1.3 ? 'scale(1.04)' : 'scale(1.0)',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation'
              }}
            >
              <span style={{ fontSize: 22 }}>{selectedCracker.id === 'gun' ? '🔫' : '🏹'}</span>
              <span>SHOOT RAVAN (-1 HP)</span>
              {clickSpeedMultiplier > 1.15 && (
                <span
                  style={{
                    fontSize: 10,
                    background: '#7c2d12',
                    color: '#fef08a',
                    padding: '3px 8px',
                    borderRadius: 12,
                    border: '1.5px solid #fde047',
                    fontWeight: 900,
                    letterSpacing: 0.5,
                    boxShadow: '0 0 10px #f59e0b'
                  }}
                >
                  ⚡ SPEED x{clickSpeedMultiplier.toFixed(1)}
                </span>
              )}
            </button>
          ) : (
            <button
              id="buy-weapon-ravan-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenArmory) onOpenArmory();
              }}
              style={{
                background: 'linear-gradient(135deg, #7c2d12 0%, #d97706 100%)',
                border: '2px solid #fef08a',
                borderRadius: 24,
                padding: '10px 22px',
                color: '#fef08a',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.6), 0 4px 15px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>🏹 Buy Bow / Gun in Armory to Shoot Ravan! 🔫</span>
            </button>
          )}
        </div>
      )}

      {/* Mobile Quick Action Button for Touch & Mobile Devices */}
      <div
        style={{
          position: 'fixed',
          right: 'max(14px, env(safe-area-inset-right))',
          bottom: 'max(88px, calc(env(safe-area-inset-bottom) + 78px))',
          zIndex: 45,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          pointerEvents: 'auto'
        }}
      >
        <button
          onPointerDown={selectedCracker?.isWeapon ? startAutoFire : undefined}
          onPointerUp={selectedCracker?.isWeapon ? stopAutoFire : undefined}
          onPointerLeave={selectedCracker?.isWeapon ? stopAutoFire : undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (selectedCracker?.isWeapon) {
              fireWeaponAtRavan();
              return;
            }
            const interacted = checkPlayerProximityInteractions();
            if (!interacted && selectedCracker) {
              const invItem = inventory.find((i) => i.id === selectedCracker.id);
              if (invItem && invItem.count > 0) {
                placeAndIgniteCracker(selectedCracker, playerRef.current.x, playerRef.current.y + 14);
              }
            }
          }}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: selectedCracker?.isWeapon ? '#dc2626' : selectedCracker ? '#ea580c' : 'rgba(23, 14, 38, 0.94)',
            border: selectedCracker?.isWeapon ? '2.5px solid #fef08a' : selectedCracker ? '2.5px solid #fbbf24' : '2px solid rgba(245, 158, 11, 0.5)',
            boxShadow: selectedCracker?.isWeapon
              ? clickSpeedMultiplier > 1.3
                ? '0 6px 25px rgba(249, 115, 22, 0.9), 0 0 20px #fde047'
                : '0 6px 20px rgba(220, 38, 38, 0.7), 0 0 15px #f59e0b'
              : selectedCracker
              ? '0 6px 20px rgba(234, 88, 12, 0.6), 0 0 15px #f59e0b'
              : '0 4px 14px rgba(0,0,0,0.6)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'manipulation'
          }}
          title={selectedCracker?.isWeapon ? `Shoot Ravan (-1 HP)` : selectedCracker ? `Burst ${selectedCracker.name}` : 'Interact / Light Diya'}
        >
          <span style={{ fontSize: 24, lineHeight: 1 }}>{selectedCracker?.isWeapon ? (selectedCracker.icon || '🏹') : selectedCracker ? '🔥' : '🪔'}</span>
          <span style={{ fontSize: 8, fontWeight: 800, color: '#fef08a', marginTop: 2 }}>
            {selectedCracker?.isWeapon ? (clickSpeedMultiplier > 1.3 ? '⚡ RAPID' : 'SHOOT') : selectedCracker ? 'BURST' : 'ACTION'}
          </span>
        </button>
      </div>

      {/* Visual Cracker Placement Aim Reticle (Phone & Touch) */}
      {placementPreview && selectedCracker && (
        <div
          style={{
            position: 'fixed',
            left: placementPreview.screenX,
            top: placementPreview.screenY - 36,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.8))'
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              border: '2.5px solid #fbbf24',
              boxShadow: '0 0 16px #f59e0b, inset 0 0 12px rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)'
            }}
          >
            {selectedCracker.icon}
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#fef08a',
              textShadow: '0 1px 4px #000',
              marginTop: 4,
              backgroundColor: 'rgba(23, 14, 38, 0.85)',
              padding: '2px 8px',
              borderRadius: 10,
              border: '1px solid rgba(251, 191, 36, 0.5)',
              whiteSpace: 'nowrap'
            }}
          >
            Release to place & ignite!
          </span>
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
  ctx.beginPath();
  for (let x = 0; x < world.width; x += tileSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.height);
  }
  for (let y = 0; y < world.height; y += tileSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
  }
  ctx.stroke();

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

  // Ravan Dahan Arena Courtyard (Grand circular festive ring)
  const ravanArenaX = MELA_ZONES.RAVAN.x;
  const ravanArenaY = MELA_ZONES.RAVAN.y;
  ctx.save();
  ctx.fillStyle = 'rgba(69, 10, 10, 0.45)';
  ctx.beginPath();
  ctx.arc(ravanArenaX, ravanArenaY, 170, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Inner sanctum ring
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(ravanArenaX, ravanArenaY, 120, 0, Math.PI * 2);
  ctx.stroke();

  // Arena ground sign
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 13px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔥 रावण दहन अखाड़ा (Ravan Dahan Arena) 🔥', ravanArenaX, ravanArenaY + 155);
  ctx.restore();
}

// -------------------------------------------------------------
// GIANT FERRIS WHEEL (विशाल झूला)
// -------------------------------------------------------------
function renderGiantFerrisWheel(ctx, angle, isRiding, player, remotePlayers = null) {
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

      // Mini turban
      const tCol = player?.outfit?.turban || player?.turbanColor || '#fbbf24';
      ctx.fillStyle = tCol;
      ctx.fillRect(-4, 3, 8, 3);
    } else if (remotePlayers && remotePlayers.size > 0) {
      let peerIdx = 1;
      remotePlayers.forEach((rem) => {
        if (rem.isRidingWheel && i === (peerIdx % spokes)) {
          ctx.fillStyle = rem.color || '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 8, 4, 0, Math.PI * 2);
          ctx.fill();
          const tCol = rem.turbanColor || '#f43f5e';
          ctx.fillStyle = tCol;
          ctx.fillRect(-4, 3, 8, 3);
        }
        peerIdx++;
      });
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
// CARNIVAL ATTRACTIONS: BALLOON SHOOTING, CHAI TAPRI
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

  // 2. Lakshmi-Ganesh Pooja Mandir (Temple)
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
    // Outer glow halo
    ctx.globalAlpha = flicker * 0.35;
    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.arc(l.x, l.y, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright bulb
    ctx.globalAlpha = flicker;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(l.x, l.y, 2.2, 0, Math.PI * 2);
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

  // Consumed Sweet / Chai Aura (both local and remote players!)
  const buffs = isLocal ? activeBuffs : char.activeBuffs;
  if (buffs) {
    if (buffs.jalebi) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#fbbf24';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (buffs.kulhad_chai) {
      const t = performance.now() * 0.005;
      ctx.fillStyle = 'rgba(254, 215, 170, 0.55)';
      ctx.beginPath();
      ctx.arc(Math.sin(t) * 7, -28 - Math.cos(t) * 4, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (buffs.kaju_katli) {
      ctx.fillStyle = '#e2e8f0';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#38bdf8';
      ctx.beginPath();
      ctx.arc(Math.cos(performance.now() * 0.006) * 16, -10, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Floating dance musical notes
  const dancing = isLocal ? isDancing : char.isDancing;
  if (dancing) {
    const t = performance.now() * 0.004;
    ctx.font = '12px serif';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('🎵', -10 + Math.sin(t) * 4, -50);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('🎶', 10 + Math.cos(t) * 4, -54);
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

  // Equipped Weapon or Bomb / Cracker in Hand
  const holding = selectedCracker || (char.holdingCracker ? (CRACKER_MAP[char.holdingCracker] || { id: char.holdingCracker }) : null);

  if (holding) {
    // 1. Phuljhadi (Handheld Sparkler)
    if (holding.id === 'phuljhadi') {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, -4);
      ctx.lineTo(18, -16);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fbbf24';
      ctx.beginPath();
      ctx.arc(18, -16, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    // 2. Ram Dhanush (Divine Bow)
    else if (holding.id === 'bow') {
      ctx.save();
      ctx.translate(12, -4);
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#f59e0b';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 13, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(-Math.PI * 0.45) * 13, Math.sin(-Math.PI * 0.45) * 13);
      ctx.lineTo(Math.cos(Math.PI * 0.45) * 13, Math.sin(Math.PI * 0.45) * 13);
      ctx.stroke();

      // Quiver on back
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-22, -18, 5, 14);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-23, -22, 7, 4);
      ctx.restore();
    }
    // 3. Patakha Gun (Sparkler Blaster)
    else if (holding.id === 'gun') {
      ctx.save();
      ctx.translate(10, -4);
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, -3, 14, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(10, -2, 6, 4);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(2, 2, 4, 6);
      ctx.restore();
    }
    // 4. Sutli Bomb
    else if (holding.id === 'sutlibomb') {
      ctx.save();
      ctx.translate(14, -4);
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#84cc16';
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.roundRect(-6, -6, 12, 12, 3);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-6, -6, 12, 12);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(2, -10);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(2, -10, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // 5. Rocket
    else if (holding.id === 'rocket') {
      ctx.save();
      ctx.translate(13, -5);
      ctx.rotate(-0.35);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-1, 0, 2, 16);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-3, -10, 6, 10);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-4, -10);
      ctx.lineTo(0, -16);
      ctx.lineTo(4, -10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // 6. Generic icon
    else if (holding.icon) {
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText(holding.icon, 15, -4);
    }

    // Overhead equipped item badge
    const badgeText = `${holding.icon || '✨'} ${holding.name || 'Item'}`;
    ctx.font = 'bold 9px "Outfit", sans-serif';
    const btw = ctx.measureText(badgeText).width;
    ctx.fillStyle = 'rgba(23, 16, 36, 0.88)';
    ctx.strokeStyle = holding.isWeapon ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-btw / 2 - 5, -48, btw + 10, 14, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, 0, -37);
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

  // Atmospheric sky flash when any bomb or firework explodes (soft golden bloom, never blinding white screen)
  if (world.skyFlash && world.skyFlash.alpha > 0.005) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = world.skyFlash.color || 'rgba(254, 240, 138, 0.25)';
    ctx.globalAlpha = Math.min(0.28, Math.max(0, world.skyFlash.alpha));
    ctx.fillRect(world.camera.x - 1400, world.camera.y - 1100, 2800, 2200);
    ctx.restore();
    world.skyFlash.alpha -= world.skyFlash.decay || 0.045;
  }

  ctx.restore();
}

function renderDirectionGuides(ctx, player) {
  const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

  const dShop = dist(player.x, player.y, MELA_ZONES.CRACKER_SHOP.x, MELA_ZONES.CRACKER_SHOP.y);
  if (dShop > 520) {
    drawCompassArrow(ctx, player.x, player.y, MELA_ZONES.CRACKER_SHOP.x, MELA_ZONES.CRACKER_SHOP.y, '🧨 Shop', '#ef4444');
  }

  const dRavan = dist(player.x, player.y, MELA_ZONES.RAVAN.x, MELA_ZONES.RAVAN.y);
  if (dRavan > 580) {
    drawCompassArrow(ctx, player.x, player.y, MELA_ZONES.RAVAN.x, MELA_ZONES.RAVAN.y, '👹 Ravan (10M HP)', '#f97316');
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

// -------------------------------------------------------------
// RAVAN EFFIGY & WEAPON ARMORY RENDERERS
// -------------------------------------------------------------

function renderRavanEffigy(ctx, world, player, ravanHp = 10000000) {
  const rx = MELA_ZONES.RAVAN.x;
  const ry = MELA_ZONES.RAVAN.y;
  const isFlashing = (world.ravanHitFlash || 0) > 0;
  const effigyTime = world.effigyTimer || 0;
  const sway = Math.sin(effigyTime * 0.04) * 2.5;

  ctx.save();
  ctx.translate(rx, ry);

  // 1. Scaffold Base Platform & Fire Logs
  ctx.fillStyle = '#3f1a0a';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-80, 10, 160, 26, 6);
  ctx.fill();
  ctx.stroke();

  // Wooden Log Stakes
  ctx.fillStyle = '#78350f';
  for (let lx = -70; lx <= 70; lx += 22) {
    ctx.fillRect(lx - 3, -15, 6, 26);
  }

  // Earthen Diyas around scaffold base
  [-75, -45, -15, 15, 45, 75].forEach((dx) => {
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(dx, 10, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(dx, 6 + Math.sin(effigyTime * 0.1 + dx) * 1.5, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Festive Cracker Bundles strapped at base (Ladi & Rockets)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(-60, -10, 26, 20);
  ctx.fillRect(34, -10, 26, 20);
  ctx.fillStyle = '#fef08a';
  ctx.font = '10px monospace';
  ctx.fillText('🧨🧨', -58, 4);
  ctx.fillText('🧨🧨', 36, 4);

  // 2. Effigy Body (Sways with wind/breathing)
  ctx.save();
  ctx.translate(sway, 0);

  if (isFlashing) {
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#fbbf24';
  }

  // Legs / Lower robes
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(-42, -5);
  ctx.lineTo(42, -5);
  ctx.lineTo(50, 10);
  ctx.lineTo(-50, 10);
  ctx.closePath();
  ctx.fill();

  // Royal Pleated Skirt (Red & Gold)
  ctx.fillStyle = isFlashing ? '#ffffff' : '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(-46, -60);
  ctx.lineTo(46, -60);
  ctx.lineTo(54, -5);
  ctx.lineTo(-54, -5);
  ctx.closePath();
  ctx.fill();

  // Gold vertical pleated stripes
  ctx.fillStyle = '#fbbf24';
  for (let s = -40; s <= 40; s += 12) {
    ctx.fillRect(s - 1, -60, 3, 55);
  }

  // Golden Waist Sash & Demon Belt Buckle
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-48, -68, 96, 12);
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(0, -62, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Torso / Royal Kurta (Dark Purple with Golden Embroidery)
  ctx.fillStyle = isFlashing ? '#fef08a' : '#3b0764';
  ctx.beginPath();
  ctx.roundRect(-40, -135, 80, 70, 8);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Cross-body Garland of Crackers (Ladi on chest)
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-34, -130);
  ctx.lineTo(34, -70);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(34, -130);
  ctx.lineTo(-34, -70);
  ctx.stroke();

  // Golden Royal Haar (Necklace with Red Gem)
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -132, 20, 0, Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(0, -112, 7, 0, Math.PI * 2);
  ctx.fill();

  // Arms and Weapons
  // Left Hand: Giant Golden Shield
  ctx.fillStyle = '#854d0e';
  ctx.beginPath();
  ctx.roundRect(-75, -115, 14, 50, 6);
  ctx.fill();

  ctx.save();
  ctx.translate(-82, -98);
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#eab308';
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Shield Sun Emblem
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right Hand: Curved Chandrahas Sword (खड्ग)
  ctx.fillStyle = '#854d0e';
  ctx.beginPath();
  ctx.roundRect(61, -115, 14, 50, 6);
  ctx.fill();

  ctx.save();
  ctx.translate(78, -98);
  // Golden Hilt
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-4, 0, 8, 20);
  ctx.fillRect(-12, 0, 24, 6);
  // Curved Silver Blade pointing up
  ctx.fillStyle = '#f1f5f9';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.quadraticCurveTo(12, -40, 20, -70);
  ctx.quadraticCurveTo(6, -52, -3, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 3. Ten Heads of Ravan (दशानन)
  const headOffsets = [
    { x: -74, y: -138, scale: 0.65 },
    { x: -55, y: -145, scale: 0.72 },
    { x: -37, y: -152, scale: 0.8 },
    { x: -18, y: -158, scale: 0.9 },
    { x: 3, y: -162, scale: 1.18, isMain: true }, // Main Demon King Center Head
    { x: 24, y: -158, scale: 0.9 },
    { x: 43, y: -152, scale: 0.8 },
    { x: 61, y: -145, scale: 0.72 },
    { x: 78, y: -138, scale: 0.65 },
    { x: 93, y: -131, scale: 0.58 }
  ];

  headOffsets.forEach((h) => {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.scale(h.scale, h.scale);

    // Demon Face Complexion
    ctx.fillStyle = h.isMain ? '#065f46' : '#047857';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#022c22';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Red Demon Tilak on Forehead
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(3, -6);
    ctx.lineTo(0, -3);
    ctx.lineTo(-3, -6);
    ctx.closePath();
    ctx.fill();

    // Glowing Demon Eyes
    const eyeGlow = 6 + Math.sin(effigyTime * 0.1) * 3;
    ctx.shadowBlur = eyeGlow;
    ctx.shadowColor = '#ef4444';
    ctx.fillStyle = '#fee2e2';
    ctx.beginPath();
    ctx.arc(-5, -2, 2.6, 0, Math.PI * 2);
    ctx.arc(5, -2, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(-5, -2, 1.3, 0, Math.PI * 2);
    ctx.arc(5, -2, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Demon Curled Moustache
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-8, 5);
    ctx.quadraticCurveTo(0, 2, 8, 5);
    ctx.stroke();

    // White Demon Tusks on main head
    if (h.isMain) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-6, 5);
      ctx.lineTo(-8, 9);
      ctx.lineTo(-5, 6);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(6, 5);
      ctx.lineTo(8, 9);
      ctx.lineTo(5, 6);
      ctx.closePath();
      ctx.fill();
    }

    // Golden Mukut (Crown)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-12, -9);
    ctx.lineTo(-8, -24);
    ctx.lineTo(0, -30);
    ctx.lineTo(8, -24);
    ctx.lineTo(12, -9);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Crown Ruby Jewel
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -18, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  ctx.restore(); // End sway

  // 4. FLOATING BOSS HEALTH BAR (10,000,000 HP)
  ctx.save();
  const barW = 350;
  const barH = 52;
  const barX = -barW / 2;
  const barY = -245;

  // Outer Glowing Border Container
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#ef4444';
  ctx.fillStyle = 'rgba(15, 10, 24, 0.94)';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Boss Title
  ctx.font = 'bold 13px "Cinzel", serif';
  ctx.fillStyle = '#fef08a';
  ctx.textAlign = 'center';
  ctx.fillText('👹 लंकापति दशानन रावण (Ravan) • 10 Heads', 0, barY + 17);

  // HP Gauge Track
  const trackW = barW - 32;
  const trackH = 14;
  const trackX = barX + 16;
  const trackY = barY + 26;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(trackX, trackY, trackW, trackH, 7);
  ctx.fill();
  ctx.stroke();

  // HP Gauge Fill
  const hpRatio = Math.max(0, Math.min(1.0, ravanHp / 10000000));
  const fillW = Math.max(4, trackW * hpRatio);

  const hpGrad = ctx.createLinearGradient(trackX, trackY, trackX + trackW, trackY);
  hpGrad.addColorStop(0, '#dc2626');
  hpGrad.addColorStop(0.7, '#ea580c');
  hpGrad.addColorStop(1, '#f59e0b');

  ctx.fillStyle = hpGrad;
  ctx.beginPath();
  ctx.roundRect(trackX, trackY, fillW, trackH, 7);
  ctx.fill();

  // HP Numbers & Percentage
  const formattedHp = ravanHp.toLocaleString('en-IN');
  const percentStr = (hpRatio * 100).toFixed(4) + '%';
  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 4;
  ctx.shadowColor = '#000000';
  ctx.fillText(`HP: ${formattedHp} / 10,000,000 (${percentStr})`, 0, trackY + 11);
  ctx.shadowBlur = 0;

  // Subtitle / Raid hint
  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('🏹 1 Shot = -1 HP • Shoot with Ram Dhanush or Gun 🔫', 0, barY + 65);

  ctx.restore();

  ctx.restore();
}

function renderWeaponArmoryStall(ctx, world, player) {
  const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);
  const stallX = MELA_ZONES.WEAPON_STALL.x;
  const stallY = MELA_ZONES.WEAPON_STALL.y;
  const isNear = dist(player.x, player.y, stallX, stallY) < 140;

  ctx.save();
  ctx.translate(stallX, stallY);

  // Tent Body
  ctx.fillStyle = '#451a03';
  ctx.strokeStyle = isNear ? '#fbbf24' : '#b45309';
  ctx.lineWidth = isNear ? 4 : 2;
  ctx.beginPath();
  ctx.roundRect(-100, -80, 200, 130, 12);
  ctx.fill();
  ctx.stroke();

  // Striped Canopy Awning (Maroon & Saffron)
  for (let s = 0; s < 8; s++) {
    ctx.fillStyle = s % 2 === 0 ? '#b91c1c' : '#f59e0b';
    ctx.fillRect(-100 + s * 25, -80, 25, 26);
  }

  // Stall Title
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 15px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏹 दिव्य शस्त्रागार (Armory) 🔫', 0, -32);

  ctx.font = '11px "Outfit", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('Weapons to Defeat 10M HP Ravan', 0, -16);

  // Wooden Display Table
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-85, 12, 170, 22);

  // Display Bow and Gun
  ctx.font = '22px sans-serif';
  ctx.fillText('🏹', -45, 30);
  ctx.fillText('🔫', 45, 30);
  ctx.fillText('🎯', 0, 30);

  // Proximity Hint
  if (isNear) {
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#fbbf24';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.fillText('✨ [ Click or Press E ] Open Weapon Armory', 0, 70);
  }

  ctx.restore();
}

function renderProjectiles(ctx, projectiles) {
  if (!projectiles || projectiles.length === 0) return;

  projectiles.forEach((proj) => {
    ctx.save();
    const angle = Math.atan2(proj.targetY - proj.y, proj.targetX - proj.x);
    ctx.translate(proj.x, proj.y);
    ctx.rotate(angle);

    const mult = proj.speedMultiplier || 1.0;

    if (proj.type === 'gun') {
      // High-velocity Festive Spark Bullet
      const trailLength = 16 * Math.min(2.5, mult);
      ctx.shadowBlur = Math.round(18 * Math.min(2.0, mult));
      ctx.shadowColor = mult > 1.3 ? '#f97316' : '#38bdf8';

      // Outer supersonic energy trail
      ctx.fillStyle = mult > 1.3 ? 'rgba(249, 115, 22, 0.55)' : 'rgba(56, 189, 248, 0.45)';
      ctx.beginPath();
      ctx.ellipse(-trailLength / 2, 0, trailLength, 5 * Math.min(1.4, mult), 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5 * Math.min(1.4, mult), 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = mult > 1.3 ? '#fbbf24' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(2, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Golden Divine Arrow (Ram Dhanush)
      const shaftLen = 22 * Math.min(1.8, mult);
      ctx.shadowBlur = Math.round(14 * Math.min(2.0, mult));
      ctx.shadowColor = mult > 1.3 ? '#ef4444' : '#f59e0b';

      // Supersonic arrow streak when fast
      if (mult > 1.2) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-shaftLen * 1.5, 0);
        ctx.lineTo(-shaftLen, 0);
        ctx.stroke();
      }

      // Arrow Shaft (Golden line)
      ctx.strokeStyle = mult > 1.3 ? '#ffffff' : '#fde047';
      ctx.lineWidth = 2.5 * Math.min(1.4, mult);
      ctx.beginPath();
      ctx.moveTo(-shaftLen, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();

      // Arrowhead (Fiery gold triangle)
      ctx.fillStyle = mult > 1.3 ? '#f97316' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(14 * Math.min(1.3, mult), 0);
      ctx.lineTo(6, -5 * Math.min(1.3, mult));
      ctx.lineTo(8, 0);
      ctx.lineTo(6, 5 * Math.min(1.3, mult));
      ctx.closePath();
      ctx.fill();

      // Feathers at nock
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-shaftLen, 0);
      ctx.lineTo(-shaftLen - 4, -4);
      ctx.lineTo(-shaftLen + 4, 0);
      ctx.lineTo(-shaftLen - 4, 4);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  });
}

function renderFloatingTexts(ctx, floatingTexts) {
  if (!floatingTexts || floatingTexts.length === 0) return;

  floatingTexts.forEach((ft) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.font = 'bold 16px "Cinzel", serif';
    ctx.fillStyle = ft.color || '#fef08a';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });
}

function renderFlowerPetals(ctx, petals) {
  if (!petals || petals.length === 0) return;
  ctx.save();
  petals.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color || '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

function renderOffScreenBombBeacons(ctx, world, canvasW, canvasH, player) {
  if (!world.activeCrackers || world.activeCrackers.length === 0) return;

  const camX = world.camera.x;
  const camY = world.camera.y;
  const zoom = world.cameraZoom || 1.0;

  world.activeCrackers.forEach((c) => {
    if (c.state === 'DONE') return;

    // Convert world (c.x, c.y) to screen coordinates
    const sx = (c.x - camX) * zoom + canvasW / 2;
    const sy = (c.y - camY) * zoom + canvasH / 2;

    // Margin from screen edges
    const margin = 48;
    const isOnScreen = sx >= margin && sx <= canvasW - margin && sy >= margin && sy <= canvasH - margin;
    if (isOnScreen) return; // Already visible within screen viewport!

    // Off-screen: Clamp radar beacon pill to screen border
    const edgeMarginX = 85;
    const edgeMarginY = 60;
    const angle = Math.atan2(sy - canvasH / 2, sx - canvasW / 2);

    const bx = Math.max(edgeMarginX, Math.min(canvasW - edgeMarginX, canvasW / 2 + Math.cos(angle) * (canvasW / 2 - edgeMarginX)));
    const by = Math.max(edgeMarginY, Math.min(canvasH - edgeMarginY, canvasH / 2 + Math.sin(angle) * (canvasH / 2 - edgeMarginY)));

    const dist = Math.round(Math.hypot(c.x - player.x, c.y - player.y) / 10);
    const isFuse = c.state === 'FUSE';
    const fuseSec = Math.max(0, c.fuseTime / 60).toFixed(1);
    const icon = c.data?.icon || '💣';
    const status = isFuse ? `⏳ ${fuseSec}s` : '💥 BURST!';

    ctx.save();
    ctx.translate(bx, by);

    const pulse = Math.sin(performance.now() * 0.009) * 0.2 + 0.8;
    ctx.shadowBlur = isFuse ? 12 : 22;
    ctx.shadowColor = isFuse ? '#f59e0b' : '#ef4444';

    const text = `${icon} ${c.placedBy || 'Friend'}: ${status} (${dist}m)`;
    ctx.font = 'bold 11px "Outfit", sans-serif';
    const tw = ctx.measureText(text).width;
    const bw = tw + 22;
    const bh = 24;

    ctx.fillStyle = isFuse ? 'rgba(23, 16, 36, 0.94)' : 'rgba(88, 12, 12, 0.96)';
    ctx.strokeStyle = isFuse ? `rgba(245, 158, 11, ${pulse})` : `rgba(239, 68, 68, ${pulse})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 12);
    ctx.fill();
    ctx.stroke();

    // Direction arrow pointer attached to the pill pointing towards the bomb
    ctx.save();
    ctx.translate(Math.cos(angle) * (bw / 2 + 7), Math.sin(angle) * (bh / 2 + 3));
    ctx.rotate(angle);
    ctx.fillStyle = isFuse ? '#fbbf24' : '#ef4444';
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(-5, -5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.shadowBlur = 0;
    ctx.fillStyle = isFuse ? '#fef08a' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);

    ctx.restore();
  });
}
