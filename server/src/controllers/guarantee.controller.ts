import { IGuaranteeService } from '../interfaces/services/IGuaranteeService';
import { CreateGuarantee, UpdateGuarantee } from '../../../shared/types/Guarantee';

export class GuaranteeController {
  constructor(private guaranteeService: IGuaranteeService) {}

  getAll = async ({ userId }: { userId: number }) => {
    const guarantees = await this.guaranteeService.getAllGuarantees(userId);
    return {
      success: true,
      message: 'Guarantees retrieved successfully',
      data: guarantees,
    };
  };

  getById = async ({
    params: { id },
    userId,
  }: {
    params: { id: number };
    userId: number;
  }) => {
    const guarantee = await this.guaranteeService.getGuaranteeById(id, userId);
    return {
      success: true,
      message: 'Guarantee retrieved successfully',
      data: guarantee,
    };
  };

  create = async ({
    body,
    userId,
  }: {
    body: any;
    userId: number;
  }) => {
    const createGuarantee = CreateGuarantee.fromJSON(body);
    const errors = createGuarantee.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    const guarantee = await this.guaranteeService.createGuarantee(createGuarantee.toDTO(), userId);
    return {
      success: true,
      message: 'Guarantee created successfully',
      data: guarantee,
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
    const updateGuarantee = UpdateGuarantee.fromJSON(body);
    const errors = updateGuarantee.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    const guarantee = await this.guaranteeService.updateGuarantee(id, updateGuarantee.toDTO(), userId);
    return {
      success: true,
      message: 'Guarantee updated successfully',
      data: guarantee,
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
    const deleted = await this.guaranteeService.deleteGuarantee(id, userId);
    if (!deleted) {
      set.status = 404;
      return {
        success: false,
        message: 'Guarantee not found',
      };
    }

    return {
      success: true,
      message: 'Guarantee deleted successfully',
    };
  };
}
