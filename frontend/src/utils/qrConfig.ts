/**
 * Cấu hình tập trung địa chỉ cơ sở và tạo mã QR gọi món cho từng bàn ăn.
 *
 * Đảm bảo:
 * 1. Khi admin mở giao diện quản trị trên localhost, mã QR sinh ra cho điện thoại
 *    vẫn nhúng đúng địa chỉ IP LAN (ví dụ: http://192.168.12.75:5173).
 * 2. Loại bỏ hoàn toàn tên miền mẫu 'https://huycv.vn'.
 * 3. Bảo toàn chính xác mã bàn/định danh (B01, B02, BÀN 01,...) không gán cứng hay biến đổi sai lệch.
 * 4. Xem trước, tải ảnh, in ấn đều dùng chung một nguồn sinh QR duy nhất.
 */

// Địa chỉ IP LAN mặc định đã được xác minh trên card mạng Wi-Fi
export const DEFAULT_LAN_IP = '192.168.12.75';
export const DEFAULT_FRONTEND_PORT = '5173';

/**
 * Xác định Base URL thực tế dành cho điện thoại quét mã QR.
 */
export function getPublicBaseUrl(): string {
  // 1. Ưu tiên cấu hình tường minh từ biến môi trường
  const envPublicUrl = import.meta.env.VITE_PUBLIC_URL;
  if (envPublicUrl && typeof envPublicUrl === 'string' && envPublicUrl.trim()) {
    return envPublicUrl.trim().replace(/\/+$/, '');
  }

  const envLanHost = import.meta.env.VITE_LAN_HOST;
  if (envLanHost && typeof envLanHost === 'string' && envLanHost.trim()) {
    return `http://${envLanHost.trim()}:${DEFAULT_FRONTEND_PORT}`;
  }

  // 2. Nếu đang chạy trên trình duyệt client và không phải localhost (ví dụ đang truy cập bằng IP LAN)
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return window.location.origin;
    }
  }

  // 3. Khi mở trên laptop qua localhost, sinh QR nhúng địa chỉ LAN để điện thoại quét được
  return `http://${DEFAULT_LAN_IP}:${DEFAULT_FRONTEND_PORT}`;
}

/**
 * Xây dựng URL khách gọi món theo số/mã bàn.
 * Ví dụ: http://192.168.12.75:5173/#/?table=B01
 */
export function buildTableOrderUrl(tableIdentifier: string): string {
  const baseUrl = getPublicBaseUrl();
  const cleanId = (tableIdentifier || '').trim();
  return `${baseUrl}/#/?table=${encodeURIComponent(cleanId)}`;
}

/**
 * Xây dựng URL hình ảnh mã QR (QR Server API) phục vụ hiển thị, in ấn và tải về.
 */
export function buildTableQrCodeUrl(tableIdentifier: string, size: number = 250): string {
  const orderUrl = buildTableOrderUrl(tableIdentifier);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(orderUrl)}`;
}

