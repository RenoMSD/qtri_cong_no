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

const CHU_SO = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const DON_VI = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

function docBaSo(n: number, docDu: boolean): string {
  const tram = Math.floor(n / 100);
  const chuc = Math.floor((n % 100) / 10);
  const dv = n % 10;
  const out: string[] = [];
  if (tram > 0 || docDu) out.push(`${CHU_SO[tram]} trăm`);
  if (chuc === 0) {
    if (dv > 0 && (tram > 0 || docDu)) out.push('linh');
  } else out.push(chuc === 1 ? 'mười' : `${CHU_SO[chuc]} mươi`);
  if (dv === 1 && chuc >= 2) out.push('mốt');
  else if (dv === 5 && chuc >= 1) out.push('lăm');
  else if (dv > 0) out.push(CHU_SO[dv]);
  return out.join(' ');
}

/** Đọc số tiền thành chữ, ví dụ 1.250.000 → "Một triệu hai trăm năm mươi nghìn đồng". */
export function docSoTien(n: number): string {
  let so = Math.round(Math.abs(n));
  const nhom: number[] = [];
  do {
    nhom.push(so % 1000);
    so = Math.floor(so / 1000);
  } while (so > 0);
  const phan: string[] = [];
  for (let i = nhom.length - 1; i >= 0; i -= 1) {
    if (nhom[i] === 0) continue;
    phan.push(`${docBaSo(nhom[i], phan.length > 0)} ${DON_VI[i]}`.trim());
  }
  const chu = `${n < 0 ? 'âm ' : ''}${phan.length ? phan.join(' ') : 'không'} đồng`;
  return chu.charAt(0).toUpperCase() + chu.slice(1);
}
