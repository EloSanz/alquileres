import { ITaxService } from '../interfaces/services/ITaxService';
import { CreateTax, UpdateTax } from '../../../shared/types/Tax';

export class TaxController {
  constructor(private taxService: ITaxService) {}

  getAll = async ({ userId }: { userId: number }) => {
    const taxes = await this.taxService.getAllTaxes(userId);
    return {
      success: true,
      message: 'Taxes retrieved successfully',
      data: taxes,
    };
  };

  getById = async ({
    params: { id },
    userId,
  }: {
    params: { id: number };
    userId: number;
  }) => {
    const tax = await this.taxService.getTaxById(id, userId);
    return {
      success: true,
      message: 'Tax retrieved successfully',
      data: tax,
    };
  };

  create = async ({
    body,
    userId,
  }: {
    body: any;
    userId: number;
  }) => {
    const createTax = CreateTax.fromJSON(body);
    const errors = createTax.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    const tax = await this.taxService.createTax(createTax.toDTO(), userId);
    return {
      success: true,
      message: 'Tax created successfully',
      data: tax,
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
    const updateTax = UpdateTax.fromJSON(body);
    const errors = updateTax.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    const tax = await this.taxService.updateTax(id, updateTax.toDTO(), userId);
    return {
      success: true,
      message: 'Tax updated successfully',
      data: tax,
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
    const deleted = await this.taxService.deleteTax(id, userId);
    if (!deleted) {
      set.status = 404;
      return {
        success: false,
        message: 'Tax not found',
      };
    }

    return {
      success: true,
      message: 'Tax deleted successfully',
    };
  };
}
