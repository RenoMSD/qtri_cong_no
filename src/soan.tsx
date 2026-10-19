import { useEffect, useMemo, useState } from 'react';
import type { KetQua } from './lib/metrics';
import type { MauId } from './mauIn';
import {
  LOC_MAU_RONG,
  TEN_TRANG_THAI,
  locMauKhach,
  luaChonMau,
  tenKhach,
  type LocMau,
  type Tay,
  type TrangThaiTin,
} from './soLieu';
import { BaoCaoTC1, NGUONG_RUI_RO_MAC_DINH, type NguongRuiRo } from './baoCao/BaoCaoTC1';
import { BaoCaoTuan } from './baoCao/BaoCaoTuan';
import { BaoCaoKhach } from './baoCao/BaoCaoKhach';
import { CongIn, XemTruoc, useInBaoCao } from './baoCao/khung';

// 3 mẫu in dựng bằng HTML theo template khách gửi (template_report/), in qua hộp thoại In của trình duyệt
const MAU_DS: { id: MauId; ten: string }[] = [
  { id: 'tc1', ten: 'TC1 — Công nợ theo KH' },
  { id: 'tuan', ten: 'Công nợ tuần' },
  { id: 'khach', ten: 'Hồ sơ khách hàng' },
];
const TRANG_THAI: Array<'ALL' | TrangThaiTin> = ['ALL', 'binh-thuong', 'sap-cham', 'qua-han', 'rui-ro'];

function nhan(s: string): string {
  return s.trim() ? s : 'Chưa khai';
}

const O_NHAP = 'mt-1 w-full rounded border border-slate-200 px-2 py-1';
const TIEU_NHOM = 'border-t border-slate-200 pt-3 font-semibold text-[#233543]';

