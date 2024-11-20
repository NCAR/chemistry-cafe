import React from "react";
import { vi, describe, expect, it, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "../src/pages/App";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Mock environment variable for OAuth Client ID
const mockClientId = "dummy-client-id";
vi.mock("vite", () => ({
  import: {
    meta: {
      env: {
        VITE_REACT_APP_OAUTH_CLIENT_ID: mockClientId,
      },
    },
  },
}));

describe("Root Component Rendering", () => {
  it("renders the App component without crashing", () => {
    const { getByText } = render(
      <BrowserRouter>
        <GoogleOAuthProvider clientId={mockClientId}>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </GoogleOAuthProvider>
      </BrowserRouter>,
    );

    // Adjust according to what you expect to be rendered by App initially
    // Replace 'Home' with any text or element present on the initial render
    expect(getByText(/Chemistry Cafe/i)).toBeInTheDocument();
  });
});
