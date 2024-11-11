// API_UpdateMethods.ts

import axios from "axios";
import { Family, Mechanism, Species, Reaction, User, Property } from "./API_Interfaces";

// Update a family
export async function updateFamily(family: Family) {
  try {
    const response = await axios.put(
      `http://localhost:8080/api/families/${family.id}`,
      family,
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

// Update a mechanism
export async function updateMechanism(mechanism: Mechanism) {
  try {
    const response = await axios.put(
      `http://localhost:8080/api/mechanism/${mechanism.id}`,
      mechanism,
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

// Update a species
export async function updateSpecies(species: Species) {
  try {
    const response = await axios.put(
      `http://localhost:8080/api/species/${species.id}`,
      species,
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

// Update a reaction
export async function updateReaction(reaction: Reaction) {
  try {
    const response = await axios.put(
      `http://localhost:8080/api/reactions/${reaction.id}`,
      reaction,
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

export async function updateUser(id: string, user: User) {
  try {
    const response = await axios.put(
      `http://localhost:8080/api/users/${id}`,
      user,
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

export async function updateProperty(property: Property) {
  try {
    const response = await axios.put(
      `http://localhost:8080/api/properties/${property.id}`,
      property,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as Property;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

