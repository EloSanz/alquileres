/**
 * Formatea una fecha (Date object o string YYYY-MM-DD) usando siempre UTC.
 * Esto evita el desfasaje de "un día antes" al parsear fechas ISO.
 */
export function formatDateUTC(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC'
  });
}

/**
 * Formatea una fecha en formato largo (ej: "1 de marzo de 2026") usando siempre UTC.
 */
export function formatDateLongUTC(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

/**
 * Obtiene el nombre del mes de una fecha en UTC.
 */
export function getMonthNameUTC(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('es-ES', {
    month: 'long',
    timeZone: 'UTC'
  }).replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Formatea una fecha en formato ISO (YYYY-MM-DD) usando siempre UTC.
 * Ideal para cargar valores en inputs de tipo "date".
 */
export function formatDateISO(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  return date.toISOString().split('T')[0];
}
