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
  DJ_FLOOR: { x: 2500, y: 950, name: 'The Big Club (द बिग क्लब - VIP Lounge & Arena)' },
  RAVAN_GATE: { x: 1380, y: 980, name: 'Ravan Arena Gate (रावण दहन द्वार)' },
  RAVAN: { x: 1550, y: 980, name: 'Ravan Dahan Ground (रावण दहन - 10M HP)' },
  WEAPON_STALL: { x: 1240, y: 880, name: 'Shastra Armory (शस्त्रागार)' },
  NEW_GROUND_GATE: { x: 1850, y: 470, name: 'East Gate (पूर्व द्वार)' },
  UTSAV_CHOWK: { x: 2500, y: 470, name: 'Grand Utsav Chowk (महा उत्सव चौक)' },
  NORTH_PAVILION: { x: 2500, y: 220, name: 'North Rangoli Pavilion (उत्तर मंडप)' },
  BIG_CLUB: { x: 2500, y: 950, name: 'The Big Club (द बिग क्लब - VIP Lounge & Arena)' },
  SOUTH_ARENA: { x: 2500, y: 950, name: 'The Big Club (द बिग क्लब)' },
  EAST_TERRACE: { x: 3200, y: 470, name: 'East Viewing Terrace (पूर्व दर्शन मंडप)' }
};

// Dynamic Dance Steps with energetic hand & body choreographies
export const DANCE_STEPS = [
  { id: 'bhangra', name: 'Bhangra Dholak Jump', hindi: 'भांगड़ा स्टेप', icon: '🕺' },
  { id: 'bollywood', name: 'Bollywood Thumka', hindi: 'बॉलीवुड ठुमका', icon: '💃' },
  { id: 'mega_jump', name: 'Sky Rocket Mega Jump', hindi: 'तूफानी ऊंची छलांग', icon: '🚀' },
  { id: 'naagin', name: 'Iconic Naagin Dance', hindi: 'नागिन बीन धुन', icon: '🐍' },
  { id: 'disco', name: 'Disco Saturday Night', hindi: 'डिस्को स्टार', icon: '✨' },
  { id: 'wave', name: 'Party Concert Wave', hindi: 'हैंड्स इन द एयर', icon: '🙌' },
  { id: 'hiphop', name: 'Desi Hip-Hop Shuffle', hindi: 'हिप-हॉप शफल', icon: '🔥' }
];

// 10 Chairs and 3 Tables at Sharma Ji Chai Tapri
export const CHAI_TABLES = [
  { id: 'table_0', x: 280, y: 535, radius: 24, name: 'Table 1' },
  { id: 'table_1', x: 380, y: 550, radius: 27, name: 'Table 2 (Center)' },
  { id: 'table_2', x: 480, y: 535, radius: 24, name: 'Table 3' }
];

