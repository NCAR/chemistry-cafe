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
  addUserToMechanism,
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

  it("should add user to mechanism and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const userMechanismData = { userId: "123", mechanismId: "456" };
    const result = await addUserToMechanism(userMechanismData);

    expect(mockedCreate).toHaveBeenCalledWith(
      "http://localhost:8080/api/usermechanism",
      userMechanismData,
      { headers: { "Content-Type": "application/json" } },
    );
    expect(result).toEqual(mockResponseData);
  });
});

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

  function createMockErrorResponse() {
    return {
      response: {
        status: 500,
        data: { error: "Internal Server Error" },
      },
    };
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

  it("should handle error when creating family", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockRejectedValue(createMockErrorResponse()) as Mock;
    const familyData = { id: "123", name: "Test Family" };

    try {
      await createFamily(familyData);
    } catch (error) {
      expect(error.response.status).toBe(500);
      expect(error.response.data.error).toBe("Internal Server Error");
    }
  });

  it("should handle error when creating mechanism", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockRejectedValue(createMockErrorResponse()) as Mock;
    const mechanismData = { id: "123", name: "Test Mechanism" };

    try {
      await createMechanism(mechanismData);
    } catch (error) {
      expect(error.response.status).toBe(500);
      expect(error.response.data.error).toBe("Internal Server Error");
    }
  });

  it("should handle non-200 status response when adding species to reaction", async () => {
    const mockedCreate = vi.spyOn(axios, "post").mockResolvedValueOnce({
      data: { error: "Bad Request" },
      status: 400,
    }) as Mock;

    const reactionSpeciesData = { reactionId: "123", speciesId: "456" };

    try {
      await addSpeciesToReaction(reactionSpeciesData);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toBe("Bad Request");
    }
  });

  it("should validate user data when creating user", async () => {
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

  it("should add user to mechanism and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const userMechanismData = { userId: "123", mechanismId: "456" };
    const result = await addUserToMechanism(userMechanismData);

    expect(mockedCreate).toHaveBeenCalledWith(
      "http://localhost:8080/api/usermechanism",
      userMechanismData,
      { headers: { "Content-Type": "application/json" } },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should create property and return data", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockResolvedValue(createMockResponse()) as Mock;
    const propertyData = {
      id: "123",
      name: "Test Property",
      value: "Test Value",
    }; // Adjust the property data as needed

    const result = await createProperty(propertyData);

    expect(mockedCreate).toHaveBeenCalledWith(
      "http://localhost:8080/api/properties",
      propertyData,
      { headers: { "Content-Type": "application/json" } },
    );
    expect(result).toEqual(mockResponseData);
  });

  it("should handle error when creating property", async () => {
    const mockedCreate = vi
      .spyOn(axios, "post")
      .mockRejectedValue(createMockErrorResponse()) as Mock;
    const propertyData = {
      id: "123",
      name: "Test Property",
      value: "Test Value",
    };

    try {
      await createProperty(propertyData);
    } catch (error) {
      expect(error.response.status).toBe(500);
      expect(error.response.data.error).toBe("Internal Server Error");
    }
  });
});
