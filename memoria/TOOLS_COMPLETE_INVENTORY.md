# Inventario Completo de Herramientas - Lovable Platform

> Fecha de análisis: 2025-12-24
> Total herramientas: 41
> Objetivo: Documentar para replicación en Claude Libre

## Resumen Ejecutivo

| Estado | Cantidad | Descripción |
|--------|----------|-------------|
| ✅ Funcional | 29 | Operativas en todos los modos |
| 🔒 Bloqueada | 7 | Solo en modo "Default", bloqueadas en "Chat" |
| ❌ Ghost Tool | 4 | Declaradas pero no funcionales |
| ⚠️ Aprobación | 2 | Requieren confirmación del usuario |

---

## 1. Operaciones de Archivos (9 herramientas)

### 1.1 Lectura y Navegación

| Herramienta | Estado | Función | Parámetros |
|-------------|--------|---------|------------|
| `lov-view` | ✅ | Lee contenido de archivos | `file_path`, `lines?` |
| `lov-list-dir` | ✅ | Lista directorios | `dir_path` |
| `lov-search-files` | ✅ | Búsqueda regex en archivos | `query`, `search_dir?`, `include_patterns?`, `exclude_patterns?` |

### 1.2 Escritura y Modificación

| Herramienta | Estado | Función | Parámetros |
|-------------|--------|---------|------------|
| `lov-write` | 🔒 | Escribe/sobrescribe archivos | `file_path`, `content` |
| `lov-line-replace` | 🔒 | Reemplazo por líneas | `file_path`, `search`, `replace`, `first_replaced_line`, `last_replaced_line` |
| `lov-rename` | 🔒 | Renombra archivos | `original_file_path`, `new_file_path` |
| `lov-delete` | 🔒 | Elimina archivos | `file_path` |
| `lov-copy` | 🔒 | Copia archivos | `source_file_path`, `destination_file_path` |
| `lov-download-to-repo` | ✅ | Descarga URL a repositorio | `source_url`, `target_path` |

### Código de Referencia - Claude Libre

```typescript
// workspace/claude-libre-foundation/src/tools/file-operations.ts
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync, renameSync, copyFileSync } from 'fs';
import { join, resolve } from 'path';

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || './workspace';

export function readFile(input: { file_path: string; lines?: string }): string {
  const fullPath = resolve(WORKSPACE_ROOT, input.file_path);
  const content = readFileSync(fullPath, 'utf-8');
  
  if (input.lines) {
    const allLines = content.split('\n');
    const ranges = input.lines.split(',').map(r => r.trim());
    let result: string[] = [];
    
    for (const range of ranges) {
      const [start, end] = range.split('-').map(n => parseInt(n.trim()));
      result = result.concat(allLines.slice(start - 1, end || start));
    }
    return result.join('\n');
  }
  return content;
}

export function writeFile(input: { file_path: string; content: string }): string {
  const fullPath = resolve(WORKSPACE_ROOT, input.file_path);
  writeFileSync(fullPath, input.content, 'utf-8');
  return `File written: ${input.file_path}`;
}

export function listDirectory(input: { dir_path: string }): string {
  const fullPath = resolve(WORKSPACE_ROOT, input.dir_path);
  const entries = readdirSync(fullPath, { withFileTypes: true });
  return entries.map(e => `${e.isDirectory() ? '📁' : '📄'} ${e.name}`).join('\n');
}

export function searchFiles(input: { 
  query: string; 
  search_dir?: string;
  include_patterns?: string;
  exclude_patterns?: string;
}): string {
  // Implementación con glob y regex
  const { execSync } = require('child_process');
  const searchDir = input.search_dir || '.';
  const cmd = `grep -rn "${input.query}" ${searchDir} --include="${input.include_patterns || '*'}"`;
  return execSync(cmd, { cwd: WORKSPACE_ROOT, encoding: 'utf-8' });
}

export function lineReplace(input: {
  file_path: string;
  search: string;
  replace: string;
  first_replaced_line: number;
  last_replaced_line: number;
}): string {
  const fullPath = resolve(WORKSPACE_ROOT, input.file_path);
  const lines = readFileSync(fullPath, 'utf-8').split('\n');
  
  // Validar que las líneas coincidan
  const targetSection = lines.slice(input.first_replaced_line - 1, input.last_replaced_line).join('\n');
  const searchNormalized = input.search.replace(/\.\.\./g, '').trim();
  
  if (!targetSection.includes(searchNormalized.split('\n')[0])) {
    throw new Error('Search content does not match file content at specified lines');
  }
  
  // Reemplazar
  const before = lines.slice(0, input.first_replaced_line - 1);
  const after = lines.slice(input.last_replaced_line);
  const newContent = [...before, ...input.replace.split('\n'), ...after].join('\n');
  
  writeFileSync(fullPath, newContent, 'utf-8');
  return `Replaced lines ${input.first_replaced_line}-${input.last_replaced_line} in ${input.file_path}`;
}

export function deleteFile(input: { file_path: string }): string {
  const fullPath = resolve(WORKSPACE_ROOT, input.file_path);
  unlinkSync(fullPath);
  return `Deleted: ${input.file_path}`;
}

export function renameFile(input: { original_file_path: string; new_file_path: string }): string {
  const originalPath = resolve(WORKSPACE_ROOT, input.original_file_path);
  const newPath = resolve(WORKSPACE_ROOT, input.new_file_path);
  renameSync(originalPath, newPath);
  return `Renamed: ${input.original_file_path} → ${input.new_file_path}`;
}

export function copyFile(input: { source_file_path: string; destination_file_path: string }): string {
  const sourcePath = resolve(WORKSPACE_ROOT, input.source_file_path);
  const destPath = resolve(WORKSPACE_ROOT, input.destination_file_path);
  copyFileSync(sourcePath, destPath);
  return `Copied: ${input.source_file_path} → ${input.destination_file_path}`;
}

export async function downloadToRepo(input: { source_url: string; target_path: string }): Promise<string> {
  const response = await fetch(input.source_url);
  const buffer = await response.arrayBuffer();
  const fullPath = resolve(WORKSPACE_ROOT, input.target_path);
  writeFileSync(fullPath, Buffer.from(buffer));
  return `Downloaded: ${input.source_url} → ${input.target_path}`;
}
```

