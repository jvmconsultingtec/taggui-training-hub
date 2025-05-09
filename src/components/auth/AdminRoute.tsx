
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export const AdminRoute = () => {
  const { user, session, loading, isAdmin } = useAuth();
  const [checked, setChecked] = useState(false);
  
  useEffect(() => {
    if (!loading) {
      console.log("AdminRoute - Loading complete");
      console.log("AdminRoute - User:", user?.email);
      console.log("AdminRoute - Is user admin?", isAdmin);
      setChecked(true);
    }
  }, [user, isAdmin, loading]);
  
  // Mostrar carregamento enquanto verifica autenticação ou permissões
  if (loading || !checked) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold">Verificando permissões</h2>
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

  // Verificar se o usuário tem permissão de administrador
  if (!isAdmin) {
    console.log("Usuário não é administrador, redirecionando para dashboard");
    toast({
      title: "Acesso negado",
      description: "Você não tem permissão para acessar esta página",
      variant: "destructive"
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Exibir conteúdo somente se o usuário for administrador
  console.log("AdminRoute - User is admin, showing admin content");
  return <Outlet />;
};
