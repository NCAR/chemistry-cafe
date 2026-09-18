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

describe("Arrhenius parameter translation", () => {
  const arrheniusReaction: Reaction = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "arr",
    description: "",
    type: "ARRHENIUS",
    reactants: [],
    products: [],
    attributes: {
      A: { serializationKey: "A", value: 1.2e-11 },
      B: { serializationKey: "B", value: 0 },
      Ea: { serializationKey: "Ea", value: 100 },
      D: { serializationKey: "D", value: 300 },
      E: { serializationKey: "E", value: 0 },
    },
  };

  test("frontendToAPIReaction writes params to the arrhenius field, not the attribute lists", () => {
    const result = frontendToAPIReaction(arrheniusReaction, frontendFamily);
    expect(result.arrhenius).toEqual({
      a: 1.2e-11,
      b: 0,
      c: null,
      ea: 100,
      d: 300,
      e: 0,
    });
    expect(result.numericalAttributes).toHaveLength(0);
    expect(result.stringAttributes).toHaveLength(0);
  });

  test("apiToFrontendReaction reads the arrhenius field into the attribute bag", () => {
    const apiArrhenius: APIReaction = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "arr",
      reactionType: "ARRHENIUS",
      numericalAttributes: [],
      stringAttributes: [],
      arrhenius: { a: 1.2e-11, b: 0, ea: 100, d: 300, e: 0 },
      reactants: [],
      products: [],
      familyId: "00000000-0000-0000-0000-000000000000",
    };
    const result = apiToFrontendReaction(apiArrhenius);
    expect(result.attributes["A"].value).toBe(1.2e-11);
    expect(result.attributes["Ea"].value).toBe(100);
    expect(result.attributes["D"].value).toBe(300);
    // C was not provided, so it must not appear in the bag.
    expect(result.attributes["C"]).toBeUndefined();
  });
});

describe("Tunneling parameter translation", () => {
  const tunnelingReaction: Reaction = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "tun",
    description: "",
    type: "TUNNELING",
    reactants: [],
    products: [],
    attributes: {
      A: { serializationKey: "A", value: 1.2e-11 },
      B: { serializationKey: "B", value: 0 },
      C: { serializationKey: "C", value: 300 },
    },
  };

  test("frontendToAPIReaction writes params to the tunneling field, not the attribute lists", () => {
    const result = frontendToAPIReaction(tunnelingReaction, frontendFamily);
    expect(result.tunneling).toEqual({
      a: 1.2e-11,
      b: 0,
      c: 300,
    });
    expect(result.numericalAttributes).toHaveLength(0);
    expect(result.stringAttributes).toHaveLength(0);
  });

  test("apiToFrontendReaction reads the tunneling field into the attribute bag", () => {
    const apiTunneling: APIReaction = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "tun",
      reactionType: "TUNNELING",
      numericalAttributes: [],
      stringAttributes: [],
      tunneling: { a: 1.2e-11, b: 0, c: 300 },
      reactants: [],
      products: [],
      familyId: "00000000-0000-0000-0000-000000000000",
    };
    const result = apiToFrontendReaction(apiTunneling);
    expect(result.attributes["A"].value).toBe(1.2e-11);
    expect(result.attributes["B"].value).toBe(0);
    expect(result.attributes["C"].value).toBe(300);
  });
});

