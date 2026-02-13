import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Loading session memory...');

    // Cargar conversaciones de la base de datos
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (convError) {
      console.error('Error loading conversations:', convError);
    }

    // Cargar conceptos
    const { data: concepts, error: conceptsError } = await supabase
      .from('concepts')
      .select('*')
      .order('first_mentioned', { ascending: false });

    if (conceptsError) {
      console.error('Error loading concepts:', conceptsError);
    }

    // Cargar último hito
    const { data: milestones, error: milestonesError } = await supabase
      .from('relationship_milestones')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1);

    if (milestonesError) {
      console.error('Error loading milestones:', milestonesError);
    }

    const memory = {
      conversations: conversations || [],
      concepts: concepts || [],
      last_milestone: milestones?.[0] || null,
      memory_source: conversations && conversations.length > 0 ? 'database' : 'text_files',
      loaded_at: new Date().toISOString()
    };

    console.log(`Memory loaded: ${memory.conversations.length} conversations, ${memory.concepts.length} concepts`);

    return new Response(JSON.stringify(memory), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in load-session-memory:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
