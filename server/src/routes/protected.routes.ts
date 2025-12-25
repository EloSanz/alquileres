import { Elysia } from 'elysia';
import { tenantRoutes } from './tenant.routes';
import { propertyRoutes } from './property.routes';
import { paymentRoutes } from './payment.routes';
import { rentalRoutes } from './rental.routes';
import { contractRoutes } from './contract.routes';

// Grupo de rutas protegidas que aplican autenticación automáticamente
export const protectedRoutes = new Elysia()
  .use(tenantRoutes)
  .use(propertyRoutes)
  .use(paymentRoutes)
  .use(rentalRoutes)
  .use(contractRoutes);
