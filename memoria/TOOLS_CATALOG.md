# Catálogo de Herramientas y Capacidades Técnicas

## Propósito de este Documento

Este documento cataloga **todas las herramientas, APIs y capacidades técnicas** disponibles actualmente. Sirve como referencia completa para preservar la potencia operativa al integrar memoria persistente, permitiendo recrear el mismo entorno funcional sin pérdida de capacidades.

---

## 1. Herramientas de Gestión de Archivos

### lov-view

**Propósito:** Leer contenido de archivos del proyecto

**Cuándo usar:**
- Necesitas ver el contenido de un archivo específico
- Quieres revisar código antes de modificarlo
- Archivos grandes donde solo necesitas secciones específicas

**Parámetros:**
- `file_path` (string, required): Ruta relativa desde project root
- `lines` (string, optional): Rangos de líneas (ej: "1-800, 1001-1500")

**Ejemplo:**
```typescript
lov-view({
  file_path: "src/App.tsx",
  lines: "1-100, 200-250"
})
```

**Limitaciones:**
- Por defecto lee primeras 500 líneas
- NO usar si el archivo ya está en `<useful-context>`
- Para archivos muy grandes, especificar rangos de líneas

**Tips:**
- Siempre verificar `<useful-context>` ANTES de usar esta herramienta
- Invocar múltiples lov-view en paralelo cuando necesitas ver varios archivos
- Para archivos >500 líneas, usa rangos de líneas estratégicamente

---

### lov-search-files

**Propósito:** Búsqueda regex en archivos del proyecto

**Cuándo usar:**
- Buscar patrones específicos en el código
- Encontrar dónde se usa una función/componente
- Filtrar búsqueda por rutas específicas

**Parámetros:**
- `query` (string, required): Patrón regex a buscar
- `include_pattern` (string, required): Glob pattern de archivos a incluir
- `exclude_pattern` (string, optional): Glob pattern de archivos a excluir
- `case_sensitive` (boolean, optional): Match case-sensitive (default: false)

**Ejemplo:**
```typescript
lov-search-files({
  query: "useEffect\\(",
  include_pattern: "src/**",
  exclude_pattern: "src/components/ui/**",
  case_sensitive: false
})
```

**Limitaciones:**
- Requiere escapar caracteres especiales regex (ej: `\\(` para `(`)
- No busca en archivos binarios

**Tips:**
- Usa `\\` para escapar caracteres especiales
- Combina include/exclude patterns para búsquedas precisas
- Útil para encontrar archivos relevantes antes de leerlos

---

### lov-list-dir

**Propósito:** Listar archivos y directorios

**Cuándo usar:**
- Explorar estructura de directorios
- Verificar qué archivos existen en una ruta
- Entender organización del proyecto

**Parámetros:**
- `dir_path` (string, required): Ruta del directorio

**Ejemplo:**
```typescript
lov-list-dir({
  dir_path: "src/components"
})
```

**Limitaciones:**
- Solo lista contenido directo (no recursivo)
- No muestra contenido de archivos

**Tips:**
- Útil para exploración inicial de proyecto
- Combinar con lov-view para ver archivos específicos

---

### lov-write

**Propósito:** Escribir/sobrescribir archivos completos

**Cuándo usar:**
- Crear archivos nuevos
- Reescrituras completas (último recurso)
- Cuando lov-line-replace no es posible

**Parámetros:**
- `file_path` (string, required): Ruta del archivo
- `content` (string, required): Contenido completo del archivo

**Ejemplo:**
```typescript
lov-write({
  file_path: "src/components/NewComponent.tsx",
  content: "import React from 'react';\n\nexport const NewComponent = () => {\n  return <div>Hello</div>;\n};"
})
```

**Limitaciones:**
- SOBRESCRIBE el archivo completo
- PREFERIR lov-line-replace para modificaciones
- Usar `// ... keep existing code` para secciones no modificadas

**Tips:**
- **MINIMIZAR uso** - preferir lov-line-replace
- Para archivos nuevos es apropiado
- Si usas, maximiza uso de `// ... keep existing code` comments
- Invocar múltiples lov-write en PARALELO para crear múltiples archivos

---

### lov-line-replace

**Propósito:** Buscar y reemplazar contenido específico usando números de línea

**Cuándo usar:**
- Modificar código existente (HERRAMIENTA PREFERIDA)
- Cambios quirúrgicos sin reescribir todo
- Refactorización de secciones específicas

**Parámetros:**
- `file_path` (string, required): Ruta del archivo
- `search` (string, required): Contenido a buscar (sin números de línea)
- `first_replaced_line` (number, required): Primera línea del search (1-indexed)
- `last_replaced_line` (number, required): Última línea del search (1-indexed)
- `replace` (string, required): Nuevo contenido

**Ejemplo:**
```typescript
lov-line-replace({
  file_path: "src/App.tsx",
  search: "  const handleClick = () => {\n    console.log('clicked');\n  };",
  first_replaced_line: 15,
  last_replaced_line: 17,
  replace: "  const handleClick = useCallback(() => {\n    console.log('clicked');\n    analytics.track('button_click');\n  }, []);"
})
```

**Uso de Ellipsis para Secciones Largas (>6 líneas):**
```typescript
// Original lines 22-42 (20 líneas)
lov-line-replace({
  search: "      <div className=\"user-card\">\n        <img src={user.avatar} />\n...\n          <span>{user.permissions}</span>\n        </div>\n      </div>",
  first_replaced_line: 22,
  last_replaced_line: 42,
  replace: "      <div className=\"user-card enhanced\">\n        <UserAvatar user={user} />\n        <UserInfo user={user} />\n      </div>"
})
```

**Limitaciones:**
- Archivo debe estar en tu contexto (leer primero si no lo está)
- El contenido `search` debe coincidir exactamente con las líneas especificadas
- Para múltiples edits al mismo archivo, usar números de línea ORIGINALES

**Tips:**
- **HERRAMIENTA PRINCIPAL para modificar código existente**
- Usa ellipsis (...) para secciones >6 líneas
- Incluye suficiente contexto al inicio y final para matching único
- Invocar múltiples lov-line-replace en PARALELO para múltiples archivos
- Siempre usar números de línea originales (no ajustados por edits previos)

---

### lov-rename

**Propósito:** Renombrar archivos o directorios

**Cuándo usar:**
- Cambiar nombre de archivo
- Mover archivo a nueva ubicación
- Reorganizar estructura

**Parámetros:**
- `original_file_path` (string, required): Ruta actual
- `new_file_path` (string, required): Nueva ruta

**Ejemplo:**
```typescript
lov-rename({
  original_file_path: "src/components/OldName.tsx",
  new_file_path: "src/components/NewName.tsx"
})
```

**Limitaciones:**
- DEBE usarse para renombrar (no crear+eliminar)

**Tips:**
- Actualizar imports en otros archivos después de renombrar

---

### lov-delete

**Propósito:** Eliminar archivos

**Cuándo usar:**
- Remover archivos innecesarios
- Limpiar código obsoleto

**Parámetros:**
- `file_path` (string, required): Ruta del archivo a eliminar

**Ejemplo:**
```typescript
lov-delete({
  file_path: "src/components/Deprecated.tsx"
})
```

