import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BUCKET_LABEL, type BucketKey, type Hang, type Khach } from './lib/metrics';
import { pct, so1, thangNhan, ty } from './format';
import { tenKhach, thangNhieu, type Chon, type Loc } from './soLieu';
import { LocBar } from './khung';
import { truc } from './khoi';
import { ChuGiaiCham, NhanHang, The, VongNhieu } from './giaoDien';
import { DAY_MAU, MAU, MAU_BUCKET, MAU_HANG } from './mauSac';

// Màn Tuổi nợ & thu hồi và màn Tín dụng & hạn mức theo wireframe

const COT_HEAT: { ten: string; keys: BucketKey[]; mau: string }[] = [
  { ten: 'Chưa hạn', keys: ['chuaDenHan', 'denHan', 'traTruocHan'], mau: '#10b981' },
  { ten: '1–30', keys: ['d0_30'], mau: '#ef4444' },
  { ten: '31–60', keys: ['d31_60'], mau: '#ef4444' },
  { ten: '61–90', keys: ['d61_90'], mau: '#ef4444' },
  { ten: '91–120', keys: ['d91_120'], mau: '#ef4444' },
  { ten: '121–180', keys: ['d121_150', 'd151_180'], mau: '#ef4444' },
  { ten: '181–365', keys: ['d181_365'], mau: '#ef4444' },
  { ten: '>365', keys: ['d365'], mau: '#ef4444' },
];

function tyGon(v: number) {
  if (Math.abs(v) < 1e6) return '';
  return Math.abs(v) >= 1e9 ? `${(v / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ` : `${Math.round(v / 1e6)} tr`;
}

function DongBoLoc({ sales, loc, setLoc, phu }: { sales: string[]; loc: Loc; setLoc: (l: Loc) => void; phu: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-[12.5px] text-muted">{phu}</p>
      <LocBar sales={sales} loc={loc} setLoc={setLoc} />
    </div>
  );
}

