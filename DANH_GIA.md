# Đánh giá bản demo — Quản trị Công nợ Tân Phú Cường

*Ngày đánh giá: 19/10/2026 · chạy trên sổ mẫu `public/mau-test/CongNo_Demo_Test.xlsx`*

## 1. Mô tả chung hệ thống

**Quản trị Công nợ Tân Phú Cường** là ứng dụng web giúp Ban Giám đốc, kế toán công nợ và phòng kinh doanh của Công ty CP XNK Hóa chất Tân Phú Cường theo dõi công nợ phải thu (AR), đánh giá rủi ro tín dụng khách hàng và lập báo cáo định kỳ.

Người dùng nạp sổ công nợ xuất từ phần mềm kế toán dưới dạng Excel. Sheet bắt buộc là `Imp_BCCN&TT`. Các sheet tuỳ chọn gồm danh mục khách hàng, tổng hợp công nợ, doanh số, hàng đặt, tiền cọc, nợ khó đòi, điểm và ngưỡng chấm điểm. Hệ thống tự đối chiếu số dư đầu kỳ, phát sinh và cuối kỳ với sổ tổng hợp.

Từ dữ liệu này, hệ thống tính:
- tuổi nợ theo 11 nhóm;
- DSO;
- tỷ lệ quá hạn và trọng số rủi ro;
- điểm tín dụng 1–5 theo 6 tiêu chí TC-1;
- cảnh báo vượt hạn mức, chưa có hạn mức, nợ xấu và quá hạn trên 365 ngày.

Kết quả hiển thị trên các dashboard có lọc theo tháng, quý, nhân viên sale và hạng khách. Có hồ sơ từng khách hàng, giao diện riêng cho điện thoại, và xuất báo cáo PDF theo mẫu (TC1, báo cáo tuần, báo cáo khách hàng).

Ứng dụng chạy hoàn toàn trên trình duyệt (React 19, Vite, Tailwind, pdf-lib). Dữ liệu lưu cục bộ, không có máy chủ. Ở bản demo, chỉ phân hệ phải thu dùng số liệu thật. Các phân hệ phải trả (AP), dòng tiền, kế hoạch mua hàng và sổ cái mới là khung giao diện với số minh hoạ.

## 2. Kết quả chạy thử

| Hạng mục | Kết quả |
|---|---|
| `npm install` | OK. Có 1 lỗ hổng mức *high* ở `xlsx@0.18.5` (Prototype Pollution, ReDoS), bản trên npm không có bản vá |
| `npm run lint` (tsc) | Sạch, 0 lỗi |
| `npm run build` | OK. Bundle JS **2,38 MB** (gzip 882 KB), chưa tách chunk |
| Nạp sổ mẫu | Đọc được, **24/24 phép đối chiếu khớp** (đầu kỳ, phát sinh, cuối kỳ, đáp án điểm 120/120 khách) |
| Console | Không có lỗi |
| Màn AR (Tổng quan, Báo cáo) | Hiển thị đầy đủ KPI, biểu đồ, top rủi ro, bản xem trước PDF |
| Màn AP / Dòng tiền / Mua / Sổ cái | Chỉ hiện số minh hoạ từ `src/boTest.ts`, có dòng ghi chú "không lấy từ sổ Excel" |
| Mobile 375px | Chế độ App ổn. Chế độ Web **vỡ layout** (sidebar không thu, nội dung bị ép còn 1/3 màn) |

## 3. Đánh giá

### Điểm mạnh
- **Logic đối chiếu tốt**: màn Nạp dữ liệu tự kiểm tra cân đối sổ và so với "đáp án" trong Excel. Đây là điểm rất thuyết phục khi demo cho khách là kế toán.
- Chấm điểm tín dụng minh bạch: có từng thành phần TC-1-1 đến TC-1-6, ngưỡng đọc từ Excel và cho phép dùng điểm nhập tay (`lib/metrics.ts` `chamMotKhach`).
- Báo cáo PDF có nhiều mẫu và khổ giấy; bố cục khung kéo thả bằng `react-rnd`.
- Có cả giao diện Web lẫn Mobile riêng; sổ đã nạp được nhớ lại qua IndexedDB.
- Code TypeScript strict, build sạch, đặt tên nhất quán.

### Thiếu sót và rủi ro

**Chức năng**

