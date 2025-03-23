import { UUID } from "crypto";

/**
 * Represents a species utilized on the frontend. A species is a substance which can take on any name.
 */
export type Species = {
    /** ID stored in the SQL database */
    id?: UUID;

    /** Name of the species */
    name: string;

    /** Description of the species */
    description: string | null;

    /** Special properties set by the user */
    properties: {
        [key: `${string}` | `{string}[{string}]`]: number;
    };
}

export type ReactionTypeName =
    "HL_PHASE_TRANSFER"
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

/**
 * Represents a generic reaction on the frontend.
 * A reaction is a collection of starting species and ending species as well as any specific properties or variable values.
 */
export type Reaction = {
    /** ID stored in the SQL database */
    id?: UUID;

    /** Name of the reaction that the user sees*/
    name: string;

    /** Description of the reaction */
    description: string | null;

    /** Type of the reaction. This determines what other properties the reaction should have */
    type: ReactionTypeName;
}

export type ArrheniusReaction = {
    type: "ARRHENIUS";
    gasPhase: string;
    reactants: Array<{
        speciesId: UUID,
        coefficient: number
    }>;
    products: Array<{
        speciesId: UUID,
        coefficient: number
    }>;
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
    speciesIds: Array<UUID>;
}

/**
 * Represents a mechanism on the frontend.
 * A mechanism is a subset of a families species and reactions.
 * Mechanisms also contain information about different reaction phases.
 */
export type Mechanism = {
    /** ID stored in the SQL database */
    id?: UUID;

    /** Name of the mechanism */
    name: string;

    /** Description of the mechanism */
    description: string | null;

    /** Collection of reaction phases associated with the mechanism */
    phases: Array<Phase>;

    /** SQL ids of species associated with the mechanism */
    speciesIds: Array<UUID>;

    /** SQL ids of reactions associated with the mechanism */
    reactionsIds: Array<UUID>;
}

/**
 * Represents a family on the frontend.
 * A family is an encompassing collection of species, reactions, and mechanisms.
 * Families represent an entire chemistry model.
 */
export type Family = {
    /** ID stored in the SQL database */
    id?: UUID;

    /** Name of the family */
    name: string;

    /** Description of the family */
    description: string;

    /** SQL id of the owner of the family */
    ownerId?: UUID;

    /** SQL ids of the contributors to the family */
    contributorIds?: Array<UUID>;

    /** Mechanisms inside the family */
    mechanisms: Array<Mechanism>;

    /** Species inside the family */
    species: Array<Species>;

    /** Reaction inside the family */
    reactions: Array<Reaction>;
}
