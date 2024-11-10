// import { describe, expect, it } from 'vitest';
// import { render } from '@testing-library/react';
// import React from 'react';
// import { GoogleOAuthProvider } from '@react-oauth/google';
// import App from '../src/webPages/RoutingRenders/App';
// import { BrowserRouter } from 'react-router-dom';

// describe('Main Component Test', () => {
//     it('should render the App component within the BrowserRouter and GoogleOAuthProvider context', () => {
//         // Render the main application setup
//         const { getByText } = render(
//             <BrowserRouter>
//                 <GoogleOAuthProvider clientId="534701394161-6gcjh4gd19u5p40gtagdl8i0bkg28rvg.apps.googleusercontent.com">
//                     <React.StrictMode>
//                         <App />
//                     </React.StrictMode>
//                 </GoogleOAuthProvider>
//             </BrowserRouter>
//         );

//         const appText = getByText('Chemistry Cafe');

//         // Assert that the text is present in the App component
//         expect(appText).toBeTruthy();
//     });
// });
