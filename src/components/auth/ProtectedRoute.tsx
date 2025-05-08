
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  requiredRole?: "ADMIN" | "MANAGER" | "COLLABORATOR";
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  redirectTo = "/login",
}) => {
  const { user, session, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    // Wait a small amount of time to ensure auth state is correctly initialized
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading state
  if (loading || !authChecked) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!user || !session) {
    console.log("No authenticated user or session found, redirecting to login");
    // Save the current location for redirect after login
    localStorage.setItem('returnUrl', window.location.pathname);
    return <Navigate to={redirectTo} replace />;
  }

  // Check if session is expired
  if (session.expires_at) {
    const isSessionExpired = new Date(session.expires_at * 1000) < new Date();
    if (isSessionExpired) {
      console.log("Session expired, redirecting to login");
      // Save the current location for redirect after login
      localStorage.setItem('returnUrl', window.location.pathname);
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Display children only if user is authenticated
  return <Outlet />;
};
