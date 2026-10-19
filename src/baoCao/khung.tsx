import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './baoCao.css';

export const RONG_TRANG = 1400;

/** Mở hộp thoại In của trình duyệt với báo cáo đang dựng; trả về cờ đang in và hàm bắt đầu in. */
export function useInBaoCao() {
  const [dangIn, setDangIn] = useState(false);
  useEffect(() => {
    if (!dangIn) return;
    const html = document.documentElement;
    html.classList.add('bc-dang-in');
    const xong = () => setDangIn(false);
    window.addEventListener('afterprint', xong);
    // Chờ 2 khung hình để biểu đồ trong cổng in vẽ xong rồi mới gọi print
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => window.print());
    });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('afterprint', xong);
      html.classList.remove('bc-dang-in');
    };
  }, [dangIn]);
  return { dangIn, batDauIn: () => setDangIn(true) };
}

/** Gắn báo cáo thẳng vào body để khi in không bị khung cuộn của app cắt mất. */
export function CongIn({ children }: { children: ReactNode }) {
  return createPortal(<div className="bc-cong-in">{children}</div>, document.body);
}

/** Xem trước: thu nhỏ trang rộng 1400px cho vừa khung. */
export function XemTruoc({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ti, setTi] = useState(0.6);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTi(Math.min(1, (el.clientWidth - 24) / RONG_TRANG)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="h-full overflow-auto rounded-xl bg-[#e6ebf0] p-3">
      <div style={{ zoom: ti }} className="mx-auto w-fit shadow-[0_2px_12px_rgba(16,39,63,0.15)]">
        {children}
      </div>
    </div>
  );
}

export function DauTrang({ nhan, tieu, phu, ky }: { nhan: string; tieu: string; phu?: string; ky: string }) {
  return (
    <div className="bc-dau">
      <div className="bc-dau-trong">
        <div>
          <div className="bc-eyebrow">{nhan}</div>
          <h1>{tieu}</h1>
          {phu ? <div className="bc-phu">{phu}</div> : null}
        </div>
        <div className="bc-ky">
          <i />
          <span>Kỳ báo cáo:</span>
          {ky}
        </div>
      </div>
    </div>
  );
}

export function TieuMuc({ so, tieu, tag }: { so: number; tieu: string; tag?: string }) {
  return (
    <div className="bc-muc">
      <b>{so}</b>
      <h2>{tieu}</h2>
      {tag ? <span className="bc-tag">{tag}</span> : null}
    </div>
  );
}

export function ChuGiai({ ds, tong }: { ds: { ten: string; mau: string; v: number; hien: string }[]; tong: number }) {
  return (
    <div className="bc-chu-giai">
      {ds.map((d) => (
        <div key={d.ten}>
          <i style={{ background: d.mau }} />
          <span>{d.ten}</span>
          <strong className="so">{d.hien}</strong>
          <em className="so">{tong > 0 ? `${((d.v / tong) * 100).toFixed(1)}%` : '—'}</em>
        </div>
      ))}
    </div>
  );
}

/** Số tỷ đồng, trục biểu đồ. */
export function tyTruc(v: number) {
  return (v / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
}