| # | Vấn đề | Ưu tiên |
|---|---|---|
| F1 | 24/34 màn là khung trống hoặc số giả (`TRONG` trong `src/khung.tsx`, `MAN_BO` trong `src/App.tsx`). Cả AP, dòng tiền, mua hàng, phiếu thu, sổ cái và khóa kỳ đều chưa có dữ liệu thật | Cao |
| F2 | ✅ *Đã sửa:* gỡ khối số minh họa khỏi Tổng quan, thay bằng một dòng chỉ sang các mục «Sắp có». Trước đó: màn **Tổng quan** trộn số thật (AR ~13 tỷ) với số giả quy mô khác hẳn (dòng thu/chi tuần 20–70 tỷ, AP 186 tỷ). Khách dễ hiểu nhầm dù có dòng ghi chú | Cao |
| F3 | 🟡 *Đã làm một phần:* hồ sơ khách có nút xuất **Biên bản đối chiếu công nợ** và **Thư nhắc thanh toán** (PDF A4, có số tiền bằng chữ, `src/pdfThu.ts`). Còn thiếu: giao việc, cam kết trả, gửi email. Trước đó: chưa có quy trình nghiệp vụ: giao việc thu nợ cho sale, ghi nhận cam kết trả, lịch sử liên hệ, gửi thư nhắc hoặc biên bản đối chiếu công nợ cho khách | Trung bình |
| F4 | Không có phân quyền hay đăng nhập; mọi người dùng thấy toàn bộ khách hàng và mọi sale | Trung bình (bắt buộc khi lên production) |

**Logic số liệu**

| # | Vấn đề | Vị trí | Ưu tiên |
|---|---|---|---|
| L1 | ✅ *Đã sửa (Web và Mobile):* chú thích liệt kê cả nhóm âm nên cộng khớp tổng dư nợ; biểu đồ tròn vẫn chỉ vẽ nhóm dương. Trước đó: Tổng quan ghi "Trong hạn 1,23 tỷ", nhưng biểu đồ tuổi nợ ghi "Chưa đến hạn 1,32 tỷ". Các nhóm trên biểu đồ cộng lại 13,47 tỷ ≠ 13,38 tỷ. Nguyên nhân: biểu đồ lọc bỏ nhóm có giá trị âm (`traTruocHan` = −0,09 tỷ) | `src/man.tsx:515` | Cao: số lệch ngay trên màn đầu tiên |
| L2 | Chứng từ thiếu hạn thanh toán được coi là hạn 0 ngày, tức quá hạn ngay từ ngày hoá đơn. ✅ *Đã sửa:* `lapKy` gán hạn của khách (`hanDinh`: hạn trong DMKH, nếu không có thì lấy hạn bình quân các chứng từ khác) rồi tính lại tuổi nợ. Sổ mẫu không có dòng nào thiếu hạn nên số demo không đổi; tỷ lệ quá hạn 90,8% là do chính dữ liệu mẫu | `lib/metrics.ts` `tinhSoNgayQH` | Cao |
| L3 | Điểm tín dụng là trung bình cộng của các tiêu chí có dữ liệu. Tiêu chí nào thiếu thì bị bỏ, không có trọng số. Vì vậy hai khách có độ đầy đủ dữ liệu khác nhau không so sánh được với nhau | `chamMotKhach` | Trung bình |
| L4 | DSO tính trên dư nợ cuối kỳ, không phải dư nợ bình quân, nên dễ bị méo khi cuối kỳ có hoá đơn lớn | `tongHop` | Thấp |
| L5 | Ngưỡng chấm điểm vẫn là "ngưỡng tạm để chạy demo" và chưa được kế toán xác nhận | `NGUONG_MAC_DINH` | Trung bình |
| L6 | 7 mã khách có chứng từ nhưng không có trong danh mục khách hàng; tên khách đang hiển thị bằng mã (KH0004…) | dữ liệu mẫu | Thấp |

**UX / Design**

