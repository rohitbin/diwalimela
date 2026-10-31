// Real-time Multiplayer Synchronization via BroadcastChannel, MQTT WebSocket, and PeerJS (WebRTC)
// Enables real people to join the Diwali Mela from different tabs, devices, or remote links!

import Peer from 'peerjs';
import mqtt from 'mqtt';

class MultiplayerManager {
  constructor() {
    this.peer = null;
    this.peerId = null;
    this.roomId = 'diwali-mela-main';
    this.isHost = false;
    this.connections = new Map(); // connId -> conn
    this.broadcastChannel = null;
    this.mqttClient = null;
    this.mqttTopic = null;
    this.onPeerUpdate = null; // callback(peersMap)
    this.onPlayerJoined = null; // callback(newPlayer)
    this.onCrackerEvent = null; // callback(event)
    this.onChatMessage = null; // callback(msg)
    this.onDiyaUpdate = null; // callback(diyaData)
    this.remotePlayers = new Map(); // id -> playerData
    this.connectedPeersCount = 0;
    this.isConnected = false;
    this.heartbeatTimer = null;
    this.pruneTimer = null;
    this.crackerListeners = new Set();
    this.diyaListeners = new Set();
    this.ravanListeners = new Set();
    this.projectileListeners = new Set();
    this.buffListeners = new Set();
    this.bellListeners = new Set();
    this.danceListeners = new Set();
    this.dhamakaListeners = new Set();
    this.entryListeners = new Set();
    this.gunFightListeners = new Set();
    this.processedMsgIds = new Set();
    this.currentRavanHp = 10000000;
    this.mqttRavanTopic = null;
  }

  setInitialRavanHp(hp) {
    if (typeof hp === 'number' && Number.isFinite(hp) && hp >= 0) {
      this.currentRavanHp = Math.min(this.currentRavanHp, Math.round(hp));
    }
  }

  updateRavanHp(newHp) {
    if (typeof newHp !== 'number' || !Number.isFinite(newHp)) return;
    const rounded = Math.max(0, Math.round(newHp));
    // STRICT RULE: Ravan's energy can ONLY DECREASE, NEVER AUTOMATICALLY INCREASE!
    if (rounded < this.currentRavanHp) {
      this.currentRavanHp = rounded;
      if (this.mqttClient && this.mqttClient.connected && this.mqttRavanTopic) {
        try {
          this.mqttClient.publish(
            this.mqttRavanTopic,
            JSON.stringify({ type: 'RAVAN_SYNC', hp: this.currentRavanHp, timestamp: Date.now() }),
            { qos: 1, retain: true }
          );
        } catch (_) {}
      }
      this.sendToAll({
        type: 'RAVAN_SYNC',
        hp: this.currentRavanHp,
        timestamp: Date.now()
      });
      this.ravanListeners.forEach((fn) => {
        try { fn({ type: 'SYNC', hp: this.currentRavanHp }); } catch (_) {}
      });
    }
  }

  onMelaEntry(callback) {
    this.entryListeners.add(callback);
    return () => this.entryListeners.delete(callback);
  }

  onRavanHit(callback) {
    this.ravanListeners.add(callback);
    return () => this.ravanListeners.delete(callback);
  }

  onCracker(callback) {
    this.crackerListeners.add(callback);
    return () => this.crackerListeners.delete(callback);
  }

  onDiya(callback) {
    this.diyaListeners.add(callback);
    return () => this.diyaListeners.delete(callback);
  }

  onProjectile(callback) {
    this.projectileListeners.add(callback);
    return () => this.projectileListeners.delete(callback);
  }

  onBuff(callback) {
    this.buffListeners.add(callback);
    return () => this.buffListeners.delete(callback);
  }

  onTempleBell(callback) {
    this.bellListeners.add(callback);
    return () => this.bellListeners.delete(callback);
  }

  onDance(callback) {
    this.danceListeners.add(callback);
    return () => this.danceListeners.delete(callback);
  }

