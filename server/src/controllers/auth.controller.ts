import { IAuthService } from '../interfaces/services/IAuthService';
import { LoginDTO } from '../entities/User.entity';
import { CreateUser } from '../../../shared/types/User';

export class AuthController {
  constructor(private authService: IAuthService) {}

  register = async ({ body }: { body: any }) => {
    const createUser = CreateUser.fromJSON(body);
    const errors = createUser.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    return {
      success: true,
      message: 'User registered successfully',
      data: await this.authService.register(createUser.toDTO()),
      timestamp: new Date().toISOString()
    };
  };

  login = async ({ body }: { body: LoginDTO }) => ({
    success: true,
    message: 'Login successful',
    data: await this.authService.login(body),
    timestamp: new Date().toISOString()
  });

  getCurrentUser = async (userId: number) => ({
    success: true,
    message: 'Current user retrieved successfully',
    data: await this.authService.getCurrentUser(userId),
    timestamp: new Date().toISOString()
  });

  getAllUsers = async () => ({
    success: true,
    message: 'Users retrieved successfully',
    data: await this.authService.getAllUsers(),
    timestamp: new Date().toISOString()
  });
}
