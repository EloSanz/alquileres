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

// Formato de fecha a texto largo (Title Case)
function formatDateLong(dateStr: string): string {
  if (!dateStr) return '____';
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} del ${year}`;
}

function ContractPreview({ data, fullPage }: ContractPreviewProps) {
  const fontSize = fullPage ? '11pt' : '10pt';
  const titleSize = fullPage ? '14pt' : '12pt';
  const subtitleSize = fullPage ? '12pt' : '11pt';

  // Helper para fecha de firma desglosada
  const getFirmaDateParts = (dateStr: string) => {
    if (!dateStr) return { day: '____', month: '____', year: '____' };
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate().toString().padStart(2, '0');
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return {
      day,
      month: months[date.getMonth()],
      year: date.getFullYear()
    };
  };

  const firmaParts = getFirmaDateParts(data.fecha_firma);

  // Helper para rango del primer mes (Adelanto)
  const getFirstMonthRange = (startDateStr: string) => {
    if (!startDateStr) return '____ al ____';
    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0); // Último día del mes

    const format = (d: Date) => {
      const day = d.getDate().toString().padStart(2, '0');
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} de ${month} del ${year}`;
    };
    return `${format(start)} al ${format(end)}`;
  };

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

  const arrendatarioLabel = data.arrendatario_sexo === 'F' ? 'LA ARRENDATARIA' : 'EL ARRENDATARIO';

  return (
    <div style={containerStyle}>
      {/* Título */}
      <h1 style={titleStyle}>
        CONTRATO DE ARRENDAMIENTO
      </h1>

      <hr style={dividerStyle} />

      {/* Introducción */}
      <p style={paragraphStyle}>
        Conste por el presente documento el Contrato de Arrendamiento que celebran de una parte la empresa{' '}
        <strong>INMOBILIARIA PENTA MONT S.A.</strong>, identificada con RUC. Nº 20310173275, debidamente representada por el{' '}
        <strong>GERENTE GENERAL Sr. ROMAN MICHAEL ARELLANO RIVERA</strong>, identificado con DNI Nº 08885646,
        según poder inscrito en la partida electrónica Nº 05003448 del registro de personas jurídicas de la oficina registral de Pucallpa,
        con domicilio fiscal sito en Jirón Tacna Nº 628 ( manzana 32 lote 8-9 b), del distrito de Callería,
        provincia de Coronel Portillo, departamento de Ucayali,
        que en lo sucesivo se denominará <strong>EL ARRENDADOR</strong> y de la otra parte,
        {data.arrendatario_sexo === 'F' ? 'Doña ' : 'Don '}
        <PlaceholderText value={data.arrendatario_nombre} placeholder="Nombre del Arrendatario" />, identificado con D.N.I. Nº{' '}
        <PlaceholderText value={data.arrendatario_dni} placeholder="DNI del Arrendatario" />, con domicilio en <PlaceholderText value={data.arrendatario_domicilio} placeholder="Domicilio Completo" />, a quien en adelante se le denominará{' '}
        <strong>{arrendatarioLabel}</strong> en los términos y condiciones de las cláusulas siguientes:
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
        <strong>{arrendatarioLabel}</strong> <strong>EL INMUEBLE</strong> de su propiedad, referido en la cláusula primera
        anterior, a fin de que sea ocupado por <strong>{arrendatarioLabel}</strong>; el{' '}
        <strong>STAND Nº <PlaceholderText value={data.stand_numero} placeholder="Número de Stand" /> {data.stand_detalles}</strong> siendo este mismo destinado para el desarrollo de la{' '}
        <PlaceholderText value={data.actividad_comercial} placeholder="Actividad Comercial" />.
      </p>
      <p style={paragraphStyle}>
        <strong>{arrendatarioLabel}</strong> declara conocer y reconoce que tanto <strong>EL INMUEBLE</strong> materia de
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
        En caso de que <strong>{arrendatarioLabel}</strong> deseara prorrogar el plazo del presente contrato, deberá
        solicitarlo a <strong>EL ARRENDADOR</strong> con una anticipación no menor de TREINTA (30) días a la fecha de
        conclusión del arrendamiento.
      </p>
      <p style={paragraphStyle}>
        En el supuesto que, a la terminación del presente contrato, por vencimiento del plazo o por resolución del
        contrato, <strong>EL ARRENDATARIO</strong> no cumpliese con entregar <strong>EL INMUEBLE</strong> arrendado a{' '}
        <strong>EL ARRENDADOR</strong>, y sin perjuicio de entenderse que el presente contrato no continúa,{' '}
        <strong>{arrendatarioLabel}</strong> queda obligado a pagar a <strong>EL ARRENDADOR</strong> una penalidad de{' '}
        <strong>$ {data.penalidad_diaria || '____'} ({data.penalidad_texto || '____'})</strong> por cada día de demora
        hasta la entrega efectiva de los inmuebles y sus accesorios a <strong>EL ARRENDADOR</strong>.
      </p>
      <p style={paragraphStyle}>
        <strong>CUARTA:</strong> Queda pactado que si <strong>{arrendatarioLabel}</strong> desocupara <strong>EL INMUEBLE</strong> y lo
        entregara antes que concluya el plazo pactado, o si el presente contrato se resolviera por causa
        imputable a este, desde ya <strong>{arrendatarioLabel}</strong> reconoce a favor de <strong>EL ARRENDADOR</strong> el
        pago de un monto equivalente a un (01) mes de <strong>LA GARANTIA</strong>, es decir <strong>S/ {data.garantia_monto || '____'} ({data.garantia_texto || '____'})</strong> como consecuencia directa del hecho lesivo ante la pérdida
        del incremento patrimonial dejado de obtener debido al incumplimiento contractual.
      </p>

      <hr style={dividerStyle} />

      {/* Merced Conductiva */}
      <h2 style={sectionTitleStyle}>
        LA MERCED CONDUCTIVA: FORMA Y OPORTUNIDAD DE PAGO
      </h2>
      <p style={paragraphStyle}>
        <strong>QUINTA:</strong> El pago de la renta mensual, convenida de mutuo acuerdo por las partes contratantes,
        es de <strong>S/ <PlaceholderText value={data.renta_mensual} placeholder="Renta Mensual" /> ({data.renta_texto || '____'})</strong>, por el arrendamiento de{' '}
        <strong>EL INMUEBLE</strong> y de los accesorios, cuyo detalle forman parte integrante de este contrato, tal como se
        precisa en la cláusula segunda de este documento.
      </p>
      <p style={paragraphStyle}>
        Cabe señalar que el pago de la renta será abonado el primer dia de cada mes, con una tolerancia de <strong>{data.tolerancia_dias || '3'}</strong> días
        calendarios siguientes a su vencimiento.
      </p>
      <p style={paragraphStyle}>
        <strong>SEXTA:</strong> La renta será pagada por <strong>{arrendatarioLabel}</strong> mediante abono <strong>EN LA CUENTA
          CORRIENTE DEL {data.banco_nombre || '____'} Nº {data.banco_cuenta || '____'}, CCI Nº {data.banco_cci || '____'} A NOMBRE DE INMOBILIARIA PENTA MONT S.A.</strong>, de propiedad
        de <strong>EL ARRENDADOR</strong>.
      </p>
      <p style={paragraphStyle}>
        El incumplimiento de pago oportuno de dos meses y 15 días consecutivos de renta constituye causal de resolución
        automática del presente contrato, sin necesidad de previo pronunciamiento judicial.
      </p>
      <p style={paragraphStyle}>
        En caso de que <strong>{arrendatarioLabel}</strong> retardara el pago de la renta convenida, <strong>EL ARRENDADOR</strong> podrá
        exigir el pago de intereses compensatorios y moratorios con las tasas más altas fijadas por el Banco Central de Reserva.
      </p>
      <p style={paragraphStyle}>
        Queda entendido que el importe de la renta no cubre los gastos y/o pagos por conceptos de agua, electricidad y respecto
        de cualquier obligación, creada o por crearse, que por su naturaleza sean de cuenta de <strong>{arrendatarioLabel}</strong>,
        cuyos pagos ésta asume durante la ocupación de <strong>EL INMUEBLE</strong> y hasta que el mismo sea devuelto a <strong>EL ARRENDADOR</strong>.
      </p>
      <p style={paragraphStyle}>
        <strong>EL ARRENDADOR</strong> se hará cargo y pagará directamente el Impuesto Predial correspondiente a <strong>EL INMUEBLE</strong> arrendado
        de conformidad con lo dispuesto por el Decreto Legislativo Nº 776 - Ley de Tributación Municipal.
      </p>
      <p style={paragraphStyle}>
        <strong>SEPTIMA:</strong> <strong>{arrendatarioLabel}</strong> declara que recibe <strong>EL INMUEBLE</strong> y sus accesorios, en
        condiciones operativas, puertas con sus llaves, instalaciones eléctricas, instalaciones sanitarias, por
        lo que ésta se responsabiliza de cualquier siniestro y de los daños o desperfectos que puedan sufrir
        <strong>EL INMUEBLE</strong>, sus partes integrantes y/o accesorios, en tanto no se les devuelva tales bienes a
        <strong>EL ARRENDADOR</strong> y a satisfacciónn de ésta.
      </p>

      <h2 style={sectionTitleStyle}>
        PROHIBICIONES
      </h2>
      <p style={paragraphStyle}>
        <strong>OCTAVA:</strong> <strong>{arrendatarioLabel}</strong> queda expresamente prohibido de:
      </p>
      <ul style={{ ...paragraphStyle, paddingLeft: '20px', margin: '0 0 8px 0' }}>
        <li>Realizar cambios, transformaciones y, en general, cualquier tipo de alteraciones en la
          distribución de <strong>EL INMUEBLE</strong> arrendado, sin la autorización previa y por escrito de <strong>EL
            ARRENDADOR</strong>.</li>
        <li>Subarrendar, ceder o traspasar, total o parcialmente <strong>EL INMUEBLE</strong> arrendado o los derechos
          que se confieren por el presente contrato.</li>
        <li>Dar a <strong>EL INMUEBLE</strong> y muebles arrendados uso distinto de los pactados en el presente contrato
          y estará ocupado por <strong>{arrendatarioLabel}</strong>, quien se compromete a no incorporar más
          personas a las admitidas en el presente contrato.</li>
        <li>Introducir o permitir que se introduzcan en <strong>EL INMUEBLE</strong> arrendado elementos explosivos,
          inflamables o de naturaleza análoga que hagan o pudieran hacer peligrar el estado de
          conservaciónn de <strong>EL INMUEBLE</strong> y bienes muebles arrendados.</li>
        <li>no se aceptan mascotas.</li>
        <li>no se aceptan reunión pasadas la media noche.</li>
        <li>No usarlo como vivienda.</li>
      </ul>

      <h2 style={sectionTitleStyle}>
        OBLIGACIONES
      </h2>
      <p style={paragraphStyle}>
        <strong>NOVENA:</strong> <strong>{arrendatarioLabel}</strong> se encuentra obligado a instruir a los ocupantes del inmueble
        respecto de tales prohibiciones, comprometiéndose a cumplirlas. El incumplimiento de uno o
        cualquiera de los supuestos que prevé esta cláusula, sea por <strong>{arrendatarioLabel}</strong> o por los
        ocupantes, es causal de resolución automática del presente contrato, sin necesidad de previo
        pronunciamiento judicial.
      </p>
      <p style={paragraphStyle}>
        <strong>DECIMO:</strong> <strong>EL ARRENDADOR</strong> se obliga a entregar el bien objeto de la prestación a su cargo, en
        perfecto estado de conservación y funcionamiento, en la fecha de suscripción del presente contrato.
        Por su parte, <strong>{arrendatarioLabel}</strong> se obliga a restituir el bien en las mismas condiciones que lo
        recibió.
      </p>
      <p style={paragraphStyle}>
        <strong>DECIMO PRIMERA:</strong> <strong>{arrendatarioLabel}</strong> se obliga a pagar puntualmente el monto de la
        merced conductiva, en la forma, oportunidad y lugar pactados. Asimismo, <strong>{arrendatarioLabel}</strong>
        está obligado a pagar puntualmente el importe de todos los servicios públicos, tales como agua y
        desagüe, energía eléctrica, arbitrios y otros suministrados en beneficio del bien.
      </p>
      <p style={paragraphStyle}>
        <strong>DECIMO SEGUNDA:</strong> <strong>{arrendatarioLabel}</strong> está obligado a efectuar por cuenta y costo propio
        las reparaciones y mantenimientos que sean necesarios para conservar el bien en el mismo estado
        en que fue recibido y que se generen por el uso normal del bien.
      </p>
      <p style={paragraphStyle}>
        <strong>DECIMO TERCERA:</strong> Las modificaciones y mejoras que autorice realizar <strong>EL ARRENDADOR</strong>
        quedarán a beneficio de <strong>EL INMUEBLE</strong> sin que <strong>{arrendatarioLabel}</strong> tenga derecho a exigir
        pago o compensación alguna por dicho concepto; comprometiéndose a no retirarlas de <strong>EL
          INMUEBLE</strong>, aunque las mismas sean separables y aun cuando el retiro de las mismas no dañe <strong>EL
            INMUEBLE</strong> o que causándole daño <strong>{arrendatarioLabel}</strong> pueda subsanar o corregir los
        desperfectos que tal retiro ocasione. En todo caso, <strong>{arrendatarioLabel}</strong> renuncia a cualquier
        acción que tienda a exigir a <strong>EL ARRENDADOR</strong> el reembolso por las modificaciones y mejoras
        que se le pudiera autorizar, así como a los plazos para interponerlas.
      </p>
      <p style={paragraphStyle}>
        <strong>DECIMO CUARTA:</strong> <strong>EL ARRENDADOR</strong> se reserva el derecho de inspeccionar, en cualquier
        momento, personalmente o por un tercero autorizado, <strong>EL INMUEBLE</strong> materia del presente
        arrendamiento con la finalidad de verificar el estado de conservación y constatar el uso que de este
        hace <strong>{arrendatarioLabel}</strong> y/o los ocupantes. Para este efecto se le solicitará a <strong>{arrendatarioLabel}</strong>
        fije día y hora, para llevar a cabo la inspección dentro de las cuarenta y ocho (48) horas siguientes de hecha la solicitud.
      </p>

      <hr style={dividerStyle} />

      {/* Importes Pecuniarios */}
      <h2 style={sectionTitleStyle}>
        SOBRE LOS IMPORTES PECUNIARIOS
      </h2>
      <p style={paragraphStyle}>
        <strong>DECIMO QUINTO:</strong>
      </p>
      <p style={paragraphStyle}>
        A la firma del presente contrato, <strong>{arrendatarioLabel}</strong> hacen entrega a <strong>EL ARRENDADOR</strong> el
        importe de <strong>S/ {data.adelanto_monto || '____'} ({data.adelanto_texto || '____'})</strong>, en calidad de <strong>ADELANTO</strong>
        que cubren el importe de un mes de renta, es decir por el periodo comprendido entre el <strong>{getFirstMonthRange(data.fecha_inicio)}</strong>. Este pago se
        verifica en la fecha y sin más constancia de entrega y recepción del citado importe que la firma de las partes en el presente
        contrato, sin perjuicio de regularizarse la entrega del recibo de arrendamiento correspondiente.
      </p>
      <p style={paragraphStyle}>
        Asimismo <strong>EL ARRENDADOR</strong> declara haber recibido con fecha anterior a la firma del presente
        contrato el importe de <strong>S/ {data.garantia_monto || '____'} ({data.garantia_texto || '____'})</strong> que
        equivale a dos mensualidades por concepto de <strong>depósito de garantía</strong>. Dicho depósito de garantía
        servirá única y exclusivamente para responder por eventuales daños o deterioros en los bienes
        muebles e inmueble arrendado, quedando igualmente pactada la indemnización por el daño ulterior
        que pudiese acontecer. En la fecha que se produzca la devolución de tales bienes y luego de hacer
        los arreglos pertinentes <strong>EL ARRENDADOR</strong> devolverá el monto de la garantía a <strong>{arrendatarioLabel}</strong>,
        una vez deducidos los montos que cubran los adeudos por concepto de luz,
        agua o de cualquier otra naturaleza así como el de los daños eventuales que pudieran haberse
        ocasionado a <strong>EL INMUEBLE</strong> y a sus partes integrantes o accesorios.
      </p>
      <p style={paragraphStyle}>
        - Queda establecido que el depósito de garantía no podrá ser imputado al pago de la renta mensual
        pactada, salvo acuerdo entre las partes, dejando constancia que el depósito de garantía no
        devengará ningún tipo de interés.
      </p>

      <hr style={dividerStyle} />

      <h2 style={sectionTitleStyle}>
        CLAUSULA DE ALLANAMIENTO A FUTURO
      </h2>
      <p style={paragraphStyle}>
        <strong>DECIMO SEXTA:</strong> De conformidad al art. 5° de la Ley 30201 que modifica el artículo 594° del
        Código Procesal Civil, <strong>{arrendatarioLabel}</strong> se allana desde ya a la demanda judicial para
        desocupar el inmueble por las causales de <strong>vencimiento de contrato de arrendamiento</strong> o por
        <strong>incumplimiento del pago de la renta de 2 meses y quince días</strong>, conforme al numeral 1) del
        artículo 1697° del Código Civil. En consecuencia, <strong>{arrendatarioLabel}</strong> deberá desocupar y
        restituir inmediatamente el bien a <strong>EL ARRENDADOR</strong> conforme a los términos del mencionado
        artículo.
      </p>
      <p style={paragraphStyle}>
        La falta de pago de la renta de dos meses y quince (15) días otorga a <strong>EL ARRENDADOR</strong>, la facultad de resolver el presente contrato; y <strong>{arrendatarioLabel}</strong> deberá proceder a la inmediata desocupación del inmueble.
      </p>
      <p style={paragraphStyle}>
        Así mismo, <strong>{arrendatarioLabel}</strong> declara expresamente allanarse a futuro a la restitución del bien conforme a lo establecido en el artículo 1697° del Código Civil y de aplicación todo lo demás regulado en el art. 5° de la Ley 30201 que modifica el artículo 594º del Código Procesal Civil.
      </p>
      <p style={paragraphStyle}>
        <strong>EL ARRENDADOR</strong> se reserva el derecho de inscribir a <strong>{arrendatarioLabel}</strong> en el registro nacional de inquilinos morosos.
      </p>

      <hr style={dividerStyle} />

      <h2 style={sectionTitleStyle}>
        DE LA VALIDEZ DE LAS NOTIFICACIONES
      </h2>
      <p style={paragraphStyle}>
        <strong>DECIMO SEPTIMA:</strong> Las partes intervinientes declaran como sus domicilios los que consignan en este documento, en el que surtirán efecto las comunicaciones y/o notificaciones, judiciales o extrajudiciales, que se cursen con ocasiónn del presente contrato. Los intervinientes renuncian a fijar domicilios individuales, pudiendo variar el domicilio común que cada cual señala por otro. Toda comunicación o notificación cursada antes de tomar conocimiento de nuevo domicilio, que necesariamente deberá fijarse para estos efectos dentro del radio urbano de la ciudad de Pucallpa, surtirá efecto y validez en el domicilio anterior.
      </p>

      <hr style={dividerStyle} />

      <h2 style={sectionTitleStyle}>
        DE LAS DIVERGENCIAS Y CONTROVERSIAS
      </h2>
      <p style={paragraphStyle}>
        <strong>DECIMO OCTAVA:</strong> Asimismo, las partes intervinientes renuncian al fuero de sus domicilios y se someten a la competencia de los jueces y tribunales de Coronel Portillo, Ucayali.
      </p>

      <hr style={dividerStyle} />

      {/* Firma */}
      <h2 style={sectionTitleStyle}>
        FIRMA Y LEGALIZACIÓN
      </h2>
      <p style={{ ...paragraphStyle, marginBottom: '16px' }}>
        Hecho y firmado en {data.lugar_firma || '____'}, bajo legalización notarial de las partes intervinientes,
        a los {firmaParts.day} día del mes de {firmaParts.month} del {firmaParts.year} en dos (2) ejemplares de idéntico tenor que obrarán en poder de{' '}
        <strong>EL ARRENDADOR</strong> y de <strong>EL ARRENDATARIO</strong>, respectivamente.
      </p>

      {/* Firmas */}
      <div style={signatureContainerStyle}>
        <div style={signatureBoxStyle}>
          <div style={signatureLineStyle}>
            <p style={signatureNameStyle}>
              <strong>ROMAN MICHAEL ARELLANO RIVERA</strong>
            </p>
            <p style={signatureNameStyle}>
              <strong>D.N.I. 08885646</strong>
            </p>
            <p style={signatureNameStyle}>
              <strong>p. INMOBILIARIA PENTA MONT S.A.</strong>
            </p>
            <p style={{ ...signatureTextStyle, marginTop: '8px' }}>EL ARRENDADOR</p>
          </div>
        </div>
        <div style={signatureBoxStyle}>
          <div style={signatureLineStyle}>
            <p style={signatureNameStyle}>
              <PlaceholderText value={data.arrendatario_nombre} placeholder="Nombre del Arrendatario" />
            </p>
            <p style={signatureNameStyle}>
              <strong>D.N.I <PlaceholderText value={data.arrendatario_dni} placeholder="DNI" /></strong>
            </p>
            <p style={{ ...signatureTextStyle, marginTop: '24px' }}>{arrendatarioLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ContractPreview);