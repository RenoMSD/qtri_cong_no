import type { ReactNode } from 'react';
import type { Hang } from './lib/metrics';
import { MAU_HANG } from './mauSac';

// Thành phần giao diện dùng chung cho các màn theo wireframe (palette Indigo)

export type Sac = 'safe' | 'watch' | 'overdue' | 'bad' | 'info' | 'neutral' | 'primary';

const NHAN_SAC: Record<Sac, string> = {
  safe: 'bg-risk-safe-soft text-risk-safe',
  watch: 'bg-risk-watch-soft text-risk-watch',
  overdue: 'bg-risk-overdue-soft text-risk-overdue',
  bad: 'bg-risk-bad-soft text-risk-bad',
  info: 'bg-risk-info-soft text-risk-info',
  neutral: 'bg-line-soft text-subtle',
  primary: 'bg-primary-soft text-primary',
};

export function Nhan({ sac = 'neutral', children }: { sac?: Sac; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${NHAN_SAC[sac]}`}>{children}</span>;
}

const SAC_HANG: Record<Hang, Sac> = { 'Tốt': 'safe', 'Trung bình': 'info', 'Xấu': 'watch', 'Rất xấu': 'bad', 'Chưa chấm': 'neutral' };

export function NhanHang({ hang, diem }: { hang: Hang; diem?: number | null }) {
  return <Nhan sac={SAC_HANG[hang]}>{hang}{diem != null ? ` · ${diem.toLocaleString('vi-VN')}` : ''}</Nhan>;
}

/** Thẻ nội dung: tiêu đề, link «Chi tiết», dòng chân «Cập nhật…». */
export function The({
  tieu,
  phu,
  chiTiet,
  phai,
  chan,
  className = '',
  children,
}: {
  tieu?: ReactNode;
  phu?: ReactNode;
  chiTiet?: () => void;
  phai?: ReactNode;
  chan?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className={`flex min-w-0 flex-col rounded-2xl border border-line bg-card p-5 shadow-card ${className}`}>
      {tieu || chiTiet || phai ? (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            {tieu ? <h3 className="text-[15px] font-semibold text-foreground">{tieu}</h3> : null}
            {phu ? <p className="mt-0.5 text-[12px] text-muted">{phu}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            {phai}
            {chiTiet ? (
              <button type="button" onClick={chiTiet} className="cursor-pointer text-[11px] font-semibold tracking-[0.06em] text-primary uppercase hover:text-primary-dark">
                Chi tiết
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="min-w-0 flex-1">{children}</div>
      {chan ? <div className="mt-3 border-t border-line-soft pt-2.5 text-[11.5px] text-muted">{chan}</div> : null}
    </section>
  );
}

/** Chú giải dạng chấm màu. */
export function ChuGiaiCham({ ds }: { ds: { ten: string; mau: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[12px] text-subtle">
      {ds.map((d) => (
        <span key={d.ten} className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: d.mau }} />
          {d.ten}
        </span>
      ))}
    </div>
  );
}

/** Đường nhỏ trong thẻ KPI. */
export function DuongNho({ d, mau = '#818cf8', cao = 44 }: { d: number[]; mau?: string; cao?: number }) {
  if (d.length < 2) return null;
  const min = Math.min(...d);
  const max = Math.max(...d);
  const pts = d.map((v, i) => `${(i / (d.length - 1)) * 200},${cao - 4 - ((v - min) / (max - min || 1)) * (cao - 8)}`).join(' ');
  return (
    <svg viewBox={`0 0 200 ${cao}`} width="100%" height={cao} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={mau} strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Đồng hồ nửa vòng: các dải màu theo tỷ lệ 0..1, kim chỉ giá trị. */
export function DongHo({ tyLe, dai, rong = 160 }: { tyLe: number | null; dai: { den: number; mau: string }[]; rong?: number }) {
  const R = 50;
  const diem = (t: number) => {
    const a = Math.PI * (1 - t);
    return [60 + R * Math.cos(a), 60 - R * Math.sin(a)];
  };
  let tu = 0;
  const t = tyLe == null ? null : Math.max(0, Math.min(1, tyLe));
  const kim = t == null ? null : diem(t);
  return (
    <svg viewBox="0 0 120 66" width={rong} height={rong * 0.55} aria-hidden="true">
      {dai.map((d) => {
        const [x1, y1] = diem(tu);
        const [x2, y2] = diem(d.den);
        tu = d.den;
        return <path key={d.den} d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`} stroke={d.mau} strokeWidth={10} fill="none" />;
      })}
      {kim ? <line x1={60} y1={60} x2={60 + (kim[0] - 60) * 0.72} y2={60 + (kim[1] - 60) * 0.72} stroke="currentColor" strokeWidth={3} strokeLinecap="round" /> : null}
      <circle cx={60} cy={60} r={3.5} fill="currentColor" />
    </svg>
  );
}

/** Donut nhiều vòng đồng tâm, mỗi vòng một chỉ tiêu so với `max`. */
export function VongNhieu({ ds, giua, phuGiua, rong = 150 }: { ds: { ten: string; v: number; max: number; mau: string }[]; giua: ReactNode; phuGiua?: string; rong?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: rong, height: rong }}>
      <svg viewBox="0 0 100 100" width={rong} height={rong} aria-hidden="true">
        {ds.map((d, i) => {
          const r = 42 - i * 10;
          const chuVi = 2 * Math.PI * r;
          const phan = d.max > 0 ? Math.min(1, d.v / d.max) : 0;
          return (
            <g key={d.ten}>
              <circle cx={50} cy={50} r={r} fill="none" stroke="#f1f5f9" strokeWidth={7} />
              <circle cx={50} cy={50} r={r} fill="none" stroke={d.mau} strokeWidth={7} strokeLinecap="round" strokeDasharray={`${phan * chuVi} ${chuVi}`} transform="rotate(-90 50 50)" />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="so text-[20px] font-semibold text-foreground">{giua}</span>
        {phuGiua ? <span className="text-[10px] text-muted">{phuGiua}</span> : null}
      </div>
    </div>
  );
}

/** Danh sách thanh ngang có nhãn và giá trị. */
export function ThanhNgang({ ds, onChon }: { ds: { ten: string; v: number; hien: string; mau: string }[]; onChon?: (ten: string) => void }) {
  const max = Math.max(1, ...ds.map((d) => Math.abs(d.v)));
  return (
    <div className="flex flex-col gap-3">
      {ds.map((d) => (
        <button key={d.ten} type="button" disabled={!onChon} onClick={() => onChon?.(d.ten)} className="block w-full cursor-pointer text-left disabled:cursor-default">
          <div className="flex justify-between text-[12.5px]">
            <span className="truncate text-subtle">{d.ten}</span>
            <b className="so font-semibold text-foreground">{d.hien}</b>
          </div>
          <div className="mt-1 h-2 rounded-full bg-line-soft">
            <div className="h-full rounded-full" style={{ width: `${(Math.abs(d.v) / max) * 100}%`, background: d.mau }} />
          </div>
        </button>
      ))}
    </div>
  );
}

export function mauHang(h: Hang) {
  return MAU_HANG[h];
}
