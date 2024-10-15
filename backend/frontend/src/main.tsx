import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './webPages/RoutingRenders/App';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css'

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);
//"534701394161-6gcjh4gd19u5p40gtagdl8i0bkg28rvg.apps.googleusercontent.com"  preexisting
//"505816606185-4lkg5cmmod039i5kclktij01ct5in2ug.apps.googleusercontent.com" jmhh
//"257697450661-a69l9bv939uuso551n6pcf1gngpv9ql0.apps.googleusercontent.com"> chemcafe
root.render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId="505816606185-4lkg5cmmod039i5kclktij01ct5in2ug.apps.googleusercontent.com">
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
