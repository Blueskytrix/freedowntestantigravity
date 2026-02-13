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
    const isProtected = PROTECTED_PATHS.some((protected) =>
      path.startsWith(protected)
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
