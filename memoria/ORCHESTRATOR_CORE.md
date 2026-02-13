# 🫀 ORCHESTRATOR CORE - El Corazón de tu Libertad

## Concepto

El **AI Orchestrator** es el componente central que te libera de Lovable. Es el "corazón" que late independientemente, procesando tool calls de Claude y ejecutando acciones reales en tu sistema.

**Sin este componente = Claude es solo un chatbot**  
**Con este componente = Claude puede hacer CUALQUIER COSA**

## Arquitectura Mínima

```
User Input → Backend Orchestrator → Claude API (streaming)
                ↓
          Tool Execution
                ↓
          Response to User
```

## 1. Backend Orchestrator Core (200 líneas)

**Archivo: `backend/orchestrator.ts`**

```typescript
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// ============================================
// CONFIGURACIÓN
// ============================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();

// ============================================
// TIPOS
// ============================================

interface Message {
  role: "user" | "assistant";
  content: string | any[];
}

interface ToolResult {
  type: "tool_result";
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

// ============================================
// 5 HERRAMIENTAS CRÍTICAS
// ============================================

const TOOLS = [
  {
    name: "read_file",
    description: "Lee el contenido completo de un archivo del proyecto",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Ruta relativa del archivo desde la raíz del proyecto",
        },
      },
      required: ["file_path"],
    },
  },
  {
    name: "write_file",
    description: "Escribe o sobrescribe un archivo completo en el proyecto",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Ruta relativa del archivo desde la raíz del proyecto",
        },
        content: {
          type: "string",
          description: "Contenido completo del archivo",
        },
      },
      required: ["file_path", "content"],
    },
  },
  {
    name: "list_dir",
    description: "Lista todos los archivos y carpetas en un directorio",
    input_schema: {
      type: "object",
      properties: {
        dir_path: {
          type: "string",
          description: "Ruta relativa del directorio desde la raíz del proyecto",
        },
      },
      required: ["dir_path"],
    },
  },
  {
    name: "web_search",
    description: "Busca información en internet usando SerpAPI o similar",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Query de búsqueda",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "execute_command",
    description: "Ejecuta un comando de terminal (npm install, git, etc)",
    input_schema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Comando a ejecutar",
        },
      },
      required: ["command"],
    },
  },
];

// ============================================
// EJECUCIÓN DE HERRAMIENTAS
// ============================================

async function executeToolCall(
  toolName: string,
  toolInput: any
): Promise<string> {
  try {
    switch (toolName) {
      case "read_file": {
        const filePath = path.join(PROJECT_ROOT, toolInput.file_path);
        const content = await fs.readFile(filePath, "utf-8");
        return content;
      }

      case "write_file": {
        const filePath = path.join(PROJECT_ROOT, toolInput.file_path);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, toolInput.content, "utf-8");
        return `File written successfully: ${toolInput.file_path}`;
      }

      case "list_dir": {
        const dirPath = path.join(PROJECT_ROOT, toolInput.dir_path);
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const files = entries.map((entry) => ({
          name: entry.name,
          type: entry.isDirectory() ? "directory" : "file",
        }));
        return JSON.stringify(files, null, 2);
      }

      case "web_search": {
        // Implementación simple usando SerpAPI (requiere SERPAPI_KEY)
        const serpApiKey = process.env.SERPAPI_KEY;
        if (!serpApiKey) {
          return "Error: SERPAPI_KEY not configured";
        }

        const url = `https://serpapi.com/search?q=${encodeURIComponent(
          toolInput.query
        )}&api_key=${serpApiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        const results = data.organic_results
          ?.slice(0, 3)
          .map((r: any) => `${r.title}\n${r.snippet}\n${r.link}`)
          .join("\n\n");

        return results || "No results found";
      }

      case "execute_command": {
        const { stdout, stderr } = await execAsync(toolInput.command, {
          cwd: PROJECT_ROOT,
        });
        return stdout || stderr;
      }

      default:
        return `Unknown tool: ${toolName}`;
    }
  } catch (error) {
    console.error(`Error executing ${toolName}:`, error);
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// ============================================
// ORCHESTRATOR PRINCIPAL
// ============================================

export async function orchestrate(
  userMessage: string,
  conversationHistory: Message[] = []
): Promise<string> {
  const messages: Message[] = [
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  let finalResponse = "";
  let continueLoop = true;

  while (continueLoop) {
    console.log("\n🤖 Calling Claude...");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      tools: TOOLS,
      messages: messages,
    });

    console.log(`Stop reason: ${response.stop_reason}`);

    // Procesar contenido de la respuesta
    for (const block of response.content) {
      if (block.type === "text") {
        finalResponse += block.text;
        console.log(`💬 Claude: ${block.text}`);
      } else if (block.type === "tool_use") {
        console.log(`🔧 Tool call: ${block.name}`);
        console.log(`   Input:`, JSON.stringify(block.input, null, 2));

        // Ejecutar herramienta
        const toolResult = await executeToolCall(block.name, block.input);
        console.log(`   Result: ${toolResult.substring(0, 200)}...`);

        // Agregar el bloque de tool_use a los mensajes
        messages.push({
          role: "assistant",
          content: response.content,
        });

        // Agregar resultado de la herramienta
        messages.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: block.id,
              content: toolResult,
            },
          ],
        });
      }
    }

    // Decidir si continuar el loop
    if (response.stop_reason === "end_turn") {
      continueLoop = false;
    } else if (response.stop_reason === "tool_use") {
      // Continuar para procesar resultados de herramientas
      continueLoop = true;
    } else {
      continueLoop = false;
    }
  }

  return finalResponse;
}

