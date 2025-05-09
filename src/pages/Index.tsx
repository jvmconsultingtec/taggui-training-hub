
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      if (!loading) {
        if (user) {
          console.log("Usuário autenticado, redirecionando para dashboard");
          navigate("/dashboard");
        } else {
          console.log("Nenhum usuário, redirecionando para login");
          navigate("/login");
        }
      }
    };
    
    checkAuthAndRedirect();
  }, [user, loading, navigate]);

  // Mostrar carregamento enquanto verifica autenticação
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
