
import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export const AdminRoute = () => {
  const { user, session, isAdmin, loading } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  
  useEffect(() => {
    // Use a small timeout to ensure auth state is updated
    const timer = setTimeout(() => {
      setCheckingAuth(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user, isAdmin]);
  
  // Mostrar carregamento enquanto verifica
  if (loading || checkingAuth) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold">Verificando permissões de administrador</h2>
          <p className="text-gray-500">Aguarde enquanto verificamos seu acesso...</p>
        </div>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    );
  }

  // Verificar se o usuário está autenticado
  if (!user || !session) {
    console.log("Usuário não autenticado, redirecionando para login");
    localStorage.setItem('returnUrl', window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário é admin
  if (!isAdmin) {
    console.log("Usuário não é administrador, redirecionando para dashboard");
    toast({
      title: "Acesso negado",
      description: "Esta área é restrita a administradores",
      variant: "destructive"
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Exibir conteúdo somente se o usuário for administrador
  console.log("AdminRoute - Usuário é admin, mostrando conteúdo admin");
  return <Outlet />;
};
