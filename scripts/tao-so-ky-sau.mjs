// Sinh sổ công nợ kỳ 07/2026 nối tiếp sổ demo kỳ 06/2026 (public/mau-test/CongNo_Demo_Test.xlsx)
// để kiểm tra app tính đúng khi nạp kỳ mới. Sheet Dap_an tính độc lập trong file này, không dùng code app.
// Chạy: node scripts/tao-so-ky-sau.mjs  →  excel/CongNo_Test_Ky_07_2026.xlsx
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const goc = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NGUON = path.join(goc, 'public/mau-test/CongNo_Demo_Test.xlsx');
const DICH = path.join(goc, 'excel/CongNo_Test_Ky_07_2026.xlsx');

const TU = '2026-07-01';
const CHOT = '2026-07-31';
const SO_NGAY_KY = 31;

// ---------- tiện ích ----------
let hat = 20260731;
function ngauNhien() {
  hat |= 0;
  hat = (hat + 0x6d2b79f5) | 0;
  let t = Math.imul(hat ^ (hat >>> 15), 1 | hat);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const trong = (a, b) => a + Math.floor(ngauNhien() * (b - a + 1));
function congNgay(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const lechNgay = (a, b) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86400000);
const ngayThang7 = (tu = 1, den = 31) => `2026-07-${String(trong(tu, den)).padStart(2, '0')}`;
const thanhDate = (iso) => (iso ? new Date(`${iso}T00:00:00`) : '');
const so = (v) => (typeof v === 'number' ? v : Number(String(v || '0').replace(/[^\d.-]/g, '')) || 0);
const chuoiNgay = (v) => {
  if (!v) return '';
  if (v instanceof Date) return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
  return String(v).slice(0, 10);
};

// ---------- đọc sổ kỳ trước ----------
const wbCu = XLSX.readFile(NGUON, { cellDates: true });
const bang = (ten) => XLSX.utils.sheet_to_json(wbCu.Sheets[ten], { header: 1, defval: '' });
// Tách dòng tiêu đề (dòng đầu có ô «Mã») và các dòng dữ liệu phía sau, bỏ dòng trống
function tach(ten) {
  const rows = bang(ten);
  const i = rows.findIndex((x) => x.includes('Mã'));
  return { tieuDe: rows[0], dau: rows[i], dong: rows.slice(i + 1).filter((x) => x.some((c) => c !== '')) };
}
const bccn = tach('Imp_BCCN&TT');
const DAU_BCCN = bccn.dau;
const cot = (dau, ten) => dau.indexOf(ten);
const C = Object.fromEntries(
  ['Mã', 'Mã Ct', 'Ngày Ct', 'Số HĐ', 'Số Ct', 'Diễn giải', 'Mã hợp đồng', 'Số dư đầu kỳ', 'Tiền nợ', 'Hạn thanh toán', 'Ngày thanh toán', 'Tiền thanh toán', 'Số dư cuối kỳ', 'Mã nhân viên', 'Nhóm khách hàng', 'Email', 'Khu vực'].map((t) => [t, cot(DAU_BCCN, t)]),
);
const ctCu = bccn.dong.filter((r) => r[C['Mã']]).map((r) => ({
  ma: String(r[C['Mã']]),
  maCt: r[C['Mã Ct']],
  ngayCt: chuoiNgay(r[C['Ngày Ct']]),
  soHD: r[C['Số HĐ']],
  soCt: r[C['Số Ct']],
  dienGiai: r[C['Diễn giải']],
  maHD: r[C['Mã hợp đồng']],
  han: r[C['Hạn thanh toán']] === '' ? null : so(r[C['Hạn thanh toán']]),
  duCuoi: so(r[C['Số dư cuối kỳ']]),
  sale: r[C['Mã nhân viên']],
  nhom: r[C['Nhóm khách hàng']],
  email: r[C['Email']],
  khuVuc: r[C['Khu vực']],
}));

const dmkh = tach('DMKH');
const DAU_DM = dmkh.dau;
const D = Object.fromEntries(['Mã', 'Hạn mức Rosy', 'Hạn định Rosy', 'Mã hạn mức', 'Hạn mức duyệt', 'Hạn định duyệt'].map((t) => [t, cot(DAU_DM, t)]));
const dongDm = dmkh.dong.filter((r) => r[D['Mã']]).map((r) => [...r]);

// ---------- dựng chứng từ kỳ 07 ----------
const moi = [];
const thongTin = new Map(); // ma -> sale, nhóm, email, khu vực
for (const c of ctCu) if (!thongTin.has(c.ma)) thongTin.set(c.ma, { sale: c.sale, nhom: c.nhom, email: c.email, khuVuc: c.khuVuc });
function them(ma, p) {
  const tt = thongTin.get(ma) ?? { sale: 'HOAKD', nhom: 'Dai ly', email: `${ma.toLowerCase()}@demo.local`, khuVuc: 'HCM' };
  const ct = { ma, maCt: 'HD', soCt: '', maHD: '', duDau: 0, tienNo: 0, tienTT: 0, ngayTT: '', ...tt, ...p };
  ct.duCuoi = ct.duDau + ct.tienNo - ct.tienTT;
  moi.push(ct);
  return ct;
}
const tinhHuong = [];

// S7: KH0001 trả hết nợ cũ trong kỳ
const S7 = 'KH0001';
// 1) Chuyển số dư các chứng từ còn nợ sang kỳ mới
for (const c of ctCu) {
  if (c.duCuoi === 0) continue;
  const base = { ngayCt: c.ngayCt, soHD: c.soHD, soCt: c.soCt, dienGiai: c.dienGiai, maHD: c.maHD, maCt: c.maCt, han: c.han, duDau: c.duCuoi };
  if (c.duCuoi < 0) {
    them(c.ma, base);
    continue;
  }
  const denHan = congNgay(c.ngayCt, c.han ?? 0);
  const r = ngauNhien();
  if (c.ma === S7 || r < 0.33) {
    them(c.ma, { ...base, tienTT: c.duCuoi, ngayTT: ngayThang7() });
  } else if (r < 0.48 && denHan < TU) {
    // Trả một phần cho khoản đã quá hạn từ trước kỳ: ngày quá hạn tính theo ngày trả hay ngày chốt đều > 0
    const tra = c.duCuoi >= 2_000_000 ? Math.round(c.duCuoi / 2 / 1_000_000) * 1_000_000 : Math.round(c.duCuoi / 2 / 1000) * 1000;
    them(c.ma, { ...base, tienTT: tra, ngayTT: ngayThang7() });
  } else {
    them(c.ma, base);
  }
}

// 2) Hóa đơn mới trong tháng 7
const hanDm = new Map(dongDm.map((r) => [String(r[D['Mã']]), so(r[D['Hạn định Rosy']]) || 30]));
const dsMa = [...new Set([...ctCu.map((c) => c.ma), ...dongDm.map((r) => String(r[D['Mã']]))])].sort();
let soHd = 0;
for (const ma of dsMa) {
  if (ma === S7 || ngauNhien() > 0.6) continue;
  const n = trong(1, 3);
  for (let i = 0; i < n; i += 1) {
    soHd += 1;
    const ngayCt = ngayThang7(1, 30);
    const tien = trong(5, 60) * 1_000_000;
    const han = hanDm.get(ma) ?? 30;
    const daTra = ngauNhien() < 0.25;
    const ngayTT = daTra ? congNgay(ngayCt, Math.min(trong(0, han), lechNgay(CHOT, ngayCt))) : '';
    them(ma, { ngayCt, soHD: `HD07-${ma}-${i + 1}`, dienGiai: `Ban hang thang 7 so ${soHd}`, han, tienNo: tien, tienTT: daTra ? tien : 0, ngayTT });
  }
}

// 3) Tình huống kiểm tra cài sẵn
tinhHuong.push(['S1', 'KH0002, KH0003', 'Hóa đơn mới ngày 02/07 bỏ trống Hạn thanh toán. App phải lấy hạn định của khách trong DMKH (45 và 60 ngày), nên vẫn trong hạn; nếu coi hạn = 0 sẽ thành quá hạn 29 ngày.']);
them('KH0002', { ngayCt: '2026-07-02', soHD: 'HD07-S1-KH0002', dienGiai: 'S1 thieu han thanh toan', han: null, tienNo: 30_000_000 });
them('KH0003', { ngayCt: '2026-07-02', soHD: 'HD07-S1-KH0003', dienGiai: 'S1 thieu han thanh toan', han: null, tienNo: 25_000_000 });

tinhHuong.push(['S2', 'KH0005', 'Hóa đơn 01/07 hạn 30 ngày, đến hạn đúng ngày chốt 31/07: là «Đến hạn», tính vào trong hạn, không phải quá hạn.']);
them('KH0005', { ngayCt: '2026-07-01', soHD: 'HD07-S2-KH0005', dienGiai: 'S2 den han dung ngay chot', han: 30, tienNo: 40_000_000 });

tinhHuong.push(['S3', 'KH0007', 'Hóa đơn 01/07 hạn 10 ngày (đến hạn 11/07), 40 triệu; khách trả 20 triệu ngày 05/07. Phần còn 20 triệu đã quá hạn 20 ngày tại ngày chốt. Đáp án tính QUÁ HẠN. Bản app cũ tính tuổi nợ phần còn lại theo ngày trả một phần nên lệch 20.000.000 ở trongHan/quaHan (đã sửa 19/10/2026).']);
them('KH0007', { ngayCt: '2026-07-01', soHD: 'HD07-S3-KH0007', dienGiai: 'S3 tra mot phan truoc han', han: 10, tienNo: 40_000_000, tienTT: 20_000_000, ngayTT: '2026-07-05' });

tinhHuong.push(['S4', 'KH0010', 'Hóa đơn 10 triệu, khách chuyển 12 triệu: dư âm 2 triệu (trả thừa), vào nhóm «Trả trước hạn», trừ vào trong hạn.']);
them('KH0010', { ngayCt: '2026-07-08', soHD: 'HD07-S4-KH0010', dienGiai: 'S4 tra thua', han: 30, tienNo: 10_000_000, tienTT: 12_000_000, ngayTT: '2026-07-15' });

tinhHuong.push(['S5', 'KH0121', 'Khách mới thêm vào DMKH (hạn mức 500 triệu, hạn 30 ngày) với 2 hóa đơn; hóa đơn 01/07 thỏa thuận riêng hạn 20 ngày nên quá hạn 10 ngày (80 triệu), hóa đơn 20/07 còn trong hạn.']);
thongTin.set('KH0121', { sale: 'HOAKD', nhom: 'Dai ly', email: 'kh0121@demo.local', khuVuc: 'HN' });
them('KH0121', { ngayCt: '2026-07-01', soHD: 'HD07-S5-KH0121-1', dienGiai: 'S5 khach moi', han: 20, tienNo: 80_000_000 });
them('KH0121', { ngayCt: '2026-07-20', soHD: 'HD07-S5-KH0121-2', dienGiai: 'S5 khach moi', han: 30, tienNo: 50_000_000 });
dongDm.push(['KH0121', 'Cong ty Moi Test', 'Dai ly', 'HOAKD', 'HN', 500_000_000, 30, '', '', '', '', '', '', '', '', '', '', '', 4]);

tinhHuong.push(['S6', 'KH0006, KH0008', 'DMKH có cột «Hạn mức duyệt» mới: KH0006 hạ còn 100 triệu (thành vượt hạn mức), KH0008 nâng lên 5 tỷ. App phải dùng hạn mức duyệt thay cho hạn mức Rosy.']);
for (const r of dongDm) {
  const ma = String(r[D['Mã']]);
  if (ma === 'KH0006' || ma === 'KH0008') {
    r[D['Mã hạn mức']] = ma;
    r[D['Hạn mức duyệt']] = ma === 'KH0006' ? 100_000_000 : 5_000_000_000;
    r[D['Hạn định duyệt']] = so(r[D['Hạn định Rosy']]) || 30;
  }
}
tinhHuong.push(['S7', S7, 'Khách trả hết toàn bộ nợ cũ trong tháng 7, không mua thêm: dư cuối kỳ = 0; nợ khó đòi của khách này được xóa khỏi Imp_Noxau.']);

// ---------- đáp án tính độc lập ----------
const dm = new Map(dongDm.map((r) => {
  const duyet = r[D['Hạn mức duyệt']] !== '' && r[D['Hạn mức duyệt']] != null;
  return [String(r[D['Mã']]), {
    hm: duyet ? so(r[D['Hạn mức duyệt']]) : so(r[D['Hạn mức Rosy']]),
    han: duyet ? (r[D['Hạn định duyệt']] === '' ? null : so(r[D['Hạn định duyệt']])) : (r[D['Hạn định Rosy']] === '' ? null : so(r[D['Hạn định Rosy']])),
  }];
}));
const theoKhach = new Map();
for (const c of moi) {
  const x = theoKhach.get(c.ma) ?? [];
  x.push(c);
  theoKhach.set(c.ma, x);
}
for (const ma of dm.keys()) if (!theoKhach.has(ma)) theoKhach.set(ma, []);

const tong = { duDau: 0, no: 0, tt: 0, cuoi: 0, trongHan: 0, quaHan: 0, vuotSo: 0, vuotTien: 0, chuaSo: 0, chuaTien: 0 };
const thcn = [];
const dtgv = [];
const chiTietKH = new Map();
for (const [ma, cts] of [...theoKhach.entries()].sort()) {
  const d = dm.get(ma);
  // Hạn định của khách: DMKH, nếu không có thì bình quân hạn các chứng từ theo trọng số dư
  let hanKhach = d?.han && d.han > 0 ? d.han : null;
  if (hanKhach == null) {
    let w = 0;
    let s = 0;
    for (const c of cts) if (c.han != null && c.han > 0) { const t = Math.abs(c.duCuoi) || 1; w += c.han * t; s += t; }
    hanKhach = s > 0 ? w / s : null;
  }
  let dau = 0, no = 0, tt = 0, cuoi = 0, th = 0, qh = 0;
  for (const c of cts) {
    dau += c.duDau; no += c.tienNo; tt += c.tienTT; cuoi += c.duCuoi;
    if (c.duCuoi < 0) { th += c.duCuoi; continue; }
    if (c.duCuoi === 0) continue;
    const han = c.han ?? (hanKhach != null ? Math.round(hanKhach) : 0);
    // Phần còn nợ tính tuổi đến ngày chốt
    const ngayQH = lechNgay(CHOT, congNgay(c.ngayCt, han));
    if (ngayQH > 0) qh += c.duCuoi; else th += c.duCuoi;
  }
  tong.duDau += dau; tong.no += no; tong.tt += tt; tong.cuoi += cuoi; tong.trongHan += th; tong.quaHan += qh;
  const hm = d?.hm ?? 0;
  if (hm > 0 && cuoi > hm) { tong.vuotSo += 1; tong.vuotTien += cuoi - hm; }
  if (hm === 0 && cuoi > 0) { tong.chuaSo += 1; tong.chuaTien += cuoi; }
  if (cts.length) {
    thcn.push([ma, dau, no, tt, cuoi]);
    dtgv.push([ma, no]);
  }
  chiTietKH.set(ma, { dau, no, tt, cuoi, qh, hm });
}
const noxauCu = tach('Imp_Noxau').dong.filter((r) => r[0]);
const noxau = noxauCu.filter((r) => String(r[0]) !== S7);
const maCo = new Set(theoKhach.keys());
const noKhoDoi = noxau.filter((r) => maCo.has(String(r[0]))).reduce((s, r) => s + so(r[1]), 0);
const doanhSo = dtgv.reduce((s, r) => s + r[1], 0);
const dsoKy = doanhSo > 0 ? Math.round((tong.cuoi / doanhSo) * SO_NGAY_KY * 10) / 10 : 0;

// Kiểm tra nội bộ trước khi ghi
const cuoiCu = ctCu.reduce((s, c) => s + c.duCuoi, 0);
if (tong.duDau !== cuoiCu) throw new Error(`Đầu kỳ ${tong.duDau} khác cuối kỳ trước ${cuoiCu}`);
if (tong.duDau + tong.no - tong.tt !== tong.cuoi) throw new Error('Không cân đầu kỳ + nợ − thanh toán = cuối kỳ');
if (tong.trongHan + tong.quaHan !== tong.cuoi) throw new Error('Trong hạn + quá hạn khác dư cuối');

// ---------- ghi file ----------
const wb = XLSX.utils.book_new();
const sheet = (ten, aoa, rong) => {
  const ws = XLSX.utils.aoa_to_sheet(aoa, { cellDates: true, dateNF: 'dd/mm/yyyy' });
  if (rong) ws['!cols'] = rong.map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws, ten);
};

