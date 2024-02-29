import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { createRoot } from 'react-dom/client';
import ButtonSystemGrid from './buttonSystem/ButtonSystemGrid';
import {familyButton} from './buttonSystem/RenderButtons';
import { FamilyButtons } from './buttonSystem/ButtonArrays';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

root.render(
  <GoogleOAuthProvider clientId="534701394161-6gcjh4gd19u5p40gtagdl8i0bkg28rvg.apps.googleusercontent.com">
    <React.StrictMode>
      <App />
      <ButtonSystemGrid buttonArray={FamilyButtons} renderButton={familyButton} size={'30%'} cols={1} />
    </React.StrictMode>
  </GoogleOAuthProvider>,
);