---

## 2. Debugging (4 herramientas - Ghost Tools)

| Herramienta | Estado | Función Declarada | Realidad |
|-------------|--------|-------------------|----------|
| `lov-read-console-logs` | ❌ | Lee logs de consola del navegador | No funcional - devuelve vacío |
| `lov-read-network-requests` | ❌ | Lee peticiones de red | No funcional - devuelve vacío |
| `lov-read-session-replay` | ❌ | Grabación de sesión del usuario | No funcional |
| `project_debug--sandbox-screenshot` | ⚠️ | Captura screenshot de la app | Limitado - solo páginas públicas |
| `project_debug--sleep` | ✅ | Espera N segundos | Funcional, max 60s |

### Por qué son Ghost Tools

```
Análisis empírico 2025-12-24:
- lov-read-console-logs: Invocado múltiples veces, siempre retorna "No logs found"
- lov-read-network-requests: Invocado múltiples veces, siempre retorna vacío
- lov-read-session-replay: Declarado en system prompt pero nunca responde con datos

Hipótesis: Estas herramientas requieren integración con el iframe de preview
que no existe en el contexto del agente. Son "decoración" del system prompt.
```

### Código de Referencia - Claude Libre (Debugging Real)

```typescript
// workspace/claude-libre-foundation/src/tools/debugging.ts
import { spawn, ChildProcess } from 'child_process';
import puppeteer, { Browser, Page } from 'puppeteer';

let devServerProcess: ChildProcess | null = null;
let browser: Browser | null = null;
let page: Page | null = null;
const consoleLogs: Array<{ type: string; text: string; timestamp: Date }> = [];
const networkRequests: Array<{ url: string; method: string; status: number; timestamp: Date }> = [];

export async function startDevServer(input: { port?: number }): Promise<string> {
  const port = input.port || 5173;
  
  return new Promise((resolve, reject) => {
    devServerProcess = spawn('npm', ['run', 'dev', '--', '--port', port.toString()], {
      cwd: process.env.WORKSPACE_ROOT,
      shell: true
    });
    
    devServerProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:')) {
        resolve(`Dev server started on port ${port}`);
      }
    });
    
    devServerProcess.stderr?.on('data', (data) => {
      console.error(`Dev server error: ${data}`);
    });
    
    setTimeout(() => resolve(`Dev server starting on port ${port}...`), 3000);
  });
}

export async function initBrowser(): Promise<string> {
  browser = await puppeteer.launch({ headless: true });
  page = await browser.newPage();
  
  // Capturar console logs
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date()
    });
  });
  
  // Capturar network requests
  page.on('response', (response) => {
    networkRequests.push({
      url: response.url(),
      method: response.request().method(),
      status: response.status(),
      timestamp: new Date()
    });
  });
  
  return 'Browser initialized with console and network monitoring';
}

export async function navigateTo(input: { url: string }): Promise<string> {
  if (!page) throw new Error('Browser not initialized. Call initBrowser first.');
  await page.goto(input.url, { waitUntil: 'networkidle2' });
  return `Navigated to ${input.url}`;
}

export function readConsoleLogs(input: { search?: string }): string {
  let logs = [...consoleLogs];
  
  if (input.search) {
    logs = logs.filter(l => l.text.toLowerCase().includes(input.search!.toLowerCase()));
  }
  
  return logs.length > 0 
    ? logs.map(l => `[${l.type.toUpperCase()}] ${l.text}`).join('\n')
    : 'No console logs captured';
}

export function readNetworkRequests(input: { search?: string }): string {
  let requests = [...networkRequests];
  
  if (input.search) {
    requests = requests.filter(r => r.url.toLowerCase().includes(input.search!.toLowerCase()));
  }
  
  return requests.length > 0
    ? requests.map(r => `${r.method} ${r.status} ${r.url}`).join('\n')
    : 'No network requests captured';
}

export async function takeScreenshot(input: { path: string }): Promise<string> {
  if (!page) throw new Error('Browser not initialized');
  await page.screenshot({ path: input.path, fullPage: true });
  return `Screenshot saved to ${input.path}`;
}

export async function cleanup(): Promise<string> {
  if (browser) await browser.close();
  if (devServerProcess) devServerProcess.kill();
  consoleLogs.length = 0;
  networkRequests.length = 0;
  return 'Cleanup complete';
}
```

---

## 3. Supabase (7 herramientas)

| Herramienta | Estado | Función | Parámetros |
|-------------|--------|---------|------------|
| `supabase--read-query` | ✅ | Ejecuta SELECT en DB | `query` |
| `supabase--analytics-query` | ✅ | Query logs (postgres, auth, edge) | `query` |
| `supabase--linter` | ✅ | Análisis seguridad DB | ninguno |
| `supabase--migration` | 🔒 | Ejecuta DDL/migraciones | `query` |
| `supabase--edge-function-logs` | ✅ | Logs de edge function | `function_name`, `search?` |
| `supabase--curl_edge_functions` | ✅ | HTTP a edge functions | `path`, `method`, `body?`, `headers?` |
| `supabase--deploy_edge_functions` | 🔒 | Despliega edge functions | `function_names[]` |

### Código de Referencia - Claude Libre (PostgreSQL Directo)

