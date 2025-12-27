import bcrypt from 'bcryptjs'
import { UserDTO } from '../dtos/user.dto';
import { User } from '../../../shared/types/User';

export class UserEntity {
  constructor(
    public id: number | null,
    public username: string,
    public email: string,
    public password: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromPrisma(prismaData: any): UserEntity {
    return new UserEntity(
      prismaData.id,
      prismaData.username,
      prismaData.email,
      prismaData.password,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }

  toPrisma() {
    return {
      id: this.id || undefined,
      username: this.username,
      email: this.email,
      password: this.password,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): UserDTO {
    return User.fromJSON({
      id: this.id!,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    });
  }

  toAuthDTO(token: string): AuthUserDTO {
    return {
      user: this.toDTO(),
      token
    };
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  validate(): void {
    if (!this.username || this.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!this.email || !this.email.includes('@')) {
      throw new Error('Invalid email address');
    }
    if (!this.password || this.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  }
}

// Auth DTO types (not shared, specific to auth flow)
export interface AuthUserDTO {
  user: UserDTO;
  token: string;
}

export interface LoginDTO {
  identifier: string; // Can be either email or username
  password: string;
}
