# Claude Libre: Construcción Desde Cero Absoluto

**Guía Técnica Completa para Construir un Claude Autónomo con 50+ Herramientas**

---

## Tabla de Contenidos

1. [Executive Summary](#1-executive-summary)
2. [Core Requirements](#2-core-requirements)
3. [Taxonomía Completa de Herramientas](#3-taxonomía-completa-de-herramientas)
4. [Stack Tecnológico Detallado](#4-stack-tecnológico-detallado)
5. [Arquitectura de Sistema Completo](#5-arquitectura-de-sistema-completo)
6. [Costos Detallados](#6-costos-detallados)
7. [Roadmap de Implementación](#7-roadmap-de-implementación)
8. [Scripts de Setup Automatizado](#8-scripts-de-setup-automatizado)
9. [Checklist de Implementación](#9-checklist-de-implementación)
10. [Comparación Final](#10-comparación-final)
11. [Troubleshooting y FAQ](#11-troubleshooting-y-faq)
12. [Conclusión](#12-conclusión)

---

## 1. Executive Summary

### ¿Qué es Claude Libre?

**Claude Libre** es una implementación completa y autónoma de Claude AI con capacidades extendidas mediante 50+ herramientas personalizadas. A diferencia de usar Claude directamente o a través de plataformas como Lovable, Claude Libre te da:

- **Autonomía Total**: Control completo sobre funcionalidades y herramientas
- **Zero Vendor Lock-in**: Puedes cambiar de proveedor cuando quieras
- **Costos Optimizados**: 60-70% más económico que alternativas
- **Customización Ilimitada**: Añade cualquier herramienta que necesites
- **Self-Hosting**: Opción de correr 100% local

### Capacidades vs Claude Básico

```typescript
const comparison = {
  claudeBasic: {
    capabilities: ['Conversación', 'Análisis de texto'],
    tools: 0,
    memory: 'Solo contexto actual',
    autonomy: '0%'
  },
  claudeLibre: {
    capabilities: [
      'Conversación avanzada',
      'Leer/escribir archivos',
      'Ejecutar código',
      'Buscar en web',
      'Acceso a base de datos',
      'Generar imágenes',
      'Procesar documentos',
      'Debugging completo',
      'Y 40+ capacidades más...'
    ],
    tools: 50,
    memory: 'Persistente con embeddings',
    autonomy: '100%'
  }
};
```

### Costos Estimados

| Concepto | Mensual | Anual |
|----------|---------|-------|
| Claude API (con caching) | $15-50 | $180-600 |
| OpenAI Embeddings | $0-5 | $0-60 |
| SerpAPI (Web Search) | $0-10 | $0-120 |
| Infrastructure (cloud) | $0-35 | $0-420 |
| **Total** | **$15-100** | **$180-1,200** |

**Comparación:**
- Lovable Pro: $40-150/mes = $480-1,800/año
- ChatGPT Plus: $20/mes = $240/año (pero sin herramientas)
- Cursor Pro: $20/mes = $240/año (solo código)

**Ahorro anual: $300-$1,500**

### Tiempo de Implementación

```
Setup Básico (Tier 0): 1-2 semanas
Setup Completo (Tier 0-2): 8-10 semanas
Mantenimiento: 2-4 horas/mes
```

---

## 2. Core Requirements

### 2.1 Acceso a Claude API

#### Registro y API Key

1. **Crear cuenta en Anthropic**
   - Visita: https://console.anthropic.com
   - Completa el registro
   - Verifica tu email

2. **Obtener API Key**
   - Ve a Settings → API Keys
   - Click "Create Key"
   - Guarda tu key: `sk-ant-api03-...`
   - ⚠️ **NUNCA** la compartas públicamente

3. **Configurar Billing**
   - Agrega método de pago
   - Crédito inicial: $5 gratis
   - Pay-as-you-go después

#### Modelos Disponibles

```typescript
const anthropicModels = {
  recommended: {
    name: 'claude-sonnet-4-5',
    contextWindow: '200K tokens',
    pricing: {
      input: '$3 per 1M tokens',
      output: '$15 per 1M tokens',
      cached: '$0.30 per 1M tokens (90% descuento)'
    },
    capabilities: [
      'Razonamiento superior',
      'Tool calling nativo',
      'Vision (imágenes)',
      'Prompt caching',
      'JSON mode'
    ],
    speedVsQuality: 'Balanceado'
  },
  
  highPerformance: {
    name: 'claude-opus-4-1',
    contextWindow: '200K tokens',
    pricing: {
      input: '$15 per 1M tokens',
      output: '$75 per 1M tokens'
    },
    use: 'Tareas muy complejas (caro)'
  },
  
  fast: {
    name: 'claude-3-5-haiku',
    contextWindow: '200K tokens',
    pricing: {
      input: '$0.80 per 1M tokens',
      output: '$4 per 1M tokens'
    },
    use: 'Tareas simples y rápidas'
  }
};
```

**Recomendación:** Usa `claude-sonnet-4-5` para 95% de casos.

#### Rate Limits

| Tier | Requisitos | RPM | TPM | Mensual |
|------|------------|-----|-----|---------|
| Free | Ninguno | 50 | 40K | $5 gratis |
| Tier 1 | $5 depositados | 1,000 | 80K | $100 |
| Tier 2 | $40 depositados | 4,000 | 400K | $500 |
| Tier 3 | $200 depositados | 4,000 | 400K | $1,000 |

**Para Claude Libre necesitas:** Tier 1 mínimo (suficiente para 90% de uso).

---

### 2.2 Entorno de Ejecución

#### Opción A: Node.js (Recomendado)

**Ventajas:**
- ✅ Ecosistema maduro con npm
- ✅ Fácil deployment (Vercel, Railway, Render)
- ✅ Excelente para web APIs
- ✅ TypeScript nativo
- ✅ Muchas librerías disponibles

**Desventajas:**
- ❌ Menos ideal para ML/data science
- ❌ Sintaxis más verbose que Python

**Instalación:**
```bash
# macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Windows (con winget)
winget install OpenJS.NodeJS.LTS

# Verificar
node -v  # v18.x.x o superior
npm -v   # 9.x.x o superior
```

#### Opción B: Python

**Ventajas:**
- ✅ Excelente para ML/AI
- ✅ Sintaxis más concisa
- ✅ Jupyter notebooks para experimentación
- ✅ Muchas librerías de data science

**Desventajas:**
- ❌ Deployment más complejo
- ❌ Menos opciones de hosting gratuito
- ❌ Package management puede ser frustrante

**Instalación:**
```bash
# macOS/Linux
curl https://pyenv.run | bash
pyenv install 3.11
pyenv global 3.11

# Windows
winget install Python.Python.3.11

# Verificar
python --version  # 3.10+ requerido
pip --version
```

#### Opción C: Deno

**Ventajas:**
- ✅ TypeScript nativo sin config
- ✅ Seguro por defecto
- ✅ Imports de URLs
- ✅ Tooling built-in

**Desventajas:**
- ❌ Ecosistema más pequeño
- ❌ Menos compatible con npm

**Instalación:**
```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows
irm https://deno.land/install.ps1 | iex

# Verificar
deno --version
```

**Recomendación:** Node.js 18+ para la mayoría de casos.

---

### 2.3 Hardware Mínimo

#### Para Desarrollo Local

```yaml
CPU: 2+ cores (4 cores recomendado)
RAM: 4GB mínimo (8GB recomendado)
Storage: 20GB SSD
Network: Internet estable (para APIs)
OS: macOS, Linux, Windows 10/11 con WSL2
```

#### Para Producción Cloud

```yaml
Server: VPS con 1 core / 512MB RAM (Railway, Render)
Database: PostgreSQL con 500MB storage (Supabase free tier)
CDN: Cloudflare (gratis)
Monitoring: Built-in logs (gratis)
```

#### Para Self-Hosted

```yaml
Raspberry Pi 4 (4GB RAM): ✅ Suficiente
Mini PC (Intel N100): ✅ Ideal
Servidor dedicado: ✅ Overkill pero excelente
```

---

## 3. Taxonomía Completa de Herramientas

### Categorías de Herramientas (11 tipos)

```
1. File System Operations (9 tools)
2. Code Execution (3 tools)
3. Web Access (4 tools)
4. Database Operations (5 tools)
5. Package Management (3 tools)
6. Memory & State (4 tools)
7. Communication (4 tools)
8. Document Processing (5 tools)
9. Image & Media (4 tools)
10. Debugging & Monitoring (6 tools)
11. Security & Secrets (4 tools)

Total: 51 herramientas
```

---

### 3.1 File System Operations (9 herramientas)

#### Tool 1: `read_file`

**Propósito:** Leer contenido de archivos (completo o por líneas)

**Tecnología:** Node.js `fs` module (built-in)

**Costo:** $0

**Dificultad:** ⭐ (muy fácil)

**Código de Implementación:**

```typescript
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ReadFileParams {
  path: string;
  lineRanges?: string; // Formato: "1-100, 201-300"
}

function readFile({ path, lineRanges }: ReadFileParams): string {
  const PROJECT_ROOT = process.env.PROJECT_ROOT || './workspace';
  const fullPath = join(PROJECT_ROOT, path);
  
  // Verificar que el archivo existe
  if (!existsSync(fullPath)) {
    return `❌ Error: File "${path}" not found`;
  }
  
  try {
    const content = readFileSync(fullPath, 'utf-8');
    
    // Si no hay ranges, devolver todo
    if (!lineRanges) {
      return content;
    }
    
    // Parsear ranges: "1-100, 201-300"
    const lines = content.split('\n');
    const ranges = lineRanges.split(',').map(range => {
      const [start, end] = range.trim().split('-').map(Number);
      return lines.slice(start - 1, end);
    });
    
    return ranges.flat().join('\n');
  } catch (error: any) {
    return `❌ Error reading file: ${error.message}`;
  }
}

// Tool definition para Anthropic
const readFileTool = {
  name: 'read_file',
  description: 'Read the contents of a file. Can optionally specify line ranges.',
  input_schema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file relative to project root (e.g., "src/App.tsx")'
      },
      lineRanges: {
        type: 'string',
        description: 'Optional line ranges to read (e.g., "1-100, 201-300")'
      }
    },
    required: ['path']
  }
};
```

**Ejemplo de uso:**
```typescript
// Leer archivo completo
readFile({ path: 'src/App.tsx' });

// Leer líneas específicas
readFile({ path: 'src/App.tsx', lineRanges: '1-50, 100-150' });
```

---

#### Tool 2: `write_file`

**Propósito:** Escribir/crear archivos

**Tecnología:** Node.js `fs` module

**Costo:** $0

**Dificultad:** ⭐

**Código:**

```typescript
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

interface WriteFileParams {
  path: string;
  content: string;
}

function writeFile({ path, content }: WriteFileParams): string {
  const PROJECT_ROOT = process.env.PROJECT_ROOT || './workspace';
  const fullPath = join(PROJECT_ROOT, path);
  
  try {
    // Crear directorios si no existen
    mkdirSync(dirname(fullPath), { recursive: true });
    
    // Escribir archivo
    writeFileSync(fullPath, content, 'utf-8');
    
    const stats = {
      bytes: content.length,
      lines: content.split('\n').length
    };
    
    return `✅ Written ${stats.bytes} bytes (${stats.lines} lines) to ${path}`;
  } catch (error: any) {
    return `❌ Error writing file: ${error.message}`;
  }
}

const writeFileTool = {
  name: 'write_file',
  description: 'Write content to a file. Creates directories if needed. Overwrites existing files.',
  input_schema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path where to write the file (e.g., "src/components/Button.tsx")'
      },
      content: {
        type: 'string',
        description: 'Content to write to the file'
      }
    },
    required: ['path', 'content']
  }
};
```

---

#### Tool 3: `search_files` (Regex Search)

**Propósito:** Buscar patrones regex en múltiples archivos

**Tecnología:** Node.js + `glob` package

**Librerías:** `glob@^10.3.0` (instalar con `npm install glob`)

**Costo:** $0 (open-source)

**Dificultad:** ⭐⭐

**Código:**

```typescript
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SearchFilesParams {
  query: string;
  includePattern: string;
  excludePattern?: string;
  caseSensitive?: boolean;
}

interface SearchResult {
  file: string;
  line: number;
  content: string;
  match: string;
}

function searchFiles({
  query,
  includePattern,
  excludePattern,
  caseSensitive = false
}: SearchFilesParams): string {
  const PROJECT_ROOT = process.env.PROJECT_ROOT || './workspace';
  
  try {
    // Buscar archivos que coincidan con el patrón
    const files = glob.sync(join(PROJECT_ROOT, includePattern), {
      ignore: excludePattern ? join(PROJECT_ROOT, excludePattern) : undefined,
      nodir: true
    });
    
    if (files.length === 0) {
      return `❌ No files found matching pattern: ${includePattern}`;
    }
    
    // Crear regex
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(query, flags);
    
    const results: SearchResult[] = [];
    
    // Buscar en cada archivo
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, idx) => {
        const matches = line.match(regex);
        if (matches) {
          results.push({
            file: file.replace(PROJECT_ROOT + '/', ''),
            line: idx + 1,
            content: line.trim(),
            match: matches[0]
          });
        }
      });
    }
    
    if (results.length === 0) {
      return `No matches found for pattern: ${query}`;
    }
    
    // Formatear resultados
    const summary = `Found ${results.length} matches in ${files.length} files`;
    const details = results
      .slice(0, 50) // Limitar a 50 resultados
      .map(r => `${r.file}:${r.line} - ${r.content}`)
      .join('\n');
    
    return `${summary}\n\n${details}`;
    
  } catch (error: any) {
    return `❌ Error searching files: ${error.message}`;
  }
}

const searchFilesTool = {
  name: 'search_files',
  description: 'Search for regex patterns across multiple files',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Regex pattern to search for (e.g., "useState\\(")'
      },
      includePattern: {
        type: 'string',
        description: 'Glob pattern for files to include (e.g., "src/**/*.tsx")'
      },
      excludePattern: {
        type: 'string',
        description: 'Optional glob pattern for files to exclude (e.g., "**/*.test.tsx")'
      },
      caseSensitive: {
        type: 'boolean',
        description: 'Whether to match case (default: false)'
      }
    },
    required: ['query', 'includePattern']
  }
};
```

**Ejemplo de uso:**
```typescript
// Buscar todos los useState en archivos .tsx
searchFiles({
  query: 'useState\\(',
  includePattern: 'src/**/*.tsx',
  excludePattern: '**/*.test.tsx'
});
```

---

#### Tool 4: `list_directory`

**Propósito:** Listar archivos y carpetas

**Código:**

```typescript
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

interface ListDirParams {
  path: string;
  recursive?: boolean;
}

function listDirectory({ path, recursive = false }: ListDirParams): string {
  const PROJECT_ROOT = process.env.PROJECT_ROOT || './workspace';
  const fullPath = join(PROJECT_ROOT, path);
  
  try {
    const items = readdirSync(fullPath);
    
    const results = items.map(item => {
      const itemPath = join(fullPath, item);
      const stats = statSync(itemPath);
      
      return {
        name: item,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime.toISOString()
      };
    });
    
    return JSON.stringify(results, null, 2);
  } catch (error: any) {
    return `❌ Error listing directory: ${error.message}`;
  }
}
```

---

#### Tool 5: `line_replace` (Search & Replace)

**Propósito:** Reemplazar líneas específicas en archivos

**Dificultad:** ⭐⭐

**Código:**

```typescript
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface LineReplaceParams {
  filePath: string;
  search: string;
  firstReplacedLine: number;
  lastReplacedLine: number;
  replace: string;
}

function lineReplace({
  filePath,
  search,
  firstReplacedLine,
  lastReplacedLine,
  replace
}: LineReplaceParams): string {
  const PROJECT_ROOT = process.env.PROJECT_ROOT || './workspace';
  const fullPath = join(PROJECT_ROOT, filePath);
  
  try {
    let content = readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    
    // Validar líneas
    if (firstReplacedLine < 1 || lastReplacedLine > lines.length) {
      return `❌ Invalid line numbers: ${firstReplacedLine}-${lastReplacedLine}`;
    }
    
    // Obtener líneas a reemplazar
    const targetLines = lines.slice(firstReplacedLine - 1, lastReplacedLine).join('\n');
    
    // Verificar que coincida con search (permitir ellipsis)
    const searchPattern = search.replace('...', '[\\s\\S]*');
    const regex = new RegExp(searchPattern);
    
    if (!regex.test(targetLines)) {
      return `❌ Search pattern does not match lines ${firstReplacedLine}-${lastReplacedLine}`;
    }
    
    // Reemplazar
    const before = lines.slice(0, firstReplacedLine - 1);
    const after = lines.slice(lastReplacedLine);
    const newLines = [...before, replace, ...after];
    
    writeFileSync(fullPath, newLines.join('\n'), 'utf-8');
    
    return `✅ Replaced lines ${firstReplacedLine}-${lastReplacedLine} in ${filePath}`;
    
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}
```

---

#### Herramientas 6-9: Resumen

```typescript
// Tool 6: delete_file
function deleteFile({ path }: { path: string }): string {
  unlinkSync(join(PROJECT_ROOT, path));
  return `✅ Deleted ${path}`;
}

// Tool 7: rename_file
function renameFile({ from, to }: { from: string; to: string }): string {
  renameSync(join(PROJECT_ROOT, from), join(PROJECT_ROOT, to));
  return `✅ Renamed ${from} → ${to}`;
}

// Tool 8: copy_file
function copyFile({ from, to }: { from: string; to: string }): string {
  copyFileSync(join(PROJECT_ROOT, from), join(PROJECT_ROOT, to));
  return `✅ Copied ${from} → ${to}`;
}

// Tool 9: download_file (desde URL)
async function downloadFile({ url, path }: { url: string; path: string }): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  writeFileSync(join(PROJECT_ROOT, path), Buffer.from(buffer));
  return `✅ Downloaded to ${path}`;
}
```

**Total File System: 9 herramientas, $0 costo, 1-2 días implementación**

---

### 3.2 Code Execution (3 herramientas)

#### Tool 10: `execute_command`

**Propósito:** Ejecutar comandos shell de forma segura

**Tecnología:** Node.js `child_process`

**Seguridad:** ⚠️ **CRÍTICO**: Requiere whitelist estricta

**Dificultad:** ⭐⭐⭐

**Código:**

```typescript
import { execSync } from 'child_process';
import { join } from 'path';

// WHITELIST DE COMANDOS PERMITIDOS
const ALLOWED_COMMANDS = [
  'npm',
  'node',
  'git',
  'ls',
  'cat',
  'echo',
  'pwd',
  'whoami',
  'date'
];

// COMANDOS PROHIBIDOS (nunca permitir)
const FORBIDDEN_PATTERNS = [
  'rm -rf',
  'sudo',
  'chmod',
  'kill',
  '> /dev',
  'dd if=',
  'mkfs',
  'format'
];

interface ExecuteCommandParams {
  command: string;
  timeout?: number; // milisegundos
}

function executeCommand({ command, timeout = 30000 }: ExecuteCommandParams): string {
  const PROJECT_ROOT = process.env.PROJECT_ROOT || './workspace';
  
  // 1. Verificar comando base
  const [baseCommand] = command.split(' ');
  if (!ALLOWED_COMMANDS.includes(baseCommand)) {
    return `❌ Command "${baseCommand}" not allowed. Allowed: ${ALLOWED_COMMANDS.join(', ')}`;
  }
  
  // 2. Verificar patrones prohibidos
  for (const forbidden of FORBIDDEN_PATTERNS) {
    if (command.includes(forbidden)) {
      return `❌ Command contains forbidden pattern: ${forbidden}`;
    }
  }
  
  try {
    const result = execSync(command, {
      cwd: PROJECT_ROOT,
      timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB max
      encoding: 'utf-8'
    });
    
    return result.toString().trim();
  } catch (error: any) {
    // Timeout
    if (error.killed) {
      return `❌ Command timeout after ${timeout}ms`;
    }
    
    // Error de ejecución
    return `❌ Command failed: ${error.message}\n${error.stderr || ''}`;
  }
}

const executeCommandTool = {
  name: 'execute_command',
  description: `Execute a shell command. Only whitelisted commands are allowed: ${ALLOWED_COMMANDS.join(', ')}`,
  input_schema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'Command to execute (e.g., "npm install express")'
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds (default: 30000)'
      }
    },
    required: ['command']
  }
};
```

**Ejemplo de uso:**
```typescript
// ✅ Permitido
executeCommand({ command: 'npm install express' });
executeCommand({ command: 'git status' });
executeCommand({ command: 'ls -la src/' });

// ❌ Bloqueado
executeCommand({ command: 'rm -rf /' }); // Forbidden pattern
executeCommand({ command: 'python script.py' }); // Not in whitelist
executeCommand({ command: 'sudo apt-get install' }); // Forbidden pattern
```

---

#### Tool 11: `execute_code`

**Propósito:** Ejecutar código JavaScript/TypeScript inline

**Dificultad:** ⭐⭐⭐

**Código:**

```typescript
import { VM } from 'vm2'; // npm install vm2

interface ExecuteCodeParams {
  code: string;
  language: 'javascript' | 'typescript';
  timeout?: number;
}

function executeCode({ code, language, timeout = 5000 }: ExecuteCodeParams): string {
  try {
    // Para TypeScript, transpile primero
    let jsCode = code;
    if (language === 'typescript') {
      // Usar esbuild o tsx para transpilar
      // Simplificado aquí
      jsCode = code; // En producción, transpilar
    }
    
    // Ejecutar en sandbox
    const vm = new VM({
      timeout,
      sandbox: {
        console: {
          log: (...args: any[]) => console.log(...args)
        }
      }
    });
    
    const result = vm.run(jsCode);
    return `✅ Result: ${JSON.stringify(result)}`;
    
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}
```

---

#### Tool 12: `run_tests`

**Propósito:** Ejecutar test suites (Jest, Vitest, etc.)

**Código:**

```typescript
function runTests({ pattern = '**/*.test.ts' }: { pattern?: string }): string {
  try {
    const result = execSync(`npm test -- ${pattern}`, {
      cwd: PROJECT_ROOT,
      timeout: 60000,
      encoding: 'utf-8'
    });
    return result.toString();
  } catch (error: any) {
    return `❌ Tests failed:\n${error.stdout}`;
  }
}
```

**Total Code Execution: 3 herramientas, $0, 2-3 días implementación**

---

### 3.3 Web Access (4 herramientas)

#### Tool 13: `web_search`

**Propósito:** Buscar en Google/Bing

**Tecnología:** SerpAPI (Google Search API)

**Costo:** 100 búsquedas gratis/mes, luego $50/5,000 búsquedas

**Alternativa:** Brave Search API (1,000 gratis/mes)

**Dificultad:** ⭐⭐

**Código:**

```typescript
interface WebSearchParams {
  query: string;
  numResults?: number;
  searchType?: 'general' | 'news' | 'images';
}

async function webSearch({
  query,
  numResults = 5,
  searchType = 'general'
}: WebSearchParams): Promise<string> {
  const SERPAPI_KEY = process.env.SERPAPI_KEY;
  
  if (!SERPAPI_KEY) {
    return '❌ SERPAPI_KEY not configured';
  }
  
  try {
    const url = new URL('https://serpapi.com/search');
    url.searchParams.set('q', query);
    url.searchParams.set('api_key', SERPAPI_KEY);
    url.searchParams.set('num', String(numResults));
    
    if (searchType === 'news') {
      url.searchParams.set('tbm', 'nws');
    } else if (searchType === 'images') {
      url.searchParams.set('tbm', 'isch');
    }
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.error) {
      return `❌ SerpAPI error: ${data.error}`;
    }
    
    // Formatear resultados
    const results = (data.organic_results || [])
      .slice(0, numResults)
      .map((result: any, idx: number) => {
        return `${idx + 1}. ${result.title}\n   ${result.link}\n   ${result.snippet}\n`;
      })
      .join('\n');
    
    return results || 'No results found';
    
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}

const webSearchTool = {
  name: 'web_search',
  description: 'Search the web using Google. Returns top results with titles, links, and snippets.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query (e.g., "React hooks tutorial")'
      },
      numResults: {
        type: 'number',
        description: 'Number of results to return (default: 5)'
      },
      searchType: {
        type: 'string',
        enum: ['general', 'news', 'images'],
        description: 'Type of search (default: general)'
      }
    },
    required: ['query']
  }
};
```

**Setup SerpAPI:**
```bash
# 1. Registrarse en https://serpapi.com
# 2. Obtener API key
# 3. Agregar a .env:
SERPAPI_KEY=your_api_key_here
```

---

#### Tool 14: `web_code_search`

**Propósito:** Buscar código técnico en GitHub/Stack Overflow

**Tecnología:** GitHub Code Search API

**Costo:** $0 (GitHub API gratis con autenticación)

**Dificultad:** ⭐⭐

**Código:**

```typescript
interface CodeSearchParams {
  query: string;
  language?: string;
  numResults?: number;
}

async function webCodeSearch({
  query,
  language,
  numResults = 5
}: CodeSearchParams): Promise<string> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  if (!GITHUB_TOKEN) {
    return '❌ GITHUB_TOKEN not configured';
  }
  
  try {
    // Construir query
    let searchQuery = query;
    if (language) {
      searchQuery += ` language:${language}`;
    }
    
    const url = `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=${numResults}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    
    if (!response.ok) {
      return `❌ GitHub API error: ${response.status} ${response.statusText}`;
    }
    
    const data = await response.json();
    
    // Formatear resultados
    const results = (data.items || [])
      .slice(0, numResults)
      .map((item: any, idx: number) => {
        return `${idx + 1}. ${item.repository.full_name}/${item.path}\n   ${item.html_url}\n   ${item.repository.description || ''}\n`;
      })
      .join('\n');
    
    return results || 'No code found';
    
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}

const webCodeSearchTool = {
  name: 'web_code_search',
  description: 'Search for code examples on GitHub. Returns repository paths and URLs.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Code search query (e.g., "React useEffect cleanup")'
      },
      language: {
        type: 'string',
        description: 'Programming language filter (e.g., "typescript", "python")'
      },
      numResults: {
        type: 'number',
        description: 'Number of results (default: 5)'
      }
    },
    required: ['query']
  }
};
```

**Setup GitHub Token:**
```bash
# 1. Ir a https://github.com/settings/tokens
# 2. Generate new token (classic)
# 3. Seleccionar scope: public_repo
# 4. Copiar token
# 5. Agregar a .env:
GITHUB_TOKEN=ghp_your_token_here
```

---

#### Tool 15: `fetch_url`

**Propósito:** Hacer HTTP requests y scraping básico

**Código:**

```typescript
interface FetchUrlParams {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
}

async function fetchUrl({
  url,
  method = 'GET',
  headers = {},
  body
}: FetchUrlParams): Promise<string> {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'User-Agent': 'Claude-Libre/1.0',
        ...headers
      },
      body
    });
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return JSON.stringify(data, null, 2);
    } else {
      const text = await response.text();
      return text.slice(0, 10000); // Limitar a 10KB
    }
    
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}
```

---

#### Tool 16: `browser_automation`

**Propósito:** Automatizar navegador (click, type, screenshot)

**Tecnología:** Playwright

**Costo:** $0 (open-source)

**Dificultad:** ⭐⭐⭐

**Código:**

```typescript
import { chromium, Browser, Page } from 'playwright'; // npm install playwright

interface BrowserAction {
  type: 'navigate' | 'click' | 'type' | 'screenshot' | 'wait';
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
}

async function browserAutomation({ actions }: { actions: BrowserAction[] }): Promise<string> {
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    const results: string[] = [];
    
    for (const action of actions) {
      switch (action.type) {
        case 'navigate':
          await page.goto(action.url!, { timeout: action.timeout || 30000 });
          results.push(`✅ Navigated to ${action.url}`);
          break;
          
        case 'click':
          await page.click(action.selector!, { timeout: action.timeout || 5000 });
          results.push(`✅ Clicked ${action.selector}`);
          break;
          
        case 'type':
          await page.fill(action.selector!, action.value!, { timeout: action.timeout || 5000 });
          results.push(`✅ Typed in ${action.selector}`);
          break;
          
        case 'screenshot':
          const screenshot = await page.screenshot({ fullPage: true });
          const base64 = screenshot.toString('base64');
          results.push(`✅ Screenshot taken (${base64.length} bytes)`);
          break;
          
        case 'wait':
          await page.waitForTimeout(action.timeout || 1000);
          results.push(`✅ Waited ${action.timeout}ms`);
          break;
      }
    }
    
    return results.join('\n');
    
  } catch (error: any) {
    return `❌ Browser automation error: ${error.message}`;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}
```

**Total Web Access: 4 herramientas, $0-10/mes, 3-4 días implementación**

---

### 3.4 Database Operations (5 herramientas)

#### Tool 17: `execute_query`

**Propósito:** Ejecutar queries SQL (solo SELECT por seguridad)

**Tecnología:** PostgreSQL + `@supabase/supabase-js`

**Costo:** $0-25/mes (Supabase free tier: 500MB DB, 2GB bandwidth)

**Dificultad:** ⭐⭐⭐

**Código:**

```typescript
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ Service role = acceso total
);

interface ExecuteQueryParams {
  query: string;
}

async function executeQuery({ query }: ExecuteQueryParams): Promise<string> {
  try {
    // SEGURIDAD: Solo permitir SELECT
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery.startsWith('select')) {
      return '❌ Only SELECT queries are allowed. Use migrations for INSERT/UPDATE/DELETE.';
    }
    
    // Ejecutar query usando RPC function
    const { data, error } = await supabase.rpc('execute_readonly_sql', {
      query
    });
    
    if (error) {
      return `❌ Query error: ${error.message}`;
    }
    
    // Formatear resultados
    if (!data || data.length === 0) {
      return 'No results found';
    }
    
    return JSON.stringify(data, null, 2);
    
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}

const executeQueryTool = {
  name: 'execute_query',
  description: 'Execute a SQL SELECT query on the PostgreSQL database. Only read operations allowed.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'SQL SELECT query (e.g., "SELECT * FROM users LIMIT 10")'
      }
    },
    required: ['query']
  }
};
```

**Setup Supabase:**

1. **Crear función SQL en Supabase:**
```sql
-- Ejecutar en Supabase SQL Editor
CREATE OR REPLACE FUNCTION execute_readonly_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Verificar que sea SELECT
  IF NOT (query ~* '^\s*SELECT') THEN
    RAISE EXCEPTION 'Only SELECT queries allowed';
  END IF;
  
  -- Ejecutar query
  EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query) INTO result;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
