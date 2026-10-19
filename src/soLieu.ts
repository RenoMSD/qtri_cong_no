import {
  BUCKET_KEYS,
  BUCKET_LABEL,
  addDays,
  diffDays,
  tuanNhanCua,
  type BucketKey,
  type ChungTu,
  type Hang,
  type Khach,
  type KetQua,
  type ThangDong,
  type Tong,
  type TuanFlow,
  chuoiThang,
  locKhach,
  nhomSale,
  theTc2,
  tongHop,
  topRuiRo,
  tuanFlow,
} from './lib/metrics';
import { dong, ngay, pct, so1, thangNhan, ty } from './format';
import { bacDiem, bacHanMuc, thangDiem } from './mauDiem';

export type Loc = { sale: string; hang: string; q: string };
export type PhamVi = 'loc' | 'toan-bo';

export type Tay = {
  ten: Record<string, string>;
  ghi: Record<string, string>;
  keHoach: Record<string, string>;
  nhatKy: Record<string, string[]>;
  tuanNay: string;
  tuanSau: string;
  them: { maKH: string; ten: string }[];
  deXuat: string[];
  /** Trạng thái xử lý cảnh báo, khóa `${nhom}:${maKH}` */
  xuLy: Record<string, 'dang' | 'xong'>;
};

export const LOC_RONG: Loc = { sale: 'ALL', hang: 'ALL', q: '' };

export const TAY_RONG: Tay = {
  ten: {},
  ghi: {},
  keHoach: {},
  nhatKy: {},
  tuanNay: '',
  tuanSau: '',
  them: [],
  deXuat: [],
  xuLy: {},
};

export function docTay(checksum: string): Tay {
  try {
    const raw = localStorage.getItem(`newcredit:${checksum}`);
    if (!raw) return TAY_RONG;
    const x = JSON.parse(raw) as Tay;
    return { ...TAY_RONG, ...x, ten: x.ten ?? {}, ghi: x.ghi ?? {}, keHoach: x.keHoach ?? {}, nhatKy: x.nhatKy ?? {}, them: x.them ?? [], deXuat: x.deXuat ?? [], xuLy: x.xuLy ?? {} };
  } catch {
    return TAY_RONG;
  }
}

export function luuTay(checksum: string, tay: Tay) {
  localStorage.setItem(`newcredit:${checksum}`, JSON.stringify(tay));
}

export function tenKhach(kh: Khach, tay: Tay): string {
  return tay.ten[kh.maKH]?.trim() || kh.tenKH || kh.maKH;
}

export interface DongTuan {
  n: string;
  quaHan: number;
  tienThu: number;
}

function duQuaHanTai(ct: ChungTu, moc: string, ngayChot: string): number {
  if (moc >= ngayChot) return ct.soNgayQH > 0 && ct.duCuoiKy > 0 ? ct.duCuoiKy : 0;
  if (!ct.ngayCt || ct.ngayCt > moc) return 0;
  const denHan = addDays(ct.ngayCt, ct.hanTT ?? 0);
  if (diffDays(moc, denHan) <= 0) return 0;
  const daThu = ct.ngayTT != null && ct.ngayTT <= moc;
  const du = daThu ? ct.duCuoiKy : ct.duCuoiKy + Math.max(0, ct.tienTT);
  return du > 0 ? du : 0;
}

function nhanLui(tuanNhan: string, buocLui: number): string {
  const m = tuanNhan.match(/^T(\d+)\/(\d+)$/);
  if (!m) return tuanNhan;
  let tuan = Number(m[1]) - buocLui;
  let nam = Number(m[2]);
  while (tuan <= 0) {
    tuan += 52;
    nam -= 1;
  }
  return `T${String(tuan).padStart(2, '0')}/${String(nam).padStart(2, '0')}`;
}

export function chuoi8Tuan(list: Khach[], ngayChot: string, tuanNhan = ''): DongTuan[] {
  const cts = list.flatMap((k) => k.chungTu);
  const dong: DongTuan[] = [];
  for (let i = 7; i >= 0; i -= 1) {
    const den = addDays(ngayChot, -7 * i);
    const tu = addDays(den, -6);
    let quaHan = 0;
    let tienThu = 0;
    for (const ct of cts) {
      quaHan += duQuaHanTai(ct, den, ngayChot);
      if (ct.ngayTT && ct.ngayTT >= tu && ct.ngayTT <= den) tienThu += ct.tienTT;
    }
    dong.push({ n: tuanNhan ? nhanLui(tuanNhan, i) : tuanNhanCua(den), quaHan, tienThu });
  }
  return dong;
}

