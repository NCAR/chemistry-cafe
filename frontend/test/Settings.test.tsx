import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Settings from "../src/pages/Settings";
import { AuthProvider } from "../src/components/AuthContext";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { APIUser } from "../src/API/API_Interfaces";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";
import { UserPreferencesProvider } from "../src/components/UserPreferencesContext";
import userEvent from "@testing-library/user-event";

const mockUserInfo: APIUser = {
  role: "Admin",
  email: "test@email.com",
  username: "Test Account",
  id: "0000-0000-0000-0000-0000",
  googleId: "0000-0000-0000-0000-0000",
  orcidId: "0000-0000-0000-0000-0000",
};

describe("Unauthenticated Settings Page", () => {
  const originalLocation = window.location;

  function createMockUserData(): AxiosResponse {
    return {
      data: null,
      status: 404,
      statusText: "OK",
      headers: {},
      config: {
        headers: new AxiosHeaders({ "Content-Type": "text/plain" }),
      },
    } as AxiosResponse;
  }

  beforeEach(() => {
    window.location = {
      ...originalLocation,
      assign: vi.fn((_: string | URL) => {}),
    } as any;
    vi.spyOn(axios, "get").mockResolvedValue(createMockUserData());
    vi.spyOn(axios, "post").mockResolvedValue(createMockUserData());

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <UserPreferencesProvider>
            <MemoryRouter initialEntries={["/", "/loggedIn"]}>
              <Settings />
            </MemoryRouter>
          </UserPreferencesProvider>
        </CustomThemeProvider>
      </AuthProvider>,
    );
  });

  afterEach(() => {
    window.location = originalLocation as any;
    localStorage.clear();
    cleanup();
  });

  it("Renders", () => {
    expect(screen.getByText("App Settings")).toBeTruthy();
  });

  it("Can navigate to the appearance menu", () => {
    const appearanceButton = screen.getByText("Appearance");
    expect(appearanceButton).toBeTruthy();
    fireEvent.click(appearanceButton);
  });

  it("Can navigate to the accessibility menu", () => {
    const accessibilityButton = screen.getByTestId("accessibility-menu-button");
    expect(accessibilityButton).toBeTruthy();
    fireEvent.click(accessibilityButton);
  });

  it("Can Not navigate to the user settings menu", async () => {
    const userSettingsButton = screen.queryByText("My Profile");
    expect(userSettingsButton).toBeFalsy();
  });

  it("Can switch between system, light, and dark theme", () => {
    const appearanceButton = screen.getByText("Appearance");
    fireEvent.click(appearanceButton);

    const lightButton = screen.getByLabelText("use light theme");
    const darkButton = screen.getByLabelText("use dark theme");
    const systemButton = screen.getByLabelText("use system theme");

    fireEvent.click(darkButton);
    fireEvent.click(lightButton);
    fireEvent.click(systemButton);
  });

  it("Can set the rate units of one reaction type or of all types", () => {
    fireEvent.click(screen.getByTestId("units-menu-button"));

    const troeSI = screen.getByLabelText("use SI units for Troe (Fall-Off)");
    const arrheniusMolecule = screen.getByLabelText(
      "use molecule units for Arrhenius",
    );
    const allMolecule = screen.getByLabelText("use molecule units for all");
    const allSI = screen.getByLabelText("use SI units for all");
    expect(allMolecule.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(troeSI);
    expect(troeSI.getAttribute("aria-pressed")).toBe("true");
    expect(arrheniusMolecule.getAttribute("aria-pressed")).toBe("true");
    const stored = JSON.parse(localStorage.getItem("userPreferences")!);
    expect(stored.rateUnits.TROE).toBe("SI");
    expect(stored.rateUnits.ARRHENIUS).toBe("Molecule");

    // The "set all" switch has no selection when the types differ.
    expect(allMolecule.getAttribute("aria-pressed")).toBe("false");
    expect(allSI.getAttribute("aria-pressed")).toBe("false");

    // A click on the selected button does not clear the selection.
    fireEvent.click(troeSI);
    expect(troeSI.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(allSI);
    expect(allSI.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen
        .getByLabelText("use SI units for Arrhenius")
        .getAttribute("aria-pressed"),
    ).toBe("true");
    const storedAll = JSON.parse(localStorage.getItem("userPreferences")!);
    expect(new Set(Object.values(storedAll.rateUnits))).toEqual(
      new Set(["SI"]),
    );
  });
});

describe("Authenticated Settings Page", () => {
  const originalLocation = window.location;

  function createMockUserData(): AxiosResponse {
    return {
      data: mockUserInfo,
      status: 404,
      statusText: "OK",
      headers: {},
      config: {
        headers: new AxiosHeaders({ "Content-Type": "text/plain" }),
      },
    } as AxiosResponse;
  }

  beforeEach(() => {
    window.location = {
      ...originalLocation,
      assign: vi.fn((_: string | URL) => {}),
    } as any;
    vi.spyOn(axios, "get").mockResolvedValue(createMockUserData());
    vi.spyOn(axios, "post").mockResolvedValue(createMockUserData());
    localStorage.setItem("user", JSON.stringify(mockUserInfo));
    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/", "/loggedIn"]}>
            <Settings />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );
  });

  afterEach(() => {
    window.location = originalLocation as any;
    localStorage.clear();
    cleanup();
  });

  it("Renders", () => {
    expect(screen.getByText("App Settings")).toBeTruthy();
  });

  it("Can navigate to the appearance menu", () => {
    const appearanceButton = screen.getByText("Appearance");
    expect(appearanceButton).toBeTruthy();
    fireEvent.click(appearanceButton);
  });

  it("Can navigate to the accessibility menu", () => {
    const accessibilityButton = screen.getByTestId("accessibility-menu-button");
    expect(accessibilityButton).toBeTruthy();
    fireEvent.click(accessibilityButton);
  });

  it("Can navigate to the user settings menu", () => {
    const userSettingsButton = screen.getByText("My Profile");
    expect(userSettingsButton).toBeTruthy();
    fireEvent.click(userSettingsButton);
  });

  it("Can use Profile Info", async () => {
    const user = userEvent.setup();
    const userVal = localStorage.getItem("user");
    expect(userVal).toBeTruthy();
    const profile = JSON.parse(userVal as string) as APIUser;

    const appearanceButton = screen.getByText("My Profile");
    fireEvent.click(appearanceButton);

    let submitBox = screen.getByText("Save Changes") as HTMLButtonElement;
    expect(submitBox).toBeTruthy();
    expect(submitBox.disabled).toBeTruthy();

    const nameBox = screen.getByLabelText("Username *") as HTMLInputElement;
    expect(nameBox).toBeTruthy();
    expect(nameBox.value).toEqual(profile.username);

    await user.type(nameBox, " 2");
    expect(nameBox.value).toEqual(`${profile.username} 2`);

    const emailBox = screen.getByLabelText("Email *") as HTMLInputElement;
    expect(emailBox).toBeTruthy();
    expect(emailBox.value).toEqual(profile.email);

    await user.type(emailBox, "good_", { initialSelectionStart: 0 });
    expect(emailBox.value).toEqual(`good_${profile.email}`);

    const firstNameBox = screen.getByLabelText(
      "First Name *",
    ) as HTMLInputElement;
    expect(firstNameBox).toBeTruthy();
    expect(firstNameBox.value).toEqual(profile.firstName ?? "");

    await user.type(firstNameBox, "bob");
    expect(firstNameBox.value).toEqual("bob");

    const lastNameBox = screen.getByLabelText(
      "Last Name *",
    ) as HTMLInputElement;
    expect(lastNameBox).toBeTruthy();
    expect(lastNameBox.value).toEqual(profile.lastName ?? "");

    await user.type(lastNameBox, "jones");
    expect(lastNameBox.value).toEqual("jones");

    submitBox = screen.getByText("Save Changes") as HTMLButtonElement;
    expect(submitBox).toBeTruthy();
    expect(submitBox.disabled).toBeFalsy();
  });

  it("Can switch between system, light, and dark theme", () => {
    const appearanceButton = screen.getByText("Appearance");
    fireEvent.click(appearanceButton);

    const lightButton = screen.getByLabelText("use light theme");
    const darkButton = screen.getByLabelText("use dark theme");
    const systemButton = screen.getByLabelText("use system theme");

    fireEvent.click(darkButton);
    fireEvent.click(lightButton);
    fireEvent.click(systemButton);
  });
});
