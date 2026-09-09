const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const monthFmt = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

/** "09/02/2026" */
export function formatDate(date: Date | string): string {
  return dateFmt.format(typeof date === "string" ? new Date(date) : date);
}

/** "fevereiro de 2026" */
export function formatMonth(date: Date | string): string {
  return monthFmt.format(typeof date === "string" ? new Date(date) : date);
}

/** yyyy-mm-dd for <input type="date"> */
export function toDateInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}
