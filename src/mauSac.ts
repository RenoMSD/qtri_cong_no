import type { BucketKey, Hang } from './lib/metrics';

// Bảng màu cho biểu đồ (recharts không đọc được biến CSS trong thuộc tính SVG).
// Giữ đồng bộ với token trong src/index.css. Palette Indigo (Modern FinTech).

export const MAU = {
  primary: '#4f46e5',
  primaryGlow: '#818cf8',
  primarySoft: '#eef2ff',
  nen: '#f8fafc',
  line: '#e2e8f0',
  foreground: '#0f172a',
  subtle: '#475569',
  muted: '#64748b',
  safe: '#16a34a',
  watch: '#d97706',
  overdue: '#ea580c',
  bad: '#dc2626',
  info: '#2563eb',
} as const;

/** Bộ 6 màu phân loại cho chuỗi số liệu không mang nghĩa rủi ro: các chuỗi đặt cạnh nhau luôn khác màu. */
export const DAY_MAU = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#4f46e5'];

export const MAU_BUCKET: Record<BucketKey, string> = {
  chuaDenHan: '#10b981',
  traTruocHan: '#06b6d4',
  denHan: '#3b82f6',
  d0_30: '#a3e635',
  d31_60: '#facc15',
  d61_90: '#f59e0b',
  d91_120: '#fb923c',
  d121_150: '#f97316',
  d151_180: '#ef4444',
  d181_365: '#dc2626',
  d365: '#991b1b',
};

/** Màu hạng khách: Xấu dùng cam vàng để khác hẳn Rất xấu (đỏ). */
export const MAU_HANG: Record<Hang | string, string> = {
  'Tốt': '#16a34a',
  'Trung bình': '#2563eb',
  'Xấu': '#f59e0b',
  'Rất xấu': '#dc2626',
  'Chưa chấm': '#64748b',
};
