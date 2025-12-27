import { BaseException } from './BaseException';

export class ValidationError extends BaseException {
  public readonly errors?: string[];

  constructor(message: string, errors?: string[]) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

