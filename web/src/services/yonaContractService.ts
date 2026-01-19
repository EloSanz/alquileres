export interface YonaContractData {
    arrendador_nombre: string;
    arrendador_dni: string;
    arrendador_domicilio: string;

    arrendatario_nombre: string;
    arrendatario_dni: string;
    arrendatario_domicilio: string;

    stand_numero: string;

    fecha_inicio: string;
    fecha_fin: string;
    plazo_meses: string;

    renta_mensual: string;
    renta_texto: string;
    dia_vencimiento: string;

    garantia_monto: string;

    lugar_firma: string;
    fecha_firma: string;

    // Additional fields identified in Yona components or requested validation
    vehiculo_placa: string;
    vehiculo_marca: string;
    vehiculo_modelo: string;
    metodo_pago: string; // "EFECTIVO", "YAPE", "PLIN", "TRANSFERENCIA"
}

export const defaultYonaContractData: YonaContractData = {
    arrendador_nombre: "Yona Yinka Arellano Baldoceda",
    arrendador_dni: "06011353",
    arrendador_domicilio: "JR. RODRIGUEZ DE MENDOZA 284 - CHANCHAMAYO - JUNIN", // Updated from RUC image

    arrendatario_nombre: "",
    arrendatario_dni: "",
    arrendatario_domicilio: "",

    stand_numero: "",

    fecha_inicio: "",
    fecha_fin: "",
    plazo_meses: "",

    renta_mensual: "300",
    renta_texto: "TRESCIENTOS",
    dia_vencimiento: "",

    garantia_monto: "",

    lugar_firma: "Lima",
    fecha_firma: new Date().toISOString().split('T')[0],

    vehiculo_placa: "",
    vehiculo_marca: "",
    vehiculo_modelo: "",
    metodo_pago: "EFECTIVO"
};

export interface YonaHandoverData {
    estacionamiento_numero: string;
    edificio_direccion: string;
    entrega_receptor_nombre: string;
    entrega_receptor_dni: string;
    entrega_receptor_partida: string;
    compradora_nombre: string;
    compradora_dni: string;
    inmobiliaria_nombre: string;
    items_entrega: string;
    lugar_fecha_entrega: string;
}

export const defaultYonaHandoverData: YonaHandoverData = {
    estacionamiento_numero: "doble N° 3 - 4",
    edificio_direccion: "Calle Victor Almozara 261 – Surquillo de la provincia y departamento de Lima",
    entrega_receptor_nombre: "Milagros Ernestina Mazzetto Arellano",
    entrega_receptor_dni: "40875711",
    entrega_receptor_partida: "15797549",
    compradora_nombre: "Yona Yinka Arellano Baldoceda",
    compradora_dni: "06011353",
    inmobiliaria_nombre: "METROPOLI 3 SAC",
    items_entrega: "- 1 control remote puerta vehicular",
    lugar_fecha_entrega: `Lima, ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
};
