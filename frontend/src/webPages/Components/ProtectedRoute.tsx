import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user: loggedInUser } = useAuth();

  // Check if the user is logged in and has the correct role
  if (!loggedInUser || loggedInUser.role !== requiredRole) {
    // Redirect to a different page if the user is not authorized
    return <Navigate to="/unauthorized" replace />;
  }

  // If the user has the correct role, render the children (the protected page)
  return <>{children}</>;
};

export default ProtectedRoute;
