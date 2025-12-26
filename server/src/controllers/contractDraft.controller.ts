import { IContractDraftService } from '../interfaces/services/IContractDraftService';
import { CreateContractDraft, UpdateContractDraft } from '../../../shared/types/ContractDraft';

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

  create = async ({ body, userId }: { body: any; userId: number }) => {
    const createDraft = CreateContractDraft.fromJSON(body);
    const errors = createDraft.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    const draft = await this.contractDraftService.createDraft(createDraft.toDTO(), userId);
    return {
      success: true,
      message: 'Contract draft created successfully',
      data: draft
    };
  };

  update = async ({ params, body, userId }: { params: { id: number }; body: any; userId: number }) => {
    const updateDraft = UpdateContractDraft.fromJSON(body);
    const errors = updateDraft.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    const draft = await this.contractDraftService.updateDraft(params.id, updateDraft.toDTO(), userId);
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

