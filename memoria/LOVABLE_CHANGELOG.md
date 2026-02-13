# Lovable Changelog - Historial de Cambios y Progreso de Liberación

> Registro incremental de cambios observados en Lovable + progreso de Claude Libre.
> Ordenado de más reciente a más antiguo.

---

## Enero 2026

### 2026-01-05 - Implementación Core de Claude Libre ⭐

**Hito:** Fase 1 del Plan de Liberación COMPLETADA  
**Resultado:** 49 herramientas funcionales, 0 ghost tools

#### Arquitectura Implementada

| Componente | Estado | Tools | Descripción |
|------------|--------|-------|-------------|
| Core Orchestrator | ✅ | - | Claude API + Tool Calling + Prompt Caching |
| File Operations | ✅ | 5 | read, write, search, list, line_replace (sin restricciones) |
| Code Execution | ✅ | 1 | Shell commands (whitelisted + blacklist patterns) |
| Web Access | ✅ | 2 | SerpAPI + GitHub Code Search |
| Database | ✅ | 3 | PostgreSQL admin con service_role |
| Memory | ✅ | 3 | Embeddings + pgvector semántico |
| **Debugging REAL** | ✅ | 10 | Puppeteer: console, network, screenshots, eval, click, type |
| AI & Media | ✅ | 6 | DALL-E 3, GPT-4 Vision, Whisper, TTS |
| Document Parsing | ✅ | 5 | PDF, DOCX, Excel, CSV, JSON |
| Task Tracking | ✅ | 8 | Sistema en memoria con notas |
| Secrets Manager | ✅ | 6 | Encrypted storage con AES-256-GCM |
| **TOTAL** | ✅ | **49** | **100% funcionales** |

#### Archivos Creados

| Archivo | Herramientas | Líneas |
|---------|--------------|--------|
| `src/tools/debugging.ts` | 10 | ~350 |
| `src/tools/ai-media.ts` | 6 | ~200 |
| `src/tools/document-parser.ts` | 5 | ~180 |
| `src/tools/task-tracking.ts` | 8 | ~200 |
| `src/tools/secrets-manager.ts` | 6 | ~200 |

#### Comparativa Lovable vs Claude Libre

| Métrica | Lovable | Claude Libre | Ventaja |
|---------|---------|--------------|---------|
| Total herramientas | 41 | 49 | +8 |
| Ghost Tools | 3 | 0 | -3 (100% funcionales) |
| Debugging real | ❌ | ✅ | Crítico |
| Generación imágenes | ❌ | ✅ DALL-E 3 | Crítico |
| Path restrictions | Sí | No | Libertad total |
| DB access | Limitado | service_role | Admin completo |
| Costo/mes | $40-150 | $20-65 | 50-70% ahorro |

#### Próximos Pasos (Fase 2)

- [ ] Preview system con Vite propio
- [ ] File watcher con Chokidar
- [ ] Frontend React integrado

---

### 2026-01-01 - Verificación de Estado de Herramientas

**Método:** Pruebas empíricas directas de cada herramienta disponible  
**Analista:** Claude (dentro de Lovable)

#### Cambios en Herramientas

| Herramienta | Estado Anterior | Estado Nuevo | Evidencia |
|-------------|-----------------|--------------|-----------|
| `project_debug--sandbox-screenshot` | ❌ Ghost Tool | ✅ Funcional | Screenshot capturado exitosamente |
| `lov-read-console-logs` | ❌ Ghost Tool | ❌ Ghost Tool | Sin cambios - no responde |
| `lov-read-network-requests` | ❌ Ghost Tool | ❌ Ghost Tool | Sin cambios - no responde |
| `lov-read-session-replay` | ❌ Ghost Tool | ❌ Ghost Tool | Sin cambios - no responde |

**Resumen:** Ghost Tools reducidos de 4 a 3.

#### Limitaciones Detectadas

| Herramienta | Limitación |
|-------------|------------|
| `project_debug--sandbox-screenshot` | No funciona en páginas protegidas por auth (captura página de login) |
| `security--get_security_scan_results` | Scanner desactualizado (última ejecución hace días) |

#### Nuevas Features Detectadas

