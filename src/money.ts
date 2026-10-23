export function parseAmount(value: string): number {
  const cleaned = value.replace(/£/g, "").replace(/,/g, "").trim();
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export function formatPounds(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

/** Formats ISO `YYYY-MM-DD` (or Date-parseable) values as `DD/MM/YYYY`. */
export function formatUkDate(value: string): string {
  const iso = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    const dd = String(parsed.getDate()).padStart(2, "0");
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const yyyy = parsed.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  return value;
}

export function formatSortCodeInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6)].filter(
    Boolean,
  );
  return parts.join("-");
}

export function formatAccountNumberInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}
