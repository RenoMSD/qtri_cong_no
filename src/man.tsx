import { useState, useEffect } from 'react';
import {
  UploadCloud,
  CreditCard,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ChevronRight,
  FileText,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  BUCKET_KEYS,
  BUCKET_LABEL,
  topRuiRo,
  type BucketKey,
  type KetQua,
} from './lib/metrics';
import { parseArrayBuffer } from './lib/parseWorkbook';
import { ngay, pct, so1, soLinh, ty } from './format';
import { ChuaSo, LocBar, tenMan, type ManId } from './khung';
import { CHU_TEST, soBoTest } from './boTest';
import { DanhSachKeHoachMua, Khoi } from './khoi';
import type { BoLocThoiGian } from './locThoiGian';
import { layKhoangThoiGian } from './locThoiGian';
import { bonNhomCanhBao, soKhoi, tenKhach, type Chon, type Loc, type NhomCanhBaoId, type Tay } from './soLieu';
import { taiXuong, xuatBaoCao } from './pdf';

const MAU_BUCKET: Record<BucketKey, string> = {
  chuaDenHan: '#0284c7', // Xanh da trời (an toàn)
  traTruocHan: '#0d9488', // Xanh mòng két (tốt)
  denHan: '#10b981', // Xanh lục (đến hạn)
  d0_30: '#84cc16', // Xanh non (0-30d)
  d31_60: '#eab308', // Vàng hổ phách (31-60d)
  d61_90: '#f97316', // Cam (61-90d)
  d91_120: '#f43f5e', // Đỏ hồng (91-120d)
  d121_150: '#ef4444', // Đỏ tươi (121-150d)
  d151_180: '#dc2626', // Đỏ sẫm (151-180d)
  d181_365: '#b91c1c', // Đỏ đậm (181-365d)
  d365: '#881337', // Đỏ rượu vang (>365d)
};

function Tieu({ tieu, phu }: { tieu: string; phu?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-semibold">{tieu}</h2>
      {phu ? <p className="text-sm text-slate-500">{phu}</p> : null}
    </div>
  );
}

