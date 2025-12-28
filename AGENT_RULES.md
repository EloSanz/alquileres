# 🤖 Reglas para Programación Agentica (OBLIGATORIO)

**ESTE DOCUMENTO DEFINE LAS REGLAS EXACTAS que debes seguir para programar automáticamente.**

## 🚫 PROHIBICIONES ABSOLUTAS

### Backend - NUNCA uses:
- ❌ Express, NestJS, Fastify, Koa, Hapi
- ❌ Axios, Fetch nativo, Request, SuperAgent
- ❌ TypeORM, MikroORM, Sequelize (solo Prisma)
- ❌ Joi, Yup, Zod (solo TypeBox integrado en Elysia)
- ❌ Librerías de mapeo (class-transformer, automapper)
- ❌ Swagger codegen, OpenAPI generator
- ❌ Compartir entidades entre frontend/backend
- ❌ Implementaciones directas sin interfaces
- ❌ Librerías de validación externas

### Frontend - NUNCA uses:
- ❌ Axios, Fetch nativo, Request, SuperAgent
- ❌ Crear carpeta `/src/types/` (excepción: tipos compartidos mínimos)
- ❌ Duplicar DTOs manualmente
- ❌ OpenAPI generator, Swagger codegen
- ❌ Redux, Zustand, Jotai (solo Context API + useState)
- ❌ CSS Modules, styled-components (solo Material UI)

## ✅ OBLIGATORIO - SIN EXCEPCIONES

### Stack Mandatorio
```json
{
  "backend": {
    "framework": "elysia",
    "orm": "prisma",
    "database": "postgresql",
    "language": "typescript",
    "validation": "typebox",
    "auth": "jwt + @elysiajs/jwt"
  },
  "frontend": {
    "framework": "react + vite",
    "http_client": "@elysiajs/eden (treaty)",
    "ui": "material-ui",
    "language": "typescript",
    "state": "context api + custom hooks"
  }
}
```

### Package.json Obligatorio (Backend)
```json
{
  "name": "server",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "type-check": "tsc --noEmit --watch",
    "dev:full": "concurrently \"npm run dev\" \"npm run type-check\"",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "elysia": "^1.0.0",
    "@elysiajs/jwt": "^1.0.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "concurrently": "^8.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### Package.json Obligatorio (Frontend)
```json
{
  "name": "web",
  "scripts": {
    "dev": "vite",
    "type-check": "tsc --noEmit --watch",
    "dev:full": "concurrently \"npm run dev\" \"npm run type-check\"",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@mui/material": "^5.0.0",
    "@emotion/react": "^11.0.0",
    "@emotion/styled": "^11.0.0",
    "@elysiajs/eden": "^1.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0",
    "concurrently": "^8.0.0"
  }
}
```

## 🏗️ Estructura de Archivos OBLIGATORIA

### Backend Structure
```
server/
├── src/
│   ├── interfaces/
│   │   ├── services/
│   │   │   └── IUserService.ts
│   │   └── repositories/
│   │       └── IUserRepository.ts
│   ├── implementations/
│   │   ├── services/
│   │   │   └── UserService.ts
│   │   └── repositories/
│   │       └── PrismaUserRepository.ts
│   ├── entities/
│   │   └── User.entity.ts
│   ├── dtos/
│   │   └── user.dto.ts
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── routes/
│   │   └── user.routes.ts
│   ├── plugins/
│   │   ├── auth.plugin.ts
│   │   └── error.plugin.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

### Frontend Structure
```
web/
├── src/
│   ├── contexts/
│   │   └── ApiContext.tsx
│   ├── hooks/
│   │   └── useUsers.ts
│   ├── components/
│   │   └── UserList.tsx
│   ├── pages/
│   │   └── UsersPage.tsx
│   └── main.tsx
├── index.html
└── package.json
```

## 📝 Templates Exactos (COPIA Y PEGA)

### Backend - Entity Template
```typescript
// src/entities/User.entity.ts
export class UserEntity {
  constructor(
    public id: number | null,
    public username: string,
    public email: string,
    public password: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromPrisma(prismaData: any): UserEntity {
    return new UserEntity(
      prismaData.id,
      prismaData.username,
      prismaData.email,
      prismaData.password,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }

  toPrisma() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      password: this.password,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): UserDTO {
    return {
      id: this.id!,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  validate(): void {
    if (!this.username || this.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!this.email || !this.email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}
```

