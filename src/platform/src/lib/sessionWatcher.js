import { jwtDecode } from 'jwt-decode';
import logger from './logger';

const LOGOUT_SAFETY_MARGIN = 60000; // 1 minute
const BROADCAST_CHANNEL_NAME = 'airqo-session-watcher';
const STORAGE_KEY = 'airqo-session-timer-leader';
const LEADER_TIMEOUT = 5000;

class SessionWatcher {
  constructor() {
    this._isLogoutInProgress = false;
    this.timerId = null;
    this.isLeader = false;
    this.broadcastChannel = null;
    this.onExpireCallback = null;
    this.lastToken = null;
    this.hasExpiry = false;
    this._tabId = null;

    this._bindMethods();
    this.init();
  }

  _bindMethods() {
    this.handleBroadcastMessage = this.handleBroadcastMessage.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handlePageFocus = this.handlePageFocus.bind(this);
    this.handleStorageEvent = this.handleStorageEvent.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  init() {
    if (typeof window === 'undefined') return;

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.addEventListener(
          'message',
          this.handleBroadcastMessage,
        );
      }

      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange,
      );
      window.addEventListener('focus', this.handlePageFocus);
      window.addEventListener('beforeunload', this.cleanup);
      window.addEventListener('storage', this.handleStorageEvent);

