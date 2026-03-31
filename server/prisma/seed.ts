import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed ServiceCategories (idempotent, siempre se ejecuta)
  console.log('🌱 Seeding service categories...');
  await prisma.serviceCategory.upsert({
    where: { name: 'AGUA' },
    update: {},
    create: { name: 'AGUA', label: 'Agua' },
  });
  await prisma.serviceCategory.upsert({
    where: { name: 'LUZ' },
    update: {},
    create: { name: 'LUZ', label: 'Luz' },
  });
  console.log('✅ Service categories seeded.');

  // 2. Seed SQL principal (datos de planilla)
  console.log('🌱 Ejecutando seed SQL con datos de la planilla...');
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL no está definida en las variables de entorno');
    }

    const client = new Client({ connectionString });
    await client.connect();
    try {
      const sqlPath = path.join(__dirname, 'seed.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
      console.log('   - Ejecutando seed.sql...');
      await client.query(sqlContent);
      console.log('✅ seed.sql ejecutado correctamente.');
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('⚠️  seed.sql falló (no crítico):', (error as any).message);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