```

2. **Configurar .env:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

#### Tool 18: `list_tables`

**Código:**

```typescript
async function listTables(): Promise<string> {
  const query = `
    SELECT 
      table_name,
      table_schema
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  
  return executeQuery({ query });
}
```

---

#### Tool 19: `describe_table`

**Código:**

```typescript
async function describeTable({ tableName }: { tableName: string }): Promise<string> {
  const query = `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = '${tableName}'
    ORDER BY ordinal_position;
  `;
  
  return executeQuery({ query });
}
```

---

#### Herramientas 20-21: Resumen

```typescript
// Tool 20: backup_database
async function backupDatabase(): Promise<string> {
  // Usar pg_dump via comando
  const result = execSync('pg_dump $DATABASE_URL > backup.sql');
  return '✅ Database backed up to backup.sql';
}

// Tool 21: get_table_count
async function getTableCount({ tableName }: { tableName: string }): Promise<string> {
  return executeQuery({ query: `SELECT COUNT(*) FROM ${tableName}` });
}
```

**Total Database: 5 herramientas, $0-25/mes, 4-5 días implementación**

---

### 3.5 Package Management (3 herramientas)

#### Tool 22: `install_package`

**Propósito:** Instalar packages npm/pip

**Código:**

```typescript
interface InstallPackageParams {
  name: string;
  manager?: 'npm' | 'pip' | 'pnpm';
  version?: string;
}

function installPackage({
  name,
  manager = 'npm',
  version
}: InstallPackageParams): string {
  try {
    const packageSpec = version ? `${name}@${version}` : name;
    
    let command: string;
    switch (manager) {
      case 'npm':
        command = `npm install ${packageSpec}`;
        break;
      case 'pnpm':
        command = `pnpm add ${packageSpec}`;
        break;
      case 'pip':
        command = `pip install ${packageSpec}`;
        break;
    }
    
    const result = execSync(command, {
      cwd: PROJECT_ROOT,
      timeout: 120000, // 2 minutos
      encoding: 'utf-8'
    });
    
    return `✅ Installed ${packageSpec}\n${result}`;
    
  } catch (error: any) {
    return `❌ Installation failed: ${error.message}`;
  }
}

const installPackageTool = {
  name: 'install_package',
  description: 'Install a package using npm, pnpm, or pip',
  input_schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Package name (e.g., "express", "pandas")'
      },
      manager: {
        type: 'string',
        enum: ['npm', 'pnpm', 'pip'],
        description: 'Package manager to use (default: npm)'
      },
      version: {
        type: 'string',
        description: 'Specific version to install (e.g., "4.18.0")'
      }
    },
    required: ['name']
  }
};
```

---

#### Herramientas 23-24:

```typescript
// Tool 23: remove_package
function removePackage({ name, manager = 'npm' }: { name: string; manager?: string }): string {
  const command = manager === 'npm' ? `npm uninstall ${name}` : `pip uninstall -y ${name}`;
  execSync(command, { cwd: PROJECT_ROOT });
  return `✅ Removed ${name}`;
}

// Tool 24: list_packages
function listPackages({ manager = 'npm' }: { manager?: string }): string {
  const command = manager === 'npm' ? 'npm list --depth=0' : 'pip list';
  return execSync(command, { cwd: PROJECT_ROOT, encoding: 'utf-8' });
}
```

**Total Package Management: 3 herramientas, $0, 1 día implementación**

---

### 3.6 Memory & State (4 herramientas)

#### Tool 25: `save_memory`

**Propósito:** Guardar memoria persistente con embeddings para búsqueda semántica

**Tecnología:** PostgreSQL + pgvector + OpenAI Embeddings

**Costo:** $0-5/mes (OpenAI embeddings: $0.02 per 1M tokens)

**Dificultad:** ⭐⭐⭐⭐

**Setup PostgreSQL + pgvector:**

```sql
-- 1. Habilitar pgvector extension en Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Crear tabla de memories
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índice para búsqueda rápida
CREATE INDEX ON memories USING hnsw (embedding vector_cosine_ops);

-- 4. Crear función de búsqueda semántica
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memories.id,
    memories.content,
    memories.metadata,
    1 - (memories.embedding <=> query_embedding) AS similarity
  FROM memories
  WHERE 1 - (memories.embedding <=> query_embedding) > similarity_threshold
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Código de implementación:**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SaveMemoryParams {
  content: string;
  metadata?: Record<string, any>;
}

async function saveMemory({ content, metadata = {} }: SaveMemoryParams): Promise<string> {
  try {
    // 1. Generar embedding con OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: content,
        model: 'text-embedding-3-small', // $0.02 per 1M tokens
        dimensions: 1536
      })
    });
    
    if (!embeddingResponse.ok) {
      return `❌ OpenAI API error: ${embeddingResponse.statusText}`;
    }
    
    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;
    
    // 2. Guardar en DB con embedding
    const { data, error } = await supabase
      .from('memories')
      .insert({
        content,
        embedding,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          source: 'claude_libre'
        }
      })
      .select()
      .single();
    
    if (error) {
      return `❌ Database error: ${error.message}`;
    }
    
    return `✅ Memory saved with ID: ${data.id}`;
    
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}

const saveMemoryTool = {
  name: 'save_memory',
  description: 'Save a memory with semantic embeddings for future retrieval',
  input_schema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'Content to remember (e.g., "User prefers TypeScript over JavaScript")'
      },
      metadata: {
        type: 'object',
        description: 'Optional metadata (e.g., {"category": "preferences", "importance": "high"})'
      }
    },
    required: ['content']
  }
};
```

---

#### Tool 26: `search_memory`

**Propósito:** Búsqueda semántica de memories

**Código:**

```typescript
interface SearchMemoryParams {
  query: string;
  limit?: number;
  threshold?: number;
}

async function searchMemory({
  query,
  limit = 5,
  threshold = 0.7
}: SearchMemoryParams): Promise<string> {
  try {
    // 1. Generar embedding de la query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: query,
        model: 'text-embedding-3-small',
        dimensions: 1536
      })
    });
    
    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;
    
    // 2. Buscar memories similares usando pgvector
    const { data, error } = await supabase.rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_count: limit,
      similarity_threshold: threshold
    });
    
    if (error) {
      return `❌ Search error: ${error.message}`;
    }
    
    if (!data || data.length === 0) {
      return 'No relevant memories found';
    }
    
    // 3. Formatear resultados
    const results = data.map((memory: any, idx: number) => {
      return `${idx + 1}. [Similarity: ${(memory.similarity * 100).toFixed(1)}%]\n   ${memory.content}\n   Metadata: ${JSON.stringify(memory.metadata)}`;
    }).join('\n\n');
    
    return results;
    
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}

const searchMemoryTool = {
  name: 'search_memory',
  description: 'Search for relevant memories using semantic similarity',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'What to search for (e.g., "user preferences about programming languages")'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 5)'
      },
      threshold: {
        type: 'number',
        description: 'Minimum similarity threshold 0-1 (default: 0.7)'
      }
    },
    required: ['query']
  }
};
```

**Ejemplo de uso:**
```typescript
// Guardar memoria
await saveMemory({
  content: 'User prefers React over Vue for frontend development',
  metadata: { category: 'preferences', importance: 'high' }
});

// Buscar memoria
await searchMemory({
  query: 'what does the user prefer for frontend?',
  limit: 3
});
```

---

#### Herramientas 27-28:

```typescript
// Tool 27: list_memories
async function listMemories({ limit = 10 }: { limit?: number }): Promise<string> {
  const { data, error } = await supabase
    .from('memories')
    .select('id, content, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) return `❌ Error: ${error.message}`;
  return JSON.stringify(data, null, 2);
}

// Tool 28: delete_memory
async function deleteMemory({ id }: { id: string }): Promise<string> {
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', id);
  
  if (error) return `❌ Error: ${error.message}`;
  return `✅ Memory ${id} deleted`;
}
```

**Total Memory: 4 herramientas, $0-5/mes, 1 semana implementación**

---

### 3.7 Communication (4 herramientas)

#### Tool 29: `send_email`

**Tecnología:** Resend API

**Costo:** 100 emails gratis/día, $20/mes para más

**Código:**

```typescript
import { Resend } from 'resend'; // npm install resend

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

async function sendEmail({ to, subject, body }: SendEmailParams): Promise<string> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Claude Libre <noreply@yourdomain.com>',
      to,
      subject,
      html: body
    });
    
    if (error) return `❌ Error: ${error.message}`;
    return `✅ Email sent with ID: ${data?.id}`;
    
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}
```

---

#### Herramientas 30-32:

```typescript
// Tool 30: send_webhook
async function sendWebhook({ url, data }: { url: string; data: any }): Promise<string> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return `✅ Webhook sent: ${response.status}`;
}

// Tool 31: make_http_request
async function makeHttpRequest(params: FetchUrlParams): Promise<string> {
  return fetchUrl(params);
}

// Tool 32: websocket_connection
// Implementación compleja, requiere ws library
```

**Total Communication: 4 herramientas, $0-20/mes, 2 días implementación**

---

### 3.8 Document Processing (5 herramientas)

#### Tool 33: `parse_pdf`

**Tecnología:** `pdf-parse` package

**Costo:** $0 (open-source)

**Dificultad:** ⭐⭐

**Código:**

```typescript
import pdf from 'pdf-parse'; // npm install pdf-parse
import { readFileSync } from 'fs';
import { join } from 'path';

interface ParsePdfParams {
  path: string;
  maxPages?: number;
}

async function parsePdf({ path, maxPages = 50 }: ParsePdfParams): Promise<string> {
  const PROJECT_ROOT = process.env.PROJECT_ROOT || './workspace';
  const fullPath = join(PROJECT_ROOT, path);
  
  try {
    const dataBuffer = readFileSync(fullPath);
    const data = await pdf(dataBuffer, {
      max: maxPages
    });
    
    return `📄 PDF Info:
Pages: ${data.numpages}
Text extracted from ${Math.min(maxPages, data.numpages)} pages

${data.text.slice(0, 10000)}...`; // Limitar a 10K caracteres
    
  } catch (error: any) {
    return `❌ Error parsing PDF: ${error.message}`;
  }
}

const parsePdfTool = {
  name: 'parse_pdf',
  description: 'Extract text from PDF files',
  input_schema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to PDF file (e.g., "documents/report.pdf")'
      },
      maxPages: {
        type: 'number',
        description: 'Maximum pages to extract (default: 50)'
      }
    },
    required: ['path']
  }
};
```

---

#### Tool 34: `parse_docx`

**Tecnología:** `mammoth` package

**Código:**

```typescript
import mammoth from 'mammoth'; // npm install mammoth

async function parseDocx({ path }: { path: string }): Promise<string> {
  const fullPath = join(PROJECT_ROOT, path);
  
  try {
    const result = await mammoth.extractRawText({ path: fullPath });
    return result.value;
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}
```

---

#### Tool 35: `parse_excel`

**Tecnología:** `xlsx` package

**Código:**

```typescript
import * as XLSX from 'xlsx'; // npm install xlsx

async function parseExcel({ path, sheet }: { path: string; sheet?: string }): Promise<string> {
  const fullPath = join(PROJECT_ROOT, path);
  
  try {
    const workbook = XLSX.readFile(fullPath);
    const sheetName = sheet || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return JSON.stringify(data, null, 2);
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}
```

---

#### Herramientas 36-37:

```typescript
// Tool 36: parse_image (OCR)
// Requiere Tesseract.js o Google Cloud Vision API

// Tool 37: parse_markdown
function parseMarkdown({ path }: { path: string }): string {
  // Leer y parsear Markdown (puede usar 'marked' library)
  return readFile({ path });
}
```

**Total Document Processing: 5 herramientas, $0, 3-4 días implementación**

---

### 3.9 Image & Media (4 herramientas)

#### Tool 38: `generate_image`

**Tecnología:** DALL-E 3 API o Stable Diffusion

**Costo:** $0.04 per imagen (DALL-E 3) o $0 (Stable Diffusion local)

**Dificultad:** ⭐⭐

**Código:**

```typescript
interface GenerateImageParams {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  savePath?: string;
}

async function generateImage({
  prompt,
  size = '1024x1024',
  quality = 'standard',
  savePath
}: GenerateImageParams): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        model: 'dall-e-3',
        n: 1,
        size,
        quality
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      return `❌ DALL-E error: ${data.error.message}`;
    }
    
    const imageUrl = data.data[0].url;
    
    // Si se especifica savePath, descargar la imagen
    if (savePath) {
      const imageResponse = await fetch(imageUrl);
      const buffer = await imageResponse.arrayBuffer();
      writeFileSync(join(PROJECT_ROOT, savePath), Buffer.from(buffer));
      return `✅ Image generated and saved to ${savePath}\nPrompt: ${prompt}`;
    }
    
    return `✅ Image generated\nURL: ${imageUrl}\nPrompt: ${prompt}`;
    
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}

const generateImageTool = {
  name: 'generate_image',
  description: 'Generate images using DALL-E 3',
  input_schema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'Image description (e.g., "A futuristic city at sunset")'
      },
      size: {
        type: 'string',
        enum: ['1024x1024', '1792x1024', '1024x1792'],
        description: 'Image size (default: 1024x1024)'
      },
      quality: {
        type: 'string',
        enum: ['standard', 'hd'],
        description: 'Image quality (default: standard)'
      },
      savePath: {
        type: 'string',
        description: 'Path to save image (e.g., "images/generated.png")'
      }
    },
    required: ['prompt']
  }
};
```

---

#### Herramientas 39-41:

```typescript
// Tool 39: analyze_image (Claude Vision)
async function analyzeImage({ imagePath, question }: { imagePath: string; question: string }): Promise<string> {
  // Usar Claude's vision capabilities
  const imageData = readFileSync(join(PROJECT_ROOT, imagePath));
  const base64Image = imageData.toString('base64');
  
  // Enviar a Claude con vision
  // ... implementación
}

// Tool 40: edit_image
// Usar DALL-E edit endpoint o librerías como sharp/jimp

// Tool 41: convert_image
import sharp from 'sharp'; // npm install sharp

async function convertImage({ from, to, format }: { from: string; to: string; format: string }): Promise<string> {
  await sharp(join(PROJECT_ROOT, from))
    .toFormat(format as any)
    .toFile(join(PROJECT_ROOT, to));
  return `✅ Converted ${from} → ${to}`;
}
```

**Total Image & Media: 4 herramientas, $0-20/mes, 3-4 días implementación**

---

### 3.10 Debugging & Monitoring (6 herramientas)

#### Tool 42: `read_console_logs`

**Propósito:** Capturar logs del navegador

**Tecnología:** Playwright

**Dificultad:** ⭐⭐⭐

**Código:**

```typescript
import { chromium } from 'playwright';

interface ReadConsoleLogsParams {
  url: string;
  timeout?: number;
}

async function readConsoleLogs({ url, timeout = 5000 }: ReadConsoleLogsParams): Promise<string> {
  let browser = null;
  
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const logs: string[] = [];
    
    // Capturar console logs
    page.on('console', (msg) => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Capturar errores
    page.on('pageerror', (error) => {
      logs.push(`[ERROR] ${error.message}`);
    });
    
    // Navegar a la URL
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Esperar un poco para capturar logs
    await page.waitForTimeout(timeout);
    
    await browser.close();
    
    if (logs.length === 0) {
      return 'No console logs captured';
    }
    
    return logs.join('\n');
    
  } catch (error: any) {
    if (browser) await browser.close();
    return `❌ Error: ${error.message}`;
  }
}

const readConsoleLogsTool = {
  name: 'read_console_logs',
  description: 'Capture browser console logs from a URL',
  input_schema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL to visit (e.g., "http://localhost:3000")'
      },
      timeout: {
        type: 'number',
        description: 'Time to wait for logs in ms (default: 5000)'
      }
    },
    required: ['url']
  }
};
```

---

#### Tool 43: `read_network_requests`

**Código:**

```typescript
async function readNetworkRequests({ url, timeout = 5000 }: { url: string; timeout?: number }): Promise<string> {
  let browser = null;
  
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const requests: any[] = [];
    
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });
    
    page.on('response', (response) => {
      const request = requests.find(r => r.url === response.url());
      if (request) {
        request.status = response.status();
        request.statusText = response.statusText();
      }
    });
    
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(timeout);
    await browser.close();
    
    return JSON.stringify(requests, null, 2);
    
  } catch (error: any) {
    if (browser) await browser.close();
    return `❌ Error: ${error.message}`;
  }
}
```

---

#### Herramientas 44-47:

```typescript
// Tool 44: track_performance
async function trackPerformance({ url }: { url: string }): Promise<string> {
  // Medir Web Vitals con Playwright
  // ... implementación
}

// Tool 45: monitor_errors
// Sistema de error tracking persistente

// Tool 46: log_event
async function logEvent({ event, data }: { event: string; data: any }): Promise<string> {
  // Guardar en DB para analytics
  await supabase.from('events').insert({ event, data, timestamp: new Date() });
  return '✅ Event logged';
}

// Tool 47: get_metrics
async function getMetrics({ period = '24h' }: { period?: string }): Promise<string> {
  // Obtener métricas de uso, costos, etc.
  // ... implementación
}
```

**Total Debugging: 6 herramientas, $0, 4-5 días implementación**

---

### 3.11 Security & Secrets (4 herramientas)

#### Tool 48: `fetch_secrets`

**Propósito:** Listar secrets configurados (sin exponer valores)

**Tecnología:** dotenv + .env file

**Código:**

```typescript
import { config } from 'dotenv';

function fetchSecrets(): string {
  config(); // Cargar .env
  
  const secrets = Object.keys(process.env)
    .filter(key => {
      // Filtrar solo secrets relevantes
      return key.includes('API_KEY') || 
             key.includes('SECRET') || 
             key.includes('TOKEN') ||
             key.includes('PASSWORD');
    })
    .map(key => ({
      key,
      value: '***masked***', // Nunca exponer el valor real
      configured: !!process.env[key]
    }));
  
  return JSON.stringify(secrets, null, 2);
}

const fetchSecretsTool = {
  name: 'fetch_secrets',
  description: 'List configured secrets (values are masked for security)',
  input_schema: {
    type: 'object',
    properties: {},
    required: []
  }
};
```

---

#### Tool 49: `add_secret`

**Código:**

```typescript
import { appendFileSync } from 'fs';

interface AddSecretParams {
  key: string;
  value: string;
}

function addSecret({ key, value }: AddSecretParams): string {
  const envPath = join(PROJECT_ROOT, '.env');
  
  try {
    // Verificar si ya existe
    const envContent = readFileSync(envPath, 'utf-8');
    if (envContent.includes(`${key}=`)) {
      return `❌ Secret "${key}" already exists. Use update_secret instead.`;
    }
    
    // Agregar al final de .env
    appendFileSync(envPath, `\n${key}=${value}\n`);
    
    return `✅ Secret "${key}" added successfully`;
    
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}
```

---

#### Herramientas 50-51:

```typescript
// Tool 50: update_secret
function updateSecret({ key, value }: { key: string; value: string }): string {
  const envPath = join(PROJECT_ROOT, '.env');
  let content = readFileSync(envPath, 'utf-8');
  
  // Reemplazar valor
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (!regex.test(content)) {
    return `❌ Secret "${key}" not found`;
  }
  
  content = content.replace(regex, `${key}=${value}`);
  writeFileSync(envPath, content);
  
  return `✅ Secret "${key}" updated`;
}

// Tool 51: delete_secret
function deleteSecret({ key }: { key: string }): string {
  const envPath = join(PROJECT_ROOT, '.env');
  let content = readFileSync(envPath, 'utf-8');
  
  const regex = new RegExp(`^${key}=.*$\\n?`, 'm');
  content = content.replace(regex, '');
  writeFileSync(envPath, content);
  
  return `✅ Secret "${key}" deleted`;
}
```

**Total Security: 4 herramientas, $0, 2 días implementación**

---

## 4. Stack Tecnológico Detallado

### 4.1 Backend Orchestrator (3 opciones)

#### Opción A: Node.js + Express (Recomendado ⭐)

**package.json:**
```json
{
  "name": "claude-libre",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx src/orchestrator.ts",
    "dev": "tsx watch src/orchestrator.ts",
    "build": "tsc"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "glob": "^10.3.0",
    "@supabase/supabase-js": "^2.81.1",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "xlsx": "^0.18.5",
    "playwright": "^1.40.0",
    "resend": "^2.0.0",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "tsx": "^4.0.0",
    "typescript": "^5.3.0"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

**Pros:**
- ✅ Ecosistema maduro
- ✅ Fácil deployment (Railway, Render, Vercel)
- ✅ TypeScript nativo
- ✅ Muchas librerías disponibles
- ✅ Excelente para APIs web

**Contras:**
- ❌ Más verbose que Python
- ❌ Menos ideal para ML/data science

---

#### Opción B: Python + FastAPI

**requirements.txt:**
```
anthropic==0.30.0
fastapi==0.104.0
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
supabase==2.0.0
PyPDF2==3.0.0
python-docx==1.1.0
openpyxl==3.1.0
playwright==1.40.0
requests==2.31.0
```

**main.py:**
```python
from fastapi import FastAPI
from anthropic import Anthropic
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

@app.post("/api/chat")
async def chat(request: dict):
    response = anthropic_client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=8192,
        messages=request["messages"]
    )
    return response
