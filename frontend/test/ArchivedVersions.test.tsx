import React from "react";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { describe, afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ArchivedVersions from "../src/pages/ArchivedVersions";
import { APIArchivedVerifiedVersion } from "../src/API/API_Interfaces";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";
import { AuthProvider } from "../src/components/AuthContext";

vi.mock("axios");

const mockArchivedVersion1: APIArchivedVerifiedVersion = {
  mechanismId: "mech-archived-1" as any,
  familyId: "fam-archived-1" as any,
  familyVersionId: "fv-archived-1" as any,
  name: "Preserved-Tropospheric-V1",
  description: "Tropospheric oxidation mechanism",
  originalFamilyName: "Deleted Troposphere Family",
  originalOwnerUsername: "ProfAtmosphere",
  verifierUsername: "VerifierAdmin",
  verifiedDate: "2026-10-15T10:30:00Z",
  notes: "Verified against reference chamber data",
  isDeprecated: false,
  deprecationReason: null,
  betterVersionId: null,
};

const mockArchivedVersion2: APIArchivedVerifiedVersion = {
  mechanismId: "mech-archived-2" as any,
  familyId: "fam-archived-2" as any,
  familyVersionId: "fv-archived-2" as any,
  name: "Preserved-Halogen-V1",
  description: "Old halogen cycle",
  originalFamilyName: "Deleted Halogen Family",
  originalOwnerUsername: "HalogenUser",
  verifierUsername: "DrHalogen",
  verifiedDate: "2026-09-01T12:00:00Z",
  notes: "Superseded by V2",
  isDeprecated: true,
  deprecationReason: "Updated rate constants in V2",
  betterVersionId: "fv-archived-3",
};

describe("ArchivedVersions Page", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/archived-versions"]}>
            <Routes>
              <Route path="/archived-versions" element={<ArchivedVersions />} />
              <Route path="/" element={<div>Browse Page</div>} />
              <Route path="/editor" element={<div>Editor Page</div>} />
            </Routes>
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );
  };

  it("fetches and displays archived versions with metadata and status chips", async () => {
    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: { id: "user-1", username: "AdminUser", role: "Admin" },
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      return Promise.resolve({
        data: [mockArchivedVersion1, mockArchivedVersion2],
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: new AxiosHeaders() },
      } as AxiosResponse);
    });

    renderComponent();

    expect(screen.getByRole("heading", { name: "Archived Versions" })).toBeInTheDocument();
    expect(screen.getByText("Back to Browse")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Preserved-Tropospheric-V1")).toBeInTheDocument();
      expect(screen.getByText("Deleted Troposphere Family")).toBeInTheDocument();
      expect(screen.getByText("ProfAtmosphere")).toBeInTheDocument();
      expect(screen.getByText("VerifierAdmin")).toBeInTheDocument();
      expect(screen.getByText("Preserved-Halogen-V1")).toBeInTheDocument();
      expect(screen.getByText("Deleted Halogen Family")).toBeInTheDocument();
      expect(screen.getByText("HalogenUser")).toBeInTheDocument();
    });

    expect(screen.getByText("Deprecated")).toBeInTheDocument();
    expect(screen.getByText(/Updated rate constants in V2/)).toBeInTheDocument();
    expect(screen.getByText("Total archived versions: 2")).toBeInTheDocument();
  });

  it("filters archived versions based on search input and shows empty filter state", async () => {
    const user = userEvent.setup();
    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: { id: "user-1", username: "AdminUser", role: "Admin" },
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      return Promise.resolve({
        data: [mockArchivedVersion1, mockArchivedVersion2],
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: new AxiosHeaders() },
      } as AxiosResponse);
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Preserved-Tropospheric-V1")).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId("archived-search-input");

    // Search by halogen
    await user.type(searchInput, "halogen");
    expect(screen.queryByText("Preserved-Tropospheric-V1")).not.toBeInTheDocument();
    expect(screen.getByText("Preserved-Halogen-V1")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 2 archived versions")).toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByTestId("clear-search-icon-button");
    await user.click(clearBtn);

    expect(screen.getByText("Preserved-Tropospheric-V1")).toBeInTheDocument();
    expect(screen.getByText("Preserved-Halogen-V1")).toBeInTheDocument();

    // Search for non-existent term
    await user.type(searchInput, "nonexistent-xyz");
    expect(screen.getByText("No matching archived versions")).toBeInTheDocument();
    expect(screen.getByText(/No archived versions match/)).toBeInTheDocument();
  });

  it("displays empty state when no archived versions exist", async () => {
    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: { id: "user-1", username: "AdminUser", role: "Admin" },
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      return Promise.resolve({
        data: [],
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: new AxiosHeaders() },
      } as AxiosResponse);
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("No archived versions found")).toBeInTheDocument();
      expect(screen.getByText("No verified mechanism versions have been archived yet.")).toBeInTheDocument();
    });
  });

  it("displays error alert when fetch fails", async () => {
    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: { id: "user-1", username: "AdminUser", role: "Admin" },
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      return Promise.reject(new Error("Network Error"));
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Failed to load archived versions. Please try again.")).toBeInTheDocument();
    });
  });

  it("navigates back to browse when Back to Browse is clicked", async () => {
    vi.spyOn(axios, "get").mockResolvedValue({
      data: [],
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: new AxiosHeaders() },
    } as AxiosResponse);

    renderComponent();

    const backButton = screen.getByText("Back to Browse");
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByText("Browse Page")).toBeInTheDocument();
    });
  });

  it("navigates to editor when View is clicked", async () => {
    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: { id: "user-1", username: "AdminUser", role: "Admin" },
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      return Promise.resolve({
        data: [mockArchivedVersion1],
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: new AxiosHeaders() },
      } as AxiosResponse);
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Preserved-Tropospheric-V1")).toBeInTheDocument();
    });

    const viewButton = screen.getByTestId("view-archived-mech-archived-1");
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByText("Editor Page")).toBeInTheDocument();
    });
  });
});
