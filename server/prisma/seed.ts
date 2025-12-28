import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ejecutando seed SQL con datos de la planilla...');

  try {
    // Leer el archivo SQL completo
    const sqlPath = path.join(__dirname, 'seed.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Usar cliente PostgreSQL directamente para ejecutar múltiples comandos
    // Esto es más confiable que dividir por punto y coma cuando hay bloques DO $$
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL no está definida en las variables de entorno');
    }

    const client = new Client({ connectionString });
    await client.connect();
    
    try {
      await client.query(sqlContent);
    } finally {
      await client.end();
    }

    console.log('✅ Seed SQL ejecutado exitosamente!');
    console.log('📊 Datos insertados:');
    console.log('   👥 24 Inquilinos');
    console.log('   🏠 25 Propiedades');
    console.log('   📄 Contratos y pagos registrados');

  } catch (error) {
    console.error('❌ Error ejecutando seed SQL:', error);
    process.exit(1);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