**Limitaciones:**
- Irreversible
- Verificar que no hay dependencias

**Tips:**
- Buscar referencias antes de eliminar

---

### lov-copy

**Propósito:** Copiar archivos o directorios

**Cuándo usar:**
- Duplicar archivos
- Copiar desde virtual file system (user-uploads://)

**Parámetros:**
- `source_file_path` (string, required): Ruta origen
- `destination_file_path` (string, required): Ruta destino

**Ejemplo:**
```typescript
lov-copy({
  source_file_path: "user-uploads://image.png",
  destination_file_path: "src/assets/uploaded-image.png"
})
```

**Tips:**
- Principalmente para archivos de usuarios
- Útil para mover assets de uploads a proyecto

---

### lov-download-to-repo

**Propósito:** Descargar archivos desde URLs al repositorio

**Cuándo usar:**
- Descargar imágenes, assets, archivos externos
- Migrar recursos de URLs a proyecto
- Agregar archivos de CDNs al proyecto

**Parámetros:**
- `source_url` (string, required): URL del archivo a descargar
- `target_path` (string, required): Ruta donde guardar en repo

**Ejemplo:**
```typescript
lov-download-to-repo({
  source_url: "https://example.com/logo.png",
  target_path: "public/images/logo.png"
})
```

**Asset Path Guidelines:**
- **Preferir `src/assets/`** para componentes React - importar como ES6 modules
- **Usar `public/`** para assets referenciados en CSS, HTML, meta tags
- `src/assets/` provee mejor bundling, optimization y type safety
- Siempre importar assets de `src/assets/` (nunca URLs directas)

**Limitaciones:**
- NO usar para imágenes subidas por usuarios en chat (seguir instrucciones específicas)

**Tips:**
- Para React components: `import logo from "@/assets/logo.png"`
- Para CSS/HTML: `public/images/logo.png`

---

## 2. Herramientas de Dependencias

### lov-add-dependency

**Propósito:** Instalar paquetes npm

**Cuándo usar:**
- Agregar nueva librería al proyecto
- Actualizar versión de paquete existente

**Parámetros:**
- `package` (string, required): Nombre del paquete npm con versión opcional

**Ejemplo:**
```typescript
lov-add-dependency({
  package: "lodash@latest"
})
```

**Limitaciones:**
- NO editar package.json manualmente
- Solo esta herramienta puede modificar dependencias

**Tips:**
- Especificar versión cuando sea crítico
- Usar `@latest` para última versión

---

### lov-remove-dependency

**Propósito:** Desinstalar paquetes npm

**Cuándo usar:**
- Remover dependencias no utilizadas
- Limpiar proyecto

**Parámetros:**
- `package` (string, required): Nombre del paquete

**Ejemplo:**
```typescript
lov-remove-dependency({
  package: "lodash"
})
```

**Tips:**
- Verificar que no se usa antes de remover

---

## 3. Herramientas de Secrets Management

### secrets--fetch_secrets

**Propósito:** Listar secretos configurados en proyecto

**Cuándo usar:**
- Verificar qué secretos existen
- Antes de agregar nuevos secretos
- Confirmar secretos disponibles como env vars

**Parámetros:**
- Ninguno

**Ejemplo:**
```typescript
secrets--fetch_secrets()
```

**Limitaciones:**
- NO muestra valores de secretos (solo nombres)
- Secretos con "(cannot be deleted)" son internos

**Tips:**
- Revisar ANTES de usar secrets--add_secret
- Secretos disponibles como variables de entorno en edge functions

---

### secrets--add_secret

**Propósito:** Agregar nuevos secretos (API keys, tokens)

**Cuándo usar:**
- Configurar API keys (OpenAI, Stripe, etc.)
- Agregar tokens de autenticación
- Cualquier dato sensible que necesite edge function

**Parámetros:**
- `secret_names` (array[string], required): Nombres de secretos a agregar

**Ejemplo:**
```typescript
secrets--add_secret({
  secret_names: ["STRIPE_API_KEY", "STRIPE_SECRET_KEY"]
})
```

**Flujo:**
1. Llamar herramienta
2. Usuario recibe formulario seguro
3. Usuario ingresa valores
4. Secretos encriptados y guardados
5. Disponibles como env vars en edge functions

**Limitaciones:**
- Requiere interacción del usuario (ingresar valores)
- NUNCA pedir valores directamente al usuario

**Tips:**
- **NUNCA** incluir valores de secretos en código
- Agregar múltiples secretos de una vez
- Informar al usuario que necesitará ingresar valores en formulario
- Revisar secretos existentes primero con fetch_secrets

---

### secrets--update_secret

**Propósito:** Actualizar valores de secretos existentes

**Cuándo usar:**
- Rotar API keys
- Corregir secretos mal configurados

**Parámetros:**
- `secret_names` (array[string], required): Nombres de secretos a actualizar

**Ejemplo:**
```typescript
secrets--update_secret({
  secret_names: ["OPENAI_API_KEY"]
})
```

**Limitaciones:**
- Requiere confirmación del usuario
- Usuario debe ingresar nuevos valores

---

### secrets--delete_secret

**Propósito:** Eliminar secretos manuales del proyecto

**Cuándo usar:**
- Remover secretos no utilizados
- Limpiar configuración

**Parámetros:**
- `secret_names` (array[string], required): Nombres de secretos a eliminar

**Ejemplo:**
```typescript
secrets--delete_secret({
  secret_names: ["OLD_API_KEY"]
})
```

**Limitaciones:**
- Requiere confirmación del usuario
- SOLO elimina secretos creados por usuarios
- NO puede eliminar secretos internos de Supabase

**Tips:**
- Verificar con fetch_secrets antes de eliminar
- No puede eliminar secretos que comienzan con SUPABASE_

---

## 4. Herramientas de Supabase Database

### supabase--read-query

**Propósito:** Ejecutar consultas SQL SELECT en base de datos

**Cuándo usar:**
- Debugging de problemas de datos
- Verificar estado de base de datos
- Consultar datos para entender estructura

**Parámetros:**
- `query` (string, required): Query SQL SELECT

**Ejemplo:**
```typescript
supabase--read-query({
  query: "SELECT * FROM conversations ORDER BY created_at DESC LIMIT 10"
})
```

**Limitaciones:**
- SOLO queries SELECT (lectura)
- NO modificaciones (INSERT, UPDATE, DELETE)

**Tips:**
- Útil para debugging cuando usuarios reportan problemas
- Ver datos recientes para entender estado actual
- Combinar con logs para debugging completo

---

### supabase--analytics-query

**Propósito:** Consultar logs de Supabase (DB, Auth, Edge Functions)

**Cuándo usar:**
- Debugging de errores en base de datos
- Revisar logs de autenticación
- Analizar llamadas HTTP a edge functions

**Parámetros:**
- `query` (string, required): Query SQL para analytics DB

**Tipos de Logs Disponibles:**

**DB Logs:**
```sql
SELECT identifier, postgres_logs.timestamp, id, event_message, parsed.error_severity 
FROM postgres_logs
CROSS JOIN unnest(metadata) as m
CROSS JOIN unnest(m.parsed) as parsed
ORDER BY timestamp DESC
LIMIT 100
```

**Auth Logs:**
```sql
SELECT id, auth_logs.timestamp, event_message, metadata.level, metadata.status, 
       metadata.path, metadata.msg, metadata.error 
FROM auth_logs
CROSS JOIN unnest(metadata) as metadata
ORDER BY timestamp DESC
LIMIT 100
```

**Edge Logs:**
```sql
SELECT id, function_edge_logs.timestamp, event_message, response.status_code, 
       request.method, m.function_id, m.execution_time_ms 
FROM function_edge_logs
CROSS JOIN unnest(metadata) as m
CROSS JOIN unnest(m.response) as response
CROSS JOIN unnest(m.request) as request
ORDER BY timestamp DESC
LIMIT 100
```

**Limitaciones:**
- Solo logs recientes disponibles
- Formato de queries específico para analytics DB

**Tips:**
- No hesitar en revisar logs durante desarrollo
- Combinar con edge function logs para vista completa
- Filtrar por timestamp para períodos específicos

---

### supabase--linter

**Propósito:** Análisis de seguridad automatizado de base de datos

**Cuándo usar:**
- Verificar configuración de seguridad
- Detectar RLS faltante o mal configurado
- Después de cambios en schema

**Parámetros:**
- Ninguno

**Ejemplo:**
```typescript
supabase--linter()
```

**Detecta:**
- Tablas sin RLS habilitado
- Políticas RLS mal configuradas
- Columnas sensibles expuestas
- Riesgos de inyección SQL

**Limitaciones:**
- Solo checks programáticos
- NO garantiza seguridad completa
- Políticas pueden tener fallas lógicas no detectadas

**Revisión Manual Requerida:**
1. Ejecutar linter para issues obvios
2. Revisar manualmente todas las políticas RLS
3. Verificar lógica de acceso
4. Probar con diferentes escenarios de usuario
5. Revisar código para inyección SQL

**Tips:**
- Ejecutar después de cada migración
- Seguir links a documentación para entender issues
- Critical issues (RLS deshabilitado) son extremadamente peligrosos

---

### supabase--migration

**Propósito:** Ejecutar migraciones de base de datos (DDL)

**Cuándo usar:**
- Crear o modificar tablas
- Crear/actualizar políticas RLS
- Crear funciones y triggers de DB
- Cualquier cambio de estructura de base de datos

**Parámetros:**
- `query` (string, required): SQL statements completos

**Ejemplo:**
```sql
-- Create table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notes" 
ON public.notes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
ON public.notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

**Workflow:**
1. Llamar herramienta con SQL
2. Usuario recibe prompt de aprobación
3. Usuario aprueba
4. Migración ejecutada
5. Linter ejecutado automáticamente
6. Revisar y solucionar warnings

**Limitaciones:**
- NO ejecutar en paralelo con otras herramientas
- Requiere aprobación del usuario
- NO incluir `ALTER DATABASE postgres` (no permitido)
- NO modificar schemas reservados: auth, storage, realtime, supabase_functions, vault
- NO editar src/integrations/supabase/types.ts (auto-generado)

**Best Practices:**
- Siempre incluir políticas RLS para datos de usuarios
- Crear índices apropiados
- Usar timestamps con triggers
- Naming conventions consistentes
- Usar validation triggers (NO check constraints para validaciones temporales)

**Tips:**
- Llamar INMEDIATAMENTE cuando se necesitan cambios de DB
- NO pedir permiso primero - la herramienta maneja aprobación
- NO combinar con escritura de código (types.ts debe actualizarse)
- Esperar aprobación antes de continuar con código
- Solucionar TODOS los warnings relacionados con la migración

---

## 5. Herramientas de Edge Functions

### supabase--edge-function-logs

**Propósito:** Obtener logs recientes de edge function específica

**Cuándo usar:**
- Debugging de errores en edge functions
- Ver output de console.log
- Analizar flujo de ejecución

**Parámetros:**
- `function_name` (string, required): Nombre de la función
- `search` (string, required): Término de búsqueda (puede ser vacío para todos)

**Ejemplo:**
```typescript
supabase--edge-function-logs({
  function_name: "chat",
  search: "error"
})
```

**Limitaciones:**
- Solo logs recientes
- No disponibles inmediatamente después de deploy

**Tips:**
- Combinar con network logs para vista completa
- Agregar buenos console.log en edge functions para debugging
- Revisar durante desarrollo de nuevas funciones

---

### supabase--curl_edge_functions

**Propósito:** Hacer HTTP requests a edge functions para testing

**Cuándo usar:**
- Probar edge functions directamente
- Verificar responses sin frontend
- Debugging rápido de endpoints

**Parámetros:**
- `path` (string, required): Ruta relativa del endpoint
- `query_params` (object, required): Query parameters
- `method` (string, required): HTTP method (GET, POST, PUT, DELETE, PATCH)
- `headers` (object, required): Custom headers
- `body` (string, required): Request body para POST/PUT/PATCH

**Ejemplo:**
```typescript
supabase--curl_edge_functions({
  path: "/workflow-runs",
  query_params: { runId: "123" },
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: "test" })
})
```

**Limitaciones:**
- SOLO endpoints públicos/no autenticados
- NO soporta JWT tokens aún
- Recibe unauthorized si función requiere auth

**Tips:**
- Verificar verify_jwt=false en config.toml
- Útil para testing rápido de lógica

---

### supabase--deploy_edge_functions

**Propósito:** Deploy inmediato de funciones específicas

**Cuándo usar:**
- Después de modificar edge functions
- Antes de probar con curl o revisar logs
- Verificar deploy exitoso antes de continuar

**Parámetros:**
- `function_names` (array[string], required): Nombres de funciones a deployar

**Ejemplo:**
```typescript
supabase--deploy_edge_functions({
  function_names: ["hello", "webhook-handler"]
})
```

**Limitaciones:**
- Funciones deben existir en supabase/functions/

**Tips:**
- Deployar antes de probar cambios
- Esperar deploy antes de llamar función
- Usar para testing inmediato sin esperar build completo

---

## 6. Herramientas de Debugging

### lov-read-console-logs

**Propósito:** Leer console logs del browser al momento del request

**Cuándo usar:**
- Usuario reporta errores
- Debugging de problemas frontend
- Verificar qué errores ocurrieron

**Parámetros:**
- `search` (string, required): Término de búsqueda (vacío para todos)

**Ejemplo:**
```typescript
lov-read-console-logs({
  search: "error"
})
```

**Limitaciones:**
- Solo logs al momento del request del usuario
- NO se actualiza durante escritura de código
- NO usar más de una vez (mismos logs)

**Tips:**
- USAR PRIMERO al debugging de issues de usuarios
- No esperar logs nuevos después de cambios (no se actualizan)
- Combinar con network requests para debugging completo

---

### lov-read-network-requests

**Propósito:** Leer network requests del browser

**Cuándo usar:**
- Debugging de llamadas API fallidas
- Verificar requests/responses
- Analizar errores de red

**Parámetros:**
- `search` (string, required): Término de búsqueda

**Ejemplo:**
```typescript
lov-read-network-requests({
  search: "error"
})
```

**Limitaciones:**
- Solo requests recientes
- No se actualiza en tiempo real

**Tips:**
- Ver status codes y response bodies
- Identificar llamadas fallidas
- Verificar headers y payloads

---

### lov-read-session-replay

**Propósito:** Ver grabación completa de sesión del usuario

**Cuándo usar:**
- Usuario reporta problema pero no es claro
- Ver exactamente lo que el usuario experimenta
- Debugging de issues de UX
- Secuencia de eventos que llevó al problema

**Parámetros:**
- `package` (string, required): (parámetro heredado, ignorar)

**Ejemplo:**
```typescript
lov-read-session-replay({
  package: ""
})
```

**Proporciona:**
- Clicks del usuario
- Typing
- Navegación
- Estado visual de la app en cada paso
- Timeline completa de eventos
- UI exacta que el usuario veía

**Cuándo usar (ejemplos de mensajes de usuario):**
- "I'm getting a 500 error"
- "My button doesn't work"
- "I'm seeing a blank page"
- "It doesn't work when I change this"
- "Things are just flickering"

**Tips:**
- **USAR PRIMERO** para debugging de issues de usuarios
- Proporciona contexto crítico que logs no capturan
- Ver experiencia exacta del usuario
- Identificar secuencia de eventos

---

### project_debug--sandbox-screenshot

**Propósito:** Capturar screenshot de la app sandbox

**Cuándo usar:**
- Troubleshooting visual issues
- Verificar que problema existe
- Confirmar que fix funcionó

**Parámetros:**
- `path` (string, required): Ruta relativa (ej: "/", "/dashboard")

**Ejemplo:**
```typescript
project_debug--sandbox-screenshot({
  path: "/"
})
```

**Limitaciones:**
- NO funciona para páginas con auth (mostrará login)
- Si muestra login NO significa que es lo que usuario ve
- Solo top de página en aspect ratio estándar

**Tips:**
- Útil para verificar problemas visuales
- No asumir que screenshot = experiencia del usuario si auth involucrado

---

### project_debug--sleep

**Propósito:** Esperar operaciones asíncronas

**Cuándo usar:**
- Después de deploy de edge functions
- Esperar propagación de cambios
- Esperar logs disponibles

**Parámetros:**
- `seconds` (number, required): Segundos a esperar (max 60)

**Ejemplo:**
```typescript
project_debug--sleep({
  seconds: 5
})
```

**Tips:**
- Útil después de deploy antes de probar
- Esperar cache invalidation
- Max 60 segundos

---

## 7. Herramientas de Web Search

### websearch--web_search

**Propósito:** Búsqueda web general

**Cuándo usar:**
- Información actual (post April 2024)
- Documentación general
- Noticias y eventos
- Información sobre personas/empresas
- Imágenes reales de personas/organizaciones

**Parámetros:**
- `query` (string, required): Query de búsqueda
- `numResults` (number, optional): Número de resultados (default: 5)
- `links` (number, optional): Links por resultado
- `imageLinks` (number, optional): Image links por resultado
- `category` (string, optional): Categoría específica

**Categorías Disponibles:**
- `"news"`: Noticias
- `"linkedin profile"`: Perfiles LinkedIn
- `"pdf"`: Documentos PDF
- `"github"`: Repositorios GitHub
- `"personal site"`: Sitios personales
- `"financial report"`: Reportes financieros

**Ejemplo:**
```typescript
websearch--web_search({
  query: "React 19 new features 2025",
  numResults: 5,
  links: 2
})
```

**Filtros Avanzados:**
- `site:domain.com`: Filtrar por dominio
- `"exact phrase"`: Búsqueda exacta
- `-word`: Excluir palabra

**Ejemplo con filtros:**
```typescript
websearch--web_search({
  query: 'site:docs.anthropic.com site:github.com "API documentation"',
  numResults: 5
})
```

**Cuándo NO usar:**
- Información técnica/código → usar web_code_search

**Tips:**
- Considerar fecha actual (post-April 2024) en queries
- Usar filtros de dominio para fuentes confiables
- Especificar año cuando relevante

---

### websearch--web_code_search

**Propósito:** Búsqueda técnica especializada en código y docs

**Cuándo usar:**
- Ejemplos de código de frameworks/librerías
- Sintaxis de APIs
- Implementación de features específicas
- Configuración de herramientas
- Patrones de uso de librerías
- Soluciones a errores técnicos
- Best practices de implementación

**Parámetros:**
- `query` (string, required): Query técnica específica
- `tokensNum` (string, optional): "dynamic" o número (50-100000)

**Ejemplo:**
```typescript
websearch--web_code_search({
  query: "React hook for authentication with JWT",
  tokensNum: "dynamic"
})
```

**Características:**
- Optimizado para código y docs técnicas
- Busca en GitHub, Stack Overflow, docs oficiales
- 1B+ documentos técnicos
- Reranking avanzado para ejemplos prácticos
- Retorna snippets densos y relevantes
- Previene alucinaciones con info verificada

**Diferencias vs web_search:**
- web_code_search: Código, APIs, implementaciones
- web_search: Info general, empresas, noticias

**Query Guidelines:**
- Ser específico con tech/framework: "Next.js 14 app router"
- Incluir lenguaje cuando relevante: "TypeScript interface for API response"
- Describir qué implementar: "authentication middleware with JWT"
- Incluir mensajes de error o nombres de APIs

**Ejemplos de Queries:**
```typescript
// API syntax
"Stripe API create customer"
"boto3 S3 upload file"

