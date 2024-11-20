import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./pages/App";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);
const url = import.meta.env.VITE_REACT_APP_OAUTH_CLIENT_ID;

root.render(
  <BrowserRouter>
    <GoogleOAuthProvider
      clientId={url}
      nonce={"F04DAE83-E065-4AB5-904F-C2E5E3B3390C"}
    >
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </GoogleOAuthProvider>
  </BrowserRouter>,
);