| # | Vấn đề | Ưu tiên |
|---|---|---|
| U1 | ✅ *Đã sửa:* màn hình rộng dưới 768px luôn mở bản App, kể cả khi trước đó đã chọn Web. Trước đó: Chế độ Web trên điện thoại bị vỡ layout. Lựa chọn Web/App lưu trong localStorage được ưu tiên hơn việc tự nhận kích thước màn hình | Trung bình |
| U2 | ✅ *Đã sửa:* gắn nhãn «Sắp có» trên menu (nhóm toàn màn trống thì thu gọn sẵn) và trên tiêu đề màn. Trước đó: sidebar 34 mục, phần lớn là màn trống, làm loãng bản demo. Nên ẩn hoặc gắn nhãn "Sắp có" | Cao (cho buổi demo) |
| U3 | ✅ *Đã sửa:* sidebar đổi thành «Tân Phú Cường · Quản trị công nợ»; nhãn menu chuyển sang tiếng Việt (Tổng quan phải thu/phải trả, Số dư tiền, Lưu chuyển tiền, Dự báo 13 tuần, Thiếu hụt tiền…). Tên mẫu TC1/TC2 vẫn giữ. Trước đó: Tên ứng dụng chưa thống nhất: "Finance Hub / Debt Management" ở sidebar và "Quản trị Công nợ Tân Phú Cường" ở tiêu đề. Nhãn trộn Anh–Việt ("Cash gap", "Aging AP", "Forecast 13 tuần") | Thấp |
| U4 | ✅ *Đã sửa:* thanh công cụ báo cáo co giãn và xuống dòng, không còn bị tràn. Trước đó: Màn Báo cáo: thanh tab bị tràn ("Xóa bộ lọ…"); ảnh xem trước nhỏ, khó đọc | Thấp |
| U5 | ✅ *Đã sửa:* file sai cấu trúc hiện khung lỗi kèm hướng dẫn và ẩn bảng đối chiếu; sổ đúng hiện «Khớp x/y phép đối chiếu», dòng Lệch tô đỏ. Trước đó: Chưa có trạng thái rỗng, đang tải hay lỗi nhất quán cho file Excel sai cấu trúc ngoài thông báo text | Thấp |

**Kỹ thuật**

| # | Vấn đề | Ưu tiên |
|---|---|---|
| K1 | ✅ *Đã sửa:* thêm Vitest (`npm test`) với 7 test trong `src/lib/metrics.test.ts`: biên tuổi nợ, hạn mặc định, tổng nhóm = dư nợ, xếp hạng, và toàn bộ đối chiếu/đáp án của sổ mẫu. Trước đó: Không có test nào. Logic tài chính (`metrics.ts`, `soLieu.ts`) rất cần unit test, có thể lấy chính sheet "đáp án" làm dữ liệu test | Cao |
| K2 | ✅ *Đã sửa:* nâng lên `xlsx@0.20.3` từ CDN chính thức của SheetJS, sổ mẫu vẫn khớp 24/24. `npm audit` còn 2 cảnh báo mức trung bình qua `exceljs` → `uuid`; exceljs chỉ dùng cho script sinh file mẫu, không nằm trong app. Trước đó: `xlsx@0.18.5` có lỗ hổng. Bản mới của SheetJS chỉ phát hành qua CDN của họ, không qua npm | Trung bình |
| K3 | Một số file quá lớn: `soLieu.ts` 1.206 dòng, `man.tsx` 981, `manMobile.tsx` 933 | Thấp |
| K4 | ✅ *Đã sửa:* tách chunk (biểu đồ, excel, pdf); pdf-lib chỉ nạp khi bấm xuất. Trang đầu tải khoảng 1,24 MB thay vì 2,38 MB. Trước đó: Bundle 2,4 MB chưa tách theo màn (pdf-lib, xlsx, recharts nạp ngay từ đầu) | Thấp |
| K5 | ✅ *Đã sửa:* thêm `exceljs` vào devDependencies. `metadata.json` giữ nguyên vì có thể vẫn cần khi triển khai trên AI Studio. Trước đó: `scripts/tao-mau.mjs` dùng `exceljs` nhưng thiếu trong `package.json`. `metadata.json` còn là cấu hình của AI Studio (khai báo Gemini) dù app không dùng | Thấp |
| K6 | Dữ liệu chỉ nằm trên trình duyệt của từng máy: không chia sẻ được, không có lịch sử kỳ, mất khi xoá dữ liệu trình duyệt | Cao (khi lên production) |