### Backend - Interface Template
```typescript
// src/interfaces/services/IUserService.ts
import { UserDTO, CreateUserDTO, UpdateUserDTO } from '../../dtos/user.dto';

export interface IUserService {
  getAllUsers(userId: number): Promise<UserDTO[]>;
  getUserById(id: number, requestingUserId: number): Promise<UserDTO>;
  createUser(data: CreateUserDTO, userId: number): Promise<UserDTO>;
  updateUser(id: number, data: UpdateUserDTO, requestingUserId: number): Promise<UserDTO>;
  deleteUser(id: number, requestingUserId: number): Promise<void>;
}
```

### Backend - Implementation Template
```typescript
// src/implementations/services/UserService.ts
import { IUserService } from '../../interfaces/services/IUserService';
import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { UserDTO, CreateUserDTO, UpdateUserDTO } from '../../dtos/user.dto';
import { UserEntity } from '../../entities/User.entity';
import bcrypt from 'bcryptjs';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getAllUsers(userId: number): Promise<UserDTO[]> {
    const entities = await this.userRepository.findAll({ userId });
    return entities.map(entity => entity.toDTO());
  }

  async getUserById(id: number, requestingUserId: number): Promise<UserDTO> {
    const entity = await this.userRepository.findById(id);
    if (!entity) throw new Error('User not found');
    if (entity.id !== requestingUserId) throw new Error('Access denied');
    return entity.toDTO();
  }

  async createUser(data: CreateUserDTO, userId: number): Promise<UserDTO> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new Error('Email already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const entity = new UserEntity(
      null, data.username, data.email, hashedPassword, new Date(), new Date()
    );
    entity.validate();

    const created = await this.userRepository.create(entity);
    return created.toDTO();
  }

  async updateUser(id: number, data: UpdateUserDTO, requestingUserId: number): Promise<UserDTO> {
    const entity = await this.userRepository.findById(id);
    if (!entity) throw new Error('User not found');
    if (entity.id !== requestingUserId) throw new Error('Access denied');

    if (data.username) entity.username = data.username;
    if (data.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing && existing.id !== id) throw new Error('Email already in use');
      entity.email = data.email;
    }
    entity.updatedAt = new Date();
    entity.validate();

    const updated = await this.userRepository.update(id, entity);
    return updated.toDTO();
  }

  async deleteUser(id: number, requestingUserId: number): Promise<void> {
    const entity = await this.userRepository.findById(id);
    if (!entity) throw new Error('User not found');
    if (entity.id !== requestingUserId) throw new Error('Access denied');
    await this.userRepository.delete(id);
  }
}
```

### Backend - Routes Template
```typescript
// src/routes/user.routes.ts
import { Elysia, t } from 'elysia';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../implementations/services/UserService';
import { PrismaUserRepository } from '../implementations/repositories/PrismaUserRepository';
import { authPlugin } from '../plugins/auth.plugin';

// Dependency injection
const userRepository = new PrismaUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// ⚠️ CRÍTICO: Los schemas de validación DEBEN incluir TODOS los campos del DTO
// Elysia FILTRA campos que no están en el schema, incluso si son opcionales
// Si agregas un campo al UpdateUserDTO, DEBES agregarlo aquí también
const updateUserBodySchema = t.Object({
  username: t.Optional(t.String({ minLength: 3, maxLength: 50 })),
  email: t.Optional(t.String({ format: 'email' })),
  // Si UpdateUserDTO tiene 'status', DEBES agregarlo aquí:
  // status: t.Optional(t.String())
});

export const userRoutes = new Elysia({ prefix: '/api/users' })
  .use(authPlugin)
  .get('/', userController.getAll, {
    detail: { tags: ['Users'], summary: 'Get all users' }
  })
  .get('/:id', userController.getById, {
    params: t.Object({ id: t.Numeric({ minimum: 1 }) }),
    detail: { tags: ['Users'], summary: 'Get user by ID' }
  })
  .post('/', userController.create, {
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 50 }),
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 })
    }),
    detail: { tags: ['Users'], summary: 'Create user' }
  })
  .put('/:id', userController.update, {
    params: t.Object({ id: t.Numeric({ minimum: 1 }) }),
    body: updateUserBodySchema, // Usar el schema definido arriba
    detail: { tags: ['Users'], summary: 'Update user' }
  })
  .delete('/:id', userController.delete, {
    params: t.Object({ id: t.Numeric({ minimum: 1 }) }),
    detail: { tags: ['Users'], summary: 'Delete user' }
  });
```

