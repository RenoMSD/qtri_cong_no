import { Cell, Pie, PieChart } from 'recharts';
import { pareto80, type Khach, type KyMeta } from '../lib/metrics';
import { ngay, pct, ty } from '../format';
import type { Tay } from '../soLieu';
import { ChuGiai, DauTrang, TieuMuc } from './khung';
import { canhBaoKhach, soTuan, soTuanKhach, type MucCanhBao } from './soTuan';

// Mẫu «Dashboard theo dõi & quản lý công nợ tuần», theo template_report/Dashboard_Cong_No_Tuan_*.html

const MAU_CB: Record<MucCanhBao, [string, string]> = {
  'Cần xử lý gấp': ['#FBE6E6', '#C23A3A'],
  'Theo dõi sát': ['#FBF1D8', '#B8901A'],
  'Ổn định': ['#E4F5EC', '#1E8E5A'],
};

function NhanCB({ m }: { m: MucCanhBao }) {
  return <span className="bc-nhan-cb" style={{ background: MAU_CB[m][0], color: MAU_CB[m][1] }}>{m}</span>;
}

function Lech({ v, tangLaXau = true }: { v: number; tangLaXau?: boolean }) {
  if (Math.abs(v) < 5_000_000) return <span>không đổi</span>;
  const xau = tangLaXau ? v > 0 : v < 0;
  return <span className={xau ? 'bc-tang' : 'bc-giam'}>{v > 0 ? '+' : '−'}{ty(Math.abs(v))}</span>;
}

function tyLe(th: number, kh: number | null) {
  if (kh == null || kh === 0) return null;
  return th / kh;
}

