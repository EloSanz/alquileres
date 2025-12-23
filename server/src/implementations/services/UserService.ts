import { IUserService } from '../../interfaces/services/IUserService';
import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { UserDTO, CreateUserDTO, UpdateUserDTO } from '../../dtos/user.dto';
import { UserEntity } from '../../entities/User.entity';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getAllUsers(): Promise<UserDTO[]> {
    const entities = await this.userRepository.findAll();
    return entities.map(entity => entity.toDTO());
  }

  async getUserById(id: number): Promise<UserDTO> {
    const entity = await this.userRepository.findById(id);
    if (!entity) {
      throw new Error('User not found');
    }
    return entity.toDTO();
  }

  async getUserByEmail(email: string): Promise<UserDTO> {
    const entity = await this.userRepository.findByEmail(email);
    if (!entity) {
      throw new Error('User not found');
    }
    return entity.toDTO();
  }

  async getUserByUsername(username: string): Promise<UserDTO> {
    const entity = await this.userRepository.findByUsername(username);
    if (!entity) {
      throw new Error('User not found');
    }
    return entity.toDTO();
  }

  async createUser(data: CreateUserDTO): Promise<UserDTO> {
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

    // Create entity
    const entity = new UserEntity(
      null,
      data.username,
      data.email,
      data.password,
      new Date(),
      new Date()
    );

    // Validate and hash password
    entity.validate();
    await entity.hashPassword();

    // Save
    const created = await this.userRepository.create(entity);
    return created.toDTO();
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<UserDTO> {
    const entity = await this.userRepository.findById(id);
    if (!entity) {
      throw new Error('User not found');
    }

    // Check email uniqueness if updating email
    if (data.email) {
      const existingEmail = await this.userRepository.findByEmail(data.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new Error('Email already in use');
      }
      entity.email = data.email;
    }

    // Check username uniqueness if updating username
    if (data.username) {
      const existingUsername = await this.userRepository.findByUsername(data.username);
      if (existingUsername && existingUsername.id !== id) {
        throw new Error('Username already taken');
      }
      entity.username = data.username;
    }

    entity.updatedAt = new Date();
    entity.validate();

    const updated = await this.userRepository.update(id, entity);
    return updated.toDTO();
  }

  async deleteUser(id: number): Promise<boolean> {
    const entity = await this.userRepository.findById(id);
    if (!entity) {
      throw new Error('User not found');
    }

    const deleted = await this.userRepository.delete(id);
    return deleted;
  }
}