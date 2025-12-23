import { Elysia } from 'elysia';
import { tenantRoutes } from './tenant.routes';
import { propertyRoutes } from './property.routes';
import { paymentRoutes } from './payment.routes';
import { rentalRoutes } from './rental.routes';
import { authPlugin } from '../plugins/auth.plugin';

// Grupo de rutas protegidas que aplican autenticación automáticamente
export const protectedRoutes = new Elysia()
  .use(authPlugin)  // Auth plugin aplicado una sola vez para todas las rutas protegidas
  .derive(async ({ getCurrentUserId }) => ({
    userId: await getCurrentUserId()
  }))
  .use(tenantRoutes)
  .use(propertyRoutes)
  .use(paymentRoutes)
  .use(rentalRoutes);
