import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/webPages/RoutingRenders/App';
import { GoogleOAuthProvider } from '@react-oauth/google';

describe('App Component Test', () => {
    it('should render the correct components based on the routes', () => {
        // Define the routes and expected texts
        const routes = [
            { path: '/', expectedText: 'Chemistry Cafe' },
            { path: '/LoggedIn', expectedText: 'Families' },
            { path: '/FamilyPage', expectedText: 'Families' },
            { path: '/Settings', expectedText: 'Back' },
        ];

        // Iterate through each route and test rendering the App component
        routes.forEach(({ path, expectedText }) => {
            // Render the App component within a MemoryRouter with the current route
            const { getByText } = render(
                <MemoryRouter initialEntries={[path]}>
                    <GoogleOAuthProvider clientId="534701394161-6gcjh4gd19u5p40gtagdl8i0bkg28rvg.apps.googleusercontent.com">
                        <App />
                    </GoogleOAuthProvider>
                </MemoryRouter>
            );

            // Assert that the expected text is present in the App component
            const element = getByText(expectedText);
            expect(element).toBeTruthy();
        });
    });
});