describe("Troe parameter translation", () => {
  const troeReaction: Reaction = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "troe",
    description: "",
    type: "TROE",
    reactants: [],
    products: [],
    attributes: {
      k0_A: { serializationKey: "k0_A", value: 1.2e-11 },
      k0_B: { serializationKey: "k0_B", value: 0 },
      k0_C: { serializationKey: "k0_C", value: 300 },
      kinf_A: { serializationKey: "kinf_A", value: 1.0 },
      kinf_B: { serializationKey: "kinf_B", value: 0 },
      kinf_C: { serializationKey: "kinf_C", value: 0 },
      Fc: { serializationKey: "Fc", value: 0.6 },
      N: { serializationKey: "N", value: 1.0 },
    },
  };

  test("frontendToAPIReaction writes params to the troe field, not the attribute lists", () => {
    const result = frontendToAPIReaction(troeReaction, frontendFamily);
    expect(result.troe).toEqual({
      k0A: 1.2e-11,
      k0B: 0,
      k0C: 300,
      kinfA: 1.0,
      kinfB: 0,
      kinfC: 0,
      fc: 0.6,
      n: 1.0,
    });
    expect(result.numericalAttributes).toHaveLength(0);
    expect(result.stringAttributes).toHaveLength(0);
  });

  test("apiToFrontendReaction reads the troe field into the attribute bag", () => {
    const apiTroe: APIReaction = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "troe",
      reactionType: "TROE",
      numericalAttributes: [],
      stringAttributes: [],
      troe: {
        k0A: 1.2e-11,
        k0B: 0,
        k0C: 300,
        kinfA: 1.0,
        kinfB: 0,
        kinfC: 0,
        fc: 0.6,
        n: 1.0,
      },
      reactants: [],
      products: [],
      familyId: "00000000-0000-0000-0000-000000000000",
    };
    const result = apiToFrontendReaction(apiTroe);
    expect(result.attributes["k0_A"].value).toBe(1.2e-11);
    expect(result.attributes["k0_C"].value).toBe(300);
    expect(result.attributes["kinf_A"].value).toBe(1.0);
    expect(result.attributes["Fc"].value).toBe(0.6);
    expect(result.attributes["N"].value).toBe(1.0);
  });
});

describe("Ternary Chemical Activation parameter translation", () => {
  const tcaReaction: Reaction = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "tca",
    description: "",
    type: "TERNARY_CHEMICAL_ACTIVATION",
    reactants: [],
    products: [],
    attributes: {
      k0_A: { serializationKey: "k0_A", value: 1.2e-11 },
      k0_B: { serializationKey: "k0_B", value: 0 },
      k0_C: { serializationKey: "k0_C", value: 300 },
      kinf_A: { serializationKey: "kinf_A", value: 1.0 },
      kinf_B: { serializationKey: "kinf_B", value: 0 },
      kinf_C: { serializationKey: "kinf_C", value: 0 },
      Fc: { serializationKey: "Fc", value: 0.6 },
      N: { serializationKey: "N", value: 1.0 },
    },
  };

  test("frontendToAPIReaction writes params to the ternaryChemicalActivation field, not the attribute lists", () => {
    const result = frontendToAPIReaction(tcaReaction, frontendFamily);
    expect(result.ternaryChemicalActivation).toEqual({
      k0A: 1.2e-11,
      k0B: 0,
      k0C: 300,
      kinfA: 1.0,
      kinfB: 0,
      kinfC: 0,
      fc: 0.6,
      n: 1.0,
    });
    expect(result.numericalAttributes).toHaveLength(0);
    expect(result.stringAttributes).toHaveLength(0);
  });

  test("apiToFrontendReaction reads the ternaryChemicalActivation field into the attribute bag", () => {
    const apiTca: APIReaction = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "tca",
      reactionType: "TERNARY_CHEMICAL_ACTIVATION",
      numericalAttributes: [],
      stringAttributes: [],
      ternaryChemicalActivation: {
        k0A: 1.2e-11,
        k0B: 0,
        k0C: 300,
        kinfA: 1.0,
        kinfB: 0,
        kinfC: 0,
        fc: 0.6,
        n: 1.0,
      },
      reactants: [],
      products: [],
      familyId: "00000000-0000-0000-0000-000000000000",
    };
    const result = apiToFrontendReaction(apiTca);
    expect(result.attributes["k0_A"].value).toBe(1.2e-11);
    expect(result.attributes["k0_C"].value).toBe(300);
    expect(result.attributes["kinf_A"].value).toBe(1.0);
    expect(result.attributes["Fc"].value).toBe(0.6);
    expect(result.attributes["N"].value).toBe(1.0);
  });
});

