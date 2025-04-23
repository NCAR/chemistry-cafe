// API_UpdateMethods.ts

import axios from "axios";
import { APIFamily, APIMechanism, APIPhase, APIReaction, APISpecies, APIUser } from "./API_Interfaces";
import { BASE_URL } from "./API_config";

/**
 * Updates a user to
 * @param user User info
 * @throws HTTP errors
 * @returns Updated user from the database
 */
export async function updateUser(user: APIUser): Promise<void> {
  if (!user.id) {
    throw new Error("User id is undefined or empty");
  }

  await axios.put(`${BASE_URL}/users/${user.id}`, user, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Updates the shallow values of a family (Not nested objects)
 * @param family Family info
 * @throws HTTP errors
 */
export async function updateFamily(family: APIFamily): Promise<void> {
  await axios.patch(`${BASE_URL}/families/${family.id}`, family, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateSpecies(species: APISpecies): Promise<void> {
  await axios.patch(`${BASE_URL}/species/${species.id}`, species, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateReaction(reaction: APIReaction): Promise<void> {
  await axios.patch(`${BASE_URL}/reactions/${reaction.id}`, reaction, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
export async function updatePhase(phase: APIPhase): Promise<void> {
  await axios.patch(`${BASE_URL}/phases/${phase.id}`, phase, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
export async function updateMechanism(mechanism: APIMechanism): Promise<void> {
  await axios.patch(`${BASE_URL}/mechanisms/${mechanism.id}`, mechanism, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
