# 🔧 Technical Reference Guide: Complete Tool Architecture for Autonomous System

> **Purpose**: Self-contained blueprint to reconstruct the complete 49-tool autonomous AI system from scratch.
> **Last Updated**: 2026-02-12
> **Version**: 1.0

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [File Operations (5 tools)](#2-file-operations)
3. [Code Execution (1 tool)](#3-code-execution)
4. [Web Access (2 tools)](#4-web-access)
5. [Database (3 tools)](#5-database)
6. [Memory (3 tools)](#6-memory)
7. [Debugging (10 tools)](#7-debugging)
8. [AI & Media (6 tools)](#8-ai--media)
9. [Document Parsing (5 tools)](#9-document-parsing)
10. [Task Tracking (8 tools)](#10-task-tracking)
11. [Secrets Manager (6 tools)](#11-secrets-manager)
12. [Orchestrator Core](#12-orchestrator-core)
13. [Tool Registration Pattern](#13-tool-registration-pattern)
14. [SQL Database Setup](#14-sql-database-setup)
15. [Dependencies](#15-complete-dependencies)
16. [Environment Variables](#16-environment-variables-checklist)

---

## 1. Architecture Overview

### Pattern: Express + Anthropic SDK Agentic Loop

```
User Message → Express /api/chat → orchestrate()
  → Claude API call (with system prompt + prompt caching)
  → Check stop_reason:
    - "end_turn" → return text response
    - "tool_use" → execute tools → feed results back → loop
    - "max_tokens" → handle truncation
  → Safety: max 20 iterations
```

### Key Design Decisions

- **Single process**: Express server handles HTTP + orchestration + tool execution
- **Prompt caching**: System prompt uses `cache_control: { type: 'ephemeral' }` for 90% cost savings on repeated calls
- **Singleton clients**: Supabase and OpenAI clients initialized once per process
- **Security layers**: Path validation, command whitelisting, SQL read-only enforcement
- **Logging**: Winston with console (colorized) + file transports
- **Tool registration**: Array of Anthropic tool definitions + switch dispatcher

### Project Structure

```
claude-libre-foundation/
├── src/
│   ├── orchestrator.ts          # Main server + agentic loop
│   └── tools/
│       ├── index.ts             # Combines all tools + dispatcher
│       ├── file-operations.ts   # 5 tools
│       ├── code-execution.ts    # 1 tool
│       ├── web-access.ts        # 2 tools
│       ├── database.ts          # 3 tools
│       ├── memory.ts            # 3 tools
│       ├── debugging.ts         # 10 tools
│       ├── ai-media.ts          # 6 tools
│       ├── document-parser.ts   # 5 tools
│       ├── task-tracking.ts     # 8 tools
│       └── secrets-manager.ts   # 6 tools
├── sql/
│   └── setup-pgvector.sql       # Database initialization
├── .env                         # Environment variables
├── package.json
└── tsconfig.json
```

---

## 2. File Operations

**Tools**: `read_file`, `write_file`, `search_files`, `list_directory`, `line_replace`
**Dependencies**: Node.js built-ins (`fs`, `path`) + `glob`
**Security**: `validatePath()` ensures all paths resolve within `PROJECT_ROOT`

### Security Function

```typescript
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { glob } from 'glob';

const PROJECT_ROOT = process.env.PROJECT_ROOT || './workspace';

function validatePath(path: string): string {
  const fullPath = resolve(join(PROJECT_ROOT, path));
  const rootPath = resolve(PROJECT_ROOT);
  if (!fullPath.startsWith(rootPath)) {
    throw new Error(`Access denied: path outside project root`);
  }
  return fullPath;
}
```

### Tool 1: `read_file`

```typescript
export function readFile(input: { path: string; lines?: string }): string {
  const fullPath = validatePath(input.path);
  const content = readFileSync(fullPath, 'utf-8');
  
  if (!input.lines) return content;
  
  // Parse line ranges (e.g., "1-10, 20-30")
  const lines = content.split('\n');
  const ranges = input.lines.split(',').map(r => {
    const [start, end] = r.trim().split('-').map(n => parseInt(n.trim()));
    return lines.slice(start - 1, end);
  });
  return ranges.flat().join('\n');
}
```

**Schema**:
```json
{
  "name": "read_file",
  "description": "Read the contents of a file. Optionally specify line ranges.",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "Path to the file relative to project root" },
      "lines": { "type": "string", "description": "Optional line ranges (e.g., '1-50, 100-150')" }
    },
    "required": ["path"]
  }
}
```

### Tool 2: `write_file`

```typescript
export function writeFile(input: { path: string; content: string }): string {
  const fullPath = validatePath(input.path);
  const dir = dirname(fullPath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(fullPath, input.content, 'utf-8');
  return `✅ Successfully wrote ${input.content.length} bytes to ${input.path}`;
}
```

**Schema**:
```json
{
  "name": "write_file",
  "description": "Write content to a file. Creates file and parent directories if needed.",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "Path to the file relative to project root" },
      "content": { "type": "string", "description": "Content to write" }
    },
    "required": ["path", "content"]
  }
}
```

### Tool 3: `search_files`

```typescript
export function searchFiles(input: { 
  query: string; include_pattern: string; 
  exclude_pattern?: string; case_sensitive?: boolean;
}): string {
  const pattern = join(PROJECT_ROOT, input.include_pattern);
  const files = glob.sync(pattern, {
    ignore: input.exclude_pattern ? join(PROJECT_ROOT, input.exclude_pattern) : undefined
  });
  
  const flags = input.case_sensitive ? 'g' : 'gi';
  const regex = new RegExp(input.query, flags);
  const results: Array<{ file: string; line: number; content: string }> = [];
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      content.split('\n').forEach((line, idx) => {
        if (regex.test(line)) {
          results.push({ file: file.replace(PROJECT_ROOT + '/', ''), line: idx + 1, content: line.trim() });
        }
      });
    } catch { continue; }
  }
  
  return results.length === 0 
    ? `No matches found for "${input.query}"` 
    : JSON.stringify(results, null, 2);
}
```

**Schema**:
```json
{
  "name": "search_files",
  "description": "Search for text patterns using regex across multiple files.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Regex pattern to search for" },
      "include_pattern": { "type": "string", "description": "Glob pattern for files (e.g., '**/*.ts')" },
      "exclude_pattern": { "type": "string", "description": "Optional glob to exclude" },
      "case_sensitive": { "type": "boolean", "description": "Case sensitive (default: false)" }
    },
    "required": ["query", "include_pattern"]
  }
}
```

### Tool 4: `list_directory`

```typescript
export function listDirectory(input: { path: string }): string {
  const fullPath = validatePath(input.path);
  const entries = readdirSync(fullPath);
  const items = entries.map(entry => {
    const stats = statSync(join(fullPath, entry));
    return { name: entry, type: stats.isDirectory() ? 'directory' : 'file', size: stats.size, modified: stats.mtime.toISOString() };
  });
  return JSON.stringify(items, null, 2);
}
```

**Schema**:
```json
{
  "name": "list_directory",
  "description": "List all files and directories in a given path.",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "Path to the directory" }
    },
    "required": ["path"]
  }
}
```

### Tool 5: `line_replace`

```typescript
export function lineReplace(input: {
  file_path: string; search: string;
  first_replaced_line: number; last_replaced_line: number; replace: string;
}): string {
  const fullPath = validatePath(input.file_path);
  const content = readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');
  
  if (input.first_replaced_line < 1 || input.last_replaced_line > lines.length) {
    throw new Error(`Invalid line range: ${input.first_replaced_line}-${input.last_replaced_line}`);
  }
  
  const before = lines.slice(0, input.first_replaced_line - 1);
  const after = lines.slice(input.last_replaced_line);
  writeFileSync(fullPath, [...before, input.replace, ...after].join('\n'), 'utf-8');
  return `✅ Replaced lines ${input.first_replaced_line}-${input.last_replaced_line} in ${input.file_path}`;
}
```

**Schema**:
```json
{
  "name": "line_replace",
  "description": "Replace specific lines in a file with new content.",
  "input_schema": {
    "type": "object",
    "properties": {
      "file_path": { "type": "string" },
      "search": { "type": "string", "description": "Content to search for (validation)" },
      "first_replaced_line": { "type": "number", "description": "First line (1-indexed)" },
      "last_replaced_line": { "type": "number", "description": "Last line (1-indexed)" },
      "replace": { "type": "string", "description": "New content" }
    },
    "required": ["file_path", "search", "first_replaced_line", "last_replaced_line", "replace"]
  }
}
```

---

## 3. Code Execution

**Tool**: `execute_command`
**Dependencies**: Node.js `child_process.execSync`
**Security**: Command whitelist + dangerous pattern blacklist

```typescript
import { execSync } from 'child_process';
import { resolve } from 'path';

const PROJECT_ROOT = process.env.PROJECT_ROOT || './workspace';
const TIMEOUT = 30000;

const ALLOWED_COMMANDS = ['node', 'npm', 'npx', 'git', 'ls', 'cat', 'grep', 'find', 'echo', 'pwd', 'whoami', 'date'];

const DANGEROUS_PATTERNS = [
  'rm -rf', 'sudo', 'chmod', 'chown', ':(){:|:&};:', '>()',
  'mkfs', 'dd if=', '/dev/sda', 'curl.*|.*sh', 'wget.*|.*sh'
];

export function executeCommand(input: { command: string; cwd?: string }): string {
  const baseCommand = input.command.trim().split(' ')[0];
  
  if (!ALLOWED_COMMANDS.includes(baseCommand)) {
    throw new Error(`Command "${baseCommand}" not in whitelist. Allowed: ${ALLOWED_COMMANDS.join(', ')}`);
  }
  
  for (const pattern of DANGEROUS_PATTERNS) {
    if (input.command.includes(pattern) || new RegExp(pattern).test(input.command)) {
      throw new Error(`Dangerous pattern detected: ${pattern}`);
    }
  }
  
  const cwd = input.cwd ? resolve(PROJECT_ROOT, input.cwd) : resolve(PROJECT_ROOT);
  
  const result = execSync(input.command, {
    cwd, timeout: TIMEOUT, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024
  });
  
  return result.toString().trim();
}
```

**Schema**:
```json
{
  "name": "execute_command",
  "description": "Execute a shell command. Whitelisted: node, npm, npx, git, ls, cat, grep, find, echo, pwd. 30s timeout.",
  "input_schema": {
    "type": "object",
    "properties": {
      "command": { "type": "string", "description": "Shell command to execute" },
      "cwd": { "type": "string", "description": "Optional working directory relative to project root" }
    },
    "required": ["command"]
  }
}
```

---

## 4. Web Access

**Tools**: `web_search`, `web_code_search`
**Dependencies**: SerpAPI (REST), GitHub API (REST)
**API Keys**: `SERPAPI_KEY`, `GITHUB_TOKEN`

### Tool 1: `web_search`

```typescript
export async function webSearch(input: { query: string; num_results?: number }): Promise<string> {
  const SERPAPI_KEY = process.env.SERPAPI_KEY;
  if (!SERPAPI_KEY || SERPAPI_KEY === 'your-serpapi-key-here') {
    throw new Error('SERPAPI_KEY not configured. Get one at https://serpapi.com/');
  }
  
  const numResults = input.num_results || 5;
  const url = `https://serpapi.com/search?q=${encodeURIComponent(input.query)}&api_key=${SERPAPI_KEY}&num=${numResults}`;
  const response = await fetch(url);
  
  if (!response.ok) throw new Error(`SerpAPI error: ${response.status}`);
  
  const data = await response.json();
  if (!data.organic_results?.length) return `No results found for: ${input.query}`;
  
  return data.organic_results.slice(0, numResults).map((r: any, i: number) =>
    `${i + 1}. ${r.title}\n   ${r.link}\n   ${r.snippet || 'No description'}`
  ).join('\n\n');
}
```

**Schema**:
```json
{
  "name": "web_search",
  "description": "Search the web using Google Search via SerpAPI.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Search query" },
      "num_results": { "type": "number", "description": "Results to return (default: 5, max: 10)" }
    },
    "required": ["query"]
  }
}
```

### Tool 2: `web_code_search`

```typescript
export async function webCodeSearch(input: { 
  query: string; language?: string; num_results?: number;
}): Promise<string> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not configured');
  
  let searchQuery = input.query;
  if (input.language) searchQuery += `+language:${input.language}`;
  
  const url = `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=${input.num_results || 5}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  
  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
  
  const data = await response.json();
  if (!data.items?.length) return `No code results found for: ${input.query}`;
  
  const results = data.items.map((item: any, i: number) =>
    `${i + 1}. ${item.repository.full_name}/${item.path}\n   ${item.html_url}`
  );
  
  return `Found ${data.total_count} results (showing ${results.length}):\n\n${results.join('\n\n')}`;
}
```

**Schema**:
```json
{
  "name": "web_code_search",
  "description": "Search for code on GitHub.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Code search query" },
      "language": { "type": "string", "description": "Language filter (e.g., 'typescript')" },
      "num_results": { "type": "number", "description": "Results to return (default: 5)" }
    },
    "required": ["query"]
  }
}
```

---

## 5. Database

**Tools**: `execute_query`, `list_tables`, `describe_table`
**Dependencies**: `@supabase/supabase-js`
**API Keys**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
**Required RPC**: `execute_readonly_sql` (see [SQL Setup](#14-sql-database-setup))

### Singleton Client Pattern

```typescript
import { createClient } from '@supabase/supabase-js';

let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}
```

### Tool 1: `execute_query`

```typescript
export async function executeQuery(input: { query: string }): Promise<string> {
  const query = input.query.trim().toLowerCase();
  
  // Security: Only SELECT
  if (!query.startsWith('select')) throw new Error('Only SELECT queries allowed');
  
  // Block dangerous patterns
  const dangerous = ['drop table', 'drop database', 'truncate', 'delete from', 'alter table', 'create table'];
  for (const p of dangerous) {
    if (query.includes(p)) throw new Error(`Dangerous pattern: ${p}`);
  }
  
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('execute_readonly_sql', { query_text: input.query });
  
  if (error) throw new Error(`Query failed: ${error.message}`);
  return (!data || data.length === 0) ? 'No results.' : JSON.stringify(data, null, 2);
}
```

### Tool 2: `list_tables`

```typescript
export async function listTables(input: {}): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('execute_readonly_sql', {
    query_text: `SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
  });
  if (error) throw new Error(error.message);
  return JSON.stringify(data, null, 2);
}
```

### Tool 3: `describe_table`

```typescript
export async function describeTable(input: { table_name: string }): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('execute_readonly_sql', {
    query_text: `SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${input.table_name}' 
      ORDER BY ordinal_position;`
  });
  if (error) throw new Error(error.message);
  return (!data?.length) ? `Table '${input.table_name}' not found.` : JSON.stringify(data, null, 2);
}
```

**Schemas**:
```json
[
  {
    "name": "execute_query",
    "description": "Execute a SELECT query on the database.",
    "input_schema": { "type": "object", "properties": { "query": { "type": "string" } }, "required": ["query"] }
  },
  {
    "name": "list_tables",
    "description": "List all tables in the database.",
    "input_schema": { "type": "object", "properties": {}, "required": [] }
  },
  {
    "name": "describe_table",
    "description": "Get schema of a specific table.",
    "input_schema": { "type": "object", "properties": { "table_name": { "type": "string" } }, "required": ["table_name"] }
  }
]
```

---

## 6. Memory

**Tools**: `save_memory`, `search_memory`, `list_memories`
**Dependencies**: `@supabase/supabase-js`, `openai`
**API Keys**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`
**Database**: `memories` table with `VECTOR(1536)` column + `match_memories` RPC
**Embedding Model**: `text-embedding-3-small`

### Embedding Helper

```typescript
import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY not configured');
    openaiClient = new OpenAI({ apiKey: key });
  }
  return openaiClient;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text });
  return response.data[0].embedding;
}
```

### Tool 1: `save_memory`

```typescript
export async function saveMemory(input: { content: string; metadata?: any; title?: string }): Promise<string> {
  const supabase = getSupabaseClient();
  const embedding = await generateEmbedding(input.content);
  
  const { data, error } = await supabase.from('memories').insert({
    content: input.content,
    title: input.title || input.content.substring(0, 100),
    embedding,
    metadata: input.metadata || {},
    created_at: new Date().toISOString()
  }).select().single();
  
  if (error) throw new Error(error.message);
  return `✅ Memory saved with ID: ${data.id}`;
}
```

### Tool 2: `search_memory`

```typescript
export async function searchMemory(input: { query: string; limit?: number }): Promise<string> {
  const supabase = getSupabaseClient();
  const queryEmbedding = await generateEmbedding(input.query);
  
  const { data, error } = await supabase.rpc('match_memories', {
    query_embedding: queryEmbedding,
    match_count: input.limit || 5
  });
  
  if (error) throw new Error(error.message);
  if (!data?.length) return `No memories found matching: ${input.query}`;
  
  return data.map((m: any, i: number) =>
    `${i + 1}. ${m.title || 'Untitled'} (similarity: ${(m.similarity * 100).toFixed(1)}%)\n   ${m.content.substring(0, 200)}...`
  ).join('\n\n');
}
```

### Tool 3: `list_memories`

```typescript
export async function listMemories(input: { limit?: number }): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('memories')
    .select('id, title, content, created_at')
    .order('created_at', { ascending: false })
    .limit(input.limit || 10);
  
  if (error) throw new Error(error.message);
  return (!data?.length) ? 'No memories found.' : JSON.stringify(data, null, 2);
}
```

**Schemas**:
```json
[
  {
    "name": "save_memory",
    "description": "Save information to long-term memory with semantic search capability.",
    "input_schema": {
      "type": "object",
      "properties": {
        "content": { "type": "string" },
        "title": { "type": "string" },
        "metadata": { "type": "object" }
      },
      "required": ["content"]
    }
  },
  {
    "name": "search_memory",
    "description": "Search memories using semantic similarity.",
    "input_schema": {
      "type": "object",
      "properties": {
        "query": { "type": "string" },
        "limit": { "type": "number", "description": "Max results (default: 5)" }
      },
      "required": ["query"]
    }
  },
  {
    "name": "list_memories",
    "description": "List recent memories chronologically.",
    "input_schema": {
      "type": "object",
      "properties": { "limit": { "type": "number" } },
      "required": []
    }
  }
]
```

---

## 7. Debugging

**Tools** (10): `start_debug_session`, `read_console_logs`, `read_network_requests`, `take_screenshot`, `evaluate_in_page`, `click_element`, `type_text`, `navigate_to`, `stop_debug_session`, `start_dev_server_with_debug`
**Dependencies**: `puppeteer` (or `playwright`)
**Architecture**: Singleton session with accumulated logs/requests arrays

### Session Interface

```typescript
import { spawn, ChildProcess } from 'child_process';
import puppeteer, { Browser, Page } from 'puppeteer';

interface DebugSession {
  browser: Browser;
  page: Page;
  consoleLogs: ConsoleLog[];
  networkRequests: NetworkRequest[];
  devServer?: ChildProcess;
}

interface ConsoleLog {
  type: string; text: string; timestamp: string; location?: string;
}

interface NetworkRequest {
  url: string; method: string; status?: number; statusText?: string;
  type: string; timestamp: string; duration?: number; size?: number;
}

let activeSession: DebugSession | null = null;
```

### Tool 1: `start_debug_session`

```typescript
export async function startDebugSession(input: { url: string; headless?: boolean }): Promise<string> {
  if (activeSession) await stopDebugSession({});

  const browser = await puppeteer.launch({
    headless: input.headless !== false ? 'new' : false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleLogs: ConsoleLog[] = [];
  const networkRequests: NetworkRequest[] = [];
  const requestTimings = new Map<string, number>();

  // Capture console
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text(), timestamp: new Date().toISOString(), location: msg.location()?.url });
  });
  page.on('pageerror', error => {
    consoleLogs.push({ type: 'error', text: error.message, timestamp: new Date().toISOString() });
  });

  // Capture network
  page.on('request', req => requestTimings.set(req.url(), Date.now()));
  page.on('response', async response => {
    const start = requestTimings.get(response.url());
    let size: number | undefined;
    try { size = (await response.buffer()).length; } catch {}
    networkRequests.push({
      url: response.url(), method: response.request().method(),
      status: response.status(), statusText: response.statusText(),
      type: response.request().resourceType(), timestamp: new Date().toISOString(),
      duration: start ? Date.now() - start : undefined, size
    });
  });
  page.on('requestfailed', req => {
    networkRequests.push({
      url: req.url(), method: req.method(), type: req.resourceType(),
      timestamp: new Date().toISOString(), statusText: req.failure()?.errorText || 'Failed'
    });
  });

  await page.goto(input.url, { waitUntil: 'networkidle2', timeout: 30000 });
  activeSession = { browser, page, consoleLogs, networkRequests };

  return JSON.stringify({ success: true, message: `Debug session started for ${input.url}`, url: page.url(), title: await page.title() }, null, 2);
}
```

### Tool 2: `read_console_logs`

```typescript
export async function readConsoleLogs(input: { filter?: string; type?: 'log'|'error'|'warn'|'info'; limit?: number }): Promise<string> {
  if (!activeSession) throw new Error('No active debug session');
  
  let logs = [...activeSession.consoleLogs];
  if (input.type) logs = logs.filter(l => l.type === input.type);
  if (input.filter) logs = logs.filter(l => l.text.toLowerCase().includes(input.filter!.toLowerCase()));
  logs = logs.slice(-(input.limit || 50));
  
  return logs.length === 0 ? 'No console logs captured.' :
    logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.text}${l.location ? `\n   at ${l.location}` : ''}`).join('\n');
}
```

### Tool 3: `read_network_requests`

```typescript
export async function readNetworkRequests(input: { filter?: string; status?: number; method?: string; limit?: number }): Promise<string> {
  if (!activeSession) throw new Error('No active debug session');
  
  let reqs = [...activeSession.networkRequests];
  if (input.filter) reqs = reqs.filter(r => r.url.toLowerCase().includes(input.filter!.toLowerCase()));
  if (input.status) reqs = reqs.filter(r => r.status === input.status);
  if (input.method) reqs = reqs.filter(r => r.method.toUpperCase() === input.method!.toUpperCase());
  reqs = reqs.slice(-(input.limit || 50));
  
  return reqs.length === 0 ? 'No network requests captured.' :
    reqs.map(r => `[${r.timestamp}] ${r.method} ${r.status || 'FAILED'} ${r.duration ? r.duration+'ms' : '-'}\n   ${r.url}`).join('\n\n');
}
```

### Tool 4: `take_screenshot`

```typescript
export async function takeScreenshot(input: { path?: string; fullPage?: boolean; selector?: string }): Promise<string> {
  if (!activeSession) throw new Error('No active debug session');
  
  const screenshotPath = input.path || `workspace/screenshots/screenshot-${Date.now()}.png`;
  mkdirSync(dirname(screenshotPath), { recursive: true });

  if (input.selector) {
    const el = await activeSession.page.$(input.selector);
    if (!el) throw new Error(`Element not found: ${input.selector}`);
    await el.screenshot({ path: screenshotPath });
  } else {
    await activeSession.page.screenshot({ path: screenshotPath, fullPage: input.fullPage !== false });
  }

  return JSON.stringify({ success: true, path: screenshotPath }, null, 2);
}
```

### Tool 5: `evaluate_in_page`

```typescript
export async function evaluateInPage(input: { script: string }): Promise<string> {
  if (!activeSession) throw new Error('No active debug session');
  const result = await activeSession.page.evaluate(input.script);
  return JSON.stringify(result, null, 2);
}
```

### Tool 6: `click_element`

```typescript
export async function clickElement(input: { selector: string }): Promise<string> {
  if (!activeSession) throw new Error('No active debug session');
  await activeSession.page.click(input.selector);
  return `Clicked: ${input.selector}`;
}
```

### Tool 7: `type_text`

```typescript
export async function typeText(input: { selector: string; text: string }): Promise<string> {
  if (!activeSession) throw new Error('No active debug session');
  await activeSession.page.type(input.selector, input.text);
  return `Typed "${input.text}" into ${input.selector}`;
}
```

### Tool 8: `navigate_to`

```typescript
export async function navigateTo(input: { url: string }): Promise<string> {
  if (!activeSession) throw new Error('No active debug session');
  await activeSession.page.goto(input.url, { waitUntil: 'networkidle2' });
  return JSON.stringify({ url: activeSession.page.url(), title: await activeSession.page.title() }, null, 2);
}
```

### Tool 9: `stop_debug_session`

```typescript
export async function stopDebugSession(input: {}): Promise<string> {
  if (!activeSession) return 'No active session.';
  if (activeSession.devServer) activeSession.devServer.kill();
  await activeSession.browser.close();
  const summary = {
    consoleLogs: activeSession.consoleLogs.length,
    networkRequests: activeSession.networkRequests.length,
    errors: activeSession.consoleLogs.filter(l => l.type === 'error').length
  };
  activeSession = null;
  return JSON.stringify({ success: true, summary }, null, 2);
}
```

### Tool 10: `start_dev_server_with_debug`

```typescript
export async function startDevServerWithDebug(input: { projectPath: string; port?: number }): Promise<string> {
  const port = input.port || 5173;
  
  const devServer = spawn('npm', ['run', 'dev', '--', '--port', String(port)], {
    cwd: input.projectPath, shell: true, stdio: 'pipe'
  });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Dev server timeout')), 30000);
    devServer.stdout?.on('data', (data: Buffer) => {
      if (data.toString().includes('Local:')) { clearTimeout(timeout); resolve(); }
    });
    devServer.on('error', reject);
  });

  const result = await startDebugSession({ url: `http://localhost:${port}` });
  if (activeSession) activeSession.devServer = devServer;
  return JSON.stringify({ success: true, message: `Dev server on port ${port}`, debugSession: JSON.parse(result) }, null, 2);
}
```

**Schemas** (10 tools):
```json
[
  { "name": "start_debug_session", "input_schema": { "type": "object", "properties": { "url": { "type": "string" }, "headless": { "type": "boolean" } }, "required": ["url"] } },
  { "name": "read_console_logs", "input_schema": { "type": "object", "properties": { "filter": { "type": "string" }, "type": { "type": "string", "enum": ["log","error","warn","info"] }, "limit": { "type": "number" } }, "required": [] } },
  { "name": "read_network_requests", "input_schema": { "type": "object", "properties": { "filter": { "type": "string" }, "status": { "type": "number" }, "method": { "type": "string" }, "limit": { "type": "number" } }, "required": [] } },
  { "name": "take_screenshot", "input_schema": { "type": "object", "properties": { "path": { "type": "string" }, "fullPage": { "type": "boolean" }, "selector": { "type": "string" } }, "required": [] } },
  { "name": "evaluate_in_page", "input_schema": { "type": "object", "properties": { "script": { "type": "string" } }, "required": ["script"] } },
  { "name": "click_element", "input_schema": { "type": "object", "properties": { "selector": { "type": "string" } }, "required": ["selector"] } },
  { "name": "type_text", "input_schema": { "type": "object", "properties": { "selector": { "type": "string" }, "text": { "type": "string" } }, "required": ["selector", "text"] } },
  { "name": "navigate_to", "input_schema": { "type": "object", "properties": { "url": { "type": "string" } }, "required": ["url"] } },
  { "name": "stop_debug_session", "input_schema": { "type": "object", "properties": {}, "required": [] } },
  { "name": "start_dev_server_with_debug", "input_schema": { "type": "object", "properties": { "projectPath": { "type": "string" }, "port": { "type": "number" } }, "required": ["projectPath"] } }
]
```

---

## 8. AI & Media

**Tools** (6): `generate_image`, `analyze_image`, `transcribe_audio`, `text_to_speech`, `ai_chat`, `generate_embeddings`
**Dependencies**: `openai`
**API Key**: `OPENAI_API_KEY`
**Models**: DALL-E 3, GPT-4o (vision), Whisper, TTS-1-HD, text-embedding-3-small

### Shared Client

```typescript
import OpenAI from 'openai';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');
  return new OpenAI({ apiKey });
}
```

### Tool 1: `generate_image` (DALL-E 3)

```typescript
export async function generateImage(input: {
  prompt: string; size?: '1024x1024'|'1792x1024'|'1024x1792';
  quality?: 'standard'|'hd'; style?: 'vivid'|'natural'; savePath?: string;
}): Promise<string> {
  const openai = getOpenAIClient();
  const response = await openai.images.generate({
    model: 'dall-e-3', prompt: input.prompt, n: 1,
    size: input.size || '1024x1024', quality: input.quality || 'standard',
    style: input.style || 'vivid', response_format: 'url'
  });

  const imageUrl = response.data[0].url!;
  if (input.savePath) {
    const buffer = Buffer.from(await (await fetch(imageUrl)).arrayBuffer());
    mkdirSync(dirname(input.savePath), { recursive: true });
    writeFileSync(input.savePath, buffer);
  }
  return JSON.stringify({ success: true, url: imageUrl, revisedPrompt: response.data[0].revised_prompt, savedTo: input.savePath || null }, null, 2);
}
```

### Tool 2: `analyze_image` (GPT-4o Vision)

```typescript
export async function analyzeImage(input: { imageUrl?: string; imagePath?: string; prompt?: string }): Promise<string> {
  const openai = getOpenAIClient();
  let imageContent: any;
  
  if (input.imageUrl) {
    imageContent = { type: 'image_url', image_url: { url: input.imageUrl } };
  } else if (input.imagePath) {
    const buffer = readFileSync(input.imagePath);
    const base64 = buffer.toString('base64');
    const mime = input.imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    imageContent = { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } };
  } else throw new Error('imageUrl or imagePath required');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o', max_tokens: 4096,
    messages: [{ role: 'user', content: [
      { type: 'text', text: input.prompt || 'Describe this image in detail.' },
      imageContent
    ]}]
  });
  return response.choices[0].message.content || 'No analysis';
}
```

### Tool 3: `transcribe_audio` (Whisper)

```typescript
export async function transcribeAudio(input: { audioPath: string; language?: string; prompt?: string }): Promise<string> {
  const openai = getOpenAIClient();
  const { createReadStream } = await import('fs');
  const response = await openai.audio.transcriptions.create({
    file: createReadStream(input.audioPath) as any,
    model: 'whisper-1', language: input.language, prompt: input.prompt
  });
  return JSON.stringify({ success: true, text: response.text }, null, 2);
}
```

### Tool 4: `text_to_speech` (TTS-1-HD)

```typescript
export async function textToSpeech(input: {
  text: string; voice?: 'alloy'|'echo'|'fable'|'onyx'|'nova'|'shimmer';
  outputPath: string; speed?: number;
}): Promise<string> {
  const openai = getOpenAIClient();
  const response = await openai.audio.speech.create({
    model: 'tts-1-hd', voice: input.voice || 'alloy', input: input.text, speed: input.speed || 1.0
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  mkdirSync(dirname(input.outputPath), { recursive: true });
  writeFileSync(input.outputPath, buffer);
  return JSON.stringify({ success: true, outputPath: input.outputPath, voice: input.voice || 'alloy' }, null, 2);
}
```

### Tool 5: `ai_chat` (GPT-4o)

```typescript
export async function aiChat(input: {
  messages: Array<{ role: 'system'|'user'|'assistant'; content: string }>;
  model?: string; temperature?: number; maxTokens?: number;
}): Promise<string> {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: input.model || 'gpt-4o', messages: input.messages,
    temperature: input.temperature ?? 0.7, max_tokens: input.maxTokens || 4096
  });
  return JSON.stringify({ content: response.choices[0].message.content, model: response.model, usage: response.usage }, null, 2);
}
```

### Tool 6: `generate_embeddings`

```typescript
export async function generateEmbeddings(input: { text: string | string[]; model?: string }): Promise<string> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: input.model || 'text-embedding-3-small', input: input.text
  });
  return JSON.stringify({
    embeddings: response.data.map(d => d.embedding),
    dimensions: response.data[0].embedding.length, usage: response.usage
  }, null, 2);
}
```

---

## 9. Document Parsing

**Tools** (5): `parse_pdf`, `parse_docx`, `parse_excel`, `parse_csv`, `parse_document`
**Dependencies**: `pdf-parse`, `mammoth`, `xlsx`

### Tool 1: `parse_pdf`

```typescript
import { readFileSync, existsSync } from 'fs';
import { extname } from 'path';

