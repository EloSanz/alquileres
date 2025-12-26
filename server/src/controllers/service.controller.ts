import { IServiceService } from '../interfaces/services/IServiceService';
import { CreateServiceDTO, UpdateServiceDTO } from '../dtos/service.dto';

export class ServiceController {
  constructor(private serviceService: IServiceService) {}

  getAll = async ({ userId }: { userId: number }) => {
    const services = await this.serviceService.getAllServices(userId);
    return {
      success: true,
      message: 'Services retrieved successfully',
      data: services,
    };
  };

  getById = async ({
    params: { id },
    userId,
  }: {
    params: { id: number };
    userId: number;
  }) => {
    const service = await this.serviceService.getServiceById(id, userId);
    return {
      success: true,
      message: 'Service retrieved successfully',
      data: service,
    };
  };

  create = async ({
    body,
    userId,
  }: {
    body: CreateServiceDTO;
    userId: number;
  }) => {
    const service = await this.serviceService.createService(body, userId);
    return {
      success: true,
      message: 'Service created successfully',
      data: service,
    };
  };

  update = async ({
    params: { id },
    body,
    userId,
  }: {
    params: { id: number };
    body: UpdateServiceDTO;
    userId: number;
  }) => {
    const service = await this.serviceService.updateService(id, body, userId);
    return {
      success: true,
      message: 'Service updated successfully',
      data: service,
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
    const deleted = await this.serviceService.deleteService(id, userId);
    if (!deleted) {
      set.status = 404;
      return {
        success: false,
        message: 'Service not found',
      };
    }

    return {
      success: true,
      message: 'Service deleted successfully',
    };
  };
}

