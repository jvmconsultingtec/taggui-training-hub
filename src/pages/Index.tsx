
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log("User authenticated, isAdmin:", isAdmin);
        
        // Add a slight delay to ensure isAdmin has been properly set
        setTimeout(() => {
          if (isAdmin) {
            console.log("Redirecting to admin panel");
            navigate("/admin");
          } else {
            console.log("Redirecting to regular dashboard");
            navigate("/dashboard");
          }
        }, 50);
      } else {
        console.log("No user, redirecting to login");
        navigate("/login");
      }
    }
  }, [user, loading, navigate, isAdmin]);

  // Show loading while the auth state is being determined
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 p-4">
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-36 w-full max-w-md" />
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  return null;
};

export default Index;
