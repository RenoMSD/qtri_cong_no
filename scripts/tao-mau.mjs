import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';

const goc = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/mau');
fs.mkdirSync(goc, { recursive: true });

const XANH = 'FF0073E6';
const DAM = 'FF0B3A66';
const NHAT = 'FFE8F3FC';
const VANG = 'FFFFF4D6';
const XANH_LA = 'FFE5F6EE';
const TRANG = 'FFFFFFFF';
const CHU = 'FF0F172A';

const vien = {
  top: { style: 'thin', color: { argb: 'FFD6E3F0' } },
  left: { style: 'thin', color: { argb: 'FFD6E3F0' } },
  bottom: { style: 'thin', color: { argb: 'FFD6E3F0' } },
  right: { style: 'thin', color: { argb: 'FFD6E3F0' } },
};

function toMau(o, mau, chu = TRANG, dam = true) {
  o.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: mau } };
  o.font = { name: 'Calibri', size: 11, bold: dam, color: { argb: chu } };
  o.alignment = { vertical: 'middle', wrapText: true };
}

function bang(wb, ten, tieu, phu, cot, dong, rong) {
  const ws = wb.addWorksheet(ten, {
    views: [{ state: 'frozen', ySplit: 3, showGridLines: false }],
    properties: { tabColor: { argb: XANH } },
  });
  ws.mergeCells(1, 1, 1, cot.length);
  const dongTieu = ws.getRow(1);
  dongTieu.height = 28;
  dongTieu.getCell(1).value = tieu;
  toMau(dongTieu.getCell(1), DAM, TRANG);
  ws.mergeCells(2, 1, 2, cot.length);
  const dongPhu = ws.getRow(2);
  dongPhu.height = 22;
  dongPhu.getCell(1).value = phu;
  toMau(dongPhu.getCell(1), NHAT, DAM, false);
  const dau = ws.getRow(3);
  dau.height = 24;
  cot.forEach((tenCot, i) => {
    const o = dau.getCell(i + 1);
    o.value = tenCot;
    toMau(o, XANH, TRANG);
    o.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    o.border = vien;
  });
  dong.forEach((hang, ri) => {
    const row = ws.getRow(4 + ri);
    row.height = 20;
    hang.forEach((gia, i) => {
      const o = row.getCell(i + 1);
      o.value = gia;
      o.font = { name: 'Calibri', size: 11, color: { argb: CHU } };
      o.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ri % 2 ? 'FFF7FBFE' : TRANG } };
      o.border = vien;
      o.alignment = { vertical: 'middle' };
      if (typeof gia === 'number') o.numFmt = Number.isInteger(gia) ? '#,##0' : '0.00';
    });
  });
  const chuY = ws.getRow(4 + dong.length + 1);
  chuY.height = 32;
  const oChu = chuY.getCell(cot.length + 1);
  oChu.value = 'Dòng số phía trên là ví dụ. Giữ dòng tiêu đề màu xanh khi thay bằng số của công ty.';
  toMau(oChu, VANG, 'FF7A5B00', false);
  ws.getColumn(cot.length + 1).width = 62;
  cot.forEach((_, i) => {
    ws.getColumn(i + 1).width = rong[i] ?? 18;
  });
  ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3 + dong.length, column: cot.length } };
  return ws;
}

const wb = new ExcelJS.Workbook();
wb.creator = 'Công nợ Tân Phú Cường';

const hd = wb.addWorksheet('HUONG_DAN', {
  properties: { tabColor: { argb: 'FF0B3A66' } },
  views: [{ showGridLines: false }],
});
hd.columns = [{ width: 28 }, { width: 62 }, { width: 36 }, { width: 28 }];
hd.mergeCells('A1:D1');
hd.getRow(1).height = 36;
hd.getCell('A1').value = 'HƯỚNG DẪN NẠP SỔ CÔNG NỢ PHẢI THU';
toMau(hd.getCell('A1'), DAM, TRANG);
hd.getCell('A1').font = { name: 'Calibri', size: 18, bold: true, color: { argb: TRANG } };
hd.mergeCells('A2:D2');
hd.getRow(2).height = 24;
hd.getCell('A2').value = 'Kéo file này vào màn Nạp dữ liệu. Các sheet bên cạnh đã có dòng tiêu đề và vài dòng ví dụ.';
toMau(hd.getCell('A2'), NHAT, DAM, false);

