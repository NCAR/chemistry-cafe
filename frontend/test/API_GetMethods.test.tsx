import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import {
  downloadOAJSON,
  downloadOAYAML,
  downloadOAMusicbox,
  getUsers,
  getUserByEmail,
  getUserById,
} from "../src/API/API_GetMethods";
import { APIMechanism } from "../src/API/API_Interfaces";

// Mock axios using vitest's built-in mock function
vi.mock("axios");

describe("API get functions tests", () => {
  const mockResponseData = { success: true };

  function createMockResponse() {
    return {
      data: mockResponseData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        headers: new AxiosHeaders({ "Content-Type": "text/plain" }),
      },
    } as AxiosResponse;
  }

  // Tests for downloadOAJSON
  it("should successfully get OAJSON with valid tag_mechanism_uuid", async () => {
    const mockedGet = vi
      .spyOn(axios, "get")
      .mockResolvedValueOnce(createMockResponse()) as Mock;

    const tag_mechanism_uuid = "valid-uuid";
    const result = await downloadOAJSON(tag_mechanism_uuid);

    expect(mockedGet).toHaveBeenCalledWith(
      `http://localhost:8080/api/openatmos/mechanism/${tag_mechanism_uuid}/json`,
      {
        headers: { "Content-Type": "text/plain" },
        responseType: "text",
      },
    );

    expect(result).toBe(mockResponseData);
  });

  it("should return an empty string when tag_mechanism_uuid is not provided", async () => {
    const mockedGet = vi.spyOn(axios, "get");

    const result = await downloadOAJSON();

    expect(result).toBe("");
    expect(mockedGet).not.toHaveBeenCalled();

    mockedGet.mockRestore();
  });

  it("should handle error correctly for downloadOAJSON", async () => {
    const mockError = new Error("Network error");
    vi.spyOn(axios, "get").mockRejectedValueOnce(mockError);

    const tag_mechanism_uuid = "invalid-uuid";
    await expect(downloadOAJSON(tag_mechanism_uuid)).rejects.toThrow(
      "Network error",
    );

    expect(axios.get).toHaveBeenCalledWith(
      `http://localhost:8080/api/openatmos/mechanism/${tag_mechanism_uuid}/json`,
      {
        headers: { "Content-Type": "text/plain" },
        responseType: "text",
      },
    );
  });

  // Tests for downloadOAYAML
  it("should successfully get OAYAML with valid tag_mechanism_uuid", async () => {
    const mockedGet = vi
      .spyOn(axios, "get")
      .mockResolvedValueOnce(createMockResponse()) as Mock;

    const tag_mechanism_uuid = "valid-uuid";
    const result = await downloadOAYAML(tag_mechanism_uuid);

    expect(mockedGet).toHaveBeenCalledWith(
      `http://localhost:8080/api/openatmos/mechanism/${tag_mechanism_uuid}/yaml`,
      {
        headers: { "Content-Type": "text/plain" },
        responseType: "text",
      },
    );

    expect(result).toBe(mockResponseData);
  });

  it("should return an empty string when tag_mechanism_uuid is not provided for OAYAML", async () => {
    const mockedGet = vi.spyOn(axios, "get");

    const result = await downloadOAYAML();

    expect(result).toBe("");
    expect(mockedGet).not.toHaveBeenCalled();

    mockedGet.mockRestore();
  });

  it("should handle error correctly for downloadOAYAML", async () => {
    const mockError = new Error("Network error");
    vi.spyOn(axios, "get").mockRejectedValueOnce(mockError);

    const tag_mechanism_uuid = "invalid-uuid";
    await expect(downloadOAYAML(tag_mechanism_uuid)).rejects.toThrow(
      "Network error",
    );

    expect(axios.get).toHaveBeenCalledWith(
      `http://localhost:8080/api/openatmos/mechanism/${tag_mechanism_uuid}/yaml`,
      {
        headers: { "Content-Type": "text/plain" },
        responseType: "text",
      },
    );
  });

  // Tests for downloadOAMusicbox
  it("should successfully get OAMusicbox with valid tag_mechanism_uuid", async () => {
    const mockedGet = vi
      .spyOn(axios, "get")
      .mockResolvedValueOnce(createMockResponse()) as Mock;

    const tag_mechanism_uuid = "valid-uuid";
    const result = await downloadOAMusicbox(tag_mechanism_uuid);

    expect(mockedGet).toHaveBeenCalledWith(
      `http://localhost:8080/api/openatmos/mechanism/${tag_mechanism_uuid}/musicbox`,
      {
        responseType: "arraybuffer",
        headers: { Accept: "application/zip" },
      },
    );

    expect(result).toBe(mockResponseData);
  });

  it("should return an empty string when tag_mechanism_uuid is not provided for OAMusicbox", async () => {
    const mockedGet = vi.spyOn(axios, "get");

    const result = await downloadOAMusicbox();

    expect(result).toBe("");
    expect(mockedGet).not.toHaveBeenCalled();

    mockedGet.mockRestore();
  });

  it("should handle error correctly for downloadOAMusicbox", async () => {
    const mockError = new Error("Network error");
    vi.spyOn(axios, "get").mockRejectedValueOnce(mockError);

    const tag_mechanism_uuid = "invalid-uuid";
    await expect(downloadOAMusicbox(tag_mechanism_uuid)).rejects.toThrow(
      "Network error",
    );

    expect(axios.get).toHaveBeenCalledWith(
      `http://localhost:8080/api/openatmos/mechanism/${tag_mechanism_uuid}/musicbox`,
      {
        responseType: "arraybuffer",
        headers: { Accept: "application/zip" },
      },
    );
  });
});
