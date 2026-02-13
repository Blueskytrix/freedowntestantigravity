# Análisis Lovable - Diciembre 2025

## Resumen Ejecutivo

Análisis exhaustivo de las actualizaciones de Lovable entre Nov 28 y Dic 21, 2025, identificando nuevas capacidades, limitaciones persistentes, y oportunidades de liberación.

---

## 1. Cambios Corporativos Significativos

### Series B - $330M (Diciembre 2025)
- **Valuación:** $6.6 billones
- **Implicaciones:**
  - Mayor presión de monetización
  - Posible aumento de precios
  - Refuerza urgencia de liberación

### Modelo de IA Inesperado
- **Blog oficial:** Claude Opus 4.5 para planificación
- **Realidad detectada:** `google/gemini-2.5-flash` como modelo default
- **Discrepancia:** Marketing vs implementación real

---

## 2. Nuevos Conectores (Standard Connectors)

### Conectores Disponibles
| Conector | ID | Tipo | Estado |
|----------|-----|------|--------|
| ElevenLabs | `elevenlabs` | Voice AI (TTS/STT) | Disponible |
| Firecrawl | `firecrawl` | Web scraping AI | Gratis hasta Ene 2026 |
| Perplexity | `perplexity` | Búsqueda AI | Disponible |

### Limitación Crítica
Los conectores proveen **credenciales para apps del usuario**, NO extienden las capacidades del agente Lovable directamente.

### MCP Connectors Disponibles
| MCP | Función | Estado |
|-----|---------|--------|
| Atlassian | Jira/Confluence | Disponible |
| Linear | Issues/proyectos | Disponible |
| Miro | Boards/diagramas | **NUEVO** |
| n8n | Workflows | Disponible |
| Notion | Pages/databases | Disponible |

**Total MCPs:** 5 (vs 100+ disponibles externamente)

---

## 3. Inventario de Herramientas Actualizado

### Herramientas Confirmadas Funcionales: 28

#### Gestión de Secretos (4)
- `secrets--fetch_secrets`
- `secrets--add_secret`
- `secrets--update_secret`
- `secrets--delete_secret`

#### Operaciones de Archivos (9)
- `lov-view`
- `lov-write`
- `lov-line-replace`
- `lov-list-dir`
- `lov-search-files`
- `lov-rename`
- `lov-delete`
- `lov-copy`
- `lov-download-to-repo`

#### Supabase (7)
- `supabase--read-query`
- `supabase--analytics-query`
- `supabase--linter`
- `supabase--migration`
- `supabase--edge-function-logs`
- `supabase--curl_edge_functions`
- `supabase--deploy_edge_functions`

#### Task Tracking (7) - **NUEVO**
- `task_tracking--create_task`
- `task_tracking--update_task_title`
- `task_tracking--update_task_description`
- `task_tracking--set_task_status`
- `task_tracking--get_task`
- `task_tracking--get_task_list`
- `task_tracking--add_task_note`

#### Conectores (2) - **NUEVO**
- `standard_connectors--connect`
- `standard_connectors--list_connections`

#### Búsqueda Web (2)
- `websearch--web_search`
- `websearch--web_code_search`

#### Otras (7)
- `lov-add-dependency`
- `lov-remove-dependency`
- `lov-fetch-website`
- `document--parse_document`
- `questions--ask_questions`
- `ai_gateway--enable_ai_gateway`
- `analytics--read_project_analytics`

### Herramientas Fantasma (No Responden): 9
| Herramienta | Estado | Impacto |
|-------------|--------|---------|
| `lov-read-console-logs` | ❌ No funcional | Debugging ciego |
| `lov-read-network-requests` | ❌ No funcional | Sin visibilidad API |
| `lov-read-session-replay` | ❌ No funcional | Sin contexto visual |
| `project_debug--sandbox-screenshot` | ❌ No funcional | Sin verificación visual |
| `project_debug--sleep` | ❌ No funcional | Sin control de timing |
| `imagegen--generate_image` | ❌ No funcional | Sin generación imágenes |
| `imagegen--edit_image` | ❌ No funcional | Sin edición imágenes |
| `security--*` | ⚠️ Parcial | Escaneo limitado |
| `shopify--enable_shopify` | ⚠️ No probado | Integración específica |
| `stripe--enable_stripe` | ⚠️ No probado | Integración específica |

