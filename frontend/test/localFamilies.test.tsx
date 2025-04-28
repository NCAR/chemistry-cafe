import { afterEach, describe } from "node:test";
import {
  Family,
  Mechanism,
  Phase,
  Reaction,
  Species,
} from "../src/types/chemistryModels";
import { beforeAll, expect, it, test } from "vitest";
import {
  addUploadedFamilyIdLocally,
  clearFamiliesLocally,
  cloneFamily,
} from "../src/helpers/localFamilies";
import { UUID } from "crypto";

const species: Species = {
  id: "111-222-333-444-555",
  name: "Test Species",
  description: null,
  familyId: "",
  attributes: {
    weight: {
      name: "weight",
      serializationKey: "weight",
      value: 1e-2,
    },
    "density [kg m3]": {
      name: "Density",
      serializationKey: "density [kg m3]",
      value: 1e-2,
    },
  },
};

const reaction: Reaction = {
  id: "111-222-333-444-555",
  name: "Test Reaction",
  description: null,
  type: "PHOTOLYSIS",
  reactants: [
    {
      speciesId: species.id,
      coefficient: 1,
    },
  ],
  products: [
    {
      speciesId: species.id,
      coefficient: 1,
    },
  ],
  attributes: {
    "attribute [mol]": {
      name: "Attribute",
      value: 1.0,
      serializationKey: "attribute [mol]",
    },
    "another attribute": {
      name: "another attribute",
      serializationKey: "another attribute",
      value: 1.0,
    },
  },
};

const phase: Phase = {
  id: "120948",
  name: "Test Phase",
  description: null,
  speciesIds: [species.id],
};

const mechanism: Mechanism = {
  id: "1423",
  name: "Test Mechanism",
  description: null,
  phaseIds: [phase.id],
  familyId: "1234",
  speciesIds: [species.id],
  reactionIds: [reaction.id],
};

const family: Family = {
  id: "1234",
  name: "Test Family",
  description: "Test Description",
  species: [species],
  phases: [phase],
  reactions: [reaction],
  mechanisms: [mechanism],
  owner: null,
};

describe("cloneFamily", () => {
  it("Creates a copy of a family", () => {
    const result = cloneFamily(family);

    expect(result.name).toEqual(family.name);
    expect(result.description).toEqual(family.description);
    expect(result.id).not.toEqual(family.id);

    expect(result.species.at(0)?.name).toEqual(family.species.at(0)?.name);
    expect(result.species.at(0)?.id).not.toEqual(family.species.at(0)?.id);

    expect(result.phases.at(0)?.name).toEqual(family.phases.at(0)?.name);
    expect(result.phases.at(0)?.id).not.toEqual(family.phases.at(0)?.id);

    expect(result.reactions.at(0)?.name).toEqual(family.reactions.at(0)?.name);
    expect(result.reactions.at(0)?.id).not.toEqual(family.reactions.at(0)?.id);

    expect(result.mechanisms.at(0)?.name).toEqual(
      family.mechanisms.at(0)?.name,
    );
    expect(result.mechanisms.at(0)?.id).not.toEqual(
      family.mechanisms.at(0)?.id,
    );
  });
});

describe("localStorage family management", () => {
  afterEach(() => {
    localStorage.clear();
  });

  test("Can add uploaded family ids without dupes", () => {
    const testIds: Array<UUID> = [
      "41fef6ec-99dc-463b-8fec-cecc97366544",
      "41fef6ec-99dc-463b-8fec-cecc97366544", // Duplicate id which should not be added
      "f057f867-4963-471a-b1fb-18e7ef091a38",
      "6442d9fc-a475-438a-a449-85c8bb55db3c",
    ];

    for (const id of testIds) {
      addUploadedFamilyIdLocally(id);
    }

    expect(localStorage.getItem("uploadedFamilyIds")).toBeDefined();
    const familyIds = JSON.parse(localStorage.getItem("uploadedFamilyIds")!);

    const idCount = {};
    for (const id of familyIds) {
      expect(idCount[id]).not.toBeDefined(); // Checks for duplicate values
      idCount[id] = id;
    }
  });

  test("Family keys are cleared", () => {
    localStorage.setItem("localFamilies", "value");
    localStorage.setItem("uploadedFamilyIds", "value");

    expect(localStorage.getItem("localFamilies")).toBeTruthy();
    expect(localStorage.getItem("uploadedFamilyIds")).toBeTruthy();

    clearFamiliesLocally();
    expect(localStorage.getItem("localFamilies")).toBeFalsy();
    expect(localStorage.getItem("uploadedFamilyIds")).toBeFalsy();
  });
});
