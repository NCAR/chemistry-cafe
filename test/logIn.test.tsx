import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup  } from '@testing-library/react';
import React from 'react';
import LogIn from '../src/webPages/LogIn/logIn';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MemoryRouter } from 'react-router-dom';

describe('LogIn Component Test', () => {
    beforeEach(() => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <GoogleOAuthProvider clientId="534701394161-6gcjh4gd19u5p40gtagdl8i0bkg28rvg.apps.googleusercontent.com">
                    <LogIn/>
                </GoogleOAuthProvider>
            </MemoryRouter>
        );
    });

    afterEach(() => {
        cleanup();
    });
    
    it('should render the login button and the guest button', () => {
        expect(screen.getByText('Sign in')).toBeTruthy();  // Check presence of the login button
        expect(screen.getByText('Continue as Guest')).toBeTruthy();  // Check presence of the guest button
    });

    it('should open and close the About modal', async () => {
        const aboutButton = screen.getAllByRole('button', { name: 'About' })[0];
        fireEvent.click(aboutButton);

        // Assert that modal is open
        expect(screen.getByText('Credits')).toBeTruthy();

        // Simulate a click outside the modal to close it
        fireEvent.click(document.body);

        // Wait for the modal to be closed
        await waitFor(() => {
            expect(screen.queryByText('Kyle Shores')).toBeFalsy();
        });
    });
});
