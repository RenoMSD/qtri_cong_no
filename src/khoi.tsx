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
import { NHOM_MUA } from './boTest';
import type { BoLocThoiGian } from './locThoiGian';
import { layKhoangThoiGian } from './locThoiGian';

const MAU = [
  '#0073E6', // Royal Blue
  '#0284c7', // Sky Blue
  '#0d9488', // Teal
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ea580c', // Orange
  '#e11d48', // Rose
  '#be123c', // Crimson
  '#475569', // Slate
];

const MAU_HANG: Record<string, string> = {
  'Tốt': '#10b981',        // Xanh lá (tốt)
  'Trung bình': '#3b82f6', // Xanh dương (trung bình)
  'Xấu': '#f97316',        // Cam (xấu)
  'Rất xấu': '#ef4444',    // Đỏ (rất xấu)
  'Chưa chấm': '#94a3b8',  // Xám (chưa chấm)
};

export function truc(v: number) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(v / 1e9);
}

export function NhanCot({ x, y, width, value }: { x?: number; y?: number; width?: number; value?: unknown }) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n === 0) return null;
  const t = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(n / 1e9);
  const yy = Math.max(12, (y ?? 0) - 4);
  return (
    <text x={(x ?? 0) + (width ?? 0) / 2} y={yy} textAnchor="middle" fontSize={10} fill="#0f172a" fontWeight="500">
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
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow">
      <div className="mb-1 font-medium">{label}</div>
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
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">{tieu}</h3>
      {phu ? <p className="mt-1 text-xs text-slate-500">{phu}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Cao({ children, lop = 'h-80' }: { children: ReactNode; lop?: string }) {
  return <div className={`${lop} w-full min-w-0`}>{children}</div>;
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
    const cols = so.d.length === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 xl:grid-cols-3';
    return (
      <The tieu={so.tieu}>
        <div className={`grid gap-3 ${cols}`}>
          {so.d.length === 0 ? <p className="text-sm text-slate-500">Chưa có dữ liệu.</p> : null}
          {so.d.map((t) => (
            <button
              key={t.id || t.ten}
              type="button"
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-left transition hover:border-[#0073E6] hover:bg-blue-50/20"
              onClick={() => onThe?.(t.id)}
            >
              <div className="text-sm font-semibold text-slate-800">{t.ten}</div>
              <div className="mt-2 space-y-1">
                {t.dong.map((d, di) => (
                  <div key={d} className={`so text-xs ${di === 0 ? 'text-slate-600' : 'font-medium text-[#0073E6]'}`}>
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
          <div>
            <Cao lop="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={so.d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="n" interval={0} angle={-30} textAnchor="end" height={60} tickMargin={6} tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={truc} tick={{ fontSize: 10 }} width={48} domain={mienY(so.d.map((d) => d.v))} />
                  {so.d.some((d) => d.v < 0) ? <ReferenceLine y={0} stroke="#94a3b8" /> : null}
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="v" name="Số tiền" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                    {so.d.map((d, i) => (
                      <Cell key={d.n} fill={d.v < 0 ? '#b91c1c' : MAU[i % MAU.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Cao>
            {/* Chú thích màu sắc */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5 border-t border-slate-100 text-xs text-slate-600">
              {so.d.map((d, i) => (
                <div key={d.n} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.v < 0 ? '#b91c1c' : MAU[i % MAU.length] }} />
                  <span className="font-medium text-slate-700">{d.n}</span>
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
          <p className="text-sm text-slate-500">Chưa có số theo tháng.</p>
        ) : (
          <Cao lop="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              {so.tieu.includes('lũy kế') ? (
                <AreaChart data={so.d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="n" tick={{ fontSize: 10 }} height={32} />
                  <YAxis tickFormatter={truc} tick={{ fontSize: 10 }} width={48} domain={mienY(so.d.flatMap((d) => [d.a, d.b]))} />
                  <Tooltip content={<Tip />} />
                  <Legend verticalAlign="top" align="right" height={32} iconType="rect" wrapperStyle={{ fontSize: 12, paddingBottom: 4 }} />
                  <Area dataKey="a" name={so.a} stroke="#0073E6" fill="#0073E6" fillOpacity={0.2} isAnimationActive={false} />
                  <Area dataKey="b" name={so.b} stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.15} isAnimationActive={false} />
                </AreaChart>
              ) : (
                <BarChart data={so.d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="n" tick={{ fontSize: 10 }} height={32} />
                  <YAxis tickFormatter={truc} tick={{ fontSize: 10 }} width={48} domain={mienY(so.d.flatMap((d) => [d.a, d.b]))} />
                  <Tooltip content={<Tip />} />
                  <Legend verticalAlign="top" align="right" height={32} iconType="rect" wrapperStyle={{ fontSize: 12, paddingBottom: 4 }} />
                  <Bar dataKey="a" name={so.a} fill="#0073E6" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="b" name={so.b} fill="#14b8a6" radius={[3, 3, 0, 0]} isAnimationActive={false} />
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
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={so.trai.d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="n" interval={0} angle={-32} textAnchor="end" height={72} tickMargin={8} tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={truc} tick={{ fontSize: 10 }} width={40} domain={mienY(so.trai.d.map((d) => d.v))} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="v" name="Số tiền" fill="#0073E6" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </Cao>
        </div>
        <div>
          <div className="mb-1 text-xs text-slate-500">{so.phai.tieu}</div>
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

export function DanhSachKeHoachMua({ boLoc }: { boLoc?: BoLocThoiGian } = {}) {
  const khoang = boLoc ? layKhoangThoiGian(boLoc) : null;
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Kế hoạch mua theo nhóm</h3>
          <p className="text-xs text-slate-500">Dạng danh sách tiến độ thực hiện và giải ngân ngân sách theo từng nhóm hàng</p>
        </div>
        <div className="flex items-center gap-2">
          {khoang?.laLoc && (
            <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Kỳ: {khoang.nhan}
            </span>
          )}
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            4 nhóm vật tư chính
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {NHOM_MUA.map((g) => {
          const tyLeVe = g.keHoach > 0 ? (g.ve / g.keHoach) * 100 : 0;
          const tyLeDung = g.nganSach > 0 ? (g.dung / g.nganSach) * 100 : 0;
          return (
            <div
              key={g.n}
              className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3.5 hover:border-[#0073E6]/60 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-800">{g.n}</span>
                <span className="text-xs font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Nhu cầu: {g.nhuCau} tỷ
                </span>
              </div>

              {/* Progress 1: Tiến độ đã về / Kế hoạch */}
              <div className="space-y-1 mb-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Đã về / Kế hoạch:</span>
                  <span className="font-semibold text-slate-800">
                    {g.ve} / {g.keHoach} tỷ ({tyLeVe.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#0073E6] transition-all"
                    style={{ width: `${Math.min(100, tyLeVe)}%` }}
                  />
                </div>
              </div>

              {/* Progress 2: Đã dùng / Ngân sách */}
              <div className="space-y-1 mb-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Ngân sách đã dùng:</span>
                  <span className="font-semibold text-slate-800">
                    {g.dung} / {g.nganSach} tỷ ({tyLeDung.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      tyLeDung > 100 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, tyLeDung)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                <span>Đã duyệt: <strong className="text-slate-700">{g.duyet} tỷ</strong></span>
                <span>Còn lại về: <strong className="text-[#0073E6]">{Math.max(0, g.keHoach - g.ve)} tỷ</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
