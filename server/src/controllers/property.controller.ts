import { IPropertyService } from '../interfaces/services/IPropertyService';
import { CreatePropertyDTO, UpdatePropertyDTO } from '../dtos/property.dto';

export class PropertyController {
  constructor(private propertyService: IPropertyService) {}

  getAll = async ({ getCurrentUserId }: { getCurrentUserId: () => Promise<number> }) => {
    const userId = await getCurrentUserId();
    const properties = await this.propertyService.getAllProperties(userId);
    return {
      success: true,
      message: 'Properties retrieved successfully',
      data: properties,
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
    const property = await this.propertyService.getPropertyById(id, userId);
    return {
      success: true,
      message: 'Property retrieved successfully',
      data: property,
    };
  };

  create = async ({
    body,
    getCurrentUserId,
  }: {
    body: CreatePropertyDTO;
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
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
    getCurrentUserId,
  }: {
    params: { id: number };
    body: UpdatePropertyDTO;
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    const property = await this.propertyService.updateProperty(id, body, userId);
    return {
      success: true,
      message: 'Property updated successfully',
      data: property,
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
    await this.propertyService.deleteProperty(id, userId);
    return {
      success: true,
      message: 'Property deleted successfully',
    };
  };
}
