import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

function sendToGoogleAnalytics(metric: any) {
  // Send to Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value,
      ),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Optional: Send to your own analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    }).catch((error) => {
      console.error('Failed to send web vital:', error);
    });
  }
}

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals (INP replaced FID in web-vitals v3+)
  onCLS(sendToGoogleAnalytics);
  onINP(sendToGoogleAnalytics);
  onFCP(sendToGoogleAnalytics);
  onLCP(sendToGoogleAnalytics);
  onTTFB(sendToGoogleAnalytics);

  // Track additional performance metrics
  if ('PerformanceObserver' in window) {
    // Track Long Tasks (potential performance bottlenecks)
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          sendToGoogleAnalytics({
            name: 'Long Task',
            value: entry.duration,
            id: `long-task-${Date.now()}`,
          });
        }
      });
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch {
      // Long Tasks API might not be supported
    }

    // Track Navigation Timing
    const navigationObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const navigationEntry = entry as PerformanceNavigationTiming;

        // Time to Interactive approximation
        const timeToInteractive =
          navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart;

        sendToGoogleAnalytics({
          name: 'TTI',
          value: timeToInteractive,
          id: `tti-${Date.now()}`,
        });
      });
    });

    try {
      navigationObserver.observe({ entryTypes: ['navigation'] });
    } catch {
      // Navigation Timing API might not be supported
    }
  }

  // Track JavaScript errors
  window.addEventListener('error', (event) => {
    sendToGoogleAnalytics({
      name: 'JavaScript Error',
      value: 1,
      id: `js-error-${Date.now()}`,
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    sendToGoogleAnalytics({
      name: 'Unhandled Promise Rejection',
      value: 1,
      id: `promise-rejection-${Date.now()}`,
      reason: event.reason,
    });
  });
}

// Component to automatically initialize performance monitoring
export function PerformanceMonitor() {
  if (typeof window !== 'undefined') {
    initPerformanceMonitoring();
  }
  return null;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
