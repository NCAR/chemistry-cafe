import axios from "axios";
import {
  APIFamily,
  APIMechanism,
  APIPhase,
  APIReaction,
  APISpecies,
} from "./API_Interfaces";
import { BASE_URL } from "./API_config";

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
 * Creates a new species and returns the real species object from the database
 * @param speciesData Data to upload
 * @throws HTTP errors
 * @returns Data as represented in the database
 */
export async function createSpecies(
  speciesData: APISpecies,
): Promise<APISpecies> {
  const response = await axios.post(
    `${BASE_URL}/species?familyId=${speciesData.familyId}`,
    speciesData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data as APISpecies;
}

/**
 * Creates a new reaction and returns the real reaction object from the database
 * @param reactionData Data to upload
 * @throws HTTP errors
 * @returns Data as represented in the database
 */
export async function createReaction(
  reactionData: APIReaction,
): Promise<APIReaction> {
  const response = await axios.post(
    `${BASE_URL}/reactions?familyId=${reactionData.familyId}`,
    reactionData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data as APIReaction;
}

/**
 * Creates a new phase and returns the real phase object from the database
 * @param phaseData Data to upload
 * @throws HTTP errors
 * @returns Data as represented in the database
 */
export async function createPhase(phaseData: APIPhase): Promise<APIPhase> {
  const response = await axios.post(
    `${BASE_URL}/phases?familyId=${phaseData.familyId}`,
    phaseData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data as APIPhase;
}

/**
 * Creates a new mechanism and returns the real mechanism object from the database
 * @param mechanismData Data to upload
 * @throws HTTP errors
 * @returns Data as represented in the database
 */
export async function createMechanism(
  mechanismData: APIMechanism,
): Promise<APIMechanism> {
  const response = await axios.post(
    `${BASE_URL}/mechanisms?familyId=${mechanismData.familyId}`,
    mechanismData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data as APIMechanism;
}
