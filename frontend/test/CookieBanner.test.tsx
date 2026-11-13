import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CookieBanner from "../src/components/CookieBanner";
import {
  AnalyticsConsentProvider,
  useAnalyticsConsent,
} from "../src/components/AnalyticsConsentContext";
import { consentStorageKey } from "../src/helpers/analytics";

const measurementId = "G-TEST123";
const scriptSelector = "script#google-analytics-gtag";

// Opens the cookie settings, as the footer link does.
const SettingsLink = () => {
  const { openSettings } = useAnalyticsConsent();
  return <button onClick={openSettings}>Cookie Settings</button>;
};

const renderBanner = () =>
  render(
    <AnalyticsConsentProvider>
      <CookieBanner />
      <SettingsLink />
    </AnalyticsConsentProvider>,
  );

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  document.querySelector(scriptSelector)?.remove();
  delete window.gtag;
  delete window.dataLayer;
  delete window[`ga-disable-${measurementId}`];
});

describe("CookieBanner with analytics", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", measurementId);
  });

  it("does not load analytics before the user chooses", () => {
    renderBanner();
    expect(screen.getByTestId("cookie-banner")).toBeInTheDocument();
    expect(document.querySelector(scriptSelector)).toBeNull();
    expect(window.gtag).toBeUndefined();
  });

  it("shows the accept and reject choices with the same style", () => {
    renderBanner();
    const accept = screen.getByRole("button", { name: "Accept analytics" });
    const reject = screen.getByRole("button", { name: "Reject analytics" });
    expect(accept.className).toBe(reject.className);
  });

  it("loads analytics after the user accepts", () => {
    renderBanner();
    fireEvent.click(screen.getByRole("button", { name: "Accept analytics" }));

    expect(localStorage.getItem(consentStorageKey)).toBe("granted");
    expect(screen.queryByTestId("cookie-banner")).toBeNull();
    const script = document.querySelector(scriptSelector) as HTMLScriptElement;
    expect(script.src).toContain(`id=${measurementId}`);
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        0: "config",
        1: measurementId,
        2: {
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
        },
      }),
    );
  });

  it("does not load analytics after the user rejects", () => {
    renderBanner();
    fireEvent.click(screen.getByRole("button", { name: "Reject analytics" }));

    expect(localStorage.getItem(consentStorageKey)).toBe("denied");
    expect(screen.queryByTestId("cookie-banner")).toBeNull();
    expect(document.querySelector(scriptSelector)).toBeNull();
  });

  it("loads analytics at startup when the user accepted before", () => {
    localStorage.setItem(consentStorageKey, "granted");
    renderBanner();
    expect(screen.queryByTestId("cookie-banner")).toBeNull();
    expect(document.querySelector(scriptSelector)).not.toBeNull();
  });

  it("asks again when the user only acknowledged the old notice", () => {
    localStorage.setItem("bannerAccepted", "true");
    renderBanner();
    expect(screen.getByTestId("cookie-banner")).toBeInTheDocument();
  });

  it("lets the user withdraw the consent from the cookie settings", () => {
    localStorage.setItem(consentStorageKey, "granted");
    document.cookie = "_ga=GA1.1.123; path=/";
    document.cookie = "_ga_TEST123=GS1.1.456; path=/";
    document.cookie = "other=keep; path=/";
    renderBanner();

    fireEvent.click(screen.getByRole("button", { name: "Cookie Settings" }));
    expect(
      screen.getByRole("button", { name: "Accept analytics" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Reject analytics" }));

    expect(localStorage.getItem(consentStorageKey)).toBe("denied");
    expect(window[`ga-disable-${measurementId}`]).toBe(true);
    expect(document.cookie).not.toContain("_ga");
    expect(document.cookie).toContain("other=keep");
  });

  it("lets the user give the consent after a rejection", () => {
    localStorage.setItem(consentStorageKey, "denied");
    renderBanner();
    expect(screen.queryByTestId("cookie-banner")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Cookie Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Accept analytics" }));

    expect(window[`ga-disable-${measurementId}`]).toBe(false);
    expect(document.querySelector(scriptSelector)).not.toBeNull();
  });
});

describe("CookieBanner without analytics", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "");
  });

  it("shows only the cookie notice and never loads analytics", () => {
    renderBanner();
    expect(
      screen.queryByRole("button", { name: "Accept analytics" }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Acknowledge" }));

    expect(screen.queryByTestId("cookie-banner")).toBeNull();
    expect(localStorage.getItem("bannerAccepted")).toBe("true");
    expect(document.querySelector(scriptSelector)).toBeNull();
  });

  it("shows the notice again from the cookie settings", () => {
    localStorage.setItem("bannerAccepted", "true");
    renderBanner();
    expect(screen.queryByTestId("cookie-banner")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Cookie Settings" }));
    expect(screen.getByTestId("cookie-banner")).toBeInTheDocument();
  });
});
