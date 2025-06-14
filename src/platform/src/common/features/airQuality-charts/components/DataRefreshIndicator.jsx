import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { format, formatDistanceToNow } from 'date-fns';
import {
  MdRefresh,
  MdWifiOff,
  MdSignalWifiStatusbarConnectedNoInternet4,
} from 'react-icons/md';
import { setRefreshChart } from '@/lib/store/services/charts/ChartSlice';
import Button from '@/components/Button';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';

const REFRESH_INTERVALS = {
  MANUAL: 0,
  EVERY_30_SEC: 30000,
  EVERY_1_MIN: 60000,
  EVERY_5_MIN: 300000,
  EVERY_15_MIN: 900000,
};

const CONNECTION_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  SLOW: 'slow',
};

const DataRefreshIndicator = ({
  onRefresh,
  isRefreshing = false,
  lastUpdated = null,
  showAutoRefresh = true,
  className = '',
}) => {
  const dispatch = useDispatch();
  const { theme, systemTheme } = useTheme();
  const isDark =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const [autoRefreshInterval, setAutoRefreshInterval] = useState(
    REFRESH_INTERVALS.MANUAL,
  );
  const [connectionStatus, setConnectionStatus] = useState(
    CONNECTION_STATUS.ONLINE,
  );
  const [intervalId, setIntervalId] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Monitor network connectivity
  useEffect(() => {
    const updateConnectionStatus = () => {
      if (!navigator.onLine) {
        setConnectionStatus(CONNECTION_STATUS.OFFLINE);
      } else {
        // Check connection speed (simplified)
        const start = performance.now();
        fetch('/api/ping', {
          method: 'HEAD',
          cache: 'no-cache',
        })
          .then(() => {
            const end = performance.now();
            const responseTime = end - start;
            setConnectionStatus(
              responseTime > 2000
                ? CONNECTION_STATUS.SLOW
                : CONNECTION_STATUS.ONLINE,
            );
          })
          .catch(() => {
            setConnectionStatus(CONNECTION_STATUS.OFFLINE);
          });
      }
    };

    updateConnectionStatus();

    const handleOnline = () => setConnectionStatus(CONNECTION_STATUS.ONLINE);
    const handleOffline = () => setConnectionStatus(CONNECTION_STATUS.OFFLINE);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefreshInterval === REFRESH_INTERVALS.MANUAL) {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      return;
    }

    const newIntervalId = setInterval(() => {
      if (connectionStatus === CONNECTION_STATUS.ONLINE && !isRefreshing) {
        handleRefresh(true);
      }
    }, autoRefreshInterval);

    setIntervalId(newIntervalId);

    return () => {
      if (newIntervalId) {
        clearInterval(newIntervalId);
      }
    };
  }, [autoRefreshInterval, connectionStatus, isRefreshing]);

  const handleRefresh = useCallback(
    (isAutomatic = false) => {
      if (isRefreshing) return;

      setRefreshCount((prev) => prev + 1);

      if (onRefresh) {
        onRefresh();
      } else {
        dispatch(setRefreshChart(true));
      }

      // Analytics tracking for refresh patterns
      if (window.gtag) {
        window.gtag('event', 'data_refresh', {
          method: isAutomatic ? 'automatic' : 'manual',
          refresh_count: refreshCount + 1,
        });
      }
    },
    [isRefreshing, onRefresh, dispatch, refreshCount],
  );

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case CONNECTION_STATUS.OFFLINE:
        return <MdWifiOff className="w-4 h-4 text-red-500" />;
      case CONNECTION_STATUS.SLOW:
        return (
          <MdSignalWifiStatusbarConnectedNoInternet4 className="w-4 h-4 text-yellow-500" />
        );
      default:
        return (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        );
    }
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case CONNECTION_STATUS.OFFLINE:
        return 'Offline - Updates paused';
      case CONNECTION_STATUS.SLOW:
        return 'Slow connection detected';
      default:
        return lastUpdated
          ? `Updated ${formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}`
          : 'Real-time updates active';
    }
  };

  const getRefreshIntervalLabel = (interval) => {
    const labels = {
      [REFRESH_INTERVALS.MANUAL]: 'Manual',
      [REFRESH_INTERVALS.EVERY_30_SEC]: '30 seconds',
      [REFRESH_INTERVALS.EVERY_1_MIN]: '1 minute',
      [REFRESH_INTERVALS.EVERY_5_MIN]: '5 minutes',
      [REFRESH_INTERVALS.EVERY_15_MIN]: '15 minutes',
    };
    return labels[interval] || 'Manual';
  };

  const refreshButtonClass = useMemo(() => {
    const baseClass = 'transition-all duration-200 relative';
    if (isRefreshing) {
      return `${baseClass} animate-spin`;
    }
    if (connectionStatus === CONNECTION_STATUS.OFFLINE) {
      return `${baseClass} opacity-50 cursor-not-allowed`;
    }
    return `${baseClass} hover:scale-110`;
  }, [isRefreshing, connectionStatus]);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Connection Status Indicator */}
      <div className="flex items-center space-x-2">
        {getConnectionIcon()}
        <span
          className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          {getStatusMessage()}
        </span>
      </div>

      {/* Auto-refresh Controls */}
      {showAutoRefresh && (
        <div className="flex items-center space-x-2">
          <label
            className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Auto-refresh:
          </label>
          <select
            value={autoRefreshInterval}
            onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
            className={`text-xs border rounded px-2 py-1 ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
            disabled={connectionStatus === CONNECTION_STATUS.OFFLINE}
          >
            {Object.entries(REFRESH_INTERVALS).map(([key, value]) => (
              <option key={key} value={value}>
                {getRefreshIntervalLabel(value)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Manual Refresh Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleRefresh(false)}
        disabled={
          isRefreshing || connectionStatus === CONNECTION_STATUS.OFFLINE
        }
        className={refreshButtonClass}
        title="Refresh data"
      >
        <MdRefresh className="w-4 h-4" />
        {isRefreshing && (
          <span className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        )}
      </Button>

      {/* Refresh Count Badge */}
      {refreshCount > 0 && (
        <div
          className={`text-xs px-2 py-1 rounded-full ${
            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {refreshCount} updates
        </div>
      )}

      {/* Last Updated Timestamp */}
      {lastUpdated && (
        <div
          className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {format(new Date(lastUpdated), 'HH:mm:ss')}
        </div>
      )}
    </div>
  );
};

DataRefreshIndicator.propTypes = {
  onRefresh: PropTypes.func,
  isRefreshing: PropTypes.bool,
  lastUpdated: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  showAutoRefresh: PropTypes.bool,
  className: PropTypes.string,
};

export default React.memo(DataRefreshIndicator);
