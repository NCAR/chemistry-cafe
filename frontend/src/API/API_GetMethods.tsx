// API_GetMethods.ts

import axios from "axios";
import {
  Family,
  Mechanism,
  Species,
  Reaction,
  User,
  ReactionSpeciesDto,
} from "./API_Interfaces";

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
export async function getFamily(id: string): Promise<Family> {
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
  familyId: string
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
export async function getMechanism(id: string): Promise<Mechanism> {
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
export async function getSpecies(id: string): Promise<Species> {
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
  mechanismId: string
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
  familyId: string
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
export async function getReaction(id: string): Promise<Reaction> {
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
  mechanismId: string
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
  familyId: string
): Promise<Reaction[]> {
  try {
    const response = await axios.get<Reaction[]>(
      `http://localhost:8080/api/reactions/family/${familyId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getReactantsByReactionIdAsync(
  reactionId: string
): Promise<ReactionSpeciesDto[]> {
  try {
    const response = await axios.get<ReactionSpeciesDto[]>(
      `http://localhost:8080/api/reactionspecies/reaction/${reactionId}/reactants`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getProductsByReactionIdAsync(
  reactionId: string
): Promise<ReactionSpeciesDto[]> {
  try {
    const response = await axios.get<ReactionSpeciesDto[]>(
      `http://localhost:8080/api/reactionspecies/reaction/${reactionId}/products`
    );
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
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // const encodedEmail = encodeURIComponent(email);
    const response = await axios.get<User>(
      `http://localhost:8080/api/users/email/${email}`
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    } else {
      console.error(error);
      throw error;
    }
  }
}

export async function getUserById(id: string): Promise<User> {
  try {
    const response = await axios.get<User>(
      `http://localhost:8080/api/users/id/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Download OpenAtmos JSON for a mechanism
export async function downloadOAJSON(mechanismId?: string) {
  if (!mechanismId) return "";

  try {
    const response = await axios.get(
      `http://localhost:8080/api/openatmos/mechanism/${mechanismId}/json`,
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
export async function downloadOAYAML(mechanismId?: string) {
  if (!mechanismId) return "";

  try {
    const response = await axios.get(
      `http://localhost:8080/api/openatmos/mechanism/${mechanismId}/yaml`,
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

// Download OpenAtmos MuiscBox for a mechanism
export async function downloadOAMusicbox(mechanismId?: string) {
  if (!mechanismId) return "";

  try {
    const response = await axios.get(
      `http://localhost:8080/api/openatmos/mechanism/${mechanismId}/musicbox`,
      {
        responseType: "arraybuffer", // Handle binary data
        headers: {
          "Accept": "application/zip", // Expecting a zip file
        },
      }
    );

    // Return the response data as an array buffer for further processing
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}