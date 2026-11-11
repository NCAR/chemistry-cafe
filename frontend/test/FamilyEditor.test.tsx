import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { AuthProvider } from "../src/components/AuthContext";
import { MemoryRouter } from "react-router-dom";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { APIFamily } from "../src/API/API_Interfaces";
import FamilyEditor, {
  GeneralInfoView,
  MechanismsView,
  PhaseView,
  ReactionsView,
  SpeciesView,
  ContributorsView,
} from "../src/pages/FamilyEditor";
import {
  applySpeciesRowUpdate,
  speciesExclusiveConflict,
} from "../src/helpers/editorHelpers";
import { Family, Species } from "../src/types/chemistryModels";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";
import { MechanismEditor } from "../src/components/MechanismEditor";
import * as backendInteractions from "../src/helpers/backendInteractions";
import * as validationIssues from "../src/helpers/validationIssues";
import * as API_DeleteMethods from "../src/API/API_DeleteMethods";
import * as localFamilies from "../src/helpers/localFamilies";
import { UUID } from "crypto";

vi.mock("axios");

const testFamily: APIFamily = {
  id: "111-111-111-111-111" as UUID,
  name: "Test Family",
  description: "Test Family",
  isPublic: false,
  owner: {
    id: "11-22-33-44-55" as UUID,
    username: "Test User",
    role: "Admin",
  },
  species: [
    {
      id: "species-1" as UUID,
      name: "O3",
      description: "Ozone",
    },
  ],
  reactions: [
    {
      id: "reaction-1" as UUID,
      name: "R1",
      reactionType: "ARRHENIUS",
      reactants: [],
      products: [],
    },
  ],
  phases: [
    {
      id: "phase-1" as UUID,
      name: "gas",
      speciesIds: [],
    },
  ],
  mechanisms: [
    {
      id: "mech-1" as UUID,
      name: "Stratospheric Ox",
      familyId: "111-111-111-111-111" as UUID,
      speciesIds: ["species-1" as UUID],
      reactionIds: ["reaction-1" as UUID],
      phaseIds: ["phase-1" as UUID],
    },
  ],
};

