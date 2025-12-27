
---

## 🤖 Programación Agentica - Reglas Obligatorias

Este proyecto sigue un **estándar de arquitectura estrictamente definido** para programación agentica. **NO hay alternativas ni excepciones.**

### 📚 Documentación Jerárquica

**Nivel 1 - REGLAS PARA AGENTES** (OBLIGATORIO leer primero):
- 🤖 **[AGENT_RULES.md](./AGENT_RULES.md)** - Reglas completas con templates copy/paste

**Nivel 2 - Referencia Rápida**:
- ⚡ **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Comandos, patrones, troubleshooting

**Nivel 3 - Arquitectura Completa**:
- 📖 **[ARCHITECTURE_STANDARD.md](./ARCHITECTURE_STANDARD.md)** - Estándar detallado

**Nivel 4 - Templates Concretos**:
- 📁 **[templates/](./templates/)** - Archivos listos para copiar

**Nivel 5 - Base de Datos**:
- 🗄️ **[docs/PRISMA_COMMANDS.md](./docs/PRISMA_COMMANDS.md)** - Guía completa de comandos Prisma

### 🚫 PROHIBICIONES ABSOLUTAS

#### Backend - NUNCA uses:
- ❌ Express, NestJS, Fastify
- ❌ Axios, Fetch, Joi, Yup, Zod
- ❌ TypeORM, MikroORM, Sequelize
- ❌ Librerías de mapeo automático

#### Frontend - NUNCA uses:
- ❌ Axios, Fetch nativo, Eden Fetch
- ❌ Carpeta `/src/types/` (excepto mínimos)
- ❌ Redux, Zustand, Jotai
- ❌ CSS Modules, styled-components

### ✅ STACK OBLIGATORIO

- **Backend**: Elysia + Prisma + PostgreSQL + TypeScript
- **Frontend**: React + Vite + Eden Treaty + Material UI + TypeScript
- **Type-Safety**: Eden Treaty (inferencia automática end-to-end)

### 👑 USUARIO ADMIN PRINCIPAL

**Credenciales del usuario administrador principal:**
- **Usuario**: `admin`
- **Email**: `admin@alquileres.com`
- **Contraseña**: `admin123`

**Nota**: Este usuario tiene acceso completo a todos los recursos del sistema y se crea automáticamente en cada seed.

### 📋 CHECKLIST DE CUMPLIMIENTO

```bash
# Backend
[ ] export type App = typeof app en src/index.ts
[ ] grep -r "interface I.*Service" src/interfaces/
[ ] grep -r "interface I.*Repository" src/interfaces/
[ ] grep -r "toDTO()" src/entities/
[ ] npm run dev:full funciona

# Frontend
[ ] treaty<App> de @elysiajs/eden
[ ] import type { App } from '../../../server/src/index'
[ ] NO carpeta src/types/
[ ] npm run dev:full funciona
```

### 🚀 SETUP AUTOMÁTICO

Los scripts de setup están disponibles localmente (no incluidos en el repositorio):

```bash
# Setup completo (ejecutar después de clonar)
./setup.sh

# Desarrollo simultáneo
npm run dev  # Backend + Frontend
```

**Nota**: Los archivos `setup.sh`, `setup-backend.sh` y `setup-frontend.sh` están excluidos del repositorio por seguridad. Se generan automáticamente durante el desarrollo inicial.

---

# ✅ Sistema de Gestión de Alquileres

**🚀 APLICACIÓN PROBADA Y FUNCIONANDO** - Backend y Frontend levantados exitosamente

Aplicación Full Stack para administradores de propiedades que necesitan gestionar:

- 👥 **Información de Inquilinos** (datos personales, contacto, historial)
- 💰 **Pagos y Cobranzas** (registro de pagos, deudas, facturación)
- 🏠 **Propiedades** (información de inmuebles, contratos de alquiler)

### 🎯 Estado Actual

- ✅ **Backend**: Elysia.js corriendo en `http://localhost:4000`
- ✅ **Frontend**: React + Vite corriendo en `http://localhost:4001`
- ✅ **API Endpoints**: Funcionando (`/api/tenants`, `/api/users`)
- ✅ **Type Safety**: Eden Treaty configurado correctamente
- ✅ **Base de Datos**: Prisma schema definido (requiere PostgreSQL)
- ✅ **Documentación**: Comandos Prisma completos en `docs/PRISMA_COMMANDS.md`

## Arquitectura

