import { memo } from 'react';
import type { YonaContractData } from '../../services/yonaContractService';

interface YonaContractPreviewProps {
    data: YonaContractData;
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


function formatDateShort(dateStr: string): string {
    if (!dateStr) return '____';
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}


function YonaContractPreview({ data, fullPage }: YonaContractPreviewProps) {
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
        textTransform: 'uppercase' as const,
    };

    const paragraphStyle = {
        textAlign: 'justify' as const,
        marginBottom: '8px',
    };

    const listStyle = {
        ...paragraphStyle,
        paddingLeft: '20px',
        margin: '0 0 8px 0'
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
                CONTRATO DE ARRENDAMIENTO DE ESTACIONAMIENTO
            </h1>

            <hr style={dividerStyle} />

            {/* Introducción */}
            <p style={paragraphStyle}>
                Conste por el presente documento el contrato de arrendamiento de estacionamiento que celebran de una parte{' '}
                <strong>{data.arrendador_nombre}</strong>, identificado(a) con DNI N.° <PlaceholderText value={data.arrendador_dni || '____'} placeholder="DNI Arrendador" />, con domicilio en{' '}
                <PlaceholderText value={data.arrendador_domicilio || '____'} placeholder="Domicilio Arrendador" />, a quien en adelante se le denominará <strong>EL ARRENDADOR</strong>; y de la otra parte{' '}
                <strong>{data.arrendatario_nombre}</strong>, identificado(a) con DNI N.° <PlaceholderText value={data.arrendatario_dni} placeholder="DNI Arrendatario" />, con domicilio en{' '}
                <PlaceholderText value={data.arrendatario_domicilio} placeholder="Domicilio Arrendatario" />, a quien en adelante se le denominará <strong>EL ARRENDATARIO</strong>; en los términos y condiciones siguientes:
            </p>

            {/* Clausulas */}
            <p style={sectionTitleStyle}>PRIMERA: OBJETO</p>
            <p style={paragraphStyle}>
                <strong>EL ARRENDADOR</strong> da en arrendamiento a <strong>EL ARRENDATARIO</strong> el espacio de estacionamiento N.°{' '}
                <PlaceholderText value={data.stand_numero} placeholder="Número de Estacionamiento" />, destinado exclusivamente para el estacionamiento de un vehículo automotor.
            </p>

            <p style={sectionTitleStyle}>SEGUNDA: DESTINO</p>
            <p style={paragraphStyle}>
                El estacionamiento será utilizado únicamente para guardar el vehículo de placa{' '}
                <PlaceholderText value={data.vehiculo_placa} placeholder="Placa" />, marca{' '}
                <PlaceholderText value={data.vehiculo_marca} placeholder="Marca" />, modelo{' '}
                <PlaceholderText value={data.vehiculo_modelo} placeholder="Modelo" />. Queda prohibido destinarlo a otro uso sin autorización expresa y escrita de <strong>EL ARRENDADOR</strong>.
            </p>

            <p style={sectionTitleStyle}>TERCERA: PLAZO</p>
            <p style={paragraphStyle}>
                El plazo del presente contrato es de <strong>{data.plazo_meses || '____'}</strong> meses, iniciándose el{' '}
                <strong>{formatDateShort(data.fecha_inicio)}</strong> y culminando el <strong>{formatDateShort(data.fecha_fin)}</strong>, pudiendo renovarse previo acuerdo entre las partes.
            </p>

            <p style={sectionTitleStyle}>CUARTA: RENTA</p>
            <p style={paragraphStyle}>
                <strong>EL ARRENDATARIO</strong> pagará a <strong>EL ARRENDADOR</strong> la suma de S/{' '}
                <PlaceholderText value={data.renta_mensual} placeholder="Monto" /> ({data.renta_texto || '____'} soles) mensuales, por adelantado, dentro de los primeros{' '}
                <strong>{data.dia_vencimiento || '____'}</strong> días de cada mes, mediante{' '}
                <PlaceholderText value={data.metodo_pago} placeholder="efectivo / transferencia / Yape / Plin / otro medio" />.
            </p>

            <p style={sectionTitleStyle}>QUINTA: GARANTÍA</p>
            <p style={paragraphStyle}>
                A la firma del presente contrato, <strong>EL ARRENDATARIO</strong> entrega la suma de S/{' '}
                <PlaceholderText value={data.garantia_monto} placeholder="Monto Garantía" /> como garantía, la cual será devuelta al término del contrato, siempre que el estacionamiento sea devuelto en las mismas condiciones en que fue entregado.
            </p>

            <p style={sectionTitleStyle}>SEXTA: OBLIGACIONES DEL ARRENDATARIO</p>
            <ul style={listStyle}>
                <li>a) Usar el estacionamiento conforme a su destino.</li>
                <li>b) No subarrendar ni ceder el uso del espacio.</li>
                <li>c) Mantener limpio el estacionamiento.</li>
                <li>d) Responder por los daños ocasionados por su vehículo.</li>
                <li>e) Cumplir puntualmente con el pago de la renta.</li>
            </ul>

            <p style={sectionTitleStyle}>SÉTIMA: OBLIGACIONES DEL ARRENDADOR</p>
            <ul style={listStyle}>
                <li>a) Entregar el estacionamiento en condiciones adecuadas de uso.</li>
                <li>b) Garantizar el uso pacífico durante la vigencia del contrato.</li>
                <li>c) Realizar reparaciones estructurales que no sean atribuibles al ARRENDATARIO.</li>
            </ul>

            <p style={sectionTitleStyle}>OCTAVA: RESPONSABILIDAD</p>
            <p style={paragraphStyle}>
                <strong>EL ARRENDADOR</strong> no se hace responsable por robos, daños o pérdidas del vehículo, salvo que se demuestre dolo o negligencia grave de su parte.
            </p>

            <p style={sectionTitleStyle}>NOVENA: RESOLUCIÓN</p>
            <p style={paragraphStyle}>
                El incumplimiento de cualquiera de las obligaciones dará derecho a la parte afectada a resolver el contrato, previa comunicación escrita.
            </p>

            <p style={sectionTitleStyle}>DÉCIMA: LEGISLACIÓN APLICABLE</p>
            <p style={paragraphStyle}>
                El presente contrato se rige por las disposiciones del Código Civil Peruano.
            </p>

            <p style={sectionTitleStyle}>DÉCIMO PRIMERA: DOMICILIO Y JURISDICCIÓN</p>
            <p style={paragraphStyle}>
                Para todos los efectos legales, las partes señalan como sus domicilios los indicados en la introducción y se someten a la jurisdicción de los jueces y tribunales de{' '}
                <PlaceholderText value={data.lugar_firma || '____'} placeholder="Ciudad" />.
            </p>

            <p style={paragraphStyle}>
                En señal de conformidad, firman el presente contrato en <strong>{data.lugar_firma || '____'}</strong>, a los{' '}
                <strong>{firmaParts.day}</strong> días del mes de <strong>{firmaParts.month}</strong> del año <strong>{firmaParts.year}</strong>.
            </p>

            {/* Firmas */}
            <div style={signatureContainerStyle}>
                <div style={signatureBoxStyle}>
                    <div style={signatureLineStyle}>
                        <p style={signatureNameStyle}>
                            <strong>{data.arrendador_nombre}</strong>
                        </p>
                        <p style={signatureNameStyle}>
                            <strong>D.N.I: <PlaceholderText value={data.arrendador_dni || '____'} placeholder="DNI" /></strong>
                        </p>
                        <p style={{ ...signatureTextStyle, marginTop: '8px' }}>EL ARRENDADOR</p>
                    </div>
                </div>
                <div style={signatureBoxStyle}>
                    <div style={signatureLineStyle}>
                        <p style={signatureNameStyle}>
                            <strong>{data.arrendatario_nombre}</strong>
                        </p>
                        <p style={signatureNameStyle}>
                            <strong>D.N.I: <PlaceholderText value={data.arrendatario_dni} placeholder="DNI" /></strong>
                        </p>
                        <p style={{ ...signatureTextStyle, marginTop: '8px' }}>EL ARRENDATARIO</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(YonaContractPreview);