export function ManAr({
  tab,
  setTab,
  chonKy,
  chonLoc,
  loc,
  setLoc,
  sales,
  suaTay,
}: {
  tab: 'tuan' | 'tc1' | 'tc2';
  setTab: (t: 'tuan' | 'tc1' | 'tc2') => void;
  chonKy: Chon;
  chonLoc: Chon;
  loc: Loc;
  setLoc: (l: Loc) => void;
  sales: string[];
  suaTay: (t: Tay) => void;
}) {
  const ky = chonKy.ky;
  const tuan = `${ky.meta.tuanNhan} · ${ngay(ky.meta.tuanTu)} – ${ngay(ky.meta.tuanDen)}`;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tieu tieu="AR Dashboard" phu={tab === 'tuan' ? tuan : `Chốt ${ngay(ky.meta.ngayChot)} · ${ky.nhanDiem}`} />
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
          {(['tuan', 'tc1', 'tc2'] as const).map((t) => (
            <button key={t} type="button" className={`rounded-md px-3 py-1 ${tab === t ? 'bg-white font-medium text-[#0073E6]' : 'text-slate-600'}`} onClick={() => setTab(t)}>
              {t === 'tuan' ? 'Tuần' : t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <LocBar sales={sales} loc={loc} setLoc={setLoc} />
      {tab === 'tuan' ? (
        <>
          <Khoi so={soKhoi('tuan-kpi', chonKy)} />
          <div className="grid gap-4 xl:grid-cols-2">
            <Khoi so={soKhoi('tuan-tuoi', chonLoc)} />
            <Khoi so={soKhoi('tuan-phat-sinh', chonLoc)} />
            <Khoi so={soKhoi('tuan-qh-thang', chonLoc)} />
            <Khoi so={soKhoi('tuan-luy-ke', chonLoc)} />
          </div>
          <Khoi so={soKhoi('tuan-sale', chonLoc)} onThe={(sale) => setLoc({ ...loc, sale: sale || 'ALL' })} />
          <div className="grid gap-4 md:grid-cols-2">
            <Khoi so={soKhoi('tuan-nay', chonKy)} onChu={(van) => suaTay({ ...chonKy.tay, tuanNay: van })} />
            <Khoi so={soKhoi('tuan-sau', chonKy)} onChu={(van) => suaTay({ ...chonKy.tay, tuanSau: van })} />
          </div>
        </>
      ) : null}
      {tab === 'tc1' ? (
        <>
          <Khoi so={soKhoi('tc1-kpi', chonKy)} />
          <Khoi so={soKhoi('tc1-co-cau', chonLoc)} />
          <Khoi so={soKhoi('tc1-sale', chonLoc)} onThe={(sale) => setLoc({ ...loc, sale: sale || 'ALL' })} />
          <Khoi so={soKhoi('tc1-hm', chonKy)} />
          <Khoi so={soKhoi('tc1-rui-ro', chonLoc)} />
          <Khoi so={soKhoi('tc1-de-xuat', chonKy)} />
        </>
      ) : null}
      {tab === 'tc2' ? (
        <>
          <p className="text-sm text-slate-500">Các thẻ lấy từ chỉ tiêu kỳ. Không có điểm công ty dạng x/5.</p>
          <div className="grid gap-4 md:grid-cols-2">
            {['TC-2.1a', 'TC-2.1b', 'TC-2.2a', 'TC-2.2b', 'TC-2.3', 'TC-2.4', 'TC-2.5'].map((ma) => (
              <Khoi key={ma} so={soKhoi(`tc2:${ma}`, chonKy)} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ManKhach({
  chonLoc,
  loc,
  setLoc,
  sales,
  moHoSo,
  suaTay,
}: {
  chonLoc: Chon;
  loc: Loc;
  setLoc: (l: Loc) => void;
  sales: string[];
  moHoSo: (ma: string) => void;
  suaTay: (t: Tay) => void;
}) {
  const [maMoi, setMaMoi] = useState('');
  const [tenMoi, setTenMoi] = useState('');
  return (
    <div className="space-y-4">
      <Tieu tieu="Khách hàng" phu="Bấm mã để mở một hồ sơ. Khách thêm tay không cộng vào tổng dư nợ." />
      <LocBar sales={sales} loc={loc} setLoc={setLoc} />
      <Khoi so={soKhoi('tuan-bang', chonLoc)} onMa={moHoSo} />
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold">Thêm tay</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <input className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" placeholder="Mã" value={maMoi} onChange={(e) => setMaMoi(e.target.value)} />
          <input className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" placeholder="Tên" value={tenMoi} onChange={(e) => setTenMoi(e.target.value)} />
          <button
            type="button"
            className="rounded-lg bg-[#0073E6] px-3 py-1.5 text-sm text-white"
            onClick={() => {
              const maKH = maMoi.trim();
              if (!maKH) return;
              suaTay({ ...chonLoc.tay, them: [...chonLoc.tay.them.filter((t) => t.maKH !== maKH), { maKH, ten: tenMoi.trim() }] });
              setMaMoi('');
              setTenMoi('');
            }}
          >
            Thêm
          </button>
        </div>
        <ul className="mt-3 text-sm text-slate-600">
          {chonLoc.tay.them.length === 0 ? <li>Chưa thêm mã nào.</li> : null}
          {chonLoc.tay.them.map((t) => (
            <li key={t.maKH}>{t.maKH} · {t.ten || 'Chưa đặt tên'} · dư nợ 0</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function ManHoSo({ chon, suaTay }: { chon: Chon; suaTay: (t: Tay) => void }) {
  const ma = chon.ma;
  const [dong, setDong] = useState('');
  if (!ma) return <p className="text-sm text-slate-500">Chọn một khách từ danh sách.</p>;
  const tay = chon.tay;
  return (
    <div className="space-y-4">
      <Tieu tieu={`${ma.maKH} · ${tenKhach(ma, tay)}`} phu={chon.ky.nhanDiem} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Khoi so={soKhoi('hs-diem', chon)} />
        <Khoi so={soKhoi('hs-hm', chon)} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Khoi so={soKhoi('hs-tp', chon)} />
        <Khoi so={soKhoi('hs-tron', chon)} />
        <Khoi so={soKhoi('hs-tuoi', chon)} />
        <Khoi so={soKhoi('hs-qh', chon)} />
        <Khoi so={soKhoi('hs-luyke', chon)} />
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold">Nhật ký thu hồi</h3>
        <div className="mt-2 flex gap-2">
          <input className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={dong} placeholder="Nội dung lần liên hệ" onChange={(e) => setDong(e.target.value)} />
          <button
            type="button"
            className="rounded-lg bg-[#0073E6] px-3 py-1.5 text-sm text-white"
            onClick={() => {
              const van = dong.trim();
              if (!van) return;
              const cu = tay.nhatKy[ma.maKH] ?? [];
              suaTay({ ...tay, nhatKy: { ...tay.nhatKy, [ma.maKH]: [...cu, van] } });
              setDong('');
            }}
          >
            Ghi
          </button>
        </div>
        <Khoi so={soKhoi('hs-nhat', { ...chon, tay })} />
      </section>
      <Khoi so={soKhoi('hs-hd', chon)} />
      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
        <label className="text-sm">
          Tên ghi tay
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5" value={tay.ten[ma.maKH] ?? ''} placeholder={ma.tenKH || 'Chưa có tên trong sổ'} onChange={(e) => suaTay({ ...tay, ten: { ...tay.ten, [ma.maKH]: e.target.value } })} />
        </label>
        <label className="text-sm">
          Kế hoạch tuần sau
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5" value={tay.keHoach[ma.maKH] ?? ''} onChange={(e) => suaTay({ ...tay, keHoach: { ...tay.keHoach, [ma.maKH]: e.target.value } })} />
        </label>
        <label className="text-sm md:col-span-2">
          Ghi chú
          <textarea className="mt-1 min-h-16 w-full rounded-lg border border-slate-200 px-2 py-1.5" value={tay.ghi[ma.maKH] ?? ''} onChange={(e) => suaTay({ ...tay, ghi: { ...tay.ghi, [ma.maKH]: e.target.value } })} />
        </label>
      </section>
    </div>
  );
}

export function ManBieu({
  tieu,
  ids,
  chon,
  loc,
  setLoc,
  sales,
  onMa,
}: {
  tieu: string;
  ids: string[];
  chon: Chon;
  loc: Loc;
  setLoc: (l: Loc) => void;
  sales: string[];
  onMa?: (ma: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Tieu tieu={tieu} phu={`Chốt ${ngay(chon.ky.meta.ngayChot)}`} />
      <LocBar sales={sales} loc={loc} setLoc={setLoc} />
      {ids.map((id) => (
        <Khoi key={id} so={soKhoi(id, chon)} onMa={onMa} />
      ))}
    </div>
  );
}

export function ManKeHoach({ chon, suaTay }: { chon: Chon; suaTay: (t: Tay) => void }) {
  return (
    <div className="space-y-4">
      <Tieu tieu="Kế hoạch tuần và dự báo thu" phu="Cột doanh thu dự kiến để trống vì sổ không có công thức đó. Kế hoạch là chữ tự nhập." />
      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2">Mã</th>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2">Dư nợ</th>
              <th className="px-3 py-2">Kế hoạch tuần sau</th>
              <th className="px-3 py-2">Doanh thu dự kiến</th>
            </tr>
          </thead>
          <tbody>
            {chon.list.map((k) => (
              <tr key={k.maKH} className="border-t border-slate-100">
                <td className="px-3 py-2">{k.maKH}</td>
                <td className="px-3 py-2">{tenKhach(k, chon.tay)}</td>
                <td className="so px-3 py-2">{ty(k.duNo)}</td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1"
                    value={chon.tay.keHoach[k.maKH] ?? ''}
                    onChange={(e) => suaTay({ ...chon.tay, keHoach: { ...chon.tay.keHoach, [k.maKH]: e.target.value } })}
                  />
                </td>
                <td className="px-3 py-2 text-slate-400">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ManCanhBao({
  chon,
  moHoSo,
  nhomChonBanDau,
}: {
  chon: Chon;
  moHoSo: (ma: string) => void;
  nhomChonBanDau?: NhomCanhBaoId | null;
}) {
  const nhom = bonNhomCanhBao(chon.list, chon.tay);
  const [nhomXem, setNhomXem] = useState<NhomCanhBaoId | 'all'>(nhomChonBanDau ?? 'all');

  useEffect(() => {
    if (nhomChonBanDau) {
      setNhomXem(nhomChonBanDau);
    }
  }, [nhomChonBanDau]);

  const hienThiNhom = nhomXem === 'all' ? nhom : nhom.filter((n) => n.id === nhomXem);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tieu tieu="Cảnh báo AR" phu="Bốn nhóm rủi ro: Vượt hạn mức, Chưa có hạn mức, Nợ xấu, Quá hạn trên 365 ngày." />
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium transition ${nhomXem === 'all' ? 'bg-[#0073E6] text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
            onClick={() => setNhomXem('all')}
          >
            Tất cả 4 nhóm
          </button>
        </div>
      </div>

      {/* 4 thẻ cảnh báo đầu trang để nhảy tới nhóm */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {nhom.map((n) => {
          const active = nhomXem === n.id;
          return (
            <button
              key={n.id}
              type="button"
              className={`cursor-pointer rounded-xl border p-4 text-left transition ${active ? 'border-[#0073E6] bg-blue-50/40 ring-2 ring-[#0073E6]/20' : 'border-slate-200 bg-white hover:border-[#0073E6]'}`}
              onClick={() => setNhomXem(active ? 'all' : n.id)}
            >
              <div className="text-sm font-semibold text-slate-800">{n.ten}</div>
              <div className="mt-2 text-xs text-slate-500">{n.soKhach} khách</div>
              <div className="so mt-1 text-base font-semibold text-[#0073E6]">
                {n.id === 'vuot-hm' ? `Vượt ${ty(n.tongTien)}` : ty(n.tongTien)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Danh sách từng nhóm */}
      <div className="space-y-6">
        {hienThiNhom.map((n) => (
          <section key={n.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-base font-semibold text-slate-800">
                {n.ten} <span className="ml-1 text-sm font-normal text-slate-500">({n.soKhach} khách · {n.id === 'vuot-hm' ? 'Tổng vượt' : 'Tổng tiền'} {ty(n.tongTien)})</span>
              </h3>
            </div>
            {n.danhSach.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">Không có khách thuộc nhóm này.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Mã KH</th>
                      <th className="px-3 py-2">Tên khách</th>
                      <th className="px-3 py-2">Sale</th>
                      <th className="px-3 py-2">Số tiền</th>
                      <th className="px-3 py-2">Hạng</th>
                      <th className="px-3 py-2">Điểm</th>
                      <th className="px-3 py-2">Chi tiết lý do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {n.danhSach.map((k) => (
                      <tr key={`${n.id}-${k.maKH}`} className="border-t border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-medium">
                          <button
                            type="button"
                            className="cursor-pointer font-semibold text-[#0073E6] hover:underline"
                            onClick={() => moHoSo(k.maKH)}
                          >
                            {k.maKH}
                          </button>
                        </td>
                        <td className="px-3 py-2">{k.tenKH}</td>
                        <td className="px-3 py-2 text-slate-600">{k.sale}</td>
                        <td className="so px-3 py-2 font-semibold text-slate-900">{ty(k.tien)}</td>
                        <td className="px-3 py-2">{k.hang}</td>
                        <td className="so px-3 py-2">{k.diem != null ? so1(k.diem) : '—'}</td>
                        <td className="px-3 py-2 text-slate-600">{k.ly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export function ManTong({
  chon,
  boLoc,
  onMoCanhBao,
  onMa,
}: {
  chon: Chon | null;
  boLoc?: BoLocThoiGian;
  onMoCanhBao?: (id: NhomCanhBaoId) => void;
  onMa?: (ma: string) => void;
}) {
  const [dangXuatBgd, setDangXuatBgd] = useState(false);
  const [loiXuat, setLoiXuat] = useState('');
  const [kieuBieuDo, setKieuBieuDo] = useState<'tron' | 'cot'>('tron');
  const [cheDoXemCot, setCheDoXemCot] = useState<'co_so' | 'tat_ca'>('co_so');

  const khoang = boLoc ? layKhoangThoiGian(boLoc, chon?.ky.meta) : null;

  async function handleXuatBgd() {
    if (!chon || dangXuatBgd) return;
    setDangXuatBgd(true);
    setLoiXuat('');
    try {
      const { bytes, tenFile } = await xuatBaoCao({
        loai: 'bgd',
        ids: ['tq-bgd', 'tq-tuoi-pct', 'tq-canh-bao', 'tq-top'],
        phamVi: 'toan-bo',
        kho: 'A4_NGANG',
        chon,
      });
      taiXuong(bytes, tenFile);
    } catch (e) {
      setLoiXuat(e instanceof Error ? e.message : 'Không xuất được PDF.');
    } finally {
      setDangXuatBgd(false);
    }
  }

  const tong = chon?.tong;
  const nhomCanhBao = chon ? bonNhomCanhBao(chon.list, chon.tay) : [];
  const topKhach = chon ? topRuiRo(chon.list, 10) : [];

  const duLieuTuoiDuong = tong
    ? BUCKET_KEYS.filter((k) => tong.aging[k] > 0).map((k) => ({
        k,
        n: BUCKET_LABEL[k],
        v: tong.aging[k],
      }))
    : [];

  const duLieuTuoiTatCa = tong
    ? BUCKET_KEYS.map((k) => ({
        k,
        n: BUCKET_LABEL[k],
        v: tong.aging[k] || 0,
      }))
    : [];

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* 1. Header: Tiêu đề Tổng quan điều hành & Tín dụng + Nút Báo cáo BGĐ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Tổng quan Điều hành & Tín dụng</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>
              Bức tranh tổng thể về tình hình công nợ, tín dụng và rủi ro danh mục khách hàng · Chốt {chon ? ngay(chon.ky.meta.ngayChot) : '—'}
            </span>
            {khoang?.laLoc && (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 font-semibold text-[#0073E6] border border-sky-200">
                Áp dụng kỳ: {khoang.nhan}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {chon ? (
            <span className="hidden sm:inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              Nguồn điểm: <span className="font-medium text-slate-800">{chon.ky.nhanDiem}</span>
            </span>
          ) : null}
          <button
            type="button"
            disabled={!chon || dangXuatBgd}
            className="cursor-pointer rounded-lg bg-[#0073E6] px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 shadow-xs flex items-center gap-1.5"
            onClick={handleXuatBgd}
          >
            <FileText className="h-4 w-4" />
            {dangXuatBgd ? 'Đang xuất…' : 'Báo cáo BGĐ'}
          </button>
        </div>
      </div>
      {loiXuat ? <p className="text-sm text-red-600">{loiXuat}</p> : null}

      {chon && tong ? (
        <>
          {/* 2. Bốn ô KPI: Dư nợ, Quá hạn kèm %, DSO kỳ, Nợ xấu kèm số khách */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {/* Card 1: Tổng dư nợ */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Tổng dư nợ phải thu</span>
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-[#0073E6] flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="so text-2xl font-bold tracking-tight text-slate-900">{ty(tong.duNo)}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="text-emerald-600 font-medium">Trong hạn:</span>
                  <span className="so">{ty(tong.trongHan)} ({pct(tong.duNo > 0 ? tong.trongHan / tong.duNo : 0)})</span>
                </div>
              </div>
            </div>

            {/* Card 2: Công nợ quá hạn */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Công nợ quá hạn</span>
                <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="so text-2xl font-bold tracking-tight text-rose-600">{ty(tong.quaHan)}</div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tỷ lệ quá hạn:</span>
                  <span className="rounded bg-rose-50 px-2 py-0.5 font-semibold text-rose-700">
                    {pct(tong.duNo > 0 ? tong.quaHan / tong.duNo : 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: DSO kỳ */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">DSO kỳ đánh giá</span>
                <div className="h-9 w-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="so text-2xl font-bold tracking-tight text-slate-900">
                  {tong.dsoKy != null ? `${so1(tong.dsoKy)} ngày` : '—'}
                </div>
                <div className="mt-1 text-xs text-slate-500">Thời gian thu tiền bình quân kỳ</div>
              </div>
            </div>

            {/* Card 4: Nợ xấu */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Nợ xấu (nợ khó đòi)</span>
                <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="so text-2xl font-bold tracking-tight text-slate-900">{ty(tong.noKhoDoi)}</div>
                <div className="mt-1 text-xs">
                  <span className="rounded bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                    {tong.soKhachNoKhoDoi} khách hàng
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 & 4. Mid Row: Cột trái Cơ cấu tuổi nợ (Donut/Bar) & Cột phải Bốn cảnh báo rủi ro */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Cột trái: Cơ cấu tuổi nợ */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Cơ cấu tuổi nợ</h3>
                  <p className="text-xs text-slate-500">Tỷ trọng các nhóm trên tổng dư nợ {ty(tong.duNo)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {kieuBieuDo === 'cot' && (
                    <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs mr-1">
                      <button
                        type="button"
                        className={`cursor-pointer px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                          cheDoXemCot === 'co_so' ? 'bg-white text-[#0073E6] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        onClick={() => setCheDoXemCot('co_so')}
                      >
                        Có dư nợ ({duLieuTuoiDuong.length})
                      </button>
                      <button
                        type="button"
                        className={`cursor-pointer px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                          cheDoXemCot === 'tat_ca' ? 'bg-white text-[#0073E6] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        onClick={() => setCheDoXemCot('tat_ca')}
                      >
                        Tất cả ({duLieuTuoiTatCa.length})
                      </button>
                    </div>
                  )}
                  <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs">
                    <button
                      type="button"
                      className={`cursor-pointer px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                        kieuBieuDo === 'tron' ? 'bg-white text-[#0073E6] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      onClick={() => setKieuBieuDo('tron')}
                    >
                      <PieIcon className="h-3.5 w-3.5" />
                      Biểu đồ tròn
                    </button>
                    <button
                      type="button"
                      className={`cursor-pointer px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                        kieuBieuDo === 'cot' ? 'bg-white text-[#0073E6] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      onClick={() => setKieuBieuDo('cot')}
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      Biểu đồ cột
                    </button>
                  </div>
                </div>
              </div>

              {kieuBieuDo === 'tron' ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-3 flex-1 min-h-[240px]">
                  {/* Donut Chart with center label */}
                  <div className="md:col-span-5 h-56 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={duLieuTuoiDuong}
                          dataKey="v"
                          nameKey="n"
                          innerRadius={55}
                          outerRadius={78}
                          paddingAngle={2}
                          isAnimationActive={false}
                        >
                          {duLieuTuoiDuong.map((d) => (
                            <Cell key={d.k} fill={MAU_BUCKET[d.k] || '#0073E6'} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload as { n: string; v: number; k: BucketKey };
                            const phanTram = tong.duNo > 0 ? (d.v / tong.duNo) * 100 : 0;
                            return (
                              <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-md">
                                <div className="font-semibold text-slate-800">{d.n}</div>
                                <div className="so mt-1 text-[#0073E6] font-bold">
                                  {ty(d.v)} ({phanTram.toFixed(1)}%)
                                </div>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="so text-base font-bold text-slate-900">{ty(tong.duNo)}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Tổng dư nợ</span>
                    </div>
                  </div>

                  {/* Legend breakdown table/list */}
                  <div className="md:col-span-7 max-h-56 overflow-y-auto pr-1 space-y-1.5 text-xs">
                    {duLieuTuoiDuong.map((d) => {
                      const phanTram = tong.duNo > 0 ? (d.v / tong.duNo) * 100 : 0;
                      return (
                        <div key={d.k} className="flex items-center justify-between gap-2 py-1 border-b border-slate-50 last:border-none">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: MAU_BUCKET[d.k] || '#0073E6' }} />
                            <span className="text-slate-700 truncate">{d.n}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="so font-medium text-slate-500 w-12 text-right">{phanTram.toFixed(1)}%</span>
                            <span className="so font-semibold text-slate-900 w-16 text-right">{ty(d.v)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                (() => {
                  const duLieuCot = cheDoXemCot === 'co_so' ? duLieuTuoiDuong : duLieuTuoiTatCa;
                  return (
                    <div className="w-full min-w-0 h-[280px] pt-3 flex flex-col justify-end">
                      <ResponsiveContainer width="100%" height={260} minWidth={0}>
                        <BarChart
                          data={duLieuCot}
                          margin={{ top: 24, right: 16, left: 4, bottom: cheDoXemCot === 'co_so' ? 26 : 48 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis
                            dataKey="n"
                            interval={0}
                            angle={-25}
                            textAnchor="end"
                            height={cheDoXemCot === 'co_so' ? 44 : 58}
                            tick={{ fontSize: 9.5, fill: '#475569' }}
                            tickMargin={4}
                          />
                          <YAxis
                            tickFormatter={(v) => (v === 0 ? '0' : (v / 1e9).toFixed(1))}
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            width={50}
                            unit=" tỷ"
                            domain={[0, (dataMax: number) => Math.max(1e9, Math.ceil(dataMax * 1.25))]}
                          />
                          <Tooltip
                            cursor={{ fill: 'rgba(0, 115, 230, 0.05)' }}
                            content={({ active, payload }) => {
                              if (!active || !payload?.length || !payload[0]?.payload) return null;
                              const d = payload[0].payload as { n: string; v: number; k: BucketKey };
                              if (!d || typeof d.v !== 'number') return null;
                              const phanTram = tong.duNo > 0 ? (d.v / tong.duNo) * 100 : 0;
                              return (
                                <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-md">
                                  <div className="font-semibold text-slate-800">{d.n}</div>
                                  <div className="so mt-0.5 text-[#0073E6] font-bold">
                                    {ty(d.v)} ({phanTram.toFixed(1)}%)
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Bar dataKey="v" name="Số tiền" radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false}>
                            {duLieuCot.map((d) => (
                              <Cell key={d.k} fill={MAU_BUCKET[d.k] || '#0073E6'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      {/* Chú thích màu sắc */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 border-t border-slate-100 text-xs">
                        {duLieuCot.map((d) => (
                          <div key={d.k} className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: MAU_BUCKET[d.k] || '#0073E6' }} />
                            <span className="text-slate-700">{d.n}</span>
                            <span className="text-slate-400 font-medium">({pct(tong.duNo > 0 ? d.v / tong.duNo : 0)})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Cột phải: Bốn cảnh báo rủi ro */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Cảnh báo rủi ro & Hạn mức</h3>
                  <p className="text-xs text-slate-500">Bấm thẻ để chuyển sang danh sách chi tiết</p>
                </div>
                <button
                  type="button"
                  className="cursor-pointer text-xs text-[#0073E6] font-medium hover:underline flex items-center gap-0.5"
                  onClick={() => onMoCanhBao?.('vuot-hm')}
                >
                  Xem tất cả <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 flex-1">
                {nhomCanhBao.map((n) => {
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className="cursor-pointer rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 text-left transition hover:border-[#0073E6] hover:bg-blue-50/25 flex flex-col justify-between"
                      onClick={() => onMoCanhBao?.(n.id)}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-800 truncate">{n.ten}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      </div>
                      <div className="mt-2.5">
                        <div className="text-xs text-slate-500">{n.soKhach} khách hàng</div>
                        <div className="so mt-0.5 text-sm font-bold text-[#0073E6]">
                          {n.id === 'vuot-hm' ? `Vượt ${ty(n.tongTien)}` : ty(n.tongTien)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Sắp xếp các biểu đồ phân tích chuyên sâu lên trước */}
          <div className="space-y-3 pt-2">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900">Biểu đồ Phân tích Công nợ & Tín dụng</h3>
              <p className="text-xs text-slate-500">Biến động phát sinh, thanh toán, quá hạn theo tháng và phân hạng khách hàng</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Khoi so={soKhoi('tuan-phat-sinh', chon)} />
              <Khoi so={soKhoi('tuan-qh-thang', chon)} />
              <Khoi so={soKhoi('tuan-luy-ke', chon)} />
              <Khoi so={soKhoi('tq-hang', chon)} />
            </div>
          </div>

          {/* 5. Dòng tiền và kế hoạch tham khảo */}
          <div className="space-y-3 pt-2">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-semibold text-slate-800">Dòng tiền & Kế hoạch tham khảo</h3>
              <p className="text-xs text-slate-500">{CHU_TEST}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Khoi so={soBoTest('bt-tien-tuan', boLoc)!} />
              <Khoi so={soBoTest('bt-ap-tuoi', boLoc)!} />
            </div>
            <div className="mt-2">
              <DanhSachKeHoachMua boLoc={boLoc} />
            </div>
          </div>

          {/* 6. DƯỚI CÙNG HẾT: Bảng Top 10 khách hàng có rủi ro cao nhất */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs mt-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Top 10 khách hàng có rủi ro cao nhất</h3>
                <p className="text-xs text-slate-500">Xếp theo trọng số quá hạn lớn nhất kỳ · Bấm mã khách hàng để mở hồ sơ chi tiết</p>
              </div>
              <span className="text-[11px] text-slate-400 hidden md:inline-block">
                Trọng số = 0.5×(≤90d) + 0.8×(91–180d) + 1.0×(&gt;180d)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 w-10 text-center font-medium">STT</th>
                    <th className="px-3 py-2 font-medium">Mã KH</th>
                    <th className="px-3 py-2 font-medium">Tên khách hàng</th>
                    <th className="px-3 py-2 font-medium">Sale</th>
                    <th className="px-3 py-2 text-right font-medium">Quá hạn</th>
                    <th className="px-3 py-2 text-right font-medium">Trọng số</th>
                    <th className="px-3 py-2 text-center font-medium">Điểm rủi ro</th>
                    <th className="px-3 py-2 text-center font-medium">Hạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topKhach.map((k, i) => {
                    const diem = k.diem;
                    const mauDiem =
                      diem == null
                        ? 'bg-slate-100 text-slate-600'
                        : diem >= 4
                          ? 'bg-emerald-50 text-emerald-700'
                          : diem >= 3
                            ? 'bg-blue-50 text-blue-700'
                            : diem >= 2
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700 font-bold';

                    return (
                      <tr key={k.maKH} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-2.5 text-center text-slate-400 font-medium">{i + 1}</td>
                        <td className="px-3 py-2.5 font-medium">
                          <button
                            type="button"
                            className="cursor-pointer font-semibold text-[#0073E6] hover:underline"
                            onClick={() => onMa?.(k.maKH)}
                          >
                            {k.maKH}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-800">{tenKhach(k, chon.tay)}</td>
                        <td className="px-3 py-2.5 text-slate-500">{k.sale || '—'}</td>
                        <td className="so px-3 py-2.5 text-right font-semibold text-rose-600">{ty(k.quaHan)}</td>
                        <td className="so px-3 py-2.5 text-right font-semibold text-slate-900">{ty(k.trongSo)}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${mauDiem}`}>
                            {diem != null ? so1(diem) : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center text-slate-600">{k.hang}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <p className="rounded-xl bg-white p-4 text-sm text-slate-500">Phải thu: chưa nạp sổ.</p>
      )}
    </div>
  );
}

export function ManNap({ onKy }: { onKy: (ky: KetQua, tep: ArrayBuffer) => void }) {
  const [xem, setXem] = useState<KetQua | null>(null);
  const [tep, setTep] = useState<ArrayBuffer | null>(null);
  const [loi, setLoi] = useState('');
  const [dang, setDang] = useState(false);
  const [keo, setKeo] = useState(false);

  async function doc(goc: ArrayBuffer, ten: string) {
    setDang(true);
    setLoi('');
    const ban = goc.slice(0);
    setTep(ban);
    try {
      setXem(await parseArrayBuffer(ban.slice(0), ten));
    } catch (e) {
      setXem(null);
      setTep(null);
      setLoi(e instanceof Error ? e.message : 'Không đọc được file.');
    } finally {
      setDang(false);
    }
  }

  function nhanFile(f: File | undefined) {
    if (!f) return;
    const ten = f.name.toLowerCase();
    if (!ten.endsWith('.xlsx') && !ten.endsWith('.xls')) {
      setLoi('Chỉ nhận file Excel .xlsx hoặc .xls.');
      return;
    }
    f.arrayBuffer().then((buf) => doc(buf, f.name));
  }

  return (
    <div className="space-y-4">
      <Tieu tieu="Nạp dữ liệu" phu="Kéo file Excel vào khung, đối chiếu khớp rồi dùng kỳ này cho các màn phải thu." />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setKeo(true);
        }}
        onDragLeave={() => setKeo(false)}
        onDrop={(e) => {
          e.preventDefault();
          setKeo(false);
          nhanFile(e.dataTransfer.files?.[0]);
        }}
        className={`rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${keo ? 'border-[#0073E6] bg-blue-50' : 'border-slate-300 bg-white'}`}
      >
        <UploadCloud className={`mx-auto h-12 w-12 ${keo ? 'text-[#0073E6]' : 'text-slate-400'}`} />
        <p className="mt-3 text-base font-medium text-slate-800">Kéo thả file Excel vào đây</p>
        <p className="mt-1 text-sm text-slate-500">hoặc chọn từ máy</p>
        <label className="mt-4 inline-block cursor-pointer rounded-full bg-[#0073E6] px-5 py-2 text-sm font-medium text-white">
          Chọn file
          <input
            className="hidden"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              nhanFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
          <a className="text-[#0073E6] underline" href="/mau/Mau_Nap_CongNo.xlsx" download>
            Tải file mẫu
          </a>
          <button
            type="button"
            className="text-[#0073E6] underline"
            onClick={async () => {
              const res = await fetch('/mau-test/CongNo_Demo_Test.xlsx');
              if (!res.ok) {
                setLoi('Không mở được file test.');
                return;
              }
              await doc(await res.arrayBuffer(), 'CongNo_Demo_Test.xlsx');
            }}
          >
            Mở sổ demo
          </button>
        </div>
      </div>
      {dang ? <p className="text-sm text-slate-500">Đang đọc…</p> : null}
      {loi ? <p className="text-sm text-red-700">{loi}</p> : null}
      {xem ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm">
            {xem.tenFile} · chốt {ngay(xem.meta.ngayChot)} · dư nợ {ty(xem.tong.duNo)} · {xem.nhanDiem}
          </p>
          {xem.loiDoc.length > 0 ? <p className="mt-2 text-sm text-red-700">{xem.loiDoc.join(' ')}</p> : null}
          {xem.canhBao.length > 0 ? <p className="mt-2 text-sm text-amber-700">{xem.canhBao.join(' ')}</p> : null}
          <div className="mt-3 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-1">Đối chiếu</th>
                  <th>App</th>
                  <th>Excel</th>
                  <th>Lệch</th>
                  <th>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {xem.kiemTra.map((r) => (
                  <tr key={r.ten} className="border-t border-slate-100">
                    <td className="py-1 pr-2">{r.ten}</td>
                    <td className="so">{soLinh(r.app)}</td>
                    <td className="so">{soLinh(r.excel)}</td>
                    <td className="so">{soLinh(r.lech)}</td>
                    <td>{r.dat ? 'Khớp' : 'Lệch'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" disabled={!tep || xem.chanLuu || xem.loiDoc.length > 0} className="mt-4 rounded-lg bg-[#0073E6] px-3 py-2 text-sm text-white disabled:opacity-40" onClick={() => tep && onKy(xem, tep)}>
            Dùng kỳ này
          </button>
        </section>
      ) : null}
    </div>
  );
}

export function ManTheoId({ id }: { id: ManId }) {
  return <ChuaSo ten={tenMan(id)} />;
}
