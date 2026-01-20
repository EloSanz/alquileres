// Schema de datos del contrato basado en contrato de arrendamiento peruano
export interface ContractData {
  // Arrendador
  arrendador_nombre: string;
  arrendador_ruc: string;
  gerente_nombre: string;
  gerente_dni: string;
  gerente_partida_registral: string;
  arrendador_domicilio: string;
  arrendador_distrito: string;
  arrendador_provincia: string;
  arrendador_departamento: string;

  // Arrendatario
  arrendatario_nombre: string;
  arrendatario_dni: string;
  arrendatario_domicilio: string;
  arrendatario_distrito: string;
  arrendatario_provincia: string;
  arrendatario_departamento: string;

  // Inmueble
  inmueble_direccion: string;
  inmueble_partida_registral: string;
  inmueble_zona_registral: string;
  stand_numero: string;
  total_stands: string;

  // Propietario del bien (para comodato)
  propietario_nombre: string;
  propietario_ruc: string;
  propietario_domicilio: string;
  propietario_representante: string;
  propietario_representante_dni: string;
  propietario_partida_registral: string;

  // Fechas
  fecha_inicio: string; // ISO date string
  fecha_fin: string;    // ISO date string
  plazo_meses: string;

  // Financiero
  renta_mensual: string;
  renta_texto: string; // "MIL CON 00/100 SOLES"
  garantia_monto: string;
  garantia_texto: string;
  adelanto_monto: string;
  adelanto_texto: string;
  penalidad_diaria: string;
  penalidad_texto: string;
  dia_vencimiento: string;
  tolerancia_dias: string;

  // Banco
  banco_nombre: string;
  banco_cuenta: string;
  banco_cci: string;

  // Firma
  lugar_firma: string;
  fecha_firma: string;
}

export class ContractDraft {
  constructor(
    public id: number,
    public name: string,
    public data: ContractData,
    public createdAt: string,
    public updatedAt: string
  ) { }

  validate(): string[] {
    const errors: string[] = [];
    if (!this.name || this.name.trim().length === 0) errors.push('Name is required');
    if (!this.data) errors.push('Contract data is required');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): ContractDraft {
    return new ContractDraft(
      data.id,
      data.name,
      data.data,
      data.createdAt,
      data.updatedAt
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class CreateContractDraft {
  constructor(
    public name: string,
    public data: ContractData
  ) { }

  validate(): string[] {
    const errors: string[] = [];
    if (!this.name || this.name.trim().length === 0) errors.push('Name is required');
    if (!this.data) errors.push('Contract data is required');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): CreateContractDraft {
    return new CreateContractDraft(
      data.name,
      data.data
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class UpdateContractDraft {
  constructor(
    public name?: string,
    public data?: ContractData
  ) { }

  validate(): string[] {
    const errors: string[] = [];
    if (this.name !== undefined && this.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    }
    return errors;
  }

  toJSON() {
    const result: any = {};
    if (this.name !== undefined) result.name = this.name;
    if (this.data !== undefined) result.data = this.data;
    return result;
  }

  static fromJSON(data: any): UpdateContractDraft {
    return new UpdateContractDraft(
      data.name,
      data.data
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

// Valores por defecto para un contrato nuevo
export const defaultContractData: ContractData = {
  // Arrendador
  arrendador_nombre: 'LA EMPRESA INMOBILIARIA PENTA MONT S.A.',
  arrendador_ruc: '20310173275',
  gerente_nombre: 'ROMAN MICHAEL ARELLANO RIVERA',
  gerente_dni: '08885646',
  gerente_partida_registral: '05003448',
  arrendador_domicilio: ' Jirón Tacna Nº 628 (manzana 32 lote 8-9)',
  arrendador_distrito: 'Callería',
  arrendador_provincia: 'Coronel Portillo',
  arrendador_departamento: 'Ucayali',

  // Arrendatario (vacío para llenar)
  arrendatario_nombre: '',
  arrendatario_dni: '',
  arrendatario_domicilio: '',
  arrendatario_distrito: 'Callería',
  arrendatario_provincia: 'Coronel Portillo',
  arrendatario_departamento: 'Ucayali',

  // Inmueble
  inmueble_direccion: 'Jr. Tacna Mz. 32, Lt. 8-9D',
  inmueble_partida_registral: '11162972',
  inmueble_zona_registral: 'VI - Sede Pucallpa',
  stand_numero: '',
  total_stands: '25',

  // Propietario
  propietario_nombre: 'TRANSPORTES ARELLANO S.A.',
  propietario_ruc: '20109272851',
  propietario_domicilio: 'Av. Nicolás Arriola Nro. 1415 Urb. Apolo, La Victoria, Lima',
  propietario_representante: 'MORENO ARELLANO, VICENTE PAUL',
  propietario_representante_dni: '07465280',
  propietario_partida_registral: '02011638',

  // Fechas
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  plazo_meses: '12',

  // Financiero
  renta_mensual: '1600.00',
  renta_texto: 'MIL SEISCIENTOS CON 00 SOLES',
  garantia_monto: '1600.00',
  garantia_texto: 'MIL SEISCIENTOS CON 00 SOLES',
  adelanto_monto: '1600.00',
  adelanto_texto: 'MIL SEISCIENTOS CON 00 SOLES',
  penalidad_diaria: '50.00',
  penalidad_texto: 'CINCUENTA DOLARES',
  dia_vencimiento: '29',
  tolerancia_dias: '3',

  // Banco
  banco_nombre: 'BANCO DE CRÉDITO DEL PERÚ',
  banco_cuenta: '480-7091217-0-36',
  banco_cci: '002-480-007091217036-25',

  // Firma
  lugar_firma: 'Pucallpa',
  fecha_firma: new Date().toISOString().split('T')[0],
};
