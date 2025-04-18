import { UUID } from "crypto";

export interface APIUser {
  id?: UUID;
  username: string;
  role: string;
  email?: string | null;
  createdDate?: string;
  googleId?: string | null;
}

export interface APIFamily {
  id?: UUID;
  createdDate?: string;
  name: string;
  description: string | null;
  owner: APIUser;
  species: Array<APISpecies>;
  reactions: Array<APIReaction>;
  mechanisms: Array<APIMechanism>;
}

export interface APISpecies {
  id?: UUID;
  createdDate?: string;
  updatedDate?: string;
  name: string;
  description?: string | null;
  numericalAttributes: Array<{
    speciesId: UUID;
    serializationKey: string;
    value: number;
  }>;
  phaseId: UUID;
  familyId: UUID;
}

export interface APIMechanism {
  id?: UUID;
  createdDate: string;
  updatedDate: string;
  name: string;
  description: string | null;
  mechanismSpecies: Array<APIMechanismSpecies>;
  mechanismReactions: Array<APIMechanismReaction>;
  familyId: UUID;
}

export interface APIMechanismSpecies {
  mechanismId: UUID;
  speciesId: UUID;
  species: APISpecies;
}

export interface APIMechanismReaction {
  mechanismId: UUID;
  reactionId: UUID;
  reaction: APIReaction;
}

export interface APIReaction {
  id?: UUID;
  createdDate: string;
  updatedDate: string;
  name: string;
  description: string | null;
  numericalAttributes: Array<{
    reactionId: UUID;
    serializationKey: string;
    value: number;
  }>;
  stringAttributes: Array<{
    reactionId: UUID;
    serializationKey: string;
    value: string;
  }>;
  reactants: Array<{

  }>
}

export interface APIReaction {
  id?: UUID;
  createdDate: string;
  updatedDate: string;
  name: string;
  description: string | null;
  numericalAttributes: Array<{
    reactionId: UUID;
    serializationKey: string;
    value: number;
  }>;
  stringAttributes: Array<{
    reactionId: UUID;
    serializationKey: string;
    value: string;
  }>;
  reactants: Array<{

  }>
}

export interface APIReactant {
  reactionId: UUID;
  speciesId: UUID;
  coefficient: number;
}

export interface APIProduct {
  reactionId: UUID;
  speciesId: UUID;
  coefficient: number;
  branch?: string;
}
