// API_GetMethods.ts

import axios from "axios";
import { Family, Mechanism, Species, Reaction, User } from "./API_Interfaces";

// Get all families
export async function getFamilies(): Promise<Family[]> {
  try {
    const response = await axios.get<Family[]>(
      `http://localhost:8080/api/families`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get a specific family by ID
export async function getFamily(id: number): Promise<Family> {
  try {
    const response = await axios.get<Family>(
      `http://localhost:8080/api/families/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get all mechanisms
export async function getMechanisms(): Promise<Mechanism[]> {
  try {
    const response = await axios.get<Mechanism[]>(
      `http://localhost:8080/api/mechanism`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get mechanisms by family ID
export async function getMechanismsByFamilyId(
  familyId: number
): Promise<Mechanism[]> {
  try {
    const response = await axios.get<Mechanism[]>(
      `http://localhost:8080/api/mechanism/family/${familyId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get a specific mechanism by ID
export async function getMechanism(id: number): Promise<Mechanism> {
  try {
    const response = await axios.get<Mechanism>(
      `http://localhost:8080/api/mechanism/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get all species
export async function getAllSpecies(): Promise<Species[]> {
  try {
    const response = await axios.get<Species[]>(
      `http://localhost:8080/api/species`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get a specific species by ID
export async function getSpecies(id: number): Promise<Species> {
  try {
    const response = await axios.get<Species>(
      `http://localhost:8080/api/species/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get species associated with a mechanism
export async function getSpeciesByMechanismId(
  mechanismId: number
): Promise<Species[]> {
  try {
    const response = await axios.get<Species[]>(
      `http://localhost:8080/api/mechanismspecies/mechanism/${mechanismId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSpeciesByFamilyId(
  familyId: number
): Promise<Species[]> {
  try {
    const response = await axios.get<Species[]>(
      `http://localhost:8080/api/species/family/${familyId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get all reactions
export async function getReactions(): Promise<Reaction[]> {
  try {
    const response = await axios.get<Reaction[]>(
      `http://localhost:8080/api/reactions`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get a specific reaction by ID
export async function getReaction(id: number): Promise<Reaction> {
  try {
    const response = await axios.get<Reaction>(
      `http://localhost:8080/api/reactions/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get reactions associated with a mechanism
export async function getReactionsByMechanismId(
  mechanismId: number
): Promise<Reaction[]> {
  try {
    const response = await axios.get<Reaction[]>(
      `http://localhost:8080/api/reactions/mechanism/${mechanismId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getReactionsByFamilyId(
  familyId: number
): Promise<Reaction[]> {
  try {
    const response = await axios.get<Reaction[]>(
      `http://localhost:8080/api/reactions/family/${familyId}`
    );
    console.log("Logging from getReactionsByFamilyId: ", response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get all users
export async function getUsers(): Promise<User[]> {
  try {
    const response = await axios.get<User[]>(`http://localhost:8080/api/users`);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get a specific user by ID
export async function getUser(id: number): Promise<User> {
  try {
    const response = await axios.get<User>(
      `http://localhost:8080/api/users/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Download OpenAtmos JSON for a mechanism
export async function downloadOAJSON(mechanismId?: number) {
  if (!mechanismId) return "";

  try {
    const response = await axios.get(
      `http://localhost:8080/api/openatmos/json/${mechanismId}`,
      {
        responseType: "text",
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Download OpenAtmos YAML for a mechanism
export async function downloadOAYAML(mechanismId?: number) {
  if (!mechanismId) return "";

  try {
    const response = await axios.get(
      `http://localhost:8080/api/openatmos/yaml/${mechanismId}`,
      {
        responseType: "text",
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
