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
} from 'recharts';
import type { KetQua } from './lib/metrics';
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
import { ManHoSo } from './man';
import type { BoLocThoiGian } from './locThoiGian';
import { BoLocThoiGianBar, layKhoangThoiGian } from './locThoiGian';
import { MAU as SAC, MAU_BUCKET } from './mauSac';


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
    })).filter((x) => x.v !== 0);
  }, [tong]);
  const duLieuTuoiVe = useMemo(() => duLieuTuoiDuong.filter((x) => x.v > 0), [duLieuTuoiDuong]);

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
      <div className="flex flex-col min-h-screen bg-background text-foreground pb-16">
        {/* Mobile Detail App Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-3 py-2.5 shadow-2xs">
          <button
            type="button"
            className="flex items-center gap-1.5 text-[12px] text-primary hover:text-primary py-1 px-1.5 rounded-lg active:bg-primary-soft"
            onClick={() => setMaKhachChiTiet(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </button>
          <div className="text-center">
            <span className="text-xs font-normal text-foreground block truncate max-w-[200px]">
              {maKhachChiTiet}
            </span>
            <span className="text-[10px] text-muted">Hồ sơ công nợ chi tiết</span>
          </div>
          <button
            type="button"
            className="text-xs text-muted hover:text-foreground p-1 rounded-lg"
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
    <div className="flex min-h-screen select-none flex-col bg-background pb-20 text-foreground">
      {/* 1. Mobile App Top Bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-white shadow-2xs">
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-[11px] text-white">
              TC
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-normal text-foreground">{TEN_CONG_TY}</span>
                <span className="rounded bg-primary-soft px-1.5 py-0.2 text-[9.5px] text-primary border border-primary-soft/80 shrink-0">
                  Mobile App
                </span>
              </div>
              <div className="text-[10.5px] text-muted truncate">
                {ky ? `Kỳ chốt ${ngay(ky.meta.ngayChot)} · ${ky.meta.tuanNhan}` : 'Chưa nạp sổ'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-1.5 text-subtle hover:text-primary active:bg-line-soft rounded-lg transition"
              onClick={() => {
                setTabHienTai('canhbao');
                setNhomCanhBaoChon('vuot-hm');
              }}
              title="Cảnh báo rủi ro"
            >
              <AlertTriangle className="h-4 w-4 text-risk-watch" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-bad"></span>
              </span>
            </button>

            {/* Switch to Web Button */}
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-line-soft text-subtle hover:bg-line active:scale-95 transition"
              onClick={onChuyenWeb}
              title="Chuyển sang giao diện Bản Web máy tính"
            >
              <Monitor className="h-3.5 w-3.5 text-primary" />
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
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/80 border-t border-line-soft overflow-x-auto scrollbar-none text-[11px]">
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-line text-subtle shrink-0 active:bg-primary-soft shadow-2xs"
            onClick={onMoIn}
          >
            <Download className="h-3 w-3 text-primary" />
            <span>Xuất PDF</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-line text-subtle shrink-0 active:bg-primary-soft shadow-2xs"
            onClick={onMoNap}
          >
            <UploadCloud className="h-3 w-3 text-risk-safe" />
            <span>Nạp Excel</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-line text-subtle shrink-0 active:bg-primary-soft shadow-2xs"
            onClick={() => setTabHienTai('khach')}
          >
            <Search className="h-3 w-3 text-primary" />
            <span>Tìm kiếm KH</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-risk-bad-soft border border-risk-bad-soft/90 text-risk-bad shrink-0 shadow-2xs"
            onClick={() => {
              setTabHienTai('canhbao');
              setNhomCanhBaoChon('vuot-hm');
            }}
          >
            <ShieldAlert className="h-3 w-3 text-risk-bad" />
            <span>4 Cảnh báo</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Body based on Active Mobile Tab */}
      <main className="flex-1 p-3 space-y-3.5">
        {!tong ? (
          <div className="rounded-xl border border-dashed border-line bg-white p-8 text-center text-sm text-muted">
            Chưa có số liệu. Vui lòng nạp sổ Excel để bắt đầu.
          </div>
        ) : (
          <>
            {/* ===================== TAB 1: TỔNG QUAN ===================== */}
            {tabHienTai === 'tongquan' && (
              <div className="space-y-3">
                {/* Hero Balance Card (Đặc trưng Mobile Banking/ERP) */}
                <div className="rounded-xl border border-line bg-white p-4 shadow-card">
                  <div className="flex items-center justify-between text-[12px] text-muted">
                    <span>Tổng phải thu</span>
                    <span className="rounded-md bg-primary-soft px-2 py-1 text-[11px] text-primary">
                      {ky ? ky.meta.tuanNhan : 'AR'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="so text-[26px] font-normal tracking-[-0.04em] text-foreground">{ty(tong.duNo)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                    <span>Trong hạn {ty(tong.trongHan)}</span>
                    <span className="text-risk-bad">Quá hạn {ty(tong.quaHan)} ({pct(tong.duNo > 0 ? tong.quaHan / tong.duNo : 0)})</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
                    <div
                      className="h-full rounded-full bg-primary-glow"
                      style={{
                        width: `${Math.min(100, Math.max(0, tong.duNo > 0 ? (tong.trongHan / tong.duNo) * 100 : 0))}%`,
                      }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                    <span>{tong.soKhach} khách</span>
                    <span>DSO {so1(tong.dsoKy)} ngày</span>
                  </div>
                </div>

                {/* 3 KPI Cards Mini Row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-line bg-white p-2.5 text-center shadow-2xs">
                    <div className="text-[10.5px] text-muted truncate">Quá hạn</div>
                    <div className="so mt-1 text-sm xs:text-base font-normal text-risk-bad truncate">
                      {ty(tong.quaHan)}
                    </div>
                    <div className="mt-0.5 text-[9.5px] text-risk-bad">
                      {pct(tong.duNo > 0 ? tong.quaHan / tong.duNo : 0)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-line bg-white p-2.5 text-center shadow-2xs">
                    <div className="text-[10.5px] text-muted truncate">DSO kỳ</div>
                    <div className="so mt-1 text-sm xs:text-base font-normal text-primary truncate">
                      {tong.dsoKy != null ? `${so1(tong.dsoKy)} d` : '—'}
                    </div>
                    <div className="mt-0.5 text-[9.5px] text-muted">Thu bình quân</div>
                    {locThoiGian && layKhoangThoiGian(locThoiGian, ky?.meta).laLoc && (
                      <div className="mt-1 text-[8.5px] text-risk-watch italic leading-tight">
                        Số cả kỳ đã nạp, sheet không có ngày theo tháng.
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-line bg-white p-2.5 text-center shadow-2xs">
                    <div className="text-[10.5px] text-muted truncate">Nợ xấu</div>
                    <div className="so mt-1 text-sm xs:text-base font-normal text-risk-watch truncate">
                      {ty(tong.noKhoDoi)}
                    </div>
                    <div className="mt-0.5 text-[9.5px] text-risk-watch">
                      {tong.soKhachNoKhoDoi} KH
                    </div>
                    {locThoiGian && layKhoangThoiGian(locThoiGian, ky?.meta).laLoc && (
                      <div className="mt-1 text-[8.5px] text-risk-watch italic leading-tight">
                        Số cả kỳ đã nạp, sheet không có ngày theo tháng.
                      </div>
                    )}
                  </div>
                </div>

                {/* Cơ cấu tuổi nợ Mobile (Interactive Chart) */}
                <div className="rounded-xl border border-line bg-white p-3.5 shadow-2xs">
                  <div className="border-b border-line-soft pb-2">
                    <h3 className="text-[13px] text-foreground">Cơ cấu tuổi nợ</h3>
                    <p className="text-[11px] text-muted">Tỷ trọng các nhóm theo hạn</p>
                  </div>
                  <div className="pt-2">
                      <div className="h-44 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={duLieuTuoiVe}
                              dataKey="v"
                              nameKey="n"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={2}
                              isAnimationActive={false}
                            >
                              {duLieuTuoiVe.map((d) => (
                                <Cell key={d.k} fill={MAU_BUCKET[d.k] || SAC.primary} />
                              ))}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const d = payload[0].payload as { n: string; v: number };
                                const p = tong.duNo > 0 ? (d.v / tong.duNo) * 100 : 0;
                                return (
                                  <div className="rounded-lg border border-line bg-white p-2 text-xs shadow-md">
                                    <div className="text-subtle">{d.n}</div>
                                    <div className="so text-primary font-normal mt-0.5">
                                      {ty(d.v)} ({p.toFixed(1)}%)
                                    </div>
                                  </div>
                                );
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="so text-xs font-normal text-foreground">{ty(tong.duNo)}</span>
                          <span className="text-[9px] text-muted uppercase">Dư nợ</span>
                        </div>
                      </div>

                      {/* Legend List */}
                      <div className="space-y-1 pt-1 border-t border-line-soft max-h-36 overflow-y-auto text-xs">
                        {duLieuTuoiDuong.map((d) => {
                          const p = tong.duNo > 0 ? (d.v / tong.duNo) * 100 : 0;
                          return (
                            <div key={d.k} className="flex items-center justify-between py-0.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: MAU_BUCKET[d.k] }} />
                                <span className="text-subtle text-[11px] truncate">{d.n}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 text-[11px]">
                                <span className="text-muted">{p.toFixed(1)}%</span>
                                <span className="so text-foreground">{ty(d.v)}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* 4 Cảnh báo rủi ro thẻ nhanh */}
                <div className="rounded-xl border border-line bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-line-soft pb-2 mb-2.5">
                    <div>
                      <h3 className="text-xs font-normal text-foreground">4 Nhóm cảnh báo rủi ro</h3>
                      <p className="text-[10.5px] text-muted">Chạm thẻ để xem danh sách chi tiết</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-primary flex items-center gap-0.5"
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
                        className="rounded-lg border border-line/80 bg-background/70 p-2.5 text-left active:bg-primary-soft/40 active:border-primary transition flex flex-col justify-between"
                        onClick={() => {
                          setNhomCanhBaoChon(n.id);
                          setTabHienTai('canhbao');
                        }}
                      >
                        <div className="text-[11.5px] text-foreground truncate">{n.ten}</div>
                        <div className="mt-1.5">
                          <div className="text-[10px] text-muted">{n.soKhach} khách hàng</div>
                          <div className="so text-xs font-normal text-primary truncate mt-0.5">
                            {ty(n.tongTien)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top khách hàng rủi ro cao nhất (Card format Mobile) */}
                <div className="rounded-xl border border-line bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-line-soft pb-2 mb-2.5">
                    <div>
                      <h3 className="text-xs font-normal text-foreground">Top khách hàng rủi ro kỳ</h3>
                      <p className="text-[10.5px] text-muted">Xếp theo trọng số quá hạn lớn nhất</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-primary flex items-center gap-0.5"
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
                          ? 'bg-line-soft text-subtle'
                          : diem >= 4
                            ? 'bg-risk-safe-soft text-risk-safe'
                            : diem >= 3
                              ? 'bg-primary-soft text-primary'
                              : diem >= 2
                                ? 'bg-risk-watch-soft text-risk-watch'
                                : 'bg-risk-bad-soft text-risk-bad font-normal';

                      return (
                        <div
                          key={k.maKH}
                          className="flex items-center justify-between rounded-lg border border-line/80 bg-background/50 p-2.5 active:bg-primary-soft/30 transition"
                          onClick={() => setMaKhachChiTiet(k.maKH)}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-line text-[10px] font-normal text-subtle">
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-normal text-xs text-primary">{k.maKH}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded ${mauDiem}`}>
                                  {diem != null ? `${so1(diem)}đ` : k.hang}
                                </span>
                              </div>
                              <div className="text-[11px] text-foreground truncate max-w-[160px]">
                                {tenKhach(k, chon.tay)}
                              </div>
                              <div className="text-[10px] text-muted">Sale: {k.sale || '—'}</div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-[10px] text-muted">Quá hạn</div>
                            <div className="so text-xs font-normal text-risk-bad">{ty(k.quaHan)}</div>
                            <div className="text-[9.5px] text-muted">TS: {ty(k.trongSo)}</div>
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
                <div className="flex items-center justify-between border-b border-line/80 pb-2">
                  <h3 className="text-sm font-normal text-foreground">Biểu đồ Phân tích & Xu hướng</h3>
                  <span className="text-[10.5px] text-muted">Dữ liệu sổ chốt</span>
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
                      className={`px-3 py-1 rounded-full text-xs shrink-0 transition ${
                        bieuDoSubTab === sub.id
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-white text-subtle border border-line'
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
                <div className="border-b border-line/80 pb-2">
                  <h3 className="text-sm font-normal text-foreground">Cảnh báo rủi ro & Hạn mức</h3>
                  <p className="text-[11px] text-muted">Phân loại theo mức độ vi phạm và thời gian quá hạn</p>
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
                            ? 'bg-primary-soft/80 border-primary text-primary shadow-2xs'
                            : 'bg-white border-line text-subtle'
                        }`}
                        onClick={() => setNhomCanhBaoChon(n.id)}
                      >
                        <div className="text-xs font-normal truncate">{n.ten}</div>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-[10px] text-muted">{n.soKhach} KH</span>
                          <span className="so text-[12px]">{ty(n.tongTien)}</span>
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
                    <div className="rounded-xl border border-line bg-white p-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-line-soft pb-2 mb-2.5">
                        <span className="text-xs font-normal text-foreground">
                          {nhomHienTai.ten} ({nhomHienTai.soKhach} khách)
                        </span>
                        <span className="so text-xs font-normal text-risk-bad">
                          {ty(nhomHienTai.tongTien)}
                        </span>
                      </div>

                      {nhomHienTai.danhSach.length === 0 ? (
                        <div className="py-6 text-center text-xs text-muted">
                          Không có khách hàng nào trong nhóm cảnh báo này.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {nhomHienTai.danhSach.map((k) => (
                            <div
                              key={k.maKH}
                              className="rounded-lg border border-line/80 bg-background/60 p-2.5 active:bg-primary-soft/40 transition flex items-center justify-between"
                              onClick={() => setMaKhachChiTiet(k.maKH)}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-normal text-xs text-primary">{k.maKH}</span>
                                  <span className="text-[10px] text-muted">· {k.sale || 'Chưa gán'}</span>
                                </div>
                                <div className="text-[12px] text-foreground truncate max-w-[190px]">
                                  {k.tenKH}
                                </div>
                                <div className="text-[10px] text-muted mt-0.5">
                                  Hạn mức: {k.hmtd > 0 ? ty(k.hmtd) : 'Chưa cấp'}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="so text-xs font-normal text-risk-bad">
                                  {ty(k.tien)}
                                </div>
                                <div className="text-[10px] text-muted">
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
                <div className="border-b border-line/80 pb-2">
                  <h3 className="text-sm font-normal text-foreground">Danh mục Khách hàng</h3>
                  <p className="text-[11px] text-muted">Tìm kiếm & xem hồ sơ hạn mức, điểm tín dụng chi tiết</p>
                </div>

                {/* Search & Filter Bar */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      className="w-full rounded-xl border border-line bg-white shadow-card pl-9 pr-3 py-2 text-xs placeholder:text-muted focus:border-primary focus:outline-none"
                      placeholder="Tìm theo mã hoặc tên khách hàng…"
                      value={tuKhoa}
                      onChange={(e) => setTuKhoa(e.target.value)}
                    />
                    {tuKhoa && (
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-muted hover:text-subtle"
                        onClick={() => setTuKhoa('')}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Selects */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <select
                      className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-subtle"
                      value={locSaleMobile}
                      onChange={(e) => setLocSaleMobile(e.target.value)}
                    >
                      <option value="ALL">Mọi Sale</option>
                      {sales.map((s) => (
                        <option key={s} value={s}>{s || 'Chưa gán Sale'}</option>
                      ))}
                    </select>

                    <select
                      className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-subtle"
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
                <div className="flex items-center justify-between text-xs text-muted px-0.5">
                  <span>Tìm thấy <span>{danhSachKhachLoc.length}</span> khách hàng</span>
                  <span>Chạm thẻ để mở hồ sơ</span>
                </div>

                {/* Customer Cards List */}
                <div className="space-y-2">
                  {danhSachKhachLoc.slice(0, 40).map((k) => (
                    <div
                      key={k.maKH}
                      className="rounded-xl border border-line bg-white p-3 shadow-2xs active:bg-primary-soft/30 transition cursor-pointer"
                      onClick={() => setMaKhachChiTiet(k.maKH)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-normal text-xs text-primary">{k.maKH}</span>
                          <span className="text-[10px] text-muted">· {k.sale || 'Chưa gán'}</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded ${
                            k.hang === 'Tốt'
                              ? 'bg-risk-safe-soft text-risk-safe'
                              : k.hang === 'Trung bình'
                                ? 'bg-primary-soft text-primary'
                                : k.hang === 'Xấu'
                                  ? 'bg-risk-watch-soft text-risk-watch'
                                  : 'bg-risk-bad-soft text-risk-bad'
                          }`}
                        >
                          {k.hang} {k.diem != null ? `(${so1(k.diem)})` : ''}
                        </span>
                      </div>

                      <div className="text-[12px] text-foreground mt-1 truncate">
                        {tenKhach(k, chon.tay)}
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-2 pt-2 border-t border-line-soft text-[11px]">
                        <div>
                          <span className="text-muted">Dư nợ: </span>
                          <span className="so font-normal text-foreground">{ty(k.duNo)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-muted">Quá hạn: </span>
                          <span className="so font-normal text-risk-bad">{ty(k.quaHan)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {danhSachKhachLoc.length > 40 && (
                    <div className="py-2 text-center text-xs text-muted">
                      Đang hiển thị 40 / {danhSachKhachLoc.length} khách hàng. Vui lòng dùng ô tìm kiếm để lọc chính xác.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================== TAB 5: THÊM (MORE) ===================== */}
            {tabHienTai === 'them' && (
              <div className="space-y-3.5">
                <div className="border-b border-line/80 pb-2">
                  <h3 className="text-sm font-normal text-foreground">Phân hệ & Công cụ khác</h3>
                  <p className="text-[11px] text-muted">Báo cáo, nạp sổ và các phân hệ sắp có</p>
                </div>

                {/* Phân hệ chưa có dữ liệu nguồn: chỉ liệt kê, không có số */}
                <div className="rounded-xl border border-line bg-card p-3.5 shadow-card">
                  <h3 className="text-xs font-semibold text-foreground">Sắp có</h3>
                  <p className="mt-1 text-[11px] text-muted">Công nợ phải trả · Dòng tiền · Kế hoạch mua hàng · Thu tiền & phiếu thu · Sổ cái · Khóa kỳ · Lịch sử nạp · Cấu hình</p>
                </div>

                {/* Menu items */}
                <div className="rounded-xl border border-line bg-white overflow-hidden shadow-2xs divide-y divide-line-soft text-xs">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 text-left active:bg-background"
                    onClick={onMoIn}
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="h-4 w-4 text-primary" />
                      <span className="text-subtle">Xuất báo cáo PDF Ban Giám Đốc</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 text-left active:bg-background"
                    onClick={onMoNap}
                  >
                    <div className="flex items-center gap-2.5">
                      <UploadCloud className="h-4 w-4 text-risk-safe" />
                      <span className="text-subtle">Nạp sổ dữ liệu Excel mới</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 text-left active:bg-background"
                    onClick={onChuyenWeb}
                  >
                    <div className="flex items-center gap-2.5">
                      <Monitor className="h-4 w-4 text-primary" />
                      <span className="text-subtle">Chuyển sang Giao diện Bản Web</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 3. Mobile App Bottom Navigation Bar (Cố định ở chân trang) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-white/95 px-2 py-1 backdrop-blur">
        <button
          type="button"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
            tabHienTai === 'tongquan'
              ? 'text-primary'
              : 'text-muted hover:text-foreground'
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
              ? 'text-primary'
              : 'text-muted hover:text-foreground'
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
              ? 'text-risk-bad'
              : 'text-muted hover:text-foreground'
          }`}
          onClick={() => setTabHienTai('canhbao')}
        >
          <AlertTriangle className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Cảnh báo</span>
          <span className="absolute top-1 right-2.5 h-2 w-2 rounded-full bg-risk-bad ring-2 ring-white" />
        </button>

        <button
          type="button"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
            tabHienTai === 'khach'
              ? 'text-primary'
              : 'text-muted hover:text-foreground'
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
              ? 'text-primary'
              : 'text-muted hover:text-foreground'
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
