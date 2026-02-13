import { createClient } from '@supabase/supabase-js';

let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    }
    
    if (SUPABASE_URL === 'https://your-project.supabase.co') {
      throw new Error('Please configure real Supabase credentials in .env');
    }
    
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  
  return supabaseClient;
}

export async function executeQuery(input: { query: string }): Promise<string> {
  try {
    const query = input.query.trim().toLowerCase();
    
    // Security: Only allow SELECT queries
    if (!query.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed. For INSERT/UPDATE/DELETE, use specific tools.');
    }
    
    // Security: Block dangerous patterns
    const dangerousPatterns = [
      'drop table',
      'drop database',
      'truncate',
      'delete from',
      'alter table',
      'create table'
    ];
    
    for (const pattern of dangerousPatterns) {
      if (query.includes(pattern)) {
        throw new Error(`Query contains dangerous pattern: ${pattern}`);
      }
    }
    
    const supabase = getSupabaseClient();
    
    // Execute query using Supabase RPC function
    const { data, error } = await supabase.rpc('execute_readonly_sql', { 
      query_text: input.query 
    });
    
    if (error) {
      throw new Error(`Query failed: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return 'Query executed successfully. No results returned.';
    }
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`Database query failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function listTables(input: {}): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.rpc('execute_readonly_sql', {
      query_text: `
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `
    });
    
    if (error) {
      throw new Error(`Failed to list tables: ${error.message}`);
    }
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`List tables failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function describeTable(input: { table_name: string }): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.rpc('execute_readonly_sql', {
      query_text: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = '${input.table_name}'
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      throw new Error(`Failed to describe table: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return `Table '${input.table_name}' not found or has no columns.`;
    }
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`Describe table failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Tool definitions for Anthropic
export const databaseTools = [
  {
    name: 'execute_query',
    description: 'Execute a SELECT query on the database. Only read-only queries are allowed for safety.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'SQL SELECT query to execute'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'list_tables',
    description: 'List all tables in the database.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'describe_table',
    description: 'Get the schema/structure of a specific table.',
    input_schema: {
      type: 'object',
      properties: {
        table_name: {
          type: 'string',
          description: 'Name of the table to describe'
        }
      },
      required: ['table_name']
    }
  }
];