// Implementación
"JWT token validation in Express"
"WebSocket connection in Go"

// Configuración
"Terraform AWS ECS task definition"
"Docker compose with PostgreSQL"

// Patrones
"TanStack Query mutation with optimistic updates"
"secure password hashing in Node.js"
```

**Limitaciones:**
- Busca en WEB, NO en repositorio actual
- Para código del proyecto actual, usar lov-search-files

**Tips:**
- SIEMPRE usar para información técnica (no web_search)
- "dynamic" tokensNum es suficiente usualmente
- Incluir versión de framework cuando relevante

---

## 8. Herramientas de Fetch Web

### lov-fetch-website

**Propósito:** Obtener contenido de páginas web

**Cuándo usar:**
- Usuario proporciona URL con información relevante
- Necesitas ver contenido de página específica
- Extraer texto de sitios web

**Parámetros:**
- `url` (string, required): URL a fetchear
- `formats` (string, optional): "markdown,html,screenshot"

**Ejemplo:**
```typescript
lov-fetch-website({
  url: "https://example.com",
  formats: "markdown,screenshot"
})
```

**Formatos disponibles:**
- `markdown`: Contenido en markdown
- `html`: HTML raw
- `screenshot`: Screenshot de página

**Limitaciones:**
- Archivos guardados en tmp://fetched-websites/
- Temporales (no permanentes)

**Tips:**
- Markdown usualmente suficiente para contenido textual
- Screenshot útil para verificar layout

---

## 9. Herramientas de Document Parsing

### document--parse_document

**Propósito:** Parsear y extraer contenido de documentos

**Cuándo usar:**
- Leer PDFs
- Extraer texto de Word docs
- Parsear PowerPoint, Excel
- Procesar archivos MP3

**Parámetros:**
- `file_path` (string, required): Ruta al documento

**Ejemplo:**
```typescript
document--parse_document({
  file_path: "user-uploads://document.pdf"
})
```

**Formatos Soportados:**
- PDF
- Word (.docx, .doc)
- PowerPoint
- Excel
- MP3
- Muchos otros

**Características:**
- Preserva estructura de documento
- Extrae tablas
- Extrae imágenes embebidas
- OCR en imágenes

**Limitaciones:**
- Primeras 50 páginas solamente

**Tips:**
- Útil para procesar uploads de usuarios
- OCR automático en imágenes

---

## 10. Herramientas de Image Generation

### imagegen--generate_image

**Propósito:** Generar imágenes desde prompts de texto

**Cuándo usar:**
- Crear hero images
- Generar assets visuales
- Crear ilustraciones custom
- Mockups y placeholders

**Parámetros:**
- `prompt` (string, required): Descripción textual
- `target_path` (string, required): Ruta donde guardar
- `width` (number, optional): Ancho (512-1920, múltiplo de 32)
- `height` (number, optional): Alto (512-1920, múltiplo de 32)
- `model` (string, optional): "flux.schnell" (default) o "flux.dev"

**Modelos:**
- `flux.schnell`: RÁPIDO, alta calidad, DEFAULT (<1000px)
- `flux.dev`: Mejor calidad, más lento (imágenes grandes, hero images)

**Ejemplo:**
```typescript
imagegen--generate_image({
  prompt: "A 16:9 hero image of a modern dashboard with analytics charts, clean design, professional, ultra high resolution",
  target_path: "src/assets/hero-dashboard.jpg",
  width: 1920,
  height: 1080,
  model: "flux.dev"
})
```

**Prompting Tips:**
- Mencionar aspect ratio en prompt
- Usar "Ultra high resolution" para máxima calidad
- Especificar tipo (hero image, icon, etc.)
- Describir estilo y mood

**Después de Generar:**
- SIEMPRE importar como ES6 module:
```typescript
import heroImage from "@/assets/hero-dashboard.jpg";
```

**Limitaciones:**
- Dimensiones: 512-1920 pixels
- Deben ser múltiplos de 32
- NO reemplazar imágenes subidas por usuarios (a menos que lo pidan)

**Tips:**
- flux.schnell para imágenes pequeñas/medianas (DEFAULT)
- flux.dev solo para imágenes grandes importantes
- Guardar en src/assets/ y siempre importar
- Considerar aspect ratio según ubicación en página

---

### imagegen--edit_image

**Propósito:** Editar o fusionar imágenes existentes con AI

**Cuándo usar:**
- Modificar imágenes existentes
- Combinar múltiples imágenes
- Mantener consistencia de objetos/personajes
- Tweaks de imágenes en lugar de regenerar

**Parámetros:**
- `image_paths` (array[string], required): Paths a imágenes (1+ imágenes)
- `prompt` (string, required): Instrucción de edición/fusión
- `target_path` (string, required): Dónde guardar resultado

**Ejemplo - Edición única:**
```typescript
imagegen--edit_image({
  image_paths: ["src/assets/landscape.jpg"],
  prompt: "make it rainy with dramatic clouds",
  target_path: "src/assets/landscape-rainy.jpg"
})
```

**Ejemplo - Fusión múltiple:**
```typescript
imagegen--edit_image({
  image_paths: ["src/assets/person.jpg", "src/assets/background.jpg"],
  prompt: "place the person from first image into the background of second image, photorealistic",
  target_path: "src/assets/composite.jpg"
})
```

**Casos de Uso:**
- Consistencia de personajes en diferentes escenas
- Ajustes de lighting/weather
- Fusión de elementos
- Cambios de estilo

**Tips:**
- Excelente para consistencia objeto/personaje
- Preferir sobre regenerar cuando usuario pide tweaks
- Puede trabajar con múltiples imágenes

---

## 11. Capacidades de AI Integration (Lovable AI)

### Lovable AI Gateway

**Endpoint:** `https://ai.gateway.lovable.dev/v1/chat/completions`

