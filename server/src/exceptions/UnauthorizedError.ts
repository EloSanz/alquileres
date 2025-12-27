import { BaseException } from './BaseException';

export class UnauthorizedError extends BaseException {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

