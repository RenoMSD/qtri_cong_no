import * as XLSX from 'xlsx';
import {
  type ChungTu,
  type DanhMuc,
  type DauVao,
  type KetQua,
  type KyMeta,
  type Nguong,
  NGUONG_MAC_DINH,
  bucketCua,
  lapKy,
  metaMacDinh,
  tinhSoNgayQH,
} from './metrics';

const BLANK_STOP = 40;
const ROW_CAP = 80000;

export async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function parseArrayBuffer(buf: ArrayBuffer, tenFile: string): Promise<KetQua> {
  const checksum = await sha256Hex(buf);
  const wb = XLSX.read(buf, { type: 'array', cellDates: true });
  return parseWorkbook(wb, tenFile, checksum);
}

export function parseWorkbook(wb: XLSX.WorkBook, tenFile: string, checksum: string): KetQua {
  const loiDoc: string[] = [];
  const bccnName = findSheet(wb, ['impbccn', 'bccntt']);
  if (!bccnName) {
    loiDoc.push('Không thấy sheet Imp_BCCN&TT.');
    return lapKy(dauVaoRong(tenFile, checksum, loiDoc));
  }
  const bccn = docBccn(wb.Sheets[bccnName], loiDoc);
  if (bccn.length === 0 && loiDoc.length === 0) loiDoc.push('Imp_BCCN&TT không có dòng chứng từ.');

  const danhMuc = docDanhMuc(wb);
  const thcn = docThcn(wb);
  const doanhSo = docSoTheoMa(wb, ['impdtgv', 'dtgv'], ['doanhso', 'doanhthu', 'dsvat', 'sotien']);
  const hangDat = docSoTheoMa(wb, ['impxnthd', 'xnthd'], ['giatritoncuoi', 'toncuoi', 'sotien', 'giatri']);
  const tienCoc = docSoTheoMa(wb, ['imptiendatcoc', 'tiendatcoc'], ['sotien', 'tiencoc', 'soducuoi']);
  const noKhoDoi = docSoTheoMa(wb, ['impnoxau', 'noxau'], ['dunokhodoi', 'nokhodoi', 'soducuoi', 'sotien', 'duno']);
  const diemExcel = docDiemExcel(wb);
  const nguong = docNguong(wb) ?? { ...NGUONG_MAC_DINH };
  const dapAn = docDapAn(wb);
  const meta = docKy(wb, bccn);

  const dauVao: DauVao = {
    tenFile,
    checksum,
    meta,
    chungTu: bccn,
    danhMuc,
    doanhSo,
    hangDat,
    tienCoc,
    noKhoDoi,
    diemExcel,
    nguong,
    thcn,
    dapAn,
    loiDoc,
  };
  return lapKy(dauVao);
}

function dauVaoRong(tenFile: string, checksum: string, loiDoc: string[]): DauVao {
  return {
    tenFile,
    checksum,
    meta: metaMacDinh('2026-06-30', '2026-01-01'),
    chungTu: [],
    danhMuc: new Map(),
    doanhSo: new Map(),
    hangDat: new Map(),
    tienCoc: new Map(),
    noKhoDoi: new Map(),
    diemExcel: new Map(),
    nguong: { ...NGUONG_MAC_DINH },
    thcn: new Map(),
    dapAn: new Map(),
    loiDoc,
  };
}

export function chuanHoaTieuDe(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function findSheet(wb: XLSX.WorkBook, aliases: string[]): string | undefined {
  return wb.SheetNames.find((name) => {
    const n = chuanHoaTieuDe(name);
    return aliases.some((a) => n.includes(a));
  });
}

function cellRaw(sheet: XLSX.WorkSheet, r: number, c: number): unknown {
  const cell = sheet[XLSX.utils.encode_cell({ r, c })];
  if (!cell) return '';
  return cell.v;
}

function asText(v: unknown): string {
  if (v == null) return '';
  if (v instanceof Date) return asDate(v) ?? '';
  return String(v).trim();
}

function asNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v !== 'string') return 0;
  let s = v.trim().replace(/\s/g, '');
  if (!s || s === '-') return 0;
  const neg = /^\(.*\)$/.test(s);
  if (neg) s = s.slice(1, -1);
  let n: number;
  if (s.includes(',') && s.includes('.')) {
    n = s.lastIndexOf(',') > s.lastIndexOf('.')
      ? Number(s.replace(/\./g, '').replace(',', '.'))
      : Number(s.replace(/,/g, ''));
  } else if (s.includes(',')) {
    n = Number(s.replace(/\./g, '').replace(',', '.'));
  } else {
    n = Number(s);
  }
  if (!Number.isFinite(n)) return 0;
  return neg ? -n : n;
}

