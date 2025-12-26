import { ContractData, ContractDraftDTO, CreateContractDraftDTO, UpdateContractDraftDTO, defaultContractData } from '../dtos/contractDraft.dto';
import { ContractDraft } from '../../../shared/types/ContractDraft';

export class ContractDraftEntity {
  constructor(
    public id: number | null,
    public name: string,
    public data: ContractData,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(dto: CreateContractDraftDTO): ContractDraftEntity {
    return new ContractDraftEntity(
      null,
      dto.name,
      dto.data || defaultContractData,
      new Date(),
      new Date()
    );
  }

  update(dto: UpdateContractDraftDTO): ContractDraftEntity {
    if (dto.name !== undefined) this.name = dto.name;
    if (dto.data !== undefined) this.data = dto.data;
    this.updatedAt = new Date();
    return this;
  }

  static fromPrisma(prismaData: any): ContractDraftEntity {
    return new ContractDraftEntity(
      prismaData.id,
      prismaData.name,
      prismaData.data as ContractData,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }

  toPrisma() {
    return {
      id: this.id || undefined,
      name: this.name,
      data: this.data as any,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toDTO(): ContractDraftDTO {
    return ContractDraft.fromJSON({
      id: this.id!,
      name: this.name,
      data: this.data,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    });
  }

  validate(): void {
    if (!this.name || this.name.trim().length < 3) {
      throw new Error('Contract draft name must be at least 3 characters');
    }
    if (!this.data) {
      throw new Error('Contract data is required');
    }
  }
}

