import { describe, expect, it, beforeEach, afterEach, vi, test } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from "@testing-library/react";
import React from "react";
import LogIn from "../src/pages/logIn";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../src/pages/AuthContext";
import { User, UserClaims } from "../src/API/API_Interfaces";
import axios, { AxiosHeaders, AxiosResponse } from "axios";

vi.mock("axios");

const mockUserInfo: User = {
  "role": "admin",
  "email": "test@email.com",
  "username": "Test Account",
}

describe("Unauthenticated LogIn Component", () => {
  const originalLocation = window.location;

  function createMockUserData(): AxiosResponse {
    return {
      data: {
        nameId: null,
        email: null,
      } as UserClaims & User,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        headers: new AxiosHeaders({ "Content-Type": "text/plain" }),
      },
    } as AxiosResponse;
  }

  beforeEach(() => {
    window.location = { ...originalLocation, assign: vi.fn((_: string | URL) => { }) };
    vi.spyOn(axios, "get").mockResolvedValue(createMockUserData());

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/', '/loggedIn']}>
          <LogIn />
        </MemoryRouter>
      </AuthProvider>
    );
  });

  afterEach(() => {
    window.location = originalLocation;
    localStorage.clear();
    cleanup();
  });

  it("should render the login button and the guest button", () => {
    expect(screen.getByText("Sign in")).toBeTruthy();  // Check presence of the login button
    expect(screen.getByText("Continue as Guest")).toBeTruthy();  // Check presence of the guest button
  });

  it("should open and close the About modal", async () => {

    const aboutButton = screen.getAllByRole("button", { name: "About" })[0];
    fireEvent.click(aboutButton);

    // Assert that modal is open
    expect(screen.getByText("Credits")).toBeTruthy();

    // Simulate a click outside the modal to close it
    fireEvent.click(document.body);

    // Wait for the modal to be closed
    await waitFor(() => {
      expect(screen.queryByText("Kyle Shores")).toBeFalsy();
    });
  });

  it("navigates to the backend when signing in", () => {
    const loginButton = screen.getByText("Sign in");
    expect(loginButton).toBeTruthy();
    fireEvent.click(loginButton);
    expect(window.location.assign).toHaveBeenCalledOnce(); // Redirect to backend auth/google/login endpoint
  });

  it("navigates when continuing as a guest", () => {
    const loginButton = screen.getByText("Continue as Guest");
    expect(loginButton).toBeTruthy();
    fireEvent.click(loginButton);
  });
});

describe.each([
  ["", mockUserInfo],
  ["with uncached user", null],
  ["with other cached user", {
    email: "wronguser@gmail.co.uk",
    role: "unauthenticated",
    username: "John Doe"
  }],
])
  ("Authenticated LogIn Component %s", (_, cachedUserInfo) => {
    const originalLocation = window.location;

    function createMockUserData(): AxiosResponse {
      return {
        data: {
          nameId: "1234567890",
          email: mockUserInfo.email,
          id: "1234",
          username: mockUserInfo.username,
          role: mockUserInfo.role,
        } as UserClaims & User,
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
      window.location = { ...originalLocation, assign: vi.fn((_: string | URL) => { }) };
      localStorage.setItem("user", JSON.stringify(cachedUserInfo));
      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/', '/loggedIn']}>
            <LogIn />
          </MemoryRouter>
        </AuthProvider>
      );

      await act(() => axios.get); // Allows the initial useLayoutEffect to fire
    });

    afterEach(() => {
      cleanup();
      window.location = originalLocation;
      localStorage.clear();
    });

    it("shows different buttons when logged in", () => {
      expect(screen.getByText(`Continue as ${mockUserInfo.username}`)).toBeTruthy();
      expect(screen.getByText("Switch Account")).toBeTruthy();
      expect(screen.getByText("Continue as Guest")).toBeTruthy();
    });

    it("navigates to the backend when switching accounts", () => {
      const loginButton = screen.getByText("Switch Account");
      expect(loginButton).toBeTruthy();
      fireEvent.click(loginButton);
      expect(window.location.assign).toHaveBeenCalledOnce(); // Redirect to backend auth/google/login endpoint
    });

    it("navigates to the backend when continuing as a guest", () => {
      const guestButton = screen.getByText("Continue as Guest");
      expect(guestButton).toBeTruthy();
      fireEvent.click(guestButton);
      expect(window.location.assign).toHaveBeenCalledOnce();
    });

    it("removes user from local storage when logging out", () => {
      expect(document.getElementById("side-nav-button")).toBeTruthy();
      expect(localStorage.getItem("user")).toBeTruthy();

      // Open side nav
      const hamburgerMenu: HTMLElement = document.getElementById("side-nav-button")!;
      fireEvent.click(hamburgerMenu);

      // Click logout button
      const logoutButton = screen.getByText("Log Out");
      fireEvent.click(logoutButton);

      expect(window.location.assign).toHaveBeenCalledOnce(); // Redirect to backend auth/google/logout endpoint
      expect(localStorage.getItem("user")).toBeFalsy();
    });
  });


describe("Sanity Check Tests", () => {
  it("should always pass test 1", () => {
    expect(true).toBe(true);
  });

  it("should always pass test 2", () => {
    expect(1 + 1).toBe(2);
  });

  it("should always pass test 3", () => {
    expect("dummy").toBe("dummy");
  });

  it("should always pass test 4", () => {
    expect([]).toEqual([]);
  });
});
