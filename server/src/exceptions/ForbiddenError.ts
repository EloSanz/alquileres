import { BaseException } from './BaseException';

export class ForbiddenError extends BaseException {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

