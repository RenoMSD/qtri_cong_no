import { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CalendarRange,
  ChevronDown,
  Clock,
  CreditCard,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Printer,
  Receipt,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
  UploadCloud,
  Users,
  Wallet,
} from 'lucide-react';
import type { Hang } from './lib/metrics';
import type { Loc } from './soLieu';

export type ManId =
  | 'tongquan'
  | 'ar'
  | 'khach'
  | 'tuoi'
  | 'thuhoi'
  | 'ruiro'
  | 'kehoach'
  | 'phieuthu'
  | 'socal'
  | 'khoaky'
  | 'ap'
  | 'ap_ncc'
  | 'ap_tuoi'
  | 'ap_lich'
  | 'ap_pt'
  | 'ap_ck'
  | 'tien'
  | 'vi_the'
  | 'dong_tien'
  | 'fc13'
  | 'lech'
  | 'kich_ban'
  | 'nhu_cau'
  | 'kh_mua'
  | 'po'
  | 'tien_do'
  | 'ngan_sach'
  | 'lien_ap'
  | 'cb_ar'
  | 'cb_ap'
  | 'cb_tien'
  | 'cb_mua'
  | 'baocao'
  | 'nap';

const NHOM: { nhom: string; muc: { id: ManId; ten: string; icon: typeof LayoutDashboard }[] }[] = [
  { nhom: 'TỔNG QUAN ĐIỀU HÀNH', muc: [{ id: 'tongquan', ten: 'Tổng quan Điều hành', icon: LayoutDashboard }] },
  {
    nhom: 'CÔNG NỢ PHẢI THU (AR)',
    muc: [
      { id: 'ar', ten: 'AR Dashboard', icon: BarChart3 },
      { id: 'khach', ten: 'Khách hàng và hồ sơ', icon: Users },
      { id: 'tuoi', ten: 'Tuổi nợ (11 nhóm)', icon: Clock },
      { id: 'thuhoi', ten: 'Phân tích thu hồi', icon: TrendingUp },
      { id: 'ruiro', ten: 'Rủi ro và hạn mức', icon: ShieldAlert },
      { id: 'kehoach', ten: 'Kế hoạch tuần và dự báo thu', icon: CalendarRange },
      { id: 'phieuthu', ten: 'Thu tiền và phiếu thu', icon: Receipt },
      { id: 'socal', ten: 'Sổ cái kế toán', icon: FileText },
      { id: 'khoaky', ten: 'Khóa kỳ và đối chiếu', icon: FileSpreadsheet },
    ],
  },
  {
    nhom: 'CÔNG NỢ PHẢI TRẢ (AP)',
    muc: [
      { id: 'ap', ten: 'Dashboard AP', icon: CreditCard },
      { id: 'ap_ncc', ten: 'Nhà cung cấp', icon: Users },
      { id: 'ap_tuoi', ten: 'Aging AP', icon: Clock },
      { id: 'ap_lich', ten: 'Lịch thanh toán', icon: CalendarRange },
      { id: 'ap_pt', ten: 'Phân tích AP', icon: BarChart3 },
      { id: 'ap_ck', ten: 'Cam kết thanh toán', icon: FileText },
    ],
  },
  {
    nhom: 'QUẢN TRỊ DÒNG TIỀN',
    muc: [
      { id: 'tien', ten: 'Dashboard dòng tiền', icon: Wallet },
      { id: 'vi_the', ten: 'Cash position', icon: FileSpreadsheet },
      { id: 'dong_tien', ten: 'Cash flow', icon: TrendingUp },
      { id: 'fc13', ten: 'Forecast 13 tuần', icon: CalendarRange },
      { id: 'lech', ten: 'Cash gap', icon: AlertTriangle },
      { id: 'kich_ban', ten: 'Kịch bản', icon: FileText },
    ],
  },
  {
    nhom: 'KẾ HOẠCH MUA HÀNG',
    muc: [
      { id: 'nhu_cau', ten: 'Nhu cầu mua hàng', icon: ShoppingCart },
      { id: 'kh_mua', ten: 'Kế hoạch mua', icon: FileText },
      { id: 'po', ten: 'Đơn đặt mua', icon: FileSpreadsheet },
      { id: 'tien_do', ten: 'Tiến độ thực hiện', icon: TrendingUp },
      { id: 'ngan_sach', ten: 'Ngân sách mua', icon: Wallet },
      { id: 'lien_ap', ten: 'Liên kết AP', icon: CreditCard },
    ],
  },
  {
    nhom: 'CẢNH BÁO',
    muc: [
      { id: 'cb_ar', ten: 'Cảnh báo AR', icon: AlertTriangle },
      { id: 'cb_ap', ten: 'Cảnh báo AP', icon: AlertTriangle },
      { id: 'cb_tien', ten: 'Cảnh báo dòng tiền', icon: AlertTriangle },
      { id: 'cb_mua', ten: 'Cảnh báo mua hàng', icon: AlertTriangle },
    ],
  },
  { nhom: 'BÁO CÁO', muc: [{ id: 'baocao', ten: 'Báo cáo', icon: Printer }] },
  { nhom: 'QUẢN TRỊ DỮ LIỆU', muc: [{ id: 'nap', ten: 'Nạp dữ liệu', icon: UploadCloud }] },
];

