import { IAuthService } from '../../interfaces/services/IAuthService';
import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { AuthUserDTO, CreateUserDTO, LoginDTO, UserDTO, UserEntity } from '../../entities/User.entity';
import jwt from 'jsonwebtoken';

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private jwtSecret: string = process.env.JWT_SECRET || 'default-dev-secret'
  ) {}

  async register(data: CreateUserDTO): Promise<AuthUserDTO> {
    // Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new Error('Username already taken');
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
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Validate password
    const isValidPassword = await user.validatePassword(data.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user.id!);

    return user.toAuthDTO(token);
  }

  async getCurrentUser(userId: number): Promise<UserDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
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
