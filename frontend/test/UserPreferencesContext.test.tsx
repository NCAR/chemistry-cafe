import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import axios, { AxiosResponse } from "axios";
import { AuthProvider } from "../src/components/AuthContext";
import {
  fromAPIUserPreferences,
  toAPIUserPreferences,
  UserPreferencesProvider,
  useUserPreferences,
} from "../src/components/UserPreferencesContext";
import { APIUser, APIUserPreferences } from "../src/API/API_Interfaces";
import { BASE_URL } from "../src/API/API_config";
import {
  defaultRateUnitsByType,
  RateUnitsByType,
} from "../src/helpers/rateUnits";

vi.mock("axios");

const user: APIUser = {
  id: "1-1-1-1-1",
  username: "Test User",
  role: "None",
};

const allMolecule: APIUserPreferences = {
  arrheniusRateUnits: "Molecule",
  branchedRateUnits: "Molecule",
  taylorSeriesRateUnits: "Molecule",
  ternaryChemicalActivationRateUnits: "Molecule",
  troeRateUnits: "Molecule",
  tunnelingRateUnits: "Molecule",
};

const troeSI: RateUnitsByType = { ...defaultRateUnitsByType, TROE: "SI" };

function response(data: unknown, status = 200): AxiosResponse {
  return { data, status, statusText: "", headers: {} } as AxiosResponse;
}

// Mocks the backend. A null preferences value gives 204 No Content.
function mockBackend(loggedIn: boolean, preferences: unknown) {
  vi.spyOn(axios, "get").mockImplementation(async (url: string) => {
    if (url === `${BASE_URL}/users/whoami`) {
      if (!loggedIn) {
        throw new Error("401");
      }
      return response(user);
    }
    if (url === `${BASE_URL}/users/me/preferences`) {
      return preferences === null ? response("", 204) : response(preferences);
    }
    throw new Error(`Unexpected GET ${url}`);
  });
  return vi.spyOn(axios, "put").mockResolvedValue(response(null));
}

const Consumer = () => {
  const { preferences, setPreferences } = useUserPreferences();
  return (
    <>
      <span data-testid="troe-units">{preferences.rateUnits.TROE}</span>
      <span data-testid="arrhenius-units">
        {preferences.rateUnits.ARRHENIUS}
      </span>
      <button
        onClick={() =>
          setPreferences({
            rateUnits: { ...preferences.rateUnits, TROE: "SI" },
          })
        }
      >
        Use SI for Troe
      </button>
    </>
  );
};

function renderConsumer() {
  render(
    <AuthProvider>
      <UserPreferencesProvider>
        <Consumer />
      </UserPreferencesProvider>
    </AuthProvider>,
  );
}

const troeUnits = () => screen.getByTestId("troe-units").textContent;
const arrheniusUnits = () => screen.getByTestId("arrhenius-units").textContent;

describe("API user preferences conversion", () => {
  it("maps each reaction type to its API field and back", () => {
    const api = toAPIUserPreferences({ rateUnits: troeSI });
    expect(api).toEqual({ ...allMolecule, troeRateUnits: "SI" });
    expect(fromAPIUserPreferences(api)).toEqual({ rateUnits: troeSI });
  });

  it("uses the default for a missing or invalid API field", () => {
    const api = {
      ...allMolecule,
      troeRateUnits: "Furlongs",
    } as unknown as APIUserPreferences;
    delete (api as Partial<APIUserPreferences>).tunnelingRateUnits;
    expect(fromAPIUserPreferences(api)).toEqual({
      rateUnits: defaultRateUnitsByType,
    });
  });
});

describe("UserPreferencesProvider", () => {
  afterEach(() => {
    localStorage.clear();
    cleanup();
    vi.restoreAllMocks();
  });

  it("uses molecule units by default", () => {
    mockBackend(false, null);
    renderConsumer();
    expect(troeUnits()).toBe("Molecule");
    expect(arrheniusUnits()).toBe("Molecule");
  });

  it("reads and writes the preferences of a guest in local storage", () => {
    const put = mockBackend(false, null);
    localStorage.setItem(
      "userPreferences",
      JSON.stringify({ rateUnits: { ARRHENIUS: "SI" } }),
    );
    renderConsumer();
    expect(arrheniusUnits()).toBe("SI");
    expect(troeUnits()).toBe("Molecule");

    fireEvent.click(screen.getByText("Use SI for Troe"));
    expect(troeUnits()).toBe("SI");
    expect(
      JSON.parse(localStorage.getItem("userPreferences")!).rateUnits,
    ).toEqual({ ...defaultRateUnitsByType, ARRHENIUS: "SI", TROE: "SI" });
    expect(put).not.toHaveBeenCalled();
  });

  it("uses the defaults for stored preferences that are not valid", () => {
    mockBackend(false, null);
    localStorage.setItem("userPreferences", "{not json");
    renderConsumer();
    expect(troeUnits()).toBe("Molecule");
    cleanup();

    localStorage.setItem(
      "userPreferences",
      JSON.stringify({ rateUnits: { TROE: "Furlongs" } }),
    );
    renderConsumer();
    expect(troeUnits()).toBe("Molecule");
  });

  it("continues to operate when local storage is not available", () => {
    mockBackend(false, null);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    renderConsumer();
    expect(troeUnits()).toBe("Molecule");
    fireEvent.click(screen.getByText("Use SI for Troe"));
    expect(troeUnits()).toBe("SI");
  });

  it("loads the saved preferences of a logged in user", async () => {
    const put = mockBackend(true, { ...allMolecule, troeRateUnits: "SI" });
    renderConsumer();
    await waitFor(() => expect(troeUnits()).toBe("SI"));
    expect(arrheniusUnits()).toBe("Molecule");
    expect(
      JSON.parse(localStorage.getItem("userPreferences")!).rateUnits,
    ).toEqual(troeSI);
    expect(put).not.toHaveBeenCalled();
  });

  it("saves the local preferences of a user without saved preferences", async () => {
    const put = mockBackend(true, null);
    localStorage.setItem(
      "userPreferences",
      JSON.stringify({ rateUnits: troeSI }),
    );
    renderConsumer();
    await waitFor(() =>
      expect(put).toHaveBeenCalledWith(
        `${BASE_URL}/users/me/preferences`,
        { ...allMolecule, troeRateUnits: "SI" },
        expect.anything(),
      ),
    );
    expect(troeUnits()).toBe("SI");
  });

  it("saves a change of a logged in user to the database", async () => {
    const put = mockBackend(true, allMolecule);
    renderConsumer();
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(
        `${BASE_URL}/users/me/preferences`,
        expect.anything(),
      ),
    );
    fireEvent.click(screen.getByText("Use SI for Troe"));
    expect(put).toHaveBeenCalledWith(
      `${BASE_URL}/users/me/preferences`,
      { ...allMolecule, troeRateUnits: "SI" },
      expect.anything(),
    );
  });

  it("gives the defaults outside of a provider", () => {
    render(<Consumer />);
    expect(troeUnits()).toBe("Molecule");
    fireEvent.click(screen.getByText("Use SI for Troe"));
    expect(troeUnits()).toBe("Molecule");
  });
});