### Backend
- **Framework**: Elysia.js (TypeScript)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT con plugins de Elysia
- **Validación**: TypeBox (integrado en Elysia)

### Frontend
- **Framework**: React + Vite
- **HTTP Client**: Eden Treaty (inferencia automática de tipos)
- **UI**: Material UI
- **State**: Context API + Custom Hooks

### Type-Safety
- Eden Treaty para comunicación end-to-end type-safe
- Type-checking continuo en desarrollo
- Interfaces obligatorias para Services y Repositories

## Requisitos Previos

- Node.js 18+
- PostgreSQL
- Git

## Instalación y Configuración

### 1. Clonar y configurar

```bash
git clone <url-del-repo>
cd alquileres-app

# Instalar dependencias
npm install
```

### 2. Configurar Base de Datos

Crear base de datos PostgreSQL y configurar variables de entorno:

```bash
# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/alquileres_db"
JWT_SECRET="tu_jwt_secret_muy_seguro"
```

### 3. Ejecutar Migraciones

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy
```

### 4. Levantar la aplicación

```bash
# Terminal 1: Backend
npm run dev:full

# Terminal 2: Frontend
cd web && npm run dev:full
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:4001
- **Backend API**: http://localhost:4000

## Desarrollo

### Comandos disponibles

```bash
# Backend
npm run dev          # Hot reload
npm run type-check   # Type checking continuo
npm run dev:full     # Dev + type-check simultáneo

# Frontend (desde carpeta web/)
npm run dev          # Hot reload
npm run type-check   # Type checking continuo
npm run dev:full     # Dev + type-check simultáneo
```

### Estructura del Proyecto

```
alquileres-app/
├── server/                 # Backend (Elysia)
│   ├── src/
│   │   ├── interfaces/     # Contratos (IUserService, etc.)
│   │   ├── implementations/# Implementaciones concretas
│   │   ├── entities/       # Modelo de dominio
│   │   ├── controllers/    # Controladores
│   │   ├── routes/         # Rutas Elysia
│   │   ├── plugins/        # Auth, errores
│   │   └── index.ts        # Export type App
│   └── prisma/
│       └── schema.prisma   # Esquema BD
└── web/                   # Frontend (React)
    └── src/
        ├── contexts/      # ApiContext (Eden Treaty)
        ├── hooks/         # Custom hooks
        ├── components/    # Componentes UI
        └── pages/         # Páginas
```

## Características Principales

### Gestión de Inquilinos
- CRUD completo de inquilinos
- Información personal y de contacto
- Historial de alquileres
- Estado de pagos

### Sistema de Pagos
- Registro de pagos realizados
- Seguimiento de deudas pendientes
- Generación de recibos
- Alertas de vencimientos

### Administración de Propiedades
- Catálogo de inmuebles
- Información detallada de propiedades
- Contratos asociados
- Estado de disponibilidad

### Dashboard Administrativo
- Vista general del negocio
- Reportes de ingresos
- Estadísticas de ocupación
- Gestión de usuarios administradores

## API Endpoints

### Inquilinos
- `GET /api/tenants` - Listar inquilinos
- `POST /api/tenants` - Crear inquilino
- `GET /api/tenants/:id` - Obtener inquilino
- `PUT /api/tenants/:id` - Actualizar inquilino
- `DELETE /api/tenants/:id` - Eliminar inquilino

### Pagos
- `GET /api/payments` - Listar pagos
- `POST /api/payments` - Registrar pago
- `GET /api/payments/:id` - Obtener pago
- `PUT /api/payments/:id` - Actualizar pago

### Propiedades
- `GET /api/properties` - Listar propiedades
- `POST /api/properties` - Crear propiedad
- `GET /api/properties/:id` - Obtener propiedad
- `PUT /api/properties/:id` - Actualizar propiedad

## Type Safety

Esta aplicación implementa **type safety end-to-end**:

- Backend define contratos con TypeScript
- Frontend infiere tipos automáticamente vía Eden Treaty
- Validación automática de requests/responses
- Type checking continuo durante desarrollo
- Interfaces obligatorias para mantener consistencia

## Documentación de Arquitectura

Para entender completamente el estándar de arquitectura implementado:

- 📋 [.cursorrules](./.cursorrules) - Reglas rápidas (1 página)
- 📖 [ARCHITECTURE_STANDARD.md](./ARCHITECTURE_STANDARD.md) - Estándar completo
- ⚡ [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Referencia técnica
