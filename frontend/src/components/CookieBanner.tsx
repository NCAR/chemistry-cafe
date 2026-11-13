import React, { useState } from "react";
import "../styles/App.css";
import { useAnalyticsConsent } from "./AnalyticsConsentContext";
import { isAnalyticsConfigured } from "../helpers/analytics";

const cookieNoticeUrl =
  "https://www.ucar.edu/cookie-other-tracking-technologies-notice";
const noticeStorageKey = "bannerAccepted";

function readNoticeAcknowledged(): boolean {
  try {
    return !!localStorage.getItem(noticeStorageKey);
  } catch {
    return false;
  }
}

/**
 * Asks the user for consent to analytics cookies. The two choices have the
 * same prominence, as the GDPR requires. When the build has no analytics, the
 * banner shows only the UCAR cookie notice.
 */
const CookieBanner: React.FC = () => {
  const { consent, setConsent, isSettingsOpen, closeSettings } =
    useAnalyticsConsent();
  const [isNoticeAcknowledged, setIsNoticeAcknowledged] = useState<boolean>(
    readNoticeAcknowledged,
  );

  if (isAnalyticsConfigured()) {
    if (consent !== null && !isSettingsOpen) {
      return null;
    }
    return (
      <div
        className="banner"
        role="region"
        aria-label="Cookie consent"
        data-testid="cookie-banner"
      >
        <p className="banner-text">
          Chemistry Cafe uses cookies that are necessary to make the site
          operate. With your consent, we also use Google Analytics cookies.
          These cookies count visits and show which pages people use. We use
          this information only to report usage to our funders. We do not use it
          for advertisements. You can change your choice at any time with the
          &quot;Cookie Settings&quot; link at the bottom of the page.{" "}
          <a href={cookieNoticeUrl} target="_blank" rel="noopener noreferrer">
            Learn more
          </a>
        </p>
        <div className="banner-actions">
          <button
            onClick={() => setConsent("granted")}
            className="acceptBtn"
            aria-pressed={isSettingsOpen ? consent === "granted" : undefined}
          >
            Accept analytics
          </button>
          <button
            onClick={() => setConsent("denied")}
            className="acceptBtn"
            aria-pressed={isSettingsOpen ? consent === "denied" : undefined}
          >
            Reject analytics
          </button>
        </div>
      </div>
    );
  }

  if (isNoticeAcknowledged && !isSettingsOpen) {
    return null;
  }

  const handleAcknowledge = () => {
    setIsNoticeAcknowledged(true);
    closeSettings();
    try {
      localStorage.setItem(noticeStorageKey, "true");
    } catch (err) {
      console.error(`Issue saving the cookie notice: ${err}`);
    }
  };

  return (
    <div
      className="banner"
      role="region"
      aria-label="Cookie notice"
      data-testid="cookie-banner"
    >
      <p>
        UCAR uses cookies to make our website function; however, UCAR cookies do
        not collect personal information about you. When using our website, you
        may encounter embedded content, such as YouTube videos and other social
        media links, that use their own cookies. To learn more about third-party
        cookies on this website, and to set your cookie preferences, click here.{" "}
        <a href={cookieNoticeUrl} target="_blank" rel="noopener noreferrer">
          Learn more
        </a>
      </p>
      <button onClick={handleAcknowledge} className="acceptBtn">
        Acknowledge
      </button>
    </div>
  );
};

export default CookieBanner;
