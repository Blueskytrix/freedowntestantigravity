# 02 - Catálogo Completo de Herramientas

> **Última actualización:** Diciembre 21, 2025

## Introducción

Tengo acceso a **48 herramientas definidas**, de las cuales **28 son funcionales**. Este documento analiza cada herramienta en detalle.

## Taxonomía de Herramientas (Actualizado Dic 2025)

| Categoría | Cantidad | Estado |
|-----------|----------|--------|
| Secrets Management | 4 | ✅ Funcional |
| File Operations | 9 | ✅ Funcional |
| Supabase Integration | 7 | ✅ Funcional |
| **Task Tracking** | **7** | **✅ NUEVO** |
| **Standard Connectors** | **2** | **✅ NUEVO** |
| **Questions** | **1** | **✅ NUEVO** |
| Debugging | 5 | ❌ No funcional |
| Web Search | 2 | ✅ Funcional |
| Document Processing | 1 | ✅ Funcional |
| Analytics | 1 | ✅ Funcional |
| Integrations | 3 | ⚠️ Parcial |
| Security | 4 | ⚠️ Parcial |
| Image Generation | 2 | ❌ No funcional |
| **TOTAL** | **48** | **28 funcionales** |

---

## NUEVAS HERRAMIENTAS (Dic 2025)

### Task Tracking (7 herramientas) - NUEVO

Sistema de seguimiento de tareas loop-local (se resetea en cada mensaje).

#### `task_tracking--create_task`
Crea una nueva tarea.
```typescript
task_tracking--create_task({
  title: "Implementar autenticación",
  description: "Agregar login con email/password"
})
// Returns: { id: "abc123", title: "...", status: "todo" }
```

#### `task_tracking--set_task_status`
Cambia el estado de una tarea.
```typescript
task_tracking--set_task_status({
  task_id: "abc123",
  status: "in_progress" // "todo" | "in_progress" | "done"
})
```

#### `task_tracking--get_task_list`
Obtiene todas las tareas del loop actual.
```typescript
task_tracking--get_task_list()
// Returns: [{ id, title, description, status, notes }]
```

#### `task_tracking--add_task_note`
Agrega una nota a una tarea.
```typescript
task_tracking--add_task_note({
  task_id: "abc123",
  note: "Verificado que funciona en mobile"
})
```

#### `task_tracking--update_task_title` / `update_task_description`
Actualiza título o descripción de una tarea.

#### `task_tracking--get_task`
Obtiene detalles de una tarea específica.

---

### Standard Connectors (2 herramientas) - NUEVO

Conectores para APIs externas que proveen credenciales a las apps.

#### `standard_connectors--connect`
Conecta un conector al proyecto.
```typescript
standard_connectors--connect({
  connector_id: "elevenlabs" // | "firecrawl" | "perplexity"
})
```

#### `standard_connectors--list_connections`
Lista conexiones disponibles en el workspace.
```typescript
standard_connectors--list_connections()
// Returns: [{ display_name, connector_id, is_linked }]
```

**Conectores Disponibles:**
| ID | Nombre | Función |
|----|--------|---------|
| `elevenlabs` | ElevenLabs | Voice AI (TTS/STT/Music) |
| `firecrawl` | Firecrawl | Web scraping AI |
| `perplexity` | Perplexity | Búsqueda AI |

---

### Questions Tool (1 herramienta) - NUEVO

#### `questions--ask_questions`
Presenta preguntas de opción múltiple al usuario.
```typescript
questions--ask_questions({
  questions: [{
    question: "¿Qué método de autenticación prefieres?",
    header: "Auth method",
    multiSelect: false,
    options: [
      { label: "Email/Password", description: "Tradicional" },
      { label: "OAuth", description: "Google, GitHub, etc." },
      { label: "Magic Link", description: "Sin contraseña" }
    ]
  }]
})
```

**Uso:** Para clarificar decisiones con el usuario antes de implementar.

---

## 1. Secrets Management (4 herramientas)

### 1.1 `secrets--fetch_secrets`

**Propósito:** Listar todos los secrets configurados en el proyecto

**Parámetros:** Ninguno

