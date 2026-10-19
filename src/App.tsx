import { useEffect, useMemo, useRef, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import type { KetQua } from './lib/metrics';
import { parseArrayBuffer } from './lib/parseWorkbook';
import { docTepSo, luuTepSo } from './luuSo';
import { ngay } from './format';
import { ChuaNap, ThanhBen, laKhungTrong, tenMan, type ManId } from './khung';
import { ManAr, ManBieu, ManCanhBao, ManHoSo, ManKeHoach, ManKhach, ManNap, ManTong } from './man';
import { ManMobileApp } from './manMobile';
import { ManBo } from './manKhac';
import { SoanIn } from './soan';
import type { MauId } from './mauIn';
import { LOC_RONG, TAY_RONG, chonTu, docTay, luuTay, type Loc, type NhomCanhBaoId, type Tay } from './soLieu';
import {
  type BoLocThoiGian,
  BO_LOC_THOI_GIAN_MAC_DINH,
  BoLocThoiGianBar,
  apDungBoLocThoiGian,
} from './locThoiGian';

function mauTuMan(man: ManId, ar: 'tuan' | 'tc1' | 'tc2', hoSo: boolean): MauId {
  if (hoSo || man === 'khach') return 'khach';
  if (man === 'tongquan' || (man === 'ar' && ar === 'tc1')) return 'tc1';
  return 'tuan';
}

const MAN_BO = new Set<ManId>([
  'ap', 'ap_ncc', 'ap_tuoi', 'ap_lich', 'ap_pt', 'ap_ck',
  'tien', 'vi_the', 'dong_tien', 'fc13', 'lech', 'kich_ban',
  'nhu_cau', 'kh_mua', 'po', 'tien_do', 'ngan_sach', 'lien_ap',
  'cb_ap', 'cb_tien', 'cb_mua', 'phieuthu', 'socal', 'khoaky',
]);

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
  const [ar, setAr] = useState<'tuan' | 'tc1' | 'tc2'>('tuan');
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
    if (id !== 'cb_ar') {
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
      <div className="flex min-h-screen flex-col items-center bg-[#f5f7fa]">
        <div className="z-50 hidden w-full items-center justify-between border-b border-[#dfe6ec] bg-white px-5 py-3 text-[12px] text-[#506170] md:flex">
          <div className="flex items-center gap-2.5">
            <span className="text-[#17212b]">Tân Phú Cường</span>
            <span className="text-[#c5d0d8]">·</span>
            <span>Đang xem bản App</span>
            <span className="rounded-md bg-[#e8f2fb] px-2 py-1 text-[11px] text-[#1769aa]">
              {moPhongKhung ? 'Khung điện thoại' : 'Toàn màn hình'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#dfe6ec] bg-white px-3 text-[12px] text-[#506170]"
              onClick={() => setMoPhongKhung((v) => !v)}
              title="Chuyển đổi giữa chế độ khung điện thoại hoặc tràn viền màn hình"
            >
              <Smartphone className="size-3.5 text-[#5c8db7]" />
              <span>{moPhongKhung ? 'Xem tràn viền' : 'Khung điện thoại'}</span>
            </button>
            <button
              type="button"
              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#1769aa] px-3 text-[12px] text-white hover:bg-[#125b92]"
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
            <SoanIn ky={ky} tay={tay} mauBanDau={mauIn} moHoSo={moHoSo} dong={dongBaoCao} />
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
    <div className="flex h-screen bg-[#f5f7fa] text-[#17212b]">
      <ThanhBen man={inMo ? 'baocao' : hoSo ? 'khach' : man} chon={chonMan} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className={`flex flex-col gap-3 border-b border-[#dfe6ec] bg-white/95 px-5 py-3 backdrop-blur md:px-8 xl:flex-row xl:items-center xl:justify-between ${inMo ? 'hidden' : ''}`}>
          <div className="min-w-0">
            <div className="truncate text-[21px] font-semibold tracking-[-0.03em] text-[#17212b]">
              {hoSo ? 'Hồ sơ khách hàng' : tenMan(man)}
              {!hoSo && laKhungTrong(man) ? (
                <span className="ml-2 align-middle rounded-md bg-[#fff6e5] px-2 py-0.5 text-[11px] font-normal tracking-normal text-[#b87b20]">
                  Sắp có · số minh họa
                </span>
              ) : null}
            </div>
            <div className="text-[12px] text-[#8593a1]">
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
            <div className="flex items-center rounded-lg border border-[#dfe6ec] bg-white p-0.5 text-[12px]">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1.5 rounded-md bg-[#e8f2fb] px-3 py-1.5 text-[#1769aa]"
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
                className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-[#697887] hover:text-[#253746]"
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
              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#1769aa] px-3 text-[12px] text-white hover:bg-[#125b92]"
              onClick={() => moBaoCao(mauTuMan(man, ar, hoSo))}
            >
              Xuất PDF
            </button>
          </div>
        </header>

        <main className={`min-h-0 flex-1 ${inMo ? 'overflow-hidden' : 'overflow-auto'}`}>
          {inMo ? (
            <SoanIn ky={ky} tay={tay} mauBanDau={mauIn} moHoSo={moHoSo} dong={dongBaoCao} />
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
              {man !== 'nap' && !MAN_BO.has(man) && man !== 'tongquan' && !coSo && !hoSo ? (
                <ChuaNap chu={dangMo ? 'Đang mở sổ…' : 'Chưa nạp sổ'} />
              ) : null}
              {man !== 'nap' && !hoSo && man === 'tongquan' ? (
                <ManTong
                  chon={chonKy}
                  boLoc={locThoiGian}
                  onMoCanhBao={(nhomId) => {
                    setNhomCanhBaoChon(nhomId);
                    setMan('cb_ar');
                    setHoSo(false);
                  }}
                  onMa={moHoSo}
                  onMoTc1={() => moBaoCao('tc1')}
                />
              ) : null}
              {coSo && chonKy && chonLoc && man === 'ar' && !hoSo ? (
                <ManAr tab={ar} setTab={setAr} chonKy={chonKy} chonLoc={chonLoc} loc={loc} setLoc={setLoc} sales={sales} suaTay={suaTay} />
              ) : null}
              {coSo && chonLoc && man === 'khach' && !hoSo ? (
                <ManKhach chonLoc={chonLoc} loc={loc} setLoc={setLoc} sales={sales} moHoSo={moHoSo} suaTay={suaTay} />
              ) : null}
              {coSo && chonKy && hoSo ? (
                <div className="space-y-3">
                  <button type="button" className="text-[12px] text-[#1769aa]" onClick={() => setHoSo(false)}>Về danh sách</button>
                  <ManHoSo chon={chonKy} suaTay={suaTay} />
                </div>
              ) : null}
              {coSo && chonLoc && !hoSo && man === 'tuoi' ? (
                <ManBieu tieu="Tuổi nợ" ids={['tuoi-kpi', 'tuoi-cot']} chon={chonLoc} loc={loc} setLoc={setLoc} sales={sales} />
              ) : null}
              {coSo && chonLoc && !hoSo && man === 'thuhoi' ? (
                <ManBieu tieu="Phân tích thu hồi" ids={['th-kpi', 'th-cot', 'th-bang']} chon={chonLoc} loc={loc} setLoc={setLoc} sales={sales} />
              ) : null}
              {coSo && chonLoc && !hoSo && man === 'ruiro' ? (
                <ManBieu tieu="Rủi ro và hạn mức" ids={['rr-hm', 'rr-noxau', 'rr-top']} chon={chonLoc} loc={loc} setLoc={setLoc} sales={sales} onMa={moHoSo} />
              ) : null}
              {coSo && chonLoc && !hoSo && man === 'kehoach' ? <ManKeHoach chon={chonLoc} suaTay={suaTay} /> : null}
              {coSo && chonLoc && !hoSo && man === 'cb_ar' ? <ManCanhBao chon={chonLoc} moHoSo={moHoSo} nhomChonBanDau={nhomCanhBaoChon} /> : null}
              {!hoSo && MAN_BO.has(man) ? <ManBo id={man} coSoThu={coSo} /> : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
