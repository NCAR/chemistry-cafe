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

  test("isThirdBody round-trips in both directions", () => {
    const thirdBodySpecies: Species = {
      ...frontendSpecies,
      name: "M",
      isThirdBody: true,
    };
    const toApi = frontendToAPISpecies(thirdBodySpecies, frontendFamily);
    expect(toApi.isThirdBody).toBe(true);

    const apiThirdBodySpecies: APISpecies = { ...apiSpecies, isThirdBody: true };
    const toFrontend = apiToFrontendSpecies(apiThirdBodySpecies);
    expect(toFrontend.isThirdBody).toBe(true);
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

  test("gas phase and aerosol phase references round-trip in both directions", () => {
    const phaseReaction: Reaction = {
      ...frontendReaction,
      gasPhaseId: "11111111-1111-1111-1111-111111111111",
      gasPhaseSpeciesId: "22222222-2222-2222-2222-222222222222",
      aerosolPhaseId: "33333333-3333-3333-3333-333333333333",
      aerosolPhaseSpeciesId: "44444444-4444-4444-4444-444444444444",
      aerosolPhaseWaterId: "55555555-5555-5555-5555-555555555555",
    };
    const toApi = frontendToAPIReaction(phaseReaction, frontendFamily);
    expect(toApi.gasPhaseId).toEqual(phaseReaction.gasPhaseId);
    expect(toApi.gasPhaseSpeciesId).toEqual(phaseReaction.gasPhaseSpeciesId);
    expect(toApi.aerosolPhaseId).toEqual(phaseReaction.aerosolPhaseId);
    expect(toApi.aerosolPhaseSpeciesId).toEqual(
      phaseReaction.aerosolPhaseSpeciesId,
    );
    expect(toApi.aerosolPhaseWaterId).toEqual(
      phaseReaction.aerosolPhaseWaterId,
    );

    const apiPhaseReaction: APIReaction = {
      ...apiReaction,
      gasPhaseId: phaseReaction.gasPhaseId,
      gasPhaseSpeciesId: phaseReaction.gasPhaseSpeciesId,
      aerosolPhaseId: phaseReaction.aerosolPhaseId,
      aerosolPhaseSpeciesId: phaseReaction.aerosolPhaseSpeciesId,
      aerosolPhaseWaterId: phaseReaction.aerosolPhaseWaterId,
    };
    const toFrontend = apiToFrontendReaction(apiPhaseReaction);
    expect(toFrontend.gasPhaseId).toEqual(phaseReaction.gasPhaseId);
    expect(toFrontend.gasPhaseSpeciesId).toEqual(
      phaseReaction.gasPhaseSpeciesId,
    );
    expect(toFrontend.aerosolPhaseId).toEqual(phaseReaction.aerosolPhaseId);
    expect(toFrontend.aerosolPhaseSpeciesId).toEqual(
      phaseReaction.aerosolPhaseSpeciesId,
    );
    expect(toFrontend.aerosolPhaseWaterId).toEqual(
      phaseReaction.aerosolPhaseWaterId,
    );
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

describe("Surface parameter translation", () => {
  const surfaceReaction: Reaction = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "surface",
    description: "",
    type: "SURFACE",
    reactants: [],
    products: [],
    attributes: {
      "reaction probability": {
        serializationKey: "reaction probability",
        value: 1.0,
      },
    },
  };

  test("frontendToAPIReaction writes params to the surface field, not the attribute lists", () => {
    const result = frontendToAPIReaction(surfaceReaction, frontendFamily);
    expect(result.surface).toEqual({
      reactionProbability: 1.0,
    });
    expect(result.numericalAttributes).toHaveLength(0);
    expect(result.stringAttributes).toHaveLength(0);
  });

  test("apiToFrontendReaction reads the surface field into the attribute bag", () => {
    const apiSurface: APIReaction = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "surface",
      reactionType: "SURFACE",
      numericalAttributes: [],
      stringAttributes: [],
      surface: { reactionProbability: 1.0 },
      reactants: [],
      products: [],
      familyId: "00000000-0000-0000-0000-000000000000",
    };
    const result = apiToFrontendReaction(apiSurface);
    expect(result.attributes["reaction probability"].value).toBe(1.0);
  });
});

describe("Emission parameter translation", () => {
  const emissionReaction: Reaction = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "emission",
    description: "",
    type: "EMISSION",
    reactants: [],
    products: [],
    attributes: {
      "scaling factor": { serializationKey: "scaling factor", value: 1.5 },
    },
  };

  test("frontendToAPIReaction writes params to the emission field, not the attribute lists", () => {
    const result = frontendToAPIReaction(emissionReaction, frontendFamily);
    expect(result.emission).toEqual({
      scalingFactor: 1.5,
    });
    expect(result.numericalAttributes).toHaveLength(0);
    expect(result.stringAttributes).toHaveLength(0);
  });

  test("apiToFrontendReaction reads the emission field into the attribute bag", () => {
    const apiEmission: APIReaction = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "emission",
      reactionType: "EMISSION",
      numericalAttributes: [],
      stringAttributes: [],
      emission: { scalingFactor: 1.5 },
      reactants: [],
      products: [],
      familyId: "00000000-0000-0000-0000-000000000000",
    };
    const result = apiToFrontendReaction(apiEmission);
    expect(result.attributes["scaling factor"].value).toBe(1.5);
  });
});

