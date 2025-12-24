import { ContractDTO, CreateContractDTO, UpdateContractDTO } from '../../dtos/contract.dto';

export interface IContractService {
  getAllContracts(userId: number): Promise<ContractDTO[]>;
  getContractById(id: number, userId: number): Promise<ContractDTO>;
  getContractProgress(contractId: number, userId: number): Promise<{
    totalMonths: number;
    paidMonths: number;
    pendingMonths: number;
    overdueMonths: number;
  }>;
  getActiveContractByTenant(tenantId: number, userId: number): Promise<ContractDTO | null>;
  getActiveContractByProperty(propertyId: number, userId: number): Promise<ContractDTO | null>;
  createContract(data: CreateContractDTO, userId: number): Promise<ContractDTO>;
  updateContract(id: number, data: UpdateContractDTO, userId: number): Promise<ContractDTO>;
  deleteContract(id: number, userId: number): Promise<boolean>;
}