export function BaoCaoTuan({ list, meta, tay, nhanLoc }: { list: Khach[]; meta: KyMeta; tay: Tay; nhanLoc: string }) {
  const s = soTuan(list, meta);
  const { dau, cuoi } = s;
  const khDT = meta.keHoachDoanhThuTuan;
  const khThu = meta.keHoachThuTuan;
  const coKH = khDT != null || khThu != null;
  const nhanTuan = `${meta.tuanNhan} (${ngay(meta.tuanTu).slice(0, 5)} – ${ngay(meta.tuanDen)})`;
  const hang = (['Tốt', 'Trung bình', 'Xấu', 'Rất xấu'] as const).map((h) => ({ h, so: list.filter((k) => k.hang === h).length }));
  const xauRatXau = hang[2].so + hang[3].so;
  const chuaGan = list.filter((k) => k.sale === 'Chưa gán').length;

  const coCau = [
    { ten: 'Trong hạn', mau: '#27AE60', v: cuoi.trongHan },
    { ten: 'Quá hạn 1–30 ngày', mau: '#F1C40F', v: cuoi.qh1_30 },
    { ten: 'Quá hạn 31–60 ngày', mau: '#F5A623', v: cuoi.qh31_60 },
    { ten: 'Quá hạn 61–90 ngày', mau: '#E67E22', v: cuoi.qh61_90 },
    { ten: 'Quá hạn >90 ngày', mau: '#E74C3C', v: cuoi.qhTren90 },
  ].map((d) => ({ ...d, hien: ty(d.v) }));

  const dong = list
    .filter((k) => k.duNo !== 0)
    .map((k) => ({ k, t: soTuanKhach(k, meta) }))
    .map((r) => ({ ...r, cb: canhBaoKhach(r.k, r.t.maxQH) }));
  const theoSale = new Map<string, { sale: string; soKH: number; duNo: number; quaHan: number; thu: number; gap: number }>();
  for (const r of dong) {
    const x = theoSale.get(r.k.sale) ?? { sale: r.k.sale, soKH: 0, duNo: 0, quaHan: 0, thu: 0, gap: 0 };
    x.soKH += 1;
    x.duNo += r.k.duNo;
    x.quaHan += r.k.quaHan;
    x.thu += r.t.thucThu;
    if (r.cb === 'Cần xử lý gấp') x.gap += 1;
    theoSale.set(r.k.sale, x);
  }
  const sales = [...theoSale.values()].sort((a, b) => b.duNo - a.duNo);
  const dongIV = [...dong].sort((a, b) => a.k.sale.localeCompare(b.k.sale) || b.k.duNo - a.k.duNo);
  const maTrongDiem = new Set(pareto80(list).map((k) => k.maKH));
  const dongV = dong.filter((r) => maTrongDiem.has(r.k.maKH)).sort((a, b) => b.k.duNo - a.k.duNo);
  const coHangDat = dongV.some((r) => r.k.hangDat !== 0 || r.k.tienCoc !== 0);

  const tyLeTre = s.thanhToan > 0 ? s.ttTreHan / s.thanhToan : 0;
  const tomTat: string[] = [
    khDT ? `Doanh thu tuần đạt ${pct(s.phatSinh / khDT)} kế hoạch (${ty(s.phatSinh)} / ${ty(khDT)}).` : `Doanh thu (phát sinh nợ) trong tuần: ${ty(s.phatSinh)}.`,
    `${khThu ? `Thanh toán đạt ${pct(s.thanhToan / khThu)} kế hoạch (${ty(s.thanhToan)} / ${ty(khThu)})` : `Thu về ${ty(s.thanhToan)}`}, trong đó ${pct(tyLeTre)} là thanh toán trễ hạn.`,
    `Tổng dư nợ ${cuoi.du >= dau.du ? 'tăng' : 'giảm'} ${ty(Math.abs(cuoi.du - dau.du))} so với đầu tuần; nợ quá hạn ${cuoi.quaHan >= dau.quaHan ? 'tăng' : 'giảm'} ${ty(Math.abs(cuoi.quaHan - dau.quaHan))}.`,
    `${xauRatXau}/${list.length} khách hàng (${pct(list.length ? xauRatXau / list.length : 0)}) đang ở nhóm Xấu hoặc Rất xấu.`,
    ...(chuaGan > 0 ? [`${chuaGan} khách hàng chưa được gán Sale phụ trách — rủi ro bỏ sót khi theo dõi.`] : []),
    `Nợ xấu (>365 ngày): ${ty(cuoi.noXau)}${Math.abs(cuoi.noXau - dau.noXau) < 5_000_000 ? ', không đổi trong tuần' : ''}.`,
  ];

  return (
    <div className="bc">
      <DauTrang
        nhan="Báo cáo công nợ tuần"
        tieu="Dashboard theo dõi & quản lý công nợ tuần"
        phu={`Đơn vị: tỷ đồng · ${nhanLoc}`}
        ky={`Tuần ${nhanTuan}`}
      />
      <div className="bc-than">
        <div className="bc-kpi6" style={{ marginTop: 20 }}>
          <div className="bc-the">
            <div className="bc-nhan">Doanh thu trong tuần</div>
            <div className="bc-lon so">{ty(s.phatSinh)}</div>
            <div className="bc-so-sanh">{khDT ? <>KH {ty(khDT)} · TH/KH <b>{pct(s.phatSinh / khDT)}</b></> : 'Phát sinh nợ mới trong tuần'}</div>
          </div>
          <div className="bc-the">
            <div className="bc-nhan">Thanh toán trong tuần</div>
            <div className="bc-lon so" style={{ color: 'var(--bc-good)' }}>{ty(s.thanhToan)}</div>
            <div className="bc-so-sanh">{khThu ? <>KH {ty(khThu)} · TH/KH <b>{pct(s.thanhToan / khThu)}</b></> : `Trễ hạn ${pct(tyLeTre)}`}</div>
          </div>
          <div className="bc-the">
            <div className="bc-nhan">Tổng dư nợ cuối tuần</div>
            <div className="bc-lon so">{ty(cuoi.du)}</div>
            <div className="bc-so-sanh"><Lech v={cuoi.du - dau.du} /> so với đầu tuần</div>
          </div>
          <div className="bc-the">
            <div className="bc-nhan">Nợ trong hạn</div>
            <div className="bc-lon so">{ty(cuoi.trongHan)}</div>
            <div className="bc-so-sanh"><Lech v={cuoi.trongHan - dau.trongHan} tangLaXau={false} /> so với đầu tuần</div>
          </div>
          <div className="bc-the" style={{ borderTopColor: 'var(--bc-bad)' }}>
            <div className="bc-nhan">Nợ quá hạn</div>
            <div className="bc-lon so" style={{ color: 'var(--bc-bad)' }}>{ty(cuoi.quaHan)}</div>
            <div className="bc-so-sanh"><Lech v={cuoi.quaHan - dau.quaHan} /> · {pct(cuoi.du ? cuoi.quaHan / cuoi.du : 0)} dư nợ</div>
          </div>
          <div className="bc-the" style={{ borderTopColor: '#7A1212' }}>
            <div className="bc-nhan">Nợ xấu (&gt;365 ngày)</div>
            <div className="bc-lon so" style={{ color: '#7A1212' }}>{ty(cuoi.noXau)}</div>
            <div className="bc-so-sanh"><Lech v={cuoi.noXau - dau.noXau} /> · {pct(cuoi.du ? cuoi.noXau / cuoi.du : 0)} dư nợ</div>
          </div>
        </div>

        <div className="bc-canh-bao">
          <div style={{ background: '#fff', border: '1px solid var(--bc-line)', textAlign: 'left' }}>
            <div className="bc-nhan">Cảnh báo xếp hạng công nợ</div>
            <div className="bc-ghi">{list.length} khách hàng đang theo dõi</div>
          </div>
          {hang.map((h, i) => (
            <div key={h.h} style={{ background: ['#E4F5EC', '#FBF1D8', '#FCEADB', '#FBE6E6'][i], color: ['#1E8E5A', '#B8901A', '#B25A17', '#C23A3A'][i] }}>
              <div className="n so">{h.so}</div>
              <div className="l">{h.h.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <TieuMuc so={1} tieu="Tổng quan công nợ tuần" />
        <div className="bc-the">
          <table className="bc-luoi">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Chỉ tiêu</th>
                <th className="so">Đầu tuần (lũy kế)</th>
                {coKH ? <th className="so">KH trong tuần</th> : null}
                <th className="so">TH trong tuần</th>
                {coKH ? <th className="so">% TH/KH</th> : null}
                <th className="so">Cuối tuần</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bc-dam">
                <td>Tổng doanh thu</td>
                <td className="so">{ty(s.phatSinhLuyKeDau)}</td>
                {coKH ? <td className="so">{khDT != null ? ty(khDT) : '—'}</td> : null}
                <td className="so">{ty(s.phatSinh)}</td>
                {coKH ? <td className="so">{pct(tyLe(s.phatSinh, khDT))}</td> : null}
                <td className="so">{ty(s.phatSinhLuyKeDau + s.phatSinh)}</td>
              </tr>
              <tr className="bc-dam">
                <td>Tổng thanh toán</td>
                <td className="so">{ty(s.thanhToanLuyKeDau)}</td>
                {coKH ? <td className="so">{khThu != null ? ty(khThu) : '—'}</td> : null}
                <td className="so">{ty(s.thanhToan)}</td>
                {coKH ? <td className="so">{pct(tyLe(s.thanhToan, khThu))}</td> : null}
                <td className="so">{ty(s.thanhToanLuyKeDau + s.thanhToan)}</td>
              </tr>
              <tr className="bc-dam">
                <td>Tổng dư nợ</td>
                <td className="so">{ty(dau.du)}</td>
                {coKH ? <td className="so">—</td> : null}
                <td className="so"><Lech v={cuoi.du - dau.du} /></td>
                {coKH ? <td className="so">—</td> : null}
                <td className="so">{ty(cuoi.du)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <TieuMuc so={2} tieu="Phân tích tổng dư nợ" />
        <div className="bc-hai" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
          <div className="bc-the">
            <table className="bc-luoi">
              <thead>
                <tr><th style={{ textAlign: 'left' }}>Chỉ tiêu</th><th className="so">Đầu tuần</th><th className="so">Thay đổi trong tuần</th><th className="so">Cuối tuần</th><th className="so">% dư nợ</th></tr>
              </thead>
              <tbody>
                {([
                  ['Tổng dư nợ', 'du', true],
                  ['Trong hạn', 'trongHan', false],
                  ['Quá hạn', 'quaHan', true],
                  ['Quá hạn 1–30 ngày', 'qh1_30', false],
                  ['Quá hạn 31–60 ngày', 'qh31_60', false],
                  ['Quá hạn 61–90 ngày', 'qh61_90', false],
                  ['Quá hạn >90 ngày', 'qhTren90', false],
                  ['Nợ xấu (>365 ngày)', 'noXau', true],
                ] as const).map(([ten, k, dam]) => (
                  <tr key={k} className={dam ? 'bc-dam' : ten.startsWith('Quá hạn ') ? 'bc-con' : ''}>
                    <td>{ten}</td>
                    <td className="so">{ty(dau[k])}</td>
                    <td className="so"><Lech v={cuoi[k] - dau[k]} tangLaXau={k !== 'trongHan'} /></td>
                    <td className="so">{ty(cuoi[k])}</td>
                    <td className="so">{pct(cuoi.du ? cuoi[k] / cuoi.du : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bc-ghi">Đầu tuần là số dư ngày {ngay(s.dauMoc)}, dựng lại từ chứng từ: cộng lại các khoản đã thanh toán sau ngày đó.</div>
          </div>
          <div className="bc-the">
            <h3>Cơ cấu dư nợ theo tình trạng (cuối tuần)</h3>
            <div className="bc-cap">Tổng dư nợ {ty(cuoi.du)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <PieChart width={190} height={190}>
                <Pie data={coCau.filter((d) => d.v > 0)} dataKey="v" nameKey="ten" innerRadius={52} outerRadius={88} paddingAngle={1} isAnimationActive={false}>
                  {coCau.filter((d) => d.v > 0).map((d) => <Cell key={d.ten} fill={d.mau} />)}
                </Pie>
              </PieChart>
              <div style={{ flex: 1 }}><ChuGiai ds={coCau} tong={cuoi.du} /></div>
            </div>
          </div>
        </div>

        <TieuMuc so={3} tieu="Phân tích tổng thanh toán" />
        <div className="bc-the">
          <table className="bc-luoi">
            <thead>
              <tr><th style={{ textAlign: 'left' }}>Chỉ tiêu</th><th className="so">Trong tuần</th><th className="so">Tỷ trọng</th></tr>
            </thead>
            <tbody>
              <tr className="bc-dam"><td>Tổng thanh toán</td><td className="so">{ty(s.thanhToan)}</td><td className="so">100%</td></tr>
              <tr className="bc-con"><td>Nợ được thanh toán đúng hạn</td><td className="so">{ty(s.ttDungHan)}</td><td className="so">{pct(s.thanhToan ? s.ttDungHan / s.thanhToan : 0)}</td></tr>
              <tr className="bc-con"><td>Nợ trễ hạn nay được thanh toán</td><td className="so bc-tang">{ty(s.ttTreHan)}</td><td className="so">{pct(tyLeTre)}</td></tr>
            </tbody>
          </table>
          {s.thanhToan > 0 ? <div className="bc-ghi">Thanh toán trễ hạn chiếm <b>{pct(tyLeTre)}</b> tổng số tiền thu được trong tuần ({ty(s.ttTreHan)} / {ty(s.thanhToan)}).</div> : null}
        </div>

        <TieuMuc so={4} tieu="Theo dõi công nợ theo từng Sale" tag={`${sales.length} Sale`} />
        <div className="bc-the">
          <table>
            <thead>
              <tr><th>Sale</th><th className="so">Số KH</th><th className="so">Dư nợ</th><th className="so">Quá hạn</th><th className="so">%QH</th><th className="so">Thu trong tuần</th><th className="so">KH cần xử lý gấp</th></tr>
            </thead>
            <tbody>
              {sales.map((x) => (
                <tr key={x.sale}>
                  <td className="ten">{x.sale}</td>
                  <td className="so">{x.soKH}</td>
                  <td className="so">{ty(x.duNo)}</td>
                  <td className="so">{ty(x.quaHan)}</td>
                  <td className="so">{pct(x.duNo ? x.quaHan / x.duNo : 0)}</td>
                  <td className="so">{ty(x.thu)}</td>
                  <td className="so" style={{ color: x.gap ? 'var(--bc-bad)' : undefined, fontWeight: 700 }}>{x.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TieuMuc so={5} tieu="Theo dõi khách hàng trọng điểm" tag={`${dongV.length} KH chiếm 80% dư nợ`} />
        <div className="bc-the bc-bang">
          <table>
            <thead>
              <tr>
                <th>Khách hàng</th><th>Sale</th><th className="so">Dư đầu tuần</th><th className="so">Phát sinh</th><th className="so">Thực thu</th><th className="so">Dư cuối tuần</th>
                {coHangDat ? <><th className="so">Hàng đặt chưa giao</th><th className="so">Tiền cọc</th></> : null}
                <th className="so">Quá hạn</th><th>Cảnh báo</th><th>Hành động tuần sau</th>
              </tr>
            </thead>
            <tbody>
              {dongV.map(({ k, t, cb }) => (
                <tr key={k.maKH}>
                  <td className="ten">{k.tenKH ? `${k.maKH} · ${k.tenKH}` : k.maKH}</td>
                  <td>{k.sale}</td>
                  <td className="so">{ty(t.duDau)}</td>
                  <td className="so">{ty(t.phatSinh)}</td>
                  <td className="so">{ty(t.thucThu)}</td>
                  <td className="so">{ty(k.duNo)}</td>
                  {coHangDat ? <><td className="so">{ty(k.hangDat)}</td><td className="so">{ty(k.tienCoc)}</td></> : null}
                  <td className="so">{ty(k.quaHan)}</td>
                  <td><NhanCB m={cb} /></td>
                  <td style={{ maxWidth: 220 }}>{tay.keHoach[k.maKH] ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TieuMuc so={6} tieu="Theo dõi khách hàng theo từng Sale" tag={`${dongIV.length} khách hàng còn dư nợ`} />
        <div className="bc-the bc-bang">
          <table>
            <thead>
              <tr><th>Sale</th><th>Khách hàng</th><th>Xếp hạng</th><th className="so">Dư nợ</th><th className="so">Hạn mức</th><th className="so">Quá hạn</th><th className="so">Ngày QH max</th><th className="so">HM còn lại</th><th className="so">Vượt HM</th><th>Cảnh báo</th></tr>
            </thead>
            <tbody>
              {dongIV.map(({ k, t, cb }) => (
                <tr key={k.maKH}>
                  <td>{k.sale}</td>
                  <td className="ten">{k.tenKH ? `${k.maKH} · ${k.tenKH}` : k.maKH}</td>
                  <td>{k.hang}</td>
                  <td className="so">{ty(k.duNo)}</td>
                  <td className="so">{k.hmtd > 0 ? ty(k.hmtd) : 'Chưa cấp'}</td>
                  <td className="so">{ty(k.quaHan)}</td>
                  <td className="so">{t.maxQH > 0 ? t.maxQH : '—'}</td>
                  <td className="so">{k.hmtd > 0 ? ty(Math.max(0, k.hmtd - k.duNo)) : '—'}</td>
                  <td className="so" style={{ color: k.hmtd > 0 && k.duNo > k.hmtd ? 'var(--bc-bad)' : undefined }}>{k.hmtd > 0 && k.duNo > k.hmtd ? ty(k.duNo - k.hmtd) : '—'}</td>
                  <td><NhanCB m={cb} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TieuMuc so={7} tieu={`Tóm tắt tuần ${meta.tuanNhan}`} />
        <div className="bc-the">
          <ol className="bc-tom-tat">{tomTat.map((c) => <li key={c}>{c}</li>)}</ol>
        </div>

        <div className="bc-hai" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <TieuMuc so={8} tieu="Ghi chú bộ phận công nợ tuần này" />
            <div className="bc-the bc-van">{tay.tuanNay}</div>
          </div>
          <div>
            <TieuMuc so={9} tieu="Ghi chú bộ phận công nợ tuần sau" />
            <div className="bc-the bc-van">{tay.tuanSau}</div>
          </div>
        </div>

        <div className="bc-chan">
          Dựng từ {list.reduce((n, k) => n + k.chungTu.length, 0).toLocaleString('vi-VN')} dòng chứng từ / {list.length} khách hàng · tuần {nhanTuan} · chốt {ngay(meta.ngayChot)}.
        </div>
      </div>
    </div>
  );
}
