import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/pages/App";

// Define the routes and expected texts
describe("App Component", () => {
  const routes = [
    ["/", "Chemistry Cafe"],
    ["/dashboard", "Settings"],
    ["/familypage", "Families"],
    ["/settings", "Appearance"],
  ];
  it.each(routes)(
    "should render the correct component for the page on %s",
    (path, expectedText) => {
      // Render the App component within a MemoryRouter with the current route
      const { getByText } = render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      );

      // Assert that the expected text is present in the App component
      const element = getByText(expectedText);
      expect(element).toBeTruthy();
      cleanup();
    },
  );
});