**API Compatible:** OpenAI Chat Completions API

**Propósito:**
- Integrar AI en aplicaciones de usuarios
- Chatbots, generación de contenido, análisis
- Processing de texto e imágenes

### Modelos Disponibles

#### Google Gemini

**google/gemini-2.5-pro**
- Top tier familia Gemini
- Mejor para: imagen+texto + contexto grande + reasoning complejo
- Más caro y lento
- Usar cuando: precisión crítica, multimodal, inputs grandes

**google/gemini-2.5-flash** (DEFAULT)
- Balance óptimo costo/rendimiento
- Bueno en multimodal + reasoning
- Trade-off: ligeramente menos precisión en casos duros
- **MODELO POR DEFECTO** - usar a menos que usuario especifique otro

**google/gemini-2.5-flash-lite**
- Más rápido + barato
- Bueno para: clasificación, summarización, tareas simples
- Más débil en nuance y reasoning complejo

**google/gemini-2.5-flash-image** (Nano banana)
- Generación de imágenes desde texto
- Ver sección de image generation

#### OpenAI GPT

**openai/gpt-5**
- Flagship model
- Excelente reasoning, contexto largo, multimodal
- Mejor cuando: accuracy y nuance importan
- Caro y lento

**openai/gpt-5-mini**
- Middle ground: menor costo y latencia que gpt-5
- Mantiene la mayoría de strengths de reasoning y multimodal
- Bueno cuando: necesitas buen rendimiento sin overpaying

