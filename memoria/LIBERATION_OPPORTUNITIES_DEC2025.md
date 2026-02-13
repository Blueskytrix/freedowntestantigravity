# Oportunidades de Liberación - Diciembre 2025

## Resumen

Basado en el análisis de actualizaciones de Lovable (Dic 2025), este documento identifica oportunidades concretas para acelerar Claude Libre.

---

## 1. APIs para Integración Directa

### 1.1 Perplexity API
**Ventaja:** Búsqueda web con grounding, alternativa a SerpAPI

```typescript
// Integración directa en Claude Libre
const searchWithPerplexity = async (query: string) => {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{ role: 'user', content: query }],
    }),
  });
  return response.json();
};
```

**Modelos disponibles:**
- `sonar` - Búsqueda rápida
- `sonar-pro` - Multi-step reasoning
- `sonar-reasoning` - Chain-of-thought
- `sonar-deep-research` - Investigación profunda

**Costo estimado:** $5-20/mes según uso

---

### 1.2 ElevenLabs API
**Ventaja:** Voice AI completo (TTS, STT, música, SFX)

```typescript
// Text-to-Speech
const generateSpeech = async (text: string, voiceId: string) => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
      }),
    }
  );
  return response.arrayBuffer();
};

// Speech-to-Text (Realtime)
// Usar @elevenlabs/react con useScribe hook
```

**Capacidades:**
- 20+ voces premium
- Streaming TTS
- STT batch y realtime
- Generación de música
- Efectos de sonido

**Costo estimado:** $5-22/mes según uso

---

### 1.3 Firecrawl API
**Ventaja:** Web scraping AI-powered

```typescript
// Scraping inteligente
const scrapeWebsite = async (url: string) => {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });
  return response.json();
};
```

**Nota:** Gratis hasta Enero 2026, luego pricing TBD

---

## 2. Debugging Real con Playwright

Lovable tiene debugging roto. Claude Libre puede implementarlo correctamente:

```typescript
// tools/browser-debug.ts
import { chromium, Browser, Page } from 'playwright';

export class BrowserDebugger {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private consoleLogs: string[] = [];
  private networkRequests: any[] = [];

  async launch(url: string) {
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
    
    // Capturar console logs
    this.page.on('console', msg => {
      this.consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Capturar network requests
    this.page.on('request', request => {
      this.networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
      });
    });
    
    this.page.on('response', response => {
      const req = this.networkRequests.find(r => r.url === response.url());
      if (req) {
        req.status = response.status();
        req.statusText = response.statusText();
      }
    });
    
    await this.page.goto(url);
  }

  getConsoleLogs(): string[] {
    return this.consoleLogs;
  }

  getNetworkRequests(): any[] {
    return this.networkRequests;
  }

  async screenshot(): Promise<Buffer> {
    if (!this.page) throw new Error('No page loaded');
    return this.page.screenshot();
  }

  async close() {
    await this.browser?.close();
  }
}
```

**Herramientas que esto habilita:**
- ✅ `read-console-logs` - Funcional
- ✅ `read-network-requests` - Funcional
- ✅ `sandbox-screenshot` - Funcional
- ✅ `session-replay` - Posible con rrweb

---

## 3. Task Tracking Propio

Replicar el sistema de Lovable en Claude Libre:

```typescript
// tools/task-tracking.ts
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

class TaskTracker {
  private tasks: Map<string, Task> = new Map();

  createTask(title: string, description: string): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      status: 'todo',
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  setStatus(taskId: string, status: Task['status']): Task {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    task.status = status;
    task.updatedAt = new Date();
    return task;
  }

  addNote(taskId: string, note: string): Task {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    task.notes.push(note);
    task.updatedAt = new Date();
    return task;
  }

  getTaskList(): Task[] {
    return Array.from(this.tasks.values());
  }
}
```

---

## 4. MCP Integration Expandida

### MCPs Públicos para Integrar (100+)

**Tier 1 - Críticos:**
| MCP | Función | Repo |
|-----|---------|------|
| filesystem | Archivos locales | @anthropics/mcp-server-filesystem |
| github | Repos/PRs/Issues | @anthropics/mcp-server-github |
| postgres | Base de datos | @anthropics/mcp-server-postgres |
| brave-search | Búsqueda web | @anthropics/mcp-server-brave-search |
| memory | Persistencia | @anthropics/mcp-server-memory |

**Tier 2 - Productividad:**
| MCP | Función | Repo |
|-----|---------|------|
| notion | Docs/Databases | @anthropics/mcp-server-notion |
| linear | Issues/Projects | @anthropics/mcp-server-linear |
| slack | Mensajería | @anthropics/mcp-server-slack |
| google-drive | Archivos | @anthropics/mcp-server-google-drive |
| gmail | Email | Community |

