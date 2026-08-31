import { UUID } from "crypto";
import { APIUser } from "../API/API_Interfaces";
import { mechanismConfiguration } from "@ncar/musica";
const { reactionTypes, Mechanism } = mechanismConfiguration;

/**
 * Represents a species utilized on the frontend. A species is a substance which can take on any name.
 */
export type Species = {
  /** Absolute tolerance */
  absoluteTolerance?: number;

  /** Constant concentration [mol m-3] */
  constantConcentration?: number;

  /** Constant mixing ratio [mol mol-1] */
  constantMixingRatio?: number;

  /** Description of the species */
  description: string | null;

  /** Id of the family on the frontend this mechanism is a part of */
  familyId: UUID;

  /** ID stored in the SQL database. If this is not in the database, this is used for frontend purposes */
  id: UUID;

  /** Determines if the species has been marked for deletion */
  isDeleted?: boolean;

  /** Determines if the species is in the database */
  isInDatabase?: boolean;

  /** Determines whether the species has been modified from its original state */
  isModified?: boolean;

  /** If this is a third body (commonly called M) */
  isThirdBody?: boolean;

  /** Molecular weight [kg mol-1] */
  molecularWeight?: number;

  /** Name of the species */
  name: string;

  /** Optional, additional properties for the species which are not defined in the mechanism configuration schema but can be queried for in musica */
  otherProperties?: Record<string, unknown>;
};

/**
 * Represents a value that the reaction may have.
 */
export type ReactionAttribute = {
  /** Human-readable name of the property */
  name?: string;

  /** What the property should be serialized as (Usually in the form "<name> [<unit>]"). */
  serializationKey: string;

  /** The unit of the specific attribute. This can be empty if unitless. */
  units?: string;

  /** Value of the property. This is *usually* numerical */
  value: number | number[] | string;

  /** Used when the value is a string (This is not stored in the database) */
  options?: Array<string>;
};

export type ReactionTypeName =
  | typeof reactionTypes.Arrhenius.type
  | typeof reactionTypes.Branched.type
  | typeof reactionTypes.Emission.type
  | typeof reactionTypes.FirstOrderLoss.type
  | typeof reactionTypes.Photolysis.type
  | typeof reactionTypes.Surface.type
  | typeof reactionTypes.TaylorSeries.type
  | typeof reactionTypes.TernaryChemicalActivation.type
  | typeof reactionTypes.Troe.type
  | typeof reactionTypes.Tunneling.type
  | typeof reactionTypes.UserDefined.type;

/**
 * Represents a generic reaction on the frontend.
 * A reaction is a collection of starting species and ending species as well as any specific properties or variable values.
 */
export type Reaction = {
  /** ID stored in the SQL database. If this is not in the database, this is used for frontend purposes */
  id: UUID;

  /** Name of the reaction that the user sees*/
  name: string;

  /** Description of the reaction */
  description: string | null;

  /** Type of the reaction. This determines what other properties the reaction should have */
  type: ReactionTypeName;

  /** Optional id for the gas phase. Required in all reactions */
  gasPhaseId?: UUID | string | null;

  /** Optional id for the gas phase species. Required in certain reactions */
  gasPhaseSpeciesId?: UUID | string | null;

  /** Optional id for the aerosol phase. Required in certain reactions */
  aerosolPhaseId?: UUID | string | null;

  /** Optional id for the aerosol phase species. Required in certain reactions */
  aerosolPhaseSpeciesId?: UUID | string | null;

  /** Optional id for the aerosol phase water. Required in certain reactions */
  aerosolPhaseWaterId?: UUID | string | null;

  /** Determines whether the Reaction has been modified from its original state */
  isModified?: boolean;

  /** Determines if the Reaction has been marked for deletion */
  isDeleted?: boolean;

  /** Determines if the reaction is in the database */
  isInDatabase?: boolean;

  /** List of reactants in the reaction */
  reactants: Array<Reactant>;

  /** List of products in the reaction. These can be part of different branches */
  products: Array<Product>;

  /** Special attributes related to the reaction */
  attributes: {
    [key: string]: ReactionAttribute;
  };
};

export type Reactant = {
  speciesId: UUID;
  coefficient: number;
};

export type Product = {
  speciesId: UUID;
  coefficient: number;
  branch?: string;
};

/**
 * Represents a generic phase on the frontend.
 * A phase is a collection of species that react together.
 */
export type Phase = {
  /** ID stored in the SQL database */
  id: UUID;

  /** Name of the phase */
  name: string;

  /** Description of the phase */
  description: string | null;

  /** Species involved in the phase */
  speciesIds: Array<UUID>;

  /** Determines whether the phase has been modified from its original state */
  isModified?: boolean;

  /** Determines if the phase has been marked for deletion */
  isDeleted?: boolean;

  /** Determines if the phase is in the database */
  isInDatabase?: boolean;
};

