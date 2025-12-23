import { IPropertyRepository } from '../../interfaces/repositories/IPropertyRepository';
import { PropertyEntity } from '../../entities/Property.entity';
import { prisma } from '../../lib/prisma';

export class PrismaPropertyRepository implements IPropertyRepository {
  async findAll(): Promise<PropertyEntity[]> {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return properties.map(property => PropertyEntity.fromPrisma(property));
  }

  async findById(id: number): Promise<PropertyEntity | null> {
    const property = await prisma.property.findUnique({
      where: { id }
    });
    return property ? PropertyEntity.fromPrisma(property) : null;
  }

  async create(entity: PropertyEntity): Promise<PropertyEntity> {
    const property = await prisma.property.create({
      data: entity.toPrisma()
    });
    return PropertyEntity.fromPrisma(property);
  }

  async update(entity: PropertyEntity): Promise<PropertyEntity> {
    const property = await prisma.property.update({
      where: { id: entity.id! },
      data: entity.toPrisma()
    });
    return PropertyEntity.fromPrisma(property);
  }

  async delete(id: number): Promise<void> {
    await prisma.property.delete({
      where: { id }
    });
  }
}
