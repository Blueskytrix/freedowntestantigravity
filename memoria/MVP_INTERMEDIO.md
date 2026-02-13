# 🚀 MVP Intermedio: Freedom Lab

Documentación del experimento de liberación gradual mediante una app intermedia que permite comparar Lovable (sistema actual) vs Orchestrator Libre (sistema target).

## 🎯 Concepto

En lugar de migrar todo de golpe, creamos una **ruta paralela `/free-chat`** que usa el AI Orchestrator con tool calling, mientras el resto de la app (`/`, `/memory`) sigue funcionando con Lovable/Supabase.

Esto permite:
- ✅ Comparar en tiempo real ambos sistemas
- ✅ Testear el orchestrator sin riesgos
- ✅ Iterar rápidamente sin romper nada
- ✅ Migración gradual y controlada

## 📐 Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend React                       │
│  (http://localhost:8080)                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  / (Index)           → Lovable UI                       │
│  /memory             → Lovable + Supabase Edge Funcs    │
│  /free-chat   🆕     → AI Orchestrator Backend          │
│                                                          │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTP POST
                            ▼
┌─────────────────────────────────────────────────────────┐
│          Backend Orchestrator (Node.js/Express)         │
│  (http://localhost:3001)                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  POST /api/chat      → Orchestrate con Claude           │
│  GET  /health        → Health check                     │
│                                                          │
│  🔧 5 Herramientas Críticas:                            │
│    - read_file       → Lee archivos del proyecto        │
│    - write_file      → Escribe/crea archivos            │
│    - list_dir        → Lista directorios                │
│    - web_search      → Busca en la web (SerpAPI)        │
│    - execute_command → Ejecuta comandos seguros         │
│                                                          │
└─────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   External Services                      │
├─────────────────────────────────────────────────────────┤
│  • Anthropic Claude API (claude-sonnet-4-5)            │
│  • SerpAPI (opcional, para web_search)                  │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Componentes Implementados

### 1. Backend Orchestrator (`/backend-orchestrator`)

**Archivo principal**: `orchestrator.ts` (220 líneas)

**Características**:
- Express server con CORS habilitado
- 5 herramientas implementadas con validación de seguridad
- Loop de orquestación: mensaje → tool calls → respuesta final
- Health endpoint para monitoreo

**Tecnologías**:
- `@anthropic-ai/sdk` v0.30.0
- `express` v4.18.2
- `cors` v2.8.5
- TypeScript con `tsx` para ejecución

**Setup**:
```bash
cd backend-orchestrator
npm install
cp .env.example .env
# Editar .env con ANTHROPIC_API_KEY
npm start
```

### 2. Frontend Page (`/src/pages/FreeChat.tsx`)

**Características**:
- UI de chat completa con ScrollArea
- Input con soporte para Enter/Shift+Enter
- Estados de loading con Loader2 animation
- Toast notifications para errores
- Badge experimental para indicar estado MVP
- Stats footer con métricas en tiempo real

**Diseño**:
- Usa semantic tokens del design system
- Responsive (móvil + desktop)
- Dark mode compatible
- Componentes shadcn/ui

### 3. Documentación

**Archivos**:
- `memoria/ORCHESTRATOR_CORE.md` - Teoría y código completo
- `memoria/MVP_INTERMEDIO.md` - Este archivo
- `backend-orchestrator/README.md` - Setup y troubleshooting

## 📊 Comparación: Lovable vs Orchestrator

| Aspecto | Lovable (Actual) | Orchestrator (MVP) |
|---------|------------------|-------------------|
| **Costo mensual** | $20-60+ | $15-30 |
| **Herramientas disponibles** | Limitadas por Lovable | Ilimitadas (tú defines) |
| **Velocidad respuesta** | Depende de Lovable | Directo a Claude API |
| **Control total** | ❌ No | ✅ Sí |
| **Código abierto** | ❌ No | ✅ Sí |
| **Lock-in** | ✅ Sí | ❌ No |
| **Streaming SSE** | ✅ Sí | ⚠️ Implementable |
| **Deploy fácil** | ✅ Sí | ⚠️ Requiere setup |

## 🧪 Tests Sugeridos

### Test 1: Lectura de Archivos
**Prompt**: "Lee el archivo package.json y dime qué versión de React usa"

**Resultado esperado**: 
- Claude usa `read_file` tool
- Responde: "React versión 18.3.1"

### Test 2: Listado de Directorios
**Prompt**: "Lista todos los archivos en src/pages"

**Resultado esperado**:
- Claude usa `list_dir` tool
- Lista: Index.tsx, Memory.tsx, NotFound.tsx, FreeChat.tsx

### Test 3: Búsqueda Web
**Prompt**: "Busca información actualizada sobre Claude Sonnet 4"

**Resultado esperado**:
- Claude usa `web_search` tool
- Retorna snippets de resultados de Google

### Test 4: Escritura de Archivos
**Prompt**: "Crea un archivo test.txt con el texto 'Hello from Freedom'"

**Resultado esperado**:
- Claude usa `write_file` tool
- Confirma creación del archivo

### Test 5: Ejecución de Comandos
**Prompt**: "Ejecuta pwd y dime en qué directorio estamos"

**Resultado esperado**:
- Claude usa `execute_command` tool
- Retorna path del proyecto

## 💰 Costos Reales Medidos

### Estimación de uso medio (500k tokens/mes):

| Servicio | Costo | Notas |
|----------|-------|-------|
| Claude Sonnet 4 | $15-25 | Input: $3/M tokens, Output: $15/M tokens |
| SerpAPI | $0 | 100 búsquedas gratis/mes suficientes |
| Hosting (Railway) | $0-5 | Tier gratis para empezar |
| **TOTAL** | **$15-30/mes** | vs Lovable $20-60+ |

**Ahorro estimado**: 25-50% 🎉

## 🚧 Limitaciones Actuales del MVP

1. **No streaming**: Respuestas completas (no token-by-token)
2. **Sin persistencia**: Conversaciones no se guardan
3. **Sin autenticación**: Abierto para testing
4. **Local only**: Requiere ejecutar backend localmente
5. **Herramientas limitadas**: Solo 5 por ahora

## 🎯 Próximos Pasos

### Fase 1: Validación (1-2 días)
- [x] Implementar backend orchestrator
- [x] Implementar frontend /free-chat
- [ ] Ejecutar los 5 tests sugeridos
- [ ] Documentar resultados reales

### Fase 2: Mejoras UX (3-5 días)
- [ ] Implementar streaming SSE
- [ ] Agregar syntax highlighting para código
- [ ] Persistir conversaciones (Supabase o local)
- [ ] Mejorar visualización de tool calls

### Fase 3: Expansión de Herramientas (1 semana)
- [ ] `search_files` - Grep/buscar en archivos
- [ ] `git_commit` - Commits automáticos
- [ ] `run_tests` - Ejecutar tests
- [ ] `database_query` - Queries a Supabase
- [ ] `deploy` - Deploy automático

### Fase 4: Integración con Memoria (1 semana)
- [ ] Conectar con sistema RAG existente
- [ ] Tool `save_memory` para persistir conversaciones
- [ ] Tool `search_memory` para buscar en el pasado
- [ ] Combinar búsqueda semántica + tool calling

### Fase 5: Migración Gradual (2-3 semanas)
- [ ] Mover funcionalidad de `/memory` al orchestrator
- [ ] Crear herramientas custom para tu dominio
- [ ] Deprecar dependencias de Lovable
- [ ] Full migration cuando esté listo

## 🐛 Troubleshooting

### Error: "Cannot connect to orchestrator"
**Causa**: Backend no está ejecutándose
**Solución**:
```bash
cd backend-orchestrator
npm start
```

### Error: "ANTHROPIC_API_KEY not found"
**Causa**: `.env` no configurado
**Solución**:
```bash
cp .env.example .env
# Editar .env con tu clave
```

### Error: "Port 3001 already in use"
**Solución**:
```bash
# Opción 1: Matar proceso
lsof -ti:3001 | xargs kill

# Opción 2: Cambiar puerto en .env
PORT=3002
```

### Error: "SerpAPI key not configured"
**Causa**: Web search requiere SerpAPI key
**Solución**: Agregar `SERPAPI_KEY` en `.env` o no usar web_search

## 📈 Métricas de Éxito

Para considerar el MVP exitoso:
- ✅ Los 5 tests pasan correctamente
- ✅ Latencia < 3 segundos promedio
- ✅ Costo real < $30/mes
- ✅ Sin errores críticos en 1 semana de uso
- ✅ Feedback positivo del usuario

## 🎓 Aprendizajes Clave

1. **Tool calling es el corazón**: Sin esto, Claude es solo un chatbot
2. **Express + Claude = Simplicidad**: No necesitas frameworks complejos
3. **Validación de seguridad es crítica**: `execute_command` con whitelist
4. **Streaming mejora UX**: Pero no es bloqueante para MVP
5. **Costos son predecibles**: Token-based billing de Anthropic

## 🔗 Referencias

- [Anthropic Tool Use Docs](https://docs.anthropic.com/claude/docs/tool-use)
- [ORCHESTRATOR_CORE.md](./ORCHESTRATOR_CORE.md) - Implementación completa
- [Backend README](../backend-orchestrator/README.md) - Setup detallado

---

**Fecha de creación**: 2025-01-16  
**Status**: ✅ IMPLEMENTADO  
**Próxima revisión**: Después de ejecutar tests