### Các mục chưa sửa và lý do
- **L3, L4, L5 (công thức điểm, DSO, ngưỡng):** sổ mẫu có sheet đáp án tính theo đúng công thức hiện tại. Đổi công thức sẽ làm bảng đối chiếu báo «Lệch» ngay trong buổi demo. Cần kế toán Tân Phú Cường chốt công thức trước, rồi cập nhật đáp án và code cùng lúc.
- **L6:** đây là đặc điểm của dữ liệu mẫu (7 mã không có trong DMKH, tên khách để trống). Nên sửa trong file Excel mẫu.
- **K3 (tách file lớn):** chỉ là refactor, không thay đổi gì khi demo; nên làm khi bắt đầu phát triển thật.
- **F1, F3, F4, K6:** là tính năng hoặc kiến trúc mới (phân hệ AP và dòng tiền thật, quy trình thu nợ, backend, phân quyền). Cần chốt yêu cầu và cấu trúc dữ liệu với khách trước khi làm.

## 4. Lộ trình đề xuất

1. **Trước buổi demo (1–2 ngày):** sửa L1 và L2; ẩn hoặc gắn nhãn "Sắp có" cho các màn trống (U2); tách số minh hoạ ra khỏi Tổng quan hoặc đưa về cùng quy mô (F2); thống nhất tên và nhãn (U3).
2. **Củng cố logic AR:** viết unit test cho `metrics.ts`, dùng sheet đáp án làm dữ liệu (K1); chốt ngưỡng và trọng số chấm điểm với kế toán (L3, L5).
3. **Mở rộng phân hệ:** AP và dòng tiền dùng chung pipeline Excel → `lapKy` (F1). Sau đó làm quy trình thu nợ (F3).
4. **Lên production:** thêm backend và cơ sở dữ liệu để lưu nhiều kỳ, có đăng nhập và phân quyền theo sale (F4, K6); thay hoặc khoá phiên bản `xlsx` (K2); tách bundle (K4).

## 5. Bộ skill / plugin nên bổ sung

**Đã có sẵn trong phiên, dùng được ngay**

| Skill | Dùng cho |
|---|---|
| `design:design-critique` | Phê bình từng màn dashboard (thứ bậc thông tin, mật độ) |
| `design:accessibility-review` | Kiểm tra độ tương phản màu tuổi nợ, kích thước chữ trên mobile |
| `design:ux-copy` | Thống nhất nhãn Việt hoá, thông báo lỗi khi nạp Excel |
| `design:design-system` | Gom token màu và component (thẻ KPI, bảng, biểu đồ) |
| `dataviz` | Chuẩn hoá biểu đồ: bảng màu tuổi nợ, trục, chú thích |
| `data:validate-data`, `data:explore-data` | Rà soát số liệu sổ Excel, kiểm tra tính toán trước khi demo |
| `code-review`, `simplify` | Review và tách các file lớn |

**Nên cài thêm**

| Plugin / skill | Nguồn | Lý do |
|---|---|---|
| **Finance** (Anthropic) | Anthropic Directory · [knowledge-work-plugins/finance](https://github.com/anthropics/knowledge-work-plugins) | Có sẵn reconciliation, close-management, variance-analysis, journal-entry. Khớp với khóa kỳ, đối chiếu và sổ cái mà app còn thiếu |
| **frontend-design** (Anthropic) | Anthropic Directory · [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | Nâng chất lượng UI React/Tailwind, tránh giao diện "mặc định" |
| **webapp-testing** (Anthropic) | [anthropics/skills](https://superdesign.dev/blog/best-claude-code-skills) | Test E2E bằng Playwright: nạp Excel → kiểm tra số trên màn |
| Countz Accounting *(tham khảo)* | Anthropic Directory, cộng đồng | Có skill accounts-receivable, tieout, recon. Cần tài khoản Countz, nên chỉ để tham khảo cách làm |
| Kết nối Figma | Plugin Design (đã bật) | Cần đăng nhập Figma trong cài đặt connector nếu có bản thiết kế |

Không tìm thấy skill nào riêng cho nghiệp vụ công nợ theo chuẩn kế toán Việt Nam (VAS, TT200/TT133). Nên tự viết một skill nội bộ bằng `skill-creator`. Nội dung gồm: định nghĩa 11 nhóm tuổi nợ, công thức DSO, tiêu chí TC-1, ngưỡng của Tân Phú Cường, và cấu trúc các sheet `Imp_*`. Đây là nơi tiết kiệm token tốt nhất, vì mỗi phiên sẽ không phải đọc lại logic.