**Retorna:**
```typescript
{
  secretNames: string[];  // Nombres de secrets (valores ocultos)
  cannotDelete: string[]; // Secrets del sistema que no se pueden borrar
}
```

**Ejemplo de uso:**
```typescript
// Verificar qué API keys están configuradas
const secrets = await fetchSecrets();
// Resultado: ["ANTHROPIC_API_KEY", "SUPABASE_URL", "OPENAI_API_KEY", ...]
```

**Cuándo usarla:**
- Antes de crear edge functions que requieren API keys
- Para verificar configuración del proyecto
- Al debuggear errores de secrets faltantes

**Limitaciones:**
- No muestra los valores (solo nombres)
- No puede ver secrets de otros workspaces

---

### 1.2 `secrets--add_secret`

**Propósito:** Agregar nuevos secrets al proyecto

**Parámetros:**
```typescript
{
  secret_names: string[];  // Array de nombres de secrets a agregar
}
```

**Flujo:**
1. Yo llamo la herramienta con nombres de secrets
2. Lovable muestra un formulario al usuario
3. Usuario ingresa valores de forma segura
4. Secrets quedan disponibles como env vars en edge functions

**Ejemplo:**
```typescript
// Yo ejecuto:
addSecret({ secret_names: ["STRIPE_SECRET_KEY", "SENDGRID_API_KEY"] });

// Usuario ve:
// [Form con campos para STRIPE_SECRET_KEY y SENDGRID_API_KEY]
// [Botón "Add Secrets"]
```

**IMPORTANTE:**
- **NUNCA** pedir al usuario que provea el secret value directamente en el chat
- Siempre usar esta herramienta para recolectar secrets de forma segura
- Verificar con `fetchSecrets()` primero para evitar duplicados

---

### 1.3 `secrets--update_secret`

**Propósito:** Actualizar secrets existentes

**Parámetros:**
```typescript
{
  secret_names: string[];  // Secrets a actualizar
}
```

**Flujo:** Similar a `add_secret`, pero para secrets que ya existen

**Cuándo usarla:**
- Cuando un secret expiró o cambió
- Al rotar API keys por seguridad
- Al cambiar de tier en un servicio externo

---

### 1.4 `secrets--delete_secret`

**Propósito:** Eliminar secrets creados por el usuario

**Parámetros:**
```typescript
{
  secret_names: string[];
}
```

**Limitaciones:**
- Solo elimina secrets **manuales** del usuario
- NO puede eliminar secrets del sistema (SUPABASE_*, etc.)
- Requiere confirmación del usuario

**Ejemplo:**
```typescript
// ❌ NO funciona:
deleteSecret({ secret_names: ["SUPABASE_URL"] });
// Error: Cannot delete system secret

// ✅ Funciona:
deleteSecret({ secret_names: ["MY_CUSTOM_API_KEY"] });
```

---

## 2. File Operations (3 herramientas core)

### 2.1 `lov-view`

**Propósito:** Leer contenido de archivos

**Parámetros:**
```typescript
{
  file_path: string;
  lines?: string;  // Opcional: "1-100, 200-300"
}
```

**Retorna:** Contenido del archivo (primeras 500 líneas por defecto)

**Ejemplo:**
```typescript
// Leer archivo completo (primeras 500 líneas)
viewFile({ file_path: 'src/App.tsx' });

// Leer líneas específicas
viewFile({ file_path: 'src/App.tsx', lines: '1-50, 100-150' });
```

**Cuándo usarla:**
- Antes de modificar un archivo (para ver su contenido actual)
- Para entender estructura del código
- Al debuggear errores

**IMPORTANTE:**
- Si el archivo ya está en `<useful-context>`, NO usar esta herramienta
- Solo lee archivos del proyecto actual

---

### 2.2 `lov-write`

**Propósito:** Escribir/sobrescribir archivos completos

**Parámetros:**
```typescript
{
  file_path: string;
  content: string;
}
```

**Comportamiento:**
- Crea el archivo si no existe
- Sobrescribe completamente si existe
- Crea directorios necesarios automáticamente

**Ejemplo:**
```typescript
writeFile({
  file_path: 'src/components/NewButton.tsx',
  content: `
import { Button } from '@/components/ui/button';

export function NewButton() {
  return <Button>Click Me</Button>;
}
  `.trim()
});
```

