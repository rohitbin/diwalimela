// Diwali Mahotsav Mela - Main Application
import React, { useState, useEffect } from 'react';
import MelaCanvas, { MELA_ZONES } from './game/MelaCanvas';
import WelcomeScreen from './components/WelcomeScreen';
import CrackerShopModal from './components/CrackerShopModal';
import TempleModal from './components/TempleModal';
import AvatarCustomizer from './components/AvatarCustomizer';
import DiwaliGuideModal from './components/DiwaliGuideModal';
import BalloonShootingModal from './components/BalloonShootingModal';
import LuckyWheelModal from './components/LuckyWheelModal';
import ChaiStallModal from './components/ChaiStallModal';
import InventoryHotbar from './components/InventoryHotbar';
import MultiplayerBar from './components/MultiplayerBar';
import ChatOverlay from './components/ChatOverlay';
import MiniMap from './components/MiniMap';
import FestiveChecklist from './components/FestiveChecklist';
import PlayerJoinPopup from './components/PlayerJoinPopup';
import confetti from 'canvas-confetti';
import { CRACKERS, INITIAL_INVENTORY } from './data/crackers';
import { multiplayerManager } from './multiplayer/peerSync';
import { soundEngine } from './audio/soundEngine';

window.__CRACKER_MAP = CRACKERS.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

function getCurrentZoneName(x, y) {
  if (y < 280) return 'Grand Entrance Gate';
  if (x > 1500 && y < 350) return '🎡 Mela Giant Wheel (झूला)';
  if (x > 1200 && y < 350) return '🎯 Balloon Shooting Stall';
  if (x > 1250 && y < 650) return 'Patakha Shop Courtyard';
  if (x > 1250 && y >= 650) return '🎆 Dhamaka Celebration Ground';
  if (x < 750 && y < 650) return '☕ Sharma Ji Chai Tapri';
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
  const [wheelSpun, setWheelSpun] = useState(false);
  const [chaiDrank, setChaiDrank] = useState(false);
  const [wheelRode, setWheelRode] = useState(false);

  // Modals
  const [isCrackerShopOpen, setIsCrackerShopOpen] = useState(false);
  const [isTempleOpen, setIsTempleOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isBalloonGameOpen, setIsBalloonGameOpen] = useState(false);
  const [isFortuneWheelOpen, setIsFortuneWheelOpen] = useState(false);
  const [isChaiTapriOpen, setIsChaiTapriOpen] = useState(false);

  // Dance emote state
  const [isDancing, setIsDancing] = useState(false);

  // Multiplayer & Social
  const [remotePlayers, setRemotePlayers] = useState(new Map());
  const [chatMessages, setChatMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(1);

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
    try {
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.22 },
        colors: ['#fbbf24', '#f59e0b', '#ea580c', '#ec4899', '#22c55e']
      });
    } catch (_) {}

    // Add entry announcement to chat log
    setChatMessages((prev) => [
      ...prev.slice(-25),
      {
        senderId: 'system',
        senderName: '🪔 Diwali Mela',
        text: `✨ ${profile.name} entered the Diwali Celebration Mela! Shubh Deepawali!`,
        timestamp: Date.now()
      }
    ]);

    // 2. Initialize Multiplayer Peer connection
    multiplayerManager.init(profile.roomId, updatedPlayer, {
      onPeerUpdate: (peersMap) => {
        setRemotePlayers(peersMap);
        setOnlineCount(peersMap.size + 1);
      },
      onPlayerJoined: (newRemotePlayer) => {
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
        setChatMessages((prev) => [
          ...prev.slice(-25),
          {
            senderId: 'system',
            senderName: '🪔 Diwali Mela',
            text: `🎆 ${newRemotePlayer.name} entered the Diwali Celebration Mela!`,
            timestamp: Date.now()
          }
        ]);
      },
      onChatMessage: (msg) => {
        setChatMessages((prev) => [...prev.slice(-25), msg]);
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
        setChatMessages((prev) => [
          ...prev.slice(-25),
          {
            senderId: 'system',
            senderName: '🎆 Dhamaka Alert',
            text: `✨ ${evt.placedBy || 'A Friend'} ignited a ${evt.crackerName || 'Cracker'}! 🪔`,
            timestamp: Date.now()
          }
        ]);
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
    setIsDancing(true);
    soundEngine.init();
    soundEngine.playDholakBeat(true);
    soundEngine.playCrowdCheer();
    setTimeout(() => setIsDancing(false), 3500);
  };

  // Keyboard number shortcuts to select crackers (Keys 1-8)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= CRACKERS.length) {
        const cracker = CRACKERS[keyNum - 1];
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
        setIsFortuneWheelOpen(false);
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
        coins={coins}
        player={player}
        currentZone={getCurrentZoneName(player.x, player.y)}
      />

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
        wheelSpun={wheelSpun}
        chaiDrank={chaiDrank}
        wheelRode={wheelRode}
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
        onOpenCrackerShop={() => setIsCrackerShopOpen(true)}
        onOpenTemple={() => setIsTempleOpen(true)}
        onOpenBalloonGame={() => {
          setIsBalloonGameOpen(true);
          setBalloonPlayed(true);
        }}
        onOpenFortuneWheel={() => {
          setIsFortuneWheelOpen(true);
          setWheelSpun(true);
        }}
        onOpenChaiTapri={() => {
          setIsChaiTapriOpen(true);
          setChaiDrank(true);
        }}
        remotePlayers={remotePlayers}
        multiplayerManager={multiplayerManager}
        screenShake={screenShake}
        setScreenShake={setScreenShake}
        activeBuffs={activeBuffs}
        onDiyaLit={() => setLitDiyasCount((c) => Math.min(16, c + 1))}
        onCrackerBurst={() => setBurstCount((b) => b + 1)}
        isDancing={isDancing}
        setIsDancing={setIsDancing}
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
        onOpenFortuneWheel={() => {
          setIsFortuneWheelOpen(true);
          setWheelSpun(true);
        }}
        onOpenChaiTapri={() => {
          setIsChaiTapriOpen(true);
          setChaiDrank(true);
        }}
        onTriggerDance={handleTriggerDance}
        isDancing={isDancing}
      />

      {/* 8. Live Chat Overlay */}
      <ChatOverlay
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
        onGoToDhamakaGround={() => handleNavigateTo(MELA_ZONES.DHAMAKA_GROUND.x, MELA_ZONES.DHAMAKA_GROUND.y)}
      />


      <TempleModal
        isOpen={isTempleOpen}
        onClose={() => setIsTempleOpen(false)}
        setCoins={(c) => {
          setCoins(c);
          setBellRung(true);
        }}
      />

      <BalloonShootingModal
        isOpen={isBalloonGameOpen}
        onClose={() => setIsBalloonGameOpen(false)}
        coins={coins}
        setCoins={setCoins}
        setInventory={setInventory}
      />

      <LuckyWheelModal
        isOpen={isFortuneWheelOpen}
        onClose={() => setIsFortuneWheelOpen(false)}
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
    </div>
  );
}
