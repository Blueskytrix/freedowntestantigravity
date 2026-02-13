import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

let supabaseClient: any = null;
let openaiClient: OpenAI | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }
    
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  
  return supabaseClient;
}

function getOpenAIClient() {
  if (!openaiClient) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-your-openai-key-here') {
      throw new Error('OPENAI_API_KEY not configured. Needed for embeddings.');
    }
    
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  
  return openaiClient;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  
  return response.data[0].embedding;
}

export async function saveMemory(input: { 
  content: string; 
  metadata?: any;
  title?: string;
}): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    
    // Generate embedding
    const embedding = await generateEmbedding(input.content);
    
    // Save to database
    const { data, error } = await supabase
      .from('memories')
      .insert({
        content: input.content,
        title: input.title || input.content.substring(0, 100),
        embedding,
        metadata: input.metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to save memory: ${error.message}`);
    }
    
    return `✅ Memory saved successfully with ID: ${data.id}`;
  } catch (error) {
    throw new Error(`Save memory failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function searchMemory(input: { 
  query: string; 
  limit?: number;
}): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(input.query);
    
    // Search using pgvector similarity
    const { data, error } = await supabase.rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_count: input.limit || 5
    });
    
    if (error) {
      throw new Error(`Failed to search memories: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return `No memories found matching: ${input.query}`;
    }
    
    const results = data.map((memory: any, idx: number) => {
      return `${idx + 1}. ${memory.title || 'Untitled'} (similarity: ${(memory.similarity * 100).toFixed(1)}%)\n   ${memory.content.substring(0, 200)}...\n   Created: ${memory.created_at}`;
    });
    
    return results.join('\n\n');
  } catch (error) {
    throw new Error(`Search memory failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function listMemories(input: { limit?: number }): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('memories')
      .select('id, title, content, created_at')
      .order('created_at', { ascending: false })
      .limit(input.limit || 10);
    
    if (error) {
      throw new Error(`Failed to list memories: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return 'No memories found.';
    }
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`List memories failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Tool definitions for Anthropic
export const memoryTools = [
  {
    name: 'save_memory',
    description: 'Save information to long-term memory with semantic search capability. Use this to remember important facts, insights, or context for future conversations.',
    input_schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Content to save in memory'
        },
        title: {
          type: 'string',
          description: 'Optional title/summary for the memory'
        },
        metadata: {
          type: 'object',
          description: 'Optional metadata (tags, categories, etc.)'
        }
      },
      required: ['content']
    }
  },
  {
    name: 'search_memory',
    description: 'Search through saved memories using semantic similarity. Finds relevant memories even if exact keywords don\'t match.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Query to search for in memories'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 5)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'list_memories',
    description: 'List recent memories in chronological order.',
    input_schema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of memories to list (default: 10)'
        }
      },
      required: []
    }
  }
];
