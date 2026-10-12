import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { TEN_CONG_TY, taiFontArial, type KhoGiay } from './lib/chung';
import { ngay } from './format';
import { THANG_DIEM, thangDiem } from './mauDiem';
import { soBoTest } from './boTest';
import { LOAI_TEN, soKhoi, type Chon, type LoaiDash, type PhamVi, type SoKhoi } from './soLieu';

const MM = 72 / 25.4;
const INK = rgb(0.07, 0.1, 0.16);
const MUTED = rgb(0.35, 0.4, 0.48);
const LINE = rgb(0.82, 0.85, 0.89);
const BLUE = rgb(0, 0.45, 0.9);
const TEAL = rgb(0.08, 0.55, 0.5);
const RED = rgb(0.72, 0.11, 0.11);
const MAU_PDF = [BLUE, TEAL, rgb(0.13, 0.7, 0.4), rgb(0.55, 0.65, 0.1), rgb(0.9, 0.55, 0.1), rgb(0.85, 0.25, 0.2), RED];

const KHO: Record<KhoGiay, { w: number; h: number; ten: string }> = {
  A4_DOC: { w: 210 * MM, h: 297 * MM, ten: 'A4-doc' },
  A4_NGANG: { w: 297 * MM, h: 210 * MM, ten: 'A4-ngang' },
  A3_DOC: { w: 297 * MM, h: 420 * MM, ten: 'A3-doc' },
  A3_NGANG: { w: 420 * MM, h: 297 * MM, ten: 'A3-ngang' },
};

function mauHex(hex: string): [number, number, number] {
  const n = hex.replace('#', '');
  return [parseInt(n.slice(0, 2), 16) / 255, parseInt(n.slice(2, 4), 16) / 255, parseInt(n.slice(4, 6), 16) / 255];
}

function sach(s: string): string {
  return s.replace(/\u2013|\u2014/g, '-').replace(/\s+/g, ' ').trim();
}

class Ve {
  pdf: PDFDocument;
  font: PDFFont;
  page!: PDFPage;
  pageW: number;
  pageH: number;
  margin = 12 * MM;
  y = 0;
  tieu: string;

  constructor(pdf: PDFDocument, font: PDFFont, pageW: number, pageH: number, tieu: string) {
    this.pdf = pdf;
    this.font = font;
    this.pageW = pageW;
    this.pageH = pageH;
    this.tieu = tieu;
    this.trangMoi();
  }

  rong() {
    return this.pageW - this.margin * 2;
  }

  trangMoi() {
    this.page = this.pdf.addPage([this.pageW, this.pageH]);
    this.y = this.pageH - this.margin;
    this.dong(TEN_CONG_TY, 9, INK);
    this.dong(this.tieu, 8, MUTED);
    this.y -= 6;
    this.page.drawLine({
      start: { x: this.margin, y: this.y },
      end: { x: this.pageW - this.margin, y: this.y },
      thickness: 0.6,
      color: LINE,
    });
    this.y -= 12;
  }

  damBao(h: number) {
    if (this.y - h < this.margin) this.trangMoi();
  }

