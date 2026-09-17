export type AnalyticsEvent = 
  | 'signup_completed'
  | 'pricing_viewed'
  | 'checkout_started'
  | 'checkout_completed'
  | 'first_revelation_completed'
  | 'install_cta_opened'
  | 'install_prompt_shown'
  | 'install_accepted'
  | 'install_dismissed';

export function trackEvent(eventName: AnalyticsEvent, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  if ((window as any).fbq) (window as any).fbq('trackCustom', eventName, properties);
  if ((window as any).ttq) (window as any).ttq.track(eventName, properties);
  if ((window as any).gtag) (window as any).gtag('event', eventName, properties);
  
  if (import.meta.env.DEV) console.log(`[Analytics] ${eventName}`, properties || {});
}

