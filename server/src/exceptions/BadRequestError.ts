import { BaseException } from './BaseException';

export class BadRequestError extends BaseException {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST');
  }
}

