import { IRentalRepository } from '../../interfaces/repositories/IRentalRepository';
import { RentalEntity } from '../../entities/Rental.entity';
import { prisma } from '../../lib/prisma';

export class PrismaRentalRepository implements IRentalRepository {
  async findAll(): Promise<RentalEntity[]> {
    const rentals = await prisma.rental.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentId: true
          }
        },
        property: {
          select: {
            id: true,
            ubicacion: true,
            localNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return rentals.map(rental => RentalEntity.fromPrisma(rental));
  }

  async findById(id: number): Promise<RentalEntity | null> {
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentId: true
          }
        },
        property: {
          select: {
            id: true,
            ubicacion: true,
            localNumber: true
          }
        }
      }
    });
    return rental ? RentalEntity.fromPrisma(rental) : null;
  }

  async create(entity: RentalEntity): Promise<RentalEntity> {
    const rental = await prisma.rental.create({
      data: entity.toPrisma(),
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentId: true
          }
        },
        property: {
          select: {
            id: true,
            ubicacion: true,
            localNumber: true
          }
        }
      }
    });
    return RentalEntity.fromPrisma(rental);
  }

  async update(entity: RentalEntity): Promise<RentalEntity> {
    const rental = await prisma.rental.update({
      where: { id: entity.id! },
      data: entity.toPrisma(),
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentId: true
          }
        },
        property: {
          select: {
            id: true,
            ubicacion: true,
            localNumber: true
          }
        }
      }
    });
    return RentalEntity.fromPrisma(rental);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.rental.delete({
        where: { id }
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
