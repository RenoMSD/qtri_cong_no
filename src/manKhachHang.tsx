import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import type { Hang } from './lib/metrics';
import { pct, ty } from './format';
import { bonNhomCanhBao, tenKhach, type Chon, type Loc, type NhomCanhBaoId, type Tay } from './soLieu';
import { LocBar } from './khung';
import { truc } from './khoi';
import { Nhan, NhanHang, The } from './giaoDien';
import { DAY_MAU, MAU, MAU_HANG } from './mauSac';

// Màn Cảnh báo (bảng xử lý dạng Kanban) và màn Khách hàng (danh sách, phân tán, khu vực) theo wireframe

const THE_NHOM: Record<NhomCanhBaoId, { nen: string; chu: string; vien: string }> = {
  'vuot-hm': { nen: 'bg-risk-bad-soft', chu: 'text-risk-bad', vien: 'border-risk-bad' },
  'chua-hm': { nen: 'bg-risk-watch-soft', chu: 'text-risk-watch', vien: 'border-risk-watch' },
  'no-xau': { nen: 'bg-risk-overdue-soft', chu: 'text-risk-overdue', vien: 'border-risk-overdue' },
  d365: { nen: 'bg-risk-info-soft', chu: 'text-risk-info', vien: 'border-risk-info' },
};

const COT = [
  { id: 'moi', ten: 'Mới phát sinh' },
  { id: 'dang', ten: 'Đang xử lý' },
  { id: 'xong', ten: 'Đã xử lý' },
] as const;

