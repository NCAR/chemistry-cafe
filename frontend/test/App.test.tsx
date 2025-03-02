import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/pages/App";

describe("App Component Test", () => {
  it("should render the correct components based on the routes", () => {
    // Define the routes and expected texts
    const routes = [
      { path: "/", expectedText: "Chemistry Cafe" },
      { path: "/dashboard", expectedText: "Families" },
      { path: "/familypage", expectedText: "Families" },
      { path: "/settings", expectedText: "Back" },
    ];

    // Iterate through each route and test rendering the App component
    routes.forEach(({ path, expectedText }) => {
      // Render the App component within a MemoryRouter with the current route
      const { getByText } = render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      );

      // Assert that the expected text is present in the App component
      const element = getByText(expectedText);
      expect(element).toBeTruthy();
    });
  });
});
