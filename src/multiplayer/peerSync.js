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
    this.hostConn = null;
    this.broadcastChannel = null;
    this.onPeerUpdate = null; // callback(peersMap)
    this.onCrackerEvent = null; // callback(event)
    this.onChatMessage = null; // callback(msg)
    this.onDiyaUpdate = null; // callback(diyaData)
    this.remotePlayers = new Map(); // id -> playerData
    this.connectedPeersCount = 0;
    this.isConnected = false;
  }

  init(roomId = 'diwali-mela-main', myProfile, callbacks) {
    this.roomId = roomId || 'diwali-mela-main';
    this.myProfile = myProfile;
    this.onPeerUpdate = callbacks.onPeerUpdate;
    this.onPlayerJoined = callbacks.onPlayerJoined;
    this.onCrackerEvent = callbacks.onCrackerEvent;
    this.onChatMessage = callbacks.onChatMessage;
    this.onDiyaUpdate = callbacks.onDiyaUpdate;

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
  }

  initPeerJS() {
    try {
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const myId = `diwali_p_${this.roomId}_${randomSuffix}`;

      this.peer = new Peer(myId, {
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
        this.isConnected = true;
        // Broadcast presence
        this.broadcastState();
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS connection notice:', err.type);
      });
    } catch (e) {
      console.warn('WebRTC peer fallback to local channel', e);
    }
  }

  setupConnection(conn) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      this.connectedPeersCount = this.connections.size;
      // Send our profile immediately
      this.broadcastState();
    });

    conn.on('data', (data) => {
      this.handleIncomingData(data, conn.peer);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.remotePlayers.delete(conn.peer);
      this.connectedPeersCount = this.connections.size;
      if (this.onPeerUpdate) this.onPeerUpdate(new Map(this.remotePlayers));
    });
  }

  // Connect to another known peer or room host
  connectToPeer(targetPeerId) {
    if (!this.peer || this.connections.has(targetPeerId)) return;
    try {
      const conn = this.peer.connect(targetPeerId, { reliable: true });
      this.setupConnection(conn);
    } catch (e) {
      console.warn('Could not connect to peer', targetPeerId, e);
    }
  }

  handleIncomingData(data, sourceId) {
    if (!data || !data.type) return;

    // Ignore self-echoes from broadcast channel
    if (data.senderId === this.peerId || data.senderId === this.myProfile?.id) {
      return;
    }

    switch (data.type) {
      case 'PLAYER_UPDATE': {
        const player = data.player;
        if (player && player.id) {
          const isNew = !this.remotePlayers.has(player.id);
          this.remotePlayers.set(player.id, {
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
          this.onCrackerEvent(data.event);
        }
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
          this.onDiyaUpdate(data.diya);
        }
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
  broadcastPlayerState(playerState) {
    this.myProfile = { ...this.myProfile, ...playerState };
    const payload = {
      type: 'PLAYER_UPDATE',
      senderId: this.myProfile.id || this.peerId,
      player: this.myProfile,
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
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'PLAYER_LEFT',
        playerId: this.myProfile?.id || this.peerId
      });
      this.broadcastChannel.close();
    }
    if (this.peer) {
      this.peer.destroy();
    }
  }
}

export const multiplayerManager = new MultiplayerManager();
