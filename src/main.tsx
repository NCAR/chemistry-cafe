import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

root.render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId="534701394161-6gcjh4gd19u5p40gtagdl8i0bkg28rvg.apps.googleusercontent.com">
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </GoogleOAuthProvider>,
  </BrowserRouter>
);
