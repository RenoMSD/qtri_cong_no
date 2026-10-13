import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { TEN_CONG_TY, taiFontArial } from './lib/chung';
import { ngay } from './format';
import { KHUNG, MAU, TRANG, type DuLieuMau, type NoiDung, type OBox } from './mauIn';

const MM = 72 / 25.4;
const PAGE_W = TRANG.rong * MM;
const PAGE_H = TRANG.cao * MM;

function mau(hex: string) {
  const n = hex.replace('#', '');
  return rgb(parseInt(n.slice(0, 2), 16) / 255, parseInt(n.slice(2, 4), 16) / 255, parseInt(n.slice(4, 6), 16) / 255);
}

const XANH = mau(MAU.xanh);
const NAVY = mau(MAU.navy);
const CHU = mau(MAU.chu);
const PHU = mau(MAU.phu);
const VIEN = mau(MAU.vien);
const TRANG_MAU = mau(MAU.the);
const NEN = mau(MAU.nen);

function sach(s: string): string {
  return (s || '').replace(/\u2013|\u2014/g, '-').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function cat(font: PDFFont, s: string, size: number, rong: number): string {
  const t = sach(s);
  if (font.widthOfTextAtSize(t, size) <= rong) return t;
  let lo = 0;
  let hi = t.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (font.widthOfTextAtSize(`${t.slice(0, mid)}...`, size) <= rong) lo = mid;
    else hi = mid - 1;
  }
  return `${t.slice(0, lo)}...`;
}

type Hop = { x: number; y: number; w: number; h: number };

function hopCua(o: OBox): Hop {
  return { x: o.x * MM, y: PAGE_H - (o.y + o.h) * MM, w: o.w * MM, h: o.h * MM };
}

function nenThe(page: PDFPage, h: Hop, fill = TRANG_MAU) {
  page.drawRectangle({ x: h.x, y: h.y, width: h.w, height: h.h, color: fill, borderColor: VIEN, borderWidth: 0.6 });
}

function chu(page: PDFPage, font: PDFFont, text: string, x: number, y: number, size: number, color = CHU) {
  const t = sach(text);
  if (!t) return;
  page.drawText(t, { x, y, size, font, color });
}

function veTieu(page: PDFPage, font: PDFFont, h: Hop, nd: Extract<NoiDung, { kieu: 'tieu' }>) {
  page.drawRectangle({ x: h.x, y: h.y, width: h.w, height: h.h, color: NAVY });
  const trai = h.x + 3 * MM;
  chu(page, font, cat(font, TEN_CONG_TY, 6, h.w - 6 * MM), trai, h.y + h.h - 4.2 * MM, 6, rgb(1, 1, 1));
  const tieu = cat(font, nd.tieu, 8, h.w * 0.42);
  chu(page, font, tieu, trai, h.y + 2.4 * MM, 8, rgb(1, 1, 1));
  const con = h.w - 8 * MM - font.widthOfTextAtSize(tieu, 8);
  if (con > 20 * MM) {
    const phu = cat(font, nd.phu, 6, con - 2 * MM);
    const rong = font.widthOfTextAtSize(phu, 6);
    chu(page, font, phu, h.x + h.w - rong - 3 * MM, h.y + 2.8 * MM, 6, rgb(0.85, 0.9, 0.95));
  }
}

function veKpi(page: PDFPage, font: PDFFont, h: Hop, nd: Extract<NoiDung, { kieu: 'kpi' }>) {
  nenThe(page, h);
  page.drawRectangle({ x: h.x, y: h.y, width: 1.4 * MM, height: h.h, color: mau(nd.mau) });
  chu(page, font, cat(font, nd.ten, 6, h.w - 5 * MM), h.x + 3 * MM, h.y + h.h - 5 * MM, 6, PHU);
  chu(page, font, cat(font, nd.gia, 9, h.w - 5 * MM), h.x + 3 * MM, h.y + h.h - 10 * MM, 9, CHU);
  chu(page, font, cat(font, nd.phu, 5.5, h.w - 5 * MM), h.x + 3 * MM, h.y + 2.2 * MM, 5.5, PHU);
}

