export type Hang = 'Tốt' | 'Trung bình' | 'Xấu' | 'Rất xấu' | 'Chưa chấm';

export interface Nguong {
  nguon: string;
  dsoTrenHan: [number, number, number, number];
  dsoGapNgay: [number, number, number, number];
  tyLeQuaHan: [number, number, number, number];
  ngayQhBq: [number, number, number, number];
  dungHanMuc: [number, number, number, number];
}

export const NGUONG_MAC_DINH: Nguong = {
  nguon: 'ngưỡng tạm để chạy demo',
  dsoTrenHan: [1, 1.2, 1.5, 2],
  dsoGapNgay: [0, 15, 30, 60],
  tyLeQuaHan: [0.05, 0.15, 0.3, 0.5],
  ngayQhBq: [15, 30, 60, 120],
  dungHanMuc: [0.5, 0.75, 0.9, 1],
};

export type BucketKey =
  | 'chuaDenHan'
  | 'traTruocHan'
  | 'denHan'
  | 'd0_30'
  | 'd31_60'
  | 'd61_90'
  | 'd91_120'
  | 'd121_150'
  | 'd151_180'
  | 'd181_365'
  | 'd365';

export const BUCKET_KEYS: BucketKey[] = [
  'chuaDenHan',
  'traTruocHan',
  'denHan',
  'd0_30',
  'd31_60',
  'd61_90',
  'd91_120',
  'd121_150',
  'd151_180',
  'd181_365',
  'd365',
];

export const BUCKET_LABEL: Record<BucketKey, string> = {
  chuaDenHan: 'Chưa đến hạn',
  traTruocHan: 'Trả trước hạn',
  denHan: 'Đến hạn',
  d0_30: '0–30 ngày',
  d31_60: '31–60 ngày',
  d61_90: '61–90 ngày',
  d91_120: '91–120 ngày',
  d121_150: '121–150 ngày',
  d151_180: '151–180 ngày',
  d181_365: '181–365 ngày',
  d365: 'Trên 365 ngày',
};

export interface ChungTu {
  ngayBaoCao: string;
  maKH: string;
  loaiCt: string;
  ngayCt: string | null;
  soHD: string;
  soCt: string;
  dienGiai: string;
  maHopDong: string;
  duDauKy: number;
  tienNo: number;
  hanTT: number | null;
  ngayTT: string | null;
  tienTT: number;
  duCuoiKy: number;
  sale: string;
  keHoachTuanSau: string;
  nhomKH: string;
  email: string;
  khuVuc: string;
  soNgayQH: number;
  bucket: BucketKey;
}

export interface ThanhPhan {
  ma: string;
  ten: string;
  diem: number | null;
}

export interface Khach {
  maKH: string;
  tenKH: string;
  sale: string;
  khuVuc: string;
  nhomKH: string;
  email: string;
  hmtd: number;
  hanDinh: number | null;
  diemHT: number | null;
  trongDm: boolean;
  duDauKy: number;
  tienNo: number;
  tienTT: number;
  duNo: number;
  trongHan: number;
  quaHan: number;
  doanhSo: number;
  hangDat: number;
  tienCoc: number;
  noKhoDoi: number;
  dso365: number | null;
  dsoGap: number | null;
  tyLeQuaHan: number | null;
  ngayQhBq: number | null;
  thanhPhan: ThanhPhan[];
  diem: number | null;
  nguonDiem: 'excel' | 'tinh';
  hang: Hang;
  trongSo: number;
  ratCao: boolean;
  le90: number;
  d91_180: number;
  gt180: number;
  aging: Record<BucketKey, number>;
  chungTu: ChungTu[];
}

export interface KyMeta {
  ngayChot: string;
  tuNgay: string;
  denNgay: string;
  soNgayKy: number;
  tuanTu: string;
  tuanDen: string;
  tuanNhan: string;
  keHoachDoanhThuTuan: number | null;
  keHoachThuTuan: number | null;
}

