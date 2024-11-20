// API_UpdateMethods.ts

import axios from "axios";
import { Family, Mechanism, Species, Reaction, User, Property } from "./API_Interfaces";
import { BASE_URL } from "./API_config";

// Update a family
export async function updateFamily(family: Family) {
  try {
    const response = await axios.put(
      `${BASE_URL}/families/${family.id}`,
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
      `${BASE_URL}/mechanism/${mechanism.id}`,
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
      `${BASE_URL}/species/${species.id}`,
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
      `${BASE_URL}/reactions/${reaction.id}`,
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
      `${BASE_URL}/users/${id}`,
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
      `${BASE_URL}/properties/${property.id}`,
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

