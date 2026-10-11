import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
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

const MAU = ['#0073E6', '#0ea5e9', '#14b8a6', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#dc2626', '#b91c1c', '#7f1d1d'];

function truc(v: number) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(v / 1e9);
}

function NhanCot({ x, y, width, value }: { x?: number; y?: number; width?: number; value?: unknown }) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const t = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(n / 1e9);
  const yy = Math.max(12, (y ?? 0) - 4);
  return (
    <text x={(x ?? 0) + (width ?? 0) / 2} y={yy} textAnchor="middle" fontSize={10} fill="#0f172a">
      {t}
    </text>
  );
}

function mienY(ds: number[]): [number, number] {
  const min = Math.min(0, ...ds);
  const max = Math.max(0, ...ds);
  const dem = Math.max(max - min, 1);
  return [min < 0 ? min - dem * 0.08 : 0, max + dem * 0.22];
}

function Tip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow">
      <div className="mb-1 font-medium">{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {ty(Number(p.value) || 0)}
        </div>
      ))}
    </div>
  );
}

export function The({ tieu, phu, children }: { tieu: string; phu?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">{tieu}</h3>
      {phu ? <p className="mt-1 text-xs text-slate-500">{phu}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Cao({ children, lop = 'h-80' }: { children: ReactNode; lop?: string }) {
  return <div className={`${lop} w-full`}>{children}</div>;
}

export function BangNguong({ muc }: { muc: number | null }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <h3 className="bg-[#0073E6] px-4 py-2 text-sm font-semibold text-white">Ngưỡng cảnh báo hạn mức</h3>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-[#0073E6] text-white">
            <th className="px-3 py-2 font-semibold">Ngưỡng</th>
            <th className="px-3 py-2 font-semibold">Giá trị (%)</th>
            <th className="px-3 py-2 font-semibold">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {THANG_DIEM.map((t) => (
            <tr key={t.muc} style={{ background: t.nen, color: t.chu }} className={muc === t.muc ? 'outline outline-2 outline-offset-[-2px] outline-slate-900' : undefined}>
              <td className="px-3 py-2 font-semibold">{t.muc}</td>
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
        <p className="text-sm text-slate-500">{so.dong}</p>
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
              <div key={o.n} className="rounded-lg px-3 py-2" style={mau ? { background: mau.nen, color: mau.chu } : { background: '#f8fafc' }}>
                <div className="text-xs" style={mau ? undefined : { color: '#64748b' }}>{o.n}</div>
                <div className="so mt-1 text-sm font-semibold" style={mau ? undefined : { color: '#0073E6' }}>{o.v}</div>
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
            className="min-h-24 w-full rounded-lg border border-slate-200 p-2 text-sm"
            value={so.van}
            placeholder="Nhập ghi chú. Số tiền không ghi ở đây."
            onChange={(e) => onChu(e.target.value)}
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm text-slate-700">{so.van.trim() || 'Chưa ghi'}</p>
        )}
      </The>
    );
  }
  if (so.loai === 'the') {
    return (
      <The tieu={so.tieu}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {so.d.length === 0 ? <p className="text-sm text-slate-500">Chưa có Sale.</p> : null}
          {so.d.map((t) => (
            <button
              key={t.id || t.ten}
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-left hover:border-[#0073E6]"
              onClick={() => onThe?.(t.id)}
            >
              <div className="text-sm font-semibold">{t.ten}</div>
              {t.dong.map((d) => (
                <div key={d} className="so text-xs text-slate-600">
                  {d}
                </div>
              ))}
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
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                {so.c.map((c) => (
                  <th key={c} className="px-2 py-1 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {so.d.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-slate-500" colSpan={so.c.length}>
                    Không có dòng.
                  </td>
                </tr>
              ) : null}
              {so.d.map((dong, i) => (
                <tr key={`${dong[0]}-${i}`} className="border-t border-slate-100">
                  {dong.map((cell, j) => (
                    <td key={j} className="so px-2 py-1">
                      {j === 0 && onMa && so.ma ? (
                        <button type="button" className="text-[#0073E6] underline" onClick={() => onMa(so.ma![i])}>
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
          <p className="text-sm text-slate-500">Chưa có số theo tháng.</p>
        ) : (
          <Cao>
            <ResponsiveContainer>
              <BarChart data={so.d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="n" interval={0} angle={-32} textAnchor="end" height={72} tickMargin={8} tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={truc} tick={{ fontSize: 10 }} width={48} domain={mienY(so.d.map((d) => d.v))} />
                {so.d.some((d) => d.v < 0) ? <ReferenceLine y={0} stroke="#94a3b8" /> : null}
                <Tooltip content={<Tip />} />
                <Bar dataKey="v" name="Số tiền" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  {so.d.map((d, i) => (
                    <Cell key={d.n} fill={d.v < 0 ? '#b91c1c' : MAU[i % MAU.length]} />
                  ))}
                  <LabelList dataKey="v" content={<NhanCot />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Cao>
        )}
      </The>
    );
  }
  if (so.loai === 'hai') {
    return (
      <The tieu={so.tieu}>
        {so.d.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có số theo tháng.</p>
        ) : (
          <Cao lop="h-72">
            <ResponsiveContainer>
              {so.tieu.includes('lũy kế') ? (
                <AreaChart data={so.d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="n" tick={{ fontSize: 10 }} height={32} />
                  <YAxis tickFormatter={truc} tick={{ fontSize: 10 }} width={48} domain={mienY(so.d.flatMap((d) => [d.a, d.b]))} />
                  <Tooltip content={<Tip />} />
                  <Area dataKey="a" name={so.a} stroke="#0073E6" fill="#0073E6" fillOpacity={0.2} isAnimationActive={false}>
                    <LabelList dataKey="a" content={<NhanCot />} />
                  </Area>
                  <Area dataKey="b" name={so.b} stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.15} isAnimationActive={false}>
                    <LabelList dataKey="b" content={<NhanCot />} />
                  </Area>
                </AreaChart>
              ) : (
                <BarChart data={so.d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="n" tick={{ fontSize: 10 }} height={32} />
                  <YAxis tickFormatter={truc} tick={{ fontSize: 10 }} width={48} domain={mienY(so.d.flatMap((d) => [d.a, d.b]))} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="a" name={so.a} fill="#0073E6" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                    <LabelList dataKey="a" content={<NhanCot />} />
                  </Bar>
                  <Bar dataKey="b" name={so.b} fill="#14b8a6" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                    <LabelList dataKey="b" content={<NhanCot />} />
                  </Bar>
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
          <p className="text-sm text-slate-500">Chưa có số.</p>
        ) : (
          <Cao>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="v" nameKey="n" outerRadius={78} label={({ name, payload }) => `${name} ${(payload as { hien?: string } | undefined)?.hien ?? ''}`}>
                  {data.map((d, i) => (
                    <Cell key={d.n} fill={MAU[i % MAU.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => (typeof v === 'number' ? String(so.d.find((d) => d.v === v)?.hien ?? v) : String(v ?? ''))} />
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
          <p className="text-sm text-slate-500">Chưa có thành phần điểm.</p>
        ) : (
          <Cao lop="h-64">
            <ResponsiveContainer>
              <RadarChart data={so.d}>
                <PolarGrid />
                <PolarAngleAxis dataKey="n" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Radar dataKey="v" name="Điểm" stroke="#0073E6" fill="#0073E6" fillOpacity={0.35} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
          </Cao>
        )}
        <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
          {so.d.map((d) => {
            const bac = Math.min(5, Math.max(1, Math.round(d.v || 0)));
            const mau = d.v > 0 ? thangDiem(bac) : null;
            return (
              <li key={d.n} className="flex items-center justify-between gap-2 rounded px-2 py-1" style={mau ? { background: mau.nen, color: mau.chu } : { background: '#f8fafc', color: '#64748b' }}>
                <span>{d.n}</span>
                <span className="so font-semibold">{d.hien}</span>
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
          <div className="mb-1 text-xs text-slate-500">{so.trai.tieu}</div>
          <Cao>
            <ResponsiveContainer>
              <BarChart data={so.trai.d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="n" interval={0} angle={-32} textAnchor="end" height={72} tickMargin={8} tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={truc} tick={{ fontSize: 10 }} width={40} domain={mienY(so.trai.d.map((d) => d.v))} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="v" name="Số tiền" fill="#0073E6" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  <LabelList dataKey="v" content={<NhanCot />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Cao>
        </div>
        <div>
          <div className="mb-1 text-xs text-slate-500">{so.phai.tieu}</div>
          <Cao lop="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={so.phai.d} dataKey="v" nameKey="n" outerRadius={80}>
                  {so.phai.d.map((d, i) => (
                    <Cell key={d.n} fill={MAU[i % MAU.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Cao>
        </div>
      </div>
    </The>
  );
}
