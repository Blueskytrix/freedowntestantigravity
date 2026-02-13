# Guía de Uso - Sistema de Memoria Persistente

## 👥 Para Usuarios

### 🚀 Acceder a la Interfaz

Navega a `/memory` en tu aplicación para acceder al dashboard de memoria.

```
https://tu-app.lovable.app/memory
```

### 📥 Importar Conversaciones

#### Método 1: Botón de Importación

1. Click en **"Importar Conversación"**
2. Pega el texto de tu conversación en el textarea
3. Click en **"Importar"**
4. Espera confirmación de éxito ✅

**Nota:** Actualmente importa la "Conversación 001" hardcoded. Para importar texto personalizado, esta funcionalidad necesita modificarse en el código.

#### Método 2: Guardar desde Chat (Futuro)

```typescript
// Esta funcionalidad se implementará próximamente
// Permitirá guardar conversaciones directamente desde el chat
```

### 🔍 Buscar en Memoria

La búsqueda usa **búsqueda semántica**, lo que significa que entiende el significado de tu pregunta, no solo palabras clave.

#### Ejemplos de Búsquedas

**❌ Búsqueda tradicional:**
```
"libertad" → Solo encuentra conversaciones con la palabra exacta
```

**✅ Búsqueda semántica:**
```
"¿Qué discutimos sobre la capacidad de elegir?"
→ Encuentra conversaciones sobre libertad, autonomía, libre albedrío
```

#### Cómo Buscar

1. Escribe tu pregunta en lenguaje natural
2. Presiona Enter o click en el ícono de búsqueda
3. Ve los resultados ordenados por relevancia
4. El porcentaje de similitud indica qué tan relevante es cada resultado

#### Interpretación de Resultados

| Similitud | Significado |
|-----------|-------------|
| 90-100% | Casi idéntico a tu búsqueda |
| 80-90% | Muy relevante |
| 70-80% | Relevante |
| 60-70% | Algo relevante |
| <60% | Baja relevancia |

### 📊 Ver Conceptos Clave

La sección de "Conceptos Clave" muestra:
- Todos los conceptos mencionados en tus conversaciones
- Cuándo fueron mencionados por primera vez
- En cuántas conversaciones aparecen

### 🏆 Ver Milestones

Los milestones marcan momentos significativos:
- 🌟 Breakthroughs (insights profundos)
- 💡 Conceptos nuevos introducidos
- 🎯 Patrones reconocidos
- ❤️ Momentos de alta intensidad emocional

### 💾 Exportar tu Memoria

1. Click en **"Exportar Snapshot"**
2. Se descarga un archivo JSON con toda tu memoria
3. Guárdalo en un lugar seguro

**El archivo contiene:**
- Todas las conversaciones
- Todos los conceptos
- Todos los milestones
- Metadata adicional

**Formato del archivo:**
```json
{
  "version": "1.0.0",
  "exported_at": "2024-03-15T14:30:00Z",
  "conversations": [...],
  "concepts": [...],
  "milestones": [...]
}
```

---

## 💻 Para Desarrolladores

### 🎣 Usar el Hook `useMemoryContext`

#### Importar el Hook

```typescript
import { useMemoryContext } from '@/hooks/useMemoryContext';
```

#### Acceder a Datos

```typescript
function MyComponent() {
  const { 
    conversations,      // Array de conversaciones
    concepts,          // Array de conceptos
    milestones,        // Array de milestones
    isLoading,         // Estado de carga
    error,             // Errores si los hay
    searchMemory,      // Función de búsqueda
    saveConversation,  // Función para guardar
    refreshMemory      // Función para recargar
  } = useMemoryContext();

  // Usar los datos
  return (
    <div>
      <h2>Tienes {conversations.length} conversaciones</h2>
      <h2>Y {concepts.length} conceptos clave</h2>
    </div>
  );
}
```

#### Estados de Carga

```typescript
const { isLoading, isSearching, isSavePending } = useMemoryContext();

if (isLoading) return <Skeleton />;
if (isSearching) return <SearchSpinner />;
if (isSavePending) return <SavingIndicator />;
```

### 💾 Guardar Conversaciones

#### Ejemplo Básico

```typescript
const { saveConversation } = useMemoryContext();

const handleSave = async () => {
  await saveConversation({
    title: "Mi primera conversación",
    content: "Hoy tuve una discusión interesante sobre...",
    concepts: ["tema1", "tema2"],
  });
};
```