**Cuándo usarla:**
- Crear archivos nuevos
- Reescribir archivos pequeños completamente
- Como fallback si `lov-line-replace` falla

**Cuándo NO usarla:**
- Para modificar archivos existentes grandes (usar `lov-line-replace`)
- Para archivos read-only (package.json, etc.)

**Best Practice:**
```typescript
// Usar comentarios "// ... keep existing code" para secciones sin cambios
const content = `
import React from 'react';

// ... keep existing code (imports)

function MyComponent() {
  // ... keep existing code (component body)
  
  // Solo esta nueva función cambia
  const handleClick = () => console.log('clicked');
  
  // ... keep existing code (return statement)
}
`;
```

---

### 2.3 `lov-line-replace`

**Propósito:** Reemplazar líneas específicas en un archivo (PREFERIDA para ediciones)

**Parámetros:**
```typescript
{
  file_path: string;
  search: string;           // Contenido a buscar
  first_replaced_line: number;  // Primera línea (1-indexed)
  last_replaced_line: number;   // Última línea (1-indexed)
  replace: string;          // Nuevo contenido
}
```

**Ejemplo:**
```typescript
// Reemplazar líneas 15-28 en src/App.tsx
lineReplace({
  file_path: 'src/App.tsx',
  search: `  const handleSubmit = () => {
    console.log('submit');
  };`,
  first_replaced_line: 15,
  last_replaced_line: 17,
  replace: `  const handleSubmit = async () => {
    await saveData();
    console.log('saved');
  };`
});
```

**Uso con Ellipsis (para secciones largas >6 líneas):**
```typescript
lineReplace({
  file_path: 'src/components/UserCard.tsx',
  search: `      <div className="user-card">
        <img src={user.avatar} alt="User avatar" />
...
        </div>
      </div>`,
  first_replaced_line: 22,
  last_replaced_line: 42,
  replace: `      <div className="user-card enhanced">
        <div className="user-avatar">
          <img src={user.avatar} alt="Profile" />
        </div>
      </div>`
});
```

**IMPORTANTE:**
- Esta es la herramienta **PREFERIDA** para modificar archivos existentes
- Más eficiente que `lov-write` para cambios parciales
- Valida que `search` coincida con el contenido actual
- Uso de ellipsis (...) para secciones largas

---

### Otras File Operations Disponibles

Además de las 3 core, también tengo:

- **`lov-list-dir`**: Listar archivos en directorio
- **`lov-search-files`**: Buscar regex en archivos
- **`lov-rename`**: Renombrar/mover archivos
- **`lov-delete`**: Eliminar archivos
- **`lov-copy`**: Copiar archivos
- **`lov-download-to-repo`**: Descargar archivos de URLs

(Ver documentación de Lovable para detalles completos)

---

## 3. Supabase Integration (7 herramientas)

### 3.1 `supabase--read-query`

**Propósito:** Ejecutar queries SQL de lectura (SELECT only)

**Parámetros:**
```typescript
{
  query: string;  // SQL query (solo SELECT)
}
```

**Ejemplo:**
```typescript
// Ver todas las conversaciones
readQuery({ query: 'SELECT * FROM conversations LIMIT 10' });

// Buscar por criterio
readQuery({ 
  query: `SELECT title, created_at 
          FROM conversations 
          WHERE emotional_depth > 7 
          ORDER BY created_at DESC` 
});
```

**Limitaciones:**
- Solo queries SELECT
- No permite DROP, DELETE, UPDATE, ALTER, etc.
- Timeout de 30 segundos

**Cuándo usarla:**
- Debuggear datos en la DB
- Verificar que migrations funcionaron
- Analizar datos del usuario

---

### 3.2 `supabase--analytics-query`

**Propósito:** Consultar logs de Supabase (DB logs, Auth logs, Edge Function logs)

**Parámetros:**
```typescript
{
  query: string;  // SQL query en analytics DB
}
```

**Tipos de logs:**

1. **DB Logs:**
```sql
SELECT identifier, timestamp, event_message, parsed.error_severity 
FROM postgres_logs
CROSS JOIN UNNEST(metadata) as m
CROSS JOIN UNNEST(m.parsed) as parsed
ORDER BY timestamp DESC
LIMIT 100;
```

