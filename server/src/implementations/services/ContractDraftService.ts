import { IContractDraftService } from '../../interfaces/services/IContractDraftService';
import { IContractDraftRepository } from '../../interfaces/repositories/IContractDraftRepository';
import { ContractDraftDTO, CreateContractDraftDTO, UpdateContractDraftDTO } from '../../dtos/contractDraft.dto';
import { ContractDraftEntity } from '../../entities/ContractDraft.entity';

export class ContractDraftService implements IContractDraftService {
  constructor(
    private contractDraftRepository: IContractDraftRepository
  ) {}

  async getAllDrafts(_userId: number): Promise<ContractDraftDTO[]> {
    const entities = await this.contractDraftRepository.findAll();
    return entities.map(entity => entity.toDTO());
  }

  async getDraftById(id: number, _userId: number): Promise<ContractDraftDTO> {
    const entity = await this.contractDraftRepository.findById(id);
    if (!entity) {
      throw new Error('Contract draft not found');
    }
    return entity.toDTO();
  }

  async createDraft(data: CreateContractDraftDTO, _userId: number): Promise<ContractDraftDTO> {
    const entity = ContractDraftEntity.create(data);
    entity.validate();
    const created = await this.contractDraftRepository.create(entity);
    return created.toDTO();
  }

  async updateDraft(id: number, data: UpdateContractDraftDTO, _userId: number): Promise<ContractDraftDTO> {
    const entity = await this.contractDraftRepository.findById(id);
    if (!entity) {
      throw new Error('Contract draft not found');
    }

    const updated = entity.update(data);
    updated.validate();
    const saved = await this.contractDraftRepository.update(updated);
    return saved.toDTO();
  }

  async deleteDraft(id: number, _userId: number): Promise<boolean> {
    return await this.contractDraftRepository.delete(id);
  }
}

