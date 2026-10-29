import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContributorsView } from "../src/components/familyEditor/ContributorsView";
import { useAuth } from "../src/components/AuthContext";
import { getFamilyContributors } from "../src/API/API_GetMethods";
import { addFamilyContributor } from "../src/API/API_CreateMethods";
import { deleteFamilyContributor } from "../src/API/API_DeleteMethods";
import { Family } from "../src/types/chemistryModels";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";

vi.mock("../src/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../src/API/API_GetMethods", () => ({
  getFamilyContributors: vi.fn(),
}));

vi.mock("../src/API/API_CreateMethods", () => ({
  addFamilyContributor: vi.fn(),
}));

vi.mock("../src/API/API_DeleteMethods", () => ({
  deleteFamilyContributor: vi.fn(),
}));

const mockOwner = {
  id: "owner-1" as any,
  username: "OwnerUser",
  email: "owner@example.com",
  role: "None",
};

const mockDatabaseFamily: Family = {
  id: "fam-1" as any,
  name: "DB Family",
  description: "Test family in DB",
  isPublic: false,
  owner: mockOwner,
  isInDatabase: true,
  species: [],
  reactions: [],
  phases: [],
  mechanisms: [],
  contributorIds: [],
};

const mockLocalFamily: Family = {
  ...mockDatabaseFamily,
  isInDatabase: false,
};

describe("ContributorsView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Shows notice when family is only saved in browser", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockOwner,
    });

    render(
      <CustomThemeProvider>
        <ContributorsView family={mockLocalFamily} />
      </CustomThemeProvider>,
    );

    expect(
      screen.getByText(/This family is only saved in your browser/i),
    ).toBeTruthy();
  });

  it("Allows others (non-owners) to see contributors and owner without edit/add/remove controls", async () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "other-user" as any, role: "None" },
    });
    (getFamilyContributors as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        userId: "u-1" as any,
        familyId: "fam-1" as any,
        role: "Editor",
        email: "colleague@example.com",
        username: "ColleagueUser",
      },
    ]);

    render(
      <CustomThemeProvider>
        <ContributorsView family={mockDatabaseFamily} />
      </CustomThemeProvider>,
    );

    await waitFor(() => {
      // Owner is visible in the table
      expect(screen.getByTestId("contributor-row-owner")).toBeTruthy();
      expect(screen.getByText("OwnerUser")).toBeTruthy();
      expect(screen.getByText("owner@example.com")).toBeTruthy();
      expect(screen.getByText("Owner")).toBeTruthy();

      // Contributor is visible in the table
      expect(screen.getByTestId("contributor-row-u-1")).toBeTruthy();
      expect(screen.getByText("ColleagueUser")).toBeTruthy();
      expect(screen.getByText("colleague@example.com")).toBeTruthy();
      expect(screen.getByTestId("role-badge-u-1")).toBeTruthy();
    });

    // Add contributor form is not present
    expect(screen.queryByTestId("add-contributor-button")).toBeNull();
    expect(screen.queryByTestId("contributor-email-input")).toBeNull();

    // Role select dropdown and remove button are not present
    expect(screen.queryByTestId("role-select-u-1")).toBeNull();
    expect(screen.queryByTestId("remove-contributor-u-1")).toBeNull();
  });

  it("Renders contributor list and empty state for owner", async () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockOwner,
    });
    (getFamilyContributors as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    render(
      <CustomThemeProvider>
        <ContributorsView family={mockDatabaseFamily} />
      </CustomThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/No contributors yet/i)).toBeTruthy();
    });

    expect(screen.getByTestId("contributor-email-input")).toBeTruthy();
    expect(screen.getByTestId("add-contributor-button")).toBeTruthy();
  });

  it("Loads and renders existing contributors", async () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockOwner,
    });
    (getFamilyContributors as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        userId: "u-1" as any,
        familyId: "fam-1" as any,
        role: "Editor",
        email: "colleague@example.com",
        username: "ColleagueUser",
      },
    ]);

    render(
      <CustomThemeProvider>
        <ContributorsView family={mockDatabaseFamily} />
      </CustomThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("contributor-row-owner")).toBeTruthy();
      expect(screen.getByText("colleague@example.com")).toBeTruthy();
      expect(screen.getByText("ColleagueUser")).toBeTruthy();
    });
  });

  it("Allows owner to add contributor by email", async () => {
    const user = userEvent.setup();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockOwner,
    });
    (getFamilyContributors as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (addFamilyContributor as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "u-2" as any,
      familyId: "fam-1" as any,
      role: "Editor",
      email: "newuser@example.com",
      username: "NewUser",
    });

    const updateFamilyMock = vi.fn();

    render(
      <CustomThemeProvider>
        <ContributorsView
          family={mockDatabaseFamily}
          updateFamily={updateFamilyMock}
        />
      </CustomThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/No contributors yet/i)).toBeTruthy();
    });

    const emailInput = screen.getByTestId("contributor-email-input");
    await user.type(emailInput, "newuser@example.com");

    const addButton = screen.getByTestId("add-contributor-button");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(addFamilyContributor).toHaveBeenCalledWith("fam-1", {
        email: "newuser@example.com",
        role: "Editor",
      });
      expect(screen.getByText("newuser@example.com")).toBeTruthy();
    });

    expect(updateFamilyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        contributorIds: ["u-2"],
      }),
    );
  });

  it("Shows error when adding non-existent user", async () => {
    const user = userEvent.setup();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockOwner,
    });
    (getFamilyContributors as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (addFamilyContributor as unknown as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { status: 404 },
    });

    render(
      <CustomThemeProvider>
        <ContributorsView family={mockDatabaseFamily} />
      </CustomThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/No contributors yet/i)).toBeTruthy();
    });

    const emailInput = screen.getByTestId("contributor-email-input");
    await user.type(emailInput, "notfound@example.com");

    const addButton = screen.getByTestId("add-contributor-button");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Contributor must have logged in at least once/i),
      ).toBeTruthy();
    });
  });

  it("Prevents owner from adding self as contributor", async () => {
    const user = userEvent.setup();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockOwner,
    });
    (getFamilyContributors as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    render(
      <CustomThemeProvider>
        <ContributorsView family={mockDatabaseFamily} />
      </CustomThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/No contributors yet/i)).toBeTruthy();
    });

    const emailInput = screen.getByTestId("contributor-email-input");
    await user.type(emailInput, "owner@example.com");

    const addButton = screen.getByTestId("add-contributor-button");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(
        screen.getByText(/The owner cannot be added as a contributor/i),
      ).toBeTruthy();
    });
    expect(addFamilyContributor).not.toHaveBeenCalled();
  });

  it("Allows owner to remove a contributor", async () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockOwner,
    });
    (getFamilyContributors as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        userId: "u-1" as any,
        familyId: "fam-1" as any,
        role: "Viewer",
        email: "removeme@example.com",
        username: "RemoveUser",
      },
    ]);
    (deleteFamilyContributor as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const updateFamilyMock = vi.fn();

    render(
      <CustomThemeProvider>
        <ContributorsView
          family={{ ...mockDatabaseFamily, contributorIds: ["u-1" as any] }}
          updateFamily={updateFamilyMock}
        />
      </CustomThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("removeme@example.com")).toBeTruthy();
    });

    const removeButton = screen.getByTestId("remove-contributor-u-1");
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(deleteFamilyContributor).toHaveBeenCalledWith("fam-1", "u-1");
      expect(screen.queryByText("removeme@example.com")).toBeFalsy();
    });

    expect(updateFamilyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        contributorIds: [],
      }),
    );
  });
});

