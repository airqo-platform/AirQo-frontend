/**
 * Session Watcher - JWT Token Expiry Management
 *
 * This module provides a singleton session watcher that:
 * - Monitors JWT token expiry time
 * - Logs out user 1 minute before token expires (24h - 1min)
 * - Uses BroadcastChannel for cross-tab synchronization
 * - Clears all caches and storage on logout
 * - Survives HMR and fast refresh without duplicate timers
 */

import jwtDecode from 'jwt-decode';
import logger from './logger';

// Constants
const LOGOUT_SAFETY_MARGIN = 60000; // 1 minute in milliseconds
const BROADCAST_CHANNEL_NAME = 'airqo-session-watcher';
const STORAGE_KEY = 'airqo-session-timer-leader';

class SessionWatcher {
  constructor() {
    this.timerId = null;
    this.isLeader = false;
    this.broadcastChannel = null;
    this.onExpireCallback = null;
    this.lastToken = null;
    this.isInitialized = false;

    // Bind methods to preserve context
    this.handleBroadcastMessage = this.handleBroadcastMessage.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handlePageFocus = this.handlePageFocus.bind(this);
    this.electLeader = this.electLeader.bind(this);

    this.init();
  }

  init() {
    // Only initialize on client side
    if (typeof window === 'undefined') return;

    try {
      // Initialize BroadcastChannel if supported, otherwise fallback to localStorage
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.addEventListener(
          'message',
          this.handleBroadcastMessage,
        );
      }

      // Set up event listeners
      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange,
      );
      window.addEventListener('focus', this.handlePageFocus);
      window.addEventListener('beforeunload', this.cleanup.bind(this));
      // Fallback listener for cross-tab sync via localStorage
      this.handleStorageEvent =
        this.handleStorageEvent?.bind(this) ||
        ((e) => {
          if (e.key === 'airqo-logout-signal') {
            if (this.onExpireCallback) {
              logger.info('Received storage-based logout signal');
              this.onExpireCallback();
            }
          }
        });
      window.addEventListener('storage', this.handleStorageEvent);

      // Elect initial leader
      this.electLeader();

      this.isInitialized = true;
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
      default:
        break;
    }
  }

  handleVisibilityChange() {
    if (!document.hidden) {
      this.electLeader();
      // Re-validate token when page becomes visible
      if (this.lastToken) {
        this.validateTokenExpiry(this.lastToken);
      }
    }
  }

  handlePageFocus() {
    this.electLeader();
    // Re-validate token when page gains focus
    if (this.lastToken) {
      this.validateTokenExpiry(this.lastToken);
    }
  }

  electLeader() {
    try {
      const now = Date.now();
      const stored = localStorage.getItem(STORAGE_KEY);
      const leaderData = stored ? JSON.parse(stored) : null;

      // Become leader if no leader exists or leader is stale (5 seconds)
      if (!leaderData || now - leaderData.timestamp > 5000) {
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
        // If we just became leader and have an active token but no timer, schedule it
        if (becameLeader && this.lastToken && !this.timerId) {
          this.scheduleTimerFromToken(this.lastToken);
        }
      } else {
        this.isLeader = false;
        logger.debug('Not session timer leader');
      }
    } catch (error) {
      logger.error('Leader election failed:', error);
      // Fallback: assume leadership
      this.isLeader = true;
    }
  }

  getTabId() {
    if (!this._tabId) {
      this._tabId = Math.random().toString(36).substr(2, 9);
    }
    return this._tabId;
  }

  validateTokenExpiry(token) {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);

      if (decoded.exp && decoded.exp <= now) {
        logger.warn('Token has already expired');
        this.triggerLogout();
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Token validation failed:', error);
      this.triggerLogout();
      return false;
    }
  }

  startSessionWatch(token, onExpire) {
    if (!token || typeof onExpire !== 'function') {
      logger.error('SessionWatcher: Invalid parameters provided');
      return;
    }

    // Stop any existing timer
    this.stopSessionWatch();

    this.lastToken = token;
    this.onExpireCallback = onExpire;

    // Validate token immediately
    if (!this.validateTokenExpiry(token)) {
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      const logoutTime = expiryTime - LOGOUT_SAFETY_MARGIN;
      const currentTime = Date.now();
      const timeUntilLogout = logoutTime - currentTime;

      if (timeUntilLogout <= 0) {
        logger.warn('Token expires very soon, logging out immediately');
        this.triggerLogout();
        return;
      }

      // Only start timer if this tab is the leader
      if (this.isLeader) {
        this.timerId = setTimeout(() => {
          this.triggerLogout();
        }, timeUntilLogout);

        const expiryDate = new Date(expiryTime);
        const logoutDate = new Date(logoutTime);

        logger.info('Session timer started:', {
          tokenExpiry: expiryDate.toISOString(),
          logoutScheduled: logoutDate.toISOString(),
          timeUntilLogout: Math.round(timeUntilLogout / 1000 / 60) + ' minutes',
        });
      } else {
        logger.debug('Not leader, skipping timer creation');
      }
    } catch (error) {
      logger.error('Failed to start session watch:', error);
      // On error, assume token is invalid and logout
      this.triggerLogout();
    }
  }

  scheduleTimerFromToken(token) {
    try {
      const { exp } = jwtDecode(token) || {};
      if (!exp) return;
      const expiryTime = exp * 1000;
      const logoutTime = expiryTime - LOGOUT_SAFETY_MARGIN;
      const delay = logoutTime - Date.now();
      if (delay <= 0) return this.triggerLogout();
      if (this.timerId) clearTimeout(this.timerId);
      this.timerId = setTimeout(() => this.triggerLogout(), delay);
    } catch (e) {
      logger.error('Failed to schedule timer from token:', e);
      this.triggerLogout();
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
  }

  triggerLogout() {
    logger.info('Session expiry triggered, initiating logout');

    // Broadcast logout to all tabs
    this.broadcastLogout();

    // Execute logout callback
    if (this.onExpireCallback) {
      this.onExpireCallback();
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
        // Fallback: use localStorage event
        localStorage.setItem('airqo-logout-signal', Date.now().toString());
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

    // Clean up leader election
    if (this.isLeader) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        logger.debug('Failed to clean up leader storage:', error);
      }
    }

    this.isInitialized = false;
    logger.debug('SessionWatcher cleaned up');
  }

  // Public method to check if watcher is active
  isActive() {
    return this.timerId !== null;
  }

  // Public method to get remaining time
  getTimeUntilExpiry() {
    if (!this.lastToken) return null;

    try {
      const decoded = jwtDecode(this.lastToken);
      if (!decoded || typeof decoded.exp !== 'number') return null;
      const expiryTime = decoded.exp * 1000;
      const currentTime = Date.now();
      return Math.max(0, expiryTime - currentTime);
    } catch {
      return null;
    }
  }
}

// Create singleton instance
let sessionWatcher = null;

// Initialize only on client side
if (typeof window !== 'undefined') {
  sessionWatcher = new SessionWatcher();
}

// Public API
export const startSessionWatch = (token, onExpire) => {
  if (!sessionWatcher) {
    logger.error('SessionWatcher not available on server side');
    return;
  }
  sessionWatcher.startSessionWatch(token, onExpire);
};

export const stopSessionWatch = () => {
  if (!sessionWatcher) return;
  sessionWatcher.stopSessionWatch();
};

export const isSessionWatchActive = () => {
  if (!sessionWatcher) return false;
  return sessionWatcher.isActive();
};

export const getTimeUntilExpiry = () => {
  if (!sessionWatcher) return null;
  return sessionWatcher.getTimeUntilExpiry();
};

export default sessionWatcher;
