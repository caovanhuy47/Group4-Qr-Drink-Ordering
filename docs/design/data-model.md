# Mô Hình Dữ Liệu & Thực Thể Cơ Sở Dữ Liệu (Data Model)

Tài liệu đặc tả chi tiết cấu trúc dữ liệu, các bảng trong MySQL và các kiểu dữ liệu snapshot được sử dụng trong hệ thống **Huy CV — Quán Vỉa Hè**.

---

## 1. Sơ Đồ Thực Thể Hiện Có Trong MySQL (Entity-Relationship)

```mermaid
erDiagram
    CATEGORIES ||--o{ DISHES : "chứa danh sách món"
    STAFF ||--o{ TABLE_SESSION_RECORDS : "xác nhận thu tiền"
    
    CATEGORIES {
        varchar id PK
        varchar name "Tên danh mục"
        varchar icon "Tên icon Material Symbols"
        int displayOrder "Thứ tự sắp xếp"
        datetime createdAt
        datetime updatedAt
    }

    DISHES {
        varchar id PK
        varchar name "Tên món ăn"
        text description "Mô tả hương vị"
        int price "Giá bán VNĐ"
        int oldPrice "Giá gốc khuyến mãi"
        text image "URL ảnh món"
        varchar categoryId FK "Mã danh mục"
        varchar categoryName "Tên danh mục hiển thị"
        varchar badge "Nhãn đặc biệt"
        varchar badgeType "Kiểu nhãn: hot, veg, new"
        boolean isAvailable "Còn món / Hết món"
        boolean isArchived "Ẩn khỏi thực đơn"
        json sizes "Danh sách size cộng giá"
        json toppings "Danh sách topping cộng giá"
        datetime createdAt
        datetime updatedAt
    }

    BANNERS {
        varchar id PK
        varchar adminName "Tên quản lý nội bộ"
        varchar title "Tiêu đề banner"
        text description "Nội dung khuyến mãi"
        varchar tag "Nhãn tag"
        varchar discountBadge "Badge giảm giá"
        varchar priceNote "Ghi chú giá"
        varchar ctaText "Chữ nút bấm"
        varchar bgGradient "Mã màu gradient Tailwind"
        text imageUrl "URL ảnh chính"
        text mobileImageUrl "URL ảnh di động"
        varchar linkType "dish, category, none, custom"
        varchar linkTargetId "ID món hoặc danh mục"
        int displayOrder "Thứ tự hiển thị carousel"
        boolean isActive "Đang bật / Đang tắt"
        datetime createdAt
        datetime updatedAt
    }

    STAFF {
        varchar id PK "Mã nhân viên, e.g. staff-1"
        varchar name "Họ và tên"
        varchar username UK "Tên đăng nhập"
        varchar passwordHash "Mật khẩu băm PBKDF2"
        varchar role "admin, cashier, waiter, kitchen"
        varchar roleName "Tên chức danh hiển thị"
        varchar phone "Số điện thoại"
        varchar shift "Ca làm việc"
        varchar status "active, suspended"
        boolean canViewTables "Xem sơ đồ bàn"
        boolean canCollectMoney "Thu tiền tại bàn"
        boolean canManageTables "Cấu hình bàn & QR"
        boolean canViewOverview "Xem dashboard tổng quan"
        boolean canViewHistory "Tra cứu lịch sử hóa đơn"
        boolean canManageMenu "Thêm sửa xóa món & danh mục"
        boolean canManageBanners "Thêm sửa xóa banner"
        boolean canManageStaff "Quản lý nhân sự & phân quyền"
        datetime createdAt
        datetime updatedAt
    }

    TABLE_SESSION_RECORDS {
        uuid id PK
        varchar sessionId UK "Mã phiên, e.g. LT-2801"
        varchar tableNumber "Tên bàn, e.g. BÀN 02"
        varchar area "Khu vực ngồi"
        varchar status "ordered, seated, completed"
        datetime firstOrderAt "Thời điểm gọi món đầu tiên"
        datetime confirmedAt "Thời điểm thu tiền"
        varchar confirmedBy "Nhân viên xác nhận thu"
        datetime completedAt "Thời điểm khách rời bàn"
        int totalQuantity "Tổng số phần món"
        int totalAmount "Tổng tiền VNĐ thực thu"
        json items "Snapshot bất biến của các món"
        datetime createdAt
    }
```

---

## 2. Chi Tiết Các Cấu Trúc Snapshot JSON

### 2.1. Cấu trúc `sizes` trong bảng `dishes`
Mỗi món ăn có thể có nhiều kích cỡ:
```json
[
  { "id": "s-std", "name": "Tiêu chuẩn (1 Tô vừa)", "price": 0 },
  { "id": "s-big", "name": "Tô lớn (+thịt bò)", "price": 10000 }
]
```

### 2.2. Cấu trúc `toppings` trong bảng `dishes`
Các món phụ thêm kèm giá cộng thêm:
```json
[
  { "id": "top-1", "name": "Chả cua thêm", "price": 10000 },
  { "id": "top-2", "name": "Trứng cút (3 quả)", "price": 5000 }
]
```

### 2.3. Cấu trúc Snapshot `items` trong bảng `table_session_records`
Được đóng băng tại thời điểm xác nhận thu tiền nhằm đảm bảo tính bất biến của hóa đơn kiểm toán:
```json
[
  {
    "itemId": "item-179367-1",
    "dishId": "dish-1",
    "name": "Bún bò Huế đặc biệt",
    "sizeName": "Tô lớn (+thịt bò)",
    "toppings": ["Chả cua thêm"],
    "notes": "Ít cay, nhiều hành",
    "quantity": 2,
    "unitPrice": 65000,
    "totalPrice": 130000
  }
]
```

---

## 3. Thiết Kế Đề Xuất Bổ Sung: Module Bàn Ăn (Pending Review)

> [!NOTE]
> Bảng dưới đây là **thiết kế đề xuất chuẩn bị review**, tuân thủ nguyên tắc không tự can thiệp database của nhiệm vụ.

### 3.1. Bảng `dining_tables`
```sql
CREATE TABLE dining_tables (
  id VARCHAR(50) PRIMARY KEY,
  table_number VARCHAR(50) NOT NULL UNIQUE,
  area VARCHAR(100) NOT NULL DEFAULT 'Vỉa hè trước quán',
  status ENUM('empty', 'ordered', 'seated') NOT NULL DEFAULT 'empty',
  qr_code_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3.2. Bảng `active_table_sessions`
```sql
CREATE TABLE active_table_sessions (
  session_id VARCHAR(50) PRIMARY KEY,
  table_id VARCHAR(50) NOT NULL,
  first_order_at DATETIME NOT NULL,
  status ENUM('ordered', 'seated') NOT NULL DEFAULT 'ordered',
  items JSON NOT NULL,
  total_quantity INT NOT NULL DEFAULT 0,
  total_amount INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES dining_tables(id) ON DELETE CASCADE
);
```

