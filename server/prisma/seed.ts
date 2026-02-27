import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ejecutando seed SQL con datos de la planilla...');

  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL no está definida en las variables de entorno');
    }

    const client = new Client({ connectionString });
    await client.connect();

    try {
      // 1. Ejecutar seed principal
      const sqlPath = path.join(__dirname, 'seed.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
      console.log('   - Ejecutando seed.sql...');
      await client.query(sqlContent);

      // 2. Ejecutar seed de patio
      const patioSqlPath = path.join(__dirname, 'patio_seed.sql');
      if (fs.existsSync(patioSqlPath)) {
        const patioSqlContent = fs.readFileSync(patioSqlPath, 'utf-8');
        console.log('   - Ejecutando patio_seed.sql...');
        await client.query(patioSqlContent);
      }

    } finally {
      await client.end();
    }

    console.log('✅ Seeds ejecutados exitosamente!');
    console.log('📊 Datos insertados correctamente.');

  } catch (error) {
    console.error('❌ Error ejecutando seed SQL:', error);
    process.exit(1);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
