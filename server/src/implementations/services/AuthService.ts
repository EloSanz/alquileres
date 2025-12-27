import { IAuthService } from '../../interfaces/services/IAuthService';
import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { AuthUserDTO, LoginDTO, UserEntity } from '../../entities/User.entity';
import { CreateUserDTO, UserDTO } from '../../dtos/user.dto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../types/jwt.types';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../exceptions';

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private jwtSecret: string = JWT_SECRET
  ) {}

  async register(data: CreateUserDTO): Promise<AuthUserDTO> {
    // Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Create user entity
    const user = new UserEntity(
      null,
      data.username,
      data.email,
      data.password, // Will be hashed in the entity
      new Date(),
      new Date()
    );

    // Validate
    user.validate();

    // Hash password
    await user.hashPassword();

    // Save user
    const createdUser = await this.userRepository.create(user);

    // Generate token
    const token = this.generateToken(createdUser.id!);

    return createdUser.toAuthDTO(token);
  }

  async login(data: LoginDTO): Promise<AuthUserDTO> {
    // Find user by email first, then by username if not found
    let user = await this.userRepository.findByEmail(data.identifier);

    if (!user) {
      // If not found by email, try by username
      user = await this.userRepository.findByUsername(data.identifier);
    }

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Validate password
    const isValidPassword = await user.validatePassword(data.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user.id!);

    return user.toAuthDTO(token);
  }

  async getCurrentUser(userId: number): Promise<UserDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }
    return user.toDTO();
  }

  async getAllUsers(): Promise<UserDTO[]> {
    const users = await this.userRepository.findAll();
    return users.map(user => user.toDTO());
  }

  private generateToken(userId: number): string {
    return jwt.sign(
      { userId, iat: Math.floor(Date.now() / 1000) },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): { userId: number } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }
}
