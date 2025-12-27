import { AuthUserDTO, LoginDTO } from '../../entities/User.entity';
import { CreateUserDTO, UserDTO } from '../../dtos/user.dto';

export interface IAuthService {
  register(data: CreateUserDTO): Promise<AuthUserDTO>;
  login(data: LoginDTO): Promise<AuthUserDTO>;
  getCurrentUser(userId: number): Promise<UserDTO>;
  getAllUsers(): Promise<UserDTO[]>;
}