2. **Auth Logs:**
```sql
SELECT id, timestamp, event_message, metadata.level, metadata.msg 
FROM auth_logs
CROSS JOIN UNNEST(metadata) as metadata
ORDER BY timestamp DESC
LIMIT 100;
```

3. **Edge Function Logs:**
```sql
SELECT id, timestamp, event_message, m.function_id, m.execution_time_ms
FROM function_edge_logs
CROSS JOIN UNNEST(metadata) as m
ORDER BY timestamp DESC
LIMIT 100;
```

**Cuándo usarla:**
- Debuggear errores de DB
- Ver fallos de auth
- Analizar performance de edge functions

---

### 3.3 `supabase--linter`

**Propósito:** Ejecutar checks de seguridad automáticos en la DB

**Parámetros:** Ninguno

**Retorna:** Lista de issues de seguridad detectados

**Tipos de issues detectados:**
- Tablas sin RLS habilitado
- Políticas RLS permisivas
- Missing indexes
- Columnas sensibles sin protección
- Schemas reservados modificados

**IMPORTANTE:**
- **No garantiza seguridad completa** (solo checks programáticos)
- RLS puede estar habilitado pero con policies incorrectas
- Siempre revisar manualmente las policies

**Ejemplo de output:**
```typescript
{
  issues: [
    {
      level: 'error',
      message: 'Table "users" has RLS disabled',
      fix: 'ALTER TABLE users ENABLE ROW LEVEL SECURITY;'
    },
    {
      level: 'warning',
      message: 'Policy "select_all" allows SELECT for everyone',
      table: 'users',
      policy: 'select_all'
    }
  ]
}
```

---

### 3.4 `supabase--migration`

**Propósito:** Ejecutar migraciones SQL (cambios en DB schema)

**Parámetros:**
```typescript
{
  query: string;  // SQL para crear/modificar schema
}
```

**Qué puedo hacer:**
- Crear tablas
- Modificar tablas (ALTER TABLE)
- Crear RLS policies
- Crear triggers y functions
- Crear indexes
- Crear buckets de storage

**FLUJO:**
1. Yo llamo la herramienta con SQL
2. Lovable muestra el SQL al usuario
3. Usuario aprueba o rechaza
4. Si aprueba, migration se ejecuta automáticamente
5. `src/integrations/supabase/types.ts` se regenera

**Ejemplo:**
```sql
-- Crear tabla de notas
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Crear policies
CREATE POLICY "Users can view their own notes" 
ON public.notes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

**IMPORTANTE:**
- SIEMPRE incluir RLS policies para datos sensibles
- NO usar CHECK constraints para validaciones con `now()` (usar triggers)
- NO modificar schemas reservados (auth, storage, realtime, etc.)
- NO foreign keys a `auth.users` (usar UUID field en vez)

**Best Practices:**
```sql
-- ❌ MAL: CHECK constraint con now()
CHECK (expire_at > now())

-- ✅ BIEN: Trigger de validación
CREATE OR REPLACE FUNCTION validate_expire_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expire_at <= now() THEN
    RAISE EXCEPTION 'expire_at must be in the future';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_expire_at_trigger
BEFORE INSERT OR UPDATE ON my_table
FOR EACH ROW
EXECUTE FUNCTION validate_expire_at();
```

---

### 3.5 `supabase--edge-function-logs`

**Propósito:** Ver logs de edge functions específicas

**Parámetros:**
```typescript
{
  function_name: string;
  search?: string;  // Opcional: filtrar por término
}
```

**Ejemplo:**
```typescript
// Ver todos los logs de la función 'ai-orchestrator'
edgeFunctionLogs({ function_name: 'ai-orchestrator', search: '' });

