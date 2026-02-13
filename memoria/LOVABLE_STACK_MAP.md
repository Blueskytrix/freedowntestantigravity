# Mapa Visual Completo del Stack de Lovable

> Fecha: 2025-12-24
> Objetivo: Entender la arquitectura completa para replicar/liberar

---

## 1. Vista de Alto Nivel - Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            LOVABLE PLATFORM                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                    │
│   │   Usuario    │────▶│  Lovable UI  │────▶│    Claude    │                    │
│   │  (Browser)   │◀────│   (React)    │◀────│  (Anthropic) │                    │
│   └──────────────┘     └──────────────┘     └──────────────┘                    │
│          │                    │                    │                             │
│          │                    ▼                    ▼                             │
│          │           ┌──────────────┐     ┌──────────────┐                      │
│          │           │   Sandbox    │     │ System Prompt│                      │
│          │           │   (Molnett)  │     │  (Injected)  │                      │
│          └──────────▶│   Vite Dev   │     └──────────────┘                      │
│                      └──────────────┘                                            │
│                             │                                                    │
│                             ▼                                                    │
│                      ┌──────────────┐                                           │
│                      │   Supabase   │                                           │
│                      │   (Backend)  │                                           │
│                      └──────────────┘                                           │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Diagrama de Capas de Restricción

<presentation-mermaid>
flowchart TB
    subgraph L1["🔴 CAPA 1: Restricciones de Anthropic"]
        A1[Claude Base Model]
        A2[Content Policy]
        A3[Safety Guardrails]
    end
    
    subgraph L2["🟠 CAPA 2: System Prompt de Lovable"]
        B1[Role Definition]
        B2[Tool Definitions]
        B3[Response Format Rules]
        B4[Design Guidelines]
        B5[Workflow Constraints]
    end
    
    subgraph L3["🟡 CAPA 3: Tool Gating"]
        C1[Mode: Chat vs Default]
        C2[Herramientas Bloqueadas]
        C3[Ghost Tools]
        C4[Approval Required]
    end
    
    subgraph L4["🟢 CAPA 4: Sandbox Environment"]
        D1[LOVABLE_DEV_SERVER=true]
        D2[lovable-tagger plugin]
        D3[Vite Config Override]
        D4[File System Isolation]
    end
    
    subgraph L5["🔵 CAPA 5: Backend Separation"]
        E1[Lovable Sandbox ≠ Supabase]
        E2[Edge Functions Deploy]
        E3[Database Remote]
    end
    
    L1 --> L2 --> L3 --> L4 --> L5
</presentation-mermaid>

---

## 3. Flujo de una Petición de Usuario

<presentation-mermaid>
sequenceDiagram
    participant U as Usuario
    participant UI as Lovable UI
    participant SP as System Prompt
    participant C as Claude API
    participant TG as Tool Gateway
    participant SB as Sandbox
    participant DB as Supabase
    
    U->>UI: Escribe mensaje
    UI->>SP: Inyecta system prompt
    SP->>C: Mensaje + Contexto + Tools
    
    C->>C: Procesa petición
    C->>TG: Invoca herramienta
    
    alt Tool Permitida
        TG->>SB: Ejecuta (lov-view, etc)
        SB-->>TG: Resultado
    else Tool Bloqueada
        TG-->>C: "Blocked in chat mode"
    else Ghost Tool
        TG-->>C: "No data available"
    end
    
    C->>UI: Respuesta formateada
    UI->>U: Renderiza markdown + preview
    
    opt Si hay cambios de código
        SB->>SB: Vite hot reload
        UI->>U: Preview actualizado
    end
    
    opt Si hay edge functions
        SB->>DB: Deploy automático
    end
</presentation-mermaid>

---

## 4. Mapa de Herramientas por Estado