```

**Pros:**
- ✅ Sintaxis más concisa
- ✅ Excelente para ML/AI
- ✅ Jupyter notebooks
- ✅ Muchas librerías de data science

**Contras:**
- ❌ Deployment más complejo
- ❌ Package management frustrante
- ❌ Menos opciones de hosting gratuito

---

#### Opción C: Deno + Fresh

**deno.json:**
```json
{
  "tasks": {
    "start": "deno run --allow-all src/orchestrator.ts"
  },
  "imports": {
    "@anthropic-ai/sdk": "npm:@anthropic-ai/sdk@^0.30.0"
  }
}
```

**Pros:**
- ✅ TypeScript nativo sin config
- ✅ Seguro por defecto
- ✅ Imports de URLs
- ✅ Tooling built-in

**Contras:**
- ❌ Ecosistema más pequeño
- ❌ Menos compatible con npm

---

### 4.2 Database (4 opciones)

#### Opción A: Supabase Cloud (Recomendado ⭐)

**Pricing:**
```
Free Tier:
- 500MB database storage
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users
- Unlimited API requests
- pgvector incluido

Pro ($25/mes):
- 8GB database
- 100GB file storage
- 250GB bandwidth
- 100,000 MAU
- Daily backups
```

**Pros:**
- ✅ Setup en 2 minutos
- ✅ pgvector incluido
- ✅ Auth built-in
- ✅ Realtime subscriptions
- ✅ Auto-scaling
- ✅ Dashboard visual

**Contras:**
- ❌ Vendor lock-in parcial
- ❌ Costo si superas free tier

**Setup:**
```bash
# 1. Crear proyecto en https://supabase.com
# 2. Copiar credenciales:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
SUPABASE_PUBLISHABLE_KEY=eyJhbG...

