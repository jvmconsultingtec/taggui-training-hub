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
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  // Função para verificar o status de administrador
  const checkAdminStatus = async (userId: string, token: string) => {
    try {
      if (!userId) {
        console.error("No user ID provided for admin check");
        setIsAdmin(false);
        setAdminCheckComplete(true);
        return;
      }

      console.log("Checking admin status for user:", userId);
      
      // Verificar se o usuário tem função ADMIN diretamente na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error("Error fetching user role:", userError);
      } else if (userData) {
        console.log("User role from database:", userData.role);
        const isUserAdmin = userData.role === 'ADMIN';
        setIsAdmin(isUserAdmin);
        setAdminCheckComplete(true);
        console.log("Admin status set to:", isUserAdmin);
        return;
      }
      
      // Caso não consiga acessar a tabela diretamente, usa a edge function como fallback
      console.log("Using edge function as fallback to check admin status");
      const { data, error } = await supabase.functions.invoke('is_admin', {
        headers: {
          'x-user-id': userId,
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (error) {
        console.error("Error checking admin status via edge function:", error);
        setIsAdmin(false);
      } else {
        console.log("Admin status result from edge function:", data);
        setIsAdmin(!!data);
      }
      
      setAdminCheckComplete(true);
    } catch (error) {
      console.error("Exception checking admin status:", error);
      setIsAdmin(false);
      setAdminCheckComplete(true);
    }
  };

  useEffect(() => {
    console.info("Initializing auth state");
    let mounted = true;
    
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.info(`Auth state change: ${event}`, currentSession?.user?.email);
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            // Reset admin check when user changes
            setAdminCheckComplete(false);
            
            // Use setTimeout to avoid recursive auth state changes
            setTimeout(() => {
              if (mounted) {
                checkAdminStatus(currentSession.user.id, currentSession.access_token);
              }
            }, 0);
          } else {
            setIsAdmin(false);
            console.info("No active session found");
            setLoading(false);
            setAdminCheckComplete(true);
          }
        }
      }
    );
    
    // Get the initial session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error initializing auth:", error);
          if (mounted) {
            setLoading(false);
            setAdminCheckComplete(true);
          }
          return;
        }
        
        if (data.session && mounted) {
          setSession(data.session);
          setUser(data.session.user);
          
          // Check admin status with user ID
          await checkAdminStatus(data.session.user.id, data.session.access_token);
        } else if (mounted) {
          setLoading(false);
          setAdminCheckComplete(true);
        }
      } catch (err) {
        console.error("Exception in initializeAuth:", err);
        if (mounted) {
          setLoading(false);
          setAdminCheckComplete(true);
        }
      }
    };
    
    initializeAuth();
    
    // Update loading state when admin check completes
    const loadingCheck = () => {
      if (adminCheckComplete && mounted) {
        setLoading(false);
      }
    };
    
    // Monitor for admin check completion
    const interval = setInterval(loadingCheck, 100);
    
    return () => {
      mounted = false;
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);
  
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAdminCheckComplete(false);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error) {
        console.log("Sign in successful");
        // Auth state change will handle setting user and session
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
      console.error("Sign in error:", error);
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

  console.log("AuthProvider rendering - isAdmin:", isAdmin, "user:", user?.email, "loading:", loading);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
