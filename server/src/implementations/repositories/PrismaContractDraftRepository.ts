import { IContractDraftRepository } from '../../interfaces/repositories/IContractDraftRepository';
import { ContractDraftEntity } from '../../entities/ContractDraft.entity';
import { prisma } from '../../lib/prisma';

export class PrismaContractDraftRepository implements IContractDraftRepository {
  async findAll(): Promise<ContractDraftEntity[]> {
    const drafts = await prisma.contractDraft.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return drafts.map(draft => ContractDraftEntity.fromPrisma(draft));
  }

  async findById(id: number): Promise<ContractDraftEntity | null> {
    const draft = await prisma.contractDraft.findUnique({
      where: { id }
    });
    return draft ? ContractDraftEntity.fromPrisma(draft) : null;
  }

  async create(entity: ContractDraftEntity): Promise<ContractDraftEntity> {
    const data = entity.toPrisma();
    delete (data as any).id;
    const created = await prisma.contractDraft.create({
      data: {
        name: data.name,
        data: data.data,
      }
    });
    return ContractDraftEntity.fromPrisma(created);
  }

  async update(entity: ContractDraftEntity): Promise<ContractDraftEntity> {
    const data = entity.toPrisma();
    delete (data as any).id;
    delete (data as any).createdAt;
    const updated = await prisma.contractDraft.update({
      where: { id: entity.id! },
      data: {
        name: data.name,
        data: data.data,
      }
    });
    return ContractDraftEntity.fromPrisma(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.contractDraft.delete({ where: { id } });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}

