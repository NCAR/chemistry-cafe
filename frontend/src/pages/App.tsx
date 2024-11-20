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

function App() {
    return (
        <>
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
        </>
    );
}

export default App;
