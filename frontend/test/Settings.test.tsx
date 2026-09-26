import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Settings from "../src/pages/Settings";
import { AuthProvider } from "../src/components/AuthContext";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { APIUser } from "../src/API/API_Interfaces";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";
import userEvent from "@testing-library/user-event";

const mockUserInfo: APIUser = {
  role: "admin",
  email: "test@email.com",
  username: "Test Account",
  id: "0000-0000-0000-0000-0000",
  googleId: "0000-0000-0000-0000-0000",
  orcidId: "0000-0000-0000-0000-0000"
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
    expect(submitBox ).toBeTruthy();
    expect(submitBox.disabled).toBeTruthy();
    
    const nameBox = screen.getByLabelText("Username *") as HTMLInputElement;
    expect(nameBox).toBeTruthy();
    expect(nameBox.value).toEqual(profile.username);

    await user.type(nameBox, " 2");
    expect(nameBox.value).toEqual(`${profile.username} 2`);

    const emailBox = screen.getByLabelText("Email *") as HTMLInputElement;
    expect(emailBox).toBeTruthy();
    expect(emailBox.value).toEqual(profile.email);

    await user.type(emailBox, "good_",{initialSelectionStart:0});
    expect(emailBox.value).toEqual(`good_${profile.email}`);

    submitBox = screen.getByText("Save Changes") as HTMLButtonElement;
    expect(submitBox ).toBeTruthy();
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