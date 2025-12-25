import { PrismaClient, PropertyType, RentalStatus, EstadoPago, Rubro, ContractStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Datos peruanos realistas
const peruvianNames = [
  // Nombres masculinos comunes en Perú
  'Carlos', 'José', 'Luis', 'Jorge', 'Miguel', 'Juan', 'Pedro', 'Ricardo', 'Fernando', 'Roberto',
  'Alberto', 'Antonio', 'Manuel', 'Francisco', 'Diego', 'Andrés', 'Raúl', 'Sergio', 'Víctor', 'Gustavo',
  'Mario', 'Pablo', 'Rafael', 'Eduardo', 'Emilio', 'Héctor', 'Jaime', 'Julio', 'Leonardo', 'Marco',

  // Nombres femeninos comunes en Perú
  'María', 'Ana', 'Rosa', 'Carmen', 'Isabel', 'Patricia', 'Teresa', 'Luisa', 'Elena', 'Gloria',
  'Mercedes', 'Victoria', 'Francisca', 'Antonia', 'Dolores', 'Pilar', 'Concepción', 'Cristina', 'Beatriz', 'Juana',
  'Adriana', 'Silvia', 'Claudia', 'Gabriela', 'Verónica', 'Sandra', 'Mónica', 'Laura', 'Celia', 'Sonia'
];

const peruvianLastNames = [
  // Apellidos comunes en Perú
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Ruiz',
  'Hernández', 'Jiménez', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Navarro', 'Torres', 'Ramírez',
  'Domínguez', 'Gil', 'Vargas', 'Herrera', 'Castro', 'Ortega', 'Rubio', 'Santiago', 'Delgado', 'Ramos',
  'Guerrero', 'Medina', 'Cortes', 'Castillo', 'Santos', 'Aguilar', 'Ortiz', 'Morales', 'Núñez', 'Prieto'
];

const limaDistricts = [
  'Miraflores', 'San Isidro', 'Barranco', 'Surco', 'La Molina', 'San Borja', 'Pueblo Libre', 'Jesús María',
  'Lince', 'Magdalena', 'San Miguel', 'Pueblo Nuevo', 'Independencia', 'Comas', 'Los Olivos', 'San Martín de Porres',
  'Rímac', 'Breña', 'Callao', 'Bellavista', 'La Victoria', 'El Agustino', 'Ate', 'Chorrillos', 'Villa El Salvador'
];

const streets = [
  'Av. Arequipa', 'Av. Larco', 'Av. Pardo', 'Av. Benavides', 'Av. Brasil', 'Av. Universitaria',
  'Jr. de la Unión', 'Jr. Carabaya', 'Jr. Huallaga', 'Calle Los Pinos', 'Calle Las Palmeras',
  'Av. Javier Prado', 'Av. Salaverry', 'Av. Tacna', 'Av. Abancay', 'Jr. Azángaro',
  'Av. Nicolás de Piérola', 'Calle Los Cedros', 'Av. Petit Thouars', 'Jr. Junín'
];

const propertyNames = [
  'Edificio Residencial', 'Condominio', 'Casa Familiar', 'Apartamento Moderno', 'Estudio Ejecutivo',
  'Casa de Playa', 'Penthouse', 'Loft Industrial', 'Casa Colonial', 'Apartamento Vista Mar',
  'Casa Jardín', 'Departamento Ejecutivo', 'Casa Campestre', 'Apartamento Premium', 'Estudio Minimalista'
];

const businessRubros = [
  Rubro.TIPEO, Rubro.PEDICURE
];

const propertyDescriptions = [
  'Hermosa propiedad con excelente ubicación y todas las comodidades modernas.',
  'Propiedad espaciosa con jardín privado y estacionamiento.',
  'Apartamento completamente equipado con vista panorámica.',
  'Casa familiar ideal para una familia numerosa.',
  'Estudio moderno perfecto para profesionales.',
  'Propiedad con acabados de primera calidad y áreas comunes.',
  'Casa colonial restaurada manteniendo su encanto original.',
  'Apartamento con terraza privada y zona BBQ.',
  'Propiedad con seguridad 24/7 y áreas verdes.',
  'Casa con diseño contemporáneo y materiales premium.'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDNI(): string {
  // Genera un DNI peruano válido (8 dígitos)
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

function generatePhone(): string {
  // Genera un número de teléfono peruano
  const prefixes = ['9', '8', '7']; // Móviles comunes en Perú
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${number}`;
}

function getRandomPaymentMethod(): string {
  // Distribución realista de medios de pago en Perú (basado en estadísticas reales)
  // Yape: 45% (muy popular en pagos diarios y alquileres)
  // Depósito bancario: 35% (tradicional pero aún común)
  // Transferencia Virtual: 20% (creciente pero menos usado para alquileres)
  const random = Math.random();
  if (random < 0.45) return 'YAPE';
  if (random < 0.8) return 'DEPOSITO';
  return 'TRANSFERENCIA_VIRTUAL';
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('🌱 Iniciando seed de datos peruanos...');

  // Limpiar datos existentes (orden importa por las foreign keys)
  console.log('🧹 Limpiando datos existentes...');
  try {
    await prisma.payment.deleteMany();
  } catch (e) {
    console.log('Tabla payments no existe o está vacía, continuando...');
  }
  try {
    await prisma.contract.deleteMany();
  } catch (e) {
    console.log('Tabla contracts no existe o está vacía, continuando...');
  }
  try {
    await prisma.rental.deleteMany();
  } catch (e) {
    console.log('Tabla rentals no existe o está vacía, continuando...');
  }
  try {
    await prisma.property.deleteMany();
  } catch (e) {
    console.log('Tabla properties no existe o está vacía, continuando...');
  }
  try {
    await prisma.tenant.deleteMany();
  } catch (e) {
    console.log('Tabla tenants no existe o está vacía, continuando...');
  }
  try {
    await prisma.user.deleteMany();
  } catch (e) {
    console.log('Tabla users no existe o está vacía, continuando...');
  }

  // Crear usuarios administradores
  console.log('👤 Creando usuarios...');
  const hashedDefaultPassword = await bcrypt.hash('123456', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  // Crear usuario admin principal (SIEMPRE debe existir)
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@alquileres.com',
      password: hashedAdminPassword,
    }
  });

  // Crear usuarios adicionales
  const additionalUsers = await Promise.all([
    prisma.user.create({
      data: {
        username: 'carlos.admin',
        email: 'carlos@alquileres.com',
        password: hashedDefaultPassword,
      }
    }),
    prisma.user.create({
      data: {
        username: 'maria.admin',
        email: 'maria@alquileres.com',
        password: hashedDefaultPassword,
      }
    })
  ]);

  const users = [adminUser, ...additionalUsers];

  // Crear inquilinos
  console.log('👥 Creando inquilinos...');
  const tenants: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string | null;
    documentId: string;
    address: string | null;
    birthDate: Date | null;
    numeroLocal: string | null;
    rubro: Rubro | null;
    fechaInicioContrato: Date | null;
    estadoPago: EstadoPago;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];
  for (let i = 0; i < 5; i++) {
    const firstName = getRandomElement(peruvianNames);
    const lastName1 = getRandomElement(peruvianLastNames);
    const lastName2 = getRandomElement(peruvianLastNames);
    const district = getRandomElement(limaDistricts);
    const street = getRandomElement(streets);

    // Generar datos comerciales aleatorios - TODOS los tenants tienen negocio
    const numeroLocal = getRandomNumber(1, 999).toString();
    const rubro = getRandomElement(businessRubros);

    // Fecha de inicio de contrato (últimos 2 años) - TODOS los tenants tienen contrato
    const fechaInicioContrato = getRandomDate(new Date(2022, 0, 1), new Date());

    tenants.push(await prisma.tenant.create({
      data: {
        firstName,
        lastName: `${lastName1} ${lastName2}`,
        phone: generatePhone(),
        documentId: generateDNI(),
        address: `${street} ${getRandomNumber(100, 999)}, ${district}, Lima`,
        birthDate: getRandomDate(new Date(1950, 0, 1), new Date(2000, 11, 31)),
        numeroLocal,
        rubro,
        fechaInicioContrato,
        estadoPago: EstadoPago.AL_DIA, // Inicialmente todos al día
      }
    }));
  }

  // Crear propiedades (cada propiedad pertenece a un inquilino)
  console.log('🏠 Creando propiedades...');
  const properties: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string | null;
    propertyType: PropertyType;
    bedrooms: number | null;
    bathrooms: number | null;
    areaSqm: number | null;
    monthlyRent: any;
    description: string | null;
    isAvailable: boolean;
    tenantId: number;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  // Asignar propiedades a inquilinos (cada inquilino puede tener 1-3 propiedades)
  for (const tenant of tenants) {
    const numProperties = getRandomNumber(1, 3); // 1-3 propiedades por inquilino

    for (let i = 0; i < numProperties; i++) {
      const district = getRandomElement(limaDistricts);
      const street = getRandomElement(streets);
      const monthlyRent = getRandomNumber(700, 2500);
      const propertyType = getRandomElement([PropertyType.INSIDE, PropertyType.OUTSIDE]);
      const bedrooms = null; // Los locales comerciales no tienen dormitorios
      const bathrooms = 1; // Los locales comerciales tienen 1 baño
      const areaSqm = getRandomNumber(45, 180);

      // Calculate bathrooms as number (some have .5 for half bathrooms)
      const calculatedBathrooms = bathrooms + (Math.random() > 0.7 ? 0.5 : 0);

      const property = await prisma.property.create({
        data: {
          name: `${getRandomElement(propertyNames)} ${getRandomNumber(1, 999)}`,
          localNumber: getRandomNumber(1, 999),
          state: 'Lima',
          zipCode: `LIMA${getRandomNumber(1, 43).toString().padStart(2, '0')}`,
          propertyType,
          bedrooms,
          bathrooms: calculatedBathrooms,
          areaSqm,
          monthlyRent,
          description: getRandomElement(propertyDescriptions),
          isAvailable: Math.random() > 0.3, // 70% disponibles
          tenantId: tenant.id, // Asignar propiedad al inquilino
        }
      });

      properties.push(property);
    }
  }

  // Nota: Ya no necesitamos crear rentals separados
  // Las propiedades ahora pertenecen directamente a los inquilinos
  // Los pagos se crearán directamente referenciando tenantId y propertyId

  // Crear un contrato para el primer inquilino y propiedad
  console.log('📄 Creando contrato...');
  if (tenants.length > 0 && properties.length > 0) {
    const firstTenant = tenants[0];
    const firstProperty = properties.find(p => p.tenantId === firstTenant.id) || properties[0];
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2); // Contrato iniciado hace 2 meses
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // Duración de 1 año

    const contract = await prisma.contract.create({
      data: {
        tenantId: firstTenant.id,
        propertyId: firstProperty.id,
        tenantFullName: `${firstTenant.firstName} ${firstTenant.lastName}`,
        startDate,
        endDate,
        monthlyRent: firstProperty.monthlyRent,
        status: ContractStatus.ACTIVE,
      }
    });

    console.log(`✅ Contrato creado: ID ${contract.id} para ${firstTenant.firstName} ${firstTenant.lastName}`);

    // Crear pagos solo para los primeros 2 meses (el resto se infiere como impago/futuro)
    console.log('💰 Creando pagos de meses pagados para el contrato...');
    for (let month = 1; month <= 2; month++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + month - 1);
      dueDate.setDate(5); // Vencimiento el día 5 de cada mes

      // Mes pagado: alrededor de la fecha de vencimiento
      const paymentDate = new Date(dueDate);
      paymentDate.setDate(paymentDate.getDate() + getRandomNumber(-5, 0));

      await prisma.payment.create({
        data: {
          tenantId: firstTenant.id,
          propertyId: firstProperty.id,
          contractId: contract.id,
          monthNumber: month,
          tenantFullName: `${firstTenant.firstName} ${firstTenant.lastName}`,
          tenantPhone: firstTenant.phone,
          amount: firstProperty.monthlyRent,
          paymentDate,
          dueDate,
          paymentMethod: getRandomPaymentMethod(), // Random payment method
          pentamontSettled: Math.random() > 0.5
        }
      });
    }
    console.log('✅ Pagos registrados para meses pagados');
  }

  // Crear contratos adicionales para variedad
  console.log('📄 Creando contratos adicionales...');
  if (tenants.length > 3 && properties.length > 3) {
    const candidates = [1, 2, 3].map(i => ({
      tenant: tenants[i],
      property: properties.find(p => p.tenantId === tenants[i].id) || properties[(i + 2) % properties.length],
      offset: [-5, -1, 1][i - 1], // inicio hace 5m, 1m o futuro +1m
      monthsPaid: [3, 1, 0][i - 1] // cantidad de meses pagados
    }));

    for (const c of candidates) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() + c.offset);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const contract = await prisma.contract.create({
        data: {
          tenantId: c.tenant.id,
          propertyId: c.property.id,
          tenantFullName: `${c.tenant.firstName} ${c.tenant.lastName}`,
          startDate,
          endDate,
          monthlyRent: c.property.monthlyRent,
          status: ContractStatus.ACTIVE,
        }
      });
      console.log(`✅ Contrato creado: ID ${contract.id} para ${c.tenant.firstName} ${c.tenant.lastName}`);

      // Crear solo pagos para meses pagados
      for (let month = 1; month <= c.monthsPaid; month++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + month - 1);
        dueDate.setDate(5);
        const paymentDate = new Date(dueDate);
        paymentDate.setDate(paymentDate.getDate() + getRandomNumber(-3, 3));

        await prisma.payment.create({
          data: {
            tenantId: c.tenant.id,
            propertyId: c.property.id,
            contractId: contract.id,
            monthNumber: month,
            tenantFullName: `${c.tenant.firstName} ${c.tenant.lastName}`,
            tenantPhone: c.tenant.phone,
            amount: c.property.monthlyRent,
            paymentDate,
            dueDate,
            paymentMethod: getRandomPaymentMethod(),
            pentamontSettled: Math.random() > 0.5,
            notes: 'Pago de cuota'
          }
        });
      }
    }
  }
  // Crear algunos pagos adicionales para otras propiedades (sin contrato)
  console.log('💰 Creando pagos adicionales...');
  for (const property of properties.slice(1)) { // Saltar la primera propiedad que ya tiene contrato
    const numPayments = getRandomNumber(1, 3); // 1-3 pagos por propiedad

    for (let i = 0; i < numPayments; i++) {
      // Crear fechas de pago basadas en la fecha de creación de la propiedad
      const paymentDate = new Date(property.createdAt);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      const dueDate = new Date(paymentDate);
      dueDate.setDate(5); // Vencimiento el día 5 de cada mes


      const random = Math.random();
      let paymentDateValue: Date | null = null;
      let notes: string | null = null;
      
      // Si el pago está completado (70% probabilidad), asignar fecha de pago
      if (random < 0.7) {
        paymentDateValue = new Date(paymentDate);
        paymentDateValue.setDate(paymentDateValue.getDate() + getRandomNumber(-5, 5)); // Pagado alrededor de la fecha
      } else if (random < 0.95) {
        // 25% probabilidad de pago retrasado (con nota)
        notes = 'Pago retrasado';
      }


      await prisma.payment.create({
        data: {
          tenantId: property.tenantId,
          propertyId: property.id,
          amount: property.monthlyRent,
          paymentDate: paymentDateValue || paymentDate,
          dueDate,
          paymentMethod: getRandomPaymentMethod(),
          pentamontSettled: Math.random() > 0.5,
          notes,
        }
      });
    }
  }

  const contractsCount = await prisma.contract.count();
  const paymentsCount = await prisma.payment.count();

  console.log('✅ Seed completado exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   👤 Usuarios: ${users.length}`);
  console.log(`   👥 Inquilinos: ${tenants.length}`);
  console.log(`   🏠 Propiedades: ${properties.length}`);
  console.log(`   📄 Contratos: ${contractsCount}`);
  console.log(`   💰 Pagos: ${paymentsCount}`);

  console.log('\n🔐 Credenciales de acceso:');
  console.log('   👑 ADMIN PRINCIPAL (acceso completo):');
  console.log('      Usuario: admin');
  console.log('      Email: admin@alquileres.com');
  console.log('      Contraseña: admin123');
  console.log('   👤 Otros admins:');
  console.log('      carlos.admin / carlos@alquileres.com / 123456');
  console.log('      maria.admin / maria@alquileres.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
