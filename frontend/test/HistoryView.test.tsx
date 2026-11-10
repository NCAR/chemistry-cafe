import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HistoryView } from "../src/components/familyEditor/HistoryView";
import { ChangeSet, Family } from "../src/types/chemistryModels";
import * as GetMethods from "../src/API/API_GetMethods";
import { UUID } from "crypto";

vi.mock("../src/API/API_GetMethods");

describe("HistoryView", () => {
  const familyId = "00000000-0000-0000-0000-000000000001" as UUID;
  const mockFamily: Family = {
    id: familyId,
    name: "Test Family",
    description: "Test description",
    isPublic: true,
    owner: { id: "00000000-0000-0000-0000-000000000010" as UUID, username: "owner", role: "none" },
    mechanisms: [],
    species: [],
    reactions: [],
    phases: [],
  };

  const mockChangeSets: ChangeSet[] = [
    {
      id: "cs-1",
      familyId,
      userId: "u-1" as UUID,
      timestamp: "2026-11-10T12:00:00Z",
      note: "Initial mechanism setup",
      user: {
        id: "u-1" as UUID,
        username: "alice",
        role: "none",
      },
      entries: [
        {
          id: "e-1",
          changeSetId: "cs-1",
          targetType: "Species",
          targetId: "sp-1" as UUID,
          targetName: "O3",
          action: "Added",
          before: null,
          after: JSON.stringify({ name: "O3", description: "Ozone" }),
        },
        {
          id: "e-2",
          changeSetId: "cs-1",
          targetType: "Reaction",
          targetId: "rx-1" as UUID,
          targetName: "O3 -> O2 + O",
          action: "Added",
          before: null,
          after: JSON.stringify({ name: "O3 -> O2 + O", type: "PHOTOLYSIS" }),
        },
      ],
    },
    {
      id: "cs-2",
      familyId,
      userId: "u-2" as UUID,
      timestamp: "2026-11-10T13:00:00Z",
      note: "Updated family properties",
      user: {
        id: "u-2" as UUID,
        username: "bob",
        role: "admin",
      },
      entries: [
        {
          id: "e-3",
          changeSetId: "cs-2",
          targetType: "Family",
          targetId: familyId,
          targetName: "Test Family",
          action: "Updated",
          before: JSON.stringify({ name: "Old Family Name" }),
          after: JSON.stringify({ name: "Test Family" }),
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and displays change sets with user, note, and entries", async () => {
    vi.mocked(GetMethods.getFamilyHistory).mockResolvedValue(mockChangeSets);

    render(<HistoryView family={mockFamily} />);

    expect(screen.getByText("Audit History")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Initial mechanism setup/)).toBeInTheDocument();
      expect(screen.getByText(/Updated family properties/)).toBeInTheDocument();
      expect(screen.getByText("alice")).toBeInTheDocument();
      expect(screen.getByText("bob")).toBeInTheDocument();
    });

    expect(screen.getByText("O3")).toBeInTheDocument();
    expect(screen.getByText("O3 -> O2 + O")).toBeInTheDocument();
    expect(screen.getByText("+2 Added")).toBeInTheDocument();
  });

  it("renders empty state when there are no change sets", async () => {
    vi.mocked(GetMethods.getFamilyHistory).mockResolvedValue([]);

    render(<HistoryView family={mockFamily} />);

    await waitFor(() => {
      expect(
        screen.getByText(/No change sets recorded yet/),
      ).toBeInTheDocument();
    });
  });

  it("displays error message when getFamilyHistory fails", async () => {
    vi.mocked(GetMethods.getFamilyHistory).mockRejectedValue(new Error("Network error"));

    render(<HistoryView family={mockFamily} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Unable to load history. Ensure you have owner or contributor access./),
      ).toBeInTheDocument();
    });
  });

  it("filters entries by search query", async () => {
    vi.mocked(GetMethods.getFamilyHistory).mockResolvedValue(mockChangeSets);

    render(<HistoryView family={mockFamily} />);

    await waitFor(() => {
      expect(screen.getByText("O3")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/e.g. O3, rate constant/i);
    fireEvent.change(searchInput, { target: { value: "reaction" } });

    await waitFor(() => {
      expect(screen.getByText("O3 -> O2 + O")).toBeInTheDocument();
      expect(screen.queryByText("O3")).not.toBeInTheDocument();
    });
  });

  it("refreshes change history when refresh button is clicked", async () => {
    vi.mocked(GetMethods.getFamilyHistory).mockResolvedValue(mockChangeSets);

    render(<HistoryView family={mockFamily} />);

    await waitFor(() => {
      expect(screen.getByText("O3")).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(GetMethods.getFamilyHistory).toHaveBeenCalledTimes(2);
  });

  it("displays mechanism structural changes showing added and removed items instead of GUIDs", async () => {
    const mechanismChangeSets: ChangeSet[] = [
      {
        id: "cs-mech",
        familyId,
        userId: "u-1" as UUID,
        timestamp: "2026-11-10T12:00:00Z",
        user: { id: "u-1" as UUID, username: "alice", role: "none" },
        entries: [
          {
            id: "e-m1",
            changeSetId: "cs-mech",
            targetType: "Mechanism",
            targetId: "m-1" as UUID,
            targetName: "Tropospheric Cycle",
            action: "Updated",
            before: JSON.stringify({
              id: "m-1",
              name: "Tropospheric Cycle",
              reactionIds: ["rx-old"],
              speciesIds: [],
              phaseIds: ["ph-1"],
            }),
            after: JSON.stringify({
              id: "m-1",
              name: "Tropospheric Cycle",
              reactionIds: ["rx-new"],
              speciesIds: ["sp-1"],
              phaseIds: ["ph-1"],
            }),
          },
        ],
      },
    ];

    vi.mocked(GetMethods.getFamilyHistory).mockResolvedValue(mechanismChangeSets);

    const familyWithItems: Family = {
      ...mockFamily,
      species: [
        { id: "sp-1" as UUID, name: "O3", description: "" },
        { id: "sp-2" as UUID, name: "O2", description: "" },
      ],
      reactions: [
        {
          id: "rx-new" as UUID,
          name: "New Photolysis",
          type: "PHOTOLYSIS",
          reactants: [{ speciesId: "sp-1" as UUID, coefficient: 1 }],
          products: [{ speciesId: "sp-2" as UUID, coefficient: 1 }],
          attributes: {},
        } as any,
        {
          id: "rx-old" as UUID,
          name: "Old Photolysis",
          type: "PHOTOLYSIS",
          reactants: [{ speciesId: "sp-2" as UUID, coefficient: 1 }],
          products: [],
          attributes: {},
        } as any,
      ],
      phases: [{ id: "ph-1" as UUID, name: "Gas Phase", description: "", speciesIds: [] }],
    };

    render(<HistoryView family={familyWithItems} />);

    await waitFor(() => {
      expect(screen.getByText("Tropospheric Cycle")).toBeInTheDocument();
      expect(screen.getByText("Reactions Added:")).toBeInTheDocument();
      expect(screen.getByText("+ New Photolysis")).toBeInTheDocument();
      expect(screen.getByText("Reactions Removed:")).toBeInTheDocument();
      expect(screen.getByText("- Old Photolysis")).toBeInTheDocument();
      expect(screen.getByText("Species Added:")).toBeInTheDocument();
      expect(screen.getByText("+ O3")).toBeInTheDocument();
    });

    // Equation arrow should be rendered for New Photolysis
    expect(screen.getAllByText(/→/).length).toBeGreaterThan(0);

    // Should NOT show raw GUIDs in the document text
    expect(screen.queryByText(/rx-new/)).not.toBeInTheDocument();
    expect(screen.queryByText(/rx-old/)).not.toBeInTheDocument();
  });
});

