import { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  ChevronDown,
  Clock,
  CreditCard,
  History,
  LayoutDashboard,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  Printer,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingCart,
  UploadCloud,
  Users,
  Wallet,
  FileCheck2,
} from 'lucide-react';
import type { Hang } from './lib/metrics';
import type { Loc } from './soLieu';

export type ManSapCoId = 'ap' | 'tien' | 'mua' | 'phieuthu' | 'socai' | 'khoaky' | 'lichsu' | 'cauhinh';
export type ManId = 'tongquan' | 'tuoi' | 'tindung' | 'canhbao' | 'khach' | 'baocao' | 'nap' | ManSapCoId;

type Muc = { id: ManId; ten: string; icon: typeof LayoutDashboard };

const NHOM: { nhom: string; khoa?: boolean; muc: Muc[] }[] = [
  {
    nhom: 'Công nợ phải thu',
    muc: [
      { id: 'tongquan', ten: 'Tổng quan', icon: LayoutDashboard },
      { id: 'tuoi', ten: 'Tuổi nợ & thu hồi', icon: Clock },
      { id: 'tindung', ten: 'Tín dụng & hạn mức', icon: ShieldCheck },
      { id: 'canhbao', ten: 'Cảnh báo', icon: AlertTriangle },
      { id: 'khach', ten: 'Khách hàng', icon: Users },
    ],
  },
  {
    nhom: 'Công cụ',
    muc: [
      { id: 'baocao', ten: 'Báo cáo', icon: Printer },
      { id: 'nap', ten: 'Nạp dữ liệu', icon: UploadCloud },
    ],
  },
  {
    nhom: 'Sắp có',
    khoa: true,
    muc: [
      { id: 'ap', ten: 'Công nợ phải trả', icon: CreditCard },
      { id: 'tien', ten: 'Dòng tiền', icon: Wallet },
      { id: 'mua', ten: 'Kế hoạch mua hàng', icon: ShoppingCart },
      { id: 'phieuthu', ten: 'Thu tiền & phiếu thu', icon: Receipt },
      { id: 'socai', ten: 'Sổ cái kế toán', icon: BookOpen },
      { id: 'khoaky', ten: 'Khóa kỳ & đối chiếu', icon: FileCheck2 },
      { id: 'lichsu', ten: 'Lịch sử nạp', icon: History },
      { id: 'cauhinh', ten: 'Cấu hình', icon: Settings },
    ],
  },
];

const SAP_CO = new Set<ManId>(NHOM.filter((n) => n.khoa).flatMap((n) => n.muc.map((m) => m.id)));

export function laSapCo(id: ManId): id is ManSapCoId {
  return SAP_CO.has(id);
}

export function tenMan(id: ManId) {
  for (const n of NHOM) {
    const m = n.muc.find((x) => x.id === id);
    if (m) return m.ten;
  }
  return id;
}

const MO_TA: Record<ManSapCoId, { tieu: string; y: string[] }> = {
  ap: {
    tieu: 'Theo dõi công nợ nhà cung cấp song song với phải thu.',
    y: ['Dashboard phải trả, tuổi nợ phải trả theo nhà cung cấp', 'Lịch thanh toán và cam kết thanh toán', 'Cảnh báo khoản sắp đến hạn trả'],
  },
  tien: {
    tieu: 'Dự báo dòng tiền thu từ DSO và lịch thanh toán.',
    y: ['Số dư tiền và lưu chuyển tiền theo tuần', 'Dự báo 13 tuần, phát hiện tuần thiếu hụt tiền', 'So sánh kịch bản thu nợ'],
  },
  mua: {
    tieu: 'Kế hoạch mua hàng gắn với công nợ phải trả.',
    y: ['Nhu cầu, kế hoạch mua và đơn đặt mua', 'Tiến độ thực hiện và ngân sách mua', 'Liên kết sang công nợ phải trả'],
  },
  phieuthu: {
    tieu: 'Ghi nhận tiền thu và phân bổ vào hóa đơn.',
    y: ['Lập phiếu thu theo khách', 'Tự cấn trừ vào hóa đơn cũ nhất', 'Đối chiếu với sao kê ngân hàng'],
  },
  socai: {
    tieu: 'Bút toán công nợ trên sổ cái tài khoản 131.',
    y: ['Sổ chi tiết 131 theo khách', 'Đối chiếu sổ cái với sổ công nợ', 'Xuất sổ theo mẫu kế toán'],
  },
  khoaky: {
    tieu: 'Khóa số liệu từng kỳ sau khi kế toán xác nhận.',
    y: ['Khóa kỳ đã đối chiếu khớp', 'Không cho nạp đè kỳ đã khóa', 'Biên bản đối chiếu theo kỳ'],
  },
  lichsu: {
    tieu: 'Lưu nhiều kỳ dữ liệu để so sánh và tải lại.',
    y: ['Danh sách các kỳ đã nạp, tải lại file gốc', 'So sánh dư nợ, quá hạn, DSO giữa các kỳ', 'Xóa kỳ kèm dữ liệu liên quan'],
  },
  cauhinh: {
    tieu: 'Tùy chỉnh tham số tính toán ngay trên app.',
    y: ['11 nhóm tuổi nợ và trọng số rủi ro', 'Ngưỡng cảnh báo và cơ sở tính DSO', 'Hồ sơ ánh xạ cột Excel'],
  },
};

