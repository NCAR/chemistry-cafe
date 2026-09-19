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
  gasPhaseId?: UUID;

  /** Optional id for the gas phase species. Required in certain reactions */
  gasPhaseSpeciesId?: UUID;

  /** Optional id for the aerosol phase. Required in certain reactions */
  aerosolPhaseId?: UUID;

  /** Optional id for the aerosol phase species. Required in certain reactions */
  aerosolPhaseSpeciesId?: UUID;

  /** Optional id for the aerosol phase water. Required in certain reactions */
  aerosolPhaseWaterId?: UUID;

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
  reactionIds: Array<UUID>;

  /** Phase ids associated with the mechanism */
  phaseIds: Array<UUID>;
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
  reactionTypes.Branched.type,
  reactionTypes.Emission.type,
  reactionTypes.FirstOrderLoss.type,
  reactionTypes.Photolysis.type,
  reactionTypes.Surface.type,
  reactionTypes.TaylorSeries.type,
  reactionTypes.TernaryChemicalActivation.type,
  reactionTypes.Troe.type,
  reactionTypes.Tunneling.type,
  reactionTypes.UserDefined.type,
];

/**
 * Represents all attributes configurable by the user for each reaction type.
 */
export const reactionAttributeOptions: {
  [Type in ReactionTypeName | "NONE"]: Record<string, ReactionAttribute>;
} = {
  NONE: {},
  /**
   * For Arrhenius reactions, there is another value, C, which we don't
   * represent on the frontend. It is defined as C = -Ea / kb, so it's
   * calculated elsewhere. See https://github.com/NCAR/chemistry-cafe/pull/166
   */
  ARRHENIUS: {
    A: { units: "(mol m-3)^-(n-1) s-1", value: 0.0 },
    B: { value: 0.0 },
    Ea: { units: "J", value: 0.0 },
    D: { units: "K", value: 0.0 },
    E: { units: "Pa-1", value: 0.0 },
  },
  BRANCHED_NO_RO2: {
    X: { value: 0.0 },
    Y: { units: "K", value: 0.0 },
    a0: { value: 0.0 },
    n: { value: 0.0 },
  },
  EMISSION: {
    scalingFactor: { name: "Scaling Factor", value: 0.0 },
  },
  FIRST_ORDER_LOSS: {
    scalingFactor: { name: "Scaling Factor", value: 0.0 },
  },
  PHOTOLYSIS: {
    scalingFactor: { name: "Scaling Factor", value: 0.0 },
  },
  SURFACE: {
    reactionProbability: { name: "Reaction Probability", value: 0.0 },
  },
  TAYLOR_SERIES: {
    A: { units: "(mol m-3)^-(n-1) s-1", value: 0.0 },
    B: { value: 0.0 },
    Ea: { units: "J", value: 0.0 },
    D: { units: "K", value: 0.0 },
    E: { units: "Pa-1", value: 0.0 },
    taylorCoefficients: { name: "Taylor Coefficients", value: [] },
  },
  TERNARY_CHEMICAL_ACTIVATION: {
    k0A: { name: "k0 A", units: "(mol m-3)^-(n-1) s-1", value: 0.0 },
    k0B: { name: "k0 B", value: 0.0 },
    k0C: { name: "k0 C", units: "K", value: 0.0 },
    kinfA: { name: "kinf A", units: "(mol m-3)^-(n-1) s-1", value: 0.0 },
    kinfB: { name: "kinf B", value: 0.0 },
    kinfC: { name: "kinf C", units: "K", value: 0.0 },
    Fc: { value: 0.0 },
    N: { value: 0.0 },
  },
  TROE: {
    k0A: { name: "k0 A", units: "(mol m-3)^-(n-1) s-1", value: 0.0 },
    k0B: { name: "k0 B", value: 0.0 },
    k0C: { name: "k0 C", units: "K", value: 0.0 },
    kinfA: { name: "kinf A", units: "(mol m-3)^-(n-1) s-1", value: 0.0 },
    kinfB: { name: "kinf B", value: 0.0 },
    kinfC: { name: "kinf C", units: "K", value: 0.0 },
    Fc: { value: 0.0 },
    N: { value: 0.0 },
  },
  TUNNELING: {
    A: { units: "(mol m-3)^-(n-1) s-1", value: 0.0 },
    B: { units: "K", value: 0.0 },
    C: { units: "K^3", value: 0.0 },
  },
  USER_DEFINED: {
    scalingFactor: { name: "Scaling Factor", value: 0.0 },
  },
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
    hasGasPhase: true,
    hasGasPhaseSpecies: true,
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
