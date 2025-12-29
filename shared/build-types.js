#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Función para convertir TypeScript a JavaScript básico
function convertTSToJS(tsContent) {
  let jsContent = tsContent;

  // Convertir enums a objetos
  jsContent = jsContent.replace(/export enum (\w+) \{([^}]+)\}/g, (match, enumName, enumBody) => {
    const objBody = enumBody
      .split(',')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        // Manejar casos como "PAGADO = 'PAGADO'" o "PAGADO"
        const parts = line.split('=').map(s => s.trim());
        const key = parts[0];
        let value = parts[1];

        if (value) {
          // Si hay valor asignado, limpiarlo
          value = value.replace(/['"]/g, '').trim();
        } else {
          // Si no hay valor, usar el mismo nombre como valor
          value = key;
        }

        return `${key}: '${value}'`;
      })
      .join(',\n  ');

    return `const ${enumName} = {\n  ${objBody}\n};`;
  });

  // Convertir interfaces a comentarios (no necesitamos interfaces en JS)
  jsContent = jsContent.replace(/export interface \w+ \{[^}]*\}/g, '// Interface removed for JS compatibility');

  // Remover modificadores de acceso (public, private, protected)
  jsContent = jsContent.replace(/\b(public|private|protected)\s+/g, '');

  // Convertir tipos de parámetros (remover tipos TypeScript)
  jsContent = jsContent.replace(/(\w+):\s*[\w\[\]|&{}<>\s]+(\s*[=,)])/g, '$1$2');

  // Convertir parámetros de función con tipos
  jsContent = jsContent.replace(/(\w+)\s*\(\s*([^)]*)\):\s*[\w\[\]|&{}<>\s]+/g, '$1($2)');

  // Convertir tipos de retorno en funciones
  jsContent = jsContent.replace(/(\w+)\s*\([^)]*\):\s*[\w\[\]|&{}<>\s]+(\s*=>|\s*\{)/g, '$1$2');

  // Convertir tipos de retorno simples
  jsContent = jsContent.replace(/:\s*[\w\[\]|&{}<>\s]+(\s*\{)/g, '$1');

  // Convertir propiedades de clase
  jsContent = jsContent.replace(/(\w+)[?!]?:\s*[\w\[\]|&{}<>\s]+;/g, '$1;');

  // Remover imports de tipos (pero mantener otros imports)
  jsContent = jsContent.replace(/import\s+type\s+[^;]+;/g, '');

  return jsContent;
}

// Función principal
function buildTypes() {
  const typesDir = path.join(__dirname, 'types');

  if (!fs.existsSync(typesDir)) {
    console.error('❌ Directorio types/ no encontrado');
    process.exit(1);
  }

  const files = fs.readdirSync(typesDir).filter(file => file.endsWith('.ts'));

  console.log('🏗️  Construyendo tipos compartidos...\n');

  files.forEach(file => {
    const tsPath = path.join(typesDir, file);
    const jsPath = path.join(typesDir, file.replace('.ts', '.js'));

    try {
      const tsContent = fs.readFileSync(tsPath, 'utf8');
      const jsContent = convertTSToJS(tsContent);

      fs.writeFileSync(jsPath, jsContent, 'utf8');
      console.log(`✅ ${file} → ${file.replace('.ts', '.js')}`);
    } catch (error) {
      console.error(`❌ Error procesando ${file}:`, error.message);
      process.exit(1);
    }
  });

  console.log('\n🎉 Build de tipos compartidos completado!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  buildTypes();
}

module.exports = { buildTypes };
