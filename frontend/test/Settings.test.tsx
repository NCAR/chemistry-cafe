import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Settings from "../src/pages/Settings";
import { AuthProvider } from "../src/components/AuthContext";
import React from "react";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { APIUser } from "../src/API/API_Interfaces";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";

describe("Settings Page", () => {
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
      assign: vi.fn((_: string | URL) => { }),
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

  it("Can navigate to the user settings menu", () => {
    const userSettingsButton = screen.getByText("My Profile");
    expect(userSettingsButton).toBeTruthy();
    fireEvent.click(userSettingsButton);
  });

  it("Can toggle different button color palettes", () => {
    const darkThemeButton = screen.getByTestId("toggle-dark-theme");
    const lowSaturationButton = screen.getByTestId("toggle-low-saturation-theme");
    const highSaturationButton = screen.getByTestId("toggle-high-saturation-theme");
    const monochromeButton = screen.getByTestId("toggle-monochrome-theme");

    fireEvent.click(darkThemeButton);
    fireEvent.click(lowSaturationButton);
    fireEvent.click(highSaturationButton);
    fireEvent.click(monochromeButton);
  });
});
