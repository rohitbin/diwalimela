// Diwali Mahotsav Mela - Main Application
import React, { useState, useEffect, useRef } from 'react';
import MelaCanvas, { MELA_ZONES, DANCE_STEPS } from './game/MelaCanvas';
import WelcomeScreen from './components/WelcomeScreen';
import CrackerShopModal from './components/CrackerShopModal';
import TempleModal from './components/TempleModal';
import AvatarCustomizer from './components/AvatarCustomizer';
import DiwaliGuideModal from './components/DiwaliGuideModal';
import BalloonShootingModal from './components/BalloonShootingModal';
import ChaiStallModal from './components/ChaiStallModal';
import WeaponArmoryModal from './components/WeaponArmoryModal';
import DjJukeboxModal from './components/DjJukeboxModal';
import GunFightModal from './components/GunFightModal';
import InventoryHotbar from './components/InventoryHotbar';
import MultiplayerBar from './components/MultiplayerBar';
import ChatOverlay from './components/ChatOverlay';
import MiniMap from './components/MiniMap';
import FestiveChecklist from './components/FestiveChecklist';
import PlayerJoinPopup from './components/PlayerJoinPopup';
import InstallPromptModal from './components/InstallPromptModal';
import confetti from 'canvas-confetti';
import { CRACKERS, INITIAL_INVENTORY } from './data/crackers';
import { multiplayerManager } from './multiplayer/peerSync';
import { soundEngine } from './audio/soundEngine';
import { notificationService } from './services/notificationService';
import { MessageCircle, Bell, X } from 'lucide-react';

window.__CRACKER_MAP = CRACKERS.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

function getCurrentZoneName(x, y) {
  if (Math.hypot(x - 1850, y - 470) < 95) return '🚪 East Gate (पूर्व द्वार)';
  if (x >= 1850) {
    if (x >= 2260 && x <= 2740 && y >= 770 && y <= 1180) return '🪩 The Big Club (VIP Lounge & Arena)';
    if (Math.hypot(x - 2500, y - 470) < 160) return '✨ Grand Utsav Chowk (महा उत्सव चौक)';
    if (x >= 2350 && x <= 2650 && y < 320) return '🌸 North Art Pavilion (उत्तर मंडप)';
    if (x >= 3050) return '🪔 East Viewing Terrace (पूर्व दर्शन मंडप)';
    return '✨ New Fairground (नया मेला मैदान)';
  }
  if (y < 280) return 'Grand Entrance Gate';
  if (x > 1500 && y < 350) return '🎡 Mela Giant Wheel (झूला)';
  if (x > 1200 && y < 350) return '🎯 Balloon Shooting Stall';
  if (x > 1250 && y < 650) return 'Patakha Shop Courtyard';
  if (x > 1400 && y >= 800) return '👹 Ravan Dahan Ground (रावण दहन - 10M HP)';
  if (x > 1150 && y >= 800) return '🏹 Shastra Armory (शस्त्रागार)';
  if (x > 1250 && y >= 650) return 'Deepotsav East Courtyard';
  if (x < 630 && y < 650) return '☕ Sharma Ji Chai Tapri';
  if (x < 750 && y >= 650) return 'Lakshmi-Ganesh Mandir';
  if (y > 1050) return 'Rangoli Utsav Pavilion';
  return 'Deepotsav Central Plaza';
}