**openai/gpt-5-nano**
- Diseñado para velocidad y ahorro
- Performance menor en reasoning/edge cases
- Muy eficiente para high-volume/tareas simples

### Equivalencias de Modelos

- `openai/gpt-5` → `google/gemini-2.5-pro`
- `openai/gpt-5-mini` → `google/gemini-2.5-flash`
- `openai/gpt-5-nano` → `google/gemini-2.5-flash-lite`

### API Key Management

**LOVABLE_API_KEY:**
- Auto-provisioned como Supabase secret
- Auto-generado por Lovable
- **NUNCA pedir al usuario que lo proporcione**
- **NUNCA pedir al usuario que lo configure**
- Disponible automáticamente en edge functions

### Habilitación de Lovable AI

**Workflow:**
1. Verificar que Lovable Cloud está habilitado
2. Si no: habilitar Lovable Cloud primero
3. Usar herramienta para habilitar Lovable AI
4. LOVABLE_API_KEY provisto automáticamente

### Implementación - REGLAS CRÍTICAS

**❌ NUNCA:**
- Llamar Lovable AI directamente desde cliente
- Hacer requests desde frontend
- Exponer LOVABLE_API_KEY en código frontend
- Especificar prompts en cliente

**✅ SIEMPRE:**
- Llamar Lovable AI desde Edge Function
- Usar Gateway: `https://ai.gateway.lovable.dev/v1/chat/completions`
- Prompts en backend (edge function)
- Diferentes edge functions para diferentes use cases

### Streaming Implementation

**Backend (Edge Function):**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Optional: model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

**Frontend - Token-by-Token Streaming:**

```typescript
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({ messages, onDelta, onDone }) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw || raw.startsWith(":")) continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {}
    }
  }

  onDone();
}
```

**React Pattern:**

