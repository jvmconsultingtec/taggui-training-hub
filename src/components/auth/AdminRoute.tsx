
import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export const AdminRoute = () => {
  const { user, session, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !session) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }
      
      try {
        console.log("Verificando status de administrador para:", user.id);
        
        // Usar a Edge Function is_admin para verificar status
        const response = await fetch(`https://deudqfjiieufqenzfclv.supabase.co/functions/v1/is_admin?user_id=${user.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erro na resposta: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Resultado da verificação de admin:", result);
        setIsAdmin(result.isAdmin);
      } catch (err) {
        console.error("Erro ao verificar status de admin:", err);
        toast({
          title: "Erro",
          description: "Não foi possível verificar suas permissões de administrador",
          variant: "destructive"
        });
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user, session]);
  
  // Mostrar carregamento enquanto verifica
  if (loading || checkingAdmin) {
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
