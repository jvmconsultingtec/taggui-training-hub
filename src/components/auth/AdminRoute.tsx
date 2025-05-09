
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminRoute = () => {
  const { user, session, loading } = useAuth();
  
  // Mostrar carregamento enquanto verifica autenticação
  if (loading) {
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

  // Fazer uma verificação direta se o usuário tem role de ADMIN
  const isAdmin = user.app_metadata?.role === 'ADMIN' || 
                 user.user_metadata?.role === 'ADMIN';
  
  if (!isAdmin) {
    console.log("Usuário não é administrador, redirecionando para dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // Exibir conteúdo somente se o usuário for administrador
  console.log("AdminRoute - User is admin, showing admin content");
  return <Outlet />;
};