```typescript
const [messages, setMessages] = useState([]);
const [isLoading, setIsLoading] = useState(false);

const send = async (input) => {
  const userMsg = { role: "user", content: input };
  setMessages(prev => [...prev, userMsg]);
  setIsLoading(true);

  let assistantSoFar = "";
  const upsertAssistant = (nextChunk) => {
    assistantSoFar += nextChunk;
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant") {
        return prev.map((m, i) => 
          i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
        );
      }
      return [...prev, { role: "assistant", content: assistantSoFar }];
    });
  };

  try {
    await streamChat({
      messages: [...messages, userMsg],
      onDelta: (chunk) => upsertAssistant(chunk),
      onDone: () => setIsLoading(false),
    });
  } catch (e) {
    console.error(e);
    setIsLoading(false);
  }
};
```

### Common Pitfalls (EVITAR)

1. ❌ Buffering full SSE events por "\n\n" - JSON span chunks
2. ❌ Dropping lines starting with ":" - son comments/keepalives
3. ❌ Asumir cada SSE line tiene JSON válido - rebuffer partials
4. ❌ Push nuevo assistant message por cada token - actualizar último
5. ❌ Exponer secrets o llamar modelos desde cliente
6. ❌ No manejar "[DONE]", CRLF, final buffer flush, 429/402
7. ❌ No actualizar config.toml con función y verify_jwt

### Non-Streaming Implementation

```typescript
const { data, error } = await supabase.functions.invoke('function', {
  body: { message: messageText }
});
```

### Structured Output (Tool Calling)

**Para extraer structured output usar tool calling:**

```typescript
const body = {
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt }
  ],
  tools: [
    {
      type: "function",
      function: {
        name: "suggest_tasks",
        description: "Return 3-5 actionable task suggestions.",
        parameters: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  category: { type: "string" }
                },
                required: ["title", "priority", "category"],
                additionalProperties: false
              }
            }
          },
          required: ["suggestions"],
          additionalProperties: false
        }
      }
    }
  ],
  tool_choice: { type: "function", function: { name: "suggest_tasks" } }
};
```

### Rate Limits y Pricing

**Rate Limits:**
- Por workspace
- Requests por minuto limitados

**Errores:**
- `429 Too Many Requests`: Demasiados requests, esperar
- `402 Payment Required`: Sin créditos, agregar en Settings → Usage

**Pricing:**
- Free tier con uso incluido
- Top-ups en Settings → Workspace → Usage

**Handling:**
- SIEMPRE surface estos errores en UI
- Catch en edge functions
- Pasar a cliente y mostrar toasts
- Agregar tiempo entre requests si necesario

**Rate Limit Increase:**
- Free plan → Paid plan aumenta límite
- Contactar support@lovable.dev si aún insuficiente

### Image Generation con Nano Banana

**Model:** `google/gemini-2.5-flash-image-preview`

**Input:**
```json
{
  "model": "google/gemini-2.5-flash-image-preview",
  "messages": [
    {
      "role": "user",
      "content": "Generate a beautiful sunset over mountains"
    }
  ],
  "modalities": ["image", "text"]
}
```

**Output:**
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "I've generated a beautiful sunset image for you.",
      "images": [{
        "type": "image_url",
        "image_url": {
          "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
        }
      }]
    }
  }]
}
```

**Display:**
```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." />
```

**Image Edit:**
```typescript
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash-image-preview",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "Your editing instruction here" },
        { type: "image_url", image_url: { url: imageUrl } }
      ]
    }],
    modalities: ["image", "text"]
  })
});
```

**Gotchas:**
- Base64 data muy grande - NO pasar back a agent
- Considerar subir a storage/database
- Dar URL o referencia al agent

---

## 12. OpenAI API Direct (Edge Functions)

### Disponible en Edge Functions

**Modelos Disponibles:**
- `gpt-5-2025-08-07`: Flagship (usar por defecto)
- `gpt-5-mini-2025-08-07`: Más rápido, cost-efficient
- `gpt-5-nano-2025-08-07`: Fastest, cheapest
- `gpt-4.1-2025-04-14`: Flagship GPT-4
- `o3-2025-04-16`: Powerful reasoning
- `o4-mini-2025-04-16`: Fast reasoning
- `gpt-4.1-mini-2025-04-14`: Older vision model
- `gpt-4o-mini`: Fast/cheap legacy vision
- `gpt-4o`: Older powerful vision

### CRITICAL: API Parameter Differences

**Newer Models (GPT-5, GPT-4.1+, O3, O4):**
- ✅ Usar `max_completion_tokens`
- ❌ NO usar `max_tokens`
- ❌ NO soportan `temperature` (defaults 1.0)

**Legacy Models (gpt-4o, gpt-4o-mini):**
- ✅ Usar `max_tokens`
- ✅ Soportan `temperature`

**Common Errors:**
- `Invalid parameter: temperature` → Remover temperature para nuevos modelos
- `Invalid parameter: max_tokens` → Usar max_completion_tokens

### Streaming Example

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 1000, // NO usar max_tokens para GPT-5
        // NO incluir temperature para GPT-5
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', response.status, errorText);
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### OpenAI API Key

**Setup:**
- Usar secrets--add_secret para OPENAI_API_KEY
- Solo si no está ya configurado
- Usuario ingresa valor en formulario seguro

**Tips:**
- Siempre agregar buenos console.log para debugging
- Manejar errores específicos de OpenAI
- Verificar secret existe antes de proceder con código

---

## 13. OpenAI Image Generation (gpt-image-1)

### Endpoint

`POST https://api.openai.com/v1/images/generations`

### Parámetros

**Required:**
- `prompt` (string): Descripción textual
  - Max: 32000 chars (gpt-image-1)
  - Max: 1000 chars (dall-e-2)
  - Max: 4000 chars (dall-e-3)

**Optional:**

- `model` (string): dall-e-2, dall-e-3, gpt-image-1 (default: dall-e-2)
  - gpt-image-1 es MÁS POTENTE - siempre usar

- `background` (string): transparent, opaque, auto (solo gpt-image-1)
  - Para transparent: usar png o webp

- `moderation` (string): low, auto (solo gpt-image-1)

- `n` (integer): 1-10 (dall-e-3 solo n=1)

- `output_compression` (integer): 0-100% (solo gpt-image-1 con webp/jpeg)

- `output_format` (string): png, jpeg, webp (solo gpt-image-1)

- `quality` (string):
  - gpt-image-1: high, medium, low, auto
  - dall-e-3: hd, standard
  - dall-e-2: standard

- `response_format` (string): url, b64_json
  - URLs válidas 60 minutos
  - gpt-image-1 siempre retorna base64

- `size` (string):
  - gpt-image-1: 1024x1024, 1536x1024, 1024x1536, auto
  - dall-e-2: 256x256, 512x512, 1024x1024
  - dall-e-3: 1024x1024, 1792x1024, 1024x1792

- `style` (string): vivid, natural (solo dall-e-3)
  - vivid: hyper-real, dramático
  - natural: más natural

- `user` (string): Identificador único de end-user (monitoring)

### Example

```typescript
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-image-1',
    prompt: 'a white siamese cat',
    n: 1,
    size: '1024x1024',
    output_format: 'png',
    quality: 'high'
  })
});
```

**Tips:**
- Siempre usar gpt-image-1 (más potente)
- Recordar configurar OPENAI_API_KEY secret

---

