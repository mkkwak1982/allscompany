export function formatWon(value: number): string {
  return Math.round(value).toLocaleString("ko-KR");
}

export function formatPercent(rate: number, digits = 1): string {
  return `${(rate * 100).toFixed(digits)}%`;
}

export function formatDate(date: Date | null): string {
  if (!date) return "-";
  return date.toISOString().slice(0, 10);
}
