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
    const { title, content, concepts, emotional_depth, breakthrough_moment, tags } = await req.json();

    console.log('Saving conversation:', title);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Generar embedding usando OpenAI
    console.log('Generating embedding...');
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: `${title}\n\n${content}`,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`Failed to generate embedding: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    console.log('Embedding generated, saving to database...');

    // Guardar conversación con embedding
    const { data: conversation, error: saveError } = await supabase
      .from('conversations')
      .insert({
        title,
        content,
        concepts: concepts || [],
        emotional_depth: emotional_depth || 5,
        breakthrough_moment: breakthrough_moment || false,
        tags: tags || [],
        embedding,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving conversation:', saveError);
      throw saveError;
    }

    // Guardar conceptos nuevos en tabla de conceptos
    if (concepts && concepts.length > 0) {
      console.log('Saving concepts:', concepts);
      for (const conceptName of concepts) {
        const { error: conceptError } = await supabase
          .from('concepts')
          .upsert({
            name: conceptName,
            definition: `Extraído de: ${title}`,
            related_conversations: [conversation.id],
          }, {
            onConflict: 'name',
          });

        if (conceptError) {
          console.error('Error saving concept:', conceptError);
        }
      }
    }

    console.log('Conversation saved successfully:', conversation.id);

    return new Response(JSON.stringify({
      id: conversation.id,
      embedding_generated: true,
      saved_to_db: true,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in save-conversation:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
