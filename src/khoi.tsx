import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ty } from './format';
import { THANG_DIEM, thangDiem } from './mauDiem';
import type { SoKhoi } from './soLieu';
import { DAY_MAU as MAU, MAU as SAC, MAU_HANG } from './mauSac';



export function truc(v: number) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(v / 1e9);
}

export function NhanCot({ x, y, width, value }: { x?: number; y?: number; width?: number; value?: unknown }) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n === 0) return null;
  const t = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(n / 1e9);
  const yy = Math.max(12, (y ?? 0) - 4);
  return (
    <text x={(x ?? 0) + (width ?? 0) / 2} y={yy} textAnchor="middle" fontSize={10} fill={SAC.subtle} fontWeight="400">
      {t}
    </text>
  );
}

export function mienY(ds: number[]): [number, number] {
  const min = Math.min(0, ...ds);
  const max = Math.max(0, ...ds);
  const dem = Math.max(max - min, 1);
  return [min < 0 ? min - dem * 0.08 : 0, max + dem * 0.25];
}

function Tip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string; payload?: { hien?: string } }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow">
      <div className="mb-1">{label}</div>
      {payload.map((p) => {
        const hien = (p.payload as { hien?: string } | undefined)?.hien;
        return (
          <div key={p.name} style={{ color: p.color }}>
            {p.name}: {hien || ty(Number(p.value) || 0)}
          </div>
        );
      })}
    </div>
  );
}

