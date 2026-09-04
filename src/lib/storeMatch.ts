/** Store numbers are free-text fields — normalize before comparing so "4821", " 4821 ", and "4821" all match. */
export function normalizeStoreNumber(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}