export function SoanIn({
  ky,
  tay,
  suaTay,
  mauBanDau,
  maBanDau,
  moHoSo,
  dong,
}: {
  ky: KetQua | null;
  tay: Tay;
  suaTay: (t: Tay) => void;
  mauBanDau: MauId;
  maBanDau?: string | null;
  moHoSo: (ma: string) => void;
  dong: () => void;
}) {
  const [mau, setMau] = useState<MauId>(mauBanDau);
  const [loc, setLoc] = useState<LocMau>(LOC_MAU_RONG);
  const [nguong, setNguong] = useState<NguongRuiRo>(NGUONG_RUI_RO_MAC_DINH);
  const [maChon, setMaChon] = useState<string | null>(maBanDau ?? null);
  useEffect(() => { setMau(mauBanDau); }, [mauBanDau]);
  useEffect(() => { if (maBanDau) setMaChon(maBanDau); }, [maBanDau]);
  const { dangIn, batDauIn } = useInBaoCao();

  const lua = useMemo(() => (ky ? luaChonMau(ky.khach) : { sales: [], khu: [], nhom: [] }), [ky]);
  const dsLoc = useMemo(() => (ky ? locMauKhach(ky.khach, loc) : []), [ky, loc]);
  const dsKhach = useMemo(() => [...dsLoc].sort((a, b) => b.duNo - a.duNo), [dsLoc]);
  const kh = dsKhach.find((k) => k.maKH === maChon) ?? dsKhach[0] ?? null;
  const nhanLoc = [
    loc.sale !== 'ALL' ? `Sale ${nhan(loc.sale)}` : 'Tất cả Sale',
    loc.khuVuc !== 'ALL' ? `khu vực ${nhan(loc.khuVuc)}` : '',
    loc.nhomKH !== 'ALL' ? `nhóm ${nhan(loc.nhomKH)}` : '',
    loc.trangThai !== 'ALL' ? TEN_TRANG_THAI[loc.trangThai].toLowerCase() : '',
  ].filter(Boolean).join(' · ');

  let baoCao = null;
  if (ky && mau === 'tc1') {
    baoCao = <BaoCaoTC1 list={dsLoc} tongSoKhach={ky.khach.length} meta={ky.meta} nhanLoc={nhanLoc} nguong={nguong} deXuat={tay.deXuat} />;
  } else if (ky && mau === 'tuan') {
    baoCao = <BaoCaoTuan list={dsLoc} meta={ky.meta} tay={tay} nhanLoc={nhanLoc} />;
  } else if (ky && mau === 'khach' && kh) {
    baoCao = <BaoCaoKhach kh={kh} meta={ky.meta} tay={tay} />;
  }

  function doi<K extends keyof LocMau>(k: K, v: LocMau[K]) {
    setLoc((cu) => ({ ...cu, [k]: v }));
  }
  function suaDeXuat(ds: string[]) {
    suaTay({ ...tay, deXuat: ds });
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-[#f5f7fa]" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="flex min-h-[72px] flex-wrap items-center gap-2 border-b border-[#dfe6ec] bg-white px-5 py-3">
        <h2 className="text-[16px] font-semibold text-[#233543]">Mẫu báo cáo</h2>
        {MAU_DS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-[12px] ${mau === m.id ? 'bg-[#e8f2fb] text-[#1769aa]' : 'text-[#697887]'}`}
            onClick={() => setMau(m.id)}
          >
            {m.ten}
          </button>
        ))}
        <button type="button" className="ml-auto text-xs text-slate-500" onClick={() => setLoc(LOC_MAU_RONG)}>Xóa bộ lọc</button>
        <button type="button" disabled={!baoCao || dangIn} onClick={batDauIn} className="rounded-lg bg-[#1769aa] px-3 py-1.5 text-[12px] text-white hover:bg-[#125b92] disabled:opacity-40">
          In / Xuất PDF
        </button>
        <button type="button" className="text-xs text-slate-500" onClick={dong}>Đóng</button>
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="w-60 shrink-0 space-y-3 overflow-y-auto border-r border-[#dfe6ec] bg-[#fbfcfd] p-4 text-[12px] text-[#697887]">
          <p className="text-slate-500">Bộ lọc trên mẫu. Kỳ là ngày chốt của sổ đã nạp.</p>
          <label className="block text-slate-500">Sale
            <select className={O_NHAP} value={loc.sale} onChange={(e) => doi('sale', e.target.value)}>
              <option value="ALL">Tất cả</option>
              {lua.sales.map((s) => <option key={s || '__trong'} value={s}>{nhan(s)}</option>)}
            </select>
          </label>
          <label className="block text-slate-500">Khu vực
            <select className={O_NHAP} value={loc.khuVuc} onChange={(e) => doi('khuVuc', e.target.value)}>
              <option value="ALL">Tất cả</option>
              {lua.khu.map((s) => <option key={s || '__trong'} value={s}>{nhan(s)}</option>)}
            </select>
          </label>
          <label className="block text-slate-500">Nhóm khách
            <select className={O_NHAP} value={loc.nhomKH} onChange={(e) => doi('nhomKH', e.target.value)}>
              <option value="ALL">Tất cả</option>
              {lua.nhom.map((s) => <option key={s || '__trong'} value={s}>{nhan(s)}</option>)}
            </select>
          </label>
          <label className="block text-slate-500">Trạng thái tín dụng
            <select className={O_NHAP} value={loc.trangThai} onChange={(e) => doi('trangThai', e.target.value as LocMau['trangThai'])}>
              {TRANG_THAI.map((t) => <option key={t} value={t}>{t === 'ALL' ? 'Tất cả' : TEN_TRANG_THAI[t]}</option>)}
            </select>
          </label>

          {mau === 'tc1' ? (
            <>
              <div className={TIEU_NHOM}>Tiêu chí rủi ro cao</div>
              <label className="block text-slate-500">%QH/Dư nợ ≥ (%)
                <input type="number" min={0} max={100} step={5} className={O_NHAP} value={Math.round(nguong.tyLeQh * 100)} onChange={(e) => setNguong((n) => ({ ...n, tyLeQh: Number(e.target.value) / 100 }))} />
              </label>
              <label className="block text-slate-500">Nợ quá hạn ≥ (tỷ đồng)
                <input type="number" min={0} step={0.1} className={O_NHAP} value={nguong.quaHanTy} onChange={(e) => setNguong((n) => ({ ...n, quaHanTy: Number(e.target.value) }))} />
              </label>
              <div className={TIEU_NHOM}>Đề xuất — Kiến nghị</div>
              <p className="text-slate-500">In ở mục 5. Lưu theo kỳ sổ đã nạp.</p>
              {(tay.deXuat.length ? tay.deXuat : ['']).map((d, i, ds) => (
                <div key={i} className="flex gap-1">
                  <textarea className="min-h-14 w-full rounded border border-slate-200 px-2 py-1" value={d} placeholder={`Đề xuất ${i + 1}`} onChange={(e) => suaDeXuat(ds.map((x, j) => (j === i ? e.target.value : x)))} />
                  <button type="button" title="Xóa dòng" className="self-start px-1 text-slate-400 hover:text-red-600" onClick={() => suaDeXuat(ds.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
              <button type="button" className="text-[#1769aa]" onClick={() => suaDeXuat([...(tay.deXuat.length ? tay.deXuat : ['']), ''])}>+ Thêm dòng</button>
            </>
          ) : null}

          {mau === 'tuan' ? (
            <>
              <div className={TIEU_NHOM}>Ghi chú bộ phận công nợ</div>
              <label className="block text-slate-500">Tuần này
                <textarea className={`${O_NHAP} min-h-24`} value={tay.tuanNay} placeholder="Khách cần theo dõi đặc biệt, quyết định xử lý…" onChange={(e) => suaTay({ ...tay, tuanNay: e.target.value })} />
              </label>
              <label className="block text-slate-500">Tuần sau
                <textarea className={`${O_NHAP} min-h-24`} value={tay.tuanSau} placeholder="Việc bàn giao, kế hoạch tuần sau…" onChange={(e) => suaTay({ ...tay, tuanSau: e.target.value })} />
              </label>
              <p className="text-slate-500">Cột «Hành động tuần sau» lấy từ ô Kế hoạch tuần sau trong hồ sơ từng khách.</p>
            </>
          ) : null}

          {mau === 'khach' ? (
            <>
              <div className={TIEU_NHOM}>Khách hàng</div>
              <select className={O_NHAP} value={kh?.maKH ?? ''} onChange={(e) => setMaChon(e.target.value)}>
                {dsKhach.map((k) => (
                  <option key={k.maKH} value={k.maKH}>{tenKhach(k, tay)} · {(k.duNo / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ</option>
                ))}
              </select>
              <p className="text-slate-500">Xếp theo dư nợ giảm dần, theo bộ lọc phía trên.</p>
              {kh ? (
                <button type="button" className="text-[#1769aa]" onClick={() => moHoSo(kh.maKH)}>
                  Mở hồ sơ để nhập ghi chú, nhật ký thu hồi →
                </button>
              ) : null}
            </>
          ) : null}
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3">
          {baoCao ? (
            <XemTruoc>{baoCao}</XemTruoc>
          ) : (
            <div className="rounded-xl bg-white p-8 text-sm text-slate-500">{ky ? 'Không có khách nào theo bộ lọc.' : 'Chưa nạp sổ'}</div>
          )}
        </div>
      </div>
      <div className="border-t border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-500">
        Bản in A4 ngang, nhiều trang · bấm In / Xuất PDF rồi chọn máy in hoặc «Lưu thành PDF» · bật «Đồ họa nền» nếu màu không hiện
      </div>
      {dangIn && baoCao ? <CongIn>{baoCao}</CongIn> : null}
    </div>
  );
}