const muc = [
  ['Sheet', 'Dùng để làm gì', 'Dòng tiêu đề', 'Màu tab'],
  ['HUONG_DAN', 'Đọc trước khi điền. Sheet này không được tính vào số.', 'Mục lục bên dưới', 'Xanh đậm'],
  ['Imp_BCCN&TT', 'Từng chứng từ phải thu: nợ, thu, dư cuối, hạn, Sale.', 'Dòng 3, nền xanh', 'Xanh'],
  ['DMKH', 'Danh mục khách: tên, Sale, khu vực, hạn mức, điểm hợp tác.', 'Dòng 3', 'Xanh'],
  ['Imp_THCN', 'Tổng hợp theo mã. Phải khớp cộng chứng từ, lệch trên 1 đồng thì chưa cho dùng kỳ.', 'Dòng 3', 'Xanh'],
  ['Imp_DTGV', 'Doanh số lũy kế theo mã, để tính DSO khách.', 'Dòng 3', 'Xanh'],
  ['Imp_XNTHD', 'Hàng đặt còn lại theo mã.', 'Dòng 3', 'Xanh'],
  ['Imp_TienDatCoc', 'Tiền đặt cọc theo mã.', 'Dòng 3', 'Xanh'],
  ['Imp_Noxau', 'Nợ xấu (nợ khó đòi) theo mã.', 'Dòng 3', 'Xanh'],
  ['Ky', 'Ngày chốt, khoảng tuần, kế hoạch doanh thu và thu trong tuần.', 'Dòng 3', 'Xanh'],
  ['Nguong_TC1', 'Ngưỡng chấm điểm 5–2. Bỏ sheet này thì app dùng ngưỡng tạm.', 'Dòng 3', 'Xanh'],
];
muc.forEach((hang, ri) => {
  const row = hd.getRow(4 + ri);
  row.height = ri === 0 ? 22 : 32;
  hang.forEach((gia, i) => {
    const o = row.getCell(i + 1);
    o.value = gia;
    o.border = vien;
    o.alignment = { vertical: 'middle', wrapText: true };
    if (ri === 0) toMau(o, XANH, TRANG);
    else {
      o.font = { name: 'Calibri', size: 11, color: { argb: CHU } };
      o.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ri % 2 ? NHAT : TRANG } };
    }
  });
});

hd.mergeCells('A16:D16');
hd.getRow(16).height = 24;
hd.getCell('A16').value = 'Quy tắc khi điền';
toMau(hd.getCell('A16'), 'FF0E7A4B', TRANG);
const quy = [
  'Mã khách viết hoa, giống nhau trên mọi sheet.',
  'Số dư cuối kỳ của một dòng chứng từ = dư đầu + tiền nợ − tiền thanh toán.',
  'Imp_THCN là cộng của Imp_BCCN&TT theo từng mã.',
  'Ngày viết dạng dd/mm/yyyy. Hạn thanh toán là số ngày.',
  'Điểm hợp tác chỉ từ 1 đến 5. Để trống nếu chưa chấm.',
  'Dòng vàng dưới mỗi bảng là ghi chú, không phải chứng từ. Có thể xóa sau khi đã hiểu.',
];
quy.forEach((dong, i) => {
  const row = hd.getRow(17 + i);
  row.height = 20;
  hd.mergeCells(17 + i, 1, 17 + i, 4);
  row.getCell(1).value = `${i + 1}. ${dong}`;
  toMau(row.getCell(1), i % 2 ? XANH_LA : 'FFF4FBF7', 'FF145C3A', false);
});

