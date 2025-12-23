# Estándar de Arquitectura Full Stack (OBLIGATORIO)

Este documento define el **estándar MANDATORIO de arquitectura** para todos los proyectos Full Stack.

**Stack Obligatorio:**
- **Backend**: Node.js + Elysia + Prisma + PostgreSQL + TypeScript
- **Frontend**: React + Vite + Eden Treaty + TypeScript
- **Type-Safety**: Eden Treaty (inferencia automática end-to-end)
- **Arquitectura**: Interfaces + Inversión de Dependencias + Capas

**NO uses alternativas**: Express, Axios, Duplicación manual de DTOs, Swagger codegen, etc.

## ⚠️ Antes de Continuar

**Este estándar NO ES NEGOCIABLE.**

Si tu proyecto no puede cumplir con:
- Backend en Elysia
- Frontend con Eden Treaty
- Interfaces obligatorias
- Type-checking continuo

**Entonces DETENTE AQUÍ. Este estándar NO es para ti. Define uno diferente.**

No intentes adaptar, modificar o hacer excepciones. Este estándar funciona COMPLETO o no se usa.

---

## 📋 Tabla de Contenidos

1. [Principios de Arquitectura](#principios-de-arquitectura)
2. [Flujo de Datos](#flujo-de-datos)
3. [Contrato de API (DTOs)](#contrato-de-api-dtos)
4. [Arquitectura Backend](#arquitectura-backend)
5. [Arquitectura Frontend](#arquitectura-frontend)
6. [Ejemplo Completo](#ejemplo-completo)

---

## 🎯 Principios de Arquitectura

### 1. **Separación de Concerns**
- Frontend y Backend son **agnósticos** entre sí
- Se comunican únicamente a través de **DTOs** (Data Transfer Objects)
- Cada capa tiene responsabilidades bien definidas

### 2. **Inversión de Dependencias (SOLID)**
- Backend usa **interfaces** para Services y Repositories
- Implementaciones concretas dependen de abstracciones
- Facilita testing y cambio de implementaciones

### 3. **Single Source of Truth**
- Los **DTOs** definen el contrato de comunicación
- TypeScript garantiza type-safety en ambos lados
- Validación en frontend (UX) y backend (seguridad)

---

## 🔄 Flujo de Datos

### Backend: Request → Response

```
┌─────────────────────────────────────────────────────────┐
│                    BACKEND FLOW                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Router (Elysia)                                    │
│     ├─ Define endpoints                                │
│     ├─ Valida DTOs con TypeBox                        │
│     └─ Llama al Controller                            │
│           ↓                                            │
│  2. Controller                                         │
│     ├─ Recibe DTO validado                            │
│     ├─ Llama al Service (interface)                   │
│     └─ Formatea respuesta                             │
│           ↓                                            │
│  3. Service (interface + implementation)               │
│     ├─ Lógica de negocio                             │
│     ├─ Llama a Repository (interface)                │
│     └─ Orquesta operaciones complejas                │
│           ↓                                            │
│  4. Repository (interface + implementation)            │
│     ├─ Acceso a base de datos                        │
│     ├─ Trabaja con Entities                          │
│     └─ Convierte Entity → DTO                        │
│           ↓                                            │
│  5. Entity (Domain Model)                             │
│     ├─ Modelo de dominio puro                        │
│     ├─ Mapea con Prisma                              │
│     └─ Contiene lógica de validación de dominio     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Frontend: User → API → UI

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND FLOW                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User Interaction                                   │
│     └─ Evento de UI                                   │
│           ↓                                            │
│  2. Component                                          │
│     ├─ Maneja evento                                  │
│     ├─ Llama custom hook (opcional)                   │
│     └─ Usa ApiContext                                 │
│           ↓                                            │
│  3. ApiContext (Client)                               │
│     ├─ Envía DTO al backend                          │
│     ├─ Interceptor agrega auth                       │
│     └─ Maneja errores globalmente                    │
│           ↓                                            │
│  4. Backend API                                        │
│     └─ Procesa request                                │
│           ↓                                            │
│  5. Response Processing                                │
│     ├─ Recibe DTO del backend                        │
│     ├─ Actualiza estado local                        │
│     └─ Re-renderiza UI                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 Contrato de API (DTOs)

### Arquitectura de Entidades (MANDATORIO)

**Regla absoluta: Entidades separadas, NUNCA compartidas**

- **Backend**: `Entity` (dominio) mapea con Prisma y genera `DTO` para API
- **Frontend**: NO tiene entidades, solo consume tipos inferidos vía Eden Treaty
- **Mapeo**: Manual en el backend con métodos `entity.toDTO()`

```
Backend:  Prisma → Entity → DTO → API
Frontend: Eden Treaty infiere tipos automáticamente (sin DTOs manuales)
```

**Prohibido:**
- ❌ Compartir entidades entre frontend y backend
- ❌ Usar librerías de mapeo automático (`class-transformer`, `automapper-ts`)
- ❌ Duplicar DTOs manualmente
- ❌ Usar Swagger codegen

**Obligatorio:**
- ✅ Backend define entities y las convierte a DTOs
- ✅ Frontend usa Eden Treaty para inferir tipos del backend
- ✅ Mapeo manual explícito en entities (`toDTO()`, `fromPrisma()`, `toPrisma()`)

### Type-Safety con Eden Treaty (ÚNICO MÉTODO)

El frontend NO define DTOs manualmente. Los tipos se infieren automáticamente desde el backend usando Eden Treaty.

#### **Respuesta Exitosa**

```typescript
interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}
```

#### **Respuesta de Lista**

```typescript
interface ListResponse<T> {
  success: true;
  message: string;
  data: T[];
  count: number;
  timestamp: string;
}
```

#### **Respuesta de Error**

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: string[];
  timestamp: string;
}
```

### DTOs de Dominio

Cada recurso define sus DTOs:

```typescript
// shared/dtos/user.dto.ts (puede estar en backend, frontend, o ambos)

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
}
```

---

## 🏗️ Arquitectura Backend

### Estructura de Capas con Interfaces

```
src/
├── interfaces/              # ← Interfaces (contratos)
│   ├── services/
│   │   └── IUserService.ts
│   └── repositories/
│       └── IUserRepository.ts
├── implementations/         # ← Implementaciones concretas
│   ├── services/
│   │   └── UserService.ts
│   └── repositories/
│       └── PrismaUserRepository.ts
├── entities/               # ← Modelos de dominio
│   └── User.entity.ts
├── dtos/                   # ← Data Transfer Objects
│   └── user.dto.ts
├── controllers/            # ← Controladores
│   └── user.controller.ts
├── routes/                 # ← Rutas
│   └── user.routes.ts
└── plugins/                # ← Plugins (auth, errors)
    ├── auth.plugin.ts
    └── error.plugin.ts
```

### 1. DTOs (Contrato de API)

```typescript
// src/dtos/user.dto.ts
export interface UserDTO {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
}
```

### 2. Entities (Modelo de Dominio)

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

  // Mapeo desde Prisma
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

  // Mapeo hacia Prisma
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

  // Mapeo hacia DTO (sin password)
  toDTO(): UserDTO {
    return {
      id: this.id!,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  // Validación de dominio
  validate(): void {
    if (!this.username || this.username.trim().length < 3) {
      throw new Error('Username debe tener al menos 3 caracteres');
    }
    if (!this.email || !this.email.includes('@')) {
      throw new Error('Email inválido');
    }
  }
}
```

### 3. Repository Interface

```typescript
// src/interfaces/repositories/IUserRepository.ts
import { UserEntity } from '../../entities/User.entity';

export interface IUserRepository {
  findAll(filter?: any): Promise<UserEntity[]>;
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  update(id: number, user: UserEntity): Promise<UserEntity>;
  delete(id: number): Promise<void>;
}
```

### 4. Repository Implementation

```typescript
// src/implementations/repositories/PrismaUserRepository.ts
import prisma from '../../config/database';
import { UserEntity } from '../../entities/User.entity';
import { IUserRepository } from '../../interfaces/repositories/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  async findAll(filter: any = {}): Promise<UserEntity[]> {
    const users = await prisma.user.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });
    return users.map(user => UserEntity.fromPrisma(user));
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const data = user.toPrisma();
    delete (data as any).id;
    const created = await prisma.user.create({ data });
    return UserEntity.fromPrisma(created);
  }

  async update(id: number, user: UserEntity): Promise<UserEntity> {
    const data = user.toPrisma();
    delete (data as any).id;
    delete (data as any).createdAt;
    const updated = await prisma.user.update({ where: { id }, data });
    return UserEntity.fromPrisma(updated);
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
```

### 5. Service Interface

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

### 6. Service Implementation

```typescript
// src/implementations/services/UserService.ts
import { IUserService } from '../../interfaces/services/IUserService';
import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { UserDTO, CreateUserDTO, UpdateUserDTO } from '../../dtos/user.dto';
import { UserEntity } from '../../entities/User.entity';
import { NotFoundError, ForbiddenError } from '../../utils/custom.errors';
import bcrypt from 'bcryptjs';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getAllUsers(userId: number): Promise<UserDTO[]> {
    const entities = await this.userRepository.findAll({ userId });
    return entities.map(entity => entity.toDTO());
  }

  async getUserById(id: number, requestingUserId: number): Promise<UserDTO> {
    const entity = await this.userRepository.findById(id);
    
    if (!entity) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Lógica de negocio: verificar permisos
    if (entity.id !== requestingUserId) {
      throw new ForbiddenError('No tienes permiso para ver este usuario');
    }

    return entity.toDTO();
  }

  async createUser(data: CreateUserDTO, userId: number): Promise<UserDTO> {
    // Lógica de negocio: validar email único
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('El email ya está registrado');
    }

    // Hash de password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear entidad
    const entity = new UserEntity(
      null,
      data.username,
      data.email,
      hashedPassword,
      new Date(),
      new Date()
    );

    // Validar dominio
    entity.validate();

    // Crear en DB
    const created = await this.userRepository.create(entity);
    return created.toDTO();
  }

  async updateUser(
    id: number, 
    data: UpdateUserDTO, 
    requestingUserId: number
  ): Promise<UserDTO> {
    const entity = await this.userRepository.findById(id);
    
    if (!entity) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (entity.id !== requestingUserId) {
      throw new ForbiddenError('No tienes permiso para modificar este usuario');
    }

    // Actualizar campos
    if (data.username) entity.username = data.username;
    if (data.email) {
      // Validar email único
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new Error('El email ya está en uso');
      }
      entity.email = data.email;
    }

    entity.updatedAt = new Date();
    entity.validate();

    const updated = await this.userRepository.update(id, entity);
    return updated.toDTO();
  }

  async deleteUser(id: number, requestingUserId: number): Promise<void> {
    const entity = await this.userRepository.findById(id);
    
    if (!entity) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (entity.id !== requestingUserId) {
      throw new ForbiddenError('No tienes permiso para eliminar este usuario');
    }

    await this.userRepository.delete(id);
  }
}
```

### 7. Controller

```typescript
// src/controllers/user.controller.ts
import { IUserService } from '../interfaces/services/IUserService';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto';

interface AuthContext {
  userId: number;
}

export class UserController {
  constructor(private userService: IUserService) {}

  getAll = async ({ userId }: AuthContext) => {
    const users = await this.userService.getAllUsers(userId);
    return {
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: users,
      count: users.length,
      timestamp: new Date().toISOString()
    };
  };

  getById = async ({ params, userId }: AuthContext & { params: { id: number } }) => {
    const user = await this.userService.getUserById(params.id, userId);
    return {
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: user,
      timestamp: new Date().toISOString()
    };
  };

  create = async ({ body, userId }: AuthContext & { body: CreateUserDTO }) => {
    const user = await this.userService.createUser(body, userId);
    return {
      success: true,
      message: 'Usuario creado exitosamente',
      data: user,
      timestamp: new Date().toISOString()
    };
  };

  update = async ({ 
    params, 
    body, 
    userId 
  }: AuthContext & { params: { id: number }, body: UpdateUserDTO }) => {
    const user = await this.userService.updateUser(params.id, body, userId);
    return {
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user,
      timestamp: new Date().toISOString()
    };
  };

  delete = async ({ params, userId }: AuthContext & { params: { id: number } }) => {
    await this.userService.deleteUser(params.id, userId);
    return {
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: null,
      timestamp: new Date().toISOString()
    };
  };
}
```

### 8. Routes (Inyección de Dependencias)

```typescript
// src/routes/user.routes.ts
import { Elysia, t } from 'elysia';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../implementations/services/UserService';
import { PrismaUserRepository } from '../implementations/repositories/PrismaUserRepository';
import { authPlugin } from '../plugins/auth.plugin';

// Inyección de dependencias manual
const userRepository = new PrismaUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export const userRoutes = new Elysia({ prefix: '/api/users' })
  .use(authPlugin)
  .get('/', userController.getAll, {
    detail: {
      tags: ['Users'],
      summary: 'Obtener todos los usuarios'
    }
  })
  .get('/:id', userController.getById, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Users'],
      summary: 'Obtener usuario por ID'
    }
  })
  .post('/', userController.create, {
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 50 }),
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 })
    }),
    detail: {
      tags: ['Users'],
      summary: 'Crear nuevo usuario'
    }
  })
  .put('/:id', userController.update, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    body: t.Object({
      username: t.Optional(t.String({ minLength: 3, maxLength: 50 })),
      email: t.Optional(t.String({ format: 'email' }))
    }),
    detail: {
      tags: ['Users'],
      summary: 'Actualizar usuario'
    }
  })
  .delete('/:id', userController.delete, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Users'],
      summary: 'Eliminar usuario'
    }
  });
