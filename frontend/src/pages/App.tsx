import "../styles/App.css";
import { Route, Routes } from "react-router-dom";
import Settings from "./Settings.tsx";
import Dashboard from "./Dashboard.tsx";
import FamilyPage from "./FamilyPage.tsx";
import Home from "./Home.tsx";
import RoleManagement from "./RoleManagement.tsx";
import NoAccess from "./Unauthorized.tsx";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Banner from "../components/CookieBanner";

function App() {
  return (
    <>
      {/* <AccessibilityWidget /> */}
      <AuthProvider>
        <Banner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/LoggedIn" element={<Dashboard />} />
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
