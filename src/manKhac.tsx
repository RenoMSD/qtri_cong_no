import { useState } from 'react';
import {
  AP_QUA,
  AP_TONG,
  CHI_13,
  CHU_TEST,
  DU_13,
  LICH_AP,
  NCC,
  NGAY_TUAN,
  NHOM_MUA,
  THU_13,
  TK_TIEN,
  TUAN_13,
  soBoTest,
} from './boTest';
import { ty } from './format';
import type { ManId } from './khung';
import { Khoi } from './khoi';
import type { SoKhoi } from './soLieu';

const T = 1e9;

function Tieu({ tieu }: { tieu: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-[16px] font-semibold text-[#233543]">{tieu}</h2>
      <p className="mt-1 text-[12px] text-[#81909d]">{CHU_TEST}</p>
    </div>
  );
}

function Bang({ tieu, c, d }: { tieu: string; c: string[]; d: string[][] }) {
  return <Khoi so={{ loai: 'bang', tieu, c, d }} />;
}

function KhoiTest({ id }: { id: string }) {
  const so = soBoTest(id);
  return so ? <Khoi so={so} /> : null;
}

export function ManBo({ id, coSoThu }: { id: ManId; coSoThu: boolean }) {
  const [ncc, setNcc] = useState<string | null>(null);
  if (id === 'ap') {
    return (
      <div className="space-y-4">
        <Tieu tieu="Dashboard phải trả" />
        <KhoiTest id="bt-ap-kpi" />
        <KhoiTest id="bt-ap-tuoi" />
        <KhoiTest id="bt-ap-ncc" />
      </div>
    );
  }
  if (id === 'ap_ncc') {
    const chon = NCC.find((k) => k.ma === ncc);
    return (
      <div className="space-y-4">
        <Tieu tieu="Nhà cung cấp" />
        <section className="overflow-auto rounded-xl border border-[#dfe6ec] bg-white shadow-[0_1px_2px_rgba(20,40,60,0.03)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2">Mã</th>
                <th className="px-3 py-2">Nhóm</th>
                <th className="px-3 py-2">Dư nợ</th>
                <th className="px-3 py-2">Trong hạn</th>
                <th className="px-3 py-2">Quá hạn</th>
              </tr>
            </thead>
            <tbody>
              {NCC.map((k) => (
                <tr key={k.ma} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <button type="button" className="text-[#1769aa] underline" onClick={() => setNcc(k.ma)}>{k.ma}</button>
                  </td>
                  <td className="px-3 py-2">{k.ten}</td>
                  <td className="so px-3 py-2">{ty(k.du * T)}</td>
                  <td className="so px-3 py-2">{ty(k.trongHan * T)}</td>
                  <td className="so px-3 py-2">{ty(k.quaHan * T)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {chon ? (
          <Bang
            tieu={`Chứng từ ${chon.ma}`}
            c={['Chứng từ', 'Ngày đến hạn', 'Tuần', 'Số tiền']}
            d={LICH_AP.filter((r) => r[0] === chon.ma).map((r) => r.slice(1))}
          />
        ) : (
          <p className="text-sm text-slate-500">Bấm một mã để mở chứng từ của nhà cung cấp đó.</p>
        )}
      </div>
    );
  }
  if (id === 'ap_tuoi') {
    return (
      <div className="space-y-4">
        <Tieu tieu="Tuổi nợ phải trả" />
        <KhoiTest id="bt-ap-tuoi" />
      </div>
    );
  }
  if (id === 'ap_lich') {
    return (
      <div className="space-y-4">
        <Tieu tieu="Lịch thanh toán" />
        <KhoiTest id="bt-ap-lich" />
      </div>
    );
  }
  if (id === 'ap_pt') {
    const cot: SoKhoi = {
      loai: 'cot',
      tieu: 'Dư nợ theo nhà cung cấp',
      d: NCC.map((k) => ({ n: k.ma, v: k.du * T, hien: ty(k.du * T) })),
    };
    return (
      <div className="space-y-4">
        <Tieu tieu="Phân tích phải trả" />
        <Khoi so={cot} />
        <KhoiTest id="bt-ap-tuoi" />
        <p className="text-sm text-slate-600">Tổng {ty(AP_TONG * T)}, quá hạn {ty(AP_QUA * T)}.</p>
      </div>
    );
  }
  if (id === 'ap_ck') {
    return (
      <div className="space-y-4">
        <Tieu tieu="Cam kết thanh toán" />
        <KhoiTest id="bt-ap-ck" />
      </div>
    );
  }
  if (id === 'tien') {
    return (
      <div className="space-y-4">
        <Tieu tieu="Dashboard dòng tiền" />
        <KhoiTest id="bt-tien-kpi" />
        <KhoiTest id="bt-tien-tuan" />
      </div>
    );
  }
  if (id === 'vi_the') {
    return (
      <div className="space-y-4">
        <Tieu tieu="Cash position" />
        <KhoiTest id="bt-tien-vi" />
      </div>
    );
  }
  if (id === 'dong_tien' || id === 'fc13' || id === 'lech') {
    return (
      <div className="space-y-4">
        <Tieu tieu={id === 'fc13' ? 'Forecast 13 tuần' : id === 'lech' ? 'Cash gap' : 'Cash flow'} />
        {id !== 'lech' ? <KhoiTest id="bt-tien-tuan" /> : null}
        <KhoiTest id={id === 'lech' ? 'bt-tien-lech' : 'bt-tien-du'} />
        <Bang
          tieu="Từng tuần"
          c={['Tuần', 'Ngày', 'Thu', 'Chi', 'Thuần', 'Số dư cuối']}
          d={TUAN_13.map((w, i) => [w, NGAY_TUAN[i], ty(THU_13[i] * T), ty(CHI_13[i] * T), ty((THU_13[i] - CHI_13[i]) * T), ty(DU_13[i] * T)])}
        />
      </div>
    );
  }
  if (id === 'kich_ban') {
    const pa = [
      { ten: 'Cơ sở', heSoThu: 1, heSoChi: 1 },
      { ten: 'Chậm thu', heSoThu: 0.8, heSoChi: 1 },
      { ten: 'Đẩy chi', heSoThu: 1, heSoChi: 1.1 },
    ];
    return (
      <div className="space-y-4">
        <Tieu tieu="Kịch bản dòng tiền" />
        <Bang
          tieu="Ba phương án trên cùng chuỗi 13 tuần"
          c={['Phương án', 'Thu', 'Chi', 'Thuần', 'Số dư cuối W13']}
          d={pa.map((p) => {
            const thu = THU_13.reduce((s, n) => s + n, 0) * p.heSoThu;
            const chi = CHI_13.reduce((s, n) => s + n, 0) * p.heSoChi;
            let du = 88;
            TUAN_13.forEach((_, i) => {
              du += THU_13[i] * p.heSoThu - CHI_13[i] * p.heSoChi;
            });
            return [p.ten, ty(thu * T), ty(chi * T), ty((thu - chi) * T), ty(du * T)];
          })}
        />
      </div>
    );
  }
  if (id === 'nhu_cau') {
    return (
      <div className="space-y-4">
        <Tieu tieu="Nhu cầu mua hàng" />
        <Bang tieu="Theo nhóm" c={['Nhóm', 'Nhu cầu', 'Thời điểm']} d={NHOM_MUA.map((g) => [g.n, ty(g.nhuCau * T), '13 tuần tới'])} />
      </div>
    );
  }
  if (id === 'kh_mua') {
    return (
      <div className="space-y-4">
        <Tieu tieu="Kế hoạch mua" />
        <KhoiTest id="bt-mua-kpi" />
        <Bang tieu="Đã duyệt theo nhóm" c={['Nhóm', 'Kế hoạch', 'Đã duyệt']} d={NHOM_MUA.map((g) => [g.n, ty(g.keHoach * T), ty(g.duyet * T)])} />
      </div>
    );
  }
  if (id === 'po' || id === 'lien_ap') {
    return (
      <div className="space-y-4">
        <Tieu tieu={id === 'po' ? 'Đơn đặt mua' : 'Liên kết phải trả'} />
        <KhoiTest id="bt-mua-po" />
      </div>
    );
  }
  if (id === 'tien_do') {
    return (
      <div className="space-y-4">
        <Tieu tieu="Tiến độ thực hiện" />
        <KhoiTest id="bt-mua-tien-do" />
      </div>
    );
  }
  if (id === 'ngan_sach') {
    return (
      <div className="space-y-4">
        <Tieu tieu="Ngân sách mua" />
        <Bang
          tieu="Ngân sách và đã dùng"
          c={['Nhóm', 'Ngân sách', 'Đã dùng', 'Còn lại']}
          d={NHOM_MUA.map((g) => [g.n, ty(g.nganSach * T), ty(g.dung * T), ty((g.nganSach - g.dung) * T)])}
        />
      </div>
    );
  }
  if (id === 'cb_ap' || id === 'cb_tien' || id === 'cb_mua') {
    const dong =
      id === 'cb_ap'
        ? NCC.filter((k) => k.quaHan > 0).map((k) => ['30/06/2026', 'Phải trả', `${k.ma} quá hạn`, ty(k.quaHan * T), 'Cao', 'Chưa xử lý'])
        : id === 'cb_tien'
          ? DU_13.map((du, i) => (du < 10 ? [NGAY_TUAN[i] + '/2026', 'Dòng tiền', `${TUAN_13[i]} dưới 10 tỷ`, ty(du * T), du < 0 ? 'Cao' : 'Trung bình', 'Chưa xử lý'] : null)).filter((x): x is string[] => x != null)
          : [['30/06/2026', 'Mua hàng', 'Hóa chất phụ vượt ngân sách', ty(1 * T), 'Trung bình', 'Chưa xử lý'], ['30/06/2026', 'Mua hàng', 'PO-2405 trễ tiến độ', ty(11 * T), 'Cao', 'Chưa xử lý']];
    return (
      <div className="space-y-4">
        <Tieu tieu={id === 'cb_ap' ? 'Cảnh báo phải trả' : id === 'cb_tien' ? 'Cảnh báo dòng tiền' : 'Cảnh báo mua hàng'} />
        <Bang tieu="Việc cần xử lý" c={['Ngày', 'Phân hệ', 'Nội dung', 'Giá trị', 'Mức', 'Trạng thái']} d={dong} />
      </div>
    );
  }
  if (id === 'phieuthu') {
    return (
      <div className="space-y-4">
        <Tieu tieu="Thu tiền và phiếu thu" />
        <Bang
          tieu="Phiếu minh họa trong tuần. Không làm đổi dư nợ phải thu trên sổ Excel."
          c={['Số phiếu', 'Ngày', 'Nội dung', 'Số tiền']}
          d={[
            ['PT-T26-01', '22/06/2026', 'Thu khách trong tuần', '0,20 tỷ'],
            ['PT-T26-02', '24/06/2026', 'Thu khách trong tuần', '0,16 tỷ'],
          ]}
        />
      </div>
    );
  }
  if (id === 'socal') {
    return (
      <div className="space-y-4">
        <Tieu tieu="Sổ cái kế toán" />
        <Bang
          tieu="Bút toán minh họa, chưa phải sổ đã khóa."
          c={['Ngày', 'Diễn giải', 'Nợ', 'Có', 'Số tiền']}
          d={[
            ['30/06/2026', 'Ghi nhận phải thu', '131', '511', 'Theo sổ phải thu'],
            ['30/06/2026', 'Ghi nhận phải trả', '156', '331', ty(AP_TONG * T)],
            ['30/06/2026', 'Số dư tiền', '111', '—', ty(60 * T)],
            ['30/06/2026', 'Nhập kho theo đơn mua đã về', '152', '331', ty(44 * T)],
          ]}
        />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <Tieu tieu="Khóa kỳ và đối chiếu" />
      <Bang
        tieu="Trạng thái kỳ. Chưa khóa."
        c={['Phân hệ', 'Nguồn', 'Trạng thái']}
        d={[
          ['Phải thu', 'File Excel', coSoThu ? 'Đã nạp, đối chiếu trên màn Nạp dữ liệu' : 'Chưa nạp'],
          ['Phải trả', 'Dashboard TC2', `Tổng ${ty(AP_TONG * T)}, khớp 186,5 tỷ trên bảng trình bày`],
          ['Dòng tiền', 'Dashboard TC2', '13 tuần, số dư thấp nhất tại W8'],
          ['Mua hàng', 'Bộ test xem màn', 'Năm đơn mua'],
        ]}
      />
      <p className="text-sm text-slate-500">Tài khoản tiền đang có: {TK_TIEN.map((t) => t[1]).join(', ')}.</p>
    </div>
  );
}