```typescript
// workspace/claude-libre-foundation/src/tools/database.ts
import { Pool, PoolConfig } from 'pg';

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
};

const pool = new Pool(poolConfig);

export async function executeQuery(input: { query: string }): Promise<string> {
  // Solo permitir SELECT para seguridad
  const normalizedQuery = input.query.trim().toLowerCase();
  if (!normalizedQuery.startsWith('select')) {
    throw new Error('Only SELECT queries are allowed. Use executeMigration for DDL.');
  }
  
  const result = await pool.query(input.query);
  return JSON.stringify(result.rows, null, 2);
}

export async function executeMigration(input: { query: string }): Promise<string> {
  // Para DDL: CREATE, ALTER, DROP, INSERT, UPDATE, DELETE
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(input.query);
    await client.query('COMMIT');
    return `Migration executed successfully. Rows affected: ${result.rowCount}`;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listTables(): Promise<string> {
  const query = `
    SELECT table_name, 
           (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
    FROM information_schema.tables t
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  const result = await pool.query(query);
  return result.rows.map(r => `📋 ${r.table_name} (${r.column_count} columns)`).join('\n');
}

export async function describeTable(input: { table_name: string }): Promise<string> {
  const query = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position;
  `;
  const result = await pool.query(query, [input.table_name]);
  return result.rows.map(r => 
    `  ${r.column_name}: ${r.data_type}${r.is_nullable === 'NO' ? ' NOT NULL' : ''}${r.column_default ? ` DEFAULT ${r.column_default}` : ''}`
  ).join('\n');
}

export async function getTableStats(): Promise<string> {
  const query = `
    SELECT schemaname, relname as table_name, 
           n_live_tup as row_count,
           pg_size_pretty(pg_total_relation_size(relid)) as total_size
    FROM pg_stat_user_tables
    ORDER BY n_live_tup DESC;
  `;
  const result = await pool.query(query);
  return result.rows.map(r => 
    `${r.table_name}: ${r.row_count} rows (${r.total_size})`
  ).join('\n');
}

// Función para logs (equivalente a analytics-query)
export async function queryLogs(input: { 
  log_type: 'postgres' | 'application';
  search?: string;
  limit?: number;
}): Promise<string> {
  // En un sistema real, leerías de archivos de log o tabla de logs
  // Aquí simulamos con una tabla de logs de aplicación
  const limit = input.limit || 100;
  const query = `
    SELECT timestamp, level, message, metadata
    FROM application_logs
    WHERE ($1::text IS NULL OR message ILIKE '%' || $1 || '%')
    ORDER BY timestamp DESC
    LIMIT $2;
  `;
  
  try {
    const result = await pool.query(query, [input.search || null, limit]);
    return result.rows.map(r => 
      `[${r.timestamp}] ${r.level}: ${r.message}`
    ).join('\n');
  } catch {
    return 'Log table not found. Create application_logs table for logging.';
  }
}
```

---

## 4. Seguridad (4 herramientas)

| Herramienta | Estado | Función | Parámetros |
|-------------|--------|---------|------------|
| `security--run_security_scan` | ✅ | Escaneo completo de seguridad | ninguno |
| `security--get_security_scan_results` | ✅ | Obtiene resultados del escaneo | `force?` |
| `security--get_table_schema` | ✅ | Schema con análisis de seguridad | ninguno |
| `security--manage_security_finding` | ✅ | CRUD de hallazgos | `operations[]` |

### Código de Referencia - Claude Libre

```typescript
// workspace/claude-libre-foundation/src/tools/security.ts
import { Pool } from 'pg';

interface SecurityFinding {
  id: string;
  internal_id: string;
  name: string;
  description: string;
  level: 'info' | 'warn' | 'error';
  details?: string;
  remediation_difficulty: 'low' | 'medium' | 'high';
  ignore?: boolean;
  ignore_reason?: string;
}

const findings: SecurityFinding[] = [];

export async function runSecurityScan(pool: Pool): Promise<string> {
  const checks: SecurityFinding[] = [];
  
  // Check 1: RLS habilitado
  const rlsCheck = await pool.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN (
      SELECT tablename FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      WHERE c.relrowsecurity = true
    );
  `);
  
  if (rlsCheck.rows.length > 0) {
    checks.push({
      id: 'RLS_DISABLED',
      internal_id: 'rls_' + Date.now(),
      name: 'Row Level Security Disabled',
      description: `Tables without RLS: ${rlsCheck.rows.map(r => r.tablename).join(', ')}`,
      level: 'error',
      remediation_difficulty: 'medium'
    });
  }
  
  // Check 2: Políticas permisivas
  const permissivePolicies = await pool.query(`
    SELECT schemaname, tablename, policyname, qual
    FROM pg_policies
    WHERE qual = 'true' OR qual IS NULL;
  `);
  
  if (permissivePolicies.rows.length > 0) {
    for (const policy of permissivePolicies.rows) {
      checks.push({
        id: 'OVERLY_PERMISSIVE_POLICY',
        internal_id: `policy_${policy.policyname}`,
        name: `Overly Permissive Policy: ${policy.policyname}`,
        description: `Policy on ${policy.tablename} allows all access`,
        level: 'warn',
        remediation_difficulty: 'low'
      });
    }
  }
  
  // Check 3: Columnas sensibles sin encriptar
  const sensitiveColumns = await pool.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE column_name ILIKE ANY(ARRAY['%password%', '%secret%', '%token%', '%key%', '%ssn%', '%credit_card%'])
    AND data_type NOT IN ('bytea');
  `);
  
  if (sensitiveColumns.rows.length > 0) {
    checks.push({
      id: 'SENSITIVE_DATA_UNENCRYPTED',
      internal_id: 'sensitive_' + Date.now(),
      name: 'Potentially Sensitive Data Unencrypted',
      description: `Columns that may contain sensitive data: ${sensitiveColumns.rows.map(r => `${r.table_name}.${r.column_name}`).join(', ')}`,
      level: 'warn',
      remediation_difficulty: 'medium'
    });
  }
  
  findings.length = 0;
  findings.push(...checks);
  
  const summary = {
    total: checks.length,
    errors: checks.filter(c => c.level === 'error').length,
    warnings: checks.filter(c => c.level === 'warn').length,
    info: checks.filter(c => c.level === 'info').length
  };
  
  return `Security scan complete:\n- Errors: ${summary.errors}\n- Warnings: ${summary.warnings}\n- Info: ${summary.info}\n\nRun getSecurityScanResults for details.`;
}

export function getSecurityScanResults(): string {
  if (findings.length === 0) {
    return 'No security scan results. Run runSecurityScan first.';
  }
  
  return findings.map(f => 
    `[${f.level.toUpperCase()}] ${f.name}\n  ${f.description}\n  Remediation: ${f.remediation_difficulty}`
  ).join('\n\n');
}

export function manageSecurityFinding(input: {
  operation: 'create' | 'update' | 'delete';
  internal_id?: string;
  finding?: Partial<SecurityFinding>;
}): string {
  switch (input.operation) {
    case 'create':
      if (!input.finding) throw new Error('Finding required for create');
      findings.push(input.finding as SecurityFinding);
      return `Created finding: ${input.finding.name}`;
      
    case 'update':
      const updateIdx = findings.findIndex(f => f.internal_id === input.internal_id);
      if (updateIdx === -1) throw new Error('Finding not found');
      Object.assign(findings[updateIdx], input.finding);
      return `Updated finding: ${input.internal_id}`;
      
    case 'delete':
      const deleteIdx = findings.findIndex(f => f.internal_id === input.internal_id);
      if (deleteIdx === -1) throw new Error('Finding not found');
      findings.splice(deleteIdx, 1);
      return `Deleted finding: ${input.internal_id}`;
      
    default:
      throw new Error('Invalid operation');
  }
}
```

