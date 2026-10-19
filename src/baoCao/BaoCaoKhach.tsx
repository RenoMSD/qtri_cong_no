import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { BUCKET_LABEL, diffDays, type Khach, type KyMeta } from '../lib/metrics';
import { ngay, pct, so1, thangNhan, ty } from '../format';
import { tenKhach, thangNhieu, type Tay } from '../soLieu';
import { ChuGiai, TieuMuc, tyTruc } from './khung';

// Mẫu «Hồ sơ tín dụng khách hàng», theo template_report/Dashboard_59 KH_v2.html

const MAU_HANG: Record<string, string> = { 'Tốt': '#1E8E5A', 'Trung bình': '#A67D0E', 'Xấu': '#C1580A', 'Rất xấu': '#A62B2B', 'Chưa chấm': '#2C5F8A' };

/** Đồng hồ nửa vòng: các dải màu theo tỷ lệ 0..1, kim chỉ giá trị. */
function DongHo({ tyLe, dai, chu, phu }: { tyLe: number | null; dai: { den: number; mau: string }[]; chu: string; phu?: string }) {
  const R = 80;
  const diem = (t: number) => {
    const a = Math.PI * (1 - t);
    return [110 + R * Math.cos(a), 110 - R * Math.sin(a)];
  };
  let tu = 0;
  const cung = dai.map((d) => {
    const [x1, y1] = diem(tu);
    const [x2, y2] = diem(d.den);
    tu = d.den;
    return <path key={d.den} d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`} stroke={d.mau} strokeWidth={18} fill="none" />;
  });
  const t = tyLe == null ? null : Math.max(0, Math.min(1, tyLe));
  const kim = t == null ? null : diem(t);
  return (
    <svg viewBox="0 0 220 140" width={220} height={140}>
      {cung}
      {kim ? <line x1={110} y1={110} x2={110 + (kim[0] - 110) * 0.8} y2={110 + (kim[1] - 110) * 0.8} stroke="#132437" strokeWidth={3} strokeLinecap="round" /> : null}
      <circle cx={110} cy={110} r={5} fill="#132437" />
      <text x={110} y={134} textAnchor="middle" fontSize={20} fontWeight={800} fill="#123E7A">{chu}</text>
      {phu ? <text x={110} y={92} textAnchor="middle" fontSize={10} fill="#8496A8">{phu}</text> : null}
    </svg>
  );
}

function mucMau(r: number) {
  return r >= 0.7 ? '#C23A3A' : r >= 0.4 ? '#B96E0C' : '#1E8E5A';
}

export function BaoCaoKhach({ kh, meta, tay }: { kh: Khach; meta: KyMeta; tay: Tay }) {
  const ten = tenKhach(kh, tay);
  const conDu = kh.chungTu.filter((c) => c.duCuoiKy > 0);
  const quaHan = conDu.filter((c) => c.soNgayQH > 0).sort((a, b) => b.soNgayQH - a.soNgayQH);
  const maxQH = quaHan.length ? quaHan[0].soNgayQH : 0;
  const tyLeQH = kh.duNo > 0 ? kh.quaHan / kh.duNo : 0;
  const suDung = kh.hmtd > 0 ? kh.duNo / kh.hmtd : null;
  const thang = thangNhieu([kh]);

  const tuoi = [
    { ten: 'Chưa đến hạn', mau: '#27AE60', v: kh.aging.chuaDenHan + kh.aging.denHan + kh.aging.traTruocHan },
    { ten: '0–30 ngày', mau: '#F1C40F', v: kh.aging.d0_30 },
    { ten: '31–60 ngày', mau: '#F5A623', v: kh.aging.d31_60 },
    { ten: '61–90 ngày', mau: '#E67E22', v: kh.aging.d61_90 },
    { ten: '> 90 ngày', mau: '#E74C3C', v: kh.aging.d91_120 + kh.aging.d121_150 + kh.aging.d151_180 + kh.aging.d181_365 + kh.aging.d365 },
  ].map((d) => ({ ...d, hien: ty(d.v) }));

  const lichSu = new Map<string, { so: number; phaiThu: number; daThu: number; conLai: number; ngay: number }>();
  for (const c of kh.chungTu) {
    if (!c.ngayCt || c.tienNo <= 0) continue;
    const k = c.ngayCt.slice(0, 7);
    const r = lichSu.get(k) ?? { so: 0, phaiThu: 0, daThu: 0, conLai: 0, ngay: 0 };
    r.so += 1;
    r.phaiThu += c.tienNo;
    r.conLai += c.duCuoiKy;
    r.daThu += c.tienNo - c.duCuoiKy;
    r.ngay += diffDays(c.duCuoiKy > 0 || !c.ngayTT ? meta.ngayChot : c.ngayTT, c.ngayCt);
    lichSu.set(k, r);
  }
  const dongLichSu = [...lichSu.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  const chiSo = [
    { l: '% Nợ quá hạn', v: pct(tyLeQH), r: tyLeQH },
    { l: 'DSO Gap', v: kh.dsoGap == null ? '—' : `${kh.dsoGap > 0 ? '+' : ''}${Math.round(kh.dsoGap)} ngày`, r: kh.dsoGap == null ? 0 : Math.min(1, Math.max(0, kh.dsoGap / 180)) },
    { l: '% Sử dụng hạn mức', v: suDung == null ? 'Chưa cấp HM' : pct(suDung), r: suDung == null ? 0 : Math.min(1, suDung) },
    { l: 'Max ngày quá hạn', v: `${maxQH} ngày`, r: Math.min(1, maxQH / 180) },
    { l: 'Điểm hợp tác', v: kh.diemHT == null ? '—' : `${kh.diemHT}/5`, r: kh.diemHT == null ? 0 : 1 - kh.diemHT / 5 },
  ];

  const viec: { muc: 'cao' | 'vua' | 'on'; tieu: string; y: string[] } =
    tyLeQH > 0.5 || (suDung ?? 0) > 1 || maxQH > 90
      ? {
          muc: 'cao',
          tieu: 'Khách hàng rủi ro cao',
          y: [
            (suDung ?? 0) > 1 ? `Dừng giao hàng mới — dư nợ đã vượt hạn mức ${pct((suDung ?? 0) - 1)}` : '',
            tyLeQH > 0.5 ? `Ưu tiên thu hồi — ${pct(tyLeQH)} dư nợ đang quá hạn` : '',
            maxQH > 90 ? `Có hóa đơn quá hạn tới ${maxQH} ngày — cần liên hệ gấp` : '',
            'Theo dõi đặc biệt, cập nhật tình trạng hàng tuần',
          ].filter(Boolean),
        }
      : tyLeQH > 0.2 || (suDung ?? 0) > 0.8
        ? {
            muc: 'vua',
            tieu: 'Cần theo dõi sát',
            y: [
              tyLeQH > 0.2 ? `Nhắc thanh toán các hóa đơn quá hạn (${ty(kh.quaHan)})` : '',
              (suDung ?? 0) > 0.8 ? `Hạn mức đã sử dụng ${pct(suDung)} — cân nhắc kiểm soát đơn hàng mới` : '',
              'Gọi điện xác nhận lịch thanh toán trong tuần',
            ].filter(Boolean),
          }
        : { muc: 'on', tieu: 'Tình trạng ổn định', y: ['Duy trì theo dõi định kỳ, chưa cần hành động đặc biệt'] };
  const mauViec = { cao: ['#FBE6E6', '#C23A3A'], vua: ['#FBF1D8', '#B8901A'], on: ['#E4F5EC', '#1E8E5A'] }[viec.muc];
  const nhatKy = tay.nhatKy[kh.maKH] ?? [];

  return (
    <div className="bc">
      <div className="bc-dau">
        <div className="bc-dau-trong">
          <div>
            <div className="bc-eyebrow">Hồ sơ tín dụng khách hàng</div>
            <h1>{ten}</h1>
            <div className="bc-phu">Mã {kh.maKH} · cập nhật đến {ngay(meta.ngayChot)}</div>
          </div>
          <div className="bc-ky"><i /><span>Xếp hạng:</span>{kh.hang}</div>
        </div>
      </div>
      <div className="bc-than">
        <div className="bc-hai" style={{ gridTemplateColumns: '0.9fr 2.2fr 0.9fr', marginTop: 20 }}>
          <div className="bc-the bc-the-id">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="bc-av">{kh.maKH.slice(0, 2).toUpperCase()}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{kh.maKH}</div>
                <span className="bc-hangpill" style={{ background: MAU_HANG[kh.hang], color: '#fff' }}>Xếp hạng: {kh.hang}</span>
              </div>
            </div>
            <div className="bc-dong-id">Nhân viên phụ trách: <b>{kh.sale}</b></div>
            <div className="bc-dong-id">Khu vực: <b>{kh.khuVuc || 'Không rõ'}</b></div>
            <div className="bc-dong-id">Email: <b>{kh.email || 'Không có'}</b></div>
            <div className="bc-dong-id">Số hóa đơn còn dư nợ: <b>{conDu.length}</b></div>
          </div>
          <div className="bc-the">
            <h3>1. Tổng quan tín dụng</h3>
            <div className="bc-o4" style={{ marginTop: 8 }}>
              <div className="bc-o"><div className="l">Dư nợ hiện tại</div><div className="v so">{ty(kh.duNo)}</div></div>
              <div className="bc-o"><div className="l">Nợ quá hạn</div><div className="v so" style={{ color: kh.quaHan > 0 ? 'var(--bc-bad)' : undefined }}>{ty(kh.quaHan)}</div></div>
              <div className="bc-o"><div className="l">Hạn mức tín dụng</div><div className="v so">{kh.hmtd > 0 ? ty(kh.hmtd) : 'Chưa cấp'}</div></div>
              <div className="bc-o"><div className="l">DSO</div><div className="v so">{kh.dso365 == null ? '—' : `${Math.round(kh.dso365)} ngày`}</div></div>
            </div>
            <div className="bc-o5">
              {chiSo.map((c) => (
                <div key={c.l} className="bc-o">
                  <div className="l">{c.l}</div>
                  <div className="v so" style={{ fontSize: 15, color: mucMau(c.r) }}>{c.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bc-the" style={{ textAlign: 'center' }}>
            <h3>2. Điểm tín dụng</h3>
            <DongHo
              tyLe={kh.diem == null ? null : (kh.diem - 1) / 4}
              dai={[{ den: 0.25, mau: '#E74C3C' }, { den: 0.5, mau: '#F5A623' }, { den: 0.75, mau: '#F1C40F' }, { den: 1, mau: '#27AE60' }]}
              chu={kh.diem == null ? 'N/A' : `${so1(kh.diem)}/5`}
            />
            <span className="bc-hangpill" style={{ background: MAU_HANG[kh.hang], color: '#fff' }}>{kh.hang.toUpperCase()}</span>
          </div>
        </div>

        <div className="bc-hai" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 16 }}>
          <div className="bc-the">
            <h3>3. Phát sinh công nợ và thanh toán theo tháng</h3>
            <div className="bc-cap">Đơn vị: tỷ đồng</div>
            <BarChart width={410} height={220} data={thang} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#E3E8EF" vertical={false} />
              <XAxis dataKey="thang" tickFormatter={thangNhan} tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={tyTruc} tick={{ fontSize: 10 }} width={40} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="phatSinh" name="Phát sinh" fill="#2C5F8A" isAnimationActive={false} />
              <Bar dataKey="thanhToan" name="Thanh toán" fill="#27AE60" isAnimationActive={false} />
            </BarChart>
          </div>
          <div className="bc-the">
            <h3>4. Nợ quá hạn theo tháng phát sinh</h3>
            <div className="bc-cap">Dư quá hạn hiện tại, gom theo tháng hóa đơn · tỷ đồng</div>
            <BarChart width={410} height={220} data={thang} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#E3E8EF" vertical={false} />
              <XAxis dataKey="thang" tickFormatter={thangNhan} tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={tyTruc} tick={{ fontSize: 10 }} width={40} />
              <Bar dataKey="quaHanTheoThang" name="Quá hạn" fill="#E74C3C" isAnimationActive={false} />
            </BarChart>
          </div>
          <div className="bc-the">
            <h3>5. Dư nợ và doanh thu lũy kế</h3>
            <div className="bc-cap">Đơn vị: tỷ đồng</div>
            <LineChart width={410} height={220} data={thang} margin={{ top: 8, right: 22, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#E3E8EF" vertical={false} />
              <XAxis dataKey="thang" tickFormatter={thangNhan} tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={tyTruc} tick={{ fontSize: 10 }} width={40} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line dataKey="doanhThuLuyKe" name="Doanh thu lũy kế" stroke="#27AE60" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line dataKey="duNoLuyKe" name="Dư nợ" stroke="#8E44AD" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </div>
        </div>

        <div className="bc-hai" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 16 }}>
          <div className="bc-the">
            <h3>6. Cơ cấu tuổi nợ</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <PieChart width={190} height={190}>
                <Pie data={tuoi.filter((d) => d.v > 0)} dataKey="v" nameKey="ten" outerRadius={88} isAnimationActive={false}>
                  {tuoi.filter((d) => d.v > 0).map((d) => <Cell key={d.ten} fill={d.mau} />)}
                </Pie>
              </PieChart>
              <div style={{ flex: 1 }}><ChuGiai ds={tuoi} tong={kh.duNo} /></div>
            </div>
          </div>
          <div className="bc-the">
            <h3>7. Hạn mức tín dụng</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <DongHo
                tyLe={suDung == null ? null : Math.min(1, suDung)}
                dai={[{ den: 0.6, mau: '#27AE60' }, { den: 0.85, mau: '#F5A623' }, { den: 1, mau: '#E74C3C' }]}
                chu={suDung == null ? 'Chưa cấp' : pct(suDung)}
                phu="đã sử dụng"
              />
              <div style={{ lineHeight: 2, fontSize: 13 }}>
                <div>Hạn mức được cấp: <b className="so">{kh.hmtd > 0 ? ty(kh.hmtd) : 'Chưa cấp'}</b></div>
                <div>Dư nợ hiện tại: <b className="so">{ty(kh.duNo)}</b></div>
                <div>Hạn mức còn lại: <b className="so" style={{ color: kh.hmtd > 0 && kh.duNo > kh.hmtd ? 'var(--bc-bad)' : undefined }}>{kh.hmtd > 0 ? ty(kh.hmtd - kh.duNo) : '—'}</b></div>
              </div>
            </div>
          </div>
        </div>

        <TieuMuc so={8} tieu="Công nợ theo hóa đơn quá hạn" tag={`${quaHan.length} hóa đơn quá hạn / ${conDu.length} hóa đơn còn dư nợ`} />
        <div className="bc-the bc-bang">
          <table>
            <thead><tr><th>STT</th><th>Số hóa đơn</th><th>Ngày hóa đơn</th><th className="so">Còn nợ (đồng)</th><th className="so">Số ngày quá hạn</th><th>Nhóm tuổi nợ</th></tr></thead>
            <tbody>
              {quaHan.length === 0 ? <tr className="bc-rong"><td colSpan={6}>Không có hóa đơn quá hạn</td></tr> : null}
              {quaHan.map((c, i) => (
                <tr key={`${c.soHD}-${c.soCt}-${i}`}>
                  <td>{i + 1}</td>
                  <td className="ten">{c.soHD || c.soCt || '—'}</td>
                  <td>{ngay(c.ngayCt)}</td>
                  <td className="so">{c.duCuoiKy.toLocaleString('vi-VN')}</td>
                  <td className="so" style={{ color: c.soNgayQH > 90 ? 'var(--bc-bad)' : undefined, fontWeight: 700 }}>{c.soNgayQH}</td>
                  <td>{BUCKET_LABEL[c.bucket]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TieuMuc so={9} tieu="Lịch sử thanh toán theo tháng phát sinh" />
        <div className="bc-the">
          <table>
            <thead><tr><th>Kỳ</th><th className="so">Số hóa đơn</th><th className="so">Phải thu</th><th className="so">Đã thu</th><th className="so">Còn lại</th><th className="so">Số ngày phải thu BQ</th><th className="so">Tỷ lệ thu nợ</th></tr></thead>
            <tbody>
              {dongLichSu.map(([k, r]) => (
                <tr key={k}>
                  <td>{thangNhan(k)}</td>
                  <td className="so">{r.so}</td>
                  <td className="so">{ty(r.phaiThu)}</td>
                  <td className="so">{ty(r.daThu)}</td>
                  <td className="so">{ty(r.conLai)}</td>
                  <td className="so">{Math.round(r.ngay / r.so)}</td>
                  <td className="so">{pct(r.phaiThu ? r.daThu / r.phaiThu : null)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bc-ghi">Số ngày phải thu của mỗi hóa đơn tính từ ngày hóa đơn đến ngày khách trả hết, hoặc đến ngày chốt {ngay(meta.ngayChot)} nếu còn dư nợ.</div>
        </div>

        <div className="bc-hai" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <TieuMuc so={10} tieu="Chấm điểm tín dụng" />
            <div className="bc-the">
              {kh.nguonDiem === 'excel' ? (
                <p className="bc-cap">Điểm {so1(kh.diem)} lấy trực tiếp từ sổ Excel, không có điểm thành phần.</p>
              ) : (
                <table>
                  <thead><tr><th>Mã</th><th>Tiêu chí</th><th className="so">Điểm (tối đa 5)</th></tr></thead>
                  <tbody>
                    {kh.thanhPhan.map((p) => (
                      <tr key={p.ma}><td>{p.ma}</td><td>{p.ten}</td><td className="so">{p.diem == null ? 'Thiếu dữ liệu' : p.diem}</td></tr>
                    ))}
                    <tr className="bc-dam"><td /><td>Điểm bình quân</td><td className="so">{kh.diem == null ? '—' : so1(kh.diem)}</td></tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div>
            <TieuMuc so={11} tieu="Đánh giá / nhận xét tổng quan" />
            <div className="bc-the">
              <div className="bc-hop" style={{ background: mauViec[0], color: mauViec[1] }}>
                <div className="t">{viec.tieu.toUpperCase()}</div>
                <ul>{viec.y.map((y) => <li key={y}>{y}</li>)}</ul>
              </div>
              {tay.ghi[kh.maKH] ? <div className="bc-van" style={{ minHeight: 0 }}><b>Ghi chú:</b> {tay.ghi[kh.maKH]}</div> : null}
              {tay.keHoach[kh.maKH] ? <div className="bc-van" style={{ minHeight: 0 }}><b>Kế hoạch tuần sau:</b> {tay.keHoach[kh.maKH]}</div> : null}
            </div>
          </div>
        </div>

        <TieuMuc so={12} tieu="Nhật ký thu hồi nợ" />
        <div className="bc-the">
          {(nhatKy.length ? nhatKy : ['', '']).map((n, i) => (
            <div key={i} className="bc-dong-de-xuat"><b>{i + 1}</b><p>{n}</p></div>
          ))}
        </div>

        <div className="bc-chan">Hồ sơ tín dụng {kh.maKH} · dữ liệu đến từng hóa đơn ({kh.chungTu.length} chứng từ) · chốt {ngay(meta.ngayChot)}.</div>
      </div>
    </div>
  );
}
