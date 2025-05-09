
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const AdminRoute = () => {
  const { user, session, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingRole(false);
        return;
      }
      
      try {
        console.log("Verificando status de administrador para:", user.id);
        
        // Verificar usando RPC para evitar recursão
        const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
        
        if (error) {
          console.error("Erro ao verificar status de admin:", error);
          setIsAdmin(false);
        } else {
          console.log("Status de admin:", data);
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error("Erro ao verificar status de admin:", err);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };
    
    if (user) {
      checkAdminStatus();
    } else {
      setCheckingRole(false);
    }
  }, [user]);
  
  // Mostrar carregamento enquanto verifica autenticação e papel
  if (loading || checkingRole) {
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

  // Verificar se o usuário é admin
  if (!isAdmin) {
    console.log("Usuário não é administrador, redirecionando para dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // Exibir conteúdo somente se o usuário for administrador
  console.log("AdminRoute - Usuário é admin, mostrando conteúdo admin");
  return <Outlet />;
};
