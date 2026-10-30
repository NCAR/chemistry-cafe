import { UUID } from "crypto";
import { RateUnits } from "../helpers/rateUnits";
import { ActivationParameter } from "../helpers/activationEnergy";

export interface APIUser {
  id: UUID;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  email?: string | null;
  createdDate?: string;
  googleId?: string | null;
  orcidId?: string | null;
}

export interface APIUserPreferences {
  userId?: UUID;
  arrheniusRateUnits: RateUnits;
  branchedRateUnits: RateUnits;
  taylorSeriesRateUnits: RateUnits;
  ternaryChemicalActivationRateUnits: RateUnits;
  troeRateUnits: RateUnits;
  tunnelingRateUnits: RateUnits;
  activationParameter: ActivationParameter;
}

export interface APIFamily {
  id: UUID;
  createdDate?: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  owner: APIUser;
  contributorIds?: Array<UUID>;
  species: Array<APISpecies>;
  reactions: Array<APIReaction>;
  phases: Array<APIPhase>;
  mechanisms: Array<APIMechanism>;
}

export type ContributorRole = "Viewer" | "Editor" | "Owner";

export interface APIFamilyContributor {
  userId: UUID;
  role: ContributorRole;
  email?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface AddFamilyContributorRequest {
  userId?: UUID;
  email?: string;
  role: ContributorRole;
}

export interface APISpecies {
  absoluteTolerance?: number;
  constantConcentration?: number;
  constantMixingRatio?: number;
  createdDate?: string;
  description?: string | null;
  id: UUID;
  isThirdBody?: boolean;
  molecularWeight?: number;
  otherProperties?: Record<string, unknown>;
  name: string;
  updatedDate?: string;
}

export interface APIReaction {
  id: UUID;
  createdDate?: string;
  updatedDate?: string;
  name: string;
  reactionType: string;
  description?: string;
  // Dedicated Arrhenius parameters. Present only for ARRHENIUS reactions.
  arrhenius?: {
    a?: number | null;
    b?: number | null;
    c?: number | null;
    ea?: number | null;
    d?: number | null;
    e?: number | null;
  } | null;
  // Dedicated Tunneling parameters. Present only for TUNNELING reactions.
  tunneling?: {
    a?: number | null;
    b?: number | null;
    c?: number | null;
  } | null;
  // Dedicated Troe parameters. Present only for TROE reactions.
  troe?: {
    k0A?: number | null;
    k0B?: number | null;
    k0C?: number | null;
    kinfA?: number | null;
    kinfB?: number | null;
    kinfC?: number | null;
    fc?: number | null;
    n?: number | null;
  } | null;
  // Dedicated Ternary Chemical Activation parameters. Present only for
  // TERNARY_CHEMICAL_ACTIVATION reactions.
  ternaryChemicalActivation?: {
    k0A?: number | null;
    k0B?: number | null;
    k0C?: number | null;
    kinfA?: number | null;
    kinfB?: number | null;
    kinfC?: number | null;
    fc?: number | null;
    n?: number | null;
  } | null;
  // Dedicated Branched (no RO2) parameters. Present only for
  // BRANCHED_NO_RO2 reactions.
  branched?: {
    x?: number | null;
    y?: number | null;
    a0?: number | null;
    n?: number | null;
  } | null;
  // Dedicated Taylor Series parameters. Present only for TAYLOR_SERIES
  // reactions.
  taylorSeries?: {
    a?: number | null;
    b?: number | null;
    c?: number | null;
    ea?: number | null;
    d?: number | null;
    e?: number | null;
    taylorCoefficients?: Array<number> | null;
  } | null;
  // Dedicated Surface parameters. Present only for SURFACE reactions.
  surface?: {
    reactionProbability?: number | null;
  } | null;
  // Dedicated Emission parameters. Present only for EMISSION reactions.
  emission?: {
    scalingFactor?: number | null;
  } | null;
  // Dedicated First Order Loss parameters. Present only for
  // FIRST_ORDER_LOSS reactions.
  firstOrderLoss?: {
    scalingFactor?: number | null;
  } | null;
  // Dedicated Photolysis parameters. Present only for PHOTOLYSIS reactions.
  photolysis?: {
    scalingFactor?: number | null;
  } | null;
  // Dedicated User Defined parameters. Present only for USER_DEFINED
  // reactions.
  userDefined?: {
    scalingFactor?: number | null;
  } | null;
  reactants: Array<APIReactant>;
  products: Array<APIProduct>;
  gasPhaseId?: UUID | null;
  gasPhaseSpeciesId?: UUID | null;
}

export interface APIReactant {
  speciesId: UUID;
  coefficient: number;
}

export interface APIProduct {
  speciesId: UUID;
  coefficient: number;
  branch?: string;
}

export interface APIPhase {
  id: UUID;
  createdDate?: string;
  updatedDate?: string;
  name: string;
  description?: string;
  speciesIds: Array<UUID>;
  diffusionCoefficients?: Record<UUID, number>;
}

export interface APIMechanism {
  id: UUID;
  createdDate?: string;
  updatedDate?: string;
  name: string;
  description?: string;
  speciesIds: Array<UUID>;
  reactionIds: Array<UUID>;
  phaseIds: Array<UUID>;
  familyId: UUID;
}
