import { Elysia, t } from 'elysia';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../implementations/services/UserService';
import { PrismaUserRepository } from '../implementations/repositories/PrismaUserRepository';

// Dependency injection
const userRepository = new PrismaUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export const userRoutes = new Elysia({ prefix: '/api/users' })
  .get('/', userController.getAll, {
    detail: {
      tags: ['Users'],
      summary: 'Get all users'
    }
  })
  .get('/:id', userController.getById, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Users'],
      summary: 'Get user by ID'
    }
  })
  .get('/email/:email', userController.getByEmail, {
    params: t.Object({
      email: t.String({ format: 'email' })
    }),
    detail: {
      tags: ['Users'],
      summary: 'Get user by email'
    }
  })
  .get('/username/:username', userController.getByUsername, {
    params: t.Object({
      username: t.String({ minLength: 1 })
    }),
    detail: {
      tags: ['Users'],
      summary: 'Get user by username'
    }
  })
  .post('/', userController.create, {
    body: t.Object({
      username: t.String({ minLength: 3 }),
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 })
    }),
    detail: {
      tags: ['Users'],
      summary: 'Create new user'
    }
  })
  .put('/:id', userController.update, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    body: t.Object({
      username: t.Optional(t.String({ minLength: 3 })),
      email: t.Optional(t.String({ format: 'email' })),
      password: t.Optional(t.String({ minLength: 6 }))
    }),
    detail: {
      tags: ['Users'],
      summary: 'Update user by ID'
    }
  })
  .delete('/:id', userController.delete, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Users'],
      summary: 'Delete user by ID'
    }
  });
