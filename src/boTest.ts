import { ty } from './format';
import type { SoKhoi } from './soLieu';

export const CHU_TEST = 'Số trình bày trên dashboard TC2 để xem màn. Không lấy từ sổ Excel và không cộng vào phải thu.';

const T = 1e9;
const tySo = (n: number) => ty(n * T);

export const TUAN_13 = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13'] as const;
export const NGAY_TUAN = ['01/07', '08/07', '15/07', '22/07', '29/07', '05/08', '12/08', '19/08', '26/08', '02/09', '09/09', '16/09', '23/09'];

export const THU_13 = [19.2, 19.2, 19.2, 23.1, 23.1, 23.1, 23.1, 26.9, 34.6, 38.5, 42.3, 46.2, 46.2];
export const CHI_13 = [51.9, 51.9, 57.7, 51.9, 46.2, 51.9, 51.9, 40.4, 34.6, 34.6, 34.6, 34.6, 34.6];
export const DU_13 = [55.3, 22.6, -15.8, -44.7, -67.8, -96.6, -125.4, -138.9, -138.9, -135, -127.3, -115.8, -104.2];

export const AP_TONG = 186.5;
export const AP_CHUA = 70;
export const AP_QUA = 116.5;

export const NCC = [
  { ma: 'NCC01', ten: 'Nguyên liệu chính', du: 70, trongHan: 22, quaHan: 48 },
  { ma: 'NCC02', ten: 'Bao bì', du: 42.5, trongHan: 14.5, quaHan: 28 },
  { ma: 'NCC03', ten: 'Vận chuyển', du: 28, trongHan: 10, quaHan: 18 },
  { ma: 'NCC04', ten: 'Dịch vụ cảng', du: 24, trongHan: 9.5, quaHan: 14.5 },
  { ma: 'NCC05', ten: 'Hóa chất phụ', du: 22, trongHan: 14, quaHan: 8 },
];

export const AP_TUOI: { n: string; v: number }[] = [
  { n: 'Chưa đến hạn', v: 70 },
  { n: 'Trả trước hạn', v: 0 },
  { n: 'Đến hạn', v: 0 },
  { n: '0–30 ngày', v: 60 },
  { n: '31–60 ngày', v: 40 },
  { n: '61–90 ngày', v: 12 },
  { n: '91–120 ngày', v: 4.5 },
  { n: '121–150 ngày', v: 0 },
  { n: '151–180 ngày', v: 0 },
  { n: '181–365 ngày', v: 0 },
  { n: 'Trên 365 ngày', v: 0 },
];

export const LICH_AP = [
  ['NCC01', 'HĐ-NL-18', '08/07/2026', 'W2', '18,0 tỷ'],
  ['NCC01', 'HĐ-NL-22', '22/07/2026', 'W4', '22,0 tỷ'],
  ['NCC02', 'HĐ-BB-12', '15/07/2026', 'W3', '12,0 tỷ'],
  ['NCC03', 'HĐ-VC-08', '05/08/2026', 'W6', '8,0 tỷ'],
];

export const CAM_KET = [
  ['CK-01', 'NCC01', '15/07/2026', '20,0 tỷ', '0,0 tỷ', 'Chưa chi'],
  ['CK-02', 'NCC02', '22/07/2026', '10,0 tỷ', '6,0 tỷ', 'Đang chi'],
  ['CK-03', 'NCC04', '01/07/2026', '5,0 tỷ', '5,0 tỷ', 'Đã chi'],
];

export const TK_TIEN = [
  ['TM', 'Tiền mặt', '4,0 tỷ'],
  ['TGNH', 'Tiền gửi ngân hàng', '56,0 tỷ'],
  ['QTK', 'Quỹ tiết kiệm', '400,0 tỷ'],
  ['QTK20', 'Khả dụng 20% quỹ tiết kiệm', '80,0 tỷ'],
];

export const NHOM_MUA = [
  { n: 'Nguyên liệu chính', nhuCau: 80, keHoach: 75, duyet: 70, ve: 40, nganSach: 78, dung: 62 },
  { n: 'Bao bì', nhuCau: 18, keHoach: 16, duyet: 16, ve: 10, nganSach: 20, dung: 14 },
  { n: 'Vận chuyển', nhuCau: 12, keHoach: 12, duyet: 10, ve: 8, nganSach: 14, dung: 9 },
  { n: 'Hóa chất phụ', nhuCau: 15, keHoach: 14, duyet: 12, ve: 6, nganSach: 16, dung: 17 },
];

export const PO = [
  ['PO-2401', 'NCC01', 'Nguyên liệu chính', '28,0 tỷ', 'Đã về một phần', '18,0 tỷ', '10,0 tỷ'],
  ['PO-2402', 'NCC01', 'Nguyên liệu chính', '22,0 tỷ', 'Đã về một phần', '12,0 tỷ', '10,0 tỷ'],
  ['PO-2403', 'NCC02', 'Bao bì', '10,0 tỷ', 'Đã về đủ', '10,0 tỷ', '0,0 tỷ'],
  ['PO-2404', 'NCC03', 'Vận chuyển', '8,0 tỷ', 'Đang về', '4,0 tỷ', '4,0 tỷ'],
  ['PO-2405', 'NCC05', 'Hóa chất phụ', '11,0 tỷ', 'Trễ tiến độ', '0,0 tỷ', '0,0 tỷ'],
];