export function ManCanhBaoKanban({
  chon,
  suaTay,
  moHoSo,
  nhomChonBanDau,
}: {
  chon: Chon;
  suaTay: (t: Tay) => void;
  moHoSo: (ma: string) => void;
  nhomChonBanDau?: NhomCanhBaoId | null;
}) {
  const nhom = bonNhomCanhBao(chon.list, chon.tay);
  const [chonNhom, setChonNhom] = useState<NhomCanhBaoId | 'all'>(nhomChonBanDau ?? 'all');
  useEffect(() => {
    if (nhomChonBanDau) setChonNhom(nhomChonBanDau);
  }, [nhomChonBanDau]);
  const tay = chon.tay;
  const the = nhom
    .filter((n) => chonNhom === 'all' || n.id === chonNhom)
    .flatMap((n) => n.danhSach.map((m) => ({ ...m, nhom: n.id, tenNhom: n.ten, khoa: `${n.id}:${m.maKH}` })));
  const theoCot = (cot: 'moi' | 'dang' | 'xong') => the.filter((t) => (tay.xuLy[t.khoa] ?? 'moi') === cot);
  function dat(khoa: string, tt: 'dang' | 'xong' | null) {
    const xuLy = { ...tay.xuLy };
    if (tt) xuLy[khoa] = tt;
    else delete xuLy[khoa];
    suaTay({ ...tay, xuLy });
  }

  return (
    <div className="animate-fade-up space-y-5">
      <p className="text-[12.5px] text-muted">4 nhóm rủi ro · bấm thẻ để lọc · trạng thái xử lý lưu theo kỳ sổ</p>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {nhom.map((n) => {
          const s = THE_NHOM[n.id];
          const bat = chonNhom === n.id;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setChonNhom(bat ? 'all' : n.id)}
              className={`cursor-pointer rounded-2xl border-2 p-4 text-left transition ${s.nen} ${bat ? s.vien : 'border-transparent'}`}
            >
              <div className={`text-[12.5px] ${s.chu}`}>{n.ten}</div>
              <div className="so mt-1.5 text-[26px] font-semibold text-foreground">{n.soKhach} KH</div>
              <div className={`text-[12px] ${s.chu}`}>{ty(n.tongTien)}</div>
            </button>
          );
        })}
      </section>

      <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        {COT.map((c) => {
          const ds = theoCot(c.id);
          return (
            <div key={c.id} className="flex flex-col gap-2.5 rounded-2xl bg-line-soft p-3.5">
              <div className="flex justify-between px-1 text-[13px] font-semibold">
                <span>{c.ten}</span>
                <span className="text-muted">{ds.length}</span>
              </div>
              {ds.length === 0 ? <p className="px-1 py-3 text-[12px] text-muted">Trống</p> : null}
              {ds.slice(0, 30).map((t) => (
                <div key={t.khoa} className={`rounded-xl bg-card p-3.5 shadow-card ${c.id === 'xong' ? 'opacity-70' : ''} ${c.id === 'dang' ? 'border-l-4 border-risk-watch' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" onClick={() => moHoSo(t.maKH)} className="cursor-pointer text-left text-[13px] font-semibold hover:text-primary">
                      {t.tenKH || t.maKH}
                    </button>
                    <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${THE_NHOM[t.nhom].nen} ${THE_NHOM[t.nhom].chu}`}>{t.tenNhom}</span>
                  </div>
                  <div className="mt-1 text-[12px] text-muted">{t.ly} · {t.sale}</div>
                  <div className="mt-2.5 flex gap-2">
                    {c.id === 'moi' ? <button type="button" onClick={() => dat(t.khoa, 'dang')} className="h-8 cursor-pointer rounded-lg border border-line px-2.5 text-[12px] hover:border-primary hover:text-primary">Nhận xử lý</button> : null}
                    {c.id === 'dang' ? <button type="button" onClick={() => dat(t.khoa, 'xong')} className="h-8 cursor-pointer rounded-lg bg-primary px-2.5 text-[12px] text-white hover:bg-primary-dark">Đã xử lý</button> : null}
                    {c.id !== 'moi' ? <button type="button" onClick={() => dat(t.khoa, null)} className="h-8 cursor-pointer rounded-lg px-2 text-[12px] text-muted hover:text-foreground">Mở lại</button> : null}
                  </div>
                </div>
              ))}
              {ds.length > 30 ? <p className="px-1 text-[12px] text-muted">… {ds.length - 30} thẻ khác</p> : null}
            </div>
          );
        })}
      </section>

      <The tieu="Quy tắc cảnh báo">
        <div className="grid grid-cols-1 gap-3 text-[12.5px] text-subtle sm:grid-cols-2 xl:grid-cols-4">
          <div>Vượt hạn mức: dư nợ lớn hơn hạn mức được duyệt</div>
          <div>Chưa có hạn mức: có dư nợ nhưng hạn mức bằng 0</div>
          <div>Nợ xấu: có trong sheet nợ khó đòi</div>
          <div>Quá hạn dài: chứng từ quá hạn trên 365 ngày</div>
        </div>
      </The>
    </div>
  );
}

const SAC_HANG_THE: Record<Hang, string> = {
  'Tốt': 'bg-risk-safe-soft text-risk-safe',
  'Trung bình': 'bg-risk-info-soft text-risk-info',
  'Xấu': 'bg-risk-watch-soft text-risk-watch',
  'Rất xấu': 'bg-risk-bad-soft text-risk-bad',
  'Chưa chấm': 'bg-line-soft text-subtle',
};

