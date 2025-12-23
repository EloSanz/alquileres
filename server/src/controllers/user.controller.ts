import { IUserService } from '../interfaces/services/IUserService';

export class UserController {
  constructor(private userService: IUserService) {}

  getAll = async () => {
    const users = await this.userService.getAllUsers();
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    };
  };

  getById = async ({ params: { id } }: { params: { id: number } }) => {
    const user = await this.userService.getUserById(id);
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  };

  getByEmail = async ({ params: { email } }: { params: { email: string } }) => {
    const user = await this.userService.getUserByEmail(email);
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  };

  getByUsername = async ({ params: { username } }: { params: { username: string } }) => {
    const user = await this.userService.getUserByUsername(username);
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  };

  create = async ({ body }: { body: any }) => {
    const user = await this.userService.createUser(body);
    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  };

  update = async ({
    params: { id },
    body,
  }: {
    params: { id: number };
    body: any;
  }) => {
    const user = await this.userService.updateUser(id, body);
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  };

  delete = async ({
    params: { id },
    set,
  }: {
    params: { id: number };
    set: any;
  }) => {
    const deleted = await this.userService.deleteUser(id);
    if (!deleted) {
      set.status = 404;
      return {
        success: false,
        message: 'User not found',
      };
    }

    return {
      success: true,
      message: 'User deleted successfully',
    };
  };
}
