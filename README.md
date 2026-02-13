# Sistema de Memoria Persistente

## 🧠 Visión General

Este proyecto implementa un **Sistema de Memoria Persistente** avanzado que utiliza embeddings vectoriales y búsqueda semántica para almacenar, recuperar y evolucionar conversaciones de manera inteligente.

### Características Principales

- 🔍 **Búsqueda Semántica** - Encuentra conversaciones por significado, no solo palabras clave
- 🧩 **Tracking de Conceptos** - Rastrea la evolución de ideas clave a través del tiempo
- 📊 **Milestones de Relación** - Marca momentos significativos y breakthroughs
- 💾 **Exportación de Snapshots** - Guarda estados completos de la memoria
- 🚀 **Vector Embeddings** - Usa OpenAI text-embedding-ada-002 (1536 dimensiones)

### Stack Tecnológico

- **Frontend**: React 18 + TypeScript + TanStack Query
- **Backend**: Supabase Edge Functions (Deno)
- **Base de Datos**: PostgreSQL 15 + pgvector
- **Embeddings**: OpenAI text-embedding-ada-002
- **UI**: shadcn/ui + Tailwind CSS

## 📚 Documentación Completa

### Guías Principales

- **[Sistema de Memoria](./memoria/README.md)** - Overview completo del sistema
- **[Configuración Inicial](./SETUP.md)** - Setup paso a paso del proyecto
- **[Arquitectura](./memoria/ARCHITECTURE.md)** - Diseño técnico y flujo de datos
- **[API Reference](./memoria/API.md)** - Documentación de Edge Functions
- **[Guía de Uso](./memoria/USAGE.md)** - Cómo usar el sistema
- **[Conceptos Clave](./memoria/CONCEPTS.md)** - Embeddings y búsqueda semántica
- **[Ejemplos](./memoria/EXAMPLES.md)** - Casos de uso con código
- **[Contribuir](./CONTRIBUTING.md)** - Cómo contribuir al proyecto

## 🚀 Quick Start

### Requisitos Previos

- Node.js 18+
- npm 8+
- Cuenta de Lovable
- API Key de OpenAI

### Instalación

```bash
# Clonar el repositorio
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Instalar dependencias
npm install

# Configurar variables de entorno (ver SETUP.md)
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar desarrollo
npm run dev
```

### Primer Uso

1. Navega a `/memory` en tu aplicación
2. Click en "Importar Conversación"
3. Se importará automáticamente una conversación de ejemplo
4. Prueba la búsqueda semántica escribiendo una pregunta

## Project info

**URL**: https://lovable.dev/projects/1af9d4dc-4ce9-45bc-9d80-e9307ff26d1e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1af9d4dc-4ce9-45bc-9d80-e9307ff26d1e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1af9d4dc-4ce9-45bc-9d80-e9307ff26d1e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
