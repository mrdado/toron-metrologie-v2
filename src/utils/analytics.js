/**
 * Simple analytics tracking utility
 * Replace with actual analytics service (Google Analytics, Mixpanel, etc.)
 */

export const trackEvent = (category, action, label = null) => {
  // Console log for development - replace with actual analytics
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', { category, action, label, timestamp: new Date().toISOString() });
  }

  // TODO: Integrate with your analytics service
  // Example for Google Analytics:
  // if (window.gtag) {
  //   window.gtag('event', action, {
  //     event_category: category,
  //     event_label: label,
  //   });
  // }

  // Example for custom analytics:
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ category, action, label, timestamp: Date.now() })
  // }).catch(err => console.error('Analytics error:', err));
};

export const trackNavigation = (destination, label) => {
  trackEvent('Navigation', 'Click', `${label} -> ${destination}`);
};

export const trackPageView = (pageName) => {
  trackEvent('PageView', 'View', pageName);
};
