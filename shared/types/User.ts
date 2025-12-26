export class User {
  constructor(
    public id: number,
    public username: string,
    public email: string,
    public createdAt: string,
    public updatedAt: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (!this.username || this.username.length < 3) errors.push('Username must be at least 3 characters');
    if (!this.email || !this.email.includes('@')) errors.push('Valid email is required');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): User {
    return new User(
      data.id,
      data.username,
      data.email,
      data.createdAt,
      data.updatedAt
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class CreateUser {
  constructor(
    public username: string,
    public email: string,
    public password: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (!this.username || this.username.length < 3) errors.push('Username must be at least 3 characters');
    if (!this.email || !this.email.includes('@')) errors.push('Valid email is required');
    if (!this.password || this.password.length < 6) errors.push('Password must be at least 6 characters');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): CreateUser {
    return new CreateUser(
      data.username,
      data.email,
      data.password
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class UpdateUser {
  constructor(
    public username?: string,
    public email?: string,
    public password?: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.username !== undefined && this.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    if (this.email !== undefined && !this.email.includes('@')) {
      errors.push('Valid email is required');
    }
    if (this.password !== undefined && this.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    return errors;
  }

  toJSON() {
    const result: any = {};
    if (this.username !== undefined) result.username = this.username;
    if (this.email !== undefined) result.email = this.email;
    if (this.password !== undefined) result.password = this.password;
    return result;
  }

  static fromJSON(data: any): UpdateUser {
    return new UpdateUser(
      data.username,
      data.email,
      data.password
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