export interface Tong {
  soKhach: number;
  duDauKy: number;
  tienNo: number;
  tienTT: number;
  duNo: number;
  trongHan: number;
  denHan: number;
  chuaDenHan: number;
  quaHan: number;
  doanhSo: number;
  dsoKy: number | null;
  noKhoDoi: number;
  soKhachNoKhoDoi: number;
  vuotHmSo: number;
  vuotHmTien: number;
  chuaHmSo: number;
  chuaHmTien: number;
  duAmDong: number;
  duAmTien: number;
  hanNgan: number;
  thieuDm: number;
  aging: Record<BucketKey, number>;
  hang: Record<Hang, number>;
  qhThu: number;
}

export interface TuanFlow {
  doanhThu: number;
  thanhToan: number;
}

export interface KiemTra {
  ten: string;
  app: number;
  excel: number | null;
  lech: number | null;
  chan: boolean;
  dat: boolean;
}

export interface DanhMuc {
  maKH: string;
  tenKH: string;
  nhomKH: string;
  sale: string;
  khuVuc: string;
  email: string;
  hmRosy: number;
  hanRosy: number | null;
  hmDuyet: number | null;
  hanDuyet: number | null;
  diemHT: number | null;
}

export interface DauVao {
  tenFile: string;
  checksum: string;
  meta: KyMeta;
  chungTu: ChungTu[];
  danhMuc: Map<string, DanhMuc>;
  doanhSo: Map<string, number>;
  hangDat: Map<string, number>;
  tienCoc: Map<string, number>;
  noKhoDoi: Map<string, number>;
  diemExcel: Map<string, number>;
  nguong: Nguong;
  thcn: Map<string, { duDauKy: number; tienNo: number; tienTT: number; duNo: number }>;
  dapAn: Map<string, number>;
  loiDoc: string[];
}

export interface KetQua {
  tenFile: string;
  checksum: string;
  meta: KyMeta;
  khach: Khach[];
  tong: Tong;
  tuan: TuanFlow;
  kiemTra: KiemTra[];
  canhBao: string[];
  chanLuu: boolean;
  nhanDiem: string;
  loiDoc: string[];
}

export interface ThangDong {
  thang: string;
  phatSinh: number;
  thanhToan: number;
  quaHanTheoThang: number;
  duNoLuyKe: number;
  doanhThuLuyKe: number;
}

export interface TheTc2 {
  ma: string;
  ten: string;
  giaTri: string;
  phu: string;
}

type KhachNhap = Omit<Khach, 'thanhPhan' | 'diem' | 'nguonDiem' | 'hang' | 'trongSo' | 'ratCao' | 'le90' | 'd91_180' | 'gt180'>;

export function emptyAging(): Record<BucketKey, number> {
  return {
    chuaDenHan: 0,
    traTruocHan: 0,
    denHan: 0,
    d0_30: 0,
    d31_60: 0,
    d61_90: 0,
    d91_120: 0,
    d121_150: 0,
    d151_180: 0,
    d181_365: 0,
    d365: 0,
  };
}

export function hangCua(diem: number): Hang {
  if (diem >= 4) return 'Tốt';
  if (diem >= 3) return 'Trung bình';
  if (diem >= 2) return 'Xấu';
  return 'Rất xấu';
}