sheet('Ky', [
  ['Trường', 'Giá trị'],
  ['ngayChot', CHOT], ['tuNgay', TU], ['denNgay', CHOT], ['soNgayKy', SO_NGAY_KY],
  ['tuanTu', '2026-07-25'], ['tuanDen', '2026-07-31'], ['tuanNhan', 'T31/26'],
  ['keHoachDoanhThuTuan', 1_500_000_000], ['keHoachThuTuan', 1_200_000_000],
], [22, 16]);

const dauRa = [...DAU_BCCN];
const dongCt = moi.map((c) => {
  const r = new Array(dauRa.length).fill('');
  r[cot(dauRa, 'Ngày báo cáo')] = thanhDate(CHOT);
  r[C['Mã']] = c.ma; r[C['Mã Ct']] = c.maCt; r[C['Ngày Ct']] = thanhDate(c.ngayCt);
  r[C['Số HĐ']] = c.soHD; r[C['Số Ct']] = c.soCt; r[C['Diễn giải']] = c.dienGiai; r[C['Mã hợp đồng']] = c.maHD;
  r[C['Số dư đầu kỳ']] = c.duDau; r[C['Tiền nợ']] = c.tienNo; r[C['Hạn thanh toán']] = c.han ?? '';
  r[C['Ngày thanh toán']] = thanhDate(c.ngayTT); r[C['Tiền thanh toán']] = c.tienTT; r[C['Số dư cuối kỳ']] = c.duCuoi;
  r[C['Mã nhân viên']] = c.sale; r[C['Nhóm khách hàng']] = c.nhom; r[C['Email']] = c.email; r[C['Khu vực']] = c.khuVuc;
  return r;
}).sort((a, b) => String(a[C['Mã']]).localeCompare(String(b[C['Mã']])));
sheet('Imp_BCCN&TT', [['Sổ 131 — kỳ 01/07/2026–31/07/2026'], dauRa, ...dongCt]);
sheet('DMKH', [dmkh.tieuDe, DAU_DM, ...dongDm]);
sheet('Imp_THCN', [['Tổng hợp'], ['Mã', 'Số dư đầu kỳ', 'Tiền nợ', 'Tiền thanh toán', 'Số dư cuối kỳ'], ...thcn]);
sheet('Imp_DT-GV', [['Doanh số tháng 7'], ['Mã', 'Doanh số'], ...dtgv]);
sheet('Imp_Noxau', [['Nợ xấu'], ['Mã', 'Dư nợ khó đòi'], ...noxau]);
for (const ten of ['Imp_XNT_HD', 'Imp_TienDatCoc', 'Nguong_TC1']) XLSX.utils.book_append_sheet(wb, wbCu.Sheets[ten], ten);
sheet('Dap_an', [
  ['Đáp án tính độc lập bởi scripts/tao-so-ky-sau.mjs'],
  ['Khoa', 'Gia tri'],
  ['tong.duDauKy', tong.duDau], ['tong.tienNo', tong.no], ['tong.tienTT', tong.tt], ['tong.duNo', tong.cuoi],
  ['tong.trongHan', tong.trongHan], ['tong.quaHan', tong.quaHan], ['tong.dsoKy', dsoKy], ['tong.noKhoDoi', noKhoDoi],
  ['tong.vuotHmSo', tong.vuotSo], ['tong.vuotHmTien', tong.vuotTien], ['tong.chuaHmSo', tong.chuaSo], ['tong.chuaHmTien', tong.chuaTien],
], [18, 18]);

