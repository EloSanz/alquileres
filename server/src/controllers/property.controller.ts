import { IPropertyService } from '../interfaces/services/IPropertyService';
import { CreatePropertyDTO, UpdatePropertyDTO } from '../dtos/property.dto';

export class PropertyController {
  constructor(private propertyService: IPropertyService) {}

  getAll = async ({ userId }: { userId: number }) => {
    const properties = await this.propertyService.getAllProperties(userId);
    return {
      success: true,
      message: 'Properties retrieved successfully',
      data: properties,
    };
  };

  getById = async ({
    params: { id },
    userId,
  }: {
    params: { id: number };
    userId: number;
  }) => {
    const property = await this.propertyService.getPropertyById(id, userId);
    return {
      success: true,
      message: 'Property retrieved successfully',
      data: property,
    };
  };

  create = async ({
    body,
    userId,
  }: {
    body: CreatePropertyDTO;
    userId: number;
  }) => {
    const property = await this.propertyService.createProperty(body, userId);
    return {
      success: true,
      message: 'Property created successfully',
      data: property,
    };
  };

  update = async ({
    params: { id },
    body,
    userId,
  }: {
    params: { id: number };
    body: UpdatePropertyDTO;
    userId: number;
  }) => {
    const property = await this.propertyService.updateProperty(id, body, userId);
    return {
      success: true,
      message: 'Property updated successfully',
      data: property,
    };
  };

  release = async ({
    params: { id },
    userId,
  }: {
    params: { id: number };
    userId: number;
  }) => {
    const property = await this.propertyService.releaseProperty(id, userId);

    return {
      success: true,
      message: 'Property released successfully',
      data: property,
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
    const deleted = await this.propertyService.deleteProperty(id, userId);
    if (!deleted) {
      set.status = 404;
      return {
        success: false,
        message: 'Property not found',
      };
    }

    return {
      success: true,
      message: 'Property deleted successfully',
    };
  };
}