export function addDays(iso: string, days: number): string {
  const t = Date.parse(`${iso}T00:00:00Z`) + days * 86400000;
  const dt = new Date(t);
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${m}-${d}`;
}

export function diffDays(later: string, earlier: string): number {
  const a = Date.parse(`${later}T00:00:00Z`);
  const b = Date.parse(`${earlier}T00:00:00Z`);
  return Math.round((a - b) / 86400000);
}

export function inRange(iso: string | null, tu: string, den: string): boolean {
  if (!iso) return false;
  return iso >= tu && iso <= den;
}

export function tuanNhanCua(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const year = date.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((date.getTime() - start.getTime()) / 86400000 + 1) / 7);
  return `T${String(week).padStart(2, '0')}/${String(year).slice(-2)}`;
}

export function bucketCua(soNgayQH: number, duCuoiKy: number): BucketKey {
  if (duCuoiKy < 0) return 'traTruocHan';
  if (soNgayQH < 0) return 'chuaDenHan';
  if (soNgayQH === 0) return 'denHan';
  if (soNgayQH <= 30) return 'd0_30';
  if (soNgayQH <= 60) return 'd31_60';
  if (soNgayQH <= 90) return 'd61_90';
  if (soNgayQH <= 120) return 'd91_120';
  if (soNgayQH <= 150) return 'd121_150';
  if (soNgayQH <= 180) return 'd151_180';
  if (soNgayQH <= 365) return 'd181_365';
  return 'd365';
}

export function tinhSoNgayQH(ct: {
  ngayCt: string | null;
  hanTT: number | null;
  ngayTT: string | null;
  ngayBaoCao: string;
  duCuoiKy: number;
}): number {
  if (!ct.ngayTT && ct.duCuoiKy === 0) return 0;
  if (!ct.ngayCt) return 0;
  const denHan = addDays(ct.ngayCt, ct.hanTT ?? 0);
  return diffDays(ct.ngayTT ?? ct.ngayBaoCao, denHan);
}

function band(value: number, maxes: [number, number, number, number]): number {
  if (value <= maxes[0]) return 5;
  if (value <= maxes[1]) return 4;
  if (value <= maxes[2]) return 3;
  if (value <= maxes[3]) return 2;
  return 1;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function saleHien(sale: string): string {
  const s = sale.trim();
  return s ? s : 'Chưa gán';
}

function hanTuChungTu(cts: ChungTu[]): number | null {
  let w = 0;
  let s = 0;
  for (const ct of cts) {
    if (ct.hanTT == null || ct.hanTT <= 0) continue;
    const wt = Math.abs(ct.duCuoiKy) || 1;
    w += ct.hanTT * wt;
    s += wt;
  }
  return s > 0 ? w / s : null;
}

export function diemDoanhSoQuintile(ds: number[]): Map<number, number> {
  const indexed = ds.map((v, i) => ({ i, v })).filter((x) => x.v > 0);
  indexed.sort((a, b) => b.v - a.v || a.i - b.i);
  const out = new Map<number, number>();
  ds.forEach((v, i) => {
    if (v <= 0) out.set(i, 1);
  });
  const n = indexed.length;
  indexed.forEach((x, rank) => {
    const q = n === 0 ? 4 : Math.min(4, Math.floor((rank * 5) / n));
    out.set(x.i, 5 - q);
  });
  return out;
}

export function chamMotKhach(
  kh: KhachNhap,
  nguong: Nguong,
  diemExcel: number | undefined,
  diemDoanhSo: number | null,
): Pick<Khach, 'thanhPhan' | 'diem' | 'nguonDiem' | 'hang' | 'trongSo' | 'ratCao' | 'le90' | 'd91_180' | 'gt180'> {
  const le90 = kh.aging.d0_30 + kh.aging.d31_60 + kh.aging.d61_90;
  const d91_180 = kh.aging.d91_120 + kh.aging.d121_150 + kh.aging.d151_180;
  const gt180 = kh.aging.d181_365 + kh.aging.d365;
  const trongSo = 0.5 * le90 + 0.8 * d91_180 + gt180;
  const ratCao = kh.quaHan > 0 && gt180 / kh.quaHan >= 0.5;
  const risk = { trongSo, ratCao, le90, d91_180, gt180 };

  if (diemExcel != null && Number.isFinite(diemExcel)) {
    const diem = round1(diemExcel);
    return { thanhPhan: [], diem, nguonDiem: 'excel', hang: hangCua(diem), ...risk };
  }

  const parts: ThanhPhan[] = [{ ma: 'TC-1-1', ten: 'Doanh số', diem: diemDoanhSo }];
  const han = kh.hanDinh;
  if (kh.dso365 != null && han != null && han > 0) {
    parts.push({ ma: 'TC-1-2', ten: 'DSO / hạn thanh toán', diem: band(kh.dso365 / han, nguong.dsoTrenHan) });
    parts.push({ ma: 'TC-1-2b', ten: 'DSO Gap', diem: band(kh.dso365 - han + 1, nguong.dsoGapNgay) });
  } else {
    parts.push({ ma: 'TC-1-2', ten: 'DSO / hạn thanh toán', diem: null });
    parts.push({ ma: 'TC-1-2b', ten: 'DSO Gap', diem: null });
  }
  parts.push({
    ma: 'TC-1-3',
    ten: 'Tỷ lệ quá hạn',
    diem: kh.duNo <= 0 ? 5 : band(kh.quaHan / kh.duNo, nguong.tyLeQuaHan),
  });
  parts.push({
    ma: 'TC-1-4',
    ten: 'Ngày quá hạn bình quân',
    diem: kh.quaHan <= 0 || kh.ngayQhBq == null ? 5 : band(kh.ngayQhBq, nguong.ngayQhBq),
  });
  parts.push({
    ma: 'TC-1-5',
    ten: 'Mức dùng hạn mức',
    diem: kh.hmtd > 0 ? band(kh.duNo / kh.hmtd, nguong.dungHanMuc) : null,
  });
  parts.push({
    ma: 'TC-1-6',
    ten: 'Điểm hợp tác',
    diem: kh.diemHT != null && kh.diemHT >= 1 && kh.diemHT <= 5 ? kh.diemHT : null,
  });

  const dung = parts.filter((p): p is ThanhPhan & { diem: number } => p.diem != null);
  const diem = dung.length ? round1(dung.reduce((s, p) => s + p.diem, 0) / dung.length) : null;
  return {
    thanhPhan: parts,
    diem,
    nguonDiem: 'tinh',
    hang: diem == null ? 'Chưa chấm' : hangCua(diem),
    ...risk,
  };
}

export function tongHop(list: Khach[], soNgayKy: number): Tong {
  const aging = emptyAging();
  const hang: Record<Hang, number> = { 'Tốt': 0, 'Trung bình': 0, 'Xấu': 0, 'Rất xấu': 0, 'Chưa chấm': 0 };
  const tong: Tong = {
    soKhach: list.length,
    duDauKy: 0,
    tienNo: 0,
    tienTT: 0,
    duNo: 0,
    trongHan: 0,
    denHan: 0,
    chuaDenHan: 0,
    quaHan: 0,
    doanhSo: 0,
    dsoKy: null,
    noKhoDoi: 0,
    soKhachNoKhoDoi: 0,
    vuotHmSo: 0,
    vuotHmTien: 0,
    chuaHmSo: 0,
    chuaHmTien: 0,
    duAmDong: 0,
    duAmTien: 0,
    hanNgan: 0,
    thieuDm: 0,
    aging,
    hang,
    qhThu: 0,
  };
  for (const kh of list) {
    tong.duDauKy += kh.duDauKy;
    tong.tienNo += kh.tienNo;
    tong.tienTT += kh.tienTT;
    tong.duNo += kh.duNo;
    tong.trongHan += kh.trongHan;
    tong.denHan += kh.aging.denHan;
    tong.chuaDenHan += kh.aging.chuaDenHan;
    tong.quaHan += kh.quaHan;
    tong.doanhSo += kh.doanhSo;
    tong.noKhoDoi += kh.noKhoDoi;
    if (kh.noKhoDoi > 0) tong.soKhachNoKhoDoi += 1;
    if (kh.hmtd > 0 && kh.duNo > kh.hmtd) {
      tong.vuotHmSo += 1;
      tong.vuotHmTien += kh.duNo - kh.hmtd;
    }
    if (kh.hmtd === 0 && kh.duNo > 0) {
      tong.chuaHmSo += 1;
      tong.chuaHmTien += kh.duNo;
    }
    if (!kh.trongDm) tong.thieuDm += 1;
    hang[kh.hang] += 1;
    for (const key of BUCKET_KEYS) aging[key] += kh.aging[key];
    for (const ct of kh.chungTu) {
      if (ct.duCuoiKy < 0) {
        tong.duAmDong += 1;
        tong.duAmTien += ct.duCuoiKy;
      }
      if (ct.hanTT != null && ct.hanTT <= 1) tong.hanNgan += 1;
      if (ct.soNgayQH > 0 && ct.duCuoiKy === 0) tong.qhThu += ct.tienTT;
    }
  }
  tong.dsoKy = tong.doanhSo > 0 ? round1((tong.duNo / tong.doanhSo) * soNgayKy) : null;
  return tong;
}

export function tuanFlow(cts: ChungTu[], meta: KyMeta): TuanFlow {
  let doanhThu = 0;
  let thanhToan = 0;
  for (const ct of cts) {
    if (inRange(ct.ngayCt, meta.tuanTu, meta.tuanDen)) doanhThu += ct.tienNo;
    if (inRange(ct.ngayTT, meta.tuanTu, meta.tuanDen)) thanhToan += ct.tienTT;
  }
  return { doanhThu, thanhToan };
}

export function pareto80(list: Khach[]): Khach[] {
  const rows = list.filter((k) => k.duNo > 0).sort((a, b) => b.duNo - a.duNo);
  const tong = rows.reduce((s, k) => s + k.duNo, 0);
  if (tong <= 0) return [];
  const out: Khach[] = [];
  let acc = 0;
  for (const kh of rows) {
    out.push(kh);
    acc += kh.duNo;
    if (acc >= tong * 0.8) break;
  }
  return out;
}

export function locKhach(list: Khach[], f: { sale: string; hang: string; q: string }, tenTay: Record<string, string>): Khach[] {
  const q = f.q.trim().toLowerCase();
  return list.filter((kh) => {
    if (f.sale !== 'ALL' && kh.sale !== f.sale) return false;
    if (f.hang !== 'ALL' && kh.hang !== f.hang) return false;
    if (!q) return true;
    const ten = (tenTay[kh.maKH] || kh.tenKH).toLowerCase();
    return kh.maKH.toLowerCase().includes(q) || ten.includes(q);
  });
}

export function boLocTrong(f: { sale: string; hang: string; q: string }): boolean {
  return f.sale === 'ALL' && f.hang === 'ALL' && f.q.trim() === '';
}

function hmHieuLuc(dm: DanhMuc | undefined): { hmtd: number; han: number | null } {
  if (!dm) return { hmtd: 0, han: null };
  if (dm.hmDuyet != null) return { hmtd: dm.hmDuyet, han: dm.hanDuyet };
  return { hmtd: dm.hmRosy, han: dm.hanRosy };
}

export function lapKy(dauVao: DauVao): KetQua {
  const byMa = new Map<string, ChungTu[]>();
  for (const ct of dauVao.chungTu) {
    const list = byMa.get(ct.maKH) ?? [];
    list.push(ct);
    byMa.set(ct.maKH, list);
  }
  for (const ma of dauVao.danhMuc.keys()) {
    if (!byMa.has(ma)) byMa.set(ma, []);
  }

  const draft: KhachNhap[] = [];
  for (const ma of [...byMa.keys()].sort()) {
    const cts = byMa.get(ma) ?? [];
    const dm = dauVao.danhMuc.get(ma);
    const { hmtd, han } = hmHieuLuc(dm);
    const aging = emptyAging();
    let duDauKy = 0;
    let tienNo = 0;
    let tienTT = 0;
    let duNo = 0;
    let quaHan = 0;
    let trongHan = 0;
    let qhWeighted = 0;
    let sale = '';
    let khuVuc = '';
    let nhomKH = '';
    let email = '';
    for (const ct of cts) {
      duDauKy += ct.duDauKy;
      tienNo += ct.tienNo;
      tienTT += ct.tienTT;
      duNo += ct.duCuoiKy;
      aging[ct.bucket] += ct.duCuoiKy;
      if (ct.bucket === 'chuaDenHan' || ct.bucket === 'denHan' || ct.bucket === 'traTruocHan') trongHan += ct.duCuoiKy;
      if (ct.soNgayQH > 0 && ct.duCuoiKy > 0) {
        quaHan += ct.duCuoiKy;
        qhWeighted += ct.soNgayQH * ct.duCuoiKy;
      }
      if (!sale && ct.sale.trim()) sale = ct.sale.trim();
      if (!khuVuc && ct.khuVuc.trim()) khuVuc = ct.khuVuc.trim();
      if (!nhomKH && ct.nhomKH.trim()) nhomKH = ct.nhomKH.trim();
      if (!email && ct.email.trim()) email = ct.email.trim();
    }
    if (dm?.sale.trim()) sale = dm.sale.trim();
    if (dm?.khuVuc.trim()) khuVuc = dm.khuVuc.trim();
    if (dm?.nhomKH.trim()) nhomKH = dm.nhomKH.trim();
    if (dm?.email.trim()) email = dm.email.trim();
    const doanhSo = dauVao.doanhSo.get(ma) ?? 0;
    const dso365 = doanhSo > 0 ? (duNo / doanhSo) * 365 : null;
    const hanDinh = han && han > 0 ? han : hanTuChungTu(cts);
    draft.push({
      maKH: ma,
      tenKH: dm?.tenKH.trim() ?? '',
      sale: saleHien(sale),
      khuVuc,
      nhomKH,
      email,
      hmtd,
      hanDinh,
      diemHT: dm?.diemHT ?? null,
      trongDm: Boolean(dm),
      duDauKy,
      tienNo,
      tienTT,
      duNo,
      trongHan,
      quaHan,
      doanhSo,
      hangDat: dauVao.hangDat.get(ma) ?? 0,
      tienCoc: dauVao.tienCoc.get(ma) ?? 0,
      noKhoDoi: dauVao.noKhoDoi.get(ma) ?? 0,
      dso365,
      dsoGap: dso365 != null && hanDinh != null ? dso365 - hanDinh + 1 : null,
      tyLeQuaHan: duNo > 0 ? quaHan / duNo : null,
      ngayQhBq: quaHan > 0 ? qhWeighted / quaHan : null,
      aging,
      chungTu: cts,
    });
  }

  const quintile = diemDoanhSoQuintile(draft.map((k) => k.doanhSo));
  const khach: Khach[] = draft.map((k, i) => ({
    ...k,
    ...chamMotKhach(k, dauVao.nguong, dauVao.diemExcel.get(k.maKH), quintile.get(i) ?? 1),
  }));
  const tong = tongHop(khach, dauVao.meta.soNgayKy);
  const tuan = tuanFlow(dauVao.chungTu, dauVao.meta);
  const kiemTra = doiChieu(tong, khach, dauVao);
  const canhBao: string[] = [];
  if (tong.thieuDm > 0) canhBao.push(`${tong.thieuDm} mã có chứng từ nhưng chưa có trong DMKH.`);
  if (tong.duAmDong > 0) canhBao.push(`${tong.duAmDong} dòng dư âm, cộng ${Math.round(tong.duAmTien).toLocaleString('vi-VN')} đồng.`);
  if (tong.hanNgan > 0) canhBao.push(`${tong.hanNgan} dòng có hạn thanh toán không quá 1 ngày.`);
  const thieuSale = khach.filter((k) => k.duNo > 0 && k.sale === 'Chưa gán').length;
  if (thieuSale > 0) canhBao.push(`${thieuSale} khách có dư nợ nhưng chưa gán Sale.`);
  const coExcel = khach.some((k) => k.nguonDiem === 'excel');
  const coTinh = khach.some((k) => k.nguonDiem === 'tinh' && k.diem != null);
  const nhanDiem = coExcel && coTinh
    ? 'một phần điểm lấy từ Excel, phần còn lại tính theo ngưỡng tạm'
    : coExcel
      ? 'điểm lấy từ Excel'
      : dauVao.nguong.nguon;

  return {
    tenFile: dauVao.tenFile,
    checksum: dauVao.checksum,
    meta: dauVao.meta,
    khach,
    tong,
    tuan,
    kiemTra,
    canhBao,
    chanLuu: dauVao.loiDoc.length > 0 || kiemTra.some((k) => k.chan && !k.dat),
    nhanDiem,
    loiDoc: dauVao.loiDoc,
  };
}

function ganBang(app: number, excel: number | null, tol: number): boolean {
  if (excel == null || !Number.isFinite(app) || !Number.isFinite(excel)) return false;
  return Math.abs(app - excel) <= tol;
}

function dong(ten: string, app: number, excel: number | null, tol: number, chan: boolean): KiemTra {
  return { ten, app, excel, lech: excel == null ? null : app - excel, chan, dat: ganBang(app, excel, tol) };
}

function doiChieu(tong: Tong, khach: Khach[], dauVao: DauVao): KiemTra[] {
  let exDau = 0;
  let exNo = 0;
  let exTt = 0;
  let exCuoi = 0;
  const coThcn = dauVao.thcn.size > 0;
  for (const row of dauVao.thcn.values()) {
    exDau += row.duDauKy;
    exNo += row.tienNo;
    exTt += row.tienTT;
    exCuoi += row.duNo;
  }
  const rows: KiemTra[] = [
    dong('Đầu kỳ sổ = đầu kỳ Imp_THCN', tong.duDauKy, coThcn ? exDau : null, 1, true),
    dong('Tiền nợ = phát sinh tăng Imp_THCN', tong.tienNo, coThcn ? exNo : null, 1, true),
    dong('Tiền thanh toán = phát sinh giảm Imp_THCN', tong.tienTT, coThcn ? exTt : null, 1, true),
    dong('Dư cuối sổ = cuối kỳ Imp_THCN', tong.duNo, coThcn ? exCuoi : null, 1, true),
    dong('Đầu kỳ + nợ − thanh toán = dư cuối', tong.duDauKy + tong.tienNo - tong.tienTT, tong.duNo, 1, true),
    dong('Trong hạn + quá hạn = dư cuối', tong.trongHan + tong.quaHan, tong.duNo, 1, true),
    dong('Tổng dư theo khách = tổng chứng từ', khach.reduce((s, k) => s + k.duNo, 0), tong.duNo, 1, true),
  ];

  if (dauVao.dapAn.size > 0) {
    const expected: Array<[string, number, number]> = [
      ['tong.duDauKy', tong.duDauKy, 1],
      ['tong.tienNo', tong.tienNo, 1],
      ['tong.tienTT', tong.tienTT, 1],
      ['tong.duNo', tong.duNo, 1],
      ['tong.trongHan', tong.trongHan, 1],
      ['tong.quaHan', tong.quaHan, 1],
      ['tong.dsoKy', tong.dsoKy ?? 0, 0.05],
      ['tong.noKhoDoi', tong.noKhoDoi, 1],
      ['tong.vuotHmSo', tong.vuotHmSo, 0],
      ['tong.vuotHmTien', tong.vuotHmTien, 1],
      ['tong.chuaHmSo', tong.chuaHmSo, 0],
      ['tong.chuaHmTien', tong.chuaHmTien, 1],
      ['hang.Tốt', tong.hang['Tốt'], 0],
      ['hang.Trung bình', tong.hang['Trung bình'], 0],
      ['hang.Xấu', tong.hang['Xấu'], 0],
      ['hang.Rất xấu', tong.hang['Rất xấu'], 0],
    ];
    for (const [khoa, app, tol] of expected) {
      const excel = dauVao.dapAn.get(khoa);
      if (excel == null) continue;
      rows.push(dong(`Đáp án ${khoa}`, app, excel, tol, true));
    }
    let khop = 0;
    let tongDiem = 0;
    for (const kh of khach) {
      const excel = dauVao.dapAn.get(`khach.${kh.maKH}`);
      if (excel == null) continue;
      tongDiem += 1;
      if (kh.diem != null && Math.abs(kh.diem - excel) <= 0.05) khop += 1;
    }
    if (tongDiem > 0) rows.push(dong(`Điểm khách khớp đáp án (${khop}/${tongDiem})`, khop, tongDiem, 0, true));
  }
  return rows;
}

export function nhomSale(list: Khach[]): Array<{ sale: string; soKhach: number; duNo: number; quaHan: number }> {
  const map = new Map<string, { sale: string; soKhach: number; duNo: number; quaHan: number }>();
  for (const kh of list) {
    const cur = map.get(kh.sale) ?? { sale: kh.sale, soKhach: 0, duNo: 0, quaHan: 0 };
    cur.soKhach += 1;
    cur.duNo += kh.duNo;
    cur.quaHan += kh.quaHan;
    map.set(kh.sale, cur);
  }
  return [...map.values()].sort((a, b) => b.duNo - a.duNo);
}

export function topRuiRo(list: Khach[], n = 10): Khach[] {
  return [...list].filter((k) => k.quaHan > 0).sort((a, b) => b.trongSo - a.trongSo).slice(0, n);
}

export function chuoiThang(kh: Khach): ThangDong[] {
  const map = new Map<string, { phatSinh: number; thanhToan: number; quaHanTheoThang: number }>();
  for (const ct of kh.chungTu) {
    const thangPs = ct.ngayCt ? ct.ngayCt.slice(0, 7) : '';
    if (thangPs) {
      const ps = map.get(thangPs) ?? { phatSinh: 0, thanhToan: 0, quaHanTheoThang: 0 };
      ps.phatSinh += ct.tienNo;
      if (ct.soNgayQH > 0 && ct.duCuoiKy > 0) ps.quaHanTheoThang += ct.duCuoiKy;
      map.set(thangPs, ps);
    }
    if (ct.ngayTT) {
      const thangTt = ct.ngayTT.slice(0, 7);
      const tt = map.get(thangTt) ?? { phatSinh: 0, thanhToan: 0, quaHanTheoThang: 0 };
      tt.thanhToan += ct.tienTT;
      map.set(thangTt, tt);
    }
  }
  const keys = [...map.keys()].sort();
  let du = kh.duDauKy;
  let ds = 0;
  const buoc = kh.doanhSo > 0 && keys.length > 0 ? kh.doanhSo / keys.length : 0;
  return keys.map((thang) => {
    const row = map.get(thang)!;
    du += row.phatSinh - row.thanhToan;
    ds += buoc;
    return { thang, phatSinh: row.phatSinh, thanhToan: row.thanhToan, quaHanTheoThang: row.quaHanTheoThang, duNoLuyKe: du, doanhThuLuyKe: ds };
  });
}

function fmtPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return 'Chưa tính được';
  return `${new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n * 100)}%`;
}

function fmtNgay(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return 'Chưa tính được';
  return `${new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n)} ngày`;
}

export function theTc2(tong: Tong, khach: Khach[]): TheTc2[] {
  const mau11b = tong.quaHan + tong.denHan;
  const hm = khach.reduce((s, k) => s + (k.hmtd > 0 ? k.hmtd : 0), 0);
  const duCoHm = khach.reduce((s, k) => s + (k.hmtd > 0 ? k.duNo : 0), 0);
  const hanW = khach.reduce(
    (acc, k) => {
      if (k.hanDinh && k.hanDinh > 0 && k.duNo > 0) {
        acc.w += k.hanDinh * k.duNo;
        acc.s += k.duNo;
      }
      return acc;
    },
    { w: 0, s: 0 },
  );
  const hanBq = hanW.s > 0 ? hanW.w / hanW.s : null;
  const gap = tong.dsoKy != null && hanBq != null ? tong.dsoKy - hanBq : null;
  const tyLeThu = tong.qhThu + tong.quaHan > 0 ? tong.qhThu / (tong.qhThu + tong.quaHan) : null;
  return [
    { ma: 'TC-2.1a', ten: 'Nợ quá hạn / tổng công nợ', giaTri: fmtPct(tong.duNo !== 0 ? tong.quaHan / tong.duNo : null), phu: '' },
    { ma: 'TC-2.1b', ten: 'Nợ quá hạn / (quá hạn + đến hạn)', giaTri: fmtPct(mau11b !== 0 ? tong.quaHan / mau11b : null), phu: '' },
    { ma: 'TC-2.2a', ten: 'DSO công ty', giaTri: fmtNgay(tong.dsoKy), phu: 'Dư nợ / doanh số kỳ × số ngày của kỳ' },
    { ma: 'TC-2.2b', ten: 'DSO Gap', giaTri: fmtNgay(gap), phu: 'Tham khảo, không cộng điểm' },
    { ma: 'TC-2.3', ten: 'Tỷ lệ thu hồi nợ quá hạn', giaTri: fmtPct(tyLeThu), phu: 'Tiền thu của chứng từ đã quá hạn và tất toán, chia cho khoản đó cộng dư quá hạn còn lại' },
    { ma: 'TC-2.4', ten: 'Sử dụng hạn mức', giaTri: fmtPct(hm > 0 ? duCoHm / hm : null), phu: 'Chỉ khách có hạn mức lớn hơn 0' },
    { ma: 'TC-2.5', ten: 'Nợ xấu (nợ khó đòi) / tổng công nợ', giaTri: fmtPct(tong.duNo !== 0 ? tong.noKhoDoi / tong.duNo : null), phu: '' },
  ];
}

export function metaMacDinh(ngayChot: string, tuNgay: string): KyMeta {
  const denNgay = ngayChot;
  const soNgayKy = Math.max(1, diffDays(denNgay, tuNgay) + 1);
  const tuanDen = ngayChot;
  const tuanTu = addDays(ngayChot, -6);
  return {
    ngayChot,
    tuNgay,
    denNgay,
    soNgayKy,
    tuanTu,
    tuanDen,
    tuanNhan: tuanNhanCua(tuanDen),
    keHoachDoanhThuTuan: null,
    keHoachThuTuan: null,
  };
}
