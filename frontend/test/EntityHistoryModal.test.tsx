import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EntityHistoryModal } from "../src/components/modals/EntityHistoryModal";
import { ChangeSet } from "../src/types/chemistryModels";
import * as GetMethods from "../src/API/API_GetMethods";
import { UUID } from "crypto";

vi.mock("../src/API/API_GetMethods");

describe("EntityHistoryModal", () => {
  const familyId = "00000000-0000-0000-0000-000000000001" as UUID;
  const targetId = "00000000-0000-0000-0000-000000000002" as UUID;

  const mockChangeSets: ChangeSet[] = [
    {
      id: "cs-1",
      familyId,
      userId: "u-1" as UUID,
      timestamp: "2026-11-10T14:00:00Z",
      note: "Added new species",
      user: {
        id: "u-1" as UUID,
        username: "carol",
        role: "none",
      },
      entries: [
        {
          id: "e-1",
          changeSetId: "cs-1",
          targetType: "Species",
          targetId,
          targetName: "NO2",
          action: "Added",
          before: null,
          after: JSON.stringify({ name: "NO2", description: "Nitrogen Dioxide" }),
        },
      ],
    },
    {
      id: "cs-2",
      familyId,
      userId: "u-2" as UUID,
      timestamp: "2026-11-10T15:00:00Z",
      note: "Updated description",
      user: {
        id: "u-2" as UUID,
        username: "dave",
        role: "admin",
      },
      entries: [
        {
          id: "e-2",
          changeSetId: "cs-2",
          targetType: "Species",
          targetId,
          targetName: "NO2",
          action: "Updated",
          before: JSON.stringify({ description: "Nitrogen Dioxide" }),
          after: JSON.stringify({ description: "Nitrogen dioxide gas" }),
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches history with targetType and targetId and renders entries", async () => {
    vi.mocked(GetMethods.getFamilyHistory).mockResolvedValue(mockChangeSets);
    const onClose = vi.fn();

    render(
      <EntityHistoryModal
        open={true}
        onClose={onClose}
        familyId={familyId}
        targetType="Species"
        targetId={targetId}
        targetName="NO2"
      />,
    );

    expect(GetMethods.getFamilyHistory).toHaveBeenCalledWith(
      familyId,
      "Species",
      targetId,
    );

    await waitFor(() => {
      expect(screen.getByText(/History: Species "NO2"/)).toBeInTheDocument();
      expect(screen.getByText(/Added new species/)).toBeInTheDocument();
      expect(screen.getByText(/Updated description/)).toBeInTheDocument();
      expect(screen.getByText("carol")).toBeInTheDocument();
      expect(screen.getByText("dave")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it("displays empty state when no changes found for the entity", async () => {
    vi.mocked(GetMethods.getFamilyHistory).mockResolvedValue([]);
    const onClose = vi.fn();

    render(
      <EntityHistoryModal
        open={true}
        onClose={onClose}
        familyId={familyId}
        targetType="Species"
        targetId={targetId}
        targetName="NO2"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No changes recorded for this species yet\./i),
      ).toBeInTheDocument();
    });
  });

  it("displays error message when getFamilyHistory fails", async () => {
    vi.mocked(GetMethods.getFamilyHistory).mockRejectedValue(new Error("Forbidden"));
    const onClose = vi.fn();

    render(
      <EntityHistoryModal
        open={true}
        onClose={onClose}
        familyId={familyId}
        targetType="Species"
        targetId={targetId}
        targetName="NO2"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to load change history\./i),
      ).toBeInTheDocument();
    });
  });
});
