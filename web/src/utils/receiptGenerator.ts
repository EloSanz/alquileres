import { jsPDF } from 'jspdf';
import { Payment, PaymentStatus } from '../../../shared/types/Payment';

/**
 * Formatea un monto como moneda peruana
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
}

/**
 * Formatea una fecha y hora en formato legible
 */
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatea una fecha en formato legible
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Obtiene el label del método de pago
 */
function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'YAPE':
      return 'Yape';
    case 'DEPOSITO':
      return 'Depósito';
    case 'TRANSFERENCIA_VIRTUAL':
      return 'Transferencia Virtual';
    default:
      return method;
  }
}

/**
 * Genera un PDF del recibo a partir de un objeto Payment
 * @param payment - Objeto Payment con la información del pago
 * @returns Promise que resuelve con el Blob del PDF
 */
export async function generateReceiptPDF(payment: Payment): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Colores
  const primaryColor = '#1976d2';
  const textColor = '#333333';
  const secondaryTextColor = '#666666';

  // Función auxiliar para agregar texto con wrap
  const addText = (
    text: string,
    x: number,
    y: number,
    options: {
      fontSize?: number;
      fontWeight?: 'normal' | 'bold';
      color?: string;
      align?: 'left' | 'center' | 'right';
      maxWidth?: number;
    } = {}
  ) => {
    const {
      fontSize = 12,
      fontWeight = 'normal',
      color = textColor,
      align = 'left',
      maxWidth = contentWidth,
    } = options;

    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontWeight);
    doc.setTextColor(color);

    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, { align });
    return lines.length * (fontSize * 0.35); // Altura aproximada
  };

  // Título
  doc.setTextColor(primaryColor);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const titleText = 'Recibo Penta Mont';
  doc.text(titleText, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Línea debajo del título
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Información del pago
  doc.setTextColor(textColor);
  const lineHeight = 8;
  const labelWidth = 60;

  const addInfoRow = (label: string, value: string) => {
    if (yPosition > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = margin;
    }

    // Label
    addText(label, margin, yPosition, {
      fontSize: 11,
      fontWeight: 'bold',
      color: secondaryTextColor,
      maxWidth: labelWidth,
    });

    // Value
    const valueHeight = addText(value, margin + labelWidth + 5, yPosition, {
      fontSize: 11,
      fontWeight: 'normal',
      color: textColor,
      maxWidth: contentWidth - labelWidth - 5,
    });

    yPosition += Math.max(lineHeight, valueHeight) + 3;

    // Línea separadora
    doc.setDrawColor('#e0e0e0');
    doc.setLineWidth(0.1);
    doc.line(margin, yPosition - 1, pageWidth - margin, yPosition - 1);
    yPosition += 2;
  };

  addInfoRow('ID de Pago:', `#${payment.id}`);
  addInfoRow('Inquilino:', payment.tenantFullName || 'N/A');
  addInfoRow('Monto:', formatCurrency(payment.amount));
  addInfoRow('Método de Pago:', getPaymentMethodLabel(payment.paymentMethod));
  addInfoRow('Fecha de Pago:', formatDate(payment.paymentDate));
  addInfoRow('Fecha de Vencimiento:', formatDate(payment.dueDate));
  addInfoRow(
    'Estado:',
    payment.status === PaymentStatus.PAGADO ? 'Pagado' : payment.status
  );
  addInfoRow('Fecha y Hora de Registro:', formatDateTime(payment.updatedAt));

  // Notas si existen
  if (payment.notes) {
    yPosition += 5;
    if (yPosition > pageHeight - margin - 30) {
      doc.addPage();
      yPosition = margin;
    }

    // Línea separadora más gruesa
    doc.setDrawColor('#e0e0e0');
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    addText('Notas:', margin, yPosition, {
      fontSize: 11,
      fontWeight: 'bold',
      color: secondaryTextColor,
    });
    yPosition += 6;

    const notesHeight = addText(payment.notes, margin, yPosition, {
      fontSize: 11,
      fontWeight: 'normal',
      color: textColor,
      maxWidth: contentWidth,
    });
    yPosition += notesHeight + 5;
  }

  // Footer
  yPosition = pageHeight - margin - 10;
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  addText(
    'Este es un recibo generado automáticamente por el sistema Penta Mont',
    pageWidth / 2,
    yPosition,
    {
      fontSize: 9,
      fontWeight: 'normal',
      color: secondaryTextColor,
      align: 'center',
      maxWidth: contentWidth,
    }
  );

  // Generar Blob del PDF
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}

/**
 * Genera un PDF del recibo y retorna la URL de datos para mostrar en el modal
 * @param payment - Objeto Payment con la información del pago
 * @returns Promise que resuelve con la URL de datos base64 del PDF
 */
export async function generateReceiptPDFDataUrl(payment: Payment): Promise<string> {
  const pdfBlob = await generateReceiptPDF(payment);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(pdfBlob);
  });
}