  onGlobalDhamaka(callback) {
    this.dhamakaListeners.add(callback);
    return () => this.dhamakaListeners.delete(callback);
  }

  onGunFight(callback) {
    this.gunFightListeners.add(callback);
    return () => this.gunFightListeners.delete(callback);
  }

  startBackgroundPresence(roomId = 'diwali-mela-main', onPlayerEntered) {
    this.roomId = roomId || 'diwali-mela-main';
    if (onPlayerEntered) {
      this.entryListeners.add(onPlayerEntered);
    }

    if (!this.broadcastChannel) {
      try {
        this.broadcastChannel = new BroadcastChannel(`diwali_mela_${this.roomId}`);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingData(event.data, 'local_channel');
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }
    }

    if (!this.mqttClient) {
      this.initMQTT();
    }
  }

  init(roomId = 'diwali-mela-main', myProfile, callbacks = {}) {
    this.roomId = roomId || 'diwali-mela-main';
    this.myProfile = myProfile;
    if (callbacks.onPeerUpdate) this.onPeerUpdate = callbacks.onPeerUpdate;
    if (callbacks.onPlayerJoined) this.onPlayerJoined = callbacks.onPlayerJoined;
    if (callbacks.onCrackerEvent) this.onCrackerEvent = callbacks.onCrackerEvent;
    if (callbacks.onChatMessage) this.onChatMessage = callbacks.onChatMessage;
    if (callbacks.onDiyaUpdate) this.onDiyaUpdate = callbacks.onDiyaUpdate;

    // 1. Cross-tab instant local channel for seamless multi-tab testing & local network play
    if (!this.broadcastChannel) {
      try {
        this.broadcastChannel = new BroadcastChannel(`diwali_mela_${this.roomId}`);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingData(event.data, 'local_channel');
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }
    }

    // 2. High-reliability public MQTT WebSocket connection (works across all browsers, networks & phones)
    if (!this.mqttClient) {
      this.initMQTT();
    } else if (this.mqttClient.connected) {
      this.sendHandshake();
    }

    // 3. Initialize PeerJS for direct WebRTC data channels
    if (!this.peer) {
      this.initPeerJS();
    }

    // 4. Immediately announce presence across all channels
    this.sendHandshake();

    // 5. Regular heartbeat so stationary players never disappear or get desynced
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (this.myProfile) {
        this.broadcastPlayerState(this.myProfile, true);
      }
    }, 1200);

    // 6. Prune disconnected or stale peers who closed their tab
    if (this.pruneTimer) clearInterval(this.pruneTimer);
    this.pruneTimer = setInterval(() => {
      this.pruneStalePeers();
    }, 3500);

    // 7. Handle tab close/unload
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  initMQTT() {
    try {
      const sanitizedRoom = (this.roomId || 'diwali-mela-main').replace(/[^a-zA-Z0-9_-]/g, '_');
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const clientId = `diwali_p_${sanitizedRoom}_${randomSuffix}`;
      const topic = `diwalimela/${sanitizedRoom}/events`;
      const ravanTopic = `diwalimela/${sanitizedRoom}/ravan_state`;
      this.mqttTopic = topic;
      this.mqttRavanTopic = ravanTopic;

      // Connect to fast public MQTT WebSocket broker
      this.mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 3000,
        keepalive: 60
      });

      this.mqttClient.on('connect', () => {
        this.isConnected = true;
        // Subscribe to events and retained Ravan boss state
        this.mqttClient.subscribe([topic, ravanTopic], { qos: 0 }, (err) => {
          if (!err) {
            this.sendHandshake();
            // Publish our current Ravan HP if we have a reduced state
            if (this.currentRavanHp < 10000000) {
              try {
                this.mqttClient.publish(
                  ravanTopic,
                  JSON.stringify({ type: 'RAVAN_SYNC', hp: this.currentRavanHp, timestamp: Date.now() }),
                  { qos: 1, retain: true }
                );
              } catch (_) {}
            }
          }
        });
      });

      this.mqttClient.on('message', (t, payload) => {
        try {
          const str = payload.toString();
          const data = JSON.parse(str);
          if (t === this.mqttRavanTopic || data.type === 'RAVAN_SYNC') {
            const incomingHp = data.hp ?? data.currentHp ?? data.ravanHp;
            if (typeof incomingHp === 'number' && Number.isFinite(incomingHp) && incomingHp < this.currentRavanHp) {
              this.currentRavanHp = Math.max(0, Math.round(incomingHp));
              this.ravanListeners.forEach((fn) => {
                try { fn({ type: 'SYNC', hp: this.currentRavanHp }); } catch (_) {}
              });
            }
            return;
          }
          this.handleIncomingData(data, 'mqtt');
        } catch (_) {}
      });

      this.mqttClient.on('error', (err) => {
        console.warn('MQTT notice:', err?.message || err);
      });
    } catch (e) {
      console.warn('MQTT fallback to local channel & WebRTC:', e);
    }
  }

  initPeerJS() {
    try {
      const sanitizedRoom = (this.roomId || 'diwali-mela-main').replace(/[^a-zA-Z0-9_-]/g, '_');
      const hostId = `diwali_host_${sanitizedRoom}`;
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const clientId = `diwali_p_${sanitizedRoom}_${randomSuffix}`;

      // Try connecting as host first, fallback to client if host exists
      this.peer = new Peer(hostId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        this.isHost = true;
        this.isConnected = true;
        this.sendHandshake();
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
          // Host already exists! Connect as a room client to the host
          this.initClientPeer(clientId, hostId);
        } else {
          console.warn('PeerJS notice:', err.type);
        }
      });
    } catch (e) {
      console.warn('WebRTC peer fallback to local channel', e);
    }
  }

  initClientPeer(clientId, hostId) {
    try {
      this.peer = new Peer(clientId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        this.isHost = false;
        this.isConnected = true;
        // Connect to the known room host
        this.connectToPeer(hostId);
        this.sendHandshake();
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });
    } catch (e) {
      console.warn('Client peer initialization failed:', e);
    }
  }

  setupConnection(conn) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      this.connectedPeersCount = this.connections.size;
      // Send our state immediately upon connection
      conn.send({
        type: 'HELLO_ACK',
        senderId: this.myProfile?.id || this.peerId,
        player: this.myProfile,
        ravanHp: this.currentRavanHp,
        timestamp: Date.now()
      });
    });

    conn.on('data', (data) => {
      this.handleIncomingData(data, conn.peer);
      // If we are host, relay data to other connected clients
      if (this.isHost) {
        this.connections.forEach((otherConn) => {
          if (otherConn.peer !== conn.peer && otherConn.open) {
            try {
              otherConn.send(data);
            } catch {}
          }
        });
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.connectedPeersCount = this.connections.size;
    });
  }

  connectToPeer(targetPeerId) {
    if (!this.peer || this.connections.has(targetPeerId)) return;
    try {
      const conn = this.peer.connect(targetPeerId, { reliable: true });
      this.setupConnection(conn);
    } catch (e) {
      console.warn('Could not connect to peer', targetPeerId, e);
    }
  }

  sendHandshake() {
    if (!this.myProfile) return;
    const payload = {
      type: 'HELLO',
      senderId: this.myProfile.id || this.peerId,
      player: this.myProfile,
      ravanHp: this.currentRavanHp,
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  handleIncomingData(data, _sourceId) {
    if (!data || !data.type) return;

    // Deduplication check to prevent repeating actions across channels
    const msgId = data.msgId || `${data.type}_${data.senderId}_${data.timestamp || ''}_${data.event?.id || data.projectile?.id || ''}`;
    if (this.processedMsgIds.has(msgId)) {
      return;
    }
    this.processedMsgIds.add(msgId);
    if (this.processedMsgIds.size > 600) {
      const first = this.processedMsgIds.values().next().value;
      this.processedMsgIds.delete(first);
    }

    // Ignore self-echoes
    const myId = this.myProfile?.id;
    if (myId && (data.senderId === myId || data.player?.id === myId)) {
      return;
    }

    // Sync Ravan HP from any incoming message, strictly lowering only (never automatically refills)!
    const incomingRavanHp = data.currentHp ?? data.ravanHp ?? (data.type === 'RAVAN_SYNC' ? data.hp : undefined);
    if (typeof incomingRavanHp === 'number' && Number.isFinite(incomingRavanHp) && incomingRavanHp >= 0) {
      if (incomingRavanHp < this.currentRavanHp) {
        this.currentRavanHp = Math.round(incomingRavanHp);
        this.ravanListeners.forEach((fn) => {
          try { fn({ type: 'SYNC', hp: this.currentRavanHp }); } catch (_) {}
        });
      }
    }

    if (data.type === 'RAVAN_SYNC') {
      return;
    }

    switch (data.type) {
      case 'MELA_ENTER': {
        const player = data.player;
        if (player && player.id && player.id !== this.myProfile?.id) {
          const isNew = !this.remotePlayers.has(player.id);
          this.remotePlayers.set(player.id, {
            ...player,
            lastSeen: Date.now(),
            isRealPerson: true
          });

          // Reply with HELLO_ACK so the new entrant immediately sees us too
          if (this.myProfile) {
            this.sendToAll({
              type: 'HELLO_ACK',
              senderId: this.myProfile?.id || this.peerId,
              player: this.myProfile,
              ravanHp: this.currentRavanHp,
              timestamp: Date.now()
            });
          }

          // Trigger entry listeners (shows push/device notifications on installed devices!)
          this.entryListeners.forEach((fn) => {
            try { fn(player); } catch (e) { console.error('Entry listener error:', e); }
          });

          if (isNew && this.onPlayerJoined) {
            this.onPlayerJoined(player);
          }
          if (this.onPeerUpdate) {
            this.onPeerUpdate(new Map(this.remotePlayers));
          }
        }
        break;
      }

      case 'HELLO': {
        const player = data.player;
        if (player && player.id && player.id !== this.myProfile?.id) {
          const isNew = !this.remotePlayers.has(player.id);
          this.remotePlayers.set(player.id, {
            ...player,
            lastSeen: Date.now(),
            isRealPerson: true
          });

          // Reply with HELLO_ACK so the new player immediately sees us too!
          if (this.myProfile) {
            this.sendToAll({
              type: 'HELLO_ACK',
              senderId: this.myProfile?.id || this.peerId,
              player: this.myProfile,
              ravanHp: this.currentRavanHp,
              timestamp: Date.now()
            });
          }

          if (isNew) {
            this.entryListeners.forEach((fn) => {
              try { fn(player); } catch (e) { console.error('Entry listener error:', e); }
            });
          }

          if (isNew && this.onPlayerJoined) {
            this.onPlayerJoined(player);
          }
          if (this.onPeerUpdate) {
            this.onPeerUpdate(new Map(this.remotePlayers));
          }
        }
        break;
      }

      case 'HELLO_ACK':
      case 'PLAYER_UPDATE': {
        const player = data.player;
        if (player && player.id && player.id !== this.myProfile?.id) {
          const isNew = !this.remotePlayers.has(player.id);
          const existing = this.remotePlayers.get(player.id) || {};
          this.remotePlayers.set(player.id, {
            ...existing,
            ...player,
            lastSeen: Date.now(),
            isRealPerson: true
          });

          if (isNew && this.onPlayerJoined) {
            this.onPlayerJoined(player);
          }
          if (this.onPeerUpdate) {
            this.onPeerUpdate(new Map(this.remotePlayers));
          }
        }
        break;
      }

      case 'CRACKER_EVENT': {
        if (this.onCrackerEvent) {
          try { this.onCrackerEvent(data.event); } catch (e) { console.error(e); }
        }
        this.crackerListeners.forEach((fn) => {
          try { fn(data.event); } catch (e) { console.error('Cracker listener error:', e); }
        });
        break;
      }

      case 'PROJECTILE_EVENT': {
        this.projectileListeners.forEach((fn) => {
          try { fn(data.projectile); } catch (e) { console.error('Projectile listener error:', e); }
        });
        break;
      }

      case 'BUFF_EVENT': {
        if (data.buff && data.buff.playerId) {
          const existing = this.remotePlayers.get(data.buff.playerId);
          if (existing) {
            this.remotePlayers.set(data.buff.playerId, {
              ...existing,
              activeBuffs: { ...(existing.activeBuffs || {}), [data.buff.buffId]: true }
            });
            if (this.onPeerUpdate) this.onPeerUpdate(new Map(this.remotePlayers));
          }
        }
        this.buffListeners.forEach((fn) => {
          try { fn(data.buff); } catch (e) { console.error('Buff listener error:', e); }
        });
        break;
      }

      case 'TEMPLE_BELL': {
        this.bellListeners.forEach((fn) => {
          try { fn(data.bell); } catch (e) { console.error('Bell listener error:', e); }
        });
        break;
      }

      case 'PLAYER_DANCE': {
        if (data.dance && data.dance.playerId) {
          const existing = this.remotePlayers.get(data.dance.playerId);
          if (existing) {
            this.remotePlayers.set(data.dance.playerId, {
              ...existing,
              isDancing: data.dance.isDancing,
              danceStep: data.dance.danceStep !== undefined ? data.dance.danceStep : (existing.danceStep || 0)
            });
            if (this.onPeerUpdate) this.onPeerUpdate(new Map(this.remotePlayers));
          }
        }
        this.danceListeners.forEach((fn) => {
          try { fn(data.dance); } catch (e) { console.error('Dance listener error:', e); }
        });
        break;
      }

      case 'GLOBAL_DHAMAKA': {
        this.dhamakaListeners.forEach((fn) => {
          try { fn(data.dhamaka); } catch (e) { console.error('Dhamaka listener error:', e); }
        });
        break;
      }

      case 'CHAT_MESSAGE': {
        if (this.onChatMessage) {
          this.onChatMessage(data.message);
        }
        break;
      }

      case 'DIYA_UPDATE': {
        if (this.onDiyaUpdate) {
          try { this.onDiyaUpdate(data.diya); } catch (e) { console.error(e); }
        }
        this.diyaListeners.forEach((fn) => {
          try { fn(data.diya); } catch (e) { console.error('Diya listener error:', e); }
        });
        break;
      }

      case 'RAVAN_HIT': {
        const dmg = data.event?.damage || data.damage || 100;
        const incomingHp = data.currentHp ?? data.event?.currentHp;
        if (typeof incomingHp === 'number' && Number.isFinite(incomingHp)) {
          if (incomingHp < this.currentRavanHp) {
            this.currentRavanHp = Math.max(0, Math.round(incomingHp));
          }
        } else {
          this.currentRavanHp = Math.max(0, this.currentRavanHp - dmg);
        }
        this.ravanListeners.forEach((fn) => {
          try {
            fn({
              ...(data.event || {}),
              damage: dmg,
              hp: this.currentRavanHp,
              currentHp: this.currentRavanHp
            });
          } catch (e) {
            console.error('Ravan listener error:', e);
          }
        });
        break;
      }

      case 'PLAYER_LEFT': {
        if (data.playerId) {
          this.remotePlayers.delete(data.playerId);
          if (this.onPeerUpdate) {
            this.onPeerUpdate(new Map(this.remotePlayers));
          }
        }
        break;
      }

      case 'GUN_FIGHT_CHALLENGE':
      case 'GUN_FIGHT_ACCEPT':
      case 'GUN_FIGHT_DECLINE':
      case 'GUN_FIGHT_SHOT':
      case 'GUN_FIGHT_HIT':
      case 'GUN_FIGHT_END': {
        this.gunFightListeners.forEach((fn) => {
          try { fn(data); } catch (e) { console.error('Gun fight listener error:', e); }
        });
        break;
      }

      default:
        break;
    }
  }

  // Broadcast that a player entered the Mela (triggers native push/device notifications)
  broadcastMelaEntry(player) {
    const p = player || this.myProfile;
    if (!p) return;
    const payload = {
      type: 'MELA_ENTER',
      senderId: p.id || this.peerId,
      player: {
        id: p.id || this.peerId,
        name: p.name || 'A Festive Friend',
        color: p.color,
        turbanColor: p.turbanColor
      },
      ravanHp: this.currentRavanHp,
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  // Update my local player state and broadcast to all peers
  broadcastPlayerState(playerState, isHeartbeat = false) {
    this.myProfile = { ...this.myProfile, ...playerState };
    const payload = {
      type: 'PLAYER_UPDATE',
      senderId: this.myProfile.id || this.peerId,
      player: this.myProfile,
      isHeartbeat,
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  // Send cracker placement or ignition event
  broadcastCrackerEvent(crackerEvent) {
    const payload = {
      type: 'CRACKER_EVENT',
      senderId: this.myProfile?.id || this.peerId,
      event: crackerEvent,
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  // Send projectile fired (fiery arrow or spark bullet)
  broadcastProjectile(projectileData) {
    const payload = {
      type: 'PROJECTILE_EVENT',
      senderId: this.myProfile?.id || this.peerId,
      projectile: projectileData,
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  // Send sweet/chai food buff activated
  broadcastPlayerBuff(buffData) {
    const payload = {
      type: 'BUFF_EVENT',
      senderId: this.myProfile?.id || this.peerId,
      buff: {
        ...buffData,
        playerId: this.myProfile?.id || this.peerId
      },
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  // Send temple bell ring event
  broadcastTempleBell(bellData) {
    const payload = {
      type: 'TEMPLE_BELL',
      senderId: this.myProfile?.id || this.peerId,
      bell: bellData,
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  // Send player dance state
  broadcastPlayerDance(danceData) {
    const payload = {
      type: 'PLAYER_DANCE',
      senderId: this.myProfile?.id || this.peerId,
      dance: {
        ...danceData,
        playerId: this.myProfile?.id || this.peerId
      },
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  // Send global dhamaka screen flash and rumble for epic bombs
  broadcastGlobalDhamaka(dhamakaData) {
    const payload = {
      type: 'GLOBAL_DHAMAKA',
      senderId: this.myProfile?.id || this.peerId,
      dhamaka: dhamakaData,
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  // Send festive chat message or greeting
  broadcastChatMessage(chatMessage) {
    const payload = {
      type: 'CHAT_MESSAGE',
      senderId: this.myProfile?.id || this.peerId,
      message: chatMessage,
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  // Send Diya lit update
  broadcastDiyaUpdate(diyaData) {
    const payload = {
      type: 'DIYA_UPDATE',
      senderId: this.myProfile?.id || this.peerId,
      diya: diyaData,
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  // Send Ravan shot / hit event (strictly lowers HP, never allows energy to refill)
  broadcastRavanHit(hitEvent) {
    const dmg = hitEvent.damage || 100;
    const nextHp = typeof hitEvent.currentHp === 'number'
      ? Math.max(0, Math.round(hitEvent.currentHp))
      : Math.max(0, this.currentRavanHp - dmg);

    // Strictly lower only:
    this.currentRavanHp = Math.min(this.currentRavanHp, nextHp);

    const payload = {
      type: 'RAVAN_HIT',
      senderId: this.myProfile?.id || this.peerId,
      event: {
        ...hitEvent,
        damage: dmg,
        currentHp: this.currentRavanHp
      },
      currentHp: this.currentRavanHp,
      timestamp: Date.now()
    };
    this.sendToAll(payload);

    // Retain reduced HP to MQTT broker so all clients persist this state
    if (this.mqttClient && this.mqttClient.connected && this.mqttRavanTopic) {
      try {
        this.mqttClient.publish(
          this.mqttRavanTopic,
          JSON.stringify({ type: 'RAVAN_SYNC', hp: this.currentRavanHp, timestamp: Date.now() }),
          { qos: 1, retain: true }
        );
      } catch (_) {}
    }
  }

  // Gun Fight PvP Broadcasts
  broadcastGunFightChallenge(challenge) {
    this.sendToAll({
      type: 'GUN_FIGHT_CHALLENGE',
      senderId: this.myProfile?.id || this.peerId,
      ...challenge,
      timestamp: Date.now()
    });
  }

  broadcastGunFightAccept(data) {
    this.sendToAll({
      type: 'GUN_FIGHT_ACCEPT',
      senderId: this.myProfile?.id || this.peerId,
      ...data,
      timestamp: Date.now()
    });
  }

  broadcastGunFightDecline(data) {
    this.sendToAll({
      type: 'GUN_FIGHT_DECLINE',
      senderId: this.myProfile?.id || this.peerId,
      ...data,
      timestamp: Date.now()
    });
  }

  broadcastGunFightShot(data) {
    this.sendToAll({
      type: 'GUN_FIGHT_SHOT',
      senderId: this.myProfile?.id || this.peerId,
      ...data,
      timestamp: Date.now()
    });
  }

  broadcastGunFightHit(data) {
    this.sendToAll({
      type: 'GUN_FIGHT_HIT',
      senderId: this.myProfile?.id || this.peerId,
      ...data,
      timestamp: Date.now()
    });
  }

  broadcastGunFightEnd(data) {
    this.sendToAll({
      type: 'GUN_FIGHT_END',
      senderId: this.myProfile?.id || this.peerId,
      ...data,
      timestamp: Date.now()
    });
  }

  pruneStalePeers() {
    const now = Date.now();
    let changed = false;
    this.remotePlayers.forEach((p, id) => {
      if (now - (p.lastSeen || 0) > 8500) {
        this.remotePlayers.delete(id);
        changed = true;
      }
    });
    if (changed && this.onPeerUpdate) {
      this.onPeerUpdate(new Map(this.remotePlayers));
    }
  }

  sendToAll(data) {
    if (!data.msgId) {
      data.msgId = `${data.type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }
    // Remember our own sent message ID so we don't process it if echoed back
    this.processedMsgIds.add(data.msgId);
    if (this.processedMsgIds.size > 600) {
      const first = this.processedMsgIds.values().next().value;
      this.processedMsgIds.delete(first);
    }

    // 1. BroadcastChannel (fastest for multiple tabs/windows on same PC/browser)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
      } catch {}
    }

    // 2. High-speed MQTT WebSocket (universal internet sync across devices & networks)
    if (this.mqttClient && this.mqttClient.connected && this.mqttTopic) {
      try {
        this.mqttClient.publish(this.mqttTopic, JSON.stringify(data));
      } catch {}
    }

    // 3. PeerJS direct WebRTC connections
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(data);
        } catch {}
      }
    });
  }

  broadcastState() {
    if (this.myProfile) {
      this.broadcastPlayerState(this.myProfile);
    }
  }

  disconnect() {
    const playerId = this.myProfile?.id || this.peerId;
    if (playerId) {
      this.sendToAll({
        type: 'PLAYER_LEFT',
        playerId
      });
    }
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.pruneTimer) clearInterval(this.pruneTimer);
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {}
    }
    if (this.mqttClient) {
      try {
        this.mqttClient.end(true);
      } catch {}
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
    }
  }
}

export const multiplayerManager = new MultiplayerManager();
