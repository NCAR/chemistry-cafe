// API_GetMethods.ts

import axios from "axios";

import {
  APIUser
} from "./API_Interfaces";
import { AUTH_URL, BASE_URL } from "./API_config";

// Get all users
export async function getUsers(): Promise<APIUser[]> {
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
    throw new Error("Failed to fetch user. Please try again later.");
  }
}

export async function getUserById(id: string): Promise<APIUser> {
  try {
    const response = await axios.get<APIUser>(`${BASE_URL}/users/id/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching user ${id}: ${error.message}`, error);
    throw new Error("Failed to fetch user. Please try again later.");
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
  } catch (error: any) {
    console.error(`Error fetching current user: ${error}`);
    return null;
  }
}

// Download OpenAtmos JSON for a mechanism
export async function downloadOAJSON(mechanismId?: string) {
  if (!mechanismId) return "";

  try {
    const response = await axios.get(
      `${BASE_URL}/openatmos/mechanism/${mechanismId}/json`,
      {
        responseType: "text",
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}

// Download OpenAtmos YAML for a mechanism
export async function downloadOAYAML(mechanismId?: string) {
  if (!mechanismId) return "";

  try {
    const response = await axios.get(
      `${BASE_URL}/openatmos/mechanism/${mechanismId}/yaml`,
      {
        responseType: "text",
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}

// Download OpenAtmos MuiscBox for a mechanism
export async function downloadOAMusicbox(mechanismId?: string) {
  if (!mechanismId) return "";

  try {
    const response = await axios.get(
      `${BASE_URL}/openatmos/mechanism/${mechanismId}/musicbox`,
      {
        responseType: "arraybuffer", // Handle binary data
        headers: {
          Accept: "application/zip", // Expecting a zip file
        },
      },
    );

    // Return the response data as an array buffer for further processing
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}