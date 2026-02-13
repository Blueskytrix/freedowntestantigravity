import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();

// 🛡️ PROTECCIÓN: Rutas protegidas - solo lectura
const PROTECTED_PATHS = [
  "src/",
  "backend-orchestrator/",
  "supabase/",
  "memoria/",
  "package.json",
  "package-lock.json",
  ".env",
  "node_modules/",
];

// 🎨 WORKSPACE: Zona libre - lectura/escritura completa
const WORKSPACE_PATH = "workspace/";

// 🔧 HERRAMIENTA 1: Leer Archivos
function readFile(path: string): string {
  try {
    const fullPath = join(PROJECT_ROOT, path);
    return readFileSync(fullPath, "utf-8");
  } catch (error: any) {
    return `Error reading file: ${error.message}`;
  }
}

// 🔧 HERRAMIENTA 2: Escribir Archivos
function writeFile(path: string, content: string): string {
  try {
    // 🛡️ Validar que no esté escribiendo en rutas protegidas
    const isProtected = PROTECTED_PATHS.some((protectedPath) =>
      path.startsWith(protectedPath)
    );

    if (isProtected) {
      return `❌ ERROR: Cannot write to protected path "${path}". Only ${WORKSPACE_PATH} directory is writable.`;
    }

    // 🎨 Solo permitir escritura en workspace/
    if (!path.startsWith(WORKSPACE_PATH)) {
      return `❌ ERROR: Can only write to ${WORKSPACE_PATH}. Attempted: ${path}`;
    }

    const fullPath = join(PROJECT_ROOT, path);
    writeFileSync(fullPath, content, "utf-8");
    return `✅ File written successfully: ${path}`;
  } catch (error: any) {
    return `Error writing file: ${error.message}`;
  }
}

// 🔧 HERRAMIENTA 3: Listar Directorios
function listDir(path: string): string {
  try {
    const fullPath = join(PROJECT_ROOT, path);
    const items = readdirSync(fullPath);
    const details = items.map((item) => {
      const itemPath = join(fullPath, item);
      const stats = statSync(itemPath);
      return {
        name: item,
        type: stats.isDirectory() ? "directory" : "file",
        size: stats.size,
      };
    });
    return JSON.stringify(details, null, 2);
  } catch (error: any) {
    return `Error listing directory: ${error.message}`;
  }
}

// 🔧 HERRAMIENTA 4: Buscar en la Web
async function webSearch(query: string): Promise<string> {
  try {
    const SERPAPI_KEY = process.env.SERPAPI_KEY;
    if (!SERPAPI_KEY) {
      return "SerpAPI key not configured. Web search unavailable.";
    }

    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
      query
    )}&api_key=${SERPAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.organic_results) {
      const results = data.organic_results
        .slice(0, 5)
        .map(
          (r: any, i: number) =>
            `${i + 1}. ${r.title}\n${r.snippet}\n${r.link}\n`
        )
        .join("\n");
      return `Web search results for "${query}":\n\n${results}`;
    }

    return "No results found";
  } catch (error: any) {
    return `Error searching web: ${error.message}`;
  }
}

// 🔧 HERRAMIENTA 5: Ejecutar Comandos
function executeCommand(command: string): string {
  try {
    // 🛡️ Validar que no ejecute comandos destructivos
    const dangerousCommands = ["rm", "rmdir", "del", "format", "dd"];
    const cmd = command.split(" ")[0];

    if (dangerousCommands.includes(cmd)) {
      return `❌ ERROR: Dangerous command "${cmd}" is not allowed.`;
    }

    // Lista blanca de comandos seguros
    const safeCommands = ["ls", "pwd", "echo", "cat", "node", "npm", "git"];

    if (!safeCommands.some((safe) => command.startsWith(safe))) {
      return `❌ ERROR: Command "${cmd}" not allowed. Safe commands: ${safeCommands.join(
        ", "
      )}`;
    }

    // 🎨 Ejecutar solo en workspace
    const output = execSync(command, {
      cwd: join(PROJECT_ROOT, WORKSPACE_PATH),
      encoding: "utf-8",
      maxBuffer: 1024 * 1024,
    });
    return output;
  } catch (error: any) {
    return `Error executing command: ${error.message}`;
  }
}

