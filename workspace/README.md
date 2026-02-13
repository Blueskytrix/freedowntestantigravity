# 🎨 Workspace - Zona Libre de Creación

Este directorio es la **zona de trabajo libre** donde el AI Orchestrator puede:
- ✅ Crear nuevos proyectos
- ✅ Modificar archivos
- ✅ Ejecutar comandos
- ✅ Experimentar sin límites

## Reglas de Protección

El resto de la app (`src/`, `backend-orchestrator/`, `supabase/`, `memoria/`) está **protegida** y el orchestrator solo puede leerla, no modificarla.

## Estructura Sugerida

```
workspace/
├── proyecto-1/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── experimento-react/
│   ├── package.json
│   ├── src/
│   └── ...
└── test-api/
    └── server.js
```

## Uso

Desde el Free Chat, puedes pedirle al AI que:

```
"Crea un nuevo proyecto HTML básico en workspace/mi-sitio/"
"Lista todos los proyectos en workspace/"
"Agrega un componente Button.jsx en workspace/mi-app/src/"
```

## ¿Por qué esta separación?

Esta arquitectura previene que el AI Orchestrator se modifique a sí mismo por accidente, lo cual podría:
- 🔴 Romper funcionalidades críticas
- 🔴 Entrar en bucles infinitos
- 🔴 Perder el sistema de memoria
- 🔴 Destruir el propio orchestrator

Con esta separación, el AI puede crear apps completas de forma segura mientras mantiene la estabilidad del sistema principal.
