import axios from "axios";
import {
  Family,
  Mechanism,
  Species,
  Reaction,
  ReactionSpecies,
  MechanismReaction,
  MechanismSpecies,
  User,
  UserMechanism,
  Property,
} from "./API_Interfaces";
import { BASE_URL } from "./API_config";

export async function createFamily(familyData: Family) {
  try {
    console.log("Family data: ", familyData);
    const response = await axios.post(`${BASE_URL}/families`, familyData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as Family;
  } catch (error: any) {
    console.error(`Error creating family ${familyData.id}: ${error.message}`, error);
    throw new Error('Failed to create family. Please try again later.');
  }
}

export async function createMechanism(mechanismData: Mechanism) {
  try {
    const response = await axios.post(`${BASE_URL}/mechanism`, mechanismData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as Mechanism;
  } catch (error: any) {
    console.error(`Error creating mechanism ${mechanismData.id}: ${error.message}`, error);
    throw new Error('Failed to create mechanism. Please try again later.');
  }
}

export async function createReaction(reactionData: Reaction) {
  try {
    console.log("Reaction data: ", reactionData);
    const response = await axios.post(`${BASE_URL}/reactions`, reactionData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as Reaction;
  } catch (error: any) {
    console.error(`Error creating reaction ${reactionData}: ${error.message}`, error);
    throw new Error('Failed to create reaction. Please try again later.');
  }
}

export async function createSpecies(speciesData: Species) {
  try {
    const response = await axios.post(`${BASE_URL}/species`, speciesData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as Species;
  } catch (error: any) {
    console.error(`Error creating species ${speciesData}: ${error.message}`, error);
    throw new Error('Failed to create species. Please try again later.');
  }
}

export async function addSpeciesToReaction(
  reactionSpeciesData: ReactionSpecies,
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
    return response.data as ReactionSpecies;
  } catch (error: any) {
    console.error(`Error adding species ${reactionSpeciesData.species_id} to reaction  ${reactionSpeciesData.reaction_id}: ${error.message}`, error);
    throw new Error('Failed to add species to reaction. Please try again later.');
  }
}

export async function addReactionToMechanism(
  mechanismReactionData: MechanismReaction,
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
    return response.data as MechanismReaction;
  } catch (error: any) {
    console.error(`Error add reaction ${mechanismReactionData.reaction_id} to mechanism ${mechanismReactionData.mechanism_id}: ${error.message}`, error);
    throw new Error('Failed to add reaction to mechanism. Please try again later.');
  }
}

export async function addSpeciesToMechanism(
  mechanismSpeciesData: MechanismSpecies,
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
    return response.data as MechanismSpecies;
  } catch (error: any) {
    console.error(`Error adding species ${mechanismSpeciesData.species_id} to mechanism ${mechanismSpeciesData.mechanism_id}: ${error.message}`, error);
    throw new Error('Failed to add species to mechanism. Please try again later.');
  }
}

export async function createUser(userData: User) {
  try {
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as User;
  } catch (error: any) {
    console.error(`Error creating user ${userData.id}: ${error.message}`, error);
    throw new Error('Failed to create user. Please try again later.');
  }
}

export async function addUserToMechanism(userMechanismData: UserMechanism) {
  try {
    const response = await axios.post(
      `${BASE_URL}/usermechanism`,
      userMechanismData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data as UserMechanism;
  } catch (error: any) {
    console.error(`Error adding user ${userMechanismData.user_id} to mechanism: ${userMechanismData.mechanism_id} ${error.message}`, error);
    throw new Error('Failed to add user to mechanism. Please try again later.');
  }
}

export async function createProperty(propertyData: Property) {
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
    return response.data as Property;
  } catch (error: any) {
    console.error(`Error creating property ${propertyData.id}: ${error.message}`, error);
    throw new Error('Failed to create property. Please try again later.');
  }
}
