import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  ChevronRight,
  Download,
  LayoutDashboard,
  Menu,
  Monitor,
  Search,
  ShieldAlert,
  UploadCloud,
  Users,
  X,
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
import type { KetQua, BucketKey } from './lib/metrics';
import { BUCKET_KEYS, BUCKET_LABEL, topRuiRo } from './lib/metrics';
import { ngay, pct, so1, ty } from './format';
import { TEN_CONG_TY } from './lib/chung';
import { Khoi } from './khoi';
import {
  bonNhomCanhBao,
  soKhoi,
  tenKhach,
  type Chon,
  type Loc,
  type NhomCanhBaoId,
  type Tay,
} from './soLieu';
import { CHU_TEST, soBoTest } from './boTest';
import { DanhSachKeHoachMua } from './khoi';
import { ManHoSo } from './man';
import type { BoLocThoiGian } from './locThoiGian';
import { BoLocThoiGianBar } from './locThoiGian';

const MAU_BUCKET: Record<BucketKey, string> = {
  chuaDenHan: '#0284c7',
  traTruocHan: '#0d9488',
  denHan: '#10b981',
  d0_30: '#84cc16',
  d31_60: '#eab308',
  d61_90: '#f97316',
  d91_120: '#f43f5e',
  d121_150: '#ef4444',
  d151_180: '#dc2626',
  d181_365: '#b91c1c',
  d365: '#881337',
};

export type MobileTab = 'tongquan' | 'bieudo' | 'canhbao' | 'khach' | 'them';

interface ManMobileAppProps {
  ky: KetQua | null;
  chonKy: Chon | null;
  chonLoc: Chon | null;
  loc: Loc;
  setLoc: (l: Loc) => void;
  tay: Tay;
  suaTay: (t: Tay) => void;
  sales: string[];
  locThoiGian?: BoLocThoiGian;
  setLocThoiGian?: (l: BoLocThoiGian) => void;
  onChuyenWeb: () => void;
  onMoIn: () => void;
  onMoNap: () => void;
}