describe("Family Editor Page", () => {
  const originalLocation = window.location;
  function createMockData(): AxiosResponse {
    return {
      data: testFamily,
      status: 200,
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
      assign: vi.fn((_: string | URL) => {}),
    } as any;
    localStorage.setItem("uploadedFamilyIds", JSON.stringify([testFamily.id]));
    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: testFamily.owner,
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      if (url.includes("/contributors")) {
        return Promise.resolve({
          data: [],
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      return Promise.resolve(createMockData());
    });

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/", "/loggedIn"]}>
            <FamilyEditor />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );
  });

  afterEach(() => {
    window.location = originalLocation as any;
    localStorage.clear();
    cleanup();
  });

  it("Renders families", async () => {
    await waitFor(() => {
      expect(screen.getAllByText("Test Family").length).toBeGreaterThan(0);
    });

    expect(screen.queryByText("Not Real Family")).toBeFalsy();

    expect(screen.getByTestId("family-info-tab")).toBeTruthy();
    expect(screen.getByTestId("family-species-tab")).toBeTruthy();
    expect(screen.getByTestId("family-reactions-tab")).toBeTruthy();
    expect(screen.getByTestId("family-phases-tab")).toBeTruthy();
    expect(screen.getByTestId("family-mechanisms-tab")).toBeTruthy();
  });

  it("Displays Editing title in header for active family", async () => {
    await waitFor(() => {
      expect(screen.getByTestId("header-editor-title")).toBeTruthy();
      expect(screen.getByText("Editing: Test Family")).toBeTruthy();
    });
  });

  it("Navigates between sidebar tabs and displays corresponding views", async () => {
    await waitFor(() => {
      expect(screen.getByTestId("mechanism-item-mech-1")).toBeTruthy();
    });

    // Counts on sidebar items
    expect(screen.getByTestId("family-reactions-tab")).toHaveTextContent("1");
    expect(screen.getByTestId("family-species-tab")).toHaveTextContent("1");
    expect(screen.getByTestId("family-phases-tab")).toHaveTextContent("1");

    // Click Reactions tab
    fireEvent.click(screen.getByTestId("family-reactions-tab"));
    await waitFor(() => {
      expect(screen.getByText("Chemical Reactions")).toBeTruthy();
    });

    // Click Species tab
    fireEvent.click(screen.getByTestId("family-species-tab"));
    await waitFor(() => {
      expect(screen.getByText("Chemical Species")).toBeTruthy();
    });

    // Click Phases tab
    fireEvent.click(screen.getByTestId("family-phases-tab"));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Phases" })).toBeTruthy();
    });

    // Click General Info tab
    fireEvent.click(screen.getByTestId("family-info-tab"));
    await waitFor(() => {
      expect(screen.getByTestId("family-name-input-general-info")).toBeTruthy();
    });

    // Click Mechanism item
    fireEvent.click(screen.getByTestId("mechanism-item-mech-1"));
    await waitFor(() => {
      expect(screen.getByText("Stratospheric Ox Info")).toBeTruthy();
    });
  });

  it("Displays editable mechanism in sidebar and excludes frozen snapshot copies", async () => {
    const verifiedFamily: APIFamily = {
      ...testFamily,
      mechanisms: [
        ...testFamily.mechanisms,
        {
          id: "mech-copy-frozen" as UUID,
          name: "Test-Verified-V1",
          description: "Frozen copy",
          species: [],
          reactions: [],
          phases: [],
        },
      ],
      verifiedVersions: [
        {
          id: "ver-1" as UUID,
          familyId: testFamily.id,
          familyVersionId: "fv-1" as UUID,
          sourceMechanismId: "mech-1" as UUID,
          mechanismId: "mech-copy-frozen" as UUID,
          name: "Test-Verified-V1",
          verifiedDate: "2026-11-09T12:00:00Z",
          verifierId: "verifier-1" as UUID,
          verifierUsername: "b.okafor",
          isDeprecated: false,
          isArchived: false,
        },
      ],
    };

    localStorage.setItem("uploadedFamilyIds", JSON.stringify([verifiedFamily.id]));
    localStorage.setItem("selectedEditorMechanismId", "mech-1");

    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: testFamily.owner,
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      if (url.includes("/contributors")) {
        return Promise.resolve({
          data: [],
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      return Promise.resolve({
        data: verifiedFamily,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: new AxiosHeaders() },
      } as AxiosResponse);
    });

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/editor"]}>
            <FamilyEditor />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    // The editable mechanism should be rendered in the sidebar
    await waitFor(() => {
      expect(screen.getByText("Stratospheric Ox")).toBeTruthy();
    });

    // The duplicate frozen copy mechanism should NOT appear in the sidebar list
    expect(screen.queryByTestId("mechanism-item-mech-copy-frozen")).toBeNull();
  });

  it("Displays mechanism in sidebar and editor when viewing a verified version snapshot", async () => {
    const versionSnapshotFamily: APIFamily = {
      ...testFamily,
      currentVersionId: "fv-1" as UUID,
      mechanisms: [
        {
          id: "mech-copy-frozen" as UUID,
          name: "Test-Verified-V1",
          description: "Frozen copy",
          sourceObjectId: "mech-1" as UUID,
          speciesIds: [],
          reactionIds: [],
          phaseIds: [],
          species: [],
          reactions: [],
          phases: [],
        },
      ],
      verifiedVersions: [
        {
          id: "ver-1" as UUID,
          familyId: testFamily.id,
          familyVersionId: "fv-1" as UUID,
          sourceMechanismId: "mech-1" as UUID,
          mechanismId: "mech-copy-frozen" as UUID,
          name: "Test-Verified-V1",
          verifiedDate: "2026-11-09T12:00:00Z",
          verifierId: "verifier-1" as UUID,
          verifierUsername: "b.okafor",
          isDeprecated: false,
          isArchived: false,
        },
      ],
    };

    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: testFamily.owner,
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      if (url.includes("/contributors")) {
        return Promise.resolve({
          data: [],
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      return Promise.resolve({
        data: versionSnapshotFamily,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: new AxiosHeaders() },
      } as AxiosResponse);
    });

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={[`/editor?id=${testFamily.id}&versionId=fv-1`]}>
            <FamilyEditor />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    // The mechanism should be rendered in the sidebar
    await waitFor(() => {
      expect(screen.getByText("Test-Verified-V1")).toBeTruthy();
    });

    // And clicking the mechanism should display its editor view, not "Mechanism not found."
    const mechSidebarItem = screen.getByTestId("mechanism-item-mech-copy-frozen");
    fireEvent.click(mechSidebarItem);

    await waitFor(() => {
      expect(screen.getByText("Test-Verified-V1 Info")).toBeTruthy();
    });
    expect(screen.queryByText("Mechanism not found.")).toBeNull();
  });

  it("Supports keyboard navigation on SidebarItem using Enter and Space keys", async () => {
    await waitFor(() => {
      expect(screen.getByTestId("family-reactions-tab")).toBeTruthy();
    });

    const reactionsTab = screen.getByTestId("family-reactions-tab");
    fireEvent.keyDown(reactionsTab, { key: "Enter" });
    await waitFor(() => {
      expect(screen.getByText("Chemical Reactions")).toBeTruthy();
    });

    const speciesTab = screen.getByTestId("family-species-tab");
    fireEvent.keyDown(speciesTab, { key: " " });
    await waitFor(() => {
      expect(screen.getByText("Chemical Species")).toBeTruthy();
    });
  });

  it("Can open the MechanismCreationModal and create a mechanism", async () => {
    await waitFor(() => {
      expect(screen.getByTestId("create-mechanism-button")).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId("create-mechanism-button"));

    await waitFor(() => {
      expect(
        screen.getByText("Enter Details for the Mechanism below:"),
      ).toBeTruthy();
    });

    const nameInput = document.getElementById("mechanism-name")!;
    fireEvent.change(nameInput, { target: { value: "New Ox Mechanism" } });

    const createBtn = screen.getByTestId("create-new-mechanism-button");
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText("New Ox Mechanism Info")).toBeTruthy();
    });
  });

  it("Toggles family visibility with the Public switch and validates", async () => {
    await waitFor(() => {
      expect(screen.getByTestId("public-switch")).toBeTruthy();
    });

    // 1. Validation failure shows ValidationErrorsModal
    vi.spyOn(validationIssues, "validateFamily").mockResolvedValueOnce([
      {
        message: "Missing reaction reactant",
        mechanismId: "mech-1",
        mechanismName: "Stratospheric Ox",
      },
    ]);

    const publicSwitch = screen
      .getByTestId("public-switch")
      .querySelector("input")!;
    fireEvent.click(publicSwitch);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Fix these problems before making this family public:",
        ),
      ).toBeTruthy();
    });

    // Close validation modal
    const closeValidationBtn = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeValidationBtn);

    // 2. Validation success directly makes public
    vi.spyOn(validationIssues, "validateFamily").mockResolvedValueOnce([]);
    vi.spyOn(backendInteractions, "saveFamilyChanges").mockResolvedValueOnce({
      ...testFamily,
      isPublic: true,
      isModified: false,
      isInDatabase: true,
      species: [],
      reactions: [],
      phases: [],
      mechanisms: [],
    } as any);

    fireEvent.click(publicSwitch);

    await waitFor(() => {
      expect(screen.getByTestId("in-page-success-alert")).toBeTruthy();
      expect(screen.getByText(/"Test Family" is now public/i)).toBeTruthy();
    });

    // 3. Toggling from public to private
    vi.spyOn(backendInteractions, "saveFamilyChanges").mockResolvedValueOnce({
      ...testFamily,
      isPublic: false,
      isModified: false,
      isInDatabase: true,
      species: [],
      reactions: [],
      phases: [],
      mechanisms: [],
    } as any);

    fireEvent.click(publicSwitch);

    await waitFor(() => {
      expect(screen.getByText(/"Test Family" is now private/i)).toBeTruthy();
    });
  });

  it("Handles unsaved changes: showing bar, discarding, and saving", async () => {
    await waitFor(() => {
      expect(screen.getByTestId("family-name-input-general-info")).toBeTruthy();
    });

    const nameInput = screen
      .getByTestId("family-name-input-general-info")
      .querySelector("input")!;

    // Modify name
    fireEvent.change(nameInput, { target: { value: "Modified Family Name" } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByTestId("unsaved-changes-bar")).toBeTruthy();
      expect(screen.getByText(/Unsaved changes/i)).toBeTruthy();
    });

    // Click Discard
    const discardBtn = screen.getByTestId("discard-changes-button");
    fireEvent.click(discardBtn);

    await waitFor(() => {
      expect(screen.getByTestId("in-page-success-alert")).toBeTruthy();
      expect(screen.getByText("Changes discarded.")).toBeTruthy();
    });

    // Close success alert
    const closeAlertBtn = screen
      .getByTestId("in-page-success-alert")
      .querySelector("button")!;
    fireEvent.click(closeAlertBtn);

    // Modify name again and click Save
    fireEvent.change(nameInput, { target: { value: "Saved Family Name" } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByTestId("unsaved-changes-bar")).toBeTruthy();
    });

    vi.spyOn(backendInteractions, "saveFamilyChanges").mockResolvedValueOnce({
      ...testFamily,
      name: "Saved Family Name",
      isModified: false,
      isInDatabase: true,
      species: [],
      reactions: [],
      phases: [],
      mechanisms: [],
    } as any);

    const saveBtn = screen.getByTestId("save-changes-button");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText("Changes saved successfully.")).toBeTruthy();
    });

    // Save failure error alert
    fireEvent.change(nameInput, { target: { value: "Error Family Name" } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByTestId("unsaved-changes-bar")).toBeTruthy();
    });

    vi.spyOn(backendInteractions, "saveFamilyChanges").mockRejectedValueOnce(
      new Error("Failed to save changes"),
    );

    fireEvent.click(screen.getByTestId("save-changes-button"));

    await waitFor(() => {
      expect(screen.getByTestId("in-page-error-alert")).toBeTruthy();
      expect(screen.getByText("Failed to save changes")).toBeTruthy();
    });

    // Close error alert
    const closeErrorBtn = screen
      .getByTestId("in-page-error-alert")
      .querySelector("button")!;
    fireEvent.click(closeErrorBtn);
  });

  it("Deletes family from GeneralInfoView via confirmDeleteFamily", async () => {
    await waitFor(() => {
      expect(screen.getByText("Delete Family")).toBeTruthy();
    });

    const deleteFamilySpy = vi
      .spyOn(API_DeleteMethods, "deleteFamily")
      .mockResolvedValueOnce();

    fireEvent.click(screen.getByText("Delete Family"));

    await waitFor(() => {
      expect(
        screen.getByText(/This will permanently delete the entire family!/i),
      ).toBeTruthy();
    });

    const confirmBtn = screen.getByTestId("confirm-action");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteFamilySpy).toHaveBeenCalledWith(testFamily.id);
    });
  });
});

