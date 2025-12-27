import { IMaintenanceRepository } from '../../interfaces/repositories/IMaintenanceRepository';
import { MaintenanceEntity } from '../../entities/Maintenance.entity';
import { prisma } from '../../lib/prisma';

export class PrismaMaintenanceRepository implements IMaintenanceRepository {
  async findAll(): Promise<MaintenanceEntity[]> {
    const maintenances = await prisma.maintenance.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return maintenances.map(maintenance => MaintenanceEntity.fromPrisma(maintenance));
  }

  async findById(id: number): Promise<MaintenanceEntity | null> {
    const maintenance = await prisma.maintenance.findUnique({
      where: { id }
    });
    return maintenance ? MaintenanceEntity.fromPrisma(maintenance) : null;
  }

  async findByPropertyId(propertyId: number): Promise<MaintenanceEntity[]> {
    const maintenances = await prisma.maintenance.findMany({
      where: { propertyId },
      orderBy: { scheduledDate: 'desc' }
    });
    return maintenances.map(maintenance => MaintenanceEntity.fromPrisma(maintenance));
  }

  async findByContractId(contractId: number): Promise<MaintenanceEntity[]> {
    const maintenances = await prisma.maintenance.findMany({
      where: { contractId },
      orderBy: { scheduledDate: 'desc' }
    });
    return maintenances.map(maintenance => MaintenanceEntity.fromPrisma(maintenance));
  }

  async create(entity: MaintenanceEntity): Promise<MaintenanceEntity> {
    const data = entity.toPrisma();
    delete (data as any).id;
    const maintenance = await prisma.maintenance.create({
      data: data as any
    });
    return MaintenanceEntity.fromPrisma(maintenance);
  }

  async update(entity: MaintenanceEntity): Promise<MaintenanceEntity> {
    const data = entity.toPrisma();
    delete (data as any).id;
    delete (data as any).createdAt;
    delete (data as any).propertyId;
    delete (data as any).contractId;
    const maintenance = await prisma.maintenance.update({
      where: { id: entity.id! },
      data: data as any
    });
    return MaintenanceEntity.fromPrisma(maintenance);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.maintenance.delete({
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
