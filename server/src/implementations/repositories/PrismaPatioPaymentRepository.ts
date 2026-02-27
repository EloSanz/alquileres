import { IPatioPaymentRepository } from '../../interfaces/repositories/IPatioPaymentRepository';
import { PatioPaymentEntity } from '../../entities/PatioPayment.entity';
import { prisma } from '../../lib/prisma';

export class PrismaPatioPaymentRepository implements IPatioPaymentRepository {
    async findAll(): Promise<PatioPaymentEntity[]> {
        const records = await prisma.patioPayment.findMany({
            where: { deletedAt: null },
            orderBy: { id: 'asc' },
        });
        return records.map(r => PatioPaymentEntity.fromPrisma(r));
    }

    async findById(id: number): Promise<PatioPaymentEntity | null> {
        const record = await prisma.patioPayment.findFirst({
            where: { id, deletedAt: null },
        });
        return record ? PatioPaymentEntity.fromPrisma(record) : null;
    }

    async findByPatioTenantId(patioTenantId: number): Promise<PatioPaymentEntity[]> {
        const records = await prisma.patioPayment.findMany({
            where: { patioTenantId, deletedAt: null },
            orderBy: { fechaVencimiento: 'asc' },
        });
        return records.map(r => PatioPaymentEntity.fromPrisma(r));
    }

    async create(entity: PatioPaymentEntity): Promise<PatioPaymentEntity> {
        const data = entity.toPrisma();
        delete (data as any).id;
        const record = await prisma.patioPayment.create({ data: data as any });
        return PatioPaymentEntity.fromPrisma(record);
    }

    async update(entity: PatioPaymentEntity): Promise<PatioPaymentEntity> {
        const data = entity.toPrisma();
        delete (data as any).id;
        delete (data as any).createdAt;
        delete (data as any).updatedAt; // Prisma handles this

        const cleanData: any = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) cleanData[key] = value;
        }

        try {
            const record = await prisma.patioPayment.update({
                where: { id: entity.id! },
                data: cleanData,
            });
            return PatioPaymentEntity.fromPrisma(record);
        } catch (error: any) {
            console.error('Error updating PatioPayment:', error);
            console.error('Data attempt:', JSON.stringify(cleanData, (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value, 2));
            throw error;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            await prisma.patioPayment.update({
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
