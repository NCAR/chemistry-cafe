import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FamilyBrowser from "../src/components/FamilyBrowser";
import { useAuth } from "../src/components/AuthContext";
import { APIFamily } from "../src/API/API_Interfaces";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";

vi.mock("../src/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockFamily: APIFamily = {
  id: "fam-1" as any,
  name: "Shared Family",
  description: "A shared family",
  isPublic: false,
  owner: {
    id: "owner-1" as any,
    username: "OwnerUser",
    role: "None",
  },
  contributorIds: ["contributor-1" as any],
  species: [],
  reactions: [],
  phases: [],
  mechanisms: [],
};

describe("FamilyBrowser Component", () => {
  it("Shows Contributor chip and Edit Family button for contributor", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "contributor-1", role: "None" },
    });

    render(
      <CustomThemeProvider>
        <FamilyBrowser
          families={[mockFamily]}
          handleEditButtonClick={vi.fn()}
          handleCloneButtonClick={vi.fn()}
        />
      </CustomThemeProvider>,
    );

    expect(screen.getByText("Shared Family")).toBeTruthy();
    expect(screen.getByText("Contributor")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Edit Family/i })).toBeTruthy();
  });

  it("Does not show Edit Family button for non-contributor non-owner", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "stranger-1", role: "None" },
    });

    render(
      <CustomThemeProvider>
        <FamilyBrowser
          families={[mockFamily]}
          handleEditButtonClick={vi.fn()}
          handleCloneButtonClick={vi.fn()}
        />
      </CustomThemeProvider>,
    );

    expect(screen.getByText("Shared Family")).toBeTruthy();
    expect(screen.queryByText("Contributor")).toBeFalsy();
    expect(screen.queryByRole("button", { name: /Edit Family/i })).toBeFalsy();
    expect(screen.getByRole("button", { name: /Clone Family/i })).toBeTruthy();
  });

  it("Shows Edit Family button without Contributor chip for owner", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "owner-1", role: "None" },
    });

    render(
      <CustomThemeProvider>
        <FamilyBrowser
          families={[mockFamily]}
          handleEditButtonClick={vi.fn()}
          handleCloneButtonClick={vi.fn()}
        />
      </CustomThemeProvider>,
    );

    expect(screen.getByText("Shared Family")).toBeTruthy();
    expect(screen.queryByText("Contributor")).toBeFalsy();
    expect(screen.getByRole("button", { name: /Edit Family/i })).toBeTruthy();
  });
});