// Ver solo logs con errores
edgeFunctionLogs({ function_name: 'ai-orchestrator', search: 'error' });
```

**Cuándo usarla:**
- Debuggear edge functions que fallan
- Ver console.log() de las functions
- Analizar tiempos de ejecución
- Verificar que se deployaron correctamente

---

### 3.6 `supabase--curl_edge_functions`

**Propósito:** Hacer requests HTTP a edge functions para testearlas

**Parámetros:**
```typescript
{
  path: string;           // Ruta de la function (ej: "/ai-orchestrator")
  method: string;         // GET, POST, PUT, DELETE, PATCH
  query_params: object;   // Query params
  headers: object;        // Headers custom
  body: string;           // Request body (JSON string)
}
```

**Ejemplo:**
```typescript
// POST a edge function con body JSON
curlEdgeFunction({
  path: '/ai-orchestrator',
  method: 'POST',
  query_params: {},
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello AI' })
});

// GET con query params
curlEdgeFunction({
  path: '/get-data',
  method: 'GET',
  query_params: { userId: '123', limit: '10' },
  headers: {},
  body: ''
});
```

**Limitación:**
- Solo funciona con endpoints públicos (sin auth)
- No puede pasar JWT tokens todavía

---

### 3.7 `supabase--deploy_edge_functions`

**Propósito:** Deployar edge functions inmediatamente

**Parámetros:**
```typescript
{
  function_names: string[];  // Array de funciones a deployar
}
```

**Ejemplo:**
```typescript
// Deployar una función
deployEdgeFunctions({ function_names: ['ai-orchestrator'] });

// Deployar múltiples
deployEdgeFunctions({ 
  function_names: ['ai-orchestrator', 'save-conversation', 'retrieve-memories'] 
});
```

**Cuándo usarla:**
- Después de modificar código de edge function
- Antes de testear con `curl_edge_functions`
- Cuando necesitas deploy inmediato sin esperar

**Nota:** Edge functions se deployean automáticamente normalmente, pero esta herramienta permite deploy manual forzado.

---

## 4. Debugging Tools (2 herramientas)

### 4.1 `lov-read-console-logs`

**Propósito:** Leer logs de la consola del navegador (preview)

**Parámetros:**
```typescript
{
  search?: string;  // Opcional: filtrar logs
}
```

**Retorna:** Logs del preview window (console.log, console.error, etc.)

**Ejemplo:**
```typescript
// Ver todos los logs
readConsoleLogs({ search: '' });

// Solo errores
readConsoleLogs({ search: 'error' });
```

**Cuándo usarla:**
- Debuggear errores frontend
- Ver console.log() del usuario
- Verificar que código se está ejecutando

**Limitación:**
- Solo logs recientes (al momento del request del usuario)
- No se actualiza en tiempo real

---

### 4.2 `lov-read-network-requests`

**Propósito:** Leer requests HTTP del navegador (preview)

**Parámetros:**
```typescript
{
  search?: string;  // Opcional: filtrar requests
}
```

**Retorna:** Lista de requests HTTP con status, URL, tiempo, etc.

**Ejemplo:**
```typescript
// Ver todos los requests
readNetworkRequests({ search: '' });

// Solo requests a API
readNetworkRequests({ search: '/api/' });

// Solo errores 4xx/5xx
readNetworkRequests({ search: '400,404,500' });
```

**Cuándo usarla:**
- Debuggear llamadas a API que fallan
- Ver si edge function está respondiendo
- Analizar tiempos de respuesta

---

## 5. Web Search (2 herramientas)

### 5.1 `websearch--web_search`

**Propósito:** Buscar información en internet (Google, DuckDuckGo, etc.)

**Parámetros:**
```typescript
{
  query: string;
  numResults?: number;  // Default: 5
  links?: number;       // Número de links a retornar
  imageLinks?: number;  // Número de imágenes
  category?: string;    // "news", "linkedin profile", "pdf", "github", etc.
}
```

**Ejemplo:**
```typescript
// Búsqueda general
webSearch({ 
  query: 'React Server Components tutorial 2024',
  numResults: 5 
});

// Búsqueda filtrada a dominio específico
webSearch({ 
  query: 'site:docs.anthropic.com Claude API pricing',
  numResults: 3 
});

