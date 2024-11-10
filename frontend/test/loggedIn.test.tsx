// import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
// import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react';
// import React from 'react';
// import LoggedIn from '../src/webPages/LogIn/loggedIn';
// import { MemoryRouter, useNavigate } from 'react-router-dom';

// // Partially mock react-router-dom
// vi.mock('react-router-dom', async (importOriginal) => {
//     // Import the original module
//     const actual = await importOriginal();

//     // Use type assertion to treat `actual` as an object
//     const actualAsObject = actual as Record<string, any>;

//     // Define the mocked navigate function
//     const navigateMock = vi.fn();

//     // Return an object containing the original exports and mocked functions
//     return {
//         ...actualAsObject, // Spread the original exports
//         useNavigate: () => navigateMock, // Mock the useNavigate function
//     };
// });


// describe('LoggedIn Component Test', () => {
//     let navigateMock;

//     beforeEach(() => {
//         // Get the mocked useNavigate function
//         navigateMock = useNavigate();

//         // Render the LoggedIn component inside a MemoryRouter
//         render(
//             <MemoryRouter initialEntries={['/LoggedIn']}>
//                 <LoggedIn />
//             </MemoryRouter>
//         );
//     });

//     afterEach(() => {
//         cleanup();
//     });

//     it('should render Families and Settings buttons', () => {
//         // Check for the presence of the Families button
//         const familiesButton = screen.getByRole('button', { name: 'Families' });
//         expect(familiesButton).toBeTruthy();

//         // Check for the presence of the Settings button
//         const settingsButton = screen.getByRole('button', { name: 'Settings' });
//         expect(settingsButton).toBeTruthy();
//     });

//     it('should navigate to FamilyPage when clicking the Families button', () => {
//         // Find the Families button and simulate a click event
//         const familiesButton = screen.getByRole('button', { name: 'Families' });
//         fireEvent.click(familiesButton);

//         // Verify that the navigate function was called with the expected path
//         expect(navigateMock).toHaveBeenCalledWith('/FamilyPage');
//     });

//     it('should navigate to Settings when clicking the Settings button', () => {
//         // Find the Settings button and simulate a click event
//         const settingsButton = screen.getByRole('button', { name: 'Settings' });
//         fireEvent.click(settingsButton);

//         // Verify that the navigate function was called with the expected path
//         expect(navigateMock).toHaveBeenCalledWith('/Settings');
//     });

//     it('should open the Drawer when clicking the DensitySmallSharpIcon button', async () => {
//         // Find the button with the DensitySmallSharpIcon using its data-testid attribute
//         const iconButton = screen.getByTestId('DensitySmallSharpIcon');
    
//         // Simulate a click event on the button to open the Drawer
//         fireEvent.click(iconButton);
    
//         // Use waitFor to wait for the Drawer to be present (i.e., `sentinelStart` element should be present)
//         const sentinelStart = await waitFor(() => screen.getByTestId('sentinelStart'));
//         expect(sentinelStart).toBeTruthy(); // Confirm that the Drawer is open
    
//         // Verify the presence of the "Log Out" list item in the Drawer
//         const logOutOption = await waitFor(() =>
//             screen.getByText('Log Out')
//         );
//         expect(logOutOption).toBeTruthy(); // Confirm that "Log Out" is present in the Drawer
//     });
    
//     it('should navigate to Home when clicking the Home button in the Drawer', async () => {
//         // Open the Drawer by clicking the DensitySmallSharpIcon button
//         const iconButton = screen.getByTestId('DensitySmallSharpIcon');
//         fireEvent.click(iconButton);
    
//         // Wait for the Drawer to be present
//         await waitFor(() => screen.getByTestId('sentinelStart'));
    
//         // Find the Home button inside the Drawer and simulate a click event
//         const homeButton = screen.getByText('Home');
//         fireEvent.click(homeButton);
    
//         // Verify that the navigate function was called with the expected path for Home
//         expect(navigateMock).toHaveBeenCalledWith('/LoggedIn');
//     });
    
//     it('should navigate to FamilyPage when clicking the Families button in the Drawer', async () => {
//         // Open the Drawer by clicking the DensitySmallSharpIcon button
//         const iconButton = screen.getByTestId('DensitySmallSharpIcon');
//         fireEvent.click(iconButton);
    
//         // Wait for the Drawer to be present
//         await waitFor(() => screen.getByTestId('sentinelStart'));
    
//         // Locate all elements with role "presentation"
//         const elementsWithPresentationRole = screen.getAllByRole('presentation');
    
//         // Filter the elements to find the one representing the Drawer
//         const drawerElement = elementsWithPresentationRole.find(
//             (element) => element.classList.contains('MuiDrawer-root')
//         );
    
//         // Ensure the Drawer element was found
//         if (!drawerElement) {
//             throw new Error('Drawer element not found');
//         }
    
//         // Find the Families button inside the Drawer
//         const drawerFamiliesButton = within(drawerElement).getByText('Families');
    
//         // Simulate a click event on the Families button inside the Drawer
//         fireEvent.click(drawerFamiliesButton);
    
//         // Verify that the navigate function was called with the expected path for Families in the Drawer
//         expect(navigateMock).toHaveBeenCalledWith('/FamilyPage');
//     });
    
    
    
//     it('should navigate to Log Out when clicking the Log Out button in the Drawer', async () => {
//         // Open the Drawer by clicking the DensitySmallSharpIcon button
//         const iconButton = screen.getByTestId('DensitySmallSharpIcon');
//         fireEvent.click(iconButton);
    
//         // Wait for the Drawer to be present
//         await waitFor(() => screen.getByTestId('sentinelStart'));
    
//         // Find the Log Out button inside the Drawer and simulate a click event
//         const logOutButton = screen.getByText('Log Out');
//         fireEvent.click(logOutButton);
    
//         // Verify that the navigate function was called with the expected path for Log Out
//         expect(navigateMock).toHaveBeenCalledWith('/');
//     });
    

// });