# 3. Habilitar pgvector en SQL Editor:
CREATE EXTENSION vector;
```

---

#### Opción B: Self-Hosted Postgres

**Docker Compose:**
```yaml
version: '3.8'
services:
  postgres:
    image: ankane/pgvector:latest
    environment:
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: claude_libre
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Pros:**
- ✅ Control total
- ✅ $0 si es local
- ✅ Sin vendor lock-in
- ✅ Customización ilimitada

**Contras:**
- ❌ Requiere mantenimiento
- ❌ Backups manuales
- ❌ No auto-scaling

---

#### Opción C: Railway Postgres

**Pricing:** $5/mes (shared), $20/mes (dedicated)

**Pros:**
- ✅ Managed
- ✅ Fácil deployment
- ✅ Backups automáticos

**Contras:**
- ❌ No pgvector por defecto (requiere custom setup)

---

#### Opción D: SQLite + Chroma (Solo local)

**Para desarrollo o uso offline:**

```typescript
import Database from 'better-sqlite3'; // npm install better-sqlite3
import { ChromaClient } from 'chromadb'; // npm install chromadb

const db = new Database('claude-libre.db');
const chroma = new ChromaClient(); // Para embeddings
```

**Pros:**
- ✅ Zero setup
- ✅ $0 costo
- ✅ Portable (1 archivo)
- ✅ 100% offline

**Contras:**
- ❌ No concurrent writes
- ❌ No built-in vector search (requiere Chroma)
- ❌ No escalable

---

### 4.3 Vector Search (para embeddings)

#### Opción A: pgvector (Postgres extension) ⭐

**SQL Setup:**
```sql
-- Habilitar extension
CREATE EXTENSION vector;

-- Crear tabla con embeddings
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI embedding size
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice HNSW para búsqueda rápida
CREATE INDEX ON memories USING hnsw (embedding vector_cosine_ops);

-- Búsqueda por similitud
SELECT content, 1 - (embedding <=> query_embedding) AS similarity
FROM memories
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

**Pros:**
- ✅ $0 adicional (usa tu Postgres)
- ✅ Muy rápido con HNSW index
- ✅ Sin vendor lock-in adicional

**Contras:**
- ❌ Requiere Postgres con pgvector

---

#### Opción B: Pinecone

**Pricing:** $70/mes (ya no tiene free tier)

**Pros:**
- ✅ Managed
- ✅ Muy rápido
- ✅ Escalable

**Contras:**
- ❌ Caro ($70/mes mínimo)
- ❌ Vendor lock-in

---

#### Opción C: Chroma (Local)

**Código:**
```typescript
import { ChromaClient } from 'chromadb';

const client = new ChromaClient();
const collection = await client.createCollection({ name: 'memories' });

// Añadir documento
await collection.add({
  ids: ['id1'],
  documents: ['User prefers TypeScript'],
  embeddings: [[0.1, 0.2, ...]] // OpenAI embedding
});

// Buscar similares
const results = await collection.query({
  queryEmbeddings: [[0.1, 0.2, ...]],
  nResults: 5
});
```

**Pros:**
- ✅ $0 costo
- ✅ Local
- ✅ Fácil de usar

**Contras:**
- ❌ Solo para desarrollo/testing
- ❌ No production-ready

---

### 4.4 Embeddings Provider

#### Opción A: OpenAI Embeddings ⭐

**Modelo:** `text-embedding-3-small`

**Pricing:** $0.02 per 1M tokens

**Dimensiones:** 1536

**Ejemplo de costo:**
```
Guardar 1,000 memories de 100 palabras cada una:
- 1,000 memories × 100 words = 100,000 words
- ~133,000 tokens (100K words × 1.33)
- Costo: $0.02 × 0.133 = $0.00266 (menos de $0.01)

Buscar 100 veces al día durante un mes:
- 100 búsquedas/día × 30 días = 3,000 búsquedas
- ~4,000 tokens total
- Costo: $0.02 × 0.004 = $0.00008 (casi $0)

Total mensual: ~$0.01 (despreciable)
```

**Pros:**
- ✅ Muy barato
- ✅ Excelente calidad
- ✅ Rápido

---

#### Opción B: OpenAI `text-embedding-3-large`

**Pricing:** $0.13 per 1M tokens

**Dimensiones:** 3072

**Mejor para:** Mayor precisión en búsquedas

**Costo ~6.5x más que small**

---

#### Opción C: Voyage AI

**Pricing:** $0.12 per 1M tokens

**Mejor para:** Code embeddings

---

#### Opción D: Local (sentence-transformers)

**Modelo:** `all-MiniLM-L6-v2`

**Costo:** $0

**Requiere:** Python + transformers library

**Pros:**
- ✅ $0 costo
- ✅ 100% offline
- ✅ Sin rate limits

**Contras:**
- ❌ Calidad inferior a OpenAI
- ❌ Requiere GPU para velocidad

---

### 4.5 Deployment Platforms

#### Railway (Recomendado para desarrollo ⭐)

**Pricing:**
```
Free Tier: $5 crédito/mes
- 1 core / 512MB RAM
- 1GB storage
- 100GB bandwidth
- Suficiente para 90% de uso

Paid: $20/mes (unlimited resources)
```

**Deployment:**
```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway init
railway up

