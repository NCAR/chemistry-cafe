// API_GetMethods.ts

import axios from "axios";

import {
  Family,
  Mechanism,
  Species,
  Reaction,
  User,
  ReactionSpeciesDto,
  InitialConditionSpecies,
  Property,
  UserClaims,
} from "./API_Interfaces";
import { AUTH_URL, BASE_URL } from "./API_config";

// Get all families
export async function getFamilies(): Promise<Family[]> {
  try {
    const response = await axios.get<Family[]>(`${BASE_URL}/families`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching families: ${error.message}`, error);
    return [];
  }
}

// Get a specific family by ID
export async function getFamily(id: string): Promise<Family> {
  try {
    const response = await axios.get<Family>(`${BASE_URL}/families/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching family ${id}: ${error.message}`, error);
    throw new Error("Failed to fetch family. Please try again later.");
  }
}

// Get all mechanisms
export async function getMechanisms(): Promise<Mechanism[]> {
  try {
    const response = await axios.get<Mechanism[]>(`${BASE_URL}/mechanism`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching Mechanisms: ${error.message}`, error);
    return [];
  }
}

// Get mechanisms by family ID
export async function getMechanismsByFamilyId(
  familyId: string,
): Promise<Mechanism[]> {
  try {
    const response = await axios.get<Mechanism[]>(
      `${BASE_URL}/mechanism/family/${familyId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching Mechanisms with family ${familyId}: ${error.message}`,
      error,
    );
    return [];
  }
}

// Get a specific mechanism by ID
export async function getMechanism(id: string): Promise<Mechanism> {
  try {
    const response = await axios.get<Mechanism>(`${BASE_URL}/mechanism/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching mechanism ${id}: ${error.message}`, error);
    throw new Error("Failed to fetch mechanism. Please try again later.");
  }
}

