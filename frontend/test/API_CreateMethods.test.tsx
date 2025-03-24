import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import {
  createFamily,
  createMechanism,
  createReaction,
  createSpecies,
  addSpeciesToReaction,
  addReactionToMechanism,
  addSpeciesToMechanism,
  createUser,
  createProperty,
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

  it("should create family and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const familyData = { id: "123", name: "Test Family" };
    const result = await createFamily(familyData);

    expect(mockedCreate).toHaveBeenCalledWith(
      "http://localhost:8080/api/families",
      familyData,
      { headers: { "Content-Type": "application/json" } },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should handle error correctly for createFamily", async () => {
    const familyData = { id: "123", name: "Test Family" };
    const errorMessage = "Request failed with status code 404";

    (
      axios.post as typeof axios.post & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(createFamily(familyData)).rejects.toThrow(
      "Failed to create family. Please try again later.",
    );
  });

  it("should create mechanism and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const mechanismData = { id: "123", name: "Test Mechanism" };
    const result = await createMechanism(mechanismData);

    expect(mockedCreate).toHaveBeenCalledWith(
      "http://localhost:8080/api/mechanism",
      mechanismData,
      { headers: { "Content-Type": "application/json" } },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should handle error when creating mechanism", async () => {
    const mechanismData = { id: "123", name: "Test Mechanism" };
    const errorMessage = "Request failed with status code 404";

    (
      axios.post as typeof axios.post & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(createMechanism(mechanismData)).rejects.toThrow(
      "Failed to create mechanism. Please try again later.",
    );
  });

  it("should create reaction and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const reactionData = { id: "123", type: "Test Reaction" };
    const result = await createReaction(reactionData);

    expect(mockedCreate).toHaveBeenCalledWith(
      "http://localhost:8080/api/reactions",
      reactionData,
      { headers: { "Content-Type": "application/json" } },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should handle error when creating reaction", async () => {
    const reactionData = { id: "123", type: "Test Reaction" };
    const errorMessage = "Request failed with status code 404";

    (
      axios.post as typeof axios.post & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(createReaction(reactionData)).rejects.toThrow(
      "Failed to create reaction. Please try again later.",
    );
  });

  it("should create species and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const speciesData = { id: "123", name: "Test Species" };
    const result = await createSpecies(speciesData);

    expect(mockedCreate).toHaveBeenCalledWith(
      "http://localhost:8080/api/species",
      speciesData,
      { headers: { "Content-Type": "application/json" } },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should handle error when creating species", async () => {
    const speciesData = { id: "123", name: "Test Species" };
    const errorMessage = "Request failed with status code 404";

    (
      axios.post as typeof axios.post & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(createSpecies(speciesData)).rejects.toThrow(
      "Failed to create species. Please try again later.",
    );
  });

  it("should add species to reaction and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const reactionSpeciesData = { reactionId: "123", speciesId: "456" };
    const result = await addSpeciesToReaction(reactionSpeciesData);

    expect(mockedCreate).toHaveBeenCalledWith(
      "http://localhost:8080/api/reactionspecies",
      reactionSpeciesData,
      { headers: { "Content-Type": "application/json" } },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should handle error when adding species to reaction", async () => {
    const reactionSpeciesData = { reactionId: "123", speciesId: "456" };
    const errorMessage = "Request failed with status code 404";

    (
      axios.post as typeof axios.post & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(addSpeciesToReaction(reactionSpeciesData)).rejects.toThrow(
      "Failed to add species to reaction. Please try again later.",
    );
  });

  it("should add reaction to mechanism and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const mechanismReactionData = { mechanismId: "123", reactionId: "456" };
    const result = await addReactionToMechanism(mechanismReactionData);

    expect(mockedCreate).toHaveBeenCalledWith(
      "http://localhost:8080/api/mechanismreactions",
      mechanismReactionData,
      { headers: { "Content-Type": "application/json" } },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should handle error when adding reaction to mechanism", async () => {
    const mechanismReactionData = { mechanismId: "123", reactionId: "456" };
    const errorMessage = "Request failed with status code 404";

    (
      axios.post as typeof axios.post & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(addReactionToMechanism(mechanismReactionData)).rejects.toThrow(
      "Failed to add reaction to mechanism. Please try again later.",
    );
  });

  it("should add species to mechanism and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const mechanismSpeciesData = { mechanismId: "123", speciesId: "456" };
    const result = await addSpeciesToMechanism(mechanismSpeciesData);

    expect(mockedCreate).toHaveBeenCalledWith(
      "http://localhost:8080/api/mechanismspecies",
      mechanismSpeciesData,
      { headers: { "Content-Type": "application/json" } },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should handle error when adding species to mechanism", async () => {
    const mechanismSpeciesData = { mechanismId: "123", speciesId: "456" };
    const errorMessage = "Request failed with status code 404";

    (
      axios.post as typeof axios.post & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(addSpeciesToMechanism(mechanismSpeciesData)).rejects.toThrow(
      "Failed to add species to mechanism. Please try again later.",
    );
  });

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

  it("should create property and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const propertyData = {
      id: "123",
      name: "Test Property",
      value: "Test Value",
    };

    const result = await createProperty(propertyData);

    expect(mockedCreate).toHaveBeenCalledWith(
      "http://localhost:8080/api/properties",
      propertyData,
      { headers: { "Content-Type": "application/json" } },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should handle error when creating property", async () => {
    const propertyData = {
      id: "123",
      name: "Test Property",
      value: "Test Value",
    };
    const errorMessage = "Request failed with status code 404";

    (
      axios.post as typeof axios.post & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(createProperty(propertyData)).rejects.toThrow(
      "Failed to create property. Please try again later.",
    );
  });
});
