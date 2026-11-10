// API_GetMethods.ts

import axios from "axios";

import {
  APIFamily,
  APIFamilyContributor,
  APIPendingRegistration,
  APIUser,
  APIUserPreferences,
  APIUsernameAvailability,
} from "./API_Interfaces";
import { BASE_URL } from "./API_config";
import { UUID } from "crypto";

// Get all users
export async function getAllUsers(): Promise<APIUser[]> {
  try {
    const response = await axios.get<APIUser[]>(`${BASE_URL}/users`, {
      withCredentials: true,
    });
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
    const response = await axios.get<APIUser>(`${BASE_URL}/users/whoami`, {
      withCredentials: true,
    });
    return response.data;
  } catch (err: unknown) {
    console.error(
      `There was an issue fetching the currently logged in user: ${err}`,
    );
    return null;
  }
}

/**
 * Gets pending OAuth registration info from temporary cookie
 */
export async function getPendingRegistration(): Promise<APIPendingRegistration | null> {
  try {
    const response = await axios.get<APIPendingRegistration>(
      `${BASE_URL}/users/pending-registration`,
      { withCredentials: true },
    );
    return response.data;
  } catch {
    return null;
  }
}

/**
 * Checks if a username is available
 */
export async function checkUsernameAvailability(
  username: string,
  userId?: string,
): Promise<APIUsernameAvailability> {
  try {
    const url = userId
      ? `${BASE_URL}/users/check-username?username=${encodeURIComponent(username)}&userId=${encodeURIComponent(userId)}`
      : `${BASE_URL}/users/check-username?username=${encodeURIComponent(username)}`;
    const response = await axios.get<APIUsernameAvailability>(url, {
      withCredentials: true,
    });
    return response.data;
  } catch (err: unknown) {
    let message = "Failed to check username availability";
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      message = err.response.data.message;
    }
    return {
      available: false,
      message,
    };
  }
}

/**
 * Gets the display preferences of the currently logged in user
 * @throws HTTP errors
 * @returns The preferences, or null if the user has not saved any
 */
export async function getUserPreferences(): Promise<APIUserPreferences | null> {
  const response = await axios.get<APIUserPreferences>(
    `${BASE_URL}/users/me/preferences`,
    {
      withCredentials: true,
    },
  );
  return response.status === 204 ? null : response.data;
}

export async function getAllFamilies(
  urlParameters?: string,
): Promise<Array<APIFamily>> {
  const response = await axios.get<Array<APIFamily>>(
    encodeURI(`${BASE_URL}/families${urlParameters ?? ""}`),
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function getFamily(id: UUID) {
  const response = await axios.get<APIFamily>(
    `${BASE_URL}/families/${id}?expand=true`,
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function getFamilyVersion(familyId: UUID, versionId: UUID) {
  const response = await axios.get<APIFamily>(
    `${BASE_URL}/families/${familyId}/versions/${versionId}`,
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function getFamilyContributors(
  familyId: UUID,
): Promise<Array<APIFamilyContributor>> {
  const response = await axios.get<Array<APIFamilyContributor>>(
    `${BASE_URL}/families/${familyId}/contributors`,
    {
      withCredentials: true,
    },
  );

  return response.data;
}
