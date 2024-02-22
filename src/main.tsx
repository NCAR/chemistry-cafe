import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { createRoot } from 'react-dom/client';
import DynamicScrollableList from './DynamicScrollableList';
import { Button } from 'react-bootstrap';

interface ButtonInfo {
  id: number;
  name: string;
  color: string;
}

const buttons: ButtonInfo[] = [
  { id: 1, name: 'Button 1', color: 'red' },
  { id: 2, name: 'Button 2', color: 'blue' },
  { id: 3, name: 'Button 3', color: 'green' },
];

const renderButton = ({ id, name, color }: ButtonInfo) => (
  <Button key={id} style={{ backgroundColor: color, width: '100%' }}>
    {name}
  </Button>
);

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

root.render(
  <GoogleOAuthProvider clientId="534701394161-6gcjh4gd19u5p40gtagdl8i0bkg28rvg.apps.googleusercontent.com">
    <React.StrictMode>
      <App />
      <DynamicScrollableList buttonArray={buttons} renderButton={renderButton} size={'30%'} cols={1} />
    </React.StrictMode>
  </GoogleOAuthProvider>,
);