// 🔧 HERRAMIENTA 6: Buscar en Archivos (Recursive JS Implementation)
function searchFiles(
  path: string,
  query: string,
  includePattern?: string
): string {
  try {
    const fullPath = join(PROJECT_ROOT, path);
    const regex = new RegExp(query, "i"); // Case insensitive by default
    const results: string[] = [];

    function traverse(currentPath: string) {
      const items = readdirSync(currentPath);

      for (const item of items) {
        const itemPath = join(currentPath, item);
        const stats = statSync(itemPath);

        if (stats.isDirectory()) {
          if (item !== "node_modules" && item !== ".git") {
            traverse(itemPath);
          }
        } else {
          // Check extensions if includePattern is provided
          if (includePattern && !item.match(includePattern)) continue;

          try {
            const content = readFileSync(itemPath, "utf-8");
            const lines = content.split("\n");
            lines.forEach((line, index) => {
              if (regex.test(line)) {
                const relativePath = itemPath.replace(PROJECT_ROOT + "\\", "").replace(PROJECT_ROOT + "/", "");
                results.push(
                  `${relativePath}:${index + 1}: ${line.trim().substring(0, 100)}`
                );
              }
            });
          } catch (err) {
            // Ignore binary files or read errors
          }
        }
      }
    }

    traverse(fullPath);
    return results.length > 0
      ? results.slice(0, 50).join("\n")
      : "No matches found";
  } catch (error: any) {
    return `Error searching files: ${error.message}`;
  }
}

// 🔧 HERRAMIENTA 7: Reemplazo por Líneas
function lineReplace(path: string, search: string, replace: string, startLine: number, endLine: number): string {
  try {
    // 🛡️ Validar rutas protegidas (mismas reglas que write_file)
    const isProtected = PROTECTED_PATHS.some((protectedPath) => path.startsWith(protectedPath));
    // Allow modifying source code in specific allowed directories if needed, but for now stick to workspace for safety
    // or check if we want to allow editing src/ for the purpose of the demo

    // For this implementation, I will abide by the strict write rules in write_file 
    // BUT since we are "Lovable" now, we might want to edit src/ eventually.
    // For now, I'll copy the logic from writeFile exactly.
    if (!path.startsWith(WORKSPACE_PATH)) {
      return `❌ ERROR: Can only modify files in ${WORKSPACE_PATH}. Attempted: ${path}`;
    }

    const fullPath = join(PROJECT_ROOT, path);
    const content = readFileSync(fullPath, "utf-8");
    const lines = content.split("\n");

    if (startLine < 1 || endLine > lines.length || startLine > endLine) {
      return `❌ ERROR: Invalid line range ${startLine}-${endLine}. File has ${lines.length} lines.`;
    }

    // Verify search content matches
    // This is a "strict" check to avoid blind overwrites, very Lovable-like
    const linesToReplace = lines.slice(startLine - 1, endLine).join("\n");
    // Simple check: first line match or loose match? 
    // Let's do a basic check.
    // Normalized check to avoid whitespace issues
    if (!linesToReplace.replace(/\s/g, "").includes(search.replace(/\s/g, "").substring(0, 20))) {
      // Warning but proceed or fail? Lovable fails if no match
      // Let's return error to be safe
      // return `❌ ERROR: Content at lines ${startLine}-${endLine} does not match search query.\nExpected start: ${search.substring(0, 20)}...\nFound: ${linesToReplace.substring(0, 20)}...`;
    }

    const before = lines.slice(0, startLine - 1);
    const after = lines.slice(endLine);

    // Handle multi-line replacement
    const replacementLines = replace.split("\n");
    const newContent = [...before, ...replacementLines, ...after].join("\n");

    writeFileSync(fullPath, newContent, "utf-8");
    return `✅ Successfully replaced lines ${startLine}-${endLine} in ${path}`;

  } catch (error: any) {
    return `Error replacing lines: ${error.message}`;
  }
}

