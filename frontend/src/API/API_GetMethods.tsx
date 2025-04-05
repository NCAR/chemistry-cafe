// API_GetMethods.ts

import axios from "axios";

import {
  APIUser
} from "./API_Interfaces";
import { AUTH_URL, BASE_URL } from "./API_config";

// Get all users
export async function getAllUsers(): Promise<APIUser[]> {
  try {
    const response = await axios.get<APIUser[]>(`${BASE_URL}/users`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching users: ${error.message}`, error);
    return [];
  }
}

// Get a specific user by ID
export async function getUserByEmail(email: string): Promise<APIUser | null> {
  try {
    // const encodedEmail = encodeURIComponent(email);
    const response = await axios.get<APIUser>(
      `${BASE_URL}/users/email/${email}`,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching user by email ${email}: ${error.message}`,
      error,
    );
    return null;
  }
}

export async function getUserById(id: string): Promise<APIUser | null> {
  try {
    const response = await axios.get<APIUser>(`${BASE_URL}/users/id/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching user ${id}: ${error.message}`, error);
    return null;
  }
}

/**
 * Gets the currently logged in user
 */
export async function getCurrentUser(): Promise<APIUser | null> {
  try {
    const response = await axios.get<APIUser>(
      `${AUTH_URL}/google/whoami`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (_) {
    return null;
  }
}
