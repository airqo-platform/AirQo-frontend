export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export const trackEvent = (event: AnalyticsEvent): void => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', event.action, {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
  });
};

export const trackPageView = (url: string, title?: string): void => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title,
  });
};

export const trackOutboundLink = (url: string, label?: string): void => {
  trackEvent({
    action: 'click',
    category: 'outbound',
    label: label || url,
  });
};

export const trackFileDownload = (
  fileName: string,
  fileType?: string,
): void => {
  trackEvent({
    action: 'download',
    category: 'file',
    label: fileName,
    value: fileType ? 1 : undefined,
  });
};

export const trackFormSubmission = (formName: string): void => {
  trackEvent({
    action: 'submit',
    category: 'form',
    label: formName,
  });
};

export const trackSearch = (query: string, resultsCount?: number): void => {
  trackEvent({
    action: 'search',
    category: 'engagement',
    label: query,
    value: resultsCount,
  });
};
