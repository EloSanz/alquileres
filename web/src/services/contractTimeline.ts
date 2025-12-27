import { type Payment } from '../../../shared/types/Payment';

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
export function buildContractTimeline(startDateInput: string | Date, payments: Payment[], nowInput?: Date): ContractMonthInfo[] {
  const now = nowInput ?? new Date();
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
      if (p.paymentDate && new Date(p.paymentDate) <= now) {
        status = 'PAID';
      } else if (new Date(p.dueDate) < now) {
        status = 'DUE';
      } else {
        status = 'FUTURE';
      }
    } else {
      status = dueDate < now ? 'DUE' : 'FUTURE';
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


