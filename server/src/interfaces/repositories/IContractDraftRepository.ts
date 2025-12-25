import { ContractDraftEntity } from '../../entities/ContractDraft.entity';

export interface IContractDraftRepository {
  findAll(): Promise<ContractDraftEntity[]>;
  findById(id: number): Promise<ContractDraftEntity | null>;
  create(entity: ContractDraftEntity): Promise<ContractDraftEntity>;
  update(entity: ContractDraftEntity): Promise<ContractDraftEntity>;
  delete(id: number): Promise<boolean>;
}

