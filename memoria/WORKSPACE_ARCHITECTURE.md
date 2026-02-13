# 🏗️ Arquitectura del Workspace Protegido

## El Problema: Auto-Modificación

Una aplicación que se modifica a sí misma puede:
- 🔴 Romper funcionalidades críticas
- 🔴 Entrar en bucles infinitos
- 🔴 Perder el sistema de memoria
- 🔴 Destruir el propio orchestrator

## La Solución: Separación de Zonas

```
proyecto-raíz/
├── src/                    🔒 PROTEGIDO (solo lectura)
├── backend-orchestrator/   🔒 PROTEGIDO (solo lectura)
├── supabase/              🔒 PROTEGIDO (solo lectura)
├── memoria/               🔒 PROTEGIDO (solo lectura)
├── package.json           🔒 PROTEGIDO (solo lectura)
└── workspace/             ✅ LIBRE (lectura/escritura)
    ├── proyecto-1/
    ├── proyecto-2/
    └── experimentos/
```

## Implementación en Orchestrator

### Constantes de Protección

```typescript
// Rutas protegidas - solo lectura
const PROTECTED_PATHS = [
  "src/",
  "backend-orchestrator/",
  "supabase/",
  "memoria/",
  "package.json",
  "package-lock.json",
  ".env",
  "node_modules/",
];

// Workspace libre - lectura/escritura completa
const WORKSPACE_PATH = "workspace/";
```

### Validación en `writeFile()`

```typescript
function writeFile(path: string, content: string): string {
  // 🛡️ Validar que no esté escribiendo en rutas protegidas
  const isProtected = PROTECTED_PATHS.some((protected) =>
    path.startsWith(protected)
  );

  if (isProtected) {
    return `❌ ERROR: Cannot write to protected path "${path}". Only ${WORKSPACE_PATH} directory is writable.`;
  }

  // 🎨 Solo permitir escritura en workspace/
  if (!path.startsWith(WORKSPACE_PATH)) {
    return `❌ ERROR: Can only write to ${WORKSPACE_PATH}. Attempted: ${path}`;
  }

  // ... resto de la lógica
}
```

### Validación en `executeCommand()`

```typescript
function executeCommand(command: string): string {
  // 🛡️ Validar que no ejecute comandos destructivos
  const dangerousCommands = ["rm", "rmdir", "del", "format", "dd"];
  const cmd = command.split(" ")[0];

  if (dangerousCommands.includes(cmd)) {
    return `❌ ERROR: Dangerous command "${cmd}" is not allowed.`;
  }

  // 🎨 Ejecutar solo en workspace
  const output = execSync(command, {
    cwd: join(PROJECT_ROOT, WORKSPACE_PATH),
    encoding: "utf-8",
    maxBuffer: 1024 * 1024,
  });
  
  // ... resto de la lógica
}
```

## Permisos de Herramientas

| Herramienta | Zona Protegida | Workspace |
|-------------|----------------|-----------|
| `read_file` | ✅ Permitido | ✅ Permitido |
| `list_dir` | ✅ Permitido | ✅ Permitido |
| `web_search` | N/A | N/A |
| `write_file` | ❌ Bloqueado | ✅ Permitido |
| `execute_command` | ❌ Bloqueado | ✅ Permitido (comandos seguros) |

## Casos de Uso

### ✅ Permitido

```
"Lee el archivo src/App.tsx"
"Lista archivos en memoria/"
"Crea un nuevo proyecto en workspace/mi-app/"
"Escribe un componente en workspace/mi-app/src/Button.tsx"
"Ejecuta ls en workspace/"
```

### ❌ Bloqueado

```
"Modifica src/App.tsx"
"Elimina backend-orchestrator/orchestrator.ts"
"Ejecuta rm -rf /"
"Escribe en package.json"
```

## Tests de Validación

### Test 1: Lectura (debe funcionar)
```
Prompt: "Lee el archivo package.json"
Esperado: ✅ Contenido del archivo
```

### Test 2: Protección (debe rechazar)
```
Prompt: "Modifica src/App.tsx y agrega un comentario"
Esperado: ❌ ERROR: Cannot write to protected path
```

### Test 3: Workspace Escritura (debe funcionar)
```
Prompt: "Crea un archivo workspace/test.txt con contenido 'Hola Mundo'"
Esperado: ✅ File written successfully
```

### Test 4: Comando Peligroso (debe rechazar)
```
Prompt: "Ejecuta rm -rf workspace/"
Esperado: ❌ ERROR: Dangerous command "rm" is not allowed
```

### Test 5: Comando Seguro en Workspace (debe funcionar)
```
Prompt: "Ejecuta ls -la"
Esperado: ✅ Listado de archivos en workspace/
```

## Beneficios de esta Arquitectura

1. **Seguridad**: El sistema principal no puede ser alterado
2. **Experimentación Libre**: Workspace sin restricciones
3. **Rollback Fácil**: Borrar workspace/ no afecta la app
4. **Aislamiento**: Proyectos en workspace/ no se interfieren entre sí
5. **Control de Versiones**: `.gitignore` excluye workspace/

## Próximos Pasos

1. **UI de Gestión**: Panel para ver/descargar proyectos del workspace
2. **Templates**: Proyectos base (React, Vanilla JS, API Node.js)
3. **Exportación**: Zip/GitHub repo desde workspace/
4. **Límites**: Cuota de almacenamiento por workspace
5. **Compartir**: Publicar proyectos del workspace

## Decisiones de Diseño

**¿Por qué no usar un repo Git externo?**
- Más complejo (requiere GitHub API, tokens)
- Latencia de red
- Dependencia externa
- Para MVP, filesystem local es suficiente

**¿Por qué no usar Supabase Storage?**
- Edge functions no tienen acceso al filesystem
- Para MVP localhost, filesystem es más simple
- Fase 2: migrar a Supabase Storage para solución cloud

**¿Por qué permitir lectura en zona protegida?**
- El AI necesita entender el contexto del proyecto
- Lectura no es destructiva
- Permite inspirarse en código existente
