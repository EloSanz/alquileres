import { TaxDTO, CreateTaxDTO, UpdateTaxDTO } from '../../dtos/tax.dto';

export interface ITaxService {
  getAllTaxes(userId: number): Promise<TaxDTO[]>;
  getTaxById(id: number, userId: number): Promise<TaxDTO>;
  createTax(data: CreateTaxDTO, userId: number): Promise<TaxDTO>;
  updateTax(id: number, data: UpdateTaxDTO, userId: number): Promise<TaxDTO>;
  deleteTax(id: number, userId: number): Promise<boolean>;
}