function tieuO(page: PDFPage, font: PDFFont, h: Hop, tieu: string, phu?: string): number {
  chu(page, font, cat(font, tieu, 7, h.w - 4 * MM), h.x + 2 * MM, h.y + h.h - 4.2 * MM, 7, NAVY);
  if (phu) chu(page, font, cat(font, phu, 5, h.w - 4 * MM), h.x + 2 * MM, h.y + h.h - 7.2 * MM, 5, PHU);
  return phu ? 8.2 * MM : 5.2 * MM;
}

function veCot(page: PDFPage, font: PDFFont, h: Hop, nd: Extract<NoiDung, { kieu: 'cot' }>) {
  nenThe(page, h);
  const dau = tieuO(page, font, h, nd.tieu, nd.phu);
  const lat = nd.lat;
  if (lat.length === 0) {
    chu(page, font, 'Không có số', h.x + 2 * MM, h.y + 4 * MM, 6, PHU);
    return;
  }
  const plot: Hop = { x: h.x + 2 * MM, y: h.y + 1.5 * MM, w: h.w - 4 * MM, h: h.h - dau - 2 * MM };
  const max = Math.max(...lat.map((d) => d.v), 1);
  if (nd.ngang) {
    const row = plot.h / lat.length;
    const nhan = Math.min(plot.w * 0.34, 28 * MM);
    lat.forEach((d, i) => {
      const y = plot.y + plot.h - (i + 1) * row;
      chu(page, font, cat(font, d.ten, 5, nhan - 1 * MM), plot.x, y + row * 0.28, 5, CHU);
      const bw = Math.max(0, (plot.w - nhan - 16 * MM) * (d.v / max));
      if (bw > 0) page.drawRectangle({ x: plot.x + nhan, y: y + row * 0.22, width: bw, height: Math.max(1, row * 0.5), color: mau(d.mau) });
      chu(page, font, cat(font, d.hien, 4.5, 15 * MM), plot.x + nhan + bw + 1 * MM, y + row * 0.28, 4.5, PHU);
    });
    return;
  }
  const slot = plot.w / lat.length;
  const bw = Math.min(12 * MM, Math.max(2.2 * MM, slot * 0.55));
  lat.forEach((d, i) => {
    const bh = Math.max(0, (plot.h - 8 * MM) * (d.v / max));
    const x = plot.x + i * slot + (slot - bw) / 2;
    const day = plot.y + 5 * MM;
    if (bh > 0) page.drawRectangle({ x, y: day, width: bw, height: bh, color: mau(d.mau) });
    const so = cat(font, d.hien, 4.5, slot - 0.4 * MM);
    const sw = font.widthOfTextAtSize(so, 4.5);
    chu(page, font, so, x + bw / 2 - sw / 2, day + bh + 0.6 * MM, 4.5, CHU);
    chu(page, font, cat(font, d.ten, 4.5, slot - 0.4 * MM), plot.x + i * slot, plot.y + 1.2 * MM, 4.5, PHU);
  });
}

function cung(r: number, a0: number, a1: number): string {
  const buoc = Math.max(2, Math.ceil(Math.abs(a1 - a0) / (Math.PI / 14)));
  let d = 'M 0 0';
  for (let i = 0; i <= buoc; i++) {
    const a = a0 + ((a1 - a0) * i) / buoc;
    d += ` L ${(Math.cos(a) * r).toFixed(2)} ${(-Math.sin(a) * r).toFixed(2)}`;
  }
  return `${d} Z`;
}

