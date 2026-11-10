import axios from "axios";
import {
  AddFamilyContributorRequest,
  APIFamily,
  APIFamilyContributor,
  APIRegisterUser,
  APIUser,
  APIVerifiedMechanismVersion,
  ArchiveMechanismRequest,
  DeprecateMechanismRequest,
  VerifyMechanismRequest,
} from "./API_Interfaces";
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
 * Adds a contributor for a family by username.
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

/**
 * Completes OAuth registration by creating a user with the chosen username
 */
export async function registerUser(request: APIRegisterUser): Promise<APIUser> {
  const response = await axios.post<APIUser>(
    `${BASE_URL}/users/register`,
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

export async function verifyMechanism(
  familyId: UUID,
  mechanismId: UUID,
  request: VerifyMechanismRequest,
): Promise<APIVerifiedMechanismVersion> {
  const response = await axios.post<APIVerifiedMechanismVersion>(
    `${BASE_URL}/families/${familyId}/mechanisms/${mechanismId}/verify`,
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

export async function deprecateMechanism(
  familyId: UUID,
  mechanismId: UUID,
  request: DeprecateMechanismRequest,
): Promise<APIVerifiedMechanismVersion> {
  const response = await axios.post<APIVerifiedMechanismVersion>(
    `${BASE_URL}/families/${familyId}/mechanisms/${mechanismId}/deprecate`,
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

export async function archiveMechanism(
  familyId: UUID,
  mechanismId: UUID,
  request: ArchiveMechanismRequest,
): Promise<APIVerifiedMechanismVersion> {
  const response = await axios.post<APIVerifiedMechanismVersion>(
    `${BASE_URL}/families/${familyId}/mechanisms/${mechanismId}/archive`,
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
