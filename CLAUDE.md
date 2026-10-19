# Quản trị Công nợ Tân Phú Cường

SPA React 19 + Vite 6 + Tailwind 4 + TypeScript (strict). Chạy hoàn toàn phía client: người dùng nạp sổ Excel → tính chỉ số công nợ (AR/AP, tuổi nợ, chấm điểm, cảnh báo) → xem dashboard → xuất PDF.

## Lệnh
- `npm run dev` — cổng 3000 (strictPort)
- `npm run lint` — `tsc --noEmit`, chạy sau mỗi lần sửa code
- `npm test` — Vitest (`src/lib/metrics.test.ts`, gồm kiểm tra sổ mẫu khớp toàn bộ đáp án)
- `npm run build`
- `node scripts/tao-so-ky-sau.mjs` — sinh `excel/CongNo_Test_Ky_07_2026.xlsx`: kỳ 07 nối tiếp sổ demo, `Dap_an` tính độc lập, sheet `Huong_dan_test` mô tả tình huống S1–S7
- `node scripts/tao-mau.mjs` — sinh `public/mau/*.xlsx` (dùng `exceljs`, devDependency)

## Luồng dữ liệu
`.xlsx` → `lib/parseWorkbook.ts` (`parseWorkbook`) → `lib/metrics.ts` (`lapKy` → `KetQua`) → `locThoiGian.tsx` (`apDungBoLocThoiGian`) → `soLieu.ts` (`chonTu` → `Chon`, `soKhoi(id, chon)` → số cho từng khối) → màn hình.
- Tệp sổ lưu IndexedDB (`luuSo.ts`); chỉnh tay (`Tay`) lưu localStorage theo checksum (`soLieu.ts` `docTay/luuTay`).
- Không có số giả ở frontend. Phân hệ chưa có nguồn (phải trả, dòng tiền, mua hàng, sổ cái…) là mục khóa «Sắp có» (`ManSapCo` trong `khung.tsx`).

## Bản đồ file (src/)
- `App.tsx` — state gốc, điều hướng 7 màn (Tổng quan có tab Danh mục/Tuần/TC1/TC2; Khách hàng có tab Kế hoạch tuần), chế độ web/app
- `khung.tsx` — `ManId`, menu (`NHOM`), sidebar, `ThanhTab`, `ManSapCo` · `giaoDien.tsx` — thẻ `The`, `Nhan`, `DongHo`, `VongNhieu`, `ThanhNgang`
- Màn: `manTongQuan.tsx` · `manPhanTich.tsx` (Tuổi nợ, Tín dụng) · `manKhachHang.tsx` (Cảnh báo Kanban, danh sách khách) · `manHoSo.tsx` · `man.tsx` (Nạp, tab TC1/TC2/tuần, kế hoạch, thêm tay) · `manMobile.tsx` — giao diện mobile
- `khoi.tsx` — khối biểu đồ (recharts) · `format.ts` — định dạng số/ngày, `docSoTien` · `mauDiem.ts` — thang điểm/hạn mức
- In ấn: `soan.tsx` (màn soạn) · `baoCao/` (3 mẫu in HTML theo template khách, màu navy riêng) · `pdfThu.ts` (biên bản đối chiếu, thư nhắc nợ, `taiXuong`)
- `vite.config.ts` — middleware phục vụ `/api/font/arial.ttf` và `/mau-test/CongNo_Demo_Test.xlsx`

## Design system
- Token màu khai báo bằng `@theme` trong `src/index.css`: `primary` (Indigo #4f46e5), `line`, `foreground`, `subtle`, `muted`, `risk-safe/watch/overdue/bad/info` (+ `-soft`), `aging-1..11`, `shadow-card`, `rounded-the`. Font Be Vietnam Pro.
- Dùng class token (`text-primary`, `border-line`, `bg-risk-bad-soft`…), không viết mã hex trong component. Biểu đồ recharts lấy màu từ `src/mauSac.ts` (cùng giá trị với token); chuỗi cạnh nhau dùng `DAY_MAU` để luôn khác màu, hạng Xấu = cam vàng, Rất xấu = đỏ.
- Báo cáo in (`src/baoCao/`) giữ bảng màu navy theo mẫu khách, không dùng token app.

## Quy ước
- Tên biến/hàm/file bằng tiếng Việt không dấu, viết tắt ngắn (`ky`, `tay`, `chon`, `khoi`, `man`); giữ đúng phong cách này.
- UI và chuỗi hiển thị tiếng Việt có dấu.
- Không đọc `package-lock.json`, `public/font/`, file `.xlsx` trừ khi cần.
- File lớn (`soLieu.ts`, `man.tsx`, `manMobile.tsx`, `metrics.ts`): tìm theo symbol (Serena/Grep) thay vì đọc cả file.
