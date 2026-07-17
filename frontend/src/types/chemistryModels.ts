import { UUID } from "crypto";
import { APIUser } from "../API/API_Interfaces";
import { mechanismConfiguration } from "@ncar/musica";
const { reactionTypes, Mechanism } = mechanismConfiguration;

/**
 * Represents a value a species can have. For example: Molecular Weight
 */
export type SpeciesAttribute = {
  /** Human-readable name of the attribute */
  name?: string;

  /** What the attribute should be serialized as (Defaults to <name> if unspecified). */
  serializationKey: string;

  /** The unit of the specific attribute. This can be empty if unitless. */
  units?: string;

  /** Value of the attribute. This is *usually* numerical */
  value: number | string;

  /** Used when the value is a string (This is not stored in the database) */
  options?: Array<string>;
};

/**
 * Represents attribute options a species can have
 */
export const speciesAttributeOptions: Array<SpeciesAttribute> = [
  Object.freeze({
    name: "Absolute Tolerance",
    serializationKey: "__absolute tolerance",
    value: 0.0,
  }),
  Object.freeze({
    name: "Diffusion Coefficient",
    serializationKey: "diffusion coefficient [m2 s-1]",
    units: "m2 s-1",
    value: 0.0,
  }),
  Object.freeze({
    name: "Molecular Weight",
    serializationKey: "molecular weight [kg mol-1]",
    units: "kg mol-1",
    value: 0.0,
  }),
  Object.freeze({
    name: "Henry's Law Constant (298K)",
    serializationKey: "HLC(298K) [mol m-3 Pa-1]",
    units: "mol m-3 Pa-1",
    value: 0.0,
  }),
  Object.freeze({
    name: "Henry's Law Exponential Factor",
    serializationKey: "HLC exponential factor [K]",
    units: "K",
    value: 0.0,
  }),
  Object.freeze({
    name: "N star",
    serializationKey: "N star",
    value: 0.0,
  }),
  Object.freeze({
    name: "Density",
    serializationKey: "density [kg m-3]",
    units: "kg m-3",
    value: 0.0,
  }),
  Object.freeze({
    name: "Tracer Type",
    serializationKey: "tracer type",
    value: "",
  }),
];

/**
 * Represents a species utilized on the frontend. A species is a substance which can take on any name.
 */
export type Species = {
  /** ID stored in the SQL database. If this is not in the database, this is used for frontend purposes */
  id: UUID | string;

  /** Name of the species */
  name: string;

  /** Description of the species */
  description: string | null;

  /** Id of the family on the frontend this mechanism is a part of */
  familyId: UUID | string;

  /** Special attributes set by the user */
  attributes: {
    [key: string]: SpeciesAttribute;
  };

  /** Determines whether the species has been modified from its original state */
  isModified?: boolean;

  /** Determines if the species has been marked for deletion */
  isDeleted?: boolean;

  /** Determines if the species is in the database */
  isInDatabase?: boolean;
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
  value: number | string;

  /** Used when the value is a string (This is not stored in the database) */
  options?: Array<string>;
};

export type ReactionTypeName =
  | "SIMPOL_PHASE_TRANSFER"
  | "AQUEOUS_EQUILIBRIUM"
  | typeof reactionTypes.Arrhenius.type
  | typeof reactionTypes.Photolysis.type
  | typeof reactionTypes.Emission.type
  | typeof reactionTypes.FirstOrderLoss.type
  | typeof reactionTypes.Troe.type
  | typeof reactionTypes.Surface.type
  | typeof reactionTypes.Branched.type
  | typeof reactionTypes.Tunneling.type
  | "WET_DEPOSITION";

/**
 * Represents a generic reaction on the frontend.
 * A reaction is a collection of starting species and ending species as well as any specific properties or variable values.
 */
export type Reaction = {
  /** ID stored in the SQL database. If this is not in the database, this is used for frontend purposes */
  id: UUID | string;

  /** Name of the reaction that the user sees*/
  name: string;

  /** Description of the reaction */
  description: string | null;

  /** Type of the reaction. This determines what other properties the reaction should have */
  type: ReactionTypeName;

  /** Optional id for the gas phase. Required in certain reactions */
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
  speciesId: UUID | string;
  coefficient: number;
};

export type Product = {
  speciesId: UUID | string;
  coefficient: number;
  branch?: string;
};

/**
 * Represents a generic phase on the frontend.
 * A phase is a collection of species that react together.
 */
export type Phase = {
  /** ID stored in the SQL database */
  id: UUID | string;

  /** Name of the phase */
  name: string;

  /** Description of the phase */
  description: string | null;

  /** Species involved in the phase */
  speciesIds: Array<UUID | string>;

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
  id: UUID | string;

  /** Name of the mechanism */
  name: string;

  /** Description of the mechanism */
  description: string | null;

  /** Id of the family on the frontend this mechanism is a part of */
  familyId: UUID | string;

  /** Species ids associated with the mechanism */
  speciesIds: Array<UUID | string>;

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
  id: UUID | string;

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
  "ARRHENIUS",
  "EMISSION",
  "PHOTOLYSIS",
  "TROE",
  "FIRST_ORDER_LOSS",
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
  EMISSION: [
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
  FIRST_ORDER_LOSS: [
    {
      name: "Scaling Factor",
      serializationKey: "scaling factor",
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
  AQUEOUS_EQUILIBRIUM: [
    {
      serializationKey: "A",
      value: 0.0,
    },
    {
      serializationKey: "C",
      value: 0.0,
    },
    {
      serializationKey: "k_reverse",
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
  WET_DEPOSITION: [
    {
      name: "Scaling Factor",
      serializationKey: "scaling factor",
      value: 0.0,
    },
  ],
  // TODO add some way of representing B value for this, which is a list of numbers
  SIMPOL_PHASE_TRANSFER: [],
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
  SIMPOL_PHASE_TRANSFER: {
    reactantCount: ReactionSpeciesCount.NONE,
    productCount: ReactionSpeciesCount.NONE,
    hasGasPhase: true,
    hasGasPhaseSpecies: true,
    hasAerosolPhase: true,
    hasAerosolPhaseSpecies: true,
    hasAerosolPhaseWater: false,
  },
  AQUEOUS_EQUILIBRIUM: {
    reactantCount: ReactionSpeciesCount.MANY,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: false,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: true,
    hasAerosolPhaseSpecies: true,
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
  PHOTOLYSIS: {
    reactantCount: ReactionSpeciesCount.ONE,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: true,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
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
  TROE: {
    reactantCount: ReactionSpeciesCount.MANY,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: true,
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
  TUNNELING: {
    reactantCount: ReactionSpeciesCount.MANY,
    productCount: ReactionSpeciesCount.MANY,
    hasGasPhase: true,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: false,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
  },
  WET_DEPOSITION: {
    reactantCount: ReactionSpeciesCount.NONE,
    productCount: ReactionSpeciesCount.NONE,
    hasGasPhase: false,
    hasGasPhaseSpecies: false,
    hasAerosolPhase: true,
    hasAerosolPhaseSpecies: false,
    hasAerosolPhaseWater: false,
  },
});