### Backend - Controller Template
```typescript
// src/controllers/user.controller.ts
import { IUserService } from '../interfaces/services/IUserService';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto';

interface AuthContext {
  userId: number;
}

export class UserController {
  constructor(private userService: IUserService) {}

  getAll = async ({ userId }: AuthContext) => ({
    success: true,
    message: 'Users retrieved successfully',
    data: await this.userService.getAllUsers(userId),
    timestamp: new Date().toISOString()
  });

  getById = async ({ params, userId }: AuthContext & { params: { id: number } }) => ({
    success: true,
    message: 'User retrieved successfully',
    data: await this.userService.getUserById(params.id, userId),
    timestamp: new Date().toISOString()
  });

  create = async ({ body, userId }: AuthContext & { body: CreateUserDTO }) => ({
    success: true,
    message: 'User created successfully',
    data: await this.userService.createUser(body, userId),
    timestamp: new Date().toISOString()
  });

  update = async ({
    params,
    body,
    userId
  }: AuthContext & { params: { id: number }, body: UpdateUserDTO }) => ({
    success: true,
    message: 'User updated successfully',
    data: await this.userService.updateUser(params.id, body, userId),
    timestamp: new Date().toISOString()
  });

  delete = async ({ params, userId }: AuthContext & { params: { id: number } }) => {
    await this.userService.deleteUser(params.id, userId);
    return {
      success: true,
      message: 'User deleted successfully',
      data: null,
      timestamp: new Date().toISOString()
    };
  };
}
```

### Backend - Plugins Template
```typescript
// src/plugins/auth.plugin.ts
import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';

export const authPlugin = new Elysia()
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))
  .derive(({ jwt, cookie: { auth } }) => ({
    getCurrentUser: async () => {
      const token = auth?.value;
      if (!token) throw new Error('No token provided');

      const payload = await jwt.verify(token);
      if (!payload) throw new Error('Invalid token');

      return { userId: payload.userId as number };
    }
  }));
```

```typescript
// src/plugins/error.plugin.ts
import { Elysia } from 'elysia';

export const errorPlugin = new Elysia()
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return {
          success: false,
          message: 'Validation error',
          statusCode: 400,
          errors: error.all,
          timestamp: new Date().toISOString()
        };
      case 'NOT_FOUND':
        set.status = 404;
        return {
          success: false,
          message: 'Not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        };
      default:
        set.status = 500;
        return {
          success: false,
          message: 'Internal server error',
          statusCode: 500,
          timestamp: new Date().toISOString()
        };
    }
  });
```

### Frontend - ApiContext Template
```typescript
// src/contexts/ApiContext.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { treaty } from '@elysiajs/eden';
import type { App } from '../../../server/src/index';

const ApiContext = createContext<ReturnType<typeof treaty<App>> | null>(null);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) throw new Error('useApi must be used within ApiProvider');
  return context;
};

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useMemo(() => {
    const client = treaty<App>(import.meta.env.VITE_API_URL || 'http://localhost:3000');

    return new Proxy(client, {
      get(target, prop) {
        const original = target[prop as keyof typeof target];
        if (typeof original === 'function' || typeof original === 'object') {
          return new Proxy(original as any, {
            get(methodTarget, methodProp) {
              const method = methodTarget[methodProp];
              if (typeof method === 'function') {
                return async (...args: any[]) => {
                  const token = localStorage.getItem('token');
                  const headers = token ? { Authorization: `Bearer ${token}` } : {};

                  const lastArg = args[args.length - 1];
                  if (typeof lastArg === 'object' && lastArg !== null) {
                    args[args.length - 1] = {
                      ...lastArg,
                      headers: { ...lastArg.headers, ...headers }
                    };
                  } else {
                    args.push({ headers });
                  }

                  try {
                    return await method(...args);
                  } catch (error: any) {
                    if (error?.status === 401) {
                      localStorage.removeItem('token');
                      window.location.href = '/login';
                    }
                    throw error;
                  }
                };
              }
              return method;
            }
          });
        }
        return original;
      }
    });
  }, []);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};
```

### Frontend - Custom Hook Template
```typescript
// src/hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import { UserDTO } from '../types/user.types';

export const useUsers = () => {
  const { users } = useApi();
  const [userList, setUserList] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await users.get();
      setUserList(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users: userList, loading, error, refetch: fetchUsers };
};
```

## ⚙️ Configuración Obligatoria

### TypeScript Config (Backend)
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### TypeScript Config (Frontend)
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Vite Config
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

### Environment Variables
```env
# .env (Backend)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# .env (Frontend)
VITE_API_URL="http://localhost:3000"
```

## 🔧 Scripts de Setup Automáticos

### Setup Backend
```bash
#!/bin/bash
# setup-backend.sh

# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

echo "✅ Backend setup complete"
```

### Setup Frontend
```bash
#!/bin/bash
# setup-frontend.sh

# Instalar dependencias
npm install

echo "✅ Frontend setup complete"
```

## ⚠️ LECCIONES APRENDIDAS - CRÍTICO

### 1. Validación de Schemas en Elysia (MUY IMPORTANTE)

