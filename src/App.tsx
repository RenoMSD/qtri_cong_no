import { useEffect, useMemo, useRef, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import type { KetQua } from './lib/metrics';
import { parseArrayBuffer } from './lib/parseWorkbook';
import { docTepSo, luuTepSo } from './luuSo';
import { ngay } from './format';
import { ChuaNap, ManSapCo, ThanhBen, ThanhTab, laSapCo, tenMan, type ManId } from './khung';
import { ManAr, ManKeHoach, ManKhach, ManNap } from './man';
import { ManTongQuan } from './manTongQuan';
import { ManTinDung, ManTuoiNo } from './manPhanTich';
import { ManCanhBaoKanban, ManDanhSachKhach } from './manKhachHang';
import { ManHoSoKhach } from './manHoSo';
import { ManMobileApp } from './manMobile';
import { SoanIn, type MauId } from './soan';

import { LOC_RONG, TAY_RONG, chonTu, docTay, luuTay, type Loc, type NhomCanhBaoId, type Tay } from './soLieu';
import {
  type BoLocThoiGian,
  BO_LOC_THOI_GIAN_MAC_DINH,
  BoLocThoiGianBar,
  apDungBoLocThoiGian,
} from './locThoiGian';

type TabTong = 'danhmuc' | 'tuan' | 'tc1' | 'tc2';
const TAB_TONG: { id: TabTong; ten: string }[] = [
  { id: 'danhmuc', ten: 'Danh mục' },
  { id: 'tuan', ten: 'Theo tuần' },
  { id: 'tc1', ten: 'TC1' },
  { id: 'tc2', ten: 'TC2' },
];
type TabKhach = 'ds' | 'kehoach' | 'them';
const TAB_KHACH: { id: TabKhach; ten: string }[] = [
  { id: 'ds', ten: 'Danh sách' },
  { id: 'kehoach', ten: 'Kế hoạch tuần' },
  { id: 'them', ten: 'Thêm tay' },
];

function mauTuMan(man: ManId, tab: TabTong, hoSo: boolean): MauId {
  if (hoSo || man === 'khach') return 'khach';
  if (man === 'tongquan' && tab === 'tuan') return 'tuan';
  if (man === 'tongquan') return 'tc1';
  return 'tuan';
}

export default function App() {
  const [cheDo, setCheDo] = useState<'web' | 'app'>(() => {
    try {
      // Màn hình điện thoại luôn mở bản App: bản Web không đủ chỗ cho sidebar
      if (typeof window !== 'undefined' && window.innerWidth < 768) return 'app';
      const saved = localStorage.getItem('che_do_giao_dien');
      if (saved === 'app' || saved === 'web') return saved;
    } catch {}
    return 'web';
  });
  const [moPhongKhung, setMoPhongKhung] = useState(false);
  const [ky, setKy] = useState<KetQua | null>(null);
  const [man, setMan] = useState<ManId>('tongquan');
  const [ar, setAr] = useState<TabTong>('danhmuc');
  const [tabKhach, setTabKhach] = useState<TabKhach>('ds');
  const [loc, setLoc] = useState<Loc>(LOC_RONG);
  const [tay, setTay] = useState<Tay>(TAY_RONG);
  const [ma, setMa] = useState<string | null>(null);
  const [nhomCanhBaoChon, setNhomCanhBaoChon] = useState<NhomCanhBaoId | null>(null);
  const [hoSo, setHoSo] = useState(false);
  const [inMo, setInMo] = useState(false);
  const [mauIn, setMauIn] = useState<MauId>('tuan');
  const [dangMo, setDangMo] = useState(true);
  const giu = useRef(false);

  useEffect(() => {
    let huy = false;
    (async () => {
      try {
        const daLuu = await docTepSo().catch(() => null);
        let ten = daLuu?.ten ?? 'CongNo_Demo_Test.xlsx';
        let buf = daLuu?.buf;
        if (!buf) {
          const res = await fetch('/mau-test/CongNo_Demo_Test.xlsx');
          if (!res.ok) return;
          buf = await res.arrayBuffer();
          ten = 'CongNo_Demo_Test.xlsx';
          await luuTepSo(ten, buf.slice(0)).catch(() => undefined);
        }
        const kq = await parseArrayBuffer(buf.slice(0), ten);
        if (huy || giu.current || kq.chanLuu) return;
        setKy(kq);
      } finally {
        if (!huy) setDangMo(false);
      }
    })();
    return () => {
      huy = true;
    };
  }, []);

  useEffect(() => {
    if (!ky) {
      setTay(TAY_RONG);
      return;
    }
    setTay(docTay(ky.checksum));
  }, [ky]);

  function suaTay(next: Tay) {
    setTay(next);
    if (ky) luuTay(ky.checksum, next);
  }

  const [locThoiGian, setLocThoiGian] = useState<BoLocThoiGian>(() => {
    try {
      const saved = localStorage.getItem('bo_loc_thoi_gian');
      if (saved) return JSON.parse(saved);
    } catch {}
    return BO_LOC_THOI_GIAN_MAC_DINH;
  });

  function handleSetLocThoiGian(next: BoLocThoiGian) {
    setLocThoiGian(next);
    try {
      localStorage.setItem('bo_loc_thoi_gian', JSON.stringify(next));
    } catch {}
  }

  const kyHienThi = useMemo(() => {
    if (!ky) return null;
    return apDungBoLocThoiGian(ky, locThoiGian);
  }, [ky, locThoiGian]);

  const sales = useMemo(() => (kyHienThi ? [...new Set(kyHienThi.khach.map((k) => k.sale))].sort() : []), [kyHienThi]);
  const chonKy = kyHienThi ? chonTu(kyHienThi, loc, tay, ma, 'toan-bo') : null;
  const chonLoc = kyHienThi ? chonTu(kyHienThi, loc, tay, ma, 'loc') : null;

  function chonMan(id: ManId) {
    setHoSo(false);
    if (id === 'baocao') {
      if (man !== 'baocao') setMauIn(mauTuMan(man, ar, hoSo));
      setMan('baocao');
      setInMo(true);
      return;
    }
    if (id !== 'canhbao') {
      setNhomCanhBaoChon(null);
    }
    setMan(id);
    setInMo(false);
  }

  function moBaoCao(mau: MauId) {
    setMan('baocao');
    setMauIn(mau);
    setInMo(true);
  }

  function dongBaoCao() {
    setInMo(false);
    setMan((dang) => (dang === 'baocao' ? 'tongquan' : dang));
  }

  function moHoSo(maKH: string) {
    setMa(maKH);
    setHoSo(true);
    setInMo(false);
    setMan((dang) => (dang === 'baocao' ? 'khach' : dang));
  }

  const coSo = Boolean(ky && chonKy && chonLoc);

  // Chế độ Bản App (Mobile)
  if (cheDo === 'app') {
    return (
      <div className="flex min-h-screen flex-col items-center bg-background">
        <div className="z-50 hidden w-full items-center justify-between border-b border-line bg-white px-5 py-3 text-[12px] text-subtle md:flex">
          <div className="flex items-center gap-2.5">
            <span className="text-foreground">Tân Phú Cường</span>
            <span className="text-line">·</span>
            <span>Đang xem bản App</span>
            <span className="rounded-md bg-primary-soft px-2 py-1 text-[11px] text-primary">
              {moPhongKhung ? 'Khung điện thoại' : 'Toàn màn hình'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 text-[12px] text-subtle"
              onClick={() => setMoPhongKhung((v) => !v)}
              title="Chuyển đổi giữa chế độ khung điện thoại hoặc tràn viền màn hình"
            >
              <Smartphone className="size-3.5 text-primary-glow" />
              <span>{moPhongKhung ? 'Xem tràn viền' : 'Khung điện thoại'}</span>
            </button>
            <button
              type="button"
              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 text-[12px] text-white hover:bg-primary-dark"
              onClick={() => {
                setCheDo('web');
                try {
                  localStorage.setItem('che_do_giao_dien', 'web');
                } catch {}
              }}
            >
              <Monitor className="size-3.5" />
              <span>Bản Web</span>
            </button>
          </div>
        </div>

        {inMo ? (
          <div className="w-full flex-1">
            <SoanIn ky={ky} tay={tay} suaTay={suaTay} mauBanDau={mauIn} maBanDau={ma} moHoSo={moHoSo} dong={dongBaoCao} />
          </div>
        ) : moPhongKhung ? (
          /* Phone Frame Mockup for desktop preview */
          <div className="my-6 w-full max-w-[412px] rounded-[48px] border-[10px] border-slate-900 bg-white shadow-2xl overflow-hidden min-h-[850px] relative ring-1 ring-slate-800/10">
            {/* Dynamic Island / Speaker notch */}
            <div className="absolute top-2.5 inset-x-0 z-50 flex justify-center pointer-events-none">
              <div className="h-5 w-28 bg-slate-900 rounded-full flex items-center justify-end pr-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-800 ring-1 ring-slate-700 inline-block" />
              </div>
            </div>
            <div className="pt-2">
              <ManMobileApp
                ky={kyHienThi || ky}
                chonKy={chonKy}
                chonLoc={chonLoc}
                loc={loc}
                setLoc={setLoc}
                tay={tay}
                suaTay={suaTay}
                sales={sales}
                locThoiGian={locThoiGian}
                setLocThoiGian={handleSetLocThoiGian}
                onChuyenWeb={() => {
                  setCheDo('web');
                  try {
                    localStorage.setItem('che_do_giao_dien', 'web');
                  } catch {}
                }}
                onMoIn={() => moBaoCao(mauTuMan(man, ar, hoSo))}
                onMoNap={() => {
                  setCheDo('web');
                  setMan('nap');
                }}
              />
            </div>
          </div>
        ) : (
          /* Responsive full-width mobile view */
          <div className="w-full max-w-lg md:max-w-xl bg-white min-h-screen shadow-md">
            <ManMobileApp
              ky={kyHienThi || ky}
              chonKy={chonKy}
              chonLoc={chonLoc}
              loc={loc}
              setLoc={setLoc}
              tay={tay}
              suaTay={suaTay}
              sales={sales}
              locThoiGian={locThoiGian}
              setLocThoiGian={handleSetLocThoiGian}
              onChuyenWeb={() => {
                setCheDo('web');
                try {
                  localStorage.setItem('che_do_giao_dien', 'web');
                } catch {}
              }}
              onMoIn={() => moBaoCao(mauTuMan(man, ar, hoSo))}
              onMoNap={() => {
                setCheDo('web');
                setMan('nap');
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Chế độ Bản Web (Desktop)
  return (
    <div className="flex h-screen bg-background text-foreground">
      <ThanhBen man={inMo ? 'baocao' : hoSo ? 'khach' : man} chon={chonMan} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className={`flex flex-col gap-3 border-b border-line bg-white/95 px-5 py-3 backdrop-blur md:px-8 xl:flex-row xl:items-center xl:justify-between ${inMo ? 'hidden' : ''}`}>
          <div className="min-w-0">
            <div className="truncate text-[21px] font-semibold tracking-[-0.03em] text-foreground">
              {hoSo ? 'Hồ sơ khách hàng' : tenMan(man)}
              {!hoSo && laSapCo(man) ? (
                <span className="ml-2 align-middle rounded-md bg-risk-watch-soft px-2 py-0.5 text-[11px] font-normal tracking-normal text-risk-watch">
                  Sắp có
                </span>
              ) : null}
            </div>
            <div className="text-[12px] text-muted">
              {ky
                ? `Chốt ${ngay(kyHienThi?.meta.ngayChot || ky.meta.ngayChot)} · ${kyHienThi?.meta.tuanNhan || ky.meta.tuanNhan}`
                : dangMo
                ? 'Đang mở sổ…'
                : 'Chưa nạp sổ'}
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 xl:flex-1 xl:justify-end">
            <BoLocThoiGianBar
              ky={ky}
              locThoiGian={locThoiGian}
              setLocThoiGian={handleSetLocThoiGian}
            />
            <div className="flex items-center rounded-lg border border-line bg-white p-0.5 text-[12px]">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1.5 rounded-md bg-primary-soft px-3 py-1.5 text-primary"
                onClick={() => {
                  setCheDo('web');
                  try {
                    localStorage.setItem('che_do_giao_dien', 'web');
                  } catch {}
                }}
              >
                <Monitor className="size-3.5" />
                <span>Bản Web</span>
              </button>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-muted hover:text-foreground"
                onClick={() => {
                  setCheDo('app');
                  try {
                    localStorage.setItem('che_do_giao_dien', 'app');
                  } catch {}
                }}
              >
                <Smartphone className="size-3.5" />
                <span>Bản App</span>
              </button>
            </div>

            <button
              type="button"
              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 text-[12px] text-white hover:bg-primary-dark"
              onClick={() => moBaoCao(mauTuMan(man, ar, hoSo))}
            >
              Xuất PDF
            </button>
          </div>
        </header>

        <main className={`min-h-0 flex-1 ${inMo ? 'overflow-hidden' : 'overflow-auto'}`}>
          {inMo ? (
            <SoanIn ky={ky} tay={tay} suaTay={suaTay} mauBanDau={mauIn} maBanDau={ma} moHoSo={moHoSo} dong={dongBaoCao} />
          ) : (
            <div className="mx-auto max-w-[1600px] px-5 py-6 md:px-8">
              {man === 'nap' ? (
                <ManNap
                  onKy={(k, tep) => {
                    giu.current = true;
                    setKy(k);
                    setDangMo(false);
                    void luuTepSo(k.tenFile, tep);
                    setMan('tongquan');
                    setHoSo(false);
                  }}
                />
              ) : null}
              {laSapCo(man) ? <ManSapCo id={man} /> : null}
              {man !== 'nap' && !laSapCo(man) && man !== 'tongquan' && !coSo && !hoSo ? (
                <ChuaNap chu={dangMo ? 'Đang mở sổ…' : 'Chưa nạp sổ'} />
              ) : null}
              {man === 'tongquan' && !hoSo ? (
                <div className="space-y-4">
                  {coSo ? <ThanhTab tab={ar} setTab={setAr} ds={TAB_TONG} /> : null}
                  {ar === 'danhmuc' || !coSo ? (
                    <ManTongQuan
                      chon={chonKy}
                      onMoCanhBao={(nhomId) => {
                        setNhomCanhBaoChon(nhomId);
                        setMan('canhbao');
                        setHoSo(false);
                      }}
                      onMa={moHoSo}
                      onMoMan={(id) => {
                        setMan(id);
                        setHoSo(false);
                      }}
                    />
                  ) : chonKy && chonLoc ? (
                    <ManAr tab={ar} chonKy={chonKy} chonLoc={chonLoc} loc={loc} setLoc={setLoc} sales={sales} suaTay={suaTay} />
                  ) : null}
                </div>
              ) : null}
              {coSo && chonLoc && man === 'khach' && !hoSo ? (
                <div className="space-y-4">
                  <ThanhTab tab={tabKhach} setTab={setTabKhach} ds={TAB_KHACH} />
                  {tabKhach === 'ds' ? <ManDanhSachKhach chon={chonLoc} loc={loc} setLoc={setLoc} sales={sales} moHoSo={moHoSo} /> : null}
                  {tabKhach === 'kehoach' ? <ManKeHoach chon={chonLoc} suaTay={suaTay} /> : null}
                  {tabKhach === 'them' ? <ManKhach chonLoc={chonLoc} loc={loc} setLoc={setLoc} sales={sales} moHoSo={moHoSo} suaTay={suaTay} /> : null}
                </div>
              ) : null}
              {coSo && chonKy && hoSo ? (
                <ManHoSoKhach chon={chonKy} suaTay={suaTay} veDanhSach={() => setHoSo(false)} />
              ) : null}
              {coSo && chonLoc && !hoSo && man === 'tuoi' ? (
                <ManTuoiNo chon={chonLoc} loc={loc} setLoc={setLoc} sales={sales} onMa={moHoSo} />
              ) : null}
              {coSo && chonLoc && !hoSo && man === 'tindung' ? (
                <ManTinDung chon={chonLoc} loc={loc} setLoc={setLoc} sales={sales} onMa={moHoSo} />
              ) : null}
              {coSo && chonLoc && !hoSo && man === 'canhbao' ? <ManCanhBaoKanban chon={chonLoc} suaTay={suaTay} moHoSo={moHoSo} nhomChonBanDau={nhomCanhBaoChon} /> : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