```

---

## 🎨 Arquitectura Frontend

### Estructura

```
src/
├── types/                  # ← DTOs (contratos con backend)
│   ├── api.types.ts
│   └── user.types.ts
├── contexts/              # ← Context API
│   ├── ApiContext.tsx
│   └── AuthContext.tsx
├── hooks/                 # ← Custom hooks
│   └── useUsers.ts
├── components/            # ← Componentes UI
│   └── UserList.tsx
└── pages/                 # ← Páginas
    └── UsersPage.tsx
```

### 1. Types (DTOs)

```typescript
// src/types/api.types.ts
export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

export interface ListResponse<T> {
  success: true;
  message: string;
  data: T[];
  count: number;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: string[];
  timestamp: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ListResponse<T> | ErrorResponse;
```

```typescript
// src/types/user.types.ts
export interface UserDTO {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
}
```

### 2. ApiContext (Cliente con Eden Treaty)

```typescript
// src/contexts/ApiContext.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { treaty } from '@elysiajs/eden';
import type { App } from '../../../server/src/index'; // ← Importa tipo del backend

const ApiContext = createContext<ReturnType<typeof treaty<App>> | null>(null);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  // Crear cliente Eden Treaty
  const api = useMemo(() => {
    const client = treaty<App>(import.meta.env.VITE_API_URL || 'http://localhost:3000');
    
    // Wrapper para agregar token automáticamente
    return new Proxy(client, {
      get(target, prop) {
        const original = target[prop as keyof typeof target];
        
        // Si es un método de API, intercepta para agregar headers
        if (typeof original === 'function' || typeof original === 'object') {
          return new Proxy(original as any, {
            get(methodTarget, methodProp) {
              const method = methodTarget[methodProp];
              
              if (typeof method === 'function') {
                return async (...args: any[]) => {
                  const token = localStorage.getItem('token');
                  const headers = token ? { Authorization: `Bearer ${token}` } : {};
                  
                  // Agregar headers al request
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
                    // Manejo de error 401
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

**Uso en componentes:**

```typescript
// src/components/UserList.tsx
import { useApi } from '../contexts/ApiContext';

export const UserList = () => {
  const api = useApi();
  
  const fetchUsers = async () => {
    // ✅ Type-safe! TypeScript conoce la estructura de la respuesta
    const { data, error } = await api.users.get();
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log(data); // tipo inferido del backend
  };
  
  const createUser = async () => {
    // ✅ TypeScript valida el body según el schema del backend
    const { data, error } = await api.users.post({
      username: 'john',
      email: 'john@example.com',
      password: '123456'
    });
    
    if (error) {
      console.error('Error:', error.value); // error.value contiene el mensaje
      return;
    }
    
    console.log('Usuario creado:', data);
  };
  
  return <div>...</div>;
};
```

### 3. Custom Hook

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
      const response = await users.getAll();
      setUserList(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users: userList,
    loading,
    error,
    refetch: fetchUsers
  };
};
```

---

## 📝 Ejemplo Completo: Flujo de Creación de Usuario

### 1. Frontend: Formulario

```tsx
// src/components/CreateUserForm.tsx
import React, { useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import { CreateUserDTO } from '../types/user.types';

export const CreateUserForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { users } = useApi();
  const [formData, setFormData] = useState<CreateUserDTO>({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await users.create(formData);
      console.log('Usuario creado:', response.data.data);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear usuario');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Crear Usuario</button>
    </form>
  );
};
```

### 2. Backend: Procesamiento

```
POST /api/users
Body: { username: "john", email: "john@example.com", password: "123456" }
      ↓
Router valida con TypeBox (CreateUserDTO)
      ↓
Controller.create({ body: validatedDTO, userId: 1 })
      ↓
Service.createUser(validatedDTO, 1)
  ├─ Valida email único (Repository)
  ├─ Hash de password
  ├─ Crea UserEntity
  ├─ Valida dominio (entity.validate())
  ├─ Guarda en DB (Repository.create)
  └─ Retorna DTO (entity.toDTO())
      ↓
Controller formatea respuesta
      ↓
Response: {
  success: true,
  message: "Usuario creado exitosamente",
  data: { id: 1, username: "john", email: "john@example.com", ... },
  timestamp: "2025-12-23T..."
}
```

---

## ✅ Beneficios de esta Arquitectura

### Backend

1. **Inversión de Dependencias**: Interfaces permiten cambiar implementaciones sin afectar lógica
2. **Testeable**: Mock de interfaces es trivial
3. **Escalable**: Fácil agregar nuevas implementaciones (Redis, MongoDB, etc.)
4. **Separación Clara**: Cada capa tiene una responsabilidad única

### Frontend

1. **Type Safety**: TypeScript garantiza contratos con backend
2. **Desacoplado**: No depende de implementación del backend
3. **Reutilizable**: Custom hooks encapsulan lógica de API
4. **Mantenible**: Cambios en API solo afectan ApiContext

### Full Stack

1. **Contrato Claro**: DTOs definen comunicación
2. **Agnósticos**: Frontend y Backend independientes
3. **Versionable**: DTOs pueden versionarse fácilmente
4. **Documentado**: Swagger automático desde DTOs

---

## 🔄 Type Safety End-to-End con Eden (MANDATORIO)

### **Eden Treaty: Único Método de Comunicación Frontend-Backend**

**Eden** es la solución oficial de Elysia para comunicación **type-safe** entre frontend y backend **sin necesidad de generar código ni duplicar DTOs**.

#### ¿Qué es Eden?

- 📦 Cliente ligero (~2 KB) para TypeScript
- 🔗 RPC-like bridge con inferencia automática de tipos
- 🚀 Sin code-gen, solo inferencia TypeScript
- ✅ Type-safety completo end-to-end
- 🎯 Dos variantes: **Eden Treaty** (recomendado) y **Eden Fetch**

#### Cómo Funciona

1. **Backend**: Exporta el tipo de la aplicación Elysia

```typescript
// server/src/index.ts
import { Elysia, t } from 'elysia';

export const app = new Elysia()
  .get('/', () => 'Hello!')
  .get('/user/:id', ({ params }) => ({ 
    id: params.id, 
    name: 'John' 
  }))
  .post('/user', ({ body }) => body, {
    body: t.Object({
      username: t.String({ minLength: 3 }),
      email: t.String({ format: 'email' })
    })
  })
  .listen(3000);

// ← ¡Esto es lo único que necesitas! Exporta el tipo
export type App = typeof app;
```

2. **Frontend**: Importa el tipo y usa Eden Treaty

```typescript
// web/src/contexts/ApiContext.tsx
import { treaty } from '@elysiajs/eden';
import type { App } from '../../../server/src/index'; // ← Importa el tipo

// Crea el cliente type-safe
const api = treaty<App>('http://localhost:3000');

// ¡Ahora tienes autocompletado y type-safety completo!
const { data: hello } = await api.get();              // tipo: string
const { data: user } = await api.user({ id: '5' }).get(); // tipo: { id: string, name: string }
const { data: created } = await api.user.post({
  username: 'john',
  email: 'john@example.com'
}); // ✅ TypeScript valida el body
```

#### Ventajas de Eden

✅ **Sin duplicación**: No necesitas copiar DTOs entre frontend y backend  
✅ **Sin generación**: No necesitas scripts de build ni herramientas externas  
✅ **Type-safety real**: TypeScript valida requests y responses en tiempo real  
✅ **Autocompletado**: IDE sugiere todos los endpoints y sus parámetros  
✅ **Errores en compile-time**: Detecta incompatibilidades antes de ejecutar  
✅ **Refactor seguro**: Cambiar el backend actualiza automáticamente los tipos del frontend  

---

### Sintaxis Eden Treaty (ÚNICA OPCIÓN)

Usa SIEMPRE la sintaxis estilo objeto de Eden Treaty:

```typescript
import { treaty } from '@elysiajs/eden';
import type { App } from '../../../server/src/index';

const api = treaty<App>('http://localhost:3000');

// Sintaxis type-safe obligatoria
const { data, error } = await api.users.get();
const { data: user } = await api.users({ id: 5 }).get();
const { data: created } = await api.users.post({ 
  username: 'john', 
  email: 'john@example.com' 
});
```

**NO uses:**
- ❌ Eden Fetch (mantén consistencia)
- ❌ Axios
- ❌ Fetch nativo
- ❌ Ninguna otra librería HTTP

---

### 🛠️ Type Checking en Desarrollo (OBLIGATORIO)

DEBES ejecutar watchers de tipos en todo momento durante el desarrollo:

#### Backend: Watcher de Tipos

```json
// server/package.json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "type-check": "tsc --noEmit --watch",
    "dev:full": "concurrently \"npm run dev\" \"npm run type-check\""
  }
}
```

#### Frontend: Watcher de Tipos

```json
// web/package.json
{
  "scripts": {
    "dev": "vite",
    "type-check": "tsc --noEmit --watch",
    "dev:full": "concurrently \"npm run dev\" \"npm run type-check\""
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

**Uso:**

```bash
# Terminal 1: Backend con type-checking
cd server && npm run dev:full

# Terminal 2: Frontend con type-checking
cd web && npm run dev:full
```

Esto te alertará **inmediatamente** si hay incompatibilidades de tipos entre frontend y backend.

---

### 🧪 Test de Tipos Automatizado

Crea un test que valide la comunicación frontend-backend:

```typescript
// web/src/__tests__/api-types.test.ts
import { treaty } from '@elysiajs/eden';
import type { App } from '../../../server/src/index';

// Este test falla si los tipos no coinciden
describe('API Type Safety', () => {
  it('should have valid API client types', () => {
    const api = treaty<App>('http://localhost:3000');
    
    // TypeScript valida que estos endpoints existan y tengan los tipos correctos
    type UserGetResponse = Awaited<ReturnType<typeof api.users.get>>;
    type UserCreateBody = Parameters<typeof api.users.post>[0];
    
    // Si estos tipos no coinciden con el backend, TypeScript arroja error
    const isValid: boolean = true;
    expect(isValid).toBe(true);
  });
});
```

Configura el script de test:

```json
// web/package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch"
  },
  "devDependencies": {
    "vitest": "^1.0.0"
  }
}
```

Ejecuta en modo watch:

```bash
npm run test:watch
```

Esto ejecuta los tests automáticamente cada vez que cambias código, detectando incompatibilidades de tipos **inmediatamente**.

---

### 🛡️ Configuración Obligatoria de Type-Safety

DEBES ejecutar estos procesos en paralelo SIEMPRE durante el desarrollo:

```bash
# Terminal 1: Backend con hot-reload
cd server && npm run dev

# Terminal 2: Backend type-checking
cd server && npm run type-check

# Terminal 3: Frontend con hot-reload
cd web && npm run dev

# Terminal 4: Frontend type-checking
cd web && npm run type-check

# Terminal 5 (Opcional): Tests en watch mode
cd web && npm run test:watch
```

O usa `concurrently` para simplificar:

```json
// package.json (raíz del proyecto)
{
  "scripts": {
    "dev": "concurrently -n backend,frontend \"cd server && npm run dev:full\" \"cd web && npm run dev:full\"",
    "dev:test": "concurrently -n backend,frontend,test \"cd server && npm run dev:full\" \"cd web && npm run dev:full\" \"cd web && npm run test:watch\""
  }
}
```

Luego simplemente:

```bash
npm run dev:test  # Todo en uno: backend, frontend, type-check y tests
```

---

### 📊 No Hay Alternativas

**Eden Treaty es el ÚNICO método permitido** para comunicación frontend-backend en este estándar.

No existe ninguna alternativa válida. Si tu proyecto no puede usar Eden Treaty, entonces este estándar NO aplica y debes definir uno diferente.

---

## 📝 Checklist Obligatorio de Implementación

### Backend (TODO MANDATORIO)

- [ ] Crear interfaces para TODOS los Services (`IUserService`)
- [ ] Crear interfaces para TODOS los Repositories (`IUserRepository`)
- [ ] Implementar Service con lógica de negocio
- [ ] Implementar PrismaRepository con acceso a datos
- [ ] Crear Entity con métodos: `toDTO()`, `fromPrisma()`, `toPrisma()`, `validate()`
- [ ] Exportar `export type App = typeof app` en `index.ts`
- [ ] Inyectar dependencias en rutas
- [ ] Validar con TypeBox en TODAS las rutas
- [ ] Configurar Swagger automático

### Frontend (TODO MANDATORIO)

- [ ] Instalar `@elysiajs/eden`
- [ ] Configurar `ApiContext` con Eden Treaty
- [ ] Importar `type { App }` desde backend
- [ ] Crear custom hooks para lógica de API
- [ ] Implementar Proxy para interceptors (auth, errores)
- [ ] NO crear carpeta `/src/types/` (Eden infiere todo)

### Full Stack (TODO MANDATORIO)

- [ ] Configurar `type-check` en modo watch (backend y frontend)
- [ ] Configurar `dev:full` con concurrently
- [ ] Probar flujo completo (CRUD)
- [ ] Verificar que TypeScript detecta incompatibilidades
- [ ] Configurar tests de tipos en watch mode

---

## 🎉 Resumen del Estándar Obligatorio

### Stack Mandatorio (Sin Excepciones)

**Backend:**
- Node.js + Elysia (framework)
- Prisma (ORM)
- TypeScript (strict mode)
- PostgreSQL
- Interfaces para TODOS los Services y Repositories
- TypeBox para validación
- Swagger automático

**Frontend:**
- React + Vite
- Eden Treaty (ÚNICO cliente permitido)
- TypeScript (strict mode)
- Material UI
- Context API + Custom Hooks

**Type-Safety Obligatorio:**
- Eden Treaty (inferencia automática, NO duplicar DTOs)
- Type-checking en watch mode (`npm run dev:full`)
- Tests de tipos en watch mode
- Concurrently para ejecutar todo simultáneamente

### Reglas Absolutas

**DEBES:**
- ✅ Usar Elysia + Eden Treaty
- ✅ Definir interfaces para Services y Repositories
- ✅ Exportar `export type App = typeof app`
- ✅ Mapear manualmente: `entity.toDTO()`, `entity.fromPrisma()`, `entity.toPrisma()`
- ✅ Ejecutar type-checking en watch mode siempre
- ✅ Validar con TypeBox en todas las rutas

**PROHIBIDO:**
- ❌ Express, NestJS, Fastify
- ❌ Axios, Fetch nativo, Eden Fetch
- ❌ Duplicación manual de DTOs
- ❌ Swagger codegen, openapi-typescript
- ❌ Compartir entidades entre frontend y backend
- ❌ Librerías de mapeo automático
- ❌ Desarrollar sin type-checking en watch mode

**Este estándar NO es negociable. Si no puedes cumplirlo, usa otro estándar.** 🚀

---

## 📜 Reglas como Prompt (Copia esto al LLM)

```
ESTÁNDAR ARQUITECTURA FULL STACK - CUMPLIMIENTO OBLIGATORIO

STACK MANDATORIO:
- Backend: Node.js + Elysia + Prisma + PostgreSQL + TypeScript strict
- Frontend: React + Vite + Eden Treaty + TypeScript strict + Material UI

TYPE-SAFETY (ÚNICO MÉTODO):
- Backend exporta: export type App = typeof app
- Frontend importa: import type { App } from 'backend/src/index'
- Cliente: treaty<App>('url')
- NO duplicar DTOs, NO axios, NO fetch, NO swagger codegen

BACKEND (OBLIGATORIO):
- TODAS las Services DEBEN tener interface IServiceName
- TODAS las Repositories DEBEN tener interface IRepositoryName
- Entities DEBEN tener: toDTO(), fromPrisma(), toPrisma(), validate()
- TODAS las rutas DEBEN validar con TypeBox
- Inyección de dependencias manual en rutas
- Plugins para auth y errores

FRONTEND (OBLIGATORIO):
- Eden Treaty como ÚNICO cliente HTTP
- NO crear carpeta /src/types/
- Proxy para interceptors (auth, errores)
- Custom hooks para lógica de API

DESARROLLO (OBLIGATORIO):
- npm run dev:full (dev + type-check) SIEMPRE activo
- Tests de tipos en watch mode
- Concurrently para ejecutar todo simultáneamente

PROHIBIDO (NUNCA USES):
- Express, NestJS, Fastify
- Axios, Fetch nativo, Eden Fetch
- Duplicación manual de DTOs
- openapi-typescript, Swagger codegen
- Compartir entidades frontend-backend
- Librerías de mapeo automático
- Desarrollar sin type-checking activo

Si no puedes cumplir TODO esto, NO uses este estándar.
```