function veTron(page: PDFPage, font: PDFFont, h: Hop, nd: Extract<NoiDung, { kieu: 'tron' }>) {
  nenThe(page, h);
  const dau = tieuO(page, font, h, nd.tieu, nd.phu);
  const lat = nd.lat.filter((d) => d.v > 0);
  const tong = lat.reduce((s, d) => s + d.v, 0);
  if (tong <= 0) {
    chu(page, font, 'Không có số', h.x + 2 * MM, h.y + 4 * MM, 6, PHU);
    return;
  }
  const r = Math.min(16 * MM, (h.h - dau - 6 * MM) / 2, h.w * 0.26);
  const cx = h.x + r + 4 * MM;
  const cy = h.y + (h.h - dau) / 2 + 1 * MM;
  let goc = -Math.PI / 2;
  for (const d of lat) {
    const goc2 = goc + (d.v / tong) * Math.PI * 2;
    page.drawSvgPath(cung(Math.max(4, r), goc, goc2), { x: cx, y: cy, color: mau(d.mau) });
    goc = goc2;
  }
  let y = h.y + h.h - dau - 1 * MM;
  const lx = cx + r + 3 * MM;
  for (const d of lat) {
    if (y < h.y + 2 * MM) break;
    page.drawRectangle({ x: lx, y: y - 1.2 * MM, width: 2.2 * MM, height: 2.2 * MM, color: mau(d.mau) });
    chu(page, font, cat(font, `${d.ten} ${d.hien}`, 5, h.x + h.w - lx - 5 * MM), lx + 3 * MM, y - 1 * MM, 5, CHU);
    y -= 4 * MM;
  }
}

function veNhom(page: PDFPage, font: PDFFont, h: Hop, nd: Extract<NoiDung, { kieu: 'nhom' | 'chong' }>, chong: boolean) {
  nenThe(page, h);
  const dau = tieuO(page, font, h, nd.tieu, nd.phu);
  if (nd.nhom.length === 0) {
    chu(page, font, 'Không có chuỗi tháng', h.x + 2 * MM, h.y + 4 * MM, 6, PHU);
    return;
  }
  if (chong) {
    const soHang = nd.nhom.length || 1;
    const legend = 4.2 * MM;
    const rowH = (h.h - dau - legend - 1.5 * MM) / soHang;
    const nhan = Math.min(32 * MM, h.w * 0.26);
    const soW = 8 * MM;
    const barX = h.x + 2 * MM + nhan;
    const barW = Math.max(8 * MM, h.w - 4 * MM - nhan - soW);
    nd.nhom.forEach((ten, i) => {
      const tong = nd.series.reduce((s, ser) => s + Math.max(0, ser.v[i] || 0), 0);
      const y = h.y + h.h - dau - (i + 1) * rowH + 0.5 * MM;
      const bh = Math.max(1.4 * MM, rowH * 0.62);
      chu(page, font, cat(font, ten, 5, nhan - 1 * MM), h.x + 2 * MM, y + bh * 0.2, 5, CHU);
      let x = barX;
      for (const ser of nd.series) {
        const v = Math.max(0, ser.v[i] || 0);
        const w = tong > 0 ? (barW * v) / tong : 0;
        if (w > 0.2) page.drawRectangle({ x, y, width: w, height: bh, color: mau(ser.mau) });
        x += w;
      }
      chu(page, font, String(Math.round(tong)), barX + barW + 0.8 * MM, y + bh * 0.2, 5, CHU);
    });
    let lx = h.x + 2 * MM;
    const ly = h.y + 1.4 * MM;
    for (const ser of nd.series) {
      page.drawRectangle({ x: lx, y: ly, width: 2 * MM, height: 2 * MM, color: mau(ser.mau) });
      chu(page, font, ser.ten, lx + 2.6 * MM, ly, 4.5, PHU);
      lx += font.widthOfTextAtSize(ser.ten, 4.5) + 5 * MM;
    }
    return;
  }
  const plot: Hop = { x: h.x + 2 * MM, y: h.y + 6 * MM, w: h.w - 4 * MM, h: Math.max(8, h.h - dau - 12 * MM) };
  const n = nd.nhom.length;
  const slot = plot.w / n;
  const dinh = Math.max(1, ...nd.series.flatMap((ser) => ser.v.map((v) => Math.abs(v))));
  nd.nhom.forEach((ten, i) => {
    {
      const bw = Math.min(8 * MM, Math.max(1.6 * MM, (slot * 0.72) / nd.series.length));
      nd.series.forEach((ser, s) => {
        const v = Math.abs(ser.v[i] || 0);
        const bh = Math.max(0, (plot.h - 5.5 * MM) * (v / dinh));
        const x = plot.x + i * slot + s * (bw + 0.4 * MM) + slot * 0.08;
        if (bh > 0) page.drawRectangle({ x, y: plot.y, width: bw, height: bh, color: mau(ser.mau) });
        if (v > 0) {
          const so = cat(font, ser.v[i] >= 1e6 ? (ser.v[i] / 1e9).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(Math.round(v)), 4, bw + 3 * MM);
          const sw = font.widthOfTextAtSize(so, 4);
          const tran = plot.y + plot.h - 0.6 * MM;
          let ySo = plot.y + bh + 1.2 * MM + (s % 2) * 2.5 * MM;
          if (ySo > tran) ySo = tran;
          chu(page, font, so, x + bw / 2 - sw / 2, ySo, 4, CHU);
        }
      });
    }
    chu(page, font, cat(font, ten, 4.5, slot - 0.3 * MM), plot.x + i * slot, h.y + 1.4 * MM, 4.5, PHU);
  });
  let lx = h.x + 2 * MM;
  const ly = h.y + h.h - dau - 3.2 * MM;
  for (const ser of nd.series) {
    page.drawRectangle({ x: lx, y: ly, width: 2 * MM, height: 2 * MM, color: mau(ser.mau) });
    chu(page, font, ser.ten, lx + 2.6 * MM, ly, 5, PHU);
    lx += font.widthOfTextAtSize(ser.ten, 5) + 8 * MM;
  }
}