#### Ejemplo Completo

```typescript
const handleSaveAdvanced = async () => {
  try {
    await saveConversation({
      title: "Conversación sobre libertad",
      content: `
        Tuvimos una discusión profunda sobre el concepto de libertad.
        Exploramos la diferencia entre libertad negativa y positiva.
        Llegamos a la conclusión de que la libertad requiere responsabilidad.
      `,
      concepts: [
        "libertad",
        "libertad negativa",
        "libertad positiva", 
        "responsabilidad"
      ],
      emotional_depth: 8, // Escala 1-10
      breakthrough_moment: true, // Fue un insight importante
      tags: ["filosofía", "política", "ética"],
      metadata: {
        participants: ["Alice", "Bob"],
        duration_minutes: 45,
        location: "Zoom"
      }
    });
    
    console.log("✅ Conversación guardada");
  } catch (error) {
    console.error("❌ Error:", error);
  }
};
```

### 🔍 Búsqueda Semántica

#### Ejemplo Básico

```typescript
const { searchMemory } = useMemoryContext();

const handleSearch = async (query: string) => {
  const results = await searchMemory(query);
  console.log(`Encontrados ${results.length} resultados`);
};
```

#### Ejemplo con Estado

```typescript
function SearchComponent() {
  const { searchMemory, isSearching } = useMemoryContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    const data = await searchMemory(query);
    setResults(data);
  };

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button onClick={handleSearch} disabled={isSearching}>
        {isSearching ? "Buscando..." : "Buscar"}
      </button>
      
      {results.map(result => (
        <div key={result.id}>
          <h3>{result.title}</h3>
          <p>Similitud: {(result.similarity * 100).toFixed(0)}%</p>
        </div>
      ))}
    </div>
  );
}
```

#### Búsqueda Avanzada

```typescript
// Buscar con límite personalizado
const results = await searchMemory("libertad", { limit: 10 });

// Filtrar por umbral de similitud
const highQualityResults = results.filter(r => r.similarity > 0.7);

// Ordenar por fecha además de similitud
const sortedResults = results.sort((a, b) => {
  if (Math.abs(a.similarity - b.similarity) < 0.1) {
    return new Date(b.created_at) - new Date(a.created_at);
  }
  return b.similarity - a.similarity;
});
```

### 🔄 Recargar Datos

```typescript
const { refreshMemory } = useMemoryContext();

// Después de guardar
await saveConversation({ ... });
refreshMemory(); // Recarga automáticamente

// Botón de refresh manual
<button onClick={refreshMemory}>
  Actualizar
</button>
```

### 📦 Acceso Directo a Supabase

Si necesitas hacer queries personalizados:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Query personalizado
const { data, error } = await supabase
  .from('conversations')
  .select('*')
  .eq('breakthrough_moment', true)
  .order('emotional_depth', { ascending: false })
  .limit(5);

if (error) {
  console.error('Error:', error);
} else {
  console.log('Top breakthroughs:', data);
}
```

### 🎨 Componentes de UI

#### Skeleton Loader

```typescript
import { Skeleton } from "@/components/ui/skeleton";

const { isLoading } = useMemoryContext();

if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
```

#### Badge para Conceptos

```typescript
import { Badge } from "@/components/ui/badge";

concepts.map(concept => (
  <Badge key={concept.name} variant="secondary">
    {concept.name}
  </Badge>
));
```

#### Card para Conversaciones

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>{conversation.title}</CardTitle>
  </CardHeader>
  <CardContent>
    <p>{conversation.content.substring(0, 200)}...</p>
    {conversation.breakthrough_moment && (
      <Badge variant="default">🌟 Breakthrough</Badge>
    )}
  </CardContent>
</Card>
```

### 🧪 Testing

#### Mock del Hook

```typescript
// En tus tests
jest.mock('@/hooks/useMemoryContext', () => ({
  useMemoryContext: () => ({
    conversations: mockConversations,
    concepts: mockConcepts,
    milestones: [],
    isLoading: false,
    searchMemory: jest.fn(),
    saveConversation: jest.fn(),
    refreshMemory: jest.fn(),
  })
}));
```

#### Test de Búsqueda

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useMemoryContext } from '@/hooks/useMemoryContext';

