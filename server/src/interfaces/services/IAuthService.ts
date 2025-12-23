import { AuthUserDTO, CreateUserDTO, LoginDTO, UserDTO } from '../../entities/User.entity';

export interface IAuthService {
  register(data: CreateUserDTO): Promise<AuthUserDTO>;
  login(data: LoginDTO): Promise<AuthUserDTO>;
  getCurrentUser(userId: number): Promise<UserDTO>;
  getAllUsers(): Promise<UserDTO[]>;
}
