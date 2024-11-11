export interface Family {
  id?: string;
  name: string;
  description: string;
  createdBy: string;
}

export interface Mechanism {
  id?: string;
  family_id: string;
  name: string;
  description: string;
  created_by: string;
}

export interface Species {
  id?: string;
  name: string;
  description: string | null;
  created_by: string | null;
}

export interface Reaction {
  id?: string;
  name: string;
  description: string | null;
  createdBy: string;
}

export interface ReactionSpecies {
  id?: string;
  reaction_id: string;
  species_id: string;
  role: "reactant" | "product";
}

export interface MechanismReaction {
  id?: string;
  mechanism_id: string;
  reaction_id: string;
}

export interface MechanismSpecies {
  id?: string;
  mechanism_id: string;
  species_id: string;
}

export interface InitialConditionSpecies {
  id?: string;
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

export interface ReactionSpeciesDto {
  id?: string;
  reaction_id: string;
  species_id: string;
  role: "reactant" | "product";
  species_name: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
  email?: string | null;
  created_date?: string;
}

export interface UserMechanism {
  id?: string;
  user_id: string;
  mechanism_id: string;
  role?: string;
}

export interface Property {
  id: string; // UUID for the property entry
  species_id: string; // Foreign key to the species table (UUID)
  tolerance?: number; // Tolerance value (optional, as it might not be provided for every property)
  weight?: number; // Weight value (optional)
  concentration?: number; // Concentration value (optional)
  diffusion?: number; // Diffusion value (optional)
}

