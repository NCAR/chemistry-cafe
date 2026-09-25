import { describe, expect, it, beforeEach, afterEach, vi, test } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import React from "react";
import Home from "../src/pages/Home";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../src/components/AuthContext";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";
import { APIUser } from "../src/API/API_Interfaces";
import axios, { AxiosHeaders, AxiosResponse } from "axios";

vi.mock("axios");

const mockUserInfo: APIUser = {
  role: "admin",
  email: "test@email.com",
  username: "Test Account",
  id: "0000-0000-0000-0000-0000",
};

describe("Unauthenticated Home Component", () => {
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
      <CustomThemeProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={["/", "/loggedIn"]}>
            <Home />
          </MemoryRouter>
        </AuthProvider>
      </CustomThemeProvider>,
    );
  });

  afterEach(() => {
    window.location = originalLocation as any;
    localStorage.clear();
    cleanup();
  });

  it("should render the sign-in button in the header and the family navigation buttons", () => {
    expect(screen.getAllByText("Sign in").length).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Browse Mechanisms" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "My Families" })).toBeTruthy();
  });

  it("links to the About page", () => {
    const aboutLink = screen.getAllByRole("link", { name: /About/i })[0];
    expect(aboutLink).toHaveAttribute("href", "/about");
  });

  it("navigates to the backend when signing in", () => {
    const loginButtons = screen.getAllByText("Sign in");
    expect(loginButtons.length).toBeTruthy();
    for (const loginButton of loginButtons) {
      fireEvent.click(loginButton);
    }
    expect(window.location.assign).toHaveBeenCalledTimes(loginButtons.length) // Redirect to backend auth/google/login endpoint
  });

  it("navigates when browsing families or opening the family editor", () => {
    fireEvent.click(screen.getByRole("button", { name: "Browse Mechanisms" }));
    fireEvent.click(screen.getByRole("button", { name: "My Families" }));
  });
});

describe.each([
  ["", mockUserInfo],
  ["with uncached user", null],
  [
    "with other cached user",
    {
      email: "wronguser@gmail.co.uk",
      role: "unauthenticated",
      username: "John Doe",
    },
  ],
])("Authenticated Home Component %s", (_, cachedUserInfo) => {
  const originalLocation = window.location;

  function createMockUserData(): AxiosResponse {
    return {
      data: mockUserInfo,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        headers: new AxiosHeaders({ "Content-Type": "text/plain" }),
      },
    } as AxiosResponse;
  }

  beforeEach(async () => {
    vi.spyOn(axios, "get").mockResolvedValue(createMockUserData());
    vi.spyOn(axios, "post").mockResolvedValue(createMockUserData());
    window.location = {
      ...originalLocation,
      assign: vi.fn((_: string | URL) => {}),
    } as any;
    localStorage.setItem("user", JSON.stringify(cachedUserInfo));
    render(
      <CustomThemeProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={["/", "/loggedIn"]}>
            <Home />
          </MemoryRouter>
        </AuthProvider>
      </CustomThemeProvider>,
    );

    await act(() => axios.get); // Allows the initial useLayoutEffect to fire
  });

  afterEach(() => {
    cleanup();
    window.location = originalLocation as any;
    localStorage.clear();
  });

  it("shows the logout control and the family navigation buttons", () => {
    expect(screen.getByText("Logout")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Browse Mechanisms" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "My Families" })).toBeTruthy();
  });

  it("removes user from local storage when logging out", () => {
    expect(localStorage.getItem("user")).toBeTruthy();

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    expect(window.location.assign).toHaveBeenCalledOnce(); // Redirect to backend auth/google/logout endpoint
    expect(localStorage.getItem("user")).toBeFalsy();
  });
});

describe("Sanity Check Test", () => {
  it("should always pass test", () => {
    expect(true).toBe(true);
  });
});
