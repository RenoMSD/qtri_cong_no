import { useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import type { KetQua } from './lib/metrics';
import { parseArrayBuffer } from './lib/parseWorkbook';
import { ngay, soLinh, ty } from './format';
import { LocBar } from './khung';
import { Khoi } from './khoi';
import { soKhoi, tenKhach, type Chon, type Loc, type Tay } from './soLieu';

function Tieu({ tieu, phu }: { tieu: string; phu?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[16px] font-semibold text-foreground">{tieu}</h2>
      {phu ? <p className="mt-1 text-[12px] text-muted">{phu}</p> : null}
    </div>
  );
}

export function ManAr({
  tab,
  chonKy,
  chonLoc,
  loc,
  setLoc,
  sales,
  suaTay,
}: {
  tab: 'tuan' | 'tc1' | 'tc2';
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
        <p className="text-[12px] text-muted">{tab === 'tuan' ? `Tuần ${tuan}` : `Chốt ${ngay(ky.meta.ngayChot)} · ${ky.nhanDiem}`}</p>
        <LocBar sales={sales} loc={loc} setLoc={setLoc} />
      </div>
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
          <p className="text-sm text-muted">Các thẻ lấy từ chỉ tiêu kỳ. Không có điểm công ty dạng x/5.</p>
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
      <section className="rounded-xl border border-line bg-white shadow-card p-4">
        <h3 className="text-sm font-semibold">Thêm tay</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <input className="rounded-lg border border-line px-2 py-1.5 text-sm" placeholder="Mã" value={maMoi} onChange={(e) => setMaMoi(e.target.value)} />
          <input className="rounded-lg border border-line px-2 py-1.5 text-sm" placeholder="Tên" value={tenMoi} onChange={(e) => setTenMoi(e.target.value)} />
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white"
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
        <ul className="mt-3 text-sm text-subtle">
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
  const [dangXuat, setDangXuat] = useState<'doichieu' | 'nhacno' | null>(null);
  const [loiXuat, setLoiXuat] = useState('');
  if (!ma) return <p className="text-sm text-muted">Chọn một khách từ danh sách.</p>;
  const tay = chon.tay;
  const kh = ma;

  async function xuatVanBan(loai: 'doichieu' | 'nhacno') {
    setDangXuat(loai);
    setLoiXuat('');
    try {
      // Nạp pdf-lib khi bấm xuất, không tải sẵn cùng trang
      const vb = await import('./pdfThu');
      const xuat = loai === 'doichieu' ? vb.xuatBienBanDoiChieu : vb.xuatThuNhacNo;
      const { bytes, tenFile } = await xuat(kh, tenKhach(kh, tay), chon.ky.meta);
      vb.taiXuong(bytes, tenFile);
    } catch (e) {
      setLoiXuat(e instanceof Error ? e.message : 'Không xuất được PDF.');
    } finally {
      setDangXuat(null);
    }
  }

  return (
    <div className="space-y-4">
      <Tieu tieu={`${ma.maKH} · ${tenKhach(ma, tay)}`} phu={chon.ky.nhanDiem} />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={dangXuat !== null}
          className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 text-[12px] text-white hover:bg-primary-dark disabled:opacity-40"
          onClick={() => xuatVanBan('doichieu')}
        >
          <FileText className="size-3.5" />
          {dangXuat === 'doichieu' ? 'Đang xuất…' : 'Biên bản đối chiếu công nợ'}
        </button>
        <button
          type="button"
          disabled={dangXuat !== null || ma.quaHan <= 0}
          title={ma.quaHan <= 0 ? 'Khách không có khoản quá hạn' : undefined}
          className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-primary px-3 text-[12px] text-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => xuatVanBan('nhacno')}
        >
          <FileText className="size-3.5" />
          {dangXuat === 'nhacno' ? 'Đang xuất…' : 'Thư nhắc thanh toán'}
        </button>
        {loiXuat ? <span className="text-[12px] text-risk-bad">{loiXuat}</span> : null}
      </div>
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
      <section className="rounded-xl border border-line bg-white shadow-card p-4">
        <h3 className="text-sm font-semibold">Nhật ký thu hồi</h3>
        <div className="mt-2 flex gap-2">
          <input className="flex-1 rounded-lg border border-line px-2 py-1.5 text-sm" value={dong} placeholder="Nội dung lần liên hệ" onChange={(e) => setDong(e.target.value)} />
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white"
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
      <section className="grid gap-3 rounded-xl border border-line bg-white shadow-card p-4 md:grid-cols-2">
        <label className="text-sm">
          Tên ghi tay
          <input className="mt-1 w-full rounded-lg border border-line px-2 py-1.5" value={tay.ten[ma.maKH] ?? ''} placeholder={ma.tenKH || 'Chưa có tên trong sổ'} onChange={(e) => suaTay({ ...tay, ten: { ...tay.ten, [ma.maKH]: e.target.value } })} />
        </label>
        <label className="text-sm">
          Kế hoạch tuần sau
          <input className="mt-1 w-full rounded-lg border border-line px-2 py-1.5" value={tay.keHoach[ma.maKH] ?? ''} onChange={(e) => suaTay({ ...tay, keHoach: { ...tay.keHoach, [ma.maKH]: e.target.value } })} />
        </label>
        <label className="text-sm md:col-span-2">
          Ghi chú
          <textarea className="mt-1 min-h-16 w-full rounded-lg border border-line px-2 py-1.5" value={tay.ghi[ma.maKH] ?? ''} onChange={(e) => suaTay({ ...tay, ghi: { ...tay.ghi, [ma.maKH]: e.target.value } })} />
        </label>
      </section>
    </div>
  );
}


export function ManKeHoach({ chon, suaTay }: { chon: Chon; suaTay: (t: Tay) => void }) {
  return (
    <div className="space-y-4">
      <Tieu tieu="Kế hoạch tuần và dự báo thu" phu="Cột doanh thu dự kiến để trống vì sổ không có công thức đó. Kế hoạch là chữ tự nhập." />
      <div className="overflow-auto rounded-xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-background text-xs text-muted">
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
              <tr key={k.maKH} className="border-t border-line-soft">
                <td className="px-3 py-2">{k.maKH}</td>
                <td className="px-3 py-2">{tenKhach(k, chon.tay)}</td>
                <td className="so px-3 py-2">{ty(k.duNo)}</td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-line px-2 py-1"
                    value={chon.tay.keHoach[k.maKH] ?? ''}
                    onChange={(e) => suaTay({ ...chon.tay, keHoach: { ...chon.tay.keHoach, [k.maKH]: e.target.value } })}
                  />
                </td>
                <td className="px-3 py-2 text-muted">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    <div className="animate-fade-up max-w-[1100px] space-y-4">
      <p className="text-[12.5px] text-muted">Sổ mới thay sổ hiện tại · chỉ dùng được khi đối chiếu khớp</p>
      <ol aria-label="Các bước nạp" className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {['Chọn file', 'Đọc sổ', 'Đối chiếu', 'Dùng kỳ này'].map((t, i) => {
          const hienTai = !xem ? 0 : xem.loiDoc.length > 0 ? 1 : 2;
          const cls = i < hienTai ? 'bg-primary text-white' : i === hienTai ? 'border-2 border-primary bg-primary-soft text-primary' : 'border border-line bg-card text-muted';
          return (
            <li key={t} className={`rounded-xl px-3 py-2.5 text-[12.5px] ${cls}`}>
              <b>{i + 1}</b> · {t}
            </li>
          );
        })}
      </ol>
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
        className={`rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${keo ? 'border-primary bg-primary-soft' : 'border-line bg-white'}`}
      >
        <UploadCloud className={`mx-auto h-12 w-12 ${keo ? 'text-primary' : 'text-muted'}`} />
        <p className="mt-3 text-base text-foreground">Kéo thả file Excel vào đây</p>
        <p className="mt-1 text-sm text-muted">hoặc chọn từ máy</p>
        <label className="mt-4 inline-block cursor-pointer rounded-full bg-primary px-5 py-2 text-sm text-white">
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
          <a className="text-primary underline" href="/mau/Mau_Nap_CongNo.xlsx" download>
            Tải file mẫu
          </a>
          <button
            type="button"
            className="text-primary underline"
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
      {dang ? <p className="text-sm text-muted">Đang đọc…</p> : null}
      {loi ? <p className="text-sm text-risk-bad">{loi}</p> : null}
      {xem ? (
        <section className="rounded-xl border border-line bg-white shadow-card p-4">
          <p className="text-sm">
            {xem.tenFile} · chốt {ngay(xem.meta.ngayChot)} · dư nợ {ty(xem.tong.duNo)} · {xem.nhanDiem}
          </p>
          {xem.loiDoc.length > 0 ? (
            <div className="mt-3 rounded-lg border border-risk-bad-soft bg-risk-bad-soft p-3 text-sm text-risk-bad">
              <p className="font-semibold">File chưa đúng cấu trúc sổ công nợ, chưa thể dùng.</p>
              <p className="mt-1">{xem.loiDoc.join(' ')}</p>
              <p className="mt-1 text-risk-bad">Bấm «Tải file mẫu» để xem tên sheet và cột cần có.</p>
            </div>
          ) : (
            <>
              {xem.canhBao.length > 0 ? <p className="mt-2 text-sm text-risk-watch">{xem.canhBao.join(' ')}</p> : null}
              <p className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs ${xem.kiemTra.every((r) => r.dat) ? 'bg-risk-safe-soft text-risk-safe' : 'bg-risk-bad-soft text-risk-bad'}`}>
                Khớp {xem.kiemTra.filter((r) => r.dat).length}/{xem.kiemTra.length} phép đối chiếu
              </p>
              <div className="mt-3 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-muted">
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
                      <tr key={r.ten} className="border-t border-line-soft">
                        <td className="py-1 pr-2">{r.ten}</td>
                        <td className="so">{soLinh(r.app)}</td>
                        <td className="so">{soLinh(r.excel)}</td>
                        <td className="so">{soLinh(r.lech)}</td>
                        <td className={r.dat ? 'text-risk-safe' : 'text-risk-bad'}>{r.dat ? 'Khớp' : 'Lệch'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" disabled={!tep || xem.chanLuu} className="mt-4 rounded-lg bg-primary px-3 py-2 text-sm text-white disabled:opacity-40" onClick={() => tep && onKy(xem, tep)}>
                Dùng kỳ này
              </button>
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}