export default function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const initialRoomId = queryParams.get('room') || 'diwali-mela-main';

  const [hasEntered, setHasEntered] = useState(false);
  const [roomId, setRoomId] = useState(initialRoomId);

  // Player State
  const [player, setPlayer] = useState({
    id: `p_${Math.random().toString(36).substring(2, 9)}`,
    name: '',
    x: 1000,
    y: 280,
    color: '#ea580c',
    turbanColor: '#f59e0b',
    speed: 4.2,
    isMoving: false,
    walkFrame: 0,
    facing: 'right',
    bubble: null
  });

  // Currency & Inventory
  const [coins, setCoins] = useState(500);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [selectedCracker, setSelectedCracker] = useState(null);

  // Join Popup Notifications Queue
  const [joinNotifications, setJoinNotifications] = useState([]);

  // Gameplay Goals & Checklist Tracking
  const [litDiyasCount, setLitDiyasCount] = useState(8);
  const [burstCount, setBurstCount] = useState(0);
  const [boughtCount, setBoughtCount] = useState(0);
  const [bellRung, setBellRung] = useState(false);
  const [balloonPlayed, setBalloonPlayed] = useState(false);
  const [chaiDrank, setChaiDrank] = useState(false);
  const [wheelRode, setWheelRode] = useState(false);

  // Modals
  const [isCrackerShopOpen, setIsCrackerShopOpen] = useState(false);
  const [isTempleOpen, setIsTempleOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isBalloonGameOpen, setIsBalloonGameOpen] = useState(false);
  const [isChaiTapriOpen, setIsChaiTapriOpen] = useState(false);
  const [isArmoryOpen, setIsArmoryOpen] = useState(false);
  const [isDjModalOpen, setIsDjModalOpen] = useState(false);

  // Ravan Boss State (10,000,000 HP) - strictly persistent, never automatically fills or increases!
  const [ravanHp, setRavanHp] = useState(() => {
    try {
      const roomKey = `diwali_ravan_hp_${initialRoomId}`;
      const saved = localStorage.getItem(roomKey) || localStorage.getItem('diwali_ravan_hp');
      if (saved !== null && saved !== undefined) {
        const parsed = parseInt(saved, 10);
        if (Number.isFinite(parsed) && parsed >= 0) {
          return Math.min(10000000, parsed);
        }
      }
      return 10000000;
    } catch (_) {
      return 10000000;
    }
  });
  const [ravanShotCount, setRavanShotCount] = useState(0);

  // Strict updater: Ravan's energy can ONLY DECREASE, NEVER AUTOMATICALLY INCREASE OR REFILL!
  const updateRavanHp = React.useCallback((updaterOrVal) => {
    setRavanHp((prev) => {
      const raw = typeof updaterOrVal === 'function' ? updaterOrVal(prev) : updaterOrVal;
      const num = Number(raw);
      if (!Number.isFinite(num)) return prev;
      // Rule: energy can only reduce or stay same, never automatically refill!
      const next = Math.max(0, Math.min(prev, Math.round(num)));
      try {
        localStorage.setItem('diwali_ravan_hp', next.toString());
        localStorage.setItem(`diwali_ravan_hp_${roomId}`, next.toString());
      } catch (_) {}
      if (multiplayerManager) {
        multiplayerManager.updateRavanHp?.(next);
      }
      return next;
    });
  }, [roomId]);

  // Sync initial Ravan HP with multiplayer manager
  useEffect(() => {
    if (multiplayerManager) {
      multiplayerManager.setInitialRavanHp?.(ravanHp);
    }
  }, []);

  // Multiplayer listener for Ravan hits and HP sync from remote peers
  useEffect(() => {
    if (!multiplayerManager) return;
    const unsub = multiplayerManager.onRavanHit((data) => {
      if (data.type === 'SYNC' && typeof data.hp === 'number') {
        updateRavanHp(data.hp);
        return;
      }
      if (typeof data.currentHp === 'number') {
        updateRavanHp(data.currentHp);
        return;
      }
      const dmg = data.damage || data.event?.damage || 100;
      updateRavanHp((prev) => prev - dmg);
    });
    return () => unsub();
  }, [updateRavanHp]);

  // Dance emote state & various dynamic dance steps
  const [isDancing, setIsDancing] = useState(false);
  const [danceStep, setDanceStep] = useState(0);
  const danceTimeoutRef = useRef(null);

  // Automatic dance move rotation every 2.4 seconds while dancing
  useEffect(() => {
    if (!isDancing) return;

    const totalSteps = DANCE_STEPS?.length || 7;
    const interval = setInterval(() => {
      setDanceStep((prev) => {
        const next = (prev + 1) % totalSteps;
        if (multiplayerManager) {
          multiplayerManager.broadcastPlayerDance({
            isDancing: true,
            playerName: player.name,
            danceStep: next
          });
        }
        return next;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isDancing, player.name]);

  // Multiplayer & Social
  const [remotePlayers, setRemotePlayers] = useState(new Map());
  const [chatMessages, setChatMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Gun Fight PvP Duel State
  const [gunFight, setGunFight] = useState({
    status: 'IDLE', // 'IDLE' | 'CHALLENGE_SENT' | 'CHALLENGE_RECEIVED' | 'COUNTDOWN' | 'ACTIVE' | 'FINISHED'
    opponentId: null,
    opponentName: null,
    isInitiator: false,
    countdown: 5,
    myHp: 150,
    opponentHp: 150,
    winner: null
  });
  const countdownIntervalRef = useRef(null);

  const startGunFightCountdown = (oppName, oppId) => {
    // 1. Equip Golden Gun for both fighters
    const gunItem = CRACKERS.find((c) => c.id === 'gun') || {
      id: 'gun',
      name: 'गोल्डन गन (Golden Gun)',
      isWeapon: true,
      damage: 10
    };
    setSelectedCracker(gunItem);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setGunFight((prev) => ({
      ...prev,
      status: 'COUNTDOWN',
      countdown: 5,
      opponentName: oppName || prev.opponentName,
      opponentId: oppId || prev.opponentId,
      myHp: 150,
      opponentHp: 150,
      winner: null
    }));

    soundEngine.init();
    soundEngine.playCountdownBeep?.(false);

    let count = 5;
    countdownIntervalRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        soundEngine.playCountdownBeep?.(false);
        setGunFight((prev) => ({ ...prev, countdown: count }));
      } else {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        soundEngine.playCountdownBeep?.(true);
        soundEngine.playCrowdCheer?.();
        setGunFight((prev) => ({
          ...prev,
          status: 'ACTIVE',
          countdown: 0
        }));
      }
    }, 1000);
  };

  const handleChallengePlayer = (targetPlayer) => {
    if (gunFight.status !== 'IDLE') return;

    if (targetPlayer.id === 'npc_veer') {
      soundEngine.init();
      soundEngine.playGunShot?.(1.4);
      setGunFight({
        status: 'CHALLENGE_RECEIVED',
        opponentId: 'npc_veer',
        opponentName: 'Veer (Gun Master 🤠)',
        isInitiator: false,
        countdown: 5,
        myHp: 150,
        opponentHp: 150,
        winner: null
      });
      return;
    }

    soundEngine.init();
    soundEngine.playGunShot?.(1.3);
    setGunFight({
      status: 'CHALLENGE_SENT',
      opponentId: targetPlayer.id,
      opponentName: targetPlayer.name || 'Player',
      isInitiator: true,
      countdown: 5,
      myHp: 150,
      opponentHp: 150,
      winner: null
    });

    if (multiplayerManager) {
      multiplayerManager.broadcastGunFightChallenge({
        challengerId: player.id,
        challengerName: player.name || 'Hero',
        targetId: targetPlayer.id,
        targetName: targetPlayer.name || 'Player'
      });
    }
  };

  const handleAcceptGunFight = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    if (gunFight.opponentId === 'npc_veer') {
      startGunFightCountdown('Veer (Gun Master 🤠)', 'npc_veer');
      return;
    }

    if (multiplayerManager) {
      multiplayerManager.broadcastGunFightAccept({
        challengerId: gunFight.opponentId,
        targetId: player.id,
        targetName: player.name || 'Hero'
      });
    }

    startGunFightCountdown(gunFight.opponentName, gunFight.opponentId);
  };

  const handleDeclineGunFight = () => {
    if (multiplayerManager && gunFight.opponentId !== 'npc_veer') {
      multiplayerManager.broadcastGunFightDecline({
        challengerId: gunFight.opponentId,
        targetId: player.id
      });
    }
    setGunFight({
      status: 'IDLE',
      opponentId: null,
      opponentName: null,
      isInitiator: false,
      countdown: 5,
      myHp: 150,
      opponentHp: 150,
      winner: null
    });
  };

  const handleCancelGunFightChallenge = () => {
    setGunFight({
      status: 'IDLE',
      opponentId: null,
      opponentName: null,
      isInitiator: false,
      countdown: 5,
      myHp: 150,
      opponentHp: 150,
      winner: null
    });
  };

  const handleForfeitGunFight = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (multiplayerManager && gunFight.opponentId !== 'npc_veer') {
      multiplayerManager.broadcastGunFightEnd({
        winnerId: gunFight.opponentId,
        winnerName: gunFight.opponentName,
        loserId: player.id,
        loserName: player.name
      });
    }
    setGunFight((prev) => ({
      ...prev,
      status: 'FINISHED',
      winner: prev.opponentName,
      myHp: 0
    }));
    setTimeout(() => {
      setGunFight({
        status: 'IDLE',
        opponentId: null,
        opponentName: null,
        isInitiator: false,
        countdown: 5,
        myHp: 150,
        opponentHp: 150,
        winner: null
      });
    }, 4500);
  };

  const handleDuelHit = (damage = 10) => {
    if (gunFight.status !== 'ACTIVE') return;

    const nextOppHp = Math.max(0, gunFight.opponentHp - damage);

    if (gunFight.opponentId === 'npc_veer') {
      setGunFight((prev) => ({ ...prev, opponentHp: nextOppHp }));
      if (nextOppHp <= 0) {
        soundEngine.playCrowdCheer?.();
        setCoins((c) => c + 500);
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
        setGunFight((prev) => ({ ...prev, status: 'FINISHED', winner: player.name }));
        setTimeout(() => {
          setGunFight({ status: 'IDLE', opponentId: null, opponentName: null, isInitiator: false, countdown: 5, myHp: 150, opponentHp: 150, winner: null });
        }, 4500);
      }
      return;
    }

    if (multiplayerManager) {
      multiplayerManager.broadcastGunFightHit({
        attackerId: player.id,
        victimId: gunFight.opponentId,
        damage,
        newHp: nextOppHp
      });
    }

    setGunFight((prev) => ({ ...prev, opponentHp: nextOppHp }));
    if (nextOppHp <= 0) {
      soundEngine.playCrowdCheer?.();
      setCoins((c) => c + 500);
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      setGunFight((prev) => ({ ...prev, status: 'FINISHED', winner: player.name }));
      setTimeout(() => {
        setGunFight({ status: 'IDLE', opponentId: null, opponentName: null, isInitiator: false, countdown: 5, myHp: 150, opponentHp: 150, winner: null });
      }, 4500);
    }
  };

  const handleTakeDuelDamage = (damage = 10) => {
    if (gunFight.status !== 'ACTIVE') return;
    soundEngine.init();
    soundEngine.playRavanHit?.();
    setScreenShake(8);
    setGunFight((prev) => {
      const nextHp = Math.max(0, prev.myHp - damage);
      if (nextHp <= 0) {
        if (multiplayerManager && prev.opponentId !== 'npc_veer') {
          multiplayerManager.broadcastGunFightEnd({
            winnerId: prev.opponentId,
            winnerName: prev.opponentName,
            loserId: player.id,
            loserName: player.name
          });
        }
        setTimeout(() => {
          setGunFight((g) => ({ ...g, status: 'FINISHED', winner: prev.opponentName, myHp: 0 }));
          setTimeout(() => {
            setGunFight({ status: 'IDLE', opponentId: null, opponentName: null, isInitiator: false, countdown: 5, myHp: 150, opponentHp: 150, winner: null });
          }, 4500);
        }, 100);
      }
      return { ...prev, myHp: nextHp };
    });
  };

  // Multiplayer Gun Fight Listener
  useEffect(() => {
    if (!multiplayerManager) return;
    const unsub = multiplayerManager.onGunFight((data) => {
      if (data.type === 'GUN_FIGHT_CHALLENGE') {
        if (data.targetId === player.id) {
          soundEngine.init();
          soundEngine.playGunShot?.(1.4);
          setGunFight({
            status: 'CHALLENGE_RECEIVED',
            opponentId: data.challengerId,
            opponentName: data.challengerName || 'Player',
            isInitiator: false,
            countdown: 5,
            myHp: 150,
            opponentHp: 150,
            winner: null
          });
        }
      } else if (data.type === 'GUN_FIGHT_ACCEPT') {
        if (data.challengerId === player.id || data.targetId === player.id) {
          const oppName = data.challengerId === player.id ? data.targetName : data.challengerName;
          const oppId = data.challengerId === player.id ? data.targetId : data.challengerId;
          startGunFightCountdown(oppName, oppId);
        }
      } else if (data.type === 'GUN_FIGHT_DECLINE') {
        if (data.challengerId === player.id) {
          soundEngine.playCrowdCheer?.();
          setGunFight((prev) => ({ ...prev, status: 'IDLE' }));
        }
      } else if (data.type === 'GUN_FIGHT_SHOT') {
        if (data.shooterId === gunFight.opponentId) {
          window.dispatchEvent(new CustomEvent('opponentDuelShot', { detail: data }));
        }
      } else if (data.type === 'GUN_FIGHT_HIT') {
        if (data.victimId === player.id) {
          soundEngine.init();
          soundEngine.playRavanHit?.();
          setScreenShake(8);
          setGunFight((prev) => {
            const nextHp = Math.max(0, data.newHp);
            if (nextHp <= 0) {
              setTimeout(() => {
                setGunFight((g) => ({ ...g, status: 'FINISHED', winner: prev.opponentName, myHp: 0 }));
                setTimeout(() => {
                  setGunFight({ status: 'IDLE', opponentId: null, opponentName: null, isInitiator: false, countdown: 5, myHp: 150, opponentHp: 150, winner: null });
                }, 4500);
              }, 100);
            }
            return { ...prev, myHp: nextHp };
          });
        } else if (data.attackerId === player.id) {
          setGunFight((prev) => ({ ...prev, opponentHp: Math.max(0, data.newHp) }));
        }
      } else if (data.type === 'GUN_FIGHT_END') {
        if (data.winnerId === player.id) {
          soundEngine.playCrowdCheer?.();
          setCoins((c) => c + 500);
          confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
          setGunFight((prev) => ({ ...prev, status: 'FINISHED', winner: player.name }));
          setTimeout(() => {
            setGunFight({ status: 'IDLE', opponentId: null, opponentName: null, isInitiator: false, countdown: 5, myHp: 150, opponentHp: 150, winner: null });
          }, 4500);
        }
      }
    });
    return () => unsub();
  }, [player.id, player.name, gunFight.opponentId]);

  // Progressive Web App (PWA) Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);

  useEffect(() => {
    if (hasEntered && notificationService.isSupported() && notificationService.getPermission() === 'default') {
      const timer = setTimeout(() => {
        setShowNotifPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasEntered]);

  const handleEnableNotificationsFromBanner = async () => {
    const res = await notificationService.requestPermission();
    setShowNotifPrompt(false);
    if (res.success) {
      notificationService.notifySelfWelcome(player.name);
      triggerChatToast({
        senderName: 'Mela System',
        text: '🔔 Device notifications enabled! You will get alerts on this device when friends enter 🪔'
      });
    }
  };

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!standalone) {
        setIsInstallModalOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Prompt user to install the game when landing on the website
    const timer = setTimeout(() => {
      if (!standalone) {
        setIsInstallModalOpen(true);
      }
    }, 1200);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  // Background presence listener for Mela entry announcements (notifies installed devices even before entering!)
  useEffect(() => {
    multiplayerManager.startBackgroundPresence(roomId, (enteringPlayer) => {
      notificationService.notifyPlayerEntered(enteringPlayer?.name, enteringPlayer);
    });
  }, [roomId]);

  // If app is installed (standalone PWA), politely request notification permission so friend alerts work
  useEffect(() => {
    if (isStandalone && notificationService.isSupported() && notificationService.getPermission() === 'default') {
      const timer = setTimeout(() => {
        notificationService.requestPermission().catch(() => {});
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  // Floating header corner chat toasts (up to 3, auto-disappear after 4 seconds)
  const [headerChatToasts, setHeaderChatToasts] = useState([]);
  const toastTimersRef = React.useRef(new Map());

  const triggerChatToast = (msg) => {
    if (!msg || !msg.text) return;
    const toastId = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast = {
      id: toastId,
      senderId: msg.senderId,
      senderName: msg.senderName || 'Friend',
      text: msg.text,
      timestamp: Date.now()
    };

    // Show up to 3 new chats on the screen in the header corner
    setHeaderChatToasts((prev) => [...prev.slice(-2), newToast]);

    // Automatically disappear after 4 seconds
    const timer = setTimeout(() => {
      setHeaderChatToasts((prev) => prev.filter((t) => t.id !== toastId));
      toastTimersRef.current.delete(toastId);
    }, 4000);

    toastTimersRef.current.set(toastId, timer);
  };

  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach((t) => clearTimeout(t));
      toastTimersRef.current.clear();
    };
  }, []);

  // Screen shake & Buffs
  const [screenShake, setScreenShake] = useState(null);
  const [activeBuffs, setActiveBuffs] = useState({});
  const [crackerAlert, setCrackerAlert] = useState(null);

  // Helper: Trigger Festive Join Popup
  const triggerJoinPopup = (name, color, turbanColor, isSelf = false) => {
    const id = `join_${Date.now()}_${Math.random()}`;
    soundEngine.playCoinSound();

    setJoinNotifications((prev) => [
      ...prev.slice(-2), // Keep max 2 on screen so it looks clean
      { id, name, color, turbanColor, isSelf }
    ]);

    setTimeout(() => {
      setJoinNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 6500);
  };

  const handleDismissNotification = (id) => {
    setJoinNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleEnterMela = (profile) => {
    let finalProfile = null;
    setPlayer((prev) => {
      finalProfile = {
        ...prev,
        name: profile.name,
        color: profile.color,
        turbanColor: profile.turbanColor
      };
      return finalProfile;
    });
    const updatedPlayer = finalProfile || {
      ...player,
      name: profile.name,
      color: profile.color,
      turbanColor: profile.turbanColor
    };
    setRoomId(profile.roomId);
    setHasEntered(true);

    // 1. Popup the local player's name upon entering!
    triggerJoinPopup(profile.name, profile.color, profile.turbanColor, true);

    // Trigger instant welcome notification on the phone/device being used!
    notificationService.notifySelfWelcome(profile.name);
    try {
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.22 },
        colors: ['#fbbf24', '#f59e0b', '#ea580c', '#ec4899', '#22c55e']
      });
    } catch (_) {}

    // Local player entered mela

    // 2. Initialize Multiplayer Peer connection
    multiplayerManager.setInitialRavanHp?.(ravanHp);
    multiplayerManager.init(profile.roomId, updatedPlayer, {
      onPeerUpdate: (peersMap) => {
        setRemotePlayers(peersMap);
        setOnlineCount(peersMap.size + 1);
      },
      onPlayerJoined: (newRemotePlayer) => {
        // Trigger system/device notification on installed phones & background tabs!
        notificationService.notifyPlayerEntered(newRemotePlayer.name, newRemotePlayer);

        // Remote real player joined popup!
        triggerJoinPopup(newRemotePlayer.name, newRemotePlayer.color, newRemotePlayer.turbanColor, false);
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.22 },
            colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#ec4899']
          });
        } catch (_) {}
        // Player join handled by popup banner
      },
      onChatMessage: (msg) => {
        setChatMessages((prev) => [...prev.slice(-25), msg]);
        triggerChatToast(msg);
        setRemotePlayers((prev) => {
          const next = new Map(prev);
          const target = next.get(msg.senderId);
          if (target) {
            next.set(msg.senderId, { ...target, bubble: msg.text });
          }
          return next;
        });
      },
      onCrackerEvent: (evt) => {
        setCrackerAlert({
          id: Date.now(),
          text: `${evt.placedBy || 'Friend'} ignited a ${evt.crackerName || 'Cracker'}! ${evt.icon || '🎆'}`
        });
        setTimeout(() => setCrackerAlert(null), 4500);
      },
      onDiyaUpdate: () => {
        setLitDiyasCount((c) => Math.min(16, c + 1));
      }
    });

    // 3. Broadcast entry announcement so all installed apps & players receive device notifications!
    multiplayerManager.broadcastMelaEntry(updatedPlayer);
  };

  // Broadcast held/equipped cracker to all players so they see you holding it
  useEffect(() => {
    if (!hasEntered) return;
    setPlayer((prev) => {
      const updated = {
        ...prev,
        holdingCracker: selectedCracker?.id || null
      };
      if (multiplayerManager) {
        multiplayerManager.broadcastPlayerState(updated);
      }
      return updated;
    });
  }, [selectedCracker]);

  const handleSendMessage = (text) => {
    const msg = {
      senderId: player.id,
      senderName: player.name,
      text,
      timestamp: Date.now()
    };
    setChatMessages((prev) => [...prev.slice(-25), msg]);
    triggerChatToast(msg);

    setPlayer((prev) => ({ ...prev, bubble: text }));
    setTimeout(() => {
      setPlayer((prev) => (prev.bubble === text ? { ...prev, bubble: null } : prev));
    }, 4500);

    multiplayerManager.broadcastChatMessage(msg);
  };

  const handleNavigateTo = (targetX, targetY) => {
    setPlayer((prev) => ({
      ...prev,
      targetX,
      targetY,
      isMoving: true
    }));
  };

  const handleTriggerDance = () => {
    // If already dancing, tapping the hotbar dance button toggles it OFF gracefully
    if (isDancing) {
      setIsDancing(false);
      if (danceTimeoutRef.current) clearTimeout(danceTimeoutRef.current);
      if (multiplayerManager) {
        multiplayerManager.broadcastPlayerDance({ isDancing: false, playerName: player.name });
      }
      return;
    }

    // Start dancing with automatic multi-step choreography
    setIsDancing(true);
    soundEngine.init();
    soundEngine.playDholakBeat(true);
    soundEngine.playCrowdCheer();
    if (multiplayerManager) {
      multiplayerManager.broadcastPlayerDance({ isDancing: true, playerName: player.name, danceStep });
    }
  };

  // Keyboard number shortcuts to select crackers (Keys 1-8)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      let targetCrackerIdx = -1;
      if (key >= '1' && key <= '9') {
        targetCrackerIdx = parseInt(key, 10) - 1;
      } else if (key === '0') {
        targetCrackerIdx = 9;
      }

      if (targetCrackerIdx >= 0 && targetCrackerIdx < CRACKERS.length) {
        const cracker = CRACKERS[targetCrackerIdx];
        const invItem = inventory.find((i) => i.id === cracker.id);
        if (invItem && invItem.count > 0) {
          setSelectedCracker((prev) => (prev?.id === cracker.id ? null : cracker));
        } else {
          setIsCrackerShopOpen(true);
        }
      }

      if (e.key === 'Escape') {
        setIsCrackerShopOpen(false);
        setIsTempleOpen(false);
        setIsCustomizerOpen(false);
        setIsGuideOpen(false);
        setIsBalloonGameOpen(false);
        setIsChaiTapriOpen(false);
        setActiveNpc(null);
        setSelectedCracker(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inventory]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* 1. Welcome Splash Screen */}
      {!hasEntered && (
        <WelcomeScreen
          defaultRoomId={roomId}
          onEnterMela={handleEnterMela}
        />
      )}

      {/* 2. Top Navigation & Status Bar */}
      <MultiplayerBar
        roomId={roomId}
        onlineCount={onlineCount}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        isStandalone={isStandalone}
        coins={coins}
        player={player}
        currentZone={getCurrentZoneName(player.x, player.y)}
      />

      {/* 2.2 Quick Gate Navigation Pill */}
      {hasEntered && (
        <button
          id="east-gate-nav-pill"
          onClick={() => {
            const isInsideNew = player.x >= 1850;
            const targetX = isInsideNew ? 1720 : 1930;
            handleNavigateTo(targetX, 470);
          }}
          style={{
            position: 'fixed',
            top: 'max(52px, calc(env(safe-area-inset-top) + 44px))',
            left: 'max(10px, env(safe-area-inset-left))',
            zIndex: 41,
            backgroundColor: 'rgba(23, 14, 38, 0.94)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid #fbbf24',
            borderRadius: 20,
            padding: '5px 12px',
            color: '#fef08a',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.6), 0 0 10px rgba(251, 191, 36, 0.35)',
            pointerEvents: 'auto',
            touchAction: 'manipulation'
          }}
          title={player.x < 1850 ? 'Walk directly to the East Gate' : 'Return to Main Mela'}
        >
          <span>{player.x < 1850 ? '🚪 Walk to East Gate ➜' : '🏮 Return to Main Mela ➜'}</span>
        </button>
      )}

      {/* 2.5 Prompt to Enable Notifications on this Phone/Device */}
      {hasEntered && showNotifPrompt && (
        <div
          style={{
            position: 'fixed',
            top: 56,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 90,
            width: 'min(92vw, 400px)',
            backgroundColor: 'rgba(23, 14, 38, 0.98)',
            border: '2px solid #f59e0b',
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.85), 0 0 20px rgba(245, 158, 11, 0.45)',
            backdropFilter: 'blur(12px)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            animation: 'joinPopupSlide 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22, animation: 'pulse 1.2s infinite ease-in-out' }}>🔔</span>
            <div>
              <div style={{ color: '#fef08a', fontWeight: 800, fontSize: 13 }}>
                Enable Alerts on this Device
              </div>
              <div style={{ color: '#fed7aa', fontSize: 11, lineHeight: 1.2 }}>
                Get notified on this phone when friends enter the Mela!
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={handleEnableNotificationsFromBanner}
              style={{
                backgroundColor: '#f59e0b',
                backgroundImage: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
                color: '#1a102a',
                fontWeight: 800,
                fontSize: 12,
                padding: '6px 12px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.5)'
              }}
            >
              Allow 🔔
            </button>
            <button
              onClick={() => setShowNotifPrompt(false)}
              aria-label="Dismiss notification prompt"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Player Join Announcement Popup (Prompted upon entry!) */}
      <PlayerJoinPopup
        notifications={joinNotifications}
        onDismiss={handleDismissNotification}
      />

      {/* Real-time Cracker Burst Toast Notification */}
      {crackerAlert && (
        <div
          style={{
            position: 'fixed',
            top: 'max(56px, calc(env(safe-area-inset-top) + 48px))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            backgroundColor: 'rgba(23, 14, 38, 0.94)',
            backdropFilter: 'blur(10px)',
            border: '2px solid #f59e0b',
            borderRadius: 24,
            padding: '5px clamp(12px, 3vw, 20px)',
            color: '#fef08a',
            fontSize: 'clamp(11px, 3vw, 13px)',
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 15px rgba(245, 158, 11, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'bounce 0.5s ease-out',
            pointerEvents: 'none',
            maxWidth: 'calc(100vw - 24px)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <span>🎆</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{crackerAlert.text}</span>
        </div>
      )}

      {/* 4. Interactive Mini-Map HUD */}
      <MiniMap
        player={player}
        onNavigateTo={handleNavigateTo}
        remotePlayers={remotePlayers}
        multiplayerManager={multiplayerManager}
        diyas={Array.from({ length: 16 }, (_, i) => ({ isLit: i < litDiyasCount }))}
      />

      {/* 5. Festive Cheer & Checklist HUD */}
      <FestiveChecklist
        coins={coins}
        litDiyasCount={litDiyasCount}
        burstCount={burstCount}
        boughtCount={boughtCount}
        bellRung={bellRung}
        balloonPlayed={balloonPlayed}
        chaiDrank={chaiDrank}
        wheelRode={wheelRode}
        ravanShotCount={ravanShotCount}
        onNavigateTo={handleNavigateTo}
      />

      {/* 6. Main 60FPS Diwali Canvas View */}
      <MelaCanvas
        player={player}
        setPlayer={setPlayer}
        inventory={inventory}
        setInventory={setInventory}
        coins={coins}
        setCoins={setCoins}
        selectedCracker={selectedCracker}
        setSelectedCracker={setSelectedCracker}
        onOpenCrackerShop={() => setIsCrackerShopOpen(true)}
        onOpenTemple={() => setIsTempleOpen(true)}
        onOpenBalloonGame={() => {
          setIsBalloonGameOpen(true);
          setBalloonPlayed(true);
        }}
        onOpenChaiTapri={() => {
          setIsChaiTapriOpen(true);
          setChaiDrank(true);
        }}
        onOpenArmory={() => setIsArmoryOpen(true)}
        onOpenDjJukebox={() => setIsDjModalOpen(true)}
        ravanHp={ravanHp}
        setRavanHp={updateRavanHp}
        onRavanShot={() => {
          setRavanShotCount((c) => c + 1);
        }}
        remotePlayers={remotePlayers}
        multiplayerManager={multiplayerManager}
        screenShake={screenShake}
        setScreenShake={setScreenShake}
        activeBuffs={activeBuffs}
        setActiveBuffs={setActiveBuffs}
        onChaiDrank={() => setChaiDrank(true)}
        onDiyaLit={() => setLitDiyasCount((c) => Math.min(16, c + 1))}
        onCrackerBurst={() => setBurstCount((b) => b + 1)}
        isDancing={isDancing}
        setIsDancing={setIsDancing}
        danceStep={danceStep}
        setDanceStep={setDanceStep}
        gunFight={gunFight}
        onChallengePlayer={handleChallengePlayer}
        onDuelHit={handleDuelHit}
        onTakeDuelDamage={handleTakeDuelDamage}
      />

      {/* 7. Bottom Inventory Hotbar */}
      <InventoryHotbar
        inventory={inventory}
        selectedCracker={selectedCracker}
        setSelectedCracker={setSelectedCracker}
        coins={coins}
        onOpenShop={() => setIsCrackerShopOpen(true)}
        onOpenTemple={() => setIsTempleOpen(true)}
        onOpenBalloonGame={() => {
          setIsBalloonGameOpen(true);
          setBalloonPlayed(true);
        }}
        onOpenChaiTapri={() => {
          setIsChaiTapriOpen(true);
          setChaiDrank(true);
        }}
        onOpenArmory={() => setIsArmoryOpen(true)}
        onOpenDjJukebox={() => setIsDjModalOpen(true)}
        onTriggerDance={handleTriggerDance}
        isDancing={isDancing}
        danceStep={danceStep}
      />

      {/* 3 New Header Corner Floating Chat Toasts (Disappear after 4 seconds) */}
      {headerChatToasts.length > 0 && (
        <div
          id="header-corner-chat-toasts"
          style={{
            position: 'fixed',
            top: 'max(88px, calc(env(safe-area-inset-top) + 80px))',
            left: 'max(10px, env(safe-area-inset-left))',
            zIndex: 42,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxWidth: 'min(300px, calc(100vw - 24px))',
            pointerEvents: 'auto'
          }}
        >
          {headerChatToasts.map((toast) => (
            <div
              key={toast.id}
              onClick={() => {
                setIsChatOpen(true);
                setHeaderChatToasts((prev) => prev.filter((t) => t.id !== toast.id));
              }}
              style={{
                backgroundColor: 'rgba(18, 12, 30, 0.94)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(245, 158, 11, 0.45)',
                borderLeft: '3.5px solid #f59e0b',
                borderRadius: 12,
                padding: '7px 12px',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.65)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                animation: 'chatToastSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              title="Click to open chat"
            >
              <MessageCircle size={15} color="#fbbf24" style={{ flexShrink: 0 }} />
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.35,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}
              >
                <strong
                  style={{
                    color: toast.senderId === player?.id ? '#fbbf24' : '#38bdf8',
                    marginRight: 4
                  }}
                >
                  {toast.senderName}:
                </strong>
                <span style={{ color: '#f8fafc' }}>{toast.text}</span>
              </div>

              {/* 4-second auto-dismiss progress bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: 2,
                  backgroundColor: '#f59e0b',
                  animation: 'chatProgress 4s linear forwards',
                  width: '100%',
                  opacity: 0.8
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 8. Live Chat Overlay */}
      <ChatOverlay
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        onSendMessage={handleSendMessage}
        chatMessages={chatMessages}
        player={player}
      />

      {/* 9. Modals */}
      <CrackerShopModal
        isOpen={isCrackerShopOpen}
        onClose={() => setIsCrackerShopOpen(false)}
        coins={coins}
        setCoins={setCoins}
        inventory={inventory}
        setInventory={(inv) => {
          setInventory(inv);
          setBoughtCount((c) => c + 1);
        }}
      />

      <WeaponArmoryModal
        isOpen={isArmoryOpen}
        onClose={() => setIsArmoryOpen(false)}
        coins={coins}
        setCoins={setCoins}
        inventory={inventory}
        setInventory={setInventory}
        selectedCracker={selectedCracker}
        setSelectedCracker={setSelectedCracker}
        onGoToRavan={() => {
          setIsArmoryOpen(false);
          handleNavigateTo(MELA_ZONES.RAVAN.x - 180, MELA_ZONES.RAVAN.y + 40);
        }}
      />

      <TempleModal
        isOpen={isTempleOpen}
        onClose={() => setIsTempleOpen(false)}
        setCoins={(c) => {
          setCoins(c);
          setBellRung(true);
        }}
        multiplayerManager={multiplayerManager}
        player={player}
      />

      <BalloonShootingModal
        isOpen={isBalloonGameOpen}
        onClose={() => setIsBalloonGameOpen(false)}
        coins={coins}
        setCoins={setCoins}
        setInventory={setInventory}
      />

      <ChaiStallModal
        isOpen={isChaiTapriOpen}
        onClose={() => setIsChaiTapriOpen(false)}
        coins={coins}
        setCoins={setCoins}
        setActiveBuffs={(b) => {
          setActiveBuffs(b);
          setChaiDrank(true);
        }}
        multiplayerManager={multiplayerManager}
        player={player}
      />

      <DjJukeboxModal
        isOpen={isDjModalOpen}
        onClose={() => setIsDjModalOpen(false)}
        onGoToDanceFloor={() => {
          setIsDjModalOpen(false);
          handleNavigateTo(MELA_ZONES.BIG_CLUB?.x || 2500, MELA_ZONES.BIG_CLUB?.y || 950);
        }}
        player={player}
      />

      <AvatarCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        player={player}
        setPlayer={setPlayer}
        multiplayerManager={multiplayerManager}
      />

      <DiwaliGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* 10. PWA Install Prompt Modal */}
      <InstallPromptModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallAccepted={() => {
          setIsStandalone(true);
          setIsInstallModalOpen(false);
        }}
      />
      {/* 11. Gun Fight PvP Duel Modal & Combat HUD */}
      <GunFightModal
        gunFight={gunFight}
        onAccept={handleAcceptGunFight}
        onDecline={handleDeclineGunFight}
        onCancelChallenge={handleCancelGunFightChallenge}
        onForfeit={handleForfeitGunFight}
        myPlayerName={player.name}
      />
    </div>
  );
}
