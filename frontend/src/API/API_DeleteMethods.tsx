// API_DeleteMethods.ts

import axios from "axios";
import { BASE_URL } from "./API_config";

// Delete a family
export async function deleteFamily(id: string) {
  try {
    const response = await axios.delete(`${BASE_URL}/families/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data; // Return response or a success indicator
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Delete a mechanism
export async function deleteMechanism(id: string) {
  try {
    const response = await axios.delete(`${BASE_URL}/mechanism/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Delete a species
export async function deleteSpecies(id: string) {
  try {
    const response = await axios.delete(`${BASE_URL}/species/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Delete a reaction
export async function deleteReaction(id: string) {
  try {
    const response = await axios.delete(`${BASE_URL}/reactions/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Delete a user (if applicable)
export async function deleteUser(id: string) {
  try {
    const response = await axios.delete(`${BASE_URL}/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteProperty(id: string) {
  try {
    const response = await axios.delete(`${BASE_URL}/properties/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
