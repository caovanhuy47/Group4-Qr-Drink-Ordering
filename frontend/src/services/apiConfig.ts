/**
 * Cấu hình tập trung API Base URL cho toàn bộ frontend client.
 *
 * Mặc định để chuỗi rỗng '' để fetch() gọi đường dẫn tương đối (relative path, ví dụ: /api/dishes).
 * Khi đó, Vite Dev Server trên laptop sẽ tự động proxy request này sang Backend (http://localhost:3000).
 * Nhờ đó, điện thoại kết nối qua mạng LAN (http://<IP-LAN>:5173) gọi API hoàn toàn trong suốt,
 * không bị lỗi gán cứng localhost hay lỗi CORS.
 *
 * Nếu triển khai production hoặc backend độc lập, cấu hình VITE_API_BASE_URL trong .env.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

