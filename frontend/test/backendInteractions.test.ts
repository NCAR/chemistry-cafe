import { describe, expect, test } from "vitest";
import { Family, Reaction, Species } from "../src/types/chemistryModels";
import { APIFamily, APIReaction, APISpecies } from "../src/API/API_Interfaces";
import {
  apiToFrontendReaction,
  apiToFrontendSpecies,
  frontendToAPIReaction,
  frontendToAPISpecies,
} from "../src/helpers/backendInteractions";
import { UUID } from "crypto";

const frontendSpecies: Species = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "Test Species",
  description: "Test Description",
  familyId: "00000000-0000-0000-0000-000000000000",
  attributes: {},
};

const apiSpecies: APISpecies = {
  id: frontendSpecies.id as UUID,
  name: frontendSpecies.name,
  description: frontendSpecies.description,
  familyId: frontendSpecies.id as UUID,
  numericalAttributes: [],
  stringAttributes: [],
};

const frontendReaction: Reaction = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "",
  description: "Test Description",
  type: "NONE",
  reactants: [],
  products: [],
  attributes: {},
};

const apiReaction: APIReaction = {
  id: frontendReaction.id as UUID,
  name: frontendReaction.name,
  description: frontendReaction.description!,
  createdDate: "",
  updatedDate: "",
  numericalAttributes: [],
  stringAttributes: [],
  reactants: [],
  reactionType: frontendReaction.type,
  products: [],
  familyId: "00000000-0000-0000-0000-000000000000",
};

const frontendFamily: Family = {
  owner: null,
  id: "00000000-0000-0000-0000-000000000000",
  name: "Test Family",
  description: "Test Description",
  mechanisms: [],
  species: [frontendSpecies],
  reactions: [frontendReaction],
  phases: [],
};

const apiFamily: APIFamily = {
  id: frontendFamily.id as UUID,
  name: frontendFamily.name,
  description: frontendFamily.description,
  owner: {
    id: "00000000-0000-0000-0000-000000000000",
    username: "",
    role: "",
  },
  species: [apiSpecies],
  reactions: [apiReaction],
  phases: [],
  mechanisms: [],
};

describe("Species Conversion", () => {
  test("Conversion from frontend to backend definition", () => {
    const result = frontendToAPISpecies(frontendSpecies, frontendFamily);
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
});

describe("Reaction Conversion", () => {
  test("Conversion from frontend to backend definition", () => {
    const result = frontendToAPIReaction(frontendReaction, frontendFamily);
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
});
