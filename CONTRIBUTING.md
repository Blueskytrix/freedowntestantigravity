# Guía de Contribución

## 🎯 Cómo Contribuir

Gracias por tu interés en contribuir al Sistema de Memoria Persistente. Esta guía te ayudará a empezar.

## 📋 Tipos de Contribuciones

### 1. Reportar Bugs

Si encuentras un bug:

1. **Verifica** que no esté ya reportado en Issues
2. **Crea un nuevo Issue** con el template de bug
3. **Incluye**:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Logs de error de la consola
   - Versión del sistema

**Ejemplo de buen reporte:**

```markdown
**Descripción:**
La búsqueda semántica no retorna resultados cuando el query tiene caracteres especiales.

**Pasos para reproducir:**
1. Navegar a /memory
2. Buscar "libertad & conocimiento"
3. No se muestran resultados

**Esperado:**
Debería encontrar conversaciones relevantes

**Actual:**
Muestra "0 resultados encontrados"

**Error en consola:**
```
Error: Invalid character in query
at searchMemory (useMemoryContext.ts:45)
```

**Entorno:**
- Browser: Chrome 120
- Sistema: macOS 14
- Versión: 1.0.0
```

### 2. Solicitar Features

Para proponer nuevas funcionalidades:

1. **Abre un Issue** con el template de feature request
2. **Describe**:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas
   - Ejemplos de uso

**Ejemplo:**

```markdown
**Feature:** Filtro por rango de fechas en búsqueda

**Problema:**
Actualmente no puedo limitar la búsqueda a conversaciones de un período específico.

**Solución Propuesta:**
Agregar date pickers para filtrar por fecha inicio/fin en el componente de búsqueda.

**Alternativas:**
- Tags de "mes" o "año" en cada conversación
- Búsqueda por texto con fechas naturales ("enero 2024")

**Mockup:**
[Adjuntar imagen o sketch]
```

### 3. Mejorar Documentación

La documentación siempre puede mejorar:

- Corregir typos
- Aclarar explicaciones confusas
- Agregar más ejemplos
- Traducir a otros idiomas
- Mejorar diagramas

**Archivos de documentación:**
- `README.md` - Overview del proyecto
- `memoria/README.md` - Docs del sistema de memoria
- `memoria/ARCHITECTURE.md` - Arquitectura técnica
- `memoria/API.md` - Referencia de API
- `memoria/USAGE.md` - Guía de uso
- `memoria/CONCEPTS.md` - Conceptos clave
- `memoria/EXAMPLES.md` - Ejemplos de código
- `SETUP.md` - Configuración inicial
- `CONTRIBUTING.md` - Esta guía

### 4. Contribuir Código

#### Proceso de Desarrollo

1. **Fork del repositorio**

```bash
# Via GitHub UI o:
gh repo fork tu-usuario/memoria-persistente
```

2. **Clonar tu fork**

```bash
git clone https://github.com/tu-usuario/memoria-persistente.git
cd memoria-persistente
```

3. **Crear una rama**

```bash
# Usar convención:
# feature/nombre-feature
# fix/nombre-bug
# docs/nombre-doc

git checkout -b feature/filtro-fechas
```

4. **Instalar dependencias**

```bash
npm install
```

5. **Hacer cambios**

- Escribe código limpio y legible
- Sigue las convenciones del proyecto
- Agrega tests si aplica
- Actualiza documentación si es necesario

6. **Commit**

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato:
# tipo(scope): descripción corta
#
# [body opcional]
# [footer opcional]

git commit -m "feat(search): agregar filtro por rango de fechas

Permite al usuario filtrar búsquedas por fecha inicio/fin.
Incluye date pickers en UI de búsqueda.

Closes #123"
```

**Tipos de commit:**
- `feat`: Nueva funcionalidad
- `fix`: Fix de bug
- `docs`: Solo documentación
- `style`: Formato, sin cambios de código
- `refactor`: Refactorización
- `test`: Agregar/modificar tests
- `chore`: Tareas de mantenimiento

7. **Push**

```bash
git push origin feature/filtro-fechas
```

8. **Crear Pull Request**

- Ve a GitHub
- Click en "New Pull Request"
- Selecciona tu rama
- Llena el template de PR
- Asigna reviewers si conoces el equipo

## 🎨 Estándares de Código

### TypeScript

```typescript
// ✅ HACER: Usar tipos explícitos
interface Conversation {
  id: string;
  title: string;
  content: string;
}

function saveConversation(conv: Conversation): Promise<void> {
  // ...
}

