import fs from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';
import { describe, expect, it } from 'vitest';
import {
  BUCKET_KEYS,
  NGUONG_MAC_DINH,
  bucketCua,
  hangCua,
  lapKy,
  metaMacDinh,
  tinhSoNgayQH,
  type ChungTu,
  type DauVao,
} from './metrics';
import { parseWorkbook } from './parseWorkbook';
import { docSoTien } from '../format';

function chungTu(p: Partial<ChungTu>): ChungTu {
  const ct: ChungTu = {
    ngayBaoCao: '2026-06-30',
    maKH: 'K1',
    loaiCt: '',
    ngayCt: '2026-06-10',
    soHD: '',
    soCt: '',
    dienGiai: '',
    maHopDong: '',
    duDauKy: 0,
    tienNo: 100,
    hanTT: 30,
    ngayTT: null,
    tienTT: 0,
    duCuoiKy: 100,
    sale: 'S1',
    keHoachTuanSau: '',
    nhomKH: '',
    email: '',
    khuVuc: '',
    soNgayQH: 0,
    bucket: 'chuaDenHan',
    ...p,
  };
  ct.soNgayQH = tinhSoNgayQH(ct);
  ct.bucket = bucketCua(ct.soNgayQH, ct.duCuoiKy);
  return ct;
}

function dauVao(cts: ChungTu[]): DauVao {
  return {
    tenFile: 'test.xlsx',
    checksum: 'test',
    meta: metaMacDinh('2026-06-30', '2026-01-01'),
    chungTu: cts,
    danhMuc: new Map(),
    doanhSo: new Map(),
    hangDat: new Map(),
    tienCoc: new Map(),
    noKhoDoi: new Map(),
    diemExcel: new Map(),
    nguong: { ...NGUONG_MAC_DINH },
    thcn: new Map(),
    dapAn: new Map(),
    loiDoc: [],
  };
}

describe('tuổi nợ', () => {
  it('chia nhóm đúng ở các mốc biên', () => {
    expect(bucketCua(-1, 100)).toBe('chuaDenHan');
    expect(bucketCua(0, 100)).toBe('denHan');
    expect(bucketCua(30, 100)).toBe('d0_30');
    expect(bucketCua(31, 100)).toBe('d31_60');
    expect(bucketCua(180, 100)).toBe('d151_180');
    expect(bucketCua(365, 100)).toBe('d181_365');
    expect(bucketCua(366, 100)).toBe('d365');
    expect(bucketCua(400, -5)).toBe('traTruocHan');
  });

  it('tính số ngày quá hạn từ ngày chứng từ + hạn', () => {
    expect(tinhSoNgayQH({ ngayCt: '2026-06-01', hanTT: 10, ngayTT: null, ngayBaoCao: '2026-06-30', duCuoiKy: 1 })).toBe(19);
    expect(tinhSoNgayQH({ ngayCt: '2026-06-01', hanTT: 10, ngayTT: '2026-06-05', ngayBaoCao: '2026-06-30', duCuoiKy: 0 })).toBe(-6);
  });

  it('chứng từ thiếu hạn thanh toán lấy hạn của khách', () => {
    const kq = lapKy(dauVao([chungTu({ hanTT: 30 }), chungTu({ hanTT: null })]));
    const ct = kq.khach[0].chungTu[1];
    expect(ct.hanTT).toBe(30);
    expect(ct.bucket).toBe('chuaDenHan');
    expect(kq.tong.quaHan).toBe(0);
  });

  it('các nhóm tuổi nợ cộng lại bằng tổng dư nợ, kể cả dư âm', () => {
    const kq = lapKy(dauVao([chungTu({ duCuoiKy: 100 }), chungTu({ duCuoiKy: -20, ngayCt: '2026-01-01' })]));
    const tongNhom = BUCKET_KEYS.reduce((s, k) => s + kq.tong.aging[k], 0);
    expect(tongNhom).toBe(kq.tong.duNo);
    expect(kq.tong.aging.traTruocHan).toBe(-20);
  });
});

describe('xếp hạng', () => {
  it('đổi điểm sang hạng', () => {
    expect(hangCua(4)).toBe('Tốt');
    expect(hangCua(3.9)).toBe('Trung bình');
    expect(hangCua(2)).toBe('Xấu');
    expect(hangCua(1.9)).toBe('Rất xấu');
  });
});

describe('sổ mẫu CongNo_Demo_Test.xlsx', () => {
  const tep = path.resolve(__dirname, '../../public/mau-test/CongNo_Demo_Test.xlsx');
  const wb = XLSX.read(fs.readFileSync(tep), { type: 'buffer', cellDates: true });
  const kq = parseWorkbook(wb, 'CongNo_Demo_Test.xlsx', 'test');

  it('đọc không lỗi', () => {
    expect(kq.loiDoc).toEqual([]);
    expect(kq.khach.length).toBeGreaterThan(0);
  });

  it('mọi phép đối chiếu và đáp án đều khớp', () => {
    const lech = kq.kiemTra.filter((k) => !k.dat).map((k) => `${k.ten}: app ${k.app} / excel ${k.excel}`);
    expect(lech).toEqual([]);
    expect(kq.kiemTra.length).toBeGreaterThanOrEqual(20);
  });
});

describe('đọc số tiền bằng chữ', () => {
  it('đọc đúng các trường hợp linh, mốt, lăm, mười', () => {
    expect(docSoTien(0)).toBe('Không đồng');
    expect(docSoTien(15)).toBe('Mười lăm đồng');
    expect(docSoTien(21)).toBe('Hai mươi mốt đồng');
    expect(docSoTien(105)).toBe('Một trăm linh năm đồng');
    expect(docSoTien(1250000)).toBe('Một triệu hai trăm năm mươi nghìn đồng');
    expect(docSoTien(1005000)).toBe('Một triệu không trăm linh năm nghìn đồng');
    expect(docSoTien(13380000000)).toBe('Mười ba tỷ ba trăm tám mươi triệu đồng');
  });
});
