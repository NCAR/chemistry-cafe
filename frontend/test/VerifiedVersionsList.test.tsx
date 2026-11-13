import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VerifiedVersionsList } from "../src/components/familyEditor/VerifiedVersionsList";
import { Family, Mechanism, VerifiedMechanismVersion } from "../src/types/chemistryModels";
import { AuthContext } from "../src/components/AuthContext";
import * as CreateMethods from "../src/API/API_CreateMethods";
import * as DeleteMethods from "../src/API/API_DeleteMethods";
import * as GetMethods from "../src/API/API_GetMethods";
import { UUID } from "crypto";

vi.mock("../src/API/API_CreateMethods");
vi.mock("../src/API/API_DeleteMethods");
vi.mock("../src/API/API_GetMethods");

describe("VerifiedVersionsList", () => {
  const familyId = "00000000-0000-0000-0000-000000000001" as UUID;
  const mechanismId = "00000000-0000-0000-0000-000000000002" as UUID;
  const versionId = "00000000-0000-0000-0000-000000000003" as UUID;
  const familyVersionId = "00000000-0000-0000-0000-000000000004" as UUID;

  const mockMechanism: Mechanism = {
    id: mechanismId,
    familyId,
    name: "Tropospheric Ozone",
    description: "Standard cycle",
    speciesIds: [],
    reactionIds: [],
    phaseIds: [],
  };

  const mockVerifiedVersion: VerifiedMechanismVersion = {
    id: versionId,
    familyId,
    familyVersionId,
    sourceMechanismId: mechanismId,
    mechanismId,
    name: "Atmospheric-Tropospheric-2026-08-01",
    notes: "Peer reviewed by atmospheric scientists",
    verifiedDate: "2026-08-01T12:00:00Z",
    verifierId: "00000000-0000-0000-0000-000000000005" as UUID,
    verifierUsername: "b.okafor",
    isDeprecated: false,
    isArchived: false,
  };

  const mockFamily: Family = {
    id: familyId,
    name: "Atmospheric Chemistry",
    description: "Test family",
    isPublic: true,
    owner: { id: "00000000-0000-0000-0000-000000000010" as UUID, username: "owner", role: "none" },
    mechanisms: [mockMechanism],
    species: [],
    reactions: [],
    phases: [],
    verifiedVersions: [mockVerifiedVersion],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithAuth = (ui: React.ReactElement, role: string = "none") => {
    return render(
      <AuthContext.Provider
        value={{
          user: {
            id: "00000000-0000-0000-0000-000000000099" as UUID,
            username: "currentUser",
            role,
          },
          setUser: vi.fn(),
        }}
      >
        {ui}
      </AuthContext.Provider>,
    );
  };

  it("renders the verified versions list matching wireframe (date, badge, verifier, buttons)", () => {
    renderWithAuth(
      <VerifiedVersionsList
        family={mockFamily}
        mechanism={mockMechanism}
      />,
      "none",
    );

    expect(screen.getByText("Verified versions (1)")).toBeInTheDocument();
    expect(screen.getByText("2026-08-01")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("b.okafor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start from this version" })).toBeInTheDocument();
    expect(screen.getByText("Peer reviewed by atmospheric scientists")).toBeInTheDocument();

    // Regular users cannot see management buttons
    expect(screen.queryByText(/Verify this mechanism/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Deprecate/i)).not.toBeInTheDocument();
  });

  it("displays Deprecated badge when a version is deprecated", () => {
    const deprecatedVersion: VerifiedMechanismVersion = {
      ...mockVerifiedVersion,
      isDeprecated: true,
      deprecationReason: "Superseded by V2",
    };
    const familyWithDep: Family = {
      ...mockFamily,
      verifiedVersions: [deprecatedVersion],
    };

    renderWithAuth(
      <VerifiedVersionsList
        family={familyWithDep}
        mechanism={mockMechanism}
      />,
      "none",
    );

    expect(screen.getByText("Deprecated")).toBeInTheDocument();
  });

  it("calls onViewVersion callback when View is clicked", () => {
    const onViewMock = vi.fn();
    renderWithAuth(
      <VerifiedVersionsList
        family={mockFamily}
        mechanism={mockMechanism}
        onViewVersion={onViewMock}
      />,
      "none",
    );

    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(onViewMock).toHaveBeenCalledWith(mockVerifiedVersion);
  });

  it("calls onStartFromVersion callback when Start from this version is clicked", () => {
    const onStartMock = vi.fn();
    renderWithAuth(
      <VerifiedVersionsList
        family={mockFamily}
        mechanism={mockMechanism}
        onStartFromVersion={onStartMock}
      />,
      "none",
    );

    fireEvent.click(screen.getByRole("button", { name: "Start from this version" }));
    expect(onStartMock).toHaveBeenCalledWith(mockVerifiedVersion);
  });

  it("allows Verifiers to verify a mechanism", async () => {
    const onUpdateMock = vi.fn();
    const createdVersion: VerifiedMechanismVersion = {
      ...mockVerifiedVersion,
      id: "00000000-0000-0000-0000-000000000099" as UUID,
      name: "New-Verified-V2",
    };
    vi.mocked(CreateMethods.verifyMechanism).mockResolvedValue(createdVersion as any);

    renderWithAuth(
      <VerifiedVersionsList
        family={mockFamily}
        mechanism={mockMechanism}
        onUpdateFamily={onUpdateMock}
      />,
      "Verifier",
    );

    // Verifier sees the verify button
    const verifyBtn = screen.getByRole("button", { name: /Verify this mechanism/i });
    expect(verifyBtn).toBeInTheDocument();

    fireEvent.click(verifyBtn);

    // Modal opens
    expect(screen.getByText("Verify Chemical Mechanism")).toBeInTheDocument();

    // Click Verify in modal
    const submitBtn = screen.getByRole("button", { name: "Verify" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(CreateMethods.verifyMechanism).toHaveBeenCalled();
      expect(onUpdateMock).toHaveBeenCalled();
    });
  });

  it("allows Admins to deprecate a verified version", async () => {
    const onUpdateMock = vi.fn();
    vi.mocked(CreateMethods.deprecateMechanism).mockResolvedValue({
      ...mockVerifiedVersion,
      isDeprecated: true,
      deprecationReason: "Updated rate coefficients",
    } as any);

    renderWithAuth(
      <VerifiedVersionsList
        family={mockFamily}
        mechanism={mockMechanism}
        onUpdateFamily={onUpdateMock}
      />,
      "Admin",
    );

    const deprecateBtn = screen.getByRole("button", { name: /Deprecate this version/i });
    fireEvent.click(deprecateBtn);

    // Modal opens
    expect(screen.getByText("Deprecate Verified Mechanism")).toBeInTheDocument();

    // Type reason
    const reasonInput = screen.getByLabelText(/Deprecation Reason/i);
    fireEvent.change(reasonInput, { target: { value: "Updated rate coefficients" } });

    const submitBtn = screen.getByRole("button", { name: "Deprecate" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(CreateMethods.deprecateMechanism).toHaveBeenCalled();
      expect(onUpdateMock).toHaveBeenCalled();
    });
  });

  it("disables Verify this mechanism when family has unsaved changes", () => {
    renderWithAuth(
      <VerifiedVersionsList
        family={{ ...mockFamily, isModified: true }}
        mechanism={mockMechanism}
      />,
      "Verifier",
    );

    const verifyBtn = screen.getByRole("button", { name: /Verify this mechanism/i });
    expect(verifyBtn).toBeDisabled();
  });

  it("disables unarchive button when version is in an archived family", () => {
    const archivedVersion: VerifiedMechanismVersion = {
      ...mockVerifiedVersion,
      isArchived: true,
    };

    renderWithAuth(
      <VerifiedVersionsList
        family={{
          ...mockFamily,
          isArchived: true,
          verifiedVersions: [archivedVersion],
        }}
        mechanism={mockMechanism}
      />,
      "Admin",
    );

    const unarchiveBtn = screen.getByRole("button", {
      name: /Cannot unarchive a version in an archived family/i,
    });
    expect(unarchiveBtn).toBeDisabled();
  });
});