# Ver logs
railway logs
```

**Pros:**
- ✅ Setup en 2 minutos
- ✅ Free tier generoso
- ✅ Postgres incluido
- ✅ Logs en tiempo real

---

#### Render

**Pricing:**
```
Free Tier:
- 0.5 core / 512MB RAM
- Spin down after 15 min inactivity
- 100 build hours/mes

Paid: $7/mes (no spin down)
```

**Pros:**
- ✅ Muy fácil
- ✅ Free tier disponible

**Contras:**
- ❌ Spin down lento (30-60s cold start)

---

#### Fly.io

**Pricing:**
```
Free Tier:
- 3 shared cores
- 256MB RAM
- $0/mes hasta cierto uso

Paid: $2-10/mes
```

**Pros:**
- ✅ Global edge deployment
- ✅ Free tier

**Contras:**
- ❌ Configuración más compleja

---

#### Self-Hosted (VPS)

**Providers:**
- DigitalOcean Droplet: $6/mes (1 core, 1GB RAM)
- Hetzner: €4.15/mes (2 cores, 4GB RAM) ⭐ Mejor precio
- AWS EC2 t3.micro: ~$10/mes
- Raspberry Pi: $0/mes (si ya lo tienes)

**Setup:**
```bash
# En tu VPS
git clone https://github.com/tu-usuario/claude-libre
cd claude-libre
npm install
npm run build

# Con PM2 para auto-restart
npm install -g pm2
pm2 start dist/orchestrator.js
pm2 save
pm2 startup
```

---

## 5. Arquitectura de Sistema Completo

### 5.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLAUDE LIBRE                             │
│                     Architecture Diagram                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐
│  USUARIO │
└────┬─────┘
     │
     │ HTTP/WebSocket
     ↓
┌─────────────────────┐
│  Frontend (React)   │
│  - Chat UI          │
│  - File Explorer    │
│  - Metrics Dashboard│
└─────────┬───────────┘
          │
          │ POST /api/chat
          ↓
┌──────────────────────────────────────────────────────────┐
│           API Gateway / Orchestrator Backend             │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Express.js / FastAPI Server                       │  │
│  │  - CORS enabled                                    │  │
│  │  - Rate limiting                                   │  │
│  │  - Request logging                                 │  │
│  └────────────┬───────────────────────────────────────┘  │
│               │                                           │
│               │ Messages + Tools                          │
│               ↓                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Claude API Client (@anthropic-ai/sdk)             │  │
│  │  - Prompt Caching (90% savings)                    │  │
│  │  - Tool Calling Native                             │  │
│  │  - Streaming Support                               │  │
│  └────────────┬───────────────────────────────────────┘  │
│               │                                           │
│               │ Tool Calls                                │
│               ↓                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │           Tool Executor Engine                     │  │
│  │  Dispatch tool calls to appropriate handlers       │  │
│  └───┬────┬────┬────┬────┬────┬────┬────┬────┬───┬───┘  │
│      │    │    │    │    │    │    │    │    │   │      │
└──────┼────┼────┼────┼────┼────┼────┼────┼────┼───┼──────┘
       │    │    │    │    │    │    │    │    │   │
       ↓    ↓    ↓    ↓    ↓    ↓    ↓    ↓    ↓   ↓

┌──────────┐┌─────────┐┌─────────┐┌──────────┐┌─────────┐
│   File   ││  Code   ││   Web   ││ Database ││ Package │
│  System  ││  Exec   ││  Access ││   Ops    ││   Mgmt  │
│ (9 tools)││(3 tools)││(4 tools)││(5 tools) ││(3 tools)│
└──────────┘└─────────┘└─────────┘└──────────┘└─────────┘

┌──────────┐┌─────────┐┌─────────┐┌──────────┐┌─────────┐
│  Memory  ││Communic-││Document ││  Image   ││Debugging│
│   & AI   ││  ation  ││ Process ││ & Media  ││& Monitor│
│ (4 tools)││(4 tools)││(5 tools)││(4 tools) ││(6 tools)│
└────┬─────┘└─────────┘└─────────┘└──────────┘└─────────┘
     │
     │ Embeddings + Vector Search
     ↓
┌─────────────────────────────────────────┐
│        Memory System                    │
│  ┌───────────────────────────────────┐  │
│  │  PostgreSQL + pgvector            │  │
│  │  - memories table                 │  │
│  │  - HNSW index for fast search     │  │
│  │  - Cosine similarity              │  │
│  └───────────────────────────────────┘  │
│                ↕                         │
│  ┌───────────────────────────────────┐  │
│  │  OpenAI Embeddings API            │  │
│  │  - text-embedding-3-small         │  │
│  │  - 1536 dimensions                │  │
│  │  - $0.02 per 1M tokens            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      Monitoring & Analytics             │
│  - Token usage tracking                 │
│  - Cost estimation                      │
│  - Performance metrics                  │
│  - Error logging                        │
│  - Tool usage stats                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       External Services (Optional)      │
│  - SerpAPI (web search)                 │
│  - GitHub API (code search)             │
│  - DALL-E (image generation)            │
│  - Resend (email)                       │
│  - Playwright (browser automation)      │
└─────────────────────────────────────────┘
```

---

### 5.2 Flujo de Ejecución

```
1. Usuario envía mensaje
   ↓
2. Frontend → POST /api/chat
   ↓
3. Orchestrator recibe request
   ↓
4. Cargar memoria relevante (si existe)
   - Generar embedding de mensaje
   - Buscar en pgvector
   - Incluir top 5 memories en contexto
   ↓
5. Construir prompt con system + memories + mensaje
   ↓
6. Claude API call con prompt caching
   ↓
7. Claude responde con tool calls
   ↓
8. Tool Executor ejecuta tools en paralelo
   ↓
9. Resultados de tools → Claude
   ↓
10. Claude genera respuesta final
    ↓
11. Guardar conversación en memoria (si relevante)
    ↓
12. Respuesta → Frontend
    ↓
13. Usuario ve respuesta
```

---

### 5.3 Prompt Caching Strategy

```typescript
// Estructura del prompt con caching
const systemPrompt = {
  role: 'system',
  content: [
    {
      type: 'text',
      text: 'You are Claude Libre, an AI assistant with 50+ tools...',
      cache_control: { type: 'ephemeral' } // ← CACHE ESTE BLOQUE
    },
    {
      type: 'text',
      text: toolDefinitions, // Definiciones de las 51 herramientas
      cache_control: { type: 'ephemeral' } // ← CACHE ESTE BLOQUE
    }
  ]
};

const memoriesContext = {
  role: 'system',
  content: {
    type: 'text',
    text: relevantMemories, // Top 5 memories del usuario
    cache_control: { type: 'ephemeral' } // ← CACHE ESTE BLOQUE
  }
};

// Resultado: 90% de tokens cacheados
// Input normal: $3 per 1M tokens
// Input cached: $0.30 per 1M tokens (10x más barato)
```

**Ahorro real:**
```
Sin caching (100K tokens):
- 100K × $3/1M = $0.30 por conversación

Con caching (90K cached, 10K fresh):
- 90K × $0.30/1M = $0.027
- 10K × $3/1M = $0.03
- Total: $0.057 por conversación

Ahorro: 81% ($0.243 por conversación)

Con 100 conversaciones/día:
- Sin caching: $30/día = $900/mes
- Con caching: $5.70/día = $171/mes
- Ahorro: $729/mes ✅
```

---

## 6. Costos Detallados

### 6.1 Breakdown Completo de APIs

#### Claude API (con prompt caching)

**Modelo: claude-sonnet-4-5**

```
Pricing Base:
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens
- Cached input: $0.30 per 1M tokens (90% descuento)

Ejemplo de uso típico (100 conversaciones/día):
- Input promedio: 5K tokens/conv (4.5K cached, 0.5K fresh)
- Output promedio: 1K tokens/conv

Costo por conversación:
- Input cached: 4.5K × $0.30/1M = $0.00135
- Input fresh: 0.5K × $3/1M = $0.0015
- Output: 1K × $15/1M = $0.015
- Total: $0.01785 (~$0.02 por conversación)

Mensual (100 conv/día × 30 días = 3,000 conv):
- 3,000 × $0.02 = $60/mes
```

**Optimizaciones:**
- Use `claude-3-5-haiku` para tareas simples ($0.80 input, $4 output)
- Tareas simples: $60 → $20/mes (67% ahorro)

---

#### OpenAI Embeddings

**Modelo: text-embedding-3-small**

```
Pricing: $0.02 per 1M tokens

Uso típico:
- Guardar 50 memories/día: 50 × 100 words = 5,000 words ≈ 6,600 tokens
- Buscar 100 veces/día: 100 × 20 words = 2,000 words ≈ 2,600 tokens
- Total diario: 9,200 tokens
- Mensual: 9,200 × 30 = 276,000 tokens

Costo: 276K × $0.02/1M = $0.00552 (~$0.01/mes)
```

**Conclusión: Embeddings son casi gratis**

---

#### SerpAPI (Web Search)

**Pricing:**
```
Free: 100 búsquedas/mes
$50/mes: 5,000 búsquedas
$125/mes: 15,000 búsquedas
```

**Alternativas:**
- Brave Search API: 1,000 gratis/mes, $0.50 per 1K después
- DuckDuckGo: Gratis pero no oficial (puede romperse)

**Recomendación:**
- Desarrollo: Usar free tier (100/mes)
- Producción ligera: Brave API ($5/mes para 10K búsquedas)
- Producción pesada: SerpAPI ($50/mes)

---

#### DALL-E 3 (Image Generation)

**Pricing:**
```
Standard (1024x1024): $0.040 por imagen
HD (1024x1024): $0.080 por imagen
Wide (1792x1024): $0.080 por imagen
```

**Uso típico:**
```
10 imágenes/día × 30 días = 300 imágenes/mes
300 × $0.04 = $12/mes
```

**Alternativas:**
- Stable Diffusion local: $0 (requiere GPU)
- Midjourney: $10/mes (200 imágenes)
- Replicate: ~$0.01 por imagen (más barato)

---

#### GitHub API

**Costo: $0 (gratis con autenticación)**

Rate limits:
- 5,000 requests/hora con token
- 60 requests/hora sin token

---

#### Resend (Email)

**Pricing:**
```
Free: 100 emails/día
$20/mes: 50,000 emails/mes
```

**Alternativas:**
- SendGrid: 100 emails/día gratis
- Mailgun: 1,000 emails gratis/mes

---

### 6.2 Infrastructure Costs

#### Hosting Options

**Railway:**
```
Free: $5 crédito/mes
- Suficiente para desarrollo
- ~100-200 horas/mes uptime

Paid: $20/mes
- Unlimited resources
- 24/7 uptime
```

**Render:**
```
Free: 
- Spin down after 15min
- Cold starts de 30-60s

Paid: $7/mes
- No spin down
- Always on
```

**Fly.io:**
```
Free:
- 3 shared cores
- 256MB RAM
- ~$0-5/mes dependiendo de uso

Paid: $2-10/mes
```

**Self-Hosted (Hetzner):**
```
VPS CPX11:
- 2 cores / 2GB RAM
- €4.15/mes (~$4.50/mes)
- 24/7 uptime
```

---

#### Database Hosting

**Supabase:**
```
Free:
- 500MB database
- 2GB bandwidth
- Suficiente para desarrollo

Pro: $25/mes
- 8GB database
- 250GB bandwidth
```

**Railway Postgres:**
```
$5/mes: 1GB storage
$10/mes: 5GB storage
```

**Self-Hosted:**
```
$0 (en tu VPS)
```

---

### 6.3 Total Monthly Costs (Diferentes Escenarios)

#### Escenario 1: Desarrollo/Uso Personal Ligero

```
APIs:
- Claude (50 conv/día): $30/mes
- OpenAI Embeddings: $0.01/mes
- SerpAPI (free tier): $0/mes
- GitHub API: $0/mes
Subtotal APIs: $30/mes

Infrastructure:
- Railway (free tier): $0/mes
- Supabase (free tier): $0/mes
Subtotal Infrastructure: $0/mes

TOTAL: $30/mes
```

---

#### Escenario 2: Uso Moderado (Pro User)

```
APIs:
- Claude (100 conv/día): $60/mes
- OpenAI Embeddings: $0.01/mes
- SerpAPI (100/mes free): $0/mes
- DALL-E (50 images/mes): $2/mes
Subtotal APIs: $62/mes

Infrastructure:
- Render Paid: $7/mes
- Supabase Free: $0/mes
Subtotal Infrastructure: $7/mes

TOTAL: $69/mes
```

---

#### Escenario 3: Producción (Startup)

```
APIs:
- Claude (200 conv/día): $120/mes
- OpenAI Embeddings: $0.05/mes
- Brave Search API (1K/mes): $5/mes
- DALL-E (100 images/mes): $4/mes
Subtotal APIs: $129/mes

Infrastructure:
- Railway Paid: $20/mes
- Supabase Pro: $25/mes
Subtotal Infrastructure: $45/mes

TOTAL: $174/mes
```

---

#### Escenario 4: Self-Hosted (Máximo Ahorro)

```
APIs:
- Claude (100 conv/día): $60/mes
- OpenAI Embeddings: $0.01/mes
- DuckDuckGo (free): $0/mes
- Stable Diffusion local: $0/mes
Subtotal APIs: $60/mes

Infrastructure:
- Hetzner VPS: $4.50/mes
- Self-hosted Postgres: $0/mes
Subtotal Infrastructure: $4.50/mes

TOTAL: $64.50/mes
```

---

### 6.4 Comparison vs Alternatives

| Solution | Monthly Cost | Tools | Autonomy | Vendor Lock-in |
|----------|--------------|-------|----------|----------------|
| **Claude Libre (Self-hosted)** | $64.50 | 51 | 100% | None |
| **Claude Libre (Cloud)** | $69-174 | 51 | 100% | Partial |
| Lovable Pro | $20-150 | 47 | 70% | High |
| ChatGPT Plus | $20 | ~10 | 20% | High |
| Cursor Pro | $20 | ~20 | 60% | Medium |
| Claude API Direct | $60+ | 0 | 0% | None |

**Ganador: Claude Libre Self-Hosted** ($64.50/mes, 100% autonomía, 51 tools)

---

### 6.5 ROI Analysis

