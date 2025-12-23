export interface UserDTO {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  password?: string;
}