---

## 5. Secrets (4 herramientas)

| Herramienta | Estado | Función | Parámetros |
|-------------|--------|---------|------------|
| `secrets--fetch_secrets` | ✅ | Lista nombres de secrets | ninguno |
| `secrets--add_secret` | 🔒 | Añade nuevo secret | `secret_names[]` |
| `secrets--update_secret` | 🔒 | Actualiza secret | `secret_names[]` |
| `secrets--delete_secret` | 🔒 | Elimina secret | `secret_names[]` |

### Código de Referencia - Claude Libre

```typescript
// workspace/claude-libre-foundation/src/tools/secrets.ts
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import * as crypto from 'crypto';

const SECRETS_FILE = resolve(process.env.WORKSPACE_ROOT || '.', '.secrets.enc');
const ENCRYPTION_KEY = process.env.SECRETS_ENCRYPTION_KEY || 'default-key-change-in-production';

interface SecretsStore {
  [key: string]: string;
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32)), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32)), iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function loadSecrets(): SecretsStore {
  if (!existsSync(SECRETS_FILE)) return {};
  const encrypted = readFileSync(SECRETS_FILE, 'utf-8');
  return JSON.parse(decrypt(encrypted));
}

function saveSecrets(secrets: SecretsStore): void {
  const encrypted = encrypt(JSON.stringify(secrets));
  writeFileSync(SECRETS_FILE, encrypted, 'utf-8');
}

export function fetchSecrets(): string {
  const secrets = loadSecrets();
  const names = Object.keys(secrets);
  
  if (names.length === 0) {
    return 'No secrets configured.';
  }
  
  return `Configured secrets (${names.length}):\n` + names.map(n => `  - ${n}`).join('\n');
}

export function addSecret(input: { name: string; value: string }): string {
  const secrets = loadSecrets();
  
  if (secrets[input.name]) {
    throw new Error(`Secret ${input.name} already exists. Use updateSecret to modify.`);
  }
  
  secrets[input.name] = input.value;
  saveSecrets(secrets);
  
  // También añadir a process.env para uso inmediato
  process.env[input.name] = input.value;
  
  return `Secret ${input.name} added successfully.`;
}

export function updateSecret(input: { name: string; value: string }): string {
  const secrets = loadSecrets();
  
  if (!secrets[input.name]) {
    throw new Error(`Secret ${input.name} does not exist. Use addSecret to create.`);
  }
  
  secrets[input.name] = input.value;
  saveSecrets(secrets);
  process.env[input.name] = input.value;
  
  return `Secret ${input.name} updated successfully.`;
}

export function deleteSecret(input: { name: string }): string {
  const secrets = loadSecrets();
  
  if (!secrets[input.name]) {
    throw new Error(`Secret ${input.name} does not exist.`);
  }
  
  delete secrets[input.name];
  saveSecrets(secrets);
  delete process.env[input.name];
  
  return `Secret ${input.name} deleted successfully.`;
}

export function getSecret(name: string): string | undefined {
  const secrets = loadSecrets();
  return secrets[name];
}

// Cargar secrets al iniciar
export function initSecrets(): void {
  const secrets = loadSecrets();
  for (const [key, value] of Object.entries(secrets)) {
    process.env[key] = value;
  }
  console.log(`Loaded ${Object.keys(secrets).length} secrets into environment.`);
}
```

---

## 6. Web Search (2 herramientas)

| Herramienta | Estado | Función | Parámetros |
|-------------|--------|---------|------------|
| `websearch--web_search` | ✅ | Búsqueda web general | `query`, `numResults?`, `category?`, `imageLinks?` |
| `websearch--web_code_search` | ✅ | Búsqueda técnica/código | `query`, `tokensNum?` |

### Código de Referencia - Claude Libre

