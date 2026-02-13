import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { query, limit = 5 } = await req.json();

    console.log('Searching memories for:', query);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generar embedding del query
    console.log('Generating query embedding...');
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`Failed to generate query embedding: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Buscar conversaciones similares usando pgvector
    console.log('Searching for similar conversations...');
    const { data: similarConversations, error: searchError } = await supabase.rpc(
      'match_conversations',
      {
        query_embedding: queryEmbedding,
        match_count: limit,
      }
    );

    if (searchError) {
      console.error('Error searching conversations:', searchError);
      
      // Fallback: buscar todas las conversaciones si la función no existe
      const { data: allConversations } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      return new Response(JSON.stringify({
        relevant_memories: (allConversations || []).map(conv => ({
          conversation_id: conv.id,
          title: conv.title,
          similarity_score: 0,
          excerpt: conv.content.substring(0, 200) + '...',
          created_at: conv.created_at,
        })),
        fallback: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const relevantMemories = (similarConversations || []).map((conv: any) => ({
      conversation_id: conv.id,
      title: conv.title,
      similarity_score: conv.similarity,
      excerpt: conv.content.substring(0, 200) + '...',
      created_at: conv.created_at,
    }));

    console.log(`Found ${relevantMemories.length} relevant memories`);

    return new Response(JSON.stringify({ relevant_memories: relevantMemories }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in retrieve-relevant-memories:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
