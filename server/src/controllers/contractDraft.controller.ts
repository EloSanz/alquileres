import { IContractDraftService } from '../interfaces/services/IContractDraftService';
import { CreateContractDraftDTO, UpdateContractDraftDTO } from '../dtos/contractDraft.dto';

export class ContractDraftController {
  constructor(private contractDraftService: IContractDraftService) {}

  getAll = async ({ userId }: { userId: number }) => {
    const drafts = await this.contractDraftService.getAllDrafts(userId);
    return {
      success: true,
      message: 'Contract drafts retrieved successfully',
      data: drafts
    };
  };

  getById = async ({ params, userId }: { params: { id: number }; userId: number }) => {
    const draft = await this.contractDraftService.getDraftById(params.id, userId);
    return {
      success: true,
      message: 'Contract draft retrieved successfully',
      data: draft
    };
  };

  create = async ({ body, userId }: { body: CreateContractDraftDTO; userId: number }) => {
    const draft = await this.contractDraftService.createDraft(body, userId);
    return {
      success: true,
      message: 'Contract draft created successfully',
      data: draft
    };
  };

  update = async ({ params, body, userId }: { params: { id: number }; body: UpdateContractDraftDTO; userId: number }) => {
    const draft = await this.contractDraftService.updateDraft(params.id, body, userId);
    return {
      success: true,
      message: 'Contract draft updated successfully',
      data: draft
    };
  };

  delete = async ({ params, userId }: { params: { id: number }; userId: number }) => {
    const deleted = await this.contractDraftService.deleteDraft(params.id, userId);
    return {
      success: deleted,
      message: deleted ? 'Contract draft deleted successfully' : 'Contract draft not found',
      data: null
    };
  };
}

