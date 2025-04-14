import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../src/components/AuthContext";
import Unauthorized from "../src/pages/Unauthorized";
import ProtectedRoute from "../src/components/ProtectedRoute";
import { MemoryRouter } from "react-router-dom";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach } from "node:test";
import { APIUser } from "../src/API/API_Interfaces";

const userData: APIUser = {
  username: "",
  role: "verified",
};

vi.mock("../src/components/AuthContext", () => {
  return {
    useAuth: () => {
      return {
        user: userData,
      };
    },
  };
});

describe("Unauthorized Page", () => {
  it("Renders", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Unauthorized />
      </MemoryRouter>,
    );

    cleanup();
  });
});

describe("ProtectedRoute", () => {
  afterEach(() => {
    cleanup();
  });

  it("Does not go to page if required role isn't met", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ProtectedRoute requiredRole="admin">
          <p>Test Page</p>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.queryAllByText("Test Page").length).toBe(0);

    cleanup();
  });

  it("Goes to the page if the user is authorized", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ProtectedRoute requiredRole="verified">
          <p>Test Page</p>
        </ProtectedRoute>
      </MemoryRouter>,
    );
  });
});
