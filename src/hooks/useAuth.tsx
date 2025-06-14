
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: object) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Função para verificar se o usuário é admin usando função RPC direta
  // que não depende da edge function problemática
  const checkAdminStatus = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }
    
    try {
      console.log("Verificando status de admin via RPC para:", currentUser.id);
      
      // Usar RPC para chamar is_admin no banco de dados diretamente
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: currentUser.id
      });
      
      if (error) {
        console.error("Erro ao verificar status de admin via RPC:", error);
        setIsAdmin(false);
        return;
      }
      
      console.log("Resultado da verificação de admin via RPC:", data);
      setIsAdmin(!!data);
      
    } catch (err) {
      console.error("Exceção ao verificar status de admin:", err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Configurar o listener de mudança de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.info(`Mudança no estado de autenticação: ${event}`);
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Verificar status de admin com pequeno delay para evitar problemas
          if (currentSession?.user) {
            setTimeout(() => {
              if (mounted) {
                checkAdminStatus(currentSession.user);
              }
            }, 100);
          } else {
            setIsAdmin(false);
          }
          
          setLoading(false);
        }
      }
    );
    
    // Obter a sessão inicial
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao inicializar autenticação:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (data.session && mounted) {
          setSession(data.session);
          setUser(data.session.user);
          
          // Verificar status de admin
          await checkAdminStatus(data.session.user);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Exceção em initializeAuth:", err);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  // Restante das funções de autenticação
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error) {
        console.log("Login bem-sucedido");
        toast({
          title: "Login bem-sucedido",
          description: "Você foi conectado com sucesso"
        });
      } else {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
      }
      
      return { error };
    } catch (error) {
      console.error("Erro de login:", error);
      setLoading(false);
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      });
      
      if (!error) {
        toast({
          title: "Registro bem-sucedido",
          description: "Sua conta foi criada com sucesso"
        });
      } else {
        toast({
          title: "Erro ao registrar",
          description: error.message,
          variant: "destructive"
        });
      }
      
      return { error };
    } catch (error) {
      console.error("Sign up error:", error);
      setLoading(false);
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      toast({
        title: "Logout bem-sucedido",
        description: "Você foi desconectado com sucesso"
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Erro ao desconectar",
        description: "Ocorreu um erro ao tentar desconectar",
        variant: "destructive"
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      return { error };
    } catch (error) {
      console.error("Reset password error:", error);
      return { error };
    }
  };
  
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ 
        password 
      });
      
      return { error };
    } catch (error) {
      console.error("Update password error:", error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