// Get all species
export async function getAllSpecies(): Promise<Species[]> {
  try {
    const response = await axios.get<Species[]>(`${BASE_URL}/species`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching species: ${error.message}`, error);
    return [];
  }
}

// Get a specific species by ID
export async function getSpecies(id: string): Promise<Species> {
  try {
    const response = await axios.get<Species>(`${BASE_URL}/species/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching species ${id}: ${error.message}`, error);
    throw new Error("Failed to fetch species. Please try again later.");
  }
}

// Get species associated with a mechanism
export async function getSpeciesByMechanismId(
  mechanismId: string,
): Promise<Species[]> {
  try {
    const response = await axios.get<Species[]>(
      `${BASE_URL}/mechanismspecies/mechanism/${mechanismId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching species with mechanism ${mechanismId}: ${error.message}`,
      error,
    );
    return [];
  }
}

export async function getSpeciesByFamilyId(
  familyId: string,
): Promise<Species[]> {
  try {
    const response = await axios.get<Species[]>(
      `${BASE_URL}/species/family/${familyId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching species with family ${familyId}: ${error.message}`,
      error,
    );
    return [];
  }
}

// Get all reactions
export async function getReactions(): Promise<Reaction[]> {
  try {
    const response = await axios.get<Reaction[]>(`${BASE_URL}/reactions`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching species with reactions: ${error.message}`,
      error,
    );
    return [];
  }
}

// Get a specific reaction by ID
export async function getReaction(id: string): Promise<Reaction> {
  try {
    const response = await axios.get<Reaction>(`${BASE_URL}/reactions/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching reaction ${id}: ${error.message}`, error);
    throw new Error("Failed to fetch reaction. Please try again later.");
  }
}

// Get reactions associated with a mechanism
export async function getReactionsByMechanismId(
  mechanismId: string,
): Promise<Reaction[]> {
  try {
    const response = await axios.get<Reaction[]>(
      `${BASE_URL}/reactions/mechanism/${mechanismId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching reactions from mechanism ${mechanismId}: ${error.message}`,
      error,
    );
    return [];
  }
}

export async function getReactionsByFamilyId(
  familyId: string,
): Promise<Reaction[]> {
  try {
    const response = await axios.get<Reaction[]>(
      `${BASE_URL}/reactions/family/${familyId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching reactions from family ${familyId}: ${error.message}`,
      error,
    );
    return [];
  }
}

export async function getReactantsByReactionIdAsync(
  reactionId: string,
): Promise<ReactionSpeciesDto[]> {
  try {
    const response = await axios.get<ReactionSpeciesDto[]>(
      `${BASE_URL}/reactionspecies/reaction/${reactionId}/reactants`,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching reactants from reaction ${reactionId}: ${error.message}`,
      error,
    );
    return [];
  }
}

export async function getProductsByReactionIdAsync(
  reactionId: string,
): Promise<ReactionSpeciesDto[]> {
  try {
    const response = await axios.get<ReactionSpeciesDto[]>(
      `${BASE_URL}/reactionspecies/reaction/${reactionId}/products`,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching products from reaction ${reactionId}: ${error.message}`,
      error,
    );
    return [];
  }
}

// Get all users
export async function getUsers(): Promise<User[]> {
  try {
    const response = await axios.get<User[]>(`${BASE_URL}/users`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching users: ${error.message}`, error);
    return [];
  }
}

// Get a specific user by ID
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // const encodedEmail = encodeURIComponent(email);
    const response = await axios.get<User>(`${BASE_URL}/users/email/${email}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching user by email ${email}: ${error.message}`,
      error,
    );
    throw new Error("Failed to fetch user. Please try again later.");
  }
}

export async function getUserById(id: string): Promise<User> {
  try {
    const response = await axios.get<User>(`${BASE_URL}/users/id/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching user ${id}: ${error.message}`, error);
    throw new Error("Failed to fetch user. Please try again later.");
  }
}

/**
 * Gets the currently logged in user claims
 */
export async function getGoogleAuthUser(): Promise<UserClaims | null> {
  try {
    const response = await axios.get<UserClaims>(`${AUTH_URL}/google/whoami`, { withCredentials: true, });
    return response.data;
  }
  catch (error: any) {
    console.error(`Error fetching current user: ${error}`);
    return null;
  }
}

export async function getPropertyById(id: string): Promise<Property> {
  try {
    const response = await axios.get<Property>(
      `${BASE_URL}/properties/id/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching user by property ${id}: ${error.message}`,
      error,
    );
    throw new Error("Failed to fetch property. Please try again later.");
  }
}

export async function getPropertyBySpeciesAndMechanism(
  species: string,
  mechanism: string,
): Promise<Property> {
  try {
    const response = await axios.get<Property>(
      `${BASE_URL}/properties/id/${species}/${mechanism}`,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching property by species ${species} and mechanism ${mechanism}: ${error.message}`,
      error,
    );
    throw new Error(
      "Failed to fetch property by species and mechanism. Please try again later.",
    );
  }
}

// Download OpenAtmos JSON for a mechanism
export async function downloadOAJSON(mechanismId?: string) {
  if (!mechanismId) return "";

  try {
    const response = await axios.get(
      `${BASE_URL}/openatmos/mechanism/${mechanismId}/json`,
      {
        responseType: "text",
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}

// Download OpenAtmos YAML for a mechanism
export async function downloadOAYAML(mechanismId?: string) {
  if (!mechanismId) return "";

  try {
    const response = await axios.get(
      `${BASE_URL}/openatmos/mechanism/${mechanismId}/yaml`,
      {
        responseType: "text",
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}

// Download OpenAtmos MuiscBox for a mechanism
export async function downloadOAMusicbox(mechanismId?: string) {
  if (!mechanismId) return "";

  try {
    const response = await axios.get(
      `${BASE_URL}/openatmos/mechanism/${mechanismId}/musicbox`,
      {
        responseType: "arraybuffer", // Handle binary data
        headers: {
          Accept: "application/zip", // Expecting a zip file
        },
      },
    );

    // Return the response data as an array buffer for further processing
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}

// species properties
export async function getSpeciesPropertiesByMechanismIDAsync(
  mechanismId: string,
): Promise<InitialConditionSpecies[]> {
  try {
    const response = await axios.get<InitialConditionSpecies[]>(
      `${BASE_URL}/initialconditionspecies/mechanism/${mechanismId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error(error);
    return [];
  }
}
