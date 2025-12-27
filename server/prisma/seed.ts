import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ejecutando seed SQL con datos de la planilla...');

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'seed.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Dividir por líneas y procesar cada statement
    const lines = sqlContent.split('\n');
    let currentStatement = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || trimmedLine.length === 0) {
        continue;
      }

      // Add line to current statement
      currentStatement += line + '\n';

      // If line ends with semicolon, execute the statement
      if (trimmedLine.endsWith(';')) {
        const statement = currentStatement.trim();
        if (statement) {
          await prisma.$executeRawUnsafe(statement);
        }
        currentStatement = '';
      }
    }

    console.log('✅ Seed SQL ejecutado exitosamente!');
    console.log('📊 Datos insertados:');
    console.log('   👥 15 Inquilinos únicos');
    console.log('   🏠 25 Propiedades');
    console.log('   📄 Contratos y pagos registrados históricos');

  } catch (error) {
    console.error('❌ Error ejecutando seed SQL:', error);
    process.exit(1);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