describe("First Order Loss parameter translation", () => {
  const firstOrderLossReaction: Reaction = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "first order loss",
    description: "",
    type: "FIRST_ORDER_LOSS",
    reactants: [],
    products: [],
    attributes: {
      "scaling factor": { serializationKey: "scaling factor", value: 2.0 },
    },
  };

  test("frontendToAPIReaction writes params to the firstOrderLoss field, not the attribute lists", () => {
    const result = frontendToAPIReaction(firstOrderLossReaction, frontendFamily);
    expect(result.firstOrderLoss).toEqual({
      scalingFactor: 2.0,
    });
    expect(result.numericalAttributes).toHaveLength(0);
    expect(result.stringAttributes).toHaveLength(0);
  });

  test("apiToFrontendReaction reads the firstOrderLoss field into the attribute bag", () => {
    const apiFirstOrderLoss: APIReaction = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "first order loss",
      reactionType: "FIRST_ORDER_LOSS",
      numericalAttributes: [],
      stringAttributes: [],
      firstOrderLoss: { scalingFactor: 2.0 },
      reactants: [],
      products: [],
      familyId: "00000000-0000-0000-0000-000000000000",
    };
    const result = apiToFrontendReaction(apiFirstOrderLoss);
    expect(result.attributes["scaling factor"].value).toBe(2.0);
  });
});

describe("Photolysis parameter translation", () => {
  const photolysisReaction: Reaction = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "photolysis",
    description: "",
    type: "PHOTOLYSIS",
    reactants: [],
    products: [],
    attributes: {
      "scaling factor": { serializationKey: "scaling factor", value: 0.8 },
    },
  };

  test("frontendToAPIReaction writes params to the photolysis field, not the attribute lists", () => {
    const result = frontendToAPIReaction(photolysisReaction, frontendFamily);
    expect(result.photolysis).toEqual({
      scalingFactor: 0.8,
    });
    expect(result.numericalAttributes).toHaveLength(0);
    expect(result.stringAttributes).toHaveLength(0);
  });

  test("apiToFrontendReaction reads the photolysis field into the attribute bag", () => {
    const apiPhotolysis: APIReaction = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "photolysis",
      reactionType: "PHOTOLYSIS",
      numericalAttributes: [],
      stringAttributes: [],
      photolysis: { scalingFactor: 0.8 },
      reactants: [],
      products: [],
      familyId: "00000000-0000-0000-0000-000000000000",
    };
    const result = apiToFrontendReaction(apiPhotolysis);
    expect(result.attributes["scaling factor"].value).toBe(0.8);
  });
});

describe("User Defined parameter translation", () => {
  const userDefinedReaction: Reaction = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "user defined",
    description: "",
    type: "USER_DEFINED",
    reactants: [],
    products: [],
    attributes: {
      "scaling factor": { serializationKey: "scaling factor", value: 3.2 },
    },
  };

  test("frontendToAPIReaction writes params to the userDefined field, not the attribute lists", () => {
    const result = frontendToAPIReaction(userDefinedReaction, frontendFamily);
    expect(result.userDefined).toEqual({
      scalingFactor: 3.2,
    });
    expect(result.numericalAttributes).toHaveLength(0);
    expect(result.stringAttributes).toHaveLength(0);
  });

  test("apiToFrontendReaction reads the userDefined field into the attribute bag", () => {
    const apiUserDefined: APIReaction = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "user defined",
      reactionType: "USER_DEFINED",
      numericalAttributes: [],
      stringAttributes: [],
      userDefined: { scalingFactor: 3.2 },
      reactants: [],
      products: [],
      familyId: "00000000-0000-0000-0000-000000000000",
    };
    const result = apiToFrontendReaction(apiUserDefined);
    expect(result.attributes["scaling factor"].value).toBe(3.2);
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

  test("description round-trips to the backend", () => {
    const describedPhase: Phase = { ...frontendPhase, description: "gas phase" };
    const result = frontendToAPIPhase(describedPhase, frontendFamily);
    expect(result.description).toEqual("gas phase");
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

  test("description round-trips to the backend", () => {
    const describedMechanism: Mechanism = {
      ...frontendMechanism,
      description: "test mechanism description",
    };
    const result = frontendToAPIMechanism(describedMechanism, frontendFamily);
    expect(result.description).toEqual("test mechanism description");
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
