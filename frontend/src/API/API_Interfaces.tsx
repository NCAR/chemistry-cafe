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
  description: string;
  owner: APIUser;
  species?: Array<APISpecies>;
}

export interface APISpecies {
  id?: UUID;
  createdDate?: string;
  updatedDate?: string;
  name: string | null;
  description: string | null;
  familyId: UUID;
}

export interface APIMechanism {
  id?: UUID;
  familyId: string;
  name: string;
  description: string;
}

export interface APIReaction {
  id?: UUID;
  name: string;
  description: string | null;
  createdBy: string;
}

export interface APIReactionSpecies {
  id?: UUID;
  reaction_id: string;
  species_id: string;
  role: "reactant" | "product";
}

export interface APIMechanismReaction {
  id?: UUID;
  mechanism_id: string;
  reaction_id: string;
}

export interface APIMechanismSpecies {
  id?: UUID;
  mechanism_id: string;
  species_id: string;
}

export interface APIInitialConditionSpecies {
  id?: UUID;
  mechanism_id: string;
  species_id: string;
  concentration?: number;
  temperature?: number;
  pressure?: number;
  additional_conditions?: string;
  abs_convergence_tolerance?: number;
  diffusion_coefficient?: number;
  molecular_weight?: number;
  fixed_concentration?: number;
}

export interface APIReactionSpeciesDto {
  id?: UUID;
  reaction_id: string;
  species_id: string;
  role: "reactant" | "product";
  species_name: string;
}

export interface APIProperty {
  id?: UUID; // UUID for the property entry
  speciesId: string; // Foreign key to the species table (UUID)
  mechanismId: string; // Foreign key to mechanism table (UUID)
  tolerance?: number; // Tolerance value (optsional, as it might not be provided for every property)
  weight?: number; // Weight value (optional)
  concentration?: number; // Concentration value (optional)
  diffusion?: number; // Diffusion value (optional)
}
