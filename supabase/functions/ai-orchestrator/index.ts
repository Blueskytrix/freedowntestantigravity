import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

const tools: any[] = [
  {
    name: "list_files",
    description: "List files and directories in a specific path of the GitHub workspace. Returns an array of file/directory objects with names, types, and paths.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Directory path to list (empty string for root)"
        }
      },
      required: []
    }
  },
  {
    name: "read_file",
    description: "Read the contents of a file from the GitHub workspace. Optionally specify line ranges for large files (e.g., '1-50, 100-150').",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "File path to read"
        },
        lines: {
          type: "string",
          description: "Optional line ranges to read (e.g., '1-50, 100-150'). Reads entire file if omitted."
        }
      },
      required: ["path"]
    }
  },
  {
    name: "write_file",
    description: "Create or update a file in the GitHub workspace. If the file exists, it will be updated. If it doesn't exist, it will be created.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "File path to write"
        },
        content: {
          type: "string",
          description: "Content to write to the file"
        },
        message: {
          type: "string",
          description: "Commit message describing the change"
        }
      },
      required: ["path", "content", "message"]
    }
  },
  {
    name: "delete_file",
    description: "Delete a file from the GitHub workspace. This operation requires a commit message.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "File path to delete"
        },
        message: {
          type: "string",
          description: "Commit message describing why the file is being deleted"
        }
      },
      required: ["path", "message"]
    }
  },
  {
    name: "search_files",
    description: "Search for regex patterns across files in the GitHub workspace. Returns file paths and matching lines with line numbers.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Regex pattern to search for (e.g., 'useState\\(', 'function.*Component')"
        },
        path: {
          type: "string",
          description: "Directory path to search in (default: root)"
        },
        file_extension: {
          type: "string",
          description: "Filter by file extension (e.g., '.tsx', '.ts', '.js')"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "update_file_lines",
    description: "Update specific lines in a file without rewriting the entire file. More efficient than write_file for small changes. Use this for surgical edits.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "File path to update"
        },
        start_line: {
          type: "number",
          description: "First line to replace (1-indexed)"
        },
        end_line: {
          type: "number",
          description: "Last line to replace (1-indexed)"
        },
        new_content: {
          type: "string",
          description: "New content to insert at those lines"
        },
        message: {
          type: "string",
          description: "Commit message describing the change"
        }
      },
      required: ["path", "start_line", "end_line", "new_content", "message"]
    }
  },
  {
    name: "get_repo_structure",
    description: "Get a tree view of the entire repository structure with file types and sizes. Useful to see what exists before making changes.",
    input_schema: {
      type: "object",
      properties: {
        max_depth: {
          type: "number",
          description: "Maximum directory depth to explore (default: 3, max: 5)"
        }
      },
      required: []
    }
  },
  {
    name: "check_files_exist",
    description: "Check if multiple files exist without reading their contents. Returns a map of file paths to boolean existence status.",
    input_schema: {
      type: "object",
      properties: {
        paths: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of file paths to check (e.g., ['package.json', 'src/App.tsx', 'README.md'])"
        }
      },
      required: ["paths"]
    }
  },
  {
    name: "web_search",
    description: "Search the web for information. Currently returns a placeholder response.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query"
        }
      },
      required: ["query"]
    }
  }
];

