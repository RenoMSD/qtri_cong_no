import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { TEN_CONG_TY, taiFontArial } from './lib/chung';
import { addDays, type ChungTu, type Khach, type KyMeta } from './lib/metrics';
import { docSoTien, dong, ngay } from './format';

// Văn bản gửi khách: biên bản đối chiếu công nợ và thư nhắc thanh toán, khổ A4 dọc

const W = 595.28;
const H = 841.89;
const LE = 50;
const RONG = W - LE * 2;
const CHU = rgb(0.09, 0.13, 0.17);
const PHU = rgb(0.4, 0.45, 0.5);
const VIEN = rgb(0.75, 0.79, 0.83);
const NEN_DAU = rgb(0.91, 0.95, 0.98);

function sach(s: string): string {
  return (s || '').replace(/[–—]/g, '-').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
}

type Cot = { ten: string; rong: number; phai?: boolean };

class Trang {
  page!: PDFPage;
  y = 0;
  soTrang = 0;

  constructor(private doc: PDFDocument, private font: PDFFont, private chanTrang: string) {
    this.moi();
  }

  moi() {
    this.page = this.doc.addPage([W, H]);
    this.soTrang += 1;
    this.y = H - LE;
    this.page.drawText(sach(`${this.chanTrang} · Trang ${this.soTrang}`), { x: LE, y: 24, size: 7, font: this.font, color: PHU });
  }

  canCho(cao: number) {
    if (this.y - cao < LE) this.moi();
  }

  rongChu(s: string, size: number) {
    return this.font.widthOfTextAtSize(sach(s), size);
  }

  cat(s: string, size: number, rong: number): string {
    const t = sach(s);
    if (this.rongChu(t, size) <= rong) return t;
    let lo = 0;
    let hi = t.length;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.rongChu(`${t.slice(0, mid)}...`, size) <= rong) lo = mid;
      else hi = mid - 1;
    }
    return `${t.slice(0, lo)}...`;
  }

  viet(s: string, x: number, y: number, size: number, mau = CHU) {
    const t = sach(s);
    if (t) this.page.drawText(t, { x, y, size, font: this.font, color: mau });
  }

  /** Đoạn văn tự xuống dòng, canh trái hoặc giữa. */
  doan(s: string, size = 10, opts: { giua?: boolean; mau?: ReturnType<typeof rgb>; x?: number; rong?: number; cach?: number } = {}) {
    const x0 = opts.x ?? LE;
    const rong = opts.rong ?? RONG;
    const dongs: string[] = [];
    let hien = '';
    for (const tu of sach(s).split(' ')) {
      const thu = hien ? `${hien} ${tu}` : tu;
      if (this.rongChu(thu, size) > rong && hien) {
        dongs.push(hien);
        hien = tu;
      } else hien = thu;
    }
    if (hien) dongs.push(hien);
    const cao = size * 1.45;
    for (const d of dongs) {
      this.canCho(cao);
      this.y -= cao;
      const x = opts.giua ? x0 + (rong - this.rongChu(d, size)) / 2 : x0;
      this.viet(d, x, this.y, size, opts.mau);
    }
    this.y -= opts.cach ?? 4;
  }

  bang(cot: Cot[], dong: string[][], opts: { dongCuoi?: string[] } = {}) {
    const size = 8;
    const cao = 16;
    const tong = cot.reduce((s, c) => s + c.rong, 0);
    const rong = cot.map((c) => (c.rong / tong) * RONG);
    const veDong = (o: string[], nen?: ReturnType<typeof rgb>) => {
      this.canCho(cao);
      this.y -= cao;
      let x = LE;
      if (nen) this.page.drawRectangle({ x: LE, y: this.y, width: RONG, height: cao, color: nen });
      this.page.drawLine({ start: { x: LE, y: this.y }, end: { x: LE + RONG, y: this.y }, thickness: 0.4, color: VIEN });
      o.forEach((gia, i) => {
        const t = this.cat(gia, size, rong[i] - 6);
        const tx = cot[i].phai ? x + rong[i] - 3 - this.rongChu(t, size) : x + 3;
        this.viet(t, tx, this.y + 5, size);
        x += rong[i];
      });
    };
    const dau = () => veDong(cot.map((c) => c.ten), NEN_DAU);
    this.canCho(cao * 2);
    dau();
    for (const d of dong) {
      if (this.y - cao < LE) {
        this.moi();
        dau();
      }
      veDong(d);
    }
    if (opts.dongCuoi) veDong(opts.dongCuoi, NEN_DAU);
    this.y -= 8;
  }

  /** Hai khối chữ ký song song. */
  chuKy(trai: string[], phai: string[]) {
    this.canCho(110);
    const nua = RONG / 2;
    const ve = (dongs: string[], x: number) => {
      let y = this.y;
      dongs.forEach((d, i) => {
        y -= 14;
        const size = i === 0 ? 10 : 8;
        this.viet(d, x + (nua - this.rongChu(d, size)) / 2, y, size, i === 0 ? CHU : PHU);
      });
    };
    ve(trai, LE);
    ve(phai, LE + nua);
    this.y -= 110;
  }
}

