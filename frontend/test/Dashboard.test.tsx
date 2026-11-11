import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { beforeEach, describe, afterEach, expect, it, vi } from "vitest";
import { APIFamily } from "../src/API/API_Interfaces";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "../src/components/AuthContext";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Dashboard from "../src/pages/Dashboard";
import React from "react";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";

vi.mock("axios");

const mockFamily1: APIFamily = {
  id: "1-1-1-1-1" as any,
  createdDate: "2026-04-05T02:47:33.375782",
  name: "Tropospheric Family",
  description: "Chemistry of the troposphere",
  isPublic: true,
  owner: {
    id: "owner-user-id" as any,
    username: "AtmosphericScientist",
    role: "None",
  },
  species: [
    {
      id: "spec-1" as any,
      name: "NO2",
      description: null,
    },
    {
      id: "spec-2" as any,
      name: "O3",
      description: null,
    },
  ],
  reactions: [
    {
      id: "rxn-1" as any,
      name: "NO2 Photolysis",
      reactionType: "PHOTOLYSIS",
      description: "NO2 photolysis reaction",
      reactants: [{ speciesId: "spec-1" as any, coefficient: 1 }],
      products: [],
    },
  ],
  phases: [],
  mechanisms: [
    {
      id: "mech-1" as any,
      name: "Tropospheric NOx",
      description: "NOx oxidation",
      familyId: "1-1-1-1-1" as any,
      speciesIds: ["spec-1" as any, "spec-2" as any],
      reactionIds: ["rxn-1" as any],
      phaseIds: [],
      verified: true,
      verifiedDate: "2026-11-04T12:00:00Z",
      verifiedBy: "DrVerifier",
      otherProperties: {},
    },
  ],
};

const mockFamily2: APIFamily = {
  id: "2-2-2-2-2" as any,
  createdDate: "2026-05-01T00:00:00.000000",
  name: "Stratospheric Halogens",
  description: "CFC and halogen breakdown",
  isPublic: false,
  owner: {
    id: "other-user-id" as any,
    username: "StratExpert",
    role: "None",
  },
  species: [
    {
      id: "spec-3" as any,
      name: "Cl",
      description: null,
    },
  ],
  reactions: [
    {
      id: "rxn-2" as any,
      name: "Cl + O3",
      reactionType: "ARRHENIUS",
      description: "Chlorine ozone depletion",
      reactants: [{ speciesId: "spec-3" as any, coefficient: 1 }],
      products: [],
    },
  ],
  phases: [],
  mechanisms: [
    {
      id: "mech-2" as any,
      name: "Chlorine cycle",
      description: "Unverified chlorine chemistry",
      familyId: "2-2-2-2-2" as any,
      speciesIds: ["spec-3" as any],
      reactionIds: ["rxn-2" as any],
      phaseIds: [],
      verified: false,
      otherProperties: {},
    },
  ],
};

const mockFamily3: APIFamily = {
  id: "3-3-3-3-3" as any,
  createdDate: "2026-06-01T00:00:00.000000",
  name: "Contributed Family",
  description: "Family where user is a contributor",
  isPublic: true,
  owner: {
    id: "other-user-id" as any,
    username: "StratExpert",
    role: "None",
  },
  contributorIds: ["owner-user-id" as any],
  species: [],
  reactions: [],
  phases: [],
  mechanisms: [],
};

