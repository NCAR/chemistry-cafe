import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import axios, { AxiosResponse } from "axios";
import {
  deleteFamily,
  deleteMechanism,
  deleteSpecies,
  deleteReaction,
  deleteUser,
  deleteProperty,
} from "../src/API/API_DeleteMethods";

// Mock axios using vitest's built-in mock function
vi.mock("axios");

describe("API delete functions tests", () => {
  const mockResponseData = { success: true };

  function createMockResponse() {
    return {
      data: mockResponseData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    } as AxiosResponse;
  }

  it("should successfully delete a family", async () => {
    const mockedDelete = vi
      .spyOn(axios, "delete")
      .mockResolvedValue(createMockResponse()) as Mock;

    const id = "12345";
    const result = await deleteFamily(id);

    expect(mockedDelete).toHaveBeenCalledWith(
      `http://localhost:8080/api/families/${id}`,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should successfully delete a mechanism", async () => {
    const mockedDelete = vi
      .spyOn(axios, "delete")
      .mockResolvedValue(createMockResponse()) as Mock;

    const id = "12345";
    const result = await deleteMechanism(id);

    expect(mockedDelete).toHaveBeenCalledWith(
      `http://localhost:8080/api/mechanism/${id}`,
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should successfully delete a species", async () => {
    const mockedDelete = vi
      .spyOn(axios, "delete")
      .mockResolvedValue(createMockResponse()) as Mock;

    const id = "12345";
    const result = await deleteSpecies(id);

    expect(mockedDelete).toHaveBeenCalledWith(
      `http://localhost:8080/api/species/${id}`,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should successfully delete a reaction", async () => {
    const mockedDelete = vi
      .spyOn(axios, "delete")
      .mockResolvedValue(createMockResponse()) as Mock;

    const id = "12345";
    const result = await deleteReaction(id);

    expect(mockedDelete).toHaveBeenCalledWith(
      `http://localhost:8080/api/reactions/${id}`,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should successfully delete a user", async () => {
    const mockedDelete = vi
      .spyOn(axios, "delete")
      .mockResolvedValue(createMockResponse()) as Mock;

    const id = "12345";
    const result = await deleteUser(id);

    expect(mockedDelete).toHaveBeenCalledWith(
      `http://localhost:8080/api/users/${id}`,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should successfully delete a property", async () => {
    const mockedDelete = vi
      .spyOn(axios, "delete")
      .mockResolvedValue(createMockResponse()) as Mock;

    const id = "12345"; // Test property ID
    const result = await deleteProperty(id);

    expect(mockedDelete).toHaveBeenCalledWith(
      `http://localhost:8080/api/properties/${id}`, // URL based on the deleteProperty function
      {
        headers: { "Content-Type": "application/json" }, // Request headers
      },
    );
    expect(result).toEqual(mockResponseData); // Ensure the result matches the expected response
  });
});
