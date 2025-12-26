import { IContractService } from '../interfaces/services/IContractService';
import { CreateContract, UpdateContract } from '../../../shared/types/Contract';

export class ContractController {
  constructor(private contractService: IContractService) {}

  getAll = async ({ userId }: { userId: number }) => {
    const contracts = await this.contractService.getAllContracts(userId);
    return {
      success: true,
      message: 'Contracts retrieved successfully',
      data: contracts,
    };
  };

  getById = async ({
    params: { id },
    userId,
  }: {
    params: { id: number };
    userId: number;
  }) => {
    const contract = await this.contractService.getContractById(id, userId);
    return {
      success: true,
      message: 'Contract retrieved successfully',
      data: contract,
    };
  };

  getProgress = async ({
    params: { id },
    userId,
  }: {
    params: { id: number };
    userId: number;
  }) => {
    const progress = await this.contractService.getContractProgress(id, userId);
    return {
      success: true,
      message: 'Contract progress retrieved successfully',
      data: progress,
    };
  };

  getActiveByTenant = async ({
    params: { tenantId },
    userId,
  }: {
    params: { tenantId: number };
    userId: number;
  }) => {
    const contract = await this.contractService.getActiveContractByTenant(tenantId, userId);
    return {
      success: true,
      message: 'Active contract retrieved successfully',
      data: contract,
    };
  };

  getActiveByProperty = async ({
    params: { propertyId },
    userId,
  }: {
    params: { propertyId: number };
    userId: number;
  }) => {
    const contract = await this.contractService.getActiveContractByProperty(propertyId, userId);
    return {
      success: true,
      message: 'Active contract retrieved successfully',
      data: contract,
    };
  };

  create = async ({
    body,
    userId,
  }: {
    body: any;
    userId: number;
  }) => {
    const createContract = CreateContract.fromJSON(body);
    const errors = createContract.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    const contract = await this.contractService.createContract(createContract.toDTO(), userId);
    return {
      success: true,
      message: 'Contract created successfully',
      data: contract,
    };
  };

  update = async ({
    params: { id },
    body,
    userId,
  }: {
    params: { id: number };
    body: any;
    userId: number;
  }) => {
    const updateContract = UpdateContract.fromJSON(body);
    const errors = updateContract.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    const contract = await this.contractService.updateContract(id, updateContract.toDTO(), userId);
    return {
      success: true,
      message: 'Contract updated successfully',
      data: contract,
    };
  };

  delete = async ({
    params: { id },
    userId,
    set,
  }: {
    params: { id: number };
    userId: number;
    set: any;
  }) => {
    const deleted = await this.contractService.deleteContract(id, userId);
    if (!deleted) {
      set.status = 404;
      return {
        success: false,
        message: 'Contract not found',
      };
    }

    return {
      success: true,
      message: 'Contract deleted successfully',
    };
  };
}

