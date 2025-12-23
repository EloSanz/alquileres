# Rental Management API - Postman Collection

Esta colección contiene todos los endpoints de la API de Gestión de Alquileres para probarla con Postman.

## 🚀 Configuración Inicial

### 1. Importar la Colección
1. Abre Postman
2. Click en "Import" (arriba a la izquierda)
3. Selecciona "File"
4. Elige el archivo `rental-management-api.postman_collection.json`
5. Click en "Import"

### 2. Configurar Variables
La colección incluye estas variables automáticamente configuradas:

| Variable | Valor por Defecto | Descripción |
|----------|-------------------|-------------|
| `base_url` | `http://localhost:3000` | URL base de la API |
| `auth_token` | *(vacío)* | Token JWT de autenticación |
| `tenant_id` | *(vacío)* | ID de inquilino para pruebas |
| `property_id` | *(vacío)* | ID de propiedad para pruebas |
| `payment_id` | *(vacío)* | ID de pago para pruebas |
| `rental_id` | *(vacío)* | ID de alquiler para pruebas |

### 3. Iniciar el Servidor
```bash
cd server
npm run dev
```
El servidor debería estar corriendo en `http://localhost:3000`

## 📋 Endpoints Disponibles

### 🔐 Autenticación (sin auth requerida)
- **POST** `/api/auth/register` - Registrar usuario admin
- **POST** `/api/auth/login` - Login con email o username

### 👤 Autenticación (requiere Bearer token)
- **GET** `/api/auth/me` - Obtener usuario actual
- **GET** `/api/auth/users` - Listar todos los usuarios

### 👥 Inquilinos (Tenants)
- **GET** `/api/tenants` - Listar todos
- **GET** `/api/tenants/:id` - Obtener por ID
- **GET** `/api/tenants/email/:email` - Buscar por email
- **GET** `/api/tenants/document/:documentId` - Buscar por documento
- **POST** `/api/tenants` - Crear nuevo
- **PUT** `/api/tenants/:id` - Actualizar
- **DELETE** `/api/tenants/:id` - Eliminar

### 🏠 Propiedades (Properties)
- **GET** `/api/properties` - Listar todas
- **GET** `/api/properties/:id` - Obtener por ID
- **POST** `/api/properties` - Crear nueva
- **PUT** `/api/properties/:id` - Actualizar
- **DELETE** `/api/properties/:id` - Eliminar

### 💰 Pagos (Payments)
- **GET** `/api/payments` - Listar todos
- **GET** `/api/payments/:id` - Obtener por ID
- **POST** `/api/payments` - Crear nuevo
- **PUT** `/api/payments/:id` - Actualizar
- **DELETE** `/api/payments/:id` - Eliminar

### 📄 Alquileres (Rentals)
- **GET** `/api/rentals` - Listar todos
- **GET** `/api/rentals/:id` - Obtener por ID
- **POST** `/api/rentals` - Crear nuevo
- **PUT** `/api/rentals/:id` - Actualizar
- **DELETE** `/api/rentals/:id` - Eliminar

## 🎯 Flujo de Prueba

### 1. Registro/Login
1. Ejecuta **"Register Admin User"** para crear un usuario
2. Ejecuta **"Login"** - automáticamente guarda el token en `auth_token`

### 2. Crear Datos de Prueba
1. **"Create Tenant"** - crea un inquilino (guarda ID automáticamente)
2. **"Create Property"** - crea una propiedad (guarda ID automáticamente)
3. **"Create Rental"** - crea un alquiler vinculando inquilino y propiedad
4. **"Create Payment"** - crea un pago para el alquiler

### 3. Probar Operaciones CRUD
- Usa los endpoints GET para listar/ver datos
- Usa PUT para actualizar
- Usa DELETE para eliminar (si es necesario)

## 🔑 Autenticación

Todos los endpoints bajo `/api/` requieren autenticación excepto:
- `POST /api/auth/register`
- `POST /api/auth/login`

Para los demás endpoints, incluye el header:
```
Authorization: Bearer {{auth_token}}
```

## 📝 Notas Importantes

### Login Flexible
El endpoint de login acepta `identifier` que puede ser:
- **Email**: `"user@example.com"`
- **Username**: `"admin"`

### Tests Automáticos
Muchos requests incluyen tests que automáticamente guardan IDs en variables de colección para usar en requests posteriores.

### Base de Datos
Asegúrate de que PostgreSQL esté corriendo y la base de datos `alquileres_db` esté creada:
```bash
createdb alquileres_db
```

### Variables de Entorno
El servidor usa:
```env
DATABASE_URL="postgresql://postgres@localhost:5432/alquileres_db?schema=public"
JWT_SECRET="tu-jwt-secret"
```

## 🐛 Troubleshooting

### Error de Conexión
- Verifica que el servidor esté corriendo en `http://localhost:3000`
- Revisa que la variable `base_url` esté configurada correctamente

### Error de Autenticación
- Asegúrate de haber ejecutado el login primero
- Verifica que el token se guardó en la variable `auth_token`

### Errores de Base de Datos
- Asegúrate de que PostgreSQL esté corriendo
- Verifica que la base de datos `alquileres_db` existe
- Revisa los logs del servidor para errores específicos

## 📊 Respuestas de la API

Todas las respuestas siguen este formato:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": { /* datos de respuesta */ },
  "timestamp": "2024-12-23T..."
}
```

¡La colección está lista para probar toda la funcionalidad de la API! 🎉
