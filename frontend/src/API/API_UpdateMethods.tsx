// API_UpdateMethods.ts

import axios from "axios";
import { APIFamily, APIUser } from "./API_Interfaces";
import { BASE_URL } from "./API_config";

/**
 * Updates a user to
 * @param user User info
 * @throws HTTP errors
 * @returns Updated user from the database
 */
export async function updateUser(user: APIUser): Promise<void> {
  await axios.put(`${BASE_URL}/users/${user.id}`, user, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Updates a family and its whole graph in a single transactional request.
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
