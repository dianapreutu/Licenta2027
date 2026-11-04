// format.js
// Funcții mici pentru afișarea datelor în stil românesc.

// „4 noiembrie 2026, 21:45”
export function formatDate(isoString) {
  return new Date(isoString).toLocaleString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// „4 noiembrie 2026” (fără oră)
export function formatDay(dateString) {
  return new Date(dateString).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// „noiembrie 2026”, folosit pentru gruparea pozelor pe luni
export function formatMonth(dateString) {
  const text = new Date(dateString).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Numărul de zile întregi dintre două date
export function daysBetween(from, to) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(to) - new Date(from)) / msPerDay);
}

// Textul cerut de <input type="datetime-local">, de forma „2026-11-04T21:45”, în ora locală
export function toDateTimeInputValue(date) {
  return toDateInputValue(date) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}

// Textul cerut de <input type="date">, de forma „2026-11-04”, în ora locală
export function toDateInputValue(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

function pad(number) {
  return String(number).padStart(2, '0');
}
