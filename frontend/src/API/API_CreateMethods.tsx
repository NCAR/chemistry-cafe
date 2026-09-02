import axios from "axios";
import { APIFamily } from "./API_Interfaces";
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