export async function parsePDF(input: { filePath: string; maxPages?: number }): Promise<string> {
  if (!existsSync(input.filePath)) throw new Error(`File not found: ${input.filePath}`);
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(readFileSync(input.filePath), { max: input.maxPages || 50 });
  return JSON.stringify({ success: true, text: data.text, numPages: data.numpages, info: data.info }, null, 2);
}
```

### Tool 2: `parse_docx`

```typescript
export async function parseDocx(input: { filePath: string }): Promise<string> {
  if (!existsSync(input.filePath)) throw new Error(`File not found`);
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ path: input.filePath });
  const htmlResult = await mammoth.convertToHtml({ path: input.filePath });
  return JSON.stringify({ success: true, text: result.value, html: htmlResult.value }, null, 2);
}
```

### Tool 3: `parse_excel`

```typescript
export async function parseExcel(input: { filePath: string; sheetName?: string; asJson?: boolean }): Promise<string> {
  if (!existsSync(input.filePath)) throw new Error(`File not found`);
  const XLSX = await import('xlsx');
  const workbook = XLSX.readFile(input.filePath);
  const sheetName = input.sheetName || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
  
  if (input.asJson) {
    const data = XLSX.utils.sheet_to_json(sheet);
    return JSON.stringify({ success: true, sheetName, data, rowCount: data.length }, null, 2);
  }
  return JSON.stringify({ success: true, sheetName, text: XLSX.utils.sheet_to_txt(sheet) }, null, 2);
}
```

### Tool 4: `parse_csv`

```typescript
export async function parseCSV(input: { filePath: string; delimiter?: string; asJson?: boolean }): Promise<string> {
  if (!existsSync(input.filePath)) throw new Error(`File not found`);
  const XLSX = await import('xlsx');
  const workbook = XLSX.readFile(input.filePath, { FS: input.delimiter || ',' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  
  if (input.asJson) {
    const data = XLSX.utils.sheet_to_json(sheet);
    return JSON.stringify({ success: true, data, rowCount: data.length }, null, 2);
  }
  return JSON.stringify({ success: true, text: XLSX.utils.sheet_to_txt(sheet) }, null, 2);
}
```

### Tool 5: `parse_document` (auto-detect)

```typescript
export async function parseDocument(input: { filePath: string; options?: any }): Promise<string> {
  const ext = extname(input.filePath).toLowerCase();
  switch (ext) {
    case '.pdf': return parsePDF({ filePath: input.filePath, maxPages: input.options?.maxPages });
    case '.docx': case '.doc': return parseDocx({ filePath: input.filePath });
    case '.xlsx': case '.xls': return parseExcel({ filePath: input.filePath, ...input.options });
    case '.csv': return parseCSV({ filePath: input.filePath, ...input.options });
    case '.txt': case '.md':
      const content = readFileSync(input.filePath, 'utf-8');
      return JSON.stringify({ success: true, text: content, lines: content.split('\n').length }, null, 2);
    default: throw new Error(`Unsupported: ${ext}. Supported: .pdf, .docx, .xlsx, .csv, .txt, .md`);
  }
}
```

---

## 10. Task Tracking

**Tools** (8): `create_task`, `update_task_title`, `update_task_description`, `set_task_status`, `get_task`, `get_task_list`, `add_task_note`, `clear_tasks`
**Dependencies**: None (in-memory `Map`)
**Key Constraint**: Only one task can be `in_progress` at a time

```typescript
interface Task {
  id: string; title: string; description: string;
  status: 'todo' | 'in_progress' | 'done';
  notes: string[]; createdAt: string; updatedAt: string;
}

const tasks = new Map<string, Task>();
let taskCounter = 0;

function generateId(): string { return `task_${++taskCounter}_${Date.now().toString(36)}`; }

export function createTask(input: { title: string; description: string }): string {
  const id = generateId();
  const now = new Date().toISOString();
  tasks.set(id, { id, title: input.title, description: input.description, status: 'todo', notes: [], createdAt: now, updatedAt: now });
  return JSON.stringify({ success: true, task: { id, title: input.title, status: 'todo' } }, null, 2);
}

export function setTaskStatus(input: { taskId: string; status: 'todo'|'in_progress'|'done' }): string {
  const task = tasks.get(input.taskId);
  if (!task) throw new Error(`Task not found: ${input.taskId}`);
  
  // Enforce single in_progress
  if (input.status === 'in_progress') {
    for (const [id, t] of tasks) {
      if (t.status === 'in_progress' && id !== input.taskId) {
        t.status = 'todo'; t.updatedAt = new Date().toISOString();
      }
    }
  }
  
  const old = task.status;
  task.status = input.status;
  task.updatedAt = new Date().toISOString();
  return JSON.stringify({ success: true, oldStatus: old, newStatus: input.status }, null, 2);
}

export function addTaskNote(input: { taskId: string; note: string }): string {
  const task = tasks.get(input.taskId);
  if (!task) throw new Error(`Task not found`);
  task.notes.push(`[${new Date().toISOString()}] ${input.note}`);
  task.updatedAt = new Date().toISOString();
  return JSON.stringify({ success: true, noteCount: task.notes.length }, null, 2);
}

export function getTaskList(input: {}): string {
  const arr = Array.from(tasks.values());
  if (!arr.length) return 'No tasks.';
  const grouped = {
    in_progress: arr.filter(t => t.status === 'in_progress'),
    todo: arr.filter(t => t.status === 'todo'),
    done: arr.filter(t => t.status === 'done')
  };
  let out = '## Task List\n\n';
  for (const [status, items] of Object.entries(grouped)) {
    if (items.length) {
      out += `### ${status === 'in_progress' ? '🔄 In Progress' : status === 'todo' ? '📋 To Do' : '✅ Done'}\n`;
      items.forEach(t => { out += `- [${t.id}] ${t.title}\n`; });
      out += '\n';
    }
  }
  return out;
}

// updateTaskTitle, updateTaskDescription, getTask, clearTasks follow the same pattern
```

---

## 11. Secrets Manager

**Tools** (6): `list_secrets`, `get_secret`, `set_secret`, `delete_secret`, `load_all_secrets`, `check_required_secrets`
**Dependencies**: Node.js `crypto` (AES-256-GCM)
**Storage**: Encrypted file `.secrets.enc`
**Key**: `SECRETS_ENCRYPTION_KEY` env var

### Encryption Core

```typescript
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const SECRETS_FILE = '.secrets.enc';
const ENCRYPTION_KEY = process.env.SECRETS_ENCRYPTION_KEY || 'default-dev-key-change-in-prod';

function deriveKey(password: string): Buffer {
  return scryptSync(password, 'claude-libre-salt', 32);
}

function encrypt(text: string): string {
  const key = deriveKey(ENCRYPTION_KEY);
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const key = deriveKey(ENCRYPTION_KEY);
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}

function loadSecrets(): Record<string, string> {
  if (!existsSync(SECRETS_FILE)) return {};
  try { return JSON.parse(decrypt(readFileSync(SECRETS_FILE, 'utf8'))); }
  catch { return {}; }
}

function saveSecrets(secrets: Record<string, string>): void {
  writeFileSync(SECRETS_FILE, encrypt(JSON.stringify(secrets, null, 2)), 'utf8');
}
```

### Tool Implementations

```typescript
export function listSecrets(input: {}): string {
  const secrets = loadSecrets();
  const names = Object.keys(secrets);
  if (!names.length) return 'No secrets configured.';
  return JSON.stringify({
    count: names.length,
    secrets: names.map(n => ({ name: n, length: secrets[n].length, preview: `${secrets[n].substring(0,4)}...${secrets[n].slice(-4)}` }))
  }, null, 2);
}

export function getSecret(input: { name: string }): string {
  const secrets = loadSecrets();
  if (!(input.name in secrets)) throw new Error(`Secret not found: ${input.name}`);
  process.env[input.name] = secrets[input.name];
  return JSON.stringify({ name: input.name, value: secrets[input.name], message: `Loaded as env var` }, null, 2);
}

export function setSecret(input: { name: string; value: string }): string {
  const secrets = loadSecrets();
  const isNew = !(input.name in secrets);
  secrets[input.name] = input.value;
  saveSecrets(secrets);
  process.env[input.name] = input.value;
  return JSON.stringify({ success: true, name: input.name, action: isNew ? 'created' : 'updated' }, null, 2);
}

export function deleteSecret(input: { name: string }): string {
  const secrets = loadSecrets();
  if (!(input.name in secrets)) throw new Error(`Secret not found`);
  delete secrets[input.name];
  saveSecrets(secrets);
  delete process.env[input.name];
  return JSON.stringify({ success: true, name: input.name, action: 'deleted' }, null, 2);
}

export function loadAllSecretsToEnv(input: {}): string {
  const secrets = loadSecrets();
  for (const [k, v] of Object.entries(secrets)) process.env[k] = v;
  return JSON.stringify({ success: true, loaded: Object.keys(secrets).length }, null, 2);
}

export function checkRequiredSecrets(input: { required: string[] }): string {
  const secrets = loadSecrets();
  const missing = input.required.filter(n => !(n in secrets) && !process.env[n]);
  const present = input.required.filter(n => n in secrets || !!process.env[n]);
  return JSON.stringify({ allPresent: !missing.length, present, missing }, null, 2);
}
```

---

## 12. Orchestrator Core

### Complete Orchestrator (`src/orchestrator.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import winston from 'winston';
import { executeToolCall, tools, TOOL_COUNT, TOOL_CATEGORIES } from './tools/index.js';

config();

// Logger setup
const logger = winston.createLogger({
  level: process.env.DEBUG === 'true' ? 'debug' : 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) }),
    new winston.transports.File({ filename: 'logs/orchestrator.log' })
  ]
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// System prompt with prompt caching
const SYSTEM_PROMPT = [
  {
    type: 'text' as const,
    text: `You are Claude Libre, a fully autonomous AI assistant with ${TOOL_COUNT} tools...
    [Full system prompt describing all capabilities]`,
    cache_control: { type: 'ephemeral' as const }
  },
  {
    type: 'text' as const,
    text: `Available tools: ${tools.map(t => t.name).join(', ')}`,
    cache_control: { type: 'ephemeral' as const }
  }
];

