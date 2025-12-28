import { type Payment, PaymentStatus } from '../../../shared/types/Payment';

export type ContractMonthStatus = 'PAID' | 'DUE' | 'FUTURE';

export interface ContractMonthInfo {
  monthNumber: number; // 1-12
  label: string;       // 'Ene 2026'
  dueDate: Date;
  status: ContractMonthStatus;
}

const monthLabel = (date: Date) => {
  const label = date.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
  // Capitalizar primera letra
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/**
 * Construye la línea de tiempo de 12 meses de un contrato,
 * usando startDate y pagos existentes (por monthNumber).
 */
export function buildContractTimeline(startDateInput: string | Date, payments: Payment[]): ContractMonthInfo[] {
  const startDate = new Date(startDateInput);

  const byMonth = new Map<number, Payment>();
  for (const p of payments) {
    if (p.monthNumber != null) byMonth.set(p.monthNumber, p);
  }

  const timeline: ContractMonthInfo[] = [];

  for (let m = 1; m <= 12; m++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + (m - 1));
    const p = byMonth.get(m);

    let status: ContractMonthStatus;
    if (p) {
      // Usar el campo status del pago directamente
      // El status solo se cambia manualmente por el usuario, no se calcula automáticamente
      const paymentStatus = String(p.status).toUpperCase();

      if (paymentStatus === PaymentStatus.PAGADO || paymentStatus === 'PAGADO') {
        status = 'PAID';
      } else if (paymentStatus === PaymentStatus.VENCIDO || paymentStatus === 'VENCIDO') {
        status = 'DUE';
      } else if (paymentStatus === PaymentStatus.FUTURO || paymentStatus === 'FUTURO') {
        status = 'FUTURE';
      } else {
        // Si el status no es reconocido, usar VENCIDO por defecto (impago)
        status = 'DUE';
      }
    } else {
      // Si no hay pago, está vencido (impago)
      status = 'DUE';
    }

    timeline.push({
      monthNumber: m,
      label: monthLabel(dueDate),
      dueDate,
      status
    });
  }

  return timeline;
}
