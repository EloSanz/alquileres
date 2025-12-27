# Database Seed

Este directorio contiene los archivos para poblar la base de datos con datos iniciales basados exactamente en la planilla general actualizada.

## Archivos

### `seed.sql`
Archivo SQL que contiene los datos reales de la planilla general actualizada:
- **1 usuario admin** para acceso al sistema
- **16 inquilinos únicos** con información real (incluyendo EMPORIO GAMARRA)
- **30 propiedades** correspondientes exactamente a los locales de la planilla
- **Contratos y pagos** basados en los meses que pagan según la planilla

### `seed.ts`
Script TypeScript que ejecuta el archivo `seed.sql` usando Prisma.

## Uso

```bash
# Ejecutar el seed
npm run db:seed

# O directamente con Prisma
npx prisma db seed
```

## Datos incluidos

### Usuario Admin
- **Username:** admin
- **Email:** admin@alquileres.com
- **Password:** admin123

### Inquilinos (16 únicos)
Los datos provienen directamente de la planilla actualizada, incluyendo:
- Nombres reales de los inquilinos
- DNIs válidos (generados basados en número de local)
- Teléfonos, direcciones y fechas de contrato realistas
- Rubros de negocio (TIPEO/PEDICURE)

### Propiedades (30 locales)
- **Locales 1-30** de la planilla (1-25 originales + 5 de EMPORIO GAMARRA)
- **Rentas según planilla:**
  - 800 PEN (locales individuales)
  - 900 PEN (local 11 - DENIS REBATA)
  - 1100 PEN (local 13 - ULISES FLORES)
  - 1600 PEN (locales dobles)
  - 2400 PEN (locales triples - ROGER VASQUEZ)
  - 2000 PEN cada uno (locales de EMPORIO GAMARRA)
- **Ubicaciones:** Alternadas entre BOULEVARD y SAN_MARTIN
- **Tipo:** Todos INSIDE

### Contratos y Pagos Registrados
Basados exactamente en los meses que pagan según la planilla, más pagos históricos registrados:

#### PAGOS ACTUALES (SETIEMBRE 2023 - mayoría):
- SEGUNDO ALARCON: 800 + 1600 + 1600 = 4000 PEN
- JIM GAMARRA: 800 PEN
- MARY VARGAS: 800 PEN
- ERICKA ROJAS: 800 PEN
- MEDALIT HUAYTA: 800 PEN
- DIANA ROJAS: 800 PEN
- ROGER VASQUEZ: 1600 + 2400 = 4000 PEN
- DENIS REBATA: 900 PEN
- BETSY SOTO: 800 PEN
- ULISES FLORES: 1100 PEN
- MICHELL REVILLA: 1600 PEN
- JUAN PARIONA: 1600 PEN
- K MODA: 800 PEN

#### PAGOS ESPECIALES:
- MENDEZ MAYTA: 800 PEN (ABRIL)
- NELTON NINAHUAMAN: 1600 PEN (AGOSTO + SETIEMBRE)
- EMPORIO GAMARRA: 10000 PEN (JULIO)

#### PAGOS REGISTRADOS HISTÓRICOS:
- **AGOSTO 2023**: Pagos completos de todos los inquilinos activos
- **JULIO 2023**: Pagos completos de todos los inquilinos activos
- **JUNIO 2023**: Pagos completos de todos los inquilinos activos

**TOTAL PAGOS REGISTRADOS: 31,200.00 PEN** (coincide exactamente con la planilla)
**HISTORIAL COMPLETO**: 4 meses de pagos registrados (JUNIO, JULIO, AGOSTO, SETIEMBRE 2023)

## Características

✅ **Datos exactos** de la planilla general actualizada
✅ **SQL puro** - transparente y legible
✅ **Ejecución rápida** - sin lógica de JavaScript
✅ **Mantenible** - fácil de editar y versionar
✅ **Idempotente** - puede ejecutarse múltiples veces sin duplicados
✅ **Contratos y pagos realistas** basados en meses de pago

## Modificación

Para modificar los datos, editar directamente `seed.sql`. Los INSERT statements incluyen `ON CONFLICT DO NOTHING` para evitar duplicados.
