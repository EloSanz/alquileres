# 🌱 Dataset de Pruebas - Sistema de Alquileres

Este documento explica cómo usar el dataset de pruebas con datos peruanos realistas.

## 📋 Resumen de Datos

El seed crea un dataset completo con:
- **3 Usuarios** administradores
- **25 Inquilinos** con nombres y datos peruanos
- **20 Propiedades** en diferentes distritos de Lima
- **21 Contratos** de alquiler activos
- **66 Pagos** con diferentes estados

## 🚀 Cómo Ejecutar el Seed

### 1. Configurar Base de Datos
```bash
# Copiar archivo de ejemplo
cp server/env.example server/.env

# Editar .env con tus credenciales de PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/alquileres_db"
```

### 2. Ejecutar Migraciones
```bash
cd server
npm run db:migrate:dev  # Para desarrollo
# o
npm run db:migrate      # Para producción
```

### 3. Ejecutar Seed
```bash
cd server
npm run db:seed
```

## 🔐 Credenciales de Acceso

**Usuario Admin Principal (ACCESO COMPLETO):**
- Usuario: `admin`
- Email: `admin@alquileres.com`
- Contraseña: `admin123`

**Otros usuarios administradores:**
- `carlos.admin` / `carlos@alquileres.com` / `123456`
- `maria.admin` / `maria@alquileres.com` / `123456`

**Nota:** Todos los usuarios admin tienen acceso completo a todos los recursos del sistema.

## 📊 Datos Generados

### 👤 Usuarios
- 3 administradores del sistema
- Contraseñas hasheadas con bcrypt
- Emails únicos

### 👥 Inquilinos
**Datos realistas peruanos:**
- Nombres comunes: Carlos, María, Luis, Ana, etc.
- Apellidos comunes: García, Rodríguez, González, etc.
- DNIs válidos (8 dígitos)
- Teléfonos móviles peruanos (9xxxxxxxx)
- Direcciones en diferentes distritos de Lima
- Fechas de nacimiento realistas

### 🏠 Propiedades
**Características:**
- Ubicadas en 25 distritos de Lima
- Precios de alquiler: **700 - 2500 PEN**
- Tipos: Apartamento, Casa, Estudio
- Habitaciones: 1-4 (o null para estudios)
- Baños: 1-3 (algunos con baño y medio)
- Área: 45-180 m²
- 70% disponibles, 30% ocupadas

**Distritos incluidos:**
Miraflores, San Isidro, Barranco, Surco, La Molina, San Borja, Pueblo Libre, Jesús María, Lince, Magdalena, San Miguel, Pueblo Nuevo, Independencia, Comas, Los Olivos, San Martín de Porres, Rímac, Breña, Callao, Bellavista, La Victoria, El Agustino, Ate, Chorrillos, Villa El Salvador.

### 📋 Alquileres
- Contratos con fechas realistas (2023-2024)
- Duración: 1 año o indefinido
- Algunos contratos completados
- Depósito opcional (50% de los casos)
- Propiedades marcadas como no disponibles cuando activas

### 💰 Pagos
**Estados de pago:**
- 70% Completados
- 15% Pendientes
- 10% Vencidos
- 5% Cancelados

**Tipos de pago:**
- Alquiler (RENT)
- Depósito (DEPOSIT) - opcional

## 🎯 Propósito del Dataset

Este dataset está diseñado para:

1. **Pruebas de funcionalidad** - Verificar que todas las operaciones CRUD funcionen
2. **Pruebas de UI/UX** - Tener datos realistas para probar interfaces
3. **Desarrollo de features** - Base de datos poblada para desarrollo
4. **Demo del sistema** - Mostrar el sistema funcionando con datos realistas

## 🔄 Re-ejecutar Seed

Para volver a ejecutar el seed (limpia todos los datos existentes):

```bash
cd server
npm run db:seed
```

⚠️ **Advertencia:** El seed elimina todos los datos existentes antes de crear los nuevos.

## 🏗️ Estructura Técnica

El seed está escrito en TypeScript y usa:
- **Prisma Client** para operaciones de BD
- **bcrypt** para hashear contraseñas
- **Datos realistas** generados proceduralmente
- **Relaciones correctas** entre entidades

## 📈 Estadísticas Generadas

```
👤 Usuarios: 3
👥 Inquilinos: 25
🏠 Propiedades: 20
📋 Alquileres: 21
💰 Pagos: 66
```

## 🎨 Características Especiales

- **Nombres 100% peruanos** basados en estadísticas reales
- **Direcciones realistas** de Lima Metropolitana
- **Precios de mercado** para alquileres en Lima
- **DNIs válidos** generados correctamente
- **Fechas coherentes** entre contratos y pagos
- **Estados variados** para probar diferentes escenarios

¡El dataset está listo para usar! 🚀