export function ManSapCo({ id }: { id: ManSapCoId }) {
  const m = MO_TA[id];
  return (
    <section className="animate-fade-up rounded-the border border-line bg-card p-8 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Lock className="size-5" />
        </span>
        <div>
          <h2 className="text-[18px] font-semibold text-foreground">{tenMan(id)}</h2>
          <span className="rounded-md bg-risk-watch-soft px-2 py-0.5 text-[11px] text-risk-watch">Sắp có</span>
        </div>
      </div>
      <p className="mt-4 text-[13px] text-subtle">{m.tieu}</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-[13px] text-subtle">
        {m.y.map((y) => <li key={y}>{y}</li>)}
      </ul>
      <p className="mt-5 text-[12px] text-muted">Phân hệ này chưa có dữ liệu nguồn nên đang khóa. Hiện app chỉ dùng số liệu thật của công nợ phải thu.</p>
      <div className="mt-6 grid grid-cols-1 gap-3 border-t border-line-soft pt-5 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(MO_TA) as ManSapCoId[]).filter((k) => k !== id).map((k) => (
          <div key={k} className="rounded-xl border border-line bg-background p-3.5">
            <div className="flex items-center justify-between gap-2">
              <b className="text-[13px] font-semibold">{tenMan(k)}</b>
              <span className="rounded-full bg-risk-watch-soft px-2 py-0.5 text-[10.5px] text-risk-watch">Sắp có</span>
            </div>
            <p className="mt-1.5 text-[12px] text-subtle">{MO_TA[k].tieu}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-xl bg-sidebar px-4 py-3 text-[12.5px] text-sidebar-fg">
        <b className="text-white">Thứ tự đề xuất mở khóa:</b> Lịch sử nạp (so sánh kỳ) → Cấu hình → Công nợ phải trả → Dòng tiền
      </p>
    </section>
  );
}