bang(
  wb,
  'Imp_BCCN&TT',
  'SỔ CHI TIẾT CÔNG NỢ PHẢI THU',
  'Mỗi dòng là một chứng từ. Dư cuối = dư đầu + tiền nợ − tiền thanh toán.',
  ['Ngày báo cáo', 'Mã KH', 'Mã CT', 'Ngày CT', 'Số HĐ', 'Số CT', 'Diễn giải', 'Mã hợp đồng', 'Số dư đầu kỳ', 'Tiền nợ', 'Hạn thanh toán', 'Ngày thanh toán', 'Tiền thanh toán', 'Số dư cuối kỳ', 'Mã nhân viên', 'Kế hoạch tuần sau', 'Nhóm khách hàng', 'Email', 'Khu vực'],
  [
    ['30/06/2026', 'KH-MAU-01', 'HD', '10/02/2026', 'HD-01', 'CT-01', 'Hóa đơn tháng 2', 'HD-A', 0, 200000000, 45, '', 0, 200000000, 'SALE01', '', 'Đại lý', 'mau01@example.com', 'Miền Nam'],
    ['30/06/2026', 'KH-MAU-01', 'HD', '01/05/2026', 'HD-02', 'CT-02', 'Hóa đơn tháng 5', 'HD-A', 0, 80000000, 45, '20/06/2026', 30000000, 50000000, 'SALE01', 'Gọi nhắc hạn', 'Đại lý', 'mau01@example.com', 'Miền Nam'],
    ['30/06/2026', 'KH-MAU-01', 'HD', '22/06/2026', 'HD-03', 'CT-03', 'Phát sinh trong tuần', 'HD-A', 0, 40000000, 45, '', 0, 40000000, 'SALE01', '', 'Đại lý', 'mau01@example.com', 'Miền Nam'],
    ['30/06/2026', 'KH-MAU-02', 'HD', '10/01/2026', 'HD-04', 'CT-04', 'Hóa đơn tháng 1', 'HD-B', 0, 120000000, 30, '', 0, 120000000, 'SALE02', '', 'Dự án', 'mau02@example.com', 'Miền Bắc'],
    ['30/06/2026', 'KH-MAU-02', 'HD', '24/06/2026', 'HD-05', 'CT-05', 'Đã thu trong tuần', 'HD-B', 0, 15000000, 30, '25/06/2026', 15000000, 0, 'SALE02', '', 'Dự án', 'mau02@example.com', 'Miền Bắc'],
  ],
  [16, 14, 10, 14, 12, 12, 28, 12, 16, 16, 16, 16, 16, 18, 16, 22, 18, 26, 14],
);

bang(
  wb,
  'DMKH',
  'DANH MỤC KHÁCH HÀNG',
  'Hạn mức duyệt để trống thì app lấy hạn mức. Điểm hợp tác từ 1 đến 5.',
  ['Mã KH', 'Tên khách hàng', 'Nhóm khách hàng', 'Mã nhân viên', 'Khu vực', 'Email', 'Hạn mức', 'Hạn định', 'Điểm hợp tác'],
  [
    ['KH-MAU-01', 'Công ty mẫu An', 'Đại lý', 'SALE01', 'Miền Nam', 'mau01@example.com', 500000000, 45, 4],
    ['KH-MAU-02', 'Công ty mẫu Bình', 'Dự án', 'SALE02', 'Miền Bắc', 'mau02@example.com', 0, 30, 3],
  ],
  [14, 28, 18, 16, 14, 26, 16, 14, 16],
);

bang(
  wb,
  'Imp_THCN',
  'TỔNG HỢP CÔNG NỢ THEO MÃ',
  'Mỗi mã một dòng. Số phải bằng cộng chứng từ của mã đó.',
  ['Mã KH', 'Số dư đầu kỳ', 'Tiền nợ', 'Tiền thanh toán', 'Số dư cuối kỳ'],
  [
    ['KH-MAU-01', 0, 320000000, 30000000, 290000000],
    ['KH-MAU-02', 0, 135000000, 15000000, 120000000],
  ],
  [14, 18, 18, 18, 18],
);

