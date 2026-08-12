import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner } from "./ui.jsx";

/** Wrap pages that need a logged-in user. */
export default function Protected({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner text="Loading your session…" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