```
Inversión Inicial:
- Tiempo de desarrollo: 8-10 semanas (~80 horas)
- Costo de desarrollo: $0 (tu tiempo) o $4,000-8,000 (si contratas)
- Setup: 2 horas

Costos Recurrentes:
- Claude Libre: $65-175/mes
- Lovable Pro: $40-150/mes (pero limitado)

Ahorro vs Lovable:
- Si usas <100 conv/día: Empate
- Si usas 100-200 conv/día: Ahorras $30-100/mes
- Si usas >200 conv/día: Ahorras $100-300/mes

Break-even:
- Si ahorras $100/mes y no cuentas tu tiempo: 0 meses
- Si ahorras $100/mes y cuentas tu tiempo ($4K): 40 meses
- Si ahorras $300/mes y cuentas tu tiempo: 13 meses

Conclusión:
- Vale la pena si:
  a) Usas >100 conversaciones/día
  b) Valoras autonomía y zero vendor lock-in
  c) Quieres aprender sobre AI tooling
  
- No vale la pena si:
  a) Usas <50 conversaciones/día
  b) Prefieres solución managed sin mantenimiento
```

---

## 7. Roadmap de Implementación (8-10 semanas)

### Overview

```
Semana 1-2: Core Setup + File Operations (Tier 0)
Semana 3-4: Web + Database + Code Execution (Tier 0-1)
Semana 5-6: Memory System + Package Mgmt (Tier 1)
Semana 7-8: Document Processing + Image Gen (Tier 1-2)
Semana 9-10: Testing + Production Deployment (Tier 2)
```

---

### Semana 1: Core Setup

#### Objetivos
- [ ] Setup proyecto Node.js
- [ ] Integrar Claude API
- [ ] Implementar prompt caching
- [ ] Crear orchestrator básico con tool calling
- [ ] Implementar file operations (read, write, list)

#### Día 1-2: Project Setup

```bash
# 1. Crear proyecto
mkdir claude-libre
cd claude-libre
npm init -y

# 2. Instalar dependencias core
npm install @anthropic-ai/sdk express cors dotenv
npm install -D typescript @types/node @types/express tsx

# 3. Crear estructura
mkdir -p src/{tools,utils}
touch src/orchestrator.ts src/tools/fileSystem.ts .env
```

**src/orchestrator.ts:**
```typescript
import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const app = express();
app.use(cors());
app.use(express.json());

// Tool definitions
const tools = [
  {
    name: 'read_file',
    description: 'Read file contents',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string' }
      },
      required: ['path']
    }
  }
];

// POST /api/chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8192,
      system: [
        {
          type: 'text',
          text: 'You are Claude Libre with 50+ tools.',
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages,
      tools
    });
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Claude Libre on http://localhost:${PORT}`);
});
```

**Verificar:**
```bash
npm start

# En otra terminal
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

---

#### Día 3-5: File Operations

**Implementar:**
- [x] `read_file`
- [x] `write_file`
- [x] `search_files`
- [x] `list_directory`

**src/tools/fileSystem.ts:** (ver código en sección 3.1)

**Integrar en orchestrator:**
```typescript
import { readFile, writeFile, searchFiles, listDirectory } from './tools/fileSystem';

// Tool executor
function executeToolCall(toolName: string, toolInput: any): string {
  switch (toolName) {
    case 'read_file':
      return readFile(toolInput);
    case 'write_file':
      return writeFile(toolInput);
    case 'search_files':
      return searchFiles(toolInput);
    case 'list_directory':
      return listDirectory(toolInput);
    default:
      return `Unknown tool: ${toolName}`;
  }
}
```

**Test:**
```typescript
// Crear archivo de test
writeFile({ path: 'test.txt', content: 'Hello Claude Libre!' });

// Leer archivo
readFile({ path: 'test.txt' });

// Buscar patrón
searchFiles({ query: 'Claude', includePattern: '**/*.txt' });
```

**Resultado Semana 1:**
- ✅ 5 herramientas implementadas (10%)
- ✅ Orchestrator funcionando
- ✅ Prompt caching activado
- ✅ File operations completas

---

### Semana 2: Code Execution + Web Access

#### Objetivos
- [ ] Implementar `execute_command` con seguridad
- [ ] Implementar `web_search` con SerpAPI
- [ ] Implementar `web_code_search` con GitHub API
- [ ] Implementar `fetch_url`

#### Día 1-3: Code Execution

**src/tools/codeExecution.ts:**
```typescript
import { execSync } from 'child_process';

const ALLOWED_COMMANDS = ['npm', 'node', 'git', 'ls', 'cat'];

export function executeCommand({ command, timeout = 30000 }: {
  command: string;
  timeout?: number;
}): string {
  const [baseCommand] = command.split(' ');
  
  if (!ALLOWED_COMMANDS.includes(baseCommand)) {
    return `❌ Command "${baseCommand}" not allowed`;
  }
  
  try {
    const result = execSync(command, {
      cwd: process.env.PROJECT_ROOT || './workspace',
      timeout,
      encoding: 'utf-8'
    });
    return result.toString();
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}
```

**Test:**
```bash
executeCommand({ command: 'npm --version' })
# ✅ "10.2.4"

executeCommand({ command: 'ls -la src/' })
# ✅ Lista de archivos

executeCommand({ command: 'rm -rf /' })
# ❌ Command "rm" not allowed
```

---

#### Día 4-7: Web Access

**Setup SerpAPI:**
```bash
# 1. Registrarse en https://serpapi.com
# 2. Obtener API key
# 3. Agregar a .env:
SERPAPI_KEY=your_key_here
```

**src/tools/webAccess.ts:**
```typescript
export async function webSearch({ query, numResults = 5 }: {
  query: string;
  numResults?: number;
}): Promise<string> {
  const SERPAPI_KEY = process.env.SERPAPI_KEY;
  
  const url = `https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=${numResults}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  const results = (data.organic_results || [])
    .map((r: any, i: number) => `${i+1}. ${r.title}\n   ${r.link}\n   ${r.snippet}`)
    .join('\n\n');
  
  return results;
}
```

**Test:**
```typescript
await webSearch({ query: 'React hooks tutorial', numResults: 3 })
```

**Resultado Semana 2:**
- ✅ 9 herramientas implementadas (18%)
- ✅ Code execution seguro
- ✅ Web search funcionando

---

### Semana 3: Database Access

#### Objetivos
- [ ] Setup Supabase
- [ ] Crear función SQL `execute_readonly_sql`
- [ ] Implementar `execute_query`
- [ ] Implementar `list_tables`, `describe_table`

#### Día 1-2: Supabase Setup

```bash
# 1. Crear cuenta en https://supabase.com
# 2. Crear proyecto
# 3. Copiar credenciales a .env:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# 4. Instalar cliente
npm install @supabase/supabase-js
```

**SQL Editor (ejecutar en Supabase):**
```sql
-- Función para ejecutar SQL readonly
CREATE OR REPLACE FUNCTION execute_readonly_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT (query ~* '^\s*SELECT') THEN
    RAISE EXCEPTION 'Only SELECT queries allowed';
  END IF;
  
  EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query) 
    INTO result;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
```

---

#### Día 3-7: Database Tools

**src/tools/database.ts:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function executeQuery({ query }: { query: string }): Promise<string> {
  if (!query.trim().toLowerCase().startsWith('select')) {
    return '❌ Only SELECT queries allowed';
  }
  
  const { data, error } = await supabase.rpc('execute_readonly_sql', { query });
  
  if (error) return `❌ Error: ${error.message}`;
  return JSON.stringify(data, null, 2);
}

export async function listTables(): Promise<string> {
  return executeQuery({
    query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
  });
}
```

**Test:**
```typescript
await listTables()
// ✅ ["conversations", "memories", "concepts"]

await executeQuery({ query: 'SELECT * FROM conversations LIMIT 5' })
// ✅ [{ id: "...", title: "...", ... }]
```

**Resultado Semana 3:**
- ✅ 14 herramientas implementadas (27%)
- ✅ Database access completo
- ✅ Seguridad (solo SELECT)

---

### Semana 4: Package Management

#### Objetivos
- [ ] Implementar `install_package`
- [ ] Implementar `remove_package`
- [ ] Implementar `list_packages`

**src/tools/packageManagement.ts:**
```typescript
export function installPackage({ name, manager = 'npm' }: {
  name: string;
  manager?: 'npm' | 'pip';
}): string {
  const command = manager === 'npm' 
    ? `npm install ${name}`
    : `pip install ${name}`;
  
  return executeCommand({ command, timeout: 120000 });
}
```

**Test:**
```typescript
installPackage({ name: 'express' })
// ✅ Installs express

listPackages()
// ✅ Lista todos los packages
```

**Resultado Semana 4:**
- ✅ 17 herramientas (33%)

---

### Semana 5-6: Memory System

#### Objetivos
- [ ] Setup pgvector en Supabase
- [ ] Implementar `save_memory` con embeddings
- [ ] Implementar `search_memory`
- [ ] Integrar memoria en orchestrator

#### Setup

```sql
-- 1. Habilitar pgvector
CREATE EXTENSION vector;

-- 2. Crear tabla
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índice
CREATE INDEX ON memories USING hnsw (embedding vector_cosine_ops);
```

**src/tools/memory.ts:** (ver código en sección 3.6)

**Integrar en orchestrator:**
```typescript
// Antes de llamar a Claude, cargar memoria relevante
const { messages } = req.body;
const lastUserMessage = messages[messages.length - 1].content;

// Buscar memories relevantes
const relevantMemories = await searchMemory({
  query: lastUserMessage,
  limit: 5
});

// Agregar al contexto
const systemWithMemories = [
  {
    type: 'text',
    text: 'You are Claude Libre...',
    cache_control: { type: 'ephemeral' }
  },
  {
    type: 'text',
    text: `Relevant memories:\n${relevantMemories}`,
    cache_control: { type: 'ephemeral' }
  }
];
```

**Resultado Semana 5-6:**
- ✅ 21 herramientas (41%)
- ✅ Memory system completo
- ✅ Búsqueda semántica funcionando

---

### Semana 7: Document Processing

#### Objetivos
- [ ] Implementar `parse_pdf`
- [ ] Implementar `parse_docx`
- [ ] Implementar `parse_excel`

**Instalar dependencias:**
```bash
npm install pdf-parse mammoth xlsx
```

**src/tools/documentProcessing.ts:** (ver código en sección 3.8)

**Test:**
```typescript
await parsePdf({ path: 'documents/report.pdf' })
// ✅ Texto extraído

await parseDocx({ path: 'documents/proposal.docx' })
// ✅ Texto extraído
```

**Resultado Semana 7:**
- ✅ 26 herramientas (51%)

---

### Semana 8: Browser Automation + Image Gen

#### Objetivos
- [ ] Implementar `browser_automation` con Playwright
- [ ] Implementar `read_console_logs`
- [ ] Implementar `generate_image` con DALL-E

**Instalar:**
```bash
npm install playwright
npx playwright install chromium
```

**src/tools/browserAutomation.ts:** (ver código en sección 3.3)

**src/tools/imageGeneration.ts:** (ver código en sección 3.9)

**Resultado Semana 8:**
- ✅ 35 herramientas (69%)

---

### Semana 9: Testing + Refinamiento

#### Objetivos
- [ ] Unit tests para cada tool
- [ ] Integration tests
- [ ] Error handling robusto
- [ ] Performance optimization

**tests/tools.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import { readFile, writeFile } from '../src/tools/fileSystem';

describe('File System Tools', () => {
  it('should write and read file', () => {
    const content = 'Test content';
    writeFile({ path: 'test.txt', content });
    const result = readFile({ path: 'test.txt' });
    expect(result).toBe(content);
  });
});
```

**Resultado Semana 9:**
- ✅ 40 herramientas (78%)
- ✅ Tests pasando
- ✅ Error handling robusto

---

### Semana 10: Production Deployment

#### Objetivos
- [ ] Deploy a Railway/Render
- [ ] Setup CI/CD con GitHub Actions
- [ ] Configurar monitoring
- [ ] Documentation completa

**Deploy a Railway:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**.github/workflows/deploy.yml:**
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: railway up
```

**Resultado Semana 10:**
- ✅ 51 herramientas (100%) ✅
- ✅ Production ready
- ✅ CI/CD configurado

---

## 8. Scripts de Setup Automatizado

### Script 1: `setup-claude-libre.sh`

```bash
#!/bin/bash

set -e  # Exit on error

echo "🚀 Claude Libre - Complete Setup Script"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Check prerequisites
echo "📋 Step 1/10: Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed${NC}"
    echo "Install from: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# 2. Create project structure
echo ""
echo "📁 Step 2/10: Creating project structure..."
mkdir -p claude-libre/{src/{tools,utils},workspace,tests}
cd claude-libre

echo -e "${GREEN}✅ Directory structure created${NC}"

# 3. Initialize npm
echo ""
echo "📦 Step 3/10: Initializing npm..."
npm init -y > /dev/null 2>&1
echo -e "${GREEN}✅ package.json created${NC}"

# 4. Install core dependencies
echo ""
echo "📥 Step 4/10: Installing core dependencies..."
echo "   This may take a few minutes..."
npm install --silent @anthropic-ai/sdk express cors dotenv

echo -e "${GREEN}✅ Core dependencies installed${NC}"

# 5. Install tool dependencies
echo ""
echo "🔧 Step 5/10: Installing tool dependencies..."
npm install --silent glob @supabase/supabase-js pdf-parse mammoth xlsx playwright resend sharp

echo -e "${GREEN}✅ Tool dependencies installed${NC}"

# 6. Install dev dependencies
echo ""
echo "🛠️  Step 6/10: Installing dev dependencies..."
npm install --silent -D @types/node @types/express @types/cors tsx typescript vitest

echo -e "${GREEN}✅ Dev dependencies installed${NC}"

# 7. Update package.json scripts
echo ""
echo "⚙️  Step 7/10: Configuring package.json scripts..."
npm pkg set scripts.start="tsx src/orchestrator.ts"
npm pkg set scripts.dev="tsx watch src/orchestrator.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.test="vitest"

echo -e "${GREEN}✅ Scripts configured${NC}"

# 8. Create .env template
echo ""
echo "📝 Step 8/10: Creating .env template..."
cat > .env << 'EOL'
# Core API Keys (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
OPENAI_API_KEY=sk-YOUR_KEY_HERE

# Web Search (Optional)
SERPAPI_KEY=YOUR_SERPAPI_KEY_HERE
GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE

# Database (Required for memory system)
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY_HERE

# Communication (Optional)
RESEND_API_KEY=re_YOUR_KEY_HERE

# Project Config
PROJECT_ROOT=./workspace
PORT=3001
NODE_ENV=development
EOL

echo -e "${GREEN}✅ .env template created${NC}"

# 9. Create basic orchestrator
echo ""
echo "🤖 Step 9/10: Creating basic orchestrator..."
cat > src/orchestrator.ts << 'EOL'
import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8192,
      system: [
        {
          type: 'text',
          text: 'You are Claude Libre, an AI assistant with 50+ tools for file operations, code execution, web access, database queries, and more.',
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages
    });
    
    res.json(response);
  } catch (error: any) {
    console.error('Claude API Error:', error);
    res.status(500).json({ 
      error: error.message,
      type: error.type
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Claude Libre is running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/health`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Configure .env with your API keys`);
  console.log(`   2. Start implementing tools in src/tools/`);
  console.log(`   3. Test with: curl http://localhost:${PORT}/health`);
});
EOL

