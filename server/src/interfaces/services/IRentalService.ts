import { RentalDTO, CreateRentalDTO, UpdateRentalDTO } from '../../dtos/rental.dto';

export interface IRentalService {
  getAllRentals(userId: number): Promise<RentalDTO[]>;
  getRentalById(id: number, userId: number): Promise<RentalDTO>;
  createRental(data: CreateRentalDTO, userId: number): Promise<RentalDTO>;
  updateRental(id: number, data: UpdateRentalDTO, userId: number): Promise<RentalDTO>;
  deleteRental(id: number, userId: number): Promise<boolean>;
}
