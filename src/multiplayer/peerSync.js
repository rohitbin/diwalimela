// Real-time Multiplayer Synchronization via PeerJS (WebRTC) and BroadcastChannel
// Enables real people to join the Diwali Mela from different tabs, devices, or remote links!

import Peer from 'peerjs';

class MultiplayerManager {
  constructor() {
    this.peer = null;
    this.peerId = null;
    this.roomId = 'diwali-mela-main';
    this.isHost = false;
    this.connections = new Map(); // connId -> conn
    this.broadcastChannel = null;
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

  init(roomId = 'diwali-mela-main', myProfile, callbacks = {}) {
    this.roomId = roomId || 'diwali-mela-main';
    this.myProfile = myProfile;
    if (callbacks.onPeerUpdate) this.onPeerUpdate = callbacks.onPeerUpdate;
    if (callbacks.onPlayerJoined) this.onPlayerJoined = callbacks.onPlayerJoined;
    if (callbacks.onCrackerEvent) this.onCrackerEvent = callbacks.onCrackerEvent;
    if (callbacks.onChatMessage) this.onChatMessage = callbacks.onChatMessage;
    if (callbacks.onDiyaUpdate) this.onDiyaUpdate = callbacks.onDiyaUpdate;

    // 1. Cross-tab instant local channel for seamless multi-tab testing & local network play
    try {
      this.broadcastChannel = new BroadcastChannel(`diwali_mela_${this.roomId}`);
      this.broadcastChannel.onmessage = (event) => {
        this.handleIncomingData(event.data, 'local_channel');
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported', e);
    }

    // 2. Initialize PeerJS for genuine Internet WebRTC multiplayer
    this.initPeerJS();

    // 3. Immediately announce presence across local channel
    this.sendHandshake();

    // 4. Regular heartbeat so stationary players never disappear or get desynced
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (this.myProfile) {
        this.broadcastPlayerState(this.myProfile, true);
      }
    }, 1200);

    // 5. Prune disconnected or stale peers who closed their tab
    if (this.pruneTimer) clearInterval(this.pruneTimer);
    this.pruneTimer = setInterval(() => {
      this.pruneStalePeers();
    }, 2500);

    // 6. Handle tab close/unload
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  initPeerJS() {
    try {
      const sanitizedRoom = this.roomId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const hostId = `diwali_host_${sanitizedRoom}`;
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const clientId = `diwali_p_${sanitizedRoom}_${randomSuffix}`;

      // Try connecting as host first, fallback to client if host exists
      this.peer = new Peer(hostId, {
        debug: 1,
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
        debug: 1,
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
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  handleIncomingData(data, sourceId) {
    if (!data || !data.type) return;

    // Ignore self-echoes
    if (data.senderId === this.peerId || data.senderId === this.myProfile?.id || data.player?.id === this.myProfile?.id) {
      return;
    }

    switch (data.type) {
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
          this.sendToAll({
            type: 'HELLO_ACK',
            senderId: this.myProfile?.id || this.peerId,
            player: this.myProfile,
            timestamp: Date.now()
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
        this.ravanListeners.forEach((fn) => {
          try { fn(data.event); } catch (e) { console.error('Ravan listener error:', e); }
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

      default:
        break;
    }
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

  // Send Ravan shot / hit event
  broadcastRavanHit(hitEvent) {
    const payload = {
      type: 'RAVAN_HIT',
      senderId: this.myProfile?.id || this.peerId,
      event: hitEvent,
      timestamp: Date.now()
    };
    this.sendToAll(payload);
  }

  pruneStalePeers() {
    const now = Date.now();
    let changed = false;
    this.remotePlayers.forEach((p, id) => {
      if (now - (p.lastSeen || 0) > 7500) {
        this.remotePlayers.delete(id);
        changed = true;
      }
    });
    if (changed && this.onPeerUpdate) {
      this.onPeerUpdate(new Map(this.remotePlayers));
    }
  }

  sendToAll(data) {
    // 1. BroadcastChannel (fastest for multiple tabs/windows on same PC/browser)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
      } catch {}
    }

    // 2. PeerJS connections (for separate devices/users across internet)
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
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
    }
  }
}

export const multiplayerManager = new MultiplayerManager();
