import { IAuthService } from '../interfaces/services/IAuthService';
import { CreateUserDTO, LoginDTO } from '../entities/User.entity';

export class AuthController {
  constructor(private authService: IAuthService) {}

  register = async ({ body }: { body: CreateUserDTO }) => ({
    success: true,
    message: 'User registered successfully',
    data: await this.authService.register(body),
    timestamp: new Date().toISOString()
  });

  login = async ({ body }: { body: LoginDTO }) => ({
    success: true,
    message: 'Login successful',
    data: await this.authService.login(body),
    timestamp: new Date().toISOString()
  });

  getCurrentUser = async (userId: number) => {
    console.log('Controller getCurrentUser called with userId:', userId);
    return {
      success: true,
      message: 'Current user retrieved successfully',
      data: await this.authService.getCurrentUser(userId),
      timestamp: new Date().toISOString()
    };
  };

  getAllUsers = async () => ({
    success: true,
    message: 'Users retrieved successfully',
    data: await this.authService.getAllUsers(),
    timestamp: new Date().toISOString()
  });
}
