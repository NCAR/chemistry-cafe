import { Route, Routes } from 'react-router-dom';
import Settings from '../Settings/settings';
import LoggedIn from '../LogIn/loggedIn';
import FamilyPage from '../Family/family';
import LogIn from '../LogIn/logIn';
import RoleManagement from '../Roles/RoleManagement';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../Components/ProtectedRoute'; // The ProtectedRoute you created earlier

function App() {
    return (
        <div>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LogIn />} />
                    <Route path="/LoggedIn" element={<LoggedIn />} />
                    <Route path="/FamilyPage" element={<FamilyPage />} />
                    <Route path="/Settings" element={<Settings />} />
                    
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
