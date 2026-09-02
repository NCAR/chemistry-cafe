import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { createFamily } from "../src/API/API_CreateMethods";
import { APIFamily, APIUser } from "../src/API/API_Interfaces";

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
  reactions: [],
  phases: [],
  mechanisms: [],
};

describe.each([["createFamily", createFamily, mockAPIFamily, "families"]])(
  "%s function",
  (_, createFunction: (object: any) => any, responseData: any) => {
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

      expect(mockedCreate).toHaveBeenCalled();
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
  },
);
