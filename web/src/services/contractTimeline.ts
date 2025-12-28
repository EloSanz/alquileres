import { type Payment, PaymentStatus } from '../../../shared/types/Payment';

export type ContractMonthStatus = 'PAID' | 'DUE' | 'FUTURE';

export interface ContractMonthInfo {
  monthNumber: number; // 1-12
  label: string;       // 'Ene 2025'
  dueDate: Date;
  status: ContractMonthStatus;
}

// Nombres de meses en español
const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

/**
 * Genera etiquetas de meses para un año específico
 */
function generateMonthLabels(year: number): string[] {
  return MONTH_NAMES.map(month => `${month} ${year}`);
}

/**
 * Genera fechas límite de pago (día 4 de cada mes) para un año específico
 */
function generateDueDates(year: number): Date[] {
  return Array.from({ length: 12 }, (_, i) => new Date(year, i, 4));
}

/**
 * Construye la línea de tiempo de 12 meses de un contrato para un año específico.
 * @param year - Año para el cual generar la línea de tiempo (ej: 2025, 2026)
 * @param payments - Array de pagos filtrados por año
 */
export function buildContractTimeline(year: number, payments: Payment[]): ContractMonthInfo[] {
  // Crear mapa de pagos por mes usando dueDate para determinar el mes
  const byMonth = new Map<number, Payment>();
  for (const p of payments) {
    const dueDate = new Date(p.dueDate);
    const month = dueDate.getMonth() + 1; // getMonth() retorna 0-11, necesitamos 1-12
    if (dueDate.getFullYear() === year) {
      byMonth.set(month, p);
    }
  }

  const monthLabels = generateMonthLabels(year);
  const dueDates = generateDueDates(year);
  const timeline: ContractMonthInfo[] = [];

  for (let m = 1; m <= 12; m++) {
    const p = byMonth.get(m);

    let status: ContractMonthStatus;
    if (p) {
      // Usar el campo status del pago directamente
      const paymentStatus = String(p.status).toUpperCase();

      if (paymentStatus === PaymentStatus.PAGADO || paymentStatus === 'PAGADO') {
        status = 'PAID';
      } else if (paymentStatus === PaymentStatus.VENCIDO || paymentStatus === 'VENCIDO') {
        status = 'DUE';
      } else if (paymentStatus === PaymentStatus.FUTURO || paymentStatus === 'FUTURO') {
        status = 'FUTURE';
      } else {
        status = 'DUE';
      }
    } else {
      // Si no hay pago, determinar si es futuro o vencido basado en la fecha actual
      const now = new Date();
      const dueDate = dueDates[m - 1];
      if (dueDate > now) {
        status = 'FUTURE';
      } else {
        status = 'DUE';
      }
    }

    timeline.push({
      monthNumber: m,
      label: monthLabels[m - 1],
      dueDate: dueDates[m - 1],
      status
    });
  }

  return timeline;
}
