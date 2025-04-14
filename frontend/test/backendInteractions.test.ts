import { describe, expect, test } from "vitest";
import { Reaction, Species } from "../src/types/chemistryModels";
import { APIReaction, APISpecies } from "../src/API/API_Interfaces";
import {
  apiToFrontendReaction,
  apiToFrontendSpecies,
  frontendToAPIReaction,
  frontendToAPISpecies,
} from "../src/helpers/backendInteractions";
import { UUID } from "crypto";

const frontendSpecies: Species = {
  id: "111-111-111-111-111",
  name: "Test Species",
  description: "Test Description",
  familyId: "111-111-111-111-111",
  attributes: {},
};

const apiSpecies: APISpecies = {
  id: frontendSpecies.id as UUID,
  name: frontendSpecies.name,
  description: frontendSpecies.description,
  familyId: frontendSpecies.id as UUID,
};

describe("Species Conversion", () => {
  test("Conversion from frontend to backend definition", () => {
    const result = frontendToAPISpecies(frontendSpecies);
    expect(result.id).toEqual(apiSpecies.id);
    expect(result.name).toEqual(apiSpecies.name);
    expect(result.description).toEqual(apiSpecies.description);
    expect(result.familyId).toEqual(apiSpecies.familyId);
  });

  test("Conversion from backend to frontend definition", () => {
    const result = apiToFrontendSpecies(apiSpecies);
    expect(result.id).toEqual(frontendSpecies.id);
    expect(result.name).toEqual(frontendSpecies.name);
    expect(result.description).toEqual(frontendSpecies.description);
    expect(result.familyId).toEqual(frontendSpecies.familyId);
  });

  test("Throws when api definition does not have an id", () => {
    expect(() =>
      apiToFrontendSpecies({
        name: null,
        description: null,
        familyId: "111-111-111-111-111",
      }),
    ).toThrow();
  });
});

const frontendReaction: Reaction = {
  id: "111-111-111-111-111",
  name: "",
  description: null,
  type: "NONE",
  reactants: [],
  products: [],
  attributes: {},
};

const apiReaction: APIReaction = {
  id: frontendReaction.id as UUID,
  name: frontendReaction.name,
  description: frontendReaction.description,
};

describe("Reaction Conversion", () => {
  test("Conversion from frontend to backend definition", () => {
    const result = frontendToAPIReaction(frontendReaction);
    expect(result.id).toEqual(apiReaction.id);
    expect(result.name).toEqual(apiReaction.name);
    expect(result.description).toEqual(apiReaction.description);
  });

  test("Conversion from backend to frontend definition", () => {
    const result = apiToFrontendReaction(apiReaction);
    expect(result.id).toEqual(frontendReaction.id);
    expect(result.name).toEqual(frontendReaction.name);
    expect(result.description).toEqual(frontendReaction.description);
  });

  test("Throws when api definition does not have an id", () => {
    expect(() =>
      apiToFrontendReaction({
        name: "",
        description: null,
      }),
    ).toThrow();
  });
});
