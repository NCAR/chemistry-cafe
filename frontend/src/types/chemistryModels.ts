import { UUID } from "crypto";
import { APIUser } from "../API/API_Interfaces";

export type SpeciesAttribute = {
  /** Name of the attribute */
  name: string;

  /** What the attribute should be serialized as (Defaults to <name> if unspecified). */
  serializedKey?: string;

  /** The unit of the specific attribute. This can be empty if unitless. */
  units?: string;

  /** Value of the attribute. This is *usually* numerical */
  value: number | string;
};

/**
 * Attribute options a species can have
 */
export const speciesAttributeOptions: Array<SpeciesAttribute> = [
  Object.freeze({
    name: "Absolute Tolerance",
    serializedKey: "absolute tolerance",
    value: 0.0,
  }),
  Object.freeze({
    name: "Diffusion Coefficient",
    serializedKey: "diffusion coefficient [m2 s-1]",
    units: "m2 s-1",
    value: 0.0,
  }),
  Object.freeze({
    name: "Molecular Weight",
    serializedKey: "molecular weight [kg mol-1]",
    units: "kg mol-1",
    value: 0.0,
  }),
  Object.freeze({
    name: "Henry's Law Constant (298K)",
    serializedKey: "HLC(298K) [mol m-3 Pa-1]",
    units: "mol m-3 Pa-1",
    value: 0.0,
  }),
  Object.freeze({
    name: "Henry's Law Exponential Factor",
    serializedKey: "HLC exponential factor [K]",
    units: "K",
    value: 0.0,
  }),
  Object.freeze({
    name: "N star",
    value: 0.0,
  }),
  Object.freeze({
    name: "Density",
    serializedKey: "density [kg m-3]",
    units: "kg m-3",
    value: 0.0,
  }),
  Object.freeze({
    name: "Tracer Type",
    serializedKey: "tracer type",
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

  /** The id of the phase this species is in. If unspecified, defaults to gas when serialized */
  phaseId?: UUID;

  /** Determines whether the species has been modified from its original state */
  isModified?: boolean;

  /** Determines if the species has been marked for deletion */
  isDeleted?: boolean;

  /** Determines if the species is in the database */
  isInDatabase?: boolean;
};

export type ReactionAttribute = {
  /** Name of the property */
  name: string;

  /** What the property should be serialized as (Defaults to "<name> [<unit>]"). */
  serializedKey?: string;

  /** Value of the property. This is *usually* numerical */
  value: number | string;

  /** Used when the value is a string (This is not stored in the database) */
  options?: Array<string>;
};

export type ReactionTypeName =
  | "NONE"
  | "HL_PHASE_TRANSFER"
  | "SIMPOL_PHASE_TRANSFER"
  | "AQUEOUS_EQUILIBRIUM"
  | "ARRHENIUS"
  | "CONDENSED_PHASE_ARRHENIUS"
  | "PHOTOLYSIS"
  | "CONDENSED_PHASE_PHOTOLYSIS"
  | "EMMISSION"
  | "FIRST_ORDER_LOSS"
  | "SURFACE"
  | "TROE"
  | "BRANCHED_NO_RO2"
  | "TUNNELING"
  | "WET_DEPOSITION";

export const attributeOptions: {
  [Property in ReactionTypeName]: Array<ReactionAttribute>;
} = {
  ARRHENIUS: [
    {
      name: "A",
      value: 0.0,
    },
    {
      name: "B",
      value: 0.0,
    },
    {
      name: "C/Ea",
      serializedKey: "Ea",
      value: 0.0,
    },
    {
      name: "D",
      value: 0.0,
    },
    {
      name: "E",
      value: 0.0,
    },
  ],
  EMMISSION: [
    {
      name: "Scaling Factor",
      serializedKey: "scaling factor",
      value: 0.0,
    },
  ],
  PHOTOLYSIS: [
    {
      name: "Scaling Factor",
      serializedKey: "scaling factor",
      value: 0.0,
    },
  ],
  FIRST_ORDER_LOSS: [
    {
      name: "Scaling Factor",
      serializedKey: "scaling factor",
      value: 0.0,
    },
  ],
  TROE: [
    {
      name: "k0 A",
      serializedKey: "k0_A",
      value: 0.0,
    },
    {
      name: "k0 B",
      serializedKey: "k0_B",
      value: 0.0,
    },
    {
      name: "k0 C",
      serializedKey: "k0_C",
      value: 0.0,
    },
    {
      name: "kinf A",
      serializedKey: "kinf_A",
      value: 0.0,
    },
    {
      name: "kinf B",
      serializedKey: "kinf_B",
      value: 0.0,
    },
    {
      name: "kinf C",
      serializedKey: "kinf_C",
      value: 0.0,
    },
    {
      name: "Fc",
      value: 0.0,
    },
    {
      name: "N",
      value: 0.0,
    },
  ],
  // TODO add the rest of the reaction types
  NONE: [],
  HL_PHASE_TRANSFER: [],
  SIMPOL_PHASE_TRANSFER: [],
  AQUEOUS_EQUILIBRIUM: [],
  CONDENSED_PHASE_ARRHENIUS: [],
  CONDENSED_PHASE_PHOTOLYSIS: [],
  SURFACE: [],
  BRANCHED_NO_RO2: [],
  TUNNELING: [],
  WET_DEPOSITION: [],
};

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

  /** Determines whether the Reaction has been modified from its original state */
  isModified?: boolean;

  /** Determines if the Reaction has been marked for deletion */
  isDeleted?: boolean;

  /** Determines if the reaction is in the database */
  isInDatabase?: boolean;

  /** List of reactants in the reaction */
  reactants: Array<{
    speciesId: UUID | string;
    coefficient: number;
  }>;

  /** List of products in the reaction. These can be part of different branches */
  products: Array<{
    speciesId: UUID | string;
    coefficient: number;
    branch?: string;
  }>;

  /** Special attributes related to the reaction */
  attributes: {
    [key: string]: ReactionAttribute;
  };
};

export type ArrheniusReaction = {
  gasPhase: string;
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
} & Reaction;

/**
 * Represents a generic phase on the frontend.
 * A phase is a collection of species that react together.
 */
export type Phase = {
  /** ID stored in the SQL database */
  id?: UUID;

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
};

/**
 * Represents a mechanism on the frontend.
 * A mechanism is a subset of a families species and reactions.
 * Mechanisms also contain information about different reaction phases.
 */
export type Mechanism = {
  /** ID stored in the SQL database. If this is not in the database, this is used for frontend purposes */
  id?: UUID | string;

  /** Name of the mechanism */
  name: string;

  /** Description of the mechanism */
  description: string | null;

  /** Collection of reaction phases associated with the mechanism */
  phases: Array<Phase>;

  /** Id of the family on the frontend this mechanism is a part of */
  familyId: UUID | string;

  /** Species ids associated with the mechanism */
  speciesIds: Array<UUID | string>;

  /** Reactions associated with the mechanism */
  reactionIds: Array<UUID | string>;

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
  owner?: APIUser;

  /** SQL ids of the contributors to the family */
  contributorIds?: Array<UUID>;

  /** Mechanisms inside the family */
  mechanisms: Array<Mechanism>;

  /** Species inside the family */
  species: Array<Species>;

  /** Reaction inside the family */
  reactions: Array<Reaction>;

  /** Determines whether the family has been modified from its original state */
  isModified?: boolean;

  /** Determines if the family has been marked for deletion */
  isDeleted?: boolean;

  /** Determines if the family is in the database */
  isInDatabase?: boolean;
};
