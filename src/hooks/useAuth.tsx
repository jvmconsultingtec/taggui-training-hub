
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
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener FIRST (evita problemas de perda de eventos de auth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change:", event, currentSession?.user?.id);
        
        // Update auth state synchronously (sem chamar outras funções Supabase aqui)
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          navigate('/login');
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Redirecionar apenas em eventos de login/refresh
          const returnUrl = localStorage.getItem('returnUrl') || '/dashboard';
          localStorage.removeItem('returnUrl');
          navigate(returnUrl);
        }
      }
    );

    // THEN check for existing session
    const getSession = async () => {
      try {
        console.log("Getting existing session");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Got session:", currentSession?.user?.id || "No session");
        
        // Atualizar estado apenas se estiver diferente do atual
        if (currentSession?.user?.id !== user?.id) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } catch (err) {
        console.error('Error retrieving session:', err);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();

    return () => {
      console.log("Unsubscribing from auth state changes");
      subscription.unsubscribe();
    };
  }, [navigate, user?.id]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Trying to sign in with email:", email);
      
      // Salva URL atual para redirecionamento após login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.setItem('returnUrl', currentPath);
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error.message);
        throw error;
      }
      
      // Não precisa navegar aqui - o evento onAuthStateChange vai cuidar disso
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
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log("Trying to sign up user:", email, name);
      
      // Usar a empresa padrão que criamos no banco de dados
      const companyId = "00000000-0000-0000-0000-000000000000";
      
      const { error } = await supabase.auth.signUp({
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
        console.error("Sign up error:", error.message);
        throw error;
      }

      toast({
        title: "Conta criada com sucesso",
        description: "Você já pode fazer login com suas credenciais"
      });
      
      // Direcionar para a página de login após o cadastro
      navigate('/login');
      
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar a conta",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // O redirecionamento será feito pelo listener onAuthStateChange
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message || "Ocorreu um problema ao sair",
        variant: "destructive"
      });
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
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
