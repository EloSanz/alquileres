# 📊 Guía de Comandos Prisma

## 🚀 Comandos Esenciales para Desarrollo

### 1. `prisma generate`
**Genera el cliente de Prisma y tipos TypeScript**

```bash
npx prisma generate
```

**Qué hace:**
- Lee el archivo `schema.prisma`
- Genera el cliente de Prisma en `node_modules/@prisma/client`
- Crea tipos TypeScript para tus modelos
- Actualiza la configuración de la base de datos

**Cuándo usar:**
- Después de modificar el schema
- Al clonar el proyecto por primera vez
- Antes de usar Prisma en el código

**Ejemplo:**
```bash
# Después de agregar un nuevo modelo
npx prisma generate

# Verificar que se generó correctamente
ls node_modules/@prisma/client
```

---

### 2. `prisma db push`
**Sincroniza el schema directamente con la base de datos (sin migraciones)**

```bash
npx prisma db push
```

**Qué hace:**
- Compara el schema con la base de datos
- Crea/modifica tablas, columnas, índices automáticamente
- **NO crea archivos de migración** (útil para desarrollo rápido)

**Cuándo usar:**
- Desarrollo rápido (prototipado)
- Cambios no críticos que no necesitan versionado
- Resetear la base de datos local

**⚠️ Advertencia:**
- **NO usar en producción** (pierdes control de cambios)
- **NO usar si tienes datos importantes** (puede perder datos)

**Ejemplo:**
```bash
# Desarrollo rápido
npx prisma db push

# Resetear base de datos
npx prisma db push --force-reset
```

---

### 3. `prisma migrate dev`
**Crea y aplica migraciones en desarrollo**

```bash
npx prisma migrate dev --name nombre-descriptivo
```

**Qué hace:**
- Compara el schema actual con el schema anterior
- Crea un archivo de migración SQL
- Aplica la migración a la base de datos
- Actualiza el cliente de Prisma

**Cuándo usar:**
- Cambios importantes en el schema
- Cuando necesitas versionar cambios de base de datos
- Preparación para despliegue

**Parámetros importantes:**
- `--name`: Nombre descriptivo de la migración
- `--create-only`: Solo crear migración, no aplicar

**Ejemplo:**
```bash
# Crear migración para agregar tabla de pagos
npx prisma migrate dev --name add-payment-system

# Solo crear migración sin aplicar
npx prisma migrate dev --name update-user-model --create-only
```

---

### 4. `prisma migrate deploy`
**Aplica migraciones pendientes en producción**

```bash
npx prisma migrate deploy
```

**Qué hace:**
- Busca migraciones no aplicadas
- Las ejecuta en orden cronológico
- Actualiza la tabla `_prisma_migrations`
- **NO modifica el schema** (solo ejecuta SQL existente)

**Cuándo usar:**
- Despliegue a producción/staging
- Aplicar cambios de migraciones en otros entornos
- CI/CD pipelines

**Ejemplo:**
```bash
# En pipeline de despliegue
npx prisma migrate deploy

# Verificar estado
npx prisma migrate status
```

---

### 5. `prisma studio`
**Abre la interfaz gráfica web de Prisma**

```bash
npx prisma studio
```

**Qué hace:**
- Inicia un servidor web local
- Proporciona interfaz gráfica para explorar datos
- Permite editar datos directamente
- Muestra relaciones entre tablas

**Cuándo usar:**
- Explorar datos durante desarrollo
- Debugging de relaciones
- Verificar integridad de datos
- Prototipado rápido

**Ejemplo:**
```bash
# Abrir en puerto por defecto (5555)
npx prisma studio

# Abrir en puerto específico
npx prisma studio --port 3001
```

---

### 6. `prisma db seed`
**Ejecuta el script de seeding de datos**

```bash
npx prisma db seed
```

**Qué hace:**
- Ejecuta el script definido en `package.json`
- Inserta datos de prueba/ejemplo
- Configurado en `"prisma": { "seed": "script-path" }`

**Cuándo usar:**
- Poblar base de datos con datos de prueba
- Setup inicial de desarrollo
- Resetear datos de ejemplo