export function ManTuoiNo({ chon, loc, setLoc, sales, onMa }: { chon: Chon; loc: Loc; setLoc: (l: Loc) => void; sales: string[]; onMa: (ma: string) => void }) {
  const { tong, list } = chon;
  const tuoi = (Object.keys(MAU_BUCKET) as BucketKey[]).filter((k) => tong.aging[k] > 0);
  const tongDuong = tuoi.reduce((s, k) => s + tong.aging[k], 0);

  const theoSale = new Map<string, Khach[]>();
  for (const k of list) theoSale.set(k.sale, [...(theoSale.get(k.sale) ?? []), k]);
  const dsSale = [...theoSale.entries()].map(([sale, ks]) => ({ sale, ks, duNo: ks.reduce((s, k) => s + k.duNo, 0) })).sort((a, b) => b.duNo - a.duNo);
  const hang = dsSale.slice(0, 6);
  const khac = dsSale.slice(6);
  if (khac.length) hang.push({ sale: `Khác (${khac.length} Sale)`, ks: khac.flatMap((x) => x.ks), duNo: khac.reduce((s, x) => s + x.duNo, 0) });
  const o = hang.map((h) => COT_HEAT.map((c) => h.ks.reduce((s, k) => s + c.keys.reduce((t, key) => t + k.aging[key], 0), 0)));
  const maxO = Math.max(1, ...o.flat().map(Math.abs));

  const tren180 = tong.aging.d181_365 + tong.aging.d365;
  const nguyCo = [...list].sort((a, b) => b.gt180 - a.gt180).filter((k) => k.gt180 > 0).slice(0, 3);
  const thang = thangNhieu(list).map((t) => ({ ...t, tyLeThu: t.phatSinh > 0 ? Math.min(2, t.thanhToan / t.phatSinh) : null }));
  const tyLeQhThu = tong.qhThu + tong.quaHan > 0 ? tong.qhThu / (tong.qhThu + tong.quaHan) : 0;

  return (
    <div className="animate-fade-up space-y-5">
      <DongBoLoc sales={sales} loc={loc} setLoc={setLoc} phu="11 nhóm tuổi nợ · số theo bộ lọc" />

      <The tieu={`Dư nợ ${ty(tong.duNo)} chia theo tuổi`} phu="Mỗi đoạn là một nhóm, rộng theo tỷ trọng">
        <div className="flex h-9 overflow-hidden rounded-xl">
          {tuoi.map((k) => <div key={k} title={BUCKET_LABEL[k]} style={{ width: `${(tong.aging[k] / (tongDuong || 1)) * 100}%`, background: MAU_BUCKET[k] }} />)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[12.5px] sm:grid-cols-3 xl:grid-cols-6">
          {tuoi.map((k) => (
            <div key={k}>
              <span className="inline-flex items-center gap-1.5 text-subtle"><span className="size-2.5 rounded-sm" style={{ background: MAU_BUCKET[k] }} />{BUCKET_LABEL[k]}</span>
              <div className="so font-semibold">{ty(tong.aging[k])} · {pct(tong.duNo ? tong.aging[k] / tong.duNo : 0)}</div>
            </div>
          ))}
        </div>
      </The>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <The className="xl:col-span-2" tieu="Heatmap Sale × nhóm tuổi nợ" phu="Ô càng đậm càng nhiều tiền">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-1 text-[11.5px]">
              <thead>
                <tr className="text-muted">
                  <th className="text-left font-medium">Sale</th>
                  {COT_HEAT.map((c) => <th key={c.ten} className="font-medium">{c.ten}</th>)}
                </tr>
              </thead>
              <tbody>
                {hang.map((h, i) => (
                  <tr key={h.sale}>
                    <td className="pr-2 whitespace-nowrap text-subtle">{h.sale}</td>
                    {o[i].map((v, j) => {
                      const muc = Math.max(0, v) / maxO;
                      return (
                        <td key={j} className="so h-8 rounded-md text-center" style={{ background: v > 0 ? `${COT_HEAT[j].mau}${Math.round(18 + muc * 220).toString(16).padStart(2, '0')}` : '#f8fafc', color: muc > 0.55 ? '#fff' : MAU.subtle }}>
                          {tyGon(v)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </The>
        <section className="flex flex-col gap-3 rounded-2xl bg-sidebar p-5 text-white shadow-elegant">
          <h3 className="text-[15px] font-semibold">Khoản nguy cơ nhất</h3>
          <div className="so text-[30px] font-semibold">{ty(tren180)}</div>
          <div className="text-[12.5px] text-sidebar-fg">Nợ trên 180 ngày · {pct(tong.duNo ? tren180 / tong.duNo : 0)} dư nợ</div>
          <div className="h-px bg-white/15" />
          <ul className="space-y-2 text-[12.5px]">
            {nguyCo.map((k) => (
              <li key={k.maKH}>
                <button type="button" onClick={() => onMa(k.maKH)} className="flex w-full cursor-pointer justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/8">
                  <span>{tenKhach(k, chon.tay)}</span>
                  <b className="so">{ty(k.gt180)}</b>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <The
          tieu="Thu hồi trong kỳ"
          phai={<ChuGiaiCham ds={[{ ten: 'Dư nợ lũy kế', mau: DAY_MAU[0] }, { ten: 'Doanh thu lũy kế', mau: DAY_MAU[1] }]} />}
        >
          <div className="mb-3 flex flex-wrap divide-x divide-line border-b border-line-soft pb-3">
            <div className="pr-5"><div className="text-[12px] text-muted">Đã thu kỳ</div><div className="so text-[20px] font-semibold">{ty(tong.tienTT)}</div></div>
            <div className="px-5"><div className="text-[12px] text-muted">Nợ QH đã thu</div><div className="so text-[20px] font-semibold">{ty(tong.qhThu)}</div></div>
            <div className="pl-5"><div className="text-[12px] text-muted">Tỷ lệ thu QH</div><div className="so text-[20px] font-semibold text-risk-safe">{pct(tyLeQhThu)}</div></div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={thang} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={MAU.line} vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="thang" tickFormatter={thangNhan} tick={{ fontSize: 11, fill: MAU.muted }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={truc} tick={{ fontSize: 11, fill: MAU.muted }} width={40} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: unknown) => ty(Number(v))} labelFormatter={(l: unknown) => thangNhan(String(l))} />
                <Line dataKey="duNoLuyKe" name="Dư nợ lũy kế" stroke={DAY_MAU[0]} strokeWidth={2.5} dot={{ r: 3.5, fill: '#fff', stroke: DAY_MAU[0], strokeWidth: 2 }} isAnimationActive={false} />
                <Line dataKey="doanhThuLuyKe" name="Doanh thu lũy kế" stroke={DAY_MAU[1]} strokeWidth={2.5} dot={{ r: 3.5, fill: '#fff', stroke: DAY_MAU[1], strokeWidth: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </The>
        <The
          tieu="Phát sinh và thanh toán theo tháng"
          phai={<ChuGiaiCham ds={[{ ten: 'Phát sinh', mau: DAY_MAU[0] }, { ten: 'Thanh toán', mau: DAY_MAU[5] }, { ten: 'Tỷ lệ thu', mau: DAY_MAU[2] }]} />}
          chan="Tỷ lệ thu = thanh toán ÷ phát sinh trong tháng (trục phải)"
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={thang} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={3}>
                <CartesianGrid stroke={MAU.line} vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="thang" tickFormatter={thangNhan} tick={{ fontSize: 11, fill: MAU.muted }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="tien" tickFormatter={truc} tick={{ fontSize: 11, fill: MAU.muted }} width={40} axisLine={false} tickLine={false} />
                <YAxis yAxisId="tl" orientation="right" tickFormatter={(v: number) => `${Math.round(v * 100)}%`} tick={{ fontSize: 11, fill: DAY_MAU[2] }} width={40} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: unknown, ten: unknown) => (ten === 'Tỷ lệ thu' ? pct(Number(v)) : ty(Number(v)))} labelFormatter={(l: unknown) => thangNhan(String(l))} />
                <Bar yAxisId="tien" dataKey="phatSinh" name="Phát sinh" fill={DAY_MAU[0]} barSize={7} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar yAxisId="tien" dataKey="thanhToan" name="Thanh toán" fill={DAY_MAU[5]} barSize={7} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Line yAxisId="tl" dataKey="tyLeThu" name="Tỷ lệ thu" stroke={DAY_MAU[2]} strokeWidth={2} dot={{ r: 3, fill: DAY_MAU[2], strokeWidth: 0 }} connectNulls isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </The>
      </section>
    </div>
  );
}

type TabHm = 'vuot' | 'sapcham' | 'chuacap';
const TAB_HM: { id: TabHm; ten: string }[] = [
  { id: 'vuot', ten: 'Vượt hạn mức' },
  { id: 'sapcham', ten: 'Sắp chạm (>75%)' },
  { id: 'chuacap', ten: 'Chưa cấp' },
];

export function ManTinDung({ chon, loc, setLoc, sales, onMa }: { chon: Chon; loc: Loc; setLoc: (l: Loc) => void; sales: string[]; onMa: (ma: string) => void }) {
  const [tab, setTab] = useState<TabHm>('vuot');
  const { tong, list, tay } = chon;
  const hang = (['Tốt', 'Trung bình', 'Xấu', 'Rất xấu', 'Chưa chấm'] as Hang[]).map((h) => ({ h, so: tong.hang[h] })).filter((d) => d.h !== 'Chưa chấm' || d.so > 0);

  const tieuChi = new Map<string, { ten: string; tong: number; dem: number }>();
  for (const k of list) {
    for (const p of k.thanhPhan) {
      const x = tieuChi.get(p.ma) ?? { ten: p.ten, tong: 0, dem: 0 };
      if (p.diem != null) {
        x.tong += p.diem;
        x.dem += 1;
      }
      tieuChi.set(p.ma, x);
    }
  }
  const dsTieuChi = [...tieuChi.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  const vuot = list.filter((k) => k.hmtd > 0 && k.duNo > k.hmtd);
  const sapCham = list.filter((k) => k.hmtd > 0 && k.duNo / k.hmtd > 0.75 && k.duNo <= k.hmtd);
  const chuaCap = list.filter((k) => k.hmtd === 0 && k.duNo > 0);
  const noXau = list.filter((k) => k.noKhoDoi > 0);
  const canXuLy = new Set([...vuot, ...chuaCap, ...noXau].map((k) => k.maKH)).size;
  const dsBang = (tab === 'vuot' ? vuot : tab === 'sapcham' ? sapCham : chuaCap).sort((a, b) => b.duNo - a.duNo);

  return (
    <div className="animate-fade-up space-y-5">
      <DongBoLoc sales={sales} loc={loc} setLoc={setLoc} phu={`Chấm điểm TC-1 thang 1–5 · ${list.length} khách · ${chon.ky.nhanDiem}`} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <The tieu="Phân bố hạng khách hàng" phu="Số khách mỗi hạng">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hang} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={MAU.line} vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="h" tick={{ fontSize: 11, fill: MAU.muted }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: MAU.muted }} width={30} axisLine={false} tickLine={false} />
                <Bar dataKey="so" name="Số khách" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                  {hang.map((d) => <Cell key={d.h} fill={MAU_HANG[d.h]} />)}
                  <LabelList dataKey="so" position="top" style={{ fontSize: 12, fontWeight: 600, fill: MAU.foreground }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </The>
        <The tieu="6 tiêu chí chấm điểm TC-1" phu="Điểm bình quân danh mục mỗi tiêu chí (tối đa 5)">
          <div className="grid grid-cols-2 gap-2.5">
            {dsTieuChi.map(([ma, x]) => (
              <div key={ma} className="rounded-xl bg-background p-3">
                <div className="truncate text-[11.5px] text-muted">{ma} · {x.ten}</div>
                <div className="so mt-1 text-[18px] font-semibold">{x.dem ? so1(x.tong / x.dem) : '—'}</div>
                <div className="mt-1 h-1.5 rounded-full bg-line"><div className="h-full rounded-full bg-primary" style={{ width: `${x.dem ? (x.tong / x.dem / 5) * 100 : 0}%` }} /></div>
              </div>
            ))}
            {dsTieuChi.length === 0 ? <p className="col-span-2 text-[13px] text-muted">Điểm lấy trực tiếp từ sổ, không có điểm thành phần.</p> : null}
          </div>
        </The>
        <The tieu="Trạng thái hạn mức" chan="Vòng ngoài → trong: vượt hạn mức, chưa cấp, nợ khó đòi (so với tổng số khách)">
          <div className="flex flex-wrap items-center gap-4">
            <VongNhieu
              giua={canXuLy}
              phuGiua="KH cần xử lý"
              ds={[
                { ten: 'Vượt', v: vuot.length, max: list.length, mau: MAU.bad },
                { ten: 'Chưa cấp', v: chuaCap.length, max: list.length, mau: DAY_MAU[2] },
                { ten: 'Nợ khó đòi', v: noXau.length, max: list.length, mau: DAY_MAU[3] },
              ]}
            />
            <div className="min-w-[140px] flex-1 space-y-2 text-[12.5px]">
              <div className="flex justify-between"><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: MAU.bad }} />Vượt hạn mức</span><b>{vuot.length} KH · {ty(tong.vuotHmTien)}</b></div>
              <div className="flex justify-between"><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: DAY_MAU[2] }} />Chưa cấp</span><b>{chuaCap.length} KH · {ty(tong.chuaHmTien)}</b></div>
              <div className="flex justify-between"><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: DAY_MAU[3] }} />Nợ khó đòi</span><b>{noXau.length} KH · {ty(tong.noKhoDoi)}</b></div>
              <div className="flex justify-between text-muted"><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: MAU.safe }} />Sắp chạm hạn mức</span><b>{sapCham.length} KH</b></div>
            </div>
          </div>
        </The>
      </section>

      <The
        tieu="Mức dùng hạn mức theo khách"
        phai={
          <div className="inline-flex rounded-lg bg-background p-1">
            {TAB_HM.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`h-8 cursor-pointer rounded-md px-3 text-[12px] ${tab === t.id ? 'bg-primary text-white' : 'text-subtle hover:text-primary'}`}>
                {t.ten}
              </button>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-[12.5px]">
            <thead>
              <tr className="bg-background text-left text-subtle">
                <th className="p-2.5 font-medium">Khách hàng</th><th className="p-2.5 font-medium">Hạng</th><th className="p-2.5 text-right font-medium">Dư nợ</th><th className="p-2.5 text-right font-medium">Hạn mức</th><th className="w-[32%] p-2.5 font-medium">Mức dùng</th>
              </tr>
            </thead>
            <tbody>
              {dsBang.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-muted">Không có khách nào.</td></tr> : null}
              {dsBang.slice(0, 15).map((k) => {
                const dung = k.hmtd > 0 ? k.duNo / k.hmtd : null;
                return (
                  <tr key={k.maKH} className="border-b border-line-soft">
                    <td className="p-2.5"><button type="button" onClick={() => onMa(k.maKH)} className="cursor-pointer font-medium text-primary hover:underline">{tenKhach(k, tay)}</button></td>
                    <td className="p-2.5"><NhanHang hang={k.hang} diem={k.diem} /></td>
                    <td className="so p-2.5 text-right">{ty(k.duNo)}</td>
                    <td className="so p-2.5 text-right">{k.hmtd > 0 ? ty(k.hmtd) : 'Chưa cấp'}</td>
                    <td className="p-2.5">
                      {dung == null ? (
                        <span className="text-[11.5px] text-risk-watch">Chưa có hạn mức</span>
                      ) : (
                        <>
                          <div className="h-2 rounded-full bg-line-soft"><div className="h-full rounded-full" style={{ width: `${Math.min(100, dung * 100)}%`, background: dung > 1 ? MAU.bad : dung > 0.75 ? MAU.watch : MAU.primary }} /></div>
                          <span className={`text-[11px] ${dung > 1 ? 'text-risk-bad' : 'text-muted'}`}>{dung > 1 ? `vượt ${pct(dung - 1)}` : `dùng ${pct(dung)}`}</span>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {dsBang.length > 15 ? <tr><td colSpan={5} className="p-2.5 text-muted">… {dsBang.length - 15} khách khác</td></tr> : null}
            </tbody>
          </table>
        </div>
      </The>
    </div>
  );
}
