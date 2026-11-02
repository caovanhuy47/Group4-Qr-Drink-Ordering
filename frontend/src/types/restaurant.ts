export type ViewRoute =
  | 'lobby'
  | 'cart'
  | 'order-confirm'
  | 'order-tracking'
  | 'login'
  | 'admin/overview'
  | 'admin/tables'
  | 'admin/history'
  | 'admin/menu'
  | 'admin/categories'
  | 'admin/banners'
  | 'admin/staff'
  | 'admin/profile';

export interface Voucher {
  code: string;
  discountPercent: number;
  description: string;
  minOrderValue?: number;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
}

export interface SizeOption {
  id: string;
  name: string;
  price: number;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  categoryId: string;
  categoryName: string;
  badge?: string;
  badgeType?: 'hot' | 'new' | 'veg' | 'special';
  isAvailable: boolean;
  sizes: SizeOption[];
  toppings: Topping[];
}

export interface CartItem {
  cartItemId: string;
  dishId: string;
  name: string;
  basePrice: number;
  image: string;
  selectedSize: SizeOption;
  selectedToppings: Topping[];
  notes: string;
  quantity: number;
  totalPrice: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'served_paid' | 'seated';

export interface Order {
  id: string;
  tableNumber: string;
  createdAt: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
}

export interface Banner {
  id: string;
  tag: string;
  title: string;
  description: string;
  discountBadge: string;
  priceNote: string;
  ctaText: string;
  bgGradient: string;
  imageUrl?: string;
  isActive: boolean;
}

export type StaffRole = 'admin' | 'waiter' | 'kitchen' | 'cashier';

export interface Staff {
  id: string;
  name: string;
  username: string;
  role: StaffRole;
  roleName: string;
  phone: string;
  canCollectMoney: boolean;
  shift: string;
  status: 'active' | 'offline';
}

export type TableOperationalStatus = 'empty' | 'ordered' | 'seated';

export interface TableOrderItem {
  itemId: string;
  dishId: string;
  name: string;
  selectedSize: SizeOption;
  selectedToppings: Topping[];
  notes: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface TableSession {
  sessionId: string;
  tableId: string;
  tableNumber: string;
  firstOrderAt: string;
  waitingMinutes: number;
  items: TableOrderItem[];
  totalQuantity: number;
  totalAmount: number;
  confirmedAt?: string;
  confirmedBy?: string;
  confirmedAmount?: number;
}

export interface DiningTable {
  id: string;
  number: string;
  area: string;
  status: TableOperationalStatus;
  currentSession?: TableSession;
  qrCodeUrl?: string;
}


