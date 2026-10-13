import { useState, useEffect, type MouseEvent } from 'react';
import {
  UploadCloud,
  ChevronRight,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LabelList,
} from 'recharts';
import {
  BUCKET_KEYS,
  BUCKET_LABEL,
  topRuiRo,
  type BucketKey,
  type KetQua,
} from './lib/metrics';
import { parseArrayBuffer } from './lib/parseWorkbook';
import { ngay, pct, so1, soLinh, ty } from './format';
import { ChuaSo, LocBar, tenMan, type ManId } from './khung';
import { CHI_13, CHU_TEST, NGAY_TUAN, THU_13, TUAN_13, soBoTest } from './boTest';
import { DanhSachKeHoachMua, Khoi } from './khoi';
import type { BoLocThoiGian } from './locThoiGian';
import { layKhoangThoiGian } from './locThoiGian';
import { bonNhomCanhBao, cauQuaHanTuan, chuoi8Tuan, namKhachChiem, soKhoi, tenKhach, type Chon, type CotKhach, type Loc, type NhomCanhBaoId, type Tay } from './soLieu';
import { mienY, truc } from './khoi';

const MAU_BUCKET: Record<BucketKey, string> = {
  chuaDenHan: '#0284c7', // Xanh da trời (an toàn)
  traTruocHan: '#0d9488', // Xanh mòng két (tốt)
  denHan: '#10b981', // Xanh lục (đến hạn)
  d0_30: '#84cc16', // Xanh non (0-30d)
  d31_60: '#eab308', // Vàng hổ phách (31-60d)
  d61_90: '#f97316', // Cam (61-90d)
  d91_120: '#f43f5e', // Đỏ hồng (91-120d)
  d121_150: '#ef4444', // Đỏ tươi (121-150d)
  d151_180: '#dc2626', // Đỏ sẫm (151-180d)
  d181_365: '#b91c1c', // Đỏ đậm (181-365d)
  d365: '#881337', // Đỏ rượu vang (>365d)
};