describe("FamilyEditor - Read-Only Viewing Mode", () => {
  const originalLocation = window.location;
  const readOnlyFamily: APIFamily = {
    ...testFamily,
    id: "readonly-fam-1" as UUID,
    name: "ReadOnly Family",
    isPublic: true,
    owner: {
      id: "999-999-999-999-999" as UUID,
      username: "ncar.chem",
      role: "Author",
    },
  };

  beforeEach(() => {
    window.location = {
      ...originalLocation,
      assign: vi.fn(),
    } as any;
    localStorage.setItem(
      "uploadedFamilyIds",
      JSON.stringify([readOnlyFamily.id]),
    );
    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: { id: "11-22-33-44-55", username: "Test User", role: "User" },
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      if (url.includes("/contributors")) {
        return Promise.resolve({
          data: [],
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      return Promise.resolve({
        data: readOnlyFamily,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: new AxiosHeaders() },
      } as AxiosResponse);
    });
  });

  afterEach(() => {
    window.location = originalLocation as any;
    localStorage.clear();
    cleanup();
  });

  it("Displays Viewing title, read-only alert banner, and handles Edit a copy", async () => {
    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/editor"]}>
            <FamilyEditor />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Viewing: ReadOnly Family")).toBeTruthy();
      expect(screen.getByTestId("readonly-viewing-banner")).toBeTruthy();
      expect(
        screen.getByText(
          "You are viewing ncar.chem's family. Edit a copy to change it.",
        ),
      ).toBeTruthy();
      expect(screen.getByTestId("banner-edit-copy-button")).toBeTruthy();
    });

    vi.spyOn(backendInteractions, "uploadFamily").mockResolvedValueOnce({
      ...readOnlyFamily,
      id: "copied-fam-id" as UUID,
      name: "ReadOnly Family (copy)",
      owner: {
        id: "11-22-33-44-55" as UUID,
        username: "Test User",
        role: "User",
      },
      isInDatabase: true,
      species: [],
      reactions: [],
      phases: [],
      mechanisms: [],
    } as any);

    fireEvent.click(screen.getByTestId("banner-edit-copy-button"));

    await waitFor(() => {
      expect(screen.getByTestId("in-page-success-alert")).toBeTruthy();
      expect(screen.getByText(/Created private copy/i)).toBeTruthy();
    });
  });

  it("Displays error alert when Edit a copy fails", async () => {
    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/editor"]}>
            <FamilyEditor />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("banner-edit-copy-button")).toBeTruthy();
    });

    vi.spyOn(backendInteractions, "uploadFamily").mockRejectedValueOnce(
      new Error("Copy failed"),
    );

    fireEvent.click(screen.getByTestId("banner-edit-copy-button"));

    await waitFor(() => {
      expect(screen.getByTestId("in-page-error-alert")).toBeTruthy();
      expect(screen.getByText("Copy failed")).toBeTruthy();
    });
  });
});

