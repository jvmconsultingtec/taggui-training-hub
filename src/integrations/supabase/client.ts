
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://deudqfjiieufqenzfclv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRldWRxZmppaWV1ZnFlbnpmY2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjYzNzUsImV4cCI6MjA2MTY0MjM3NX0.ytm2GuUx5eRyTAAOKkL5WPyXhA9g1nX7xUC5qEkOYko";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? localStorage : undefined
  },
  global: {
    // Headers to ensure content is not cached
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  db: {
    schema: 'public'
  },
  // Enable auto retries for better reliability
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper to determine if the user is authenticated with improved error handling
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

// Helper to refresh data and bypass cache
export const refreshData = async <T>(callback: () => Promise<T>): Promise<T> => {
  try {
    // Add a tiny delay to ensure the previous operation has time to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Call the provided callback to fetch fresh data
    return await callback();
  } catch (error) {
    console.error("Error refreshing data:", error);
    throw error;
  }
};

// Tipos permitidos para funções RPC, derivado da sua base de dados
type AllowedRpcFunctions = 
  | "user_has_training_access" 
  | "is_user_admin"
  | "check_same_company_access"
  | "check_user_access"
  | "check_user_access_for_users"
  | "can_access_user_group"
  | "can_access_group_member"
  | "user_belongs_to_company"
  | "get_current_user_company_id"
  | "fetch_company_users"
  | "get_user_company_id"
  | "is_admin"
  | "get_auth_user_company_id"
  | "promover_a_admin"
  | "criar_usuario";

// Execute an RPC function that returns data rather than querying tables directly
// This helps avoid RLS recursion issues with policies that reference the same table
export const executeRPC = async <T>(functionName: AllowedRpcFunctions, params?: Record<string, any>): Promise<T> => {
  try {
    console.log(`Executing RPC function: ${functionName}`, params);
    
    const { data, error } = await supabase.rpc(
      functionName,
      params || {}
    );
    
    if (error) {
      console.error(`Error executing RPC ${functionName}:`, error);
      throw error;
    }
    
    // Ensure we return the data with the correct type
    return data as T;
  } catch (error) {
    console.error(`Exception in RPC ${functionName}:`, error);
    throw error;
  }
};

// Get current user's company ID using Edge Function
export const getCurrentUserCompanyId = async (): Promise<string> => {
  try {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    console.log("Getting company ID for user:", userId);
    
    const { data, error } = await supabase.functions.invoke('get_auth_user_company_id', {
      headers: {
        'x-user-id': userId
      }
    });
    
    if (error) {
      console.error("Error invoking get_auth_user_company_id:", error);
      throw error;
    }
    
    console.log("Company ID result:", data);
    return data;
  } catch (error) {
    console.error("Error getting company ID:", error);
    throw error;
  }
};
