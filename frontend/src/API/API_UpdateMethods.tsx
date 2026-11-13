// API_UpdateMethods.ts

import axios from "axios";
import {
  APIFamily,
  APIFamilyContributor,
  APIUser,
  APIUserPreferences,
  ContributorRole,
} from "./API_Interfaces";
import { BASE_URL } from "./API_config";
import { UUID } from "crypto";

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
 * Creates or updates the display preferences of the currently logged in user
 * @param preferences Preferences of the user
 * @throws HTTP errors
 */
export async function updateUserPreferences(
  preferences: APIUserPreferences,
): Promise<void> {
  await axios.put(`${BASE_URL}/users/me/preferences`, preferences, {
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

/**
 * Updates a contributor's role for a family by user GUID.
 * @param familyId
 * @param contributorUserId
 * @param role
 */
export async function updateFamilyContributor(
  familyId: UUID,
  contributorUserId: UUID,
  role: ContributorRole,
): Promise<APIFamilyContributor> {
  const response = await axios.put<APIFamilyContributor>(
    `${BASE_URL}/families/${familyId}/contributors/${contributorUserId}`,
    { role },
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}