export function cauQuaHanTuan(dong: DongTuan[]): { cau: string; huong: 'tang' | 'giam' | 'bang' | 'thieu' } {
  if (dong.length < 2) return { cau: 'Chưa đủ tuần trước để so sánh.', huong: 'thieu' };
  const lech = dong[dong.length - 1].quaHan - dong[dong.length - 2].quaHan;
  if (Math.abs(lech) < 5_000_000) return { cau: 'Quá hạn tuần này không đổi so với tuần trước.', huong: 'bang' };
  if (lech > 0) return { cau: `Quá hạn tuần này tăng ${ty(lech)} so với tuần trước.`, huong: 'tang' };
  return { cau: `Quá hạn tuần này giảm ${ty(Math.abs(lech))} so với tuần trước.`, huong: 'giam' };
}

export interface CotKhach {
  ma: string;
  n: string;
  ten: string;
  sale: string;
  duNo: number;
  quaHan: number;
  dam: number;
  con: number;
}

export function namKhachChiem(list: Khach[], tay: Tay): CotKhach[] {
  return [...list]
    .filter((k) => k.duNo > 0)
    .sort((a, b) => b.duNo - a.duNo || a.maKH.localeCompare(b.maKH))
    .slice(0, 5)
    .map((k) => {
      const ten = tenKhach(k, tay);
      const sale = k.sale || 'Chưa gán Sale';
      const dam = Math.min(Math.max(k.quaHan, 0), k.duNo);
      return { ma: k.maKH, n: `${ten} · ${sale}`, ten, sale, duNo: k.duNo, quaHan: k.quaHan, dam, con: Math.max(0, k.duNo - dam) };
    });
}

export type Chon = {
  ky: KetQua;
  list: Khach[];
  tong: Tong;
  tuan: TuanFlow;
  tay: Tay;
  ma: Khach | null;
};

export function chonTu(ky: KetQua, loc: Loc, tay: Tay, maKH: string | null, phamVi: PhamVi): Chon {
  const list = phamVi === 'toan-bo' ? ky.khach : locKhach(ky.khach, loc, tay.ten);
  const tong = phamVi === 'toan-bo' ? ky.tong : tongHop(list, ky.meta.soNgayKy);
  const tuan = phamVi === 'toan-bo' ? ky.tuan : tuanFlow(list.flatMap((k) => k.chungTu), ky.meta);
  const ma = maKH ? ky.khach.find((k) => k.maKH === maKH) ?? null : null;
  return { ky, list, tong, tuan, tay, ma };
}

export function thangNhieu(list: Khach[]): ThangDong[] {
  const map = new Map<string, { phatSinh: number; thanhToan: number; quaHanTheoThang: number }>();
  let duDau = 0;
  let doanhSo = 0;
  for (const kh of list) {
    duDau += kh.duDauKy;
    doanhSo += kh.doanhSo;
    for (const ct of kh.chungTu) {
      if (ct.ngayCt) {
        const k = ct.ngayCt.slice(0, 7);
        const row = map.get(k) ?? { phatSinh: 0, thanhToan: 0, quaHanTheoThang: 0 };
        row.phatSinh += ct.tienNo;
        if (ct.soNgayQH > 0 && ct.duCuoiKy > 0) row.quaHanTheoThang += ct.duCuoiKy;
        map.set(k, row);
      }
      if (ct.ngayTT) {
        const k = ct.ngayTT.slice(0, 7);
        const row = map.get(k) ?? { phatSinh: 0, thanhToan: 0, quaHanTheoThang: 0 };
        row.thanhToan += ct.tienTT;
        map.set(k, row);
      }
    }
  }
  const keys = [...map.keys()].sort();
  let du = duDau;
  let ds = 0;
  const buoc = doanhSo > 0 && keys.length > 0 ? doanhSo / keys.length : 0;
  return keys.map((thang) => {
    const row = map.get(thang)!;
    du += row.phatSinh - row.thanhToan;
    ds += buoc;
    return { thang, phatSinh: row.phatSinh, thanhToan: row.thanhToan, quaHanTheoThang: row.quaHanTheoThang, duNoLuyKe: du, doanhThuLuyKe: ds };
  });
}

