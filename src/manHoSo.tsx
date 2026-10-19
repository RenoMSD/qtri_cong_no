import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BUCKET_LABEL } from './lib/metrics';
import { ngay, pct, so1, thangNhan, ty } from './format';
import { tenKhach, thangNhieu, type Chon, type Tay } from './soLieu';
import { truc } from './khoi';
import { ChuGiaiCham, DongHo, NhanHang, The } from './giaoDien';
import { DAY_MAU, MAU } from './mauSac';

// Hồ sơ khách hàng theo wireframe: thẻ định danh, 4 ô chỉ số, biểu đồ tháng, hóa đơn quá hạn; cột phải: điểm, đề xuất, nhật ký, ghi chú

export function ManHoSoKhach({ chon, suaTay, veDanhSach }: { chon: Chon; suaTay: (t: Tay) => void; veDanhSach: () => void }) {
  const [dong, setDong] = useState('');
  const [dangXuat, setDangXuat] = useState<'doichieu' | 'nhacno' | null>(null);
  const [loiXuat, setLoiXuat] = useState('');
  const kh = chon.ma;
  if (!kh) return <p className="text-sm text-muted">Chọn một khách từ danh sách.</p>;
  const tay = chon.tay;
  const ten = tenKhach(kh, tay);
  const conDu = kh.chungTu.filter((c) => c.duCuoiKy > 0);
  const quaHan = conDu.filter((c) => c.soNgayQH > 0).sort((a, b) => b.soNgayQH - a.soNgayQH);
  const maxQH = quaHan[0]?.soNgayQH ?? 0;
  const tyLeQH = kh.duNo > 0 ? kh.quaHan / kh.duNo : 0;
  const dung = kh.hmtd > 0 ? kh.duNo / kh.hmtd : null;
  const thang = thangNhieu([kh]);
  const nhatKy = tay.nhatKy[kh.maKH] ?? [];
  const deXuat =
    tyLeQH > 0.5 || (dung ?? 0) > 1 || maxQH > 90
      ? { sac: 'bg-risk-bad-soft text-risk-bad', tieu: 'Rủi ro cao', y: [(dung ?? 0) > 1 ? `Dừng giao hàng mới: vượt hạn mức ${pct((dung ?? 0) - 1)}` : '', tyLeQH > 0.5 ? `Ưu tiên thu hồi: ${pct(tyLeQH)} dư nợ đang quá hạn` : '', maxQH > 90 ? `Hóa đơn quá hạn tới ${maxQH} ngày: liên hệ gấp` : '', 'Theo dõi hằng tuần'].filter(Boolean) }
      : tyLeQH > 0.2 || (dung ?? 0) > 0.8
        ? { sac: 'bg-risk-watch-soft text-risk-watch', tieu: 'Cần theo dõi sát', y: [tyLeQH > 0.2 ? `Nhắc thanh toán ${ty(kh.quaHan)} quá hạn` : '', (dung ?? 0) > 0.8 ? `Đã dùng ${pct(dung)} hạn mức` : '', 'Xác nhận lịch thanh toán trong tuần'].filter(Boolean) }
        : { sac: 'bg-risk-safe-soft text-risk-safe', tieu: 'Ổn định', y: ['Theo dõi định kỳ'] };

  async function xuat(loai: 'doichieu' | 'nhacno') {
    setDangXuat(loai);
    setLoiXuat('');
    try {
      // Nạp pdf-lib khi bấm xuất, không tải sẵn cùng trang
      const vb = await import('./pdfThu');
      const f = loai === 'doichieu' ? vb.xuatBienBanDoiChieu : vb.xuatThuNhacNo;
      const { bytes, tenFile } = await f(kh!, ten, chon.ky.meta);
      vb.taiXuong(bytes, tenFile);
    } catch (e) {
      setLoiXuat(e instanceof Error ? e.message : 'Không xuất được PDF.');
    } finally {
      setDangXuat(null);
    }
  }

  const o = 'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-[13px]';
  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={veDanhSach} className="cursor-pointer text-[13px] text-primary hover:underline">← Danh sách khách hàng</button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {loiXuat ? <span className="text-[12px] text-risk-bad">{loiXuat}</span> : null}
          <button type="button" disabled={dangXuat !== null || kh.quaHan <= 0} title={kh.quaHan <= 0 ? 'Khách không có khoản quá hạn' : undefined} onClick={() => xuat('nhacno')} className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-primary bg-card px-4 text-[13px] text-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-40">
            <FileText className="size-4" />{dangXuat === 'nhacno' ? 'Đang xuất…' : 'Thư nhắc thanh toán'}
          </button>
          <button type="button" disabled={dangXuat !== null} onClick={() => xuat('doichieu')} className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-medium text-white hover:bg-primary-dark disabled:opacity-40">
            <FileText className="size-4" />{dangXuat === 'doichieu' ? 'Đang xuất…' : 'Biên bản đối chiếu'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <section className="flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-card p-5 shadow-card">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-[20px] font-semibold text-primary">{kh.maKH.slice(0, 2)}</div>
            <div className="min-w-[220px] flex-1">
              <h2 className="text-[22px] font-semibold">{kh.maKH}{ten !== kh.maKH ? ` · ${ten}` : ''}</h2>
              <p className="mt-1 text-[12.5px] text-muted">Sale {kh.sale} · Khu vực {kh.khuVuc || 'chưa khai'} · {conDu.length} hóa đơn còn dư nợ{kh.email ? ` · ${kh.email}` : ''}</p>
            </div>
            <NhanHang hang={kh.hang} diem={kh.diem} />
          </section>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-line bg-card p-4 shadow-card"><div className="text-[12px] text-muted">Dư nợ hiện tại</div><div className="so mt-1.5 text-[22px] font-semibold">{ty(kh.duNo)}</div></div>
            <div className="rounded-2xl bg-risk-bad-soft p-4"><div className="text-[12px] text-risk-bad">Nợ quá hạn</div><div className="so mt-1.5 text-[22px] font-semibold text-risk-bad">{ty(kh.quaHan)}</div><div className="text-[11.5px] text-risk-bad">{pct(tyLeQH)} dư nợ</div></div>
            <div className="rounded-2xl border border-line bg-card p-4 shadow-card"><div className="text-[12px] text-muted">Hạn mức</div><div className="so mt-1.5 text-[22px] font-semibold">{kh.hmtd > 0 ? ty(kh.hmtd) : 'Chưa cấp'}</div>{dung != null ? <div className="mt-2 h-1.5 rounded-full bg-line-soft"><div className="h-full rounded-full" style={{ width: `${Math.min(100, dung * 100)}%`, background: dung > 1 ? MAU.bad : MAU.primary }} /></div> : null}</div>
            <div className="rounded-2xl border border-line bg-card p-4 shadow-card"><div className="text-[12px] text-muted">DSO · gap</div><div className="so mt-1.5 text-[22px] font-semibold">{kh.dso365 == null ? '—' : `${Math.round(kh.dso365)} ngày`}</div>{kh.dsoGap != null ? <div className={`text-[11.5px] ${kh.dsoGap > 0 ? 'text-risk-bad' : 'text-risk-safe'}`}>{kh.dsoGap > 0 ? '+' : ''}{Math.round(kh.dsoGap)} ngày so với hạn</div> : null}</div>
          </section>

          <The tieu="Phát sinh và thanh toán theo tháng" phai={<ChuGiaiCham ds={[{ ten: 'Phát sinh', mau: DAY_MAU[0] }, { ten: 'Thanh toán', mau: DAY_MAU[1] }, { ten: 'Quá hạn theo tháng HĐ', mau: MAU.bad }]} />}>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={thang} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={3}>
                  <CartesianGrid stroke={MAU.line} vertical={false} strokeDasharray="4 4" />
                  <XAxis dataKey="thang" tickFormatter={thangNhan} tick={{ fontSize: 11, fill: MAU.muted }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={truc} tick={{ fontSize: 11, fill: MAU.muted }} width={40} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: unknown) => ty(Number(v))} labelFormatter={(l: unknown) => thangNhan(String(l))} />
                  <Bar dataKey="phatSinh" name="Phát sinh" fill={DAY_MAU[0]} barSize={14} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="thanhToan" name="Thanh toán" fill={DAY_MAU[1]} barSize={14} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Line dataKey="quaHanTheoThang" name="Quá hạn" stroke={MAU.bad} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: MAU.bad, strokeWidth: 0 }} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </The>

          <The tieu="Hóa đơn quá hạn" phai={<span className="text-[12px] text-muted">{quaHan.length} / {conDu.length} hóa đơn còn dư nợ</span>}>
            <div className="max-h-[360px] overflow-auto">
              <table className="w-full min-w-[540px] text-[12.5px]">
                <thead className="sticky top-0">
                  <tr className="bg-background text-left text-subtle"><th className="p-2.5 font-medium">Số hóa đơn</th><th className="p-2.5 font-medium">Ngày</th><th className="p-2.5 text-right font-medium">Còn nợ</th><th className="p-2.5 text-right font-medium">Ngày QH</th><th className="p-2.5 font-medium">Nhóm</th></tr>
                </thead>
                <tbody>
                  {quaHan.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-muted">Không có hóa đơn quá hạn</td></tr> : null}
                  {quaHan.map((c, i) => (
                    <tr key={`${c.soHD}-${c.soCt}-${i}`} className="border-b border-line-soft">
                      <td className="p-2.5">{c.soHD || c.soCt || '—'}</td>
                      <td className="p-2.5">{ngay(c.ngayCt)}</td>
                      <td className="so p-2.5 text-right">{c.duCuoiKy.toLocaleString('vi-VN')}</td>
                      <td className={`so p-2.5 text-right font-semibold ${c.soNgayQH > 90 ? 'text-risk-bad' : 'text-risk-watch'}`}>{c.soNgayQH}</td>
                      <td className="p-2.5"><span className={`rounded-full px-2 py-0.5 text-[11px] ${c.soNgayQH > 180 ? 'bg-risk-bad-soft text-risk-bad' : c.soNgayQH > 90 ? 'bg-risk-overdue-soft text-risk-overdue' : 'bg-risk-watch-soft text-risk-watch'}`}>{BUCKET_LABEL[c.bucket]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </The>
        </div>

        <aside className="space-y-4">
          <section className="flex flex-col items-center gap-1 rounded-2xl bg-sidebar p-5 text-white shadow-elegant">
            <h3 className="self-start text-[15px] font-semibold">Điểm tín dụng</h3>
            <DongHo rong={190} tyLe={kh.diem == null ? null : (kh.diem - 1) / 4} dai={[{ den: 0.25, mau: MAU.bad }, { den: 0.5, mau: DAY_MAU[2] }, { den: 0.75, mau: DAY_MAU[0] }, { den: 1, mau: MAU.safe }]} />
            <div className="so text-[26px] font-semibold">{kh.diem == null ? 'N/A' : `${so1(kh.diem)} / 5`}</div>
            <div className="text-[12px] text-sidebar-fg">{kh.nguonDiem === 'excel' ? 'Điểm lấy từ sổ Excel' : `${kh.thanhPhan.filter((p) => p.diem != null).length} tiêu chí TC-1 có dữ liệu`}</div>
            {kh.thanhPhan.length ? (
              <ul className="mt-2 w-full space-y-1 text-[11.5px] text-sidebar-fg">
                {kh.thanhPhan.map((p) => (
                  <li key={p.ma} className="flex justify-between gap-2"><span className="truncate">{p.ten}</span><b className="text-white">{p.diem ?? '—'}</b></li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className={`rounded-2xl p-4 ${deXuat.sac}`}>
            <h3 className="mb-2 text-[14px] font-semibold">Đề xuất xử lý · {deXuat.tieu}</h3>
            <ul className="list-disc space-y-1 pl-5 text-[12.5px]">{deXuat.y.map((y) => <li key={y}>{y}</li>)}</ul>
          </section>

          <The tieu="Nhật ký thu hồi">
            <ol className="space-y-3 text-[12.5px]">
              {nhatKy.length === 0 ? <li className="text-muted">Chưa có lần liên hệ nào.</li> : null}
              {nhatKy.map((n, i) => (
                <li key={i} className="flex gap-2.5"><span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: DAY_MAU[i % DAY_MAU.length] }} /><span>{n}</span></li>
              ))}
            </ol>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const van = dong.trim();
                if (!van) return;
                suaTay({ ...tay, nhatKy: { ...tay.nhatKy, [kh.maKH]: [...nhatKy, van] } });
                setDong('');
              }}
            >
              <label className="sr-only" htmlFor="nhat-ky">Nội dung lần liên hệ</label>
              <input id="nhat-ky" className="h-10 min-w-0 flex-1 rounded-lg border border-line px-3 text-[13px]" value={dong} placeholder="Nội dung lần liên hệ" onChange={(e) => setDong(e.target.value)} />
              <button type="submit" className="h-10 cursor-pointer rounded-lg bg-primary px-3 text-[13px] text-white">Ghi</button>
            </form>
          </The>

          <The tieu="Ghi chú nội bộ">
            <label className="block text-[12px] text-subtle">Tên ghi tay<input className={o} value={tay.ten[kh.maKH] ?? ''} placeholder={kh.tenKH || 'Chưa có tên trong sổ'} onChange={(e) => suaTay({ ...tay, ten: { ...tay.ten, [kh.maKH]: e.target.value } })} /></label>
            <label className="mt-3 block text-[12px] text-subtle">Kế hoạch tuần sau<input className={o} value={tay.keHoach[kh.maKH] ?? ''} onChange={(e) => suaTay({ ...tay, keHoach: { ...tay.keHoach, [kh.maKH]: e.target.value } })} /></label>
            <label className="mt-3 block text-[12px] text-subtle">Ghi chú<textarea className={`${o} min-h-20`} value={tay.ghi[kh.maKH] ?? ''} onChange={(e) => suaTay({ ...tay, ghi: { ...tay.ghi, [kh.maKH]: e.target.value } })} /></label>
          </The>
        </aside>
      </div>
    </div>
  );
}