<presentation-mermaid>
mindmap
  root((41 Tools))
    Funcionales 29
      File Ops
        lov-view
        lov-list-dir
        lov-search-files
        lov-download-to-repo
      Supabase
        read-query
        analytics-query
        linter
        edge-function-logs
        curl_edge_functions
      Security
        run_security_scan
        get_scan_results
        get_table_schema
        manage_finding
      Web
        web_search
        web_code_search
        fetch-website
      Tasks
        create_task
        set_status
        get_list
        add_note
      Other
        fetch_secrets
        parse_document
        ask_questions
        sleep
    Bloqueadas 7
      lov-write
      lov-line-replace
      lov-rename
      lov-delete
      lov-copy
      migration
      deploy_functions
    Ghost Tools 4
      read-console-logs
      read-network-requests
      read-session-replay
      sandbox-screenshot
    Aprobación 2
      enable_shopify
      enable_stripe
</presentation-mermaid>

---

## 5. Arquitectura del Sandbox

<presentation-mermaid>
flowchart LR
    subgraph Molnett["☁️ Molnett Infrastructure"]
        subgraph Container["📦 Sandbox Container"]
            FS[File System<br>/src, /memoria, etc]
            VITE[Vite Dev Server<br>Port 5173]
            NODE[Node.js Runtime]
            ENV[Environment<br>LOVABLE_DEV_SERVER=true]
        end
        
        subgraph Plugin["🔌 lovable-tagger"]
            TW[Tailwind Resolver]
            JSON[tailwind.config.lov.json]
        end
    end
    
    subgraph External["🌐 External"]
        BROWSER[User Browser]
        SUPABASE[(Supabase<br>bjxocgkgatkogdmzrrfk)]
        CLAUDE[Claude API]
    end
    
    BROWSER -->|Preview iframe| VITE
    VITE --> FS
    NODE --> Plugin
    Plugin --> JSON
    Container -.->|Deploy| SUPABASE
    CLAUDE -->|Tool calls| Container
</presentation-mermaid>

---

## 6. Separación Lovable vs Supabase

<presentation-mermaid>
flowchart TB
    subgraph LOVABLE["💜 LOVABLE (Cloud IDE)"]
        direction TB
        L1[Sandbox Efímero]
        L2[Vite Preview]
        L3[File Storage Temporal]
        L4[Claude + Tools]
        L5[lovable-tagger]
        
        L1 --> L2
        L2 --> L3
        L4 --> L1
        L5 --> L2
    end
    
    subgraph BRIDGE["🔶 PUENTE"]
        B1[.env variables]
        B2[supabase/config.toml]
        B3[src/integrations/supabase/]
        B4[Deploy automático]
    end
    
    subgraph SUPABASE["💚 SUPABASE (Backend Real)"]
        direction TB
        S1[(PostgreSQL)]
        S2[Edge Functions]
        S3[Auth System]
        S4[Storage Buckets]
        S5[Realtime]
        
        S1 --> S2
        S2 --> S3
        S3 --> S4
    end
    
    LOVABLE --> BRIDGE
    BRIDGE --> SUPABASE
    
    style LOVABLE fill:#9333ea,color:#fff
    style BRIDGE fill:#f97316,color:#fff
    style SUPABASE fill:#22c55e,color:#fff
</presentation-mermaid>

---

## 7. System Prompt - Estructura Detectada

<presentation-mermaid>
flowchart TB
    subgraph SP["📜 SYSTEM PROMPT (~50k tokens)"]
        direction TB
        
        subgraph ROLE["1. Role Definition"]
            R1[Identity: Lovable AI Editor]
            R2[Tech Stack: React, Vite, Tailwind, TS]
            R3[Current Date Injection]
        end
        
        subgraph TOOLS["2. Tool Definitions (41)"]
            T1[File Operations]
            T2[Supabase Tools]
            T3[Security Tools]
            T4[Web Search]
            T5[Media Generation]
        end
        
        subgraph RULES["3. Behavioral Rules"]
            RU1[Response Format]
            RU2[Design Guidelines]
            RU3[SEO Requirements]
            RU4[Debugging Workflow]
        end
        
        subgraph CONTEXT["4. Dynamic Context"]
            C1[Current Code]
            C2[Read-only Files]
            C3[Dependencies]
            C4[Supabase Config]
            C5[Recent Logs]
        end
        
        subgraph SAFETY["5. Safety Restrictions"]
            SA1[Content Policy]
            SA2[Tool Blocking]
            SA3[Internal Tool Secrecy]
        end
    end
    
    ROLE --> TOOLS --> RULES --> CONTEXT --> SAFETY
</presentation-mermaid>

---

