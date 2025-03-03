import "../styles/App.css";
import { Route, Routes } from "react-router-dom";
import Settings from "./Settings.tsx";
import Dashboard from "./Dashboard.tsx";
import FamilyPage from "./FamilyPage.tsx";
import Home from "./Home.tsx";
import UserManagement from "./UserManagement.tsx";
import NoAccess from "./Unauthorized.tsx";
import { AuthProvider } from "../components/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Banner from "../components/CookieBanner";
import { CustomThemeProvider } from "../components/CustomThemeContext.tsx";

function App() {
  return (
    <>
      {/* <AccessibilityWidget /> */}
      <AuthProvider>
        <CustomThemeProvider>
          <Banner />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/loggedin" element={<Dashboard />} /> {/* TODO Update backend redirects go to dashboard instead of loggedin */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/familypage" element={<FamilyPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/unauthorized" element={<NoAccess />} />

            {/* Protected route for the Roles page */}
            <Route
              path="/usermanagement"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </CustomThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
