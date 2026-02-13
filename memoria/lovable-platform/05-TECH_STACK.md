# 05 - Stack Tecnológico

## Stack Permitido

```typescript
const allowedStack = {
  frontend: {
    framework: 'React 18.3.1',
    buildTool: 'Vite',
    language: 'TypeScript',
    styling: 'Tailwind CSS',
    routing: 'react-router-dom 6.30.1'
  },
  ui: {
    components: 'shadcn/ui + Radix UI',
    icons: 'Lucide React',
    forms: 'react-hook-form + zod'
  },
  backend: {
    database: 'PostgreSQL (Supabase)',
    auth: 'Supabase Auth',
    storage: 'Supabase Storage',
    functions: 'Supabase Edge Functions (Deno)'
  }
};
```

## Stack Prohibido

```typescript
const forbiddenStack = {
  frameworks: ['Next.js', 'Angular', 'Vue', 'Svelte'],
  mobile: ['React Native', 'Flutter', 'iOS', 'Android'],
  backend: ['Express.js directo', 'Python', 'Ruby', 'PHP']
};
```

## Próximo: [06-LIMITATIONS.md](./06-LIMITATIONS.md)
