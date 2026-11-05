import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
  waitFor,
} from "@testing-library/react";
import React from "react";
import Register from "../src/pages/Register";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../src/components/AuthContext";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";
import * as API_Get from "../src/API/API_GetMethods";
import * as API_Create from "../src/API/API_CreateMethods";
import { APIPendingRegistration, APIUser } from "../src/API/API_Interfaces";

describe("Register Component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("renders No Pending Registration when there is no pending session", async () => {
    vi.spyOn(API_Get, "getPendingRegistration").mockResolvedValue(null);
    vi.spyOn(API_Get, "getCurrentUser").mockResolvedValue(null);

    render(
      <CustomThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <Register />
          </MemoryRouter>
        </AuthProvider>
      </CustomThemeProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("No Pending Registration Found"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in with orcid/i }),
    ).toBeInTheDocument();
  });

  it("renders registration form and completes registration with chosen username", async () => {
    const mockPending: APIPendingRegistration = {
      provider: "Google",
      email: "jane.doe@example.com",
      suggestedUsername: "jane_doe",
      firstName: "Jane",
      lastName: "Doe",
    };

    vi.spyOn(API_Get, "getPendingRegistration").mockResolvedValue(mockPending);
    vi.spyOn(API_Get, "getCurrentUser").mockResolvedValue(null);
    vi.spyOn(API_Get, "checkUsernameAvailability").mockResolvedValue({
      available: true,
      message: "Username is available.",
    });

    const mockCreatedUser: APIUser = {
      id: "1111-1111-1111-1111-1111",
      username: "jane_doe",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      role: "None",
    };
    const registerSpy = vi
      .spyOn(API_Create, "registerUser")
      .mockResolvedValue(mockCreatedUser);

    render(
      <CustomThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <Register />
          </MemoryRouter>
        </AuthProvider>
      </CustomThemeProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Complete Your Registration"),
      ).toBeInTheDocument();
    });

    // Check pre-filled values
    const usernameInput = screen.getByLabelText(
      /username/i,
    ) as HTMLInputElement;
    expect(usernameInput.value).toBe("jane_doe");

    // Wait for availability check debounce
    await waitFor(() => {
      expect(screen.getByText("Username is available.")).toBeInTheDocument();
    });

    // Submit form
    const createButton = screen.getByRole("button", {
      name: /create account/i,
    });
    expect(createButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(createButton);
    });

    expect(registerSpy).toHaveBeenCalledWith({
      username: "jane_doe",
      firstName: "Jane",
      lastName: "Doe",
    });
  });

  it("displays error when username is taken", async () => {
    const mockPending: APIPendingRegistration = {
      provider: "Google",
      email: "taken@example.com",
      suggestedUsername: "taken_user",
    };

    vi.spyOn(API_Get, "getPendingRegistration").mockResolvedValue(mockPending);
    vi.spyOn(API_Get, "getCurrentUser").mockResolvedValue(null);
    vi.spyOn(API_Get, "checkUsernameAvailability").mockResolvedValue({
      available: false,
      message: "Username is already taken.",
    });

    render(
      <CustomThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <Register />
          </MemoryRouter>
        </AuthProvider>
      </CustomThemeProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Complete Your Registration"),
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText("Username is already taken."),
      ).toBeInTheDocument();
    });

    const createButton = screen.getByRole("button", {
      name: /create account/i,
    });
    expect(createButton).toBeDisabled();
  });
});
