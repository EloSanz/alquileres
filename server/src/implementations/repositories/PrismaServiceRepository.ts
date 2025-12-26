import { IServiceRepository } from '../../interfaces/repositories/IServiceRepository';
import { ServiceEntity } from '../../entities/Service.entity';
// import { prisma } from '../../lib/prisma';

// TODO: Uncomment after running Prisma migration for Service model
// This is a placeholder implementation until the database migration is created
export class PrismaServiceRepository implements IServiceRepository {
  async findAll(): Promise<ServiceEntity[]> {
    // TODO: Implement after migration
    // const services = await prisma.service.findMany({
    //   orderBy: { createdAt: 'desc' }
    // });
    // return services.map(service => ServiceEntity.fromPrisma(service));
    return [];
  }

  async findById(_id: number): Promise<ServiceEntity | null> {
    // TODO: Implement after migration
    // const service = await prisma.service.findUnique({
    //   where: { id }
    // });
    // return service ? ServiceEntity.fromPrisma(service) : null;
    return null;
  }

  async findByPropertyId(_propertyId: number): Promise<ServiceEntity[]> {
    // TODO: Implement after migration
    // const services = await prisma.service.findMany({
    //   where: { propertyId },
    //   orderBy: { dueDate: 'desc' }
    // });
    // return services.map(service => ServiceEntity.fromPrisma(service));
    return [];
  }

  async findByContractId(_contractId: number): Promise<ServiceEntity[]> {
    // TODO: Implement after migration
    // const services = await prisma.service.findMany({
    //   where: { contractId },
    //   orderBy: { dueDate: 'desc' }
    // });
    // return services.map(service => ServiceEntity.fromPrisma(service));
    return [];
  }

  async create(_entity: ServiceEntity): Promise<ServiceEntity> {
    // TODO: Implement after migration
    // const data = entity.toPrisma();
    // delete (data as any).id;
    // const service = await prisma.service.create({
    //   data: data as any
    // });
    // return ServiceEntity.fromPrisma(service);
    throw new Error('Service creation not yet implemented. Run Prisma migration first.');
  }

  async update(_entity: ServiceEntity): Promise<ServiceEntity> {
    // TODO: Implement after migration
    // const data = entity.toPrisma();
    // delete (data as any).id;
    // delete (data as any).createdAt;
    // delete (data as any).propertyId;
    // delete (data as any).contractId;
    // const service = await prisma.service.update({
    //   where: { id: entity.id! },
    //   data: data as any
    // });
    // return ServiceEntity.fromPrisma(service);
    throw new Error('Service update not yet implemented. Run Prisma migration first.');
  }

  async delete(_id: number): Promise<boolean> {
    // TODO: Implement after migration
    // try {
    //   await prisma.service.delete({
    //     where: { id }
    //   });
    //   return true;
    // } catch (error: any) {
    //   if (error.code === 'P2025') {
    //     return false;
    //   }
    //   throw error;
    // }
    throw new Error('Service deletion not yet implemented. Run Prisma migration first.');
  }
}
