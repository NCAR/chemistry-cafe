import { Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user: loggedInUser } = useAuth();

  const allowedRoles = (
    Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  ).map((r) => r.toLowerCase());

  // Check if the user is logged in and has an allowed role
  if (
    !loggedInUser ||
    !allowedRoles.includes(loggedInUser.role?.toLowerCase() || "")
  ) {
    // Redirect to a different page if the user is not authorized
    return <Navigate to="/unauthorized" replace />;
  }

  // If the user has the correct role, render the children (the protected page)
  return <>{children}</>;
};

export default ProtectedRoute;