**Tier 3 - Desarrollo:**
| MCP | Función | Repo |
|-----|---------|------|
| docker | Containers | Community |
| kubernetes | Orquestación | Community |
| aws | Cloud services | Community |
| vercel | Deployments | Community |
| cloudflare | Edge/Workers | Community |

**Tier 4 - Especializado:**
| MCP | Función | Repo |
|-----|---------|------|
| puppeteer | Browser automation | @anthropics/mcp-server-puppeteer |
| playwright | Testing E2E | Community |
| coolify | Self-hosted PaaS | @pashvc/mcp-server-coolify |
| n8n | Workflows | Community |
| home-assistant | IoT | Community |

---

## 5. Generación de Imágenes

Lovable tiene `imagegen` roto. Alternativas para Claude Libre:

### Replicate API (Flux)
```typescript
const generateImage = async (prompt: string) => {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'black-forest-labs/flux-schnell',
      input: { prompt },
    }),
  });
  return response.json();
};
```

### Gemini Image Generation
```typescript
// Via Lovable AI Gateway (si disponible)
const generateImageGemini = async (prompt: string) => {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  return response.json();
};
```

---

## 6. Visibilidad de Costos

Implementar tracking que Lovable oculta:

```typescript
// tools/cost-tracker.ts
interface APICall {
  timestamp: Date;
  service: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

class CostTracker {
  private calls: APICall[] = [];
  
  // Precios por 1M tokens (Dic 2025)
  private pricing = {
    'claude-sonnet-4': { input: 3, output: 15, cached: 0.30 },
    'claude-opus-4': { input: 15, output: 75, cached: 1.50 },
    'gemini-2.5-flash': { input: 0.15, output: 0.60 },
    'gpt-5': { input: 5, output: 15 },
  };

  trackCall(service: string, model: string, inputTokens: number, outputTokens: number) {
    const price = this.pricing[model] || { input: 1, output: 3 };
    const cost = (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
    
    this.calls.push({
      timestamp: new Date(),
      service,
      model,
      inputTokens,
      outputTokens,
      cost,
    });
  }

  getTotalCost(): number {
    return this.calls.reduce((sum, call) => sum + call.cost, 0);
  }

  getDailyCost(): number {
    const today = new Date().toDateString();
    return this.calls
      .filter(call => call.timestamp.toDateString() === today)
      .reduce((sum, call) => sum + call.cost, 0);
  }

  getBreakdown(): Record<string, number> {
    return this.calls.reduce((acc, call) => {
      acc[call.service] = (acc[call.service] || 0) + call.cost;
      return acc;
    }, {} as Record<string, number>);
  }
}
```

---

## 7. Roadmap de Implementación

### Semana 1: Infraestructura
- [ ] Deploy en Oracle Free Tier o Hetzner
- [ ] Instalar Coolify
- [ ] Configurar PostgreSQL + pgvector
- [ ] Deploy claude-libre-foundation básico

### Semana 2: APIs Externas
- [ ] Integrar Perplexity para búsqueda
- [ ] Integrar ElevenLabs para voice
- [ ] Integrar Firecrawl para scraping
- [ ] Implementar cost tracker

### Semana 3: Debugging + MCPs
- [ ] Implementar Playwright debugger
- [ ] Console logs funcional
- [ ] Network requests funcional
- [ ] Screenshots funcional
- [ ] Conectar 10 MCPs públicos

### Semana 4: Frontend + Polish
- [ ] Deploy React frontend con Monaco
- [ ] Task tracking UI
- [ ] Dashboard de costos
- [ ] Documentación completa

---

## 8. Comparativa Final

| Capacidad | Lovable (Dic 2025) | Claude Libre (Target) |
|-----------|-------------------|----------------------|
| Herramientas | 28 (9 rotas) | 50+ (todas funcionales) |
| MCPs | 5 | 100+ |
| Debugging | ❌ Roto | ✅ Completo |
| Costos visibles | ❌ No | ✅ Tiempo real |
| Voice AI | Via conector | ✅ Directo |
| Web search | Via conector | ✅ Directo |
| Image gen | ❌ Roto | ✅ Funcional |
| Stack | Solo React | Cualquiera |
| Costo/mes | $25-150 | $15-30 |

---

## Próximos Pasos

1. Elegir plataforma: Oracle Free Tier vs Hetzner
2. Crear script de deployment automatizado
3. Implementar primeras 10 herramientas críticas
4. Conectar primeros 5 MCPs

Ver: [ORACLE_FREE_TIER_SETUP.md](./ORACLE_FREE_TIER_SETUP.md) o [HETZNER_COOLIFY_SETUP.md](./HETZNER_COOLIFY_SETUP.md)
