import { ContractDraftDTO, CreateContractDraftDTO, UpdateContractDraftDTO } from '../../dtos/contractDraft.dto';

export interface IContractDraftService {
  getAllDrafts(userId: number): Promise<ContractDraftDTO[]>;
  getDraftById(id: number, userId: number): Promise<ContractDraftDTO>;
  createDraft(data: CreateContractDraftDTO, userId: number): Promise<ContractDraftDTO>;
  updateDraft(id: number, data: UpdateContractDraftDTO, userId: number): Promise<ContractDraftDTO>;
  deleteDraft(id: number, userId: number): Promise<boolean>;
}