async function taoDoc() {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(await taiFontArial(), { subset: true });
  return { doc, font };
}

function dauVanBan(t: Trang, tieu: string, phu: string) {
  t.doan(TEN_CONG_TY, 9, { mau: PHU, cach: 0 });
  t.doan('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 10, { giua: true, cach: 0 });
  t.doan('Độc lập - Tự do - Hạnh phúc', 9, { giua: true, cach: 14 });
  t.doan(tieu, 15, { giua: true, cach: 2 });
  t.doan(phu, 9, { giua: true, mau: PHU, cach: 14 });
}

function tenFile(loai: string, kh: Khach, meta: KyMeta) {
  return `${loai}_${kh.maKH}_${meta.ngayChot.replace(/-/g, '')}.pdf`;
}

function theoNgay(a: ChungTu, b: ChungTu) {
  return (a.ngayCt ?? '').localeCompare(b.ngayCt ?? '');
}

export async function xuatBienBanDoiChieu(kh: Khach, tenHien: string, meta: KyMeta) {
  const { doc, font } = await taoDoc();
  const t = new Trang(doc, font, `Biên bản đối chiếu công nợ ${kh.maKH} · chốt ${ngay(meta.ngayChot)}`);
  dauVanBan(t, 'BIÊN BẢN ĐỐI CHIẾU CÔNG NỢ', `Từ ngày ${ngay(meta.tuNgay)} đến ngày ${ngay(meta.ngayChot)}`);

  t.doan(`Bên A (bên bán): ${TEN_CONG_TY}`, 10, { cach: 0 });
  t.doan(`Bên B (bên mua): ${tenHien}${tenHien === kh.maKH ? '' : ` (mã ${kh.maKH})`}`, 10, { cach: 0 });
  if (kh.khuVuc) t.doan(`Khu vực: ${kh.khuVuc}`, 9, { mau: PHU, cach: 0 });
  t.doan('Hai bên cùng đối chiếu số liệu công nợ phát sinh trong kỳ như sau:', 10, { cach: 8 });

  t.bang(
    [{ ten: 'Chỉ tiêu', rong: 3 }, { ten: 'Số tiền (đồng)', rong: 2, phai: true }],
    [
      ['Dư nợ đầu kỳ', dong(kh.duDauKy)],
      ['Phát sinh tăng trong kỳ (hàng đã giao)', dong(kh.tienNo)],
      ['Đã thanh toán trong kỳ', dong(kh.tienTT)],
    ],
    { dongCuoi: ['Dư nợ cuối kỳ', dong(kh.duNo)] },
  );

  const cts = kh.chungTu
    .filter((c) => c.tienNo !== 0 || c.tienTT !== 0 || c.duCuoiKy !== 0 || c.duDauKy !== 0)
    .sort(theoNgay);
  t.doan('Chi tiết chứng từ:', 10, { cach: 4 });
  t.bang(
    [
      { ten: 'STT', rong: 0.5 },
      { ten: 'Ngày CT', rong: 1.1 },
      { ten: 'Số HĐ / CT', rong: 1.3 },
      { ten: 'Diễn giải', rong: 2.4 },
      { ten: 'Phát sinh', rong: 1.4, phai: true },
      { ten: 'Thanh toán', rong: 1.4, phai: true },
      { ten: 'Còn lại', rong: 1.4, phai: true },
    ],
    cts.map((c, i) => [
      String(i + 1),
      ngay(c.ngayCt),
      c.soHD || c.soCt || '—',
      c.dienGiai || c.loaiCt || '',
      dong(c.tienNo),
      dong(c.tienTT),
      dong(c.duCuoiKy),
    ]),
    { dongCuoi: ['', '', '', 'Cộng', dong(kh.tienNo), dong(kh.tienTT), dong(kh.duNo)] },
  );

  t.doan(
    `Đến ngày ${ngay(meta.ngayChot)}, Bên B còn nợ Bên A số tiền: ${dong(kh.duNo)} đồng (Bằng chữ: ${docSoTien(kh.duNo)}).`,
    10,
    { cach: 6 },
  );
  t.doan(
    'Đề nghị Bên B kiểm tra, ký xác nhận và gửi lại cho Bên A trong vòng 07 ngày kể từ ngày nhận biên bản. Nếu có chênh lệch, xin ghi rõ số liệu và chứng từ kèm theo. Quá thời hạn trên mà Bên A không nhận được phản hồi, số liệu trong biên bản được xem là đã được hai bên thống nhất.',
    9,
    { mau: PHU, cach: 18 },
  );
  t.chuKy(
    ['ĐẠI DIỆN BÊN A', '(Ký, ghi rõ họ tên, đóng dấu)'],
    ['ĐẠI DIỆN BÊN B', '(Ký, ghi rõ họ tên, đóng dấu)'],
  );

  return { bytes: await doc.save(), tenFile: tenFile('BienBanDoiChieu', kh, meta) };
}

export async function xuatThuNhacNo(kh: Khach, tenHien: string, meta: KyMeta) {
  const { doc, font } = await taoDoc();
  const t = new Trang(doc, font, `Thư nhắc thanh toán ${kh.maKH} · ${ngay(meta.ngayChot)}`);
  dauVanBan(t, 'THƯ NHẮC THANH TOÁN', `Ngày ${ngay(meta.ngayChot)}`);

  const quaHan = kh.chungTu.filter((c) => c.soNgayQH > 0 && c.duCuoiKy > 0).sort(theoNgay);
  const hanCuoi = addDays(meta.ngayChot, 7);

  t.doan(`Kính gửi: ${tenHien}${tenHien === kh.maKH ? '' : ` (mã ${kh.maKH})`}`, 11, { cach: 8 });
  t.doan(
    `${TEN_CONG_TY} trân trọng cảm ơn Quý khách đã tin tưởng hợp tác trong thời gian qua. Theo sổ sách của chúng tôi, đến ngày ${ngay(meta.ngayChot)} Quý khách có ${quaHan.length} hóa đơn đã quá hạn thanh toán với tổng số tiền ${dong(kh.quaHan)} đồng (Bằng chữ: ${docSoTien(kh.quaHan)}), chi tiết như sau:`,
    10,
    { cach: 8 },
  );
  t.bang(
    [
      { ten: 'STT', rong: 0.5 },
      { ten: 'Số HĐ / CT', rong: 1.4 },
      { ten: 'Ngày HĐ', rong: 1.1 },
      { ten: 'Hạn thanh toán', rong: 1.2 },
      { ten: 'Số ngày quá hạn', rong: 1.1, phai: true },
      { ten: 'Số tiền còn nợ', rong: 1.6, phai: true },
    ],
    quaHan.map((c, i) => [
      String(i + 1),
      c.soHD || c.soCt || '—',
      ngay(c.ngayCt),
      c.ngayCt ? ngay(addDays(c.ngayCt, c.hanTT ?? 0)) : '—',
      dong(c.soNgayQH),
      dong(c.duCuoiKy),
    ]),
    { dongCuoi: ['', '', '', '', 'Cộng', dong(kh.quaHan)] },
  );
  t.doan(`Tổng dư nợ hiện tại của Quý khách (gồm cả khoản chưa đến hạn): ${dong(kh.duNo)} đồng.`, 10, { cach: 6 });
  const traTruoc = kh.chungTu.reduce((s, c) => s + (c.duCuoiKy < 0 ? c.duCuoiKy : 0), 0);
  if (traTruoc < 0) {
    t.doan(`Khoản Quý khách đã trả trước hoặc trả thừa ${dong(-traTruoc)} đồng sẽ được cấn trừ khi đối chiếu.`, 10, { cach: 6 });
  }
  t.doan(
    `Kính đề nghị Quý khách thu xếp thanh toán số tiền quá hạn trước ngày ${ngay(hanCuoi)} theo thông tin tài khoản trong hợp đồng. Nếu Quý khách đã thanh toán, xin vui lòng bỏ qua thư này và gửi chứng từ để chúng tôi đối chiếu.`,
    10,
    { cach: 6 },
  );
  t.doan(
    `Mọi thắc mắc xin liên hệ nhân viên phụ trách${kh.sale && kh.sale !== 'Chưa gán' ? `: ${kh.sale}` : ''}. Trân trọng cảm ơn sự hợp tác của Quý khách.`,
    10,
    { cach: 18 },
  );
  t.chuKy([''], [TEN_CONG_TY.length > 40 ? 'TM. CÔNG TY' : TEN_CONG_TY, '(Ký, ghi rõ họ tên, đóng dấu)']);

  return { bytes: await doc.save(), tenFile: tenFile('ThuNhacNo', kh, meta) };
}
