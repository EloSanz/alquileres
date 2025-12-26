import { IRentalService } from '../interfaces/services/IRentalService';
import { CreateRental, UpdateRental } from '../../../shared/types/Rental';

export class RentalController {
  constructor(private rentalService: IRentalService) {}

  getAll = async ({ userId }: { userId: number }) => {
    const rentals = await this.rentalService.getAllRentals(userId);
    return {
      success: true,
      message: 'Rentals retrieved successfully',
      data: rentals,
    };
  };

  getById = async ({
    params: { id },
    userId,
  }: {
    params: { id: number };
    userId: number;
  }) => {
    const rental = await this.rentalService.getRentalById(id, userId);
    return {
      success: true,
      message: 'Rental retrieved successfully',
      data: rental,
    };
  };

  create = async ({
    body,
    userId,
  }: {
    body: any;
    userId: number;
  }) => {
    const createRental = CreateRental.fromJSON(body);
    const errors = createRental.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    const rental = await this.rentalService.createRental(createRental.toDTO(), userId);
    return {
      success: true,
      message: 'Rental created successfully',
      data: rental,
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
    const updateRental = UpdateRental.fromJSON(body);
    const errors = updateRental.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    const rental = await this.rentalService.updateRental(id, updateRental.toDTO(), userId);
    return {
      success: true,
      message: 'Rental updated successfully',
      data: rental,
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
    const deleted = await this.rentalService.deleteRental(id, userId);
    if (!deleted) {
      set.status = 404;
      return {
        success: false,
        message: 'Rental not found',
      };
    }

    return {
      success: true,
      message: 'Rental deleted successfully',
    };
  };
}
