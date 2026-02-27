# 🚀 Deploy en VPS

Guía de comandos para aplicar los últimos cambios en el servidor de producción.

---

- **Módulo Patio Amadeo**: Gestión completa de inquilinos y pagos para el sector Patio.
- **Recibos Dinámicos**: Generación de PDF personalizados para Patio (verde) y Boulevard (azul), incluyendo el mes en mayúsculas.
- **Carga de Imágenes Optimizada**: Subida asíncrona a Cloudinary con loader visual en el modal de pagos del Patio.
- **Base de Datos**: Nuevas tablas `PatioTenant` y `PatioPayment`.

---

## Pasos

### 1. Ir al proyecto y traer los cambios

```bash
cd /ruta/al/proyecto   # reemplazá con tu path real en el VPS
git pull origin main
```

---

### 2. Variables de entorno del backend

Editá `server/.env` y asegurate de tener estas líneas con tus credenciales de Cloudinary:

```bash
nano server/.env
```

Agregá:

```env
CLOUDINARY_CLOUD_NAME=dvwhe0t2b
CLOUDINARY_API_KEY=755781918897121
CLOUDINARY_API_SECRET=Gi5scALBSBjOxIuIYOX5gL_LItk
CLOUDINARY_URL=cloudinary://755781918897121:Gi5scALBSBjOxIuIYOX5gL_LItk@dvwhe0t2b
```

---

### 3. Instalar dependencias

```bash
cd server && npm install
cd ../web && npm install
cd ..
```

---

### 4. Aplicar la migración de base de datos

> ⚠️ **Si es la primera vez** que deployás este cambio (los campos `receiptImageUrl` y `receiptImagePublicId` no existen en la DB del VPS), primero creá la migración **en local**:
>
> ```bash
> # Correr en tu máquina local, NO en el VPS
> cd server
> npm run db:migrate:dev -- --name add_receipt_image_fields
> git add prisma/migrations
> git commit -m "feat: add receipt image migration"
> git push
> ```
>
> Luego en el VPS:

```bash
cd server
npm run db:migrate    # = prisma migrate deploy (aplica migraciones pendientes)
```

---

### 5. Regenerar el cliente de Prisma

```bash
npm run db:generate
cd ..
```

---

### 6. Compilar el backend

```bash
cd server
npm run build
cd ..
```

---

### 7. Compilar el frontend

```bash
cd web
npm run build
cd ..
```

---

### 8. Reiniciar los procesos con PM2

```bash
pm2 restart alquileres-backend
pm2 restart alquileres-frontend
```

> Si es el primer deploy desde cero:
>
> ```bash
> pm2 start ecosystem.config.js
> pm2 save
> ```

---

### 9. Verificar que todo levantó correctamente

```bash
pm2 logs alquileres-backend --lines 30
pm2 logs alquileres-frontend --lines 30
pm2 status
```

---

## Troubleshooting

| Problema | Solución |
|---|---|
| Falla la migración | Verificar permisos ALTER TABLE en el usuario de la DB |
| Falla el build del backend | Correr `npm run type-check` para ver errores de TypeScript |
| PM2 no levanta | `pm2 delete all && pm2 start ecosystem.config.js` |
| Variables de entorno no se toman | Reiniciar PM2 después de editar el `.env` |
| Cloudinary da 401 | Verificar que las credenciales en `.env` son correctas |