function asDate(v: unknown): string | null {
  if (v == null || v === '') return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${v.getFullYear()}-${m}-${d}`;
  }
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    const o = XLSX.SSF.parse_date_code(v);
    if (o) {
      return `${o.y}-${String(o.m).padStart(2, '0')}-${String(o.d).padStart(2, '0')}`;
    }
  }
  if (typeof v === 'string') {
    const s = v.trim();
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const dmy = s.match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/);
    if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }
  return null;
}

function headerRow(sheet: XLSX.WorkSheet, need: (cells: string[]) => boolean): { row: number; cells: string[] } | null {
  const ref = sheet['!ref'];
  if (!ref) return null;
  const range = XLSX.utils.decode_range(ref);
  const last = Math.min(range.e.r, 25);
  const cols = Math.min(range.e.c, 60);
  for (let r = range.s.r; r <= last; r += 1) {
    const cells: string[] = [];
    for (let c = 0; c <= cols; c += 1) cells.push(chuanHoaTieuDe(asText(cellRaw(sheet, r, c))));
    if (need(cells)) return { row: r, cells };
  }
  return null;
}

function colOf(cells: string[], names: string[]): number {
  return cells.findIndex((c) => names.includes(c));
}

function docBccn(sheet: XLSX.WorkSheet, loiDoc: string[]): ChungTu[] {
  const header = headerRow(sheet, (cells) => {
    const coMa = cells.includes('ma') || cells.includes('makh');
    const coTien = cells.includes('soducuoiky') || cells.includes('tienno') || cells.includes('ducuoiky');
    return coMa && coTien;
  });
  if (!header) {
    loiDoc.push('Không thấy dòng tiêu đề của Imp_BCCN&TT (cần cột Mã và Số dư cuối kỳ).');
    return [];
  }
  const c = header.cells;
  const iMa = colOf(c, ['ma', 'makh', 'makhachhang']);
  const iNgayBc = colOf(c, ['ngaybaocao']);
  const iLoai = colOf(c, ['mact', 'loaict']);
  const iNgayCt = colOf(c, ['ngayct', 'ngaychungtu']);
  const iSoHd = colOf(c, ['sohd', 'sohoadon']);
  const iSoCt = colOf(c, ['soct', 'sochungtu']);
  const iDg = colOf(c, ['diengiai']);
  const iHd = colOf(c, ['mahopdong']);
  const iDau = colOf(c, ['sodudauky', 'dudauky']);
  const iNo = colOf(c, ['tienno', 'phatsinhno']);
  const iHan = colOf(c, ['hanthanhtoan']);
  const iNgayTt = colOf(c, ['ngaythanhtoan']);
  const iTt = colOf(c, ['tienthanhtoan', 'phatsinhco']);
  const iCuoi = colOf(c, ['soducuoiky', 'ducuoiky']);
  const iSale = colOf(c, ['manhanvien', 'nvkd', 'sale']);
  const iKh = colOf(c, ['kehoachtuansau']);
  const iNhom = colOf(c, ['nhomkhachhang', 'nhomkh']);
  const iEmail = colOf(c, ['email']);
  const iKv = colOf(c, ['khuvuc']);
  if (iMa < 0) {
    loiDoc.push('Sheet công nợ thiếu cột Mã.');
    return [];
  }

  const out: ChungTu[] = [];
  let blank = 0;
  const ref = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const end = Math.min(ref.e.r, header.row + ROW_CAP);
  for (let r = header.row + 1; r <= end; r += 1) {
    const ma = asText(cellRaw(sheet, r, iMa));
    if (!ma) {
      blank += 1;
      if (blank >= BLANK_STOP) break;
      continue;
    }
    blank = 0;
    const duDauKy = iDau >= 0 ? asNumber(cellRaw(sheet, r, iDau)) : 0;
    const tienNo = iNo >= 0 ? asNumber(cellRaw(sheet, r, iNo)) : 0;
    const tienTT = iTt >= 0 ? asNumber(cellRaw(sheet, r, iTt)) : 0;
    const duCuoiKy = iCuoi >= 0 ? asNumber(cellRaw(sheet, r, iCuoi)) : duDauKy + tienNo - tienTT;
    const ngayBaoCao = (iNgayBc >= 0 ? asDate(cellRaw(sheet, r, iNgayBc)) : null) ?? '';
    const raw: Omit<ChungTu, 'soNgayQH' | 'bucket'> = {
      ngayBaoCao,
      maKH: ma,
      loaiCt: iLoai >= 0 ? asText(cellRaw(sheet, r, iLoai)) : '',
      ngayCt: iNgayCt >= 0 ? asDate(cellRaw(sheet, r, iNgayCt)) : null,
      soHD: iSoHd >= 0 ? asText(cellRaw(sheet, r, iSoHd)) : '',
      soCt: iSoCt >= 0 ? asText(cellRaw(sheet, r, iSoCt)) : '',
      dienGiai: iDg >= 0 ? asText(cellRaw(sheet, r, iDg)) : '',
      maHopDong: iHd >= 0 ? asText(cellRaw(sheet, r, iHd)) : '',
      duDauKy,
      tienNo,
      hanTT: iHan >= 0 && asText(cellRaw(sheet, r, iHan)) !== '' ? asNumber(cellRaw(sheet, r, iHan)) : null,
      ngayTT: iNgayTt >= 0 ? asDate(cellRaw(sheet, r, iNgayTt)) : null,
      tienTT,
      duCuoiKy,
      sale: iSale >= 0 ? asText(cellRaw(sheet, r, iSale)) : '',
      keHoachTuanSau: iKh >= 0 ? asText(cellRaw(sheet, r, iKh)) : '',
      nhomKH: iNhom >= 0 ? asText(cellRaw(sheet, r, iNhom)) : '',
      email: iEmail >= 0 ? asText(cellRaw(sheet, r, iEmail)) : '',
      khuVuc: iKv >= 0 ? asText(cellRaw(sheet, r, iKv)) : '',
    };
    const ngayBaoCaoDung = raw.ngayBaoCao || '2026-06-30';
    const soNgayQH = tinhSoNgayQH({ ...raw, ngayBaoCao: ngayBaoCaoDung });
    out.push({ ...raw, ngayBaoCao: ngayBaoCaoDung, soNgayQH, bucket: bucketCua(soNgayQH, duCuoiKy) });
  }
  return out;
}

function docDanhMuc(wb: XLSX.WorkBook): Map<string, DanhMuc> {
  const name = findSheet(wb, ['dmkh']);
  const map = new Map<string, DanhMuc>();
  if (!name) return map;
  const sheet = wb.Sheets[name];
  const header = headerRow(sheet, (cells) => cells.includes('ma') || cells.includes('makh'));
  if (!header) return map;
  const c = header.cells;
  const iMa = colOf(c, ['ma', 'makh', 'makhachhang']);
  const iTen = colOf(c, ['tenkhachhang', 'tenkh', 'ten']);
  const iNhom = colOf(c, ['nhomkhachhang', 'nhomkh']);
  const iSale = colOf(c, ['manhanvien', 'nvkd', 'sale']);
  const iKv = colOf(c, ['khuvuc']);
  const iEmail = colOf(c, ['email']);
  const iRosy = colOf(c, ['hanmucrosy']);
  const iHanRosy = colOf(c, ['handinhrosy']);
  const iHm = colOf(c, ['hanmuc']);
  const iHan = colOf(c, ['handinh']);
  const iMaHm = colOf(c, ['mahanmuc', 'makhhm']);
  const iDuyet = colOf(c, ['hanmucduyet']);
  const iHanDuyet = colOf(c, ['handinhduyet']);
  const iDiem = colOf(c, ['diemhoptac', 'diemht']);
  if (iMa < 0) return map;

  const duyet = new Map<string, { hm: number; han: number | null; diem: number | null }>();
  const ref = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const end = Math.min(ref.e.r, header.row + ROW_CAP);
  let blank = 0;
  for (let r = header.row + 1; r <= end; r += 1) {
    const ma = asText(cellRaw(sheet, r, iMa));
    const maHm = iMaHm >= 0 ? asText(cellRaw(sheet, r, iMaHm)) : '';
    if (!ma && !maHm) {
      blank += 1;
      if (blank >= BLANK_STOP) break;
      continue;
    }
    blank = 0;
    if (ma) {
      const diemRaw = iDiem >= 0 ? asNumber(cellRaw(sheet, r, iDiem)) : 0;
      map.set(ma, {
        maKH: ma,
        tenKH: iTen >= 0 ? asText(cellRaw(sheet, r, iTen)) : '',
        nhomKH: iNhom >= 0 ? asText(cellRaw(sheet, r, iNhom)) : '',
        sale: iSale >= 0 ? asText(cellRaw(sheet, r, iSale)) : '',
        khuVuc: iKv >= 0 ? asText(cellRaw(sheet, r, iKv)) : '',
        email: iEmail >= 0 ? asText(cellRaw(sheet, r, iEmail)) : '',
        hmRosy: iRosy >= 0 ? asNumber(cellRaw(sheet, r, iRosy)) : iHm >= 0 ? asNumber(cellRaw(sheet, r, iHm)) : 0,
        hanRosy: iHanRosy >= 0 ? asNumber(cellRaw(sheet, r, iHanRosy)) : iHan >= 0 ? asNumber(cellRaw(sheet, r, iHan)) : null,
        hmDuyet: null,
        hanDuyet: null,
        diemHT: diemRaw >= 1 && diemRaw <= 5 ? diemRaw : null,
      });
    }
    const khoaDuyet = maHm || (iDuyet >= 0 ? ma : '');
    if (khoaDuyet && iDuyet >= 0 && asText(cellRaw(sheet, r, iDuyet)) !== '') {
      const diemRaw = iDiem >= 0 ? asNumber(cellRaw(sheet, r, iDiem)) : 0;
      duyet.set(khoaDuyet, {
        hm: asNumber(cellRaw(sheet, r, iDuyet)),
        han: iHanDuyet >= 0 && asText(cellRaw(sheet, r, iHanDuyet)) !== '' ? asNumber(cellRaw(sheet, r, iHanDuyet)) : null,
        diem: diemRaw >= 1 && diemRaw <= 5 ? diemRaw : null,
      });
    }
  }
  for (const [ma, hm] of duyet) {
    const cur = map.get(ma) ?? {
      maKH: ma,
      tenKH: '',
      nhomKH: '',
      sale: '',
      khuVuc: '',
      email: '',
      hmRosy: 0,
      hanRosy: null,
      hmDuyet: null,
      hanDuyet: null,
      diemHT: null,
    };
    cur.hmDuyet = hm.hm;
    cur.hanDuyet = hm.han;
    if (hm.diem != null) cur.diemHT = hm.diem;
    map.set(ma, cur);
  }
  return map;
}

function docThcn(wb: XLSX.WorkBook): DauVao['thcn'] {
  const name = findSheet(wb, ['impthcn', 'thcn']);
  const map: DauVao['thcn'] = new Map();
  if (!name) return map;
  const sheet = wb.Sheets[name];
  const header = headerRow(sheet, (cells) => (cells.includes('ma') || cells.includes('makh')) && (cells.includes('soducuoiky') || cells.includes('ducuoiky')));
  if (!header) return map;
  const c = header.cells;
  const iMa = colOf(c, ['ma', 'makh']);
  const iDau = colOf(c, ['sodudauky', 'dudauky']);
  const iNo = colOf(c, ['tienno', 'phatsinhno', 'phatsinhtang']);
  const iTt = colOf(c, ['tienthanhtoan', 'phatsinhco', 'phatsinhgiam']);
  const iCuoi = colOf(c, ['soducuoiky', 'ducuoiky']);
  if (iMa < 0 || iCuoi < 0) return map;
  let blank = 0;
  const ref = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  for (let r = header.row + 1; r <= Math.min(ref.e.r, header.row + ROW_CAP); r += 1) {
    const ma = asText(cellRaw(sheet, r, iMa));
    if (!ma) {
      blank += 1;
      if (blank >= BLANK_STOP) break;
      continue;
    }
    blank = 0;
    map.set(ma, {
      duDauKy: iDau >= 0 ? asNumber(cellRaw(sheet, r, iDau)) : 0,
      tienNo: iNo >= 0 ? asNumber(cellRaw(sheet, r, iNo)) : 0,
      tienTT: iTt >= 0 ? asNumber(cellRaw(sheet, r, iTt)) : 0,
      duNo: asNumber(cellRaw(sheet, r, iCuoi)),
    });
  }
  return map;
}

function docSoTheoMa(wb: XLSX.WorkBook, sheets: string[], valueNames: string[]): Map<string, number> {
  const name = findSheet(wb, sheets);
  const map = new Map<string, number>();
  if (!name) return map;
  const sheet = wb.Sheets[name];
  const header = headerRow(sheet, (cells) => cells.includes('ma') || cells.includes('makh'));
  if (!header) return map;
  const iMa = colOf(header.cells, ['ma', 'makh', 'makhachhang']);
  const iVal = colOf(header.cells, valueNames);
  if (iMa < 0 || iVal < 0) return map;
  let blank = 0;
  const ref = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  for (let r = header.row + 1; r <= Math.min(ref.e.r, header.row + ROW_CAP); r += 1) {
    const ma = asText(cellRaw(sheet, r, iMa));
    if (!ma) {
      blank += 1;
      if (blank >= BLANK_STOP) break;
      continue;
    }
    blank = 0;
    map.set(ma, (map.get(ma) ?? 0) + asNumber(cellRaw(sheet, r, iVal)));
  }
  return map;
}

function docDiemExcel(wb: XLSX.WorkBook): Map<string, number> {
  const map = new Map<string, number>();
  const names = [findSheet(wb, ['diemexcel']), findSheet(wb, ['tc1kh'])].filter(Boolean) as string[];
  for (const name of names) {
    const sheet = wb.Sheets[name];
    const header = headerRow(sheet, (cells) => (cells.includes('ma') || cells.includes('makh')) && cells.some((c) => c.includes('diem')));
    if (!header) continue;
    const iMa = colOf(header.cells, ['ma', 'makh', 'makhachhang']);
    const iDiem = colOf(header.cells, ['diem', 'diemtb', 'diemtrungbinh', 'diemtc1']);
    const iFallback = header.cells.findIndex((c) => c.includes('diem') && !c.includes('hoptac') && c !== 'diemht');
    const col = iDiem >= 0 ? iDiem : iFallback;
    if (iMa < 0 || col < 0) continue;
    let blank = 0;
    const ref = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    for (let r = header.row + 1; r <= Math.min(ref.e.r, header.row + ROW_CAP); r += 1) {
      const ma = asText(cellRaw(sheet, r, iMa));
      if (!ma) {
        blank += 1;
        if (blank >= BLANK_STOP) break;
        continue;
      }
      blank = 0;
      if (map.has(ma)) continue;
      const diem = asNumber(cellRaw(sheet, r, col));
      if (diem >= 1 && diem <= 5) map.set(ma, diem);
    }
  }
  return map;
}

function docNguong(wb: XLSX.WorkBook): Nguong | null {
  const name = findSheet(wb, ['nguongtc1', 'nguong']);
  if (!name) return null;
  const sheet = wb.Sheets[name];
  const header = headerRow(sheet, (cells) => cells.includes('ma') && cells.includes('m5'));
  if (!header) return null;
  const iMa = colOf(header.cells, ['ma']);
  const i5 = colOf(header.cells, ['m5']);
  const i4 = colOf(header.cells, ['m4']);
  const i3 = colOf(header.cells, ['m3']);
  const i2 = colOf(header.cells, ['m2']);
  const rows = new Map<string, [number, number, number, number]>();
  const ref = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  for (let r = header.row + 1; r <= Math.min(ref.e.r, header.row + 20); r += 1) {
    const ma = chuanHoaTieuDe(asText(cellRaw(sheet, r, iMa)));
    if (!ma) continue;
    rows.set(ma, [
      asNumber(cellRaw(sheet, r, i5)),
      asNumber(cellRaw(sheet, r, i4)),
      asNumber(cellRaw(sheet, r, i3)),
      asNumber(cellRaw(sheet, r, i2)),
    ]);
  }
  const lay = (k: string, fallback: [number, number, number, number]) => rows.get(k) ?? fallback;
  return {
    nguon: 'ngưỡng tạm để chạy demo',
    dsoTrenHan: lay('dsotrenhan', NGUONG_MAC_DINH.dsoTrenHan),
    dsoGapNgay: lay('dsogapngay', NGUONG_MAC_DINH.dsoGapNgay),
    tyLeQuaHan: lay('tylequahan', NGUONG_MAC_DINH.tyLeQuaHan),
    ngayQhBq: lay('ngayqhbq', NGUONG_MAC_DINH.ngayQhBq),
    dungHanMuc: lay('dunghanmuc', NGUONG_MAC_DINH.dungHanMuc),
  };
}

function docDapAn(wb: XLSX.WorkBook): Map<string, number> {
  const map = new Map<string, number>();
  const name = findSheet(wb, ['dapan']);
  if (!name) return map;
  const sheet = wb.Sheets[name];
  const header = headerRow(sheet, (cells) => cells.includes('khoa') && (cells.includes('giatri') || cells.includes('giatri')));
  if (!header) return map;
  const iKhoa = colOf(header.cells, ['khoa']);
  const iGt = colOf(header.cells, ['giatri']);
  const ref = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  for (let r = header.row + 1; r <= ref.e.r; r += 1) {
    const khoa = asText(cellRaw(sheet, r, iKhoa));
    if (!khoa) continue;
    map.set(khoa, asNumber(cellRaw(sheet, r, iGt)));
  }
  return map;
}

function docKy(wb: XLSX.WorkBook, cts: ChungTu[]): KyMeta {
  const dates = cts.map((c) => c.ngayBaoCao).filter(Boolean);
  const ngayChot = dates.sort()[0] || '2026-06-30';
  const chungTuDates = cts.map((c) => c.ngayCt).filter((d): d is string => Boolean(d)).sort();
  const tuNgay = chungTuDates[0] || metaMacDinh(ngayChot, ngayChot).tuNgay;
  const macDinh = metaMacDinh(ngayChot, tuNgay);
  const name = wb.SheetNames.find((n) => chuanHoaTieuDe(n) === 'ky');
  if (!name) return macDinh;
  const sheet = wb.Sheets[name];
  const header = headerRow(sheet, (cells) => cells.includes('truong') && cells.includes('giatri'));
  if (!header) return macDinh;
  const iK = colOf(header.cells, ['truong']);
  const iV = colOf(header.cells, ['giatri']);
  const bag = new Map<string, unknown>();
  const ref = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  for (let r = header.row + 1; r <= ref.e.r; r += 1) {
    const k = chuanHoaTieuDe(asText(cellRaw(sheet, r, iK)));
    if (!k) continue;
    bag.set(k, cellRaw(sheet, r, iV));
  }
  const ngay = bag.get('ngaychot');
  const chot = asDate(ngay) ?? macDinh.ngayChot;
  const tu = asDate(bag.get('tungay')) ?? macDinh.tuNgay;
  const den = asDate(bag.get('denngay')) ?? chot;
  const tuanDen = asDate(bag.get('tuanden')) ?? den;
  const tuanTu = asDate(bag.get('tuantu')) ?? macDinh.tuanTu;
  const so = bag.get('songayky');
  return {
    ngayChot: chot,
    tuNgay: tu,
    denNgay: den,
    soNgayKy: so != null && asText(so) !== '' ? asNumber(so) : macDinh.soNgayKy,
    tuanTu,
    tuanDen,
    tuanNhan: asText(bag.get('tuannhan')) || macDinh.tuanNhan,
    keHoachDoanhThuTuan: bag.has('kehoachdoanhthutuan') && asText(bag.get('kehoachdoanhthutuan')) !== '' ? asNumber(bag.get('kehoachdoanhthutuan')) : null,
    keHoachThuTuan: bag.has('kehoachthutuan') && asText(bag.get('kehoachthutuan')) !== '' ? asNumber(bag.get('kehoachthutuan')) : null,
  };
}