/**
 * Represents a mechanism on the frontend.
 * A mechanism is a subset of a families species and reactions.
 * Mechanisms also contain information about different reaction phases.
 */
export type Mechanism = {
  /** ID stored in the SQL database. If this is not in the database, this is used for frontend purposes */
  id: UUID;

  /** Name of the mechanism */
  name: string;

  /** Description of the mechanism */
  description: string | null;

  /** Id of the family on the frontend this mechanism is a part of */
  familyId: UUID;

  /** Species ids associated with the mechanism */
  speciesIds: Array<UUID>;

  /** Reaction ids associated with the mechanism */
  reactionIds: Array<UUID | string>;

  /** Phase ids associated with the mechanism */
  phaseIds: Array<UUID | string>;

  /** Determines whether the mechanism has been modified from its original state */
  isModified?: boolean;

  /** Determines if the mechanism has been marked for deletion */
  isDeleted?: boolean;

  /** Determines if the family is in the database */
  isInDatabase?: boolean;
};

/**
 * Represents a family on the frontend.
 * A family is an encompassing collection of species, reactions, and mechanisms.
 * Families represent an entire chemistry model.
 */
export type Family = {
  /** ID stored in the SQL database. If this object is not stored in the database, this is used for frontend purposes */
  id: UUID;

  /** Name of the family */
  name: string;

  /** Description of the family */
  description: string;

  /** API definition of the owner of the family */
  owner: APIUser | null;

  /** SQL ids of the contributors to the family */
  contributorIds?: Array<UUID>;

  /** Mechanisms inside the family */
  mechanisms: Array<Mechanism>;

  /** Species inside the family */
  species: Array<Species>;

  /** Reactions inside the family */
  reactions: Array<Reaction>;

  /** Phases inside the family */
  phases: Array<Phase>;

  /** Determines whether the family has been modified from its original state */
  isModified?: boolean;

  /** Determines if the family has been marked for deletion */
  isDeleted?: boolean;

  /** Determines if the family is in the database */
  isInDatabase?: boolean;
};

/**
 * All reaction types that are fully supported by the application.
 * Other reaction types may be imported via a file, but haven't been fully tested.
 */
export const supportedReactionTypes: Array<ReactionTypeName> = [
  reactionTypes.Arrhenius.type,
  reactionTypes.Emission.type,
  reactionTypes.FirstOrderLoss.type,
  reactionTypes.Photolysis.type,
  reactionTypes.TernaryChemicalActivation.type,
  reactionTypes.Troe.type,
  reactionTypes.UserDefined.type,
];

/**
 * Represents all attributes configurable by the user for each reaction type.
 */
