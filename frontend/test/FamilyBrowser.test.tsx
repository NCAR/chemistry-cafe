import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import FamilyBrowser from "../src/components/FamilyBrowser";
import { useAuth } from "../src/components/AuthContext";
import { Family } from "../types/chemistryModels";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";

vi.mock("../src/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockFamily: Family = {
  id: "fam-1" as any,
  name: "Shared Family",
  description: "A shared family description",
  isPublic: false,
  owner: {
    id: "owner-1" as any,
    username: "OwnerUser",
    role: "None",
  },
  contributorIds: ["contributor-1" as any],
  species: [
    {
      id: "spec-1" as any,
      name: "NO2",
      description: null,
    },
  ],
  reactions: [
    {
      id: "rxn-1" as any,
      name: "NO2 photolysis",
      type: "PHOTOLYSIS",
      description: "NO2 + hv -> NO + O",
      reactants: [],
      products: [],
      attributes: {},
    },
  ],
  phases: [],
  mechanisms: [
    {
      id: "mech-1" as any,
      name: "Tropospheric Mechanism",
      description: "Standard tropospheric chemistry",
      familyId: "fam-1" as any,
      speciesIds: ["spec-1" as any],
      reactionIds: ["rxn-1" as any],
      phaseIds: [],
      verified: true,
      verifiedDate: "2026-11-04T12:00:00Z",
      otherProperties: {},
    },
  ],
  isInDatabase: true,
};

describe("FamilyBrowser Component", () => {
  it("Shows Contributor chip and Open button for contributor", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "contributor-1", role: "None" },
    });

    render(
      <CustomThemeProvider>
        <FamilyBrowser
          families={[mockFamily]}
          onOpenFamily={vi.fn()}
          onCloneFamily={vi.fn()}
        />
      </CustomThemeProvider>,
    );

    expect(screen.getByText("Shared Family")).toBeTruthy();
    expect(screen.getByText("Contributor")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Open Shared Family/i }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Edit a copy/i })).toBeFalsy();
  });

  it("Shows View and Edit a copy buttons for non-contributor non-owner, and View opens family", () => {
    const onOpen = vi.fn();
    const onClone = vi.fn();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "stranger-1", role: "None" },
    });

    render(
      <CustomThemeProvider>
        <FamilyBrowser
          families={[mockFamily]}
          onOpenFamily={onOpen}
          onCloneFamily={onClone}
        />
      </CustomThemeProvider>,
    );

    expect(screen.getByText("Shared Family")).toBeTruthy();
    expect(screen.queryByText("Contributor")).toBeFalsy();
    expect(
      screen.queryByRole("button", { name: /Open Shared Family/i }),
    ).toBeFalsy();

    const viewButton = screen.getByRole("button", {
      name: /View Shared Family/i,
    });
    expect(viewButton).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Edit a copy of Shared Family/i }),
    ).toBeTruthy();

    fireEvent.click(viewButton);
    expect(onOpen).toHaveBeenCalledWith(mockFamily);
  });

  it("Renders View and Edit a copy for mechanisms when viewing a non-owned family", () => {
    const onEditMechanism = vi.fn();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "stranger-1", role: "None" },
    });

    render(
      <CustomThemeProvider>
        <FamilyBrowser
          families={[mockFamily]}
          onEditMechanism={onEditMechanism}
        />
      </CustomThemeProvider>,
    );

    // Expand family
    const card = screen.getByRole("button", {
      name: /Open family Shared Family/i,
    });
    fireEvent.click(card);

    const viewMechButton = screen.getByRole("button", {
      name: /View Tropospheric Mechanism/i,
    });
    expect(viewMechButton).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: /Edit a copy of Tropospheric Mechanism/i,
      }),
    ).toBeTruthy();

    fireEvent.click(viewMechButton);
    expect(onEditMechanism).toHaveBeenCalledWith(
      mockFamily,
      mockFamily.mechanisms[0],
    );
  });

  it("Shows Open button without Contributor chip for owner", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "owner-1", role: "None" },
    });

    render(
      <CustomThemeProvider>
        <FamilyBrowser
          families={[mockFamily]}
          onOpenFamily={vi.fn()}
          onCloneFamily={vi.fn()}
        />
      </CustomThemeProvider>,
    );

    expect(screen.getByText("Shared Family")).toBeTruthy();
    expect(screen.queryByText("Contributor")).toBeFalsy();
    expect(
      screen.getByRole("button", { name: /Open Shared Family/i }),
    ).toBeTruthy();
  });

  it("Toggles family expansion and renders mechanism row with verified date, Download, and Edit", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "owner-1", role: "None" },
    });

    render(
      <CustomThemeProvider>
        <FamilyBrowser
          families={[mockFamily]}
          onOpenFamily={vi.fn()}
          onCloneFamily={vi.fn()}
        />
      </CustomThemeProvider>,
    );

    // Click on row to open
    const card = screen.getByRole("button", {
      name: /Open family Shared Family/i,
    });
    fireEvent.click(card);

    // Verify mechanism row details
    expect(screen.getByText("Tropospheric Mechanism")).toBeTruthy();
    expect(screen.getByText("1 reaction")).toBeTruthy();
    expect(screen.getByText(/Verified Nov 4, 2026/i)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Download Mechanism Configuration/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Edit Tropospheric Mechanism/i }),
    ).toBeTruthy();
  });
});