  ngat(s: string, size: number, rong: number): string[] {
    const words = sach(s || '').split(' ').filter(Boolean);
    if (words.length === 0) return [''];
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (this.font.widthOfTextAtSize(next, size) > rong && cur) {
        lines.push(cur);
        cur = w;
      } else cur = next;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  dong(s: string, size: number, color = INK) {
    for (const line of this.ngat(s, size, this.rong())) {
      this.damBao(size + 3);
      this.page.drawText(line, { x: this.margin, y: this.y - size, size, font: this.font, color });
      this.y -= size + 3;
    }
  }

  tieuKhoi(s: string) {
    this.damBao(16);
    this.page.drawText(sach(s).slice(0, 180), {
      x: this.margin,
      y: this.y - 11,
      size: 11,
      font: this.font,
      color: INK,
    });
    this.y -= 16;
  }

  soNgan(n: number): string {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(n / 1e9);
  }

  nhanGia(v: number, hien: string): string {
    if (Math.abs(v) >= 1_000_000) return this.soNgan(v);
    return hien || this.soNgan(v);
  }

  nhanTruc(van: string, x: number, slot: number, day: number) {
    const size = 6;
    const dong = this.ngat(van, size, Math.max(10, slot - 2)).slice(0, 3);
    dong.forEach((line, i) => {
      const w = this.font.widthOfTextAtSize(line, size);
      this.page.drawText(line, {
        x: x + Math.max(0, (slot - w) / 2),
        y: day - 12 - i * 8,
        size,
        font: this.font,
        color: MUTED,
      });
    });
  }

  cot(d: { n: string; v: number; hien: string }[]) {
    if (d.length === 0) {
      this.dong('Chưa có số.', 9, MUTED);
      return;
    }
    const cao = 128;
    const chan = 40;
    this.damBao(cao + chan);
    const day = this.y - cao;
    const n = d.length;
    const slot = this.rong() / n;
    const max = Math.max(...d.map((x) => Math.abs(x.v)), 1);
    this.page.drawLine({
      start: { x: this.margin, y: day },
      end: { x: this.pageW - this.margin, y: day },
      thickness: 0.6,
      color: LINE,
    });
    d.forEach((item, i) => {
      const am = item.v < 0;
      const h = (Math.abs(item.v) / max) * (cao - 22);
      const bw = Math.max(4, Math.min(22, slot * 0.62));
      const x = this.margin + i * slot + (slot - bw) / 2;
      this.page.drawRectangle({
        x,
        y: am ? day - Math.max(h, 0.4) : day,
        width: bw,
        height: Math.max(h, 0.4),
        color: am ? RED : MAU_PDF[i % MAU_PDF.length],
      });
      const so = this.nhanGia(item.v, item.hien);
      const sw = this.font.widthOfTextAtSize(so, 7);
      const ySo = am ? day - h - 9 : day + h + 3;
      this.page.drawText(so, { x: this.margin + i * slot + (slot - sw) / 2, y: ySo, size: 7, font: this.font, color: INK });
      this.nhanTruc(item.n, this.margin + i * slot, slot, day);
    });
    this.y = day - chan;
  }

  haiCot(d: { n: string; a: number; b: number }[], tenA: string, tenB: string) {
    if (d.length === 0) {
      this.dong('Chưa có số.', 9, MUTED);
      return;
    }
    this.dong(`${tenA} (xanh) · ${tenB} (lục). Số trên cột, đơn vị tỷ đồng.`, 8, MUTED);
    const cao = 128;
    const chan = 36;
    this.damBao(cao + chan);
    const day = this.y - cao;
    const slot = this.rong() / d.length;
    const max = Math.max(...d.flatMap((x) => [Math.abs(x.a), Math.abs(x.b)]), 1);
    this.page.drawLine({
      start: { x: this.margin, y: day },
      end: { x: this.pageW - this.margin, y: day },
      thickness: 0.6,
      color: LINE,
    });
    d.forEach((item, i) => {
      const bw = Math.max(3, Math.min(10, slot * 0.28));
      const x0 = this.margin + i * slot + slot / 2 - bw - 1;
      for (const [gia, mau, lech] of [
        [item.a, BLUE, 0],
        [item.b, TEAL, bw + 2],
      ] as const) {
        const h = (Math.abs(gia) / max) * (cao - 22);
        const x = x0 + lech;
        this.page.drawRectangle({ x, y: day, width: bw, height: Math.max(h, 0.4), color: mau });
        const so = this.soNgan(gia);
        const sw = this.font.widthOfTextAtSize(so, 6);
        this.page.drawText(so, { x: x + bw / 2 - sw / 2, y: day + h + 2, size: 6, font: this.font, color: INK });
      }
      this.nhanTruc(item.n, this.margin + i * slot, slot, day);
    });
    this.y = day - chan;
  }

  mien(d: { n: string; a: number; b: number }[], tenA: string, tenB: string) {
    if (d.length === 0) {
      this.dong('Chưa có số.', 9, MUTED);
      return;
    }
    this.dong(`${tenA} (xanh) · ${tenB} (lục). Số tại mốc, đơn vị tỷ đồng.`, 8, MUTED);
    const cao = 120;
    const chan = 36;
    this.damBao(cao + chan);
    const day = this.y - cao;
    const slot = this.rong() / Math.max(d.length - 1, 1);
    const max = Math.max(...d.flatMap((x) => [Math.abs(x.a), Math.abs(x.b)]), 1);
    const diem = (v: number, i: number) => ({
      x: this.margin + i * slot,
      y: day + (Math.abs(v) / max) * (cao - 20),
    });
    const veDay = (key: 'a' | 'b', mau: ReturnType<typeof rgb>) => {
      for (let i = 1; i < d.length; i += 1) {
        const p0 = diem(d[i - 1][key], i - 1);
        const p1 = diem(d[i][key], i);
        this.page.drawLine({ start: p0, end: p1, thickness: 1.4, color: mau });
      }
      d.forEach((item, i) => {
        const p = diem(item[key], i);
        this.page.drawCircle({ x: p.x, y: p.y, size: 2, color: mau });
        this.page.drawText(this.soNgan(item[key]), { x: p.x - 6, y: p.y + (key === 'a' ? 4 : -10), size: 6, font: this.font, color: INK });
      });
    };
    veDay('a', BLUE);
    veDay('b', TEAL);
    d.forEach((item, i) => {
      this.nhanTruc(item.n, Math.max(this.margin, this.margin + i * slot - slot / 2), slot, day);
    });
    this.y = day - chan;
  }

  tron(d: { n: string; v: number; hien: string }[]) {
    const duong = d.filter((x) => x.v > 0);
    if (duong.length === 0) {
      this.dong('Chưa có số.', 9, MUTED);
      return;
    }
    const tong = duong.reduce((s, x) => s + x.v, 0);
    const r = 52;
    this.damBao(r * 2 + 16);
    const cx = this.margin + r + 8;
    const cy = this.y - r - 4;
    let goc = Math.PI / 2;
    duong.forEach((item, i) => {
      const buoc = (item.v / tong) * Math.PI * 2;
      const a1 = goc - buoc;
      const buocNho = Math.max(8, Math.ceil(buoc / (Math.PI / 16)));
      let path = `M ${cx} ${cy}`;
      for (let s = 0; s <= buocNho; s += 1) {
        const a = goc - (buoc * s) / buocNho;
        path += ` L ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
      }
      path += ' Z';
      this.page.drawSvgPath(path, { color: MAU_PDF[i % MAU_PDF.length] });
      goc = a1;
    });
    this.y = cy - r - 12;
    duong.forEach((item) => {
      const pct = tong > 0 ? (item.v / tong) * 100 : 0;
      this.dong(`${item.n}: ${item.hien} (${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(pct)}%)`, 8);
    });
  }

  cotDiem(d: { n: string; v: number; hien: string }[]) {
    if (d.length === 0) {
      this.dong('Chưa có thành phần điểm.', 9, MUTED);
      return;
    }
    const khoang = 18;
    this.damBao(d.length * khoang + 4);
    const rongCot = this.rong() * 0.36;
    d.forEach((item) => {
      const bac = Math.min(5, Math.max(1, Math.round(item.v || 0)));
      const mau = item.v > 0 ? thangDiem(bac) : null;
      this.page.drawText(sach(item.n).slice(0, 32), { x: this.margin, y: this.y - 11, size: 8, font: this.font, color: INK });
      const x0 = this.margin + this.rong() * 0.5;
      this.page.drawRectangle({ x: x0, y: this.y - 12, width: rongCot, height: 8, color: rgb(0.93, 0.95, 0.97) });
      if (mau && item.v > 0) {
        const w = (Math.min(5, item.v) / 5) * rongCot;
        const [r, g, b] = mauHex(mau.nen);
        this.page.drawRectangle({ x: x0, y: this.y - 12, width: Math.max(w, 1), height: 8, color: rgb(r, g, b) });
      }
      this.page.drawText(item.hien, { x: x0 + rongCot + 6, y: this.y - 11, size: 8, font: this.font, color: INK });
      this.y -= khoang;
    });
  }

  bangNguong(mucDang: number | null) {
    this.damBao(16 + THANG_DIEM.length * 16);
    this.tieuKhoi('Ngưỡng cảnh báo hạn mức');
    const cot = [this.rong() * 0.16, this.rong() * 0.34, this.rong() * 0.5];
    const dau = ['Ngưỡng', 'Giá trị (%)', 'Hành động'];
    dau.forEach((c, i) => {
      const x = this.margin + cot.slice(0, i).reduce((s, n) => s + n, 0);
      this.page.drawRectangle({ x, y: this.y - 14, width: cot[i], height: 14, color: BLUE });
      this.page.drawText(c, { x: x + 4, y: this.y - 10, size: 8, font: this.font, color: rgb(1, 1, 1) });
    });
    this.y -= 14;
    for (const t of THANG_DIEM) {
      const [r, g, b] = mauHex(t.nen);
      const [cr, cg, cb] = mauHex(t.chu);
      cot.forEach((w, i) => {
        const x = this.margin + cot.slice(0, i).reduce((s, n) => s + n, 0);
        this.page.drawRectangle({ x, y: this.y - 16, width: w, height: 16, color: rgb(r, g, b) });
      });
      const chu = [String(t.muc), t.gia, t.hanh];
      chu.forEach((c, i) => {
        const x = this.margin + cot.slice(0, i).reduce((s, n) => s + n, 0);
        const dam = mucDang === t.muc ? `${c} *` : c;
        this.page.drawText(dam, { x: x + 4, y: this.y - 11, size: 8, font: this.font, color: rgb(cr, cg, cb) });
      });
      this.y -= 16;
    }
    if (mucDang != null) this.dong('Dấu * là ngưỡng của khách đang in.', 8, MUTED);
  }

  khoi(so: SoKhoi) {
    if (so.loai === 'bang') {
      this.bang(so);
      this.y -= 8;
      return;
    }
    this.damBao(Math.min(this.uoc(so), this.pageH - this.margin * 2 - 40));
    if (so.loai === 'kpi') {
      this.tieuKhoi(so.tieu);
      if (so.o.length === 4) {
        const slotW = (this.rong() - 18) / 4;
        const boxH = 32;
        const yTop = this.y - boxH;
        so.o.forEach((item, i) => {
          const x0 = this.margin + i * (slotW + 6);
          this.page.drawRectangle({
            x: x0,
            y: yTop,
            width: slotW,
            height: boxH,
            color: rgb(0.96, 0.97, 0.99),
            borderColor: LINE,
            borderWidth: 0.6,
          });
          this.page.drawText(sach(item.n).slice(0, 24), {
            x: x0 + 6,
            y: yTop + boxH - 11,
            size: 7.5,
            font: this.font,
            color: MUTED,
          });
          this.page.drawText(sach(item.v).slice(0, 30), {
            x: x0 + 6,
            y: yTop + 6,
            size: 8.5,
            font: this.font,
            color: BLUE,
          });
        });
        this.y = yTop - 8;
      } else {
        for (let i = 0; i < so.o.length; i += 2) {
          const a = so.o[i];
          const b = so.o[i + 1];
          this.dong(`${a.n}: ${a.v}${b ? `    ${b.n}: ${b.v}` : ''}`, 9);
        }
      }
      if (so.tieu === 'Hạn mức của khách') this.bangNguong(so.o.find((o) => o.muc != null)?.muc ?? null);
    } else if (so.loai === 'cot') {
      this.tieuKhoi(so.tieu);
      if (so.phu) this.dong(so.phu, 8, MUTED);
      this.cot(so.d);
    } else if (so.loai === 'hai') {
      this.tieuKhoi(so.tieu);
      if (so.tieu.includes('lũy kế')) this.mien(so.d, so.a, so.b);
      else this.haiCot(so.d, so.a, so.b);
    } else if (so.loai === 'tron') {
      this.tieuKhoi(so.tieu);
      this.tron(so.d);
    } else if (so.loai === 'radar') {
      this.tieuKhoi(so.tieu);
      this.cotDiem(so.d);
    } else if (so.loai === 'the') {
      this.tieuKhoi(so.tieu);
      if (so.d.length === 0) this.dong('Chưa có dữ liệu.', 9, MUTED);
      if (so.d.length === 4) {
        const slotW = (this.rong() - 18) / 4;
        const boxH = 34;
        const yTop = this.y - boxH;
        so.d.forEach((t, i) => {
          const x0 = this.margin + i * (slotW + 6);
          this.page.drawRectangle({
            x: x0,
            y: yTop,
            width: slotW,
            height: boxH,
            color: rgb(0.96, 0.97, 0.99),
            borderColor: LINE,
            borderWidth: 0.6,
          });
          this.page.drawText(sach(t.ten).slice(0, 24), {
            x: x0 + 6,
            y: yTop + boxH - 12,
            size: 8,
            font: this.font,
            color: INK,
          });
          this.page.drawText(sach(t.dong.join(' · ')).slice(0, 36), {
            x: x0 + 6,
            y: yTop + 6,
            size: 7,
            font: this.font,
            color: BLUE,
          });
        });
        this.y = yTop - 8;
      } else {
        for (const t of so.d) this.dong(`${t.ten} — ${t.dong.join(' · ')}`, 9);
      }
    } else if (so.loai === 'chu') {
      this.tieuKhoi(so.tieu);
      this.dong(so.van.trim() || 'Chưa ghi', 10);
    } else if (so.loai === 'doi') {
      this.tieuKhoi(so.tieu);
      if (so.phu) this.dong(so.phu, 8, MUTED);
      this.dong(so.trai.tieu, 9, MUTED);
      this.cot(so.trai.d);
      this.dong(so.phai.tieu, 9, MUTED);
      this.cot(so.phai.d.map((d) => ({ n: d.n, v: d.v, hien: d.hien })));
    } else {
      this.tieuKhoi(so.tieu);
      this.dong(so.dong, 9, MUTED);
    }
    this.y -= 10;
  }

  uoc(so: SoKhoi): number {
    if (so.loai === 'kpi') return 20 + Math.ceil(so.o.length / 2) * 14 + (so.tieu === 'Hạn mức của khách' ? 130 : 0);
    if (so.loai === 'cot') return 230;
    if (so.loai === 'radar') return 28 + so.d.length * 18;
    if (so.loai === 'tron') return 160 + so.d.length * 12;
    if (so.loai === 'hai') return 190;
    if (so.loai === 'the') return 20 + Math.max(so.d.length, 1) * 14;
    if (so.loai === 'chu') return 20 + this.ngat(so.van.trim() || 'Chưa ghi', 10, this.rong()).length * 13;
    if (so.loai === 'doi') return 380;
    if (so.loai === 'trong') return 36;
    return 40;
  }

  bang(so: Extract<SoKhoi, { loai: 'bang' }>) {
    const uocBang = 36 + Math.min(so.d.length, 10) * 14;
    this.damBao(Math.min(uocBang, this.pageH - this.margin * 2 - 40));
    this.tieuKhoi(so.tieu);
    const n = Math.max(so.c.length, 1);
    const w = this.rong() / n;
    const veDau = () => {
      this.damBao(16);
      so.c.forEach((c, i) => {
        this.page.drawText(sach(c).slice(0, 18), {
          x: this.margin + i * w,
          y: this.y - 10,
          size: 8,
          font: this.font,
          color: MUTED,
        });
      });
      this.y -= 14;
    };
    veDau();
    if (so.d.length === 0) {
      this.dong('Không có dòng.', 9, MUTED);
      return;
    }
    for (const row of so.d) {
      const wrapped = row.map((cell) => this.ngat(String(cell), 8, w - 4));
      const lines = Math.max(...wrapped.map((x) => x.length), 1);
      const rowH = lines * 10 + 4;
      if (this.y - rowH < this.margin) {
        this.trangMoi();
        veDau();
      }
      wrapped.forEach((ls, i) => {
        ls.forEach((line, li) => {
          this.page.drawText(line, {
            x: this.margin + i * w,
            y: this.y - 10 - li * 10,
            size: 8,
            font: this.font,
            color: INK,
          });
        });
      });
      this.y -= rowH;
    }
  }

  soTrang() {
    const pages = this.pdf.getPages();
    pages.forEach((p, i) => {
      p.drawText(`${i + 1}/${pages.length}`, {
        x: this.pageW - this.margin - 30,
        y: 8 * MM,
        size: 8,
        font: this.font,
        color: MUTED,
      });
    });
  }
}

export function tenFileBaoCao(loai: LoaiDash, chon: Chon | null, phamVi: PhamVi, kho: KhoGiay): string {
  const khoTen = KHO[kho].ten;
  if (!chon) return `${loai}-test-${phamVi}-${khoTen}.pdf`;
  if (loai === 'hoso') return `ho-so-${chon.ma?.maKH ?? 'khach'}-${phamVi}-${khoTen}.pdf`;
  const kyTen = loai === 'tuan' ? chon.ky.meta.tuanNhan.replace('/', '-') : chon.ky.meta.ngayChot;
  return `${loai}-${kyTen}-${phamVi}-${khoTen}.pdf`;
}

export async function xuatBaoCao(opts: {
  loai: LoaiDash;
  ids: string[];
  phamVi: PhamVi;
  kho: KhoGiay;
  chon: Chon | null;
}): Promise<{ bytes: Uint8Array; tenFile: string }> {
  const fontBytes = await taiFontArial();
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const { chon, loai, kho } = opts;
  const tieu = chon
    ? `${LOAI_TEN[loai]} · chốt ${ngay(chon.ky.meta.ngayChot)} · ${opts.phamVi === 'loc' ? 'đang lọc' : 'toàn bộ kỳ'}`
    : `${LOAI_TEN[loai]} · bộ test xem màn`;
  const k = KHO[kho];
  const ve = new Ve(pdf, font, k.w, k.h, tieu);
  const ids = opts.ids.length ? opts.ids : ['trong'];
  for (const id of ids) {
    const so = soBoTest(id) ?? (chon ? soKhoi(id, chon) : { loai: 'trong' as const, tieu: id, dong: 'Chưa nạp sổ' });
    ve.khoi(so);
  }
  ve.soTrang();
  const bytes = await pdf.save();
  return { bytes, tenFile: tenFileBaoCao(loai, chon, opts.phamVi, kho) };
}

export function taiXuong(bytes: Uint8Array, ten: string) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = ten;
  a.click();
  URL.revokeObjectURL(url);
}

export const KHUNG_GIAY: Record<KhoGiay, { w: number; h: number; ten: string }> = {
  A4_DOC: { w: 794, h: 1123, ten: 'A4 dọc' },
  A4_NGANG: { w: 1123, h: 794, ten: 'A4 ngang' },
  A3_DOC: { w: 1123, h: 1587, ten: 'A3 dọc' },
  A3_NGANG: { w: 1587, h: 1123, ten: 'A3 ngang' },
};