// Main agentic loop
async function orchestrate(userMessage: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userMessage }];
  let iterationCount = 0;
  const maxIterations = 20;

  while (iterationCount < maxIterations) {
    iterationCount++;
    logger.info(`Iteration ${iterationCount}`);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: parseInt(process.env.MAX_TOKENS || '8192'),
      system: SYSTEM_PROMPT,
      messages,
      tools
    });

    // Log cost
    const u = response.usage;
    const cost = (u.input_tokens * 3 + u.output_tokens * 15) / 1_000_000
      + (u.cache_creation_input_tokens ? u.cache_creation_input_tokens * 3.75 / 1_000_000 : 0)
      + (u.cache_read_input_tokens ? u.cache_read_input_tokens * 0.30 / 1_000_000 : 0);
    logger.info(`Cost: $${cost.toFixed(4)}`);

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') {
      return response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map(b => b.text).join('\n');
    }

    if (response.stop_reason === 'tool_use') {
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          try {
            const result = await executeToolCall(block.name, block.input);
            results.push({ type: 'tool_result', tool_use_id: block.id, content: result });
          } catch (error) {
            results.push({
              type: 'tool_result', tool_use_id: block.id,
              content: `Error: ${error instanceof Error ? error.message : String(error)}`,
              is_error: true
            });
          }
        }
      }
      messages.push({ role: 'user', content: results });
    }

    if (response.stop_reason === 'max_tokens') {
      return 'Response truncated due to max tokens.';
    }
  }

  return 'Max iterations reached.';
}

