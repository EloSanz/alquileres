import { IRentalService } from '../interfaces/services/IRentalService';
import { CreateRentalDTO, UpdateRentalDTO } from '../dtos/rental.dto';

export class RentalController {
  constructor(private rentalService: IRentalService) {}

  getAll = async ({ getCurrentUserId }: { getCurrentUserId: () => Promise<number> }) => {
    const userId = await getCurrentUserId();
    const rentals = await this.rentalService.getAllRentals(userId);
    return {
      success: true,
      message: 'Rentals retrieved successfully',
      data: rentals,
    };
  };

  getById = async ({
    params: { id },
    getCurrentUserId,
  }: {
    params: { id: number };
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    const rental = await this.rentalService.getRentalById(id, userId);
    return {
      success: true,
      message: 'Rental retrieved successfully',
      data: rental,
    };
  };

  create = async ({
    body,
    getCurrentUserId,
  }: {
    body: CreateRentalDTO;
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    const rental = await this.rentalService.createRental(body, userId);
    return {
      success: true,
      message: 'Rental created successfully',
      data: rental,
    };
  };

  update = async ({
    params: { id },
    body,
    getCurrentUserId,
  }: {
    params: { id: number };
    body: UpdateRentalDTO;
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    const rental = await this.rentalService.updateRental(id, body, userId);
    return {
      success: true,
      message: 'Rental updated successfully',
      data: rental,
    };
  };

  delete = async ({
    params: { id },
    getCurrentUserId,
  }: {
    params: { id: number };
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    await this.rentalService.deleteRental(id, userId);
    return {
      success: true,
      message: 'Rental deleted successfully',
    };
  };
}
