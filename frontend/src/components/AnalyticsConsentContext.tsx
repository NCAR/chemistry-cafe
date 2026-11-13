import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AnalyticsConsent,
  disableAnalytics,
  enableAnalytics,
  readAnalyticsConsent,
  writeAnalyticsConsent,
} from "../helpers/analytics";

interface AnalyticsConsentContextProps {
  /** The choice of the user, or null when the user did not choose */
  consent: AnalyticsConsent | null;
  setConsent: (consent: AnalyticsConsent) => void;
  /** True when the user opened the cookie settings from the footer */
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const AnalyticsConsentContext = createContext<
  AnalyticsConsentContextProps | undefined
>(undefined);

/**
 * Keeps the analytics consent of the user. The app loads analytics only when
 * the consent is "granted".
 */
export const AnalyticsConsentProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [consent, setConsentState] = useState<AnalyticsConsent | null>(
    readAnalyticsConsent,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (consent === "granted") {
      enableAnalytics();
    } else if (consent === "denied") {
      disableAnalytics();
    }
  }, [consent]);

  const setConsent = (updated: AnalyticsConsent) => {
    writeAnalyticsConsent(updated);
    setConsentState(updated);
    setIsSettingsOpen(false);
  };

  return (
    <AnalyticsConsentContext.Provider
      value={{
        consent,
        setConsent,
        isSettingsOpen,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
      }}
    >
      {children}
    </AnalyticsConsentContext.Provider>
  );
};

/**
 * Gives the analytics consent. Outside of a provider, it gives no consent and
 * functions that do nothing, so that a component can render alone.
 */
export const useAnalyticsConsent = (): AnalyticsConsentContextProps => {
  const context = useContext(AnalyticsConsentContext);
  return (
    context ?? {
      consent: null,
      setConsent: () => {},
      isSettingsOpen: false,
      openSettings: () => {},
      closeSettings: () => {},
    }
  );
};
