// Delay importing web-vitals until running in the browser (avoid SSR crashes)
async function loadWebVitals() {
  return await import('web-vitals');
}

function sendToGoogleAnalytics(metric: any) {
  // Send to Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value,
      ),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Optional: Send to your own analytics endpoint with richer payload
  if (process.env.NODE_ENV === 'production') {
    const payload: Record<string, any> = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: Date.now(),
    };
    if ('message' in metric) payload.message = metric.message;
    if ('filename' in metric) payload.filename = metric.filename;
    if ('lineno' in metric) payload.lineno = metric.lineno;
    if ('reason' in metric) {
      const r = (metric as any).reason;
      if (r instanceof Error) {
        payload.reason = { name: r.name, message: r.message, stack: r.stack };
      } else if (typeof r === 'string') {
        payload.reason = r;
      } else {
        try {
          payload.reason = JSON.stringify(r);
        } catch {
          payload.reason = String(r);
        }
      }
    }

    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify(payload),
      // allow the browser to attempt to send even when page is unloading
      keepalive: true as any,
    }).catch((error) => {
      console.error('Failed to send web vital:', error);
    });
  }
}

export async function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  try {
    const webVitals = await loadWebVitals();

    // Track Core Web Vitals (INP replaced FID in web-vitals v3+)
    webVitals.onCLS(sendToGoogleAnalytics);
    webVitals.onINP(sendToGoogleAnalytics);
    webVitals.onFCP(sendToGoogleAnalytics);
    webVitals.onLCP(sendToGoogleAnalytics);
    webVitals.onTTFB(sendToGoogleAnalytics);
  } catch (err) {
    // If web-vitals can't be loaded, skip gracefully
    // eslint-disable-next-line no-console
    console.warn('web-vitals could not be loaded:', err);
  }

  // Track additional performance metrics
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if ((entry as any).duration > 50) {
          sendToGoogleAnalytics({
            name: 'Long Task',
            value: (entry as any).duration,
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

    const navigationObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const navigationEntry = entry as PerformanceNavigationTiming;
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
  window.addEventListener('error', (event: ErrorEvent) => {
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
      reason: (event as PromiseRejectionEvent).reason,
    });
  });
}

// (no-op export kept for compatibility; the actual client component should call initPerformanceMonitoring)

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