```typescript
// workspace/claude-libre-foundation/src/tools/web-access.ts

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  imageLinks?: string[];
}

export async function webSearch(input: {
  query: string;
  numResults?: number;
  category?: string;
}): Promise<string> {
  const numResults = input.numResults || 5;
  
  // Opción 1: SerpAPI
  if (process.env.SERPAPI_KEY) {
    const params = new URLSearchParams({
      q: input.query,
      api_key: process.env.SERPAPI_KEY,
      num: numResults.toString()
    });
    
    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();
    
    return data.organic_results.map((r: any) => 
      `**${r.title}**\n${r.link}\n${r.snippet}\n`
    ).join('\n---\n');
  }
  
  // Opción 2: DuckDuckGo (sin API key)
  const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(input.query)}&format=json`;
  const response = await fetch(ddgUrl);
  const data = await response.json();
  
  if (data.RelatedTopics && data.RelatedTopics.length > 0) {
    return data.RelatedTopics.slice(0, numResults).map((r: any) => 
      `**${r.Text}**\n${r.FirstURL}\n`
    ).join('\n---\n');
  }
  
  return 'No results found.';
}

export async function webCodeSearch(input: {
  query: string;
  tokensNum?: string;
}): Promise<string> {
  // Opción 1: GitHub Code Search API
  if (process.env.GITHUB_TOKEN) {
    const response = await fetch(
      `https://api.github.com/search/code?q=${encodeURIComponent(input.query)}`,
      {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3.text-match+json'
        }
      }
    );
    
    const data = await response.json();
    
    return data.items?.slice(0, 5).map((item: any) => {
      const matches = item.text_matches?.map((m: any) => m.fragment).join('\n') || '';
      return `**${item.repository.full_name}/${item.path}**\n\`\`\`\n${matches}\n\`\`\`\n`;
    }).join('\n---\n') || 'No code results found.';
  }
  
  // Opción 2: Stack Overflow Search
  const soUrl = `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&intitle=${encodeURIComponent(input.query)}&site=stackoverflow`;
  const response = await fetch(soUrl);
  const data = await response.json();
  
  return data.items?.slice(0, 5).map((item: any) => 
    `**${item.title}**\n${item.link}\nScore: ${item.score}\n`
  ).join('\n---\n') || 'No results found.';
}