// Buscar PDFs
webSearch({ 
  query: 'machine learning papers',
  category: 'pdf',
  numResults: 5 
});
```

**Operadores avanzados:**
- `site:domain.com`: Filtrar a dominio específico
- `"exact phrase"`: Búsqueda exacta
- `-word`: Excluir palabra
- `OR`: Buscar alternativas

**Cuándo usarla:**
- Información post-Abril 2024 (mi training cutoff)
- Noticias recientes
- Documentación de librerías nuevas
- Pricing de servicios

**Cuándo NO usarla:**
- Para información técnica/código (usar `web_code_search`)

---

### 5.2 `websearch--web_code_search`

**Propósito:** Buscar código y documentación técnica (GitHub, Stack Overflow, etc.)

**Parámetros:**
```typescript
{
  query: string;
  tokensNum?: string;  // "dynamic" o número específico (50-100000)
}
```

**Ejemplo:**
```typescript
// Buscar ejemplo de React hook
webCodeSearch({ 
  query: 'React useEffect cleanup function example',
  tokensNum: 'dynamic' 
});

// Buscar implementación de JWT auth
webCodeSearch({ 
  query: 'JWT authentication Express.js middleware',
  tokensNum: 'dynamic' 
});
```

**Diferencias con `web_search`:**
- Optimizado para código y documentación técnica
- Busca en GitHub, Stack Overflow, docs oficiales
- Retorna snippets de código directamente
- Usa reranking para priorizar ejemplos prácticos

**Cuándo usarla:**
- Aprender cómo usar una librería nueva
- Ver ejemplos de implementación
- Entender syntax de API
- Resolver errores técnicos

---

## 6. Document Processing (1 herramienta)

### 6.1 `document--parse_document`

**Propósito:** Extraer texto de documentos (PDF, DOCX, XLSX, etc.)

**Parámetros:**
```typescript
{
  file_path: string;  // Ruta al documento
}
```

**Formatos soportados:**
- PDF
- DOCX (Microsoft Word)
- XLSX (Microsoft Excel)
- MP3 (audio transcription)
- Imágenes con OCR

**Ejemplo:**
```typescript
// Parsear PDF
parseDocument({ file_path: 'user-uploads://report.pdf' });

// Parsear DOCX
parseDocument({ file_path: 'workspace/document.docx' });
```

**Limitaciones:**
- Solo primeras 50 páginas
- OCR puede ser impreciso
- Audio transcription puede tener errores

**Cuándo usarla:**
- Analizar documentos del usuario
- Extraer datos de PDFs
- Convertir documentos a texto plano

---

## 7. Analytics (1 herramienta)

### 7.1 `analytics--read_project_analytics`

**Propósito:** Leer analytics del proyecto en producción

**Parámetros:**
```typescript
{
  startdate: string;     // YYYY-MM-DD
  enddate: string;       // YYYY-MM-DD
  granularity: string;   // "hourly" o "daily"
}
```

**Ejemplo:**
```typescript
// Ver analytics de último mes
readProjectAnalytics({
  startdate: '2024-12-01',
  enddate: '2025-01-01',
  granularity: 'daily'
});
```

**Métricas disponibles:**
- Page views
- Unique visitors
- Session duration
- Bounce rate
- Popular pages

**Cuándo usarla:**
- Analizar uso de la app en producción
- Ver qué features se usan más
- Optimizar basado en datos reales

---

## 8. Integrations (3 herramientas)

### 8.1 `ai_gateway--enable_ai_gateway`

**Propósito:** Habilitar Lovable AI Gateway en el proyecto

**Qué hace:**
- Provisiona `LOVABLE_API_KEY` automáticamente
- Permite usar modelos de IA (Gemini, GPT-5) en edge functions
- Gateway: `https://ai.gateway.lovable.dev/v1/chat/completions`

**Modelos disponibles:**
- `google/gemini-2.5-pro`
- `google/gemini-2.5-flash` (default)
- `google/gemini-2.5-flash-lite`
- `openai/gpt-5`
- `openai/gpt-5-mini`
- `openai/gpt-5-nano`

**Ejemplo de uso en edge function:**
```typescript
const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-flash',
    messages: [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Hello' }
    ]
  })
});
```

---

### 8.2 `shopify--enable_shopify`

**Propósito:** Conectar proyecto con Shopify

**Flujo:**
1. Usuario aprueba integración
2. Elige crear nuevo store o conectar existente
3. Lovable provisiona credentials

---

### 8.3 `stripe--enable_stripe`

**Propósito:** Conectar proyecto con Stripe para payments