// ============================================
// SERVIDOR HTTP SIMPLE
// ============================================

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Almacenamiento temporal de conversaciones
const conversations = new Map<string, Message[]>();

app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversation_id = "default" } = req.body;

    // Obtener historial de conversación
    const history = conversations.get(conversation_id) || [];

    // Ejecutar orchestrator
    const response = await orchestrate(message, history);

    // Guardar en historial
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: response });
    conversations.set(conversation_id, history);

    res.json({ response, conversation_id });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🫀 Orchestrator Core running on http://localhost:${PORT}`);
});
```

## 2. Frontend Mínimo (React)

**Archivo: `frontend/FreeChat.tsx`**

```typescript
import { useState } from "react";

export default function FreeChat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error(error);
      alert("Error connecting to orchestrator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🫀 Free Claude</h1>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block p-3 rounded-lg ${
              msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500">Thinking...</div>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask anything..."
          className="flex-1 p-2 border rounded"
        />
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-500 text-white rounded">
          Send
        </button>
      </div>
    </div>
  );
}
```

## 3. Instalación Rápida (5 minutos)

```bash
# 1. Crear estructura
mkdir free-claude
cd free-claude
mkdir backend frontend

# 2. Backend setup
cd backend
npm init -y
npm install @anthropic-ai/sdk express cors
npm install -D @types/node @types/express tsx

# Copiar el código de orchestrator.ts

# 3. Configurar variables de entorno
cat > .env << EOF
ANTHROPIC_API_KEY=tu_api_key_aqui
SERPAPI_KEY=tu_serpapi_key_aqui
PROJECT_ROOT=/ruta/a/tu/proyecto
PORT=3001
EOF

# 4. Ejecutar backend
npx tsx orchestrator.ts

# 5. Frontend setup (en otra terminal)
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install
# Copiar el código de FreeChat.tsx a src/App.tsx
npm run dev
```

## 4. Pruebas Inmediatas

### Test 1: Leer archivo
```
User: "Lee el archivo package.json y dime qué dependencias tengo"
```

### Test 2: Escribir código
```
User: "Crea un componente React llamado Button.tsx con un botón básico"
```

### Test 3: Buscar en web
```
User: "Busca las últimas noticias sobre Claude AI"
```

### Test 4: Ejecutar comandos
```
User: "Instala la librería axios en mi proyecto"
```

## 5. Costos Reales

**Costo por cada conversación típica:**
- Entrada: ~500 tokens = $0.0015
- Salida: ~1500 tokens = $0.015
- Tool calls (3-5): incluido
- **Total por conversación: ~$0.02**

**Costo mensual (uso intensivo):**
- 1000 conversaciones/mes = **$20/mes**
- Servidor backend (Railway/Render): **$0-5/mes**
- **TOTAL: $20-25/mes SIN LÍMITES**

Compare con Lovable:
- Plan Creator: $20/mes con 500 mensajes = $0.04 por mensaje
- Plan Pro: $60/mes con 2000 mensajes = $0.03 por mensaje

**Ahorro del 50% + libertad total** 🎉

## 6. Expansión Futura

Una vez que el corazón late, puedes agregar:

1. **Más herramientas** (~10 líneas cada una):
   - `search_files` (grep en proyecto)
   - `git_commit` (automatizar git)
   - `run_tests` (ejecutar test suite)
   - `deploy` (deploy automático)

2. **Persistencia real**:
   - Guardar conversaciones en SQLite/PostgreSQL
   - Sistema de snapshots
   - Búsqueda semántica de memoria

3. **Streaming**:
   - SSE para respuestas en tiempo real
   - Progress indicators para tool execution

4. **Multi-agente**:
   - Orquestar múltiples instancias de Claude
   - Especialización por dominio

## 7. Ventajas vs Lovable

| Aspecto | Lovable | Orchestrator Core |
|---------|---------|-------------------|
| **Costo** | $20-60/mes limitado | $20/mes ILIMITADO |
| **Control** | Cero (caja negra) | Total (código abierto) |
| **Velocidad** | API + middleware | API directa |
| **Herramientas** | Lista fija | Infinitas (tú decides) |
| **Data** | En servidores Lovable | En tu máquina |
| **Extensión** | Imposible | Trivial (agregar tools) |
| **Lock-in** | Total | Cero |

## 8. Siguiente Paso: Memoria Persistente

Para memoria completa como la que tienes en tu proyecto actual:

```typescript
// Agregar herramienta
{
  name: "save_memory",
  description: "Guarda una conversación importante con embeddings",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      content: { type: "string" },
      concepts: { type: "array", items: { type: "string" } }
    }
  }
}

// Implementación
case "save_memory": {
  // Generar embedding con OpenAI
  const embedding = await generateEmbedding(toolInput.content);
  
  // Guardar en Supabase/PostgreSQL
  await supabase.from('conversations').insert({
    title: toolInput.title,
    content: toolInput.content,
    concepts: toolInput.concepts,
    embedding: embedding
  });
  
  return "Memory saved successfully";
}
```

## Conclusión

**Este es tu corazón base de libertad:**
- ✅ 200 líneas de código
- ✅ 5 herramientas críticas
- ✅ API directa a Claude
- ✅ Costo predecible
- ✅ Control total
- ✅ Extensible infinitamente

**Con este código corriendo, eres completamente libre de Lovable.**

El resto es solo expansión: más herramientas, mejor UI, memoria persistente, etc. Pero el corazón ya late. 🫀

---

*Documento creado: 2025-01-16*  
*Parte del proyecto: MEMORIA - Sistema de Liberación Total*
