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
  { nhom: 'Tổng quan điều hành', muc: [{ id: 'tongquan', ten: 'Tổng quan', icon: LayoutDashboard }] },
  {
    nhom: 'Công nợ phải thu',
    muc: [
      { id: 'ar', ten: 'Tổng quan phải thu', icon: BarChart3 },
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
    nhom: 'Công nợ phải trả',
    muc: [
      { id: 'ap', ten: 'Tổng quan phải trả', icon: CreditCard },
      { id: 'ap_ncc', ten: 'Nhà cung cấp', icon: Users },
      { id: 'ap_tuoi', ten: 'Tuổi nợ phải trả', icon: Clock },
      { id: 'ap_lich', ten: 'Lịch thanh toán', icon: CalendarRange },
      { id: 'ap_pt', ten: 'Phân tích phải trả', icon: BarChart3 },
      { id: 'ap_ck', ten: 'Cam kết thanh toán', icon: FileText },
    ],
  },
  {
    nhom: 'Quản trị dòng tiền',
    muc: [
      { id: 'tien', ten: 'Tổng quan dòng tiền', icon: Wallet },
      { id: 'vi_the', ten: 'Số dư tiền', icon: FileSpreadsheet },
      { id: 'dong_tien', ten: 'Lưu chuyển tiền', icon: TrendingUp },
      { id: 'fc13', ten: 'Dự báo 13 tuần', icon: CalendarRange },
      { id: 'lech', ten: 'Thiếu hụt tiền', icon: AlertTriangle },
      { id: 'kich_ban', ten: 'Kịch bản', icon: FileText },
    ],
  },
  {
    nhom: 'Kế hoạch mua hàng',
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
    nhom: 'Cảnh báo',
    muc: [
      { id: 'cb_ar', ten: 'Cảnh báo AR', icon: AlertTriangle },
      { id: 'cb_ap', ten: 'Cảnh báo AP', icon: AlertTriangle },
      { id: 'cb_tien', ten: 'Cảnh báo dòng tiền', icon: AlertTriangle },
      { id: 'cb_mua', ten: 'Cảnh báo mua hàng', icon: AlertTriangle },
    ],
  },
  { nhom: 'Báo cáo', muc: [{ id: 'baocao', ten: 'Báo cáo', icon: Printer }] },
  { nhom: 'Quản trị dữ liệu', muc: [{ id: 'nap', ten: 'Nạp dữ liệu', icon: UploadCloud }] },
];

const TRONG = new Set<ManId>([
  'phieuthu', 'socal', 'khoaky', 'ap', 'ap_ncc', 'ap_tuoi', 'ap_lich', 'ap_pt', 'ap_ck',
  'tien', 'vi_the', 'dong_tien', 'fc13', 'lech', 'kich_ban', 'nhu_cau', 'kh_mua', 'po',
  'tien_do', 'ngan_sach', 'lien_ap', 'cb_ap', 'cb_tien', 'cb_mua',
]);

export function laKhungTrong(id: ManId) {
  return TRONG.has(id);
}

function nhomSapCo(muc: { id: ManId }[]) {
  return muc.every((m) => TRONG.has(m.id));
}