describe("FamilyEditor - Browser Draft Mode", () => {
  const originalLocation = window.location;
  const draftFamily: Family = {
    id: "draft-fam-1" as UUID,
    name: "Draft Family",
    description: "Local draft in browser",
    isPublic: false,
    isInDatabase: false,
    owner: null,
    species: [],
    reactions: [],
    phases: [],
    mechanisms: [],
  };

  beforeEach(() => {
    window.location = {
      ...originalLocation,
      assign: vi.fn(),
    } as any;
    localStorage.setItem("localFamilies", JSON.stringify([draftFamily]));
    localStorage.setItem("selectedEditorFamilyId", draftFamily.id);
    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: { id: "11-22-33-44-55", username: "Test User", role: "User" },
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
  });

  afterEach(() => {
    window.location = originalLocation as any;
    localStorage.clear();
    cleanup();
  });

  it("Renders draft status chip without redundant banner and allows saving draft to user account", async () => {
    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/editor"]}>
            <FamilyEditor />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status-chip-draft")).toBeTruthy();
      expect(screen.queryByTestId("guest-draft-banner")).toBeNull();
      expect(screen.getByText("Upload Family")).toBeTruthy();
    });

    vi.spyOn(backendInteractions, "uploadFamily").mockResolvedValueOnce({
      ...draftFamily,
      isInDatabase: true,
      owner: {
        id: "11-22-33-44-55" as UUID,
        username: "Test User",
        role: "User",
      },
    } as any);

    fireEvent.click(screen.getByText("Upload Family"));

    await waitFor(() => {
      expect(screen.getByTestId("confirm-action")).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId("confirm-action"));

    await waitFor(() => {
      expect(screen.getByTestId("in-page-success-alert")).toBeTruthy();
      expect(
        screen.getByText(/Saved "Draft Family" to your account/i),
      ).toBeTruthy();
      // Browser draft is removed from localStorage
      const stored = JSON.parse(localStorage.getItem("localFamilies") || "[]");
      expect(stored.some((f: any) => f.id === draftFamily.id)).toBe(false);
    });
  });

  it("Saves changes to draft in browser immediately without requiring manual save", async () => {
    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/editor"]}>
            <FamilyEditor />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("family-name-input-general-info")).toBeTruthy();
    });

    const nameInput = screen
      .getByTestId("family-name-input-general-info")
      .querySelector("input")!;

    fireEvent.change(nameInput, { target: { value: "Updated Draft" } });

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("localFamilies") || "[]");
      expect(stored.some((f: any) => f.name === "Updated Draft")).toBe(true);
    });
  });
});

describe("FamilyEditor - Helpers and Empty State", () => {
  it("Renders empty state when no families exist", async () => {
    localStorage.clear();
    vi.spyOn(axios, "get").mockResolvedValue({
      data: [],
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: new AxiosHeaders() },
    } as AxiosResponse);

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/editor"]}>
            <FamilyEditor />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("No family is currently selected.")).toBeTruthy();
      expect(
        screen.getByRole("button", { name: "Browse Families" }),
      ).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Browse Families" }));
  });

  it("Loads mechanism directly when stored in localStorage", async () => {
    localStorage.setItem("uploadedFamilyIds", JSON.stringify([testFamily.id]));
    localStorage.setItem("selectedEditorMechanismId", "mech-1");

    vi.spyOn(axios, "get").mockImplementation((url: string) => {
      if (url.includes("/users/whoami")) {
        return Promise.resolve({
          data: testFamily.owner,
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      if (url.includes("/contributors")) {
        return Promise.resolve({
          data: [],
          status: 200,
          statusText: "OK",
          headers: {},
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse);
      }
      return Promise.resolve({
        data: testFamily,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: new AxiosHeaders() },
      } as AxiosResponse);
    });

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/editor"]}>
            <FamilyEditor />
          </MemoryRouter>
        </CustomThemeProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Stratospheric Ox Info")).toBeTruthy();
    });
  });
});

describe("MechanismEditor", () => {
  it("Can navigate between tabs", () => {
    render(
      <CustomThemeProvider>
        <MechanismEditor
          family={{
            id: "111-111-111-111-111",
            name: "Test Family",
            description: "",
            owner: null,
            mechanisms: [
              {
                id: "111-111-111-111-111",
                name: "Test Mechanism",
                description: "",
                phaseIds: [],
                familyId: "111-111-111-111",
                speciesIds: ["111-111-111-111-111"],
                reactionIds: ["111-111-111-111-111"],
              },
            ],
            species: [
              {
                id: "111-111-111-111-111",
                name: "Test Species",
                description: null,
                familyId: "",
                attributes: {},
              },
            ],
            reactions: [
              {
                id: "111-111-111-111-111",
                name: "Test Reaction",
                description: null,
                type: "ARRHENIUS",
                reactants: [
                  {
                    speciesId: "111-111-111-111-111",
                    coefficient: 0,
                  },
                ],
                products: [
                  {
                    speciesId: "111-111-111-111-111",
                    coefficient: 0,
                  },
                ],
                attributes: {},
              },
            ],
            phases: [],
          }}
          mechanism={{
            id: "111-111-111-111-111",
            name: "Test Mechanism",
            description: "",
            phaseIds: [],
            familyId: "111-111-111-111",
            speciesIds: ["111-111-111-111-111"],
            reactionIds: ["111-111-111-111-111"],
          }}
          updateMechanism={vi.fn()}
          navigateBack={vi.fn()}
        />
      </CustomThemeProvider>,
    );

    const tabs = screen.getAllByTestId("mechanism-tab");
    for (const tab of tabs) {
      expect(tab).toBeTruthy();
      fireEvent.click(tab);
    }

    cleanup();
  });
});