describe("Dashboard / Browse Page", () => {
  const originalLocation = window.location;

  function createMockFamilyResponse(): AxiosResponse {
    return {
      data: [mockFamily1, mockFamily2, mockFamily3],
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        headers: new AxiosHeaders({ "Content-Type": "application/json" }),
      },
    } as AxiosResponse;
  }

  beforeEach(() => {
    window.location = {
      ...originalLocation,
      assign: vi.fn(),
    } as any;
    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: {
            id: "owner-user-id",
            username: "AtmosphericScientist",
            role: "Admin",
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      return Promise.resolve(createMockFamilyResponse());
    });
  });

  afterEach(() => {
    cleanup();
    window.location = originalLocation as any;
    localStorage.clear();
  });

  it("Renders browse page title, subtitle, and families list", async () => {
    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/"]}>
            <Dashboard />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    expect(screen.getByText("Browse Families & Mechanisms")).toBeTruthy();
    expect(screen.getByText("Chemical mechanism management")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("Tropospheric Family")).toBeTruthy();
      expect(screen.getByText("Stratospheric Halogens")).toBeTruthy();
    });
  });

  it("Shows Open button for your family and Edit a copy for other family", async () => {
    // Current user is AtmosphericScientist (owner of mockFamily1, admin)
    // Let's test with a non-admin normal user
    cleanup();
    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: {
            id: "owner-user-id",
            username: "AtmosphericScientist",
            role: "None",
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      return Promise.resolve(createMockFamilyResponse());
    });

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/"]}>
            <Dashboard />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Tropospheric Family")).toBeTruthy();
    });

    // mockFamily1 is owned by AtmosphericScientist -> Open
    expect(
      screen.getByRole("button", { name: "Open Tropospheric Family" }),
    ).toBeTruthy();
    // mockFamily2 is owned by StratExpert -> Edit a copy
    expect(
      screen.getByRole("button", {
        name: "Edit a copy of Stratospheric Halogens",
      }),
    ).toBeTruthy();
  });

  it("Filters families by search box across species and reactions, and automatically opens them", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/?view=all"]}>
            <Dashboard />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Tropospheric Family")).toBeTruthy();
    });

    // Search for NO2 (species in Tropospheric Family)
    const searchInput = screen.getByPlaceholderText(
      /Search families, mechanisms/i,
    );
    await user.type(searchInput, "NO2");

    // Only Tropospheric Family should match
    await waitFor(() => {
      expect(screen.getByText("Tropospheric Family")).toBeTruthy();
      expect(screen.queryByText("Stratospheric Halogens")).toBeFalsy();
      // And because of auto-open on search match, its mechanisms are visible
      expect(screen.getByText("Tropospheric NOx")).toBeTruthy();
    });
  });

  it("Filters by Verified switch", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/?view=all"]}>
            <Dashboard />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Tropospheric Family")).toBeTruthy();
      expect(screen.getByText("Stratospheric Halogens")).toBeTruthy();
    });

    // Click Verified switch
    const verifiedToggle = screen.getByRole("button", {
      name: /Verified mechanisms/i,
    });
    await user.click(verifiedToggle);

    // mockFamily1 has verified mechanism, mockFamily2 does not
    await waitFor(() => {
      expect(screen.getByText("Tropospheric Family")).toBeTruthy();
      expect(screen.queryByText("Stratospheric Halogens")).toBeFalsy();
    });
  });

  it("Opens 5 filters, applies filter, shows chip with ×, and clears filter on click", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/?view=all"]}>
            <Dashboard />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Tropospheric Family")).toBeTruthy();
    });

    // Click Filters button to open filter panel
    const filtersBtn = screen.getByRole("button", {
      name: /Open filter options/i,
    });
    await user.click(filtersBtn);

    // Type in Contains species: Cl
    const speciesInput = screen.getByLabelText(/Contains species/i);
    await user.type(speciesInput, "Cl");

    // Stratospheric Halogens contains Cl, Tropospheric does not
    await waitFor(() => {
      expect(screen.getByText("Stratospheric Halogens")).toBeTruthy();
      expect(screen.queryByText("Tropospheric Family")).toBeFalsy();
      expect(screen.getByText("Species: Cl")).toBeTruthy();
    });

    // Click × on the chip to clear
    const chip = screen.getByText("Species: Cl").closest(".MuiChip-root");
    const deleteBtn = chip?.querySelector(".MuiChip-deleteIcon") as HTMLElement;
    expect(deleteBtn).toBeTruthy();
    await user.click(deleteBtn);

    // Both should be visible again
    await waitFor(() => {
      expect(screen.getByText("Tropospheric Family")).toBeTruthy();
      expect(screen.getByText("Stratospheric Halogens")).toBeTruthy();
    });
  });

  it("Shows 'Show archived versions' link for verifiers and admins", async () => {
    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/?view=all"]}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/archived-versions"
                element={<div>Archived Versions</div>}
              />
            </Routes>
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Show archived versions")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Show archived versions"));
    expect(screen.getByText("Archived Versions")).toBeTruthy();
  });

  it("Can open New family modal from the toolbar", async () => {
    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/"]}>
            <Dashboard />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("New family")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("New family"));
    await waitFor(() => {
      expect(
        screen.getByText("Enter Details for the Family below:"),
      ).toBeTruthy();
      expect(document.getElementById("family-name")).toBeTruthy();
    });
  });

  it("Can open Import a file modal from the toolbar", async () => {
    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/"]}>
            <Dashboard />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Import a file")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Import a file"));
    await waitFor(() => {
      expect(screen.getByText(/Upload a mechanism configuration/)).toBeTruthy();
    });
  });

  it("Filters by Mine switch - only shows contributor, owned, and browser draft families even for admin", async () => {
    const user = userEvent.setup();

    // Add a local browser draft
    localStorage.setItem(
      "localFamilies",
      JSON.stringify([
        {
          id: "draft-fam-uuid",
          name: "My Local Draft Family",
          description: "Draft created in browser",
          isInDatabase: false,
          isPublic: false,
          species: [],
          reactions: [],
          phases: [],
          mechanisms: [],
        },
      ]),
    );

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/?view=all"]}>
            <Dashboard />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Tropospheric Family")).toBeTruthy();
      expect(screen.getByText("Stratospheric Halogens")).toBeTruthy();
      expect(screen.getByText("Contributed Family")).toBeTruthy();
      expect(screen.getByText("My Local Draft Family")).toBeTruthy();
    });

    // Click "Mine" toggle button
    const mineToggle = screen.getByRole("button", {
      name: /My families and drafts/i,
    });
    await user.click(mineToggle);

    await waitFor(() => {
      // Owned family (AtmosphericScientist / owner-user-id) should be visible
      expect(screen.getByText("Tropospheric Family")).toBeTruthy();
      // Contributed family (owner-user-id in contributorIds) should be visible
      expect(screen.getByText("Contributed Family")).toBeTruthy();
      // Browser draft should be visible
      expect(screen.getByText("My Local Draft Family")).toBeTruthy();
      // Other user's family (Stratospheric Halogens) should NOT be visible, despite user being Admin
      expect(screen.queryByText("Stratospheric Halogens")).toBeFalsy();
    });
  });

  it("Filters by Mine switch for guest - only shows browser draft families", async () => {
    const user = userEvent.setup();

    // Guest user (not logged in)
    cleanup();
    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.reject(new Error("Unauthorized"));
      }
      return Promise.resolve(createMockFamilyResponse());
    });

    // Add a local browser draft
    localStorage.setItem(
      "localFamilies",
      JSON.stringify([
        {
          id: "draft-guest-uuid",
          name: "Guest Browser Draft",
          description: "Draft created by guest in browser",
          isInDatabase: false,
          isPublic: false,
          species: [],
          reactions: [],
          phases: [],
          mechanisms: [],
        },
      ]),
    );

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/?view=all"]}>
            <Dashboard />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Guest Browser Draft")).toBeTruthy();
      expect(screen.getByText("Tropospheric Family")).toBeTruthy();
    });

    // Click "Mine" toggle button
    const mineToggle = screen.getByRole("button", {
      name: /My families and drafts/i,
    });
    await user.click(mineToggle);

    await waitFor(() => {
      // Browser draft should be visible
      expect(screen.getByText("Guest Browser Draft")).toBeTruthy();
      // Database families should NOT be visible to guest under Mine
      expect(screen.queryByText("Tropospheric Family")).toBeFalsy();
      expect(screen.queryByText("Stratospheric Halogens")).toBeFalsy();
      expect(screen.queryByText("Contributed Family")).toBeFalsy();
    });
  });

  it("Never deletes browser drafts when logging out", async () => {
    const user = userEvent.setup();

    // Set a browser draft in localStorage
    const draftData = [
      {
        id: "draft-save-test",
        name: "Persistent Draft",
        isInDatabase: false,
      },
    ];
    localStorage.setItem("localFamilies", JSON.stringify(draftData));

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/"]}>
            <Dashboard />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeTruthy();
    });

    // Click Logout
    const logoutBtn = screen.getByText("Logout");
    await user.click(logoutBtn);

    // Verify localFamilies was NOT removed from localStorage
    const stored = localStorage.getItem("localFamilies");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(draftData);
  });
});