describe("Branched (no RO2) parameter translation", () => {
  const branchedReaction: Reaction = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "branched",
    description: "",
    type: "BRANCHED_NO_RO2",
    reactants: [],
    products: [],
    attributes: {
      X: { serializationKey: "X", value: 1.2e-11 },
      Y: { serializationKey: "Y", value: 300 },
      a0: { serializationKey: "a0", value: 0.5 },
      n: { serializationKey: "n", value: 6 },
    },
  };

  test("frontendToAPIReaction writes params to the branched field, not the attribute lists", () => {
    const result = frontendToAPIReaction(branchedReaction, frontendFamily);
    expect(result.branched).toEqual({
      x: 1.2e-11,
      y: 300,
      a0: 0.5,
      n: 6,
    });
    expect(result.numericalAttributes).toHaveLength(0);
    expect(result.stringAttributes).toHaveLength(0);
  });

  test("apiToFrontendReaction reads the branched field into the attribute bag", () => {
    const apiBranched: APIReaction = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "branched",
      reactionType: "BRANCHED_NO_RO2",
      numericalAttributes: [],
      stringAttributes: [],
      branched: { x: 1.2e-11, y: 300, a0: 0.5, n: 6 },
      reactants: [],
      products: [],
      familyId: "00000000-0000-0000-0000-000000000000",
    };
    const result = apiToFrontendReaction(apiBranched);
    expect(result.attributes["X"].value).toBe(1.2e-11);
    expect(result.attributes["Y"].value).toBe(300);
    expect(result.attributes["a0"].value).toBe(0.5);
    expect(result.attributes["n"].value).toBe(6);
  });
});

describe("Taylor Series parameter translation", () => {
  const taylorSeriesReaction: Reaction = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "taylor series",
    description: "",
    type: "TAYLOR_SERIES",
    reactants: [],
    products: [],
    attributes: {
      A: { serializationKey: "A", value: 1.0 },
      B: { serializationKey: "B", value: 0.0 },
      Ea: { serializationKey: "Ea", value: 0.0 },
      D: { serializationKey: "D", value: 300.0 },
      E: { serializationKey: "E", value: 0.0 },
      "taylor coefficients": {
        serializationKey: "taylor coefficients",
        value: [1, 2, 3],
      },
    },
  };

  test("frontendToAPIReaction writes params to the taylorSeries field, not the attribute lists", () => {
    const result = frontendToAPIReaction(taylorSeriesReaction, frontendFamily);
    expect(result.taylorSeries).toEqual({
      a: 1.0,
      b: 0.0,
      c: null,
      ea: 0.0,
      d: 300.0,
      e: 0.0,
      taylorCoefficients: [1, 2, 3],
    });
    expect(result.numericalAttributes).toHaveLength(0);
    expect(result.stringAttributes).toHaveLength(0);
  });

  test("apiToFrontendReaction reads the taylorSeries field into the attribute bag", () => {
    const apiTaylorSeries: APIReaction = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "taylor series",
      reactionType: "TAYLOR_SERIES",
      numericalAttributes: [],
      stringAttributes: [],
      taylorSeries: {
        a: 1.0,
        b: 0.0,
        ea: 0.0,
        d: 300.0,
        e: 0.0,
        taylorCoefficients: [1, 2, 3],
      },
      reactants: [],
      products: [],
      familyId: "00000000-0000-0000-0000-000000000000",
    };
    const result = apiToFrontendReaction(apiTaylorSeries);
    expect(result.attributes["A"].value).toBe(1.0);
    expect(result.attributes["B"].value).toBe(0.0);
    expect(result.attributes["Ea"].value).toBe(0.0);
    expect(result.attributes["D"].value).toBe(300.0);
    expect(result.attributes["E"].value).toBe(0.0);
    expect(result.attributes["taylor coefficients"].value).toEqual([1, 2, 3]);
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
        {
          ...frontendSpecies,
          id: speciesId,
        },
      ],
      reactions: [
        {
          ...frontendReaction,
          id: "22222222-2222-2222-2222-222222222222" as UUID,
          reactants: [{ speciesId, coefficient: 1 }],
          products: [],
        },
      ],
      phases: [],
      mechanisms: [],
    };

    const patchSpy = vi
      .spyOn(axios, "patch")
      .mockResolvedValue(createMockData(apiFamily));
    vi.spyOn(axios, "get").mockResolvedValue(createMockData(apiFamily));

    await saveFamilyChanges(family);

    // The whole family is now saved in a single request to the families
    // endpoint. The reaction inside that payload must still reference the
    // species by the id we created it with — the backend honors client ids,
    // so no remapping is needed.
    const familyCall = patchSpy.mock.calls.find(([url]) =>
      String(url).includes("families"),
    );
    expect(familyCall).toBeDefined();
    const sentFamily = familyCall![1] as APIFamily;
    expect(sentFamily.reactions[0].reactants[0].speciesId).toBe(speciesId);
  });
});
