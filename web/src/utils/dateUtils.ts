/**
 * Formatea una fecha (Date object o string) a formato DD/MM/YYYY
 * Solo se usa para paymentDate que sí necesita ser Date
 */
export function formatDateLocal(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  
  let date: Date;
  
  // Si es Date object, usarlo directamente
  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    // Si es string, convertir a Date
    // Manejar formato YYYY-MM-DD parseándolo como fecha local
    const str = String(dateInput);
    const dateOnlyRegex = /^(\d{4})-(\d{2})-(\d{2})/;
    const match = str.match(dateOnlyRegex);
    
    if (match) {
      // Parsear como fecha local (no UTC) para evitar problemas de zona horaria
      const [, year, month, day] = match;
      date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    } else {
      // Fallback: parsear normalmente
      date = new Date(str);
    }
  }
  
  // Verificar que la fecha es válida
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Formatea una fecha para mostrar en formato corto (DD/MM/YYYY)
 */
export function formatDateShort(dateInput: string | Date | null | undefined): string {
  return formatDateLocal(dateInput);
}