const TRONG = new Set<ManId>([
  'phieuthu', 'socal', 'khoaky', 'ap', 'ap_ncc', 'ap_tuoi', 'ap_lich', 'ap_pt', 'ap_ck',
  'tien', 'vi_the', 'dong_tien', 'fc13', 'lech', 'kich_ban', 'nhu_cau', 'kh_mua', 'po',
  'tien_do', 'ngan_sach', 'lien_ap', 'cb_ap', 'cb_tien', 'cb_mua',
]);

export function laKhungTrong(id: ManId) {
  return TRONG.has(id);
}

export function tenMan(id: ManId) {
  for (const n of NHOM) {
    const m = n.muc.find((x) => x.id === id);
    if (m) return m.ten;
  }
  return id;
}

export function ThanhBen({ man, chon }: { man: ManId; chon: (id: ManId) => void }) {
  const [thuGon, setThuGon] = useState(() => {
    try {
      return localStorage.getItem('sidebar_thu_gon') === 'true';
    } catch {
      return false;
    }
  });
  const [mo, setMo] = useState<Record<string, boolean>>({
    'TỔNG QUAN ĐIỀU HÀNH': true,
    'CÔNG NỢ PHẢI THU (AR)': true,
    'CẢNH BÁO': true,
    'BÁO CÁO': true,
    'QUẢN TRỊ DỮ LIỆU': true,
  });

  function toggleThuGon() {
    setThuGon((v) => {
      const next = !v;
      try {
        localStorage.setItem('sidebar_thu_gon', String(next));
      } catch {}
      return next;
    });
  }

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 select-none ${
        thuGon ? 'w-16' : 'w-64'
      }`}
    >
      <div
        className={`flex h-12 items-center border-b border-slate-100 ${
          thuGon ? 'justify-center px-1' : 'justify-between px-3.5'
        }`}
      >
        {!thuGon && (
          <div className="truncate text-sm font-bold text-[#0073E6]">
            Tân Phú Cường
          </div>
        )}
        <button
          type="button"
          className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#0073E6] transition"
          onClick={toggleThuGon}
          title={thuGon ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {thuGon ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className={`flex-1 overflow-y-auto ${thuGon ? 'px-2 py-2 space-y-1' : 'px-2 py-2'}`}>
        {NHOM.map((n) => {
          if (thuGon) {
            return (
              <div key={n.nhom} className="py-1 border-b border-slate-100/70 last:border-none">
                {n.muc.map((m) => {
                  const Icon = m.icon;
                  const bat = man === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      title={m.ten}
                      onClick={() => chon(m.id)}
                      className={`cursor-pointer mb-1 flex w-full items-center justify-center rounded-lg p-2 text-sm transition ${
                        bat
                          ? 'bg-[#0073E6] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                    </button>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={n.nhom} className="mb-2">
              <button
                type="button"
                className="cursor-pointer flex w-full items-center justify-between px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-400 hover:text-slate-600"
                onClick={() => setMo((s) => ({ ...s, [n.nhom]: !s[n.nhom] }))}
              >
                <span className="truncate">{n.nhom}</span>
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${mo[n.nhom] ? '' : '-rotate-90'}`} />
              </button>
              {mo[n.nhom]
                ? n.muc.map((m) => {
                    const Icon = m.icon;
                    const bat = man === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => chon(m.id)}
                        className={`cursor-pointer mb-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${
                          bat ? 'bg-[#0073E6] text-white shadow-xs font-medium' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="leading-tight truncate">{m.ten}</span>
                      </button>
                    );
                  })
                : null}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-2">
        <button
          type="button"
          onClick={toggleThuGon}
          className={`flex w-full items-center gap-2 rounded-lg p-2 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition ${
            thuGon ? 'justify-center' : 'justify-between'
          }`}
          title={thuGon ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {!thuGon && <span>Thu gọn thanh điều hướng</span>}
          {thuGon ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}

const HANG: Array<Hang | 'ALL'> = ['ALL', 'Tốt', 'Trung bình', 'Xấu', 'Rất xấu'];

export function LocBar({ sales, loc, setLoc }: { sales: string[]; loc: Loc; setLoc: (l: Loc) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" value={loc.sale} onChange={(e) => setLoc({ ...loc, sale: e.target.value })}>
        <option value="ALL">Mọi Sale</option>
        {sales.map((s) => (
          <option key={s} value={s}>{s || 'Chưa gán Sale'}</option>
        ))}
      </select>
      <select className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" value={loc.hang} onChange={(e) => setLoc({ ...loc, hang: e.target.value })}>
        {HANG.map((h) => (
          <option key={h} value={h}>{h === 'ALL' ? 'Mọi hạng' : h}</option>
        ))}
      </select>
      <input className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" placeholder="Mã hoặc tên" value={loc.q} onChange={(e) => setLoc({ ...loc, q: e.target.value })} />
    </div>
  );
}

export function ChuaNap({ chu = 'Chưa nạp sổ' }: { chu?: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">{chu}</div>;
}

export function ChuaSo({ ten }: { ten: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-lg font-semibold">{ten}</h2>
      <p className="mt-2 text-sm text-slate-500">Chưa có sổ nguồn</p>
    </section>
  );
}