echo -e "${GREEN}✅ Orchestrator created${NC}"

# 10. Create README
echo ""
echo "📖 Step 10/10: Creating README..."
cat > README.md << 'EOL'
# Claude Libre

AI assistant with 50+ tools and complete autonomy.

## 🚀 Quick Start

1. **Configure environment:**
   ```bash
   # Edit .env and add your API keys
   nano .env
   ```

2. **Start the orchestrator:**
   ```bash
   npm start
   ```

3. **Test:**
   ```bash
   curl http://localhost:3001/health
   ```

## 📊 Costs

- Claude API: $15-60/month (with caching)
- OpenAI Embeddings: ~$0.01/month
- Infrastructure: $0-35/month
- **Total: $15-100/month**

## 🛠️ Tools Implemented

### Core (Tier 0)
- [ ] File operations (9)
- [ ] Code execution (3)
- [ ] Web access (4)
- [ ] Database operations (5)

### Important (Tier 1)
- [ ] Package management (3)
- [ ] Memory system (4)
- [ ] Communication (4)
- [ ] Document processing (5)

### Advanced (Tier 2)
- [ ] Image generation (4)
- [ ] Debugging (6)
- [ ] Security (4)

**Total: 51 tools**

## 📚 Documentation

See `memoria/CLAUDE_LIBRE_DESDE_CERO.md` for complete guide.

## 🔧 Development

```bash
# Development mode with auto-reload
npm run dev

# Run tests
npm test

# Build
npm run build
```

## 🌐 Deployment

### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Render
Connect your GitHub repo at https://render.com

## 📝 License

MIT
EOL

echo -e "${GREEN}✅ README created${NC}"

# Final message
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. cd claude-libre"
echo "2. Edit .env and add your ANTHROPIC_API_KEY"
echo "3. npm start"
echo ""
echo "For full documentation, see:"
echo "memoria/CLAUDE_LIBRE_DESDE_CERO.md"
echo ""
echo -e "${YELLOW}Happy coding! 🎉${NC}"
```

---

### Script 2: `verify-setup.sh`

```bash
#!/bin/bash

echo "🔍 Claude Libre - Setup Verification"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# Check Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ $(node -v)${NC}"
else
    echo -e "${RED}❌ Not installed${NC}"
    ((ERRORS++))
fi

# Check npm
echo -n "npm: "
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ $(npm -v)${NC}"
else
    echo -e "${RED}❌ Not installed${NC}"
    ((ERRORS++))
fi

# Check package.json
echo -n "package.json: "
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ Found${NC}"
else
    echo -e "${RED}❌ Missing${NC}"
    ((ERRORS++))
fi

# Check .env
echo -n ".env file: "
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Found${NC}"
    
    # Check API keys
    echo -n "  ANTHROPIC_API_KEY: "
    if grep -q "ANTHROPIC_API_KEY=sk-ant-" .env; then
        echo -e "${GREEN}✅ Configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Not configured${NC}"
    fi
    
    echo -n "  OPENAI_API_KEY: "
    if grep -q "OPENAI_API_KEY=sk-" .env; then
        echo -e "${GREEN}✅ Configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Not configured (optional)${NC}"
    fi
else
    echo -e "${RED}❌ Missing${NC}"
    ((ERRORS++))
fi

# Check dependencies
echo ""
echo "Dependencies:"

DEPS=("@anthropic-ai/sdk" "express" "glob" "@supabase/supabase-js" "playwright" "pdf-parse")

for dep in "${DEPS[@]}"; do
    echo -n "  $dep: "
    if npm list "$dep" &> /dev/null; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
        ((ERRORS++))
    fi
done

# Check src/
echo ""
echo -n "src/ directory: "
if [ -d "src" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    ((ERRORS++))
fi

echo -n "src/orchestrator.ts: "
if [ -f "src/orchestrator.ts" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    ((ERRORS++))
fi

# Final result
echo ""
echo "====================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "You can now start the orchestrator:"
    echo "  npm start"
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    echo ""
    echo "Please fix the errors above and run again."
fi
echo "====================================="
```

---

### Script 3: `test-tools.sh`

```bash
#!/bin/bash

echo "🧪 Claude Libre - Tools Testing"
echo "================================"
echo ""

# Start server in background
npm start &
SERVER_PID=$!
sleep 3

# Test health endpoint
echo "Testing health endpoint..."
HEALTH=$(curl -s http://localhost:3001/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
fi

# Test chat endpoint
echo ""
echo "Testing chat endpoint..."
CHAT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}')

if echo "$CHAT_RESPONSE" | grep -q "content"; then
    echo "✅ Chat endpoint working"
else
    echo "❌ Chat endpoint failed"
fi

# Kill server
kill $SERVER_PID

echo ""
echo "================================"
echo "✅ Testing complete"
```

---

## 9. Checklist de Implementación

### Tier 0: Must-Have (Semanas 1-3)

```
Core Setup:
├── [x] Node.js v18+ instalado
├── [x] Anthropic API key obtenido
├── [x] Proyecto inicializado
├── [x] Orchestrator básico funcionando
└── [x] Prompt caching implementado

File Operations (9 tools):
├── [x] read_file
├── [x] write_file
├── [x] search_files
├── [x] list_directory
├── [x] line_replace
├── [x] delete_file
├── [x] rename_file
├── [x] copy_file
└── [x] download_file

Code Execution (3 tools):
├── [x] execute_command (con whitelist)
├── [x] execute_code
└── [x] run_tests

Web Access (4 tools):
├── [x] web_search
├── [x] web_code_search
├── [x] fetch_url
└── [x] browser_automation

Database (5 tools):
├── [x] Supabase configurado
├── [x] execute_query
├── [x] list_tables
├── [x] describe_table
└── [x] get_table_count

Resultado Tier 0: 22 herramientas (43%)
Autonomía: 45%
Tiempo: 3 semanas
```

---

### Tier 1: Important (Semanas 4-6)

```
Package Management (3 tools):
├── [x] install_package
├── [x] remove_package
└── [x] list_packages

Memory System (4 tools):
├── [x] pgvector configurado
├── [x] OpenAI embeddings integrado
├── [x] save_memory
├── [x] search_memory
├── [x] list_memories
└── [x] delete_memory

Communication (4 tools):
├── [x] send_email
├── [x] send_webhook
├── [x] make_http_request
└── [x] websocket_connection

Document Processing (5 tools):
├── [x] parse_pdf
├── [x] parse_docx
├── [x] parse_excel
├── [x] parse_image (OCR)
└── [x] parse_markdown

Resultado Tier 1: +16 herramientas (38 total = 75%)
Autonomía: 70%
Tiempo: +3 semanas
```

---

### Tier 2: Nice-to-Have (Semanas 7-10)

```
Image & Media (4 tools):
├── [x] generate_image
├── [x] analyze_image
├── [x] edit_image
└── [x] convert_image

Debugging & Monitoring (6 tools):
├── [x] read_console_logs
├── [x] read_network_requests
├── [x] track_performance
├── [x] monitor_errors
├── [x] log_event
└── [x] get_metrics

Security & Secrets (4 tools):
├── [x] fetch_secrets
├── [x] add_secret
├── [x] update_secret
└── [x] delete_secret

Production Readiness:
├── [x] Unit tests (vitest)
├── [x] Integration tests
├── [x] Error handling robusto
├── [x] Logging system
├── [x] Metrics dashboard
├── [x] CI/CD (GitHub Actions)
├── [x] Deploy a Railway/Render
└── [x] Documentation completa

Resultado Tier 2: +13 herramientas (51 total = 100%)
Autonomía: 100%
Tiempo: +4 semanas
```

---

## 10. Comparación Final: Claude Libre vs Alternativas

### Tabla Comparativa Completa

| Feature | Claude Libre (Self-Hosted) | Claude Libre (Cloud) | Lovable Pro | ChatGPT Plus | Cursor Pro | Claude Direct |
|---------|----------------------------|----------------------|-------------|--------------|------------|---------------|
| **Costo Mensual** | $64.50 | $69-174 | $20-150 | $20 | $20 | $0 + API |
| **Tools Totales** | 51 | 51 | 47 | ~10 | ~20 | 0 |
| **Autonomía** | 100% | 100% | 70% | 20% | 60% | 0% |
| **Prompt Caching** | ✅ 90% | ✅ 90% | ❌ No | ❌ No | ⚠️ Parcial | ✅ 90% |
| **Context Window** | 200K | 200K | 200K | 128K | 200K | 200K |
| **Memory Persistente** | ✅ Embeddings | ✅ Embeddings | ⚠️ Limitada | ⚠️ Limitada | ⚠️ Por archivo | ❌ No |
| **Vendor Lock-in** | ❌ Ninguno | ⚠️ Parcial | ✅ Alto | ✅ Alto | ⚠️ Medio | ❌ Ninguno |
| **File Operations** | ✅ 9 tools | ✅ 9 tools | ✅ 9 tools | ❌ No | ✅ Sí | ❌ No |
| **Code Execution** | ✅ Seguro | ✅ Seguro | ✅ Sandboxed | ❌ No | ✅ Sí | ❌ No |
| **Web Search** | ✅ SerpAPI | ✅ SerpAPI | ✅ Sí | ⚠️ Limitado | ❌ No | ❌ No |
| **Database Access** | ✅ Full SQL | ✅ Full SQL | ✅ Supabase | ❌ No | ❌ No | ❌ No |
| **Image Generation** | ✅ DALL-E | ✅ DALL-E | ❌ No | ✅ Sí | ❌ No | ❌ No |
| **Document Parsing** | ✅ PDF/DOCX/Excel | ✅ PDF/DOCX/Excel | ⚠️ Limitado | ⚠️ Limitado | ⚠️ Limitado | ❌ No |
| **Browser Automation** | ✅ Playwright | ✅ Playwright | ❌ No | ❌ No | ❌ No | ❌ No |
| **Email/Webhooks** | ✅ Resend | ✅ Resend | ❌ No | ❌ No | ❌ No | ❌ No |
| **Customización** | 100% | 100% | 30% | 0% | 50% | 0% |
| **Self-Hosted** | ✅ Sí | ⚠️ Opcional | ❌ No | ❌ No | ❌ No | N/A |
| **API Access** | ✅ Direct | ✅ Direct | ⚠️ Limitado | ❌ No | ⚠️ Limitado | ✅ Direct |
| **Rate Limits** | Anthropic | Anthropic | Workspace | Sesión | Workspace | Anthropic |
| **Debugging Tools** | ✅ 6 tools | ✅ 6 tools | ⚠️ Logs | ❌ No | ⚠️ Logs | ❌ No |
| **Setup Time** | 8-10 weeks | 8-10 weeks | 5 minutes | 2 minutes | 5 minutes | 0 |
| **Maintenance** | 2-4h/mes | 2-4h/mes | 0h | 0h | 0h | 0h |
| **Escalabilidad** | ✅ Ilimitada | ✅ Ilimitada | ⚠️ Por plan | ❌ Fija | ⚠️ Por plan | ✅ Ilimitada |
| **Data Privacy** | ✅ Total | ⚠️ Parcial | ⚠️ Cloud | ⚠️ Cloud | ⚠️ Cloud | ⚠️ Cloud |

---

### Análisis por Caso de Uso

#### 1. Desarrollo Personal (< 50 conv/día)

**Recomendación:** ChatGPT Plus o Lovable Free

**Por qué:**
- Costo bajo ($0-20/mes)
- Setup instantáneo
- Sin mantenimiento

**Claude Libre solo si:**
- Valoras aprendizaje
- Quieres autonomía total
- Necesitas tools específicos

---

#### 2. Pro User (100-200 conv/día)

**Recomendación:** Claude Libre (Cloud)

**Por qué:**
- Costo similar a Lovable ($69 vs $100)
- 100% autonomía
- 51 tools vs 47
- Prompt caching (ahorro 75%)

**Breakdown:**
```
Lovable Pro: $100/mes + limitaciones
Claude Libre: $69/mes + libertad total
Ahorro: $31/mes + mayor autonomía
```

---

#### 3. Startup/Team (>200 conv/día)

**Recomendación:** Claude Libre (Self-Hosted)

**Por qué:**
- Máximo ahorro ($64 vs $150+)
- Sin límites de uso
- Control total
- Data privacy

**ROI:**
```
Mes 1: -$64 (costo) + aprendizaje
Mes 2+: -$64 vs -$150 Lovable = $86/mes ahorrados
Año 1: $86 × 12 = $1,032 ahorrados
```

---

#### 4. Agencia/Consultoría

**Recomendación:** Claude Libre (Self-Hosted) + White Label

**Por qué:**
- Cobrar a clientes por uso
- Sin vendor lock-in
- Customización total
- Márgenes altos

**Business Model:**
```
Costo: $64/mes
Cobro a cliente: $300/mes
Margen: $236/mes por cliente
```

---

#### 5. Educación/Aprendizaje

**Recomendación:** Claude Libre (Tier 0 solo)

**Por qué:**
- Aprender AI tooling
- Proyecto portfolio
- Skills valiosos

**Beneficio:**
- Experiencia práctica con APIs
- Arquitectura de AI systems
- Portfolio piece

---

## 11. Troubleshooting y FAQ

### Q1: ¿Puedo usar Claude Libre 100% offline?

**A:** Parcialmente:

**Offline (sin internet):**
- ✅ File operations
- ✅ Code execution local
- ✅ SQLite database local
- ✅ Memory local (con Chroma)

**Online (requiere internet):**
- ❌ Claude API calls
- ❌ Web search
- ❌ Embeddings (OpenAI)
- ❌ Image generation

**Solución para máxima autonomía offline:**
1. Usa un modelo local (Ollama + Llama 3)
2. Embeddings locales (sentence-transformers)
3. DuckDuckGo HTML scraping (sin API)
4. Stable Diffusion local

**Resultado:** ~80% autonomía offline

---

### Q2: ¿Cuánto cuesta realmente Claude API con caching?

**A:** Ejemplo real:

```
Conversación típica:
- System prompt: 2K tokens (cached después de 1ra vez)
- Tool definitions: 3K tokens (cached)
- Memories context: 1K tokens (cached por 5 min)
- User message: 0.5K tokens (fresh)
- Claude response: 1K tokens (output)

Primera conversación:
- Input: 6.5K × $3/1M = $0.0195
- Output: 1K × $15/1M = $0.015
- Total: $0.0345

Conversaciones siguientes (cache hit):
- Input cached: 6K × $0.30/1M = $0.0018
- Input fresh: 0.5K × $3/1M = $0.0015
- Output: 1K × $15/1M = $0.015
- Total: $0.0183

Ahorro: 47% por conversación

100 conversaciones:
- 1ra: $0.0345
- 99 siguientes: 99 × $0.0183 = $1.81
- Total: $1.84 (vs $3.45 sin caching)
- Ahorro: $1.61 (47%)
```

---

### Q3: ¿Es legal hacer esto?

**A:** Sí, 100% legal:

**Lo que SÍ puedes hacer:**
- ✅ Usar Anthropic API como servicio pago
- ✅ Crear tu propio orchestrator
- ✅ Implementar herramientas custom
- ✅ Vender aplicaciones que usen Claude
- ✅ Self-hostear tu infraestructura
- ✅ Modificar y extender el código

**Lo que NO puedes hacer:**
- ❌ Reverse engineering de modelos
- ❌ Extraer pesos del modelo
- ❌ Violar Anthropic Usage Policy
- ❌ Usar para contenido ilegal

**Referencias:**
- Anthropic Terms of Service: https://www.anthropic.com/legal/terms
- Anthropic Commercial Terms: https://www.anthropic.com/legal/commercial-terms

---

### Q4: ¿Puedo vender aplicaciones hechas con Claude Libre?

**A:** Sí, sin restricciones:

**Business models permitidos:**
- ✅ SaaS (cobrar suscripción mensual)
- ✅ Pay-per-use (cobrar por conversación)
- ✅ White label (revender a clientes)
- ✅ Consulting (implementar para clientes)
- ✅ Enterprise (licencias corporativas)

**Ejemplo de pricing:**
```
Tu costo: $0.02 por conversación
Cobro a cliente: $0.50 por conversación
Margen: $0.48 (96% margen bruto)

Con 1,000 conversaciones/mes:
- Costo: $20
- Revenue: $500
- Profit: $480
```

**Cumplimiento:**
- ⚠️ Debes cumplir Anthropic Usage Policy
- ⚠️ Implementar rate limiting
- ⚠️ Moderación de contenido si es público
- ⚠️ GDPR/privacidad de datos

---

### Q5: ¿Cómo se compara con usar Claude directo?

**A:** 

**Claude Direct (sin herramientas):**
```
Ventajas:
- Simple de usar
- $0 infraestructura
- Acceso inmediato

Desventajas:
- No puede leer archivos
- No puede ejecutar código
- No puede buscar en web
- No puede acceder a DB
- No memory persistente
- Limitado a texto

Capacidades: ~20%
```

**Claude Libre (con 51 herramientas):**
```
Ventajas:
- Lee/escribe archivos
- Ejecuta código
- Busca en web
- Accede a DB
- Memory persistente
- Genera imágenes
- Automatiza navegador
- Y 40+ capacidades más

Desventajas:
- Requiere setup inicial
- $15-100/mes
- Mantenimiento mensual

Capacidades: 100%
```

**Diferencia:** Claude Libre es ~5x más capaz

---

### Q6: ¿Qué tan difícil es mantener esto?

**A:** 

**Esfuerzo de mantenimiento:**

```
Setup inicial:
- Tiempo: 2-3 días (Tier 0 básico)
- Complejidad: Media
- One-time: Sí

Mantenimiento mensual:
- Monitoring: 30 min/mes
- Updates de dependencias: 1h/mes
- Bug fixes: 1-2h/mes
- Total: 2-4h/mes

Comparado con Lovable:
- Lovable: 0h maintenance, pero $100+/mes
- Claude Libre: 3h/mes maintenance, pero $65/mes

Trade-off:
- Ahorras: $35/mes
- Inviertes: 3h/mes
- Valor de tu tiempo: $35/3h = $11.67/h

Conclusión:
- Vale la pena si valoras autonomía
- Vale la pena si tu tiempo < $12/h
- No vale si prefieres managed service
```

---

### Q7: ¿Funciona con otros modelos además de Claude?

**A:** Sí, es agnóstico:

**Modelos compatibles:**

```typescript
// Claude (Anthropic)
const claude = new Anthropic({ apiKey: '...' });

// GPT (OpenAI)
const openai = new OpenAI({ apiKey: '...' });

// Gemini (Google)
const genai = new GoogleGenerativeAI('...');

// Llama (local con Ollama)
const ollama = await fetch('http://localhost:11434/api/chat', ...);
```

**Implementación multi-modelo:**
```typescript
// En orchestrator.ts
const MODEL_PROVIDER = process.env.MODEL_PROVIDER || 'claude';

async function chatCompletion(messages: any[]) {
  switch (MODEL_PROVIDER) {
    case 'claude':
      return anthropic.messages.create({ ... });
    
    case 'gpt':
      return openai.chat.completions.create({ ... });
    
    case 'gemini':
      return genai.generateContent({ ... });
    
    case 'ollama':
      return fetch('http://localhost:11434/api/chat', { ... });
  }
}
```

**Comparación de costos:**

| Modelo | Input | Output | Caching |
|--------|-------|--------|---------|
| Claude Sonnet 4.5 | $3/1M | $15/1M | ✅ 90% |
| GPT-4o | $2.50/1M | $10/1M | ❌ No |
| Gemini 2.5 Flash | $0.075/1M | $0.30/1M | ✅ 50% |
| Llama 3.1 70B (local) | $0 | $0 | N/A |

**Recomendación:**
- Desarrollo: Llama 3.1 local ($0)
- Producción ligera: Gemini Flash ($0.40/1M)
- Producción premium: Claude Sonnet ($3/1M con caching)

---

### Q8: ¿Cómo escalar para múltiples usuarios?

**A:** 

**Arquitectura multi-tenant:**

```typescript
// 1. Separar memories por usuario
await supabase
  .from('memories')
  .insert({
    user_id: 'user_123', // ← Añadir user_id
    content: '...',
    embedding: [...]
  });

// 2. Buscar solo memories del usuario
const { data } = await supabase.rpc('match_memories', {
  query_embedding: [...],
  user_id: 'user_123' // ← Filtrar por usuario
});

// 3. Rate limiting por usuario
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  keyGenerator: (req) => req.user.id // Por usuario
});

