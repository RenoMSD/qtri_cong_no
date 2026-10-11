import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import type { KetQua } from './lib/metrics';
import { parseArrayBuffer } from './lib/parseWorkbook';
import { ngay, soLinh, ty } from './format';
import { ChuaSo, LocBar, tenMan, type ManId } from './khung';
import { CHU_TEST, soBoTest } from './boTest';
import { Khoi } from './khoi';
import { canhBaoAr, soKhoi, tenKhach, type Chon, type Loc, type Tay } from './soLieu';

function Tieu({ tieu, phu }: { tieu: string; phu?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-semibold">{tieu}</h2>
      {phu ? <p className="text-sm text-slate-500">{phu}</p> : null}
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
            <button key={t} type="button" className={`rounded-md px-3 py-1 ${tab === t ? 'bg-white font-medium text-[#0073E6]' : 'text-slate-600'}`} onClick={() => setTab(t)}>
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
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold">Thêm tay</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <input className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" placeholder="Mã" value={maMoi} onChange={(e) => setMaMoi(e.target.value)} />
          <input className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" placeholder="Tên" value={tenMoi} onChange={(e) => setTenMoi(e.target.value)} />
          <button
            type="button"
            className="rounded-lg bg-[#0073E6] px-3 py-1.5 text-sm text-white"
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
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold">Nhật ký thu hồi</h3>
        <div className="mt-2 flex gap-2">
          <input className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={dong} placeholder="Nội dung lần liên hệ" onChange={(e) => setDong(e.target.value)} />
          <button
            type="button"
            className="rounded-lg bg-[#0073E6] px-3 py-1.5 text-sm text-white"
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
      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
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
      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
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

export function ManCanhBao({ chon, moHoSo }: { chon: Chon; moHoSo: (ma: string) => void }) {
  const ds = canhBaoAr(chon.list, chon.tay);
  return (
    <div className="space-y-4">
      <Tieu tieu="Cảnh báo AR" phu="Vượt hạn mức, chưa có hạn mức còn dư nợ, nợ xấu, quá hạn." />
      <ul className="space-y-2">
        {ds.length === 0 ? <li className="rounded-xl bg-white p-4 text-sm text-slate-500">Không có cảnh báo trên bộ đang xem.</li> : null}
        {ds.map((d, i) => (
          <li key={`${d.ma}-${i}`}>
            <button type="button" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm hover:border-[#0073E6]" onClick={() => moHoSo(d.ma)}>
              <span className="font-medium text-[#0073E6]">{d.ma}</span> · {d.ten}
              <span className="mt-1 block text-slate-600">{d.ly}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ManTong({ chon }: { chon: Chon | null }) {
  return (
    <div className="space-y-4">
      <Tieu
        tieu="Tổng quan điều hành"
        phu={chon ? `Phải thu chốt ${ngay(chon.ky.meta.ngayChot)} · ${chon.ky.nhanDiem}. ${CHU_TEST}` : `Phải thu chưa nạp sổ. ${CHU_TEST}`}
      />
      {chon ? <Khoi so={soKhoi('tq-kpi', chon)} /> : <p className="rounded-xl bg-white p-4 text-sm text-slate-500">Phải thu: chưa nạp sổ.</p>}
      <div className="grid gap-4 xl:grid-cols-2">
        {chon ? <Khoi so={soKhoi('tq-tuoi', chon)} /> : null}
        <Khoi so={soBoTest('bt-ap-tuoi')!} />
        <Khoi so={soBoTest('bt-ap-kpi')!} />
        <Khoi so={soBoTest('bt-tien-kpi')!} />
        <Khoi so={soBoTest('bt-mua-kpi')!} />
        <Khoi so={soBoTest('bt-mua-nhom')!} />
      </div>
      <Khoi so={soBoTest('bt-tien-tuan')!} />
      {chon ? <Khoi so={soKhoi('tq-top', chon)} /> : null}
      <Khoi so={soBoTest('bt-ap-ncc')!} />
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
        className={`rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${keo ? 'border-[#0073E6] bg-blue-50' : 'border-slate-300 bg-white'}`}
      >
        <UploadCloud className={`mx-auto h-12 w-12 ${keo ? 'text-[#0073E6]' : 'text-slate-400'}`} />
        <p className="mt-3 text-base font-medium text-slate-800">Kéo thả file Excel vào đây</p>
        <p className="mt-1 text-sm text-slate-500">hoặc chọn từ máy</p>
        <label className="mt-4 inline-block cursor-pointer rounded-full bg-[#0073E6] px-5 py-2 text-sm font-medium text-white">
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
          <a className="text-[#0073E6] underline" href="/mau/Mau_Nap_CongNo.xlsx" download>
            Tải file mẫu
          </a>
          <button
            type="button"
            className="text-[#0073E6] underline"
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
        <section className="rounded-xl border border-slate-200 bg-white p-4">
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
          <button type="button" disabled={!tep || xem.chanLuu || xem.loiDoc.length > 0} className="mt-4 rounded-lg bg-[#0073E6] px-3 py-2 text-sm text-white disabled:opacity-40" onClick={() => tep && onKy(xem, tep)}>
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