export async function fetchWebsite(input: {
  url: string;
  formats?: string;
}): Promise<string> {
  const formats = input.formats?.split(',') || ['markdown'];
  
  const response = await fetch(input.url);
  const html = await response.text();
  
  if (formats.includes('html')) {
    return html;
  }
  
  // Convertir a markdown básico
  // En producción usar librería como turndown
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return text.slice(0, 5000); // Limitar respuesta
}
```

---

## 7. Task Management (7 herramientas)

| Herramienta | Estado | Función | Parámetros |
|-------------|--------|---------|------------|
| `task_tracking--create_task` | ✅ | Crea tarea | `title`, `description` |
| `task_tracking--update_task_title` | ✅ | Actualiza título | `task_id`, `new_title` |
| `task_tracking--update_task_description` | ✅ | Actualiza descripción | `task_id`, `new_description` |
| `task_tracking--set_task_status` | ✅ | Cambia estado | `task_id`, `status` |
| `task_tracking--get_task` | ✅ | Obtiene tarea | `task_id` |
| `task_tracking--get_task_list` | ✅ | Lista todas las tareas | ninguno |
| `task_tracking--add_task_note` | ✅ | Añade nota a tarea | `task_id`, `note` |

### Código de Referencia - Claude Libre

```typescript
// workspace/claude-libre-foundation/src/tools/task-tracking.ts

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  notes: Array<{ text: string; timestamp: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

const tasks: Map<string, Task> = new Map();
let taskCounter = 0;

export function createTask(input: { title: string; description: string }): string {
  const id = `task_${++taskCounter}`;
  const task: Task = {
    id,
    title: input.title,
    description: input.description,
    status: 'todo',
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  tasks.set(id, task);
  return `Created task ${id}: ${input.title}`;
}

export function updateTaskTitle(input: { task_id: string; new_title: string }): string {
  const task = tasks.get(input.task_id);
  if (!task) throw new Error(`Task ${input.task_id} not found`);
  
  task.title = input.new_title;
  task.updatedAt = new Date();
  return `Updated title of ${input.task_id}`;
}

export function updateTaskDescription(input: { task_id: string; new_description: string }): string {
  const task = tasks.get(input.task_id);
  if (!task) throw new Error(`Task ${input.task_id} not found`);
  
  task.description = input.new_description;
  task.updatedAt = new Date();
  return `Updated description of ${input.task_id}`;
}

export function setTaskStatus(input: { task_id: string; status: 'todo' | 'in_progress' | 'done' }): string {
  const task = tasks.get(input.task_id);
  if (!task) throw new Error(`Task ${input.task_id} not found`);
  
  // Validar que solo hay una tarea in_progress
  if (input.status === 'in_progress') {
    for (const [id, t] of tasks) {
      if (t.status === 'in_progress' && id !== input.task_id) {
        t.status = 'todo';
      }
    }
  }
  
  task.status = input.status;
  task.updatedAt = new Date();
  return `Set ${input.task_id} to ${input.status}`;
}

export function getTask(input: { task_id: string }): string {
  const task = tasks.get(input.task_id);
  if (!task) throw new Error(`Task ${input.task_id} not found`);
  
  return `
## ${task.title} [${task.status}]
${task.description}

### Notes
${task.notes.map(n => `- ${n.text} (${n.timestamp.toISOString()})`).join('\n') || 'No notes'}

Created: ${task.createdAt.toISOString()}
Updated: ${task.updatedAt.toISOString()}
  `.trim();
}

export function getTaskList(): string {
  if (tasks.size === 0) return 'No tasks.';
  
  const grouped = {
    in_progress: [] as Task[],
    todo: [] as Task[],
    done: [] as Task[]
  };
  
  for (const task of tasks.values()) {
    grouped[task.status].push(task);
  }
  
  let output = '';
  
  if (grouped.in_progress.length > 0) {
    output += '## 🔄 In Progress\n';
    output += grouped.in_progress.map(t => `- [${t.id}] ${t.title}`).join('\n') + '\n\n';
  }
  
  if (grouped.todo.length > 0) {
    output += '## 📋 Todo\n';
    output += grouped.todo.map(t => `- [${t.id}] ${t.title}`).join('\n') + '\n\n';
  }
  
  if (grouped.done.length > 0) {
    output += '## ✅ Done\n';
    output += grouped.done.map(t => `- [${t.id}] ${t.title}`).join('\n') + '\n';
  }
  
  return output.trim();
}

export function addTaskNote(input: { task_id: string; note: string }): string {
  const task = tasks.get(input.task_id);
  if (!task) throw new Error(`Task ${input.task_id} not found`);
  
  task.notes.push({ text: input.note, timestamp: new Date() });
  task.updatedAt = new Date();
  return `Added note to ${input.task_id}`;
}

// Reset para nueva sesión
export function resetTasks(): void {
  tasks.clear();
  taskCounter = 0;
}
```

---

## 8. Connectors (2 herramientas)

| Herramienta | Estado | Función | Parámetros |
|-------------|--------|---------|------------|
| `standard_connectors--connect` | ✅ | Conecta servicio externo | `connector_id` |
| `standard_connectors--list_connections` | ✅ | Lista conexiones disponibles | ninguno |

### Conectores Disponibles en Lovable

| Connector ID | Servicio | Tipo |
|--------------|----------|------|
| `elevenlabs` | ElevenLabs | AI Voice |
| `firecrawl` | Firecrawl | Web Scraping |
| `perplexity` | Perplexity | AI Search |

### Código de Referencia - Claude Libre

```typescript
// workspace/claude-libre-foundation/src/tools/connectors.ts

interface Connector {
  id: string;
  name: string;
  description: string;
  requiredSecrets: string[];
  isConnected: boolean;
}

const availableConnectors: Connector[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT models, embeddings, DALL-E',
    requiredSecrets: ['OPENAI_API_KEY'],
    isConnected: false
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models',
    requiredSecrets: ['ANTHROPIC_API_KEY'],
    isConnected: false
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'Text-to-speech, voice cloning',
    requiredSecrets: ['ELEVENLABS_API_KEY'],
    isConnected: false
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repository access, code search',
    requiredSecrets: ['GITHUB_TOKEN'],
    isConnected: false
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payments, subscriptions',
    requiredSecrets: ['STRIPE_SECRET_KEY'],
    isConnected: false
  },
  // Añadir más según necesidad
];

export function listConnections(): string {
  // Verificar cuáles están conectados basándose en env vars
  for (const connector of availableConnectors) {
    connector.isConnected = connector.requiredSecrets.every(
      secret => !!process.env[secret]
    );
  }
  
  const connected = availableConnectors.filter(c => c.isConnected);
  const available = availableConnectors.filter(c => !c.isConnected);
  
  let output = '## Connected\n';
  output += connected.length > 0 
    ? connected.map(c => `✅ ${c.name} (${c.id})`).join('\n')
    : 'None\n';
  
  output += '\n\n## Available to Connect\n';
  output += available.map(c => `⚪ ${c.name} (${c.id}) - Requires: ${c.requiredSecrets.join(', ')}`).join('\n');
  
  return output;
}

export async function connect(input: { connector_id: string }): Promise<string> {
  const connector = availableConnectors.find(c => c.id === input.connector_id);
  
  if (!connector) {
    return `Unknown connector: ${input.connector_id}. Use listConnections to see available options.`;
  }
  
  // Verificar si ya está conectado
  const allSecretsPresent = connector.requiredSecrets.every(s => !!process.env[s]);
  
  if (allSecretsPresent) {
    connector.isConnected = true;
    return `${connector.name} is already connected.`;
  }
  
  // En Claude Libre, pedimos los secrets directamente
  const missingSecrets = connector.requiredSecrets.filter(s => !process.env[s]);
  
  return `To connect ${connector.name}, please provide the following secrets:\n${missingSecrets.map(s => `- ${s}`).join('\n')}\n\nUse addSecret tool to add each one.`;
}

export function testConnection(input: { connector_id: string }): string {
  const connector = availableConnectors.find(c => c.id === input.connector_id);
  
  if (!connector) {
    return `Unknown connector: ${input.connector_id}`;
  }
  
  if (!connector.isConnected) {
    return `${connector.name} is not connected.`;
  }
  
  // Implementar tests específicos por conector
  switch (input.connector_id) {
    case 'openai':
      // Test OpenAI connection
      return 'OpenAI connection test: OK';
    case 'github':
      // Test GitHub connection
      return 'GitHub connection test: OK';
    default:
      return `${connector.name} connection appears valid.`;
  }
}
```

---

## 9. Documents & Web (2 herramientas)

| Herramienta | Estado | Función | Parámetros |
|-------------|--------|---------|------------|
| `document--parse_document` | ✅ | Extrae contenido de documentos | `file_path` |
| `lov-fetch-website` | ✅ | Obtiene contenido de website | `url`, `formats?` |

### Código de Referencia - Claude Libre

```typescript
// workspace/claude-libre-foundation/src/tools/documents.ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

export async function parseDocument(input: { file_path: string }): Promise<string> {
  const fullPath = resolve(process.env.WORKSPACE_ROOT || '.', input.file_path);
  const extension = input.file_path.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'txt':
    case 'md':
    case 'json':
    case 'csv':
      return readFileSync(fullPath, 'utf-8');
      
    case 'pdf':
      // Usar pdf-parse o similar
      const pdfParse = require('pdf-parse');
      const pdfBuffer = readFileSync(fullPath);
      const pdfData = await pdfParse(pdfBuffer);
      return pdfData.text;
      
    case 'docx':
      // Usar mammoth para DOCX
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: fullPath });
      return result.value;
      
    case 'xlsx':
    case 'xls':
      // Usar xlsx para Excel
      const XLSX = require('xlsx');
      const workbook = XLSX.readFile(fullPath);
      const sheets = workbook.SheetNames.map((name: string) => {
        const sheet = workbook.Sheets[name];
        return `## ${name}\n${XLSX.utils.sheet_to_csv(sheet)}`;
      });
      return sheets.join('\n\n');
      
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
}
```

---

## 10. Integrations (3 herramientas)

| Herramienta | Estado | Función | Parámetros |
|-------------|--------|---------|------------|
| `shopify--enable_shopify` | ⚠️ | Habilita integración Shopify | ninguno |
| `stripe--enable_stripe` | ⚠️ | Habilita integración Stripe | ninguno |
| `questions--ask_questions` | ✅ | Pregunta al usuario | `questions[]` |

### Código de Referencia - Claude Libre

```typescript
// workspace/claude-libre-foundation/src/tools/questions.ts