describe("GeneralInfoView", () => {
  let updateFamily = vi.fn();
  beforeEach(() => {
    updateFamily = vi.fn();
    render(
      <AuthProvider>
        <CustomThemeProvider>
          <GeneralInfoView
            family={{
              id: "111-111-111-111-111",
              name: "Test Family",
              description: "Test Description",
              mechanisms: [
                {
                  id: "mechanism-id",
                  name: "Test Mechanism",
                  description: null,
                  familyId: "111-111-111-111-111",
                  speciesIds: [],
                  reactionIds: [],
                  phaseIds: ["120984"],
                },
              ],
              owner: null,
              species: [
                {
                  id: "111-111-111-111-333",
                  name: "Test Species",
                  description: "Cool species",
                  familyId: "111-111-111-111-111",
                  attributes: {},
                  isDeleted: false,
                  isInDatabase: true,
                  isModified: false,
                },
              ],
              phases: [],
              reactions: [
                {
                  id: "111-111-111-111",
                  name: "Test Reaction",
                  description: "",
                  type: "ARRHENIUS",
                  reactants: [],
                  products: [],
                  attributes: {},
                },
                {
                  id: "222-222-222-222",
                  name: "Another Test Reaction",
                  description: "",
                  type: "FIRST_ORDER_LOSS",
                  reactants: [],
                  products: [],
                  attributes: {},
                },
              ],
            }}
            updateFamily={updateFamily}
            onDelete={vi.fn()}
            onPublish={vi.fn()}
            onChangeVisibility={vi.fn()}
          />
        </CustomThemeProvider>
      </AuthProvider>,
    );
  });

  it("renders", () => {
    expect(screen.getByText("Test Description")).toBeTruthy();
    expect(screen.getByText("Contributors")).toBeTruthy();
  });
});

describe("GeneralInfoView - Contributors Visibility", () => {
  it("does not render Contributors if user is not a contributor, owner, or admin for database family", () => {
    render(
      <AuthProvider>
        <CustomThemeProvider>
          <GeneralInfoView
            family={{
              id: "db-fam-1",
              name: "DB Family",
              description: "Database family description",
              isInDatabase: true,
              owner: { id: "someone-else" as any, username: "SomeoneElse" },
              contributorIds: ["contributor-abc" as any],
              mechanisms: [],
            }}
            updateFamily={vi.fn()}
            readOnly={true}
            onDelete={vi.fn()}
            onPublish={vi.fn()}
            onChangeVisibility={vi.fn()}
          />
        </CustomThemeProvider>
      </AuthProvider>,
    );

    expect(screen.getByText("Database family description")).toBeTruthy();
    expect(screen.queryByText("Contributors")).toBeNull();
  });

  it("renders Contributors if user is a contributor", () => {
    // Current user in AuthProvider test defaults to someone with id
    // We pass that id in contributorIds
    render(
      <AuthProvider>
        <CustomThemeProvider>
          <GeneralInfoView
            family={{
              id: "db-fam-2",
              name: "DB Family 2",
              description: "Contributor family",
              isInDatabase: false,
              mechanisms: [],
            }}
            updateFamily={vi.fn()}
            readOnly={false}
            onDelete={vi.fn()}
            onPublish={vi.fn()}
            onChangeVisibility={vi.fn()}
          />
        </CustomThemeProvider>
      </AuthProvider>,
    );

    expect(screen.getByText("Contributor family")).toBeTruthy();
    expect(screen.getByText("Contributors")).toBeTruthy();
  });
});

