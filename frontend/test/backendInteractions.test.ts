import { describe, expect, test, vi } from "vitest";
import {
  Family,
  Mechanism,
  Phase,
  Reaction,
  Species,
} from "../src/types/chemistryModels";
import {
  APIFamily,
  APIMechanism,
  APIPhase,
  APIReaction,
  APISpecies,
  APIUser,
} from "../src/API/API_Interfaces";
import {
  apiToFrontendFamily,
  apiToFrontendMechanism,
  apiToFrontendPhase,
  apiToFrontendReaction,
  apiToFrontendSpecies,
  frontendToAPIFamily,
  frontendToAPIMechanism,
  frontendToAPIPhase,
  frontendToAPIReaction,
  frontendToAPISpecies,
  saveFamilyChanges,
  uploadFamily,
} from "../src/helpers/backendInteractions";
import { UUID } from "crypto";
import axios, { AxiosHeaders, AxiosResponse } from "axios";

const user: APIUser = {
  id: "00000000-0000-0000-0000-000000000000",
  username: "Test User",
  role: "",
};

const frontendSpecies: Species = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "Test Species",
  description: "Test Description",
  familyId: "00000000-0000-0000-0000-000000000000",
  attributes: {
    weight: {
      serializationKey: "weight",
      value: 0.0,
    },
    "another key [K]": {
      serializationKey: "another key [K]",
      value: "val",
    },
  },
};

const apiSpecies: APISpecies = {
  id: frontendSpecies.id as UUID,
  name: frontendSpecies.name,
  description: frontendSpecies.description,
  familyId: frontendSpecies.id as UUID,
  numericalAttributes: [
    {
      serializationKey: frontendSpecies.attributes["weight"].serializationKey,
      value: frontendSpecies.attributes["weight"].value as number,
    },
  ],
  stringAttributes: [
    {
      serializationKey:
        frontendSpecies.attributes["another key [K]"].serializationKey,
      value: frontendSpecies.attributes["another key [K]"].value as string,
    },
  ],
};

const frontendPhase: Phase = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "gas",
  description: null,
  speciesIds: [apiSpecies.id],
};

const apiPhase: APIPhase = {
  id: frontendPhase.id as UUID,
  name: frontendPhase.name,
  familyId: "00000000-0000-0000-0000-000000000000",
  species: [],
};

const frontendReaction: Reaction = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "",
  description: "Test Description",
  type: "ARRHENIUS",
  reactants: [],
  products: [],
  attributes: {
    weight: {
      serializationKey: "weight",
      value: 0.0,
    },
    "another key [K]": {
      serializationKey: "another key [K]",
      value: "val",
    },
  },
};

const apiReaction: APIReaction = {
  id: frontendReaction.id as UUID,
  name: frontendReaction.name,
  description: frontendReaction.description!,
  createdDate: "",
  updatedDate: "",
  numericalAttributes: [
    {
      serializationKey: frontendReaction.attributes["weight"].serializationKey,
      value: frontendReaction.attributes["weight"].value as number,
    },
  ],
  stringAttributes: [
    {
      serializationKey:
        frontendReaction.attributes["another key [K]"].serializationKey,
      value: frontendReaction.attributes["another key [K]"].value as string,
    },
  ],
  reactants: [],
  reactionType: frontendReaction.type,
  products: [],
  familyId: "00000000-0000-0000-0000-000000000000",
};

const frontendMechanism: Mechanism = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "Test Mechanism",
  description: null,
  familyId: "00000000-0000-0000-0000-000000000000",
  speciesIds: [frontendSpecies.id],
  reactionIds: [frontendReaction.id],
  phaseIds: [frontendPhase.id],
};

const apiMechanism: APIMechanism = {
  id: frontendMechanism.id as UUID,
  name: frontendMechanism.name,
  species: [],
  phases: [],
  reactions: [],
  familyId: frontendMechanism.familyId as UUID,
};

const frontendFamily: Family = {
  owner: user,
  id: "00000000-0000-0000-0000-000000000000",
  name: "Test Family",
  description: "Test Description",
  mechanisms: [frontendMechanism],
  species: [frontendSpecies],
  reactions: [frontendReaction],
  phases: [frontendPhase],
};