export const reactionAttributeOptions: {
  [Type in ReactionTypeName | "NONE"]: Array<ReactionAttribute>;
} = {
  NONE: [],
  /**
   * For Arrhenius reactions, there is another value, C, which we don't
   * represent on the frontend. It is defined as C = -Ea / kb, so it's
   * calculated elsewhere. See https://github.com/NCAR/chemistry-cafe/pull/166
   */
  ARRHENIUS: [
    {
      serializationKey: "A",
      value: 0.0,
    },
    {
      serializationKey: "B",
      value: 0.0,
    },
    {
      serializationKey: "Ea",
      value: 0.0,
    },
    {
      serializationKey: "D",
      value: 0.0,
    },
    {
      serializationKey: "E",
      value: 0.0,
    },
  ],
  BRANCHED_NO_RO2: [
    {
      serializationKey: "X",
      value: 0.0,
    },
    {
      serializationKey: "Y",
      value: 0.0,
    },
    {
      serializationKey: "a0",
      value: 0.0,
    },
    {
      serializationKey: "n",
      value: 0.0,
    },
  ],
  EMISSION: [
    {
      name: "Scaling Factor",
      serializationKey: "scaling factor",
      value: 0.0,
    },
  ],
  FIRST_ORDER_LOSS: [
    {
      name: "Scaling Factor",
      serializationKey: "scaling factor",
      value: 0.0,
    },
  ],
  PHOTOLYSIS: [
    {
      name: "Scaling Factor",
      serializationKey: "scaling factor",
      value: 0.0,
    },
  ],
  SURFACE: [
    {
      name: "Reaction Probability",
      serializationKey: "reaction probability",
      value: 0.0,
    },
  ],
  TAYLOR_SERIES: [
    {
      serializationKey: "A",
      value: 0.0,
    },
    {
      serializationKey: "B",
      value: 0.0,
    },
    {
      serializationKey: "Ea",
      value: 0.0,
    },
    {
      serializationKey: "D",
      value: 0.0,
    },
    {
      serializationKey: "E",
      value: 0.0,
    },
    {
      serializationKey: "taylor coefficients",
      value: [],
    },
  ],
  TERNARY_CHEMICAL_ACTIVATION: [
    {
      name: "k0 A",
      serializationKey: "k0_A",
      value: 0.0,
    },
    {
      name: "k0 B",
      serializationKey: "k0_B",
      value: 0.0,
    },
    {
      name: "k0 C",
      serializationKey: "k0_C",
      value: 0.0,
    },
    {
      name: "kinf A",
      serializationKey: "kinf_A",
      value: 0.0,
    },
    {
      name: "kinf B",
      serializationKey: "kinf_B",
      value: 0.0,
    },
    {
      name: "kinf C",
      serializationKey: "kinf_C",
      value: 0.0,
    },
    {
      serializationKey: "Fc",
      value: 0.0,
    },
    {
      serializationKey: "N",
      value: 0.0,
    },
  ],
  TROE: [
    {
      name: "k0 A",
      serializationKey: "k0_A",
      value: 0.0,
    },
    {
      name: "k0 B",
      serializationKey: "k0_B",
      value: 0.0,
    },
    {
      name: "k0 C",
      serializationKey: "k0_C",
      value: 0.0,
    },
    {
      name: "kinf A",
      serializationKey: "kinf_A",
      value: 0.0,
    },
    {
      name: "kinf B",
      serializationKey: "kinf_B",
      value: 0.0,
    },
    {
      name: "kinf C",
      serializationKey: "kinf_C",
      value: 0.0,
    },
    {
      serializationKey: "Fc",
      value: 0.0,
    },
    {
      serializationKey: "N",
      value: 0.0,
    },
  ],
  TUNNELING: [
    {
      serializationKey: "A",
      value: 0.0,
    },
    {
      serializationKey: "B",
      value: 0.0,
    },
    {
      serializationKey: "C",
      value: 0.0,
    },
  ],
  USER_DEFINED: [
    {
      name: "Scaling Factor",
      serializationKey: "scaling factor",
      value: 0.0,
    },
  ],
};

export enum ReactionSpeciesCount {
  NONE = "NONE",
  ONE = "ONE",
  MANY = "MANY",
}

/**
 * Properties that may or may not exist for a specific reaction.
 * These specify properties that are generic enough to exist on various reaction types, but not all.
 */
export type ReactionConfiguration = {
  reactantCount: ReactionSpeciesCount;
  productCount: ReactionSpeciesCount;
  hasGasPhase: boolean;
  hasGasPhaseSpecies: boolean;
  hasAerosolPhase: boolean;
  hasAerosolPhaseSpecies: boolean;
  hasAerosolPhaseWater: boolean;
  branches?: Array<string>;
};

/**
 * Specific properties for different reaction types.
 * This is used for reference to create a correct UI and serialize reactions correctly.
 */
export const reactionConfigurations: {
  [Type in ReactionTypeName | "NONE"]: ReactionConfiguration;
} = Object.freeze({
  NONE: {
    reactantCount: ReactionSpeciesCount.NONE,
    productCount: ReactionSpeciesCount.NONE,
    hasGasPhase: false,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
  },
  ARRHENIUS: {
    reactantCount: ReactionSpeciesCount.MANY,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: false,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
  },
  BRANCHED_NO_RO2: {
    reactantCount: ReactionSpeciesCount.MANY,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: true,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
    branches: ["alkoxy", "nitrate"],
  },
  EMISSION: {
    reactantCount: ReactionSpeciesCount.NONE,
    productCount: ReactionSpeciesCount.ONE,
    hasGasPhase: true,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
  },
  FIRST_ORDER_LOSS: {
    reactantCount: ReactionSpeciesCount.ONE,
    productCount: ReactionSpeciesCount.NONE,
    hasGasPhase: true,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
  },
  PHOTOLYSIS: {
    reactantCount: ReactionSpeciesCount.ONE,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: true,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
  },
  SURFACE: {
    reactantCount: ReactionSpeciesCount.NONE,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: false,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
    branches: ["gas-phase"],
  },
  TAYLOR_SERIES: {
    reactantCount: ReactionSpeciesCount.MANY,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: true,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
  },
  TERNARY_CHEMICAL_ACTIVATION: {
    reactantCount: ReactionSpeciesCount.MANY,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: true,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
  },
  TROE: {
    reactantCount: ReactionSpeciesCount.MANY,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: true,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
  },
  TUNNELING: {
    reactantCount: ReactionSpeciesCount.MANY,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: true,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
  },
  USER_DEFINED: {
    reactantCount: ReactionSpeciesCount.MANY,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: true,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
  },
});
