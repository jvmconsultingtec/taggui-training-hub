
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://deudqfjiieufqenzfclv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRldWRxZmppaWV1ZnFlbnpmY2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjYzNzUsImV4cCI6MjA2MTY0MjM3NX0.ytm2GuUx5eRyTAAOKkL5WPyXhA9g1nX7xUC5qEkOYko";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? localStorage : undefined
  },
  global: {
    // Headers personalizados para requisições ao Storage
    headers: {
      // Desativar cache para garantir que o conteúdo mais recente seja carregado
      'cache-control': 'no-cache, no-store, must-revalidate',
      'pragma': 'no-cache',
      'expires': '0'
    }
  }
});

// Helper to determine if the user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
    
    return !!data.session;
  } catch (error) {
    console.error("Exception checking authentication:", error);
    return false;
  }
};