function veDuong(page: PDFPage, font: PDFFont, h: Hop, nd: Extract<NoiDung, { kieu: 'duong' }>) {
  nenThe(page, h);
  const dau = tieuO(page, font, h, nd.tieu, nd.phu);
  const lat = nd.lat;
  if (lat.length === 0) {
    chu(page, font, 'Không có chuỗi tháng', h.x + 2 * MM, h.y + 4 * MM, 6, PHU);
    return;
  }
  const plot: Hop = { x: h.x + 2 * MM, y: h.y + 5 * MM, w: h.w - 4 * MM, h: Math.max(8, h.h - dau - 6 * MM) };
  const min = Math.min(0, ...lat.map((d) => d.v));
  const max = Math.max(0, ...lat.map((d) => d.v));
  const span = max - min || 1;
  const diem = lat.map((d, i) => {
    const x = plot.x + (lat.length === 1 ? plot.w / 2 : (plot.w * i) / (lat.length - 1));
    const y = plot.y + ((d.v - min) / span) * plot.h;
    return { x, y, d };
  });
  const y0 = plot.y + ((0 - min) / span) * plot.h;
  page.drawLine({ start: { x: plot.x, y: y0 }, end: { x: plot.x + plot.w, y: y0 }, thickness: 0.4, color: VIEN });
  if (diem.length > 1) {
    const p0 = diem[0];
    let d = 'M 0 0';
    for (const p of diem.slice(1)) d += ` L ${(p.x - p0.x).toFixed(2)} ${(p0.y - p.y).toFixed(2)}`;
    page.drawSvgPath(d, { x: p0.x, y: p0.y, borderColor: XANH, borderWidth: 1.1 });
  }
  diem.forEach((p) => {
    page.drawEllipse({ x: p.x, y: p.y, xScale: 1.3, yScale: 1.3, color: XANH });
    const so = p.d.hien;
    const sw = font.widthOfTextAtSize(so, 4.5);
    let x = p.x - sw / 2;
    const trai = h.x + 1.4 * MM;
    const phai = h.x + h.w - 1.4 * MM - sw;
    if (x < trai) x = trai;
    if (x > phai) x = phai;
    const tran = h.y + h.h - dau - 0.8 * MM;
    const satDinh = plot.h > 0 && (p.y - plot.y) / plot.h > 0.72;
    let ySo = satDinh ? p.y - 3.8 * MM : p.y + 3.2 * MM;
    if (ySo > tran) ySo = p.y - 3.8 * MM;
    if (ySo < h.y + 5.2 * MM) ySo = Math.min(tran, p.y + 3.2 * MM);
    chu(page, font, so, x, ySo, 4.5, CHU);
    const thang = cat(font, p.d.ten, 4.5, Math.max(8 * MM, plot.w / Math.max(1, lat.length) - 0.6 * MM));
    const tw = font.widthOfTextAtSize(thang, 4.5);
    let tx = p.x - tw / 2;
    if (tx < trai) tx = trai;
    if (tx > h.x + h.w - 1.4 * MM - tw) tx = h.x + h.w - 1.4 * MM - tw;
    chu(page, font, thang, tx, h.y + 1.4 * MM, 4.5, PHU);
  });
}

