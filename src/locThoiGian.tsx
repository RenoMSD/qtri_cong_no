import { useMemo } from 'react';
import { CalendarRange, RotateCcw, X } from 'lucide-react';
import {
  type ChungTu,
  type KetQua,
  type Khach,
  type KyMeta,
  addDays,
  bucketCua,
  emptyAging,
  tinhSoNgayQH,
  tongHop,
} from './lib/metrics';
import { ngay } from './format';

export type KieuThoiGian = 'tat_ca' | 'thang' | 'quy';

export interface BoLocThoiGian {
  kieu: KieuThoiGian;
  thang: string; // 'ALL' hoặc '2026-01', '2026-02', etc.
  quy: string; // 'ALL' hoặc 'Q1', 'Q2', 'Q3', 'Q4'
  nam: string; // '2026' hoặc năm
}

export const BO_LOC_THOI_GIAN_MAC_DINH: BoLocThoiGian = {
  kieu: 'tat_ca',
  thang: 'ALL',
  quy: 'ALL',
  nam: '2026',
};

/**
 * Trích xuất danh sách tháng, quý, năm có trong dữ liệu sổ
 */
export function layDanhSachThoiGian(ky: KetQua | null) {
  if (!ky) {
    return {
      danhSachThang: [
        { giaTri: '2026-01', nhan: 'Tháng 01/2026' },
        { giaTri: '2026-02', nhan: 'Tháng 02/2026' },
        { giaTri: '2026-03', nhan: 'Tháng 03/2026' },
        { giaTri: '2026-04', nhan: 'Tháng 04/2026' },
        { giaTri: '2026-05', nhan: 'Tháng 05/2026' },
        { giaTri: '2026-06', nhan: 'Tháng 06/2026' },
      ],
      danhSachQuy: [
        { giaTri: 'Q1', nhan: 'Quý 1 (T1 – T3)', thangList: ['01', '02', '03'] },
        { giaTri: 'Q2', nhan: 'Quý 2 (T4 – T6)', thangList: ['04', '05', '06'] },
        { giaTri: 'Q3', nhan: 'Quý 3 (T7 – T9)', thangList: ['07', '08', '09'] },
        { giaTri: 'Q4', nhan: 'Quý 4 (T10 – T12)', thangList: ['10', '11', '12'] },
      ],
      danhSachNam: ['2026'],
      namMacDinh: '2026',
    };
  }

  const setThang = new Set<string>();
  const setNam = new Set<string>();

  for (const kh of ky.khach) {
    for (const ct of kh.chungTu) {
      if (ct.ngayCt) {
        setThang.add(ct.ngayCt.slice(0, 7));
        setNam.add(ct.ngayCt.slice(0, 4));
      }
      if (ct.ngayTT) {
        setThang.add(ct.ngayTT.slice(0, 7));
        setNam.add(ct.ngayTT.slice(0, 4));
      }
    }
  }

  if (ky.meta.ngayChot) {
    setNam.add(ky.meta.ngayChot.slice(0, 4));
    setThang.add(ky.meta.ngayChot.slice(0, 7));
  }
  if (ky.meta.tuNgay) {
    setNam.add(ky.meta.tuNgay.slice(0, 4));
    setThang.add(ky.meta.tuNgay.slice(0, 7));
  }

  const sortedThang = [...setThang].filter((t) => /^\d{4}-\d{2}$/.test(t)).sort();
  const sortedNam = [...setNam].filter((n) => /^\d{4}$/.test(n)).sort().reverse();
  const namMacDinh = sortedNam[0] || '2026';

  const danhSachThang = sortedThang.map((t) => {
    const [y, m] = t.split('-');
    return {
      giaTri: t,
      nhan: `Tháng ${m}/${y}`,
    };
  });

  const danhSachQuy = [
    { giaTri: 'Q1', nhan: 'Quý 1 (T1 – T3)', thangList: ['01', '02', '03'] },
    { giaTri: 'Q2', nhan: 'Quý 2 (T4 – T6)', thangList: ['04', '05', '06'] },
    { giaTri: 'Q3', nhan: 'Quý 3 (T7 – T9)', thangList: ['07', '08', '09'] },
    { giaTri: 'Q4', nhan: 'Quý 4 (T10 – T12)', thangList: ['10', '11', '12'] },
  ];

  return {
    danhSachThang,
    danhSachQuy,
    danhSachNam: sortedNam.length ? sortedNam : ['2026'],
    namMacDinh,
  };
}

