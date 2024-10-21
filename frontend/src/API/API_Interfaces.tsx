export interface Family {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdDate: string;
}

export interface Mechanism {
  id: number;
  familyId: number;
  name: string;
  description: string;
  createdBy: string;
  createdDate: string;
}

export interface Species {
  id: number;
  name: string;
  description: string | null;
  createdBy: string | null;
  createdDate: string;
}

export interface Reaction {
  id: number;
  equation: string;
  description: string | null;
  createdBy: string;
  createdDate: string;
}

export interface ReactionSpecies {
  id?: number;
  reaction_id: number;
  species_id: number;
  role: "reactant" | "product";
}

export interface MechanismReaction {
  id?: number;
  mechanism_id: number;
  reaction_id: number;
}

export interface MechanismSpecies {
  id?: number;
  mechanism_id: number;
  species_id: number;
}

export interface InitialConditionSpecies {
  id?: number;
  mechanism_id: number;
  species_id: number;
  concentration?: number;
  temperature?: number;
  pressure?: number;
  additional_conditions?: string;
}

export interface User {
  id?: number;
  username: string;
  role: string;
  email?: string | null;
  created_date?: string;
}

export interface UserMechanism {
  id?: number;
  user_id: number;
  mechanism_id: number;
  role?: string;
}