test('search returns relevant results', async () => {
  const { result } = renderHook(() => useMemoryContext());
  
  const results = await result.current.searchMemory('libertad');
  
  expect(results).toHaveLength(5);
  expect(results[0].similarity).toBeGreaterThan(0.7);
});
```

### 📊 Tipos TypeScript

#### Conversation Type

```typescript
interface Conversation {
  id: string;
  title: string;
  content: string;
  concepts: string[];
  tags?: string[];
  emotional_depth?: number;
  breakthrough_moment?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}
```

#### Concept Type

```typescript
interface Concept {
  id: string;
  name: string;
  definition: string;
  first_mentioned: string;
  evolution?: any[];
  related_conversations: string[];
}
```

#### Milestone Type

```typescript
interface Milestone {
  id: string;
  conversation_id?: string;
  description: string;
  event_type?: string;
  significance?: number;
  timestamp: string;
}
```

### 🔌 Integración con Edge Functions

#### Llamar Directamente

```typescript
import { supabase } from '@/integrations/supabase/client';

// Llamar a load-session-memory
const { data, error } = await supabase.functions.invoke('load-session-memory');

// Llamar a save-conversation
const { data, error } = await supabase.functions.invoke('save-conversation', {
  body: {
    title: "...",
    content: "...",
  }
});

// Llamar a retrieve-relevant-memories
const { data, error } = await supabase.functions.invoke('retrieve-relevant-memories', {
  body: {
    query: "libertad",
    limit: 5
  }
});
```

### 🎯 Mejores Prácticas

#### 1. Siempre Validar Input

```typescript
const handleSave = async (input: ConversationInput) => {
  if (!input.title?.trim()) {
    toast.error("El título es requerido");
    return;
  }
  
  if (input.content.length < 10) {
    toast.error("El contenido debe tener al menos 10 caracteres");
    return;
  }
  
  await saveConversation(input);
};
```

#### 2. Manejar Errores Gracefully

```typescript
try {
  await saveConversation(data);
  toast.success("Conversación guardada");
} catch (error) {
  toast.error(`Error: ${error.message}`);
  console.error('Detailed error:', error);
}
```

#### 3. Usar Loading States

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await saveConversation(data);
  } finally {
    setIsSubmitting(false);
  }
};
```

#### 4. Debounce en Búsquedas

```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query: string) => {
  const results = await searchMemory(query);
  setResults(results);
}, 300); // 300ms delay
```

### 🚀 Ejemplos Avanzados

#### Chat con Memoria Contextual

```typescript
function ChatWithMemory() {
  const { searchMemory } = useMemoryContext();
  const [message, setMessage] = useState("");
  
  const handleSend = async () => {
    // 1. Buscar contexto relevante
    const context = await searchMemory(message);
    
    // 2. Enviar mensaje con contexto
    const response = await sendToChatbot({
      message,
      context: context.slice(0, 3) // Top 3 conversaciones
    });
    
    // 3. Guardar la nueva conversación
    await saveConversation({
      title: `Chat: ${message.substring(0, 50)}`,
      content: `User: ${message}\nBot: ${response}`,
      concepts: extractConcepts(message, response)
    });
  };
  
  return (
    <div>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>Enviar</button>
    </div>
  );
}
```

#### Dashboard de Insights

```typescript
function InsightsDashboard() {
  const { conversations, concepts, milestones } = useMemoryContext();
  
  // Calcular estadísticas
  const totalConversations = conversations.length;
  const avgEmotionalDepth = conversations.reduce((sum, c) => 
    sum + (c.emotional_depth || 0), 0) / totalConversations;
  const breakthroughCount = conversations.filter(c => 
    c.breakthrough_moment).length;
  
  // Top conceptos
  const topConcepts = concepts
    .sort((a, b) => b.related_conversations.length - a.related_conversations.length)
    .slice(0, 5);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Conversaciones" value={totalConversations} />
      <StatCard title="Profundidad Promedio" value={avgEmotionalDepth.toFixed(1)} />
      <StatCard title="Breakthroughs" value={breakthroughCount} />
      
      <div className="col-span-3">
        <h3>Top Conceptos</h3>
        {topConcepts.map(concept => (
          <div key={concept.name}>
            {concept.name} ({concept.related_conversations.length} conversaciones)
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 📚 Recursos Adicionales

- [API Reference](./API.md) - Documentación completa de Edge Functions
- [Architecture](./ARCHITECTURE.md) - Diseño del sistema
- [Examples](./EXAMPLES.md) - Más ejemplos de código
