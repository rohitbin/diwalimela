// Screen Orientation & Fullscreen Management Utility for Horizontal Gaming
export async function requestLandscapeMode() {
  try {
    const docEl = document.documentElement;
    if (docEl && !document.fullscreenElement) {
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen().catch(() => {});
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen().catch(() => {});
      }
    }
  } catch (_) {}

  try {
    if (window.screen?.orientation?.lock) {
      await window.screen.orientation.lock('landscape').catch(() => {});
    } else if (window.screen?.lockOrientation) {
      window.screen.lockOrientation('landscape');
    } else if (window.screen?.mozLockOrientation) {
      window.screen.mozLockOrientation('landscape');
    } else if (window.screen?.msLockOrientation) {
      window.screen.msLockOrientation('landscape');
    }
  } catch (_) {}
}

export async function exitLandscapeMode() {
  try {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen().catch(() => {});
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen().catch(() => {});
      }
    }
  } catch (_) {}

  try {
    if (window.screen?.orientation?.unlock) {
      window.screen.orientation.unlock();
    } else if (window.screen?.unlockOrientation) {
      window.screen.unlockOrientation();
    }
  } catch (_) {}
}

export function isDeviceLandscape() {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= window.innerHeight;
}

export function isPortraitMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerHeight > window.innerWidth && window.innerWidth < 960;
}