const apiFamily: APIFamily = {
  id: frontendFamily.id as UUID,
  name: frontendFamily.name,
  description: frontendFamily.description,
  owner: user,
  species: [apiSpecies],
  reactions: [apiReaction],
  phases: [apiPhase],
  mechanisms: [apiMechanism],
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

describe("Phase Conversion", () => {
  test("Conversion from frontend to backend definition", () => {
    const result = frontendToAPIPhase(frontendPhase, frontendFamily);
    expect(result.id).toEqual(apiPhase.id);
    expect(result.name).toEqual(apiPhase.name);
  });

  test("Conversion from backend to frontend definition", () => {
    const result = apiToFrontendPhase(apiPhase);
    expect(result.id).toEqual(frontendPhase.id);
    expect(result.name).toEqual(frontendPhase.name);
  });
});

describe("Mechanism Conversion", () => {
  test("Conversion from frontend to backend definition", () => {
    const result = frontendToAPIMechanism(frontendMechanism, frontendFamily);
    expect(result.id).toEqual(apiMechanism.id);
    expect(result.name).toEqual(apiMechanism.name);
  });

  test("Conversion from backend to frontend definition", () => {
    const result = apiToFrontendMechanism(apiMechanism);
    expect(result.id).toEqual(frontendMechanism.id);
    expect(result.name).toEqual(frontendMechanism.name);
  });
});

describe("Family Conversion", () => {
  test("Conversion from frontend to backend definition", () => {
    const result = frontendToAPIFamily(frontendFamily);
    expect(result.id).toEqual(apiFamily.id);
    expect(result.name).toEqual(apiFamily.name);
    expect(result.species.length).not.toBe(0);
    expect(result.reactions.length).not.toBe(0);
    expect(result.phases.length).not.toBe(0);
    expect(result.mechanisms.length).not.toBe(0);
  });

  test("Conversion from backend to frontend definition", () => {
    const result = apiToFrontendFamily(apiFamily);
    expect(result.id).toEqual(frontendFamily.id);
    expect(result.name).toEqual(frontendFamily.name);
  });

  test("Conversion to non-expanded family (shallow values)", () => {
    const result = frontendToAPIFamily(frontendFamily, false);
    expect(result.species.length).toBe(0);
    expect(result.reactions.length).toBe(0);
    expect(result.phases.length).toBe(0);
    expect(result.mechanisms.length).toBe(0);
  });
});

vi.mock("axios");

function createMockData(data: any): AxiosResponse {
  return {
    data: data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {
      headers: new AxiosHeaders({ "Content-Type": "text/plain" }),
    },
  } as AxiosResponse;
}

describe("Uploading a family", () => {
  test("Succeeds with a valid family", async () => {
    vi.spyOn(axios, "post")
      .mockResolvedValueOnce(createMockData(apiFamily))
      .mockResolvedValueOnce(createMockData(apiSpecies))
      .mockResolvedValueOnce(createMockData(apiPhase))
      .mockResolvedValueOnce(createMockData(apiReaction))
      .mockResolvedValueOnce(createMockData(apiMechanism));

    vi.spyOn(axios, "get").mockResolvedValue(createMockData(apiFamily));

    const result = await uploadFamily(frontendFamily, user);

    expect(result.id).equals(apiFamily.id);
    expect(result.species.at(0)?.id).equals(apiSpecies.id);
    expect(result.reactions.at(0)?.id).equals(apiReaction.id);
    expect(result.phases.at(0)?.id).equals(apiPhase.id);
    expect(result.mechanisms.at(0)?.id).equals(apiMechanism.id);
  });
});

describe("saveFamilyChanges reference integrity", () => {
  test("sends a reaction referencing the species by the same client id (no remap)", async () => {
    const speciesId = "11111111-1111-1111-1111-111111111111" as UUID;
    const family: Family = {
      ...frontendFamily,
      owner: user,
      isInDatabase: true,
      isModified: true,
      species: [
        { ...frontendSpecies, id: speciesId, isInDatabase: false, isDeleted: false },
      ],
      reactions: [
        {
          ...frontendReaction,
          id: "22222222-2222-2222-2222-222222222222" as UUID,
          isInDatabase: false,
          isDeleted: false,
          reactants: [{ speciesId, coefficient: 1 }],
          products: [],
        },
      ],
      phases: [],
      mechanisms: [],
    };

    const postSpy = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockData(apiSpecies));
    vi.spyOn(axios, "patch").mockResolvedValue(createMockData(apiFamily));
    vi.spyOn(axios, "get").mockResolvedValue(createMockData(apiFamily));

    await saveFamilyChanges(family);

    // The reaction must be sent referencing the species by the id we created it
    // with — the backend now honors client ids, so no remapping is needed.
    const reactionCall = postSpy.mock.calls.find(([url]) =>
      String(url).includes("reactions"),
    );
    expect(reactionCall).toBeDefined();
    const sentReaction = reactionCall![1] as APIReaction;
    expect(sentReaction.reactants[0].speciesId).toBe(speciesId);
  });
});