describe("PhaseView", () => {
  let updateFamily = vi.fn();
  beforeEach(() => {
    updateFamily = vi.fn();
    render(
      <CustomThemeProvider>
        <PhaseView
          family={{
            id: "111-111-111-111-111",
            name: "Test Family",
            description: "Test Description",
            mechanisms: [
              {
                id: "mechanism-id",
                name: "Test Mechanism",
                description: null,
                familyId: "111-111-111-111-111",
                speciesIds: [],
                reactionIds: [],
                phaseIds: ["120984"],
              },
            ],
            owner: null,
            species: [
              {
                id: "111-111-111-111-333",
                name: "Test Species",
                description: "Cool species",
                familyId: "111-111-111-111-111",
                attributes: {},
                isDeleted: false,
                isInDatabase: true,
                isModified: false,
              },
            ],
            phases: [
              {
                id: "120984",
                name: "gas",
                description: null,
                speciesIds: [],
              },
            ],
            reactions: [
              {
                id: "111-111-111-111",
                name: "Test Reaction",
                description: "",
                type: "ARRHENIUS",
                gasPhaseId: "120984",
                reactants: [],
                products: [],
                attributes: {},
              },
              {
                id: "222-222-222-222",
                name: "Another Test Reaction",
                description: "",
                type: "FIRST_ORDER_LOSS",
                gasPhaseId: "120984",
                reactants: [],
                products: [],
                attributes: {},
              },
            ],
          }}
          updateFamily={updateFamily}
        />
      </CustomThemeProvider>,
    );
  });

  it("renders", () => {
    expect(screen.getByText("gas")).toBeTruthy();
    expect(screen.getByText("<Empty>")).toBeTruthy();
  });

  it("edits a phase name and description", async () => {
    const user = userEvent.setup();
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]);
    fireEvent.click(screen.getByTestId("edit-phase-button"));
    await screen.findByText("Edit Phase");

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "liquid");
    await user.type(screen.getByLabelText("Description"), "Liquid phase");
    await user.click(screen.getByTestId("save-phase-button"));

    expect(updateFamily).toHaveBeenCalledWith(
      expect.objectContaining({
        phases: [
          {
            id: "120984",
            name: "liquid",
            description: "Liquid phase",
            speciesIds: [],
            diffusionCoefficients: {},
          },
        ],
      }),
    );
  });

  it("deletes a phase and removes its mechanism and reaction references", async () => {
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]);
    fireEvent.click(screen.getByTestId("delete-phases-button"));

    expect(screen.getByText(/2 reactions use them/)).toBeTruthy();
    expect(updateFamily).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("confirm-action"));

    expect(updateFamily).toHaveBeenCalledWith(
      expect.objectContaining({
        phases: [],
        reactions: expect.arrayContaining([
          expect.objectContaining({
            id: "111-111-111-111",
            gasPhaseId: undefined,
          }),
        ]),
        mechanisms: [
          expect.objectContaining({
            phaseIds: [],
          }),
        ],
        isModified: true,
      }),
    );
  });

  it("cancels phase deletion when a reaction uses it", () => {
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]);
    fireEvent.click(screen.getByTestId("delete-phases-button"));
    fireEvent.click(screen.getByLabelText("Cancel Irreversable Action"));

    expect(updateFamily).not.toHaveBeenCalled();
    expect(screen.getByText("gas")).toBeTruthy();
  });

  const renderPhaseWithReactionsUsingSpecies = () => {
    cleanup();
    const speciesId = "111-111-111-111-333";
    const phaseId = "120984";
    const family: Family = {
      id: "111-111-111-111-111",
      name: "Test Family",
      description: "Test Description",
      owner: null,
      species: [
        {
          id: speciesId,
          name: "Test Species",
          description: "Cool species",
          familyId: "111-111-111-111-111",
          attributes: {},
          isDeleted: false,
          isInDatabase: true,
          isModified: false,
        },
      ],
      phases: [
        {
          id: phaseId,
          name: "gas",
          description: null,
          speciesIds: [speciesId],
        },
      ],
      reactions: [
        {
          id: "reaction-1",
          name: "First affected reaction",
          description: null,
          type: "ARRHENIUS",
          gasPhaseId: phaseId,
          reactants: [{ speciesId, coefficient: 1 }],
          products: [],
          attributes: {},
        },
        {
          id: "reaction-2",
          name: "Second affected reaction",
          description: null,
          type: "ARRHENIUS",
          gasPhaseId: phaseId,
          reactants: [],
          products: [{ speciesId, coefficient: 1 }],
          attributes: {},
        },
        {
          id: "reaction-3",
          name: "Reaction using the species as gas phase species",
          description: null,
          type: "ARRHENIUS",
          gasPhaseId: phaseId,
          reactants: [],
          products: [],
          gasPhaseSpeciesId: speciesId,
          attributes: {},
        },
        {
          id: "reaction-5",
          name: "Unaffected reaction in phase",
          description: null,
          type: "ARRHENIUS",
          gasPhaseId: phaseId,
          reactants: [],
          products: [],
          attributes: {},
        },
        {
          id: "reaction-4",
          name: "Reaction in another phase",
          description: null,
          type: "ARRHENIUS",
          gasPhaseId: "other-phase",
          reactants: [{ speciesId, coefficient: 1 }],
          products: [],
          attributes: {},
        },
      ],
      mechanisms: [
        {
          id: "mechanism-id",
          name: "Test Mechanism",
          description: null,
          familyId: "111-111-111-111-111",
          speciesIds: [speciesId],
          reactionIds: [
            "reaction-1",
            "reaction-2",
            "reaction-3",
            "reaction-4",
            "reaction-5",
          ],
          phaseIds: [phaseId],
        },
      ],
    };
    const updateFamily = vi.fn();
    render(
      <CustomThemeProvider>
        <PhaseView family={family} updateFamily={updateFamily} />
      </CustomThemeProvider>,
    );

    fireEvent.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]);
    fireEvent.click(screen.getByTestId("edit-phase-button"));
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByTestId("save-phase-button"));
    return updateFamily;
  };

  it("prompts before removing species used by reactions and cancels without changes", () => {
    const updateFamily = renderPhaseWithReactionsUsingSpecies();

    expect(screen.getByText(/will remove 3 affected reactions/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Cancel Irreversable Action"));

    expect(updateFamily).not.toHaveBeenCalled();
  });

  it("removes affected reactions and their mechanism references when confirmed", () => {
    const updateFamily = renderPhaseWithReactionsUsingSpecies();
    fireEvent.click(screen.getByTestId("confirm-action"));

    expect(updateFamily).toHaveBeenCalledWith(
      expect.objectContaining({
        phases: [
          expect.objectContaining({
            id: "120984",
            speciesIds: [],
          }),
        ],
        reactions: [
          expect.objectContaining({ id: "reaction-5" }),
          expect.objectContaining({ id: "reaction-4" }),
        ],
        mechanisms: [
          expect.objectContaining({
            reactionIds: ["reaction-4", "reaction-5"],
          }),
        ],
        isModified: true,
      }),
    );
  });
});

describe("speciesExclusiveConflict", () => {
  const base: Species = {
    id: "s1",
    name: "S",
    description: null,
    familyId: "f1",
  };

  it("is false when zero or one exclusive option is set", () => {
    expect(speciesExclusiveConflict(base)).toBe(false);
    expect(
      speciesExclusiveConflict({ ...base, constantConcentration: 1 }),
    ).toBe(false);
    expect(
      speciesExclusiveConflict({ ...base, constantMixingRatio: 0.5 }),
    ).toBe(false);
    expect(speciesExclusiveConflict({ ...base, isThirdBody: true })).toBe(
      false,
    );
  });

  it("is true when two or more exclusive options are set", () => {
    expect(
      speciesExclusiveConflict({
        ...base,
        constantConcentration: 1,
        constantMixingRatio: 0.5,
      }),
    ).toBe(true);
    expect(
      speciesExclusiveConflict({
        ...base,
        constantMixingRatio: 0.5,
        isThirdBody: true,
      }),
    ).toBe(true);
  });

  it("treats empty string and NaN as unset", () => {
    expect(
      speciesExclusiveConflict({
        ...base,
        constantConcentration: "" as unknown as number,
        constantMixingRatio: 0.5,
      }),
    ).toBe(false);
    expect(
      speciesExclusiveConflict({
        ...base,
        constantConcentration: NaN,
        isThirdBody: true,
      }),
    ).toBe(false);
  });
});