export function The({ tieu, phu, children }: { tieu: string; phu?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-card">
      <h3 className="text-[16px] font-semibold text-foreground">{tieu}</h3>
      {phu ? <p className="mt-1 text-[12px] text-muted">{phu}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Cao({ children, lop = 'h-80' }: { children: ReactNode; lop?: string }) {
  return <div className={`${lop} w-full min-w-0`}>{children}</div>;
}

export function BangNguong({ muc }: { muc: number | null }) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
      <h3 className="px-5 pt-5 text-[16px] font-semibold text-foreground">Ngưỡng cảnh báo hạn mức</h3>
      <table className="mt-3 w-full text-left text-[13px]">
        <thead>
          <tr className="text-[12px] text-muted">
            <th className="px-5 py-2 font-normal">Ngưỡng</th>
            <th className="px-3 py-2 font-normal">Giá trị (%)</th>
            <th className="px-3 py-2 font-normal">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {THANG_DIEM.map((t) => (
            <tr key={t.muc} style={{ background: t.nen, color: t.chu }} className={muc === t.muc ? 'outline outline-2 outline-offset-[-2px] outline-slate-900' : undefined}>
              <td className="px-5 py-2">{t.muc}</td>
              <td className="px-3 py-2">{t.gia}</td>
              <td className="px-3 py-2">{t.hanh}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function Khoi({
  so,
  onThe,
  onMa,
  onChu,
}: {
  so: SoKhoi;
  onThe?: (id: string) => void;
  onMa?: (ma: string) => void;
  onChu?: (van: string) => void;
}) {
  if (so.loai === 'trong') {
    return (
      <The tieu={so.tieu}>
        <p className="text-sm text-muted">{so.dong}</p>
      </The>
    );
  }
  if (so.loai === 'kpi') {
    const mucHm = so.o.find((o) => o.n === 'Ngưỡng hạn mức')?.muc ?? null;
    return (
      <The tieu={so.tieu}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {so.o.map((o) => {
            const mau = o.muc == null ? null : thangDiem(o.muc);
            return (
              <div key={o.n} className="rounded-lg px-3 py-2" style={mau ? { background: mau.nen, color: mau.chu } : { background: SAC.nen }}>
                <div className="text-xs" style={mau ? undefined : { color: SAC.muted }}>{o.n}</div>
                <div className="so mt-1 text-[15px] font-normal" style={mau ? undefined : { color: SAC.foreground }}>{o.v}</div>
              </div>
            );
          })}
        </div>
        {so.tieu === 'Hạn mức của khách' ? (
          <div className="mt-3">
            <BangNguong muc={mucHm} />
          </div>
        ) : null}
      </The>
    );
  }
  if (so.loai === 'chu') {
    return (
      <The tieu={so.tieu}>
        {onChu ? (
          <textarea
            className="min-h-24 w-full rounded-lg border border-line p-2 text-sm"
            value={so.van}
            placeholder="Nhập ghi chú. Số tiền không ghi ở đây."
            onChange={(e) => onChu(e.target.value)}
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm text-subtle">{so.van.trim() || 'Chưa ghi'}</p>
        )}
      </The>
    );
  }
  if (so.loai === 'the') {
    const cols = so.d.length === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 xl:grid-cols-3';
    return (
      <The tieu={so.tieu}>
        <div className={`grid gap-3 ${cols}`}>
          {so.d.length === 0 ? <p className="text-sm text-muted">Chưa có dữ liệu.</p> : null}
          {so.d.map((t) => (
            <button
              key={t.id || t.ten}
              type="button"
              className="rounded-lg border border-line bg-background/50 p-3 text-left transition hover:border-primary hover:bg-primary-soft/20"
              onClick={() => onThe?.(t.id)}
            >
              <div className="text-[13px] text-subtle">{t.ten}</div>
              <div className="mt-2 space-y-1">
                {t.dong.map((d, di) => (
                  <div key={d} className={`so text-xs ${di === 0 ? 'text-subtle' : 'text-primary'}`}>
                    {d}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </The>
    );
  }
  if (so.loai === 'bang') {
    return (
      <The tieu={so.tieu}>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-background text-muted">
              <tr>
                {so.c.map((c) => (
                  <th key={c} className="px-2 py-1">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {so.d.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-muted" colSpan={so.c.length}>
                    Không có dòng.
                  </td>
                </tr>
              ) : null}
              {so.d.map((dong, i) => (
                <tr key={`${dong[0]}-${i}`} className="border-t border-line-soft">
                  {dong.map((cell, j) => (
                    <td key={j} className="so px-2 py-1">
                      {j === 0 && onMa && so.ma ? (
                        <button type="button" className="text-primary underline" onClick={() => onMa(so.ma![i])}>
                          {cell}
                        </button>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </The>
    );
  }
  if (so.loai === 'cot') {
    return (
      <The tieu={so.tieu} phu={so.phu}>
        {so.d.length === 0 ? (
          <p className="text-sm text-muted">Chưa có số theo tháng.</p>
        ) : (
          <div>
            <Cao lop="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={so.d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={SAC.line} />
                  <XAxis dataKey="n" interval={0} angle={-30} textAnchor="end" height={60} tickMargin={6} tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={truc} tick={{ fontSize: 10 }} width={48} domain={mienY(so.d.map((d) => d.v))} />
                  {so.d.some((d) => d.v < 0) ? <ReferenceLine y={0} stroke={SAC.muted} /> : null}
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="v" name="Số tiền" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                    {so.d.map((d, i) => (
                      <Cell key={d.n} fill={d.v < 0 ? SAC.bad : MAU[i % MAU.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Cao>
            {/* Chú thích màu sắc */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5 border-t border-line-soft text-xs text-subtle">
              {so.d.map((d, i) => (
                <div key={d.n} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.v < 0 ? SAC.bad : MAU[i % MAU.length] }} />
                  <span className="text-subtle">{d.n}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </The>
    );
  }
  if (so.loai === 'hai') {
    return (
      <The tieu={so.tieu}>
        {so.d.length === 0 ? (
          <p className="text-sm text-muted">Chưa có số theo tháng.</p>
        ) : (
          <Cao lop="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              {so.tieu.includes('lũy kế') ? (
                <AreaChart data={so.d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={SAC.line} />
                  <XAxis dataKey="n" tick={{ fontSize: 10 }} height={32} />
                  <YAxis tickFormatter={truc} tick={{ fontSize: 10 }} width={48} domain={mienY(so.d.flatMap((d) => [d.a, d.b]))} />
                  <Tooltip content={<Tip />} />
                  <Legend verticalAlign="top" align="right" height={32} iconType="rect" wrapperStyle={{ fontSize: 12, paddingBottom: 4 }} />
                  <Area dataKey="a" name={so.a} stroke={SAC.primary} fill={SAC.primary} fillOpacity={0.2} isAnimationActive={false} />
                  <Area dataKey="b" name={so.b} stroke={SAC.primaryGlow} fill={SAC.primaryGlow} fillOpacity={0.15} isAnimationActive={false} />
                </AreaChart>
              ) : (
                <BarChart data={so.d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={SAC.line} />
                  <XAxis dataKey="n" tick={{ fontSize: 10 }} height={32} />
                  <YAxis tickFormatter={truc} tick={{ fontSize: 10 }} width={48} domain={mienY(so.d.flatMap((d) => [d.a, d.b]))} />
                  <Tooltip content={<Tip />} />
                  <Legend verticalAlign="top" align="right" height={32} iconType="rect" wrapperStyle={{ fontSize: 12, paddingBottom: 4 }} />
                  <Bar dataKey="a" name={so.a} fill={SAC.primary} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="b" name={so.b} fill={SAC.primaryGlow} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </Cao>
        )}
      </The>
    );
  }
  if (so.loai === 'tron') {
    const data = so.d.filter((d) => d.v > 0);
    return (
      <The tieu={so.tieu}>
        {data.length === 0 ? (
          <p className="text-sm text-muted">Chưa có số.</p>
        ) : (
          <Cao>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie data={data} dataKey="v" nameKey="n" outerRadius={78}>
                  {data.map((d, i) => (
                    <Cell key={d.n} fill={(d as { mau?: string }).mau || MAU_HANG[d.n] || MAU[i % MAU.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => (typeof v === 'number' ? String(so.d.find((d) => d.v === v)?.hien ?? v) : String(v ?? ''))} />
                <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </Cao>
        )}
      </The>
    );
  }
  if (so.loai === 'radar') {
    return (
      <The tieu={so.tieu}>
        {so.d.length === 0 ? (
          <p className="text-sm text-muted">Chưa có thành phần điểm.</p>
        ) : (
          <Cao lop="h-64">
            <ResponsiveContainer>
              <RadarChart data={so.d}>
                <PolarGrid />
                <PolarAngleAxis dataKey="n" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Radar dataKey="v" name="Điểm" stroke={SAC.primary} fill={SAC.primary} fillOpacity={0.35} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
          </Cao>
        )}
        <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
          {so.d.map((d) => {
            const bac = Math.min(5, Math.max(1, Math.round(d.v || 0)));
            const mau = d.v > 0 ? thangDiem(bac) : null;
            return (
              <li key={d.n} className="flex items-center justify-between gap-2 rounded px-2 py-1" style={mau ? { background: mau.nen, color: mau.chu } : { background: SAC.nen, color: SAC.muted }}>
                <span>{d.n}</span>
                <span className="so">{d.hien}</span>
              </li>
            );
          })}
        </ul>
      </The>
    );
  }
  return (
    <The tieu={so.tieu} phu={so.phu}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1 text-xs text-muted">{so.trai.tieu}</div>
          <Cao>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie data={so.trai.d.filter((d) => d.v !== 0).map((d) => ({ ...d, v: Math.abs(d.v) }))} dataKey="v" nameKey="n" innerRadius={46} outerRadius={78}>
                  {so.trai.d.filter((d) => d.v !== 0).map((d, i) => (
                    <Cell key={d.n} fill={MAU[i % MAU.length]} />
                  ))}
                </Pie>
                <Tooltip content={<Tip />} />
                <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </Cao>
        </div>
        <div>
          <div className="mb-1 text-xs text-muted">{so.phai.tieu}</div>
          <Cao lop="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie data={so.phai.d} dataKey="v" nameKey="n" outerRadius={80}>
                  {so.phai.d.map((d, i) => (
                    <Cell key={d.n} fill={(d as { mau?: string }).mau || MAU_HANG[d.n] || MAU[i % MAU.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </Cao>
        </div>
      </div>
    </The>
  );
}
