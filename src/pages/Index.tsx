
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Evita múltiplas chamadas e redirecionamentos
    if (!loading && !isRedirecting) {
      setIsRedirecting(true);
      
      if (user) {
        console.log("User authenticated:", user.email);
        navigate("/dashboard");
      } else {
        console.log("No user, redirecting to login");
        navigate("/login");
      }
    }
  }, [user, loading, navigate]);

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
