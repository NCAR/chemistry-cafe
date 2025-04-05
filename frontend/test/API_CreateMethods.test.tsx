import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import {
  createFamily,
  createSpecies,
  createReaction,
  createMechanism,
} from "../src/API/API_CreateMethods";
import { APIFamily, APIMechanism, APIReaction, APISpecies, APIUser } from "../src/API/API_Interfaces";
import { BASE_URL } from "../src/API/API_config";

// Mock axios using vitest's built-in mock function
vi.mock("axios");

const mockUser: APIUser = {
  id: "1-1-1-1-1",
  username: "Test User",
  role: "admin",
};

const mockAPIFamily: APIFamily = {
  id: "1-2-3-4-5",
  createdDate: "2025-04-05T02:47:33.375782",
  name: "Test Family",
  description: "",
  owner: mockUser,
  species: [],
};

const mockAPISpecies: APISpecies = {
  createdDate: "",
  updatedDate: "",
  name: null,
  description: null,
  familyId: mockAPIFamily.id!,
}

const mockAPIMechanism: APIMechanism = {
  familyId: "",
  name: "",
  description: "",
}

const mockAPIReaction: APIReaction = {
  name: "",
  description: null,
  createdBy: ""
}

describe.each([
  ["createFamily", createFamily, mockAPIFamily, "families"],
  ["createSpecies", createSpecies, mockAPISpecies, "species"],
  ["createReaction", createReaction, mockAPIReaction, "reactions"],
  ["createMechanism", createMechanism, mockAPIMechanism, "mechanisms"],
])("%s function", (_, createFunction: (object: any) => any, responseData: any, endpoint: string) => {
  function createMockResponse(): AxiosResponse {
    return {
      data: responseData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        headers: new AxiosHeaders({ "Content-Type": "application/json" }),
      },
    } as AxiosResponse;
  }

  it("Creates and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const result = await createFunction(responseData);

    expect(mockedCreate).toHaveBeenCalledWith(
      `${BASE_URL}/${endpoint}`,
      responseData,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      },
    );
    expect(result).toEqual(responseData);
  });

  it("Handles errors by throwing the error", async () => {
    const errorMessage = "Request failed with status code 404";
    (
      axios.post as typeof axios.post & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(createFunction(responseData)).rejects.toThrow(errorMessage);
  });
});