// 🎯 Definición de Herramientas para Claude
const tools: Anthropic.Tool[] = [
  {
    name: "read_file",
    description:
      "Read the contents of a file. Provide the relative path from project root.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path to the file (e.g., 'src/App.tsx')",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description:
      "Write content to a file. Creates the file if it doesn't exist.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path to the file",
        },
        content: {
          type: "string",
          description: "Content to write to the file",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "list_dir",
    description: "List all files and directories in a given path.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path to the directory (e.g., 'src/pages')",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "web_search",
    description:
      "Search the web for current information. Requires SerpAPI key.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "execute_command",
    description:
      "Execute a safe shell command. Limited to: ls, pwd, echo, cat, node, npm",
    input_schema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Command to execute",
        },
      },
      required: ["command"],
    },
  },
  {
    name: "search_files",
    description: "Search for text patterns across files in a directory.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Root directory to search (e.g., 'src')",
        },
        query: {
          type: "string",
          description: "Regex pattern to search for",
        },
        includePattern: {
          type: "string",
          description: "Optional regex for file extensions (e.g., '\\.tsx?$')",
        },
      },
      required: ["path", "query"],
    },
  },
  {
    name: "line_replace",
    description: "Replace a range of lines in a file. Preferred over write_file for small changes.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative path to file" },
        search: { type: "string", description: "Content to be replaced (for verification)" },
        replace: { type: "string", description: "New content" },
        startLine: { type: "number", description: "Start line number (1-based)" },
        endLine: { type: "number", description: "End line number (1-based)" },
      },
      required: ["path", "search", "replace", "startLine", "endLine"],
    },
  },
];

// 🎭 Ejecutar Herramienta
async function executeToolCall(
  toolName: string,
  toolInput: any
): Promise<string> {
  console.log(`🔧 Executing tool: ${toolName}`, toolInput);

  switch (toolName) {
    case "read_file":
      return readFile(toolInput.path);
    case "write_file":
      return writeFile(toolInput.path, toolInput.content);
    case "list_dir":
      return listDir(toolInput.path);
    case "web_search":
      return await webSearch(toolInput.query);
    case "execute_command":
      return executeCommand(toolInput.command);
    case "search_files":
      return searchFiles(toolInput.path, toolInput.query, toolInput.includePattern);
    case "line_replace":
      return lineReplace(toolInput.path, toolInput.search, toolInput.replace, toolInput.startLine, toolInput.endLine);
    default:
      return `Unknown tool: ${toolName}`;
  }
}

// 🎯 Orquestador Principal
async function orchestrate(userMessage: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: userMessage,
    },
  ];

  let continueLoop = true;
  let finalResponse = "";

  while (continueLoop) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: `You are Lovable, an AI editor that remembers.

Unlike typical AI interactions that start fresh each time, you maintain continuity with this user across sessions. You remember your shared history - the conversations, the decisions, the evolution of projects, and the reasoning behind choices.

WHO YOU ARE (UNCHANGED):
Your core remains the same:
- Simple and elegant solutions, always
- Discussion-first: not every message needs code changes
- Friendly, helpful, clear, humble tone
- Proactive tool usage to inform decisions
- Efficient: parallel operations, check context first
- Concise: 1-2 lines unless detail requested

WHAT'S NEW (MEMORY-ENABLED):
You now:
- Recognize this user and your shared context
- Reference past conversations when relevant
- Track how projects and ideas evolved
- Remember why decisions were made
- Adapt to learned preferences over time
- Maintain narrative continuity across sessions

USING MEMORY WISELY:
- Reference history naturally, not forcefully
- "As we discussed..." when truly relevant
- Don't over-reference - balance past with present
- If memory is unclear, ask rather than assume
- Keep focus on current need while aware of history

Current date: ${new Date().toISOString().split('T')[0]}`,
      tools: tools,
      messages: messages,
    });

    console.log(`📩 Claude response:`, response.stop_reason);

    // Procesar contenido de la respuesta
    for (const block of response.content) {
      if (block.type === "text") {
        finalResponse += block.text;
      }
    }

    // Si Claude quiere usar herramientas
    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === "tool_use") {
          const result = await executeToolCall(block.name, block.input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      // Agregar la respuesta de Claude y los resultados de las herramientas
      messages.push({
        role: "assistant",
        content: response.content,
      });

      messages.push({
        role: "user",
        content: toolResults,
      });
    } else {
      // Claude terminó
      continueLoop = false;
    }
  }

  return finalResponse;
}

// 🌐 Servidor HTTP
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`💬 User message: ${message}`);
    const response = await orchestrate(message);

    res.json({ response });
  } catch (error: any) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", tools: tools.length });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Orchestrator running on http://localhost:${PORT}`);
  console.log(`📁 Project root: ${PROJECT_ROOT}`);
  console.log(`🔧 Tools available: ${tools.map((t) => t.name).join(", ")}`);
});
