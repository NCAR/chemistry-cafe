import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import {
  updateFamily,
  updateMechanism,
  updateSpecies,
  updateReaction,
  updateUser,
  updateProperty,
} from "../src/API/API_UpdateMethods";
import {
  Family,
  Mechanism,
  Species,
  Reaction,
  User,
  Property,
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

  it("should update family and return data", async () => {
    const mockedPut = vi
      .spyOn(axios, "put")
      .mockResolvedValue(createMockResponse()) as Mock;

    const family: Family = { id: "1", name: "Test Family" };
    const result = await updateFamily(family);

    expect(mockedPut).toHaveBeenCalledWith(
      `http://localhost:8080/api/families/${family.id}`,
      family,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    expect(result).toEqual(mockResponseData);
  });

  it("should handle error correctly for updateFamily", async () => {
    const family = {
      id: "1",
      name: "Test Family",
      description: "Test description",
    };
    const errorMessage = "Request failed with status code 404";

    (
      axios.put as typeof axios.put & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(updateFamily(family)).rejects.toThrow(
      "Failed to update family. Please try again later.",
    );
  });

  it("should update mechanism and return data", async () => {
    const mockedPut = vi
      .spyOn(axios, "put")
      .mockResolvedValue(createMockResponse()) as Mock;

    const mechanism: Mechanism = { id: "2", name: "Test Mechanism" };
    const result = await updateMechanism(mechanism);

    expect(mockedPut).toHaveBeenCalledWith(
      `http://localhost:8080/api/mechanism/${mechanism.id}`,
      mechanism,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    expect(result).toEqual(mockResponseData);
  });

  it("should handle error correctly for updateMechanism", async () => {
    const mechanism: Mechanism = { id: "2", name: "Test Mechanism" };
    const errorMessage = "Request failed with status code 404";

    (
      axios.put as typeof axios.put & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(updateMechanism(mechanism)).rejects.toThrow(
      "Failed to update mechanism. Please try again later.",
    );
  });

  it("should update species and return data", async () => {
    const mockedPut = vi
      .spyOn(axios, "put")
      .mockResolvedValue(createMockResponse()) as Mock;

    const species: Species = { id: "3", name: "Test Species" };
    const result = await updateSpecies(species);

    expect(mockedPut).toHaveBeenCalledWith(
      `http://localhost:8080/api/species/${species.id}`,
      species,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    expect(result).toEqual(mockResponseData);
  });

  it("should handle error correctly for updateSpecies", async () => {
    const species: Species = { id: "3", name: "Test Species" };
    const errorMessage = "Request failed with status code 404";

    (
      axios.put as typeof axios.put & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(updateSpecies(species)).rejects.toThrow(
      "Failed to update species. Please try again later.",
    );
  });

  it("should update reaction and return data", async () => {
    const mockedPut = vi
      .spyOn(axios, "put")
      .mockResolvedValue(createMockResponse()) as Mock;

    const reaction: Reaction = { id: "4", name: "Test Reaction" };
    const result = await updateReaction(reaction);

    expect(mockedPut).toHaveBeenCalledWith(
      `http://localhost:8080/api/reactions/${reaction.id}`,
      reaction,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    expect(result).toEqual(mockResponseData);
  });

  it("should handle error correctly for updateReaction", async () => {
    const reaction: Reaction = { id: "4", name: "Test Reaction" };
    const errorMessage = "Request failed with status code 404";

    (
      axios.put as typeof axios.put & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(updateReaction(reaction)).rejects.toThrow(
      "Failed to update reaction. Please try again later.",
    );
  });

  it("should update user and return data", async () => {
    const mockedPut = vi
      .spyOn(axios, "put")
      .mockResolvedValue(createMockResponse()) as Mock;

    const user: User = {
      id: "5",
      username: "testuser",
      email: "test@example.com",
    };
    const result = await updateUser(user.id, user);

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
    const user: User = {
      id: "5",
      username: "testuser",
      email: "test@example.com",
    };
    const errorMessage = "Request failed with status code 404";

    (
      axios.put as typeof axios.put & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(updateUser(user.id, user)).rejects.toThrow(
      "Failed to update user. Please try again later.",
    );
  });

  it("should update property and return data", async () => {
    const mockedPut = vi
      .spyOn(axios, "put")
      .mockResolvedValue(createMockResponse()) as Mock;

    const property: Property = {
      id: "6",
      speciesId: "3",
      tolerance: 0.5,
      weight: 1.2,
      concentration: 0.7,
      diffusion: 0.3,
    };
    const result = await updateProperty(property);

    expect(mockedPut).toHaveBeenCalledWith(
      `http://localhost:8080/api/properties/${property.id}`,
      property,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    expect(result).toEqual(mockResponseData);
  });

  it("should handle error correctly for updateProperty", async () => {
    const property: Property = {
      id: "6",
      speciesId: "3",
      tolerance: 0.5,
      weight: 1.2,
      concentration: 0.7,
      diffusion: 0.3,
    };
    const errorMessage = "Request failed with status code 404";

    (
      axios.put as typeof axios.put & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(updateProperty(property)).rejects.toThrow(
      "Failed to update property. Please try again later.",
    );
  });
});
