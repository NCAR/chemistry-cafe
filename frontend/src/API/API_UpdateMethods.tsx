// API_UpdateMethods.ts

import axios from "axios";
import {
  Family,
  Mechanism,
  Species,
  Reaction,
  User,
  Property,
} from "./API_Interfaces";
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
      },
    );
    return response.data as Family;
  } catch (error: any) {
    console.error(`Error updating family ${family}: ${error.message}`, error);
    throw new Error('Failed to update family. Please try again later.');
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
      },
    );
    return response.data as Mechanism;
  } catch (error: any) {
    console.error(`Error updating mechanism ${mechanism}: ${error.message}`, error);
    throw new Error('Failed to update mechanism. Please try again later.');
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
      },
    );
    return response.data as Species;
  } catch (error: any) {
    console.error(`Error updating species ${species}: ${error.message}`, error);
    throw new Error('Failed to update species. Please try again later.');
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
      },
    );
    return response.data as Reaction;
  } catch (error: any) {
    console.error(`Error updating reaction ${reaction}: ${error.message}`, error);
    throw new Error('Failed to update reaction. Please try again later.');
  }
}

export async function updateUser(id: string, user: User) {
  try {
    const response = await axios.put(`${BASE_URL}/users/${id}`, user, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as User;
  } catch (error: any) {
    console.error(`Error updating user ${id}: ${error.message}`, error);
    throw new Error('Failed to update user. Please try again later.');
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
      },
    );
    return response.data as Property;
  } catch (error: any) {
    console.error(`Error updating property ${property}: ${error.message}`, error);
    throw new Error('Failed to update property. Please try again later.');
  }
}