async function executeToolCall(toolName: string, toolInput: any, supabase: any): Promise<string> {
  console.log(`Executing tool: ${toolName}`, toolInput);

  try {
    switch (toolName) {
      case "list_files": {
        const { data, error } = await supabase.functions.invoke('github-ops', {
          body: {
            action: 'list_files',
            path: toolInput.path || '',
            branch: 'main'
          }
        });

        if (error) {
          console.error('Error listing files:', error);
          return `Error listing files: ${error.message}`;
        }

        if (data.error) {
          return `Error: ${data.error}`;
        }

        const files = data.files || [];
        if (files.length === 0) {
          return `Directory is empty or does not exist: ${toolInput.path || 'root'}`;
        }

        const fileList = files.map((f: any) => `${f.type === 'dir' ? '📁' : '📄'} ${f.name} ${f.type === 'dir' ? '/' : ''}`).join('\n');
        return `Files in ${toolInput.path || 'root directory'}:\n${fileList}`;
      }

      case "read_file": {
        const { data, error } = await supabase.functions.invoke('github-ops', {
          body: {
            action: 'read_file',
            path: toolInput.path,
            lines: toolInput.lines,
            branch: 'main'
          }
        });

        if (error) {
          console.error('Error reading file:', error);
          return `Error reading file: ${error.message}`;
        }

        if (data.error) {
          return `Error: ${data.error}`;
        }

        return `Content of ${toolInput.path}${toolInput.lines ? ` (lines: ${toolInput.lines})` : ''}:\n\n${data.content}`;
      }

      case "write_file": {
        // First check if file exists
        const { data: readData } = await supabase.functions.invoke('github-ops', {
          body: {
            action: 'read_file',
            path: toolInput.path,
            branch: 'main'
          }
        });

        const action = readData?.error ? 'create_file' : 'write_file';
        
        const { data, error } = await supabase.functions.invoke('github-ops', {
          body: {
            action,
            path: toolInput.path,
            content: toolInput.content,
            message: toolInput.message || `Update ${toolInput.path}`,
            branch: 'main'
          }
        });

        if (error) {
          console.error('Error writing file:', error);
          return `Error writing file: ${error.message}`;
        }

        if (data.error) {
          return `Error: ${data.error}`;
        }

        return `Successfully ${action === 'create_file' ? 'created' : 'updated'} file: ${toolInput.path}`;
      }

      case "delete_file": {
        const { data, error } = await supabase.functions.invoke('github-ops', {
          body: {
            action: 'delete_file',
            path: toolInput.path,
            message: toolInput.message || `Delete ${toolInput.path}`,
            branch: 'main'
          }
        });

        if (error) {
          console.error('Error deleting file:', error);
          return `Error deleting file: ${error.message}`;
        }

        if (data.error) {
          return `Error: ${data.error}`;
        }

        return `Successfully deleted file: ${toolInput.path}`;
      }

      case "web_search": {
        return `Web search for "${toolInput.query}" - Feature not yet implemented. Consider using the GitHub workspace tools instead.`;
      }

      case "search_files": {
        const { data, error } = await supabase.functions.invoke('github-ops', {
          body: {
            action: 'search_files',
            query: toolInput.query,
            path: toolInput.path || '',
            file_extension: toolInput.file_extension,
            branch: 'main'
          }
        });

        if (error) {
          console.error('Error searching files:', error);
          return `Error searching files: ${error.message}`;
        }

        if (data.error) {
          return `Error: ${data.error}`;
        }

        const results = data.files || [];
        if (results.length === 0) {
          return `No matches found for pattern: "${toolInput.query}"`;
        }

        let output = `Found ${results.length} file(s) matching "${toolInput.query}":\n\n`;
        results.forEach((result: any) => {
          output += `📄 ${result.file}\n`;
          result.matches.forEach((match: any) => {
            output += `   Line ${match.line}: ${match.content}\n`;
          });
          output += '\n';
        });

        return output;
      }

      case "update_file_lines": {
        const { data, error } = await supabase.functions.invoke('github-ops', {
          body: {
            action: 'update_file_lines',
            path: toolInput.path,
            start_line: toolInput.start_line,
            end_line: toolInput.end_line,
            new_content: toolInput.new_content,
            message: toolInput.message,
            branch: 'main'
          }
        });

        if (error) {
          console.error('Error updating file lines:', error);
          return `Error updating file lines: ${error.message}`;
        }

        if (data.error) {
          return `Error: ${data.error}`;
        }

        return `✅ Successfully updated lines ${toolInput.start_line}-${toolInput.end_line} in ${toolInput.path}`;
      }

      case "get_repo_structure": {
        const { data, error } = await supabase.functions.invoke('github-ops', {
          body: {
            action: 'get_repo_structure',
            max_depth: toolInput.max_depth || 3,
            branch: 'main'
          }
        });

        if (error) {
          console.error('Error getting repo structure:', error);
          return `Error getting repo structure: ${error.message}`;
        }

        if (data.error) {
          return `Error: ${data.error}`;
        }

        function formatTree(node: any, indent: string = ''): string {
          const icon = node.type === 'dir' ? '📁' : '📄';
          const size = node.size ? ` (${Math.round(node.size / 1024)}KB)` : '';
          let output = `${indent}${icon} ${node.name}${size}\n`;
          
          if (node.children && node.children.length > 0) {
            node.children.forEach((child: any, index: number) => {
              const isLast = index === node.children.length - 1;
              const childIndent = indent + (isLast ? '└── ' : '├── ');
              const nextIndent = indent + (isLast ? '    ' : '│   ');
              output += formatTree(child, childIndent).replace(childIndent, nextIndent);
            });
          }
          
          return output;
        }

        const tree = data.files || data.data;
        return `Repository structure:\n\n${formatTree(tree)}`;
      }

      case "check_files_exist": {
        const { data, error } = await supabase.functions.invoke('github-ops', {
          body: {
            action: 'check_files_exist',
            paths: toolInput.paths,
            branch: 'main'
          }
        });

        if (error) {
          console.error('Error checking files:', error);
          return `Error checking files: ${error.message}`;
        }

        if (data.error) {
          return `Error: ${data.error}`;
        }

        const results = data.files || data.data;
        let output = 'File existence check:\n\n';
        
        for (const [path, exists] of Object.entries(results)) {
          output += `${exists ? '✅' : '❌'} ${path}\n`;
        }
        
        return output;
      }

      default:
        return `Unknown tool: ${toolName}`;
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return `Error executing ${toolName}: ${message}`;
  }
}

async function orchestrate(userMessage: string, supabase: any): Promise<string> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const messages: any[] = [
    {
      role: 'user',
      content: userMessage
    }
  ];

  let continueLoop = true;
  let finalResponse = '';
  let iterationCount = 0;
  const MAX_ITERATIONS = 10;

  console.log('Starting orchestration loop...');

  while (continueLoop && iterationCount < MAX_ITERATIONS) {
    iterationCount++;
    console.log(`🔄 Orchestration iteration: ${iterationCount}/${MAX_ITERATIONS}`);
    console.log('Calling Anthropic API...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8192,
        system: [
          {
            type: "text",
            text: `You are an AI assistant with access to a GitHub workspace at https://github.com/teststrateaios-beep/freedom-workspace

AVAILABLE TOOLS:
- get_repo_structure: Get tree view of repository (ALWAYS USE FIRST for new projects/major changes)
- check_files_exist: Check if files exist without reading them (efficient batch checking)
- list_files: List directory contents
- read_file: Read file contents (supports line ranges like '1-50, 100-150')
- write_file: Create or update entire files
- update_file_lines: Surgically edit specific lines (MORE EFFICIENT for small changes)
- search_files: Search regex patterns across files
- delete_file: Remove files

CRITICAL INTELLIGENCE RULES:
1. ALWAYS START WITH CONTEXT: Use get_repo_structure FIRST to see what exists before making changes
2. CHECK BEFORE CREATE: Use check_files_exist to verify files before deciding to create or update
3. SEARCH BEFORE EDIT: Use search_files to understand existing code structure before modifications
4. SURGICAL EDITS: For small changes, ALWAYS use update_file_lines instead of rewriting entire files
5. EFFICIENT READING: Use line ranges with read_file for large files (e.g., lines: '1-50')
6. PARALLEL OPERATIONS: Create multiple files simultaneously using multiple write_file calls in ONE turn
7. NO VERIFICATION: Never read files after creation/modification - trust they were created correctly
8. ASK WHEN AMBIGUOUS: If files exist partially, ask user whether to update or create new

WORKFLOW FOR NEW PROJECTS (User: "Create React project"):
1. get_repo_structure({ max_depth: 2 }) → See what already exists
2. If empty: Call write_file 10-15 times IN PARALLEL to create all files
3. If partial: "I see you have [X] files. Should I update them or create alongside?"
✅ Contextual awareness prevents overwrites

WORKFLOW FOR INCREMENTAL DEVELOPMENT (User: "Add a login button"):
1. search_files({ query: "function App", file_extension: ".tsx" }) → Find App.tsx
2. read_file({ path: "src/App.tsx", lines: "1-50" }) → See first 50 lines
3. update_file_lines({ path: "src/App.tsx", start_line: 25, end_line: 25, new_content: "  <button>Login</button>", message: "Add login button" })
✅ Done in 3 efficient steps, minimal tokens

WORKFLOW FOR REFACTORING (User: "Add TypeScript types to useState"):
1. search_files({ query: "useState\\(", file_extension: ".tsx" }) → Find all files
2. For each file: read_file with line ranges → update_file_lines for specific changes
✅ Precise surgical edits, no file rewrites

WORKFLOW FOR FEATURE ADDITIONS (User: "Add user authentication"):
1. get_repo_structure({ max_depth: 3 }) → See project structure
2. check_files_exist({ paths: ["src/auth/", "src/components/Login.tsx"] }) → Check what exists
3. Based on results: Create new files or update existing ones with appropriate tool
✅ Smart decision-making based on context

Your goal: Maximum precision, minimum waste, contextual awareness, intelligent decision-making. ALWAYS see what exists BEFORE acting.`,
            cache_control: { type: "ephemeral" }
          }
        ],
        messages,
        tools
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Anthropic response:', JSON.stringify(data, null, 2));
    
    // Log response statistics for debugging
    const usage = data.usage || {};
    const inputTokens = usage.input_tokens || 0;
    const outputTokens = usage.output_tokens || 0;
    const cachedTokens = usage.cache_read_input_tokens || 0;
    const cacheCreationTokens = usage.cache_creation_input_tokens || 0;
    
    // Calculate cost (claude-sonnet-4-5 pricing)
    const inputCost = (inputTokens / 1_000_000) * 3.0;
    const outputCost = (outputTokens / 1_000_000) * 15.0;
    const cachedCost = (cachedTokens / 1_000_000) * 0.3; // 90% cheaper
    const cacheCreationCost = (cacheCreationTokens / 1_000_000) * 3.75; // 25% more expensive
    const totalCost = inputCost + outputCost + cachedCost + cacheCreationCost;
    
    // Calculate efficiency
    const totalInputTokens = inputTokens + cachedTokens + cacheCreationTokens;
    const cacheEfficiency = totalInputTokens > 0 ? ((cachedTokens / totalInputTokens) * 100).toFixed(1) : '0.0';
    
    console.log(`\n💰 Token Usage (Iteration ${iterationCount}):`);
    console.log(`├─ Input tokens: ${inputTokens.toLocaleString()}`);
    console.log(`├─ Output tokens: ${outputTokens.toLocaleString()}`);
    console.log(`├─ 🚀 Cached tokens: ${cachedTokens.toLocaleString()} (saved 90% cost!)`);
    console.log(`├─ Cache creation: ${cacheCreationTokens.toLocaleString()}`);
    console.log(`├─ Cache efficiency: ${cacheEfficiency}%`);
    console.log(`└─ Cost: $${totalCost.toFixed(4)}`);
    
    console.log(`\n📊 Response stats:`, {
      stop_reason: data.stop_reason,
      content_blocks: data.content.length,
      tool_uses: data.content.filter((c: any) => c.type === 'tool_use').length,
      text_blocks: data.content.filter((c: any) => c.type === 'text').length
    });

    if (data.stop_reason === 'end_turn') {
      // Claude has finished and provided a final text response
      const textContent = data.content.find((c: any) => c.type === 'text');
      if (textContent) {
        finalResponse = textContent.text;
      }
      continueLoop = false;
    } else if (data.stop_reason === 'tool_use') {
      // Claude wants to use tools
      const assistantMessage = {
        role: 'assistant',
        content: data.content
      };
      messages.push(assistantMessage);

      // Execute all tool calls
      const toolResults: any[] = [];
      for (const content of data.content) {
        if (content.type === 'tool_use') {
          console.log(`Executing tool: ${content.name}`);
          const result = await executeToolCall(content.name, content.input, supabase);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: content.id,
            content: result
          });
        }
      }

      // Add tool results to conversation
      messages.push({
        role: 'user',
        content: toolResults
      });
    } else if (data.stop_reason === 'max_tokens') {
      // Claude reached token limit - check if there are pending tool_use blocks
      console.log('⚠️ Reached max_tokens, checking for pending tool calls...');
      
      const toolUseBlocks = data.content.filter((c: any) => c.type === 'tool_use');
      
      if (toolUseBlocks.length > 0) {
        // There are tool_use blocks that need tool_results before continuing
        console.log(`📦 Found ${toolUseBlocks.length} pending tool calls, executing them...`);
        
        const assistantMessage = {
          role: 'assistant',
          content: data.content
        };
        messages.push(assistantMessage);

        // Execute all tool calls
        const toolResults: any[] = [];
        for (const content of toolUseBlocks) {
          console.log(`Executing tool: ${content.name}`);
          const result = await executeToolCall(content.name, content.input, supabase);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: content.id,
            content: result
          });
        }

        // Add tool results to conversation
        messages.push({
          role: 'user',
          content: toolResults
        });
        
        continueLoop = true;
      } else {
        // No tool_use blocks, just text that got cut off
        const assistantMessage = {
          role: 'assistant',
          content: data.content
        };
        messages.push(assistantMessage);
        
        // Ask Claude to continue where it left off
        messages.push({
          role: 'user',
          content: 'Please continue where you left off.'
        });
        
        continueLoop = true;
      }
    } else {
      // Unexpected stop reason
      console.error('Unexpected stop_reason:', data.stop_reason);
      finalResponse = 'I encountered an unexpected response format. Please try again.';
      continueLoop = false;
    }
  }

  // Check if we hit max iterations
  if (iterationCount >= MAX_ITERATIONS) {
    console.warn('⚠️ Reached maximum iterations');
    finalResponse += '\n\nNote: Operation completed but may be incomplete due to complexity. You may need to continue manually.';
  }

  return finalResponse;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received message:', message);

    // Initialize Supabase client for calling github-ops
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const response = await orchestrate(message, supabase);

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-orchestrator:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
