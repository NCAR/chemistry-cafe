import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import {
  getAllUsers,
  getCurrentUser,
  getUserByEmail,
  getUserById,
} from "../src/API/API_GetMethods";
import { APIMechanism, APIUser } from "../src/API/API_Interfaces";
import { AUTH_URL, BASE_URL } from "../src/API/API_config";

// Mock axios using vitest's built-in mock function
vi.mock("axios");

const allUsers: Array<APIUser> = [
  {
    id: "1-1-1-1-1",
    email: "test1@email.com",
    username: "Test Admin",
    role: "admin",
  },
  {
    id: "2-2-2-2-2",
    email: "test2@example.com",
    username: "Test User",
    role: "unverified",
  },
  {
    id: "3-3-3-3-3",
    email: "test3@test.edu",
    username: "verified test user",
    role: "verified",
  },
];

describe("User get functions", () => {
  function createSuccessMockResponse(data: any): AxiosResponse {
    return {
      data: data,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        headers: new AxiosHeaders({ "Content-Type": "application/json" }),
      },
    } as AxiosResponse;
  }
  describe("getAllUsers", () => {
    it("Gets all users when called", async () => {
      const mockedGet = vi
        .spyOn(axios, "get")
        .mockResolvedValue(createSuccessMockResponse(allUsers)) as Mock;
      const result = await getAllUsers();

      expect(mockedGet).toHaveBeenCalledWith(`${BASE_URL}/users`);
      expect(result).toEqual(allUsers);
    });

    it("Handles errors by throwing returning empty list", async () => {
      const errorMessage = "Request failed with status code 404";
      (
        axios.get as typeof axios.get & { mockRejectedValueOnce: Function }
      ).mockRejectedValueOnce(new Error(errorMessage));
      expect(await getAllUsers()).toEqual([]);
    });
  });

  describe("getUserByEmail", () => {
    it("Gets a user by email", async () => {
      for (const user of allUsers) {
        if (!user.email) {
          continue;
        }

        const mockedGet = vi
          .spyOn(axios, "get")
          .mockResolvedValue(createSuccessMockResponse(user)) as Mock;
        const result = await getUserByEmail(user.email);

        expect(mockedGet).toHaveBeenCalledWith(
          `${BASE_URL}/users/email/${user.email}`,
        );
        expect(result).toEqual(user);
      }
    });

    it("Handles errors by returning null", async () => {
      for (const user of allUsers) {
        if (!user.email) {
          continue;
        }

        const errorMessage = "Request failed with status code 404";
        (
          axios.get as typeof axios.get & { mockRejectedValueOnce: Function }
        ).mockRejectedValueOnce(new Error(errorMessage));
        expect(await getUserByEmail(user.email)).toEqual(null);
      }
    });
  });

  describe("getUserById", () => {
    it("Gets a user by id", async () => {
      for (const user of allUsers) {
        if (!user.id) {
          continue;
        }

        const mockedGet = vi
          .spyOn(axios, "get")
          .mockResolvedValue(createSuccessMockResponse(user)) as Mock;
        const result = await getUserById(user.id);

        expect(mockedGet).toHaveBeenCalledWith(
          `${BASE_URL}/users/id/${user.id}`,
        );
        expect(result).toEqual(user);
      }
    });

    it("Handles errors by returning null", async () => {
      for (const user of allUsers) {
        if (!user.id) {
          continue;
        }

        const errorMessage = "Request failed with status code 404";
        (
          axios.get as typeof axios.get & { mockRejectedValueOnce: Function }
        ).mockRejectedValueOnce(new Error(errorMessage));
        expect(await getUserById(user.id)).toEqual(null);
      }
    });
  });

  describe("getCurrentUser", () => {
    it("Gets the current user", async () => {
      for (const user of allUsers) {
        const mockedGet = vi
          .spyOn(axios, "get")
          .mockResolvedValue(createSuccessMockResponse(user)) as Mock;
        const result = await getCurrentUser();

        expect(mockedGet).toHaveBeenCalledWith(`${AUTH_URL}/google/whoami`, {
          withCredentials: true,
        });
        expect(result).toEqual(user);
      }
    });

    it("Handles errors by returning null", async () => {
      for (const _ of allUsers) {
        const errorMessage = "Request failed with status code 404";
        (
          axios.get as typeof axios.get & { mockRejectedValueOnce: Function }
        ).mockRejectedValueOnce(new Error(errorMessage));
        expect(await getCurrentUser()).toEqual(null);
      }
    });
  });
});
