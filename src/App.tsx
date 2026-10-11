import { useEffect, useMemo, useRef, useState } from 'react';
import { TEN_CONG_TY } from '../../Credit/src/lib/pdfReport';
import type { KetQua } from '../../Credit/src/lib/metrics';
import { parseArrayBuffer } from '../../Credit/src/lib/parseWorkbook';
import { docTepSo, luuTepSo } from './luuSo';
import { ngay } from './format';
import { ChuaNap, ThanhBen, type ManId } from './khung';
import { ManAr, ManBieu, ManCanhBao, ManHoSo, ManKeHoach, ManKhach, ManNap, ManTong } from './man';
import { ManBo } from './manKhac';
import { SoanIn } from './soan';
import { LOC_RONG, TAY_RONG, chonTu, docTay, luuTay, type Loc, type LoaiDash, type Tay } from './soLieu';

function loaiCua(man: ManId, ar: 'tuan' | 'tc1' | 'tc2', hoSo: boolean): LoaiDash {
  if (hoSo) return 'hoso';
  if (man === 'ar') return ar;
  if (man === 'tuoi') return 'tuoi';
  if (man === 'thuhoi') return 'thuhoi';
  if (man === 'ruiro') return 'ruiro';
  if (man === 'tongquan') return 'tongquan';
  if (man.startsWith('ap')) return 'ap';
  if (man === 'tien' || man === 'vi_the' || man === 'dong_tien' || man === 'fc13' || man === 'lech' || man === 'kich_ban' || man === 'cb_tien') return 'tien';
  if (man === 'nhu_cau' || man === 'kh_mua' || man === 'po' || man === 'tien_do' || man === 'ngan_sach' || man === 'lien_ap' || man === 'cb_mua') return 'mua';
  return 'tuan';
}

const MAN_BO = new Set<ManId>([
  'ap', 'ap_ncc', 'ap_tuoi', 'ap_lich', 'ap_pt', 'ap_ck',
  'tien', 'vi_the', 'dong_tien', 'fc13', 'lech', 'kich_ban',
  'nhu_cau', 'kh_mua', 'po', 'tien_do', 'ngan_sach', 'lien_ap',
  'cb_ap', 'cb_tien', 'cb_mua', 'phieuthu', 'socal', 'khoaky',
]);

export default function App() {
  const [ky, setKy] = useState<KetQua | null>(null);
  const [man, setMan] = useState<ManId>('tongquan');
  const [ar, setAr] = useState<'tuan' | 'tc1' | 'tc2'>('tuan');
  const [loc, setLoc] = useState<Loc>(LOC_RONG);
  const [tay, setTay] = useState<Tay>(TAY_RONG);
  const [ma, setMa] = useState<string | null>(null);
  const [hoSo, setHoSo] = useState(false);
  const [inMo, setInMo] = useState(false);
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

  const sales = useMemo(() => (ky ? [...new Set(ky.khach.map((k) => k.sale))].sort() : []), [ky]);
  const chonKy = ky ? chonTu(ky, loc, tay, ma, 'toan-bo') : null;
  const chonLoc = ky ? chonTu(ky, loc, tay, ma, 'loc') : null;

  function chonMan(id: ManId) {
    setHoSo(false);
    if (id === 'baocao') {
      setInMo(true);
      return;
    }
    setMan(id);
    setInMo(false);
  }

  function moHoSo(maKH: string) {
    setMa(maKH);
    setHoSo(true);
    setInMo(false);
  }

  const coSo = Boolean(ky && chonKy && chonLoc);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <ThanhBen man={hoSo ? 'khach' : man} chon={chonMan} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{TEN_CONG_TY}</div>
            <div className="text-xs text-slate-500">{ky ? `Chốt ${ngay(ky.meta.ngayChot)} · ${ky.meta.tuanNhan}` : dangMo ? 'Đang mở sổ…' : 'Chưa nạp sổ'}</div>
          </div>
          <button type="button" className="rounded-lg bg-[#0073E6] px-3 py-1.5 text-sm text-white" onClick={() => setInMo(true)}>
            Xuất PDF
          </button>
        </header>
        <main className="min-h-0 flex-1 overflow-auto">
          {inMo ? (
            <SoanIn ky={ky} loc={loc} tay={tay} ma={ma} setMa={setMa} loaiBanDau={loaiCua(man, ar, hoSo)} dong={() => setInMo(false)} />
          ) : (
            <div className="p-4">
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
              {man !== 'nap' && !hoSo && man === 'tongquan' ? <ManTong chon={chonKy} /> : null}
              {coSo && chonKy && chonLoc && man === 'ar' && !hoSo ? (
                <ManAr tab={ar} setTab={setAr} chonKy={chonKy} chonLoc={chonLoc} loc={loc} setLoc={setLoc} sales={sales} suaTay={suaTay} />
              ) : null}
              {coSo && chonLoc && man === 'khach' && !hoSo ? (
                <ManKhach chonLoc={chonLoc} loc={loc} setLoc={setLoc} sales={sales} moHoSo={moHoSo} suaTay={suaTay} />
              ) : null}
              {coSo && chonKy && hoSo ? (
                <div className="space-y-3">
                  <button type="button" className="text-sm text-[#0073E6]" onClick={() => setHoSo(false)}>Về danh sách</button>
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
              {coSo && chonLoc && !hoSo && man === 'cb_ar' ? <ManCanhBao chon={chonLoc} moHoSo={moHoSo} /> : null}
              {!hoSo && MAN_BO.has(man) ? <ManBo id={man} coSoThu={coSo} /> : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
