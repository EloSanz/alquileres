import { RentalEntity } from '../../entities/Rental.entity';

export interface IRentalRepository {
  findAll(): Promise<RentalEntity[]>;
  findById(id: number): Promise<RentalEntity | null>;
  create(entity: RentalEntity): Promise<RentalEntity>;
  update(entity: RentalEntity): Promise<RentalEntity>;
  delete(id: number): Promise<boolean>;
}
