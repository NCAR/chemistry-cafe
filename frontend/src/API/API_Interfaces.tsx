import { UUID } from "crypto";

export interface APIFamily {
  id?: UUID;
  name: string;
  description: string;
  createdBy: string;
}

export interface APIMechanism {
  id?: UUID;
  family_id: string;
  name: string;
  description: string;
  created_by: string;
}

export interface APISpecies {
  id?: UUID;
  name: string;
  description: string | null;
  created_by: string | null;
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

export interface APIUser {
  id?: UUID;
  username: string;
  role: string;
  email?: string | null;
  created_date?: string;
  google_id?: string | null;
}

export interface APIUserClaims {
  nameId?: string | null;
  email?: string | null;
}

export interface APIProperty {
  id?: UUID; // UUID for the property entry
  speciesId: string; // Foreign key to the species table (UUID)
  mechanismId: string; // Foreign key to mechanism table (UUID)
  tolerance?: number; // Tolerance value (optional, as it might not be provided for every property)
  weight?: number; // Weight value (optional)
  concentration?: number; // Concentration value (optional)
  diffusion?: number; // Diffusion value (optional)
}