function veBangO(page: PDFPage, font: PDFFont, h: Hop, nd: Extract<NoiDung, { kieu: 'bang' }>) {
  nenThe(page, h);
  const dau = tieuO(page, font, h, nd.tieu, nd.chu);
  const rowH = 2.8 * MM;
  const san = h.y + 4.2 * MM;
  const rong = rongCot(nd.cot, h.w - 4 * MM, font);
  let y = h.y + h.h - dau - 1 * MM;
  veHang(page, font, nd.cot, rong, h.x + 2 * MM, y, 5, NAVY);
  y -= rowH;
  let ve = 0;
  for (const hang of nd.dong) {
    if (y < san) break;
    veHang(page, font, hang, rong, h.x + 2 * MM, y, 5, CHU);
    y -= rowH;
    ve += 1;
  }
  if (ve < nd.dong.length) {
    chu(page, font, `Còn ${nd.dong.length - ve} dòng ở bản danh sách.`, h.x + 2 * MM, h.y + 1.4 * MM, 5, PHU);
  }
}

function veThe(page: PDFPage, font: PDFFont, h: Hop, nd: Extract<NoiDung, { kieu: 'the' }>) {
  nenThe(page, h);
    chu(page, font, cat(font, nd.tieu, 6.5, h.w - 4 * MM), h.x + 2 * MM, h.y + h.h - 4 * MM, 6.5, NAVY);
    const n = Math.max(1, nd.the.length);
    const w = (h.w - 4 * MM) / n;
    nd.the.forEach((t, i) => {
      const x = h.x + 2 * MM + i * w;
      chu(page, font, cat(font, t.ten, 5, w - 1 * MM), x, h.y + h.h - 8 * MM, 5, mau(t.mau));
      chu(page, font, cat(font, t.gia, 8, w - 1 * MM), x, h.y + 6 * MM, 8, CHU);
      chu(page, font, cat(font, t.phu, 5, w - 1 * MM), x, h.y + 2.2 * MM, 5, PHU);
    });
}

function rongCot(cot: string[], tong: number, font: PDFFont): number[] {
  const goc = cot.map((c) => Math.max(font.widthOfTextAtSize(sach(c), 5) + 2 * MM, 12 * MM));
  const s = goc.reduce((a, b) => a + b, 0) || 1;
  return goc.map((w) => (w / s) * tong);
}

function veHang(page: PDFPage, font: PDFFont, o: string[], rong: number[], x: number, y: number, size: number, color: ReturnType<typeof mau>) {
  let cx = x;
  o.forEach((cell, i) => {
    const mauChu = /Rủi ro cao|Quá hạn/.test(cell) ? mau(MAU.nguy) : /Sắp chạm/.test(cell) ? mau(MAU.theo) : /Bình thường|Tốt/.test(cell) ? mau(MAU.tot) : color;
    chu(page, font, cat(font, cell, size, (rong[i] ?? 0) - 1 * MM), cx, y, size, mauChu);
    cx += rong[i] ?? 0;
  });
}