function xuatCsv(chon: Chon) {
  const dong = [['Mã', 'Tên', 'Sale', 'Khu vực', 'Hạng', 'Điểm', 'Dư nợ', 'Quá hạn', 'Hạn mức']];
  for (const k of chon.list) dong.push([k.maKH, tenKhach(k, chon.tay), k.sale, k.khuVuc, k.hang, k.diem == null ? '' : String(k.diem), String(k.duNo), String(k.quaHan), String(k.hmtd)]);
  const csv = '﻿' + dong.map((d) => d.map((o) => `"${String(o).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `KhachHang_${chon.ky.meta.ngayChot}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ManDanhSachKhach({ chon, loc, setLoc, sales, moHoSo }: { chon: Chon; loc: Loc; setLoc: (l: Loc) => void; sales: string[]; moHoSo: (ma: string) => void }) {
  const [trang, setTrang] = useState(0);
  const { list, tong, tay } = chon;
  useEffect(() => setTrang(0), [loc]);
  const ds = useMemo(() => [...list].sort((a, b) => b.duNo - a.duNo), [list]);
  const soTrang = Math.max(1, Math.ceil(ds.length / 25));
  const diem = list.filter((k) => k.diem != null && k.duNo > 0).map((k) => ({ x: k.diem as number, y: k.duNo, z: k.quaHan, ma: k.maKH, ten: tenKhach(k, tay), hang: k.hang }));
  const khuVuc = new Map<string, { duNo: number; quaHan: number; so: number }>();
  for (const k of list) {
    const x = khuVuc.get(k.khuVuc || 'Chưa khai') ?? { duNo: 0, quaHan: 0, so: 0 };
    x.duNo += k.duNo;
    x.quaHan += k.quaHan;
    x.so += 1;
    khuVuc.set(k.khuVuc || 'Chưa khai', x);
  }
  const dsKv = [...khuVuc.entries()].sort((a, b) => b[1].duNo - a[1].duNo).slice(0, 6);
  const maxKv = Math.max(1, ...dsKv.map(([, x]) => x.duNo));

  return (
    <div className="animate-fade-up space-y-5">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {(['Tốt', 'Trung bình', 'Xấu', 'Rất xấu'] as Hang[]).map((h) => (
          <button key={h} type="button" onClick={() => setLoc({ ...loc, hang: loc.hang === h ? 'ALL' : h })} className={`cursor-pointer rounded-2xl p-3.5 text-left ${SAC_HANG_THE[h]} ${loc.hang === h ? 'ring-2 ring-current' : ''}`}>
            <div className="text-[12px]">{h}</div>
            <div className="so text-[22px] font-semibold text-foreground">{tong.hang[h]}</div>
          </button>
        ))}
        <div className="rounded-2xl border border-dashed border-line bg-card p-3.5">
          <div className="text-[12px] text-subtle">Thiếu danh mục</div>
          <div className="so text-[22px] font-semibold">{tong.thieuDm} mã</div>
        </div>
      </section>

      <The
        tieu={`Danh sách khách hàng · ${ds.length}`}
        phai={
          <div className="flex flex-wrap items-center gap-2">
            <LocBar sales={sales} loc={loc} setLoc={setLoc} />
            <button type="button" onClick={() => xuatCsv(chon)} className="h-9 cursor-pointer rounded-lg border border-line bg-card px-3 text-[12px] text-subtle hover:text-primary">Xuất CSV</button>
          </div>
        }
        chan={
          <div className="flex items-center justify-between">
            <span>Trang {trang + 1}/{soTrang} · 25 dòng mỗi trang</span>
            <span className="flex gap-2">
              <button type="button" disabled={trang === 0} onClick={() => setTrang((t) => t - 1)} className="cursor-pointer rounded-md px-2 py-1 hover:bg-line-soft disabled:opacity-40">← Trước</button>
              <button type="button" disabled={trang >= soTrang - 1} onClick={() => setTrang((t) => t + 1)} className="cursor-pointer rounded-md px-2 py-1 hover:bg-line-soft disabled:opacity-40">Sau →</button>
            </span>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-[12.5px]">
            <thead>
              <tr className="bg-background text-left text-subtle">
                <th className="p-2.5 font-medium">Khách hàng</th><th className="p-2.5 font-medium">Sale</th><th className="p-2.5 font-medium">Hạng · điểm</th><th className="p-2.5 text-right font-medium">Dư nợ</th><th className="p-2.5 text-right font-medium">Quá hạn</th><th className="w-[20%] p-2.5 font-medium">Dùng hạn mức</th><th className="p-2.5" />
              </tr>
            </thead>
            <tbody>
              {ds.slice(trang * 25, trang * 25 + 25).map((k) => {
                const dung = k.hmtd > 0 ? k.duNo / k.hmtd : null;
                return (
                  <tr key={k.maKH} className="border-b border-line-soft hover:bg-background">
                    <td className="p-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-[11px] font-semibold text-primary">{k.maKH.slice(0, 2)}</span>
                        <div className="min-w-0"><b className="block font-semibold">{k.maKH}</b><span className="block truncate text-[11px] text-muted">{tenKhach(k, tay) !== k.maKH ? tenKhach(k, tay) : 'Chưa có tên'}</span></div>
                      </div>
                    </td>
                    <td className="p-2.5 text-subtle">{k.sale}</td>
                    <td className="p-2.5"><NhanHang hang={k.hang} diem={k.diem} /></td>
                    <td className="so p-2.5 text-right">{ty(k.duNo)}</td>
                    <td className={`so p-2.5 text-right ${k.quaHan > 0 ? 'text-risk-bad' : ''}`}>{ty(k.quaHan)}</td>
                    <td className="p-2.5">
                      {dung == null ? <Nhan sac="watch">Chưa cấp</Nhan> : <div className="h-2 rounded-full bg-line-soft"><div className="h-full rounded-full" style={{ width: `${Math.min(100, dung * 100)}%`, background: dung > 1 ? MAU.bad : MAU.primary }} /></div>}
                    </td>
                    <td className="p-2.5 text-right"><button type="button" onClick={() => moHoSo(k.maKH)} className="cursor-pointer text-primary hover:underline">Hồ sơ →</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </The>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <The tieu="Dư nợ × điểm tín dụng" phu="Mỗi chấm là một khách · góc trên bên trái là nhóm cần ưu tiên · bấm chấm để mở hồ sơ">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid stroke={MAU.line} strokeDasharray="4 4" />
                <XAxis type="number" dataKey="x" name="Điểm" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: MAU.muted }} label={{ value: 'Điểm tín dụng', position: 'insideBottomRight', offset: -4, fontSize: 11, fill: MAU.muted }} />
                <YAxis type="number" dataKey="y" name="Dư nợ" tickFormatter={truc} tick={{ fontSize: 11, fill: MAU.muted }} width={40} />
                <ZAxis type="number" dataKey="z" range={[40, 260]} />
                <Tooltip formatter={(v: unknown, ten: unknown) => (ten === 'Điểm' ? String(v) : ty(Number(v)))} />
                <Scatter data={diem} isAnimationActive={false} onClick={(d: unknown) => { const ma = (d as { ma?: string; payload?: { ma?: string } }).ma ?? (d as { payload?: { ma?: string } }).payload?.ma; if (ma) moHoSo(ma); }}>
                  {diem.map((d) => <Cell key={d.ma} fill={MAU_HANG[d.hang]} fillOpacity={0.8} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </The>
        <The tieu="Dư nợ theo khu vực" phu="Bong bóng to theo dư nợ · số trong ngoặc là tỷ lệ quá hạn">
          <div className="flex min-h-[260px] flex-wrap items-center justify-center gap-4 rounded-xl bg-background p-4">
            {dsKv.map(([kv, x], i) => {
              const d = 70 + (x.duNo / maxKv) * 110;
              const mau = DAY_MAU[(i + 3) % DAY_MAU.length];
              return (
                <div key={kv} className="flex flex-col items-center justify-center rounded-full border-2 text-center" style={{ width: d, height: d, borderColor: mau, background: `${mau}22` }}>
                  <b className="text-[13px]">{kv}</b>
                  <span className="so text-[11.5px]">{ty(x.duNo)}</span>
                  <span className="text-[10.5px] text-muted">{x.so} KH ({pct(x.duNo > 0 ? x.quaHan / x.duNo : 0)})</span>
                </div>
              );
            })}
          </div>
        </The>
      </section>
    </div>
  );
}
