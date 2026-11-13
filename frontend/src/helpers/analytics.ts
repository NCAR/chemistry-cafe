/**
 * Google Analytics with consent (#316).
 *
 * The GDPR and the ePrivacy Directive require consent before the site sets
 * analytics cookies. Thus the app does not load the Google tag until the user
 * accepts analytics. The user can withdraw the consent at any time from the
 * "Cookie Settings" link in the footer.
 *
 * The build sets VITE_GA_MEASUREMENT_ID. Without it, the app does not use
 * analytics and shows only the cookie notice.
 */

export type AnalyticsConsent = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export const consentStorageKey = "analyticsConsent";

export const getMeasurementId = (): string | undefined =>
  import.meta.env.VITE_GA_MEASUREMENT_ID || undefined;

export const isAnalyticsConfigured = (): boolean => !!getMeasurementId();

// Local storage can be unavailable, for example in a private window. Then the
// app has no saved choice and does not load analytics.
export function readAnalyticsConsent(): AnalyticsConsent | null {
  try {
    const stored = localStorage.getItem(consentStorageKey);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    return null;
  }
}

export function writeAnalyticsConsent(consent: AnalyticsConsent) {
  try {
    localStorage.setItem(consentStorageKey, consent);
  } catch (err) {
    console.error(`Issue saving the analytics consent: ${err}`);
  }
}

const scriptId = "google-analytics-gtag";

/**
 * Loads the Google tag. Call this only after the user grants consent. The
 * configuration turns off Google signals and ad personalization, because the
 * app uses analytics only to count usage.
 */
export function enableAnalytics() {
  const measurementId = getMeasurementId();
  if (!measurementId) {
    return;
  }
  window[`ga-disable-${measurementId}`] = false;
  if (document.getElementById(scriptId)) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // The Google tag reads the arguments object, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement("script");
  script.id = scriptId;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

/**
 * Stops analytics and removes the analytics cookies. The Google tag stops
 * sending data when the "ga-disable" flag is true.
 */
export function disableAnalytics() {
  const measurementId = getMeasurementId();
  if (!measurementId) {
    return;
  }
  window[`ga-disable-${measurementId}`] = true;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  removeAnalyticsCookies();
}

// The Google tag sets the cookies on the highest domain that it can. Thus the
// function removes each cookie from the host and from each parent domain.
function removeAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));
  const parts = window.location.hostname.split(".");
  const domains = parts.map((_, index) => parts.slice(index).join("."));
  const expired = "max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  for (const name of names) {
    document.cookie = `${name}=; ${expired}`;
    for (const domain of domains) {
      document.cookie = `${name}=; ${expired}; domain=${domain}`;
    }
  }
}
