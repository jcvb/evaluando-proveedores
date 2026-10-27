/** Normaliza un teléfono mexicano a 10 dígitos. */
export function normalizeMxPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("521") && digits.length === 13) digits = digits.slice(3);
  if (digits.startsWith("52") && digits.length === 12) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  return digits;
}

export function formatMxPhone(phone: string): string {
  if (phone.length !== 10) return phone;
  return `${phone.slice(0, 2)} ${phone.slice(2, 6)} ${phone.slice(6)}`;
}
