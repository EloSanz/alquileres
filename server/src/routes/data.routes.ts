import { Elysia } from 'elysia';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';
import { logError } from '../utils/logger';
import { TenantService } from '../implementations/services/TenantService';
import { PropertyService } from '../implementations/services/PropertyService';
import { ContractService } from '../implementations/services/ContractService';
import { PaymentService } from '../implementations/services/PaymentService';
import { PrismaTenantRepository } from '../implementations/repositories/PrismaTenantRepository';
import { PrismaPaymentRepository } from '../implementations/repositories/PrismaPaymentRepository';
import { PrismaPropertyRepository } from '../implementations/repositories/PrismaPropertyRepository';
import { PrismaContractRepository } from '../implementations/repositories/PrismaContractRepository';

// Dependency injection - reutilizar las mismas instancias que otras rutas
const tenantRepository = new PrismaTenantRepository();
const paymentRepository = new PrismaPaymentRepository();
const propertyRepository = new PrismaPropertyRepository();
const contractRepository = new PrismaContractRepository();

const tenantService = new TenantService(tenantRepository, paymentRepository, propertyRepository);
const propertyService = new PropertyService(propertyRepository, tenantRepository, paymentRepository);
const contractService = new ContractService(contractRepository, paymentRepository);
const paymentService = new PaymentService(paymentRepository);

export const dataRoutes = new Elysia({ prefix: '/data' })
  .use(authPlugin)
  .derive(async ({ headers, request }) => {
    const authHeader: string | undefined = headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logError('No token provided', undefined, { route: 'data', method: request.method, url: request.url });
      throw new Error('No token provided');
    }

    const token: string = authHeader.substring(7).trim();
    
    if (token.length < 10 || token.split('.').length !== 3) {
      logError('Token malformed - invalid format', undefined, { 
        route: 'data', 
        method: request.method, 
        url: request.url,
        tokenLength: token.length,
        tokenParts: token.split('.').length
      });
      throw new Error('Invalid token');
    }

    try {
      const payload = jwtVerify(token, JWT_SECRET) as JWTPayload;
      return { userId: payload.userId };
    } catch (error: any) {
      logError('Token verification failed', error, { 
        route: 'data', 
        method: request.method, 
        url: request.url,
        errorMessage: error.message
      });
      throw new Error('Invalid token');
    }
  })
  .get('/all', async ({ userId }) => {
    try {
      // Cargar todo en paralelo para mejor performance
      const [tenants, properties, contracts, payments] = await Promise.all([
        tenantService.getAllTenants(userId),
        propertyService.getAllProperties(userId),
        contractService.getAllContracts(userId),
        paymentService.getAllPayments(userId)
      ]);

      return {
        success: true,
        data: {
          tenants,
          properties,
          contracts,
          payments
        }
      };
    } catch (error: any) {
      logError('Error loading all data', error, { userId });
      throw error;
    }
  }, {
    detail: {
      tags: ['Data'],
      summary: 'Get all data (tenants, properties, contracts, payments) in a single request'
    }
  });

