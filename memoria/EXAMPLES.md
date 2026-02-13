# Ejemplos de Código - Sistema de Memoria Persistente

## 📋 Índice

1. [Ejemplos Básicos](#ejemplos-básicos)
2. [Ejemplos de UI](#ejemplos-de-ui)
3. [Ejemplos de Búsqueda](#ejemplos-de-búsqueda)
4. [Ejemplos Avanzados](#ejemplos-avanzados)
5. [Ejemplos de Integración](#ejemplos-de-integración)

---

## Ejemplos Básicos

### 1. Cargar y Mostrar Conversaciones

```typescript
import { useMemoryContext } from '@/hooks/useMemoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function ConversationList() {
  const { conversations, isLoading, error } = useMemoryContext();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {conversations.map((conv) => (
        <Card key={conv.id}>
          <CardHeader>
            <CardTitle>{conv.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {conv.content.substring(0, 200)}...
            </p>
            <div className="flex gap-2 mt-2">
              {conv.concepts?.map((concept) => (
                <Badge key={concept} variant="secondary">
                  {concept}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 2. Guardar Nueva Conversación

```typescript
import { useState } from 'react';
import { useMemoryContext } from '@/hooks/useMemoryContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

function SaveConversationForm() {
  const { saveConversation, isSavePending } = useMemoryContext();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [concepts, setConcepts] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Título y contenido son requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveConversation({
        title: title.trim(),
        content: content.trim(),
        concepts: concepts.split(',').map(c => c.trim()).filter(Boolean),
      });

      toast({
        title: "✅ Guardado",
        description: "Conversación guardada exitosamente",
      });

      // Limpiar formulario
      setTitle('');
      setContent('');
      setConcepts('');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la conversación",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Título</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la conversación"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Contenido</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe el contenido de la conversación..."
          className="min-h-[200px]"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Conceptos (separados por comas)</label>
        <Input
          value={concepts}
          onChange={(e) => setConcepts(e.target.value)}
          placeholder="libertad, autonomía, filosofía"
        />
      </div>

      <Button type="submit" disabled={isSavePending}>
        {isSavePending ? "Guardando..." : "Guardar Conversación"}
      </Button>
    </form>
  );
}
```

---

## Ejemplos de UI

### 3. Timeline de Conversaciones

```typescript
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

function ConversationTimeline() {
  const { conversations } = useMemoryContext();

  // Agrupar por fecha
  const groupedByDate = conversations.reduce((acc, conv) => {
    const date = format(new Date(conv.created_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(conv);
    return acc;
  }, {} as Record<string, typeof conversations>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, convs]) => (
        <div key={date} className="relative pl-8 border-l-2 border-border">
          <div className="absolute -left-2.5 top-0 bg-primary rounded-full p-1">
            <Calendar className="h-3 w-3 text-primary-foreground" />
          </div>
          
          <div className="mb-2">
            <h3 className="text-sm font-semibold">
              {format(new Date(date), "d 'de' MMMM, yyyy", { locale: es })}
            </h3>
          </div>

          <div className="space-y-3">
            {convs.map((conv) => (
              <Card key={conv.id} className="ml-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{conv.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {conv.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4. Nube de Conceptos

```typescript
import { Badge } from '@/components/ui/badge';

function ConceptCloud() {
  const { concepts } = useMemoryContext();

  // Calcular tamaño basado en número de conversaciones
  const getSize = (count: number) => {
    if (count >= 5) return 'text-xl';
    if (count >= 3) return 'text-lg';
    return 'text-base';
  };

  // Ordenar por más mencionados
  const sortedConcepts = [...concepts].sort(
    (a, b) => b.related_conversations.length - a.related_conversations.length
  );

  return (
    <div className="flex flex-wrap gap-2 p-4">
      {sortedConcepts.map((concept) => (
        <Badge
          key={concept.id}
          variant="outline"
          className={`${getSize(concept.related_conversations.length)} cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors`}
        >
          {concept.name} ({concept.related_conversations.length})
        </Badge>
      ))}
    </div>
  );
}
```

### 5. Dashboard de Estadísticas

```typescript
import { Brain, Calendar, Lightbulb, TrendingUp } from 'lucide-react';

function MemoryStats() {
  const { conversations, concepts, milestones } = useMemoryContext();

  const stats = [
    {
      icon: Brain,
      label: "Total Conversaciones",
      value: conversations.length,
      color: "text-blue-500"
    },
    {
      icon: Lightbulb,
      label: "Conceptos Únicos",
      value: concepts.length,
      color: "text-yellow-500"
    },
    {
      icon: Calendar,
      label: "Días Activos",
      value: new Set(
        conversations.map(c => format(new Date(c.created_at), 'yyyy-MM-dd'))
      ).size,
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      label: "Breakthroughs",
      value: conversations.filter(c => c.breakthrough_moment).length,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

---

## Ejemplos de Búsqueda

### 6. Búsqueda con Debounce

```typescript
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

function DebouncedSearch() {
  const { searchMemory, isSearching } = useMemoryContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Debounce búsqueda
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const data = await searchMemory(query);
      setResults(data);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [query, searchMemory]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en memoria..."
          className="pl-10"
        />
        {isSearching && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result) => (
            <Card key={result.id} className="hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{result.title}</CardTitle>
                  <Badge variant="outline">
                    {(result.similarity * 100).toFixed(0)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {result.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 7. Filtros Avanzados

```typescript
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

function AdvancedSearchFilters() {
  const { searchMemory } = useMemoryContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [minSimilarity, setMinSimilarity] = useState(0.7);
  const [onlyBreakthroughs, setOnlyBreakthroughs] = useState(false);
  const [minDepth, setMinDepth] = useState(0);

  const handleSearch = async () => {
    let data = await searchMemory(query);

    // Aplicar filtros
    data = data.filter(r => r.similarity >= minSimilarity);
    
    if (onlyBreakthroughs) {
      data = data.filter(r => r.breakthrough_moment);
    }
    
    if (minDepth > 0) {
      data = data.filter(r => (r.emotional_depth || 0) >= minDepth);
    }

    setResults(data);
  };

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Buscar..."
      />

      <div className="space-y-3 p-4 border rounded-lg">
        <div>
          <label className="text-sm font-medium">
            Similitud Mínima: {minSimilarity.toFixed(2)}
          </label>
          <Slider
            value={[minSimilarity]}
            onValueChange={([value]) => setMinSimilarity(value)}
            min={0}
            max={1}
            step={0.05}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Solo Breakthroughs</label>
          <Switch
            checked={onlyBreakthroughs}
            onCheckedChange={setOnlyBreakthroughs}
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Profundidad Mínima: {minDepth}
          </label>
          <Slider
            value={[minDepth]}
            onValueChange={([value]) => setMinDepth(value)}
            min={0}
            max={10}
            step={1}
          />
        </div>
      </div>

      <Button onClick={handleSearch} className="w-full">
        Buscar con Filtros
      </Button>

      <div className="space-y-2">
        {results.map((result) => (
          <SearchResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}
```

---

## Ejemplos Avanzados

### 8. Chat con Memoria Contextual

```typescript
import { useState } from 'react';

function ChatWithMemory() {
  const { searchMemory, saveConversation } = useMemoryContext();
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Buscar contexto relevante
    const relevantMemories = await searchMemory(input);
    const context = relevantMemories
      .slice(0, 3)
      .map(m => m.content)
      .join('\n\n');

    // 2. Preparar mensajes con contexto
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    // 3. Simular respuesta del chatbot (aquí integrarías tu LLM)
    const botResponse = await callChatbot(input, context);
    const botMessage = { role: 'assistant', content: botResponse };
    setMessages(prev => [...prev, botMessage]);

    // 4. Guardar la conversación
    await saveConversation({
      title: `Chat: ${input.substring(0, 50)}`,
      content: `User: ${input}\n\nAssistant: ${botResponse}`,
      concepts: extractKeywords(input + ' ' + botResponse),
      tags: ['chat', 'ai-generated']
    });

    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje..."
          />
          <Button onClick={handleSend}>Enviar</Button>
        </div>
      </div>
    </div>
  );
}

// Helper function
function extractKeywords(text: string): string[] {
  const stopWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en'];
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 5);
}
```

### 9. Análisis de Evolución de Conceptos

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function ConceptEvolution() {
  const { conversations, concepts } = useMemoryContext();
  const [selectedConcept, setSelectedConcept] = useState('');

  // Calcular frecuencia por mes
  const getEvolutionData = (conceptName: string) => {
    const convWithConcept = conversations.filter(c =>
      c.concepts?.includes(conceptName)
    );

    const byMonth = convWithConcept.reduce((acc, conv) => {
      const month = format(new Date(conv.created_at), 'yyyy-MM');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const data = selectedConcept ? getEvolutionData(selectedConcept) : [];

  return (
    <div className="space-y-4">
      <Select value={selectedConcept} onValueChange={setSelectedConcept}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un concepto" />
        </SelectTrigger>
        <SelectContent>
          {concepts.map((concept) => (
            <SelectItem key={concept.id} value={concept.name}>
              {concept.name} ({concept.related_conversations.length})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolución de "{selectedConcept}"</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### 10. Exportación Avanzada

```typescript
import { Download } from 'lucide-react';

function AdvancedExport() {
  const { conversations, concepts, milestones } = useMemoryContext();

  const exportAsJSON = () => {
    const data = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      conversations,
      concepts,
      milestones,
      metadata: {
        total_conversations: conversations.length,
        total_concepts: concepts.length,
        date_range: {
          start: conversations[conversations.length - 1]?.created_at,
          end: conversations[0]?.created_at,
        }
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memoria-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  const exportAsMarkdown = () => {
    let markdown = `# Memoria Persistente\n\n`;
    markdown += `Exportado: ${format(new Date(), "d 'de' MMMM, yyyy")}\n\n`;
    markdown += `## Estadísticas\n\n`;
    markdown += `- Total Conversaciones: ${conversations.length}\n`;
    markdown += `- Total Conceptos: ${concepts.length}\n\n`;
    markdown += `## Conversaciones\n\n`;

    conversations.forEach(conv => {
      markdown += `### ${conv.title}\n\n`;
      markdown += `*${format(new Date(conv.created_at), "d 'de' MMMM, yyyy")}*\n\n`;
      markdown += `${conv.content}\n\n`;
      if (conv.concepts?.length) {
        markdown += `**Conceptos:** ${conv.concepts.join(', ')}\n\n`;
      }
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memoria-${format(new Date(), 'yyyy-MM-dd')}.md`;
    a.click();
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportAsJSON} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Exportar JSON
      </Button>
      <Button onClick={exportAsMarkdown} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Exportar Markdown
      </Button>
    </div>
  );
}
```

---

## Ejemplos de Integración

### 11. Hook Personalizado para Analytics

```typescript
import { useMemo } from 'react';
import { useMemoryContext } from '@/hooks/useMemoryContext';

export function useMemoryAnalytics() {
  const { conversations, concepts } = useMemoryContext();

  const analytics = useMemo(() => {
    const totalConversations = conversations.length;
    const totalConcepts = concepts.length;
    
    const avgEmotionalDepth = conversations.reduce(
      (sum, c) => sum + (c.emotional_depth || 0), 
      0
    ) / totalConversations || 0;

    const breakthroughRate = conversations.filter(
      c => c.breakthrough_moment
    ).length / totalConversations || 0;

    const topConcepts = concepts
      .sort((a, b) => b.related_conversations.length - a.related_conversations.length)
      .slice(0, 10);

    const conceptGrowth = concepts.reduce((acc, concept) => {
      const month = format(new Date(concept.first_mentioned), 'yyyy-MM');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalConversations,
      totalConcepts,
      avgEmotionalDepth,
      breakthroughRate,
      topConcepts,
      conceptGrowth,
    };
  }, [conversations, concepts]);

  return analytics;
}

// Uso
function AnalyticsDashboard() {
  const {
    totalConversations,
    avgEmotionalDepth,
    breakthroughRate,
    topConcepts
  } = useMemoryAnalytics();

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        title="Conversaciones"
        value={totalConversations}
      />
      <StatCard
        title="Profundidad Promedio"
        value={avgEmotionalDepth.toFixed(1)}
      />
      <StatCard
        title="Tasa de Breakthroughs"
        value={`${(breakthroughRate * 100).toFixed(0)}%`}
      />
      <StatCard
        title="Top Concepto"
        value={topConcepts[0]?.name || 'N/A'}
      />
    </div>
  );
}
```

### 12. Integración con External API

```typescript
async function enrichConversationWithAI(conversation: Conversation) {
  // Llamar a GPT para generar resumen
  const summary = await fetch('/api/summarize', {
    method: 'POST',
    body: JSON.stringify({ content: conversation.content })
  }).then(r => r.json());

  // Actualizar conversación
  await saveConversation({
    ...conversation,
    metadata: {
      ...conversation.metadata,
      ai_summary: summary,
      enriched_at: new Date().toISOString()
    }
  });
}
```

## 📚 Recursos Adicionales

Para más ejemplos y casos de uso:
- [Documentación de API](./API.md)
- [Guía de Uso](./USAGE.md)
- [Arquitectura](./ARCHITECTURE.md)