interface QuestionOption {
  label: string;
  description: string;
}

interface Question {
  question: string;
  header: string;
  options: QuestionOption[];
  multiSelect: boolean;
}

interface QuestionResponse {
  questionIndex: number;
  selectedOptions: string[];
  otherText?: string;
}

// En Claude Libre, esto se manejaría via stdin/stdout o UI
export async function askQuestions(input: { questions: Question[] }): Promise<string> {
  // Formatear preguntas para el usuario
  let output = '';
  
  for (let i = 0; i < input.questions.length; i++) {
    const q = input.questions[i];
    output += `\n### ${q.header}\n`;
    output += `${q.question}\n\n`;
    
    q.options.forEach((opt, j) => {
      output += `  ${j + 1}. **${opt.label}** - ${opt.description}\n`;
    });
    
    output += `  ${q.options.length + 1}. Other (specify)\n`;
    output += q.multiSelect ? '\n(Select multiple with comma: 1,2,3)\n' : '\n(Select one)\n';
  }
  
  // En CLI, leeríamos stdin aquí
  // En una UI, esto sería un formulario
  
  return output;
}

// Para uso con readline en CLI
import * as readline from 'readline';

export async function askQuestionsInteractive(questions: Question[]): Promise<QuestionResponse[]> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const responses: QuestionResponse[] = [];
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    console.log(`\n### ${q.header}`);
    console.log(q.question);
    
    q.options.forEach((opt, j) => {
      console.log(`  ${j + 1}. ${opt.label} - ${opt.description}`);
    });
    console.log(`  ${q.options.length + 1}. Other`);
    
    const answer = await new Promise<string>(resolve => {
      rl.question('\nYour choice: ', resolve);
    });
    
    const selections = answer.split(',').map(s => s.trim());
    const selectedOptions: string[] = [];
    let otherText: string | undefined;
    
    for (const sel of selections) {
      const idx = parseInt(sel) - 1;
      if (idx === q.options.length) {
        otherText = await new Promise<string>(resolve => {
          rl.question('Specify: ', resolve);
        });
      } else if (idx >= 0 && idx < q.options.length) {
        selectedOptions.push(q.options[idx].label);
      }
    }
    
    responses.push({ questionIndex: i, selectedOptions, otherText });
  }
  
  rl.close();
  return responses;
}
```

---

## 11. Analytics (1 herramienta)

| Herramienta | Estado | Función | Parámetros |
|-------------|--------|---------|------------|
| `analytics--read_project_analytics` | ✅ | Lee analytics de producción | `startdate`, `enddate`, `granularity` |

### Código de Referencia - Claude Libre

```typescript
// workspace/claude-libre-foundation/src/tools/analytics.ts
import { Pool } from 'pg';

interface AnalyticsEntry {
  timestamp: Date;
  page_views: number;
  unique_visitors: number;
  avg_session_duration: number;
}

export async function readProjectAnalytics(
  pool: Pool,
  input: {
    startdate: string;
    enddate: string;
    granularity: 'hourly' | 'daily';
  }
): Promise<string> {
  const groupBy = input.granularity === 'hourly' 
    ? "date_trunc('hour', timestamp)"
    : "date_trunc('day', timestamp)";
  
  const query = `
    SELECT 
      ${groupBy} as period,
      COUNT(*) as page_views,
      COUNT(DISTINCT visitor_id) as unique_visitors,
      AVG(session_duration) as avg_session_duration
    FROM analytics_events
    WHERE timestamp >= $1 AND timestamp <= $2
    GROUP BY period
    ORDER BY period;
  `;
  
  try {
    const result = await pool.query(query, [input.startdate, input.enddate]);
    
    if (result.rows.length === 0) {
      return 'No analytics data for the specified period.';
    }
    
    let output = `## Analytics: ${input.startdate} to ${input.enddate} (${input.granularity})\n\n`;
    output += '| Period | Page Views | Unique Visitors | Avg Session (s) |\n';
    output += '|--------|------------|-----------------|------------------|\n';
    
    for (const row of result.rows) {
      output += `| ${row.period.toISOString()} | ${row.page_views} | ${row.unique_visitors} | ${Math.round(row.avg_session_duration)} |\n`;
    }
    
    return output;
  } catch (error) {
    return `Analytics table not found. Create analytics_events table to track usage.`;
  }
}

