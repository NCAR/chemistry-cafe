import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import axios, { AxiosResponse } from "axios";
import { deleteFamily, deleteUser } from "../src/API/API_DeleteMethods";

// Mock axios using vitest's built-in mock function
vi.mock("axios");

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

describe.each([
  ["deleteUser", deleteUser, `1-1-1-1-1`, "users"],
  ["deleteFamily", deleteFamily, `1-1-1-1-1`, "families"],
])(
  "%s function",
  (_, deleteFunction: (object: any) => any, id: string, endpoint: string) => {
    it("Successfully calls the delete endpoint", async () => {
      const mockedDelete = vi
        .spyOn(axios, "delete")
        .mockResolvedValue(createMockResponse()) as Mock;

      await deleteFunction(id);

      expect(mockedDelete).toHaveBeenCalledWith(
        `${BASE_URL}/${endpoint}/${id}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );
    });

    it("Handles errors by throwing the error", async () => {
      const errorMessage = "Request failed with status code 404";

      (
        axios.delete as typeof axios.delete & {
          mockRejectedValueOnce: Function;
        }
      ).mockRejectedValueOnce(new Error(errorMessage));
      await expect(deleteFunction(id)).rejects.toThrow(errorMessage);
    });
  },
);