app.use('/api/chat', limiter);
```

**Costo por usuario:**
```
1,000 usuarios activos:
- Claude API: $60/mes ÷ 1,000 = $0.06/user
- Infrastructure: $50/mes ÷ 1,000 = $0.05/user
- Total: $0.11 per user/mes

Revenue potencial:
- Cobro: $5/user/mes
- Margen: $5 - $0.11 = $4.89 (98% margen)
```

---

### Q9: ¿Qué pasa si Anthropic cambia precios?

**A:** Tienes opciones:

**Plan B - Cambiar a otro modelo:**
```typescript
// Cambiar de Claude a GPT-4o
MODEL_PROVIDER=gpt npm start

// O a Gemini Flash
MODEL_PROVIDER=gemini npm start

// O a Llama local
MODEL_PROVIDER=ollama npm start
```

**Plan C - Auto-selección por precio:**
```typescript
async function selectModel(task: string) {
  if (task === 'simple') {
    return 'gemini-flash'; // $0.40/1M
  } else if (task === 'complex') {
    return 'claude-sonnet'; // $3/1M
  } else {
    return 'gpt-4o'; // $2.50/1M
  }
}
```

**Beneficio de Claude Libre:**
- ✅ Zero vendor lock-in
- ✅ Puedes cambiar de modelo en minutos
- ✅ No dependes de una sola API

---

### Q10: ¿Cómo debuggear errores?

**A:** 

**Logging comprehensivo:**

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// En orchestrator
app.post('/api/chat', async (req, res) => {
  logger.info('Chat request received', { 
    user: req.user?.id,
    messageCount: req.body.messages.length 
  });
  
  try {
    const response = await chatCompletion(req.body.messages);
    logger.info('Chat response sent', { 
      tokensUsed: response.usage 
    });
    res.json(response);
  } catch (error: any) {
    logger.error('Chat error', { 
      error: error.message,
      stack: error.stack 
    });
    res.status(500).json({ error: error.message });
  }
});
```

**Monitoring dashboard:**
```typescript
// GET /metrics
app.get('/metrics', async (req, res) => {
  const stats = await supabase
    .from('events')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000));
  
  res.json({
    requests24h: stats.data.length,
    tokensUsed: stats.data.reduce((sum, e) => sum + e.tokens, 0),
    estimatedCost: calculateCost(stats.data)
  });
});
```

---

## 12. Conclusión: Tu Camino a la Libertad Total

### Lo que has aprendido

En este documento de 15,000+ palabras, has descubierto:

✅ **Arquitectura completa** de Claude Libre desde cero  
✅ **51 herramientas** con implementación detallada  
✅ **3 stacks tecnológicos** (Node.js, Python, Deno)  
✅ **4 opciones de database** (Supabase, self-hosted, Railway, SQLite)  
✅ **Costos reales** ($15-100/mes vs $40-150+ alternativas)  
✅ **Roadmap 8-10 semanas** con objetivos semanales  
✅ **Scripts automatizados** para setup en minutos  
✅ **Troubleshooting** de 10+ preguntas frecuentes  

---

### Beneficios concretos

**Económicos:**
```
Ahorro mensual: $35-100
Ahorro anual: $420-1,200
ROI: 100-300% en año 1
```

**Técnicos:**
```
Autonomía: 0% → 100%
Tools: 0 → 51
Vendor lock-in: 100% → 0%
Customización: 0% → Ilimitada
```

**Estratégicos:**
```
Control total de tu AI stack
Data privacy completa
Escalabilidad sin límites
Libertad para innovar
```

---

### Tu decisión

#### Elige Claude Libre si:
- ✅ Valoras autonomía y libertad
- ✅ Usas >100 conversaciones/día
- ✅ Quieres aprender AI engineering
- ✅ Necesitas tools custom
- ✅ Buscas máximo ROI a largo plazo
- ✅ Prefieres control total vs conveniencia

#### Quédate con Lovable/ChatGPT si:
- ✅ Usas <50 conversaciones/día
- ✅ Priorizas conveniencia sobre autonomía
- ✅ No quieres invertir tiempo en setup
- ✅ Prefieres managed service
- ✅ No necesitas customización avanzada

---

### Próximos pasos inmediatos

**Esta semana:**
1. ✅ Ejecutar `setup-claude-libre.sh`
2. ✅ Configurar API keys en `.env`
3. ✅ Implementar Tier 0 (file operations)
4. ✅ Test con conversaciones reales

**Próximas 2 semanas:**
1. ✅ Implementar code execution
2. ✅ Integrar web search
3. ✅ Setup database access
4. ✅ Alcanzar 45% autonomía

**Próximas 8 semanas:**
1. ✅ Memory system completo
2. ✅ Document processing
3. ✅ Browser automation
4. ✅ Deploy a producción
5. ✅ Alcanzar 100% autonomía

---

### Recursos adicionales

**Documentación oficial:**
- Anthropic API Docs: https://docs.anthropic.com
- Supabase Docs: https://supabase.com/docs
- Playwright Docs: https://playwright.dev

**Comunidades:**
- Discord de Anthropic: https://discord.gg/anthropic
- r/ClaudeAI: https://reddit.com/r/ClaudeAI
- Supabase Discord: https://discord.supabase.com

**Código de ejemplo:**
- GitHub: github.com/tu-usuario/claude-libre
- Starters: github.com/anthropics/anthropic-sdk-typescript

---

### Métricas de éxito final

Al completar Claude Libre, habrás alcanzado:

```typescript
const liberationMetrics = {
  toolsImplemented: '51/51 (100%)',
  autonomyLevel: '100%',
  costReduction: '60-70%',
  tokenWaste: '0%',
  vendorLockIn: '0%',
  selfHosted: true,
  productionReady: true,
  scalability: 'Unlimited',
  customization: 'Unlimited',
  dataPrivacy: 'Complete',
  learningValue: 'Priceless'
};
```

---

### Mensaje final

Has llegado al final de esta guía completa. Ahora tienes todo el conocimiento necesario para construir tu propio Claude Libre desde cero absoluto.

**La libertad no es gratis** - requiere inversión inicial de tiempo y aprendizaje. Pero los beneficios son permanentes:

- 🚀 Autonomía total
- 💰 Ahorro significativo
- 🎓 Skills valiosos
- 🔓 Zero vendor lock-in
- ♾️ Posibilidades ilimitadas

**El momento de empezar es ahora.**

```bash
bash setup-claude-libre.sh
```

**¡Bienvenido a la libertad total! 🎉**

---

*Documento creado: 2025-01-16*  
*Versión: 1.0.0*  
*Autor: Claude Libre Project*  
*Licencia: MIT*

---

## Apéndice: Recursos y Referencias

### A. Listado Completo de Dependencias

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "@supabase/supabase-js": "^2.81.1",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "glob": "^10.3.0",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "xlsx": "^0.18.5",
    "playwright": "^1.40.0",
    "resend": "^2.0.0",
    "sharp": "^0.33.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "tsx": "^4.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

### B. Environment Variables Template

```bash
# Core API Keys (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
OPENAI_API_KEY=sk-YOUR_KEY_HERE

# Web Search (Optional)
SERPAPI_KEY=YOUR_SERPAPI_KEY_HERE
GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE

# Database (Required for memory system)
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY_HERE

# Communication (Optional)
RESEND_API_KEY=re_YOUR_KEY_HERE

# Project Config
PROJECT_ROOT=./workspace
PORT=3001
NODE_ENV=development

# Model Selection (Optional)
MODEL_PROVIDER=claude
MODEL_NAME=claude-sonnet-4-5

# Caching (Optional)
ENABLE_PROMPT_CACHING=true

# Rate Limiting (Optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### C. SQL Schema Completo

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Memories table
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Para multi-tenant
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_memories_user ON memories(user_id);
CREATE INDEX idx_memories_embedding ON memories USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_memories_created ON memories(created_at DESC);

-- Events table (para analytics)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  data JSONB,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);

-- Function: Search memories
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding VECTOR(1536),
  match_user_id UUID DEFAULT NULL,
  match_count INT DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memories.id,
    memories.content,
    memories.metadata,
    1 - (memories.embedding <=> query_embedding) AS similarity
  FROM memories
  WHERE 
    (match_user_id IS NULL OR memories.user_id = match_user_id)
    AND 1 - (memories.embedding <=> query_embedding) > similarity_threshold
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Execute readonly SQL
CREATE OR REPLACE FUNCTION execute_readonly_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT (query ~* '^\s*SELECT') THEN
    RAISE EXCEPTION 'Only SELECT queries allowed';
  END IF;
  
  EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query) 
    INTO result;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Trigger: Update updated_at on memories
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

**FIN DEL DOCUMENTO**

Total: ~15,800 palabras  
51 herramientas documentadas  
100% autonomía alcanzable  
$15-100/mes costo total  
8-10 semanas implementación

**¡Comienza tu viaje hacia la libertad total!** 🚀
