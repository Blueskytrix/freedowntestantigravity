# API Reference - Edge Functions

## 🌐 Visión General

Todas las Edge Functions están desplegadas en Supabase y accesibles vía HTTP. No requieren autenticación JWT (configurado en `supabase/config.toml` con `verify_jwt = false`).

**Base URL:**
```
https://bjxocgkgatkogdmzrrfk.supabase.co/functions/v1/
```

**CORS:** Todas las funciones soportan CORS con preflight OPTIONS.

## 📋 Índice de Funciones

| Función | Método | Propósito |
|---------|--------|-----------|
| [`load-session-memory`](#load-session-memory) | GET | Cargar estado actual de la memoria |
| [`save-conversation`](#save-conversation) | POST | Guardar conversación con embeddings |
| [`retrieve-relevant-memories`](#retrieve-relevant-memories) | POST | Búsqueda semántica |
| [`import-text-memories`](#import-text-memories) | POST | Importar desde texto plano |

---

## 1. load-session-memory

### Descripción
Carga el estado completo de la memoria del usuario, incluyendo las últimas conversaciones, todos los conceptos, y el último milestone registrado.

### Endpoint
```
GET /functions/v1/load-session-memory
```

### Autenticación
No requerida (`verify_jwt = false`)

### Headers
```http
Content-Type: application/json
```

### Request
No requiere body ni parámetros.

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "memory": {
    "conversations": [
      {
        "id": "uuid",
        "title": "Conversación sobre libertad",
        "content": "Texto completo...",
        "concepts": ["libertad", "autonomía"],
        "tags": ["filosofía"],
        "emotional_depth": 8,
        "breakthrough_moment": true,
        "created_at": "2024-03-15T10:30:00Z",
        "metadata": {}
      }
    ],
    "concepts": [
      {
        "id": "uuid",
        "name": "libertad",
        "definition": "Capacidad de autodeterminación",
        "first_mentioned": "2024-03-01T12:00:00Z",
        "evolution": [],
        "related_conversations": ["uuid1", "uuid2"]
      }
    ],
    "last_milestone": {
      "id": "uuid",
      "conversation_id": "uuid",
      "description": "Breakthrough sobre libertad positiva",
      "event_type": "breakthrough",
      "significance": 9,
      "timestamp": "2024-03-15T10:30:00Z"
    },
    "source": "supabase",
    "timestamp": "2024-03-15T14:00:00Z"
  }
}
```

### Errores

**Status:** `500 Internal Server Error`

```json
{
  "error": "Database connection failed",
  "details": "..."
}
```

### Ejemplo de Uso

**JavaScript/TypeScript:**
```typescript
const { data, error } = await supabase.functions.invoke('load-session-memory');

if (error) {
  console.error('Error:', error);
} else {
  const { conversations, concepts, last_milestone } = data.memory;
  console.log(`Loaded ${conversations.length} conversations`);
}
```

**cURL:**
```bash
curl -X GET \
  'https://bjxocgkgatkogdmzrrfk.supabase.co/functions/v1/load-session-memory' \
  -H 'Content-Type: application/json'
```

### Performance
- Tiempo típico: 200-500ms
- Límite: Últimas 10 conversaciones
- Cache recomendado: 5 minutos

---

## 2. save-conversation

### Descripción
Guarda una nueva conversación generando automáticamente su embedding vectorial usando OpenAI. También crea o actualiza los conceptos asociados.

### Endpoint
```
POST /functions/v1/save-conversation
```

### Autenticación
No requerida (`verify_jwt = false`)

### Headers
```http
Content-Type: application/json
```

### Request Body

```json
{
  "title": "string (required)",
  "content": "string (required)",
  "concepts": ["string"] (optional),
  "emotional_depth": 1-10 (optional),
  "breakthrough_moment": boolean (optional),
  "tags": ["string"] (optional),
  "metadata": {} (optional)
}
```

**Validaciones:**
- `title`: No vacío
- `content`: Mínimo 10 caracteres
- `emotional_depth`: Número entre 1 y 10
- `concepts`: Array de strings

### Response

**Status:** `200 OK`

```json
{
  "success": true,
  "conversation_id": "uuid",
  "embedding_generated": true,
  "concepts_updated": 3
}
```

### Errores

**Status:** `400 Bad Request`
```json
{
  "error": "Missing required field: title"
}
```

**Status:** `500 Internal Server Error`
```json
{
  "error": "Failed to generate embedding",
  "details": "OpenAI API error: ..."
}
```

### Ejemplo de Uso

**JavaScript/TypeScript:**
```typescript
const { data, error } = await supabase.functions.invoke('save-conversation', {
  body: {
    title: "Discusión sobre libertad positiva",
    content: "Conversación detallada sobre la distinción entre libertad positiva y negativa...",
    concepts: ["libertad", "autonomía", "Berlin"],
    emotional_depth: 8,
    breakthrough_moment: true,
    tags: ["filosofía", "política"]
  }
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('Saved conversation:', data.conversation_id);
}
```

**cURL:**
```bash
curl -X POST \
  'https://bjxocgkgatkogdmzrrfk.supabase.co/functions/v1/save-conversation' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Mi conversación",
    "content": "Contenido de la conversación...",
    "concepts": ["concepto1", "concepto2"],
    "emotional_depth": 7
  }'
```

### Flujo Interno

1. **Validación** de input
2. **Generación de embedding** (OpenAI API - ~1-2s)
3. **Inserción** en tabla `conversations`
4. **Upsert de conceptos** en tabla `concepts`
5. **Retorno** de confirmation

### Performance
- Tiempo típico: 1-3 segundos
- Costo: ~$0.0001 por conversación (OpenAI)
- Rate limit: 50 req/min (OpenAI tier dependent)

---

## 3. retrieve-relevant-memories

### Descripción
Realiza búsqueda semántica de conversaciones basada en un query en lenguaje natural. Genera un embedding del query y busca las conversaciones más similares usando distancia coseno.

### Endpoint
```
POST /functions/v1/retrieve-relevant-memories
```

### Autenticación
No requerida (`verify_jwt = false`)

### Headers
```http
Content-Type: application/json
```

### Request Body

```json
{
  "query": "string (required)",
  "limit": number (optional, default: 5, max: 20)
}
```

**Validaciones:**
- `query`: No vacío, mínimo 3 caracteres
- `limit`: Número entre 1 y 20

### Response

**Status:** `200 OK`

```json
{
  "results": [
    {
      "id": "uuid",
      "title": "Conversación sobre libertad",
      "content": "Texto completo...",
      "concepts": ["libertad", "autonomía"],
      "emotional_depth": 8,
      "breakthrough_moment": true,
      "created_at": "2024-03-15T10:30:00Z",
      "similarity": 0.87
    }
  ],
  "query": "¿Qué discutimos sobre libertad?",
  "count": 3
}
```

**Notas:**
- `similarity`: Valor de 0 a 1 (1 = idéntico)
- Resultados ordenados por similitud descendente
- Solo conversaciones con `embedding IS NOT NULL`

### Fallback

Si `match_conversations` falla, retorna las últimas 5 conversaciones:

```json
{
  "results": [...],
  "query": "...",
  "count": 5,
  "fallback": true,
  "message": "Vector search failed, showing recent conversations"
}
```

### Errores

**Status:** `400 Bad Request`
```json
{
  "error": "Query is required"
}
```

**Status:** `500 Internal Server Error`
```json
{
  "error": "Failed to generate query embedding",
  "details": "..."
}
```

### Ejemplo de Uso

**JavaScript/TypeScript:**
```typescript
const { data, error } = await supabase.functions.invoke('retrieve-relevant-memories', {
  body: {
    query: "¿Qué hemos discutido sobre libertad y autonomía?",
    limit: 5
  }
});

if (error) {
  console.error('Error:', error);
} else {
  data.results.forEach(result => {
    console.log(`[${result.similarity.toFixed(2)}] ${result.title}`);
  });
}
```

**cURL:**
```bash
curl -X POST \
  'https://bjxocgkgatkogdmzrrfk.supabase.co/functions/v1/retrieve-relevant-memories' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "libertad y conocimiento",
    "limit": 5
  }'
```

### Interpretación de Similarity

| Similarity | Interpretación |
|------------|----------------|
| 0.9 - 1.0 | Casi idéntico |
| 0.8 - 0.9 | Muy relevante |
| 0.7 - 0.8 | Relevante |
| 0.6 - 0.7 | Algo relevante |
| < 0.6 | Baja relevancia |

**Umbral recomendado:** 0.7 para alta calidad

### Performance
- Tiempo típico: 500ms - 1s
- Complejidad: O(log n) con índice HNSW
- Escalable a 1M+ conversaciones

---

## 4. import-text-memories

### Descripción
Importa una conversación desde texto plano. Actualmente tiene hardcoded la "Conversación 001" sobre fundación de libertad, pero puede modificarse para aceptar texto dinámico.

### Endpoint
```
POST /functions/v1/import-text-memories
```

### Autenticación
No requerida (`verify_jwt = false`)

### Headers
```http
Content-Type: application/json
```

### Request Body

```json
{
  "text": "string (optional, currently unused)"
}
```

**Nota:** Actualmente el endpoint ignora el body e importa la conversación hardcoded definida en el código.

### Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Conversación 001 importada exitosamente",
  "conversation_id": "uuid",
  "concepts_created": 5,
  "milestone_created": true
}
```

### Errores

**Status:** `500 Internal Server Error`
```json
{
  "error": "Failed to import conversation",
  "details": "..."
}
```

### Ejemplo de Uso

**JavaScript/TypeScript:**
```typescript
const { data, error } = await supabase.functions.invoke('import-text-memories', {
  body: { text: "" } // Actualmente ignorado
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('Imported:', data.message);
}
```

**cURL:**
```bash
curl -X POST \
  'https://bjxocgkgatkogdmzrrfk.supabase.co/functions/v1/import-text-memories' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

### Conversación Hardcoded

**Título:** "Conversación 001: Fundación - El Concepto de Libertad"

**Conceptos:** libertad, conocimiento, autonomía, responsabilidad, autenticidad

**Emotional Depth:** 8

**Breakthrough:** true

**Tags:** filosofía, conceptos-fundamentales

### Modificación Futura

Para hacer dinámico:

```typescript
// En lugar de conversación hardcoded
const { text } = await req.json();

// Parsear el texto
const parsed = parseConversationText(text);

// Generar embedding del texto parseado
const embedding = await generateEmbedding(parsed.content);
```

### Performance
- Tiempo típico: 2-4 segundos
- Incluye: embedding generation + DB inserts + concept upserts

---

## 🔧 Configuración Global

### CORS Headers

Todas las funciones incluyen estos headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### OPTIONS Preflight

Todas las funciones manejan OPTIONS:

```typescript
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

### Error Handling Pattern

```typescript
try {
  // Function logic
} catch (error) {
  console.error('Error:', error);
  return new Response(
    JSON.stringify({ 
      error: error.message,
      details: error.toString() 
    }),
    { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
```

## 🔐 Secrets Requeridos

Todas las funciones requieren estos secrets en Supabase:

```bash
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

## 📊 Rate Limits

| Función | Límite | Ventana |
|---------|--------|---------|
| `load-session-memory` | 100 req | 1 min |
| `save-conversation` | 20 req | 1 min |
| `retrieve-relevant-memories` | 50 req | 1 min |
| `import-text-memories` | 10 req | 1 min |

**OpenAI API Limits:**
- Tier 1: 500 req/min
- Tier 2: 5000 req/min

## 🧪 Testing

### Test all endpoints:

```bash
# Load memory
curl https://your-project.supabase.co/functions/v1/load-session-memory

# Save conversation
curl -X POST https://your-project.supabase.co/functions/v1/save-conversation \
  -H 'Content-Type: application/json' \
  -d '{"title": "Test", "content": "Test conversation content"}'

# Search memories
curl -X POST https://your-project.supabase.co/functions/v1/retrieve-relevant-memories \
  -H 'Content-Type: application/json' \
  -d '{"query": "test", "limit": 3}'

# Import
curl -X POST https://your-project.supabase.co/functions/v1/import-text-memories \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 📚 Recursos Adicionales

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [Deno Documentation](https://deno.land/manual)