/**
 * Tính toán khoảng ngày [tuNgay, denNgay] từ bộ lọc
 */
export function layKhoangThoiGian(loc: BoLocThoiGian, defaultMeta?: KyMeta): {
  tuNgay: string;
  denNgay: string;
  nhan: string;
  laLoc: boolean;
  thangList: string[];
} {
  const nam = loc.nam || '2026';

  if (loc.kieu === 'tat_ca') {
    return {
      tuNgay: defaultMeta?.tuNgay || `${nam}-01-01`,
      denNgay: defaultMeta?.denNgay || `${nam}-12-31`,
      nhan: defaultMeta ? `Toàn kỳ (${ngay(defaultMeta.tuNgay)} – ${ngay(defaultMeta.denNgay)})` : 'Toàn bộ kỳ',
      laLoc: false,
      thangList: [],
    };
  }

  if (loc.kieu === 'thang') {
    if (!loc.thang || loc.thang === 'ALL') {
      return {
        tuNgay: defaultMeta?.tuNgay || `${nam}-01-01`,
        denNgay: defaultMeta?.denNgay || `${nam}-12-31`,
        nhan: 'Mọi tháng',
        laLoc: false,
        thangList: [],
      };
    }

    const [y, m] = loc.thang.split('-');
    const year = parseInt(y, 10);
    const month = parseInt(m, 10);
    const lastDay = new Date(year, month, 0).getDate();
    const tuNgay = `${loc.thang}-01`;
    const denNgay = `${loc.thang}-${String(lastDay).padStart(2, '0')}`;
    return {
      tuNgay,
      denNgay,
      nhan: `Tháng ${m}/${y}`,
      laLoc: true,
      thangList: [loc.thang],
    };
  }

  if (loc.kieu === 'quy') {
    if (!loc.quy || loc.quy === 'ALL') {
      return {
        tuNgay: defaultMeta?.tuNgay || `${nam}-01-01`,
        denNgay: defaultMeta?.denNgay || `${nam}-12-31`,
        nhan: 'Mọi quý',
        laLoc: false,
        thangList: [],
      };
    }

    if (loc.quy === 'Q1') {
      return {
        tuNgay: `${nam}-01-01`,
        denNgay: `${nam}-03-31`,
        nhan: `Quý 1/${nam} (T1–T3)`,
        laLoc: true,
        thangList: [`${nam}-01`, `${nam}-02`, `${nam}-03`],
      };
    }
    if (loc.quy === 'Q2') {
      return {
        tuNgay: `${nam}-04-01`,
        denNgay: `${nam}-06-30`,
        nhan: `Quý 2/${nam} (T4–T6)`,
        laLoc: true,
        thangList: [`${nam}-04`, `${nam}-05`, `${nam}-06`],
      };
    }
    if (loc.quy === 'Q3') {
      return {
        tuNgay: `${nam}-07-01`,
        denNgay: `${nam}-09-30`,
        nhan: `Quý 3/${nam} (T7–T9)`,
        laLoc: true,
        thangList: [`${nam}-07`, `${nam}-08`, `${nam}-09`],
      };
    }
    // Q4
    return {
      tuNgay: `${nam}-10-01`,
      denNgay: `${nam}-12-31`,
      nhan: `Quý 4/${nam} (T10–T12)`,
      laLoc: true,
      thangList: [`${nam}-10`, `${nam}-11`, `${nam}-12`],
    };
  }

  return {
    tuNgay: defaultMeta?.tuNgay || `${nam}-01-01`,
    denNgay: defaultMeta?.denNgay || `${nam}-12-31`,
    nhan: 'Toàn bộ kỳ',
    laLoc: false,
    thangList: [],
  };
}

