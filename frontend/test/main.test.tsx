import React from "react";
import { vi, describe, expect, it, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import App from "../src/pages/App";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

describe("Root Component Rendering", () => {
  it("renders the App component without crashing", () => {
    const { getByText } = render(
      <BrowserRouter>
          <React.StrictMode>
            <App />
          </React.StrictMode>
      </BrowserRouter>,
    );

    // Adjust according to what you expect to be rendered by App initially
    // Replace 'Home' with any text or element present on the initial render
    expect(getByText(/Chemistry Cafe/i)).toBeInTheDocument();
  });
});