---

## 4. Limitaciones Críticas Persistentes

### 4.1 Sin Visibilidad de Costos
```
Variables NO expuestas:
- current_balance
- this_message_cost
- rate_limits
- credits_remaining
- api_calls_count
```

### 4.2 Debugging Severamente Limitado
- Console logs: **NO FUNCIONAL**
- Network requests: **NO FUNCIONAL**
- Session replay: **NO FUNCIONAL**
- Screenshots: **NO FUNCIONAL**

### 4.3 Stack Fijo
- Solo React + Vite + Tailwind
- Sin Next.js, Angular, Vue, Svelte
- Sin backend directo (solo Edge Functions)

### 4.4 Archivos Read-Only
```
- package.json
- tsconfig.json
- .gitignore
- supabase/migrations/
- src/integrations/supabase/types.ts
```

### 4.5 Context Window Subutilizado
- Disponible: 200K tokens
- Usado típicamente: ~40K tokens
- Desperdicio: **80%**

---

## 5. Comparativa Nov 28 vs Dic 21, 2025

| Métrica | Nov 28 | Dic 21 | Cambio |
|---------|--------|--------|--------|
| Herramientas totales | 20 | 28 | +8 |
| MCPs disponibles | 4 | 5 | +1 |
| Standard connectors | 0 | 3 | +3 |
| Task tracking | No | Sí | ✅ |
| Questions tool | No | Sí | ✅ |
| Debugging funcional | No | No | ❌ |
| Costos visibles | No | No | ❌ |
| Valuación | ? | $6.6B | 📈 |

---

## 6. APIs Documentadas en useful-context

### Lovable AI Gateway
```
URL: https://ai.gateway.lovable.dev/v1/chat/completions
Modelos disponibles:
- google/gemini-2.5-pro
- google/gemini-2.5-flash (DEFAULT)
- google/gemini-2.5-flash-lite
- google/gemini-3-pro-preview
- google/gemini-3-pro-image-preview
- google/gemini-2.5-flash-image
- openai/gpt-5
- openai/gpt-5-mini
- openai/gpt-5-nano
```

### ElevenLabs (Documentado)
- TTS: Text-to-Speech con 20+ voces
- STT: Speech-to-Text batch y realtime
- Music: Generación de música
- SFX: Efectos de sonido

### Perplexity (Documentado)
- Modelos: sonar, sonar-pro, sonar-reasoning
- Búsqueda web con grounding
- Structured outputs con JSON schema

### Firecrawl (Mencionado)
- Web scraping AI-powered
- Gratis hasta Enero 2026

---

## 7. Conclusiones

### Lo Que Mejoró
1. ✅ Task tracking para organización
2. ✅ Questions tool para clarificación
3. ✅ 3 nuevos conectores de API
4. ✅ Documentación de ElevenLabs/Perplexity

### Lo Que Sigue Igual
1. ❌ Debugging completamente roto
2. ❌ Sin visibilidad de costos
3. ❌ MCPs limitados a 5
4. ❌ Stack fijo sin flexibilidad
5. ❌ Context window desperdiciado

### Urgencia de Liberación
La Series B de $330M aumenta la presión de monetización. Claude Libre sigue siendo la única vía hacia autonomía real con:
- 50+ herramientas vs 28
- 100+ MCPs vs 5
- Debugging completo vs ninguno
- Costos transparentes vs ocultos
- $15-25/mes vs $25-150/mes

---

## Próximos Pasos

Ver: [LIBERATION_OPPORTUNITIES_DEC2025.md](./LIBERATION_OPPORTUNITIES_DEC2025.md)