/**
 * Tính số dư của một chứng từ tại cuối ngày d (đi lùi từ duCuoiKy của sổ)
 */
function duTaiNgay(ct: ChungTu, d: string): number {
  let du = ct.duCuoiKy;
  if (ct.ngayCt && ct.ngayCt > d) {
    du -= ct.tienNo;
  }
  if (ct.ngayTT && ct.ngayTT > d) {
    du += ct.tienTT;
  }
  return du;
}

/**
 * Áp dụng bộ lọc thời gian vào đối tượng KetQua, tái tính toán chỉ số cho toàn bộ khách hàng và biểu đồ
 */
export function apDungBoLocThoiGian(ky: KetQua, loc: BoLocThoiGian): KetQua {
  const khoang = layKhoangThoiGian(loc, ky.meta);
  if (!khoang.laLoc) {
    return ky;
  }

  const { tuNgay, denNgay } = khoang;
  const ngayTruocTuNgay = addDays(tuNgay, -1);

  const danhSachMoi: Khach[] = ky.khach.map((kh) => {
    const filteredCts: ChungTu[] = [];
    const aging = emptyAging();
    let duDauKy = 0;
    let tienNo = 0;
    let tienTT = 0;
    let duNo = 0;
    let quaHan = 0;
    let trongHan = 0;
    let qhWeighted = 0;

    for (const ct of kh.chungTu) {
      const duCuoiCt = duTaiNgay(ct, denNgay);
      const duDauCt = duTaiNgay(ct, ngayTruocTuNgay);
      const tienNoKy = ct.ngayCt && ct.ngayCt >= tuNgay && ct.ngayCt <= denNgay ? ct.tienNo : 0;
      const tienTTKy = ct.ngayTT && ct.ngayTT >= tuNgay && ct.ngayTT <= denNgay ? ct.tienTT : 0;

      // Chỉ bỏ qua chứng từ hoàn toàn không có số dư và không có phát sinh trong kỳ lọc
      if (duCuoiCt === 0 && duDauCt === 0 && tienNoKy === 0 && tienTTKy === 0) {
        continue;
      }

      // Tuổi nợ tính lại bằng tinhSoNgayQH với mốc báo cáo là denNgay, rồi bucketCua
      const soNgayQH = tinhSoNgayQH({
        ngayCt: ct.ngayCt,
        hanTT: ct.hanTT,
        ngayTT: ct.ngayTT && ct.ngayTT <= denNgay ? ct.ngayTT : null,
        ngayBaoCao: denNgay,
        duCuoiKy: duCuoiCt,
      });
      const bucket = bucketCua(soNgayQH, duCuoiCt);

      filteredCts.push({
        ...ct,
        duDauKy: duDauCt,
        tienNo: tienNoKy,
        tienTT: tienTTKy,
        duCuoiKy: duCuoiCt,
        soNgayQH,
        bucket,
      });

      duDauKy += duDauCt;
      tienNo += tienNoKy;
      tienTT += tienTTKy;
      duNo += duCuoiCt;
      aging[bucket] += duCuoiCt;

      // Trong hạn gồm chưa đến hạn, đến hạn và trả trước hạn, kể cả số âm
      if (bucket === 'chuaDenHan' || bucket === 'denHan' || bucket === 'traTruocHan') {
        trongHan += duCuoiCt;
      }
      // Quá hạn chỉ cộng khi số ngày quá hạn > 0 và dư cuối > 0
      if (soNgayQH > 0 && duCuoiCt > 0) {
        quaHan += duCuoiCt;
        qhWeighted += soNgayQH * duCuoiCt;
      }
    }

    const le90 = aging.d0_30 + aging.d31_60 + aging.d61_90;
    const d91_180 = aging.d91_120 + aging.d121_150 + aging.d151_180;
    const gt180 = aging.d181_365 + aging.d365;
    const trongSo = 0.5 * le90 + 0.8 * d91_180 + gt180;
    const ratCao = quaHan > 0 && gt180 / quaHan >= 0.5;

    return {
      ...kh,
      duDauKy,
      tienNo,
      tienTT,
      duNo,
      trongHan,
      denHan: aging.denHan,
      chuaDenHan: aging.chuaDenHan,
      quaHan,
      ngayQhBq: quaHan > 0 ? Math.round(qhWeighted / quaHan) : null,
      aging,
      chungTu: filteredCts,
      le90,
      d91_180,
      gt180,
      trongSo,
      ratCao,
      // Mỗi khách giữ nguyên noKhoDoi, doanhSo, dso365, dsoGap, diem, hang, thanhPhan, hmtd:
      noKhoDoi: kh.noKhoDoi,
      doanhSo: kh.doanhSo,
      dso365: kh.dso365,
      dsoGap: kh.dsoGap,
      diem: kh.diem,
      hang: kh.hang,
      thanhPhan: kh.thanhPhan,
      hmtd: kh.hmtd,
    };
  });

  // soNgayKy đưa vào tongHop vẫn là số ngày của sổ gốc, không phải 30 hay 90 ngày của cửa sổ:
  const tongMoi = tongHop(danhSachMoi, ky.meta.soNgayKy);

  // Sau tongHop, gán lại tong.noKhoDoi, tong.soKhachNoKhoDoi và tong.dsoKy từ sổ gốc:
  tongMoi.noKhoDoi = ky.tong.noKhoDoi;
  tongMoi.soKhachNoKhoDoi = ky.tong.soKhachNoKhoDoi;
  tongMoi.dsoKy = ky.tong.dsoKy;

  // Tuần thu hồi giữ nguyên: Không ghi đè tuanTu, tuanDen, tuanNhan. tuan của sổ gốc giữ nguyên:
  const metaMoi: KyMeta = {
    ...ky.meta,
    tuNgay,
    denNgay,
    ngayChot: denNgay,
  };

  return {
    ...ky,
    meta: metaMoi,
    khach: danhSachMoi,
    tong: tongMoi,
    tuan: ky.tuan,
  };
}

