
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(!!requiredRole);
  
  useEffect(() => {
    // Verificar a autenticação
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500);
    
    // Verificar a função do usuário se necessário
    const checkUserRole = async () => {
      if (!requiredRole || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Erro ao verificar função do usuário:", error);
          setHasRequiredRole(false);
        } else {
          const hasRole = data?.role === requiredRole;
          setHasRequiredRole(hasRole);
          
          if (!hasRole) {
            toast({
              title: "Acesso negado",
              description: `Esta página requer função ${requiredRole}`,
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("Erro ao verificar função do usuário:", error);
        setHasRequiredRole(false);
      } finally {
        setCheckingRole(false);
      }
    };
    
    if (user && requiredRole) {
      checkUserRole();
    } else if (requiredRole) {
      setHasRequiredRole(false);
      setCheckingRole(false);
    } else {
      setCheckingRole(false);
    }
    
    return () => clearTimeout(timer);
  }, [user, requiredRole]);

  // Mostrar carregamento
  if (loading || !authChecked || checkingRole) {
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
    console.log("Nenhum usuário autenticado encontrado, redirecionando para login");
    localStorage.setItem('returnUrl', window.location.pathname);
    return <Navigate to={redirectTo} replace />;
  }

  // Verificar se a sessão expirou
  if (session.expires_at) {
    const isSessionExpired = new Date(session.expires_at * 1000) < new Date();
    if (isSessionExpired) {
      console.log("Sessão expirada, redirecionando para login");
      localStorage.setItem('returnUrl', window.location.pathname);
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Verificar função requerida
  if (requiredRole && hasRequiredRole === false) {
    console.log(`Usuário não tem a função ${requiredRole}, redirecionando`);
    return <Navigate to="/dashboard" replace />;
  }

  // Exibir filhos somente se o usuário estiver autenticado e tiver a função necessária
  return <Outlet />;
};
