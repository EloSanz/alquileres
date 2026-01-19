import { memo } from 'react';
import type { YonaHandoverData } from '../../services/yonaContractService';

interface YonaHandoverPreviewProps {
    data: YonaHandoverData;
    fullPage?: boolean;
}

function PlaceholderText({ value, placeholder, minWidth = '100px' }: { value: string | number | null | undefined; placeholder?: string, minWidth?: string }) {
    const stringValue = String(value || '').trim();
    if (!stringValue) {
        return (
            <span style={{
                display: 'inline-block',
                borderBottom: '1px solid #000',
                minWidth: minWidth,
                margin: '0 4px',
                lineHeight: '1em'
            }}>
                &nbsp;
            </span>
        );
    }
    return <strong>{stringValue}</strong>;
}

function YonaHandoverPreview({ data, fullPage }: YonaHandoverPreviewProps) {
    const fontSize = fullPage ? '11pt' : '10pt';
    const titleSize = fullPage ? '14pt' : '12pt';

    const containerStyle = {
        fontFamily: '"Times New Roman", Times, serif',
        fontSize,
        lineHeight: '1.4',
        color: '#000',
        backgroundColor: '#fff',
        maxWidth: fullPage ? '170mm' : 'none',
        margin: fullPage ? '0 auto' : '0',
        padding: fullPage ? '0 5mm' : '0',
        textAlign: 'left' as const,
        wordWrap: 'break-word' as const,
        overflowWrap: 'break-word' as const,
    };

    const titleStyle = {
        textAlign: 'center' as const,
        fontWeight: 'bold',
        marginBottom: '40px',
        fontSize: titleSize,
        textDecoration: 'underline',
    };

    const paragraphStyle = {
        textAlign: 'left' as const,
        marginBottom: '20px',
    };

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>ACTA DE ENTREGA DE ESTACIONAMIENTO</h1>

            <p style={paragraphStyle}>
                Conste por el presente documento el acta de entrega del estacionamiento <PlaceholderText value={data.estacionamiento_numero} placeholder="N° Estacionamiento" minWidth="80px" /> ubicado en el edificio sito en <PlaceholderText value={data.edificio_direccion} placeholder="Dirección del Edificio" minWidth="250px" />.
            </p>

            <p style={paragraphStyle}>
                Dicha unidad se entrega a la Sra. <PlaceholderText value={data.entrega_receptor_nombre} placeholder="Nombre Receptor" minWidth="200px" /> con DNI <PlaceholderText value={data.entrega_receptor_dni} placeholder="DNI Receptor" minWidth="80px" /> con poder inscrito en la partida registral N° <PlaceholderText value={data.entrega_receptor_partida} placeholder="Partida Registral" minWidth="80px" /> en representación de la compradora la Sra. <PlaceholderText value={data.compradora_nombre} placeholder="Nombre Compradora" minWidth="200px" />, identificado con DNI N°<PlaceholderText value={data.compradora_dni} placeholder="DNI Compradora" minWidth="80px" /> en virtud del contrato compraventa que se celebra con la empresa inmobiliaria <PlaceholderText value={data.inmobiliaria_nombre} placeholder="Nombre Inmobiliaria" minWidth="150px" />.
            </p>

            <p style={paragraphStyle}>
                En el presente acto se está haciendo entrega de lo siguiente
            </p>

            <div style={{ ...paragraphStyle, whiteSpace: 'pre-line', paddingLeft: '40px' }}>
                {data.items_entrega || '- [Lista de items]'}
            </div>

            <p style={{ ...paragraphStyle, marginTop: '60px' }}>
                <PlaceholderText value={data.lugar_fecha_entrega} placeholder="Lima, fecha" minWidth="150px" />
            </p>

            <div style={{ marginTop: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ borderTop: '1px solid #000', width: '300px', paddingTop: '5px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{data.entrega_receptor_nombre}</p>
                    <p style={{ margin: 0 }}>DNI {data.entrega_receptor_dni}</p>
                </div>
            </div>
        </div>
    );
}

export default memo(YonaHandoverPreview);
