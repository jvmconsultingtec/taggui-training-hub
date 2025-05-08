
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export const AdminRoute = () => {
  const { user, session, loading, isAdmin } = useAuth();
  
  console.log("AdminRoute - User:", user?.email);
  console.log("AdminRoute - Is user admin?", isAdmin);

  // Mostrar carregamento enquanto verifica autenticação ou permissões
  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-8">
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
  return <Outlet />;
};
