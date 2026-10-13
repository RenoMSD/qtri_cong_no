/** Tọa độ milimét của ba mẫu 16:9. Web và PDF dùng chung file này. */

export type MauId = 'tc1' | 'tuan' | 'khach';

export const MAU_TEN: Record<MauId, string> = {
  tc1: 'TC1 — Quản trị công nợ',
  tuan: 'Báo cáo công nợ tuần',
  khach: 'Báo cáo khách hàng',
};

export const TRANG = { rong: 338.7, cao: 190.5, le: 8 };

export const MAU = {
  xanh: '#1976D2',
  navy: '#123E78',
  tot: '#16A34A',
  theo: '#F59E0B',
  nguy: '#DC2626',
  nen: '#F4F7FB',
  the: '#FFFFFF',
  vien: '#E2E8F0',
  chu: '#0F172A',
  phu: '#64748B',
};

export const MAU_TUOI = [
  '#16A34A',
  '#0D9488',
  '#22C55E',
  '#84CC16',
  '#A3E635',
  '#FACC15',
  '#F59E0B',
  '#FB923C',
  '#F97316',
  '#DC2626',
  '#991B1B',
];

export type OBox = { id: string; x: number; y: number; w: number; h: number };

export type Lat = { ten: string; v: number; hien: string; mau: string; khoa?: string };

export type DaySo = { ten: string; mau: string; v: number[] };

export type NoiDung =
  | { kieu: 'tieu'; tieu: string; phu: string }
  | { kieu: 'kpi'; ten: string; gia: string; phu: string; mau: string }
  | { kieu: 'tron'; tieu: string; phu?: string; lat: Lat[]; loc?: 'nhomKH' | 'khuVuc' }
  | { kieu: 'cot'; tieu: string; phu?: string; lat: Lat[]; ngang?: boolean; loc?: 'khuVuc' | 'nhomKH' }
  | { kieu: 'duong'; tieu: string; phu?: string; lat: Lat[] }
  | { kieu: 'nhom'; tieu: string; phu?: string; nhom: string[]; series: DaySo[] }
  | { kieu: 'chong'; tieu: string; phu?: string; nhom: string[]; series: DaySo[]; loc?: 'sale' }
  | { kieu: 'bang'; tieu: string; cot: string[]; dong: string[][]; ma?: string[]; chu?: string }
  | { kieu: 'the'; tieu: string; the: { ten: string; gia: string; phu: string; mau: string }[] };

export type BangSau = { tieu: string; cot: string[]; dong: string[][]; ma?: string[] };

export type DuLieuMau = {
  id: MauId;
  ngayChot: string;
  o: Record<string, NoiDung>;
  sau: BangSau;
};

function kpi(y: number, h: number): OBox[] {
  const w = 52.3;
  const gap = 1.7;
  return Array.from({ length: 6 }, (_, i) => ({ id: `kpi${i}`, x: 8 + i * (w + gap), y, w, h }));
}

function hop(id: string, x: number, y: number, w: number, h: number): OBox {
  return { id, x, y, w, h };
}

const TIEU = hop('tieu', 8, 8, 322.3, 11);

export const KHUNG: Record<MauId, OBox[]> = {
  tc1: [
    TIEU,
    ...kpi(21, 22),
    hop('donut', 8, 45, 118, 64),
    hop('tuoi', 128, 45, 202.3, 64),
    hop('thu', 8, 111, 158, 48),
    hop('top', 168, 111, 162.3, 48),
    hop('canh0', 8, 161, 79.4, 20),
    hop('canh1', 89.1, 161, 79.4, 20),
    hop('canh2', 170.2, 161, 79.4, 20),
    hop('canh3', 251.3, 161, 79, 20),
  ],
  tuan: [
    TIEU,
    ...kpi(21, 22),
    hop('tuoi', 8, 45, 158, 62),
    hop('thang', 168, 45, 162.3, 62),
    hop('donut', 8, 109, 72, 72),
    hop('han', 82, 109, 108, 72),
    hop('top', 192, 109, 138.3, 72),
  ],
  khach: [
    TIEU,
    ...kpi(21, 22),
    hop('donut', 8, 45, 108, 44),
    hop('khu', 118, 45, 212.3, 44),
    hop('luyke', 8, 91, 150, 42),
    hop('top', 160, 91, 170.3, 42),
    hop('chong', 8, 135, 220, 47),
    hop('hang', 230, 135, 100.3, 47),
  ],
};

export function kiemKhung(id: MauId): string[] {
  const loi: string[] = [];
  const ds = KHUNG[id];
  const phai = TRANG.rong - TRANG.le;
  const duoi = TRANG.cao - TRANG.le;
  for (const o of ds) {
    if (o.x < TRANG.le - 0.05 || o.y < TRANG.le - 0.05 || o.x + o.w > phai + 0.05 || o.y + o.h > duoi + 0.05) {
      loi.push(`${o.id} vượt trang`);
    }
    if (o.w < 18 || o.h < 10) loi.push(`${o.id} quá nhỏ`);
  }
  for (let i = 0; i < ds.length; i++) {
    for (let j = i + 1; j < ds.length; j++) {
      const a = ds[i];
      const b = ds[j];
      const chong = a.x < b.x + b.w - 0.3 && b.x < a.x + a.w - 0.3 && a.y < b.y + b.h - 0.3 && b.y < a.y + a.h - 0.3;
      if (chong) loi.push(`${a.id} chồng ${b.id}`);
    }
  }
  const rongNhat = Math.max(...ds.filter((o) => o.id !== 'tieu' && !o.id.startsWith('kpi') && !o.id.startsWith('canh')).map((o) => o.w));
  if (rongNhat > 250) loi.push('một biểu đồ chiếm gần hết trang');
  return loi;
}
