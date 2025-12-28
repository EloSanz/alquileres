import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ejecutando seed SQL con datos de la planilla...');

  try {
    // Leer el archivo SQL completo
    const sqlPath = path.join(__dirname, 'seed.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Dividir por punto y coma, pero respetar bloques DO $$
    const statements: string[] = [];
    let currentStatement = '';
    let inDollarBlock = false;
    let dollarTag = '';

    const lines = sqlContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments
      if (trimmedLine.startsWith('--')) {
        continue;
      }
      
      // Detectar inicio de bloque DO $$
      if (trimmedLine.match(/^DO\s+\$\$/) || trimmedLine.match(/^DO\s+\$[a-zA-Z_]*\$/)) {
        inDollarBlock = true;
        dollarTag = trimmedLine.match(/\$[a-zA-Z_]*\$/)![0];
        currentStatement += line + '\n';
        continue;
      }
      
      // Detectar fin de bloque DO $$
      if (inDollarBlock && trimmedLine === dollarTag + ';') {
        currentStatement += line;
        statements.push(currentStatement.trim());
        currentStatement = '';
        inDollarBlock = false;
        dollarTag = '';
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Si no estamos en un bloque DO $$ y la línea termina con punto y coma, es un statement completo
      if (!inDollarBlock && trimmedLine.endsWith(';')) {
        const statement = currentStatement.trim();
        if (statement) {
          statements.push(statement);
        }
        currentStatement = '';
      }
    }
    
    // Ejecutar cada statement
    for (const statement of statements) {
      if (statement.trim()) {
        await prisma.$executeRawUnsafe(statement);
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