      this.electLeader();
      logger.info('SessionWatcher initialized');
    } catch (error) {
      logger.error('Failed to initialize SessionWatcher:', error);
    }
  }

  handleBroadcastMessage(event) {
    const { type } = event.data || {};
    switch (type) {
      case 'LOGOUT_NOW':
        if (this.onExpireCallback) {
          logger.info('Received cross-tab logout signal');
          this.onExpireCallback();
        }
        break;
      case 'LEADER_ELECTION':
        this.electLeader();
        break;
    }
  }

  handleVisibilityChange() {
    if (!document.hidden) {
      this.electLeader();
      if (this.lastToken && this.hasExpiry) {
        this.validateTokenExpiry(this.lastToken);
      }
    }
  }

  handlePageFocus() {
    this.electLeader();
    if (this.lastToken && this.hasExpiry) {
      this.validateTokenExpiry(this.lastToken);
    }
  }

  handleStorageEvent(e) {
    if (e.key === 'airqo-logout-signal' && this.onExpireCallback) {
      logger.info('Received storage-based logout signal');
      this.onExpireCallback();
    }
  }

  electLeader() {
    try {
      const now = Date.now();
      const stored = localStorage.getItem(STORAGE_KEY);
      const leaderData = stored ? JSON.parse(stored) : null;

      if (!leaderData || now - leaderData.timestamp > LEADER_TIMEOUT) {
        const becameLeader = !this.isLeader;
        this.isLeader = true;

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            timestamp: now,
            tabId: this.getTabId(),
          }),
        );

        logger.debug('Elected as session timer leader');

        if (becameLeader && this.lastToken && this.hasExpiry && !this.timerId) {
          this.scheduleTimerFromToken(this.lastToken);
        }
      } else {
        this.isLeader = false;
      }
    } catch (error) {
      logger.error('Leader election failed:', error);
      this.isLeader = true;
    }
  }

  getTabId() {
    if (!this._tabId) {
      this._tabId = Math.random().toString(36).substr(2, 9);
    }
    return this._tabId;
  }

  checkTokenExpiry(token) {
    if (!token) return { hasExpiry: false, isValid: false };

    try {
      const decoded = jwtDecode(token);

      if (!decoded.exp || typeof decoded.exp !== 'number') {
        return { hasExpiry: false, isValid: true };
      }

      const now = Math.floor(Date.now() / 1000);
      const isValid = decoded.exp > now;

      if (!isValid) {
        logger.warn('Token has already expired');
      }

      return { hasExpiry: true, isValid };
    } catch (error) {
      logger.error('Token validation failed:', error);
      return { hasExpiry: false, isValid: false };
    }
  }

  validateTokenExpiry(token) {
    const { isValid } = this.checkTokenExpiry(token);
    if (!isValid) {
      this.triggerLogout();
      return false;
    }
    return true;
  }

  startSessionWatch(token, onExpire) {
    if (!token || typeof onExpire !== 'function') {
      logger.error('SessionWatcher: Invalid parameters provided');
      return;
    }

    this.stopSessionWatch();
    this.lastToken = token;
    this.onExpireCallback = onExpire;

    const { hasExpiry, isValid } = this.checkTokenExpiry(token);
    this.hasExpiry = hasExpiry;

    if (!isValid) {
      this.triggerLogout();
      return;
    }

    if (!hasExpiry) {
      logger.info('Token has no expiry, session watch started without timer');
      return;
    }

    this.scheduleTimer(token);
  }

  scheduleTimer(token) {
    try {
      const decoded = jwtDecode(token);
      const expiryTime = decoded.exp * 1000;
      const logoutTime = expiryTime - LOGOUT_SAFETY_MARGIN;
      const timeUntilLogout = logoutTime - Date.now();

      if (timeUntilLogout <= 0) {
        logger.warn('Token expires very soon, logging out immediately');
        this.triggerLogout();
        return;
      }

      if (this.isLeader) {
        this.timerId = setTimeout(() => this.triggerLogout(), timeUntilLogout);

        logger.info('Session timer started:', {
          tokenExpiry: new Date(expiryTime).toISOString(),
          logoutScheduled: new Date(logoutTime).toISOString(),
          timeUntilLogout: Math.round(timeUntilLogout / 60000) + ' minutes',
        });
      }
    } catch (error) {
      logger.error('Failed to schedule timer:', error);
      this.triggerLogout();
    }
  }

  scheduleTimerFromToken(token) {
    try {
      const decoded = jwtDecode(token);
      if (!decoded.exp || typeof decoded.exp !== 'number') return;

      const expiryTime = decoded.exp * 1000;
      const logoutTime = expiryTime - LOGOUT_SAFETY_MARGIN;
      const delay = logoutTime - Date.now();

      if (delay <= 0) {
        this.triggerLogout();
        return;
      }

      if (this.timerId) clearTimeout(this.timerId);
      this.timerId = setTimeout(() => this.triggerLogout(), delay);
      logger.debug('Timer scheduled from token');
    } catch (error) {
      logger.error('Failed to schedule timer from token:', error);
    }
  }

  stopSessionWatch() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
      logger.debug('Session timer stopped');
    }
    this.lastToken = null;
    this.onExpireCallback = null;
    this.hasExpiry = false;
  }

  triggerLogout() {
    if (this._isLogoutInProgress) {
      logger.debug('Logout already in progress - skipping');
      return;
    }

    this._isLogoutInProgress = true;
    logger.info('Session expiry triggered, initiating logout');

    this.broadcastLogout();

    try {
      this.stopSessionWatch();
    } catch (error) {
      logger.debug('Error stopping session watch during logout:', error);
    }

    if (this.onExpireCallback) {
      try {
        const result = this.onExpireCallback();
        if (result?.then) {
          result.catch((error) =>
            logger.error('onExpire callback error:', error),
          );
        }
      } catch (error) {
        logger.error('onExpire callback threw error:', error);
      }
    }
  }

  broadcastLogout() {
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'LOGOUT_NOW',
          timestamp: Date.now(),
        });
      } else {
        const signal = Date.now().toString();
        localStorage.setItem('airqo-logout-signal', signal);
        localStorage.removeItem('airqo-logout-signal');
      }
    } catch (error) {
      logger.error('Failed to broadcast logout:', error);
    }
  }

  cleanup() {
    this.stopSessionWatch();

    if (this.broadcastChannel) {
      this.broadcastChannel.removeEventListener(
        'message',
        this.handleBroadcastMessage,
      );
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
    );
    window.removeEventListener('focus', this.handlePageFocus);
    window.removeEventListener('storage', this.handleStorageEvent);
    window.removeEventListener('beforeunload', this.cleanup);

    if (this.isLeader) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        logger.debug('Failed to clean up leader storage:', error);
      }
    }

    logger.debug('SessionWatcher cleaned up');
  }

  isActive() {
    return (
      this.timerId !== null || (this.lastToken !== null && !this.hasExpiry)
    );
  }

  tokenHasExpiry() {
    return this.hasExpiry;
  }

  getTimeUntilExpiry() {
    if (!this.lastToken || !this.hasExpiry) return null;

    try {
      const decoded = jwtDecode(this.lastToken);
      if (!decoded?.exp || typeof decoded.exp !== 'number') return null;

      const expiryTime = decoded.exp * 1000;
      return Math.max(0, expiryTime - Date.now());
    } catch {
      return null;
    }
  }
}

let sessionWatcher = null;

if (typeof window !== 'undefined') {
  sessionWatcher = new SessionWatcher();
}

export const startSessionWatch = (token, onExpire) => {
  if (!sessionWatcher) {
    logger.error('SessionWatcher not available on server side');
    return;
  }
  sessionWatcher.startSessionWatch(token, onExpire);
};

export const stopSessionWatch = () => {
  sessionWatcher?.stopSessionWatch();
};

export const isSessionWatchActive = () => {
  return sessionWatcher?.isActive() || false;
};

export const tokenHasExpiry = () => {
  return sessionWatcher?.tokenHasExpiry() || false;
};

export const getTimeUntilExpiry = () => {
  return sessionWatcher?.getTimeUntilExpiry() || null;
};

export default sessionWatcher;
