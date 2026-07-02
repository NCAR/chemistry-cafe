import { UUID } from "crypto";
import { APIUser } from "../API/API_Interfaces";
import {
  SpeciesAttribute,
  ReactionTypeName,
  Reactant,
  Product,
} from "./chemistryModels";

// ─────────────────────────────────────────────────────────────
// Editor ViewModels.
//
// These are the types React components bind to and mutate. They are a
// projection of the canonical @ncar/musica domain model PLUS the UI /
// persistence state that is not a chemistry concept (dirty flags, DB
// identity, validation errors). They deliberately tolerate partial /
// invalid data while a mechanism is being edited; conversion to the strict
// musica classes happens only at the import/export boundary (musicaAdapter).
// ─────────────────────────────────────────────────────────────

/** UI / persistence state carried by every editable entity. */
export type EditorMeta = {
  /** Frontend identity: a DB row id, or a generated id for unsaved rows. */
  id: UUID | string;
  isModified?: boolean;
  isDeleted?: boolean;
  isInDatabase?: boolean;
  /** Populated by the adapter's validation pass when converting to musica. */
  validationErrors?: string[];
};

export type EditableSpecies = EditorMeta & {
  name: string;
  description: string | null;
  familyId: UUID | string;
  /**
   * Generic attribute bag so the UI can render arbitrary key/value rows.
   * The adapter maps known keys onto musica's named Species fields and lets
   * the rest fall through to musica's `other_properties`.
   */
  attributes: Record<string, SpeciesAttribute>;
};

export type EditablePhase = EditorMeta & {
  name: string;
  description: string | null;
  /** Frontend references species by id; the adapter resolves these to names. */
  speciesIds: Array<UUID | string>;
};

export type EditableReaction = EditorMeta & {
  name: string;
  description: string | null;
  /** Discriminator used to pick the editor UI and the adapter mapping. */
  type: ReactionTypeName;
  /** Editable, possibly-incomplete params keyed by serializationKey ("A", "Ea", …). */
  params: Record<string, number | string>;
  reactants: Reactant[];
  products: Product[];
  // Phase / species references stay as frontend ids; resolved at the boundary.
  gasPhaseId?: UUID | string | null;
  gasPhaseSpeciesId?: UUID | string | null;
  aerosolPhaseId?: UUID | string | null;
  aerosolPhaseSpeciesId?: UUID | string | null;
  aerosolPhaseWaterId?: UUID | string | null;
};

export type EditableMechanism = EditorMeta & {
  name: string;
  description: string | null;
  familyId: UUID | string;
  speciesIds: Array<UUID | string>;
  reactionIds: Array<UUID | string>;
  phaseIds: Array<UUID | string>;
};

export type EditableFamily = EditorMeta & {
  name: string;
  description: string;
  owner: APIUser | null;
  contributorIds?: Array<UUID>;
  species: EditableSpecies[];
  phases: EditablePhase[];
  reactions: EditableReaction[];
  mechanisms: EditableMechanism[];
};
