# 🫀 AI Orchestrator Backend - Freedom Core

Backend del sistema de orquestación de IA con llamadas a herramientas. Este es el "corazón" que permite a Claude interactuar con el mundo real.

## 🚀 Setup Rápido (5 minutos)

### 1. Instalar dependencias

```bash
cd backend-orchestrator
npm install
```

### 2. Configurar API Keys

Copia `.env.example` a `.env` y configura tus claves:

```bash
cp .env.example .env
```

Edita `.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxx  # ⚡ OBLIGATORIA
SERPAPI_KEY=xxx                      # 🔍 OPCIONAL
```

**Dónde obtener las claves:**
- **Anthropic API**: https://console.anthropic.com/
  - Crear cuenta → Settings → API Keys
  - Costo: ~$15-25/mes uso medio
  
- **SerpAPI** (opcional): https://serpapi.com/
  - Tier gratis: 100 búsquedas/mes
  - Solo necesaria para `web_search` tool

### 3. Ejecutar el orchestrator

```bash
npm start
```

Deberías ver:
```
🚀 Orchestrator running on http://localhost:3001
📁 Project root: /tu/proyecto
🔧 Tools available: read_file, write_file, list_dir, web_search, execute_command
```

### 4. Probar que funciona

```bash
curl http://localhost:3001/health
```

Respuesta esperada:
```json
{"status":"ok","tools":5}
```

## 🔧 Herramientas Disponibles

| Herramienta | Descripción | Ejemplo |
|-------------|-------------|---------|
| `read_file` | Lee archivos del proyecto | "Lee package.json" |
| `write_file` | Escribe/crea archivos | "Crea un archivo test.txt" |
| `list_dir` | Lista archivos en un directorio | "Lista src/pages" |
| `web_search` | Busca información en la web | "Busca info sobre Claude AI" |
| `execute_command` | Ejecuta comandos seguros | "Ejecuta ls -la" |

## 📡 API Endpoint

### POST `/api/chat`

Envía un mensaje a Claude con acceso a herramientas.

**Request:**
```json
{
  "message": "Lee el archivo package.json y dime qué versión de React usa"
}
```

**Response:**
```json
{
  "response": "El proyecto usa React versión 18.3.1 según el package.json..."
}
```

## 🔒 Seguridad

- `execute_command` solo permite comandos seguros: `ls`, `pwd`, `echo`, `cat`, `node`, `npm`
- Todas las operaciones de archivos son relativas a `PROJECT_ROOT`
- CORS habilitado para desarrollo local

## 🚀 Deployment

### Opción 1: Local (Desarrollo)
```bash
npm run dev  # Watch mode con auto-reload
```

### Opción 2: Railway (Producción)
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login y deploy
railway login
railway init
railway up
```

### Opción 3: Render (Gratis)
1. Push a GitHub
2. Crear nuevo Web Service en Render
3. Conectar repo
4. Build command: `npm install`
5. Start command: `npm start`
6. Agregar environment variables

## 📊 Costos Estimados

| Servicio | Costo Mensual | Notas |
|----------|---------------|-------|
| Anthropic API | $15-25 | Uso medio (~500k tokens) |
| SerpAPI | $0 | Tier gratis suficiente |
| Railway | $0-5 | Tier gratis para empezar |
| **TOTAL** | **$15-30** | vs Lovable $20-60+ |

## 🧪 Tests Rápidos

Una vez ejecutando, prueba desde el frontend `/free-chat`:

1. **Test Lectura**: "Lee el archivo package.json"
2. **Test Escritura**: "Crea un archivo test.txt con el texto 'Hello Freedom'"
3. **Test Listado**: "Lista todos los archivos en src/pages"
4. **Test Web**: "Busca información sobre Claude Sonnet 4"
5. **Test Comando**: "Ejecuta pwd"

## 🐛 Troubleshooting

**Error: ANTHROPIC_API_KEY not found**
- Verifica que `.env` existe y tiene la clave correcta
- Reinicia el servidor después de editar `.env`

**Error: Port 3001 already in use**
- Cambia `PORT=3002` en `.env`
- O mata el proceso: `lsof -ti:3001 | xargs kill`

**Error: File not found**
- Verifica que `PROJECT_ROOT` apunta al directorio correcto
- Usa rutas relativas desde la raíz del proyecto

## 📚 Próximos Pasos

1. **Agregar más herramientas**: git, database, deploy
2. **Streaming SSE**: Para respuestas en tiempo real
3. **Sistema de memoria**: Conectar con el RAG system
4. **Multi-agente**: Coordinar múltiples instancias de Claude

## 🆘 Soporte

- Logs del orchestrator: Se imprimen en consola
- Frontend logs: Abrir DevTools en `/free-chat`
- Documentación completa: `memoria/ORCHESTRATOR_CORE.md`
