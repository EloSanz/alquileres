import { Payment } from '../../../shared/types/Payment';

export type SlotStatus = 'PAID' | 'DUE' | 'FUTURE';

export interface TimelineSlot {
    monthNumber: number; // 1-12
    monthLabel: string; // "Ene", "Feb"...
    year: number;
    status: SlotStatus;
    payment?: Payment; // The real payment if it exists
    isMissing: boolean;   // True if it's a "virtual" slot (no database record)

    // Derived properties for UI convenience
    isPaid: boolean;
    isDue: boolean;
    isFuture: boolean;
}