bang(
  wb,
  'Imp_DTGV',
  'DOANH SỐ LŨY KẾ',
  'Dùng cho DSO khách: dư nợ / doanh số × 365.',
  ['Mã KH', 'Doanh số'],
  [
    ['KH-MAU-01', 500000000],
    ['KH-MAU-02', 200000000],
  ],
  [14, 18],
);

bang(
  wb,
  'Imp_XNTHD',
  'HÀNG ĐẶT CÒN LẠI',
  'Giá trị đơn hàng chưa xuất hết theo mã.',
  ['Mã KH', 'Giá trị tồn cuối'],
  [
    ['KH-MAU-01', 25000000],
    ['KH-MAU-02', 0],
  ],
  [14, 20],
);

bang(
  wb,
  'Imp_TienDatCoc',
  'TIỀN ĐẶT CỌC',
  'Cọc đã nhận, không cộng vào dư nợ phải thu.',
  ['Mã KH', 'Số tiền'],
  [
    ['KH-MAU-01', 10000000],
    ['KH-MAU-02', 0],
  ],
  [14, 18],
);

bang(
  wb,
  'Imp_Noxau',
  'NỢ XẤU (NỢ KHÓ ĐÒI)',
  'Chỉ ghi số đã xếp vào nợ khó đòi. Quá hạn trên 365 ngày vẫn là một nhóm tuổi nợ, không tự thành nợ xấu.',
  ['Mã KH', 'Dư nợ khó đòi'],
  [
    ['KH-MAU-01', 0],
    ['KH-MAU-02', 20000000],
  ],
  [14, 20],
);

bang(
  wb,
  'Ky',
  'THÔNG TIN KỲ VÀ TUẦN',
  'Cột Trường giữ nguyên mã. Cột Giá trị là ngày dd/mm/yyyy hoặc số tiền.',
  ['Trường', 'Giá trị', 'Diễn giải'],
  [
    ['ngayChot', '30/06/2026', 'Ngày chốt sổ'],
    ['tuNgay', '01/01/2026', 'Ngày đầu kỳ'],
    ['denNgay', '30/06/2026', 'Ngày cuối kỳ'],
    ['soNgayKy', 181, 'Số ngày của kỳ, kể cả hai đầu'],
    ['tuanTu', '20/06/2026', 'Thứ bảy đầu tuần báo cáo'],
    ['tuanDen', '26/06/2026', 'Thứ sáu cuối tuần báo cáo'],
    ['tuanNhan', 'T26/26', 'Nhãn tuần'],
    ['keHoachDoanhThuTuan', 2000000000, 'Kế hoạch doanh thu của tuần'],
    ['keHoachThuTuan', 1500000000, 'Kế hoạch thu của tuần'],
  ],
  [28, 22, 42],
);

bang(
  wb,
  'Nguong_TC1',
  'NGƯỠNG CHẤM ĐIỂM TC-1',
  'M5 là mốc điểm 5, rồi M4, M3, M2. Vượt M2 thì điểm 1. Đây là ngưỡng tạm của file mẫu.',
  ['Mã', 'Tên ngưỡng', 'M5', 'M4', 'M3', 'M2'],
  [
    ['dsoTrenHan', 'DSO chia hạn thanh toán', 1, 1.2, 1.5, 2],
    ['dsoGapNgay', 'DSO trừ hạn, đơn vị ngày', 0, 15, 30, 60],
    ['tyLeQuaHan', 'Tỷ lệ quá hạn', 0.05, 0.15, 0.3, 0.5],
    ['ngayQhBq', 'Ngày quá hạn bình quân', 15, 30, 60, 120],
    ['dungHanMuc', 'Mức dùng hạn mức', 0.5, 0.75, 0.9, 1],
  ],
  [18, 36, 12, 12, 12, 12],
);

const ra = path.join(goc, 'Mau_Nap_CongNo.xlsx');
await wb.xlsx.writeFile(ra);
console.log(ra);
