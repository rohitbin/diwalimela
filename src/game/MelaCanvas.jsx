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
  CHAI_TAPRI: { x: 380, y: 420, name: 'Sharma Ji Chai Tapri (चाय टपरी)' }
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

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768
      );
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

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

  // Sync remote fireworks and diya lighting across real players
  useEffect(() => {
    if (!multiplayerManager) return;
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

    const unsubDiya = multiplayerManager.onDiya((diyaData) => {
      if (!diyaData) return;
      const target = worldRef.current.diyas.find((d) => d.id === diyaData.id);
      if (target) {
        target.isLit = true;
        soundEngine.playDiyaLight();
      }
    });

    return () => {
      if (unsubCracker) unsubCracker();
      if (unsubDiya) unsubDiya();
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

      if (e.key.toLowerCase() === 'e' || e.code === 'Space') {
        const interacted = checkPlayerProximityInteractions();
        if (!interacted && selectedCracker) {
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

    // 1. High Priority: If a cracker is selected, place and ignite it EXACTLY at tapped world coordinates!
    if (selectedCracker) {
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
        if (activeBuffs?.kulhad_chai) speed *= 1.15;

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

        // Touch drag control for iPhone and mobile devices (with responsive full speed)
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

        let newX = p.x;
        let newY = p.y;
        let isMoving = false;

        if (moveX !== 0 || moveY !== 0) {
          // Manual movement cancels click-navigation targets permanently
          p.targetX = undefined;
          p.targetY = undefined;

          const len = Math.hypot(moveX, moveY);
          const moveMult = tc.active ? Math.min(1.0, Math.hypot(moveX, moveY)) : 1.0;
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
      if (screenShake && screenShake.duration > 0) {
        shakeOffsetX = (Math.random() - 0.5) * screenShake.intensity;
        shakeOffsetY = (Math.random() - 0.5) * screenShake.intensity;
        setScreenShake((prev) => (prev ? { ...prev, duration: prev.duration - 1 } : null));
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
      const triggerShake = (intensity, duration) => setScreenShake({ intensity, duration });

      world.activeCrackers = world.activeCrackers.filter((c) =>
        c.update(addParticle, triggerShake)
      );

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

      // D. Carnival Game Stalls: Balloon Shooting, Chai Tapri
      renderCarnivalAttractions(ctx, p);

      // E. Stalls: Cracker Shop, Temple
      renderMelaStalls(ctx, world, p);

      // F. Rangoli Art Pavilions & Floral Carpet
      renderRangoliArtwork(ctx);

      // G. Unlit & Lit Clay Diyas
      renderDiyas(ctx, world.diyas);

      // H. Hanging Strings of Fairy Lights (Ladiyan)
      renderFairyLights(ctx, world.fairyLights);

      // I. Active Crackers (placed on ground / in air)
      world.activeCrackers.forEach((c) => c.draw(ctx));

      // Real Online Players (WebRTC & Cross-Tab Multiplayer)
      const livePeers = remotePlayersRef.current;
      if (livePeers && livePeers.size > 0) {
        livePeers.forEach((remPlayer) => {
          if (remPlayer.id === p.id) return; // Skip own player
          const heldCracker = remPlayer.holdingCracker ? (CRACKER_MAP[remPlayer.holdingCracker] || { id: remPlayer.holdingCracker }) : null;
          renderCharacter(ctx, remPlayer, true, false, heldCracker, null, remPlayer.isDancing);
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

  // Native non-passive touch drag event listeners for iPhone / iOS Safari
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (e.target.closest('button')) return;
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

      setTouchIndicator({
        originX: rect.left + touchControlRef.current.originX,
        originY: rect.top + touchControlRef.current.originY,
        currentX: touch.clientX,
        currentY: touch.clientY
      });
    };

    const onTouchEnd = (e) => {
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

      {/* On-screen Festive Dynamic Touch Joystick Indicator for iPhone/Mobile */}
      {touchIndicator && (
        <div
          style={{
            position: 'fixed',
            left: touchIndicator.originX - 44,
            top: touchIndicator.originY - 44,
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(23, 14, 38, 0.7) 100%)',
            border: '2px solid rgba(251, 191, 36, 0.85)',
            boxShadow: '0 0 24px rgba(245, 158, 11, 0.5), inset 0 0 12px rgba(245, 158, 11, 0.3)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            transform: 'translate3d(0,0,0)'
          }}
        >
          {/* Outer Diya Petals decorative ring */}
          <div
            style={{
              position: 'absolute',
              inset: 4,
              borderRadius: '50%',
              border: '1px dashed rgba(254, 240, 138, 0.55)',
              pointerEvents: 'none'
            }}
          />
          {/* Thumb Knob (Golden Diya Flame) */}
          {(() => {
            const dx = touchIndicator.currentX - touchIndicator.originX;
            const dy = touchIndicator.currentY - touchIndicator.originY;
            const dist = Math.hypot(dx, dy);
            const maxR = 32;
            const clampedDist = Math.min(dist, maxR);
            const angle = dist > 0 ? Math.atan2(dy, dx) : 0;
            const knobX = Math.cos(angle) * clampedDist;
            const knobY = Math.sin(angle) * clampedDist;
            return (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fde047 0%, #ea580c 100%)',
                  border: '2px solid #ffffff',
                  boxShadow: '0 0 18px #fbbf24, 0 4px 10px rgba(0,0,0,0.6)',
                  transform: `translate(${knobX}px, ${knobY}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18
                }}
              >
                🪔
              </div>
            );
          })()}
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
          onClick={(e) => {
            e.stopPropagation();
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
            backgroundColor: selectedCracker ? '#ea580c' : 'rgba(23, 14, 38, 0.94)',
            border: selectedCracker ? '2.5px solid #fbbf24' : '2px solid rgba(245, 158, 11, 0.5)',
            boxShadow: selectedCracker
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
          title={selectedCracker ? `Burst ${selectedCracker.name}` : 'Interact / Light Diya'}
        >
          <span style={{ fontSize: 24, lineHeight: 1 }}>{selectedCracker ? '🔥' : '🪔'}</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#fef08a', marginTop: 2 }}>
            {selectedCracker ? 'BURST' : 'ACTION'}
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

  const holding = selectedCracker || (char.holdingCracker ? (CRACKER_MAP[char.holdingCracker] || { id: char.holdingCracker }) : null);

  if (holding?.id === 'phuljhadi') {
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
  } else if (holding?.icon) {
    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.fillText(holding.icon, 16, -6);
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
