// API_UpdateMethods.ts

import axios from "axios";
import {
  APIUser
} from "./API_Interfaces";
import { BASE_URL } from "./API_config";

// Update a user
export async function updateUser(id: string, user: APIUser) {
  try {
    const response = await axios.put(`${BASE_URL}/users/${id}`, user, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as APIUser;
  } catch (error: any) {
    console.error(`Error updating user ${id}: ${error.message}`, error);
    throw new Error("Failed to update user. Please try again later.");
  }
}

