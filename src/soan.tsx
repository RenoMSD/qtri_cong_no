import { useEffect, useMemo, useState } from 'react';
import { taiXuong } from './pdf';
import { xuatMau } from './pdfMau';
import type { KetQua } from './lib/metrics';
import { KHUNG, MAU_TEN, kiemKhung, type MauId } from './mauIn';
import {
  LOC_MAU_RONG,
  TEN_TRANG_THAI,
  gopMau,
  luaChonMau,
  type LocMau,
  type Tay,
  type TrangThaiTin,
} from './soLieu';
import { XemTrang } from './xemMau';

const MAU_DS: MauId[] = ['tc1', 'tuan', 'khach'];
const TRANG_THAI: Array<'ALL' | TrangThaiTin> = ['ALL', 'binh-thuong', 'sap-cham', 'qua-han', 'rui-ro'];

function nhan(s: string): string {
  return s.trim() ? s : 'Chưa khai';
}

export function SoanIn({
  ky,
  tay,
  mauBanDau,
  moHoSo,
  dong,
}: {
  ky: KetQua | null;
  tay: Tay;
  mauBanDau: MauId;
  moHoSo: (ma: string) => void;
  dong: () => void;
}) {
  const [mau, setMau] = useState<MauId>(mauBanDau);
  const [loc, setLoc] = useState<LocMau>(LOC_MAU_RONG);
  useEffect(() => { setMau(mauBanDau); }, [mauBanDau]);
  const [loi, setLoi] = useState('');
  const [dang, setDang] = useState<'tong-hop' | 'danh-sach' | null>(null);

  const lua = useMemo(() => (ky ? luaChonMau(ky.khach) : { sales: [], khu: [], nhom: [] }), [ky]);
  const du = ky ? gopMau(ky, tay, loc, mau) : null;
  const khoa = dang !== null || !du;
  const lechKhung = kiemKhung(mau);

  function doi<K extends keyof LocMau>(k: K, v: LocMau[K]) {
    setLoc((cu) => ({ ...cu, [k]: v }));
  }

  async function tai(phan: 'tong-hop' | 'danh-sach') {
    if (!du) return;
    setDang(phan);
    setLoi('');
    try {
      const { bytes, tenFile } = await xuatMau(du, phan);
      taiXuong(bytes, tenFile);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : 'Không xuất được PDF.');
    } finally {
      setDang(null);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <h2 className="text-sm font-semibold text-[#123E78]">Mẫu báo cáo</h2>
        {MAU_DS.map((id) => (
          <button
            key={id}
            type="button"
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${mau === id ? 'bg-[#1976D2] text-white' : 'bg-slate-100 text-slate-700'}`}
            onClick={() => setMau(id)}
          >
            {MAU_TEN[id]}
          </button>
        ))}
        <button type="button" className="ml-auto text-xs text-slate-500" onClick={() => setLoc(LOC_MAU_RONG)}>Xóa bộ lọc</button>
        <button type="button" disabled={khoa} onClick={() => tai('tong-hop')} className="rounded-md bg-[#1976D2] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40">
          {dang === 'tong-hop' ? 'Đang xuất…' : 'Tải bản tổng hợp'}
        </button>
        <button type="button" disabled={khoa} onClick={() => tai('danh-sach')} className="rounded-md border border-[#1976D2] px-3 py-1.5 text-xs font-semibold text-[#1976D2] disabled:opacity-40">
          {dang === 'danh-sach' ? 'Đang xuất…' : 'Tải bản danh sách'}
        </button>
        <button type="button" className="text-xs text-slate-500" onClick={dong}>Đóng</button>
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="w-56 shrink-0 space-y-3 overflow-y-auto border-r border-slate-200 bg-white p-3 text-xs">
          <p className="text-slate-500">Bộ lọc trên mẫu. Không lọc tháng hay quý. Kỳ là ngày chốt của sổ đã xác nhận.</p>
          <label className="block text-slate-500">Sale
            <select className="mt-1 w-full rounded border border-slate-200 px-2 py-1" value={loc.sale} onChange={(e) => doi('sale', e.target.value)}>
              <option value="ALL">Tất cả</option>
              {lua.sales.map((s) => <option key={s || '__trong'} value={s}>{nhan(s)}</option>)}
            </select>
          </label>
          <label className="block text-slate-500">Khu vực
            <select className="mt-1 w-full rounded border border-slate-200 px-2 py-1" value={loc.khuVuc} onChange={(e) => doi('khuVuc', e.target.value)}>
              <option value="ALL">Tất cả</option>
              {lua.khu.map((s) => <option key={s || '__trong'} value={s}>{nhan(s)}</option>)}
            </select>
          </label>
          <label className="block text-slate-500">Nhóm khách
            <select className="mt-1 w-full rounded border border-slate-200 px-2 py-1" value={loc.nhomKH} onChange={(e) => doi('nhomKH', e.target.value)}>
              <option value="ALL">Tất cả</option>
              {lua.nhom.map((s) => <option key={s || '__trong'} value={s}>{nhan(s)}</option>)}
            </select>
          </label>
          <label className="block text-slate-500">Trạng thái tín dụng
            <select className="mt-1 w-full rounded border border-slate-200 px-2 py-1" value={loc.trangThai} onChange={(e) => doi('trangThai', e.target.value as LocMau['trangThai'])}>
              {TRANG_THAI.map((t) => <option key={t} value={t}>{t === 'ALL' ? 'Tất cả' : TEN_TRANG_THAI[t]}</option>)}
            </select>
          </label>
          {lechKhung.length > 0 ? <p className="text-red-700">{lechKhung.join(' ')}</p> : null}
          {loi ? <p className="text-red-700">{loi}</p> : null}
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3">
          {!du ? (
            <div className="rounded-xl bg-white p-8 text-sm text-slate-500">Chưa nạp sổ</div>
          ) : (
            <>
              <div className="min-h-0 flex-1">
                <XemTrang du={du} onLoc={(k, v) => doi(k, v)} onMa={moHoSo} />
              </div>
              <p className="mt-2 shrink-0 text-xs text-slate-500">
                Danh sách «{du.sau.tieu}»: {du.sau.dong.length} dòng. In riêng bằng Tải bản danh sách.
              </p>
            </>
          )}
        </div>
      </div>
      <div className="border-t border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-500">
        Khổ 16:9 · {KHUNG[mau].length} ô trên bản tổng hợp · danh sách là file PDF riêng
      </div>
    </div>
  );
}
