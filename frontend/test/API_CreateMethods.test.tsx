import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import {
  createUser,
} from "../src/API/API_CreateMethods";

// Mock axios using vitest's built-in mock function
vi.mock("axios");

describe("API create functions tests", () => {
  const mockResponseData = { success: true };

  function createMockResponse() {
    return {
      data: mockResponseData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        headers: new AxiosHeaders({ "Content-Type": "application/json" }),
      },
    } as AxiosResponse;
  }

  it("should create user and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const userData = { id: "123", name: "Test User" };
    const result = await createUser(userData);

    expect(mockedCreate).toHaveBeenCalledWith(
      "http://localhost:8080/api/users",
      userData,
      { headers: { "Content-Type": "application/json" } },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should handle error when creating user", async () => {
    const userData = { id: "123", name: "Test User" };
    const errorMessage = "Request failed with status code 404";

    (
      axios.post as typeof axios.post & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(createUser(userData)).rejects.toThrow(
      "Failed to create user. Please try again later.",
    );
  });
});
