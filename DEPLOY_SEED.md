# Comandos para aplicar cambios del seed en VPS

## Opción 1: Reset completo y seed (recomendado para desarrollo)

### Orden de ejecución:

```bash
cd /ruta/a/alquileres-app
git pull origin main  # o la rama que uses

cd server
npm install

# Reset completo de la base de datos (borra todo y sincroniza schema)
npx prisma db push --force-reset --accept-data-loss

# Ejecutar el seed con los nuevos cambios
npm run db:seed
```

## Opción 2: Solo actualizar datos existentes (producción)

Si solo quieres actualizar los datos sin borrar todo:

```bash
cd /ruta/a/alquileres-app
git pull origin main  # o la rama que uses

cd server
npm install

# Verificar variables de entorno
cat .env | grep DATABASE_URL

# Ejecutar el seed (actualiza datos existentes)
npm run db:seed
```

## Notas importantes:

- **Los cambios aplicados:**
  - Fecha límite de pago cambiada del día 5 al día 4 de cada mes
  - Contratos configurados del 1 de enero al 31 de diciembre de 2025
  - Script de seed mejorado para usar cliente PostgreSQL directamente
  - UPDATE de contratos existentes para corregir fechas

- **Diferencias entre opciones:**
  - **Opción 1** (`db push --force-reset`): Borra TODO y recrea desde cero. Usa el schema actual directamente sin migraciones.
  - **Opción 2** (`db:seed`): Solo actualiza datos existentes. Mantiene la estructura actual.

- **Si hay errores con `prisma migrate reset`:**
  - Usa `db push --force-reset` en su lugar (evita problemas con migraciones)
  - Esto sincroniza el schema directamente sin usar las migraciones

- **Backup recomendado (opcional pero recomendado):**
```bash
# Hacer backup antes de resetear
pg_dump -h localhost -U tu_usuario -d alquileres_db > backup_antes_reset_$(date +%Y%m%d_%H%M%S).sql
```
