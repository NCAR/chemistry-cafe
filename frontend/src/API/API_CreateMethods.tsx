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
  } catch (error) {
    console.error(error);
    throw error;
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
  } catch (error) {
    console.error(error);
    throw error;
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
  } catch (error) {
    console.error(error);
    throw error;
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
  } catch (error) {
    console.error(error);
    throw error;
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
  } catch (error) {
    console.error(error);
    throw error;
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
  } catch (error) {
    console.error(error);
    throw error;
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
  } catch (error) {
    console.error(error);
    throw error;
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
  } catch (error) {
    console.error(error);
    throw error;
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
  } catch (error) {
    console.error(error);
    throw error;
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
  } catch (error) {
    console.error(error);
    throw error;
  }
}
