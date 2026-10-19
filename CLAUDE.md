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
- `boTest.ts`: số giả cho các màn TC2/AP/tiền chưa có dữ liệu thật (`MAN_BO` trong `App.tsx`) — không lấy từ Excel.

## Bản đồ file (src/)
- `App.tsx` — state gốc, điều hướng màn, chế độ web/app (mobile)
- `khung.tsx` — `ManId`, sidebar, thanh lọc · `man.tsx` — các màn chính · `manKhac.tsx` — màn dùng số test · `manMobile.tsx` — giao diện mobile
- `khoi.tsx` — khối biểu đồ (recharts) · `format.ts` — định dạng số/ngày · `mauDiem.ts` — thang điểm/hạn mức
- In ấn: `soan.tsx` (soạn) · `mauIn.ts` (khung mẫu) · `xemMau.tsx` (xem trước) · `pdf.ts`, `pdfMau.ts` (pdf-lib + fontkit)
- `vite.config.ts` — middleware phục vụ `/api/font/arial.ttf` và `/mau-test/CongNo_Demo_Test.xlsx`

## Quy ước
- Tên biến/hàm/file bằng tiếng Việt không dấu, viết tắt ngắn (`ky`, `tay`, `chon`, `khoi`, `man`); giữ đúng phong cách này.
- UI và chuỗi hiển thị tiếng Việt có dấu.
- Không đọc `package-lock.json`, `public/font/`, file `.xlsx` trừ khi cần.
- File lớn (`soLieu.ts`, `man.tsx`, `manMobile.tsx`, `metrics.ts`): tìm theo symbol (Serena/Grep) thay vì đọc cả file.
