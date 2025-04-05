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
