import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import Settings from '../src/webPages/Settings/settings';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// Partially mock react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
    // Import the original module
    const actual = await importOriginal();

    // Use type assertion to treat `actual` as an object
    const actualAsObject = actual as Record<string, any>;

    // Define the mocked navigate function
    const navigateMock = vi.fn();

    // Return an object containing the original exports and mocked functions
    return {
        ...actualAsObject, // Spread the original exports
        useNavigate: () => navigateMock, // Mock the useNavigate function
    };
});

describe('Settings Component Test', () => {
    let navigateMock;

    beforeEach(() => {
        navigateMock = useNavigate();
        render(
            <MemoryRouter initialEntries={['/Settings']}>
                <Settings />
            </MemoryRouter>
        );
    });

    afterEach(() => {
        cleanup();
    });

    it('should render Back and WIP buttons', () => {
        const backButton = screen.getByRole('button', { name: 'Back' });
        expect(backButton).toBeTruthy();

        const wipButton = screen.getByRole('button', { name: 'WIP' });
        expect(wipButton).toBeTruthy();
    });
    it('should navigate to /LoggedIn when clicking the Back button', () => {
        const backButton = screen.getByRole('button', { name: 'Back' });
        fireEvent.click(backButton);

        expect(navigateMock).toHaveBeenCalledWith('/LoggedIn');
    });

});
