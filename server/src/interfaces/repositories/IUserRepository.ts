import { UserEntity } from '../../entities/User.entity';

export interface IUserRepository {
  findAll(): Promise<UserEntity[]>;
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  update(id: number, user: UserEntity): Promise<UserEntity>;
  delete(id: number): Promise<boolean>;
}