export function ThanhBen({ man, chon }: { man: ManId; chon: (id: ManId) => void }) {
  const [thuGon, setThuGon] = useState(() => {
    try {
      return localStorage.getItem('sidebar_thu_gon') === 'true';
    } catch {
      return false;
    }
  });
  const [mo, setMo] = useState<Record<string, boolean>>(() => Object.fromEntries(NHOM.map((n) => [n.nhom, !n.khoa])));

  function toggleThuGon() {
    setThuGon((v) => {
      const next = !v;
      try {
        localStorage.setItem('sidebar_thu_gon', String(next));
      } catch {}
      return next;
    });
  }

  function NutMuc({ m, khoa }: { m: Muc; khoa?: boolean }) {
    const Icon = m.icon;
    const bat = man === m.id;
    const mau = bat
      ? 'bg-white/14 text-white shadow-[inset_3px_0_0_var(--color-primary-glow)]'
      : khoa
        ? 'text-sidebar-fg/45 hover:bg-white/5'
        : 'text-sidebar-fg hover:bg-white/8 hover:text-white';
    return (
      <button
        type="button"
        title={thuGon ? `${m.ten}${khoa ? ' (sắp có)' : ''}` : undefined}
        onClick={() => chon(m.id)}
        className={`mb-0.5 flex h-9 w-full cursor-pointer items-center rounded-lg text-left text-[13px] transition-colors ${thuGon ? 'justify-center' : 'gap-2.5 px-3'} ${mau}`}
      >
        <Icon className="size-4 shrink-0" />
        {!thuGon ? <span className="truncate">{m.ten}</span> : null}
        {!thuGon && khoa ? <Lock className="ml-auto size-3 shrink-0 opacity-70" /> : null}
      </button>
    );
  }

  return (
    <aside className={`nen-sidebar relative z-30 flex h-screen shrink-0 flex-col transition-[width] duration-300 select-none ${thuGon ? 'w-[72px]' : 'w-[248px]'}`}>
      <div className={`flex h-[68px] items-center gap-3 border-b border-white/10 ${thuGon ? 'justify-center px-2' : 'px-5'}`}>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-glow to-primary text-white shadow-elegant">
          <BarChart3 className="size-5" />
        </div>
        {!thuGon && (
          <div>
            <div className="text-[15px] font-semibold tracking-[-0.01em] text-white">Tân Phú Cường</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-sidebar-fg/70">Quản trị công nợ</div>
          </div>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto ${thuGon ? 'space-y-1 px-2 py-3' : 'px-3 py-4'}`}>
        {NHOM.map((n) => (
          <div key={n.nhom} className={thuGon ? 'border-b border-white/10 py-1 last:border-none' : 'mb-3'}>
            {!thuGon ? (
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.12em] text-sidebar-fg/55 hover:text-sidebar-fg"
                onClick={() => setMo((s) => ({ ...s, [n.nhom]: !s[n.nhom] }))}
              >
                <span className="min-w-0 flex-1 truncate">{n.nhom}</span>
                {n.khoa ? <Lock className="size-3" /> : null}
                <ChevronDown className={`size-3.5 shrink-0 transition-transform ${mo[n.nhom] ? '' : '-rotate-90'}`} />
              </button>
            ) : null}
            {thuGon || mo[n.nhom] ? n.muc.map((m) => <NutMuc key={m.id} m={m} khoa={n.khoa} />) : null}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={toggleThuGon}
          className={`flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[12px] text-sidebar-fg/70 hover:bg-white/8 hover:text-white ${thuGon ? 'justify-center' : ''}`}
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
const O_LOC = 'h-9 rounded-lg border border-line bg-card px-3 text-[12px] text-subtle';

export function LocBar({ sales, loc, setLoc }: { sales: string[]; loc: Loc; setLoc: (l: Loc) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className={O_LOC} value={loc.sale} onChange={(e) => setLoc({ ...loc, sale: e.target.value })}>
        <option value="ALL">Mọi Sale</option>
        {sales.map((s) => (
          <option key={s} value={s}>{s || 'Chưa gán Sale'}</option>
        ))}
      </select>
      <select className={O_LOC} value={loc.hang} onChange={(e) => setLoc({ ...loc, hang: e.target.value })}>
        {HANG.map((h) => (
          <option key={h} value={h}>{h === 'ALL' ? 'Mọi hạng' : h}</option>
        ))}
      </select>
      <input className={O_LOC} placeholder="Mã hoặc tên" value={loc.q} onChange={(e) => setLoc({ ...loc, q: e.target.value })} />
    </div>
  );
}

/** Thanh tab dùng chung trong một màn. */
export function ThanhTab<T extends string>({ tab, setTab, ds }: { tab: T; setTab: (t: T) => void; ds: { id: T; ten: string }[] }) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-card p-1 shadow-card">
      {ds.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => setTab(d.id)}
          className={`h-8 cursor-pointer rounded-md px-3 text-[12px] transition-colors ${tab === d.id ? 'bg-primary text-white' : 'text-subtle hover:bg-primary-soft hover:text-primary'}`}
        >
          {d.ten}
        </button>
      ))}
    </div>
  );
}

export function ChuaNap({ chu = 'Chưa nạp sổ' }: { chu?: string }) {
  return <div className="rounded-the border border-dashed border-line bg-card p-8 text-[13px] text-muted">{chu}</div>;
}

export function ChuaSo({ ten }: { ten: string }) {
  return (
    <section className="rounded-the border border-line bg-card p-8 shadow-card">
      <h2 className="text-[16px] font-semibold text-foreground">{ten}</h2>
      <p className="mt-2 text-[12px] text-muted">Chưa có sổ nguồn</p>
    </section>
  );
}
