import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import {
  updateUser,
} from "../src/API/API_UpdateMethods";
import {
  APIUser
} from "../src/API/API_Interfaces";

// Mock axios using vitest's built-in mock function
vi.mock("axios");

describe("API update functions tests", () => {
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

  it("should update user and return data", async () => {
    const mockedPut = vi
      .spyOn(axios, "put")
      .mockResolvedValue(createMockResponse()) as Mock;

    const user: APIUser = {
      id: "123-123-123-123-123",
      username: "Test User",
      email: "testuser@example.com",
      role: "admin",
    };
    const result = await updateUser(user.id!, user);

    expect(mockedPut).toHaveBeenCalledWith(
      `http://localhost:8080/api/users/${user.id}`,
      user,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    expect(result).toEqual(mockResponseData);
  });

  it("should handle error correctly for updateUser", async () => {
    const user: APIUser = {
      id: "123-123-123-123-123",
      username: "Test User",
      email: "testuser@example.com",
      role: "admin",
    };
    const errorMessage = "Request failed with status code 404";

    (
      axios.put as typeof axios.put & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(updateUser(user.id!, user)).rejects.toThrow(
      "Failed to update user. Please try again later.",
    );
  });

});