/**
 * Giao diện Thanh Bộ lọc Thời gian (Tháng / Quý) cho Header
 */
export function BoLocThoiGianBar({
  ky,
  locThoiGian,
  setLocThoiGian,
  compact = false,
}: {
  ky: KetQua | null;
  locThoiGian: BoLocThoiGian;
  setLocThoiGian: (next: BoLocThoiGian) => void;
  compact?: boolean;
}) {
  const { danhSachThang, danhSachQuy, danhSachNam } = useMemo(
    () => layDanhSachThoiGian(ky),
    [ky]
  );

  const khoang = useMemo(
    () => layKhoangThoiGian(locThoiGian, ky?.meta),
    [locThoiGian, ky?.meta]
  );

  function resetLoc() {
    setLocThoiGian(BO_LOC_THOI_GIAN_MAC_DINH);
  }

  // Variant dành cho mobile hẹp
  if (compact) {
    return (
      <div className="flex flex-col gap-1.5 p-2 bg-background border-b border-line text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[12px] text-subtle">
            <CalendarRange className="h-3.5 w-3.5 text-primary" />
            <span>Kỳ xem báo cáo</span>
          </div>
          {khoang.laLoc && (
            <button
              type="button"
              onClick={resetLoc}
              className="text-[10.5px] text-primary hover:underline flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1 bg-line/70 p-0.5 rounded-lg text-center">
          <button
            type="button"
            className={`py-1 rounded-md text-[11px] transition ${
              locThoiGian.kieu === 'tat_ca'
                ? 'bg-white text-primary shadow-xs'
                : 'text-subtle hover:text-foreground'
            }`}
            onClick={() => setLocThoiGian({ ...locThoiGian, kieu: 'tat_ca' })}
          >
            Tất cả kỳ
          </button>
          <button
            type="button"
            className={`py-1 rounded-md text-[11px] transition ${
              locThoiGian.kieu === 'thang'
                ? 'bg-white text-primary shadow-xs'
                : 'text-subtle hover:text-foreground'
            }`}
            onClick={() => {
              setLocThoiGian({ ...locThoiGian, kieu: 'thang', thang: 'ALL' });
            }}
          >
            Theo Tháng
          </button>
          <button
            type="button"
            className={`py-1 rounded-md text-[11px] transition ${
              locThoiGian.kieu === 'quy'
                ? 'bg-white text-primary shadow-xs'
                : 'text-subtle hover:text-foreground'
            }`}
            onClick={() => {
              setLocThoiGian({ ...locThoiGian, kieu: 'quy', quy: 'ALL' });
            }}
          >
            Theo Quý
          </button>
        </div>

        {locThoiGian.kieu === 'thang' && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <select
              className="flex-1 rounded-lg border border-line bg-white px-2 py-1 text-xs text-foreground shadow-xs focus:border-primary focus:outline-hidden"
              value={locThoiGian.thang}
              onChange={(e) => setLocThoiGian({ ...locThoiGian, thang: e.target.value })}
            >
              <option value="ALL">Mọi tháng</option>
              {danhSachThang.map((t) => (
                <option key={t.giaTri} value={t.giaTri}>
                  {t.nhan}
                </option>
              ))}
            </select>
          </div>
        )}

        {locThoiGian.kieu === 'quy' && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <select
              className="flex-1 rounded-lg border border-line bg-white px-2 py-1 text-xs text-foreground shadow-xs focus:border-primary focus:outline-hidden"
              value={locThoiGian.quy}
              onChange={(e) => setLocThoiGian({ ...locThoiGian, quy: e.target.value })}
            >
              <option value="ALL">Mọi quý</option>
              {danhSachQuy.map((q) => (
                <option key={q.giaTri} value={q.giaTri}>
                  {q.nhan}
                </option>
              ))}
            </select>
            {danhSachNam.length > 1 && (
              <select
                className="w-20 rounded-lg border border-line bg-white px-2 py-1 text-xs text-foreground shadow-xs focus:border-primary focus:outline-hidden"
                value={locThoiGian.nam}
                onChange={(e) => setLocThoiGian({ ...locThoiGian, nam: e.target.value })}
              >
                {danhSachNam.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
    );
  }

  // Variant chuẩn trên Desktop Header
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Container nhóm nút thời gian */}
      <div
        className={`flex items-center rounded-lg border p-0.5 text-xs transition shadow-2xs ${
          khoang.laLoc
            ? 'border-primary-glow bg-sky-50/70 ring-2 ring-primary-soft'
            : 'border-line bg-line-soft/90'
        }`}
      >
        <div className="flex items-center gap-1 px-2 py-1 text-muted">
          <CalendarRange
            className={`h-3.5 w-3.5 ${khoang.laLoc ? 'text-primary' : 'text-muted'}`}
          />
          <span className="hidden xl:inline text-[11px] text-subtle">
            Kỳ xem:
          </span>
        </div>

        {/* Chuyển kiểu: Tất cả | Tháng | Quý */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={`cursor-pointer px-2.5 py-1 rounded-md text-[12px] transition ${
              locThoiGian.kieu === 'tat_ca'
                ? 'bg-white text-primary shadow-xs'
                : 'text-subtle hover:text-foreground hover:bg-line/50'
            }`}
            onClick={() => setLocThoiGian({ ...locThoiGian, kieu: 'tat_ca' })}
            title="Xem toàn bộ số liệu của kỳ nạp"
          >
            Tất cả
          </button>
          <button
            type="button"
            className={`cursor-pointer px-2.5 py-1 rounded-md text-[12px] transition ${
              locThoiGian.kieu === 'thang'
                ? 'bg-white text-primary shadow-xs'
                : 'text-subtle hover:text-foreground hover:bg-line/50'
            }`}
            onClick={() => {
              setLocThoiGian({ ...locThoiGian, kieu: 'thang', thang: 'ALL' });
            }}
            title="Lọc biểu đồ theo từng Tháng cụ thể"
          >
            Theo Tháng
          </button>
          <button
            type="button"
            className={`cursor-pointer px-2.5 py-1 rounded-md text-[12px] transition ${
              locThoiGian.kieu === 'quy'
                ? 'bg-white text-primary shadow-xs'
                : 'text-subtle hover:text-foreground hover:bg-line/50'
            }`}
            onClick={() => {
              setLocThoiGian({ ...locThoiGian, kieu: 'quy', quy: 'ALL' });
            }}
            title="Lọc biểu đồ theo từng Quý (Q1 - Q4)"
          >
            Theo Quý
          </button>
        </div>

        {/* Dropdown chọn Tháng cụ thể khi ở chế độ Theo Tháng */}
        {locThoiGian.kieu === 'thang' && (
          <div className="flex items-center pl-1 border-l border-line ml-1">
            <select
              className="cursor-pointer rounded-md bg-white border border-line/80 px-2 py-0.5 text-xs text-foreground shadow-2xs hover:border-line focus:outline-hidden focus:ring-1 focus:ring-primary"
              value={locThoiGian.thang}
              onChange={(e) =>
                setLocThoiGian({ ...locThoiGian, thang: e.target.value })
              }
            >
              <option value="ALL">Mọi tháng</option>
              {danhSachThang.map((t) => (
                <option key={t.giaTri} value={t.giaTri}>
                  {t.nhan}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dropdown chọn Quý cụ thể khi ở chế độ Theo Quý */}
        {locThoiGian.kieu === 'quy' && (
          <div className="flex items-center pl-1 border-l border-line ml-1 gap-1">
            <select
              className="cursor-pointer rounded-md bg-white border border-line/80 px-2 py-0.5 text-xs text-foreground shadow-2xs hover:border-line focus:outline-hidden focus:ring-1 focus:ring-primary"
              value={locThoiGian.quy}
              onChange={(e) =>
                setLocThoiGian({ ...locThoiGian, quy: e.target.value })
              }
            >
              <option value="ALL">Mọi quý</option>
              {danhSachQuy.map((q) => (
                <option key={q.giaTri} value={q.giaTri}>
                  {q.nhan}
                </option>
              ))}
            </select>

            {danhSachNam.length > 1 && (
              <select
                className="cursor-pointer rounded-md bg-white border border-line/80 px-1.5 py-0.5 text-xs text-subtle shadow-2xs focus:outline-hidden"
                value={locThoiGian.nam}
                onChange={(e) =>
                  setLocThoiGian({ ...locThoiGian, nam: e.target.value })
                }
              >
                {danhSachNam.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Badge hiển thị trạng thái lọc & nút xóa bộ lọc */}
      {khoang.laLoc && (
        <div className="flex items-center gap-1 rounded-lg bg-sky-100/80 border border-primary-glow px-2 py-1 text-xs text-primary-dark shadow-2xs">
          <span className="text-primary">Áp dụng:</span>
          <span>{khoang.nhan}</span>
          <button
            type="button"
            className="cursor-pointer ml-1 p-0.5 rounded-full hover:bg-sky-200 text-primary transition"
            onClick={resetLoc}
            title="Xóa bộ lọc thời gian, xem toàn bộ dữ liệu"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
