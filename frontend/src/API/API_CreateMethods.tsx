import axios from "axios";
import {
  APIFamily,
  APIMechanism,
  APISpecies,
  APIReaction,
  APIReactionSpecies,
  APIMechanismReaction,
  APIMechanismSpecies,
  APIUser,
  APIProperty,
} from "./API_Interfaces";
import { BASE_URL } from "./API_config";

export async function createFamily(familyData: APIFamily) {
  try {
    const response = await axios.post(`${BASE_URL}/families`, familyData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as APIFamily;
  } catch (error: any) {
    console.error(
      `Error creating family ${familyData.id}: ${error.message}`,
      error,
    );
    throw new Error("Failed to create family. Please try again later.");
  }
}

export async function createMechanism(mechanismData: APIMechanism) {
  try {
    const response = await axios.post(`${BASE_URL}/mechanism`, mechanismData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as APIMechanism;
  } catch (error: any) {
    console.error(
      `Error creating mechanism ${mechanismData.id}: ${error.message}`,
      error,
    );
    throw new Error("Failed to create mechanism. Please try again later.");
  }
}

export async function createReaction(reactionData: APIReaction) {
  try {
    console.log("Reaction data: ", reactionData);
    const response = await axios.post(`${BASE_URL}/reactions`, reactionData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as APIReaction;
  } catch (error: any) {
    console.error(
      `Error creating reaction ${reactionData}: ${error.message}`,
      error,
    );
    throw new Error("Failed to create reaction. Please try again later.");
  }
}

export async function createSpecies(speciesData: APISpecies) {
  try {
    const response = await axios.post(`${BASE_URL}/species`, speciesData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as APISpecies;
  } catch (error: any) {
    console.error(
      `Error creating species ${speciesData}: ${error.message}`,
      error,
    );
    throw new Error("Failed to create species. Please try again later.");
  }
}

export async function addSpeciesToReaction(
  reactionSpeciesData: APIReactionSpecies,
) {
  try {
    const response = await axios.post(
      `${BASE_URL}/reactionspecies`,
      reactionSpeciesData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data as APIReactionSpecies;
  } catch (error: any) {
    console.error(
      `Error adding species ${reactionSpeciesData.species_id} to reaction  ${reactionSpeciesData.reaction_id}: ${error.message}`,
      error,
    );
    throw new Error(
      "Failed to add species to reaction. Please try again later.",
    );
  }
}

export async function addReactionToMechanism(
  mechanismReactionData: APIMechanismReaction,
) {
  try {
    const response = await axios.post(
      `${BASE_URL}/mechanismreactions`,
      mechanismReactionData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data as APIMechanismReaction;
  } catch (error: any) {
    console.error(
      `Error add reaction ${mechanismReactionData.reaction_id} to mechanism ${mechanismReactionData.mechanism_id}: ${error.message}`,
      error,
    );
    throw new Error(
      "Failed to add reaction to mechanism. Please try again later.",
    );
  }
}

export async function addSpeciesToMechanism(
  mechanismSpeciesData: APIMechanismSpecies,
) {
  try {
    const response = await axios.post(
      `${BASE_URL}/mechanismspecies`,
      mechanismSpeciesData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data as APIMechanismSpecies;
  } catch (error: any) {
    console.error(
      `Error adding species ${mechanismSpeciesData.species_id} to mechanism ${mechanismSpeciesData.mechanism_id}: ${error.message}`,
      error,
    );
    throw new Error(
      "Failed to add species to mechanism. Please try again later.",
    );
  }
}

export async function createUser(userData: APIUser) {
  try {
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as APIUser;
  } catch (error: any) {
    console.error(
      `Error creating user ${userData.id}: ${error.message}`,
      error,
    );
    throw new Error("Failed to create user. Please try again later.");
  }
}

export async function createProperty(propertyData: APIProperty) {
  try {
    const response = await axios.post(
      `${BASE_URL}/properties`, // Adjust the URL to match your properties API endpoint
      propertyData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data as APIProperty;
  } catch (error: any) {
    console.error(
      `Error creating property ${propertyData.id}: ${error.message}`,
      error,
    );
    throw new Error("Failed to create property. Please try again later.");
  }
}