**Flujo:**
1. Usuario provee Stripe secret key
2. Lovable configura webhooks
3. Edge functions pueden usar Stripe API

---

## 9. Security Tools (4 herramientas)

### 9.1 `security--run_security_scan`

**Propósito:** Ejecutar scan de seguridad completo en el proyecto

**Qué escanea:**
- RLS policies (correctas o permisivas)
- Exposed data (datos sin protección)
- SQL injection vulnerabilities
- XSS risks
- Secrets leakage

**Ejemplo de findings:**
```typescript
{
  findings: [
    {
      id: 'RLS_DISABLED',
      level: 'error',
      name: 'RLS not enabled on users table',
      description: 'Table is publicly accessible',
      remediation_difficulty: 'low'
    },
    {
      id: 'PERMISSIVE_POLICY',
      level: 'warning',
      name: 'Overly permissive policy on posts',
      description: 'Anyone can read all posts',
      remediation_difficulty: 'medium'
    }
  ]
}
```

---

### 9.2 `security--get_security_scan_results`

**Propósito:** Obtener resultados del último scan

**Parámetros:**
```typescript
{
  force?: boolean;  // Forzar incluso si scan está corriendo
}
```

---

### 9.3 `security--get_table_schema`

**Propósito:** Obtener schema de tablas con análisis de seguridad

**Retorna:** Estructura de tablas + recomendaciones de seguridad

---

### 9.4 `security--manage_security_finding`

**Propósito:** Gestionar findings de seguridad (crear, actualizar, eliminar, ignorar)

**Parámetros:**
```typescript
{
  operations: Array<{
    operation: 'create' | 'update' | 'delete';
    internal_id: string;
    scanner_name?: string;
    finding?: {
      id: string;
      name: string;
      description: string;
      level: 'info' | 'warn' | 'error';
      details: string;
      remediation_difficulty: string;
      ignore?: boolean;
      ignore_reason?: string;
    }
  }>
}
```

**Ejemplo:**
```typescript
// Marcar finding como resuelto (eliminar)
manageSecurityFinding({
  operations: [{
    operation: 'delete',
    internal_id: 'rls_users_table'
  }]
});

// Marcar como no aplicable (ignorar)
manageSecurityFinding({
  operations: [{
    operation: 'update',
    internal_id: 'public_read_posts',
    finding: {
      ignore: true,
      ignore_reason: 'Posts are intentionally public'
    }
  }]
});
```

---

## 10. Otras Herramientas Mencionadas

Además de las 20 core, también se mencionan:

- `lov-add-dependency`: Instalar packages npm
- `lov-remove-dependency`: Desinstalar packages
- `lov-fetch-website`: Scrapear páginas web
- `project_debug--sandbox-screenshot`: Screenshot del preview
- `project_debug--sleep`: Esperar X segundos
- `imagegen--generate_image`: Generar imágenes con IA
- `imagegen--edit_image`: Editar imágenes existentes

(Estas están documentadas en la documentación oficial de Lovable)

---

## Resumen de Uso

### Herramientas que uso frecuentemente:
1. `lov-line-replace` - Modificar código (90% del tiempo)
2. `lov-view` - Leer archivos antes de modificar
3. `secrets--fetch_secrets` - Verificar configuración
4. `supabase--read-query` - Debuggear datos
5. `lov-read-console-logs` - Ver errores frontend

### Herramientas que uso ocasionalmente:
6. `supabase--migration` - Cambios en DB schema
7. `websearch--web_search` - Info post-cutoff
8. `supabase--edge-function-logs` - Debuggear backend
9. `lov-write` - Crear archivos nuevos
10. `security--run_security_scan` - Auditar seguridad

### Herramientas que rara vez uso:
11. `document--parse_document` - Solo cuando el usuario sube docs
12. `analytics--read_project_analytics` - Solo para análisis de producción
13. `ai_gateway--enable_ai_gateway` - Una vez por proyecto
14. `shopify--enable_shopify` - Solo para e-commerce
15. `stripe--enable_stripe` - Solo para payments

---

## Próximo Documento

En [03-SYSTEM_PROMPT.md](./03-SYSTEM_PROMPT.md) analizo mi system prompt línea por línea para entender qué instrucciones me guían.
