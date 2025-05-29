// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    // Redireciona para login se não autenticado
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;