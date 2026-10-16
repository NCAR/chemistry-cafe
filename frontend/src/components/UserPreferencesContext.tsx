import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { getUserPreferences } from "../API/API_GetMethods";
import { updateUserPreferences } from "../API/API_UpdateMethods";
import { APIUserPreferences } from "../API/API_Interfaces";
import {
  defaultRateUnitsByType,
  RateUnitReactionType,
  RateUnits,
  RateUnitsByType,
  rateUnitReactionTypes,
} from "../helpers/rateUnits";

export type UserPreferences = {
  /** The display units of each reaction type */
  rateUnits: RateUnitsByType;
};

export const defaultUserPreferences: Readonly<UserPreferences> = Object.freeze({
  rateUnits: defaultRateUnitsByType,
});

const storageKey = "userPreferences";

// The field of the API preferences that holds the units of each reaction type.
const apiRateUnitFields: Record<
  RateUnitReactionType,
  Exclude<keyof APIUserPreferences, "userId">
> = {
  ARRHENIUS: "arrheniusRateUnits",
  BRANCHED_NO_RO2: "branchedRateUnits",
  TAYLOR_SERIES: "taylorSeriesRateUnits",
  TERNARY_CHEMICAL_ACTIVATION: "ternaryChemicalActivationRateUnits",
  TROE: "troeRateUnits",
  TUNNELING: "tunnelingRateUnits",
};

const isRateUnits = (value: unknown): value is RateUnits =>
  value === "SI" || value === "Molecule";

// Gives a valid unit for each reaction type. A missing or invalid unit gets
// the default.
function toRateUnitsByType(
  getUnits: (type: RateUnitReactionType) => unknown,
): RateUnitsByType {
  return Object.fromEntries(
    rateUnitReactionTypes.map((type) => {
      const units = getUnits(type);
      return [type, isRateUnits(units) ? units : defaultRateUnitsByType[type]];
    }),
  ) as RateUnitsByType;
}

export function fromAPIUserPreferences(
  preferences: APIUserPreferences,
): UserPreferences {
  return {
    rateUnits: toRateUnitsByType(
      (type) => preferences[apiRateUnitFields[type]],
    ),
  };
}

export function toAPIUserPreferences(
  preferences: UserPreferences,
): APIUserPreferences {
  return Object.fromEntries(
    rateUnitReactionTypes.map((type) => [
      apiRateUnitFields[type],
      preferences.rateUnits[type],
    ]),
  ) as unknown as APIUserPreferences;
}

// Local storage can be unavailable, for example in a private window. Then the
// app uses the defaults and continues to operate.
function readStoredPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return { ...defaultUserPreferences };
    }
    const parsed = JSON.parse(stored) as {
      rateUnits?: Partial<Record<string, unknown>>;
    };
    return {
      rateUnits: toRateUnitsByType((type) => parsed?.rateUnits?.[type]),
    };
  } catch (err) {
    console.error(`Issue reading user preferences: ${err}`);
    return { ...defaultUserPreferences };
  }
}

function writeStoredPreferences(preferences: UserPreferences) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  } catch (err) {
    console.error(`Issue saving user preferences: ${err}`);
  }
}

interface UserPreferencesContextProps {
  preferences: UserPreferences;
  setPreferences: (preferences: UserPreferences) => void;
}

const UserPreferencesContext = createContext<
  UserPreferencesContextProps | undefined
>(undefined);

/**
 * Keeps the display preferences of the user. Guests keep them in local
 * storage. Logged in users keep them in the database too. At login, the saved
 * preferences of the user replace the local preferences. A user without saved
 * preferences gets the local preferences saved to the database.
 */
export const UserPreferencesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useAuth();
  const [preferences, setPreferencesState] = useState<UserPreferences>(
    readStoredPreferences,
  );

  useEffect(() => {
    if (!user) {
      return;
    }
    let cancelled = false;
    const synchronize = async () => {
      try {
        const saved = await getUserPreferences();
        if (cancelled) {
          return;
        }
        if (saved) {
          const loaded = fromAPIUserPreferences(saved);
          setPreferencesState(loaded);
          writeStoredPreferences(loaded);
        } else {
          await updateUserPreferences(
            toAPIUserPreferences(readStoredPreferences()),
          );
        }
      } catch (err) {
        console.error(`Issue loading user preferences: ${err}`);
      }
    };
    synchronize();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const setPreferences = (updated: UserPreferences) => {
    setPreferencesState(updated);
    writeStoredPreferences(updated);
    if (user) {
      updateUserPreferences(toAPIUserPreferences(updated)).catch((err) =>
        console.error(`Issue saving user preferences: ${err}`),
      );
    }
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

/**
 * Gives the display preferences. Outside of a provider, it gives the defaults
 * and a setter that does nothing, so that a component can render alone.
 */
export const useUserPreferences = (): UserPreferencesContextProps => {
  const context = useContext(UserPreferencesContext);
  return (
    context ?? {
      preferences: defaultUserPreferences,
      setPreferences: () => {},
    }
  );
};
