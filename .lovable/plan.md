
# Technical Reference Guide: Complete Tool Architecture for Autonomous System

This document will be created as `memoria/TOOL_CONSTRUCTION_GUIDE.md` -- a comprehensive, self-contained reference that documents every tool, its implementation pattern, dependencies, and API contracts. It serves as a blueprint for reconstructing the complete toolset in any environment.

---

## Document Structure

### 1. Architecture Overview
- Orchestrator pattern (Express + Anthropic SDK agentic loop)
- Tool registration system (array of Anthropic tool definitions + dispatcher switch)
- Dependencies map (npm packages per category)
- Environment variables required

### 2. Category 1: File Operations (5 tools)
**Tools**: `read_file`, `write_file`, `search_files`, `list_directory`, `line_replace`
- **Dependencies**: Node.js built-ins (`fs`, `path`) + `glob`
- **Security pattern**: `validatePath()` function that resolves paths and checks they stay within PROJECT_ROOT
- **Implementation details**: Each tool receives typed input, returns string result
- **Schema definitions**: Complete `input_schema` objects for Anthropic tool registration

### 3. Category 2: Code Execution (1 tool)
**Tool**: `execute_command`
- **Dependencies**: Node.js `child_process.execSync`
- **Security**: Whitelist of allowed commands (node, npm, git, ls, cat, grep, find, echo, pwd), blacklist of dangerous patterns (rm -rf, sudo, fork bombs)
- **Timeout**: 30 seconds, 10MB buffer

### 4. Category 3: Web Access (2 tools)
**Tools**: `web_search`, `web_code_search`
- **Dependencies**: SerpAPI (web search), GitHub API (code search)
- **API Keys**: `SERPAPI_KEY`, `GITHUB_TOKEN`
- **Endpoints**: SerpAPI REST, GitHub Search Code API v2022-11-28

### 5. Category 4: Database (3 tools)
**Tools**: `execute_query`, `list_tables`, `describe_table`
- **Dependencies**: `@supabase/supabase-js`
- **Security**: Only SELECT queries allowed, dangerous pattern blocking
- **API Keys**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **RPC function needed**: `execute_readonly_sql` (must be created in PostgreSQL)

### 6. Category 5: Memory (3 tools)
**Tools**: `save_memory`, `search_memory`, `list_memories`
- **Dependencies**: `@supabase/supabase-js`, `openai` (for embeddings)
- **API Keys**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`
- **Database requirements**: `memories` table with pgvector column, `match_memories` RPC function
- **Embedding model**: `text-embedding-3-small`

### 7. Category 6: Debugging (10 tools)
**Tools**: `start_debug_session`, `read_console_logs`, `read_network_requests`, `take_screenshot`, `evaluate_in_page`, `click_element`, `type_text`, `navigate_to`, `stop_debug_session`, `start_dev_server_with_debug`
- **Dependencies**: `puppeteer` (or `playwright`)
- **Architecture**: Singleton session pattern with accumulated logs/requests arrays
- **Key feature**: Real browser automation replacing non-functional platform tools

### 8. Category 7: AI and Media (6 tools)
**Tools**: `generate_image`, `analyze_image`, `transcribe_audio`, `text_to_speech`, `ai_chat`, `generate_embeddings`
- **Dependencies**: `openai`
- **API Key**: `OPENAI_API_KEY`
- **Models used**: DALL-E 3, GPT-4o (vision), Whisper, TTS-1-HD, text-embedding-3-small

### 9. Category 8: Document Parsing (5 tools)
**Tools**: `parse_pdf`, `parse_docx`, `parse_excel`, `parse_csv`, `parse_document`
- **Dependencies**: `pdf-parse`, `mammoth`, `xlsx`
- **Key pattern**: `parse_document` auto-detects file type by extension

### 10. Category 9: Task Tracking (8 tools)
**Tools**: `create_task`, `update_task_title`, `update_task_description`, `set_task_status`, `get_task`, `get_task_list`, `add_task_note`, `clear_tasks`
- **Dependencies**: None (in-memory Map)
- **Key constraint**: Only one task can be `in_progress` at a time
- **Storage**: Session-scoped (in-memory), not persistent

### 11. Category 10: Secrets Manager (6 tools)
**Tools**: `list_secrets`, `get_secret`, `set_secret`, `delete_secret`, `load_all_secrets`, `check_required_secrets`
- **Dependencies**: Node.js `crypto` (AES-256-GCM)
- **Storage**: Encrypted file `.secrets.enc`
- **Key**: `SECRETS_ENCRYPTION_KEY` env var

### 12. Orchestrator Core
- Express server setup with CORS, JSON body parsing
- Anthropic API call pattern with system prompt + prompt caching
- Agentic loop: send message, check stop_reason, execute tools, feed results back
- Cost tracking per iteration (input/output/cache tokens)
- Max iterations safety limit (20)
- Winston logging with file + console transports

### 13. Tool Registration Pattern
```text
For each tool category:
1. Export individual functions (async for I/O, sync for in-memory)
2. Export tool definitions array (Anthropic input_schema format)
3. In index.ts: import all, spread into combined tools array
4. In index.ts: add cases to executeToolCall switch dispatcher
5. Export TOOL_COUNT and TOOL_CATEGORIES for system prompt
```

### 14. Required SQL Setup
- pgvector extension
- `memories` table with vector column
- `match_memories` RPC function for similarity search
- `execute_readonly_sql` RPC function for database tool

### 15. Complete package.json Dependencies
All npm packages needed with versions, organized by which tools require them.

### 16. Environment Variables Checklist
Complete list of all env vars across all tools:
- `ANTHROPIC_API_KEY` (orchestrator)
- `OPENAI_API_KEY` (memory, AI media)
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (database, memory)
- `SERPAPI_KEY` (web search)
- `GITHUB_TOKEN` (code search)
- `SECRETS_ENCRYPTION_KEY` (secrets manager)
- `PROJECT_ROOT` (file operations)
- `PORT` (server)
- `MAX_TOKENS` (orchestrator)
- `DEBUG` (logging)

---

## Technical Details

### File to create
`memoria/TOOL_CONSTRUCTION_GUIDE.md` -- approximately 800-1000 lines of comprehensive documentation including complete code patterns for every tool, ready to be used as a reconstruction blueprint.

### Why this approach
- Single file, no external dependencies to read
- Contains enough implementation detail to reconstruct each tool from scratch
- Includes the Anthropic tool registration format so schemas are exact
- Documents the orchestrator loop pattern which is the core architecture
- Lists all SQL needed for database setup