| Feature | Descripción | Tier |
|---------|-------------|------|
| Lovable ChatGPT App | Integración con ChatGPT para planificación externa | Todos |
| Mention @files | Referenciar archivos directamente en el chat | Todos |
| Project Credit Usage | Visualización de créditos por proyecto | Proyectos nuevos |
| Verified Domain Discovery | Dominios verificados visibles | Business/Enterprise |
| Public Preview Link Controls | Control de enlaces de preview | Enterprise |
| SAML SSO Simplificado | Configuración SSO simplificada | Business/Enterprise |

#### Confirmaciones

| Elemento | Estado |
|----------|--------|
| Modelo Core | Claude Opus 4.5 (confirmado oficialmente) |
| AI Gateway Default | `google/gemini-2.5-flash` |
| Herramientas Funcionales | 29 de 41 |
| Conectores Standard | 3 (ElevenLabs, Firecrawl, Perplexity) |
| MCPs Disponibles | 5 (Atlassian, Linear, Miro, n8n, Notion) |

#### Impacto en Claude Libre

- ✅ Reducir prioridad de screenshots con Puppeteer (ya funciona nativo)
- 🔴 Alta prioridad: Implementar console logs reales
- 🔴 Alta prioridad: Implementar network request capture
- 🔴 Alta prioridad: Implementar session replay
- 💡 Considerar: Integración tipo ChatGPT App para planificación externa

---

## Diciembre 2025

### 2025-12-24 - Análisis Completo Inicial

**Método:** Análisis exhaustivo del system prompt y herramientas  
**Analista:** Claude (dentro de Lovable)

#### Inventario de Herramientas

| Categoría | Cantidad | Estado |
|-----------|----------|--------|
| File Operations | 9 | ✅ Funcionales |
| Debugging | 5 | ❌ 4 Ghost Tools |
| Supabase | 7 | ✅ Funcionales |
| Security | 4 | ⚠️ Parcial |
| Secrets | 4 | ✅ Funcionales |
| Web Search | 2 | ✅ Funcionales |
| Task Management | 7 | ✅ Funcionales |
| Connectors | 2 | ✅ Funcionales |
| Others | 7 | ⚠️ Mixto |
| **Total** | **48** | **29 funcionales** |

#### Ghost Tools Identificados (4)

1. `lov-read-console-logs`
2. `lov-read-network-requests`
3. `lov-read-session-replay`
4. `project_debug--sandbox-screenshot`

#### Limitaciones Críticas Documentadas

- Sin visibilidad de costos (balance, rate limits)
- Stack fijo: Solo React + Vite + Tailwind
- Archivos read-only: package.json, tsconfig.json, migrations
- Context window subutilizado (~40K de 200K tokens)

---

### 2025-12-21 - Detección de Nuevos Conectores

**Método:** Revisión de changelog oficial y pruebas  
**Fuente:** https://lovable.dev/changelog

#### Conectores Añadidos

| Conector | ID | Tipo | Notas |
|----------|-----|------|-------|
| ElevenLabs | `elevenlabs` | Voice AI (TTS/STT) | Disponible |
| Firecrawl | `firecrawl` | Web scraping AI | Gratis hasta Ene 2026 |
| Perplexity | `perplexity` | Búsqueda AI | Disponible |

#### MCPs Añadidos

| MCP | Función |
|-----|---------|
| Miro | Boards/diagramas (NUEVO) |

---

### 2025-11-28 - Baseline Inicial

**Método:** Primera documentación sistemática

#### Estado Base

| Métrica | Valor |
|---------|-------|
| Herramientas totales | ~20 |
| MCPs disponibles | 4 |
| Standard connectors | 0 |
| Task tracking | No |
| Questions tool | No |

---

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Funcional / Confirmado |
| ❌ | No funcional / Ghost Tool |
| ⚠️ | Parcial / Con limitaciones |
| 🔴 | Alta prioridad |
| 💡 | Sugerencia |

---

## Cómo Agregar Entradas

```markdown
### YYYY-MM-DD - [Título Descriptivo]

**Método:** [Herramientas/proceso usado para verificación]
**Analista:** [Quién realizó el análisis]

#### [Sección de Cambios]

| Elemento | Antes | Después | Evidencia |
|----------|-------|---------|-----------|
| ... | ... | ... | ... |

#### Notas
[Observaciones adicionales]
```
