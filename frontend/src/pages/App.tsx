import '../styles/App.css';
import { Route, Routes } from 'react-router-dom';
import Settings from './settings.tsx';
import LoggedIn from './loggedIn.tsx';
import FamilyPage from './family.tsx';
import LogIn from './logIn.tsx';
import RoleManagement from './RoleManagement.tsx';
import NoAccess from './Unauthorized.tsx';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Banner from '../components/CookieBanner';

import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const cache = createCache({
  key: 'mui',
  nonce: '1A59E59F-7913-4CA8-AF58-70A5A95C7F60',
});

function App() {
    return (
        <CacheProvider value={cache}>
            {/* <AccessibilityWidget /> */}
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
        </CacheProvider>
    );
}

export default App;