function veO(page: PDFPage, font: PDFFont, o: OBox, nd: NoiDung | undefined) {
  const h = hopCua(o);
  if (!nd) {
    nenThe(page, h, NEN);
    chu(page, font, o.id, h.x + 2 * MM, h.y + 2 * MM, 6, PHU);
    return;
  }
  if (nd.kieu === 'tieu') veTieu(page, font, h, nd);
  else if (nd.kieu === 'kpi') veKpi(page, font, h, nd);
  else if (nd.kieu === 'cot') veCot(page, font, h, nd);
  else if (nd.kieu === 'tron') veTron(page, font, h, nd);
  else if (nd.kieu === 'nhom') veNhom(page, font, h, nd, false);
  else if (nd.kieu === 'chong') veNhom(page, font, h, nd, true);
  else if (nd.kieu === 'duong') veDuong(page, font, h, nd);
  else if (nd.kieu === 'bang') veBangO(page, font, h, nd);
  else veThe(page, font, h, nd);
}

function veChan(page: PDFPage, font: PDFFont, thu: number, tong: number, chot: string, laDau: boolean) {
  const text = `Trang ${thu}/${tong}  ·  Chốt ${ngay(chot)}  ·  ${laDau ? 'trang biểu đồ' : 'trang danh sách'}`;
  chu(page, font, text, 8 * MM, 3.2 * MM, 6, PHU);
}

function veDanhSach(pdf: PDFDocument, font: PDFFont, du: DuLieuMau) {
  const le = 8 * MM;
  const rowH = 4.6 * MM;
  const chan = 8 * MM;
  const bang = du.sau;
  const cot = bang.cot;
  const rong = rongCot(cot, PAGE_W - le * 2, font);
  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - le;

  function dauTrang(laDau: boolean) {
    if (laDau) {
      chu(page, font, bang.tieu, le, y - 4 * MM, 9, NAVY);
      chu(page, font, `${bang.dong.length} dòng · file riêng, không nằm trong bản tổng hợp`, le, y - 8 * MM, 6, PHU);
      y -= 11 * MM;
    }
    veHang(page, font, cot, rong, le, y - 3 * MM, 6, NAVY);
    page.drawLine({ start: { x: le, y: y - 4.5 * MM }, end: { x: PAGE_W - le, y: y - 4.5 * MM }, thickness: 0.4, color: VIEN });
    y -= 6 * MM;
  }

  dauTrang(true);
  const dong = bang.dong.length ? bang.dong : [['Không có dòng']];
  for (const hang of dong) {
    if (y - rowH < chan) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - le;
      dauTrang(false);
    }
    veHang(page, font, hang, rong, le, y - 3.2 * MM, 6, CHU);
    y -= rowH;
  }
}

export async function lapPdfMau(du: DuLieuMau, fontBytes: Uint8Array, phan: 'tong-hop' | 'danh-sach' = 'tong-hop'): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  if (phan === 'tong-hop') {
    const page = pdf.addPage([PAGE_W, PAGE_H]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: NEN });
    for (const o of KHUNG[du.id]) veO(page, font, o, du.o[o.id]);
  } else {
    veDanhSach(pdf, font, du);
  }
  const pages = pdf.getPages();
  pages.forEach((p, i) => veChan(p, font, i + 1, pages.length, du.ngayChot, phan === 'tong-hop'));
  return pdf.save();
}

export async function xuatMau(du: DuLieuMau, phan: 'tong-hop' | 'danh-sach'): Promise<{ bytes: Uint8Array; tenFile: string }> {
  const fontBytes = await taiFontArial();
  const bytes = await lapPdfMau(du, fontBytes, phan);
  const hau = phan === 'tong-hop' ? 'tong-hop' : 'danh-sach';
  return { bytes, tenFile: `${du.id}-${du.ngayChot}-${hau}-16-9.pdf` };
}
