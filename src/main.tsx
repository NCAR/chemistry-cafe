import React, { isValidElement } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { createRoot } from 'react-dom/client';
import DynamicScrollableList from './DynamicScrollableList';
import { Button } from 'react-bootstrap';
import ReactDOM from "react-dom";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// npm install react-router-dom
import Settings from './settingsPage';
import LandingPage from './landingPage.tsx';

interface ButtonInfo {
  id: number;
  name: string;
  color: string;
  category: string;
  isDel: boolean;
}

const buttons: ButtonInfo[] = [
  { id: 1, name: 'Change Username', color: 'red', category: 'MOZART', isDel: true},
  { id: 2, name: 'Change Password', color: 'blue', category: 'MOZART', isDel: false},
  { id: 3, name: 'Change Institution', color: 'green', category: 'MOZART', isDel: false},
  { id: 3, name: 'ORCHID', color: 'maroon', category: 'MOZART', isDel: false},
];

const renderButton = ({ id, name, color}: ButtonInfo) => (
    <Button key={id} style={{ backgroundColor: color, width: '100%' }}>
      {name}
    </Button>
);

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

root.render(
  <GoogleOAuthProvider clientId="534701394161-6gcjh4gd19u5p40gtagdl8i0bkg28rvg.apps.googleusercontent.com">
    <React.StrictMode>
      {/* <RouterProvider router={router} /> */}
      <App />
      <DynamicScrollableList buttonArray={buttons} renderButton={renderButton} size={'30%'} cols={1} />
    </React.StrictMode>
  </GoogleOAuthProvider>,
);
