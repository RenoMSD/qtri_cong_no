import { useState } from 'react';
import type { KhoGiay } from '../../Credit/src/lib/pdfReport';
import { soBoTest } from './boTest';
import { Khoi } from './khoi';
import { KHUNG_GIAY, taiXuong, xuatBaoCao } from './pdf';
import type { KetQua } from '../../Credit/src/lib/metrics';
import { LOAI_TEN, chonTu, mucMacDinh, soKhoi, type Loc, type LoaiDash, type MucIn, type PhamVi, type Tay } from './soLieu';

const LOAI: LoaiDash[] = ['tuan', 'tc1', 'tc2', 'hoso', 'tuoi', 'thuhoi', 'ruiro', 'tongquan', 'ap', 'tien', 'mua'];
const LOAI_TEST = new Set<LoaiDash>(['ap', 'tien', 'mua']);
const KHO: KhoGiay[] = ['A4_NGANG', 'A4_DOC', 'A3_NGANG', 'A3_DOC'];

export function SoanIn({
  ky,
  loc,
  tay,
  ma,
  setMa,
  loaiBanDau,
  dong,
}: {
  ky: KetQua | null;
  loc: Loc;
  tay: Tay;
  ma: string | null;
  setMa: (ma: string | null) => void;
  loaiBanDau: LoaiDash;
  dong: () => void;
}) {
  const [loai, setLoai] = useState<LoaiDash>(loaiBanDau);
  const [muc, setMuc] = useState<MucIn[]>(() => mucMacDinh(loaiBanDau));
  const [phamVi, setPhamVi] = useState<PhamVi>('toan-bo');
  const [kho, setKho] = useState<KhoGiay>('A4_NGANG');
  const [keo, setKeo] = useState<string | null>(null);
  const [loi, setLoi] = useState('');
  const [dang, setDang] = useState(false);

  function doiLoai(next: LoaiDash) {
    setLoai(next);
    setMuc(mucMacDinh(next));
  }

  function doiThuTu(tu: string, den: string) {
    if (!tu || tu === den) return;
    setMuc((ds) => {
      const a = ds.findIndex((m) => m.id === tu);
      const b = ds.findIndex((m) => m.id === den);
      if (a < 0 || b < 0) return ds;
      const next = [...ds];
      const [item] = next.splice(a, 1);
      next.splice(b, 0, item);
      return next;
    });
  }

  const chon = ky ? chonTu(ky, loc, tay, ma, phamVi) : null;
  const bat = muc.filter((m) => m.bat);
  const khoa = dang || bat.length === 0 || (loai === 'hoso' && !ma) || (!ky && !LOAI_TEST.has(loai));
  const giay = KHUNG_GIAY[kho];

  async function tai() {
    if (khoa || (!chon && !LOAI_TEST.has(loai))) return;
    setDang(true);
    setLoi('');
    try {
      const { bytes, tenFile } = await xuatBaoCao({ loai, ids: bat.map((m) => m.id), phamVi, kho, chon });
      taiXuong(bytes, tenFile);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : 'Không xuất được PDF.');
    } finally {
      setDang(false);
    }
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-[320px_1fr]">
      <div className="overflow-y-auto border-r border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Soạn báo cáo</h2>
          <button type="button" className="text-sm text-slate-500" onClick={dong}>Đóng</button>
        </div>
        <label className="mb-2 block text-xs text-slate-500">Loại dashboard</label>
        <select className="mb-3 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={loai} onChange={(e) => doiLoai(e.target.value as LoaiDash)}>
          {LOAI.map((l) => (
            <option key={l} value={l}>{LOAI_TEN[l]}</option>
          ))}
        </select>
        {loai === 'hoso' ? (
          <>
            <label className="mb-2 block text-xs text-slate-500">Khách hàng</label>
            <select className="mb-3 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={ma ?? ''} onChange={(e) => setMa(e.target.value || null)}>
              <option value="">Chọn mã</option>
              {(ky?.khach ?? []).map((k) => (
                <option key={k.maKH} value={k.maKH}>{k.maKH}</option>
              ))}
            </select>
          </>
        ) : null}
        <div className="mb-3 flex gap-2 text-sm">
          <label className="flex items-center gap-1"><input type="radio" checked={phamVi === 'toan-bo'} onChange={() => setPhamVi('toan-bo')} />Toàn bộ kỳ</label>
          <label className="flex items-center gap-1"><input type="radio" checked={phamVi === 'loc'} onChange={() => setPhamVi('loc')} />Đang lọc</label>
        </div>
        <label className="mb-2 block text-xs text-slate-500">Khổ giấy</label>
        <select className="mb-3 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={kho} onChange={(e) => setKho(e.target.value as KhoGiay)}>
          {KHO.map((k) => (
            <option key={k} value={k}>{KHUNG_GIAY[k].ten}</option>
          ))}
        </select>
        <p className="mb-2 text-xs text-slate-500">Bật khối cần in. Kéo để đổi thứ tự. Mỗi khối nằm trọn, không cắt giữa khối.</p>
        <ul className="space-y-1">
          {muc.map((m, i) => (
            <li
              key={m.id}
              draggable
              onDragStart={() => setKeo(m.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (keo) doiThuTu(keo, m.id); setKeo(null); }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"
            >
              <input type="checkbox" checked={m.bat} onChange={() => setMuc((ds) => ds.map((x) => x.id === m.id ? { ...x, bat: !x.bat } : x))} />
              <span className="flex-1 text-sm">{m.ten}</span>
              <button type="button" className="text-xs text-slate-400" onClick={() => i > 0 && doiThuTu(m.id, muc[i - 1].id)}>Lên</button>
              <button type="button" className="text-xs text-slate-400" onClick={() => i < muc.length - 1 && doiThuTu(m.id, muc[i + 1].id)}>Xuống</button>
            </li>
          ))}
        </ul>
        {loi ? <p className="mt-3 text-sm text-red-700">{loi}</p> : null}
        <button type="button" disabled={khoa} onClick={tai} className="mt-4 w-full rounded-lg bg-[#0073E6] px-3 py-2 text-sm font-medium text-white disabled:opacity-40">
          {dang ? 'Đang xuất…' : 'Tải PDF'}
        </button>
      </div>
      <div className="overflow-auto bg-slate-200 p-4">
        {!chon && !LOAI_TEST.has(loai) ? (
          <div className="rounded-xl bg-white p-8 text-sm text-slate-500">Chưa nạp sổ</div>
        ) : (
          <div className="mx-auto bg-white shadow" style={{ width: giay.w, minHeight: giay.h }}>
            <div className="p-6">
              <div className="mb-4 border-b border-slate-200 pb-2 text-xs text-slate-500">
                {LOAI_TEN[loai]} · {KHUNG_GIAY[kho].ten} · {phamVi === 'loc' ? 'Đang lọc' : 'Toàn bộ kỳ'}
              </div>
              {loai === 'hoso' && !ma ? <p className="text-sm text-slate-500">Chọn một mã khách để xem trước hồ sơ.</p> : null}
              <div className="flex flex-col gap-4">
                {bat.map((m) => (
                  <Khoi key={m.id} so={soBoTest(m.id) ?? (chon ? soKhoi(m.id, chon) : { loai: 'trong', tieu: m.ten, dong: 'Chưa nạp sổ' })} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
