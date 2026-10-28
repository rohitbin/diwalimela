// Diwali Mahotsav Mela - Native PWA & Web Push Notification Service
// Sends OS/device notifications when someone enters the Mela so installed users never miss a friend!

class NotificationService {
  constructor() {
    this.recentlyNotified = new Map(); // playerId/name -> timestamp
    this.listeners = new Set();
  }

  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  isServiceWorkerReady() {
    return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  }

  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  isEnabled() {
    if (!this.isSupported()) return false;
    if (Notification.permission !== 'granted') return false;
    const pref = localStorage.getItem('diwali_notifications_enabled');
    return pref !== 'false';
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(status) {
    this.listeners.forEach((fn) => {
      try { fn(status); } catch (_) {}
    });
  }

  async requestPermission() {
    if (!this.isSupported()) {
      return { success: false, reason: 'unsupported' };
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';

      if (granted) {
        localStorage.setItem('diwali_notifications_enabled', 'true');
      } else if (permission === 'denied') {
        localStorage.setItem('diwali_notifications_enabled', 'false');
      }

      this.notifyListeners(permission);
      return { success: granted, permission };
    } catch (err) {
      console.warn('[NotificationService] Error requesting permission:', err);
      return { success: false, reason: 'error', error: err };
    }
  }

  setEnabled(enabled) {
    localStorage.setItem('diwali_notifications_enabled', enabled ? 'true' : 'false');
    this.notifyListeners(enabled ? 'granted' : 'disabled');
  }

  /**
   * Trigger a native device notification when someone enters the Mela
   * @param {string} playerName - Name of the player who entered
   * @param {object} playerInfo - Metadata about the player
   */
  async notifyPlayerEntered(playerName, playerInfo = {}) {
    if (!this.isEnabled()) return false;

    const name = (playerName || playerInfo.name || 'A Festive Friend').trim();
    const playerId = playerInfo.id || name.toLowerCase();

    // Prevent spamming duplicate notifications for the same player within 35 seconds
    const now = Date.now();
    const lastNotified = this.recentlyNotified.get(playerId) || 0;
    if (now - lastNotified < 35000) {
      return false;
    }
    this.recentlyNotified.set(playerId, now);

    // Prune old entries
    if (this.recentlyNotified.size > 100) {
      const oldestKey = this.recentlyNotified.keys().next().value;
      this.recentlyNotified.delete(oldestKey);
    }

    const title = `🪔 ${name} entered Diwali Mela!`;
    const body = `${name} just arrived at the Diwali celebration! Tap to burst crackers, light diyas & enjoy the mela together 🎆✨`;

    const options = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `mela-enter-${playerId}-${Math.floor(now / 30000)}`,
      renotify: true,
      silent: false,
      vibrate: [200, 100, 200, 100, 300],
      data: {
        url: window.location.href,
        playerId,
        playerName: name,
        timestamp: now
      },
      actions: [
        { action: 'join', title: 'Join Mela 🪔' },
        { action: 'close', title: 'Dismiss' }
      ]
    };

    // 1. Preferred method: Service Worker showNotification
    // This is mandatory for mobile Android Chrome, iOS 16.4+ standalone PWAs, and desktop PWAs!
    if (this.isServiceWorkerReady()) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, options);
          return true;
        }
      } catch (err) {
        console.warn('[NotificationService] SW showNotification failed, trying fallback:', err);
      }
    }

    // 2. Fallback: Standard browser Notification constructor
    try {
      const notification = new Notification(title, {
        body: options.body,
        icon: options.icon,
        badge: options.badge,
        tag: options.tag,
        vibrate: options.vibrate
      });

      notification.onclick = () => {
        try {
          window.focus();
        } catch (_) {}
        notification.close();
      };
      return true;
    } catch (err) {
      console.warn('[NotificationService] Fallback Notification constructor failed:', err);
      return false;
    }
  }

  /**
   * Send a test notification to verify audio, vibration, and banner on device
   */
  async sendTestNotification() {
    const res = await this.notifyPlayerEntered('Rohit (Test Friend)', {
      id: `test_${Date.now()}`,
      isTest: true
    });
    return res;
  }
}

export const notificationService = new NotificationService();

