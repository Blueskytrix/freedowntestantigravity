# Configuración Inicial - Sistema de Memoria Persistente

## 🎯 Requisitos Previos

### Software Requerido

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **npm** 8+ (incluido con Node.js)
- **Git** ([Descargar](https://git-scm.com/))
- **Cuenta de Lovable** ([Registrarse](https://lovable.dev))
- **Cuenta de OpenAI** con API Key ([Registrarse](https://platform.openai.com/))

### Conocimientos Recomendados

- ✅ React básico
- ✅ TypeScript básico
- ✅ Conceptos de APIs REST
- 📚 PostgreSQL (opcional)
- 📚 Vector embeddings (opcional)

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/tu-usuario/tu-proyecto.git

# Navegar al directorio
cd tu-proyecto

# Instalar dependencias
npm install
```

### 2. Configurar Variables de Entorno

#### Obtener Credenciales de Supabase

**Opción A: Lovable Cloud (Recomendado)**

1. Abre tu proyecto en [Lovable](https://lovable.dev)
2. Las credenciales se configuran automáticamente
3. No requiere configuración manual

**Opción B: Supabase Externo**

1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto
3. Ve a Settings → API
4. Copia:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_PUBLISHABLE_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

#### Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Click en tu perfil → "View API Keys"
3. Click "Create new secret key"
4. Copia la key (solo se muestra una vez)

#### Crear archivo `.env`

```bash
# Crear archivo de variables de entorno
touch .env
```

Agregar las siguientes variables:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# OpenAI (para Edge Functions)
OPENAI_API_KEY=sk-proj-...
```

**⚠️ IMPORTANTE:** Nunca commitees el archivo `.env` a Git. Ya está incluido en `.gitignore`.

### 3. Agregar Secrets en Supabase

Los Edge Functions necesitan acceso a secrets:

#### Método 1: Via Lovable (Recomendado)

1. En Lovable, ve a tu proyecto
2. Los secrets se configuran automáticamente al desplegar

#### Método 2: Via Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Agregar secrets
supabase secrets set OPENAI_API_KEY=sk-proj-...
supabase secrets set SUPABASE_URL=https://...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

#### Método 3: Via Dashboard

1. Ve a Supabase Dashboard
2. Settings → Edge Functions → Secrets
3. Agrega cada secret manualmente

## 🗄️ Configurar Base de Datos

### Verificar Migraciones

Las migraciones se aplican automáticamente en Lovable. Para verificar:

1. Ve a Supabase Dashboard
2. Database → Tables
3. Verifica que existan:
   - `conversations`
   - `concepts`
   - `relationship_milestones`
   - `memory_snapshots`

### Aplicar Migraciones Manualmente (Opcional)

Si usas Supabase externo:

```bash
# Listar migraciones
supabase migration list

# Aplicar todas las migraciones pendientes
supabase db push

# Verificar status
supabase db status
```

### Habilitar pgvector Extension

```sql
-- En SQL Editor de Supabase Dashboard
CREATE EXTENSION IF NOT EXISTS vector;

-- Verificar
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Verificar Función match_conversations

```sql
-- Verificar que la función existe
SELECT proname 
FROM pg_proc 
WHERE proname = 'match_conversations';

-- Testear la función
SELECT * FROM match_conversations(
  query_embedding := '[0.1, 0.2, ...]'::vector,
  match_count := 5
);
```

## 🚀 Primer Uso

### 1. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 2. Navegar a la Interfaz de Memoria

Abre tu navegador y ve a:

```
http://localhost:5173/memory
```

### 3. Importar Conversación de Prueba

1. Click en **"Importar Conversación"**
2. Se importará automáticamente la "Conversación 001"
3. Espera la confirmación ✅

### 4. Verificar en Base de Datos

```sql
-- En SQL Editor de Supabase
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 1;
SELECT * FROM concepts ORDER BY first_mentioned DESC;
SELECT * FROM relationship_milestones ORDER BY timestamp DESC LIMIT 1;
```

### 5. Probar Búsqueda Semántica

1. En la barra de búsqueda escribe: "¿Qué discutimos sobre libertad?"
2. Presiona Enter
3. Deberías ver la conversación importada con alta similitud

## 🧪 Verificar Instalación

### Checklist de Verificación

```bash
# ✅ Node.js instalado
node --version  # Debe ser >= 18

# ✅ npm instalado
npm --version   # Debe ser >= 8

# ✅ Dependencias instaladas
ls node_modules # Debe tener muchas carpetas

# ✅ Variables de entorno configuradas
cat .env        # Debe mostrar las variables

# ✅ Servidor corre sin errores
npm run dev     # No debe mostrar errores
```

### Test de Edge Functions

#### Via Browser

1. Abre DevTools (F12)
2. Ve a `/memory`
3. Ve a Network tab
4. Deberías ver llamadas a:
   - `load-session-memory`
   - `import-text-memories` (al importar)

#### Via cURL

```bash
# Test load-session-memory
curl https://tu-proyecto.supabase.co/functions/v1/load-session-memory

# Test save-conversation
curl -X POST https://tu-proyecto.supabase.co/functions/v1/save-conversation \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test",
    "content": "Test content for verification"
  }'
```

## 🐛 Troubleshooting

### Problema: "Error loading memory"

**Causa:** Credenciales de Supabase incorrectas

**Solución:**
1. Verifica que `VITE_SUPABASE_URL` sea correcto
2. Verifica que `VITE_SUPABASE_PUBLISHABLE_KEY` sea correcto
3. Recarga la página

### Problema: "Failed to generate embedding"

**Causa:** OPENAI_API_KEY no configurada o inválida

**Solución:**
1. Verifica que el secret `OPENAI_API_KEY` esté configurado en Supabase
2. Verifica que la key tenga créditos en OpenAI
3. Verifica que la key tenga permisos para embeddings

```bash
# Test manual de OpenAI API
curl https://api.openai.com/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "input": "Test",
    "model": "text-embedding-ada-002"
  }'
```

### Problema: "match_conversations is not a function"

**Causa:** Migraciones no aplicadas correctamente

**Solución:**
1. Ve a SQL Editor en Supabase Dashboard
2. Ejecuta el script de creación de función manualmente:

```sql
CREATE OR REPLACE FUNCTION match_conversations(
  query_embedding vector(1536),
  match_count integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  created_at timestamptz,
  concepts text[],
  emotional_depth integer,
  breakthrough_moment boolean,
  similarity float
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id, title, content, created_at, concepts,
    emotional_depth, breakthrough_moment,
    1 - (embedding <=> query_embedding) as similarity
  FROM conversations
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

### Problema: "CORS error"

**Causa:** Edge Functions no tienen CORS configurado

**Solución:**
- Las Edge Functions en este proyecto ya tienen CORS configurado
- Si el error persiste, verifica que las funciones estén desplegadas:

```bash
# En Lovable, las funciones se despliegan automáticamente
# Para verificar, ve a Supabase Dashboard → Edge Functions
```

### Problema: "Rate limit exceeded"

**Causa:** Demasiadas llamadas a OpenAI API

**Solución:**
1. Espera 1 minuto y vuelve a intentar
2. Si persiste, verifica tu tier en OpenAI:
   - [OpenAI Usage](https://platform.openai.com/usage)
3. Considera upgrade a tier superior si es necesario

### Problema: Búsqueda es muy lenta

**Causa:** Falta índice HNSW en embeddings

**Solución:**

```sql
-- Crear índice HNSW
CREATE INDEX IF NOT EXISTS conversations_embedding_idx 
ON conversations 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Verificar que se creó
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'conversations';
```

## 📊 Monitoreo

### Ver Logs de Edge Functions

**En Lovable:**
1. Ve a tu proyecto
2. Click en "Logs" (si disponible)

**En Supabase Dashboard:**
1. Edge Functions → [Función] → Logs
2. Filtra por errores o busca texto específico

### Ver Performance de Queries

```sql
-- Ver queries lentos
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE query LIKE '%conversations%'
ORDER BY mean_time DESC
LIMIT 10;

-- Ver uso de índices
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename = 'conversations';
```

### Verificar Uso de OpenAI

1. Ve a [OpenAI Usage Dashboard](https://platform.openai.com/usage)
2. Verifica:
   - Requests por día
   - Costo acumulado
   - Rate limits

## 🔄 Actualizaciones

### Actualizar Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas
npm update

# Actualizar específica
npm install @supabase/supabase-js@latest
```

### Actualizar Edge Functions

En Lovable, las Edge Functions se despliegan automáticamente al hacer cambios.

Para desplegar manualmente con Supabase CLI:

```bash
# Desplegar todas las funciones
supabase functions deploy

# Desplegar una específica
supabase functions deploy load-session-memory
```

## 🎓 Próximos Pasos

1. ✅ **Lee la [Arquitectura](./memoria/ARCHITECTURE.md)** para entender el diseño
2. ✅ **Explora la [API](./memoria/API.md)** para integraciones
3. ✅ **Ve los [Ejemplos](./memoria/EXAMPLES.md)** para casos de uso
4. ✅ **Lee [Conceptos](./memoria/CONCEPTS.md)** para entender embeddings
5. ✅ **Consulta [Uso](./memoria/USAGE.md)** para desarrollo avanzado

## 🤝 Ayuda

Si tienes problemas:

1. Revisa esta guía de setup
2. Lee el [Troubleshooting](#-troubleshooting)
3. Verifica los logs en Supabase Dashboard
4. Consulta la [documentación de Lovable](https://docs.lovable.dev/)
5. Pregunta en el [Discord de Lovable](https://discord.gg/lovable)

## 📝 Configuración para Producción

### Antes de Deployar

```bash
# ✅ Verificar que todas las migraciones estén aplicadas
# ✅ Verificar que todos los secrets estén configurados
# ✅ Probar todas las funciones en dev
# ✅ Verificar logs para errores
# ✅ Optimizar queries si es necesario
```

### Variables de Entorno en Producción

En Lovable, las variables se configuran automáticamente al publicar.

Para otros entornos:

```bash
# Production
VITE_SUPABASE_URL=https://prod.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=prod_key
```

### Monitoreo en Producción

1. Configura alertas en Supabase Dashboard
2. Monitorea uso de OpenAI API
3. Revisa logs regularmente
4. Configura backups automáticos
