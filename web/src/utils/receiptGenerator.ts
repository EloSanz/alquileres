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
 * Formatea una fecha en formato legible
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
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

  const getUppercaseMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', { month: 'long', timeZone: 'UTC' }).toUpperCase();
  };



  const receiptId = payment.id && isNaN(Number(payment.id)) ? payment.id : crypto.randomUUID().split('-')[0].toUpperCase();
  addInfoRow('ID de Recibo:', `#${receiptId}`);
  addInfoRow('Inquilino:', payment.tenantFullName || 'N/A');
  addInfoRow('Monto:', formatCurrency(payment.amount));
  addInfoRow('Método de Pago:', getPaymentMethodLabel(payment.paymentMethod));
  addInfoRow('Fecha de Pago:', formatDate(payment.paymentDate));

  const monthName = getUppercaseMonth(payment.dueDate);
  addInfoRow(
    'Estado:',
    payment.status === PaymentStatus.PAGADO ? `Pagado - ${monthName}` : payment.status
  );

  // Nota solo si tiene valor
  if (payment.notes && payment.notes.trim()) {
    addInfoRow('Nota:', payment.notes.trim());
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


/**
 * Genera un PDF del recibo a partir de un objeto PatioPayment
 * @param payment - Objeto PatioPayment con la información del pago
 * @param tenantName - Nombre completo del inquilino
 * @returns Promise que resuelve con el Blob del PDF
 */
export async function generatePatioReceiptPDF(payment: any, tenantName: string): Promise<Blob> {
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

  const primaryColor = '#2e7d32'; // Green for Patio
  const textColor = '#333333';
  const secondaryTextColor = '#666666';

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
    return lines.length * (fontSize * 0.35);
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

  const lineHeight = 8;
  const labelWidth = 60;

  const addInfoRow = (label: string, value: string) => {
    if (yPosition > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = margin;
    }

    addText(label, margin, yPosition, {
      fontSize: 11,
      fontWeight: 'bold',
      color: secondaryTextColor,
      maxWidth: labelWidth,
    });

    const valueHeight = addText(value, margin + labelWidth + 5, yPosition, {
      fontSize: 11,
      fontWeight: 'normal',
      color: textColor,
      maxWidth: contentWidth - labelWidth - 5,
    });

    yPosition += Math.max(lineHeight, valueHeight) + 3;
    doc.setDrawColor('#e0e0e0');
    doc.setLineWidth(0.1);
    doc.line(margin, yPosition - 1, pageWidth - margin, yPosition - 1);
    yPosition += 2;
  };

  const getUppercaseMonth = (dateString: string) => {
    // Usar UTC para evitar problemas de zona horaria que puedan mover el mes
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', { month: 'long', timeZone: 'UTC' }).toUpperCase();
  };



  const receiptId = payment.id && isNaN(Number(payment.id)) ? payment.id : crypto.randomUUID().split('-')[0].toUpperCase();
  addInfoRow('ID de Recibo:', `#P${receiptId}`);
  addInfoRow('Inquilino:', tenantName);
  addInfoRow('Monto:', formatCurrency(payment.monto));
  addInfoRow('Método de Pago:', getPaymentMethodLabel(payment.metodoPago || 'DEPOSITO'));
  addInfoRow('Fecha de Pago:', payment.fechaPago ? formatDate(payment.fechaPago) : 'N/A');

  const monthName = getUppercaseMonth(payment.fechaVencimiento);
  addInfoRow('Estado:', payment.estado === 'PAGADO' ? `Pagado - ${monthName}` : payment.estado);

  if (payment.notas && payment.notas.trim()) {
    addInfoRow('Nota:', payment.notas.trim());
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

  return doc.output('blob');
}

/**
 * Genera un PDF del recibo para Patio y retorna la URL de datos
 */
export async function generatePatioReceiptPDFDataUrl(payment: any, tenantName: string): Promise<string> {
  const pdfBlob = await generatePatioReceiptPDF(payment, tenantName);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(pdfBlob);
  });
}