export type DiemCot = { n: string; v: number; hien: string };
export type SoKhoi =
  | { loai: 'kpi'; tieu: string; o: { n: string; v: string; muc?: number }[] }
  | { loai: 'cot'; tieu: string; phu?: string; d: DiemCot[] }
  | { loai: 'hai'; tieu: string; a: string; b: string; d: { n: string; a: number; b: number }[] }
  | { loai: 'tron'; tieu: string; d: { n: string; v: number; hien: string }[] }
  | { loai: 'radar'; tieu: string; d: DiemCot[] }
  | { loai: 'the'; tieu: string; d: { id: string; ten: string; dong: string[] }[] }
  | { loai: 'bang'; tieu: string; c: string[]; d: string[][]; ma?: string[] }
  | { loai: 'chu'; tieu: string; van: string }
  | { loai: 'doi'; tieu: string; phu?: string; trai: { tieu: string; d: DiemCot[] }; phai: { tieu: string; d: { n: string; v: number; hien: string }[] } }
  | { loai: 'trong'; tieu: string; dong: string };

const HANG: Hang[] = ['Tốt', 'Trung bình', 'Xấu', 'Rất xấu'];

function cotTuoi(aging: Record<BucketKey, number>): DiemCot[] {
  return BUCKET_KEYS.map((k) => ({ n: BUCKET_LABEL[k], v: aging[k], hien: ty(aging[k]) }));
}

function tronTuoi(aging: Record<BucketKey, number>) {
  return BUCKET_KEYS.map((k) => ({ n: BUCKET_LABEL[k], v: Math.abs(aging[k]), hien: ty(aging[k]) })).filter((d) => d.v !== 0);
}

const MAU_HANG_RECORD: Record<Hang, string> = {
  'Tốt': '#10b981',        // Xanh lá (tốt)
  'Trung bình': '#3b82f6', // Xanh dương (trung bình)
  'Xấu': '#f97316',        // Cam (xấu)
  'Rất xấu': '#ef4444',    // Đỏ (rất xấu)
  'Chưa chấm': '#94a3b8',  // Xám (chưa chấm)
};

function hangDem(list: Khach[]) {
  return HANG.map((h) => {
    const v = list.filter((k) => k.hang === h).length;
    return { n: h, v, hien: `${v} khách`, mau: MAU_HANG_RECORD[h] };
  });
}

function bangKhach(list: Khach[], tay: Tay): SoKhoi {
  const dongBang = [...list]
    .sort((a, b) => b.duNo - a.duNo)
    .slice(0, 80)
    .map((k) => [k.maKH, tenKhach(k, tay), k.sale || '—', ty(k.duNo), ty(k.quaHan), k.hmtd > 0 ? ty(k.hmtd) : 'Chưa có hạn mức', so1(k.diem), k.hang]);
  const them = list.length > 80 ? ` Hiển thị 80/${list.length} khách.` : '';
  return {
    loai: 'bang',
    tieu: `Danh sách khách.${them}`,
    c: ['Mã', 'Tên', 'Sale', 'Dư nợ', 'Quá hạn', 'Hạn mức', 'Điểm', 'Hạng'],
    d: dongBang,
    ma: dongBang.map((r) => r[0]),
  };
}

function deXuat(tong: Tong): string {
  const d: string[] = [];
  if (tong.vuotHmSo > 0) d.push(`${tong.vuotHmSo} khách vượt hạn mức, phần vượt ${ty(tong.vuotHmTien)}.`);
  if (tong.chuaHmSo > 0) d.push(`${tong.chuaHmSo} khách chưa có hạn mức nhưng còn dư nợ ${ty(tong.chuaHmTien)}.`);
  if (tong.soKhachNoKhoDoi > 0) d.push(`${tong.soKhachNoKhoDoi} khách có nợ xấu (nợ khó đòi) ${ty(tong.noKhoDoi)}.`);
  if (tong.duAmDong > 0) d.push(`${tong.duAmDong} dòng dư âm, tổng ${ty(tong.duAmTien)}.`);
  if (tong.thieuDm > 0) d.push(`${tong.thieuDm} mã chưa có trong danh mục.`);
  return d.join('\n') || 'Không có mục cần nêu từ các chỉ tiêu của kỳ này.';
}

function keHoach(n: number | null, thuc: number): string {
  if (n == null) return `${ty(thuc)}. Chưa có kế hoạch trong sổ.`;
  return `${ty(thuc)} / kế hoạch ${ty(n)}`;
}