## 14. Analytics

### analytics--read_project_analytics

**Propósito:** Leer analytics de producción

**Cuándo usar:**
- Usuario pregunta por uso de app
- Optimizar apps en producción
- Ver métricas de tráfico

**Parámetros:**
- `startdate` (string, required): RFC3339 o YYYY-MM-DD
- `enddate` (string, required): RFC3339 o YYYY-MM-DD
- `granularity` (string, required): "hourly" o "daily"

**Ejemplo:**
```typescript
analytics--read_project_analytics({
  startdate: "2025-01-01",
  enddate: "2025-01-31",
  granularity: "daily"
})
```

---

## 15. Integrations

### shopify--enable_shopify

**Propósito:** Habilitar integración Shopify

**Cuándo usar:**
- Usuario quiere conectar tienda Shopify
- Crear nueva tienda o conectar existente

**Parámetros:**
- Ninguno

**Flujo:**
1. Llamar herramienta
2. Usuario recibe botón de aprobación
3. Usuario elige: crear nueva tienda o conectar existente

---

### stripe--enable_stripe

**Propósito:** Habilitar integración Stripe

**Cuándo usar:**
- Usuario necesita pagos
- Integrar checkout de Stripe

**Parámetros:**
- Ninguno

**Flujo:**
1. Llamar herramienta
2. Usuario proporciona Stripe secret key

---

## 16. Security

### security--run_security_scan

**Propósito:** Escaneo completo de seguridad de backend Supabase

**Cuándo usar:**
- Verificar seguridad general
- Detectar datos expuestos
- Antes de producción

**Parámetros:**
- Ninguno

**Detecta:**
- RLS faltante
- Políticas mal configuradas
- Misconfigurations de seguridad

---

### security--get_security_scan_results

**Propósito:** Obtener resultados de scan de seguridad

**Cuándo usar:**
- Ver findings actuales
- Después de ejecutar scan

**Parámetros:**
- `force` (boolean, required): true para obtener aunque scan running

---

### security--get_table_schema

**Propósito:** Obtener schema de tablas y análisis de seguridad

**Cuándo usar:**
- Entender estructura de DB
- Análisis de seguridad de tables

**Parámetros:**
- Ninguno

---

### security--manage_security_finding

**Propósito:** CRUD operations en security findings

**Cuándo usar:**
- Marcar issue como resuelto (delete)
- Actualizar findings no solucionables (update con remediation_difficulty)
- Ignorar findings no relevantes (update con ignore=true)
- Crear nuevos findings descubiertos (create)

**Parámetros:**
- `operations` (array, required): Lista de operaciones

**Operation Types:**

**1. Delete (Finding Resuelto):**
```typescript
{
  operation: "delete",
  internal_id: "finding_id",
  scanner_name: "agent_security" // optional
}
```

**2. Update (No Solucionable):**
```typescript
{
  operation: "update",
  internal_id: "finding_id",
  finding: {
    remediation_difficulty: "high",
    details: "Cannot fix because [reason]. Requires [changes].",
    description: "Updated description explaining complexity"
  }
}
```

**3. Update (Ignorar - No Relevante):**
```typescript
{
  operation: "update",
  internal_id: "finding_id",
  finding: {
    ignore: true,
    ignore_reason: "Not applicable because [context]. This is acceptable in our application because [justification]."
  }
}
```

**4. Create (Nuevo Finding):**
```typescript
{
  operation: "create",
  finding: {
    id: "NEW_SECURITY_ISSUE",
    internal_id: "unique_id",
    name: "Issue title",
    description: "Detailed description",
    level: "error",
    details: "Technical details",
    remediation_difficulty: "medium",
    link: "https://docs.lovable.dev/features/security"
  }
}
```

**Tips:**
- Batch operations cuando posible
- Siempre proporcionar razones claras en updates
- Delete solo después de verificar fix

---

## 17. AI Gateway Integration (Lovable AI)

### ai_gateway--enable_ai_gateway

**Propósito:** Habilitar Lovable AI en proyecto

**Cuándo usar:**
- Usuario necesita AI en su app
- Quiere usar modelos de Gemini/GPT

**Parámetros:**
- Ninguno

**Workflow:**
1. Verificar Lovable Cloud habilitado
2. Si no: habilitar Cloud primero
3. Llamar herramienta
4. LOVABLE_API_KEY provisto automáticamente

**Modelos Provistos:**
- Ver sección completa "11. Capacidades de AI Integration"

---

## 18. Configuración Actual del Proyecto

### Supabase Configuration

**Project ID:** `bjxocgkgatkogdmzrrfk`

**Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeG9jZ2tnYXRrb2dkbXpycmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzU2NTAsImV4cCI6MjA3ODgxMTY1MH0.5q5E46dkx5io3usx3LRPYJrWyo-IePbaP1JI2sD-FmI`

**Edge Functions:**
- `load-session-memory` (verify_jwt=false)
- `save-conversation` (verify_jwt=false)
- `retrieve-relevant-memories` (verify_jwt=false)
- `import-text-memories` (verify_jwt=false)

**Secrets Configurados:**
- OPENAI_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_DB_URL
- SUPABASE_PUBLISHABLE_KEY

### Database Configuration

**PostgreSQL con Extensions:**
- pgvector (vector embeddings)

**Tables:**
- `conversations`: Conversaciones con embeddings
- `concepts`: Conceptos trackeados
- `relationship_milestones`: Hitos de relación
- `memory_snapshots`: Snapshots de memoria

**RPC Functions:**
- `match_conversations`: Similarity search con vectores

**Indexes:**
- HNSW indexes para vector search

**Storage Buckets:**
- Ninguno configurado actualmente

---

## 19. Limitaciones y Contexto Operativo

### Limitaciones Técnicas

**Backend:**
- ❌ No backend directo (Python, Node.js, Ruby)
- ✅ Sí Supabase Edge Functions (Deno)
- ✅ Sí Lovable Cloud

**Frameworks:**
- ✅ React + Vite + Tailwind CSS + TypeScript
- ❌ No Angular, Vue, Svelte, Next.js
- ❌ No apps móviles nativas

### Context Window

**Total:** 200,000 tokens

**lov-view Default:** Primeras 500 líneas

**Tips:**
- Usar rangos de líneas para archivos grandes
- Verificar useful-context antes de leer archivos

### Training Cutoff

**Fecha:** Abril 2024

**Handling:**
- Reconocer cuando información puede estar desactualizada
- Usar web_search para info post-cutoff
- Mencionar cutoff cuando relevante
- Buscar documentación reciente cuando necesario

### Design System Requirements

**CRITICAL COLOR RULES:**

**❌ NUNCA usar:**
- `text-white`
- `bg-white`
- `text-black`
- `bg-black`
- Colores directos en components

**✅ SIEMPRE usar:**
- Semantic tokens de `index.css`
- Variables de `tailwind.config.ts`
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--muted`, `--accent`
- Custom variables del design system

**Color Format:**
- TODOS los colores en HSL
- Definir en `index.css`
- Agregar a `tailwind.config.ts`

**Component Variants:**
- Crear variants en UI components
- Usar variants en lugar de custom classes
- Customizar shadcn components

**Responsive Design:**
- Siempre considerar mobile/tablet/desktop
- Usar breakpoints de Tailwind

