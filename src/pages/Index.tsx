
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Evita múltiplas chamadas e redirecionamentos
    if (!loading && !isRedirecting && user) {
      console.log("User authenticated:", user.email);
      console.log("User is admin:", isAdmin);
      
      setIsRedirecting(true);
      
      if (isAdmin) {
        console.log("Redirecting to admin panel");
        navigate("/admin");
        toast({
          title: "Bem-vindo, Administrador",
          description: "Você está acessando o painel de administração"
        });
      } else {
        console.log("Redirecting to regular dashboard");
        navigate("/dashboard");
      }
    } else if (!loading && !user) {
      console.log("No user, redirecting to login");
      navigate("/login");
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
