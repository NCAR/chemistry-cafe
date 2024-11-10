//import React from 'react';

import '../styles/App.css'; // Assuming CSS is applied globally
import Banner from '../components/CookieBanner';
//import { createTheme/*, ThemeProvider*/ } from '@mui/material/styles';
import { Route, Routes } from 'react-router-dom';
import Settings from './settings';
import LoggedIn from './loggedIn';
import FamilyPage from './family';
import LogIn from './logIn';
import RoleManagement from './RoleManagement';
import NoAccess from './Unauthorized.tsx';
import { AccessibilityWidget } from 'react-accessibility';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from '../components/ProtectedRoute'; // The ProtectedRoute you created earlier


// const theme = createTheme({
//   typography: {
//     fontFamily: "'Poppins', sans-serif",
    
//   },
// });


function App() {
    return (
        <div>
            <AccessibilityWidget />
            <AuthProvider>
            <Banner />
                <Routes>
                    <Route path="/" element={<LogIn />} />
                    <Route path="/LoggedIn" element={<LoggedIn />} />
                    <Route path="/FamilyPage" element={<FamilyPage />} />
                    <Route path="/Settings" element={<Settings />} />
                    <Route path="/unauthorized" element={<NoAccess />} />
                    
                    {/* Protected route for the Roles page */}
                    <Route 
                        path="/Roles" 
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <RoleManagement />
                            </ProtectedRoute>
                        } 
                    />

                 
                </Routes>
            </AuthProvider>
        </div>
    );
}

export default App;