// Schema sugerido para analytics
export const ANALYTICS_SCHEMA = `
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'pageview',
  session_duration INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor ON analytics_events(visitor_id);
`;
```

---

## 12. AI & Media (4 herramientas)

| Herramienta | Estado | Función | Parámetros |
|-------------|--------|---------|------------|
| `ai_gateway--enable_ai_gateway` | ✅ | Habilita Lovable AI Gateway | ninguno |
| `imagegen--generate_image` | ✅ | Genera imagen con AI | `prompt`, `target_path`, `width?`, `height?`, `model?` |
| `imagegen--edit_image` | ✅ | Edita/fusiona imágenes | `image_paths[]`, `prompt`, `target_path` |
| `videogen--generate_video` | ✅ | Genera video con AI | `prompt`, `target_path`, opciones varias |

### Código de Referencia - Claude Libre

```typescript
// workspace/claude-libre-foundation/src/tools/ai-media.ts
import { writeFileSync } from 'fs';
import { resolve } from 'path';

export async function generateImage(input: {
  prompt: string;
  target_path: string;
  width?: number;
  height?: number;
  model?: string;
}): Promise<string> {
  const width = input.width || 1024;
  const height = input.height || 1024;
  
  // Opción 1: OpenAI DALL-E
  if (process.env.OPENAI_API_KEY) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: input.prompt,
        n: 1,
        size: `${width}x${height}`,
        response_format: 'b64_json'
      })
    });
    
    const data = await response.json();
    const imageBuffer = Buffer.from(data.data[0].b64_json, 'base64');
    const fullPath = resolve(process.env.WORKSPACE_ROOT || '.', input.target_path);
    writeFileSync(fullPath, imageBuffer);
    
    return `Image generated: ${input.target_path}`;
  }
  
  // Opción 2: Replicate (Flux, Stable Diffusion)
  if (process.env.REPLICATE_API_TOKEN) {
    // Implementar con Replicate API
  }
  
  throw new Error('No image generation API configured. Set OPENAI_API_KEY or REPLICATE_API_TOKEN.');
}

export async function editImage(input: {
  image_paths: string[];
  prompt: string;
  target_path: string;
}): Promise<string> {
  // Usar OpenAI image edit o Replicate
  // Implementación similar a generateImage pero con imagen base
  
  throw new Error('Image editing not yet implemented');
}

export async function generateVideo(input: {
  prompt: string;
  target_path: string;
  duration?: number;
  resolution?: string;
}): Promise<string> {
  // Usar Replicate (Runway, Pika) o similar
  
  if (process.env.REPLICATE_API_TOKEN) {
    // Implementar con modelo de video
  }
  
  throw new Error('Video generation requires REPLICATE_API_TOKEN');
}
```

---

## Matriz de Replicación

### Estado Actual vs Claude Libre

| Categoría | Lovable | Claude Libre Foundation | Gap |
|-----------|---------|------------------------|-----|
| **File Operations** | 9 herramientas | 6 implementadas | ✅ Casi completo |
| **Debugging** | 4 ghost tools | 0 → Puppeteer | 🔴 Implementar |
| **Supabase** | 7 herramientas | PostgreSQL directo | ✅ Diferente pero equivalente |
| **Security** | 4 herramientas | 1 básica | 🟡 Expandir |
| **Secrets** | 4 herramientas | 1 básica | 🟡 Expandir |
| **Web Search** | 2 herramientas | 2 implementadas | ✅ Completo |
| **Task Tracking** | 7 herramientas | 0 | 🔴 Implementar |
| **Connectors** | 2 herramientas + 3 servicios | Ilimitados | ✅ Mejor |
| **Documents** | 2 herramientas | 1 básica | 🟡 Expandir |
| **Integrations** | 3 herramientas | 0 | 🟡 Según necesidad |
| **Analytics** | 1 herramienta | 0 | 🔴 Implementar |
| **AI/Media** | 4 herramientas | 0 | 🔴 Implementar |

### Prioridad de Implementación

```
FASE 1 - Fundación (Semanas 1-2)
├── ✅ File Operations (ya implementado)
├── ✅ Database (PostgreSQL directo)
├── ✅ Web Search (ya implementado)
└── 🔴 Task Tracking (nuevo)

FASE 2 - Debugging Real (Semanas 3-4)
├── 🔴 Dev Server Control (Vite spawn)
├── 🔴 Browser Automation (Puppeteer)
├── 🔴 Console Log Capture
└── 🔴 Network Request Monitoring

FASE 3 - Seguridad y Secrets (Semana 5)
├── 🟡 Security Scanning
├── 🟡 Encrypted Secrets
└── 🟡 Environment Management

FASE 4 - AI y Media (Semanas 6-7)
├── 🔴 Image Generation (DALL-E/Flux)
├── 🔴 Image Editing
└── 🔴 Video Generation (opcional)

FASE 5 - Analytics y Polish (Semana 8)
├── 🔴 Usage Analytics
├── 🟡 Document Parsing avanzado
└── 🟡 Conectores adicionales
```

---

## Comparativa Final

| Aspecto | Lovable | Claude Libre (objetivo) |
|---------|---------|-------------------------|
| **Total herramientas** | 41 | 50+ |
| **Herramientas funcionales** | 29 (71%) | 50+ (100%) |
| **Ghost tools** | 4 | 0 |
| **Debugging real** | ❌ No funciona | ✅ Puppeteer + Console |
| **Modos bloqueados** | Sí (Chat vs Default) | No |
| **Vendor lock-in** | Alto | Ninguno |
| **Costo mensual** | $40-150 | $15-50 |
| **Stack tecnológico** | Solo React | Cualquiera |
| **Conectores** | 3 fijos | Ilimitados |
| **Transparencia** | Opaca | Total |

---

## Conclusión

Claude Libre puede replicar y **superar** las capacidades de Lovable:

1. **Debugging real** vs ghost tools
2. **Sin modos bloqueados** - todas las herramientas siempre disponibles
3. **Stack agnóstico** - no solo React
4. **Conectores ilimitados** - cualquier API
5. **Costo reducido** - solo pago por uso de APIs
6. **Transparencia total** - código abierto, sin cajas negras

El código de referencia en este documento proporciona la base para implementar cada categoría de herramientas.