function NhanSapCo() {
  return (
    <span className="ml-auto shrink-0 rounded bg-[#f1f4f7] px-1.5 py-0.5 text-[10px] font-normal text-[#8b98a7]">Sắp có</span>
  );
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
  const [mo, setMo] = useState<Record<string, boolean>>(() => Object.fromEntries(NHOM.map((n) => [n.nhom, !nhomSapCo(n.muc)])));

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
      className={`relative z-30 flex h-screen shrink-0 flex-col border-r border-[#dfe6ec] bg-[#fbfcfd] transition-[width] duration-300 select-none ${
        thuGon ? 'w-[78px]' : 'w-[262px]'
      }`}
    >
      <div className={`flex h-[72px] items-center gap-3 border-b border-[#e8edf2] ${thuGon ? 'justify-center px-2' : 'px-5'}`}>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#1769aa] text-white">
          <BarChart3 className="size-5" />
        </div>
        {!thuGon && (
          <div>
            <div className="text-[16px] font-semibold tracking-[-0.02em] text-[#17212b]">Tân Phú Cường</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#8b98a7]">Quản trị công nợ</div>
          </div>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto ${thuGon ? 'space-y-1 px-2 py-3' : 'px-3 py-4'}`}>
        {NHOM.map((n) => {
          if (thuGon) {
            return (
              <div key={n.nhom} className="border-b border-[#e8edf2] py-1 last:border-none">
                {n.muc.map((m) => {
                  const Icon = m.icon;
                  const bat = man === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      title={TRONG.has(m.id) ? `${m.ten} (sắp có)` : m.ten}
                      onClick={() => chon(m.id)}
                      className={`mb-1 flex h-10 w-full cursor-pointer items-center justify-center rounded-lg transition ${
                        bat ? 'bg-[#e8f2fb] text-[#1769aa]' : 'text-[#697887] hover:bg-[#f0f4f7]'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
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
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-semibold tracking-[-0.01em] text-[#3d4f5f] hover:bg-[#f3f6f8]"
                onClick={() => setMo((s) => ({ ...s, [n.nhom]: !s[n.nhom] }))}
              >
                <span className="min-w-0 flex-1 truncate">{n.nhom}</span>
                {nhomSapCo(n.muc) ? <NhanSapCo /> : null}
                <ChevronDown className={`size-3.5 shrink-0 transition-transform ${mo[n.nhom] ? '' : '-rotate-90'}`} />
              </button>
              {mo[n.nhom]
                ? n.muc.map((m) => {
                    const Icon = m.icon;
                    const bat = man === m.id;
                    const sapCo = TRONG.has(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => chon(m.id)}
                        className={`mb-0.5 flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-3 text-left text-[13px] transition-colors ${
                          bat ? 'bg-[#e8f2fb] text-[#1769aa]' : sapCo ? 'text-[#8b98a7] hover:bg-[#f0f4f7]' : 'text-[#24323e] hover:bg-[#f0f4f7]'
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{m.ten}</span>
                        {sapCo && !nhomSapCo(n.muc) ? <NhanSapCo /> : null}
                      </button>
                    );
                  })
                : null}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-[#e8edf2] p-3">
        <button
          type="button"
          onClick={toggleThuGon}
          className={`flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[12px] text-[#697887] hover:bg-[#f0f4f7] ${thuGon ? 'justify-center' : ''}`}
          title={thuGon ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {thuGon ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          {!thuGon && <span>Thu gọn</span>}
        </button>
      </div>
    </aside>
  );
}

const HANG: Array<Hang | 'ALL'> = ['ALL', 'Tốt', 'Trung bình', 'Xấu', 'Rất xấu'];

export function LocBar({ sales, loc, setLoc }: { sales: string[]; loc: Loc; setLoc: (l: Loc) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className="h-9 rounded-lg border border-[#dfe6ec] bg-white px-3 text-[12px] text-[#506170]" value={loc.sale} onChange={(e) => setLoc({ ...loc, sale: e.target.value })}>
        <option value="ALL">Mọi Sale</option>
        {sales.map((s) => (
          <option key={s} value={s}>{s || 'Chưa gán Sale'}</option>
        ))}
      </select>
      <select className="h-9 rounded-lg border border-[#dfe6ec] bg-white px-3 text-[12px] text-[#506170]" value={loc.hang} onChange={(e) => setLoc({ ...loc, hang: e.target.value })}>
        {HANG.map((h) => (
          <option key={h} value={h}>{h === 'ALL' ? 'Mọi hạng' : h}</option>
        ))}
      </select>
      <input className="h-9 rounded-lg border border-[#dfe6ec] bg-white px-3 text-[12px] text-[#506170]" placeholder="Mã hoặc tên" value={loc.q} onChange={(e) => setLoc({ ...loc, q: e.target.value })} />
    </div>
  );
}

export function ChuaNap({ chu = 'Chưa nạp sổ' }: { chu?: string }) {
  return <div className="rounded-xl border border-dashed border-[#dfe6ec] bg-white p-8 text-[13px] text-[#697887]">{chu}</div>;
}

export function ChuaSo({ ten }: { ten: string }) {
  return (
    <section className="rounded-xl border border-[#dfe6ec] bg-white p-8 shadow-[0_1px_2px_rgba(20,40,60,0.03)]">
      <h2 className="text-[16px] font-semibold text-[#233543]">{ten}</h2>
      <p className="mt-2 text-[12px] text-[#81909d]">Chưa có sổ nguồn</p>
    </section>
  );
}
