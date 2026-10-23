import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";
import { MechanismBrowser } from "../src/components/MechanismBrowser";
import { MechanismEditor } from "../src/components/MechanismEditor";
import FamilyBrowser from "../src/components/FamilyBrowser";
import { Family, Mechanism } from "../src/types/chemistryModels";
import { useAuth } from "../src/components/AuthContext";
import { cloneFamily } from "../src/helpers/localFamilies";

vi.mock("../src/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../src/API/API_GetMethods", () => ({
  getFamilyVersion: vi.fn(),
}));

const mockFamily: Family = {
  id: "family-1",
  name: "Test Family",
  description: "Test Desc",
  owner: null,
  species: [
    {
      id: "species-1",
      name: "A",
      description: null,
      familyId: "family-1",
      attributes: {},
    },
  ],
  reactions: [],
  phases: [],
  mechanisms: [
    {
      id: "mech-1",
      name: "Mechanism 1",
      description: "Mech Desc",
      familyId: "family-1",
      speciesIds: ["species-1"],
      reactionIds: [],
      phaseIds: [],
      validationStatus: "No Validation Requested",
      isReadOnly: false,
    },
  ],
};

describe("Mechanism Validation UI", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not render validation status dropdown in MechanismBrowser", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-1", username: "verifier", role: "Verifier" },
    });
    const updateMechanism = vi.fn();

    render(
      <CustomThemeProvider>
        <MechanismBrowser
          family={mockFamily}
          updateMechanism={updateMechanism}
        />
      </CustomThemeProvider>,
    );

    expect(screen.queryByText("No Validation Requested")).toBeNull();
    expect(screen.queryByTestId("mechanism-status-dropdown")).toBeNull();
  });

  it("renders chip for Pending Validation and Validated, but not No Validation Requested", () => {
    const familyWithStatuses: Family = {
      ...mockFamily,
      mechanisms: [
        {
          ...mockFamily.mechanisms[0],
          id: "m-none" as any,
          name: "Mech None",
          validationStatus: "No Validation Requested",
        },
        {
          ...mockFamily.mechanisms[0],
          id: "m-pending" as any,
          name: "Mech Pending",
          validationStatus: "Pending Validation",
        },
        {
          ...mockFamily.mechanisms[0],
          id: "m-validated" as any,
          name: "Mech Validated",
          validationStatus: "Validated",
        },
      ],
    };

    render(
      <CustomThemeProvider>
        <MechanismBrowser family={familyWithStatuses} />
      </CustomThemeProvider>,
    );

    expect(screen.queryByText("No Validation Requested")).toBeNull();
    expect(screen.getByText("Pending Validation")).toBeTruthy();
    expect(screen.getByText("Validated")).toBeTruthy();
  });

  it("grays out validation buttons when the family is not published", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-reg", username: "reg", role: "None" },
    });

    const unpublishedFamily: Family = {
      ...mockFamily,
      isInDatabase: false,
    };

    render(
      <CustomThemeProvider>
        <MechanismEditor
          family={unpublishedFamily}
          mechanism={unpublishedFamily.mechanisms[0]}
          updateMechanism={vi.fn()}
          navigateBack={vi.fn()}
        />
      </CustomThemeProvider>,
    );

    const reqButton = screen.getByRole("button", { name: "Request Validation" }) as HTMLButtonElement;
    expect(reqButton.disabled).toBe(true);
  });

  it("renders 'Request Validation' button for regular users in MechanismEditor and handles confirmation and auto-save", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-reg", username: "reg", role: "None" },
    });
    const updateMechanism = vi.fn();
    const onSaveMechanism = vi.fn().mockResolvedValue(undefined);
    const navigateBack = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    const publishedFamily: Family = {
      ...mockFamily,
      isInDatabase: true,
    };

    render(
      <CustomThemeProvider>
        <MechanismEditor
          family={publishedFamily}
          mechanism={publishedFamily.mechanisms[0]}
          updateMechanism={updateMechanism}
          onSaveMechanism={onSaveMechanism}
          navigateBack={navigateBack}
        />
      </CustomThemeProvider>,
    );

    const reqButton = screen.getByRole("button", { name: "Request Validation" }) as HTMLButtonElement;
    expect(reqButton.disabled).toBe(false);

    fireEvent.click(reqButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(onSaveMechanism).toHaveBeenCalledWith(
      expect.objectContaining({
        validationStatus: "Pending Validation",
        isReadOnly: true,
      }),
    );
    confirmSpy.mockRestore();
  });

  it("renders disabled 'Pending Validation' button for regular users when validation is pending", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-reg", username: "reg", role: "None" },
    });
    const updateMechanism = vi.fn();
    const navigateBack = vi.fn();

    const pendingMech: Mechanism = {
      ...mockFamily.mechanisms[0],
      validationStatus: "Pending Validation",
      isReadOnly: true,
    };

    render(
      <CustomThemeProvider>
        <MechanismEditor
          family={mockFamily}
          mechanism={pendingMech}
          updateMechanism={updateMechanism}
          navigateBack={navigateBack}
        />
      </CustomThemeProvider>,
    );

    const pendingButton = screen.getByRole("button", { name: "Pending Validation" }) as HTMLButtonElement;
    expect(pendingButton).toBeTruthy();
    expect(pendingButton.disabled).toBe(true);

    // Name and description fields are disabled for read-only mechanism
    const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
    expect(nameInput.disabled).toBe(true);
    const descInput = screen.getByLabelText("Description") as HTMLInputElement;
    expect(descInput.disabled).toBe(true);
  });

  it("renders 'Set as Validated' button for verifiers when validation is pending and handles confirmation and auto-save", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-1", username: "verifier", role: "Verifier" },
    });
    const updateMechanism = vi.fn();
    const onSaveMechanism = vi.fn().mockResolvedValue(undefined);
    const navigateBack = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    const publishedFamily: Family = {
      ...mockFamily,
      isInDatabase: true,
    };

    const pendingMech: Mechanism = {
      ...publishedFamily.mechanisms[0],
      validationStatus: "Pending Validation",
      isReadOnly: true,
    };

    render(
      <CustomThemeProvider>
        <MechanismEditor
          family={publishedFamily}
          mechanism={pendingMech}
          updateMechanism={updateMechanism}
          onSaveMechanism={onSaveMechanism}
          navigateBack={navigateBack}
        />
      </CustomThemeProvider>,
    );

    const setValButton = screen.getByRole("button", { name: "Set as Validated" }) as HTMLButtonElement;
    expect(setValButton.disabled).toBe(false);

    fireEvent.click(setValButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(onSaveMechanism).toHaveBeenCalledWith(
      expect.objectContaining({
        validationStatus: "Validated",
        isReadOnly: true,
      }),
    );
    confirmSpy.mockRestore();
  });

  it("renders 'View Family' button for Verifiers who do not own the family in FamilyBrowser", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-verifier", username: "verifier", role: "Verifier" },
    });
    const handleViewButtonClick = vi.fn();
    const handleEditButtonClick = vi.fn();

    const mockAPIFamilies = [
      {
        id: "family-1",
        name: "Community Family",
        description: "Community Family Desc",
        owner: {
          id: "owner-999",
          username: "OtherOwner",
          role: "None",
        },
        species: [],
        reactions: [],
        phases: [],
        mechanisms: [],
      },
    ];

    render(
      <CustomThemeProvider>
        <FamilyBrowser
          families={mockAPIFamilies as any}
          handleViewButtonClick={handleViewButtonClick}
          handleEditButtonClick={handleEditButtonClick}
        />
      </CustomThemeProvider>,
    );

    const viewButton = screen.getByTestId("view-family-button");
    expect(viewButton).toBeTruthy();
    expect(viewButton.textContent).toContain("View Family");
    expect(screen.queryByText("Edit Family")).toBeNull();

    fireEvent.click(viewButton);
    expect(handleViewButtonClick).toHaveBeenCalledWith("family-1");
  });

  it("does not render 'View Family' button for regular users in FamilyBrowser", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-regular", username: "regular", role: "None" },
    });

    const mockAPIFamilies = [
      {
        id: "family-1",
        name: "Community Family",
        description: "Community Family Desc",
        owner: {
          id: "owner-999",
          username: "OtherOwner",
          role: "None",
        },
        species: [],
        reactions: [],
        phases: [],
        mechanisms: [],
      },
    ];

    render(
      <CustomThemeProvider>
        <FamilyBrowser families={mockAPIFamilies as any} />
      </CustomThemeProvider>,
    );

    expect(screen.queryByTestId("view-family-button")).toBeNull();
    expect(screen.queryByText("Edit Family")).toBeNull();
  });

  it("renders 'Edit Family' button for the owner in FamilyBrowser", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "owner-999", username: "OtherOwner", role: "Verifier" },
    });

    const mockAPIFamilies = [
      {
        id: "family-1",
        name: "Community Family",
        description: "Community Family Desc",
        owner: {
          id: "owner-999",
          username: "OtherOwner",
          role: "Verifier",
        },
        species: [],
        reactions: [],
        phases: [],
        mechanisms: [],
      },
    ];

    render(
      <CustomThemeProvider>
        <FamilyBrowser
          families={mockAPIFamilies as any}
          handleEditButtonClick={vi.fn()}
        />
      </CustomThemeProvider>,
    );

    expect(screen.getByText("Edit Family")).toBeTruthy();
    expect(screen.queryByTestId("view-family-button")).toBeNull();
  });

  it("loads and displays species from family version for read-only mechanism", async () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-1", username: "verifier", role: "Verifier" },
    });

    const { getFamilyVersion } = await import("../src/API/API_GetMethods");
    (getFamilyVersion as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "v1",
      familyId: "family-1",
      species: [
        {
          id: "species-old-1",
          name: "OldSpeciesName",
          description: null,
          familyId: "family-1",
        },
      ],
      reactions: [],
      phases: [],
    });

    const readOnlyMech: Mechanism = {
      id: "mech-ro" as any,
      name: "Locked Mechanism",
      description: "Locked",
      familyId: "family-1" as any,
      familyVersionId: "v1" as any,
      speciesIds: ["species-old-1" as any],
      reactionIds: [],
      phaseIds: [],
      validationStatus: "Validated",
      isReadOnly: true,
    };

    const familyWithNewSpecies: Family = {
      ...mockFamily,
      species: [
        {
          id: "species-new-1" as any,
          name: "NewSpeciesName",
          description: null,
          familyId: "family-1" as any,
        },
      ],
    };

    render(
      <CustomThemeProvider>
        <MechanismEditor
          family={familyWithNewSpecies}
          mechanism={readOnlyMech}
          updateMechanism={vi.fn()}
          navigateBack={vi.fn()}
        />
      </CustomThemeProvider>,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Species" }));

    expect(await screen.findByText("OldSpeciesName")).toBeTruthy();
    expect(screen.queryByText("<No name>")).toBeNull();
  });

  it("clears all validation states on mechanisms when a family is cloned", () => {
    const familyWithLockedMechanisms: Family = {
      ...mockFamily,
      mechanisms: [
        {
          id: "mech-1" as any,
          name: "Mech 1",
          description: "Desc 1",
          familyId: "family-1" as any,
          familyVersionId: "v1" as any,
          speciesIds: [],
          reactionIds: [],
          phaseIds: [],
          validationStatus: "Validated",
          isReadOnly: true,
        },
        {
          id: "mech-2" as any,
          name: "Mech 2",
          description: "Desc 2",
          familyId: "family-1" as any,
          familyVersionId: "v1" as any,
          speciesIds: [],
          reactionIds: [],
          phaseIds: [],
          validationStatus: "Pending Validation",
          isReadOnly: true,
        },
      ],
    };

    const cloned = cloneFamily(familyWithLockedMechanisms);

    expect(cloned.mechanisms.length).toBe(2);
    for (const mech of cloned.mechanisms) {
      expect(mech.validationStatus).toBe("No Validation Requested");
      expect(mech.isReadOnly).toBe(false);
      expect(mech.familyVersionId).toBeUndefined();
      expect(mech.validatedBy).toBeUndefined();
    }
  });

  it("renders 'Validated by {name}' in MechanismBrowser when validated", () => {
    const validatedFamily: Family = {
      ...mockFamily,
      mechanisms: [
        {
          ...mockFamily.mechanisms[0],
          validationStatus: "Validated",
          validatedBy: "Jane Doe",
        },
      ],
    };

    render(
      <CustomThemeProvider>
        <MechanismBrowser family={validatedFamily} />
      </CustomThemeProvider>,
    );

    expect(screen.getByText("Validated by Jane Doe")).toBeTruthy();
  });

  it("renders 'Validated by {name}' in MechanismEditor header and next to Validated button", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-1", username: "tester", role: "None" },
    });

    const validatedMechanism: Mechanism = {
      ...mockFamily.mechanisms[0],
      validationStatus: "Validated",
      isReadOnly: true,
      validatedBy: "Dr. Jane Doe",
    };

    const validatedFamily: Family = {
      ...mockFamily,
      isInDatabase: true,
      mechanisms: [validatedMechanism],
    };

    render(
      <CustomThemeProvider>
        <MechanismEditor
          family={validatedFamily}
          mechanism={validatedMechanism}
          updateMechanism={vi.fn()}
          navigateBack={vi.fn()}
        />
      </CustomThemeProvider>,
    );

    const matches = screen.getAllByText("Validated by Dr. Jane Doe");
    expect(matches.length).toBe(2); // once in header chip area, once beside the button
  });
});

