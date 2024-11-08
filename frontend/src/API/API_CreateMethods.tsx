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
} from "./API_Interfaces";

export async function createFamily(familyData: Family) {
  try {
    console.log("Family data: ", familyData);
    const response = await axios.post(
      "http://localhost:8080/api/families",
      familyData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as Family;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createMechanism(mechanismData: Mechanism) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/mechanism",
      mechanismData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as Mechanism;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createReaction(reactionData: Reaction) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/reactions",
      reactionData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as Reaction;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createSpecies(speciesData: Species) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/species",
      speciesData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as Species;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addSpeciesToReaction(
  reactionSpeciesData: ReactionSpecies
) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/reactionspecies",
      reactionSpeciesData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as ReactionSpecies;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addReactionToMechanism(
  mechanismReactionData: MechanismReaction
) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/mechanismreactions",
      mechanismReactionData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as MechanismReaction;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addSpeciesToMechanism(
  mechanismSpeciesData: MechanismSpecies
) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/mechanismspecies",
      mechanismSpeciesData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as MechanismSpecies;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createUser(userData: User) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/users",
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as User;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addUserToMechanism(userMechanismData: UserMechanism) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/usermechanism",
      userMechanismData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as UserMechanism;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
