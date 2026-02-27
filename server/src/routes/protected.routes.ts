import { Elysia } from 'elysia';
import { tenantRoutes } from './tenant.routes';
import { propertyRoutes } from './property.routes';
import { paymentRoutes } from './payment.routes';
import { rentalRoutes } from './rental.routes';
import { contractRoutes } from './contract.routes';
import { contractDraftRoutes } from './contractDraft.routes';
import { serviceRoutes } from './service.routes';
import { taxRoutes } from './tax.routes';
import { guaranteeRoutes } from './guarantee.routes';
import { maintenanceRoutes } from './maintenance.routes';
import { dataRoutes } from './data.routes';
import { patioTenantRoutes } from './patio-tenant.routes';
import { patioPaymentRoutes } from './patio-payment.routes';


// Grupo de rutas protegidas que aplican autenticación automáticamente
export const protectedRoutes = new Elysia()
  .use(dataRoutes)
  .use(tenantRoutes)
  .use(propertyRoutes)
  .use(paymentRoutes)
  .use(rentalRoutes)
  .use(contractRoutes)
  .use(contractDraftRoutes)
  .use(serviceRoutes)
  .use(taxRoutes)
  .use(guaranteeRoutes)
  .use(maintenanceRoutes)
  .use(patioTenantRoutes)
  .use(patioPaymentRoutes);

