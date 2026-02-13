# 🔧 Claude Libre - Tool Documentation

Complete documentation for all 51 tools in Claude Libre.

## 📋 Table of Contents

- [File System Operations (9 tools)](#file-system-operations)
- [Code Execution (3 tools)](#code-execution)
- [Web Access (4 tools)](#web-access)
- [Database Operations (5 tools)](#database-operations)
- [Memory System (4 tools)](#memory-system)
- [Document Processing (5 tools)](#document-processing)
- [Communication (4 tools)](#communication)
- [Image & Media (4 tools)](#image--media)
- [Debugging & Monitoring (6 tools)](#debugging--monitoring)
- [Security & Secrets (4 tools)](#security--secrets)
- [Package Management (3 tools)](#package-management)

---

## File System Operations

### 1. read_file ✅ IMPLEMENTED

**Status**: Tier 0 - Implemented

**Description**: Read the contents of a file with optional line range selection.

**Parameters**:
```typescript
{
  path: string;        // File path relative to project root
  lines?: string;      // Optional line ranges (e.g., "1-50, 100-150")
}
```

**Examples**:
```typescript
// Read entire file
read_file({ path: "src/app.ts" })

// Read specific lines
read_file({ path: "README.md", lines: "1-20" })

// Read multiple ranges
read_file({ path: "config.json", lines: "1-10, 50-60" })
```

**Security**: Path validation ensures access only to PROJECT_ROOT directory.

---

### 2. write_file ✅ IMPLEMENTED

**Status**: Tier 0 - Implemented

**Description**: Write content to a file. Creates parent directories if needed.

**Parameters**:
```typescript
{
  path: string;        // File path relative to project root
  content: string;     // Content to write
}
```

**Examples**:
```typescript
write_file({
  path: "src/hello.ts",
  content: "console.log('Hello World');"
})
```

**Security**: Path validation + directory creation with recursive option.

---

### 3. search_files ✅ IMPLEMENTED

**Status**: Tier 0 - Implemented

**Description**: Search for text patterns using regex across multiple files.

**Parameters**:
```typescript
{
  query: string;              // Regex pattern
  include_pattern: string;    // Glob pattern (e.g., "**/*.ts")
  exclude_pattern?: string;   // Optional exclusion pattern
  case_sensitive?: boolean;   // Default: false
}
```

**Examples**:
```typescript
// Find all TODO comments in TypeScript files
search_files({
  query: "TODO:",
  include_pattern: "**/*.ts"
})

// Case-sensitive search
search_files({
  query: "UserAuth",
  include_pattern: "src/**/*.ts",
  case_sensitive: true
})
```

---

### 4. list_directory ✅ IMPLEMENTED

**Status**: Tier 0 - Implemented

**Description**: List all files and directories in a path with metadata.

**Parameters**:
```typescript
{
  path: string;  // Directory path relative to project root
}
```

**Returns**: JSON array with:
- `name`: File/directory name
- `type`: "file" or "directory"
- `size`: Size in bytes
- `modified`: ISO timestamp

---

### 5. line_replace ✅ IMPLEMENTED

**Status**: Tier 0 - Implemented

**Description**: Replace specific lines in a file with new content.

**Parameters**:
```typescript
{
  file_path: string;
  search: string;              // For validation
  first_replaced_line: number; // 1-indexed
  last_replaced_line: number;  // 1-indexed
  replace: string;             // New content
}
```

---

### 6-9. delete_file, rename_file, copy_file, download_file

**Status**: Tier 1 - Not yet implemented

See [roadmap](../README.md#roadmap) for implementation timeline.

---

## Code Execution

### 10. execute_command ✅ IMPLEMENTED

**Status**: Tier 0 - Implemented

**Description**: Execute shell commands in the workspace with security restrictions.

**Parameters**:
```typescript
{
  command: string;  // Shell command to execute
  cwd?: string;     // Optional working directory
}
```

**Whitelist** (allowed commands):
- `node`, `npm`, `npx`
- `git`
- `ls`, `cat`, `grep`, `find`
- `echo`, `pwd`, `whoami`, `date`

**Blacklist** (blocked patterns):
- `rm -rf`
- `sudo`
- `chmod`, `chown`
- Fork bombs, dangerous operations

**Examples**:
```typescript
// Install package
execute_command({ command: "npm install express" })

// Git status
execute_command({ command: "git status" })

// List files
execute_command({ command: "ls -la" })
```

**Security**:
- ✅ Command whitelist
- ✅ Dangerous pattern blocking
- ✅ 30-second timeout
- ✅ 10MB output limit

---

### 11-12. execute_code, run_tests

**Status**: Tier 1 - Not yet implemented

---

## Web Access

### 13. web_search ✅ IMPLEMENTED

**Status**: Tier 0 - Implemented (requires SERPAPI_KEY)

**Description**: Search the web using Google Search via SerpAPI.

**Requirements**: `SERPAPI_KEY` in `.env` ([get key](https://serpapi.com/))

**Parameters**:
```typescript
{
  query: string;
  num_results?: number;  // Default: 5, Max: 10
}
```

**Examples**:
```typescript
web_search({ 
  query: "Claude AI latest features 2024",
  num_results: 5
})
```

**Cost**: Free tier includes 100 searches/month

---

### 14. web_code_search ✅ IMPLEMENTED

**Status**: Tier 0 - Implemented (requires GITHUB_TOKEN)

**Description**: Search for code on GitHub repositories.

**Requirements**: `GITHUB_TOKEN` in `.env` ([get token](https://github.com/settings/tokens))

**Parameters**:
```typescript
{
  query: string;
  language?: string;     // e.g., "typescript", "python"
  num_results?: number;  // Default: 5
}
```

**Examples**:
```typescript
// Find React hooks examples
web_code_search({
  query: "react useEffect cleanup",
  language: "typescript"
})

// Find Python async examples
web_code_search({
  query: "python asyncio error handling",
  language: "python"
})
```

**Cost**: Free with GitHub account

---

### 15-16. fetch_url, browser_automation

**Status**: Tier 1 - Not yet implemented

---

## Database Operations

### 17. execute_query ✅ IMPLEMENTED

**Status**: Tier 0 - Implemented (requires Supabase)

**Description**: Execute SELECT queries on PostgreSQL database.

**Requirements**: 
- `SUPABASE_URL` in `.env`
- `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- `execute_readonly_sql` function in database (see [setup-pgvector.sql](../sql/setup-pgvector.sql))

**Parameters**:
```typescript
{
  query: string;  // Only SELECT queries allowed
}
```

**Security**:
- ✅ Only SELECT queries
- ✅ Blocks: DROP, DELETE, ALTER, TRUNCATE
- ✅ Read-only access

**Examples**:
```typescript
execute_query({
  query: "SELECT * FROM users LIMIT 10"
})

execute_query({
  query: "SELECT COUNT(*) as total FROM conversations WHERE created_at > '2024-01-01'"
})
```

---

### 18. list_tables ✅ IMPLEMENTED

**Description**: List all tables in the database.

**Example**:
```typescript
list_tables({})
```

---

### 19. describe_table ✅ IMPLEMENTED

**Description**: Get the schema/structure of a specific table.

**Parameters**:
```typescript
{
  table_name: string;
}
```

**Example**:
```typescript
describe_table({ table_name: "users" })
```

---

### 20-21. backup_database, get_table_count

**Status**: Tier 1 - Not yet implemented

---

## Memory System

The memory system uses semantic search with PostgreSQL + pgvector + OpenAI embeddings.

### Setup Required

1. Enable `pgvector` extension in Supabase
2. Run [setup-pgvector.sql](../sql/setup-pgvector.sql)
3. Configure `OPENAI_API_KEY` in `.env`

### 22. save_memory ✅ IMPLEMENTED

**Status**: Tier 0 - Implemented

**Description**: Save information to long-term memory with semantic search.

**Parameters**:
```typescript
{
  content: string;
  title?: string;
  metadata?: object;
}
```

**Examples**:
```typescript
save_memory({
  content: "The user prefers TypeScript over JavaScript for all projects",
  title: "User Preferences - Programming Languages"
})

save_memory({
  content: "Project deadline is March 15, 2024",
  metadata: { category: "deadlines", priority: "high" }
})
```

**Cost**: ~$0.0001 per memory (OpenAI embeddings)

---

### 23. search_memory ✅ IMPLEMENTED

**Status**: Tier 0 - Implemented

**Description**: Search memories using semantic similarity.

**Parameters**:
```typescript
{
  query: string;
  limit?: number;  // Default: 5
}
```

**Examples**:
```typescript
search_memory({
  query: "What programming languages does the user prefer?"
})

search_memory({
  query: "project deadlines",
  limit: 10
})
```

**Features**:
- ✅ Semantic search (finds related concepts)
- ✅ Similarity score for each result
- ✅ Fast with pgvector HNSW index

---

### 24. list_memories ✅ IMPLEMENTED

**Description**: List recent memories in chronological order.

**Parameters**:
```typescript
{
  limit?: number;  // Default: 10
}
```

---

### 25. delete_memory

**Status**: Tier 1 - Not yet implemented

---

## Document Processing

**Status**: Tier 1 - Not yet implemented

Tools 26-30: parse_pdf, parse_docx, parse_excel, parse_image, parse_markdown

---

## Communication

**Status**: Tier 1/2 - Not yet implemented

Tools 31-34: send_email, send_webhook, make_http_request, websocket_connection

---

## Image & Media

**Status**: Tier 2 - Not yet implemented

Tools 35-38: generate_image, analyze_image, edit_image, convert_image

---

## Debugging & Monitoring

**Status**: Tier 1/2 - Not yet implemented

Tools 39-44: read_console_logs, read_network_requests, track_performance, monitor_errors, log_event, get_metrics

---

## Security & Secrets

**Status**: Tier 1 - Not yet implemented

Tools 45-48: fetch_secrets, add_secret, update_secret, delete_secret

---

## Package Management

**Status**: Tier 1 - Not yet implemented

Tools 49-51: install_package, remove_package, list_packages

---

## 📊 Implementation Status

**Total Tools**: 51
**Implemented**: 14 (27%)
**Autonomy Level**: 45%

### By Tier

- **Tier 0 (Critical)**: 14/14 ✅ COMPLETE
- **Tier 1 (Important)**: 0/20 🚧 In Progress
- **Tier 2 (Nice-to-Have)**: 0/17 📋 Planned

### Roadmap

See [README.md](../README.md#roadmap) for implementation timeline.

---

## 🔧 Adding New Tools

To add a new tool:

1. Create implementation in `src/tools/your-category.ts`
2. Add tool definition with proper schema
3. Register in `src/tools/index.ts`
4. Update this documentation
5. Add tests

Example tool definition:
```typescript
export const yourTools = [{
  name: 'your_tool_name',
  description: 'Clear description of what it does',
  input_schema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Parameter description'
      }
    },
    required: ['param1']
  }
}];
```

---

**For more help, see [README.md](../README.md) or [CLAUDE_LIBRE_DESDE_CERO.md](../../memoria/CLAUDE_LIBRE_DESDE_CERO.md)**
