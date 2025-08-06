import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Render the protected component if authenticated
  return children;
};

export default ProtectedRoute;