export function ManMobileApp({
  ky,
  chonKy,
  chonLoc,
  suaTay,
  sales,
  locThoiGian,
  setLocThoiGian,
  onChuyenWeb,
  onMoIn,
  onMoNap,
}: ManMobileAppProps) {
  const [tabHienTai, setTabHienTai] = useState<MobileTab>('tongquan');
  const [nhomCanhBaoChon, setNhomCanhBaoChon] = useState<NhomCanhBaoId>('vuot-hm');
  const [maKhachChiTiet, setMaKhachChiTiet] = useState<string | null>(null);
  const [kieuBieuDoTuoi, setKieuBieuDoTuoi] = useState<'tron' | 'cot'>('tron');
  const [tuKhoa, setTuKhoa] = useState('');
  const [locSaleMobile, setLocSaleMobile] = useState('ALL');
  const [locHangMobile, setLocHangMobile] = useState('ALL');
  const [bieuDoSubTab, setBieuDoSubTab] = useState<'all' | 'phatsinh' | 'quahan' | 'luyke' | 'hang'>('all');

  const chon = chonLoc || chonKy;
  const tong = chon?.tong;

  const nhomCanhBao = useMemo(() => {
    if (!chon) return [];
    return bonNhomCanhBao(chon.list, chon.tay);
  }, [chon]);

  const topKhach = useMemo(() => {
    if (!chon) return [];
    return topRuiRo(chon.list, 10);
  }, [chon]);

  const duLieuTuoiDuong = useMemo(() => {
    if (!tong) return [];
    return BUCKET_KEYS.map((k) => ({
      k,
      n: BUCKET_LABEL[k],
      v: tong.aging[k] || 0,
    })).filter((x) => x.v > 0);
  }, [tong]);

  const danhSachKhachLoc = useMemo(() => {
    if (!chon) return [];
    let ds = chon.list;
    if (locSaleMobile !== 'ALL') {
      ds = ds.filter((k) => k.sale === locSaleMobile);
    }
    if (locHangMobile !== 'ALL') {
      ds = ds.filter((k) => k.hang === locHangMobile);
    }
    if (tuKhoa.trim()) {
      const q = tuKhoa.trim().toLowerCase();
      ds = ds.filter(
        (k) =>
          k.maKH.toLowerCase().includes(q) ||
          tenKhach(k, chon.tay).toLowerCase().includes(q)
      );
    }
    return ds;
  }, [chon, locSaleMobile, locHangMobile, tuKhoa]);

  // If viewing customer detail profile
  if (maKhachChiTiet && chonKy) {
    const chonHienTai = { ...chonKy, maKH: maKhachChiTiet };
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pb-16">
        {/* Mobile Detail App Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2.5 shadow-2xs">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0073E6] hover:text-blue-700 py-1 px-1.5 rounded-lg active:bg-blue-50"
            onClick={() => setMaKhachChiTiet(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </button>
          <div className="text-center">
            <span className="text-xs font-bold text-slate-900 block truncate max-w-[200px]">
              {maKhachChiTiet}
            </span>
            <span className="text-[10px] text-slate-500">Hồ sơ công nợ chi tiết</span>
          </div>
          <button
            type="button"
            className="text-xs text-slate-500 hover:text-slate-900 p-1 rounded-lg"
            onClick={() => setMaKhachChiTiet(null)}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="p-3">
          <ManHoSo chon={chonHienTai} suaTay={suaTay} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pb-20 select-none">
      {/* 1. Mobile App Top Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white shadow-2xs">
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#005bb5] to-[#0073E6] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              TPC
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-bold text-slate-900">{TEN_CONG_TY}</span>
                <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[9.5px] font-semibold text-[#0073E6] border border-blue-100/80 shrink-0">
                  Mobile App
                </span>
              </div>
              <div className="text-[10.5px] text-slate-500 truncate">
                {ky ? `Kỳ chốt ${ngay(ky.meta.ngayChot)} · ${ky.meta.tuanNhan}` : 'Chưa nạp sổ'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-1.5 text-slate-600 hover:text-[#0073E6] active:bg-slate-100 rounded-lg transition"
              onClick={() => {
                setTabHienTai('canhbao');
                setNhomCanhBaoChon('vuot-hm');
              }}
              title="Cảnh báo rủi ro"
            >
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </button>

            {/* Switch to Web Button */}
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition"
              onClick={onChuyenWeb}
              title="Chuyển sang giao diện Bản Web máy tính"
            >
              <Monitor className="h-3.5 w-3.5 text-[#0073E6]" />
              <span className="hidden xs:inline">Bản Web</span>
            </button>
          </div>
        </div>

        {/* Bộ lọc khoảng thời gian (theo tháng / quý) cho Mobile */}
        {locThoiGian && setLocThoiGian && (
          <BoLocThoiGianBar
            ky={ky}
            locThoiGian={locThoiGian}
            setLocThoiGian={setLocThoiGian}
            compact={true}
          />
        )}

        {/* Sub Navigation Pill Bar for quick actions */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50/80 border-t border-slate-100 overflow-x-auto scrollbar-none text-[11px]">
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200/90 text-slate-700 font-medium shrink-0 active:bg-blue-50 shadow-2xs"
            onClick={onMoIn}
          >
            <Download className="h-3 w-3 text-[#0073E6]" />
            <span>Xuất PDF</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200/90 text-slate-700 font-medium shrink-0 active:bg-blue-50 shadow-2xs"
            onClick={onMoNap}
          >
            <UploadCloud className="h-3 w-3 text-emerald-600" />
            <span>Nạp Excel</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200/90 text-slate-700 font-medium shrink-0 active:bg-blue-50 shadow-2xs"
            onClick={() => setTabHienTai('khach')}
          >
            <Search className="h-3 w-3 text-sky-600" />
            <span>Tìm kiếm KH</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/90 text-rose-700 font-medium shrink-0 shadow-2xs"
            onClick={() => {
              setTabHienTai('canhbao');
              setNhomCanhBaoChon('vuot-hm');
            }}
          >
            <ShieldAlert className="h-3 w-3 text-rose-600" />
            <span>4 Cảnh báo</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Body based on Active Mobile Tab */}
      <main className="flex-1 p-3 space-y-3.5">
        {!tong ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Chưa có số liệu. Vui lòng nạp sổ Excel để bắt đầu.
          </div>
        ) : (
          <>
            {/* ===================== TAB 1: TỔNG QUAN ===================== */}
            {tabHienTai === 'tongquan' && (
              <div className="space-y-3">
                {/* Hero Balance Card (Đặc trưng Mobile Banking/ERP) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#00387a] to-[#0073E6] p-4 text-white shadow-md">
                  <div className="flex items-center justify-between text-xs text-blue-100/90">
                    <span className="font-medium tracking-wide uppercase text-[10px]">Tổng dư nợ toàn công ty</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs">
                      {ky ? ky.meta.tuanNhan : 'AR'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="so text-2xl xs:text-3xl font-extrabold tracking-tight">
                      {ty(tong.duNo)}
                    </div>
                  </div>

                  {/* Dual Progress: Trong hạn vs Quá hạn */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-blue-100">
                      <span>Trong hạn: <strong>{ty(tong.trongHan)}</strong></span>
                      <span className="text-amber-200">
                        Quá hạn: <strong>{ty(tong.quaHan)}</strong> ({pct(tong.duNo > 0 ? tong.quaHan / tong.duNo : 0)})
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(0, tong.duNo > 0 ? (tong.trongHan / tong.duNo) * 100 : 0))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Card bottom pills */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-white/15 pt-2.5 text-[11px] text-blue-100/80">
                    <span>Số khách hàng: <strong className="text-white">{tong.soKhach}</strong></span>
                    <span>DSO kỳ: <strong className="text-white">{so1(tong.dsoKy)} ngày</strong></span>
                  </div>
                </div>

                {/* 3 KPI Cards Mini Row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-slate-200/90 bg-white p-2.5 text-center shadow-2xs">
                    <div className="text-[10.5px] font-medium text-slate-500 truncate">Quá hạn</div>
                    <div className="so mt-1 text-sm xs:text-base font-bold text-rose-600 truncate">
                      {ty(tong.quaHan)}
                    </div>
                    <div className="mt-0.5 text-[9.5px] text-rose-500 font-medium">
                      {pct(tong.duNo > 0 ? tong.quaHan / tong.duNo : 0)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/90 bg-white p-2.5 text-center shadow-2xs">
                    <div className="text-[10.5px] font-medium text-slate-500 truncate">DSO kỳ</div>
                    <div className="so mt-1 text-sm xs:text-base font-bold text-sky-600 truncate">
                      {tong.dsoKy != null ? `${so1(tong.dsoKy)} d` : '—'}
                    </div>
                    <div className="mt-0.5 text-[9.5px] text-slate-400">Thu bình quân</div>
                  </div>

                  <div className="rounded-xl border border-slate-200/90 bg-white p-2.5 text-center shadow-2xs">
                    <div className="text-[10.5px] font-medium text-slate-500 truncate">Nợ xấu</div>
                    <div className="so mt-1 text-sm xs:text-base font-bold text-amber-600 truncate">
                      {ty(tong.noKhoDoi)}
                    </div>
                    <div className="mt-0.5 text-[9.5px] text-amber-600 font-medium">
                      {tong.soKhachNoKhoDoi} KH
                    </div>
                  </div>
                </div>

                {/* Cơ cấu tuổi nợ Mobile (Interactive Chart) */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Cơ cấu tuổi nợ</h3>
                      <p className="text-[10.5px] text-slate-500">Tỷ trọng các nhóm theo hạn</p>
                    </div>
                    {/* Toggle Donut / Bar */}
                    <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs">
                      <button
                        type="button"
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                          kieuBieuDoTuoi === 'tron' ? 'bg-white text-[#0073E6] shadow-2xs' : 'text-slate-600'
                        }`}
                        onClick={() => setKieuBieuDoTuoi('tron')}
                      >
                        Tròn
                      </button>
                      <button
                        type="button"
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                          kieuBieuDoTuoi === 'cot' ? 'bg-white text-[#0073E6] shadow-2xs' : 'text-slate-600'
                        }`}
                        onClick={() => setKieuBieuDoTuoi('cot')}
                      >
                        Cột
                      </button>
                    </div>
                  </div>

                  {kieuBieuDoTuoi === 'tron' ? (
                    <div className="pt-2">
                      <div className="h-44 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={duLieuTuoiDuong}
                              dataKey="v"
                              nameKey="n"
                              innerRadius={45}
                              outerRadius={65}
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
                                const d = payload[0].payload as { n: string; v: number };
                                const p = tong.duNo > 0 ? (d.v / tong.duNo) * 100 : 0;
                                return (
                                  <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-md">
                                    <div className="font-semibold text-slate-800">{d.n}</div>
                                    <div className="so text-[#0073E6] font-bold mt-0.5">
                                      {ty(d.v)} ({p.toFixed(1)}%)
                                    </div>
                                  </div>
                                );
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="so text-xs font-bold text-slate-800">{ty(tong.duNo)}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-medium">Dư nợ</span>
                        </div>
                      </div>

                      {/* Legend List */}
                      <div className="space-y-1 pt-1 border-t border-slate-100 max-h-36 overflow-y-auto text-xs">
                        {duLieuTuoiDuong.map((d) => {
                          const p = tong.duNo > 0 ? (d.v / tong.duNo) * 100 : 0;
                          return (
                            <div key={d.k} className="flex items-center justify-between py-0.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: MAU_BUCKET[d.k] }} />
                                <span className="text-slate-700 text-[11px] truncate">{d.n}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 text-[11px]">
                                <span className="text-slate-400">{p.toFixed(1)}%</span>
                                <span className="so font-semibold text-slate-800">{ty(d.v)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="h-52 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={duLieuTuoiDuong} margin={{ top: 8, right: 8, left: -16, bottom: 24 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis
                            dataKey="n"
                            interval={0}
                            angle={-30}
                            textAnchor="end"
                            height={40}
                            tick={{ fontSize: 9, fill: '#64748b' }}
                          />
                          <YAxis
                            tickFormatter={(v) => (v === 0 ? '0' : (v / 1e9).toFixed(0))}
                            tick={{ fontSize: 9, fill: '#94a3b8' }}
                            width={32}
                            unit=" tỷ"
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const d = payload[0].payload as { n: string; v: number };
                              return (
                                <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-md">
                                  <div className="font-semibold">{d.n}</div>
                                  <div className="so text-[#0073E6] font-bold">{ty(d.v)}</div>
                                </div>
                              );
                            }}
                          />
                          <Bar dataKey="v" radius={[3, 3, 0, 0]} maxBarSize={32}>
                            {duLieuTuoiDuong.map((d) => (
                              <Cell key={d.k} fill={MAU_BUCKET[d.k] || '#0073E6'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* 4 Cảnh báo rủi ro thẻ nhanh */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">4 Nhóm cảnh báo rủi ro</h3>
                      <p className="text-[10.5px] text-slate-500">Chạm thẻ để xem danh sách chi tiết</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-[#0073E6] font-semibold flex items-center gap-0.5"
                      onClick={() => {
                        setTabHienTai('canhbao');
                        setNhomCanhBaoChon('vuot-hm');
                      }}
                    >
                      Tất cả <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {nhomCanhBao.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5 text-left active:bg-blue-50/40 active:border-[#0073E6] transition flex flex-col justify-between"
                        onClick={() => {
                          setNhomCanhBaoChon(n.id);
                          setTabHienTai('canhbao');
                        }}
                      >
                        <div className="text-[11.5px] font-semibold text-slate-800 truncate">{n.ten}</div>
                        <div className="mt-1.5">
                          <div className="text-[10px] text-slate-500">{n.soKhach} khách hàng</div>
                          <div className="so text-xs font-bold text-[#0073E6] truncate mt-0.5">
                            {ty(n.tongTien)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top khách hàng rủi ro cao nhất (Card format Mobile) */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Top khách hàng rủi ro kỳ</h3>
                      <p className="text-[10.5px] text-slate-500">Xếp theo trọng số quá hạn lớn nhất</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-[#0073E6] font-semibold flex items-center gap-0.5"
                      onClick={() => setTabHienTai('khach')}
                    >
                      Danh sách <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {topKhach.slice(0, 5).map((k, i) => {
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
                        <div
                          key={k.maKH}
                          className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/50 p-2.5 active:bg-blue-50/30 transition"
                          onClick={() => setMaKhachChiTiet(k.maKH)}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-[#0073E6]">{k.maKH}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${mauDiem}`}>
                                  {diem != null ? `${so1(diem)}đ` : k.hang}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-800 font-medium truncate max-w-[160px]">
                                {tenKhach(k, chon.tay)}
                              </div>
                              <div className="text-[10px] text-slate-400">Sale: {k.sale || '—'}</div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-[10px] text-slate-400">Quá hạn</div>
                            <div className="so text-xs font-bold text-rose-600">{ty(k.quaHan)}</div>
                            <div className="text-[9.5px] text-slate-500">TS: {ty(k.trongSo)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 2: BIỂU ĐỒ ===================== */}
            {tabHienTai === 'bieudo' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Biểu đồ Phân tích & Xu hướng</h3>
                  <span className="text-[10.5px] text-slate-500">Dữ liệu sổ chốt</span>
                </div>

                {/* Sub Tab Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs scrollbar-none">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'phatsinh', label: 'Phát sinh nợ' },
                    { id: 'quahan', label: 'Quá hạn tháng' },
                    { id: 'luyke', label: 'Lũy kế' },
                    { id: 'hang', label: 'Xếp hạng' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition ${
                        bieuDoSubTab === sub.id
                          ? 'bg-[#0073E6] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                      onClick={() => setBieuDoSubTab(sub.id as typeof bieuDoSubTab)}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {(bieuDoSubTab === 'all' || bieuDoSubTab === 'phatsinh') && (
                    <Khoi so={soKhoi('tuan-phat-sinh', chon)} />
                  )}
                  {(bieuDoSubTab === 'all' || bieuDoSubTab === 'quahan') && (
                    <Khoi so={soKhoi('tuan-qh-thang', chon)} />
                  )}
                  {(bieuDoSubTab === 'all' || bieuDoSubTab === 'luyke') && (
                    <Khoi so={soKhoi('tuan-luy-ke', chon)} />
                  )}
                  {(bieuDoSubTab === 'all' || bieuDoSubTab === 'hang') && (
                    <Khoi so={soKhoi('tq-hang', chon)} />
                  )}
                </div>
              </div>
            )}

            {/* ===================== TAB 3: CẢNH BÁO ===================== */}
            {tabHienTai === 'canhbao' && (
              <div className="space-y-3">
                <div className="border-b border-slate-200/80 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Cảnh báo rủi ro & Hạn mức</h3>
                  <p className="text-[11px] text-slate-500">Phân loại theo mức độ vi phạm và thời gian quá hạn</p>
                </div>

                {/* Warning Group Tabs */}
                <div className="grid grid-cols-2 gap-1.5">
                  {nhomCanhBao.map((n) => {
                    const bat = nhomCanhBaoChon === n.id;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        className={`p-2.5 rounded-lg border text-left transition ${
                          bat
                            ? 'bg-blue-50/80 border-[#0073E6] text-[#0073E6] shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                        onClick={() => setNhomCanhBaoChon(n.id)}
                      >
                        <div className="text-xs font-bold truncate">{n.ten}</div>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-[10px] text-slate-500">{n.soKhach} KH</span>
                          <span className="so text-xs font-semibold">{ty(n.tongTien)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* List of Customers in Selected Warning Group */}
                {(() => {
                  const nhomHienTai = nhomCanhBao.find((n) => n.id === nhomCanhBaoChon);
                  if (!nhomHienTai) return null;
                  return (
                    <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                        <span className="text-xs font-bold text-slate-900">
                          {nhomHienTai.ten} ({nhomHienTai.soKhach} khách)
                        </span>
                        <span className="so text-xs font-bold text-rose-600">
                          {ty(nhomHienTai.tongTien)}
                        </span>
                      </div>

                      {nhomHienTai.danhSach.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          Không có khách hàng nào trong nhóm cảnh báo này.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {nhomHienTai.danhSach.map((k) => (
                            <div
                              key={k.maKH}
                              className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5 active:bg-blue-50/40 transition flex items-center justify-between"
                              onClick={() => setMaKhachChiTiet(k.maKH)}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-[#0073E6]">{k.maKH}</span>
                                  <span className="text-[10px] text-slate-500">· {k.sale || 'Chưa gán'}</span>
                                </div>
                                <div className="text-xs font-semibold text-slate-800 truncate max-w-[190px]">
                                  {k.tenKH}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Hạn mức: {k.hmtd > 0 ? ty(k.hmtd) : 'Chưa cấp'}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="so text-xs font-bold text-rose-600">
                                  {ty(k.tien)}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  Dư nợ: {ty(k.duNo)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ===================== TAB 4: KHÁCH HÀNG ===================== */}
            {tabHienTai === 'khach' && (
              <div className="space-y-3">
                <div className="border-b border-slate-200/80 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Danh mục Khách hàng</h3>
                  <p className="text-[11px] text-slate-500">Tìm kiếm & xem hồ sơ hạn mức, điểm tín dụng chi tiết</p>
                </div>

                {/* Search & Filter Bar */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs placeholder:text-slate-400 focus:border-[#0073E6] focus:outline-none"
                      placeholder="Tìm theo mã hoặc tên khách hàng…"
                      value={tuKhoa}
                      onChange={(e) => setTuKhoa(e.target.value)}
                    />
                    {tuKhoa && (
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        onClick={() => setTuKhoa('')}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Selects */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <select
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
                      value={locSaleMobile}
                      onChange={(e) => setLocSaleMobile(e.target.value)}
                    >
                      <option value="ALL">Mọi Sale</option>
                      {sales.map((s) => (
                        <option key={s} value={s}>{s || 'Chưa gán Sale'}</option>
                      ))}
                    </select>

                    <select
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
                      value={locHangMobile}
                      onChange={(e) => setLocHangMobile(e.target.value)}
                    >
                      <option value="ALL">Mọi xếp hạng</option>
                      {['Tốt', 'Trung bình', 'Xấu', 'Rất xấu'].map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Customer List Count */}
                <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
                  <span>Tìm thấy <strong>{danhSachKhachLoc.length}</strong> khách hàng</span>
                  <span>Chạm thẻ để mở hồ sơ</span>
                </div>

                {/* Customer Cards List */}
                <div className="space-y-2">
                  {danhSachKhachLoc.slice(0, 40).map((k) => (
                    <div
                      key={k.maKH}
                      className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs active:bg-blue-50/30 transition cursor-pointer"
                      onClick={() => setMaKhachChiTiet(k.maKH)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#0073E6]">{k.maKH}</span>
                          <span className="text-[10px] text-slate-400">· {k.sale || 'Chưa gán'}</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded font-semibold ${
                            k.hang === 'Tốt'
                              ? 'bg-emerald-50 text-emerald-700'
                              : k.hang === 'Trung bình'
                                ? 'bg-blue-50 text-blue-700'
                                : k.hang === 'Xấu'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {k.hang} {k.diem != null ? `(${so1(k.diem)})` : ''}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
                        {tenKhach(k, chon.tay)}
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        <div>
                          <span className="text-slate-400">Dư nợ: </span>
                          <span className="so font-bold text-slate-900">{ty(k.duNo)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400">Quá hạn: </span>
                          <span className="so font-bold text-rose-600">{ty(k.quaHan)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {danhSachKhachLoc.length > 40 && (
                    <div className="py-2 text-center text-xs text-slate-400">
                      Đang hiển thị 40 / {danhSachKhachLoc.length} khách hàng. Vui lòng dùng ô tìm kiếm để lọc chính xác.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================== TAB 5: THÊM (MORE) ===================== */}
            {tabHienTai === 'them' && (
              <div className="space-y-3.5">
                <div className="border-b border-slate-200/80 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Phân hệ & Công cụ khác</h3>
                  <p className="text-[11px] text-slate-500">Dòng tiền 13 tuần, mua hàng, nạp sổ và cài đặt</p>
                </div>

                {/* Dạng danh sách Kế hoạch mua theo nhóm */}
                <DanhSachKeHoachMua boLoc={locThoiGian} />

                {/* Dòng tiền 13 tuần */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                  <div className="border-b border-slate-100 pb-2 mb-2">
                    <h3 className="text-xs font-bold text-slate-900">Dòng tiền 13 tuần (Tham khảo)</h3>
                    <p className="text-[10px] text-slate-500">{CHU_TEST}</p>
                  </div>
                  <Khoi so={soBoTest('bt-tien-tuan', locThoiGian)!} />
                </div>

                {/* Aging AP */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                  <div className="border-b border-slate-100 pb-2 mb-2">
                    <h3 className="text-xs font-bold text-slate-900">Tuổi nợ phải trả AP</h3>
                    <p className="text-[10px] text-slate-500">Nợ nhà cung cấp theo các kỳ hạn</p>
                  </div>
                  <Khoi so={soBoTest('bt-ap-tuoi', locThoiGian)!} />
                </div>

                {/* Menu items */}
                <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs divide-y divide-slate-100 text-xs">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 text-left active:bg-slate-50"
                    onClick={onMoIn}
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="h-4 w-4 text-[#0073E6]" />
                      <span className="font-semibold text-slate-800">Xuất báo cáo PDF Ban Giám Đốc</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 text-left active:bg-slate-50"
                    onClick={onMoNap}
                  >
                    <div className="flex items-center gap-2.5">
                      <UploadCloud className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-slate-800">Nạp sổ dữ liệu Excel mới</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 text-left active:bg-slate-50"
                    onClick={onChuyenWeb}
                  >
                    <div className="flex items-center gap-2.5">
                      <Monitor className="h-4 w-4 text-indigo-600" />
                      <span className="font-semibold text-slate-800">Chuyển sang Giao diện Bản Web</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 3. Mobile App Bottom Navigation Bar (Cố định ở chân trang) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 flex items-center justify-around">
        <button
          type="button"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
            tabHienTai === 'tongquan'
              ? 'text-[#0073E6] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setTabHienTai('tongquan')}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Tổng quan</span>
        </button>

        <button
          type="button"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
            tabHienTai === 'bieudo'
              ? 'text-[#0073E6] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setTabHienTai('bieudo')}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Biểu đồ</span>
        </button>

        <button
          type="button"
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
            tabHienTai === 'canhbao'
              ? 'text-rose-600 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setTabHienTai('canhbao')}
        >
          <AlertTriangle className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Cảnh báo</span>
          <span className="absolute top-1 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
            tabHienTai === 'khach'
              ? 'text-[#0073E6] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setTabHienTai('khach')}
        >
          <Users className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Khách hàng</span>
        </button>

        <button
          type="button"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
            tabHienTai === 'them'
              ? 'text-[#0073E6] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setTabHienTai('them')}
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Thêm</span>
        </button>
      </nav>
    </div>
  );
}