describe("SpeciesView", () => {
  let updateFamily = vi.fn();

  beforeEach(() => {
    updateFamily = vi.fn();
    render(
      <CustomThemeProvider>
        <SpeciesView
          family={{
            id: "111-111-111-111-111",
            name: "Test Family",
            description: "",
            mechanisms: [],
            owner: null,
            species: [
              {
                id: "111-111-111-111-333",
                name: "Test Species",
                description: "Cool species",
                familyId: "111-111-111-111-111",
                attributes: {},
                isDeleted: false,
                isInDatabase: true,
                isModified: false,
              },
            ],
            phases: [],
            reactions: [
              {
                id: "111-111-111-111",
                name: "Test Reaction",
                description: "",
                type: "ARRHENIUS",
                reactants: [],
                products: [],
                attributes: {},
              },
              {
                id: "222-222-222-222",
                name: "Another Test Reaction",
                description: "",
                type: "FIRST_ORDER_LOSS",
                reactants: [],
                products: [],
                attributes: {},
              },
            ],
          }}
          updateFamily={updateFamily}
        />
      </CustomThemeProvider>,
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders", () => {
    expect(screen.getByText("Chemical Species")).toBeTruthy();
  });

  it("retains inline species edits in the family model", () => {
    const family = {
      id: "111-111-111-111-111",
      name: "Test Family",
      description: "",
      mechanisms: [],
      owner: null,
      species: [
        {
          id: "111-111-111-111-333",
          name: "Test Species",
          description: "Cool species",
          familyId: "111-111-111-111-111",
          isDeleted: false,
          isInDatabase: true,
          isModified: false,
          absoluteTolerance: 0.1,
          constantConcentration: 2.5,
          constantMixingRatio: 0.25,
        },
      ],
      phases: [],
      reactions: [],
    };

    const updatedFamily = applySpeciesRowUpdate(family, {
      ...family.species[0],
      name: "Updated Species",
      constantConcentration: 6.7,
      constantMixingRatio: 0.42,
    });

    expect(updatedFamily.species[0].name).toBe("Updated Species");
    expect(updatedFamily.species[0].constantConcentration).toBe(6.7);
    expect(updatedFamily.species[0].constantMixingRatio).toBe(0.42);
  });

  it("Can create species", async () => {
    const user = userEvent.setup();

    const addSpeciesButton = screen.getByTestId("add-species-button");
    fireEvent.click(addSpeciesButton);

    const nameBox = screen.getByLabelText("Name *") as HTMLInputElement;
    expect(nameBox).toBeTruthy();
    expect(nameBox.value).toBeFalsy();

    const descriptionBox = screen.getByLabelText(
      "Description",
    ) as HTMLInputElement;
    expect(descriptionBox).toBeTruthy();
    expect(descriptionBox.value).toBeFalsy();

    const molecularWeightBox = screen.getByLabelText(
      "Molecular weight",
    ) as HTMLInputElement;
    expect(molecularWeightBox).toBeTruthy();

    // Input new properties
    await user.type(nameBox, "Test Species");
    expect(nameBox.value).toEqual("Test Species");
    await user.type(descriptionBox, "Species Description");
    expect(descriptionBox.value).toEqual("Species Description");
    await user.type(molecularWeightBox, "1e-7");
    expect(molecularWeightBox.value).toEqual("1e-7");

    const saveButton = screen.getByTestId("save-species-changes");
    fireEvent.click(saveButton);

    expect(updateFamily).toHaveBeenCalled();
  });

  it("Errors when new species name is empty", async () => {
    const user = userEvent.setup();
    const addSpeciesButton = screen.getByTestId("add-species-button");
    fireEvent.click(addSpeciesButton);

    const nameBox = screen.getByLabelText("Name *") as HTMLInputElement;
    expect(nameBox).toBeTruthy();
    expect(nameBox.value).toBeFalsy();

    const saveButton = screen.getByTestId("save-species-changes");
    fireEvent.click(saveButton);

    expect(updateFamily).not.toHaveBeenCalled();

    // Try again
    await user.type(nameBox, "Test Species");
    expect(nameBox.value).toEqual("Test Species");
    fireEvent.click(saveButton);
  });

  it("Blocks saving mutually exclusive species options", async () => {
    const user = userEvent.setup();
    fireEvent.click(screen.getByTestId("add-species-button"));

    await user.type(screen.getByLabelText("Name *"), "Test Species");
    await user.type(screen.getByLabelText("Constant concentration"), "1.5");
    fireEvent.click(screen.getByLabelText("Third body (M)"));

    fireEvent.click(screen.getByTestId("save-species-changes"));

    expect(updateFamily).not.toHaveBeenCalled();
    expect(screen.getByText(/only one of/i)).toBeTruthy();
  });

  it("Can remove species", async () => {
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]);
    fireEvent.click(screen.getByTestId("delete-species-button"));
    expect(updateFamily).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("confirm-action"));
    expect(updateFamily).toHaveBeenCalled();
  });
});

describe("ReactionsView", () => {
  const updateFamily = vi.fn();

  beforeEach(() => {
    render(
      <CustomThemeProvider>
        <ReactionsView
          family={{
            id: "111-111-111-111-111",
            name: "Test Family",
            description: "",
            owner: null,
            mechanisms: [],
            species: [
              {
                id: "111-111-111-111-333",
                name: "Test Species",
                description: "Cool species",
                familyId: "111-111-111-111-111",
                attributes: {},
                isDeleted: false,
                isInDatabase: true,
                isModified: false,
              },
            ],
            phases: [],
            reactions: [
              {
                id: "111-111-111-111",
                name: "Test Reaction",
                description: "",
                type: "ARRHENIUS",
                reactants: [
                  {
                    speciesId: "111-111-111-111-333",
                    coefficient: 1.0,
                  },
                ],
                products: [
                  {
                    speciesId: "111-111-111-111-333",
                    coefficient: 1.0,
                  },
                ],
                attributes: {},
              },
              {
                id: "222-222-222-222",
                name: "Another Test Reaction",
                description: "This one has a description",
                type: "FIRST_ORDER_LOSS",
                reactants: [
                  {
                    speciesId: "111-111-111-111-333",
                    coefficient: 2,
                  },
                ],
                products: [
                  {
                    speciesId: "111-111-111-111-333",
                    coefficient: 2,
                  },
                ],
                attributes: {},
              },
            ],
          }}
          updateFamily={updateFamily}
        />
      </CustomThemeProvider>,
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders", () => {
    expect(screen.getByText("Chemical Reactions")).toBeTruthy();
  });

  it("Can create reactions", async () => {
    const user = userEvent.setup();

    const addReactionButton = screen.getAllByTestId("add-reaction-button")[0];
    expect(addReactionButton).toBeTruthy();
    fireEvent.click(addReactionButton);

    const nameBox = screen.getByLabelText("Name") as HTMLInputElement;
    expect(nameBox).toBeTruthy();
    expect(nameBox.value).toBeFalsy();

    const reactionTypeDropdown = screen.getByLabelText("Reaction Type");

    // Input new species values
    await user.type(nameBox, "Test Species");
    expect(nameBox.value).toEqual("Test Species");

    fireEvent.click(reactionTypeDropdown);

    const saveButton = screen.getByTestId("save-reaction-changes");
    fireEvent.click(saveButton);

    expect(updateFamily).toHaveBeenCalled();
  });

  it("Can remove reactions", async () => {
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]);
    fireEvent.click(screen.getByTestId("delete-reactions-button"));
    fireEvent.click(screen.getByTestId("confirm-action"));
    expect(updateFamily).toHaveBeenCalled();
  });

  it("Can edit reactions", async () => {
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]);
    fireEvent.click(screen.getByTestId("edit-reaction-button"));
    expect(screen.getByTestId("save-reaction-changes")).toBeTruthy();
  });
});

