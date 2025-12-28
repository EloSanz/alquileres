import { Property } from './Property';
import { Contract } from './Contract';

export class PropertyWithContract {
  constructor(
    public property: Property,
    public contract: Contract | null
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (!this.property) errors.push('Property is required');
    if (!this.contract && this.property.tenantId == null) {
      errors.push('Property must have either a contract or a tenantId');
    }
    return errors;
  }

  toJSON() {
    return {
      property: this.property.toJSON(),
      contract: this.contract?.toJSON() || null
    };
  }

  static fromJSON(data: any): PropertyWithContract {
    return new PropertyWithContract(
      Property.fromJSON(data.property),
      data.contract ? Contract.fromJSON(data.contract) : null
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

