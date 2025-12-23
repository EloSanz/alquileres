import { UserDTO, CreateUserDTO, UpdateUserDTO } from '../../dtos/user.dto';

export interface IUserService {
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;
  getUserByEmail(email: string): Promise<UserDTO>;
  getUserByUsername(username: string): Promise<UserDTO>;
  createUser(data: CreateUserDTO): Promise<UserDTO>;
  updateUser(id: number, data: UpdateUserDTO): Promise<UserDTO>;
  deleteUser(id: number): Promise<boolean>;
}