**Configuración en package.json:**
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

### 7. `prisma format`
**Formatea y valida el archivo schema.prisma**

```bash
npx prisma format
```

**Qué hace:**
- Reordena y formatea el schema
- Corrige indentación y espaciado
- Valida sintaxis básica

**Cuándo usar:**
- Después de editar manualmente el schema
- Mantener consistencia de formato
- Antes de commits

---

### 8. `prisma validate`
**Valida el schema sin generar cliente**

```bash
npx prisma validate
```

**Qué hace:**
- Verifica sintaxis del schema
- Valida referencias entre modelos
- Detecta errores potenciales

**Cuándo usar:**
- CI/CD para validar schema
- Antes de generar cliente
- Debugging de errores de schema

---

## 🛠️ Comandos de Troubleshooting

### `prisma migrate reset`
**Resetea completamente la base de datos y reaplica todas las migraciones**

```bash
npx prisma migrate reset
```

**⚠️ PELIGROSO:** Borra todos los datos

### `prisma migrate status`
**Muestra el estado de las migraciones**

```bash
npx prisma migrate status
```

### `prisma db pull`
**Genera schema desde base de datos existente**

```bash
npx prisma db pull
```

### `prisma migrate resolve`
**Marca una migración como aplicada sin ejecutarla**

```bash
npx prisma migrate resolve --applied 20240101000000_migration_name
```

---

## 📋 Workflows Comunes

### 🚀 Setup Inicial de Desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente
npx prisma generate

# 3. Configurar base de datos local (PostgreSQL)
# Crear base de datos 'alquileres_db'

# 4. Aplicar schema inicial
npx prisma db push

# 5. (Opcional) Crear primera migración
npx prisma migrate dev --name init

# 6. (Opcional) Abrir Prisma Studio
npx prisma studio
```

### 🔄 Desarrollo con Migraciones

```bash
# 1. Modificar schema.prisma
# 2. Crear y aplicar migración
npx prisma migrate dev --name add-new-feature
# 3. Generar cliente actualizado
npx prisma generate
```

### 🚀 Despliegue a Producción

```bash
# 1. Aplicar migraciones pendientes
npx prisma migrate deploy
# 2. Generar cliente optimizado
npx prisma generate
```

---

## ⚠️ Mejores Prácticas

### 🔒 Producción vs Desarrollo

- **Desarrollo**: Usa `db push` para iteración rápida
- **Producción**: Usa `migrate deploy` para control de versiones

### 📝 Nombres de Migraciones

```bash
# ✅ Buenos nombres
npx prisma migrate dev --name add-user-authentication
npx prisma migrate dev --name create-payment-system
npx prisma migrate dev --name add-property-address-validation

# ❌ Malos nombres
npx prisma migrate dev --name fix
npx prisma migrate dev --name update
npx prisma migrate dev --name change
```

### 🔄 Control de Versiones

- Incluye archivos de migración en Git
- **NO incluyas** `node_modules/@prisma/client` en Git
- Incluye `.env` solo con variables de ejemplo

---

## 🔧 Configuración Recomendada

### .env para Desarrollo

```env
DATABASE_URL="postgresql://username:password@localhost:5432/alquileres_db?schema=public"
```

### package.json Scripts

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset"
  }
}
```

---

## 🎯 Resumen Rápido

| Comando | Propósito | Ambiente | Datos Seguros |
|---------|-----------|----------|---------------|
| `generate` | Crear cliente TS | Todos | ✅ Seguro |
| `db push` | Sincronizar schema | Desarrollo | ⚠️ Cuidado |
| `migrate dev` | Crear/aplicar migración | Desarrollo | ✅ Seguro |
| `migrate deploy` | Aplicar migraciones | Producción | ✅ Seguro |
| `studio` | Interfaz gráfica | Desarrollo | ⚠️ No modificar prod |
| `db seed` | Poblar datos | Desarrollo | ✅ Seguro |

¡Recuerda siempre hacer backup antes de operaciones destructivas!