**PROBLEMA COMÚN**: Campos opcionales no llegan al controller aunque se envíen desde el frontend.

**CAUSA**: Elysia valida el body contra el schema de TypeBox y **FILTRA campos que no están definidos**, incluso si son opcionales.

**SOLUCIÓN OBLIGATORIA**:
```typescript
// ❌ INCORRECTO - Si UpdatePaymentDTO tiene 'status', pero no está en el schema:
const updatePaymentBodySchema = t.Object({
  amount: t.Optional(t.Number()),
  paymentDate: t.Optional(t.String())
  // status NO está aquí → Elysia lo FILTRA aunque se envíe desde frontend
});

// ✅ CORRECTO - Incluir TODOS los campos del DTO, incluso opcionales:
const updatePaymentBodySchema = t.Object({
  amount: t.Optional(t.Number()),
  paymentDate: t.Optional(t.String()),
  status: t.Optional(t.String()) // ✅ DEBE estar aquí
});
```

**REGLA DE ORO**: 
- Si agregas un campo a `UpdateXDTO`, **DEBES agregarlo al schema de validación**.
- Si el campo es opcional en el DTO, usa `t.Optional()` en el schema.
- **Siempre verifica que el schema incluya TODOS los campos del DTO**.

### 2. Sincronización Schema ↔ DTO

**CHECKLIST OBLIGATORIO**:
```bash
# Después de modificar un DTO, verificar sincronización:
# 1. Revisar UpdateXDTO en shared/types/X.ts
# 2. Verificar que updateXBodySchema en server/src/routes/X.routes.ts incluya TODOS los campos
# 3. Si falta un campo, agregarlo con t.Optional() si es opcional
```

### 3. Debugging y Logs

**CUANDO DEBUGGEAR**:
- Si un campo no se actualiza aunque se envíe desde frontend
- Si el backend recibe `undefined` para un campo que debería tener valor
- Si hay discrepancias entre frontend y backend

**PUNTOS DE LOG OBLIGATORIOS**:
```typescript
// Frontend - Service
console.log('[Service] Payload enviado:', { payload, keys: Object.keys(payload) });

// Backend - Controller
logInfo('[Controller] Body recibido:', { body, bodyKeys: Object.keys(body || {}) });

// Backend - Entity
logInfo('[Entity] Update data:', { data, statusInData: data?.status });
```

### 4. Flujo Completo de Actualización

**VERIFICAR EN ORDEN**:
1. ✅ Frontend: `UpdatePayment.toJSON()` incluye el campo
2. ✅ Frontend Service: Payload enviado incluye el campo
3. ✅ Backend Route: Schema de validación incluye el campo
4. ✅ Backend Controller: Body recibido incluye el campo
5. ✅ Backend Service: DTO recibido incluye el campo
6. ✅ Backend Entity: `update()` procesa el campo
7. ✅ Database: Campo se guarda correctamente
8. ✅ Response: Campo se devuelve al frontend

## ✅ Checklist de Validación

### Backend
- [ ] `export type App = typeof app` existe en `src/index.ts`
- [ ] Todas las Services tienen interface (`I*Service.ts`)
- [ ] Todas las Repositories tienen interface (`I*Repository.ts`)
- [ ] Todas las Entities tienen `toDTO()`, `fromPrisma()`, `toPrisma()`, `validate()`
- [ ] Todas las rutas usan TypeBox para validación
- [ ] **Schemas de validación incluyen TODOS los campos de los DTOs (incluso opcionales)**
- [ ] **Si modificas un DTO, actualizas el schema correspondiente**
- [ ] `npm run dev:full` funciona (dev + type-check simultáneo)
- [ ] NO usa Express, Axios, o librerías prohibidas

### Frontend
- [ ] Usa `treaty<App>` de `@elysiajs/eden`
- [ ] Importa tipos desde backend: `import type { App } from '../../../server/src/index'`
- [ ] NO tiene carpeta `/src/types/` (excepto tipos compartidos mínimos)
- [ ] Usa Material UI para UI
- [ ] Usa Context API + custom hooks para state
- [ ] `npm run dev:full` funciona (dev + type-check simultáneo)

## 🚀 Comandos de Desarrollo

```bash
# Backend
cd server
npm run dev:full      # Dev + type-check simultáneo

# Frontend
cd web
npm run dev:full      # Dev + type-check simultáneo

# Ambos simultáneamente (desde raíz)
npm run dev           # concurrently ejecuta ambos dev:full
```

**SI NO SIGUES ESTAS REGLAS EXACTAS, EL CÓDIGO NO COMPILARÁ Y NO FUNCIONARÁ.**

**COPIA Y PEGA LOS TEMPLATES. NO IMPROVISES.**
