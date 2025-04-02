import axios from "axios";
import {
  APIUser
} from "./API_Interfaces";
import { BASE_URL } from "./API_config";

export async function createUser(userData: APIUser) {
  try {
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as APIUser;
  } catch (error: any) {
    console.error(
      `Error creating user ${userData.id}: ${error.message}`,
      error,
    );
    throw new Error("Failed to create user. Please try again later.");
  }
}