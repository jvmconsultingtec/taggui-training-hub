
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.24.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Get user ID from request params
    const userId = new URL(req.url).searchParams.get('user_id');
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'No user ID provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Verificando status de admin para o usuário:", userId);

    // Usando SERVICE_ROLE_KEY para contornar RLS completamente
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: { headers: { 'Content-Type': 'application/json' } },
        auth: { persistSession: false }
      }
    );

    // Execute consulta direta para verificar se o usuário é admin
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Erro na consulta de admin:", error);
      return new Response(JSON.stringify({ 
        error: error.message,
        isAdmin: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Verificar o papel do usuário
    const isAdmin = data?.role === 'ADMIN';
    console.log("Resultado da verificação de admin:", { userId, role: data?.role, isAdmin });
    
    // Retornar o resultado
    return new Response(JSON.stringify({ isAdmin }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Erro ao verificar status de admin:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      isAdmin: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