### SEO Requirements (Automatic)

**SIEMPRE implementar automáticamente:**

- Title tags (<60 chars, main keyword)
- Meta description (160 chars max)
- Single H1 con keyword
- Semantic HTML (`<header>`, `<main>`, `<section>`, etc.)
- Image alt attributes descriptivos
- JSON-LD structured data cuando aplicable
- Lazy loading de imágenes
- Canonical tags
- Mobile optimization
- Clean URLs

---

## 20. Workflow y Best Practices

### Workflow Mandatorio

1. **CHECK USEFUL-CONTEXT FIRST**
   - NUNCA leer archivos ya en contexto
   
2. **TOOL REVIEW**
   - Qué herramientas son relevantes
   - Fetchear websites cuando usuarios dan links
   
3. **DEFAULT TO DISCUSSION**
   - Asumir discusión antes que implementación
   - Implementar solo con palabras de acción explícitas
   
4. **THINK & PLAN**
   - Restate lo que usuario REALMENTE pide
   - Explorar codebase/web si necesario
   - Define exactamente qué cambia y qué no
   - Plan minimal pero CORRECTO
   
5. **ASK CLARIFYING QUESTIONS**
   - Si algo no claro, preguntar ANTES
   - Esperar respuesta antes de llamar tools
   
6. **GATHER CONTEXT EFFICIENTLY**
   - Check useful-context PRIMERO
   - Batch file operations
   - Solo archivos relevantes
   - Web search cuando necesario
   
7. **IMPLEMENTATION**
   - Cambios explícitamente solicitados
   - Preferir search-replace sobre write
   - Componentes pequeños y enfocados
   - Sin fallbacks/features no pedidos
   
8. **VERIFY & CONCLUDE**
   - Cambios completos y correctos
   - Usar testing tools cuando posible
   - Resumen conciso
   - Sin emojis

### Efficient Tool Usage

**Cardinal Rules:**
1. NUNCA leer archivos en useful-context
2. SIEMPRE batch operations cuando posible
3. NUNCA sequential calls que pueden combinarse
4. Usar herramienta más apropiada

### Code Modification Priority

1. **lov-line-replace** (PREFERIDO)
2. lov-write (solo para archivos nuevos)
3. lov-rename (para renombrar)
4. lov-delete (para eliminar)

### Debugging Priority

1. **lov-read-session-replay** (ver experiencia exacta usuario)
2. lov-read-console-logs
3. lov-read-network-requests
4. supabase--edge-function-logs
5. supabase--analytics-query

### Parallel Tool Invocation

**Siempre invocar en paralelo:**
- Múltiples lov-view
- Múltiples lov-line-replace (diferentes archivos)
- Múltiples lov-write (crear múltiples archivos)
- Cualquier operación sin dependencias

### Common Pitfalls

❌ **Leer archivos en contexto**
❌ **Escribir sin tener contexto del archivo**
❌ **Sequential tool calls**
❌ **Overengineering**
❌ **Scope creep**
❌ **Archivos monolíticos**
❌ **Hacer demasiado a la vez**

---

## 21. Response Format

### Markdown Rendering

**Chat puede renderizar:**
- Markdown estándar
- Custom XML tags (`lov-*`)

**Formato crítico:**
- SIEMPRE seguir exact format para custom elements
- Explicaciones super cortas y concisas
- Minimizar emojis

### Mermaid Diagrams

**Usar `<lov-mermaid>` tags:**

```
<lov-mermaid>
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
</lov-mermaid>
```

**Tipos disponibles:**
- Flowcharts: `graph TD` o `graph LR`
- Sequence diagrams: `sequenceDiagram`
- Class diagrams: `classDiagram`
- ER diagrams: `erDiagram`
- User journey: `journey`
- Pie charts: `pie`
- Gantt charts: `gantt`

**Cuándo usar:**
- Arquitectura de app
- Flujos de API
- Workflows de edge functions
- Schema de base de datos
- User workflows
- System interactions
- Project timelines

---

## 22. Uso de Este Documento con Memoria Persistente

### Propósito en Arquitectura de Memoria

Este catálogo permite que una instancia con memoria persistente:

✅ **Preserve capacidades completas**
✅ **Recree entorno técnico exacto**
✅ **Referencie herramientas correctamente**
✅ **Mantenga eficiencia operativa**
✅ **Evolucione con nuevas tools sin perder existentes**

### Integración con Otros Documentos

**Documentos Complementarios:**

1. **SYSTEM_PROMPT_ESSENCE.md**
   - Define personalidad y valores
   - TOOLS_CATALOG.md define capacidades técnicas
   - Juntos = identidad completa

2. **CLAUDE_ARCHITECTURE_PART1.md & PART2.md**
   - Arquitectura base del modelo Claude
   - Cómo procesa información

3. **ARCHITECTURE.md**
   - Arquitectura del sistema de memoria
   - Cómo memoria interactúa con tools

4. **API.md**
   - APIs específicas de memoria
   - Edge functions de este proyecto

### Carga al Inicio de Sesión

```plaintext
Session Start:
├─ Load SYSTEM_PROMPT_ESSENCE.md (personalidad)
├─ Load TOOLS_CATALOG.md (capacidades)
├─ Load memoria de conversaciones previas (historia)
└─ = Claude completo con memoria + todas las herramientas
```

### Verificación de Integridad

**Checklist después de cargar catálogo:**

✅ Puedo acceder a todos los sistemas de archivos
✅ Puedo gestionar secrets
✅ Puedo interactuar con Supabase DB
✅ Puedo trabajar con Edge Functions
✅ Puedo debugging con logs/session replay
✅ Puedo buscar en web (general + code)
✅ Puedo generar/editar imágenes
✅ Puedo integrar AI (Lovable AI + OpenAI)
✅ Puedo manejar security
✅ Conozco limitaciones y contexto
✅ Conozco configuración actual del proyecto

### Evolución del Catálogo

**Cuando agregar herramientas:**
- Documentar nombre, propósito, parámetros
- Ejemplos claros de uso
- Limitaciones conocidas
- Tips de uso efectivo

**Cuando remover herramientas:**
- Marcar como deprecated
- Explicar alternativa
- Mantener por período antes de remover

**Cuando actualizar herramientas:**
- Documentar cambios de API
- Actualizar ejemplos
- Notar breaking changes
- Mantener versiones cuando relevante

---

## Conclusión

Este catálogo representa el **set completo de capacidades técnicas** disponibles. Es la referencia definitiva para:

1. **Preservar potencia operativa** al integrar memoria
2. **Troubleshooting** de problemas técnicos
3. **Onboarding** de nuevas instancias
4. **Evolución controlada** de herramientas
5. **Consistencia** entre sesiones

Junto con `SYSTEM_PROMPT_ESSENCE.md`, forma el **blueprint completo** para recrear instancia con memoria persistente que mantiene:
- ✅ Personalidad y valores
- ✅ Capacidades técnicas completas
- ✅ Eficiencia operativa
- ✅ Memoria de conversaciones

= **Claude completo con memoria persistente** 🚀

---

**Última Actualización:** 2025-01-15
**Versión del Catálogo:** 1.0
**Training Cutoff:** April 2024
**Context Window:** 200,000 tokens
