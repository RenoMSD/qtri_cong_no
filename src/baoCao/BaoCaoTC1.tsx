import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Legend, Line, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { BUCKET_LABEL, tongHop, type BucketKey, type Hang, type Khach, type KyMeta } from '../lib/metrics';
import { ngay, pct, thangNhan, ty } from '../format';
import { thangNhieu } from '../soLieu';
import { ChuGiai, DauTrang, TieuMuc, tyTruc } from './khung';

// Mẫu «Dashboard Công nợ theo KH» (TC1), theo template_report/Dashboard_TC1_*.html

export type NguongRuiRo = { tyLeQh: number; quaHanTy: number };
export const NGUONG_RUI_RO_MAC_DINH: NguongRuiRo = { tyLeQh: 0.6, quaHanTy: 1 };

const TUOI_QH: { k: BucketKey; mau: string }[] = [
  { k: 'd0_30', mau: '#8FCB8F' },
  { k: 'd31_60', mau: '#F2E08A' },
  { k: 'd61_90', mau: '#E0B400' },
  { k: 'd91_120', mau: '#F0A860' },
  { k: 'd121_150', mau: '#E8862E' },
  { k: 'd151_180', mau: '#C1580A' },
  { k: 'd181_365', mau: '#E1332B' },
  { k: 'd365', mau: '#7A1212' },
];

const HANG: { h: Hang; nen: string; pill: [string, string] }[] = [
  { h: 'Tốt', nen: '#1E8E5A', pill: ['#E4F5EC', '#1E8E5A'] },
  { h: 'Trung bình', nen: '#A67D0E', pill: ['#FBF1D8', '#B8901A'] },
  { h: 'Xấu', nen: '#C1580A', pill: ['#FCEADB', '#B25A17'] },
  { h: 'Rất xấu', nen: '#A62B2B', pill: ['#FBE6E6', '#C23A3A'] },
  { h: 'Chưa chấm', nen: '#2C5F8A', pill: ['#E7EFF7', '#16324E'] },
];

function HangPill({ h }: { h: Hang }) {
  const m = HANG.find((x) => x.h === h) ?? HANG[4];
  return (
    <span className="bc-hangpill" style={{ background: m.pill[0], color: m.pill[1] }}>
      {h}
    </span>
  );
}

function tinh(list: Khach[], meta: KyMeta, nguong: NguongRuiRo) {
  const tong = tongHop(list, meta.soNgayKy);
  const gap = list.map((k) => k.dsoGap).filter((v): v is number => v != null);
  const dsoGap = gap.length ? gap.reduce((s, v) => s + v, 0) / gap.length : null;
  const tuoi = TUOI_QH.map((t) => ({ ten: BUCKET_LABEL[t.k], mau: t.mau, v: tong.aging[t.k], hien: ty(tong.aging[t.k]) })).filter((t) => t.v > 0);

  const sale = new Map<string, { ten: string; doanhThu: number; duNo: number; quaHan: number }>();
  for (const k of list) {
    const r = sale.get(k.sale) ?? { ten: k.sale, doanhThu: 0, duNo: 0, quaHan: 0 };
    r.doanhThu += k.doanhSo;
    r.duNo += k.duNo;
    r.quaHan += k.quaHan;
    sale.set(k.sale, r);
  }
  const theoSale = [...sale.values()].sort((a, b) => b.doanhThu - a.doanhThu || b.duNo - a.duNo).slice(0, 20);

  const vuot = list
    .filter((k) => (k.hmtd > 0 && k.duNo > k.hmtd) || (k.hmtd === 0 && k.duNo > 0))
    .map((k) => ({ k, vuot: k.hmtd > 0 ? k.duNo - k.hmtd : k.duNo, pct: k.hmtd > 0 ? (k.duNo - k.hmtd) / k.hmtd : null }))
    .sort((a, b) => b.vuot - a.vuot);
  const ruiRo = list
    .filter((k) => k.duNo > 0 && k.quaHan / k.duNo >= nguong.tyLeQh && k.quaHan >= nguong.quaHanTy * 1e9)
    .sort((a, b) => b.quaHan - a.quaHan);
  const hang = HANG.map((m) => {
    const ds = list.filter((k) => k.hang === m.h);
    return { ...m, so: ds.length, duNo: ds.reduce((s, k) => s + k.duNo, 0) };
  });
  return { tong, dsoGap, tuoi, thang: thangNhieu(list), theoSale, vuot, ruiRo, hang };
}

