// Diwali Mahotsav Mela - Native PWA & Device Push Notification Service
// Sends OS/device notifications when someone enters the Mela so the user's phone/device alerts them!

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
      // Support both modern Promise-based and legacy callback-based permission requests
      let permission;
      const callbackPromise = new Promise((resolve) => {
        try {
          const res = Notification.requestPermission((p) => {
            if (p) resolve(p);
          });
          if (res && typeof res.then === 'function') {
            res.then(resolve).catch(() => resolve(Notification.permission));
          }
        } catch (_) {
          resolve(Notification.permission);
        }
      });

      permission = await callbackPromise;
      if (!permission) {
        permission = Notification.permission;
      }

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
   * Internal helper to trigger native notifications on the user's phone or device
   */
  async showDeviceNotification(title, body, extraOptions = {}) {
    if (!this.isEnabled()) return false;

    // Trigger physical hardware vibration on the phone immediately
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(extraOptions.vibrate || [200, 100, 200, 100, 300]);
      } catch (_) {}
    }

    const options = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: extraOptions.tag || `mela-alert-${Date.now()}`,
      renotify: true,
      silent: false,
      vibrate: extraOptions.vibrate || [200, 100, 200, 100, 300],
      data: {
        url: window.location.href,
        timestamp: Date.now(),
        ...(extraOptions.data || {})
      },
      actions: [
        { action: 'join', title: 'Join Mela 🪔' },
        { action: 'close', title: 'Dismiss' }
      ],
      ...extraOptions
    };

    // 1. Service Worker showNotification (Mandatory for mobile Android Chrome, iOS 16.4+ standalone PWAs, and desktop PWAs!)
    if (this.isServiceWorkerReady()) {
      try {
        let swReg = await navigator.serviceWorker.getRegistration();
        if (!swReg) {
          swReg = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise((resolve) => setTimeout(() => resolve(null), 1200))
          ]);
        }

        if (swReg && swReg.showNotification) {
          await swReg.showNotification(title, options);
          return true;
        }
      } catch (err) {
        console.warn('[NotificationService] SW showNotification error:', err);
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
   * Trigger a native device notification when someone enters the Mela
   * @param {string} playerName - Name of the player who entered
   * @param {object} playerInfo - Metadata about the player
   */
  async notifyPlayerEntered(playerName, playerInfo = {}) {
    const name = (playerName || playerInfo.name || 'A Festive Friend').trim();
    const playerId = playerInfo.id || name.toLowerCase();

    // Prevent spamming duplicate notifications for the same player within 30 seconds
    const now = Date.now();
    const lastNotified = this.recentlyNotified.get(playerId) || 0;
    if (now - lastNotified < 30000) {
      return false;
    }
    this.recentlyNotified.set(playerId, now);

    // Prune old entries
    if (this.recentlyNotified.size > 100) {
      const oldestKey = this.recentlyNotified.keys().next().value;
      this.recentlyNotified.delete(oldestKey);
    }

    return this.showDeviceNotification(
      `🪔 ${name} entered Diwali Mela!`,
      `${name} just arrived at the Diwali celebration! Tap to burst crackers, light diyas & enjoy the mela together 🎆✨`,
      {
        tag: `mela-enter-${playerId}`,
        vibrate: [200, 100, 200, 100, 300],
        data: {
          playerId,
          playerName: name
        }
      }
    );
  }

  /**
   * Trigger a welcome confirmation notification on the current phone/device upon entering
   * @param {string} playerName
   */
  async notifySelfWelcome(playerName) {
    const name = (playerName || 'Festive Friend').trim();
    return this.showDeviceNotification(
      `🪔 Welcome to Diwali Mela, ${name}!`,
      `You are now live in the Mela! You will receive instant notifications on this device whenever someone enters 🎆✨`,
      {
        tag: 'mela-welcome-self',
        vibrate: [200, 100, 200]
      }
    );
  }

  /**
   * Send a test notification to verify audio, vibration, and banner on device
   */
  async sendTestNotification() {
    return this.showDeviceNotification(
      '🪔 Rohit (Friend) entered Diwali Mela!',
      'Rohit just arrived at the Diwali celebration! Tap to burst crackers, light diyas & enjoy the mela together 🎆✨',
      {
        tag: `test-${Date.now()}`,
        vibrate: [200, 100, 200, 100, 300]
      }
    );
  }
}

export const notificationService = new NotificationService();