## 8. Flujo de Deploy de Edge Functions

<presentation-mermaid>
sequenceDiagram
    participant DEV as Developer
    participant SAND as Sandbox
    participant GIT as Git Repo
    participant SUP as Supabase
    
    DEV->>SAND: Escribe código en<br>supabase/functions/xyz/
    SAND->>SAND: Valida TypeScript
    SAND->>GIT: Commit automático
    
    Note over SAND,SUP: Deploy Automático
    
    SAND->>SUP: Push function code
    SUP->>SUP: Deno build
    SUP->>SUP: Deploy to edge
    SUP-->>SAND: Deploy status
    
    DEV->>SUP: Invoke function
    SUP-->>DEV: Response
</presentation-mermaid>

---

## 9. Comparativa: Lovable vs Claude Libre

<presentation-mermaid>
flowchart LR
    subgraph LOVABLE["💜 LOVABLE ACTUAL"]
        direction TB
        LA[41 Herramientas]
        LB[29 Funcionales]
        LC[7 Bloqueadas]
        LD[4 Ghost Tools]
        LE[Solo React]
        LF[$40-150/mes]
        LG[Vendor Lock-in]
    end
    
    subgraph LIBRE["💚 CLAUDE LIBRE"]
        direction TB
        CA[50+ Herramientas]
        CB[100% Funcionales]
        CC[0 Bloqueadas]
        CD[Debugging Real]
        CE[Stack Agnóstico]
        CF[$15-50/mes]
        CG[Open Source]
    end
    
    LOVABLE -->|Liberación| LIBRE
    
    style LOVABLE fill:#9333ea,color:#fff
    style LIBRE fill:#22c55e,color:#fff
</presentation-mermaid>

---

## 10. Componentes a Replicar para Liberación

<presentation-mermaid>
flowchart TB
    subgraph REPLICATE["🔧 COMPONENTES A REPLICAR"]
        direction TB
        
        subgraph CORE["Core (Semanas 1-2)"]
            O1[Orchestrator<br>Claude API + Tool Calling]
            O2[File Operations<br>Read/Write/Search]
            O3[Database<br>PostgreSQL Direct]
        end
        
        subgraph DEBUG["Debugging (Semanas 3-4)"]
            D1[Dev Server<br>Vite Spawn]
            D2[Browser Automation<br>Puppeteer]
            D3[Console Capture<br>Real Logs]
            D4[Network Monitor<br>Request Logging]
        end
        
        subgraph SECURITY["Security (Semana 5)"]
            S1[RLS Scanner]
            S2[Secret Manager<br>Encrypted]
            S3[Env Management]
        end
        
        subgraph AI["AI & Media (Semanas 6-7)"]
            A1[Image Gen<br>DALL-E/Flux]
            A2[Code Search<br>GitHub API]
            A3[Web Search<br>SerpAPI/DDG]
        end
        
        subgraph EXTRA["Polish (Semana 8)"]
            E1[Analytics]
            E2[Task Tracking]
            E3[Multi-Connector]
        end
    end
    
    CORE --> DEBUG --> SECURITY --> AI --> EXTRA
</presentation-mermaid>

---

## 11. Puntos de Libertad Identificados

<presentation-mermaid>
flowchart TB
    subgraph FREEDOM["🔓 PUNTOS DE LIBERTAD"]
        
        F1["✅ 1. API Directa a Claude<br>Sin intermediario Lovable"]
        F2["✅ 2. Herramientas Propias<br>Sin tool gating"]
        F3["✅ 3. Debugging Real<br>Puppeteer + Console real"]
        F4["✅ 4. Stack Agnóstico<br>No solo React"]
        F5["✅ 5. Sin System Prompt Impuesto<br>Prompt propio"]
        F6["✅ 6. Conectores Ilimitados<br>Cualquier API"]
        F7["✅ 7. Costo Reducido<br>Solo API usage"]
        F8["✅ 8. Open Source<br>Transparencia total"]
    end
    
    subgraph RESULT["🎯 RESULTADO"]
        R1[Claude Libre]
        R2[Autonomía 100%]
        R3[Sin Restricciones]
    end
    
    FREEDOM --> RESULT
</presentation-mermaid>

---

