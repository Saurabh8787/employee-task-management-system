import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// allowedRoles: optional array, e.g. ['Admin']. Omit to allow any authenticated user.
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