export function soKhoi(id: string, chon: Chon): SoKhoi {
  const { list, tong, tuan, tay, ma, ky } = chon;
  const thang = thangNhieu(list);
  if (id === 'tuan-kpi') {
    return {
      loai: 'kpi',
      tieu: 'Chỉ tiêu tuần',
      o: [
        { n: 'Doanh thu tuần', v: keHoach(ky.meta.keHoachDoanhThuTuan, tuan.doanhThu) },
        { n: 'Thanh toán tuần', v: keHoach(ky.meta.keHoachThuTuan, tuan.thanhToan) },
        { n: 'Dư nợ', v: ty(tong.duNo) },
        { n: 'Trong hạn', v: ty(tong.trongHan) },
        { n: 'Quá hạn', v: ty(tong.quaHan) },
        { n: 'DSO kỳ', v: `${so1(tong.dsoKy)} ngày` },
      ],
    };
  }
  if (id === 'tuan-tuoi' || id === 'tuoi-cot' || id === 'tq-tuoi') {
    return { loai: 'tron', tieu: 'Cơ cấu tuổi nợ', d: tronTuoi(tong.aging) };
  }
  if (id === 'tuan-phat-sinh') {
    return {
      loai: 'hai',
      tieu: 'Phát sinh công nợ và thanh toán',
      a: 'Phát sinh',
      b: 'Thanh toán',
      d: thang.map((t) => ({ n: thangNhan(t.thang), a: t.phatSinh, b: t.thanhToan })),
    };
  }
  if (id === 'tuan-qh-thang') {
    return {
      loai: 'cot',
      tieu: 'Nợ quá hạn theo tháng',
      phu: 'Dư quá hạn hiện tại, gom theo tháng của hóa đơn.',
      d: thang.map((t) => ({ n: thangNhan(t.thang), v: t.quaHanTheoThang, hien: ty(t.quaHanTheoThang) })),
    };
  }
  if (id === 'tuan-luy-ke') {
    return {
      loai: 'hai',
      tieu: 'Dư nợ và doanh thu lũy kế',
      a: 'Dư nợ',
      b: 'Doanh thu',
      d: thang.map((t) => ({ n: thangNhan(t.thang), a: t.duNoLuyKe, b: t.doanhThuLuyKe })),
    };
  }
  if (id === 'tuan-sale' || id === 'tc1-sale') {
    return {
      loai: 'the',
      tieu: 'Theo dõi công nợ theo từng Sale',
      d: nhomSale(list).map((s) => ({
        id: s.sale,
        ten: s.sale || 'Chưa gán Sale',
        dong: [`${s.soKhach} khách`, `Dư nợ ${ty(s.duNo)}`, `Quá hạn ${ty(s.quaHan)}`],
      })),
    };
  }
  if (id === 'tuan-nay') return { loai: 'chu', tieu: 'Ghi chú tuần này', van: tay.tuanNay };
  if (id === 'tuan-sau') return { loai: 'chu', tieu: 'Ghi chú tuần sau', van: tay.tuanSau };
  if (id === 'tuan-bang' || id === 'tc1-bang' || id === 'tuoi-bang' || id === 'rr-bang') return bangKhach(list, tay);
  if (id === 'tq-bgd') {
    const tyLeQh = tong.duNo > 0 ? pct(tong.quaHan / tong.duNo) : '0%';
    return {
      loai: 'kpi',
      tieu: 'Chỉ tiêu điều hành',
      o: [
        { n: 'Dư nợ', v: ty(tong.duNo) },
        { n: 'Quá hạn', v: `${ty(tong.quaHan)} (${tyLeQh})` },
        { n: 'DSO kỳ', v: tong.dsoKy != null ? `${so1(tong.dsoKy)} ngày` : '—' },
        { n: 'Nợ xấu', v: `${ty(tong.noKhoDoi)} · ${tong.soKhachNoKhoDoi} khách` },
      ],
    };
  }
  if (id === 'tq-tuoi-pct') {
    return {
      loai: 'tron',
      tieu: 'Cơ cấu tuổi nợ',
      d: BUCKET_KEYS.map((k) => {
        const v = tong.aging[k];
        const p = tong.duNo > 0 ? v / tong.duNo : 0;
        return { n: BUCKET_LABEL[k], v: Math.abs(v), hien: `${ty(v)} (${pct(p)})` };
      }).filter((d) => d.v !== 0),
    };
  }
  if (id === 'tq-canh-bao') {
    const nhom = bonNhomCanhBao(list, tay);
    return {
      loai: 'the',
      tieu: 'Bốn cảnh báo rủi ro',
      d: nhom.map((n) => ({
        id: n.id,
        ten: n.ten,
        dong: [
          `${n.soKhach} khách`,
          n.id === 'vuot-hm' ? `Phần vượt ${ty(n.tongTien)}` : `Số tiền ${ty(n.tongTien)}`,
        ],
      })),
    };
  }
  if (id === 'tc1-kpi' || id === 'tq-kpi') {
    return {
      loai: 'kpi',
      tieu: id === 'tq-kpi' ? 'Tổng quan phải thu' : 'Chỉ tiêu công nợ',
      o: [
        { n: 'Đầu kỳ', v: ty(tong.duDauKy) },
        { n: 'Phát sinh nợ', v: ty(tong.tienNo) },
        { n: 'Thanh toán', v: ty(tong.tienTT) },
        { n: 'Dư cuối', v: ty(tong.duNo) },
        { n: 'Trong hạn', v: ty(tong.trongHan) },
        { n: 'Quá hạn', v: ty(tong.quaHan) },
        { n: 'DSO kỳ', v: `${so1(tong.dsoKy)} ngày` },
        { n: 'Khách', v: dong(tong.soKhach) },
      ],
    };
  }
  if (id === 'tc1-co-cau') {
    const hangDat = list.reduce((s, k) => s + k.hangDat, 0);
    const coc = list.reduce((s, k) => s + k.tienCoc, 0);
    return {
      loai: 'doi',
      tieu: 'Cơ cấu và hàng đặt',
      phu: `Hàng đặt ${ty(hangDat)} · Tiền cọc ${ty(coc)}`,
      trai: { tieu: 'Tuổi nợ', d: cotTuoi(tong.aging) },
      phai: { tieu: 'Hạng', d: hangDem(list) },
    };
  }
  if (id === 'tc1-hm' || id === 'rr-hm') {
    return {
      loai: 'kpi',
      tieu: 'Hạn mức',
      o: [
        { n: 'Vượt hạn mức', v: `${dong(tong.vuotHmSo)} khách · ${ty(tong.vuotHmTien)}` },
        { n: 'Chưa có hạn mức, còn dư nợ', v: `${dong(tong.chuaHmSo)} khách · ${ty(tong.chuaHmTien)}` },
      ],
    };
  }
  if (id === 'tc1-rui-ro' || id === 'rr-top' || id === 'tq-top') {
    const rows = topRuiRo(list, 10);
    return {
      loai: 'bang',
      tieu: 'Top khách theo trọng số quá hạn',
      c: ['Mã', 'Tên', 'Sale', 'Quá hạn', 'Trọng số', 'Điểm', 'Hạng'],
      d: rows.map((k) => [k.maKH, tenKhach(k, tay), k.sale || '—', ty(k.quaHan), ty(k.trongSo), so1(k.diem), k.hang]),
      ma: rows.map((k) => k.maKH),
    };
  }
  if (id === 'tc1-de-xuat') return { loai: 'chu', tieu: 'Đề xuất từ chỉ tiêu kỳ', van: deXuat(tong) };
  if (id.startsWith('tc2:')) {
    const maThe = id.slice(4);
    const the = theTc2(tong, list).find((t) => t.ma === maThe);
    if (!the) return { loai: 'trong', tieu: maThe, dong: 'Chưa có chỉ tiêu này trong kỳ.' };
    return { loai: 'kpi', tieu: `${the.ma} · ${the.ten}`, o: [{ n: the.phu || the.ten, v: the.giaTri }] };
  }
  if (id === 'tq-hang') return { loai: 'tron', tieu: 'Cơ cấu hạng', d: hangDem(list) };
  if (id === 'tuoi-kpi') {
    return {
      loai: 'kpi',
      tieu: 'Tuổi nợ',
      o: [
        { n: 'Dư nợ', v: ty(tong.duNo) },
        { n: 'Trong hạn', v: ty(tong.trongHan) },
        { n: 'Quá hạn', v: ty(tong.quaHan) },
        { n: 'Nợ xấu (nợ khó đòi)', v: ty(tong.noKhoDoi) },
      ],
    };
  }
  if (id === 'th-kpi') {
    const mau = tong.qhThu + tong.quaHan;
    return {
      loai: 'kpi',
      tieu: 'Thu hồi',
      o: [
        { n: 'Quá hạn còn lại', v: ty(tong.quaHan) },
        { n: 'Đã thu trên chứng từ quá hạn đã tất toán', v: ty(tong.qhThu) },
        { n: 'Tỷ lệ', v: pct(mau > 0 ? tong.qhThu / mau : null) },
      ],
    };
  }
  if (id === 'th-cot') return { loai: 'tron', tieu: 'Quá hạn theo nhóm tuổi nợ', d: tronTuoi(tong.aging) };
  if (id === 'th-bang') {
    return {
      loai: 'bang',
      tieu: '11 nhóm tuổi nợ',
      c: ['Nhóm', 'Số tiền'],
      d: BUCKET_KEYS.map((k) => [BUCKET_LABEL[k], ty(tong.aging[k])]),
    };
  }
  if (id === 'rr-noxau') {
    const rows = list.filter((k) => k.noKhoDoi > 0).sort((a, b) => b.noKhoDoi - a.noKhoDoi);
    return {
      loai: 'bang',
      tieu: `Nợ xấu (nợ khó đòi) · ${ty(tong.noKhoDoi)} · ${dong(tong.soKhachNoKhoDoi)} khách`,
      c: ['Mã', 'Tên', 'Nợ xấu'],
      d: rows.map((k) => [k.maKH, tenKhach(k, tay), ty(k.noKhoDoi)]),
      ma: rows.map((k) => k.maKH),
    };
  }
  if (!ma && id.startsWith('hs-')) return { loai: 'trong', tieu: 'Hồ sơ khách', dong: 'Chọn một mã khách.' };
  if (ma && id === 'hs-diem') {
    const bac = bacDiem(ma.diem);
    return {
      loai: 'kpi',
      tieu: `${ma.maKH} · ${tenKhach(ma, tay)}`,
      o: [
        { n: 'Điểm TC-1', v: ma.diem == null ? 'Chưa chấm' : `${so1(ma.diem)} / 5 · ${ma.hang}`, muc: bac ?? undefined },
        { n: 'Nguồn điểm', v: ma.nguonDiem === 'excel' ? 'Điểm lấy từ Excel' : ky.nhanDiem },
        { n: 'Dư nợ', v: ty(ma.duNo) },
        { n: 'DSO 365', v: `${so1(ma.dso365)} ngày` },
        { n: 'Hạn định', v: ma.hanDinh == null ? '—' : `${so1(ma.hanDinh)} ngày` },
        { n: 'Sale', v: ma.sale || '—' },
      ],
    };
  }
  if (ma && id === 'hs-tp') {
    return {
      loai: 'radar',
      tieu: 'Bảy thành phần TC-1',
      d: ma.thanhPhan.map((p) => ({ n: p.ten || p.ma, v: p.diem ?? 0, hien: p.diem == null ? '—' : so1(p.diem) })),
    };
  }
  if (ma && id === 'hs-tuoi') return { loai: 'tron', tieu: 'Tuổi nợ của khách', d: tronTuoi(ma.aging) };
  if (ma && id === 'hs-qh') {
    const cs = chuoiThang(ma);
    return { loai: 'cot', tieu: 'Nợ quá hạn theo tháng', d: cs.map((t) => ({ n: thangNhan(t.thang), v: t.quaHanTheoThang, hien: ty(t.quaHanTheoThang) })) };
  }
  if (ma && id === 'hs-luyke') {
    const cs = chuoiThang(ma);
    return {
      loai: 'hai',
      tieu: 'Dư nợ và doanh thu lũy kế',
      a: 'Dư nợ',
      b: 'Doanh thu',
      d: cs.map((t) => ({ n: thangNhan(t.thang), a: t.duNoLuyKe, b: t.doanhThuLuyKe })),
    };
  }
  if (ma && id === 'hs-hm') {
    const vuot = ma.hmtd > 0 && ma.duNo > ma.hmtd;
    const bac = bacHanMuc(ma.duNo, ma.hmtd);
    const nguong = bac == null ? null : thangDiem(bac);
    return {
      loai: 'kpi',
      tieu: 'Hạn mức của khách',
      o: [
        { n: 'Hạn mức', v: ma.hmtd > 0 ? ty(ma.hmtd) : 'Chưa có hạn mức' },
        { n: 'Dư nợ', v: ty(ma.duNo) },
        { n: 'So với hạn mức', v: ma.hmtd > 0 ? (vuot ? `Vượt ${ty(ma.duNo - ma.hmtd)}` : 'Trong hạn mức') : ma.duNo > 0 ? 'Chưa có hạn mức nhưng còn dư nợ' : '—' },
        { n: 'Ngưỡng hạn mức', v: nguong ? `${pct(ma.duNo / ma.hmtd)} · ${nguong.hanh}` : 'Chưa có hạn mức', muc: bac ?? undefined },
        { n: 'Nợ xấu', v: ty(ma.noKhoDoi) },
      ],
    };
  }
  if (ma && id === 'hs-hd') {
    return {
      loai: 'bang',
      tieu: 'Hóa đơn và chứng từ',
      c: ['Số HĐ', 'Ngày', 'Nợ', 'Thu', 'Dư cuối', 'Nhóm', 'Ngày QH'],
      d: ma.chungTu.map((ct) => [ct.soHD || ct.soCt || '—', ngay(ct.ngayCt), ty(ct.tienNo), ty(ct.tienTT), ty(ct.duCuoiKy), BUCKET_LABEL[ct.bucket], so1(ct.soNgayQH)]),
    };
  }
  if (ma && id === 'hs-nhat') {
    const log = tay.nhatKy[ma.maKH] ?? [];
    return { loai: 'chu', tieu: 'Nhật ký thu hồi', van: log.join('\n') };
  }
  if (ma && id === 'hs-tron') return { loai: 'tron', tieu: 'Cơ cấu tuổi nợ', d: tronTuoi(ma.aging) };
  return { loai: 'trong', tieu: id, dong: 'Khối này chưa có số.' };
}

