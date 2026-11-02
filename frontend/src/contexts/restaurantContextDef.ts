import { createContext } from 'react';
import type {
  Dish,
  Category,
  CartItem,
  Order,
  Banner,
  Staff,
  ViewRoute,
  OrderStatus,
  Topping,
  SizeOption,
  Voucher,
  CustomerUser,
  DiningTable,
} from '../types/restaurant';

export interface RestaurantContextType {
  // Navigation
  currentTable: string;
  viewRoute: ViewRoute;
  setViewRoute: (route: ViewRoute) => void;

  // Search & Filter
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;

  // Modals & Details
  selectedDishForDetail: Dish | null;
  openDishDetail: (dish: Dish) => void;
  closeDishDetail: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Cart & Order & Voucher
  cart: CartItem[];
  addToCart: (dish: Dish, size: SizeOption, toppings: Topping[], notes: string, quantity: number) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartTotalPrice: number;
  appliedVoucher: Voucher | null;
  applyVoucher: (code: string) => { success: boolean; message: string };
  removeVoucher: () => void;
  voucherDiscountAmount: number;
  currentOrder: Order | null;
  submitOrder: (orderNotes?: string) => void;
  updateOrderStatus: (status: OrderStatus) => void;

  // In-app Notifications
  toast: { text: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  clearToast: () => void;

  // Customer Authentication (Separated from Staff)
  currentCustomer: CustomerUser | null;
  isCustomerAuthModalOpen: boolean;
  setIsCustomerAuthModalOpen: (open: boolean) => void;
  loginCustomer: (phone: string, password?: string) => { success: boolean; message: string };
  registerCustomer: (name: string, phone: string, password?: string) => { success: boolean; message: string };
  logoutCustomer: () => void;

  // Admin Data Management
  dishes: Dish[];
  toggleDishAvailability: (dishId: string) => void;
  saveDish: (dish: Dish) => void;
  deleteDish: (dishId: string) => void;

  categories: Category[];
  addCategory: (name: string, icon: string) => void;
  deleteCategory: (catId: string) => void;

  banners: Banner[];
  toggleBannerActive: (bannerId: string) => void;

  staffList: Staff[];
  currentUser: Staff | null;
  loginAs: (staff: Staff) => void;
  logout: () => void;
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  toggleStaffMoneyPermission: (staffId: string) => void;

  // Table Management (Operational & Real-time)
  tables: DiningTable[];
  selectedTableForDetail: DiningTable | null;
  setSelectedTableForDetail: (table: DiningTable | null) => void;
  isTableQrConfigModalOpen: boolean;
  setIsTableQrConfigModalOpen: (open: boolean) => void;
  markTableServedAndPaid: (tableId: string) => { success: boolean; message: string };
  markTableEmpty: (tableId: string) => { success: boolean; message: string };
  addNewTable: (number: string, area: string) => void;
  refreshTables: () => void;
}

export const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

