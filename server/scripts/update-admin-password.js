const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');

async function updatePassword() {
  try {
    console.log('🔐 Generando hash para admin123...');
    const hash = await bcrypt.hash('admin123', 10);
    console.log('✅ Hash generado:', hash);
    
    console.log('\n📝 Actualizando contraseña en la base de datos...');
    const updateCmd = `PGPASSWORD=postgres psql -U postgres -d alquileres_db -c "UPDATE users SET password = '${hash}' WHERE username = 'admin';"`;
    execSync(updateCmd, { stdio: 'inherit' });
    
    console.log('\n✅ Contraseña actualizada correctamente');
    console.log('\n📋 Credenciales:');
    console.log('   Usuario: admin');
    console.log('   Email: admin@alquileres.com');
    console.log('   Contraseña: admin123');
    
    // Verificar que se actualizó
    console.log('\n🔍 Verificando actualización...');
    const verifyCmd = `PGPASSWORD=postgres psql -U postgres -d alquileres_db -c "SELECT username, email FROM users WHERE username = 'admin';"`;
    execSync(verifyCmd, { stdio: 'inherit' });
    
    // Probar que el hash funciona
    console.log('\n🧪 Verificando que el hash funciona...');
    const isValid = await bcrypt.compare('admin123', hash);
    console.log('   Verificación:', isValid ? '✅ OK' : '❌ FAIL');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePassword();

