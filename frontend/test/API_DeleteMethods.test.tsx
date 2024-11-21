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
  const BASE_URL = "http://localhost:8080/api";
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

  it("should handle error correctly for deleteFamily", async () => {
    const id = "12345";
    const errorMessage = "Request failed with status code 404";

    (axios.delete as typeof axios.delete & { mockRejectedValueOnce: Function }).mockRejectedValueOnce(
      new Error(errorMessage)
    );
    // Assert the function throws the correct error
    await expect(deleteFamily(id)).rejects.toThrow(
      "Failed to delete family. Please try again later."
    );

    expect(axios.delete).toHaveBeenCalledWith(`${BASE_URL}/families/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
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

  it("should handle error correctly for deleteMechanism", async () => {
    const id = "12345";
    const errorMessage = "Request failed with status code 404";

    (axios.delete as typeof axios.delete & { mockRejectedValueOnce: Function }).mockRejectedValueOnce(
      new Error(errorMessage)
    );
    // Assert the function throws the correct error
    await expect(deleteMechanism(id)).rejects.toThrow(
      "Failed to delete mechanism. Please try again later."
    );

    // expect(axios.delete).toHaveBeenCalledWith(`${BASE_URL}/mechanism/${id}`, {
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });
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

  it("should handle error correctly for deleteSpecies", async () => {
    const id = "12345";
    const errorMessage = "Request failed with status code 404";

    (axios.delete as typeof axios.delete & { mockRejectedValueOnce: Function }).mockRejectedValueOnce(
      new Error(errorMessage)
    );
    // Assert the function throws the correct error
    await expect(deleteSpecies(id)).rejects.toThrow(
      "Failed to delete species. Please try again later."
    );

    expect(axios.delete).toHaveBeenCalledWith(`${BASE_URL}/species/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
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

  it("should handle error correctly for deleteReaction", async () => {
    const id = "12345";
    const errorMessage = "Request failed with status code 404";

    (axios.delete as typeof axios.delete & { mockRejectedValueOnce: Function }).mockRejectedValueOnce(
      new Error(errorMessage)
    );
    // Assert the function throws the correct error
    await expect(deleteReaction(id)).rejects.toThrow(
      "Failed to delete reaction. Please try again later."
    );

    expect(axios.delete).toHaveBeenCalledWith(`${BASE_URL}/reactions/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
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

  it("should handle error correctly for deleteUser", async () => {
    const id = "12345";
    const errorMessage = "Request failed with status code 404";

    (axios.delete as typeof axios.delete & { mockRejectedValueOnce: Function }).mockRejectedValueOnce(
      new Error(errorMessage)
    );
    // Assert the function throws the correct error
    await expect(deleteUser(id)).rejects.toThrow(
      "Failed to delete user. Please try again later."
    );

    expect(axios.delete).toHaveBeenCalledWith(`${BASE_URL}/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
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

  it("should handle error correctly for deleteProperty", async () => {
    const id = "12345";
    const errorMessage = "Request failed with status code 404";

    (axios.delete as typeof axios.delete & { mockRejectedValueOnce: Function }).mockRejectedValueOnce(
      new Error(errorMessage)
    );
    // Assert the function throws the correct error
    await expect(deleteProperty(id)).rejects.toThrow(
      "Failed to delete property. Please try again later."
    );

    expect(axios.delete).toHaveBeenCalledWith(`${BASE_URL}/properties/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  });
});