const kt = (ma) => chiTietKH.get(ma) ?? { dau: 0, no: 0, tt: 0, cuoi: 0, qh: 0, hm: 0 };
sheet('Huong_dan_test', [
  ['HƯỚNG DẪN KIỂM TRA SỔ KỲ 07/2026'],
  ['Sổ này nối tiếp CongNo_Demo_Test.xlsx (kỳ 01/01–30/06/2026). App không đọc sheet này.'],
  [],
  ['Kiểm tra nối kỳ', 'Kỳ 06/2026', 'Kỳ 07/2026', 'Ghi chú'],
  ['Dư cuối kỳ 06 = dư đầu kỳ 07', cuoiCu, tong.duDau, 'Phải bằng nhau'],
  ['Phát sinh nợ trong kỳ 07', '', tong.no, `${moi.filter((c) => c.tienNo > 0).length} hóa đơn mới`],
  ['Thanh toán trong kỳ 07', '', tong.tt, `${moi.filter((c) => c.tienTT > 0).length} chứng từ có thanh toán`],
  ['Dư cuối kỳ 07', '', tong.cuoi, ''],
  [],
  ['Tình huống', 'Khách', 'Nội dung và kết quả đúng'],
  ...tinhHuong,
  [],
  ['Số đúng theo khách', 'Dư đầu kỳ', 'Phát sinh', 'Thanh toán', 'Dư cuối kỳ', 'Quá hạn', 'Hạn mức áp dụng'],
  ...['KH0001', 'KH0002', 'KH0003', 'KH0004', 'KH0005', 'KH0006', 'KH0007', 'KH0008', 'KH0010', 'KH0121'].map((ma) => {
    const x = kt(ma);
    return [ma, x.dau, x.no, x.tt, x.cuoi, x.qh, x.hm];
  }),
  [],
  ['Cách test', 'Nạp file ở màn «Nạp dữ liệu». Bảng đối chiếu phải «Khớp» toàn bộ (19/19). Sau đó mở hồ sơ các khách trên để so số.'],
  ['Không có đáp án', 'Hạng và điểm tín dụng từng khách: chưa có công thức được kế toán chốt nên không đưa vào Dap_an.'],
], [26, 18, 18, 18, 18, 18, 18]);

fs.mkdirSync(path.dirname(DICH), { recursive: true });
XLSX.writeFile(wb, DICH, { cellDates: true });
console.log(`Đã ghi ${path.relative(goc, DICH)}: ${moi.length} chứng từ, ${theoKhach.size} khách`);
console.log({ ...tong, dsoKy, noKhoDoi, doanhSo });