// ❌ EVITAR: any o tipos implícitos
function saveConversation(conv: any) {
  // ...
}
```

### React Components

```typescript
// ✅ HACER: Componentes funcionales con tipos
interface Props {
  conversations: Conversation[];
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, onSelect }: Props) {
  return (
    <div>
      {conversations.map(conv => (
        <ConversationCard key={conv.id} {...conv} onClick={() => onSelect(conv.id)} />
      ))}
    </div>
  );
}

// ❌ EVITAR: Props sin tipos
export function ConversationList({ conversations, onSelect }) {
  // ...
}
```

### Naming Conventions

```typescript
// Variables y funciones: camelCase
const myVariable = 'value';
function doSomething() {}

// Componentes y tipos: PascalCase
interface User {}
function UserCard() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_RESULTS = 10;
const API_ENDPOINT = '/api';

// Archivos:
// - Componentes: PascalCase.tsx
// - Hooks: camelCase.ts
// - Utils: camelCase.ts
```

### Estructura de Archivos

```
src/
├── components/
│   ├── ui/              # shadcn components
│   ├── ConversationCard.tsx
│   └── SearchBar.tsx
├── hooks/
│   ├── useMemoryContext.ts
│   └── useDebounce.ts
├── pages/
│   ├── Memory.tsx
│   └── Index.tsx
├── lib/
│   └── utils.ts
└── integrations/
    └── supabase/
```

### CSS/Tailwind

```typescript
// ✅ HACER: Usar tokens del design system
<div className="bg-background text-foreground">

// ❌ EVITAR: Colores hardcoded
<div className="bg-white text-black">

// ✅ HACER: Responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ✅ HACER: Agrupar clases relacionadas
<div className="flex items-center justify-between gap-2">
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Watch mode
npm test:watch

# Coverage
npm test:coverage
```

### Escribir Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useMemoryContext } from '@/hooks/useMemoryContext';

describe('useMemoryContext', () => {
  it('should load conversations on mount', async () => {
    const { result } = renderHook(() => useMemoryContext());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversations).toHaveLength(10);
  });

  it('should search memories', async () => {
    const { result } = renderHook(() => useMemoryContext());

    const results = await result.current.searchMemory('libertad');

    expect(results).toHaveLength(5);
    expect(results[0].similarity).toBeGreaterThan(0.7);
  });
});
```

## 📝 Pull Request Checklist

Antes de enviar tu PR, verifica:

- [ ] El código sigue los estándares del proyecto
- [ ] Todos los tests pasan
- [ ] Se agregó documentación si es necesario
- [ ] Los commits siguen Conventional Commits
- [ ] El PR tiene una descripción clara
- [ ] Se vinculó el Issue relacionado (si existe)
- [ ] Se agregaron screenshots si hay cambios UI
- [ ] Se probó en desarrollo local

## 🔍 Proceso de Review

1. **Automated Checks**
   - Linting
   - Type checking
   - Tests
   - Build

2. **Code Review**
   - Al menos 1 aprobación requerida
   - Comentarios constructivos
   - Sugerencias de mejora

3. **Merge**
   - Squash and merge (default)
   - Mensaje de commit limpio
   - Delete branch después de merge

## 🐛 Debugging

### Logs Útiles

```typescript
// En Edge Functions
console.log('[load-session-memory] Fetching conversations...');
console.error('[save-conversation] Error:', error);

// En Frontend
console.log('[useMemoryContext] Loaded conversations:', conversations.length);
```

### Herramientas

- **DevTools Network**: Ver llamadas a Edge Functions
- **Supabase Dashboard**: Ver logs de funciones y DB
- **React DevTools**: Inspeccionar state y props
- **Console**: Errores y warnings

## 🎓 Recursos de Aprendizaje

### Documentación Interna
- [Arquitectura](./memoria/ARCHITECTURE.md)
- [API Reference](./memoria/API.md)
- [Ejemplos](./memoria/EXAMPLES.md)

### Tecnologías Usadas
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [pgvector](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)

## 💬 Comunicación

### Discord/Slack
- Canal #memoria-persistente para discusiones
- Canal #contribuidores para coordinación

### GitHub Discussions
- Para preguntas abiertas
- Ideas de features
- Ayuda general

### Issues
- Para bugs confirmados
- Feature requests específicos
- Tracking de tareas

## 🏆 Reconocimiento

Los contribuidores serán reconocidos:
- En el README
- En las release notes
- En la documentación (si aplica)

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones se licencien bajo la misma licencia del proyecto.

## ❓ Preguntas

Si tienes preguntas:
1. Revisa la documentación
2. Busca en Issues existentes
3. Pregunta en Discord/Slack
4. Abre un Issue de pregunta

## 🙏 Gracias

Gracias por contribuir al Sistema de Memoria Persistente. Cada contribución, por pequeña que sea, hace que el proyecto mejore para todos. ❤️