export const CHAI_CHAIRS = [
  // Table 1 (Left - 3 chairs)
  { id: 'chair_0', x: 246, y: 535, facing: 'right', tableIndex: 0 },
  { id: 'chair_1', x: 280, y: 572, facing: 'up', tableIndex: 0 },
  { id: 'chair_2', x: 314, y: 535, facing: 'left', tableIndex: 0 },

  // Table 2 (Center - 4 chairs)
  { id: 'chair_3', x: 340, y: 550, facing: 'right', tableIndex: 1 },
  { id: 'chair_4', x: 380, y: 592, facing: 'up', tableIndex: 1 },
  { id: 'chair_5', x: 420, y: 550, facing: 'left', tableIndex: 1 },
  { id: 'chair_6', x: 380, y: 508, facing: 'down', tableIndex: 1 },

  // Table 3 (Right - 3 chairs)
  { id: 'chair_7', x: 446, y: 535, facing: 'right', tableIndex: 2 },
  { id: 'chair_8', x: 480, y: 572, facing: 'up', tableIndex: 2 },
  { id: 'chair_9', x: 514, y: 535, facing: 'left', tableIndex: 2 }
];

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
  onOpenDjJukebox,
  ravanHp = 10000000,
  setRavanHp,
  onRavanShot,
  onTalkToNpc,
  remotePlayers,
  multiplayerManager,
  screenShake,
  setScreenShake,
  activeBuffs,
  setActiveBuffs,
  onChaiDrank,
  onDiyaLit,
  onCrackerBurst,
  isDancing,
  setIsDancing,
  danceStep = 0,
  setDanceStep,
  gunFight = null,
  onChallengePlayer,
  onDuelHit,
  onTakeDuelDamage
}) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isRidingWheel, setIsRidingWheel] = useState(false);
  const [sittingChair, setSittingChair] = useState(null);
  const [placementPreview, setPlacementPreview] = useState(null);
  const [clickSpeedMultiplier, setClickSpeedMultiplier] = useState(1.0);
  const [gateNotice, setGateNotice] = useState(null);
  const [currentDjTrack, setCurrentDjTrack] = useState(() => soundEngine.getCurrentHoneySinghTrack?.());
  const autoFireIntervalRef = useRef(null);
  const speedResetTimeoutRef = useRef(null);
  const danceTimeoutRef = useRef(null);

  // Fresh refs for Gun Fight state
  const gunFightRef = useRef(gunFight);
  gunFightRef.current = gunFight;
  const onDuelHitRef = useRef(onDuelHit);
  onDuelHitRef.current = onDuelHit;
  const onTakeDuelDamageRef = useRef(onTakeDuelDamage);
  onTakeDuelDamageRef.current = onTakeDuelDamage;

  // Fresh refs for dance states to avoid stale closure freeze in requestAnimationFrame
  const isDancingRef = useRef(isDancing);
  isDancingRef.current = isDancing;
  const danceStepRef = useRef(danceStep);
  danceStepRef.current = danceStep;
  const setIsDancingRef = useRef(setIsDancing);
  setIsDancingRef.current = setIsDancing;
  const setDanceStepRef = useRef(setDanceStep);
  setDanceStepRef.current = setDanceStep;

  // Receive incoming opponent shots over WebRTC
  useEffect(() => {
    const handleOpponentShot = (e) => {
      const data = e.detail;
      if (!data) return;
      soundEngine.init();
      soundEngine.playGunShot?.(1.4);
      worldRef.current.projectiles.push({
        id: data.id || `opp_shot_${Date.now()}`,
        x: data.startX,
        y: data.startY,
        startX: data.startX,
        startY: data.startY,
        targetX: data.targetX,
        targetY: data.targetY,
        speed: 36,
        speedMultiplier: 1.5,
        type: 'gun',
        damage: data.damage || 20,
        shooterName: gunFightRef.current?.opponentName || 'Opponent',
        color: '#f43f5e',
        trail: [],
        isLocal: false,
        isDuel: true,
        isOpponentShot: true
      });
    };
    window.addEventListener('opponentDuelShot', handleOpponentShot);
    return () => window.removeEventListener('opponentDuelShot', handleOpponentShot);
  }, []);

  useEffect(() => {
    const handleTrackChange = (e) => {
      if (e.detail) setCurrentDjTrack(e.detail);
    };
    window.addEventListener('honeySinghTrackChanged', handleTrackChange);
    return () => window.removeEventListener('honeySinghTrackChanged', handleTrackChange);
  }, []);

  // Visual star burst feedback whenever dance step automatically rotates
  const prevDanceStepRef = useRef(danceStep);
  useEffect(() => {
    if (isDancing && prevDanceStepRef.current !== danceStep) {
      prevDanceStepRef.current = danceStep;
      const p = playerRef.current;
      const world = worldRef.current;
      if (p && world) {
        const partyCols = ['#ec4899', '#facc15', '#06b6d4', '#10b981', '#f43f5e', '#a855f7'];
        for (let i = 0; i < 18; i++) {
          world.particles.push(
            new Particle(
              p.x + (Math.random() - 0.5) * 24,
              p.y - 14 + (Math.random() - 0.5) * 16,
              (Math.random() - 0.5) * 3.2,
              -Math.random() * 3.5 - 1.2,
              partyCols[Math.floor(Math.random() * partyCols.length)],
              28 + Math.floor(Math.random() * 16),
              2.2,
              0.05,
              0.96,
              'star'
            )
          );
        }
      }
    } else {
      prevDanceStepRef.current = danceStep;
    }
  }, [danceStep, isDancing]);

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
    width: 3600,
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
      { id: 16, x: 1040, y: 1100, isLit: true },
      // New Fairground Earthen Diyas
      { id: 17, x: 2430, y: 410, isLit: false },
      { id: 18, x: 2570, y: 410, isLit: true },
      { id: 19, x: 2430, y: 530, isLit: true },
      { id: 20, x: 2570, y: 530, isLit: false },
      { id: 21, x: 2400, y: 220, isLit: true },
      { id: 22, x: 2600, y: 220, isLit: false },
      { id: 23, x: 2420, y: 880, isLit: false },
      { id: 24, x: 2580, y: 880, isLit: true }
    ],
    // Hanging fairy lights
    fairyLights: [],
    // Floating sky lanterns
    floatingLanterns: [],
    // NPCs walking in world (Removed fake NPCs - only real live players)
    npcs: [],
    // 10 Chairs and 3 Tables at Sharma Ji Chai Tapri
    chaiChairs: CHAI_CHAIRS.map((c) => ({ ...c, occupiedBy: null, hasChai: false })),
    chaiTables: CHAI_TABLES.map((t) => ({ ...t, hasChai: false })),
    // Dedicated Chai Server (Chhotu) coming from Sharma Ji shop
    chaiServer: {
      x: 380,
      y: 440,
      startX: 380,
      startY: 440,
      targetX: 380,
      targetY: 440,
      targetChair: null,
      phase: 'IDLE', // 'IDLE', 'COMING', 'SERVING', 'RETURNING'
      walkFrame: 0,
      serveTimer: 0,
      bubble: null,
      facing: 'down'
    },
    // The Big Club (VIP Mega Nightclub in Second Ground)
    bigClub: {
      x: 2500,
      y: 950,
      djX: 2500,
      djY: 1070,
      bubble: '🔥 DJ ROHIT: "Drop the bass! Welcome to The Big Club! 🔊✨"',
      bubbleTimer: 0,
      scratchAngle: 0,
      dancers: [
        { id: 'bc_d1', name: 'Kabir', x: 2420, y: 910, color: '#f43f5e', outfit: { top: '#f43f5e', bottom: '#0f172a' }, danceStyle: 'hiphop' },
        { id: 'bc_d2', name: 'Aanya', x: 2580, y: 910, color: '#06b6d4', outfit: { top: '#06b6d4', bottom: '#f8fafc' }, danceStyle: 'techno' },
        { id: 'bc_d3', name: 'Vikram', x: 2450, y: 970, color: '#a855f7', outfit: { top: '#a855f7', bottom: '#1e293b' }, danceStyle: 'bhangra' },
        { id: 'bc_d4', name: 'Rhea', x: 2550, y: 970, color: '#fbbf24', outfit: { top: '#fbbf24', bottom: '#831843' }, danceStyle: 'party' }
      ]
    },
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
      // Note: Arrow / weapon sounds are heard by the shooter only, not broadcast to everyone

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
        damage: data.damage || 100,
        shooterName: data.shooterName || 'Warrior',
        color: data.color || (data.weaponId === 'gun' ? '#38bdf8' : '#fbbf24'),
        trail: [],
        isRemote: true
      });
    });

    // 3. Ravan Hit & Boss Impact from any user
    const unsubRavanHit = multiplayerManager.onRavanHit((data) => {
      if (!data) return;
      // Visual hit flash and spark particles for all players; impact sound heard by shooter only
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

      // Floating damage number
      const damageVal = data.damage || 100;
      worldRef.current.floatingTexts.push({
        x: rx,
        y: ry - 20,
        text: `-${damageVal} HP ✨ ${data.shooterName || 'Hero'}`,
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
        // Note: Candle/diya lighting sound is heard by the acting user only, not broadcast to everyone.
        // Visual sparkles and floating notification remain for all players.

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
      // Note: Temple bell ring sound is heard by the user only, not everyone; visual flower petals and text remain
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

      // If sitting on chair, any movement key or Space/E/Esc stands player up!
      if (playerRef.current.isSitting) {
        const k = e.key.toLowerCase();
        if (
          k === 'e' ||
          e.code === 'Space' ||
          k === 'w' ||
          k === 'a' ||
          k === 's' ||
          k === 'd' ||
          e.key.startsWith('Arrow') ||
          k === 'escape'
        ) {
          standUpFromChair();
          return;
        }
      }

      if (e.key.toLowerCase() === 'e' || e.code === 'Space' || e.key.toLowerCase() === 'f') {
        // East Gate (New Ground) Proximity Pass
        const dEastGate = Math.hypot(playerRef.current.x - MELA_ZONES.NEW_GROUND_GATE.x, playerRef.current.y - MELA_ZONES.NEW_GROUND_GATE.y);
        if (dEastGate < 80) {
          const isEast = playerRef.current.x >= 1850;
          const tx = isEast ? 1790 : 1910;
          playerRef.current.targetX = tx;
          playerRef.current.targetY = 470;
          playerRef.current.isMoving = true;
          setPlayer((prev) => ({ ...prev, targetX: tx, targetY: 470, isMoving: true }));
          soundEngine.playGatePass?.();
          setGateNotice({
            text: isEast ? '🏮 Entered Main Mela Fairground!' : '✨ Entered New Ground (नया मैदान)!',
            time: Date.now()
          });
          return;
        }

        const dGate = Math.hypot(playerRef.current.x - MELA_ZONES.RAVAN_GATE.x, playerRef.current.y - MELA_ZONES.RAVAN_GATE.y);
        if (dGate < 65) {
          const isInside = playerRef.current.x >= 1380;
          const tx = isInside ? 1320 : 1445;
          playerRef.current.targetX = tx;
          playerRef.current.targetY = 980;
          playerRef.current.isMoving = true;
          setPlayer((prev) => ({ ...prev, targetX: tx, targetY: 980, isMoving: true }));
          soundEngine.playGatePass?.();
          setGateNotice({
            text: isInside ? '🚪 Exited Ravan Arena' : '⚔️ Entered Ravan Arena! Tap Ravan or Press Space to Attack!',
            time: Date.now()
          });
          return;
        }

        const dRavan = Math.hypot(playerRef.current.x - MELA_ZONES.RAVAN.x, playerRef.current.y - MELA_ZONES.RAVAN.y);
        const hasWeapon = selectedCracker?.isWeapon || selectedCracker?.id === 'bow' || selectedCracker?.id === 'gun';
        if (dRavan <= 185 && hasWeapon) {
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

      // V key toggles festive dance; X key manually skips to next dance step
      if (e.key.toLowerCase() === 'v') {
        triggerFestiveDance(false);
      } else if (e.key.toLowerCase() === 'x') {
        triggerFestiveDance(true);
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

  // Dance emote helper (Automatically cycles through dynamic dance steps!)
  const triggerFestiveDance = (advanceOnly = false) => {
    // If already dancing and not explicitly skipping to next move, toggle OFF
    if (isDancingRef.current && !advanceOnly) {
      if (setIsDancingRef.current) setIsDancingRef.current(false);
      if (danceTimeoutRef.current) clearTimeout(danceTimeoutRef.current);
      if (multiplayerManager) {
        multiplayerManager.broadcastPlayerDance({ isDancing: false, playerName: playerRef.current.name });
      }
      return;
    }

    if (setIsDancingRef.current) setIsDancingRef.current(true);
    if (advanceOnly && setDanceStepRef.current) {
      setDanceStepRef.current((prev) => {
        const next = (prev + 1) % DANCE_STEPS.length;
        if (multiplayerManager) {
          multiplayerManager.broadcastPlayerDance({ isDancing: true, playerName: playerRef.current.name, danceStep: next });
        }
        return next;
      });
    }
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
    const weapon = hasWeapon ? selectedCracker : (CRACKER_MAP['bow'] || { id: 'bow', name: 'Ram Dhanush', isWeapon: true, damage: 100 });

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
    const projDamage = weapon.damage || 100;

    world.projectiles.push({
      id: projId,
      x: p.x,
      y: p.y - 18,
      startX: p.x,
      startY: p.y - 18,
      targetX,
      targetY,
      speed: computedSpeed,
      speedMultiplier: finalMultiplier,
      type: weapon.id,
      damage: projDamage,
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
        damage: projDamage,
        startX: p.x,
        startY: p.y - 18,
        targetX,
        targetY,
        speed: computedSpeed,
        speedMultiplier: finalMultiplier,
        color: projColor
      });
    }

    if (onRavanShot) onRavanShot(weapon.id);
  };

  // Fire Festive Spark Bullet in PvP Gun Fight Duel
  const fireDuelGunShot = (targetX, targetY) => {
    soundEngine.init();
    soundEngine.playGunShot?.(1.3 + Math.random() * 0.3);
    const p = playerRef.current;
    const world = worldRef.current;
    const projId = `duel_proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    let destX = targetX;
    let destY = targetY;

    // Find opponent position
    let oppPos = null;
    if (gunFightRef.current?.opponentId === 'npc_veer') {
      oppPos = { x: 1180, y: 880, name: 'Veer (Gun Master 🤠)' };
    } else if (remotePlayersRef.current) {
      const rem = remotePlayersRef.current.get(gunFightRef.current?.opponentId);
      if (rem) oppPos = { x: rem.x, y: rem.y, name: rem.name || 'Opponent' };
    }

    if (!destX || !destY || (Math.hypot(destX - p.x, destY - p.y) < 25 && oppPos)) {
      if (oppPos) {
        destX = oppPos.x + (Math.random() - 0.5) * 16;
        destY = oppPos.y + (Math.random() - 0.5) * 16;
      } else {
        destX = p.x + 120;
        destY = p.y;
      }
    }

    world.projectiles.push({
      id: projId,
      x: p.x,
      y: p.y - 18,
      startX: p.x,
      startY: p.y - 18,
      targetX: destX,
      targetY: destY,
      speed: 36,
      speedMultiplier: 1.5,
      type: 'gun',
      damage: 20,
      shooterName: p.name || 'Hero',
      color: '#38bdf8',
      trail: [],
      isLocal: true,
      isDuel: true,
      duelOpponentId: gunFightRef.current?.opponentId
    });

    if (multiplayerManager && gunFightRef.current?.opponentId !== 'npc_veer') {
      multiplayerManager.broadcastGunFightShot({
        id: projId,
        shooterId: p.id,
        startX: p.x,
        startY: p.y - 18,
        targetX: destX,
        targetY: destY,
        damage: 20
      });
    }
  };

  // Continuous rapid auto-fire when holding down
  const startAutoFire = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (gunFightRef.current?.status === 'ACTIVE') {
      fireDuelGunShot();
      if (autoFireIntervalRef.current) clearInterval(autoFireIntervalRef.current);
      autoFireIntervalRef.current = setInterval(() => {
        fireDuelGunShot();
      }, 150);
      return;
    }
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

  const sitDownOnChair = (chair) => {
    if (!chair) return;
    const p = playerRef.current;

    p.isSitting = true;
    p.sittingChairId = chair.id;
    p.x = chair.x;
    p.y = chair.y;
    p.isMoving = false;
    p.targetX = undefined;
    p.targetY = undefined;
    p.targetChairToSit = undefined;
    setSittingChair(chair);
    setPlayer((prev) => ({
      ...prev,
      isSitting: true,
      sittingChairId: chair.id,
      x: chair.x,
      y: chair.y,
      isMoving: false
    }));

    const world = worldRef.current;
    if (world.chaiChairs) {
      world.chaiChairs.forEach((c) => {
        if (c.id === chair.id) c.occupiedBy = p.id || 'local';
      });
    }

    soundEngine.playDiyaLight?.();

    // Trigger Chai Server Chhotu from shop counter to walk over!
    const server = world.chaiServer;
    if (server) {
      server.phase = 'COMING';
      server.targetChair = chair;
      server.targetX = chair.x + (chair.facing === 'right' ? -22 : chair.facing === 'left' ? 22 : 0);
      server.targetY = chair.y + (chair.facing === 'up' ? 20 : chair.facing === 'down' ? -20 : 0);
      server.bubble = 'आ रहे हैं साहिब! गरमा-गरम चाय! ☕';
      server.walkFrame = 0;
    }

    if (multiplayerManager) {
      multiplayerManager.broadcastPlayerState({
        ...p,
        isSitting: true,
        sittingChairId: chair.id,
        x: chair.x,
        y: chair.y
      });
    }
  };

  const standUpFromChair = () => {
    const p = playerRef.current;
    if (!p.isSitting) return;

    const currentChairId = p.sittingChairId;
    p.isSitting = false;
    p.sittingChairId = null;
    p.y += 18;
    p.targetX = undefined;
    p.targetY = undefined;
    p.targetChairToSit = undefined;
    setSittingChair(null);
    setPlayer((prev) => ({
      ...prev,
      isSitting: false,
      sittingChairId: null,
      y: p.y
    }));

    const world = worldRef.current;
    if (world.chaiChairs && currentChairId) {
      world.chaiChairs.forEach((c) => {
        if (c.id === currentChairId) c.occupiedBy = null;
      });
    }

    if (multiplayerManager) {
      multiplayerManager.broadcastPlayerState({
        ...p,
        isSitting: false,
        sittingChairId: null,
        y: p.y
      });
    }
  };

  // Check proximity to shops / stalls / games
  const checkPlayerProximityInteractions = () => {
    const p = playerRef.current;
    const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

    // 0. If sitting, pressing interaction key stands up!
    if (p.isSitting) {
      standUpFromChair();
      return true;
    }

    // 0b. Check if standing near any unoccupied Chai Chair at Sharma Ji's Tapri
    const world = worldRef.current;
    if (world.chaiChairs) {
      const nearChair = world.chaiChairs.find(
        (c) => !c.occupiedBy && dist(p.x, p.y, c.x, c.y) < 46
      );
      if (nearChair) {
        sitDownOnChair(nearChair);
        return true;
      }
    }

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

    // The Big Club DJ Stage / Jukebox (Second Ground)
    if (dist(p.x, p.y, MELA_ZONES.BIG_CLUB.x, MELA_ZONES.BIG_CLUB.y) < 160) {
      if (onOpenDjJukebox) onOpenDjJukebox();
      return true;
    }

    // Weapon Armory Stall (Shastra Armory)
    if (dist(p.x, p.y, MELA_ZONES.WEAPON_STALL.x, MELA_ZONES.WEAPON_STALL.y) < 140) {
      if (onOpenArmory) onOpenArmory();
      return true;
    }

    // East Gate (New Ground) Proximity
    const dEastGate = dist(p.x, p.y, MELA_ZONES.NEW_GROUND_GATE.x, MELA_ZONES.NEW_GROUND_GATE.y);
    if (dEastGate < 80) {
      const isEast = p.x >= 1850;
      const tx = isEast ? 1790 : 1910;
      p.targetX = tx;
      p.targetY = 470;
      p.isMoving = true;
      setPlayer((prev) => ({ ...prev, targetX: tx, targetY: 470, isMoving: true }));
      soundEngine.playGatePass?.();
      setGateNotice({
        text: isEast ? '🏮 Entered Main Mela Fairground!' : '✨ Entered New Ground (नया मैदान)!',
        time: Date.now()
      });
      return true;
    }

    // Ravan Gate Proximity
    const dGate = dist(p.x, p.y, MELA_ZONES.RAVAN_GATE.x, MELA_ZONES.RAVAN_GATE.y);
    if (dGate < 65) {
      const isInside = p.x >= 1380;
      const tx = isInside ? 1320 : 1445;
      p.targetX = tx;
      p.targetY = 980;
      p.isMoving = true;
      setPlayer((prev) => ({ ...prev, targetX: tx, targetY: 980, isMoving: true }));
      soundEngine.playGatePass?.();
      setGateNotice({
        text: isInside ? '🚪 Exited Ravan Arena' : '⚔️ Entered Ravan Arena! Tap Ravan or Press Space to Attack!',
        time: Date.now()
      });
      return true;
    }

    // Inside Ravan Arena (Shoot or armory prompt)
    const dRavan = dist(p.x, p.y, MELA_ZONES.RAVAN.x, MELA_ZONES.RAVAN.y);
    if (dRavan <= 185) {
      const hasWeapon = selectedCracker?.isWeapon || selectedCracker?.id === 'bow' || selectedCracker?.id === 'gun';
      if (hasWeapon) {
        fireWeaponAtRavan();
        return true;
      } else {
        setGateNotice({ text: '🏹 Equip Bow or Gun from Armory to strike Ravan!', time: Date.now() });
        if (onOpenArmory) onOpenArmory();
        return true;
      }
    }

    // Chai Tapri Shop Counter
    if (dist(p.x, p.y, MELA_ZONES.CHAI_TAPRI.x, MELA_ZONES.CHAI_TAPRI.y) < 85) {
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

    // 0. If sitting and clicking anywhere: stand up!
    if (p.isSitting) {
      standUpFromChair();
      return;
    }

    // 0-GunFight-Active: If currently in active Gun Fight, clicking shoots spark blaster bullet!
    if (gunFightRef.current?.status === 'ACTIVE') {
      fireDuelGunShot(worldClickX, worldClickY);
      return;
    }

    // 0-GunFight-Challenge: Click another player or NPC Veer to challenge to a Gun Fight!
    if (onChallengePlayer && (!gunFightRef.current || gunFightRef.current.status === 'IDLE')) {
      // 1. Check clicks on real online players
      if (remotePlayersRef.current && remotePlayersRef.current.size > 0) {
        for (const remPlayer of remotePlayersRef.current.values()) {
          if (remPlayer.id === p.id) continue;
          if (dist(worldClickX, worldClickY, remPlayer.x, remPlayer.y) < 48) {
            onChallengePlayer({
              id: remPlayer.id,
              name: remPlayer.name || 'Player'
            });
            return;
          }
        }
      }

      // 2. Check clicks on NPC Gun Duel Master "Veer" near Armory (x: 1180, y: 880)
      if (dist(worldClickX, worldClickY, 1180, 880) < 48) {
        onChallengePlayer({
          id: 'npc_veer',
          name: 'Veer (Gun Master 🤠)'
        });
        return;
      }
    }

    // 0a-2. Clicked on one of the 10 Chai Chairs at Sharma Ji's Tapri
    if (world.chaiChairs) {
      const clickedChair = world.chaiChairs.find(
        (c) => dist(worldClickX, worldClickY, c.x, c.y) < 26
      );
      if (clickedChair) {
        if (dist(p.x, p.y, clickedChair.x, clickedChair.y) < 65) {
          sitDownOnChair(clickedChair);
        } else {
          // Walk to chair, then sit down
          p.targetX = clickedChair.x;
          p.targetY = clickedChair.y;
          p.isMoving = true;
          p.targetChairToSit = clickedChair;
          setPlayer((prev) => ({ ...prev, targetX: clickedChair.x, targetY: clickedChair.y, isMoving: true }));
        }
        return;
      }
    }

    // 0a-BigClub. Clicked The Big Club DJ Stage / Booth (Open Jukebox) or Dance Floor
    const distToBigClubStage = dist(worldClickX, worldClickY, 2500, 1070);
    if (distToBigClubStage < 65) {
      if (onOpenDjJukebox) onOpenDjJukebox();
      return;
    }
    const distToBigClubFloor = dist(worldClickX, worldClickY, MELA_ZONES.BIG_CLUB.x, MELA_ZONES.BIG_CLUB.y);
    if (distToBigClubFloor < 120) {
      p.targetX = worldClickX;
      p.targetY = worldClickY;
      p.isMoving = true;
      setPlayer((prev) => ({ ...prev, targetX: worldClickX, targetY: worldClickY, isMoving: true }));
      return;
    }

    // 0a-East. Clicked East Gate (Enter or Exit the New Ground)
    const distToEastGate = dist(worldClickX, worldClickY, MELA_ZONES.NEW_GROUND_GATE.x, MELA_ZONES.NEW_GROUND_GATE.y);
    if (distToEastGate < 80) {
      const isEast = p.x >= 1850;
      const tx = isEast ? 1790 : 1910;
      p.targetX = tx;
      p.targetY = 470;
      p.isMoving = true;
      setPlayer((prev) => ({ ...prev, targetX: tx, targetY: 470, isMoving: true }));
      soundEngine.playGatePass?.();
      setGateNotice({
        text: isEast ? '🏮 Entered Main Mela Fairground!' : '✨ Entered New Ground (नया मैदान)!',
        time: Date.now()
      });
      return;
    }

    // 0a. Clicked Ravan Arena Gate (Enter or Exit the arena)
    const distToGate = dist(worldClickX, worldClickY, MELA_ZONES.RAVAN_GATE.x, MELA_ZONES.RAVAN_GATE.y);
    if (distToGate < 65) {
      const isInside = p.x >= 1380;
      const tx = isInside ? 1320 : 1445;
      p.targetX = tx;
      p.targetY = 980;
      p.isMoving = true;
      setPlayer((prev) => ({ ...prev, targetX: tx, targetY: 980, isMoving: true }));
      soundEngine.playGatePass?.();
      setGateNotice({
        text: isInside ? '🚪 Exited Ravan Arena' : '⚔️ Entered Ravan Arena! Tap Ravan to Shoot!',
        time: Date.now()
      });
      return;
    }

    // 0b. Ravan Arena & Effigy Interaction
    const hasWeapon = selectedCracker?.isWeapon || selectedCracker?.id === 'bow' || selectedCracker?.id === 'gun';
    const distToRavanCenter = dist(p.x, p.y, MELA_ZONES.RAVAN.x, MELA_ZONES.RAVAN.y);
    const isInsideArena = distToRavanCenter <= 185;
    const clickedInRavanArena = dist(worldClickX, worldClickY, MELA_ZONES.RAVAN.x, MELA_ZONES.RAVAN.y) <= 180;

    if (clickedInRavanArena) {
      if (!isInsideArena) {
        // Player is outside! Guide them to the Gate
        p.targetX = MELA_ZONES.RAVAN_GATE.x - 30;
        p.targetY = MELA_ZONES.RAVAN_GATE.y;
        p.isMoving = true;
        setPlayer((prev) => ({ ...prev, targetX: MELA_ZONES.RAVAN_GATE.x - 30, targetY: MELA_ZONES.RAVAN_GATE.y, isMoving: true }));
        setGateNotice({ text: '🚪 Enter through the Ravan Gate to fight Ravan!', time: Date.now() });
        return;
      }

      // Inside the arena
      if (hasWeapon) {
        fireWeaponAtRavan();
        return;
      } else {
        setGateNotice({ text: '🏹 Equip Bow or Gun from Armory to strike Ravan!', time: Date.now() });
        if (onOpenArmory) onOpenArmory();
        return;
      }
    }

    // Inside arena with weapon: clicking in the fighting ring fires weapon
    if (isInsideArena && hasWeapon && dist(worldClickX, worldClickY, MELA_ZONES.RAVAN.x, MELA_ZONES.RAVAN.y) <= 220) {
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
    // Suppress clicks originating from buttons or UI controllers
    if (e.target && e.target.closest && (e.target.closest('button') || e.target.closest('#weapon-fire-controller') || e.target.closest('#fixed-virtual-joystick'))) {
      return;
    }
    // Suppress synthetic clicks fired right after touch drag / release or button press
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
          if (p.isSitting) {
            standUpFromChair();
          }
          // Manual movement cancels click-navigation targets permanently
          p.targetX = undefined;
          p.targetY = undefined;
          p.targetChairToSit = undefined;

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
          // Smart Waypoint Routing across East Gate (x: 1850, y: 470)
          let effTargetX = p.targetX;
          let effTargetY = p.targetY;
          const isCrossingToNewGround = p.x < 1830 && p.targetX > 1850;
          const isReturningToMainMela = p.x > 1870 && p.targetX < 1850;

          if (isCrossingToNewGround) {
            effTargetX = 1910;
            effTargetY = 470;
          } else if (isReturningToMainMela) {
            effTargetX = 1790;
            effTargetY = 470;
          }

          const dx = effTargetX - p.x;
          const dy = effTargetY - p.y;
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
            if (isCrossingToNewGround || isReturningToMainMela) {
              // Stepped through gate waypoint! Continue naturally to destination
              newX = effTargetX;
              newY = effTargetY;
            } else {
              // Target arrived: clear target destination so player NEVER walks back to old targets
              newX = p.targetX;
              newY = p.targetY;
              isMoving = false;
              p.targetX = undefined;
              p.targetY = undefined;

              if (p.targetChairToSit) {
                const chairToSit = p.targetChairToSit;
                p.targetChairToSit = undefined;
                sitDownOnChair(chairToSit);
              }
            }
          }
        } else if (p.isSitting) {
          // Keep seated player locked to chair position
          newX = p.x;
          newY = p.y;
          isMoving = false;
        }

        // Ravan Effigy Scaffold solid collision (cannot walk through Ravan effigy base)
        const dEffigy = Math.hypot(newX - 1550, newY - 980);
        if (dEffigy < 45) {
          const a = Math.atan2(newY - 980, newX - 1550);
          newX = 1550 + Math.cos(a) * 45;
          newY = 980 + Math.sin(a) * 45;
        }

        // Ravan Arena Circular Perimeter Fencing & Gate opening
        // Gate is located at x: 1380, y: 980 (western opening |y - 980| <= 38)
        const dCurrent = Math.hypot(p.x - 1550, p.y - 980);
        const dNext = Math.hypot(newX - 1550, newY - 980);
        const inGateOpening = Math.abs(newY - 980) <= 38 && newX <= 1405;

        // Crossing into arena from outside:
        if (dCurrent >= 168 && dNext < 168) {
          if (!inGateOpening) {
            // Blocked by arena fence! Push back to fence edge
            const a = Math.atan2(newY - 980, newX - 1550);
            newX = 1550 + Math.cos(a) * 172;
            newY = 980 + Math.sin(a) * 172;
          }
        }
        // Crossing out of arena from inside:
        else if (dCurrent < 168 && dNext >= 168) {
          if (!inGateOpening) {
            // Blocked by arena fence! Keep inside
            const a = Math.atan2(newY - 980, newX - 1550);
            newX = 1550 + Math.cos(a) * 164;
            newY = 980 + Math.sin(a) * 164;
          }
        }

        // -------------------------------------------------------------
        // East Boundary Fence & East Gate opening (x: 1850)
        // Gate opening is at y: 365 to 575 (directly east of Patakha Shop Courtyard)
        // -------------------------------------------------------------
        const inEastGateOpening = newY >= 365 && newY <= 575;
        if (!inEastGateOpening) {
          // Attempting to cross from West (main mela) to East (new ground)
          if (p.x < 1850 && newX >= 1835) {
            newX = 1835;
          }
          // Attempting to cross from East (new ground) to West (main mela)
          else if (p.x >= 1850 && newX <= 1865) {
            newX = 1865;
          }
        }

        // Boundary sliding: keep full movement on unclamped axis
        const minX = 70;
        const maxX = 3470;
        const minY = 125;
        const maxY = 1315;

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

      // Handheld Phuljhadi & Rainbow Color Torch spark effect (Local Player)
      if ((selectedCracker?.id === 'phuljhadi' || selectedCracker?.id === 'colorphuljhadi') && !isRidingWheel) {
        const isColorTorch = selectedCracker?.id === 'colorphuljhadi';
        const sparkX = p.x + (p.facing === 'left' ? -25 : 25);
        const sparkY = p.y - 20;
        const count = isColorTorch ? 6 : 4;

        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 1.0 + Math.random() * 3.2;
          let color;
          if (isColorTorch) {
            const torchColors = ['#ec4899', '#06b6d4', '#facc15', '#10b981', '#a855f7', '#ffffff'];
            color = torchColors[Math.floor(Math.random() * torchColors.length)];
          } else {
            color = Math.random() > 0.4 ? '#fde047' : '#fbbf24';
          }

          world.particles.push(
            new Particle(
              sparkX,
              sparkY,
              Math.cos(angle) * spd,
              Math.sin(angle) * spd - (isColorTorch ? 0.3 : 0),
              color,
              14 + Math.floor(Math.random() * 16),
              isColorTorch ? 1.8 : 1.5,
              0.04,
              0.96,
              isColorTorch && Math.random() > 0.4 ? 'star' : 'spark'
            )
          );
        }

        if (Math.random() > 0.3) {
          if (isColorTorch) {
            soundEngine.playColorTorch();
          } else {
            soundEngine.playPhuljhadiSparkle();
          }
        }
      }

      // Handheld Phuljhadi & Color Torch spark effect (Remote Live Online Players)
      const peers = remotePlayersRef.current;
      if (peers && peers.size > 0) {
        peers.forEach((remPlayer) => {
          const holdingId = remPlayer.holdingCracker;
          if (holdingId === 'phuljhadi' || holdingId === 'colorphuljhadi') {
            const isColorTorch = holdingId === 'colorphuljhadi';
            const sparkX = remPlayer.x + (remPlayer.facing === 'left' ? -25 : 25);
            const sparkY = remPlayer.y - 20;
            const count = isColorTorch ? 4 : 3;

            for (let i = 0; i < count; i++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 1.0 + Math.random() * 3.0;
              const color = isColorTorch
                ? ['#ec4899', '#06b6d4', '#facc15', '#10b981'][Math.floor(Math.random() * 4)]
                : (Math.random() > 0.4 ? '#fde047' : '#fbbf24');

              world.particles.push(
                new Particle(
                  sparkX,
                  sparkY,
                  Math.cos(angle) * spd,
                  Math.sin(angle) * spd,
                  color,
                  14 + Math.floor(Math.random() * 14),
                  1.5,
                  0.04,
                  0.96,
                  isColorTorch && Math.random() > 0.5 ? 'star' : 'spark'
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

      // Update Projectiles (Fiery Arrows & Spark Bullets flying towards Ravan or Opponent)
      world.projectiles = (world.projectiles || []).filter((proj) => {
        const dx = proj.targetX - proj.x;
        const dy = proj.targetY - proj.y;
        const distToTarget = Math.hypot(dx, dy);

        proj.trail.push({ x: proj.x, y: proj.y });
        if (proj.trail.length > 5) proj.trail.shift();

        // A. Duel Projectile Hit Detection
        if (proj.isDuel) {
          // 1. Local Player's shot -> hitting opponent
          if (proj.isLocal) {
            let hitOpp = false;
            if (proj.duelOpponentId === 'npc_veer') {
              if (distToTarget <= proj.speed || Math.hypot(proj.x - 1180, proj.y - 880) <= 32) {
                hitOpp = true;
              }
            } else if (remotePlayersRef.current) {
              const opp = remotePlayersRef.current.get(proj.duelOpponentId);
              if (opp && (distToTarget <= proj.speed || Math.hypot(proj.x - opp.x, proj.y - opp.y) <= 32)) {
                hitOpp = true;
              } else if (distToTarget <= proj.speed) {
                hitOpp = true;
              }
            } else if (distToTarget <= proj.speed) {
              hitOpp = true;
            }

            if (hitOpp) {
              soundEngine.playRavanHit?.();
              world.screenShake = { intensity: 2.8, duration: 4 };

              // Floating damage text
              world.floatingTexts.push({
                x: proj.targetX + (Math.random() - 0.5) * 16,
                y: proj.targetY - 26,
                text: `-${proj.damage || 20} HP 💥`,
                color: '#38bdf8',
                alpha: 1.0,
                vy: -1.8,
                life: 50
              });

              // Spark burst particles at impact
              for (let i = 0; i < 18; i++) {
                const theta = Math.random() * Math.PI * 2;
                const spd = 2 + Math.random() * 5;
                world.particles.push(
                  new Particle(
                    proj.targetX,
                    proj.targetY,
                    Math.cos(theta) * spd,
                    Math.sin(theta) * spd,
                    '#38bdf8',
                    16,
                    1.8,
                    0.06,
                    0.95,
                    'spark'
                  )
                );
              }

              if (onDuelHitRef.current) {
                onDuelHitRef.current(proj.damage || 20);
              }
              return false;
            }
          }

          // 2. Opponent or Veer shot -> hitting local player
          if (proj.isVeerShot || proj.isOpponentShot) {
            if (distToTarget <= proj.speed || Math.hypot(proj.x - p.x, proj.y - p.y) <= 30) {
              soundEngine.playRavanHit?.();
              world.screenShake = { intensity: 3.5, duration: 5 };

              world.floatingTexts.push({
                x: p.x + (Math.random() - 0.5) * 16,
                y: p.y - 26,
                text: `-${proj.damage || 20} HP 💥`,
                color: '#ef4444',
                alpha: 1.0,
                vy: -1.8,
                life: 50
              });

              for (let i = 0; i < 18; i++) {
                const theta = Math.random() * Math.PI * 2;
                const spd = 2 + Math.random() * 5;
                world.particles.push(
                  new Particle(
                    p.x,
                    p.y,
                    Math.cos(theta) * spd,
                    Math.sin(theta) * spd,
                    '#ef4444',
                    16,
                    1.8,
                    0.06,
                    0.95,
                    'spark'
                  )
                );
              }

              if (onTakeDuelDamageRef.current) {
                onTakeDuelDamageRef.current(proj.damage || 20);
              }
              return false;
            }
          }
        }

        if (distToTarget <= proj.speed) {
          // Direct Impact on Ravan effigy! (Sound played to local shooter only)
          if (proj.isLocal) {
            soundEngine.playRavanHit();
          }
          world.ravanHitFlash = 9;

          const dmg = proj.damage || 100;

          let calculatedNextHp = null;
          // 1 shot reduces Ravan's HP by 100 (never automatically fills or increases)
          if (proj.isLocal && setRavanHp) {
            setRavanHp((prevHp) => {
              const nextHp = Math.max(0, prevHp - dmg);
              calculatedNextHp = nextHp;
              try {
                localStorage.setItem('diwali_ravan_hp', nextHp.toString());
              } catch (_) {}
              return nextHp;
            });
          }

          // Floating damage number rising above Ravan showing who hit
          world.floatingTexts.push({
            x: proj.targetX + (Math.random() - 0.5) * 24,
            y: proj.targetY - 20,
            text: `-${dmg} HP ✨ ${proj.shooterName || 'Hero'}`,
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

          // Broadcast hit event with exact reduced HP to live peers if local shooter
          if (proj.isLocal && multiplayerManager) {
            multiplayerManager.broadcastRavanHit({
              damage: dmg,
              currentHp: calculatedNextHp !== null ? calculatedNextHp : Math.max(0, ravanHp - dmg),
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

      // NPC Veer AI shooting loop during Gun Fight
      if (gunFightRef.current?.status === 'ACTIVE' && gunFightRef.current?.opponentId === 'npc_veer') {
        const nowMs = performance.now();
        if (!world.lastVeerShotTime) world.lastVeerShotTime = nowMs;
        if (nowMs - world.lastVeerShotTime > 1500) {
          world.lastVeerShotTime = nowMs;
          soundEngine.init();
          soundEngine.playGunShot?.(1.35);
          const veerX = 1180;
          const veerY = 880;
          const targetX = p.x + (Math.random() - 0.5) * 22;
          const targetY = p.y + (Math.random() - 0.5) * 22;

          world.projectiles.push({
            id: `veer_shot_${nowMs}`,
            x: veerX,
            y: veerY - 18,
            startX: veerX,
            startY: veerY - 18,
            targetX,
            targetY,
            speed: 26,
            speedMultiplier: 1.2,
            type: 'gun',
            damage: 20,
            shooterName: 'Veer',
            color: '#ef4444',
            trail: [],
            isLocal: false,
            isDuel: true,
            isVeerShot: true
          });
        }
      }

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

      // Update Chai Tapri Server (Chhotu / चायवाला)
      const server = world.chaiServer;
      if (server) {
        // If sitting player stands up while server is coming or serving:
        if (!p.isSitting && (server.phase === 'COMING' || server.phase === 'SERVING')) {
          server.phase = 'RETURNING';
          server.targetX = 380;
          server.targetY = 440;
          server.bubble = 'फिर मिलेंगे बाबूजी! 🙏';
        }

        if (server.phase === 'COMING') {
          const dx = server.targetX - server.x;
          const dy = server.targetY - server.y;
          const dist = Math.hypot(dx, dy);
          server.walkFrame = (server.walkFrame || 0) + 0.16;
          server.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');

          if (dist > 3.0) {
            server.x += (dx / dist) * 2.5;
            server.y += (dy / dist) * 2.5;
          } else {
            // Arrived at the chair!
            server.x = server.targetX;
            server.y = server.targetY;
            server.phase = 'SERVING';
            server.serveTimer = 190; // ~3.1 seconds
            server.bubble = 'लीजिए साहिब, स्पेशल अदरक-इलायची कुल्हड़ चाय! ☕✨';

            // Play pour and sip sounds!
            soundEngine.playChaiPour?.();
            setTimeout(() => {
              soundEngine.playChaiSip?.();
            }, 1200);

            // Grant kulhad chai buff & notify
            if (setActiveBuffs) {
              setActiveBuffs((prev) => ({
                ...prev,
                kulhad_chai: { expiresAt: Date.now() + 60000, name: 'कुल्हड़ चाय (Kulhad Chai)' }
              }));
            }
            if (onChaiDrank) {
              onChaiDrank();
            }

            // Spawn lovely tea steam particles around the player's chair/table
            for (let i = 0; i < 8; i++) {
              world.particles.push(
                new Particle(
                  server.x + (Math.random() - 0.5) * 10,
                  server.y - 15 + (Math.random() - 0.5) * 6,
                  (Math.random() - 0.5) * 0.4,
                  -0.7 - Math.random() * 0.6,
                  'rgba(254, 243, 199, 0.8)',
                  28 + Math.floor(Math.random() * 20),
                  2.2,
                  0.015,
                  0.98,
                  'smoke'
                )
              );
            }
          }
        } else if (server.phase === 'SERVING') {
          server.serveTimer--;
          if (server.serveTimer === 95) {
            server.bubble = 'कैसी बनी है चाय साहिब? दिवाली की राम-राम! 🪔';
          }
          if (server.serveTimer <= 0) {
            server.phase = 'RETURNING';
            server.targetX = 380;
            server.targetY = 440;
            server.bubble = 'दुकान पे फिर हाजिर! आनंद लीजिए! ☕';
          }
        } else if (server.phase === 'RETURNING') {
          const dx = server.targetX - server.x;
          const dy = server.targetY - server.y;
          const dist = Math.hypot(dx, dy);
          server.walkFrame = (server.walkFrame || 0) + 0.16;
          server.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');

          if (dist > 3.0) {
            server.x += (dx / dist) * 2.2;
            server.y += (dy / dist) * 2.2;
          } else {
            // Reached shop counter!
            server.x = 380;
            server.y = 440;
            server.phase = 'IDLE';
            server.targetChair = null;
            server.bubble = 'गरम मसाला चाय तैयार है! ☕';
            server.facing = 'down';
          }
        }
      }

      // Update The Big Club Spatial Audio (VIP Mega Nightclub in Second Ground)
      const isInsideBigClubFloor = p.x >= 2350 && p.x <= 2650 && p.y >= 840 && p.y <= 1040;
      const dBigClub = Math.hypot(p.x - 2500, p.y - 950);

      // Spatial volume: characters in or near The Big Club hear club music!
      let djVol = 0;
      if (isInsideBigClubFloor) {
        djVol = 1.0;
      } else if (dBigClub <= 240) {
        djVol = (240 - dBigClub) / 120;
      }
      soundEngine.updateCasaTupkaSpatial?.(djVol);

      // Automatic dancing for characters entering The Big Club dance floor in Second Ground!
      const isAnyClubDanceFloor = isInsideBigClubFloor && !p.isSitting;
      if (isAnyClubDanceFloor) {
        if (!p.inDjFloor) {
          p.inDjFloor = true;
          if (setIsDancingRef.current) setIsDancingRef.current(true);
          if (multiplayerManager) {
            multiplayerManager.broadcastPlayerDance({ isDancing: true, playerName: p.name, danceStep: danceStepRef.current });
          }
        }
        // Spawn party glitter sparkles on the floor around dancing player
        if (Math.random() > 0.55) {
          const partyColors = ['#ec4899', '#06b6d4', '#facc15', '#a855f7', '#22c55e', '#ffffff'];
          world.particles.push(
            new Particle(
              p.x + (Math.random() - 0.5) * 24,
              p.y - 10 + (Math.random() - 0.5) * 16,
              (Math.random() - 0.5) * 1.2,
              -0.6 - Math.random() * 0.8,
              partyColors[Math.floor(Math.random() * partyColors.length)],
              20 + Math.floor(Math.random() * 16),
              1.6,
              0.03,
              0.96,
              'star'
            )
          );
        }
      } else if (p.inDjFloor && !isInsideBigClubFloor && dBigClub > 200) {
        p.inDjFloor = false;
        if (setIsDancingRef.current) setIsDancingRef.current(false);
        if (multiplayerManager) {
          multiplayerManager.broadcastPlayerDance({ isDancing: false, playerName: p.name });
        }
      }

      // ==========================================
      // RENDER CANVAS SCENE
      // ==========================================
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply Camera Transform & Screen Shake with Zoom
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(world.cameraZoom || 1, world.cameraZoom || 1);
      ctx.translate(-world.camera.x + shakeOffsetX, -world.camera.y + shakeOffsetY);

      // A. Ground & Festive Red Carpet Walkways (Diwali Ground)
      renderGroundAndCourtyards(ctx, world);

      // A2. Grand New Mela Fairground (नया मेला मैदान - Second Ground)
      renderNewMelaGround(ctx, world, p);

      // A3. The Big Club (द बिग क्लब - VIP Mega Nightclub in Second Ground)
      renderBigClub(ctx, world, p, remotePlayersRef.current);

      // B. Grand Entrance Arch & Signages
      renderEntranceArch(ctx);

      // C. Giant Ferris Wheel (विशाल झूला)
      const livePeers = remotePlayersRef.current;
      renderGiantFerrisWheel(ctx, world.wheelAngle, isRidingWheel, p, livePeers);

      // D. Carnival Game Stalls: Balloon Shooting, Sharma Ji Chai Tapri (10 chairs patio)
      renderCarnivalAttractions(ctx, world, p);

      // E. Stalls: Cracker Shop, Temple
      renderMelaStalls(ctx, world, p);

      // E2. Shastra Armory Stall (शस्त्रागार - धनुष व बंदूक)
      renderWeaponArmoryStall(ctx, world, p);

      // E2-Veer. NPC Gun Master "Veer" (Gun Duel Master 🤠)
      renderVeerNpc(ctx, world, p, gunFightRef.current);

      // E2b. Grand Ravan Dahan Arena Gate (प्रवेश द्वार)
      renderRavanGate(ctx, world, p);

      // E2c. Grand East Gate to New Ground (पूर्व द्वार)
      renderNewGroundGate(ctx, world, p);

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
          renderCharacter(ctx, remPlayer, true, false, heldCracker, remPlayer.activeBuffs, remPlayer.isDancing, remPlayer.danceStep || 0, gunFightRef.current);
        });
      }

      // L. Local Player Character (if not riding wheel)
      if (!isRidingWheel) {
        renderCharacter(ctx, p, false, true, selectedCracker, activeBuffs, isDancingRef.current, danceStepRef.current, gunFightRef.current);
      }

      // L2. Chai Tapri Server (Chhotu / चायवाला carrying kettle & kulhad tray)
      if (world.chaiServer) {
        renderChaiServer(ctx, world.chaiServer);
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
      soundEngine.updateCasaTupkaSpatial?.(0);
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
      if (e.target.closest('button') || e.target.closest('#fixed-virtual-joystick') || e.target.closest('#weapon-fire-controller')) return;
      if (e.touches.length === 0) return;
      e.preventDefault(); // Stop iOS Safari from scrolling or zooming

      const touch = e.touches[0];
      const rect = el.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const isPlacementCracker = selectedCracker && !selectedCracker.isWeapon && selectedCracker.id !== 'bow' && selectedCracker.id !== 'gun';

      if (isPlacementCracker) {
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
      if (e.target.closest('button') || e.target.closest('#fixed-virtual-joystick') || e.target.closest('#weapon-fire-controller')) return;
      e.preventDefault();
      if (e.touches.length === 0) return;

      const isPlacementCracker = selectedCracker && !selectedCracker.isWeapon && selectedCracker.id !== 'bow' && selectedCracker.id !== 'gun';

      if (isPlacementCracker) {
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
      if (e.target.closest('button') || e.target.closest('#fixed-virtual-joystick') || e.target.closest('#weapon-fire-controller')) return;
      e.preventDefault();
      lastTouchEndTimeRef.current = performance.now();

      const isPlacementCracker = selectedCracker && !selectedCracker.isWeapon && selectedCracker.id !== 'bow' && selectedCracker.id !== 'gun';

      if (isPlacementCracker) {
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

      {/* Sleek In-Game Notification for Gate Entry / Boss Fight */}
      {gateNotice && Date.now() - gateNotice.time < 3500 && (
        <div
          id="ravan-gate-toast"
          style={{
            position: 'fixed',
            top: 'max(68px, calc(env(safe-area-inset-top) + 60px))',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.94) 0%, rgba(20, 10, 30, 0.96) 100%)',
            border: '2px solid #fbbf24',
            borderRadius: 24,
            padding: '10px 22px',
            color: '#fef08a',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.5)',
            zIndex: 65,
            pointerEvents: 'none',
            animation: 'fadeInDown 0.3s ease-out'
          }}
        >
          <span>{gateNotice.text}</span>
        </div>
      )}

      {/* Sitting on Chai Chair Floating Action Bar */}
      {player.isSitting && (
        <div
          id="chai-sitting-banner"
          style={{
            position: 'fixed',
            bottom: 'max(95px, calc(env(safe-area-inset-bottom) + 90px))',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(67, 20, 7, 0.96) 0%, rgba(20, 10, 5, 0.98) 100%)',
            border: '2px solid #f97316',
            borderRadius: 28,
            padding: '8px 20px',
            color: '#fef08a',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 8px 30px rgba(0,0,0,0.85), 0 0 25px rgba(249, 115, 22, 0.6)',
            zIndex: 65,
            animation: 'fadeInUp 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 20 }}>☕</span>
            <span style={{ color: '#fed7aa', fontWeight: 600 }}>
              Sharma Ji Tapri • Drinking Hot Chai
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              standUpFromChair();
            }}
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              border: '1.5px solid #fed7aa',
              borderRadius: 18,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <span>🚶</span> Stand Up
          </button>
        </div>
      )}

      {/* Dedicated Gun & Arrow Fire Action Controller (Mobile Right-Thumb & Desktop) */}
      {(() => {
        const isGunFightActive = gunFightRef.current?.status === 'ACTIVE';
        const isGun = selectedCracker?.id === 'gun' || isGunFightActive;
        const isBow = selectedCracker?.id === 'bow' && !isGunFightActive;
        const hasWeaponArmed = isGun || isBow || selectedCracker?.isWeapon;

        // Fire button is active when Gun/Arrow is equipped or during Gun Fight duel!
        if (!hasWeaponArmed && !isGunFightActive) {
          return null;
        }

        const ownsBow = inventory.some((i) => i.id === 'bow' && i.count > 0);
        const ownsGun = inventory.some((i) => i.id === 'gun' && i.count > 0) || isGunFightActive;

        const handleSelectWeapon = (wId) => {
          if (CRACKER_MAP[wId] && setSelectedCracker) {
            setSelectedCracker(CRACKER_MAP[wId]);
            soundEngine.playCoinSound();
          }
        };

        const handleFireDown = (e) => {
          if (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
          }
          lastTouchEndTimeRef.current = performance.now();
          if (navigator.vibrate) navigator.vibrate(12);
          startAutoFire(e);
        };

        const handleFireUp = (e) => {
          if (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
          }
          lastTouchEndTimeRef.current = performance.now();
          stopAutoFire(e);
        };

        const handleFireClick = (e) => {
          if (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
          }
          lastTouchEndTimeRef.current = performance.now();
          if (gunFightRef.current?.status === 'ACTIVE') {
            fireDuelGunShot();
            return;
          }
          fireWeaponAtRavan();
        };

        return (
          <div
            id="weapon-fire-controller"
            onPointerDown={(e) => {
              if (e && e.stopPropagation) e.stopPropagation();
            }}
            onTouchStart={(e) => {
              if (e && e.stopPropagation) e.stopPropagation();
            }}
            onTouchMove={(e) => {
              if (e && e.stopPropagation) e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              if (e && e.stopPropagation) e.stopPropagation();
              lastTouchEndTimeRef.current = performance.now();
            }}
            onTouchCancel={(e) => {
              if (e && e.stopPropagation) e.stopPropagation();
              lastTouchEndTimeRef.current = performance.now();
            }}
            onClick={(e) => {
              if (e && e.stopPropagation) e.stopPropagation();
            }}
            style={{
              position: 'fixed',
              right: 'max(20px, calc(env(safe-area-inset-right) + 16px))',
              bottom: 'max(92px, calc(env(safe-area-inset-bottom) + 84px))',
              zIndex: 60,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'none'
            }}
          >
            {/* Quick Switcher Pill if player owns both weapons */}
            {(ownsBow && ownsGun) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'rgba(15, 10, 25, 0.94)',
                  backdropFilter: 'blur(8px)',
                  padding: '3px 6px',
                  borderRadius: 18,
                  border: '1.5px solid rgba(251, 191, 36, 0.65)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.6)'
                }}
              >
                {/* Arrow / Bow Option */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectWeapon('bow');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 14,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 800,
                    background: !isGun
                      ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                      : 'transparent',
                    color: !isGun ? '#ffffff' : '#fed7aa',
                    boxShadow: !isGun ? '0 0 10px rgba(245, 158, 11, 0.7)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title="Switch to Ram Dhanush (Bow & Arrow)"
                >
                  <span style={{ fontSize: 13 }}>🏹</span>
                  <span>Arrow</span>
                </button>

                {/* Gun Option */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectWeapon('gun');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 14,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 800,
                    background: isGun
                      ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                      : 'transparent',
                    color: isGun ? '#ffffff' : '#bae6fd',
                    boxShadow: isGun ? '0 0 10px rgba(56, 189, 248, 0.7)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title="Switch to Sparkler Gun"
                >
                  <span style={{ fontSize: 13 }}>🔫</span>
                  <span>Gun</span>
                </button>
              </div>
            )}

            {/* Main Primary FIRE Button */}
            <div
              onPointerDown={(e) => { if (e && e.stopPropagation) e.stopPropagation(); }}
              onTouchStart={(e) => { if (e && e.stopPropagation) e.stopPropagation(); }}
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              {/* Speed Multiplier Combo Flare Badge */}
              {clickSpeedMultiplier > 1.15 && (
                <div
                  style={{
                    position: 'absolute',
                    top: -22,
                    background: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)',
                    color: '#fef08a',
                    fontSize: 10,
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: 12,
                    border: '1.5px solid #fde047',
                    letterSpacing: 0.5,
                    boxShadow: '0 0 12px #f59e0b',
                    whiteSpace: 'nowrap',
                    animation: 'pulse 0.5s infinite'
                  }}
                >
                  ⚡ SPEED x{clickSpeedMultiplier.toFixed(1)}
                </div>
              )}

              <button
                id="fire-weapon-btn"
                type="button"
                onPointerDown={handleFireDown}
                onPointerUp={handleFireUp}
                onPointerLeave={handleFireUp}
                onPointerCancel={handleFireUp}
                onClick={handleFireClick}
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  background: isGun
                    ? (clickSpeedMultiplier > 1.3
                        ? 'radial-gradient(circle at 35% 35%, #38bdf8 0%, #0284c7 50%, #f97316 100%)'
                        : 'radial-gradient(circle at 35% 35%, #0284c7 0%, #0369a1 55%, #0c4a6e 100%)')
                    : (clickSpeedMultiplier > 1.3
                        ? 'radial-gradient(circle at 35% 35%, #fde047 0%, #ea580c 50%, #991b1b 100%)'
                        : 'radial-gradient(circle at 35% 35%, #fbbf24 0%, #ea580c 55%, #7c2d12 100%)'),
                  border: isGun
                    ? (clickSpeedMultiplier > 1.3 ? '3.5px solid #ffffff' : '3px solid #38bdf8')
                    : (clickSpeedMultiplier > 1.3 ? '3.5px solid #ffffff' : '3px solid #fef08a'),
                  boxShadow: isGun
                    ? (clickSpeedMultiplier > 1.3
                        ? '0 0 32px rgba(56, 189, 248, 0.95), 0 8px 25px rgba(0,0,0,0.85)'
                        : '0 0 24px rgba(56, 189, 248, 0.7), 0 8px 25px rgba(0,0,0,0.85)')
                    : (clickSpeedMultiplier > 1.3
                        ? '0 0 32px rgba(245, 158, 11, 0.95), 0 8px 25px rgba(0,0,0,0.85)'
                        : '0 0 24px rgba(245, 158, 11, 0.7), 0 8px 25px rgba(0,0,0,0.85)'),
                  transform: clickSpeedMultiplier > 1.25 ? 'scale(1.05)' : 'scale(1.0)',
                  transition: 'transform 0.08s ease, box-shadow 0.08s ease',
                  touchAction: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none'
                }}
                title={isGun ? 'Hold or Tap to Rapid-Fire Gun!' : 'Hold or Tap to Fire Divine Arrows!'}
              >
                <span style={{ fontSize: 28, lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
                  {isGun ? '🔫' : '🏹'}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: 0.8,
                    textShadow: '0 1px 4px #000',
                    lineHeight: 1
                  }}
                >
                  {isGunFightActive ? 'FIGHT' : 'FIRE'}
                </span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    color: '#fef08a',
                    letterSpacing: 0.5,
                    textShadow: '0 1px 3px #000',
                    lineHeight: 1
                  }}
                >
                  {isGunFightActive ? 'DUEL' : (isGun ? 'GUN' : 'ARROW')}
                </span>
              </button>
            </div>
          </div>
        );
      })()}


      {/* Visual Cracker Placement Aim Reticle (Phone & Touch) */}
      {placementPreview && selectedCracker && !selectedCracker.isWeapon && selectedCracker.id !== 'bow' && selectedCracker.id !== 'gun' && (
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
  ctx.fillRect(400, 590, 1450, 120);
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2;
  ctx.strokeRect(400, 590, 1450, 120);

  // Grand Illuminated Red Carpet Avenue from Patakha Shop directly to East Gate (x: 1460 to 1850, y: 430 to 510)
  ctx.fillStyle = 'rgba(185, 28, 28, 0.6)';
  ctx.fillRect(1460, 430, 390, 80);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(1460, 430, 390, 80);

  // Connecting carpet from Central Walkway up into East Gate (x: 1720 to 1850, y: 510 to 650)
  ctx.fillStyle = 'rgba(153, 27, 27, 0.45)';
  ctx.fillRect(1720, 510, 130, 140);
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1720, 510, 130, 140);

  // Marigold borders along the Patakha-to-Gate Avenue
  for (let mx = 1470; mx <= 1840; mx += 25) {
    ctx.fillStyle = mx % 50 === 0 ? '#f59e0b' : '#ea580c';
    ctx.beginPath();
    ctx.arc(mx, 430, 3.5, 0, Math.PI * 2);
    ctx.arc(mx, 510, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lamp Posts
  const lampPosts = [
    { x: 860, y: 350 },
    { x: 1140, y: 350 },
    { x: 860, y: 850 },
    { x: 1140, y: 850 },
    { x: 680, y: 570 },
    { x: 1320, y: 570 },
    { x: 1580, y: 395 },
    { x: 1730, y: 395 },
    { x: 1580, y: 535 },
    { x: 1730, y: 535 }
  ];

  lampPosts.forEach((lp) => {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(lp.x - 3, lp.y - 28, 6, 28);
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#f59e0b';
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lp.x, lp.y - 30, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Boundary Fence between Main Mela & New Ground along x: 1850
  // Leaves the grand gate opening open right at Patakha Courtyard: y: 365 to 575
  ctx.save();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;

  // North fence railing: y: 0 to 365
  ctx.beginPath();
  ctx.moveTo(1850, 0);
  ctx.lineTo(1850, 365);
  ctx.stroke();

  // South fence railing: y: 575 to world.height
  ctx.beginPath();
  ctx.moveTo(1850, 575);
  ctx.lineTo(1850, world.height);
  ctx.stroke();

  // North fence decorative posts
  for (let fy = 30; fy <= 350; fy += 40) {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(1847, fy - 6, 6, 12);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(1850, fy - 7, 3, 0, Math.PI * 2);
    ctx.fill();
    if (fy % 80 === 30) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(1850, fy - 10, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // South fence decorative posts
  for (let fy = 590; fy <= world.height - 30; fy += 45) {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(1847, fy - 6, 6, 12);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(1850, fy - 7, 3, 0, Math.PI * 2);
    ctx.fill();
    if (fy % 90 === 590 % 90) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(1850, fy - 10, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Ravan Dahan Arena Courtyard (Grand circular festive ring)
  const ravanArenaX = MELA_ZONES.RAVAN.x;
  const ravanArenaY = MELA_ZONES.RAVAN.y;
  ctx.save();

  // Grand Connecting Pathway from Main Walkway to Ravan Gate
  ctx.fillStyle = 'rgba(153, 27, 27, 0.45)';
  ctx.fillRect(1120, 955, 260, 50);
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2;
  ctx.strokeRect(1120, 955, 260, 50);

  // Marigold border on path
  for (let px = 1130; px <= 1370; px += 25) {
    ctx.fillStyle = px % 50 === 0 ? '#f59e0b' : '#ea580c';
    ctx.beginPath();
    ctx.arc(px, 955, 3.5, 0, Math.PI * 2);
    ctx.arc(px, 1005, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Arena Sacred Ground
  ctx.fillStyle = 'rgba(69, 10, 10, 0.5)';
  ctx.beginPath();
  ctx.arc(ravanArenaX, ravanArenaY, 170, 0, Math.PI * 2);
  ctx.fill();

  // Red Carpet continuing inside arena from gate
  ctx.fillStyle = 'rgba(185, 28, 28, 0.65)';
  ctx.fillRect(1380, 955, 80, 50);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1380, 955, 80, 50);

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

  // Arena Perimeter Barricade (Fencing with posts and garlands, leaving western gate opening)
  const numPosts = 18;
  const startAngle = Math.PI + 0.26; // south of gate
  const endAngle = Math.PI * 3 - 0.26; // north of gate
  const angleStep = (endAngle - startAngle) / numPosts;

  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(ravanArenaX, ravanArenaY, 170, startAngle, endAngle);
  ctx.stroke();

  // Swag Marigold Garlands & Brass Posts
  for (let i = 0; i <= numPosts; i++) {
    const a = startAngle + i * angleStep;
    const postX = ravanArenaX + Math.cos(a) * 170;
    const postY = ravanArenaY + Math.sin(a) * 170;

    // Post Base & Pole
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(postX, postY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Brass Finial
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(postX, postY - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Diya on every 3rd post
    if (i % 3 === 0) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(postX, postY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// -------------------------------------------------------------
// NEW MELA FAIRGROUND (नया मेला मैदान - SECOND GROUND)
// -------------------------------------------------------------
function renderNewMelaGround(ctx, world, player) {
  ctx.save();

  // 1. New Ground Paved Surface & Grid (from x: 1850 to 3500, y: 110 to 1330)
  ctx.fillStyle = '#0e0b1f'; // Royal Midnight Indigo Ground
  ctx.fillRect(1850, 110, 1650, 1220);

  // Festive Golden Grid Lines
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.lineWidth = 1;
  const tileSize = 60;
  ctx.beginPath();
  for (let x = 1860; x <= 3500; x += tileSize) {
    ctx.moveTo(x, 110);
    ctx.lineTo(x, 1330);
  }
  for (let y = 110; y <= 1330; y += tileSize) {
    ctx.moveTo(1850, y);
    ctx.lineTo(3500, y);
  }
  ctx.stroke();

  // 2. Perimeter Boundary Walls (North, East, South)
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3.5;

  // North Perimeter Wall (y: 110, x: 1850 to 3500)
  ctx.beginPath();
  ctx.moveTo(1850, 110);
  ctx.lineTo(3500, 110);
  ctx.stroke();

  // South Perimeter Wall (y: 1330, x: 1850 to 3500)
  ctx.beginPath();
  ctx.moveTo(1850, 1330);
  ctx.lineTo(3500, 1330);
  ctx.stroke();

  // East Perimeter Wall (x: 3500, y: 110 to 1330)
  ctx.beginPath();
  ctx.moveTo(3500, 110);
  ctx.lineTo(3500, 1330);
  ctx.stroke();

  // Decorative Wall Posts along North Wall
  for (let wx = 1890; wx <= 3470; wx += 50) {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(wx - 4, 104, 8, 12);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(wx, 103, 3, 0, Math.PI * 2);
    ctx.fill();
    if (wx % 100 === 1890 % 100) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(wx, 100, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Decorative Wall Posts along South Wall
  for (let wx = 1890; wx <= 3470; wx += 50) {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(wx - 4, 1324, 8, 12);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(wx, 1337, 3, 0, Math.PI * 2);
    ctx.fill();
    if (wx % 100 === 1890 % 100) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(wx, 1340, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Decorative Wall Posts along East Wall
  for (let wy = 150; wy <= 1290; wy += 50) {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(3494, wy - 4, 12, 8);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(3507, wy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Corner Royal Bastions (Square Bastion Pillars)
  const corners = [
    { x: 3500, y: 110 },
    { x: 3500, y: 1330 }
  ];
  corners.forEach((c) => {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(c.x - 14, c.y - 14, 28, 28);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(c.x - 14, c.y - 14, 28, 28);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(c.x - 7, c.y - 7, 14, 14);
  });

  // 3. Main Royal Promenade (East-West Avenue: x: 1850 to 3300, y: 410 to 530)
  ctx.fillStyle = 'rgba(120, 53, 15, 0.4)';
  ctx.fillRect(1850, 410, 1450, 120);
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2;
  ctx.strokeRect(1850, 410, 1450, 120);

  // Red Velvet Center Runner Carpet
  ctx.fillStyle = 'rgba(185, 28, 28, 0.65)';
  ctx.fillRect(1850, 440, 1450, 60);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(1850, 440, 1450, 60);

  // Marigold Borders along Avenue
  for (let mx = 1860; mx <= 3290; mx += 28) {
    ctx.fillStyle = mx % 56 === 0 ? '#f59e0b' : '#ea580c';
    ctx.beginPath();
    ctx.arc(mx, 440, 3.5, 0, Math.PI * 2);
    ctx.arc(mx, 500, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. North-South Grand Cross Avenue (x: 2420 to 2580, y: 160 to 1240)
  ctx.fillStyle = 'rgba(120, 53, 15, 0.35)';
  ctx.fillRect(2420, 160, 160, 1080);
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2;
  ctx.strokeRect(2420, 160, 160, 1080);

  // Red Velvet North-South Runner Carpet
  ctx.fillStyle = 'rgba(185, 28, 28, 0.55)';
  ctx.fillRect(2460, 160, 80, 1080);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(2460, 160, 80, 1080);

  // Marigold Borders along North-South Cross Avenue
  for (let my = 170; my <= 1230; my += 28) {
    ctx.fillStyle = my % 56 === 0 ? '#f59e0b' : '#ea580c';
    ctx.beginPath();
    ctx.arc(2460, my, 3.5, 0, Math.PI * 2);
    ctx.arc(2540, my, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Grand Central Utsav Chowk (महा उत्सव चौक - Grand Square Ceremonial Plaza)
  const cx = 2500;
  const cy = 470;
  const pw = 280; // plaza width
  const ph = 240; // plaza height

  // Outer plaza rectangular base
  ctx.fillStyle = 'rgba(69, 10, 10, 0.65)';
  ctx.beginPath();
  ctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, 12);
  ctx.fill();

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Middle rectangular decorative border
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cx - (pw - 36) / 2, cy - (ph - 36) / 2, pw - 36, ph - 36, 8);
  ctx.stroke();

  // Inner sanctum square carpet
  ctx.fillStyle = 'rgba(120, 53, 15, 0.75)';
  ctx.fillRect(cx - 70, cy - 70, 140, 140);
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 70, cy - 70, 140, 140);

  // Geometric Festive Diamond / Square Rangoli in the center
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4); // Diamond square
  ctx.fillStyle = 'rgba(220, 38, 38, 0.85)';
  ctx.fillRect(-35, -35, 70, 70);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(-35, -35, 70, 70);
  ctx.restore();

  // Central Auspicious Deepstambh Base (Square Pedestal)
  ctx.fillStyle = '#451a03';
  ctx.fillRect(cx - 18, cy - 18, 36, 36);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 18, cy - 18, 36, 36);

  // Eternal Central Flame of New Ground (Flame shape, not a circle)
  ctx.save();
  ctx.shadowBlur = 24;
  ctx.shadowColor = '#f59e0b';
  const fTime = performance.now() * 0.005;
  const flameWobble = Math.cos(fTime * 2) * 3;
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy + 6);
  ctx.quadraticCurveTo(cx - 16, cy - 14, cx + flameWobble, cy - 28);
  ctx.quadraticCurveTo(cx + 16, cy - 14, cx + 12, cy + 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 4);
  ctx.quadraticCurveTo(cx - 8, cy - 8, cx + flameWobble * 0.5, cy - 18);
  ctx.quadraticCurveTo(cx + 8, cy - 8, cx + 6, cy + 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Plaza Name Badge on Floor
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 13px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('✨ महा उत्सव चौक (Grand Utsav Plaza) ✨', cx, cy + 104);

  // 6. North Rangoli Arts Pavilion Ground (x: 2360 to 2640, y: 150 to 290)
  ctx.fillStyle = 'rgba(76, 29, 149, 0.45)'; // Royal Purple Pavilion Floor
  ctx.beginPath();
  ctx.roundRect(2360, 150, 280, 140, 12);
  ctx.fill();
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Pavilion Toran Header Sign
  ctx.fillStyle = '#e9d5ff';
  ctx.font = 'bold 12px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌸 उत्तर कला मंडप (North Art Pavilion) 🌸', 2500, 275);

  // 7. Grand Avenue South Approach to The Big Club (x: 2420 to 2580, y: 590 to 770)
  ctx.fillStyle = 'rgba(185, 28, 28, 0.65)';
  ctx.fillRect(2440, 590, 120, 180);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(2440, 590, 120, 180);

  // VIP Entrance Welcome Sign facing North along the avenue
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 12px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⬇ 🪩 THE BIG CLUB (VIP ENTRANCE) ⬇', 2500, 755);

  // 8. East Viewing Terrace (x: 3200, y: 470)
  ctx.fillStyle = 'rgba(185, 28, 28, 0.5)';
  ctx.beginPath();
  ctx.roundRect(3100, 390, 200, 160, 16);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 12px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🪔 पूर्व दर्शन मंडप (East Terrace) 🪔', 3200, 535);

  // 9. Victorian / Rajasthani Lamp Posts along New Ground Avenues
  const newLamps = [
    // East-West Avenue pairs
    { x: 2000, y: 385 }, { x: 2000, y: 555 },
    { x: 2220, y: 385 }, { x: 2220, y: 555 },
    { x: 2780, y: 385 }, { x: 2780, y: 555 },
    { x: 3000, y: 385 }, { x: 3000, y: 555 },
    { x: 3240, y: 385 }, { x: 3240, y: 555 },
    // North-South Avenue pairs
    { x: 2400, y: 220 }, { x: 2600, y: 220 },
    { x: 2400, y: 720 }, { x: 2600, y: 720 },
    { x: 2400, y: 920 }, { x: 2600, y: 920 },
    { x: 2400, y: 1150 }, { x: 2600, y: 1150 }
  ];

  newLamps.forEach((lp) => {
    // Lamp post shaft
    ctx.fillStyle = '#451a03';
    ctx.fillRect(lp.x - 3, lp.y - 30, 6, 30);
    // Brass finial
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(lp.x, lp.y - 32, 3, 0, Math.PI * 2);
    ctx.fill();
    // Glowing golden lantern
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#f59e0b';
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lp.x, lp.y - 30, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // 10. Hanging Strings of Twinkling Fairy Lights across Central Utsav Chowk
  const fairyTime = performance.now() * 0.003;
  const festColors = ['#f43f5e', '#38bdf8', '#fbbf24', '#4ade80', '#c084fc'];
  const lightSpans = [
    { x1: cx - 130, y1: cy - 100, x2: cx + 130, y2: cy - 100 },
    { x1: cx - 130, y1: cy + 100, x2: cx + 130, y2: cy + 100 },
    { x1: cx - 120, y1: cy - 100, x2: cx - 120, y2: cy + 100 },
    { x1: cx + 120, y1: cy - 100, x2: cx + 120, y2: cy + 100 }
  ];
  lightSpans.forEach((span, s) => {
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(span.x1, span.y1);
    ctx.quadraticCurveTo((span.x1 + span.x2) / 2, (span.y1 + span.y2) / 2 + 10, span.x2, span.y2);
    ctx.stroke();

    for (let b = 1; b <= 6; b++) {
      const t = b / 7;
      const lx = (1 - t) * (1 - t) * span.x1 + 2 * (1 - t) * t * ((span.x1 + span.x2) / 2) + t * t * span.x2;
      const ly = (1 - t) * (1 - t) * span.y1 + 2 * (1 - t) * t * ((span.y1 + span.y2) / 2 + 10) + t * t * span.y2;
      const colIdx = Math.floor(s + b + fairyTime * 2) % festColors.length;
      ctx.fillStyle = festColors[colIdx];
      ctx.beginPath();
      ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

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
function renderCarnivalAttractions(ctx, world, player) {
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

  // 2. Upgraded Sharma Ji Ki Chai Tapri (☕) with Brick Patio, 3 Tables & 10 Chairs
  renderSharmaJiChaiTapri(ctx, world, player);
}

// -------------------------------------------------------------
// SHARMA JI CHAI TAPRI & 10 CHAIRS OUTDOOR PATIO
// -------------------------------------------------------------
function renderSharmaJiChaiTapri(ctx, world, player) {
  const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);
  const now = performance.now();

  ctx.save();

  // 1. Terracotta Brick / Cobblestone Patio Courtyard
  const patioX = 205;
  const patioY = 485;
  const patioW = 345;
  const patioH = 145;

  ctx.fillStyle = 'rgba(78, 29, 9, 0.55)';
  ctx.beginPath();
  ctx.roundRect(patioX, patioY, patioW, patioH, 16);
  ctx.fill();

  ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Decorative paving pavers
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.12)';
  ctx.lineWidth = 1;
  for (let px = patioX + 24; px < patioX + patioW; px += 28) {
    ctx.beginPath();
    ctx.moveTo(px, patioY);
    ctx.lineTo(px, patioY + patioH);
    ctx.stroke();
  }
  for (let py = patioY + 24; py < patioY + patioH; py += 28) {
    ctx.beginPath();
    ctx.moveTo(patioX, py);
    ctx.lineTo(patioX + patioW, py);
    ctx.stroke();
  }

  // Corner Wooden Poles for overhead festoon lighting
  const poles = [
    { x: patioX + 8, y: patioY + 8 },
    { x: patioX + patioW - 8, y: patioY + 8 },
    { x: patioX + 8, y: patioY + patioH - 8 },
    { x: patioX + patioW - 8, y: patioY + patioH - 8 }
  ];

  poles.forEach((pole) => {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(pole.x - 3, pole.y - 18, 6, 20);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(pole.x, pole.y - 20, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Festoon fairy lights hanging between poles
  const festoonBulbs = [
    { x: 260, y: 494 },
    { x: 320, y: 496 },
    { x: 380, y: 497 },
    { x: 440, y: 496 },
    { x: 500, y: 494 }
  ];
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(patioX + 8, patioY - 10);
  ctx.quadraticCurveTo(patioX + patioW / 2, patioY + 6, patioX + patioW - 8, patioY - 10);
  ctx.stroke();

  festoonBulbs.forEach((b, idx) => {
    const glow = Math.sin(now * 0.003 + idx) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(254, 240, 138, ${glow})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#f59e0b';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // 2. Sharma Ji Chai Stall Building (Shop Counter at tx: 380, ty: 420)
  const tx = MELA_ZONES.CHAI_TAPRI.x;
  const ty = MELA_ZONES.CHAI_TAPRI.y;
  const isNearChai = dist(player.x, player.y, tx, ty) < 85 && !player.isSitting;

  // Stall Main Structure
  ctx.fillStyle = '#291b10';
  ctx.strokeStyle = isNearChai ? '#fbbf24' : '#78350f';
  ctx.lineWidth = isNearChai ? 3.5 : 2;
  ctx.beginPath();
  ctx.roundRect(tx - 90, ty - 50, 180, 92, 12);
  ctx.fill();
  ctx.stroke();

  // Roof Awnings (Striped Festive Awning)
  for (let s = 0; s < 10; s++) {
    ctx.fillStyle = s % 2 === 0 ? '#ea580c' : '#fbbf24';
    ctx.fillRect(tx - 90 + s * 18, ty - 50, 18, 24);
  }

  // Wooden Counter Board
  ctx.fillStyle = '#451a03';
  ctx.fillRect(tx - 85, ty + 12, 170, 26);
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(tx - 85, ty + 12, 170, 26);

  // Shop Signboard
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 13px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('☕ शर्मा जी चाय टपरी (ESTD 1984)', tx, ty - 14);

  ctx.font = '9.5px "Outfit", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('अदरक • इलायची • केसर स्पेशल मसाला चाय', tx, ty);

  // Big Shining Brass Samovar / Kettle on Counter
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.arc(tx - 40, ty + 18, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(tx - 44, ty + 4, 8, 4);

  // Boiling steam rising from samovar
  const steamPulse = Math.sin(now * 0.006) * 3;
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.65)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(tx - 40, ty + 4);
  ctx.quadraticCurveTo(tx - 43 + steamPulse, ty - 8, tx - 38 + steamPulse, ty - 16);
  ctx.stroke();

  // Stacks of Authentic Earthen Kulhad Cups (Clay brown #b45309)
  for (let k = 0; k < 4; k++) {
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(tx - 12 + k * 8, ty + 24);
    ctx.lineTo(tx - 6 + k * 8, ty + 24);
    ctx.lineTo(tx - 7 + k * 8, ty + 32);
    ctx.lineTo(tx - 11 + k * 8, ty + 32);
    ctx.closePath();
    ctx.fill();
  }

  // Glass jar with biscuits / rusks
  ctx.fillStyle = 'rgba(224, 242, 254, 0.5)';
  ctx.fillRect(tx + 30, ty + 14, 14, 20);
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(tx + 32, ty + 18, 10, 14);

  // Wire caddy for tea glasses
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(tx + 52, ty + 18, 22, 14);

  // Sharma Ji (Shopkeeper) behind counter
  ctx.fillStyle = '#f8fafc'; // White kurta
  ctx.beginPath();
  ctx.roundRect(tx - 8, ty - 6, 16, 18, [3, 3, 0, 0]);
  ctx.fill();
  ctx.fillStyle = '#ea580c'; // Nehru jacket
  ctx.fillRect(tx - 8, ty - 6, 4, 18);
  ctx.fillRect(tx + 4, ty - 6, 4, 18);
  ctx.fillStyle = '#fed7aa'; // Head
  ctx.beginPath();
  ctx.arc(tx, ty - 12, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff'; // White hair / mustache
  ctx.beginPath();
  ctx.arc(tx, ty - 15, 7.5, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#1e1b4b'; // Mustache
  ctx.fillRect(tx - 4, ty - 10, 8, 2);

  // Counter Takeaway Prompt
  if (isNearChai) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.fillText('☕ [ Click / Press E ] Grab Takeaway Chai (5 Coins)', tx, ty + 50);
  }

  // 3. The 3 Round Tables (CHAI_TABLES)
  const tables = world.chaiTables || CHAI_TABLES;
  tables.forEach((tbl) => {
    // Soft shadow under table
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(tbl.x, tbl.y + 4, tbl.radius + 3, tbl.radius * 0.45 + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pedestal base
    ctx.fillStyle = '#291b10';
    ctx.fillRect(tbl.x - 4, tbl.y - 2, 8, 6);

    // Varnished Round Wooden Top
    const grad = ctx.createRadialGradient(tbl.x - 5, tbl.y - 5, 2, tbl.x, tbl.y, tbl.radius);
    grad.addColorStop(0, '#a16207');
    grad.addColorStop(0.7, '#78350f');
    grad.addColorStop(1, '#451a03');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(tbl.x, tbl.y, tbl.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Concentric table ring
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(tbl.x, tbl.y, tbl.radius * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // Centerpiece: Fresh marigold flowers
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(tbl.x, tbl.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(tbl.x, tbl.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Tabletop Steaming Kulhad Cups
    const cupOffsets = [
      { dx: -tbl.radius * 0.4, dy: -tbl.radius * 0.25 },
      { dx: tbl.radius * 0.35, dy: tbl.radius * 0.25 }
    ];

    cupOffsets.forEach((cOff, cIdx) => {
      const cx = tbl.x + cOff.dx;
      const cy = tbl.y + cOff.dy;

      // Clay cup
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy - 3);
      ctx.lineTo(cx + 3, cy - 3);
      ctx.lineTo(cx + 2, cy + 3);
      ctx.lineTo(cx - 2, cy + 3);
      ctx.closePath();
      ctx.fill();

      // Tea surface
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 3, 2.8, 1, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gentle steam trail
      const steamT = now * 0.005 + cIdx * 1.5;
      ctx.strokeStyle = 'rgba(254, 243, 199, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 4);
      ctx.quadraticCurveTo(cx + Math.sin(steamT) * 3, cy - 8, cx + Math.sin(steamT + 1) * 2, cy - 14);
      ctx.stroke();
    });
  });

  // 4. The 10 Chairs (CHAI_CHAIRS)
  const chairs = world.chaiChairs || CHAI_CHAIRS;
  let nearUnoccupiedChair = null;

  chairs.forEach((chair) => {
    const isOccupied = !!chair.occupiedBy;
    const isLocalSittingHere = player.isSitting && player.sittingChairId === chair.id;
    const dToPlayer = dist(player.x, player.y, chair.x, chair.y);
    const isNear = dToPlayer < 48 && !player.isSitting;

    if (isNear && !isOccupied && !nearUnoccupiedChair) {
      nearUnoccupiedChair = chair;
    }

    // Chair shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(chair.x, chair.y + 4, 11, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Interactive Highlight Ring if close and unoccupied
    if (isNear && !isOccupied) {
      const pulse = Math.sin(now * 0.008) * 3;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#fbbf24';
      ctx.beginPath();
      ctx.arc(chair.x, chair.y, 16 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 4 Chair Legs
    ctx.fillStyle = '#451a03';
    ctx.fillRect(chair.x - 8, chair.y - 7, 2.5, 12);
    ctx.fillRect(chair.x + 5.5, chair.y - 7, 2.5, 12);
    ctx.fillRect(chair.x - 7, chair.y - 2, 2.5, 10);
    ctx.fillRect(chair.x + 4.5, chair.y - 2, 2.5, 10);

    // Woven Cane Seat Cushion
    ctx.fillStyle = isLocalSittingHere ? '#b45309' : '#92400e';
    ctx.beginPath();
    ctx.roundRect(chair.x - 9, chair.y - 8, 18, 14, 4);
    ctx.fill();

    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Curved Chair Backrest based on chair.facing
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;

    if (chair.facing === 'up') {
      // Backrest is on bottom (south side)
      ctx.beginPath();
      ctx.roundRect(chair.x - 9, chair.y + 2, 18, 5, 2);
      ctx.fill();
      ctx.stroke();
    } else if (chair.facing === 'down') {
      // Backrest is on top (north side)
      ctx.beginPath();
      ctx.roundRect(chair.x - 9, chair.y - 12, 18, 5, 2);
      ctx.fill();
      ctx.stroke();
    } else if (chair.facing === 'left') {
      // Backrest is on right (east side)
      ctx.beginPath();
      ctx.roundRect(chair.x + 5, chair.y - 9, 5, 16, 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Backrest is on left (west side)
      ctx.beginPath();
      ctx.roundRect(chair.x - 10, chair.y - 9, 5, 16, 2);
      ctx.fill();
      ctx.stroke();
    }
  });

  // Prompt above nearest chair
  if (nearUnoccupiedChair) {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000000';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪑 [ Click / Press E ] Sit & Drink Chai', nearUnoccupiedChair.x, nearUnoccupiedChair.y - 22);
    ctx.restore();
  }

  ctx.restore();
}

// -------------------------------------------------------------
// CHAI SERVER SPRITE: CHHOTU (छोटू - चायवाला)
// Walks from Sharma Ji shop to user's chair carrying tea tray & kettle
// -------------------------------------------------------------
function renderChaiServer(ctx, server) {
  if (!server) return;
  const now = performance.now();

  ctx.save();
  ctx.translate(server.x, server.y);

  const SCALE = 1.35;
  ctx.scale(SCALE, SCALE);

  // Soft ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 13, 11, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Animated leg walk cycle
  const isMoving = server.phase === 'COMING' || server.phase === 'RETURNING';
  const walkOffset = isMoving ? Math.sin(server.walkFrame || (now * 0.01)) * 4 : 0;

  // White dhoti / trousers
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-5, 3, 3.5, 10 + walkOffset);
  ctx.fillRect(1.5, 3, 3.5, 10 - walkOffset);

  // White Kurta
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.roundRect(-8, -11, 16, 16, [3, 3, 1, 1]);
  ctx.fill();

  // Royal Sapphire / Indigo Nehru Waistcoat (कोट)
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(-8, -11, 4, 15);
  ctx.fillRect(4, -11, 4, 15);
  ctx.fillStyle = '#fbbf24'; // Gold buttons
  ctx.fillRect(-0.5, -9, 1, 2);
  ctx.fillRect(-0.5, -5, 1, 2);

  // Red Gamcha (scarf around neck)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(-7, -13, 14, 4);
  ctx.fillRect(3, -10, 3, 8); // draped end

  // Server Head
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, -18, 7.5, 0, Math.PI * 2);
  ctx.fill();

  // Hair & Tilak
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, -21, 7.5, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#ea580c'; // Red tilak
  ctx.fillRect(-0.5, -20, 1.5, 3);

  // Friendly smile
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -16.5, 2.5, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Carrying Brass Tea Kettle & Serving Tray
  const isServing = server.phase === 'SERVING';

  // 1. Vintage Brass Kettle (केतली) in hand
  ctx.save();
  if (isServing) {
    // Tilted pouring pose!
    ctx.translate(-11, -5);
    ctx.rotate(0.55);
  } else {
    ctx.translate(-10, -2);
  }
  // Kettle body
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  // Kettle spout
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(3, -2);
  ctx.lineTo(8, -6);
  ctx.lineTo(7, -3);
  ctx.closePath();
  ctx.fill();
  // Kettle handle
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -3, 4, Math.PI, 0);
  ctx.stroke();

  // If serving: pouring stream of hot tea!
  if (isServing) {
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, -6);
    ctx.lineTo(16, 5);
    ctx.stroke();
    // Splash droplets
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(17, 6, 1.2, 0, Math.PI * 2);
    ctx.arc(15, 8, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Stainless Steel / Brass Serving Tray with Steaming Kulhad
  ctx.save();
  ctx.translate(9, -4);
  // Tray
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-2, 3, 13, 2.5);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(-2, 3, 13, 2.5);

  // Steaming Clay Kulhad on tray
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(2, -2);
  ctx.lineTo(7, -2);
  ctx.lineTo(6, 3);
  ctx.lineTo(3, 3);
  ctx.closePath();
  ctx.fill();

  // Hot tea in cup
  ctx.fillStyle = '#7c2d12';
  ctx.beginPath();
  ctx.ellipse(4.5, -2, 2.2, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tea steam curls
  const steamT = now * 0.006;
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.75)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(4.5, -3);
  ctx.quadraticCurveTo(4.5 + Math.sin(steamT) * 3, -7, 4.5 + Math.sin(steamT + 1) * 2, -12);
  ctx.stroke();
  ctx.restore();

  // Overhead Name Badge
  const nameY = -34;
  ctx.font = 'bold 9.5px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('☕ छोटू (Chhotu • Chaiwala)', 0, nameY);

  // Floating Speech Bubble with Dialogue
  if (server.bubble) {
    ctx.font = 'bold 9.5px "Outfit", sans-serif';
    const textWidth = ctx.measureText(server.bubble).width;
    const pad = 8;
    const bw = textWidth + pad * 2;
    const bh = 20;
    const bx = -bw / 2;
    const by = -64;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 6);
    ctx.fill();
    ctx.stroke();

    // Speech bubble triangle tail
    ctx.beginPath();
    ctx.moveTo(-4, by + bh);
    ctx.lineTo(0, by + bh + 4);
    ctx.lineTo(4, by + bh);
    ctx.fill();

    ctx.fillStyle = '#431407';
    ctx.fillText(server.bubble, 0, by + 14);
  }

  ctx.restore();
}

// -------------------------------------------------------------
// THE BIG CLUB (द बिग क्लब - VIP MEGA NIGHTCLUB IN SECOND MAP)
// -------------------------------------------------------------
function renderBigClub(ctx, world, player, remotePlayers) {
  const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);
  const now = performance.now();
  const bigClub = world.bigClub;

  ctx.save();

  // 1. Main Venue Obsidian Perimeter & VIP Carpet (x: 2260 to 2740, y: 770 to 1180)
  const clubX = 2260;
  const clubY = 770;
  const clubW = 480;
  const clubH = 410;

  // Ambient Club Neon Pulse Glow underneath
  const neonHue = (now * 0.05) % 360;
  const neonColor = `hsl(${neonHue}, 90%, 60%)`;

  ctx.save();
  ctx.shadowBlur = 35;
  ctx.shadowColor = 'rgba(236, 72, 153, 0.45)';
  ctx.fillStyle = '#090514'; // Dark Obsidian Club Floor
  ctx.beginPath();
  ctx.roundRect(clubX, clubY, clubW, clubH, 16);
  ctx.fill();
  ctx.restore();

  // Glowing Neon Outer Boundary
  ctx.strokeStyle = neonColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(clubX, clubY, clubW, clubH, 16);
  ctx.stroke();

  // Golden Geometric Floor Accents
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.12)';
  ctx.lineWidth = 1;
  for (let gx = clubX + 40; gx < clubX + clubW; gx += 50) {
    ctx.beginPath();
    ctx.moveTo(gx, clubY + 60);
    ctx.lineTo(gx, clubY + clubH - 20);
    ctx.stroke();
  }

  // 2. Grand Entrance & VIP Red Carpet (y: 770 to 850, x: 2430 to 2570)
  ctx.fillStyle = 'rgba(185, 28, 28, 0.85)';
  ctx.fillRect(2440, 770, 120, 80);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(2440, 770, 120, 80);

  // Brass Stanchion Posts & Red Velvet Ropes at Entry
  const stanchions = [
    { x: 2436, y: 790 }, { x: 2436, y: 830 },
    { x: 2564, y: 790 }, { x: 2564, y: 830 }
  ];
  stanchions.forEach((st) => {
    ctx.fillStyle = '#b45309';
    ctx.fillRect(st.x - 3, st.y - 14, 6, 14);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(st.x, st.y - 15, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });
  // Velvet Ropes
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(2436, 790 - 10);
  ctx.quadraticCurveTo(2436, 810, 2436, 830 - 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2564, 790 - 10);
  ctx.quadraticCurveTo(2564, 810, 2564, 830 - 10);
  ctx.stroke();

  // 3. VIP Security Bouncer NPC ("Shera") at Entrance
  ctx.save();
  const bouncerX = 2415;
  const bouncerY = 805;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(bouncerX, bouncerY + 12, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(bouncerX - 8, bouncerY + 2, 7, 10);
  ctx.fillRect(bouncerX + 1, bouncerY + 2, 7, 10);
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(bouncerX - 10, bouncerY - 12, 20, 16, 3);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(bouncerX - 2, bouncerY - 10, 4, 10);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(bouncerX - 1, bouncerY - 8, 2, 8);
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.arc(bouncerX, bouncerY - 18, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(bouncerX - 6, bouncerY - 20, 12, 4);
  ctx.font = 'bold 8.5px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('🕶️ Shera (VIP Security)', bouncerX, bouncerY - 28);
  ctx.restore();

  // 4. Grand Neon Marquee Header Sign
  ctx.save();
  ctx.shadowBlur = 18;
  ctx.shadowColor = neonColor;
  ctx.fillStyle = 'rgba(15, 10, 30, 0.95)';
  ctx.beginPath();
  ctx.roundRect(2340, 755, 320, 26, 8);
  ctx.fill();
  ctx.strokeStyle = neonColor;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.font = 'bold 13px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('✨ 🪩 THE BIG CLUB • VIP ARENA 🍸 ✨', 2500, 773);
  ctx.restore();

  // 5. Massive LED Matrix Dance Floor (x: 2360 to 2640, y: 850 to 1025)
  const danceX = 2360;
  const danceY = 850;
  const danceW = 280;
  const danceH = 175;

  ctx.fillStyle = 'rgba(10, 6, 22, 0.92)';
  ctx.fillRect(danceX, danceY, danceW, danceH);

  // 8 Columns x 5 Rows of Pulsating LED Acrylic Tiles
  const dCols = 8;
  const dRows = 5;
  const tileW = (danceW - 16) / dCols;
  const tileH = (danceH - 14) / dRows;
  const partyCols = ['#ec4899', '#06b6d4', '#8b5cf6', '#facc15', '#10b981', '#f43f5e', '#3b82f6'];

  for (let r = 0; r < dRows; r++) {
    for (let c = 0; c < dCols; c++) {
      const tx = danceX + 8 + c * tileW;
      const ty = danceY + 7 + r * tileH;
      const cIdx = Math.floor((c + r * 2 + Math.floor(now * 0.0035)) % partyCols.length);
      const col = partyCols[cIdx];
      const pAlpha = Math.sin(now * 0.009 + c * 0.7 + r * 1.1) * 0.35 + 0.65;

      ctx.fillStyle = col;
      ctx.globalAlpha = pAlpha * 0.55;
      ctx.fillRect(tx + 2, ty + 2, tileW - 4, tileH - 4);

      ctx.strokeStyle = col;
      ctx.globalAlpha = pAlpha * 0.85;
      ctx.lineWidth = 1;
      ctx.strokeRect(tx + 2, ty + 2, tileW - 4, tileH - 4);
    }
  }
  ctx.globalAlpha = 1.0;

  // 6. Overhead Giant Mirror Disco Ball (at x: 2500, y: 885)
  const ballX = 2500;
  const ballY = 885;
  const rotAngle = now * 0.0018;

  // Hanging wire
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(ballX, 780);
  ctx.lineTo(ballX, ballY);
  ctx.stroke();

  ctx.save();
  ctx.translate(ballX, ballY);
  ctx.rotate(rotAngle);

  ctx.shadowBlur = 22;
  ctx.shadowColor = '#ffffff';
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 0.8;
  for (let a = 0; a < 8; a++) {
    const ang = (a * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * -16, Math.sin(ang) * -16);
    ctx.lineTo(Math.cos(ang) * 16, Math.sin(ang) * 16);
    ctx.stroke();
  }

  for (let s = 0; s < 6; s++) {
    const sAng = (s * Math.PI) / 3 + rotAngle * 2;
    ctx.fillStyle = partyCols[s % partyCols.length];
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(Math.cos(sAng) * 45, Math.sin(sAng) * 45, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1.0;

  // 7. Dynamic Sweeping Concert Laser Beams
  const laserOrigins = [
    { x: danceX + 10, y: danceY + danceH - 5, targetAngle: Math.sin(now * 0.002) * 0.6 - 0.7 },
    { x: danceX + danceW - 10, y: danceY + danceH - 5, targetAngle: Math.sin(now * 0.0023 + 1) * 0.6 - 2.4 },
    { x: danceX + 10, y: danceY + 10, targetAngle: Math.sin(now * 0.0026 + 2) * 0.5 + 0.4 },
    { x: danceX + danceW - 10, y: danceY + 10, targetAngle: Math.sin(now * 0.0021 + 3) * 0.5 + 2.7 }
  ];
  const beamColors = ['rgba(6, 182, 212, 0.45)', 'rgba(236, 72, 153, 0.45)', 'rgba(250, 204, 21, 0.45)', 'rgba(168, 85, 247, 0.45)'];
  laserOrigins.forEach((l, idx) => {
    ctx.save();
    ctx.strokeStyle = beamColors[idx % beamColors.length];
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 14;
    ctx.shadowColor = beamColors[idx % beamColors.length];
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    const beamLen = 220;
    ctx.lineTo(l.x + Math.cos(l.targetAngle) * beamLen, l.y + Math.sin(l.targetAngle) * beamLen);
    ctx.stroke();
    ctx.restore();
  });

  // 8. Elevated Mega DJ Mainstage (x: 2380 to 2620, y: 1040 to 1130)
  const stageX = 2380;
  const stageY = 1040;
  const stageW = 240;
  const stageH = 85;

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(stageX, stageY, stageW, stageH, 8);
  ctx.fill();
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // LED Video Wall Backdrop (16 Graphic Equalizer Bars)
  const eqX = stageX + 15;
  const eqY = stageY + 8;
  const eqW = stageW - 30;
  ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
  ctx.fillRect(eqX, eqY, eqW, 28);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.strokeRect(eqX, eqY, eqW, 28);

  const numBars = 16;
  const barW = (eqW - 8) / numBars;
  for (let b = 0; b < numBars; b++) {
    const barH = 4 + Math.abs(Math.sin(now * 0.013 + b * 0.6)) * 20;
    ctx.fillStyle = b < 6 ? '#22c55e' : (b < 12 ? '#facc15' : '#ef4444');
    ctx.fillRect(eqX + 4 + b * barW, eqY + 26 - barH, barW - 2, barH);
  }

  // Twin Mega Subwoofer Speaker Towers (Left & Right of stage)
  const speakers = [
    { x: stageX - 25, y: stageY + 10 },
    { x: stageX + stageW + 5, y: stageY + 10 }
  ];
  speakers.forEach((spk) => {
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(spk.x, spk.y, 20, 65);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(spk.x, spk.y, 20, 65);

    const bassPump = Math.sin(now * 0.02) * 2;
    for (let w = 0; w < 2; w++) {
      const wy = spk.y + 18 + w * 28;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(spk.x + 10, wy, 7 + bassPump, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  });

  // DJ Console Desk
  const deskX = 2450;
  const deskY = stageY + 45;
  const deskW = 100;
  const deskH = 30;

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(deskX, deskY, deskW, deskH, 4);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(deskX + 22, deskY + 15, 11, 0, Math.PI * 2);
  ctx.arc(deskX + deskW - 22, deskY + 15, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // DJ Rohit on Stage
  const djX = 2500;
  const djY = stageY + 36;
  ctx.save();
  ctx.translate(djX, djY);

  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.roundRect(-8, -10, 16, 14, [4, 4, 1, 1]);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -6, 4, 0, Math.PI);
  ctx.stroke();

  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, -16, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-6, -18, 12, 4);

  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-9, -21, 3, 9);
  ctx.fillRect(6, -21, 3, 9);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -20, 8.5, Math.PI * 0.9, Math.PI * 2.1);
  ctx.stroke();

  const scratch = Math.sin(now * 0.02) * 5;
  const fist = Math.sin(now * 0.016) * 6;
  ctx.strokeStyle = '#fed7aa';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(-16 + scratch, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, -6);
  ctx.lineTo(16, -16 + fist);
  ctx.stroke();
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(16, -16 + fist, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 9.5px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f472b6';
  ctx.fillText('🎧 DJ ROHIT (Big Club Resident) 🎧', 0, -32);

  const djBubble = bigClub?.bubble || '🔥 DJ ROHIT: "Drop the bass! Welcome to The Big Club! 🔊✨"';
  ctx.font = 'bold 9.5px "Outfit", sans-serif';
  const bubbleWidth = ctx.measureText(djBubble).width + 16;
  ctx.fillStyle = 'rgba(23, 15, 38, 0.96)';
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-bubbleWidth / 2, -64, bubbleWidth, 20, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fef08a';
  ctx.fillText(djBubble, 0, -50);
  ctx.restore();

  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('[ 🎧 Tap DJ / Press E to Open Jukebox ]', 2500, stageY + stageH + 16);

  // 9. VIP Luxury Sofa Lounge (West Wing: x: 2275 to 2345, y: 850 to 1025)
  const lX = 2275;
  const lY = 850;
  const lW = 75;
  const lH = 175;

  ctx.fillStyle = 'rgba(88, 28, 135, 0.4)';
  ctx.beginPath();
  ctx.roundRect(lX, lY, lW, lH, 10);
  ctx.fill();
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const couches = [
    { y: lY + 15 },
    { y: lY + 70 },
    { y: lY + 125 }
  ];
  couches.forEach((c) => {
    ctx.fillStyle = '#701a75';
    ctx.beginPath();
    ctx.roundRect(lX + 8, c.y, 58, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(lX + 37, c.y + 34, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(lX + 37, c.y + 34, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.font = 'bold 9px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5d0fe';
  ctx.fillText('🛋️ VIP LOUNGE', lX + 37, lY + lH + 14);

  // 10. Neon Mocktail Bar (East Wing: x: 2650 to 2725, y: 850 to 1025)
  const bX = 2650;
  const bY = 850;
  const barAreaW = 75;
  const barAreaH = 175;

  ctx.fillStyle = 'rgba(14, 116, 144, 0.4)';
  ctx.beginPath();
  ctx.roundRect(bX, bY, barAreaW, barAreaH, 10);
  ctx.fill();
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#0e7490';
  ctx.beginPath();
  ctx.roundRect(bX + 8, bY + 30, 24, 115, 4);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const bCols = ['#ec4899', '#facc15', '#06b6d4', '#10b981', '#a855f7'];
  for (let bi = 0; bi < 8; bi++) {
    const byy = bY + 40 + bi * 12;
    ctx.fillStyle = bCols[bi % bCols.length];
    ctx.fillRect(bX + 48, byy, 6, 9);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(bX + 49, byy - 2, 4, 3);
  }

  // Bartender "Rocky"
  ctx.save();
  const barTenderX = bX + 50;
  const barTenderY = bY + 90;
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(barTenderX, barTenderY - 10, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(barTenderX - 5, barTenderY - 4, 10, 14);
  ctx.font = 'bold 8px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('🍸 Rocky (Bar)', barTenderX, barTenderY - 20);
  ctx.restore();

  ctx.font = 'bold 9px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('🍸 VIP BAR', bX + 37, bY + barAreaH + 14);

  // 11. NPC Dancers Grooving on The Big Club Floor
  const dancers = bigClub?.dancers || [];
  dancers.forEach((dancer) => {
    ctx.save();
    const bob = Math.sin(now * 0.015 + (dancer.danceOffset || dancer.x)) * 4.5;
    const sway = Math.cos(now * 0.012 + (dancer.danceOffset || dancer.y)) * 3.5;

    ctx.translate(dancer.x + sway, dancer.y + bob);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 11 - bob, 8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = dancer.outfit?.bottom || '#0f172a';
    ctx.fillRect(-5, 2, 3, 9);
    ctx.fillRect(2, 2, 3, 9);

    ctx.fillStyle = dancer.outfit?.top || dancer.color || '#ec4899';
    ctx.beginPath();
    ctx.roundRect(-7, -10, 14, 13, [3, 3, 1, 1]);
    ctx.fill();

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -15, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, -17, 6.5, Math.PI, 0);
    ctx.fill();

    // Animated hands pumping up and down on the dance floor
    const dHandPump = Math.sin(now * 0.014 + (dancer.danceOffset || dancer.x)) * 6;
    ctx.strokeStyle = dancer.outfit?.top || dancer.color || '#ec4899';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(-10, -13 - dHandPump);
    ctx.moveTo(6, -6);
    ctx.lineTo(10, -13 + dHandPump);
    ctx.stroke();
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(-10, -13 - dHandPump, 2, 0, Math.PI * 2);
    ctx.arc(10, -13 + dHandPump, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 8.5px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fef08a';
    ctx.fillText(`${dancer.name} 💃`, 0, -24);
    ctx.restore();
  });

  // 12. Remote Players inside The Big Club
  if (remotePlayers && remotePlayers.size > 0) {
    remotePlayers.forEach((rem) => {
      if (rem.x >= danceX && rem.x <= danceX + danceW && rem.y >= danceY && rem.y <= danceY + danceH) {
        ctx.save();
        ctx.font = '12px serif';
        ctx.fillStyle = '#ec4899';
        ctx.fillText('🪩', rem.x + 8, rem.y - 45);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('🎶', rem.x - 8, rem.y - 42);
        ctx.restore();
      }
    });
  }

  // 13. Approach Guide text when player is standing near The Big Club (outside dance floor)
  const distToClub = dist(player.x, player.y, 2500, 950);
  const isInsideFloor = player.x >= danceX && player.x <= danceX + danceW && player.y >= danceY && player.y <= danceY + danceH;
  if (!isInsideFloor && distToClub < 220 && !player.isSitting) {
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#000000';
    ctx.fillStyle = '#f472b6';
    ctx.font = 'bold 11.5px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪩 [ Step onto the LED Floor to Dance & Party at The Big Club! ] 🔊', 2500, 842);
    ctx.restore();
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
  isDancing = false,
  danceStep = 0,
  gunFight = null
) {
  const now = performance.now();
  const dancing = isLocal ? isDancing : Boolean(char.isDancing);
  const currentStep = isLocal ? danceStep : (char.danceStep || 0);
  const activeStep = DANCE_STEPS[currentStep % DANCE_STEPS.length] || DANCE_STEPS[0];
  const stepId = dancing ? activeStep.id : null;
  const isSitting = char.isSitting;

  ctx.save();
  ctx.translate(char.x, char.y);

  // Scaled character model for enhanced visibility and festive detail
  const CHAR_SCALE = 1.4;
  ctx.scale(CHAR_SCALE, CHAR_SCALE);

  // Ground shadow (drawn before body translation so shadow anchors naturally to the floor)
  let shadowScaleX = 13;
  let shadowScaleY = 5;
  if (dancing) {
    if (stepId === 'mega_jump') {
      const jumpRatio = Math.min(1, Math.abs(Math.sin(now * 0.007)));
      shadowScaleX = Math.max(5, 16 * (1 - jumpRatio * 0.65));
      shadowScaleY = Math.max(2, 6 * (1 - jumpRatio * 0.65));
    } else {
      shadowScaleX = 13 + Math.sin(now * 0.012) * 1.5;
    }
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 13, shadowScaleX, shadowScaleY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dynamic dance choreographies: Body Bob, Hip Sway, and Tilt Rotation
  let jumpBob = 0;
  let hipSway = 0;
  let danceAngle = 0;

  if (dancing && !isSitting) {
    if (stepId === 'bhangra') {
      jumpBob = -Math.abs(Math.sin(now * 0.016)) * 4.5;
      danceAngle = Math.sin(now * 0.008) * 0.12;
    } else if (stepId === 'bollywood') {
      hipSway = Math.sin(now * 0.010) * 5.0;
      jumpBob = -Math.abs(Math.cos(now * 0.010)) * 2.5;
      danceAngle = Math.sin(now * 0.010) * 0.16;
    } else if (stepId === 'mega_jump') {
      // SKY ROCKET MEGA JUMP! High aerial vertical jump soaring 26px into the air!
      const jumpCycle = Math.abs(Math.sin(now * 0.007));
      jumpBob = -jumpCycle * 26;
      danceAngle = Math.sin(now * 0.007) * 0.12;
    } else if (stepId === 'naagin') {
      // CLASSIC NAAGIN DANCE! Low crouching snake wave slithering left and right
      jumpBob = 4 + Math.sin(now * 0.012) * 3;
      hipSway = Math.sin(now * 0.014) * 8;
      danceAngle = Math.cos(now * 0.014) * 0.22;
    } else if (stepId === 'disco') {
      hipSway = Math.sin(now * 0.012) * 3.5;
      jumpBob = -Math.abs(Math.sin(now * 0.012)) * 3.0;
      danceAngle = Math.sin(now * 0.012) * 0.14;
    } else if (stepId === 'wave') {
      hipSway = Math.sin(now * 0.008) * 4.0;
      jumpBob = Math.sin(now * 0.016) * 2.0;
      danceAngle = Math.sin(now * 0.008) * 0.10;
    } else if (stepId === 'hiphop') {
      jumpBob = -Math.abs(Math.sin(now * 0.020)) * 4.0;
      hipSway = Math.sin(now * 0.020) * 2.5;
      danceAngle = Math.sin(now * 0.020) * 0.13;
    } else {
      jumpBob = -Math.abs(Math.sin(now * 0.015)) * 3.5;
      danceAngle = Math.sin(now * 0.015) * 0.25;
    }

    ctx.translate(hipSway, jumpBob);
    ctx.rotate(danceAngle);
  }

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
      const t = now * 0.005;
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
      ctx.arc(Math.cos(now * 0.006) * 16, -10, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Floating festive musical notes when dancing
  if (dancing) {
    const t = now * 0.004;
    ctx.font = '12px serif';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('🎵', -12 + Math.sin(t) * 4, -48);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('🎶', 12 + Math.cos(t) * 4, -52);
  }

  // Legs rendering
  ctx.fillStyle = char.outfit?.bottom || char.bottomColor || '#f8fafc';
  if (isSitting) {
    // Seated folded legs
    ctx.fillRect(-7, 3, 14, 5);
  } else if (dancing) {
    if (stepId === 'bhangra') {
      const kickPhase = Math.sin(now * 0.016);
      const leftLift = kickPhase > 0 ? kickPhase * 4.5 : 0;
      const rightLift = kickPhase < 0 ? -kickPhase * 4.5 : 0;
      ctx.fillRect(-6, 2, 4, 11 - leftLift);
      ctx.fillRect(2, 2, 4, 11 - rightLift);
    } else if (stepId === 'bollywood') {
      const legCurve = Math.sin(now * 0.010) * 2.5;
      ctx.fillRect(-6 + legCurve * 0.4, 2, 4, 11);
      ctx.fillRect(2 + legCurve * 0.4, 2, 4, 11);
    } else if (stepId === 'mega_jump') {
      // Tucked legs during high leap in air
      const isHigh = Math.abs(jumpBob) > 12;
      const legLen = isHigh ? 6 : 11;
      ctx.fillRect(-6, 2, 4, legLen);
      ctx.fillRect(2, 2, 4, legLen);
    } else if (stepId === 'naagin') {
      // Low crouching snake knees
      ctx.fillRect(-7, 2, 5, 8);
      ctx.fillRect(2, 2, 5, 8);
    } else if (stepId === 'disco') {
      ctx.fillRect(-7, 2, 4, 11);
      ctx.fillRect(3, 2, 4, 11);
    } else if (stepId === 'hiphop') {
      const shuf = Math.sin(now * 0.024) * 2.5;
      ctx.fillRect(-6 + shuf, 2, 4, 11);
      ctx.fillRect(2 - shuf, 2, 4, 11);
    } else {
      ctx.fillRect(-6, 2, 4, 11);
      ctx.fillRect(2, 2, 4, 11);
    }
  } else {
    const walkOffset = char.isMoving ? Math.sin(char.walkFrame || (now * 0.01)) * 4 : 0;
    ctx.fillRect(-6, 2, 4, 11 + walkOffset);
    ctx.fillRect(2, 2, 4, 11 - walkOffset);
  }

  // Torso / Kurta
  const sleeveCol = char.outfit?.top || char.color || '#ea580c';
  const skinCol = '#fed7aa';

  ctx.fillStyle = sleeveCol;
  ctx.beginPath();
  ctx.roundRect(-9, -12, 18, 16, [4, 4, 2, 2]);
  ctx.fill();

  // Kurta golden border
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-8, -12, 3, 16);

  // Head
  ctx.fillStyle = skinCol;
  ctx.beginPath();
  ctx.arc(0, -18, 8, 0, Math.PI * 2);
  ctx.fill();

  // Turban or Hair
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

  // If sitting: character is holding and sipping hot kulhad chai
  if (isSitting) {
    ctx.save();
    ctx.fillStyle = skinCol;
    ctx.beginPath();
    ctx.arc(-4, -1, 3, 0, Math.PI * 2);
    ctx.arc(4, -1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Terracotta Kulhad cup
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.lineTo(4, -5);
    ctx.lineTo(3, 2);
    ctx.lineTo(-3, 2);
    ctx.closePath();
    ctx.fill();

    // Hot Chai surface
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.ellipse(0, -5, 3.5, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rising steam curls
    const st = now * 0.005;
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.75)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(Math.sin(st) * 2, -7);
    ctx.quadraticCurveTo(Math.sin(st + 1) * 3, -11, Math.sin(st + 2) * 2, -16);
    ctx.stroke();
    ctx.restore();
  }

  // Equipped Weapon or Bomb / Cracker in Hand
  const holding = selectedCracker || (char.holdingCracker ? (CRACKER_MAP[char.holdingCracker] || { id: char.holdingCracker }) : null);

  // Dynamic Arms & Hands (UP and DOWN with rich festive choreography!)
  if (!isSitting) {
    const lsX = -8, lsY = -9;
    const rsX = 8, rsY = -9;

    let lhX = -11, lhY = 0, leX = -10, leY = -5;
    let rhX = 11, rhY = 0, reX = 10, reY = -5;
    let showSparkleOnRightHand = false;

    if (dancing) {
      if (stepId === 'bhangra') {
        // 1. BHANGRA: Both hands pump high up into the air (-38) and down to shoulders (-14)!
        const pump = (Math.sin(now * 0.016) + 1) * 0.5; // 0 to 1
        lhY = -14 - pump * 24;
        rhY = -14 - pump * 24;
        lhX = -11 - pump * 3;
        rhX = 11 + pump * 3;
        leY = -11 - pump * 14;
        reY = -11 - pump * 14;
        leX = -12 - pump * 4;
        reX = 12 + pump * 4;
      } else if (stepId === 'bollywood') {
        // 2. BOLLYWOOD: Alternating hands going up and down (-39 to -3)!
        const swap = Math.sin(now * 0.010); // -1 to +1
        lhY = -21 - swap * 18;
        lhX = -10 - (swap > 0 ? 4 : 1);
        leX = -12 - (swap > 0 ? 3 : 1);
        leY = -11 - (swap > 0 ? 10 : 0);

        rhY = -21 + swap * 18;
        rhX = 10 + (swap < 0 ? 4 : 1);
        reX = 12 + (swap < 0 ? 3 : 1);
        reY = -11 - (swap < 0 ? 10 : 0);
      } else if (stepId === 'mega_jump') {
        // 3. SKY ROCKET MEGA JUMP: Both hands thrown way up into the sky (-42)!
        const jumpH = Math.min(1, Math.abs(jumpBob) / 16);
        lhX = -12 - jumpH * 4;
        lhY = -20 - jumpH * 22; // shoots up to -42!
        leX = -13 - jumpH * 2;
        leY = -15 - jumpH * 14;

        rhX = 12 + jumpH * 4;
        rhY = -20 - jumpH * 22; // shoots up to -42!
        reX = 13 + jumpH * 2;
        reY = -15 - jumpH * 14;
      } else if (stepId === 'naagin') {
        // 4. ICONIC NAAGIN DANCE: Hands joined together overhead in cobra hood pose!
        lhX = -2;
        lhY = -38;
        leX = -10;
        leY = -24;

        rhX = 2;
        rhY = -38;
        reX = 10;
        reY = -24;
      } else if (stepId === 'disco') {
        // 7. DISCO: Right hand points to the sky (-40) and sweeps down to hip (+2)
        const discoT = Math.sin(now * 0.013); // -1 to +1
        rhX = 4 + discoT * 13;
        rhY = -19 - discoT * 21;
        reX = 8 + discoT * 5;
        reY = -12 - discoT * 9;
        if (discoT > 0.45) showSparkleOnRightHand = true;

        lhX = -12;
        lhY = -2 + discoT * 8;
        leX = -11;
        leY = -6;
      } else if (stepId === 'wave') {
        // 8. WAVE: Both hands high overhead (-35), waving left and right together
        const waveLateral = Math.sin(now * 0.008) * 9;
        const waveBob = Math.sin(now * 0.016) * 3.5;
        lhX = -11 + waveLateral;
        lhY = -35 + waveBob;
        leX = -13 + waveLateral * 0.7;
        leY = -22 + waveBob * 0.5;

        rhX = 11 + waveLateral;
        rhY = -35 + waveBob;
        reX = 13 + waveLateral * 0.7;
        reY = -22 + waveBob * 0.5;
      } else if (stepId === 'hiphop') {
        // 9. HIP-HOP: Cross chest (-7) to explosive upward throw (-37)
        const hipPhase = (Math.sin(now * 0.020) + 1) * 0.5;
        lhX = -3 - hipPhase * 14;
        lhY = -7 - hipPhase * 30;
        leX = -7 - hipPhase * 6;
        leY = -6 - hipPhase * 16;

        rhX = 3 + hipPhase * 14;
        rhY = -7 - hipPhase * 30;
        reX = 7 + hipPhase * 6;
        reY = -6 - hipPhase * 16;
      }
    } else {
      // Normal standing / walking
      const walkSwing = Math.sin(char.walkFrame || (now * 0.01)) * (char.isMoving ? 3.5 : 0.8);
      lhX = -11;
      lhY = 0 + walkSwing;
      leX = -10;
      leY = -5;

      if (holding) {
        rhX = 12;
        rhY = -4;
        reX = 11;
        reY = -6;
      } else {
        rhX = 11;
        rhY = 0 - walkSwing;
        reX = 10;
        reY = -5;
      }
    }

    // Left Arm (Sleeve + Skin + Hand)
    ctx.strokeStyle = sleeveCol;
    ctx.lineWidth = 3.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lsX, lsY);
    ctx.lineTo(leX, leY);
    ctx.stroke();

    ctx.strokeStyle = skinCol;
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(leX, leY);
    ctx.lineTo(lhX, lhY);
    ctx.stroke();

    ctx.fillStyle = skinCol;
    ctx.beginPath();
    ctx.arc(lhX, lhY, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Right Arm (Sleeve + Skin + Hand)
    ctx.strokeStyle = sleeveCol;
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.moveTo(rsX, rsY);
    ctx.lineTo(reX, reY);
    ctx.stroke();

    ctx.strokeStyle = skinCol;
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(reX, reY);
    ctx.lineTo(rhX, rhY);
    ctx.stroke();

    ctx.fillStyle = skinCol;
    ctx.beginPath();
    ctx.arc(rhX, rhY, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle star on right fingertip during disco pointing
    if (showSparkleOnRightHand) {
      ctx.fillStyle = '#fef08a';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#facc15';
      ctx.beginPath();
      ctx.arc(rhX, rhY - 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

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
    // 6. Rainbow Mashaal (Magic Sparkler Torch)
    else if (holding.id === 'colorphuljhadi') {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(8, -4);
      ctx.lineTo(19, -17);
      ctx.stroke();

      ctx.fillStyle = '#ec4899';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#06b6d4';
      ctx.beginPath();
      ctx.arc(19, -17, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(19, -17, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    // 7. Bullet Bomb
    else if (holding.id === 'bulletbomb') {
      ctx.save();
      ctx.translate(14, -4);
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#3f6212';
      ctx.beginPath();
      ctx.roundRect(-4, -6, 8, 12, 2);
      ctx.fill();
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-4, -1, 8, 3);
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(4, -6);
      ctx.lineTo(-4, -6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // 8. Mahabali Atom Bomb
    else if (holding.id === 'atombomb') {
      ctx.save();
      ctx.translate(14, -4);
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#dc2626';
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(-6, -6, 12, 12, 2);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-6, -6, 12, 12);
      ctx.restore();
    }
    // 9. Kala Naag Snake Tablet
    else if (holding.id === 'saapgoli') {
      ctx.save();
      ctx.translate(13, -3);
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
    // 10. Mayur Pankh Peacock Fountain
    else if (holding.id === 'mayurpankh') {
      ctx.save();
      ctx.translate(13, -4);
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(6, 4);
      ctx.lineTo(-6, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // 11. Triranga UFO Chakri
    else if (holding.id === 'tri_chakri') {
      ctx.save();
      ctx.translate(13, -4);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
    // 12. Seeti Whistling Rocket
    else if (holding.id === 'seetirocket') {
      ctx.save();
      ctx.translate(13, -5);
      ctx.rotate(-0.35);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-1, 0, 2, 16);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(-3, -10, 6, 10);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-3, -10);
      ctx.lineTo(0, -15);
      ctx.lineTo(3, -10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // 13. Swarna Varsha Cake
    else if (holding.id === 'swarnavarsha') {
      ctx.save();
      ctx.translate(14, -3);
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(-7, -5, 14, 10, 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(-7, -5, 14, 10);
      ctx.restore();
    }
    // 14. Pop-Pop Snappers
    else if (holding.id === 'poppops') {
      ctx.save();
      ctx.translate(13, -3);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.lineTo(-3, -3);
      ctx.lineTo(3, -3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // Generic icon
    else if (holding.icon) {
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText(holding.icon, 15, -4);
    }

    // Overhead equipped item badge (positioned cleanly above player name)
    const badgeText = `${holding.icon || '✨'} ${holding.name || 'Item'}`;
    ctx.font = 'bold 8.5px "Outfit", sans-serif';
    const btw = ctx.measureText(badgeText).width;
    ctx.fillStyle = 'rgba(23, 16, 36, 0.88)';
    ctx.strokeStyle = holding.isWeapon ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-btw / 2 - 5, -63, btw + 10, 14, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, 0, -52);
  }

  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.textAlign = 'center';

  const nameY = -35;

  if (isLocal) {
    ctx.fillStyle = char.isSitting ? '#fed7aa' : (dancing ? '#f43f5e' : '#fbbf24');
    ctx.fillText(`${char.name || 'You'} ${char.isSitting ? '☕ (Sipping Chai)' : '(You)'}`, 0, nameY);
  } else if (isRemote) {
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`🟢 ${char.name || 'Player'} ${char.isSitting ? '☕ (Chai)' : '(Online)'}`, 0, nameY);
  } else {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(char.name, 0, nameY);
    ctx.font = '8px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(char.role || 'Visitor', 0, nameY + 9);
  }

  // Mini Health Bar during active Gun Fight duel
  if (gunFight && (gunFight.status === 'ACTIVE' || gunFight.status === 'COUNTDOWN')) {
    const isPlayerInFight = isLocal;
    const isOpponentInFight = isRemote && char.id === gunFight.opponentId;
    if (isPlayerInFight || isOpponentInFight) {
      const hp = isPlayerInFight ? gunFight.myHp : gunFight.opponentHp;
      const barW = 34;
      const barH = 5;
      const barX = -barW / 2;
      const barY = nameY - 14;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = hp > 50 ? '#22c55e' : hp > 25 ? '#eab308' : '#ef4444';
      ctx.fillRect(barX, barY, (barW * Math.max(0, hp)) / 100, barH);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
    }
  } else if (isRemote && (!gunFight || gunFight.status === 'IDLE')) {
    // Show clickable duel prompt badge above remote players
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.fillText('⚔️ Tap to Gun Fight 🔫', 0, nameY + 11);
  }

  if (char.bubble) {
    ctx.font = '10px "Outfit", sans-serif';
    const textWidth = ctx.measureText(char.bubble).width;
    const pad = 8;
    const bw = textWidth + pad * 2;
    const bh = 22;
    const bx = -bw / 2;
    const by = holding ? -92 : -68;

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

  if (player.x >= 1850) {
    // Inside New Fairground
    const dConnectingGate = dist(player.x, player.y, MELA_ZONES.NEW_GROUND_GATE.x, MELA_ZONES.NEW_GROUND_GATE.y);
    if (dConnectingGate > 180) {
      drawCompassArrow(ctx, player.x, player.y, MELA_ZONES.NEW_GROUND_GATE.x, MELA_ZONES.NEW_GROUND_GATE.y, '🏮 Mela Gate', '#f59e0b');
    }
    const dChowk = dist(player.x, player.y, MELA_ZONES.UTSAV_CHOWK.x, MELA_ZONES.UTSAV_CHOWK.y);
    if (dChowk > 280) {
      drawCompassArrow(ctx, player.x, player.y, MELA_ZONES.UTSAV_CHOWK.x, MELA_ZONES.UTSAV_CHOWK.y, '✨ Utsav Chowk', '#38bdf8');
    }
  } else {
    // Inside Main Diwali Mela
    const dShop = dist(player.x, player.y, MELA_ZONES.CRACKER_SHOP.x, MELA_ZONES.CRACKER_SHOP.y);
    if (dShop > 520) {
      drawCompassArrow(ctx, player.x, player.y, MELA_ZONES.CRACKER_SHOP.x, MELA_ZONES.CRACKER_SHOP.y, '🧨 Shop', '#ef4444');
    }

    const dRavan = dist(player.x, player.y, MELA_ZONES.RAVAN.x, MELA_ZONES.RAVAN.y);
    if (dRavan > 580) {
      drawCompassArrow(ctx, player.x, player.y, MELA_ZONES.RAVAN.x, MELA_ZONES.RAVAN.y, '👹 Ravan (10M HP)', '#f97316');
    }

    const dEastGate = dist(player.x, player.y, MELA_ZONES.NEW_GROUND_GATE.x, MELA_ZONES.NEW_GROUND_GATE.y);
    if (dEastGate > 140) {
      drawCompassArrow(ctx, player.x, player.y, MELA_ZONES.NEW_GROUND_GATE.x, MELA_ZONES.NEW_GROUND_GATE.y, '🚪 East Gate', '#38bdf8');
    }
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
  const isDefeated = ravanHp <= 0;
  const hpRatio = Math.max(0, Math.min(1.0, ravanHp / 10000000));
  const fillW = isDefeated ? 0 : Math.max(2, trackW * hpRatio);

  if (fillW > 0) {
    const hpGrad = ctx.createLinearGradient(trackX, trackY, trackX + trackW, trackY);
    hpGrad.addColorStop(0, '#dc2626');
    hpGrad.addColorStop(0.7, '#ea580c');
    hpGrad.addColorStop(1, '#f59e0b');

    ctx.fillStyle = hpGrad;
    ctx.beginPath();
    ctx.roundRect(trackX, trackY, fillW, trackH, 7);
    ctx.fill();
  }

  // HP Numbers & Percentage
  const formattedHp = ravanHp.toLocaleString('en-IN');
  const percentStr = (hpRatio * 100).toFixed(4) + '%';
  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 4;
  ctx.shadowColor = '#000000';
  if (isDefeated) {
    ctx.fillStyle = '#4ade80';
    ctx.fillText('👹 RAVAN DEFEATED! 0 / 10,000,000 HP (VICTORY / विजयी!) 🎆', 0, trackY + 11);
  } else {
    ctx.fillText(`HP: ${formattedHp} / 10,000,000 (${percentStr})`, 0, trackY + 11);
  }
  ctx.shadowBlur = 0;

  // Subtitle / Raid hint
  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('🏹 1 Shot = -100 HP • Shoot with Ram Dhanush or Gun 🔫', 0, barY + 65);

  ctx.restore();

  ctx.restore();
}

// -------------------------------------------------------------
// GRAND RAVAN DAHAN ARENA GATE (भव्य रावण दहन प्रवेश द्वार)
// -------------------------------------------------------------
function renderRavanGate(ctx, world, player) {
  const gx = MELA_ZONES.RAVAN_GATE.x; // 1380
  const gy = MELA_ZONES.RAVAN_GATE.y; // 980
  const effigyTime = world.effigyTimer || 0;
  const distToPlayer = Math.hypot(player.x - gx, player.y - gy);
  const isPlayerInside = player.x >= 1380;

  ctx.save();

  // 1. Grand Red Carpet Threshold
  ctx.fillStyle = 'rgba(185, 28, 28, 0.85)';
  ctx.fillRect(gx - 40, gy - 25, 80, 50);

  // Gold Brocade Edges
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(gx - 40, gy - 25, 80, 50);

  // Threshold Center Brass Divider
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(gx - 2, gy - 25, 4, 50);

  // 2. Twin Pillars (North at gy - 45, South at gy + 45)
  const pillars = [
    { y: gy - 45, id: 1 },
    { y: gy + 45, id: 2 }
  ];

  pillars.forEach((p) => {
    // Pedestal Base
    ctx.fillStyle = '#451a03';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(gx - 14, p.y - 12, 28, 24, 4);
    ctx.fill();
    ctx.stroke();

    // Carved Sandstone Shaft
    ctx.fillStyle = '#78350f';
    ctx.fillRect(gx - 8, p.y - 42, 16, 30);

    // Gold Fluting Lines
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(gx - 2, p.y - 40, 4, 26);

    // Capital Bracket
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.roundRect(gx - 12, p.y - 50, 24, 8, 3);
    ctx.fill();

    // Brass Mashaal (Torch Bowl)
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(gx, p.y - 52, 10, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated Flickering Torch Flame
    const flicker = Math.sin(effigyTime * 0.18 + p.id * 3) * 2;
    const flameH = 14 + flicker;

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#f97316';

    // Outer Orange Flame
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(gx - 7, p.y - 53);
    ctx.quadraticCurveTo(gx - 4, p.y - 53 - flameH * 0.6, gx, p.y - 53 - flameH);
    ctx.quadraticCurveTo(gx + 4, p.y - 53 - flameH * 0.6, gx + 7, p.y - 53);
    ctx.closePath();
    ctx.fill();

    // Inner Yellow Flame
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(gx - 4, p.y - 53);
    ctx.quadraticCurveTo(gx - 2, p.y - 53 - flameH * 0.4, gx, p.y - 53 - flameH * 0.7);
    ctx.quadraticCurveTo(gx + 2, p.y - 53 - flameH * 0.4, gx + 4, p.y - 53);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });

  // 3. Overhead Toran & Arch Beam
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(gx, gy - 45);
  ctx.lineTo(gx, gy + 45);
  ctx.stroke();

  // Hanging Marigold Garlands (Double Swag across opening)
  for (let sw = -1; sw <= 1; sw += 2) {
    const midX = gx - sw * 6;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(gx, gy - 45);
    ctx.quadraticCurveTo(midX, gy, gx, gy + 45);
    ctx.stroke();
  }

  // Marigold & Mango Leaf rosettes along arch
  for (let ay = gy - 40; ay <= gy + 40; ay += 16) {
    // Leaf
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(gx - 6, ay, 5, 2.5, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Marigold
    ctx.fillStyle = ay % 32 === 0 ? '#f59e0b' : '#ea580c';
    ctx.beginPath();
    ctx.arc(gx, ay, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(gx, ay, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Regal Overhead Signboard
  ctx.save();
  ctx.translate(gx - 6, gy);

  // Plaque Background
  ctx.shadowBlur = 16;
  ctx.shadowColor = '#dc2626';
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.roundRect(-22, -42, 44, 84, 8);
  ctx.fill();

  // Plaque Gold Border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rotated text for vertical gate orientation facing west
  ctx.rotate(-Math.PI / 2);

  ctx.font = 'bold 11px "Cinzel", serif';
  ctx.fillStyle = '#fef08a';
  ctx.textAlign = 'center';
  ctx.fillText('👹 रावण दहन द्वार 🏹', 0, -4);

  ctx.font = 'bold 9px "Outfit", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('⚔️ RAVAN ARENA GATE ⚔️', 0, 8);

  ctx.restore();

  // 5. Interactive Proximity Prompt (Floating Badge)
  if (distToPlayer < 140) {
    const pulse = 1 + Math.sin(effigyTime * 0.08) * 0.04;
    ctx.save();
    ctx.translate(gx - 20, gy);
    ctx.scale(pulse, pulse);

    const promptText = isPlayerInside
      ? '🚪 [ Click Gate ] Exit Arena'
      : '🚪 [ Click Gate / Walk In ] Enter Ravan Arena ⚔️';

    ctx.font = 'bold 11px "Outfit", sans-serif';
    const textW = ctx.measureText(promptText).width;

    ctx.shadowBlur = 15;
    ctx.shadowColor = isPlayerInside ? '#38bdf8' : '#fbbf24';
    ctx.fillStyle = 'rgba(15, 10, 25, 0.92)';
    ctx.beginPath();
    ctx.roundRect(-textW / 2 - 12, -75, textW + 24, 26, 13);
    ctx.fill();

    ctx.strokeStyle = isPlayerInside ? '#38bdf8' : '#fbbf24';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(promptText, 0, -58);

    ctx.restore();
  }

  ctx.restore();
}

// -------------------------------------------------------------
// GRAND EAST GATE TO NEW GROUND (पूर्व द्वार - नया मैदान)
// -------------------------------------------------------------
function renderNewGroundGate(ctx, world, player) {
  const gx = MELA_ZONES.NEW_GROUND_GATE?.x || 1850;
  const gy = MELA_ZONES.NEW_GROUND_GATE?.y || 470;
  const distToPlayer = Math.hypot(player.x - gx, player.y - gy);
  const isPlayerInNewGround = player.x >= 1850;
  const animTime = performance.now() * 0.003;

  ctx.save();

  // 1. Red Velvet Carpet Threshold passing through Gate (x: 1790 to 1910, y: 380 to 560)
  ctx.fillStyle = 'rgba(185, 28, 28, 0.9)';
  ctx.fillRect(gx - 60, gy - 90, 120, 180);

  // Gold Brocade Trim
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(gx - 60, gy - 90, 120, 180);

  // Inlaid Brass Dividing Strip
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(gx - 2, gy - 90, 4, 180);

  // Auspicious Toran Rangoli Motif at threshold center
  ctx.save();
  ctx.translate(gx, gy);
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.stroke();
  for (let a = 0; a < 8; a++) {
    const angle = (a * Math.PI) / 4;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 14, Math.sin(angle) * 14, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = a % 2 === 0 ? '#f59e0b' : '#ea580c';
    ctx.fill();
  }
  ctx.restore();

  // 2. Twin Royal Sandstone Pillars (North at gy - 95, South at gy + 95)
  const pillars = [
    { y: gy - 95, id: 1 },
    { y: gy + 95, id: 2 }
  ];

  pillars.forEach((p) => {
    // Pedestal Base
    ctx.fillStyle = '#451a03';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(gx - 18, p.y - 16, 36, 32, 5);
    ctx.fill();
    ctx.stroke();

    // Carved Sandstone Shaft
    ctx.fillStyle = '#78350f';
    ctx.fillRect(gx - 12, p.y - 48, 24, 34);

    // Gold Fluting Lines
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(gx - 3, p.y - 46, 6, 30);

    // Capital Bracket
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.roundRect(gx - 16, p.y - 58, 32, 10, 4);
    ctx.fill();

    // Brass Urli / Mashaal (Eternal Flame Bowl)
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(gx, p.y - 60, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated Flickering Torch Flame
    const flicker = Math.sin(animTime * 3 + p.id * 2) * 2.5;
    const flameH = 16 + flicker;

    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f97316';

    // Outer Orange Flame
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(gx - 8, p.y - 61);
    ctx.quadraticCurveTo(gx - 5, p.y - 61 - flameH * 0.6, gx, p.y - 61 - flameH);
    ctx.quadraticCurveTo(gx + 5, p.y - 61 - flameH * 0.6, gx + 8, p.y - 61);
    ctx.closePath();
    ctx.fill();

    // Inner Yellow Core
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(gx - 5, p.y - 61);
    ctx.quadraticCurveTo(gx - 2, p.y - 61 - flameH * 0.4, gx, p.y - 61 - flameH * 0.7);
    ctx.quadraticCurveTo(gx + 2, p.y - 61 - flameH * 0.4, gx + 5, p.y - 61);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });

  // 3. Overhead Toran & Arch Beam connecting North & South Pillars
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(gx, gy - 95);
  ctx.lineTo(gx, gy + 95);
  ctx.stroke();

  // Double Swag Marigold Garlands
  for (let sw = -1; sw <= 1; sw += 2) {
    const midX = gx - sw * 10;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(gx, gy - 95);
    ctx.quadraticCurveTo(midX, gy, gx, gy + 95);
    ctx.stroke();
  }

  // Marigold & Mango Leaf rosettes along arch
  for (let ay = gy - 90; ay <= gy + 90; ay += 18) {
    // Mango Leaf
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(gx - 7, ay, 6, 3, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Marigold Bloom
    ctx.fillStyle = ay % 36 === 0 ? '#f59e0b' : '#ea580c';
    ctx.beginPath();
    ctx.arc(gx, ay, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(gx, ay, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Regal Overhead Signboard
  ctx.save();
  ctx.translate(gx - 8, gy);

  // Plaque Background (Crimson & Gold)
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#f59e0b';
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.roundRect(-24, -60, 48, 120, 8);
  ctx.fill();

  // Plaque Gold Border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Rotated text facing player's side of the gate
  if (isPlayerInNewGround) {
    ctx.rotate(Math.PI / 2);
    ctx.font = 'bold 12px "Cinzel", serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText('🏮 मुख्य द्वार • WEST GATE 🏮', 0, -5);

    ctx.font = 'bold 10px "Outfit", sans-serif';
    ctx.fillStyle = '#fed7aa';
    ctx.fillText('🪔 MAIN DIWALI MELA ➜', 0, 9);
  } else {
    ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 12px "Cinzel", serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText('🚪 पूर्व द्वार • EAST GATE 🚪', 0, -5);

    ctx.font = 'bold 10px "Outfit", sans-serif';
    ctx.fillStyle = '#fed7aa';
    ctx.fillText('✨ NEW FAIRGROUND (नया मैदान) ➜', 0, 9);
  }

  ctx.restore();

  // 5. Interactive Proximity Prompt (Floating Badge)
  if (distToPlayer < 130) {
    const pulse = 1 + Math.sin(animTime * 2.5) * 0.04;
    ctx.save();
    ctx.translate(gx - 25, gy);
    ctx.scale(pulse, pulse);

    const promptText = isPlayerInNewGround
      ? '🏮 [ Tap Gate / Press E ] Return to Main Diwali Mela'
      : '🚪 [ Tap Gate / Walk Through ] Enter New Fairground ✨';

    ctx.font = 'bold 11px "Outfit", sans-serif';
    const textW = ctx.measureText(promptText).width;

    ctx.shadowBlur = 16;
    ctx.shadowColor = isPlayerInNewGround ? '#38bdf8' : '#fbbf24';
    ctx.fillStyle = 'rgba(15, 10, 25, 0.94)';
    ctx.beginPath();
    ctx.roundRect(-textW / 2 - 12, -80, textW + 24, 26, 13);
    ctx.fill();

    ctx.strokeStyle = isPlayerInNewGround ? '#38bdf8' : '#fbbf24';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(promptText, 0, -63);

    ctx.restore();
  }

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

// -------------------------------------------------------------
// NPC GUN DUEL MASTER: VEER (वीर - गन फाइट मास्टर)
// -------------------------------------------------------------
function renderVeerNpc(ctx, world, player, gunFight) {
  const vx = 1180;
  const vy = 880;
  const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);
  const isNear = dist(player.x, player.y, vx, vy) < 130;
  const inDuel = gunFight && (gunFight.status === 'ACTIVE' || gunFight.status === 'COUNTDOWN') && gunFight.opponentId === 'npc_veer';

  ctx.save();
  ctx.translate(vx, vy);

  // Scaled character model for Veer
  const SCALE = 1.4;
  ctx.scale(SCALE, SCALE);

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 13, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle breathing idle animation
  const bob = Math.sin(performance.now() * 0.005) * 1.5;
  ctx.translate(0, bob);

  // Legs / Dhoti
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-7, 4, 5, 9);
  ctx.fillRect(2, 4, 5, 9);

  // Body / Kurta (Royal Crimson & Gold vest)
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(-9, -10, 18, 15);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-2, -10, 4, 15);

  // Head
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.arc(0, -18, 8, 0, Math.PI * 2);
  ctx.fill();

  // Rajasthani Turban / Cowboy Pagdi with Kalgi
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.ellipse(0, -23, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-2, -29, 4, 6);

  // Moustache & Eyes
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(-3, -19, 1.2, 0, Math.PI * 2);
  ctx.arc(3, -19, 1.2, 0, Math.PI * 2);
  ctx.fill();
  // Classic Veer Moustache
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-5, -15);
  ctx.quadraticCurveTo(0, -13, 5, -15);
  ctx.stroke();

  // Golden Gun held in right hand
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(9, -10, 11, 4);
  ctx.fillRect(9, -6, 4, 6);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(16, -11, 3, 2);

  // Name Tag & Title
  const nameY = -35;
  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('🤠 Veer (Gun Master)', 0, nameY);

  if (inDuel) {
    // Overhead Mini HP Bar for Veer during active duel
    const hp = gunFight.opponentHp;
    const barW = 34;
    const barH = 5;
    const barX = -barW / 2;
    const barY = nameY - 14;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    ctx.fillStyle = hp > 50 ? '#22c55e' : hp > 25 ? '#eab308' : '#ef4444';
    ctx.fillRect(barX, barY, (barW * Math.max(0, hp)) / 100, barH);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
  } else {
    // Challenge Badge when idle
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('⚔️ Tap to Gun Fight 🔫', 0, nameY + 11);

    if (isNear) {
      ctx.font = 'bold 9px "Outfit", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('✨ [ Click to Challenge ]', 0, 24);
    }
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
    if (c.state !== 'FUSE') return;

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
