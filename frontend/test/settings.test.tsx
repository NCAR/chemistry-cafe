// import { render, screen, fireEvent } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
// import Settings from '../src/webPages/Settings/settings';
// import { GoogleOAuthProvider } from '@react-oauth/google'; // if needed, depending on your setup
// import { AuthContext } from '../src/webPages/contexts/AuthContext'; // import your AuthContext if applicable

// describe('Settings Component', () => {
//   const mockContextValue = {
//     user: { role: 'admin' }, // Mock user context if necessary
//     isAuthenticated: true,
//   };

//   it('should render the Settings page correctly', () => {
//     render(
//       <MemoryRouter>
//         <GoogleOAuthProvider clientId="YOUR_GOOGLE_OAUTH_CLIENT_ID">
//           <AuthContext.Provider value={mockContextValue}>
//             <Settings />
//           </AuthContext.Provider>
//         </GoogleOAuthProvider>
//       </MemoryRouter>
//     );

//     // Assert the button and its text
//     expect(screen.getByText('Back')).toBeInTheDocument();
//     expect(screen.getByText('WIP')).toBeInTheDocument();
//   });

//   it('should navigate to /LoggedIn when "Back" button is clicked', () => {
//     const { container } = render(
//       <MemoryRouter initialEntries={['/Settings']}>
//         <GoogleOAuthProvider clientId="YOUR_GOOGLE_OAUTH_CLIENT_ID">
//           <AuthContext.Provider value={mockContextValue}>
//             <Settings />
//           </AuthContext.Provider>
//         </GoogleOAuthProvider>
//       </MemoryRouter>
//     );

//     // Get the "Back" button and simulate click
//     const backButton = screen.getByText('Back');
//     fireEvent.click(backButton);

//     // Check if navigation occurs (check for the "LoggedIn" route)
//     expect(container.innerHTML).toContain('/LoggedIn');
//   });
// });