export type NhomCanhBaoId = 'vuot-hm' | 'chua-hm' | 'no-xau' | 'd365';

export interface MucCanhBaoKhach {
  maKH: string;
  tenKH: string;
  sale: string;
  tien: number;
  duNo: number;
  hmtd: number;
  ly: string;
  hang: Hang;
  diem: number | null;
}

export interface NhomCanhBao {
  id: NhomCanhBaoId;
  ten: string;
  soKhach: number;
  tongTien: number;
  danhSach: MucCanhBaoKhach[];
}

export function bonNhomCanhBao(list: Khach[], tay: Tay): NhomCanhBao[] {
  // 1. Vượt hạn mức: Hạn mức > 0 và dư nợ > hạn mức. Tiền: phần vượt. Xếp theo phần vượt giảm dần.
  const dsVuotHm: MucCanhBaoKhach[] = list
    .filter((k) => k.hmtd > 0 && k.duNo > k.hmtd)
    .map((k) => {
      const vuot = k.duNo - k.hmtd;
      return {
        maKH: k.maKH,
        tenKH: tenKhach(k, tay),
        sale: k.sale || '—',
        tien: vuot,
        duNo: k.duNo,
        hmtd: k.hmtd,
        ly: `Vượt hạn mức ${ty(vuot)} (Hạn mức: ${ty(k.hmtd)}, Dư nợ: ${ty(k.duNo)})`,
        hang: k.hang,
        diem: k.diem,
      };
    })
    .sort((a, b) => b.tien - a.tien);

  // 2. Chưa có hạn mức: Hạn mức = 0 và dư nợ > 0. Tiền: Dư nợ. Xếp theo dư nợ giảm dần.
  const dsChuaHm: MucCanhBaoKhach[] = list
    .filter((k) => k.hmtd === 0 && k.duNo > 0)
    .map((k) => ({
      maKH: k.maKH,
      tenKH: tenKhach(k, tay),
      sale: k.sale || '—',
      tien: k.duNo,
      duNo: k.duNo,
      hmtd: 0,
      ly: `Chưa có hạn mức, dư nợ ${ty(k.duNo)}`,
      hang: k.hang,
      diem: k.diem,
    }))
    .sort((a, b) => b.tien - a.tien);

  // 3. Nợ xấu: Nợ xấu > 0. Tiền: Nợ xấu. Xếp theo nợ xấu giảm dần.
  const dsNoXau: MucCanhBaoKhach[] = list
    .filter((k) => k.noKhoDoi > 0)
    .map((k) => ({
      maKH: k.maKH,
      tenKH: tenKhach(k, tay),
      sale: k.sale || '—',
      tien: k.noKhoDoi,
      duNo: k.duNo,
      hmtd: k.hmtd,
      ly: `Nợ xấu (nợ khó đòi) ${ty(k.noKhoDoi)}`,
      hang: k.hang,
      diem: k.diem,
    }))
    .sort((a, b) => b.tien - a.tien);

  // 4. Quá hạn trên 365 ngày: aging.d365 > 0. Tiền: aging.d365. Xếp theo tiền giảm dần.
  const dsD365: MucCanhBaoKhach[] = list
    .filter((k) => k.aging.d365 > 0)
    .map((k) => ({
      maKH: k.maKH,
      tenKH: tenKhach(k, tay),
      sale: k.sale || '—',
      tien: k.aging.d365,
      duNo: k.duNo,
      hmtd: k.hmtd,
      ly: `Quá hạn trên 365 ngày: ${ty(k.aging.d365)}`,
      hang: k.hang,
      diem: k.diem,
    }))
    .sort((a, b) => b.tien - a.tien);

  return [
    {
      id: 'vuot-hm',
      ten: 'Vượt hạn mức',
      soKhach: dsVuotHm.length,
      tongTien: dsVuotHm.reduce((s, x) => s + x.tien, 0),
      danhSach: dsVuotHm,
    },
    {
      id: 'chua-hm',
      ten: 'Chưa có hạn mức',
      soKhach: dsChuaHm.length,
      tongTien: dsChuaHm.reduce((s, x) => s + x.tien, 0),
      danhSach: dsChuaHm,
    },
    {
      id: 'no-xau',
      ten: 'Nợ xấu',
      soKhach: dsNoXau.length,
      tongTien: dsNoXau.reduce((s, x) => s + x.tien, 0),
      danhSach: dsNoXau,
    },
    {
      id: 'd365',
      ten: 'Quá hạn trên 365 ngày',
      soKhach: dsD365.length,
      tongTien: dsD365.reduce((s, x) => s + x.tien, 0),
      danhSach: dsD365,
    },
  ];
}

