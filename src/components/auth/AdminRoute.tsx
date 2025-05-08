
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const AdminRoute = () => {
  const { user, session, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setCheckingPermissions(false);
        return;
      }
      
      try {
        // Use the security definer function to check admin status
        const { data: isAdminResult, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error("Error checking admin status:", error);
          throw error;
        }
        
        console.log("AdminRoute - Is user admin?", isAdminResult);
        setIsAdmin(isAdminResult);
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar suas permissões",
          variant: "destructive"
        });
        setIsAdmin(false);
      } finally {
        setCheckingPermissions(false);
      }
    };
    
    if (!loading && user) {
      checkAdminStatus();
    } else if (!loading && !user) {
      setCheckingPermissions(false);
    }
  }, [user, loading]);

  // Mostrar carregamento enquanto verifica autenticação ou permissões
  if (loading || checkingPermissions) {
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
