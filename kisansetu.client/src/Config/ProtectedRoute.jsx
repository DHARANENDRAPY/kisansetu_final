import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/landing" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;

  return element;
};

export default ProtectedRoute;