export function canhBaoAr(list: Khach[], tay: Tay): { ma: string; ten: string; ly: string }[] {
  const nhom = bonNhomCanhBao(list, tay);
  return nhom.flatMap((n) => n.danhSach.map((k) => ({ ma: k.maKH, ten: k.tenKH, ly: k.ly })));
}

export type TrangThaiTin = 'rui-ro' | 'qua-han' | 'sap-cham' | 'binh-thuong';

export const TEN_TRANG_THAI: Record<TrangThaiTin, string> = {
  'rui-ro': 'Rủi ro cao',
  'qua-han': 'Quá hạn',
  'sap-cham': 'Sắp chạm hạn mức',
  'binh-thuong': 'Bình thường',
};

export type LocMau = { sale: string; khuVuc: string; nhomKH: string; trangThai: 'ALL' | TrangThaiTin };

export const LOC_MAU_RONG: LocMau = { sale: 'ALL', khuVuc: 'ALL', nhomKH: 'ALL', trangThai: 'ALL' };

export function locMauRong(loc: LocMau): boolean {
  return loc.sale === 'ALL' && loc.khuVuc === 'ALL' && loc.nhomKH === 'ALL' && loc.trangThai === 'ALL';
}

export function trangThaiTin(kh: Khach): TrangThaiTin {
  if (kh.hang === 'Xấu' || kh.hang === 'Rất xấu') return 'rui-ro';
  if (kh.quaHan > 0) return 'qua-han';
  if (kh.hmtd > 0 && kh.duNo / kh.hmtd > 0.75) return 'sap-cham';
  return 'binh-thuong';
}

export function locMauKhach(list: Khach[], loc: LocMau): Khach[] {
  return list.filter((kh) => {
    if (loc.sale !== 'ALL' && kh.sale !== loc.sale) return false;
    if (loc.khuVuc !== 'ALL' && (kh.khuVuc || '') !== loc.khuVuc) return false;
    if (loc.nhomKH !== 'ALL' && (kh.nhomKH || '') !== loc.nhomKH) return false;
    if (loc.trangThai !== 'ALL' && trangThaiTin(kh) !== loc.trangThai) return false;
    return true;
  });
}

export function luaChonMau(list: Khach[]) {
  const sales = [...new Set(list.map((k) => k.sale))].sort((a, b) => a.localeCompare(b, 'vi'));
  const khu = [...new Set(list.map((k) => k.khuVuc || ''))].sort((a, b) => a.localeCompare(b, 'vi'));
  const nhom = [...new Set(list.map((k) => k.nhomKH || ''))].sort((a, b) => a.localeCompare(b, 'vi'));
  return { sales, khu, nhom };
}
