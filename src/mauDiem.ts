export const THANG_DIEM = [
  { muc: 5, gia: '≤ 45%', hanh: '≤ 45%', nen: '#43B85A', chu: '#083018' },
  { muc: 4, gia: '45% – 60%', hanh: '45% – 60%', nen: '#C5D84A', chu: '#2A3400' },
  { muc: 3, gia: '60% – 75%', hanh: 'Theo dõi', nen: '#F6D34D', chu: '#4A3C00' },
  { muc: 2, gia: '75% – 90%', hanh: '75% – 90%', nen: '#F5A623', chu: '#4A2C00' },
  { muc: 1, gia: '> 90%', hanh: 'Dừng giao hàng', nen: '#E67E22', chu: '#3D1E00' },
] as const;

export function bacDiem(diem: number | null | undefined): number | null {
  if (diem == null || !Number.isFinite(diem)) return null;
  return Math.min(5, Math.max(1, Math.round(diem)));
}

export function bacHanMuc(duNo: number, hmtd: number): number | null {
  if (!(hmtd > 0) || !Number.isFinite(duNo)) return null;
  const t = duNo / hmtd;
  if (t <= 0.45) return 5;
  if (t <= 0.6) return 4;
  if (t <= 0.75) return 3;
  if (t <= 0.9) return 2;
  return 1;
}

export function thangDiem(muc: number) {
  return THANG_DIEM.find((t) => t.muc === muc) ?? THANG_DIEM[4];
}
