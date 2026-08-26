import { UUID } from "crypto";

export interface APIUser {
  id: UUID;
  username: string;
  role: string;
  email?: string | null;
  createdDate?: string;
  googleId?: string | null;
}

export interface APIFamily {
  id: UUID;
  createdDate?: string;
  name: string;
  description: string | null;
  owner: APIUser;
  species: Array<APISpecies>;
  reactions: Array<APIReaction>;
  phases: Array<APIPhase>;
  mechanisms: Array<APIMechanism>;
}

export interface APISpecies {
  absoluteTolerance?: number;
  constantConcentration?: number;
  constantMixingRatio?: number;
  createdDate?: string;
  description?: string | null;
  familyId: UUID;
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
  numericalAttributes: Array<{
    serializationKey: string;
    value: number;
  }>;
  stringAttributes: Array<{
    serializationKey: string;
    value: string;
  }>;
  reactants: Array<APIReactant>;
  products: Array<APIProduct>;
  gasPhaseId?: UUID | null;
  gasPhaseSpeciesId?: UUID | null;
  aerosolPhaseId?: UUID | null;
  aerosolPhaseSpeciesId?: UUID | null;
  aerosolPhaseWaterId?: UUID | null;
  familyId: UUID;
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
  familyId: UUID;
  species: Array<APISpecies>;
}

export interface APIMechanism {
  id: UUID;
  createdDate?: string;
  updatedDate?: string;
  name: string;
  description?: string;
  species: Array<APISpecies>;
  phases: Array<APIPhase>;
  reactions: Array<APIReaction>;
  familyId: UUID;
}
