
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session and set up auth listener
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        console.log("Initializing auth state");
        
        // Set up auth state listener FIRST to prevent missing auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, sessionData) => {
            console.log("Auth state change:", event, sessionData?.user?.id);
            
            setUser(sessionData?.user ?? null);
            setSession(sessionData);
            
            if (event === 'SIGNED_OUT') {
              console.log("User signed out, navigating to login");
              navigate('/login');
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              console.log("User signed in or token refreshed");
              const returnUrl = localStorage.getItem('returnUrl') || '/dashboard';
              localStorage.removeItem('returnUrl');
              navigate(returnUrl);
            }
          }
        );
        
        // THEN check for existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          console.log("Active session found for user:", currentSession.user.id);
          setUser(currentSession.user);
          setSession(currentSession);
        } else {
          console.log("No active session found");
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [navigate]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Save current URL for redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.setItem('returnUrl', currentPath);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }
      
      if (data?.user) {
        console.log("User signed in successfully:", data.user.id);
        
        // Check if user exists in the users table, create if not
        try {
          const { data: userExists, error: userCheckError } = await supabase
            .from("users")
            .select("id")
            .eq("id", data.user.id)
            .single();
            
          if (userCheckError && userCheckError.code === "PGRST116") {
            // User doesn't exist, create user profile
            await supabase.from("users").insert({
              id: data.user.id,
              email: data.user.email || "",
              name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
              company_id: "00000000-0000-0000-0000-000000000000"
            });
          }
        } catch (error) {
          console.error("Error checking/creating user profile:", error);
        }
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao TAGGUI Treinamentos"
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique suas credenciais",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function with improved error handling
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      const companyId = "00000000-0000-0000-0000-000000000000";
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            company_id: companyId
          }
        }
      });
      
      if (error) {
        console.error("Sign up error:", error);
        throw error;
      }
      
      if (data?.user) {
        console.log("User registered successfully:", data.user.id);
        
        // Create user in public.users table
        try {
          await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email || "",
            name: name,
            company_id: companyId
          });
          
          console.log("User profile created in database");
        } catch (profileError) {
          console.error("Error creating user profile:", profileError);
        }
      }

      toast({
        title: "Conta criada com sucesso",
        description: "Você já pode fazer login com suas credenciais"
      });
      
      navigate('/login');
      
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar a conta",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Redirect will be handled by onAuthStateChange
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message || "Ocorreu um problema ao sair",
        variant: "destructive"
      });
    }
  };

  // Password reset function (sends reset email)
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }

      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha"
      });
      
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Não foi possível enviar o email de redefinição",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update password function (after reset)
  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso"
      });
      
      navigate('/login');
      
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Não foi possível atualizar sua senha",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create auth context value
  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
