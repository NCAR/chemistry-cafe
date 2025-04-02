// API_DeleteMethods.ts

import axios from "axios";
import { BASE_URL } from "./API_config";

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
    throw new Error("Failed to delete user. Please try again later.");
  }
}