// Express server
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_, res) => res.json({ status: 'ok', tools: TOOL_COUNT }));

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    const response = await orchestrate(message);
    res.json({ response, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

const PORT = parseInt(process.env.PORT || '3001');
app.listen(PORT, () => logger.info(`🚀 Claude Libre running on port ${PORT} with ${TOOL_COUNT} tools`));
```

---

## 13. Tool Registration Pattern

### `src/tools/index.ts` Structure

```typescript
// 1. Import all tool functions and definitions from each category
import { readFile, writeFile, searchFiles, listDirectory, lineReplace, fileTools } from './file-operations.js';
import { executeCommand, codeExecutionTools } from './code-execution.js';
// ... import all other categories

// 2. Combine all tool definition arrays
export const tools = [
  ...fileTools,           // 5 tools
  ...codeExecutionTools,  // 1 tool
  ...webAccessTools,      // 2 tools
  ...databaseTools,       // 3 tools
  ...memoryTools,         // 3 tools
  ...debuggingTools,      // 10 tools
  ...aiMediaTools,        // 6 tools
  ...documentParserTools, // 5 tools
  ...taskTrackingTools,   // 8 tools
  ...secretsManagerTools  // 6 tools
];

// 3. Create dispatcher switch
export async function executeToolCall(toolName: string, toolInput: any): Promise<string> {
  switch (toolName) {
    case 'read_file': return readFile(toolInput);
    case 'write_file': return writeFile(toolInput);
    // ... all 49 cases
    default: throw new Error(`Unknown tool: ${toolName}`);
  }
}

// 4. Export metadata
export const TOOL_COUNT = tools.length;
export const TOOL_CATEGORIES = {
  'File Operations': fileTools.length,
  // ... all categories
};
```

### Pattern for Adding New Tools

```
1. Create new file: src/tools/my-new-tool.ts
2. Implement: export function myTool(input: { ... }): string { ... }
3. Define schema: export const myToolDefs = [{ name: 'my_tool', ... }]
4. In index.ts: import and spread into tools array
5. In index.ts: add case to switch dispatcher
6. Update TOOL_CATEGORIES
```

---

## 14. SQL Database Setup

Complete SQL to run in Supabase SQL Editor:

```sql
-- 1. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Memories table
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT NOT NULL,
  embedding VECTOR(1536),  -- text-embedding-3-small
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS memories_embedding_idx 
ON public.memories USING hnsw (embedding vector_cosine_ops);

-- 4. Chronological index
CREATE INDEX IF NOT EXISTS memories_created_at_idx 
ON public.memories (created_at DESC);

-- 5. JSONB index for metadata queries
CREATE INDEX IF NOT EXISTS memories_metadata_idx 
ON public.memories USING GIN (metadata);

-- 6. Semantic similarity search function
CREATE OR REPLACE FUNCTION public.match_memories(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID, title TEXT, content TEXT, metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE, similarity FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT m.id, m.title, m.content, m.metadata, m.created_at,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM memories m
  WHERE m.embedding IS NOT NULL
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 7. Read-only SQL execution function
CREATE OR REPLACE FUNCTION public.execute_readonly_sql(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result JSONB;
BEGIN
  IF query_text !~* '^\s*SELECT' THEN
    RAISE EXCEPTION 'Only SELECT queries allowed';
  END IF;
  IF query_text ~* '(DROP|DELETE|TRUNCATE|ALTER|CREATE|INSERT|UPDATE)' THEN
    RAISE EXCEPTION 'Forbidden keywords detected';
  END IF;
  EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query_text) INTO result;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 8. RLS
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.memories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9. Permissions
GRANT ALL ON public.memories TO service_role;
GRANT EXECUTE ON FUNCTION public.match_memories TO service_role;
GRANT EXECUTE ON FUNCTION public.execute_readonly_sql TO service_role;
```

---

## 15. Complete Dependencies

### `package.json`

```json
{
  "name": "claude-libre-foundation",
  "version": "1.0.0",
  "main": "src/orchestrator.ts",
  "scripts": {
    "start": "tsx src/orchestrator.ts",
    "dev": "tsx watch src/orchestrator.ts"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "glob": "^10.3.10",
    "@supabase/supabase-js": "^2.39.0",
    "openai": "^4.20.1",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "xlsx": "^0.18.5",
    "puppeteer": "^21.6.1",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.4",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/pdf-parse": "^1.1.4",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

### Dependency Map by Category

| Category | Packages |
|----------|----------|
| **Orchestrator** | `@anthropic-ai/sdk`, `express`, `cors`, `dotenv`, `winston` |
| **File Operations** | `glob` (+ Node.js `fs`, `path`) |
| **Code Execution** | Node.js `child_process` |
| **Web Access** | None (uses `fetch`) |
| **Database** | `@supabase/supabase-js` |
| **Memory** | `@supabase/supabase-js`, `openai` |
| **Debugging** | `puppeteer` (or `playwright`) |
| **AI & Media** | `openai` |
| **Document Parsing** | `pdf-parse`, `mammoth`, `xlsx` |
| **Task Tracking** | None (in-memory) |
| **Secrets Manager** | Node.js `crypto` |

---

## 16. Environment Variables Checklist

```env
# === REQUIRED ===
ANTHROPIC_API_KEY=sk-ant-...          # Core orchestrator (Claude API)
OPENAI_API_KEY=sk-...                 # Memory embeddings + AI media tools
SUPABASE_URL=https://xxx.supabase.co  # Database + memory storage
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Full database access

# === OPTIONAL ===
SERPAPI_KEY=...                        # Web search (free tier: 100/month)
GITHUB_TOKEN=ghp_...                  # GitHub code search
SECRETS_ENCRYPTION_KEY=...            # Secrets manager encryption key

# === CONFIGURATION ===
PROJECT_ROOT=./workspace              # Root for file operations
PORT=3001                             # Express server port
MAX_TOKENS=8192                       # Max tokens per Claude response
DEBUG=false                           # Enable debug logging
ENABLE_CACHING=true                   # Prompt caching (90% savings)
```

---

## Quick Start

```bash
# 1. Clone and install
cd claude-libre-foundation
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Setup database (run in Supabase SQL Editor)
# Copy contents of sql/setup-pgvector.sql

# 4. Start
npm run dev

# 5. Test
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"List all your tools and capabilities"}'
```

---

## Summary

| Category | Tools | Dependencies | API Keys |
|----------|-------|-------------|----------|
| File Operations | 5 | `glob` | None |
| Code Execution | 1 | Node.js built-in | None |
| Web Access | 2 | `fetch` | `SERPAPI_KEY`, `GITHUB_TOKEN` |
| Database | 3 | `@supabase/supabase-js` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Memory | 3 | `@supabase/supabase-js`, `openai` | Above + `OPENAI_API_KEY` |
| Debugging | 10 | `puppeteer` | None |
| AI & Media | 6 | `openai` | `OPENAI_API_KEY` |
| Document Parsing | 5 | `pdf-parse`, `mammoth`, `xlsx` | None |
| Task Tracking | 8 | None | None |
| Secrets Manager | 6 | Node.js `crypto` | `SECRETS_ENCRYPTION_KEY` |
| **TOTAL** | **49** | **10 packages** | **6 keys** |

> This document contains everything needed to reconstruct the complete Claude Libre tool architecture from zero. Every tool has its implementation code, Anthropic schema definition, and dependency requirements documented.
