import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { beforeEach, describe, afterEach, expect, it, vi } from "vitest";
import { APIFamily } from "../src/API/API_Interfaces";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "../src/components/AuthContext";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../src/pages/Dashboard";
import React from "react";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";

vi.mock("axios");

describe("Dashboard", () => {
  const originalLocation = window.location;

  function createMockFamilyData(): AxiosResponse {
    return {
      data: [
        {
          id: "1-2-3-4-5",
          createdDate: "2025-04-05T02:47:33.375782",
          name: "Test Family",
          description: "",
          owner: {
            id: "1-1-1-1-1",
            username: "Test User",
            role: "admin",
          },
          species: [],
        }
      ] as Array<APIFamily>,
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
    vi.spyOn(axios, "get").mockResolvedValue(createMockFamilyData());

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/dashboard"]}>
            <Dashboard />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>
    );
  });

  afterEach(() => {
    cleanup();
    window.location = originalLocation as any;
    localStorage.clear();
  });

  it("Renders and displays families", async () => {
    await waitFor(() => {
      expect(screen.getByText("Test Family")).toBeTruthy();
    });
  });
});