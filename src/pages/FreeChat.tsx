import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Brain, Wrench, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const FreeChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<string>("general");
  const { toast } = useToast();

  // Orchestrator now running as Supabase Edge Function
  const GITHUB_WORKSPACE_OWNER = "teststrateaios-beep";
  const GITHUB_WORKSPACE_REPO = "freedom-workspace";

  // Project Templates
  const projectTemplates = [
    {
      id: "react",
      name: "React Project",
      icon: "⚛️",
      description: "React 18 + TypeScript + Vite",
      prompt: `Crea un proyecto React completo en el workspace con:
- package.json (React 18.3.1, TypeScript, Vite, con scripts: dev, build, preview)
- src/App.tsx (componente funcional básico con contador y estilos)
- src/main.tsx (entry point con React.StrictMode)
- src/index.css (estilos globales básicos)
- index.html (estructura HTML5 correcta)
- tsconfig.json (configuración TypeScript para React)
- vite.config.ts (configuración Vite básica)
- README.md (instrucciones de instalación con npm install, npm run dev, descripción del proyecto)
- .gitignore (node_modules, dist, .env)`
    },
    {
      id: "html",
      name: "HTML/CSS/JS",
      icon: "🎨",
      description: "Static web project",
      prompt: `Crea un proyecto web estático en el workspace con:
- index.html (estructura HTML5 semántica completa con header, main, footer)
- styles.css (estilos modernos con CSS Grid/Flexbox, variables CSS, responsive design)
- script.js (funcionalidad JavaScript básica con event listeners)
- README.md (descripción del proyecto y cómo abrirlo en el navegador)
- assets/ (carpeta para imágenes si es necesario)`
    },
    {
      id: "nodejs",
      name: "Node.js API",
      icon: "🚀",
      description: "Express REST API",
      prompt: `Crea una API REST con Node.js en el workspace con:
- package.json (Express 4, TypeScript, con scripts: dev con nodemon, build, start)
- src/server.ts (servidor Express básico en puerto 3000)
- src/routes/api.ts (rutas de ejemplo: GET /api/health, GET /api/data, POST /api/data)
- src/types/index.ts (tipos TypeScript para la API)
- tsconfig.json (configuración TypeScript para Node.js)
- .env.example (variables de entorno de ejemplo: PORT, NODE_ENV)
- README.md (documentación de endpoints, instalación y ejecución)
- .gitignore (node_modules, dist, .env)`
    },
    {
      id: "python",
      name: "Python Script",
      icon: "🐍",
      description: "Python project with venv",
      prompt: `Crea un proyecto Python en el workspace con:
- main.py (script principal con función main y ejemplo de uso)
- requirements.txt (dependencias necesarias)
- README.md (descripción, instalación con venv, y ejecución)
- .gitignore (venv/, __pycache__/, *.pyc)
- utils/ (carpeta para módulos auxiliares si es necesario)`
    }
  ];

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
        body: { message: messageToSend }
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "No response from orchestrator",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error calling orchestrator:", error);
      
      toast({
        title: "❌ Error",
        description: "Failed to send message to AI orchestrator. Please try again.",
        variant: "destructive",
      });

      // Agregar mensaje de error en el chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${error.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTemplateClick = (template: typeof projectTemplates[0]) => {
    setInput(template.prompt);
    // Auto-send the message
    setTimeout(() => {
      const userMessage: Message = {
        role: "user",
        content: template.prompt,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      supabase.functions.invoke('ai-orchestrator', {
        body: { message: template.prompt }
      }).then(({ data, error }) => {
        if (error) throw error;
        
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response || "No response from orchestrator",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }).catch((error: any) => {
        console.error("Error calling orchestrator:", error);
        toast({
          title: "❌ Error",
          description: "Failed to send message to AI orchestrator. Please try again.",
          variant: "destructive",
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ Error: ${error.message}`,
            timestamp: new Date(),
          },
        ]);
      }).finally(() => {
        setIsLoading(false);
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Free Chat</h1>
                <Badge variant="outline" className="text-xs">
                  MVP EXPERIMENTAL
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Chat directo con AI Orchestrator + Tool Calling
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Project Templates */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Quick Start Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {projectTemplates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="h-auto py-4 px-4 flex flex-col items-start gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                onClick={() => handleTemplateClick(template)}
                disabled={isLoading}
              >
                <div className="text-2xl">{template.icon}</div>
                <div className="text-left w-full">
                  <div className="font-semibold text-sm">{template.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {template.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Wrench className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Sistema de Orquestación Activo</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    read_file
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    write_file
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    list_dir
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    execute_command
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    web_search
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    save_memory
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">GitHub Workspace:</span>
                  <Badge variant="default" className="font-mono text-xs">
                    {GITHUB_WORKSPACE_OWNER}/{GITHUB_WORKSPACE_REPO}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Workspace Card */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold mb-1">🔗 GitHub Workspace</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Conectado a <code className="bg-background px-1 py-0.5 rounded text-xs">{GITHUB_WORKSPACE_OWNER}/{GITHUB_WORKSPACE_REPO}</code>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setInput("List all files in the GitHub workspace");
                sendMessage();
              }}
            >
              📂 List Files
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setInput("Show me the README.md file from the workspace");
                sendMessage();
              }}
            >
              📖 Read File
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setInput("Create a new file called 'test.md' with content 'Hello from Freedom Chat'");
                sendMessage();
              }}
            >
              ✏️ Create File
            </Button>
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="flex flex-col h-[600px]">
          <ScrollArea className="flex-1 p-6">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Brain className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">Bienvenido a Free Chat</p>
                <p className="text-sm mb-4">
                  AI Orchestrator con acceso a herramientas reales
                </p>
                <div className="text-left max-w-md mx-auto bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2">🔧 Herramientas disponibles:</p>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>• <code>read_file</code> - Leer cualquier archivo del proyecto</li>
                    <li>• <code>write_file</code> - Crear/editar archivos en workspace/</li>
                    <li>• <code>list_dir</code> - Listar directorios</li>
                    <li>• <code>web_search</code> - Buscar en la web</li>
                    <li>• <code>execute_command</code> - Ejecutar comandos seguros</li>
                  </ul>
                  <p className="text-sm font-semibold mb-2">🎨 Zona de trabajo:</p>
                  <p className="text-xs mb-2">
                    Puedo crear proyectos completos en <code className="bg-background px-1 py-0.5 rounded">workspace/</code>
                  </p>
                  <p className="text-sm font-semibold mb-2">📖 Ejemplos:</p>
                  <ul className="text-sm space-y-1">
                    <li>• "Lee el archivo package.json"</li>
                    <li>• "Crea un proyecto React en workspace/mi-app/"</li>
                    <li>• "Busca información sobre Claude AI"</li>
                    <li>• "Lista archivos en workspace/"</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Ejecutando herramientas...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un mensaje o comando..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Presiona Enter para enviar • Shift+Enter para nueva línea
            </p>
          </div>
        </Card>

        {/* Stats Footer */}
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{messages.length}</p>
              <p className="text-xs text-muted-foreground">Mensajes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">5</p>
              <p className="text-xs text-muted-foreground">Herramientas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">$0.02</p>
              <p className="text-xs text-muted-foreground">Costo estimado</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FreeChat;
