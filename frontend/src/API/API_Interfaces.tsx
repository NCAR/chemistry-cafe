export interface Family {
  id?: string;
  name: string;
  description: string;
  created_by: string;
}

export interface Mechanism {
  id: string;
  family_id: string;
  name: string;
  description: string;
  created_by: string;
  createdDate: string;
}

export interface Species {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_date: string;
}

export interface Reaction {
  id: string;
  equation: string;
  description: string | null;
  createdBy: string;
  createdDate: string;
}

export interface ReactionSpecies {
  id?: string;
  reaction_id: string;
  species_id: string;
  quantity?: number;
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
