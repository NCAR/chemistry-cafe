import axios from "axios";
import { AddFamilyContributorRequest, APIFamily, APIFamilyContributor } from "./API_Interfaces";
import { BASE_URL } from "./API_config";
import { UUID } from "crypto";

/**
 * Creates a new family and returns the real family object from the database
 * @param familyData Data to upload
 * @throws HTTP errors
 * @returns Data as represented in the database
 */
export async function createFamily(familyData: APIFamily): Promise<APIFamily> {
  const response = await axios.post(`${BASE_URL}/families`, familyData, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data as APIFamily;
}

/**
 * Adds or updates a contributor for a family.
 * @param familyId
 * @param request
 */
export async function addFamilyContributor(
  familyId: UUID,
  request: AddFamilyContributorRequest,
): Promise<APIFamilyContributor> {
  const response = await axios.post<APIFamilyContributor>(
    `${BASE_URL}/families/${familyId}/contributors`,
    request,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}