export function BaoCaoTC1({
  list,
  tongSoKhach,
  meta,
  nhanLoc,
  nguong,
  deXuat,
}: {
  list: Khach[];
  tongSoKhach: number;
  meta: KyMeta;
  nhanLoc: string;
  nguong: NguongRuiRo;
  deXuat: string[];
}) {
  const s = tinh(list, meta, nguong);
  const t = s.tong;
  const tyLeQhThu = t.qhThu + t.quaHan > 0 ? t.qhThu / (t.qhThu + t.quaHan) : 0;
  const chuaDen = t.chuaDenHan + t.aging.traTruocHan;
  const phan = (v: number) => (t.duNo > 0 ? (v / t.duNo) * 100 : 0);
  const tongQh = s.tuoi.reduce((a, b) => a + b.v, 0);
  const xepChong = s.vuot.length > 12 || s.ruiRo.length > 12;
  const dongDeXuat = deXuat.filter((d) => d.trim());

  return (
    <div className="bc">
      <DauTrang
        nhan="Báo cáo quản trị công nợ"
        tieu="Dashboard Công nợ theo KH"
        phu={`Từ ${ngay(meta.tuNgay)} đến ${ngay(meta.ngayChot)} · ${nhanLoc}`}
        ky={`TC1 · chốt ${ngay(meta.ngayChot)}`}
      />
      <div className="bc-than">
        <TieuMuc so={1} tieu="Tổng quan chỉ tiêu công nợ" tag={`${list.length} / ${tongSoKhach} khách hàng`} />
        <div className="bc-kpi">
          <div className="bc-the">
            <div className="bc-nhan">Tổng doanh thu</div>
            <div className="bc-lon so">{ty(t.doanhSo)}</div>
            <div className="bc-gach" />
            <div className="bc-nhan">Nợ đầu kỳ</div>
            <div className="bc-lon so" style={{ fontSize: 18 }}>{ty(t.duDauKy)}</div>
          </div>
          <div className="bc-the">
            <div className="bc-nhan">Tiền đã thu hồi</div>
            <div className="bc-lon so" style={{ color: 'var(--bc-good)' }}>{ty(t.tienTT)}</div>
            <div className="bc-gach" />
            <div className="bc-hang"><span>Nợ QH đã thu hồi</span><b className="so" style={{ color: 'var(--bc-good)' }}>{ty(t.qhThu)}</b></div>
            <div className="bc-hang"><span>Tỷ lệ thu hồi nợ QH</span><span className="bc-pill tot">{pct(tyLeQhThu)}</span></div>
          </div>
          <div className="bc-the">
            <div className="bc-nhan">Tổng nợ phải thu khách hàng</div>
            <div className="bc-lon so" style={{ fontSize: 27 }}>{ty(t.duNo)}</div>
            <div className="bc-segbar">
              <div style={{ width: `${Math.max(0, phan(chuaDen))}%`, background: '#1E4EA8' }} />
              <div style={{ width: `${Math.max(0, phan(t.denHan))}%`, background: '#1E8E5A' }} />
              <div style={{ width: `${Math.max(0, phan(t.quaHan))}%`, background: '#C23A3A' }} />
            </div>
            <div className="bc-chip3">
              <div className="bc-chip xanh"><div className="t">Chưa đến hạn</div><div className="v so">{ty(chuaDen)}</div><div className="p">{phan(chuaDen).toFixed(1)}%</div></div>
              <div className="bc-chip la"><div className="t">Đến hạn</div><div className="v so">{ty(t.denHan)}</div><div className="p">{phan(t.denHan).toFixed(1)}%</div></div>
              <div className="bc-chip do"><div className="t">Quá hạn</div><div className="v so">{ty(t.quaHan)}</div><div className="p">{phan(t.quaHan).toFixed(1)}%</div></div>
            </div>
          </div>
          <div className="bc-the">
            <div className="bc-nhan">Vòng quay công nợ</div>
            <div className="bc-lon so">{t.dsoKy == null ? '—' : t.dsoKy.toLocaleString('vi-VN')}</div>
            <div className="bc-hang"><span>DSO (ngày)</span></div>
            <div className="bc-gach" />
            <div className="bc-lon so" style={{ fontSize: 18, color: s.dsoGap != null && s.dsoGap > 0 ? 'var(--bc-bad)' : 'var(--bc-title)' }}>
              {s.dsoGap == null ? '—' : `${s.dsoGap > 0 ? '+' : ''}${s.dsoGap.toFixed(0)}`}
            </div>
            <div className="bc-hang"><span>DSO GAP bình quân (ngày)</span></div>
          </div>
          <div className="bc-the">
            <div className="bc-nhan">KH vượt hạn mức tín dụng</div>
            <div className="bc-lon so" style={{ color: 'var(--bc-warn)' }}>{t.vuotHmSo + t.chuaHmSo} <small style={{ fontSize: 13, color: 'var(--bc-ink-faint)' }}>KH</small></div>
            <div className="bc-gach" />
            <div className="bc-hang"><span>Giá trị vượt HMTD</span><b className="so">{ty(t.vuotHmTien + t.chuaHmTien)}</b></div>
            <div className="bc-hang"><span>Trong đó chưa cấp HMTD</span><b className="so">{t.chuaHmSo} KH</b></div>
          </div>
          <div className="bc-the">
            <div className="bc-nhan">Xếp hạng khách hàng · {list.length} KH</div>
            <div className="bc-xh">
              {s.hang.map((h) => (
                <div key={h.h} style={{ background: h.nen }}>
                  <div className="t">{h.h}</div>
                  <div className="n so">{h.so}</div>
                  <div className="p so">{ty(h.duNo)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TieuMuc so={2} tieu="Cơ cấu công nợ và tình hình thu hồi" />
        <div className="bc-hai" style={{ gridTemplateColumns: '1fr 1.7fr' }}>
          <div className="bc-the">
            <h3>Cơ cấu nợ quá hạn theo tuổi nợ</h3>
            <div className="bc-cap">Tỷ trọng nợ quá hạn theo từng dải tuổi nợ · tổng {ty(tongQh)}</div>
            {s.tuoi.length === 0 ? (
              <p className="bc-cap">Không có nợ quá hạn.</p>
            ) : (
              <>
                <PieChart width={440} height={240}>
                  <Pie data={s.tuoi} dataKey="v" nameKey="ten" innerRadius={62} outerRadius={110} paddingAngle={1} isAnimationActive={false}>
                    {s.tuoi.map((d) => <Cell key={d.ten} fill={d.mau} />)}
                  </Pie>
                </PieChart>
                <ChuGiai ds={s.tuoi} tong={tongQh} />
              </>
            )}
          </div>
          <div className="bc-the">
            <h3>Tình hình thu hồi công nợ theo tháng</h3>
            <div className="bc-cap">Phát sinh công nợ mới so với tiền đã thu hồi; đường là dư nợ lũy kế · đơn vị tỷ đồng</div>
            <ComposedChart width={760} height={380} data={s.thang} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#E3E8EF" vertical={false} />
              <XAxis dataKey="thang" tickFormatter={thangNhan} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={tyTruc} tick={{ fontSize: 11 }} width={48} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="phatSinh" name="Phát sinh nợ" fill="#2C5F8A" isAnimationActive={false} />
              <Bar dataKey="thanhToan" name="Đã thu hồi" fill="#E0B400" isAnimationActive={false} />
              <Line dataKey="duNoLuyKe" name="Dư nợ lũy kế" stroke="#C23A3A" strokeWidth={2} dot={false} isAnimationActive={false} />
            </ComposedChart>
          </div>
        </div>

        <TieuMuc so={3} tieu="Phân tích công nợ theo từng Sale" tag={s.theoSale.length < 20 ? `${s.theoSale.length} Sale` : 'Top 20 Sale theo doanh thu'} />
        <div className="bc-the">
          <h3>Doanh thu, dư nợ &amp; nợ quá hạn theo Sale</h3>
          <div className="bc-cap">Đơn vị tỷ đồng · nhãn trên cột là dư nợ</div>
          <BarChart width={1300} height={400} data={s.theoSale} margin={{ top: 22, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#E3E8EF" vertical={false} />
            <XAxis dataKey="ten" tick={{ fontSize: 11 }} interval={0} />
            <YAxis tickFormatter={tyTruc} tick={{ fontSize: 11 }} width={48} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="doanhThu" name="Doanh thu" fill="#7FA3C2" isAnimationActive={false} />
            <Bar dataKey="duNo" name="Dư nợ" fill="#123E7A" isAnimationActive={false}>
              <LabelList dataKey="duNo" position="top" formatter={(v: unknown) => tyTruc(Number(v))} style={{ fontSize: 10, fill: '#132437' }} />
            </Bar>
            <Bar dataKey="quaHan" name="Nợ quá hạn" fill="#C23A3A" isAnimationActive={false} />
          </BarChart>
        </div>

        <TieuMuc so={4} tieu="Cảnh báo hạn mức & khách hàng rủi ro cao" />
        <div className="bc-hai" style={{ gridTemplateColumns: xepChong ? '1fr' : '1fr 1fr' }}>
          <div className="bc-the bc-bang">
            <h3>Danh sách khách hàng vượt hạn mức tín dụng</h3>
            <div className="bc-tieu-chi">
              Tiêu chí: dư nợ &gt; HMTD, hoặc chưa được cấp HMTD mà vẫn có dư nợ · <b>{s.vuot.length} KH</b>
            </div>
            <table>
              <thead>
                <tr><th>#</th><th>Khách hàng</th><th>Xếp hạng</th><th className="so">Dư nợ</th><th className="so">Quá hạn</th><th className="so">%QH/Dư nợ</th><th className="so">HMTD</th><th className="so">% Vượt</th></tr>
              </thead>
              <tbody>
                {s.vuot.length === 0 ? <tr className="bc-rong"><td colSpan={8}>Không có khách vượt hạn mức</td></tr> : null}
                {s.vuot.map((r, i) => (
                  <tr key={r.k.maKH}>
                    <td>{i + 1}</td>
                    <td className="ten">{r.k.tenKH ? `${r.k.maKH} · ${r.k.tenKH}` : r.k.maKH}</td>
                    <td><HangPill h={r.k.hang} /></td>
                    <td className="so">{ty(r.k.duNo)}</td>
                    <td className="so">{ty(r.k.quaHan)}</td>
                    <td className="so">{pct(r.k.duNo > 0 ? r.k.quaHan / r.k.duNo : null)}</td>
                    <td className="so">{r.k.hmtd > 0 ? ty(r.k.hmtd) : 'Chưa cấp'}</td>
                    <td className="so" style={{ color: 'var(--bc-bad)', fontWeight: 700 }}>{r.pct == null ? '—' : pct(r.pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bc-the bc-bang">
            <h3>Danh sách khách hàng rủi ro cao</h3>
            <div className="bc-tieu-chi">
              Tiêu chí: %QH/Dư nợ ≥ <b>{Math.round(nguong.tyLeQh * 100)}%</b> và nợ quá hạn ≥ <b>{nguong.quaHanTy.toLocaleString('vi-VN')} tỷ</b> · <b>{s.ruiRo.length} KH</b>
            </div>
            <table>
              <thead>
                <tr><th>#</th><th>Khách hàng</th><th>Xếp hạng</th><th className="so">Doanh thu</th><th className="so">Dư nợ</th><th className="so">Quá hạn</th><th className="so">%QH/Dư nợ</th></tr>
              </thead>
              <tbody>
                {s.ruiRo.length === 0 ? <tr className="bc-rong"><td colSpan={7}>Không có khách thỏa tiêu chí</td></tr> : null}
                {s.ruiRo.map((k, i) => (
                  <tr key={k.maKH}>
                    <td>{i + 1}</td>
                    <td className="ten">{k.tenKH ? `${k.maKH} · ${k.tenKH}` : k.maKH}</td>
                    <td><HangPill h={k.hang} /></td>
                    <td className="so">{ty(k.doanhSo)}</td>
                    <td className="so">{ty(k.duNo)}</td>
                    <td className="so">{ty(k.quaHan)}</td>
                    <td className="so" style={{ color: 'var(--bc-bad)', fontWeight: 700 }}>{pct(k.quaHan / k.duNo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TieuMuc so={5} tieu="Đề xuất — Kiến nghị" />
        <div className="bc-the">
          {(dongDeXuat.length ? dongDeXuat : ['', '', '']).map((d, i) => (
            <div key={i} className="bc-dong-de-xuat">
              <b>{i + 1}</b>
              <p>{d}</p>
            </div>
          ))}
        </div>

        <div className="bc-chan">
          Nguồn: sổ công nợ đã nạp, chốt ngày {ngay(meta.ngayChot)}. Số liệu chạy theo bộ lọc trên mẫu ({nhanLoc}). Đơn vị: tỷ đồng, trừ khi ghi khác.
        </div>
      </div>
    </div>
  );
}
