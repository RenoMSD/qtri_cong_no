export const TEN_CONG_TY = 'CÔNG TY CỔ PHẦN XUẤT NHẬP KHẨU HÓA CHẤT TÂN PHÚ CƯỜNG';

export type KhoGiay = 'A4_NGANG' | 'A4_DOC' | 'A3_NGANG' | 'A3_DOC';

export async function taiFontArial(): Promise<Uint8Array> {
  const urls = ['/api/font/arial.ttf', '/font/BeVietnamPro-Regular.ttf'];
  for (const url of urls) {
    const res = await fetch(url);
    if (res.ok) return new Uint8Array(await res.arrayBuffer());
  }
  throw new Error('Không đọc được font để xuất PDF.');
}