function cotTy(d: { n: string; v: number }[]): { n: string; v: number; hien: string }[] {
  return d.map((x) => ({ n: x.n, v: x.v * T, hien: tySo(x.v) }));
}

export function soBoTest(id: string): SoKhoi | null {
  if (id === 'bt-ap-kpi') {
    return {
      loai: 'kpi',
      tieu: 'Công nợ phải trả',
      o: [
        { n: 'Dư nợ phải trả', v: tySo(AP_TONG) },
        { n: 'Chưa đến hạn', v: tySo(AP_CHUA) },
        { n: 'Quá hạn', v: tySo(AP_QUA) },
        { n: 'Nhà cung cấp', v: String(NCC.length) },
      ],
    };
  }
  if (id === 'bt-ap-tuoi') return { loai: 'cot', tieu: 'Tuổi nợ phải trả', phu: CHU_TEST, d: cotTy(AP_TUOI) };
  if (id === 'bt-ap-ncc') {
    return {
      loai: 'bang',
      tieu: 'Nhà cung cấp',
      c: ['Mã', 'Nhóm', 'Dư nợ', 'Trong hạn', 'Quá hạn'],
      d: NCC.map((k) => [k.ma, k.ten, tySo(k.du), tySo(k.trongHan), tySo(k.quaHan)]),
    };
  }
  if (id === 'bt-ap-lich') {
    return { loai: 'bang', tieu: 'Lịch thanh toán', c: ['Mã', 'Chứng từ', 'Ngày đến hạn', 'Tuần', 'Số tiền'], d: LICH_AP };
  }
  if (id === 'bt-ap-ck') {
    return { loai: 'bang', tieu: 'Cam kết thanh toán', c: ['Mã', 'Nhà cung cấp', 'Ngày', 'Cam kết', 'Đã chi', 'Trạng thái'], d: CAM_KET };
  }
  if (id === 'bt-tien-kpi') {
    return {
      loai: 'kpi',
      tieu: 'Dòng tiền 13 tuần',
      o: [
        { n: 'Tiền mặt và tiền gửi', v: tySo(60) },
        { n: 'Thu 13 tuần', v: tySo(384.8) },
        { n: 'Chi 13 tuần', v: tySo(577) },
        { n: 'Thuần', v: tySo(-192.2) },
        { n: 'Số dư thấp nhất', v: `${tySo(-138.9)} tại W8` },
        { n: 'Cần bổ sung để giữ 10 tỷ', v: tySo(148.9) },
      ],
    };
  }
  if (id === 'bt-tien-tuan') {
    return {
      loai: 'hai',
      tieu: 'Thu và chi theo tuần',
      a: 'Thu',
      b: 'Chi',
      d: TUAN_13.map((n, i) => ({ n: `${n} ${NGAY_TUAN[i]}`, a: THU_13[i] * T, b: CHI_13[i] * T })),
    };
  }
  if (id === 'bt-tien-du') {
    return { loai: 'cot', tieu: 'Số dư tiền cuối tuần', phu: 'Đầu kỳ trình bày 88,0 tỷ. Mức tối thiểu 10,0 tỷ.', d: cotTy(TUAN_13.map((n, i) => ({ n, v: DU_13[i] }))) };
  }
  if (id === 'bt-tien-vi') {
    return { loai: 'bang', tieu: 'Số dư theo tài khoản', c: ['Mã', 'Tài khoản', 'Số dư'], d: TK_TIEN };
  }
  if (id === 'bt-tien-lech') {
    return {
      loai: 'cot',
      tieu: 'Chênh lệch thu trừ chi',
      d: cotTy(TUAN_13.map((n, i) => ({ n, v: Math.round((THU_13[i] - CHI_13[i]) * 10) / 10 }))),
    };
  }
  if (id === 'bt-mua-kpi') {
    const kh = NHOM_MUA.reduce((s, g) => s + g.keHoach, 0);
    const duyet = NHOM_MUA.reduce((s, g) => s + g.duyet, 0);
    const ve = NHOM_MUA.reduce((s, g) => s + g.ve, 0);
    return {
      loai: 'kpi',
      tieu: 'Kế hoạch mua hàng',
      o: [
        { n: 'Giá trị kế hoạch', v: tySo(kh) },
        { n: 'Đã duyệt', v: tySo(duyet) },
        { n: 'Đã về', v: tySo(ve) },
        { n: 'Tỷ lệ đã về', v: `${((ve / kh) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` },
      ],
    };
  }
  if (id === 'bt-mua-nhom') {
    return {
      loai: 'tron',
      tieu: 'Kế hoạch mua theo nhóm',
      d: NHOM_MUA.map((g) => ({ n: g.n, v: g.keHoach * T, hien: tySo(g.keHoach) })),
    };
  }
  if (id === 'bt-mua-tien-do') {
    return {
      loai: 'hai',
      tieu: 'Kế hoạch so với đã về',
      a: 'Kế hoạch',
      b: 'Đã về',
      d: NHOM_MUA.map((g) => ({ n: g.n, a: g.keHoach * T, b: g.ve * T })),
    };
  }
  if (id === 'bt-mua-po') {
    return { loai: 'bang', tieu: 'Đơn đặt mua', c: ['Số', 'Nhà cung cấp', 'Nhóm', 'Giá trị', 'Trạng thái', 'Đã ghi nợ', 'Còn lại'], d: PO };
  }
  return null;
}
