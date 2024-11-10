//import React from 'react';
import './App.css'; // Assuming CSS is applied globally
import Banner from '../Components/CookieBanner';
//import { createTheme/*, ThemeProvider*/ } from '@mui/material/styles';
import { Route, Routes } from 'react-router-dom';
import Settings from '../Settings/settings';
import LoggedIn from '../LogIn/loggedIn';
import FamilyPage from '../Family/family';
import LogIn from '../LogIn/logIn';
import RoleManagement from '../Roles/RoleManagement';
import NoAccess from '../Roles/Unauthorized.tsx';
import { AccessibilityWidget } from 'react-accessibility';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../Components/ProtectedRoute'; // The ProtectedRoute you created earlier


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