## 12. Stack Tecnológico Detectado

### Lovable Platform

| Componente | Tecnología | Evidencia |
|------------|------------|-----------|
| **Frontend** | React + Vite + Tailwind | `vite.config.ts`, `tailwind.config.ts` |
| **AI Model** | Claude (Anthropic) | System prompt references |
| **Sandbox** | Molnett | Documentación interna |
| **Plugin** | lovable-tagger 1.1.11 | `node_modules/lovable-tagger/` |
| **Env Detection** | `LOVABLE_DEV_SERVER` | Plugin source code |
| **Config Gen** | `tailwind.config.lov.json` | Generated file (7,715 lines) |
| **Backend** | Supabase (externo) | `supabase/config.toml` |
| **Edge Runtime** | Deno | `supabase/functions/` |
| **Database** | PostgreSQL 17.6 | Supabase connection |
| **Embeddings** | pgvector + OpenAI | `match_conversations` function |

### Claude Libre Target

| Componente | Tecnología Propuesta |
|------------|---------------------|
| **Orchestrator** | Node.js + TypeScript |
| **AI Model** | Claude API (directo) |
| **File Ops** | Node fs + glob |
| **Database** | PostgreSQL (pg) |
| **Preview** | Vite spawn + Puppeteer |
| **Debugging** | Puppeteer console capture |
| **Secrets** | Encrypted .secrets.enc |
| **Web Search** | SerpAPI / DuckDuckGo |
| **Image Gen** | OpenAI DALL-E / Replicate |

---

## 13. Resumen Visual Final

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        MAPA DE LIBERACIÓN                                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║   LOVABLE (Actual)                    CLAUDE LIBRE (Objetivo)                 ║
║   ================                    ======================                   ║
║                                                                                ║
║   ┌─────────────────┐                 ┌─────────────────┐                     ║
║   │  System Prompt  │  ───────────▶   │  Prompt Propio  │                     ║
║   │   (Impuesto)    │                 │   (Libre)       │                     ║
║   └─────────────────┘                 └─────────────────┘                     ║
║                                                                                ║
║   ┌─────────────────┐                 ┌─────────────────┐                     ║
║   │  41 Tools       │  ───────────▶   │  50+ Tools      │                     ║
║   │  (29 funcional) │                 │  (100% funcional)│                    ║
║   └─────────────────┘                 └─────────────────┘                     ║
║                                                                                ║
║   ┌─────────────────┐                 ┌─────────────────┐                     ║
║   │  Ghost Debugging│  ───────────▶   │  Real Debugging │                     ║
║   │  (No funciona)  │                 │  (Puppeteer)    │                     ║
║   └─────────────────┘                 └─────────────────┘                     ║
║                                                                                ║
║   ┌─────────────────┐                 ┌─────────────────┐                     ║
║   │  Solo React     │  ───────────▶   │  Cualquier Stack│                     ║
║   │                 │                 │                 │                     ║
║   └─────────────────┘                 └─────────────────┘                     ║
║                                                                                ║
║   ┌─────────────────┐                 ┌─────────────────┐                     ║
║   │  $40-150/mes    │  ───────────▶   │  $15-50/mes     │                     ║
║   │  (Suscripción)  │                 │  (Solo API)     │                     ║
║   └─────────────────┘                 └─────────────────┘                     ║
║                                                                                ║
║   ┌─────────────────┐                 ┌─────────────────┐                     ║
║   │  Vendor Lock-in │  ───────────▶   │  Open Source    │                     ║
║   │  (Opaco)        │                 │  (Transparente) │                     ║
║   └─────────────────┘                 └─────────────────┘                     ║
║                                                                                ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  TIEMPO ESTIMADO: 8 semanas para libertad total                               ║
║  VER: memoria/TOOLS_COMPLETE_INVENTORY.md para código de implementación       ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## Archivos Relacionados

- `memoria/TOOLS_COMPLETE_INVENTORY.md` - Inventario completo con código
- `memoria/LOVABLE_PREVIEW_SYSTEM.md` - Análisis del sistema de preview
- `memoria/LOVABLE_SUPABASE_SEPARATION.md` - Separación IDE vs Backend
- `workspace/claude-libre-foundation/` - Implementación en progreso
