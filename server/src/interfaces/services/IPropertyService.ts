import { PropertyDTO, CreatePropertyDTO, UpdatePropertyDTO } from '../../dtos/property.dto';

export interface IPropertyService {
  getAllProperties(userId: number): Promise<PropertyDTO[]>;
  getPropertyById(id: number, userId: number): Promise<PropertyDTO>;
  createProperty(data: CreatePropertyDTO, userId: number): Promise<PropertyDTO>;
  updateProperty(id: number, data: UpdatePropertyDTO, userId: number): Promise<PropertyDTO>;
  deleteProperty(id: number, userId: number): Promise<boolean>;
}
