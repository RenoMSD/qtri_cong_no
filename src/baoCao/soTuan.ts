import { addDays, diffDays, type ChungTu, type Khach, type KyMeta } from '../lib/metrics';

// Dựng lại số dư tại một mốc ngày từ chứng từ, để so đầu tuần với cuối tuần

export type AnhDu = {
  du: number;
  trongHan: number;
  qh1_30: number;
  qh31_60: number;
  qh61_90: number;
  qhTren90: number;
  noXau: number;
  quaHan: number;
};

const ANH_RONG: AnhDu = { du: 0, trongHan: 0, qh1_30: 0, qh31_60: 0, qh61_90: 0, qhTren90: 0, noXau: 0, quaHan: 0 };

function duTai(ct: ChungTu, moc: string, ngayChot: string): number {
  if (moc >= ngayChot) return ct.duCuoiKy;
  if (!ct.ngayCt || ct.ngayCt > moc) return 0;
  // Khoản thanh toán sau mốc chưa trừ vào dư tại mốc
  return ct.duCuoiKy + (ct.ngayTT && ct.ngayTT > moc ? ct.tienTT : 0);
}

function congVao(a: AnhDu, ct: ChungTu, moc: string, ngayChot: string) {
  const du = duTai(ct, moc, ngayChot);
  if (du === 0) return;
  a.du += du;
  const ngayQH = ct.ngayCt ? diffDays(moc, addDays(ct.ngayCt, ct.hanTT ?? 0)) : 0;
  if (du < 0 || ngayQH <= 0) {
    a.trongHan += du;
    return;
  }
  a.quaHan += du;
  if (ngayQH <= 30) a.qh1_30 += du;
  else if (ngayQH <= 60) a.qh31_60 += du;
  else if (ngayQH <= 90) a.qh61_90 += du;
  else a.qhTren90 += du;
  if (ngayQH > 365) a.noXau += du;
}

export function anhDu(cts: ChungTu[], moc: string, ngayChot: string): AnhDu {
  const a = { ...ANH_RONG };
  for (const ct of cts) congVao(a, ct, moc, ngayChot);
  return a;
}

export type SoTuan = {
  dauMoc: string;
  dau: AnhDu;
  cuoi: AnhDu;
  phatSinh: number;
  thanhToan: number;
  ttDungHan: number;
  ttTreHan: number;
  phatSinhLuyKeDau: number;
  thanhToanLuyKeDau: number;
};

export function soTuan(list: Khach[], meta: KyMeta): SoTuan {
  const cts = list.flatMap((k) => k.chungTu);
  const dauMoc = addDays(meta.tuanTu, -1);
  let phatSinh = 0;
  let thanhToan = 0;
  let ttDungHan = 0;
  let ttTreHan = 0;
  let phatSinhLuyKeDau = 0;
  let thanhToanLuyKeDau = 0;
  for (const ct of cts) {
    if (ct.ngayCt && ct.ngayCt >= meta.tuanTu && ct.ngayCt <= meta.tuanDen) phatSinh += ct.tienNo;
    else if (ct.ngayCt && ct.ngayCt <= dauMoc) phatSinhLuyKeDau += ct.tienNo;
    if (ct.ngayTT && ct.ngayTT >= meta.tuanTu && ct.ngayTT <= meta.tuanDen) {
      thanhToan += ct.tienTT;
      const han = ct.ngayCt ? addDays(ct.ngayCt, ct.hanTT ?? 0) : ct.ngayTT;
      if (ct.ngayTT <= han) ttDungHan += ct.tienTT;
      else ttTreHan += ct.tienTT;
    } else if (ct.ngayTT && ct.ngayTT <= dauMoc) thanhToanLuyKeDau += ct.tienTT;
  }
  return {
    dauMoc,
    dau: anhDu(cts, dauMoc, meta.ngayChot),
    cuoi: anhDu(cts, meta.tuanDen, meta.ngayChot),
    phatSinh,
    thanhToan,
    ttDungHan,
    ttTreHan,
    phatSinhLuyKeDau,
    thanhToanLuyKeDau,
  };
}

/** Số trong tuần của một khách: dư đầu tuần, phát sinh, thực thu. */
export function soTuanKhach(kh: Khach, meta: KyMeta) {
  const dauMoc = addDays(meta.tuanTu, -1);
  let duDau = 0;
  let phatSinh = 0;
  let thucThu = 0;
  let maxQH = 0;
  for (const ct of kh.chungTu) {
    duDau += duTai(ct, dauMoc, meta.ngayChot);
    if (ct.ngayCt && ct.ngayCt >= meta.tuanTu && ct.ngayCt <= meta.tuanDen) phatSinh += ct.tienNo;
    if (ct.ngayTT && ct.ngayTT >= meta.tuanTu && ct.ngayTT <= meta.tuanDen) thucThu += ct.tienTT;
    if (ct.duCuoiKy > 0 && ct.soNgayQH > maxQH) maxQH = ct.soNgayQH;
  }
  return { duDau, phatSinh, thucThu, maxQH };
}

export type MucCanhBao = 'Cần xử lý gấp' | 'Theo dõi sát' | 'Ổn định';

export function canhBaoKhach(kh: Khach, maxQH: number): MucCanhBao {
  const vuotHm = (kh.hmtd > 0 && kh.duNo > kh.hmtd) || (kh.hmtd === 0 && kh.duNo > 0 && kh.quaHan > 0);
  if (kh.hang === 'Rất xấu' || maxQH > 90 || vuotHm) return 'Cần xử lý gấp';
  if (kh.quaHan > 0 || kh.hang === 'Xấu') return 'Theo dõi sát';
  return 'Ổn định';
}
