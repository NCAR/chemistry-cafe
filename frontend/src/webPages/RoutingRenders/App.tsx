import { Route, Routes } from 'react-router-dom';
import Settings from '../Settings/settings';
import LoggedIn from '../LogIn/loggedIn';
import FamilyPage from '../Family/family';
import LogIn from '../LogIn/logIn';
import RoleManagement from '../Roles/RoleManagement';
import { AccessibilityWidget } from 'react-accessibility';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../Components/ProtectedRoute'; // The ProtectedRoute you created earlier
import React from 'react';
import './App.css'; // Assuming CSS is applied globally
import Banner from '../Components/CookieBanner';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a custom theme with your font
const theme = createTheme({
  typography: {
    fontFamily: "'Poppins', sans-serif",
    
  },
});


function App() {

    return (
        <div>
            <Banner />
            <Routes>
                <Route path="/" element={<LogIn />} />
                <Route path="/LoggedIn" element={<LoggedIn />} />
                <Route path="/FamilyPage" element={<FamilyPage />} />
                <Route path="/Roles" element={<RoleManagement />} />
                <Route path="/Settings" element={<Settings />} />
            </Routes>
        </div>
    );
}

export default App;


