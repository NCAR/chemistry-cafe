// API_DeleteMethods.ts

import axios from "axios";
import { BASE_URL } from "./API_config";

/**
 * Deletes a given user.
 * A user must be an admin or the user
 * @param id
 * @returns
 */
export async function deleteUser(id: string) {
  const response = await axios.delete(`${BASE_URL}/users/${id}`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
}

export async function deleteSpecies(id: string) {
  await axios.delete(`${BASE_URL}/species/${id}`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteReaction(id: string) {
  await axios.delete(`${BASE_URL}/reactions/${id}`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deletePhase(id: string) {
  await axios.delete(`${BASE_URL}/phases/${id}`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteMechanism(id: string) {
  await axios.delete(`${BASE_URL}/mechanisms/${id}`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteFamily(id: string) {
  await axios.delete(`${BASE_URL}/families/${id}`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
