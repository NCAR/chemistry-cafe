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
  } catch (error: any) {
    console.error(`Error deleting family ${id}: ${error.message}`, error);
    throw new Error('Failed to delete family. Please try again later.');
  }
}

// Delete a mechanism
export async function deleteMechanism(id: string) {
  try {
    const response = await axios.delete(`${BASE_URL}/mechanism/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting mechanism ${id}: ${error.message}`, error);
    throw new Error('Failed to delete mechanism. Please try again later.');
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
  } catch (error: any) {
    console.error(`Error deleting species ${id}: ${error.message}`, error);
    throw new Error('Failed to delete species. Please try again later.');
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
  } catch (error: any) {
    console.error(`Error deleting reaction ${id}: ${error.message}`, error);
    throw new Error('Failed to delete reaction. Please try again later.');
  }
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    const response = await axios.delete(`${BASE_URL}/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting user ${id}: ${error.message}`, error);
    throw new Error('Failed to delete user. Please try again later.');
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
  } catch (error: any) {
    console.error(`Error deleting property ${id}: ${error.message}`, error);
    throw new Error('Failed to delete property. Please try again later.');
  }
}
