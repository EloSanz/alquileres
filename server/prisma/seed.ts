import { PrismaClient, PropertyType, RentalStatus, PaymentType, PaymentStatus, EstadoPago, Rubro } from '@prisma/client';
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
  for (let i = 0; i < 25; i++) {
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
      const propertyType = getRandomElement([PropertyType.APARTMENT, PropertyType.HOUSE, PropertyType.STUDIO]);
      const bedrooms = propertyType === PropertyType.STUDIO ? null : getRandomNumber(1, 4);
      const bathrooms = propertyType === PropertyType.STUDIO ? 1 : getRandomNumber(1, 3);
      const areaSqm = getRandomNumber(45, 180);

      // Calculate bathrooms as number (some have .5 for half bathrooms)
      const calculatedBathrooms = bathrooms + (Math.random() > 0.7 ? 0.5 : 0);

      const property = await prisma.property.create({
        data: {
          name: `${getRandomElement(propertyNames)} ${getRandomNumber(1, 999)}`,
          address: `${street} ${getRandomNumber(100, 999)}, ${district}, Lima`,
          city: 'Lima',
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

  // Crear pagos (referencian directamente tenantId y propertyId)
  console.log('💰 Creando pagos...');
  for (const property of properties) {
    const numPayments = getRandomNumber(1, 6); // 1-6 pagos por propiedad

    for (let i = 0; i < numPayments; i++) {
      // Crear fechas de pago basadas en la fecha de creación de la propiedad
      const paymentDate = new Date(property.createdAt);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      const dueDate = new Date(paymentDate);
      dueDate.setDate(5); // Vencimiento el día 5 de cada mes

      const paymentType = i === 0 && Math.random() > 0.7 ? PaymentType.DEPOSIT : PaymentType.RENT;

      let status: PaymentStatus;
      const random = Math.random();
      if (random < 0.7) status = PaymentStatus.COMPLETED;
      else if (random < 0.85) status = PaymentStatus.PENDING;
      else if (random < 0.95) status = PaymentStatus.OVERDUE;
      else status = PaymentStatus.CANCELLED;

      const amount = paymentType === PaymentType.DEPOSIT ?
        (property.monthlyRent * 2) : // Depósito = 2 meses de alquiler
        property.monthlyRent;

      await prisma.payment.create({
        data: {
          tenantId: property.tenantId,
          propertyId: property.id,
          amount,
          paymentDate,
          dueDate,
          paymentType,
          status,
          notes: status === PaymentStatus.OVERDUE ? 'Pago retrasado' :
                 status === PaymentStatus.CANCELLED ? 'Pago cancelado por solicitud del inquilino' :
                 null,
        }
      });
    }
  }

  console.log('✅ Seed completado exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   👤 Usuarios: ${users.length}`);
  console.log(`   👥 Inquilinos: ${tenants.length}`);
  console.log(`   🏠 Propiedades: ${properties.length}`);
  console.log(`   💰 Pagos: ${properties.reduce((sum, p) => sum + getRandomNumber(1, 6), 0)}`);

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
