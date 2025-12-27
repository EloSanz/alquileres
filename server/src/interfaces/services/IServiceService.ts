import { ServiceDTO, CreateServiceDTO, UpdateServiceDTO } from '../../dtos/service.dto';

export interface IServiceService {
  getAllServices(userId: number): Promise<ServiceDTO[]>;
  getServiceById(id: number, userId: number): Promise<ServiceDTO>;
  createService(data: CreateServiceDTO, userId: number): Promise<ServiceDTO>;
  updateService(id: number, data: UpdateServiceDTO, userId: number): Promise<ServiceDTO>;
  deleteService(id: number, userId: number): Promise<boolean>;
}

