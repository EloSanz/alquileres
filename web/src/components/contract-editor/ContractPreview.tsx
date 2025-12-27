import { memo } from 'react';
import type { ContractData } from '../../services/contractDraftService';

interface ContractPreviewProps {
  data: ContractData;
  fullPage?: boolean;
}

// Componente para mostrar placeholders con mensajes de campos faltantes
function PlaceholderText({ value, placeholder }: { value: string | number | null | undefined; placeholder: string }) {
  const stringValue = String(value || '').trim();
  if (!stringValue) {
    return (
      <span style={{
        color: '#d32f2f',
        fontStyle: 'italic',
        textDecoration: 'underline'
      }}>
        [Falta completar: {placeholder}]
      </span>
    );
  }
  return <strong>{stringValue}</strong>;
}

// Formato de fecha a texto largo
function formatDateLong(dateStr: string): string {
  if (!dateStr) return '____';
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} del ${year}`;
}

function ContractPreview({ data, fullPage }: ContractPreviewProps) {
  const fontSize = fullPage ? '11pt' : '10pt';
  const titleSize = fullPage ? '14pt' : '12pt';
  const subtitleSize = fullPage ? '12pt' : '11pt';

  // Estilos nativos para mejor compatibilidad con PDF
  const containerStyle = {
    fontFamily: 'Times, "Times New Roman", serif',
    fontSize,
    lineHeight: '1.4',
    color: '#000',
    backgroundColor: '#fff',
    maxWidth: fullPage ? '170mm' : 'none',
    margin: fullPage ? '0 auto' : '0',
    padding: fullPage ? '0 5mm' : '0',
    textAlign: 'justify' as const,
    wordWrap: 'break-word' as const,
    overflowWrap: 'break-word' as const,
  };

  const titleStyle = {
    textAlign: 'center' as const,
    fontWeight: 'bold',
    marginBottom: '8px',
    fontSize: titleSize,
  };

  const subtitleStyle = {
    textAlign: 'center' as const,
    marginBottom: '12px',
  };

  const sectionTitleStyle = {
    fontWeight: 'bold',
    marginBottom: '4px',
    fontSize: subtitleSize,
  };

  const paragraphStyle = {
    textAlign: 'justify' as const,
    marginBottom: '8px',
  };

  const dividerStyle = {
    borderTop: '1px solid #000',
    margin: '8px 0',
  };

  const signatureContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: fullPage ? '24px' : '16px',
    marginBottom: '8px',
  };

  const signatureBoxStyle = {
    width: '40%',
    textAlign: 'center' as const,
  };

  const signatureLineStyle = {
    borderTop: '1px solid #000',
    paddingTop: '4px',
    marginTop: '32px',
  };

  const signatureTextStyle = {
    fontWeight: 'bold',
  };

  const signatureNameStyle = {
    fontSize: '9pt',
  };

  return (
    <div style={containerStyle}>
      {/* Título */}
      <h1 style={titleStyle}>
        CONTRATO DE ARRENDAMIENTO COMERCIAL
      </h1>
      <p style={subtitleStyle}>
        Stand N.º <PlaceholderText value={data.stand_numero} placeholder="Número de Stand" /> - {data.lugar_firma || 'Pucallpa'}, Perú
      </p>

      <hr style={dividerStyle} />

      {/* Introducción */}
      <p style={paragraphStyle}>
        Conste por el presente documento el Contrato de Arrendamiento que celebran de una parte{' '}
        <PlaceholderText value={data.arrendador_nombre} placeholder="Nombre del Arrendador" />, identificada con RUC. Nº{' '}
        <PlaceholderText value={data.arrendador_ruc} placeholder="RUC del Arrendador" />, debidamente representada por el{' '}
        <strong>GERENTE GENERAL Sr. <PlaceholderText value={data.gerente_nombre} placeholder="Nombre del Gerente" /></strong>, identificado con DNI Nº{' '}
        <PlaceholderText value={data.gerente_dni} placeholder="DNI del Gerente" />, según poder inscrito en la partida electrónica Nº{' '}
        <PlaceholderText value={data.gerente_partida_registral} placeholder="Partida Registral del Gerente" /> del registro de personas jurídicas de la oficina registral de {data.lugar_firma || 'Pucallpa'},
        con domicilio fiscal sito en {data.arrendador_domicilio || '____'}, del distrito de {data.arrendador_distrito || '____'},
        provincia de {data.arrendador_provincia || '____'}, departamento de {data.arrendador_departamento || '____'},
        que en lo sucesivo se denominará <strong>EL ARRENDADOR</strong> y de la otra parte,
        Doña <PlaceholderText value={data.arrendatario_nombre} placeholder="Nombre del Arrendatario" />, identificado con D.N.I. Nº{' '}
        <PlaceholderText value={data.arrendatario_dni} placeholder="DNI del Arrendatario" />, con domicilio en {data.arrendatario_domicilio || '____'},
        distrito de {data.arrendatario_distrito || '____'}, provincia de {data.arrendatario_provincia || '____'} y
        departamento de {data.arrendatario_departamento || '____'}, a quien en adelante se le denominará{' '}
        <strong>EL ARRENDATARIO</strong> en los términos y condiciones de las cláusulas siguientes:
      </p>

      <hr style={dividerStyle} />

      {/* Antecedentes */}
      <h2 style={sectionTitleStyle}>
        ANTECEDENTES
      </h2>
      <p style={paragraphStyle}>
        <strong>PRIMERA:</strong> <strong>EL ARRENDADOR</strong> es conductor del inmueble ubicado sito en{' '}
        {data.inmueble_direccion || '____'}, distrito de {data.arrendador_distrito || '____'},
        provincia de {data.arrendador_provincia || '____'}, departamento de {data.arrendador_departamento || '____'},
        el mismo que se encuentra inscrito en la Partida Registral Nº <strong>{data.inmueble_partida_registral || '____'}</strong>,
        del Registro de la Propiedad Inmueble de la Zona Registral Nº <strong>{data.inmueble_zona_registral || '____'}</strong>,
        en mérito al Contrato de Comodato, mediante la cual la empresa propietaria del bien{' '}
        <strong>{data.propietario_nombre || '____'}</strong>, identificado con RUC Nº{' '}
        <strong>{data.propietario_ruc || '____'}</strong>, con domicilio fiscal sito en {data.propietario_domicilio || '____'},
        debidamente representado por su Apoderado Legal <strong>{data.propietario_representante || '____'}</strong>,
        identificado con DNI Nº <strong>{data.propietario_representante_dni || '____'}</strong>, conforme consta en su
        Certificado de Vigencia, inscrito en la <strong>Partida Registral Nº {data.propietario_partida_registral || '____'}</strong>,
        del Registro de Personas Jurídicas de la Zona Registral Nº IX - Sede Lima, otorga el bien en{' '}
        <strong>COMODATO CON CLÁUSULA DE AUTORIZACIÓN DE SUBARRIENDO (ANEXO 01-B)</strong>,
        en favor de la empresa <strong>{data.arrendador_nombre || '____'}</strong>.
      </p>
      <p style={paragraphStyle}>
        Que, sobre el bien inmueble descrito en el párrafo anterior se ha construido{' '}
        <strong>{data.total_stands || '____'}</strong> stands.
      </p>

      <hr style={dividerStyle} />

      {/* Objeto del Contrato */}
      <h2 style={sectionTitleStyle}>
        OBJETO DEL CONTRATO
      </h2>
      <p style={paragraphStyle}>
        <strong>SEGUNDA:</strong> Por el Presente documento, <strong>EL ARRENDADOR</strong> da en arrendamiento a{' '}
        <strong>EL ARRENDATARIO</strong> <strong>EL INMUEBLE</strong> de su propiedad, referido en la cláusula primera
        anterior, a fin de que sea ocupado por <strong>EL ARRENDATARIO</strong>; el{' '}
        <strong>STAND Nº {data.stand_numero || '____'}</strong> siendo este mismo destinado para el desarrollo de la
        actividad comercial.
      </p>
      <p style={paragraphStyle}>
        <strong>EL ARRENDATARIO</strong> declara conocer y reconoce que tanto <strong>EL INMUEBLE</strong> materia de
        este contrato como los accesorios que igualmente son objeto del presente arrendamiento, se encuentran en
        perfecto estado de conservación y funcionamiento, y en tal sentido se obliga a devolverlos en el estado en
        que los reciben y sin más deterioro que el ocasionado por el uso ordinario, cuidadoso y racional de los mismos.
      </p>

      <hr style={dividerStyle} />

      {/* Plazo del Contrato */}
      <h2 style={sectionTitleStyle}>
        PLAZO DEL CONTRATO
      </h2>
      <p style={paragraphStyle}>
        <strong>TERCERA:</strong> El plazo del presente contrato de arrendamiento, pactado de común acuerdo por las
        partes contratantes, es por el período de un <strong>({data.plazo_meses || '12'}) meses</strong>, que se inicia
        el <strong>{data.fecha_inicio ? formatDateLong(data.fecha_inicio) : <PlaceholderText value="" placeholder="Fecha de Inicio" />}</strong> y concluye indefectiblemente el{' '}
        <strong>{data.fecha_fin ? formatDateLong(data.fecha_fin) : <PlaceholderText value="" placeholder="Fecha de Fin" />}</strong>.
      </p>
      <p style={paragraphStyle}>
        En caso de que <strong>EL ARRENDATARIO</strong> deseara prorrogar el plazo del presente contrato, deberá
        solicitarlo a <strong>EL ARRENDADOR</strong> con una anticipación no menor de TREINTA (30) días a la fecha de
        conclusión del arrendamiento.
      </p>
      <p style={paragraphStyle}>
        En el supuesto que, a la terminación del presente contrato, por vencimiento del plazo o por resolución del
        contrato, <strong>EL ARRENDATARIO</strong> no cumpliese con entregar <strong>EL INMUEBLE</strong> arrendado a{' '}
        <strong>EL ARRENDADOR</strong>, y sin perjuicio de entenderse que el presente contrato no continúa,{' '}
        <strong>EL ARRENDATARIO</strong> queda obligado a pagar a <strong>EL ARRENDADOR</strong> una penalidad de{' '}
        <strong>$ {data.penalidad_diaria || '____'} ({data.penalidad_texto || '____'})</strong> por cada día de demora
        hasta la entrega efectiva de los inmuebles y sus accesorios a <strong>EL ARRENDADOR</strong>.
      </p>

      <hr style={dividerStyle} />

      {/* Merced Conductiva */}
      <h2 style={sectionTitleStyle}>
        LA MERCED CONDUCTIVA: FORMA Y OPORTUNIDAD DE PAGO
      </h2>
      <p style={paragraphStyle}>
        <strong>SEXTA:</strong> El pago de la renta mensual, convenida de mutuo acuerdo por las partes contratantes,
        es de <strong>S/<PlaceholderText value={data.renta_mensual} placeholder="Renta Mensual" /> ({data.renta_texto || '____'})</strong>, por el arrendamiento de{' '}
        <strong>EL INMUEBLE</strong> y de los accesorios.
      </p>
      <p style={paragraphStyle}>
        Cabe señalar que el pago de la renta será abonado los de cada <strong>{data.dia_vencimiento || '____'}</strong> de
        cada mes, con una tolerancia de <strong>{data.tolerancia_dias || '____'}</strong> días calendarios siguientes a
        su vencimiento.
      </p>
      <p style={paragraphStyle}>
        <strong>SETIMA:</strong> La renta será pagada por <strong>EL ARRENDATARIO</strong> mediante abono en la cuenta
        de Ahorros Soles del <strong>{data.banco_nombre || '____'} Nº {data.banco_cuenta || '____'}</strong>, con Código
        Interbancario Nº <strong>{data.banco_cci || '____'}</strong>, de propiedad de <strong>EL ARRENDADOR</strong>.
      </p>
      <p style={paragraphStyle}>
        El incumplimiento de pago oportuno de dos meses y 15 días consecutivos de renta constituye causal de resolución
        automática del presente contrato, sin necesidad de previo pronunciamiento judicial.
      </p>

      <hr style={dividerStyle} />

      {/* Importes Pecuniarios */}
      <h2 style={sectionTitleStyle}>
        SOBRE LOS IMPORTES PECUNIARIOS
      </h2>
      <p style={paragraphStyle}>
        <strong>DÉCIMO SEXTA:</strong> A la firma del presente contrato, <strong>EL ARRENDATARIO</strong> hace entrega
        a <strong>EL ARRENDADOR</strong> los siguientes importes:
      </p>
      <p style={{...paragraphStyle, marginLeft: '16px'}}>
        • El importe de <strong>S/ {data.adelanto_monto || '____'} ({data.adelanto_texto || '____'})</strong>, en calidad
        de <strong>ADELANTO</strong> que cubren el importe de un mes de renta.
      </p>
      <p style={{...paragraphStyle, marginLeft: '16px'}}>
        • El importe de <strong>S/ {data.garantia_monto || '____'} ({data.garantia_texto || '____'})</strong> que
        equivalen a una mensualidad por concepto de <strong>depósito de garantía</strong>.
      </p>

      <hr style={dividerStyle} />

      {/* Firma */}
      <h2 style={sectionTitleStyle}>
        FIRMA Y LEGALIZACIÓN
      </h2>
      <p style={{...paragraphStyle, marginBottom: '16px'}}>
        Hecho y firmado en {data.lugar_firma || '____'}, bajo legalización notarial de las partes intervinientes,
        a los {data.fecha_firma ? formatDateLong(data.fecha_firma) : '____'} en dos (2) ejemplares de idéntico tenor que obrarán en poder de{' '}
        <strong>EL ARRENDADOR</strong> y de <strong>EL ARRENDATARIO</strong>, respectivamente.
      </p>

      {/* Firmas */}
      <div style={signatureContainerStyle}>
        <div style={signatureBoxStyle}>
          <div style={signatureLineStyle}>
            <p style={signatureTextStyle}>EL ARRENDATARIO</p>
            <p style={signatureNameStyle}>
              {data.arrendatario_nombre || '________________________'}
            </p>
          </div>
        </div>
        <div style={signatureBoxStyle}>
          <div style={signatureLineStyle}>
            <p style={signatureTextStyle}>EL ARRENDADOR</p>
            <p style={signatureNameStyle}>
              {data.arrendador_nombre || '________________________'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ContractPreview);