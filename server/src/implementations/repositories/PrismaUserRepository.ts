import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { UserEntity } from '../../entities/User.entity';
import { prisma } from '../../lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class PrismaUserRepository implements IUserRepository {
  async findAll(): Promise<UserEntity[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return users.map(user => UserEntity.fromPrisma(user));
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { username } });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const data = user.toPrisma();
    delete (data as any).id;
    const created = await prisma.user.create({ data });
    return UserEntity.fromPrisma(created);
  }

  async update(id: number, user: UserEntity): Promise<UserEntity> {
    const data = user.toPrisma();
    delete (data as any).id;
    delete (data as any).createdAt;
    const updated = await prisma.user.update({ where: { id }, data });
    return UserEntity.fromPrisma(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
