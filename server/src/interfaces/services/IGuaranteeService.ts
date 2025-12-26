import { GuaranteeDTO, CreateGuaranteeDTO, UpdateGuaranteeDTO } from '../../dtos/guarantee.dto';

export interface IGuaranteeService {
  getAllGuarantees(userId: number): Promise<GuaranteeDTO[]>;
  getGuaranteeById(id: number, userId: number): Promise<GuaranteeDTO>;
  createGuarantee(data: CreateGuaranteeDTO, userId: number): Promise<GuaranteeDTO>;
  updateGuarantee(id: number, data: UpdateGuaranteeDTO, userId: number): Promise<GuaranteeDTO>;
  deleteGuarantee(id: number, userId: number): Promise<boolean>;
}
