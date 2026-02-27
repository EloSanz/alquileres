import { IPatioTenantRepository } from '../../interfaces/repositories/IPatioTenantRepository';
import { PatioTenantEntity } from '../../entities/PatioTenant.entity';
import { prisma } from '../../lib/prisma';

export class PrismaPatioTenantRepository implements IPatioTenantRepository {
    async findAll(): Promise<PatioTenantEntity[]> {
        const records = await prisma.patioTenant.findMany({
            where: { deletedAt: null },
            orderBy: { id: 'asc' },
        });
        return records.map(r => PatioTenantEntity.fromPrisma(r));
    }

    async findById(id: number): Promise<PatioTenantEntity | null> {
        const record = await prisma.patioTenant.findFirst({
            where: { id, deletedAt: null },
        });
        return record ? PatioTenantEntity.fromPrisma(record) : null;
    }

    async create(entity: PatioTenantEntity): Promise<PatioTenantEntity> {
        const data = entity.toPrisma();
        delete (data as any).id;
        const record = await prisma.patioTenant.create({ data: data as any });
        return PatioTenantEntity.fromPrisma(record);
    }

    async update(entity: PatioTenantEntity): Promise<PatioTenantEntity> {
        const data = entity.toPrisma();
        delete (data as any).id;
        delete (data as any).createdAt;
        const cleanData: any = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) cleanData[key] = value;
        }
        const record = await prisma.patioTenant.update({
            where: { id: entity.id! },
            data: cleanData,
        });
        return PatioTenantEntity.fromPrisma(record);
    }

    async delete(id: number): Promise<boolean> {
        try {
            await prisma.patioTenant.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            return true;
        } catch (error: any) {
            if (error.code === 'P2025') return false;
            throw error;
        }
    }
}
