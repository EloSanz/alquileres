import { useMemo } from 'react';
import { Payment, PaymentStatus } from '../../../shared/types/Payment';
import { TimelineSlot, SlotStatus } from '../domain/timeline';

// Nombres de meses en español
const MONTH_NAMES = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

interface UsePaymentTimelineProps {
    payments: Payment[];
    year: number;
    contractId?: number;
    tenantId?: number;
    propertyId?: number;
}

export const usePaymentTimeline = ({ payments, year, contractId, tenantId, propertyId }: UsePaymentTimelineProps) => {

    const timelineSlots = useMemo<TimelineSlot[]>(() => {
        // 1. Filter payments for the specific context and year
        const relevantPayments = payments.filter(p => {
            // Linkage check: Match by contract OR (if no contract on payment) match by property/tenant
            if (contractId && p.contractId) {
                // Both sides have a contractId — match directly
                if (p.contractId !== contractId) return false;
            } else if (contractId && !p.contractId) {
                // Payment has no contractId (orphaned) — fall back to tenant+property match
                if (tenantId !== undefined && p.tenantId !== tenantId) return false;
                if (propertyId !== undefined && p.propertyId !== propertyId) return false;
                // If neither tenantId ni propertyId fueron provistos, no se puede vincular
                if (tenantId === undefined && propertyId === undefined) return false;
            } else if (!contractId) {
                // Sin contexto de contrato — filtrar por tenant/property si se proveen
                if (tenantId !== undefined && p.tenantId !== tenantId) return false;
                if (propertyId !== undefined && p.propertyId !== propertyId) return false;
            }

            // Chequeo de año usando UTC para evitar shifts de zona horaria
            const dueDate = new Date(p.dueDate);
            const dueYear = dueDate.getUTCFullYear();
            return dueYear === year;
        });


        const slots: TimelineSlot[] = [];

        // 2. Generate 1-12 slots
        for (let month = 1; month <= 12; month++) {
            // Find payment for this month key
            const payment = relevantPayments.find(p => {
                if (p.monthNumber) return p.monthNumber === month;
                const due = new Date(p.dueDate);
                return (due.getUTCMonth() + 1) === month;
            });

            // 3. Determine Status
            let status: SlotStatus = 'FUTURE';

            if (payment) {
                // If payment exists, trust its status
                if (payment.status === PaymentStatus.PAGADO) {
                    status = 'PAID';
                } else if (payment.status === PaymentStatus.VENCIDO) {
                    status = 'DUE';
                } else if (payment.status === PaymentStatus.FUTURO) {
                    status = 'FUTURE';
                } else {
                    status = 'DUE';
                }
            } else {
                // Virtual/Missing Slot
                status = 'FUTURE';

                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;

                if (year < currentYear) {
                    status = 'DUE'; // Past years are definitely due
                } else if (year === currentYear && month < currentMonth) {
                    status = 'DUE'; // Past months of current year are due
                }
            }

            slots.push({
                monthNumber: month,
                monthLabel: `${MONTH_NAMES[month - 1]} ${year}`,
                year,
                status,
                payment: payment || undefined,
                isMissing: !payment,
                isPaid: status === 'PAID',
                isDue: status === 'DUE',
                isFuture: status === 'FUTURE'
            });
        }

        return slots;
    }, [payments, year, contractId, tenantId, propertyId]);

    return timelineSlots;
};
