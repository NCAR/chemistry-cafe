import { describe, expect, it, beforeEach, afterEach, vi, test, beforeAll, afterAll } from "vitest";
import { AuthProvider } from "../src/components/AuthContext";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { APIFamily } from "../src/API/API_Interfaces";
import FamilyPage, {
  MechanismsView,
  ReactionsView,
  SpeciesView,
} from "../src/pages/FamilyPage";
import { CustomThemeProvider } from "../src/components/CustomThemeContext";
import { MechanismEditor } from "../src/components/MechanismEditor";

vi.mock("axios");

const testFamilies: Array<APIFamily> = [
  {
    id: "111-111-111-111-111",
    name: "Test Family",
    description: "Test Family",
    owner: {
      id: "11-22-33-44-55",
      username: "Test User",
      role: "admin",
    },
    species: [],
    reactions: [],
  },
]

describe("Family Editor Page", () => {
  const originalLocation = window.location;
  function createMockData(): AxiosResponse {
    return {
      data: testFamilies as Array<APIFamily>,
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
      assign: vi.fn((_: string | URL) => { }),
    } as any;
    vi.spyOn(axios, "get").mockResolvedValue(createMockData());

    render(
      <AuthProvider>
        <CustomThemeProvider>
          <MemoryRouter initialEntries={["/", "/loggedIn"]}>
            <FamilyPage />
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
      expect(screen.getByText("Test Family")).toBeTruthy();
    });

    expect(screen.queryByText("Not Real Family")).toBeFalsy();

    const testFamilyTreeButton = screen.getByLabelText(
      "Expand options for Test Family family",
    );
    expect(testFamilyTreeButton).toBeTruthy();
    testFamilyTreeButton.ariaExpanded = "true";
    fireEvent.click(testFamilyTreeButton!);
  });

  it("Can create a family", async () => {
    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Test Family")).toBeTruthy();
    });

    const createFamilyButton = screen.getByTestId("create-family-button");
    expect(createFamilyButton).toBeTruthy();
    fireEvent.click(createFamilyButton);

    const nameBox = screen.getByLabelText("Name *") as HTMLInputElement;
    expect(nameBox).toBeTruthy();
    expect(nameBox.value).toBeFalsy();

    // Input the new family name
    await user.type(nameBox, "Another Family");
    expect(nameBox.value).toEqual("Another Family");

    const creationButton = screen.getByText("Create");
    fireEvent.click(creationButton);

    const familyButton = screen.queryByText("Another Family");
    expect(familyButton).toBeTruthy();
  });

  it("Errors when name is empty for family", () => {
    const createFamilyButton = screen.getByLabelText("Create Family");
    expect(createFamilyButton).toBeTruthy();
    fireEvent.click(createFamilyButton);

    const nameBox = screen.getByLabelText("Name *");
    expect(nameBox).toBeTruthy();

    const descriptionBox = screen.getByLabelText("Description");
    expect(descriptionBox).toBeTruthy();

    let creationButton = screen.getByText("Create");
    expect(creationButton).toBeTruthy();
    fireEvent.click(creationButton);
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
            mechanisms: [{
              id: "111-111-111-111-111",
              name: "Test Mechanism",
              description: "",
              phases: [],
              familyId: "111-111-111-111",
              speciesIds: ["111-111-111-111-111"],
              reactionIds: ["111-111-111-111-111"],
            }],
            species: [{
              id: "111-111-111-111-111",
              name: "Test Species",
              description: null,
              familyId: "",
              attributes: {}
            }],
            reactions: [{
              id: "111-111-111-111-111",
              name: "Test Reaction",
              description: null,
              type: "NONE",
              reactants: [{
                speciesId: "111-111-111-111-111",
                coefficient: 0
              }],
              products: [{
                speciesId: "111-111-111-111-111",
                coefficient: 0
              }],
              attributes: {}
            }],
          }}
          mechanism={{
            id: "111-111-111-111-111",
            name: "Test Mechanism",
            description: "",
            phases: [],
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

describe("SpeciesView", () => {
  let updateFamily = vi.fn();

  beforeEach(() => {
    updateFamily = vi.fn()
    render(
      <CustomThemeProvider>
        <SpeciesView
          family={{
            id: "111-111-111-111-111",
            name: "Test Family",
            description: "",
            mechanisms: [],
            species: [{
              id: "111-111-111-111-333",
              name: "Test Species",
              description: "Cool species",
              familyId: "111-111-111-111-111",
              attributes: {},
              isDeleted: false,
              isInDatabase: true,
              isModified: false
            }],
            reactions: [
              {
                id: "111-111-111-111",
                name: "Test Reaction",
                description: "",
                type: "NONE",
                reactants: [],
                products: [],
                attributes: {}
              },
              {
                id: "222-222-222-222",
                name: "Another Test Reaction",
                description: "",
                type: "FIRST_ORDER_LOSS",
                reactants: [],
                products: [],
                attributes: {}
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
  })

  it("renders", () => {
    expect(screen.getByText("Chemical Species")).toBeTruthy();
  });

  it("Can create species", async () => {
    const user = userEvent.setup();

    const addSpeciesButton = screen.getByTestId("add-species-button");
    fireEvent.click(addSpeciesButton);

    const nameBox = screen.getByLabelText("Name *") as HTMLInputElement;
    expect(nameBox).toBeTruthy();
    expect(nameBox.value).toBeFalsy();

    const descriptionBox = screen.getByLabelText("Description") as HTMLInputElement;
    expect(descriptionBox).toBeTruthy();
    expect(descriptionBox.value).toBeFalsy();

    const molecularWeightBox = screen.getByLabelText("Molecular Weight") as HTMLInputElement;
    expect(molecularWeightBox).toBeTruthy();
    expect(molecularWeightBox.value).toEqual("0");

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

  it("Can remove species", async () => {
    const actionsButton = screen.getByTestId("row-actions-button");
    fireEvent.click(actionsButton);

    const deleteButton = screen.getByTestId("delete-row");
    fireEvent.click(deleteButton);
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
            mechanisms: [],
            species: [{
              id: "111-111-111-111-333",
              name: "Test Species",
              description: "Cool species",
              familyId: "111-111-111-111-111",
              attributes: {},
              isDeleted: false,
              isInDatabase: true,
              isModified: false
            }],
            reactions: [
              {
                id: "111-111-111-111",
                name: "Test Reaction",
                description: "",
                type: "ARRHENIUS",
                reactants: [{
                  speciesId: "111-111-111-111-333",
                  coefficient: 1.0
                }],
                products: [{
                  speciesId: "111-111-111-111-333",
                  coefficient: 1.0
                }],
                attributes: {}
              },
              {
                id: "222-222-222-222",
                name: "Another Test Reaction",
                description: "This one has a description",
                type: "FIRST_ORDER_LOSS",
                reactants: [{
                  speciesId: "111-111-111-111-333",
                  coefficient: 2
                }],
                products: [{
                  speciesId: "111-111-111-111-333",
                  coefficient: 2
                }],
                attributes: {}
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

    const nameBox = screen.getByLabelText("Name *") as HTMLInputElement;
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
    const actionsButton = screen.getAllByTestId("row-actions-button")[0];
    fireEvent.click(actionsButton);

    const deleteButton = screen.getByTestId("delete-row");
    fireEvent.click(deleteButton);
    expect(updateFamily).toHaveBeenCalled();
  });

  it("Can edit reactions", async () => {
    const actionsButton = screen.getAllByTestId("row-actions-button")[0];
    fireEvent.click(actionsButton);

    const deleteButton = screen.getByTestId("edit-row");
    fireEvent.click(deleteButton);
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
            mechanisms: [{
              id: "111-111-111-111-111",
              name: "Test Mechanism",
              description: "",
              phases: [],
              familyId: "111-111-111-111",
              speciesIds: ["111-111-111-111-111"],
              reactionIds: ["111-111-111-111-111"],
            }],
            species: [{
              id: "111-111-111-111-111",
              name: "Test Species",
              description: null,
              familyId: "",
              attributes: {}
            }],
            reactions: [{
              id: "111-111-111-111-111",
              name: "Test Reaction",
              description: null,
              type: "NONE",
              reactants: [{
                speciesId: "111-111-111-111-111",
                coefficient: 0
              }],
              products: [{
                speciesId: "111-111-111-111-111",
                coefficient: 0
              }],
              attributes: {}
            }],
          }}
          updateFamily={updateFamily}
        />
      </CustomThemeProvider>,
    );
  })

  afterEach(() => {
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
    cleanup();
  });

  it("renders", () => {
    expect(screen.getByText("Mechanisms")).toBeTruthy();
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

    const finishMechanismButton = screen.getByTestId("create-new-mechanism-button");
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

    let finishMechanismButton = screen.getByTestId("create-new-mechanism-button");
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
    const editButton = screen.getAllByTestId("edit-mechanism")[0];
    fireEvent.click(editButton);
  });

  it("Can download existing mechanisms", () => {
    const downloadButton = screen.getAllByTestId("download-mechanism")[0];
    fireEvent.click(downloadButton);

    const jsonButton = screen.getByTestId("download-v1-json");
    const yamlButton = screen.getByTestId("download-v1-yaml");
    const musicBoxButton = screen.getByTestId("download-v0-zip");


    fireEvent.click(jsonButton);
    fireEvent.click(yamlButton);
    fireEvent.click(musicBoxButton);
  });
});
