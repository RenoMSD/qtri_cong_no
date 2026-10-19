import { Area, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BUCKET_KEYS, BUCKET_LABEL, nhomSale } from './lib/metrics';
import { pct, ty } from './format';
import { bonNhomCanhBao, cauQuaHanTuan, chuoi8Tuan, tenKhach, type Chon, type NhomCanhBaoId } from './soLieu';
import { ChuGiaiCham, DongHo, DuongNho, The, ThanhNgang } from './giaoDien';
import { DAY_MAU, MAU, MAU_BUCKET, MAU_HANG } from './mauSac';
import { truc } from './khoi';

// Màn Tổng quan theo wireframe: 4 thẻ KPI khác kiểu, biểu đồ vùng 8 tuần, donut tuổi nợ, Sale, cảnh báo, việc tuần này

const SAC_NHOM: Record<NhomCanhBaoId, string> = {
  'vuot-hm': 'bg-risk-bad-soft text-risk-bad',
  'chua-hm': 'bg-risk-watch-soft text-risk-watch',
  'no-xau': 'bg-risk-overdue-soft text-risk-overdue',
  d365: 'bg-risk-info-soft text-risk-info',
};

export function ManTongQuan({
  chon,
  onMoCanhBao,
  onMa,
  onMoMan,
}: {
  chon: Chon | null;
  onMoCanhBao: (id: NhomCanhBaoId) => void;
  onMa: (ma: string) => void;
  onMoMan: (id: 'tuoi' | 'khach' | 'canhbao') => void;
}) {
  if (!chon) return <p className="rounded-2xl bg-card p-6 text-sm text-muted">Chưa nạp sổ. Vào «Nạp dữ liệu» để bắt đầu.</p>;
  const { tong, list, ky, tay } = chon;
  const tuan8 = chuoi8Tuan(list, ky.meta.ngayChot, ky.meta.tuanNhan);
  const cau = cauQuaHanTuan(tuan8);
  const tyLeQh = tong.duNo > 0 ? tong.quaHan / tong.duNo : 0;
  const tren180 = tong.aging.d181_365 + tong.aging.d365;
  const hangDem = (['Tốt', 'Trung bình', 'Xấu', 'Rất xấu'] as const).map((h) => ({ h, so: tong.hang[h] }));
  const xau = tong.hang['Xấu'] + tong.hang['Rất xấu'];
  const tuoi = BUCKET_KEYS.filter((k) => tong.aging[k] > 0).map((k) => ({ k, n: BUCKET_LABEL[k], v: tong.aging[k] }));
  const coDuNo = list.filter((k) => k.duNo > 0 && k.hanDinh != null);
  const tongDu = coDuNo.reduce((s, k) => s + k.duNo, 0);
  const hanBQ = tongDu > 0 ? coDuNo.reduce((s, k) => s + (k.hanDinh ?? 0) * k.duNo, 0) / tongDu : null;
  const dso = tong.dsoKy;
  const tranDso = Math.max(180, (dso ?? 0) * 1.2, (hanBQ ?? 0) * 2);
  const sales = nhomSale(list).sort((a, b) => b.duNo - a.duNo).slice(0, 5);
  const canhBao = bonNhomCanhBao(list, tay).filter((n) => n.soKhach > 0);
  const viec = list.filter((k) => tay.keHoach[k.maKH]?.trim()).sort((a, b) => b.quaHan - a.quaHan).slice(0, 4);

  return (
    <div className="animate-fade-up space-y-5">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-2.5 rounded-2xl bg-sidebar p-5 text-white shadow-elegant">
          <div className="text-[13px] text-sidebar-fg">Tổng phải thu</div>
          <div className="so text-[28px] font-semibold">{ty(tong.duNo)}</div>
          <DuongNho d={tuan8.map((t) => t.quaHan)} mau={MAU.primaryGlow} />
          <div className="flex justify-between text-[12px] text-sidebar-fg">
            <span>Trong hạn {ty(tong.trongHan)} · {pct(tong.duNo > 0 ? tong.trongHan / tong.duNo : 0)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 rounded-2xl bg-risk-bad-soft p-5">
          <div className="text-[13px] text-risk-bad">Nợ quá hạn</div>
          <div className="so text-[28px] font-semibold text-risk-bad">{ty(tong.quaHan)}</div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/70">
            <div className="h-full rounded-full bg-risk-bad" style={{ width: `${Math.min(100, tyLeQh * 100)}%` }} />
          </div>
          <div className="text-[12px] text-risk-bad">{pct(tyLeQh)} tổng dư nợ · trên 180 ngày {ty(tren180)}</div>
        </div>
        <button type="button" onClick={() => onMoMan('khach')} className="flex cursor-pointer items-center gap-4 rounded-2xl bg-primary-soft p-5 text-left">
          <PieChart width={88} height={88}>
            <Pie data={hangDem.filter((d) => d.so > 0)} dataKey="so" nameKey="h" innerRadius={28} outerRadius={42} paddingAngle={2} isAnimationActive={false}>
              {hangDem.filter((d) => d.so > 0).map((d) => <Cell key={d.h} fill={MAU_HANG[d.h]} />)}
            </Pie>
          </PieChart>
          <div>
            <div className="text-[13px] text-primary">Xếp hạng khách</div>
            <div className="so text-[24px] font-semibold text-foreground">{list.length} KH</div>
            <div className="text-[12px] text-subtle">{xau} khách Xấu / Rất xấu</div>
          </div>
        </button>
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-card p-5 text-foreground shadow-card">
          <div className="self-start text-[13px] text-subtle">DSO kỳ</div>
          <DongHo
            tyLe={dso == null ? null : dso / tranDso}
            dai={[
              { den: hanBQ ? Math.min(0.95, hanBQ / tranDso) : 0.33, mau: MAU.safe },
              { den: hanBQ ? Math.min(0.97, (hanBQ * 1.5) / tranDso) : 0.66, mau: MAU.watch },
              { den: 1, mau: MAU.bad },
            ]}
          />
          <div className="so text-[22px] font-semibold">{dso == null ? '—' : `${dso.toLocaleString('vi-VN')} ngày`}</div>
          <div className="text-[12px] text-muted">{hanBQ ? `Hạn thanh toán bình quân ${Math.round(hanBQ)} ngày` : 'Chưa có hạn thanh toán'}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <The
          className="xl:col-span-2"
          tieu="Quá hạn và tiền thu theo tuần"
          phu="8 tuần đến ngày chốt · tỷ đồng"
          phai={<ChuGiaiCham ds={[{ ten: 'Quá hạn', mau: MAU.primary }, { ten: 'Tiền thu', mau: DAY_MAU[1] }]} />}
          chiTiet={() => onMoMan('tuoi')}
          chan={<div className="flex justify-between"><span>↻ Theo sổ chốt {ky.meta.ngayChot.split('-').reverse().join('/')}</span><span>{cau.cau}</span></div>}
        >
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tuan8} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="nenQuaHan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={MAU.primary} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={MAU.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={MAU.line} vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="n" tick={{ fontSize: 11, fill: MAU.muted }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="qh" tickFormatter={truc} tick={{ fontSize: 11, fill: MAU.muted }} width={40} axisLine={false} tickLine={false} />
                <YAxis yAxisId="thu" orientation="right" tickFormatter={truc} tick={{ fontSize: 11, fill: DAY_MAU[1] }} width={40} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: unknown) => ty(Number(v))} />
                <Area yAxisId="qh" type="monotone" dataKey="quaHan" name="Quá hạn" stroke={MAU.primary} strokeWidth={2.5} fill="url(#nenQuaHan)" isAnimationActive={false} />
                <Line yAxisId="thu" type="monotone" dataKey="tienThu" name="Tiền thu" stroke={DAY_MAU[1]} strokeWidth={2.5} dot={{ r: 3, fill: DAY_MAU[1], strokeWidth: 0 }} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </The>
        <The tieu="Cơ cấu tuổi nợ" phu={`Tổng dư nợ ${ty(tong.duNo)}`} chiTiet={() => onMoMan('tuoi')}>
          <div className="relative mx-auto h-[170px] w-[170px]">
            <PieChart width={170} height={170}>
              <Pie data={tuoi} dataKey="v" nameKey="n" innerRadius={56} outerRadius={80} paddingAngle={1.5} isAnimationActive={false}>
                {tuoi.map((d) => <Cell key={d.k} fill={MAU_BUCKET[d.k]} />)}
              </Pie>
            </PieChart>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="so text-[20px] font-semibold">{pct(tong.duNo > 0 ? tren180 / tong.duNo : 0)}</span>
              <span className="text-[10px] text-muted">trên 180 ngày</span>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 text-[12.5px]">
            {tuoi.map((d) => (
              <div key={d.k} className="flex justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-subtle"><span className="size-2 rounded-full" style={{ background: MAU_BUCKET[d.k] }} />{d.n}</span>
                <b className="so font-semibold">{ty(d.v)} · {pct(tong.duNo > 0 ? d.v / tong.duNo : 0)}</b>
              </div>
            ))}
          </div>
        </The>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <The tieu="Dư nợ theo Sale" phu="5 Sale có dư nợ lớn nhất">
          <ThanhNgang ds={sales.map((s, i) => ({ ten: s.sale, v: s.duNo, hien: ty(s.duNo), mau: DAY_MAU[i % DAY_MAU.length] }))} />
        </The>
        <The tieu="Cảnh báo cần xử lý" chiTiet={() => onMoMan('canhbao')}>
          {canhBao.length === 0 ? <p className="text-[13px] text-muted">Không có cảnh báo.</p> : null}
          <ul className="space-y-2">
            {canhBao.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => onMoCanhBao(n.id)} className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left hover:bg-background">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-semibold ${SAC_NHOM[n.id]}`}>{n.soKhach}</span>
                  <span className="min-w-0">
                    <b className="block text-[13px] font-semibold">{n.ten}</b>
                    <span className="text-[12px] text-muted">{n.soKhach} khách · {ty(n.tongTien)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </The>
        <The tieu="Việc tuần này" phu="Từ cột «Kế hoạch tuần sau» của khách" chiTiet={() => onMoMan('khach')}>
          {viec.length === 0 ? (
            <p className="text-[13px] text-muted">Chưa có kế hoạch. Nhập ở Khách hàng › Kế hoạch tuần.</p>
          ) : (
            <ul className="space-y-3">
              {viec.map((k, i) => (
                <li key={k.maKH} className="border-l-[3px] pl-3" style={{ borderColor: DAY_MAU[i % DAY_MAU.length] }}>
                  <button type="button" onClick={() => onMa(k.maKH)} className="cursor-pointer text-left">
                    <b className="text-[13px] font-semibold">{tay.keHoach[k.maKH]}</b>
                    <div className="text-[12px] text-muted">{tenKhach(k, tay)} · quá hạn {ty(k.quaHan)} · {k.sale}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </The>
      </section>
    </div>
  );
}
