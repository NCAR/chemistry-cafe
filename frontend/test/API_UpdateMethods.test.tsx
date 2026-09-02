import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import axios, { AxiosResponse } from "axios";
import { updateUser, updateFamily } from "../src/API/API_UpdateMethods";
import { APIFamily, APIUser } from "../src/API/API_Interfaces";

// Mock axios using vitest's built-in mock function
vi.mock("axios");

const mockResponseData = { success: true };

function createMockResponse() {
  return {
    data: mockResponseData,
    status: 200,
    statusText: "OK",
    headers: {},
  } as AxiosResponse;
}

describe("updateUser function", () => {
  it("updates user and returns nothing", async () => {
    const mockedPut = vi
      .spyOn(axios, "put")
      .mockResolvedValue(createMockResponse()) as Mock;

    const user: APIUser = {
      id: "123-123-123-123-123",
      username: "Test User",
      email: "testuser@example.com",
      role: "admin",
    };
    const result = await updateUser(user);
    expect(result).toEqual(undefined);

    expect(mockedPut).toHaveBeenCalledWith(
      `http://localhost:8080/api/users/${user.id}`,
      user,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      },
    );
  });

  it("Handles errors by throwing the error", async () => {
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
    await expect(updateUser(user)).rejects.toThrow(errorMessage);
  });
});

describe("updateFamily function", () => {
  it("updates family and returns nothing", async () => {
    const mockedPatch = vi
      .spyOn(axios, "patch")
      .mockResolvedValue(createMockResponse()) as Mock;

    const family: APIFamily = {
      id: "123-123-123-123-123",
      name: "Test Family",
      description: "This is really a test for family",
      owner: {
        username: "Test User",
        role: "unverified",
        id: "1-1-1-1-1",
      },
      species: [],
      reactions: [],
      phases: [],
      mechanisms: [],
    };

    const result = await updateFamily(family);
    expect(result).toEqual(undefined);

    expect(mockedPatch).toHaveBeenCalledWith(
      `http://localhost:8080/api/families/${family.id}`,
      family,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      },
    );
  });
});
