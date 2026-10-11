import {
  BUCKET_KEYS,
  BUCKET_LABEL,
  type BucketKey,
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
} from '../../Credit/src/lib/metrics';
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
};

export function docTay(checksum: string): Tay {
  try {
    const raw = localStorage.getItem(`newcredit:${checksum}`);
    if (!raw) return TAY_RONG;
    const x = JSON.parse(raw) as Tay;
    return { ...TAY_RONG, ...x, ten: x.ten ?? {}, ghi: x.ghi ?? {}, keHoach: x.keHoach ?? {}, nhatKy: x.nhatKy ?? {}, them: x.them ?? [] };
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

function hangDem(list: Khach[]) {
  return HANG.map((h) => {
    const v = list.filter((k) => k.hang === h).length;
    return { n: h, v, hien: `${v} khách` };
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
    return { loai: 'cot', tieu: 'Cơ cấu tuổi nợ', d: cotTuoi(tong.aging) };
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
    return { loai: 'cot', tieu: 'Nợ quá hạn theo tháng', d: thang.map((t) => ({ n: thangNhan(t.thang), v: t.quaHanTheoThang, hien: ty(t.quaHanTheoThang) })) };
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
  if (id === 'th-cot') return { loai: 'cot', tieu: 'Quá hạn theo nhóm tuổi nợ', phu: 'Tiền đã thu không tách theo từng nhóm vì sổ không có cột đó.', d: cotTuoi(tong.aging) };
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
  if (ma && id === 'hs-tuoi') return { loai: 'cot', tieu: 'Tuổi nợ của khách', d: cotTuoi(ma.aging) };
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

export type LoaiDash = 'tuan' | 'tc1' | 'tc2' | 'hoso' | 'tuoi' | 'thuhoi' | 'ruiro' | 'tongquan' | 'ap' | 'tien' | 'mua';

export const LOAI_TEN: Record<LoaiDash, string> = {
  tuan: 'Dashboard tuần',
  tc1: 'Dashboard TC1',
  tc2: 'Dashboard TC2',
  hoso: 'Dashboard khách hàng',
  tuoi: 'Tuổi nợ',
  thuhoi: 'Thu hồi',
  ruiro: 'Rủi ro và hạn mức',
  tongquan: 'Tổng quan',
  ap: 'Dashboard phải trả',
  tien: 'Dashboard dòng tiền',
  mua: 'Kế hoạch mua hàng',
};

export type MucKhoi = { id: string; ten: string; macDinh: boolean };

const TC2_CO_DINH: [string, string][] = [
  ['TC-2.1a', 'Nợ quá hạn / tổng công nợ'],
  ['TC-2.1b', 'Nợ quá hạn / (quá hạn + đến hạn)'],
  ['TC-2.2a', 'DSO công ty'],
  ['TC-2.2b', 'DSO Gap'],
  ['TC-2.3', 'Tỷ lệ thu hồi nợ quá hạn'],
  ['TC-2.4', 'Sử dụng hạn mức'],
  ['TC-2.5', 'Nợ xấu (nợ khó đòi) / tổng công nợ'],
];

export function danhMuc(loai: LoaiDash): MucKhoi[] {
  if (loai === 'tuan') {
    return [
      { id: 'tuan-kpi', ten: 'Chỉ tiêu tuần', macDinh: true },
      { id: 'tuan-tuoi', ten: 'Cơ cấu tuổi nợ', macDinh: true },
      { id: 'tuan-phat-sinh', ten: 'Phát sinh công nợ và thanh toán', macDinh: true },
      { id: 'tuan-qh-thang', ten: 'Nợ quá hạn theo tháng', macDinh: true },
      { id: 'tuan-luy-ke', ten: 'Dư nợ và doanh thu lũy kế', macDinh: true },
      { id: 'tuan-sale', ten: 'Thẻ Sale', macDinh: true },
      { id: 'tuan-nay', ten: 'Ghi chú tuần này', macDinh: true },
      { id: 'tuan-sau', ten: 'Ghi chú tuần sau', macDinh: true },
      { id: 'tuan-bang', ten: 'Danh sách khách', macDinh: false },
    ];
  }
  if (loai === 'tc1') {
    return [
      { id: 'tc1-kpi', ten: 'Chỉ tiêu công nợ', macDinh: true },
      { id: 'tc1-co-cau', ten: 'Cơ cấu và hàng đặt', macDinh: true },
      { id: 'tc1-sale', ten: 'Sale', macDinh: true },
      { id: 'tc1-hm', ten: 'Hai chỉ tiêu hạn mức', macDinh: true },
      { id: 'tc1-rui-ro', ten: 'Top khách rủi ro', macDinh: true },
      { id: 'tc1-de-xuat', ten: 'Đề xuất', macDinh: true },
      { id: 'tc1-bang', ten: 'Danh sách khách', macDinh: false },
    ];
  }
  if (loai === 'tc2') {
    return TC2_CO_DINH.map(([ma, ten]) => ({ id: `tc2:${ma}`, ten: `${ma} ${ten}`, macDinh: true }));
  }
  if (loai === 'hoso') {
    return [
      { id: 'hs-diem', ten: 'Điểm tín dụng TC-1', macDinh: true },
      { id: 'hs-hm', ten: 'Hạn mức', macDinh: true },
      { id: 'hs-tp', ten: 'Bảy thành phần', macDinh: true },
      { id: 'hs-tuoi', ten: 'Tuổi nợ', macDinh: true },
      { id: 'hs-tron', ten: 'Cơ cấu tuổi nợ', macDinh: true },
      { id: 'hs-qh', ten: 'Quá hạn theo tháng', macDinh: true },
      { id: 'hs-luyke', ten: 'Dư nợ và doanh thu lũy kế', macDinh: true },
      { id: 'hs-hd', ten: 'Hóa đơn', macDinh: false },
      { id: 'hs-nhat', ten: 'Nhật ký', macDinh: false },
    ];
  }
  if (loai === 'tuoi') {
    return [
      { id: 'tuoi-kpi', ten: 'Chỉ tiêu tuổi nợ', macDinh: true },
      { id: 'tuoi-cot', ten: 'Cơ cấu tuổi nợ', macDinh: true },
      { id: 'tuoi-bang', ten: 'Bảng khách', macDinh: false },
    ];
  }
  if (loai === 'thuhoi') {
    return [
      { id: 'th-kpi', ten: 'Chỉ tiêu thu hồi', macDinh: true },
      { id: 'th-cot', ten: 'Quá hạn theo nhóm', macDinh: true },
      { id: 'th-bang', ten: 'Bảng 11 nhóm', macDinh: true },
    ];
  }
  if (loai === 'ruiro') {
    return [
      { id: 'rr-hm', ten: 'Hai chỉ tiêu hạn mức', macDinh: true },
      { id: 'rr-noxau', ten: 'Nợ xấu (nợ khó đòi)', macDinh: true },
      { id: 'rr-top', ten: 'Top rủi ro', macDinh: true },
      { id: 'rr-bang', ten: 'Danh sách khách', macDinh: false },
    ];
  }
  if (loai === 'ap') {
    return [
      { id: 'bt-ap-kpi', ten: 'Chỉ tiêu phải trả', macDinh: true },
      { id: 'bt-ap-tuoi', ten: 'Tuổi nợ phải trả', macDinh: true },
      { id: 'bt-ap-ncc', ten: 'Nhà cung cấp', macDinh: true },
      { id: 'bt-ap-lich', ten: 'Lịch thanh toán', macDinh: false },
      { id: 'bt-ap-ck', ten: 'Cam kết', macDinh: false },
    ];
  }
  if (loai === 'tien') {
    return [
      { id: 'bt-tien-kpi', ten: 'Chỉ tiêu dòng tiền', macDinh: true },
      { id: 'bt-tien-tuan', ten: 'Thu và chi theo tuần', macDinh: true },
      { id: 'bt-tien-du', ten: 'Số dư cuối tuần', macDinh: true },
      { id: 'bt-tien-vi', ten: 'Số dư tài khoản', macDinh: false },
      { id: 'bt-tien-lech', ten: 'Chênh lệch thu chi', macDinh: true },
    ];
  }
  if (loai === 'mua') {
    return [
      { id: 'bt-mua-kpi', ten: 'Chỉ tiêu mua hàng', macDinh: true },
      { id: 'bt-mua-nhom', ten: 'Theo nhóm', macDinh: true },
      { id: 'bt-mua-tien-do', ten: 'Tiến độ', macDinh: true },
      { id: 'bt-mua-po', ten: 'Đơn đặt mua', macDinh: false },
    ];
  }
  return [
    { id: 'tq-kpi', ten: 'Chỉ tiêu tổng quan', macDinh: true },
    { id: 'tq-tuoi', ten: 'Tuổi nợ', macDinh: true },
    { id: 'tq-hang', ten: 'Cơ cấu hạng', macDinh: true },
    { id: 'tq-top', ten: 'Top rủi ro', macDinh: true },
  ];
}

export type MucIn = { id: string; ten: string; bat: boolean };

export function mucMacDinh(loai: LoaiDash): MucIn[] {
  return danhMuc(loai).map((m) => ({ id: m.id, ten: m.ten, bat: m.macDinh }));
}

export function canhBaoAr(list: Khach[], tay: Tay): { ma: string; ten: string; ly: string }[] {
  const out: { ma: string; ten: string; ly: string }[] = [];
  for (const k of list) {
    if (k.hmtd > 0 && k.duNo > k.hmtd) out.push({ ma: k.maKH, ten: tenKhach(k, tay), ly: `Vượt hạn mức ${ty(k.duNo - k.hmtd)}` });
    else if (k.hmtd === 0 && k.duNo > 0) out.push({ ma: k.maKH, ten: tenKhach(k, tay), ly: `Chưa có hạn mức, dư nợ ${ty(k.duNo)}` });
    if (k.noKhoDoi > 0) out.push({ ma: k.maKH, ten: tenKhach(k, tay), ly: `Nợ xấu ${ty(k.noKhoDoi)}` });
    else if (k.quaHan > 0 && !(k.hmtd > 0 && k.duNo > k.hmtd)) out.push({ ma: k.maKH, ten: tenKhach(k, tay), ly: `Quá hạn ${ty(k.quaHan)}` });
  }
  return out.slice(0, 40);
}
