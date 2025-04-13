import { describe, expect, it, beforeEach, afterEach, vi, test } from "vitest";
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
    const testFamilyTreeButton = screen.getByLabelText(
      "Expand options for Test Family family",
    );
    expect(testFamilyTreeButton).toBeTruthy();
    testFamilyTreeButton.ariaExpanded = "true";
    fireEvent.click(testFamilyTreeButton!);
  });

  it("Can create an entire family", async () => {
    await waitFor(() => {
      expect(screen.getByText("Test Family")).toBeTruthy();
    });
    const createFamilyButton = screen.getByLabelText("Create Family");
    expect(createFamilyButton).toBeTruthy();
    fireEvent.click(createFamilyButton);

    const nameBox = screen.getByLabelText("Name *");
    expect(nameBox).toBeTruthy();
    fireEvent.focus(nameBox);
    fireEvent.keyDown(nameBox, {
      key: "p",
    });

    const descriptionBox = screen.getByLabelText("Description");
    expect(descriptionBox).toBeTruthy();

    const creationButton = screen.getByText("Create");
    fireEvent.click(creationButton);

    // const familyButton = screen.getByText("p");
    // expect(familyButton).toBeTruthy();
  });

  it("Errors when name is empty for family", () => {
    const createFamilyButton = screen.getByLabelText("Create Family");
    expect(createFamilyButton).toBeTruthy();
    fireEvent.click(createFamilyButton);

    const nameBox = screen.getByLabelText("Name *");
    expect(nameBox).toBeTruthy();
    nameBox.innerText = "Test Family";

    const descriptionBox = screen.getByLabelText("Description");
    expect(descriptionBox).toBeTruthy();

    let creationButton = screen.getByText("Create");
    expect(creationButton).toBeTruthy();
    fireEvent.click(creationButton);
  });
});

describe("MechanismEditor", () => {
  it("renders", () => {
    render(
      <CustomThemeProvider>
        <MechanismEditor
          family={{
            id: "111-111-111-111-111",
            name: "Test Family",
            description: "",
            mechanisms: [{
              id: "uofsa-w98fai-asf-asf-asf",
              name: "Test Mechanism",
              description: "",
              phases: [],
              familyId: "111-111-111-111",
              speciesIds: [],
              reactionIds: [],
            }],
            species: [],
            reactions: [],
          }}
          mechanism={{
            id: "uofsa-w98fai-asf-asf-asf",
            name: "Test Mechanism",
            description: "",
            phases: [],
            familyId: "111-111-111-111",
            speciesIds: [],
            reactionIds: [],
          }}
          updateMechanism={vi.fn()}
          navigateBack={vi.fn()}
        />
      </CustomThemeProvider>,
    );
  });
});

describe("SpeciesView", () => {
  it("renders", () => {
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
          updateFamily={vi.fn()}
        />
      </CustomThemeProvider>,
    );
  });
});

describe("ReactionsView", () => {
  it("renders", () => {
    render(
      <CustomThemeProvider>
        <ReactionsView
          family={{
            id: "111-111-111-111-111",
            name: "Test Family",
            description: "",
            mechanisms: [],
            species: [],
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
                description: "This one has a description",
                type: "FIRST_ORDER_LOSS",
                reactants: [],
                products: [],
                attributes: {}
              },
            ],
          }}
          updateFamily={vi.fn()}
        />
      </CustomThemeProvider>,
    );
  });
});

describe("MechanismsView", () => {
  it("renders", () => {
    render(
      <CustomThemeProvider>
        <MechanismsView
          family={{
            id: "111-111-111-111-111",
            name: "Test Family",
            description: "",
            mechanisms: [{
              id: "uofsa-w98fai-asf-asf-asf",
              name: "Test Mechanism",
              description: "",
              phases: [],
              familyId: "111-111-111-111",
              speciesIds: [],
              reactionIds: [],
            }],
            species: [],
            reactions: [],
          }}
          updateFamily={vi.fn()}
        />
      </CustomThemeProvider>,
    );
  });
});
