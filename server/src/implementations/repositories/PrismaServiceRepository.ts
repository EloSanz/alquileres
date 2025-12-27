import { IServiceRepository } from '../../interfaces/repositories/IServiceRepository';
import { ServiceEntity } from '../../entities/Service.entity';
import { prisma } from '../../lib/prisma';

export class PrismaServiceRepository implements IServiceRepository {
  async findAll(): Promise<ServiceEntity[]> {
    const services = await prisma.service.findMany({
      orderBy: { id: 'asc' }
    });
    return services.map(service => ServiceEntity.fromPrisma(service));
  }

  async findById(id: number): Promise<ServiceEntity | null> {
    const service = await prisma.service.findUnique({
      where: { id }
    });
    return service ? ServiceEntity.fromPrisma(service) : null;
  }

  async findByPropertyId(propertyId: number): Promise<ServiceEntity[]> {
    const services = await prisma.service.findMany({
      where: { propertyId },
      orderBy: { dueDate: 'desc' }
    });
    return services.map(service => ServiceEntity.fromPrisma(service));
  }

  async findByContractId(contractId: number): Promise<ServiceEntity[]> {
    const services = await prisma.service.findMany({
      where: { contractId },
      orderBy: { dueDate: 'desc' }
    });
    return services.map(service => ServiceEntity.fromPrisma(service));
  }

  async create(entity: ServiceEntity): Promise<ServiceEntity> {
    const data = entity.toPrisma();
    delete (data as any).id;
    const service = await prisma.service.create({
      data: data as any
    });
    return ServiceEntity.fromPrisma(service);
  }

  async update(entity: ServiceEntity): Promise<ServiceEntity> {
    const data = entity.toPrisma();
    delete (data as any).id;
    delete (data as any).createdAt;
    delete (data as any).propertyId;
    delete (data as any).contractId;
    const service = await prisma.service.update({
      where: { id: entity.id! },
      data: data as any
    });
    return ServiceEntity.fromPrisma(service);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.service.delete({
        where: { id }
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
