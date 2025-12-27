import { BaseException } from './BaseException';

export class ConflictError extends BaseException {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

