// API_DeleteMethods.ts

import axios from "axios";

// Delete a family
export async function deleteFamily(id: string) {
  try {
    const response = await axios.delete(
      `http://localhost:8080/api/families/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // Return response or a success indicator
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Delete a mechanism
export async function deleteMechanism(id: string) {
  try {
    const response = await axios.delete(
      `http://localhost:8080/api/mechanism/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Delete a species
export async function deleteSpecies(id: string) {
  try {
    const response = await axios.delete(
      `http://localhost:8080/api/species/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Delete a reaction
export async function deleteReaction(id: string) {
  try {
    const response = await axios.delete(
      `http://localhost:8080/api/reactions/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Delete a user (if applicable)
export async function deleteUser(id: string) {
  try {
    const response = await axios.delete(
      `http://localhost:8080/api/users/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
