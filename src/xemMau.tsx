import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { KHUNG, MAU, TRANG, type DuLieuMau, type Lat, type NoiDung } from './mauIn';
import type { LocMau } from './soLieu';

type LocKhoa = 'sale' | 'khuVuc' | 'nhomKH';

function oStyle(id: string, mauId: DuLieuMau['id']): CSSProperties {
  const o = KHUNG[mauId].find((x) => x.id === id);
  if (!o) return { display: 'none' };
  return {
    position: 'absolute',
    left: `${(o.x / TRANG.rong) * 100}%`,
    top: `${(o.y / TRANG.cao) * 100}%`,
    width: `${(o.w / TRANG.rong) * 100}%`,
    height: `${(o.h / TRANG.cao) * 100}%`,
  };
}

function Cot({ lat, ngang, onChon }: { lat: Lat[]; ngang?: boolean; onChon?: (khoa: string) => void }) {
  const max = Math.max(1, ...lat.map((d) => d.v));
  if (lat.length === 0) return <p className="text-[10px] text-slate-400">Không có số</p>;
  if (ngang) {
    return (
      <div className="flex h-full flex-col justify-between gap-px overflow-hidden">
        {lat.map((d) => (
          <div key={d.ten} className="flex min-h-0 flex-1 items-center gap-1">
            <span className="w-[34%] truncate text-[9px] text-slate-600">{d.ten}</span>
            <span className="h-2 flex-1 rounded-sm bg-slate-100">
              <span className="block h-2 rounded-sm" style={{ width: `${(d.v / max) * 100}%`, background: d.mau }} />
            </span>
            <span className="w-[22%] truncate text-right text-[8px] text-slate-500">{d.hien}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex h-full items-end gap-1">
      {lat.map((d) => (
        <button key={d.ten} type="button" className="flex h-full min-w-0 flex-1 flex-col" onClick={() => d.khoa != null && onChon?.(d.khoa)}>
          <span className="truncate text-center text-[8px] text-slate-700">{d.hien}</span>
          <span className="flex min-h-0 flex-1 items-end justify-center">
            <span className="w-2.5 max-w-[45%] rounded-t-sm" style={{ height: `${Math.max(6, (d.v / max) * 100)}%`, background: d.mau }} />
          </span>
          <span className="truncate text-center text-[8px] text-slate-500">{d.ten}</span>
        </button>
      ))}
    </div>
  );
}

function Tron({ lat, onChon }: { lat: Lat[]; onChon?: (khoa: string) => void }) {
  const ds = lat.filter((d) => d.v > 0);
  const tong = ds.reduce((s, d) => s + d.v, 0);
  if (tong <= 0) return <p className="text-[10px] text-slate-400">Không có số</p>;
  let goc = 0;
  const stops = ds.map((d) => {
    const a = goc;
    goc += (d.v / tong) * 360;
    return `${d.mau} ${a}deg ${goc}deg`;
  });
  return (
    <div className="flex h-full items-center gap-2 overflow-hidden">
      <div className="h-16 w-16 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops.join(',')})` }} />
      <ul className="min-w-0 flex-1 space-y-0.5">
        {ds.map((d) => (
          <li key={d.ten}>
            <button type="button" className="flex w-full items-center gap-1 text-left text-[9px]" onClick={() => d.khoa != null && onChon?.(d.khoa)}>
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: d.mau }} />
              <span className="truncate">{d.ten}</span>
              <span className="ml-auto shrink-0 text-slate-500">{d.hien}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function nhanCot(v: number): string {
  if (Math.abs(v) >= 1e6) return (v / 1e9).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return String(Math.round(v));
}

function NhomCot({ nhom, series, chong, onChon }: { nhom: string[]; series: { ten: string; mau: string; v: number[] }[]; chong?: boolean; onChon?: (ten: string) => void }) {
  if (nhom.length === 0) return <p className="text-[10px] text-slate-400">Không có chuỗi tháng</p>;
  const chuThich = (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
      {series.map((s) => (
        <span key={s.ten} className="text-[8px] text-slate-500"><span className="mr-0.5 inline-block h-2 w-2" style={{ background: s.mau }} />{s.ten}</span>
      ))}
    </div>
  );
  if (chong) {
    return (
      <div className="flex h-full flex-col gap-1">
        <div className="flex min-h-0 flex-1 flex-col justify-between">
          {nhom.map((ten, i) => {
            const tong = series.reduce((s, ser) => s + Math.max(0, ser.v[i] || 0), 0);
            return (
              <button key={ten} type="button" className="flex min-h-0 flex-1 items-center gap-1" onClick={() => onChon?.(ten)}>
                <span className="w-[24%] truncate text-left text-[9px] text-slate-700">{ten}</span>
                <span className="flex h-2.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-slate-100">
                  {series.map((ser) => (
                    <span key={ser.ten} className="h-full" style={{ flexGrow: Math.max(0, ser.v[i] || 0), background: ser.mau }} />
                  ))}
                </span>
                <span className="w-7 shrink-0 text-right text-[9px] text-slate-700">{Math.round(tong)}</span>
              </button>
            );
          })}
        </div>
        {chuThich}
      </div>
    );
  }
  const dinh = Math.max(1, ...series.flatMap((ser) => ser.v.map((v) => Math.abs(v))));
  return (
    <div className="flex h-full flex-col">
      {chuThich}
      <div className="mt-0.5 flex min-h-0 flex-1 items-end gap-1">
        {nhom.map((ten, i) => (
          <div key={ten} className="flex h-full min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 items-end justify-center gap-px">
              {series.map((ser) => {
                const v = Math.abs(ser.v[i] || 0);
                return (
                  <span key={ser.ten} className="flex h-full w-3 max-w-[40%] flex-col justify-end">
                    <span className="truncate text-center text-[7px] leading-none text-slate-600">{v > 0 ? nhanCot(ser.v[i] || 0) : ''}</span>
                    <span className="mt-px w-full rounded-t-sm" style={{ height: `${Math.max(v > 0 ? 4 : 0, (v / dinh) * 78)}%`, background: ser.mau }} />
                  </span>
                );
              })}
            </div>
            <span className="truncate text-center text-[8px] text-slate-500">{ten}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Duong({ lat }: { lat: Lat[] }) {
  if (lat.length === 0) return <p className="text-[10px] text-slate-400">Không có chuỗi tháng</p>;
  const min = Math.min(0, ...lat.map((d) => d.v));
  const max = Math.max(0, ...lat.map((d) => d.v));
  const span = max - min || 1;
  const pts = lat.map((d, i) => {
    const x = lat.length === 1 ? 50 : (i / (lat.length - 1)) * 100;
    const y = 100 - ((d.v - min) / span) * 100;
    return `${x},${y}`;
  });
  return (
    <div className="relative h-full">
      <svg viewBox="0 0 100 100" className="h-[78%] w-full" preserveAspectRatio="none">
        <polyline fill="none" stroke={MAU.xanh} strokeWidth="1.5" points={pts.join(' ')} vectorEffect="non-scaling-stroke" />
      </svg>
      {lat.map((d, i) => (
        <span
          key={`${d.ten}-so`}
          className="absolute max-w-[18%] truncate text-[8px] leading-none text-slate-700"
          style={{
            left: `${lat.length === 1 ? 50 : (i / (lat.length - 1)) * 100}%`,
            bottom: `${22 + ((d.v - min) / span) * 58}%`,
            transform: i === 0 ? 'translate(0, 0)' : i === lat.length - 1 ? 'translate(-100%, 0)' : 'translate(-50%, 0)',
          }}
        >
          {d.hien}
        </span>
      ))}
      <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 text-[8px] text-slate-500">
        {lat.map((d) => <span key={d.ten} className="min-w-0 truncate">{d.ten}</span>)}
      </div>
    </div>
  );
}

function Bang({ nd, onMa }: { nd: Extract<NoiDung, { kieu: 'bang' }>; onMa: (ma: string) => void }) {
  return (
    <div className="h-full overflow-hidden">
      <table className="w-full table-fixed text-[8px]">
        <thead>
          <tr className="text-left text-[#123E78]">
            {nd.cot.map((c) => <th key={c} className="truncate pr-1 font-semibold">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {nd.dong.slice(0, 10).map((hang, i) => (
            <tr key={`${hang[0]}-${i}`}>
              {hang.map((cell, j) => (
                <td key={j} className="truncate pr-1">
                  {j === 0 && nd.ma?.[i] ? (
                    <button type="button" className="text-[#1976D2]" onClick={() => onMa(nd.ma?.[i] || '')}>{cell}</button>
                  ) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {nd.chu ? <p className="truncate text-[8px] text-slate-400">{nd.chu}</p> : null}
    </div>
  );
}

function OTrong({ nd, onLoc, onMa }: { nd: NoiDung; onLoc: (k: LocKhoa, v: string) => void; onMa: (ma: string) => void }) {
  if (nd.kieu === 'tieu') {
    return (
      <div className="flex h-full items-center justify-between gap-3 rounded-md bg-[#123E78] px-3 text-white">
        <div className="min-w-0">
          <div className="truncate text-[9px] opacity-80">CÔNG TY CỔ PHẦN XUẤT NHẬP KHẨU HÓA CHẤT TÂN PHÚ CƯỜNG</div>
          <div className="truncate text-sm font-semibold">{nd.tieu}</div>
        </div>
        <div className="max-w-[48%] truncate text-right text-[10px] opacity-90">{nd.phu}</div>
      </div>
    );
  }
  if (nd.kieu === 'kpi') {
    return (
      <div className="flex h-full flex-col justify-between overflow-hidden rounded-md border border-slate-200 bg-white px-2 py-1" style={{ borderLeft: `3px solid ${nd.mau}` }}>
        <div className="truncate text-[9px] text-slate-500">{nd.ten}</div>
        <div className="truncate text-sm font-semibold text-slate-900">{nd.gia}</div>
        <div className="truncate text-[8px] text-slate-400">{nd.phu}</div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white p-1.5">
      {'tieu' in nd ? <div className="truncate text-[10px] font-semibold text-[#123E78]">{nd.tieu}</div> : null}
      {'phu' in nd && nd.phu ? <div className="mb-0.5 truncate text-[8px] text-slate-400">{nd.phu}</div> : null}
      <div className="min-h-0 flex-1">
        {nd.kieu === 'cot' ? <Cot lat={nd.lat} ngang={nd.ngang} onChon={nd.loc ? (k) => onLoc(nd.loc as LocKhoa, k) : undefined} /> : null}
        {nd.kieu === 'tron' ? <Tron lat={nd.lat} onChon={nd.loc ? (k) => onLoc(nd.loc as LocKhoa, k) : undefined} /> : null}
        {nd.kieu === 'nhom' ? <NhomCot nhom={nd.nhom} series={nd.series} /> : null}
        {nd.kieu === 'chong' ? <NhomCot nhom={nd.nhom} series={nd.series} chong onChon={nd.loc === 'sale' ? (k) => onLoc('sale', k === 'Chưa khai' ? '' : k) : undefined} /> : null}
        {nd.kieu === 'duong' ? <Duong lat={nd.lat} /> : null}
        {nd.kieu === 'bang' ? <Bang nd={nd} onMa={onMa} /> : null}
        {nd.kieu === 'the' ? (
          <div className="grid h-full grid-cols-4 gap-1">
            {nd.the.map((t) => (
              <div key={t.ten}>
                <div className="truncate text-[8px]" style={{ color: t.mau }}>{t.ten}</div>
                <div className="text-sm font-semibold">{t.gia}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const RONG_XEM = 1100;

export function XemTrang({ du, onLoc, onMa }: { du: DuLieuMau; onLoc: (k: keyof LocMau, v: string) => void; onMa: (ma: string) => void }) {
  const hop = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const cao = RONG_XEM * (TRANG.cao / TRANG.rong);
  useEffect(() => {
    const el = hop.current?.parentElement;
    if (!el) return;
    const doScale = () => {
      const theoRong = el.clientWidth / RONG_XEM;
      const theoCao = el.clientHeight > 40 ? el.clientHeight / cao : theoRong;
      setScale(Math.min(1, theoRong, theoCao));
    };
    doScale();
    const ro = new ResizeObserver(doScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={hop} style={{ width: RONG_XEM * scale, height: cao * scale }}>
      <div className="relative bg-[#F4F7FB] shadow" style={{ width: RONG_XEM, height: cao, transform: `scale(${scale})`, transformOrigin: 'top left', fontFamily: 'Inter, Arial, sans-serif' }}>
        {KHUNG[du.id].map((o) => (
          <div key={o.id} style={oStyle(o.id, du.id)}>
            {du.o[o.id] ? <OTrong nd={du.o[o.id]} onLoc={onLoc} onMa={onMa} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
