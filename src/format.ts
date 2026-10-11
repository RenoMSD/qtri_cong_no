const tv = (n: number, min: number, max: number) =>
  new Intl.NumberFormat('vi-VN', { minimumFractionDigits: min, maximumFractionDigits: max }).format(n);

export function ty(n: number): string {
  return `${tv(n / 1e9, 2, 2)} tỷ`;
}

export function dong(n: number): string {
  return tv(n, 0, 0);
}

export function so1(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return tv(n, 1, 1);
}

export function soLinh(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return tv(n, 0, 2);
}

export function ngay(iso: string | null | undefined): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '—';
}

export function pct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${tv(n * 100, 1, 1)}%`;
}

export function thangNhan(thang: string): string {
  const m = thang.match(/^(\d{4})-(\d{2})/);
  return m ? `${m[2]}/${m[1]}` : thang;
}
