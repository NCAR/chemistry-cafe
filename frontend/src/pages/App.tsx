import "../styles/App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import Settings from "./Settings.tsx";
import Dashboard from "./Dashboard.tsx";
import FamilyEditor from "./FamilyEditor.tsx";
import Register from "./Register.tsx";
import About from "./About.tsx";
import UserManagement from "./UserManagement.tsx";
import NoAccess from "./Unauthorized.tsx";
import { AuthProvider } from "../components/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Banner from "../components/CookieBanner";
import { CustomThemeProvider } from "../components/CustomThemeContext.tsx";
import { UserPreferencesProvider } from "../components/UserPreferencesContext.tsx";

function App() {
  return (
    <>
      {/* <AccessibilityWidget /> */}
      <AuthProvider>
        <CustomThemeProvider>
          <UserPreferencesProvider>
            <Banner />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/register" element={<Register />} />
              <Route path="/loggedin" element={<Navigate to="/" replace />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/familyeditor" element={<FamilyEditor />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="/unauthorized" element={<NoAccess />} />
              {/* Protected route for the Roles page */}
              <Route
                path="/usermanagement"
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </UserPreferencesProvider>
        </CustomThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