function Tieu({ tieu, phu }: { tieu: string; phu?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[16px] font-semibold text-[#233543]">{tieu}</h2>
      {phu ? <p className="mt-1 text-[12px] text-[#81909d]">{phu}</p> : null}
    </div>
  );
}

export function ManAr({
  tab,
  setTab,
  chonKy,
  chonLoc,
  loc,
  setLoc,
  sales,
  suaTay,
}: {
  tab: 'tuan' | 'tc1' | 'tc2';
  setTab: (t: 'tuan' | 'tc1' | 'tc2') => void;
  chonKy: Chon;
  chonLoc: Chon;
  loc: Loc;
  setLoc: (l: Loc) => void;
  sales: string[];
  suaTay: (t: Tay) => void;
}) {
  const ky = chonKy.ky;
  const tuan = `${ky.meta.tuanNhan} · ${ngay(ky.meta.tuanTu)} – ${ngay(ky.meta.tuanDen)}`;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tieu tieu="AR Dashboard" phu={tab === 'tuan' ? tuan : `Chốt ${ngay(ky.meta.ngayChot)} · ${ky.nhanDiem}`} />
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
          {(['tuan', 'tc1', 'tc2'] as const).map((t) => (
            <button key={t} type="button" className={`rounded-md px-3 py-1 ${tab === t ? 'bg-white text-[#1769aa]' : 'text-slate-600'}`} onClick={() => setTab(t)}>
              {t === 'tuan' ? 'Tuần' : t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <LocBar sales={sales} loc={loc} setLoc={setLoc} />
      {tab === 'tuan' ? (
        <>
          <Khoi so={soKhoi('tuan-kpi', chonKy)} />
          <div className="grid gap-4 xl:grid-cols-2">
            <Khoi so={soKhoi('tuan-tuoi', chonLoc)} />
            <Khoi so={soKhoi('tuan-phat-sinh', chonLoc)} />
            <Khoi so={soKhoi('tuan-qh-thang', chonLoc)} />
            <Khoi so={soKhoi('tuan-luy-ke', chonLoc)} />
          </div>
          <Khoi so={soKhoi('tuan-sale', chonLoc)} onThe={(sale) => setLoc({ ...loc, sale: sale || 'ALL' })} />
          <div className="grid gap-4 md:grid-cols-2">
            <Khoi so={soKhoi('tuan-nay', chonKy)} onChu={(van) => suaTay({ ...chonKy.tay, tuanNay: van })} />
            <Khoi so={soKhoi('tuan-sau', chonKy)} onChu={(van) => suaTay({ ...chonKy.tay, tuanSau: van })} />
          </div>
        </>
      ) : null}
      {tab === 'tc1' ? (
        <>
          <Khoi so={soKhoi('tc1-kpi', chonKy)} />
          <Khoi so={soKhoi('tc1-co-cau', chonLoc)} />
          <Khoi so={soKhoi('tc1-sale', chonLoc)} onThe={(sale) => setLoc({ ...loc, sale: sale || 'ALL' })} />
          <Khoi so={soKhoi('tc1-hm', chonKy)} />
          <Khoi so={soKhoi('tc1-rui-ro', chonLoc)} />
          <Khoi so={soKhoi('tc1-de-xuat', chonKy)} />
        </>
      ) : null}
      {tab === 'tc2' ? (
        <>
          <p className="text-sm text-slate-500">Các thẻ lấy từ chỉ tiêu kỳ. Không có điểm công ty dạng x/5.</p>
          <div className="grid gap-4 md:grid-cols-2">
            {['TC-2.1a', 'TC-2.1b', 'TC-2.2a', 'TC-2.2b', 'TC-2.3', 'TC-2.4', 'TC-2.5'].map((ma) => (
              <Khoi key={ma} so={soKhoi(`tc2:${ma}`, chonKy)} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ManKhach({
  chonLoc,
  loc,
  setLoc,
  sales,
  moHoSo,
  suaTay,
}: {
  chonLoc: Chon;
  loc: Loc;
  setLoc: (l: Loc) => void;
  sales: string[];
  moHoSo: (ma: string) => void;
  suaTay: (t: Tay) => void;
}) {
  const [maMoi, setMaMoi] = useState('');
  const [tenMoi, setTenMoi] = useState('');
  return (
    <div className="space-y-4">
      <Tieu tieu="Khách hàng" phu="Bấm mã để mở một hồ sơ. Khách thêm tay không cộng vào tổng dư nợ." />
      <LocBar sales={sales} loc={loc} setLoc={setLoc} />
      <Khoi so={soKhoi('tuan-bang', chonLoc)} onMa={moHoSo} />
      <section className="rounded-xl border border-[#dfe6ec] bg-white shadow-[0_1px_2px_rgba(20,40,60,0.03)] p-4">
        <h3 className="text-sm font-semibold">Thêm tay</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <input className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" placeholder="Mã" value={maMoi} onChange={(e) => setMaMoi(e.target.value)} />
          <input className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" placeholder="Tên" value={tenMoi} onChange={(e) => setTenMoi(e.target.value)} />
          <button
            type="button"
            className="rounded-lg bg-[#1769aa] px-3 py-1.5 text-sm text-white"
            onClick={() => {
              const maKH = maMoi.trim();
              if (!maKH) return;
              suaTay({ ...chonLoc.tay, them: [...chonLoc.tay.them.filter((t) => t.maKH !== maKH), { maKH, ten: tenMoi.trim() }] });
              setMaMoi('');
              setTenMoi('');
            }}
          >
            Thêm
          </button>
        </div>
        <ul className="mt-3 text-sm text-slate-600">
          {chonLoc.tay.them.length === 0 ? <li>Chưa thêm mã nào.</li> : null}
          {chonLoc.tay.them.map((t) => (
            <li key={t.maKH}>{t.maKH} · {t.ten || 'Chưa đặt tên'} · dư nợ 0</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function ManHoSo({ chon, suaTay }: { chon: Chon; suaTay: (t: Tay) => void }) {
  const ma = chon.ma;
  const [dong, setDong] = useState('');
  if (!ma) return <p className="text-sm text-slate-500">Chọn một khách từ danh sách.</p>;
  const tay = chon.tay;
  return (
    <div className="space-y-4">
      <Tieu tieu={`${ma.maKH} · ${tenKhach(ma, tay)}`} phu={chon.ky.nhanDiem} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Khoi so={soKhoi('hs-diem', chon)} />
        <Khoi so={soKhoi('hs-hm', chon)} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Khoi so={soKhoi('hs-tp', chon)} />
        <Khoi so={soKhoi('hs-tron', chon)} />
        <Khoi so={soKhoi('hs-tuoi', chon)} />
        <Khoi so={soKhoi('hs-qh', chon)} />
        <Khoi so={soKhoi('hs-luyke', chon)} />
      </div>
      <section className="rounded-xl border border-[#dfe6ec] bg-white shadow-[0_1px_2px_rgba(20,40,60,0.03)] p-4">
        <h3 className="text-sm font-semibold">Nhật ký thu hồi</h3>
        <div className="mt-2 flex gap-2">
          <input className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={dong} placeholder="Nội dung lần liên hệ" onChange={(e) => setDong(e.target.value)} />
          <button
            type="button"
            className="rounded-lg bg-[#1769aa] px-3 py-1.5 text-sm text-white"
            onClick={() => {
              const van = dong.trim();
              if (!van) return;
              const cu = tay.nhatKy[ma.maKH] ?? [];
              suaTay({ ...tay, nhatKy: { ...tay.nhatKy, [ma.maKH]: [...cu, van] } });
              setDong('');
            }}
          >
            Ghi
          </button>
        </div>
        <Khoi so={soKhoi('hs-nhat', { ...chon, tay })} />
      </section>
      <Khoi so={soKhoi('hs-hd', chon)} />
      <section className="grid gap-3 rounded-xl border border-[#dfe6ec] bg-white shadow-[0_1px_2px_rgba(20,40,60,0.03)] p-4 md:grid-cols-2">
        <label className="text-sm">
          Tên ghi tay
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5" value={tay.ten[ma.maKH] ?? ''} placeholder={ma.tenKH || 'Chưa có tên trong sổ'} onChange={(e) => suaTay({ ...tay, ten: { ...tay.ten, [ma.maKH]: e.target.value } })} />
        </label>
        <label className="text-sm">
          Kế hoạch tuần sau
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5" value={tay.keHoach[ma.maKH] ?? ''} onChange={(e) => suaTay({ ...tay, keHoach: { ...tay.keHoach, [ma.maKH]: e.target.value } })} />
        </label>
        <label className="text-sm md:col-span-2">
          Ghi chú
          <textarea className="mt-1 min-h-16 w-full rounded-lg border border-slate-200 px-2 py-1.5" value={tay.ghi[ma.maKH] ?? ''} onChange={(e) => suaTay({ ...tay, ghi: { ...tay.ghi, [ma.maKH]: e.target.value } })} />
        </label>
      </section>
    </div>
  );
}

export function ManBieu({
  tieu,
  ids,
  chon,
  loc,
  setLoc,
  sales,
  onMa,
}: {
  tieu: string;
  ids: string[];
  chon: Chon;
  loc: Loc;
  setLoc: (l: Loc) => void;
  sales: string[];
  onMa?: (ma: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Tieu tieu={tieu} phu={`Chốt ${ngay(chon.ky.meta.ngayChot)}`} />
      <LocBar sales={sales} loc={loc} setLoc={setLoc} />
      {ids.map((id) => (
        <Khoi key={id} so={soKhoi(id, chon)} onMa={onMa} />
      ))}
    </div>
  );
}

export function ManKeHoach({ chon, suaTay }: { chon: Chon; suaTay: (t: Tay) => void }) {
  return (
    <div className="space-y-4">
      <Tieu tieu="Kế hoạch tuần và dự báo thu" phu="Cột doanh thu dự kiến để trống vì sổ không có công thức đó. Kế hoạch là chữ tự nhập." />
      <div className="overflow-auto rounded-xl border border-[#dfe6ec] bg-white shadow-[0_1px_2px_rgba(20,40,60,0.03)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2">Mã</th>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2">Dư nợ</th>
              <th className="px-3 py-2">Kế hoạch tuần sau</th>
              <th className="px-3 py-2">Doanh thu dự kiến</th>
            </tr>
          </thead>
          <tbody>
            {chon.list.map((k) => (
              <tr key={k.maKH} className="border-t border-slate-100">
                <td className="px-3 py-2">{k.maKH}</td>
                <td className="px-3 py-2">{tenKhach(k, chon.tay)}</td>
                <td className="so px-3 py-2">{ty(k.duNo)}</td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1"
                    value={chon.tay.keHoach[k.maKH] ?? ''}
                    onChange={(e) => suaTay({ ...chon.tay, keHoach: { ...chon.tay.keHoach, [k.maKH]: e.target.value } })}
                  />
                </td>
                <td className="px-3 py-2 text-slate-400">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ManCanhBao({
  chon,
  moHoSo,
  nhomChonBanDau,
}: {
  chon: Chon;
  moHoSo: (ma: string) => void;
  nhomChonBanDau?: NhomCanhBaoId | null;
}) {
  const nhom = bonNhomCanhBao(chon.list, chon.tay);
  const [nhomXem, setNhomXem] = useState<NhomCanhBaoId | 'all'>(nhomChonBanDau ?? 'all');

  useEffect(() => {
    if (nhomChonBanDau) {
      setNhomXem(nhomChonBanDau);
    }
  }, [nhomChonBanDau]);

  const hienThiNhom = nhomXem === 'all' ? nhom : nhom.filter((n) => n.id === nhomXem);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tieu tieu="Cảnh báo AR" phu="Bốn nhóm rủi ro: Vượt hạn mức, Chưa có hạn mức, Nợ xấu, Quá hạn trên 365 ngày." />
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            className={`cursor-pointer rounded-lg px-3 py-1.5 transition ${nhomXem === 'all' ? 'bg-[#1769aa] text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
            onClick={() => setNhomXem('all')}
          >
            Tất cả 4 nhóm
          </button>
        </div>
      </div>

      {/* 4 thẻ cảnh báo đầu trang để nhảy tới nhóm */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {nhom.map((n) => {
          const active = nhomXem === n.id;
          return (
            <button
              key={n.id}
              type="button"
              className={`cursor-pointer rounded-xl border p-4 text-left transition ${active ? 'border-[#1769aa] bg-blue-50/40 ring-2 ring-[#1769aa]/20' : 'border-slate-200 bg-white hover:border-[#1769aa]'}`}
              onClick={() => setNhomXem(active ? 'all' : n.id)}
            >
              <div className="text-[13px] text-[#384956]">{n.ten}</div>
              <div className="mt-2 text-[12px] text-[#81909d]">{n.soKhach} khách</div>
              <div className="so mt-1 text-[15px] font-normal text-[#304451]">
                {n.id === 'vuot-hm' ? `Vượt ${ty(n.tongTien)}` : ty(n.tongTien)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Danh sách từng nhóm */}
      <div className="space-y-6">
        {hienThiNhom.map((n) => (
          <section key={n.id} className="rounded-xl border border-[#dfe6ec] bg-white shadow-[0_1px_2px_rgba(20,40,60,0.03)] p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-base font-semibold text-slate-800">
                {n.ten} <span className="ml-1 text-sm font-normal text-slate-500">({n.soKhach} khách · {n.id === 'vuot-hm' ? 'Tổng vượt' : 'Tổng tiền'} {ty(n.tongTien)})</span>
              </h3>
            </div>
            {n.danhSach.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">Không có khách thuộc nhóm này.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[#7b8996]">
                    <tr>
                      <th className="px-3 py-2">Mã KH</th>
                      <th className="px-3 py-2">Tên khách</th>
                      <th className="px-3 py-2">Sale</th>
                      <th className="px-3 py-2">Số tiền</th>
                      <th className="px-3 py-2">Hạng</th>
                      <th className="px-3 py-2">Điểm</th>
                      <th className="px-3 py-2">Chi tiết lý do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {n.danhSach.map((k) => (
                      <tr key={`${n.id}-${k.maKH}`} className="border-t border-[#edf0f2]">
                        <td className="px-3 py-2">
                          <button type="button" className="cursor-pointer text-[#1769aa] hover:underline" onClick={() => moHoSo(k.maKH)}>
                            {k.maKH}
                          </button>
                        </td>
                        <td className="px-3 py-2">{k.tenKH}</td>
                        <td className="px-3 py-2 text-[#697887]">{k.sale}</td>
                        <td className="so px-3 py-2 text-[#304451]">{ty(k.tien)}</td>
                        <td className="px-3 py-2">{k.hang}</td>
                        <td className="so px-3 py-2">{k.diem != null ? so1(k.diem) : '—'}</td>
                        <td className="px-3 py-2 text-[#697887]">{k.ly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function soToa(v: string | number | undefined): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v !== '' && Number.isFinite(Number(v))) return Number(v);
  return undefined;
}

function NhanTy({ x, y, width, height, value }: { x?: string | number; y?: string | number; width?: string | number; height?: string | number; value?: unknown }) {
  const n = typeof value === 'number' ? value : Number(value);
  const xx = soToa(x);
  const yy = soToa(y) ?? 0;
  const ww = soToa(width) ?? 0;
  const hh = soToa(height) ?? 0;
  if (!Number.isFinite(n) || n === 0 || xx == null) return <g />;
  const t = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n / 1e9);
  const trongCot = hh > 22;
  return (
    <text x={xx + ww / 2} y={trongCot ? yy + 13 : Math.max(11, yy - 6)} textAnchor="middle" fontSize={10} fill={trongCot ? '#ffffff' : '#506170'}>
      {t}
    </text>
  );
}

function CotKhachXep(props: { x?: number; y?: number; width?: number; height?: number; payload?: CotKhach }) {
  const x = props.x ?? 0;
  const y = props.y ?? 0;
  const width = props.width ?? 0;
  const height = props.height ?? 0;
  const row = props.payload;
  const bam = (props as { onClick?: (e: MouseEvent<SVGGElement>) => void }).onClick;
  if (!row || width <= 0 || height <= 0) return <g />;
  const damW = row.duNo > 0 ? (width * row.dam) / row.duNo : 0;
  return (
    <g onClick={bam} style={{ cursor: 'pointer' }}>
      <rect x={x} y={y} width={damW} height={height} fill="#1769aa" />
      <rect x={x + damW} y={y} width={Math.max(0, width - damW)} height={height} fill="#c5dcef" />
      <text x={x + width + 6} y={y + height / 2} dominantBaseline="middle" fontSize={11} fill="#304451">
        {ty(row.duNo)}
      </text>
    </g>
  );
}

function TipTuan({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey?: string | number; value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const qh = payload.find((p) => p.dataKey === 'quaHan')?.value ?? 0;
  const thu = payload.find((p) => p.dataKey === 'tienThu')?.value ?? 0;
  return (
    <div className="rounded-lg border border-[#dfe6ec] bg-white px-3 py-2 text-xs shadow">
      <div className="mb-1 text-[#384956]">{label}</div>
      <div className="so text-[#1769aa]">Quá hạn: {ty(qh)}</div>
      <div className="so text-[#27875b]">Tiền thu: {ty(thu)}</div>
    </div>
  );
}

function cauNetThap(): string {
  let i = 0;
  for (let k = 1; k < THU_13.length; k += 1) {
    if (THU_13[k] - CHI_13[k] < THU_13[i] - CHI_13[i]) i = k;
  }
  return `Tuần Net thấp nhất là ${TUAN_13[i]} ${NGAY_TUAN[i]}: ${ty((THU_13[i] - CHI_13[i]) * 1e9)}.`;
}

function TipKhach({ active, payload }: { active?: boolean; payload?: Array<{ payload?: CotKhach }> }) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-lg border border-[#dfe6ec] bg-white px-3 py-2 text-xs shadow">
      <div className="text-[#384956]">{row.ten}</div>
      <div className="mt-0.5 text-[#728290]">Sale: {row.sale}</div>
      <div className="so mt-1 text-[#304451]">Dư nợ: {ty(row.duNo)}</div>
      <div className="so text-[#1769aa]">Quá hạn: {ty(row.quaHan)}</div>
    </div>
  );
}

export function ManTong({
  chon,
  boLoc,
  onMoCanhBao,
  onMa,
  onMoTc1,
}: {
  chon: Chon | null;
  boLoc?: BoLocThoiGian;
  onMoCanhBao?: (id: NhomCanhBaoId) => void;
  onMa?: (ma: string) => void;
  onMoTc1?: () => void;
}) {
  const khoang = boLoc ? layKhoangThoiGian(boLoc, chon?.ky.meta) : null;
  const tong = chon?.tong;
  const nhomCanhBao = chon ? bonNhomCanhBao(chon.list, chon.tay) : [];
  const topKhach = chon ? topRuiRo(chon.list, 10) : [];
  const duLieuTuoiDuong = tong
    ? BUCKET_KEYS.filter((k) => tong.aging[k] > 0).map((k) => ({
        k,
        n: BUCKET_LABEL[k],
        v: tong.aging[k],
      }))
    : [];
  const tren180 = tong ? tong.aging.d181_365 + tong.aging.d365 : 0;
  const tuan8 = chon ? chuoi8Tuan(chon.list, chon.ky.meta.ngayChot, chon.ky.meta.tuanNhan) : [];
  const cauTuan = cauQuaHanTuan(tuan8);
  const namKhach = chon ? namKhachChiem(chon.list, chon.tay) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#8593a1]">
          <span>Công nợ, tín dụng và rủi ro danh mục</span>
          {khoang?.laLoc && (
            <span className="rounded-md bg-[#e8f2fb] px-2 py-1 text-[11px] text-[#1769aa]">Kỳ: {khoang.nhan}</span>
          )}
          {chon ? <span className="text-[#81909d]">Nguồn điểm: {chon.ky.nhanDiem}</span> : null}
        </div>
        <button
          type="button"
          disabled={!chon || !onMoTc1}
          className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#1769aa] px-3 text-[12px] text-white hover:bg-[#125b92] disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onMoTc1}
        >
          <FileText className="size-3.5" />
          Báo cáo BGĐ
        </button>
      </div>

      {chon && tong ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[#dfe6ec] bg-white p-4 shadow-[0_1px_2px_rgba(20,40,60,0.03)]">
              <div className="text-[12px] text-[#728290]">Tổng phải thu</div>
              <div className="mt-3 flex items-end gap-1">
                <span className="so text-[26px] font-normal tracking-[-0.04em] text-[#1f2d39]">{ty(tong.duNo)}</span>
              </div>
              <div className="mt-2 inline-flex rounded-md bg-[#e8f2fb] px-2 py-1 text-[11px] text-[#1769aa]">
                Trong hạn {ty(tong.trongHan)} · {pct(tong.duNo > 0 ? tong.trongHan / tong.duNo : 0)}
              </div>
            </div>
            <div className="rounded-xl border border-[#dfe6ec] bg-white p-4 shadow-[0_1px_2px_rgba(20,40,60,0.03)]">
              <div className="text-[12px] text-[#728290]">Nợ quá hạn</div>
              <div className="mt-3 flex items-end gap-1">
                <span className="so text-[26px] font-normal tracking-[-0.04em] text-[#1f2d39]">{ty(tong.quaHan)}</span>
              </div>
              <div className="mt-2 inline-flex rounded-md bg-[#fff0ed] px-2 py-1 text-[11px] text-[#c7634d]">
                {pct(tong.duNo > 0 ? tong.quaHan / tong.duNo : 0)} tổng dư nợ
              </div>
            </div>
            <div className="rounded-xl border border-[#dfe6ec] bg-white p-4 shadow-[0_1px_2px_rgba(20,40,60,0.03)]">
              <div className="text-[12px] text-[#728290]">DSO</div>
              <div className="mt-3 flex items-end gap-1">
                <span className="so text-[26px] font-normal tracking-[-0.04em] text-[#1f2d39]">{tong.dsoKy != null ? so1(tong.dsoKy) : '—'}</span>
                <span className="mb-1 text-[11px] text-[#85929e]">ngày</span>
              </div>
              <div className="mt-2 inline-flex rounded-md bg-[#eaf7f0] px-2 py-1 text-[11px] text-[#27875b]">Thời gian thu tiền bình quân kỳ</div>
              {khoang?.laLoc ? <p className="mt-2 text-[11px] text-[#b87b20]">Số cả kỳ đã nạp, sheet không có ngày theo tháng.</p> : null}
            </div>
            <div className="rounded-xl border border-[#dfe6ec] bg-white p-4 shadow-[0_1px_2px_rgba(20,40,60,0.03)]">
              <div className="text-[12px] text-[#728290]">Nợ xấu (nợ khó đòi)</div>
              <div className="mt-3 flex items-end gap-1">
                <span className="so text-[26px] font-normal tracking-[-0.04em] text-[#1f2d39]">{ty(tong.noKhoDoi)}</span>
              </div>
              <div className="mt-2 inline-flex rounded-md bg-[#fff6e5] px-2 py-1 text-[11px] text-[#b87b20]">{tong.soKhachNoKhoDoi} khách</div>
              {khoang?.laLoc ? <p className="mt-2 text-[11px] text-[#b87b20]">Số cả kỳ đã nạp, sheet không có ngày theo tháng.</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            <div className="flex min-w-0 flex-col rounded-xl border border-[#dfe6ec] bg-white p-5 shadow-[0_1px_2px_rgba(20,40,60,0.03)]">
              <div>
                <h3 className="text-[16px] font-semibold text-[#233543]">Cơ cấu tuổi nợ</h3>
                <p className="mt-1 text-[12px] text-[#81909d]">Phân bổ dư nợ phải thu theo thời gian quá hạn · {ty(tong.duNo)}</p>
              </div>
              <div className="relative mx-auto mt-2 h-40 w-full max-w-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={duLieuTuoiDuong} dataKey="v" nameKey="n" innerRadius={46} outerRadius={68} paddingAngle={2} isAnimationActive={false}>
                      {duLieuTuoiDuong.map((d) => (
                        <Cell key={d.k} fill={MAU_BUCKET[d.k] || '#1769aa'} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { n: string; v: number };
                        const phanTram = tong.duNo > 0 ? (d.v / tong.duNo) * 100 : 0;
                        return (
                          <div className="rounded-lg border border-[#dfe6ec] bg-white p-2.5 text-xs shadow-md">
                            <div className="text-[#384956]">{d.n}</div>
                            <div className="so mt-1 text-[#1769aa]">{ty(d.v)} ({phanTram.toFixed(1)}%)</div>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="so text-base text-[#1f2d39]">{ty(tong.duNo)}</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#9aa5ae]">Tổng dư nợ</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                {duLieuTuoiDuong.map((d) => {
                  const phanTram = tong.duNo > 0 ? (d.v / tong.duNo) * 100 : 0;
                  return (
                    <div key={d.k} className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: MAU_BUCKET[d.k] || '#1769aa' }} />
                        <span className="truncate text-[#384956]">{d.n}</span>
                      </div>
                      <div className="so pl-3.5 text-[#304451]">{phanTram.toFixed(1)}% · {ty(d.v)}</div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 border-t border-[#eef2f5] pt-3 text-[13px] text-[#506170]">
                Nợ trên 180 ngày:{' '}
                <span className="so text-[#c7634d]">{ty(tren180)}</span>
                {' '}({pct(tong.duNo > 0 ? tren180 / tong.duNo : 0)}) — khoản có nguy cơ thu chậm nhất.
              </p>
            </div>

            <div className="flex min-w-0 flex-col rounded-xl border border-[#dfe6ec] bg-white p-5 shadow-[0_1px_2px_rgba(20,40,60,0.03)]">
              <div className="flex items-center justify-between pb-4">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#233543]">Cảnh báo rủi ro và hạn mức</h3>
                  <p className="mt-1 text-[12px] text-[#81909d]">Bấm thẻ để xem danh sách</p>
                </div>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-0.5 text-[12px] text-[#1769aa]"
                  onClick={() => onMoCanhBao?.('vuot-hm')}
                >
                  Xem tất cả <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 flex-1">
                {nhomCanhBao.map((n) => {
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className="flex cursor-pointer flex-col justify-between rounded-lg border border-[#edf0f2] p-3 text-left transition hover:border-[#81b4d5]"
                      onClick={() => onMoCanhBao?.(n.id)}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-[12px] text-[#384956]">{n.ten}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      </div>
                      <div className="mt-2.5">
                        <div className="text-[11px] text-[#8d99a3]">{n.soKhach} khách</div>
                        <div className="so mt-1 text-[15px] font-normal text-[#304451]">
                          {n.id === 'vuot-hm' ? `Vượt ${ty(n.tongTien)}` : ty(n.tongTien)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0 rounded-xl border border-[#dfe6ec] bg-white p-5 shadow-[0_1px_2px_rgba(20,40,60,0.03)] xl:col-span-2 2xl:col-span-1">
              <h3 className="text-[16px] font-semibold text-[#233543]">Năm khách đang chiếm nhiều tiền nhất</h3>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12px] text-[#81909d]">Cột là dư nợ · phần đậm là quá hạn · bấm cột để mở hồ sơ</p>
                <div className="flex items-center gap-3 text-[12px] text-[#506170]">
                  <span className="inline-flex items-center gap-1.5"><span className="inline-block size-2 bg-[#1769aa]" />Quá hạn</span>
                  <span className="inline-flex items-center gap-1.5"><span className="inline-block size-2 bg-[#c5dcef]" />Chưa quá hạn</span>
                </div>
              </div>
              {namKhach.length === 0 ? (
                <p className="mt-6 text-[13px] text-[#81909d]">Chưa có khách có dư nợ.</p>
              ) : (
                <div className="mt-3 h-72">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart layout="vertical" data={namKhach} margin={{ top: 4, right: 64, left: 4, bottom: 0 }}>
                      <CartesianGrid horizontal={false} stroke="#e8edf2" />
                      <XAxis type="number" tickFormatter={truc} tick={{ fontSize: 10, fill: '#506170' }} axisLine={{ stroke: '#dfe6ec' }} tickLine={false} domain={mienY(namKhach.map((d) => d.duNo))} />
                      <YAxis
                        type="category"
                        dataKey="n"
                        width={132}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#304451' }}
                        tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 17)}…` : v)}
                      />
                      <Tooltip content={<TipKhach />} />
                      <Bar dataKey="duNo" name="Dư nợ" barSize={16} shape={CotKhachXep} isAnimationActive={false} cursor="pointer" onClick={(row) => { const ma = (row.payload as CotKhach | undefined)?.ma; if (ma) onMa?.(ma); }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#dfe6ec] bg-white p-5 shadow-[0_1px_2px_rgba(20,40,60,0.03)]">
            <h3 className="text-[16px] font-semibold text-[#233543]">Quá hạn và tiền thu theo tuần</h3>
              <p className="mt-1 text-[12px] text-[#81909d]">8 tuần tính đến ngày chốt · cột là dư quá hạn cuối tuần (trục trái), đường là tiền đã thu trong tuần (trục phải) · đơn vị tỷ đồng</p>
              <div className="mt-3 h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ComposedChart data={tuan8} margin={{ top: 22, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#e8edf2" />
                    <XAxis dataKey="n" tick={{ fontSize: 11, fill: '#506170' }} axisLine={{ stroke: '#dfe6ec' }} tickLine={false} />
                    <YAxis yAxisId="qh" tickFormatter={truc} tick={{ fontSize: 10, fill: '#506170' }} width={36} axisLine={false} tickLine={false} domain={mienY(tuan8.map((d) => d.quaHan))} />
                    <YAxis yAxisId="thu" orientation="right" tickFormatter={truc} tick={{ fontSize: 10, fill: '#27875b' }} width={36} axisLine={false} tickLine={false} domain={mienY(tuan8.map((d) => d.tienThu))} />
                    <Tooltip content={<TipTuan />} />
                    <Legend verticalAlign="top" align="right" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#506170', paddingBottom: 8 }} />
                    <Bar yAxisId="qh" dataKey="quaHan" name="Quá hạn" fill="#1769aa" barSize={22} radius={[2, 2, 0, 0]} isAnimationActive={false}>
                      <LabelList dataKey="quaHan" content={NhanTy} />
                    </Bar>
                    <Line yAxisId="thu" type="monotone" dataKey="tienThu" name="Tiền thu" stroke="#27875b" strokeWidth={2.5} dot={{ r: 3, fill: '#27875b', strokeWidth: 0 }} activeDot={{ r: 4 }} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className={`mt-3 border-t border-[#eef2f5] pt-3 text-[13px] ${cauTuan.huong === 'tang' ? 'text-[#c7634d]' : cauTuan.huong === 'giam' ? 'text-[#27875b]' : 'text-[#506170]'}`}>
                {cauTuan.cau}
              </p>
            </div>

          {/* Danh sách việc: ai thu, khoản nào */}
          <div className="mt-3 rounded-xl border border-[#dfe6ec] bg-white p-5 shadow-[0_1px_2px_rgba(20,40,60,0.03)]">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-[16px] font-semibold text-[#233543]">Top 10 khách hàng có rủi ro cao nhất</h3>
                <p className="mt-1 text-[12px] text-[#81909d]">Xếp theo trọng số quá hạn · bấm mã khách để mở hồ sơ</p>
              </div>
              <span className="hidden text-[11px] text-[#9aa5ae] md:inline-block">
                Trọng số = 0,5×(≤90 ngày) + 0,8×(91–180 ngày) + 1,0×(&gt;180 ngày)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 w-10 text-center">STT</th>
                    <th className="px-3 py-2">Mã KH</th>
                    <th className="px-3 py-2">Tên khách hàng</th>
                    <th className="px-3 py-2">Sale</th>
                    <th className="px-3 py-2 text-right">Quá hạn</th>
                    <th className="px-3 py-2 text-right">Trọng số</th>
                    <th className="px-3 py-2 text-center">Điểm rủi ro</th>
                    <th className="px-3 py-2 text-center">Hạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topKhach.map((k, i) => {
                    const diem = k.diem;
                    const mauDiem =
                      diem == null
                        ? 'bg-slate-100 text-slate-600'
                        : diem >= 4
                          ? 'bg-emerald-50 text-emerald-700'
                          : diem >= 3
                            ? 'bg-blue-50 text-blue-700'
                            : diem >= 2
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700 font-normal';

                    return (
                      <tr key={k.maKH} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-2.5 text-center text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            className="cursor-pointer text-[#1769aa] hover:underline"
                            onClick={() => onMa?.(k.maKH)}
                          >
                            {k.maKH}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-slate-800">{tenKhach(k, chon.tay)}</td>
                        <td className="px-3 py-2.5 text-slate-500">{k.sale || '—'}</td>
                        <td className="so px-3 py-2.5 text-right text-[#c7634d]">{ty(k.quaHan)}</td>
                        <td className="so px-3 py-2.5 text-right text-[#304451]">{ty(k.trongSo)}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[12px] ${mauDiem}`}>
                            {diem != null ? so1(diem) : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center text-slate-600">{k.hang}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-[16px] font-semibold text-[#233543]">Theo tháng trong kỳ</h3>
              <p className="mt-1 text-[12px] text-[#81909d]">Mỗi tháng nợ mới có lớn hơn tiền thu hay không, và dư nợ có tăng nhanh hơn doanh thu hay không</p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Khoi so={soKhoi('tuan-phat-sinh', chon)} />
              <Khoi so={soKhoi('tuan-luy-ke', chon)} />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-[16px] font-semibold text-[#233543]">Chất lượng sổ</h3>
              <p className="mt-1 text-[12px] text-[#81909d]">Hạng khách hàng, và dư quá hạn hiện tại đang nằm ở hóa đơn tháng nào</p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Khoi so={soKhoi('tq-hang', chon)} />
              <Khoi so={soKhoi('tuan-qh-thang', chon)} />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-[16px] font-semibold text-[#233543]">Dòng tiền và kế hoạch tham khảo</h3>
              <p className="mt-1 text-[12px] text-[#81909d]">{CHU_TEST}</p>
            </div>
            <Khoi so={soBoTest('bt-tien-tuan', boLoc)!} />
            <p className="text-[13px] text-[#506170]">{cauNetThap()}</p>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Khoi so={soBoTest('bt-ap-tuoi', boLoc)!} />
              <DanhSachKeHoachMua boLoc={boLoc} />
            </div>
          </div>
        </>
      ) : (
        <p className="rounded-xl bg-white p-4 text-sm text-slate-500">Phải thu: chưa nạp sổ.</p>
      )}
    </div>
  );
}

export function ManNap({ onKy }: { onKy: (ky: KetQua, tep: ArrayBuffer) => void }) {
  const [xem, setXem] = useState<KetQua | null>(null);
  const [tep, setTep] = useState<ArrayBuffer | null>(null);
  const [loi, setLoi] = useState('');
  const [dang, setDang] = useState(false);
  const [keo, setKeo] = useState(false);

  async function doc(goc: ArrayBuffer, ten: string) {
    setDang(true);
    setLoi('');
    const ban = goc.slice(0);
    setTep(ban);
    try {
      setXem(await parseArrayBuffer(ban.slice(0), ten));
    } catch (e) {
      setXem(null);
      setTep(null);
      setLoi(e instanceof Error ? e.message : 'Không đọc được file.');
    } finally {
      setDang(false);
    }
  }

  function nhanFile(f: File | undefined) {
    if (!f) return;
    const ten = f.name.toLowerCase();
    if (!ten.endsWith('.xlsx') && !ten.endsWith('.xls')) {
      setLoi('Chỉ nhận file Excel .xlsx hoặc .xls.');
      return;
    }
    f.arrayBuffer().then((buf) => doc(buf, f.name));
  }

  return (
    <div className="space-y-4">
      <Tieu tieu="Nạp dữ liệu" phu="Kéo file Excel vào khung, đối chiếu khớp rồi dùng kỳ này cho các màn phải thu." />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setKeo(true);
        }}
        onDragLeave={() => setKeo(false)}
        onDrop={(e) => {
          e.preventDefault();
          setKeo(false);
          nhanFile(e.dataTransfer.files?.[0]);
        }}
        className={`rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${keo ? 'border-[#1769aa] bg-blue-50' : 'border-slate-300 bg-white'}`}
      >
        <UploadCloud className={`mx-auto h-12 w-12 ${keo ? 'text-[#1769aa]' : 'text-slate-400'}`} />
        <p className="mt-3 text-base text-slate-800">Kéo thả file Excel vào đây</p>
        <p className="mt-1 text-sm text-slate-500">hoặc chọn từ máy</p>
        <label className="mt-4 inline-block cursor-pointer rounded-full bg-[#1769aa] px-5 py-2 text-sm text-white">
          Chọn file
          <input
            className="hidden"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              nhanFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
          <a className="text-[#1769aa] underline" href="/mau/Mau_Nap_CongNo.xlsx" download>
            Tải file mẫu
          </a>
          <button
            type="button"
            className="text-[#1769aa] underline"
            onClick={async () => {
              const res = await fetch('/mau-test/CongNo_Demo_Test.xlsx');
              if (!res.ok) {
                setLoi('Không mở được file test.');
                return;
              }
              await doc(await res.arrayBuffer(), 'CongNo_Demo_Test.xlsx');
            }}
          >
            Mở sổ demo
          </button>
        </div>
      </div>
      {dang ? <p className="text-sm text-slate-500">Đang đọc…</p> : null}
      {loi ? <p className="text-sm text-red-700">{loi}</p> : null}
      {xem ? (
        <section className="rounded-xl border border-[#dfe6ec] bg-white shadow-[0_1px_2px_rgba(20,40,60,0.03)] p-4">
          <p className="text-sm">
            {xem.tenFile} · chốt {ngay(xem.meta.ngayChot)} · dư nợ {ty(xem.tong.duNo)} · {xem.nhanDiem}
          </p>
          {xem.loiDoc.length > 0 ? <p className="mt-2 text-sm text-red-700">{xem.loiDoc.join(' ')}</p> : null}
          {xem.canhBao.length > 0 ? <p className="mt-2 text-sm text-amber-700">{xem.canhBao.join(' ')}</p> : null}
          <div className="mt-3 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-1">Đối chiếu</th>
                  <th>App</th>
                  <th>Excel</th>
                  <th>Lệch</th>
                  <th>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {xem.kiemTra.map((r) => (
                  <tr key={r.ten} className="border-t border-slate-100">
                    <td className="py-1 pr-2">{r.ten}</td>
                    <td className="so">{soLinh(r.app)}</td>
                    <td className="so">{soLinh(r.excel)}</td>
                    <td className="so">{soLinh(r.lech)}</td>
                    <td>{r.dat ? 'Khớp' : 'Lệch'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" disabled={!tep || xem.chanLuu || xem.loiDoc.length > 0} className="mt-4 rounded-lg bg-[#1769aa] px-3 py-2 text-sm text-white disabled:opacity-40" onClick={() => tep && onKy(xem, tep)}>
            Dùng kỳ này
          </button>
        </section>
      ) : null}
    </div>
  );
}

export function ManTheoId({ id }: { id: ManId }) {
  return <ChuaSo ten={tenMan(id)} />;
}
