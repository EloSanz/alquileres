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
    arrendador_nombre: "INVERSIONES YONA S.A.C.",
    arrendador_dni: "20608298782", // This is RUC actually based on previous context, but labeling as DNI for variable consitency or I should check. Let's stick to the prompt's implied simple structure. The user previously had distinct fields, I'll use a standard set.
    arrendador_domicilio: "AV. ALFONSO UGARTE NRO. 1360 (FTE A COMISARIA ALFONSO UGARTE) LIMA - LIMA - LIMA",

    arrendatario_nombre: "",
    arrendatario_dni: "",
    arrendatario_domicilio: "",

    stand_numero: "",

    fecha_inicio: "",
    fecha_fin: "",
    plazo_meses: "",

    renta_mensual: "",
    renta_texto: "",
    dia_vencimiento: "",

    garantia_monto: "",

    lugar_firma: "Lima",
    fecha_firma: new Date().toISOString().split('T')[0],

    vehiculo_placa: "",
    vehiculo_marca: "",
    vehiculo_modelo: "",
    metodo_pago: "EFECTIVO"
};
