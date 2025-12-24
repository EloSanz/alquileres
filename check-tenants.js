const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTenants() {
  try {
    const tenants = await prisma.tenant.findMany({
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        numeroLocal: true,
        rubro: true,
        fechaInicioContrato: true,
        estadoPago: true
      }
    });
    console.log('Primeros 5 tenants con nuevos campos:');
    console.log(JSON.stringify(tenants, null, 2));

    // Contar tenants con datos comerciales
    const withBusiness = await prisma.tenant.count({
      where: { numeroLocal: { not: null } }
    });

    const withContract = await prisma.tenant.count({
      where: { fechaInicioContrato: { not: null } }
    });

    console.log(`\nEstadísticas:`);
    console.log(`Tenants con negocio: ${withBusiness}/25`);
    console.log(`Tenants con contrato: ${withContract}/25`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTenants();