describe("MechanismsView", () => {
  let updateFamily = vi.fn();
  const originalCreateObjectURL = window.URL.createObjectURL;
  const originalRevokeObjectURL = window.URL.revokeObjectURL;

  beforeEach(() => {
    window.URL.createObjectURL = vi.fn(() => "blob:null/19483");
    window.URL.revokeObjectURL = vi.fn(() => undefined);
    updateFamily = vi.fn();
    render(
      <CustomThemeProvider>
        <MechanismsView
          family={{
            id: "111-111-111-111-111",
            name: "Test Family",
            description: "",
            owner: null,
            mechanisms: [
              {
                id: "111-111-111-111-111",
                name: "Test Mechanism",
                description: "",
                phaseIds: [],
                familyId: "111-111-111-111",
                speciesIds: ["111-111-111-111-111"],
                reactionIds: ["111-111-111-111-111"],
              },
            ],
            species: [
              {
                id: "111-111-111-111-111",
                name: "Test Species",
                description: null,
                familyId: "",
                attributes: {},
              },
            ],
            phases: [],
            reactions: [
              {
                id: "111-111-111-111-111",
                name: "Test Reaction",
                description: null,
                type: "ARRHENIUS",
                reactants: [
                  {
                    speciesId: "111-111-111-111-111",
                    coefficient: 0,
                  },
                ],
                products: [
                  {
                    speciesId: "111-111-111-111-111",
                    coefficient: 0,
                  },
                ],
                attributes: {},
              },
            ],
          }}
          initialMechanismId="111-111-111-111-111"
          updateFamily={updateFamily}
        />
      </CustomThemeProvider>,
    );
  });

  afterEach(() => {
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
    cleanup();
  });

  it("renders", () => {
    expect(screen.getByText("Mechanisms")).toBeTruthy();
  });

  it("Displays 'No mechanism selected' when no mechanism is chosen", () => {
    cleanup();
    render(
      <CustomThemeProvider>
        <MechanismsView
          family={{
            id: "111-111-111-111-111",
            name: "Test Family",
            description: "",
            owner: null,
            mechanisms: [],
            species: [],
            phases: [],
            reactions: [],
          }}
          updateFamily={updateFamily}
        />
      </CustomThemeProvider>,
    );
    expect(screen.getByText("No mechanism selected")).toBeTruthy();
  });

  it("Can create mechanisms", async () => {
    const user = userEvent.setup();

    const createMechanismButton = screen.getByTestId("create-mechanism-button");
    fireEvent.click(createMechanismButton);

    const nameBox = screen.getByLabelText("Name *") as HTMLInputElement;
    expect(nameBox).toBeTruthy();
    expect(nameBox.value).toBeFalsy();

    // Input new mechanism name
    await user.type(nameBox, "Another Test Mechanism");
    expect(nameBox.value).toEqual("Another Test Mechanism");

    const finishMechanismButton = screen.getByTestId(
      "create-new-mechanism-button",
    );
    fireEvent.click(finishMechanismButton);

    expect(updateFamily).toHaveBeenCalled();
  });

  it("Errors when new mechanism name is empty", async () => {
    const user = userEvent.setup();

    const createMechanismButton = screen.getByTestId("create-mechanism-button");
    fireEvent.click(createMechanismButton);

    const nameBox = screen.getByLabelText("Name *") as HTMLInputElement;
    expect(nameBox).toBeTruthy();
    expect(nameBox.value).toBeFalsy();

    let finishMechanismButton = screen.getByTestId(
      "create-new-mechanism-button",
    );
    fireEvent.click(finishMechanismButton);
    expect(updateFamily).not.toHaveBeenCalled();

    // Try again
    await user.type(nameBox, "Another Test Mechanism");
    expect(nameBox.value).toEqual("Another Test Mechanism");

    finishMechanismButton = screen.getByTestId("create-new-mechanism-button");
    fireEvent.click(finishMechanismButton);
    expect(updateFamily).toHaveBeenCalled();
  });

  it("Can edit an existing mechanism", () => {
    const nameInput = document.getElementById(
      "edit-mechanism-name",
    ) as HTMLInputElement;
    expect(nameInput).toBeTruthy();
    fireEvent.change(nameInput, {
      target: { value: "Updated Mechanism Name" },
    });
    const applyBtn = screen.getByRole("button", {
      name: "Apply mechanism changes",
    });
    fireEvent.click(applyBtn);
    expect(updateFamily).toHaveBeenCalled();
  });

  it("Can download existing mechanisms as JSON", () => {
    const downloadButton = screen.getAllByTestId("download-mechanism")[0];
    fireEvent.click(downloadButton);

    const jsonButton = screen.getByTestId("download-v1-json");

    fireEvent.click(jsonButton);
  });

  it("Can download existing mechanisms as YAML", () => {
    const downloadButton = screen.getAllByTestId("download-mechanism")[0];
    fireEvent.click(downloadButton);

    const yamlButton = screen.getByTestId("download-v1-yaml");

    fireEvent.click(yamlButton);
  });

  it.skip("Can download existing mechanisms as CAMP V0", () => {
    const downloadButton = screen.getAllByTestId("download-mechanism")[0];
    fireEvent.click(downloadButton);

    const musicBoxButton = screen.getByTestId("download-v0-zip");

    fireEvent.click(musicBoxButton);
  });
});
