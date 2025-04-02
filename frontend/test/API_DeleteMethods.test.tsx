import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import axios, { AxiosResponse } from "axios";
import {
  deleteUser,
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

    (
      axios.delete as typeof axios.delete & { mockRejectedValueOnce: Function }
    ).mockRejectedValueOnce(new Error(errorMessage));
    // Assert the function throws the correct error
    await expect(deleteUser(id)).rejects.toThrow(
      "Failed to delete user. Please try again later.",
    );

    expect(axios.delete).toHaveBeenCalledWith(`${BASE_URL}/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

});
