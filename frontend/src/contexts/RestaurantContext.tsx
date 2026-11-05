import React, { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
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
  TableSession,
} from '../types/restaurant';
import {
  INITIAL_TABLES,
} from '../data/mockData';
import { buildTableQrCodeUrl } from '../utils/qrConfig';
import { reportsApi } from '../services/reportsApi';
import { dishesApi } from '../services/dishesApi';
import { bannersApi } from '../services/bannersApi';
import { staffApi } from '../services/staffApi';
import { RestaurantContext } from './restaurantContextDef';
import type { AdminFeedbackData } from '../components/admin/AdminFeedbackModal';

const routeToHash: Record<ViewRoute, string> = {
  lobby: '#/',
  cart: '#/cart',
  'order-confirm': '#/order-confirm',
  'order-tracking': '#/order-tracking',
  login: '#/staff/login',
  'admin/overview': '#/staff/overview',
  'admin/tables': '#/staff/tables',
  'admin/history': '#/staff/history',
  'admin/menu': '#/staff/menu',
  'admin/categories': '#/staff/categories',
  'admin/banners': '#/staff/banners',
  'admin/staff': '#/staff/rbac',
  'admin/profile': '#/staff/profile',
};

const hashToRoute: Record<string, ViewRoute> = {
  '': 'lobby',
  '#': 'lobby',
  '#/': 'lobby',
  '#/lobby': 'lobby',
  '#/cart': 'cart',
  '#/order-confirm': 'order-confirm',
  '#/order-tracking': 'order-tracking',
  '#/staff/login': 'login',
  '#/staff': 'login',
  '#/admin': 'login',
  '#/staff/overview': 'admin/overview',
  '#/admin/overview': 'admin/overview',
  '#/staff/tables': 'admin/tables',
  '#/admin/tables': 'admin/tables',
  '#/staff/history': 'admin/history',
  '#/admin/history': 'admin/history',
  '#/staff/payment-history': 'admin/history',
  '#/admin/payment-history': 'admin/history',
  '#/staff/menu': 'admin/menu',
  '#/admin/menu': 'admin/menu',
  '#/staff/categories': 'admin/categories',
  '#/admin/categories': 'admin/categories',
  '#/staff/banners': 'admin/banners',
  '#/admin/banners': 'admin/banners',
  '#/staff/rbac': 'admin/staff',
  '#/admin/staff': 'admin/staff',
  '#/staff/profile': 'admin/profile',
  '#/admin/profile': 'admin/profile',
};

function getRouteFromHash(): ViewRoute {
  if (typeof window === 'undefined') return 'lobby';
  const hash = window.location.hash || '';
  const hashPath = hash.split('?')[0];
  return hashToRoute[hashPath] || 'lobby';
}

function normalizeTableNumber(raw: string): string {
  const trimmed = raw.trim();
  if (/^bàn\s*/i.test(trimmed)) {
    const digits = trimmed.replace(/^bàn\s*/i, '').padStart(2, '0');
    return `Bàn ${digits}`;
  }
  const clean = trimmed.replace(/^[bB]/, '');
  if (/^\d+$/.test(clean)) {
    return `Bàn ${clean.padStart(2, '0')}`;
  }
  return trimmed.startsWith('Bàn ') ? trimmed : `Bàn ${trimmed}`;
}

function resolveCurrentTableFromEnv(): string {
  if (typeof window === 'undefined') return '';

  // 1. Check URL query string (?table=05, ?t=B05, ?ban=5)
  const searchParams = new URLSearchParams(window.location.search);
  const paramVal = searchParams.get('table') || searchParams.get('t') || searchParams.get('ban');
  if (paramVal) {
    const norm = normalizeTableNumber(paramVal);
    try { sessionStorage.setItem('huycv_active_table', norm); } catch {}
    return norm;
  }

  // 2. Check hash query string (e.g. #/?table=05 or #/lobby?table=02)
  const hash = window.location.hash || '';
  const hashQueryIdx = hash.indexOf('?');
  if (hashQueryIdx !== -1) {
    const hashParams = new URLSearchParams(hash.substring(hashQueryIdx + 1));
    const hashParamVal = hashParams.get('table') || hashParams.get('t') || hashParams.get('ban');
    if (hashParamVal) {
      const norm = normalizeTableNumber(hashParamVal);
      try { sessionStorage.setItem('huycv_active_table', norm); } catch {}
      return norm;
    }
  }

  // 3. Check sessionStorage
  try {
    const saved = sessionStorage.getItem('huycv_active_table');
    if (saved) return saved;
  } catch {}

  // 4. Default: empty when no QR scanned or table chosen
  return '';
}

function loadDraftCartForTable(table: string): CartItem[] {
  if (typeof window === 'undefined' || !table) return [];
  try {
    const key = `huycv_cart_${table}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveDraftCartForTable(table: string, items: CartItem[]): void {
  if (typeof window === 'undefined' || !table) return;
  try {
    const key = `huycv_cart_${table}`;
    if (items.length === 0) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(items));
    }
  } catch (e) {
    console.warn('Could not save draft cart:', e);
  }
}

function loadActiveOrderForTable(table: string): Order | null {
  if (typeof window === 'undefined' || !table) return null;
  try {
    const key = `huycv_active_order_${table}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveActiveOrderForTable(table: string, order: Order | null): void {
  if (typeof window === 'undefined' || !table) return;
  try {
    const key = `huycv_active_order_${table}`;
    if (!order) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(order));
    }
  } catch (e) {
    console.warn('Could not save active order:', e);
  }
}

function getSavedStaffSession(): Staff | null {
  try {
    const saved = localStorage.getItem('huycv_staff_session');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return null;
}

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTable, setCurrentTableState] = useState<string>(() => resolveCurrentTableFromEnv());
  const [viewRoute, setViewRouteState] = useState<ViewRoute>(() => getRouteFromHash());

  const currentTableRef = useRef(currentTable);
  useEffect(() => {
    currentTableRef.current = currentTable;
  }, [currentTable]);

  // Real-time table selection changer with session isolation
  const setCurrentTable = (table: string) => {
    const normalized = table ? normalizeTableNumber(table) : '';
    setCurrentTableState(normalized);
    currentTableRef.current = normalized;
    if (normalized) {
      try {
        sessionStorage.setItem('huycv_active_table', normalized);
      } catch {}
      setCartState(loadDraftCartForTable(normalized));
      setCurrentOrderState(loadActiveOrderForTable(normalized));
    } else {
      try {
        sessionStorage.removeItem('huycv_active_table');
      } catch {}
      setCartState([]);
      setCurrentOrderState(null);
    }
  };

  // Draft cart scoped by current table (empty by default for new customers)
  const [cart, setCartState] = useState<CartItem[]>(() => loadDraftCartForTable(currentTable));

  const setCart = (action: React.SetStateAction<CartItem[]>) => {
    setCartState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveDraftCartForTable(currentTableRef.current, next);
      return next;
    });
  };

  // Order placed by current table (null by default until customer places order)
  const [currentOrder, setCurrentOrderState] = useState<Order | null>(() => loadActiveOrderForTable(currentTable));
  const [orderSuccessModalData, setOrderSuccessModalData] = useState<{ sessionId: string; tableNumber: string } | null>(null);

  const closeOrderSuccessModal = () => {
    setOrderSuccessModalData(null);
  };

  const setCurrentOrder = (order: Order | null) => {
    setCurrentOrderState(order);
    saveActiveOrderForTable(currentTableRef.current, order);
  };

  // Prevent browser from restoring awkward mid-page scroll offsets on reload
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // Listen to browser hash changes (Back, Forward, Direct URL)
  useEffect(() => {
    const handleHashChange = () => {
      const nextRoute = getRouteFromHash();
      setViewRouteState(nextRoute);

      const envTable = resolveCurrentTableFromEnv();
      if (envTable && envTable !== currentTableRef.current) {
        setCurrentTable(envTable);
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setViewRoute = (route: ViewRoute) => {
    setViewRouteState(route);
    const targetHash = routeToHash[route] || '#/';
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Toast Notification System (Customer / In-App)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ text, type });
  };

  const clearToast = () => {
    setToast(null);
  };

  // Unified Admin Feedback Popups (Modal Notice)
  const [adminFeedback, setAdminFeedback] = useState<AdminFeedbackData | null>(null);

  const showAdminFeedback = (feedback: AdminFeedbackData) => {
    // Suppress overlapping toast so only single clear popup displays
    setToast(null);
    setAdminFeedback(feedback);
  };

  const closeAdminFeedback = () => {
    setAdminFeedback(null);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [selectedDishForDetail, setSelectedDishForDetail] = useState<Dish | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isDishesLoading, setIsDishesLoading] = useState<boolean>(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
  const [isBannersLoading, setIsBannersLoading] = useState<boolean>(true);
  const [dishesError, setDishesError] = useState<string>('');

  const refreshDishes = useCallback(async () => {
    setIsDishesLoading(true);
    setDishesError('');
    try {
      const [liveDishes, liveCategories] = await Promise.all([
        dishesApi.fetchDishes({ includeArchived: true }),
        dishesApi.fetchCategories(),
      ]);
      setDishes(liveDishes);
      setCategories(liveCategories);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách món ăn từ máy chủ';
      setDishesError(msg);
      console.warn('Could not load dishes from API:', err);
    } finally {
      setIsDishesLoading(false);
    }
  }, []);

  const [currentUser, setCurrentUser] = useState<Staff | null>(() => getSavedStaffSession());
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isStaffLoading, setIsStaffLoading] = useState<boolean>(true);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
    return hash.includes('staff') || hash.includes('admin');
  });

  useEffect(() => {
    let ignore = false;
    const sessionUser = getSavedStaffSession();

    Promise.all([
      dishesApi.fetchDishes({ includeArchived: true }),
      dishesApi.fetchCategories(),
      bannersApi.fetchBanners(true),
      sessionUser ? staffApi.fetchStaffList(sessionUser.id).catch(() => []) : Promise.resolve([]),
    ])
      .then(([liveDishes, liveCategories, liveBanners, liveStaff]) => {
        if (!ignore) {
          setDishes(liveDishes);
          setCategories(liveCategories);
          setBanners(liveBanners);
          if (liveStaff.length > 0) {
            setStaffList(liveStaff);
            if (sessionUser) {
              const liveCurrent = liveStaff.find((s) => s.id === sessionUser.id);
              if (liveCurrent) {
                if (liveCurrent.status === 'suspended') {
                  setCurrentUser(null);
                  try {
                    localStorage.removeItem('huycv_staff_session');
                  } catch {}
                  showToast('Tài khoản đã bị tạm khóa. Vui lòng liên hệ Quản lý.', 'error');
                } else {
                  setCurrentUser(liveCurrent);
                  try {
                    localStorage.setItem('huycv_staff_session', JSON.stringify(liveCurrent));
                  } catch {}
                }
              }
            }
          }
          setDishesError('');
          setIsDishesLoading(false);
          setIsCategoriesLoading(false);
          setIsBannersLoading(false);
          setIsStaffLoading(false);
          setIsAuthChecking(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu khởi tạo từ máy chủ';
          setDishesError(msg);
          setIsDishesLoading(false);
          setIsCategoriesLoading(false);
          setIsBannersLoading(false);
          setIsStaffLoading(false);
          setIsAuthChecking(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const refreshStaffList = useCallback(async () => {
    if (!currentUser) {
      setIsStaffLoading(false);
      return;
    }
    setIsStaffLoading(true);
    try {
      const staffId = currentUser.id;
      const data = await staffApi.fetchStaffList(staffId);
      setStaffList(data);
      if (currentUser) {
        const me = data.find((s) => s.id === currentUser.id);
        if (me) {
          setCurrentUser(me);
          localStorage.setItem('huycv_staff_session', JSON.stringify(me));
        }
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách nhân viên:', err);
    } finally {
      setIsStaffLoading(false);
    }
  }, [currentUser]);

  const refreshBanners = useCallback(async () => {
    setIsBannersLoading(true);
    try {
      const data = await bannersApi.fetchBanners(true);
      setBanners(data);
    } catch (err) {
      console.warn('Lỗi tải danh sách banner:', err);
    } finally {
      setIsBannersLoading(false);
    }
  }, []);

  // Customer Authentication state (Cleaned for customer flow)
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(null);
  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState<boolean>(false);

  const loginCustomer = (phone: string, _password?: string) => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 9) {
      return { success: false, message: 'Số điện thoại không hợp lệ (tối thiểu 9 số)' };
    }
    const customer: CustomerUser = {
      id: `KH-${cleanPhone.slice(-4)}`,
      name: 'Khách Quen ' + cleanPhone.slice(-4),
      phone: cleanPhone,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setCurrentCustomer(customer);
    setIsCustomerAuthModalOpen(false);
    showToast(`Xin chào ${customer.name}! Quý khách đang phục vụ tại ${currentTable}.`, 'success');
    return { success: true, message: 'Đăng nhập thành công' };
  };

  const registerCustomer = (name: string, phone: string, _password?: string) => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    if (!cleanName) {
      return { success: false, message: 'Vui lòng nhập họ và tên' };
    }
    if (!cleanPhone || cleanPhone.length < 9) {
      return { success: false, message: 'Số điện thoại không hợp lệ (tối thiểu 9 số)' };
    }
    const customer: CustomerUser = {
      id: `KH-${Date.now().toString().slice(-4)}`,
      name: cleanName,
      phone: cleanPhone,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setCurrentCustomer(customer);
    setIsCustomerAuthModalOpen(false);
    showToast(`Đăng ký thành công! Chào mừng thành viên ${customer.name} đến với Huy CV.`, 'success');
    return { success: true, message: 'Đăng ký thành công' };
  };

  const logoutCustomer = () => {
    setCurrentCustomer(null);
    showToast('Đã đăng xuất tài khoản thành viên', 'info');
  };

  // Voucher management (Disabled for Customer/QR per user guidelines)
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  const applyVoucher = (_code: string) => {
    // Customer flow does not use vouchers in current scope
    return { success: false, message: 'Khu vực đặt món QR hiện tại không áp dụng mã giảm giá voucher.' };
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  // Voucher discount is 0 in customer scope
  const voucherDiscountAmount = 0;

  const openDishDetail = (dish: Dish) => {
    setSelectedDishForDetail(dish);
  };

  const closeDishDetail = () => {
    setSelectedDishForDetail(null);
  };

  const addToCart = (
    dish: Dish,
    size: SizeOption,
    toppings: Topping[],
    notes: string,
    quantity: number
  ) => {
    const toppingTotal = toppings.reduce((sum, t) => sum + t.price, 0);
    const unitPrice = dish.price + size.price + toppingTotal;
    const totalPrice = unitPrice * quantity;

    const newItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dishId: dish.id,
      name: dish.name,
      basePrice: dish.price,
      image: dish.image,
      selectedSize: size,
      selectedToppings: toppings,
      notes,
      quantity,
      totalPrice,
    };

    setCart((prev) => [...prev, newItem]);
    closeDishDetail();
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const unitPrice = item.totalPrice / item.quantity;
            return {
              ...item,
              quantity: newQty,
              totalPrice: unitPrice * newQty,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Tables State with SessionStorage persistence
  const [tables, setTablesState] = useState<DiningTable[]>(() => {
    if (typeof window === 'undefined') return INITIAL_TABLES;
    try {
      const raw = sessionStorage.getItem('huycv_tables_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TABLES;
  });

  const setTables = useCallback((updater: React.SetStateAction<DiningTable[]>) => {
    setTablesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        sessionStorage.setItem('huycv_tables_state', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const [selectedTableForDetail, setSelectedTableForDetail] = useState<DiningTable | null>(null);
  const [isTableQrConfigModalOpen, setIsTableQrConfigModalOpen] = useState<boolean>(false);

  // Sync real-time tables with backend MySQL
  const refreshTables = useCallback(async (): Promise<boolean> => {
    try {
      const fresh = await reportsApi.fetchActiveTables();
      if (Array.isArray(fresh) && fresh.length > 0) {
        setTables(fresh);
        return true;
      }
    } catch (err) {
      console.warn('Lỗi khi nạp danh sách bàn từ server:', err);
    }
    return false;
  }, [setTables]);

  // Initial load of operational tables from MySQL on app startup
  useEffect(() => {
    let isMounted = true;
    reportsApi.fetchActiveTables()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setTables(data);
        }
      })
      .catch((err) => {
        console.warn('Không thể nạp danh sách bàn ban đầu:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [setTables]);

  const markTableServedAndPaid = async (tableId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      showAdminFeedback({
        title: 'Yêu Cầu Đăng Nhập',
        message: 'Vui lòng đăng nhập với tài khoản nhân viên để xác nhận thu tiền tại bàn.',
        type: 'error',
      });
      return { success: false, message: 'Yêu cầu đăng nhập' };
    }

    if (currentUser.canCollectMoney === false) {
      showAdminFeedback({
        title: 'Không Có Quyền Thu Tiền',
        message: 'Tài khoản của bạn không có quyền xác nhận thu tiền tại bàn.',
        type: 'error',
      });
      return { success: false, message: 'Không có quyền thu tiền' };
    }

    const targetTable = tables.find((t) => t.id === tableId);
    if (!targetTable || !targetTable.currentSession) {
      return { success: false, message: 'Bàn không tồn tại hoặc chưa có đơn gọi món' };
    }

    const staffId = currentUser.id;
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Persist real payment record into backend MySQL first to ensure consistency!
    try {
      const paymentRes = await reportsApi.recordPayment({
        sessionId: targetTable.currentSession.sessionId,
        tableNumber: targetTable.number,
        area: targetTable.area,
        firstOrderAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
        staffId,
        totalQuantity: targetTable.currentSession.totalQuantity,
        totalAmount: targetTable.currentSession.totalAmount,
        items: targetTable.currentSession.items.map((i) => ({
          itemId: i.itemId,
          dishId: i.dishId,
          name: i.name,
          sizeName: i.selectedSize?.name || 'Tiêu chuẩn',
          toppings: i.selectedToppings?.map((t) => t.name) || [],
          notes: i.notes || '',
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })),
      });

      const confirmedByStaff = paymentRes?.record && typeof paymentRes.record === 'object' && 'confirmedBy' in paymentRes.record
        ? (paymentRes.record as { confirmedBy: string }).confirmedBy
        : (currentUser ? `${currentUser.name} (${currentUser.roleName})` : 'Quản lý quầy');

      const updatedSession: TableSession = {
        ...targetTable.currentSession,
        waitingMinutes: 0,
        confirmedAt: nowTime,
        confirmedBy: confirmedByStaff,
        confirmedAmount: targetTable.currentSession.totalAmount,
      };

      const updatedTable: DiningTable = {
        ...targetTable,
        status: 'seated',
        currentSession: updatedSession,
      };

      setTables((prev) => prev.map((t) => (t.id === tableId ? updatedTable : t)));

      if (selectedTableForDetail && selectedTableForDetail.id === tableId) {
        setSelectedTableForDetail(updatedTable);
      }

      refreshTables().catch(() => {});

      showAdminFeedback({
        title: 'Phục Vụ & Thu Tiền Thành Công',
        message: `Đã phục vụ & thu đủ ${(Number(updatedSession.totalAmount) || 0).toLocaleString('vi-VN')}đ tại ${targetTable.number}!\nBàn chuyển sang trạng thái "Đang ngồi".`,
        type: 'success',
      });
      return { success: true, message: 'Xác nhận thành công' };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi hệ thống khi lưu lịch sử thu tiền';
      showAdminFeedback({
        title: 'Lỗi Thu Tiền',
        message: `Không thể xác nhận thu tiền: ${errMsg}`,
        type: 'error',
      });
      return { success: false, message: errMsg };
    }
  };

  const markTableEmpty = async (tableId: string): Promise<{ success: boolean; message: string }> => {
    const targetTable = tables.find((t) => t.id === tableId);
    if (!targetTable) {
      return { success: false, message: 'Bàn không tồn tại' };
    }

    // Safety rule per specs: cannot mark empty if still in 'ordered' status
    if (targetTable.status === 'ordered') {
      showAdminFeedback({
        title: 'Chưa Thể Giải Phóng Bàn',
        message: 'Bàn đang có đơn "Order thành công", cần phục vụ và thu tiền trước khi giải phóng bàn.',
        type: 'warning',
      });
      return { success: false, message: 'Chưa phục vụ và thu tiền' };
    }

    try {
      await reportsApi.completeTableSession({
        tableNumber: targetTable.number,
        staffId: currentUser?.id,
      });

      const updatedTable: DiningTable = {
        ...targetTable,
        status: 'empty',
        currentSession: undefined,
      };

      setTables((prev) => prev.map((t) => (t.id === tableId ? updatedTable : t)));

      if (selectedTableForDetail && selectedTableForDetail.id === tableId) {
        setSelectedTableForDetail(updatedTable);
      }

      refreshTables().catch(() => {});

      showAdminFeedback({
        title: 'Bàn Đã Sẵn Sàng',
        message: `${targetTable.number} đã trở về trạng thái Trống và sẵn sàng đón lượt khách mới!`,
        type: 'info',
      });
      return { success: true, message: 'Đã chuyển bàn về Trống' };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi khi giải phóng bàn';
      showAdminFeedback({
        title: 'Lỗi Giải Phóng Bàn',
        message: errMsg,
        type: 'error',
      });
      return { success: false, message: errMsg };
    }
  };

  const addNewTable = (number: string, area: string) => {
    const cleanNumber = number.trim();
    if (!cleanNumber) return;
    const newId = `tbl-${Date.now().toString().slice(-4)}`;
    const newTable: DiningTable = {
      id: newId,
      number: cleanNumber.toUpperCase().startsWith('BÀN') ? cleanNumber.toUpperCase() : `BÀN ${cleanNumber}`,
      area: area.trim() || 'Vỉa hè trước quán',
      status: 'empty',
      qrCodeUrl: buildTableQrCodeUrl(cleanNumber),
    };
    setTables((prev) => [...prev, newTable]);
    showAdminFeedback({
      title: 'Thêm Bàn Thành Công',
      message: `Đã thêm mới ${newTable.number} (${newTable.area}) vào danh sách bàn của quán.`,
      type: 'success',
    });
  };

  const submitOrder = async (orderNotes?: string): Promise<{ success: boolean; message: string }> => {
    if (cart.length === 0) {
      showToast('Giỏ hàng đang trống, vui lòng chọn món trước khi đặt', 'error');
      return { success: false, message: 'Giỏ hàng trống' };
    }

    try {
      // 1. Validate order items against real backend database
      const valPayload = cart.map((c) => ({
        cartItemId: c.cartItemId,
        dishId: c.dishId,
        name: c.name,
        sizeId: c.selectedSize?.id,
        sizeName: c.selectedSize?.name,
        toppings: c.selectedToppings?.map((t) => t.name) || [],
        quantity: c.quantity,
        clientUnitPrice: c.totalPrice / c.quantity,
        clientTotalPrice: c.totalPrice,
      }));

      const valResult = await dishesApi.validateOrder(currentTable, valPayload);

      if (!valResult.valid) {
        if (valResult.reason === 'price_changed') {
          // Update cart item with new price from database
          if (valResult.newUnitPrice !== undefined) {
            setCart((prev) =>
              prev.map((item) =>
                item.dishId === valResult.dishId
                  ? {
                      ...item,
                      basePrice: valResult.newUnitPrice!,
                      totalPrice: valResult.newUnitPrice! * item.quantity,
                    }
                  : item
              )
            );
          }
          showToast(valResult.message, 'error');
          return { success: false, message: valResult.message };
        }

        if (valResult.reason === 'dish_unavailable' || valResult.reason === 'dish_not_found') {
          showToast(valResult.message, 'error');
          return { success: false, message: valResult.message };
        }
      }

      // Backend calculated verified total amount
      const finalAmount = valResult.totalAmount ?? cartTotalPrice;

      // 2. Persist real active order to Backend MySQL
      const orderItemsPayload = cart.map((c) => ({
        itemId: c.cartItemId,
        dishId: c.dishId,
        name: c.name,
        sizeName: c.selectedSize?.name || 'Tiêu chuẩn',
        toppings: c.selectedToppings?.map((t) => t.name) || [],
        notes: c.notes || orderNotes || '',
        quantity: c.quantity,
        unitPrice: c.totalPrice / c.quantity,
        totalPrice: c.totalPrice,
      }));

      const orderRes = await reportsApi.submitActiveOrder({
        tableNumber: currentTable,
        orderNotes,
        totalQuantity: cartTotalCount,
        totalAmount: finalAmount,
        items: orderItemsPayload,
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Không thể gửi đơn lên máy chủ');
      }

      const orderId = orderRes.sessionId || `DH-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      const newOrder: Order = {
        id: orderId,
        tableNumber: currentTable,
        createdAt: `${orderTime} — ${new Date().toLocaleDateString('vi-VN')}`,
        items: [...cart],
        totalAmount: finalAmount,
        status: 'pending',
        notes: orderNotes,
      };
      setCurrentOrder(newOrder);

      // 3. Immediately re-sync tables from backend to reflect newly created order
      await refreshTables().catch(() => {});

      setCart([]);
      // Open dedicated success modal with table and sessionId from backend (no overlapping toast)
      setOrderSuccessModalData({
        sessionId: orderId,
        tableNumber: currentTable,
      });
      return { success: true, message: 'Đặt món thành công' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gửi đơn gọi món';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const updateOrderStatus = (status: OrderStatus) => {
    if (currentOrder) {
      setCurrentOrder({ ...currentOrder, status });
    }
  };

  const toggleDishAvailability = async (dishId: string): Promise<boolean> => {
    if (!currentUser) {
      showAdminFeedback({
        type: 'error',
        title: 'Yêu cầu đăng nhập',
        message: 'Vui lòng đăng nhập với tài khoản quản lý để đổi trạng thái món.',
      });
      return false;
    }
    const staffId = currentUser.id;
    try {
      const updated = await dishesApi.toggleDishStatus(dishId, staffId);
      setDishes((prev) => prev.map((d) => (d.id === dishId ? updated : d)));
      showAdminFeedback({
        type: 'success',
        title: 'Đã đổi trạng thái món',
        message: `Món "${updated.name}" hiện tại đã chuyển sang: ${
          updated.isAvailable ? 'Còn món (Đang mở bán)' : 'Tạm hết món'
        }`,
      });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái món';
      showAdminFeedback({
        type: 'error',
        title: 'Lỗi đổi trạng thái',
        message: msg,
      });
      return false;
    }
  };

  const saveDish = async (dish: Dish): Promise<boolean> => {
    if (!currentUser) {
      showAdminFeedback({
        type: 'error',
        title: 'Yêu cầu đăng nhập',
        message: 'Vui lòng đăng nhập với tài khoản quản lý để lưu món ăn.',
      });
      return false;
    }
    const staffId = currentUser.id;
    try {
      const exists = dishes.some((d) => d.id === dish.id);
      let saved: Dish;
      if (exists) {
        saved = await dishesApi.updateDish(dish.id, dish, staffId);
        setDishes((prev) => prev.map((d) => (d.id === dish.id ? saved : d)));
        showAdminFeedback({
          type: 'success',
          title: 'Đã cập nhật món',
          message: `Món ăn "${saved.name}" đã được cập nhật thành công vào thực đơn quán Huy CV.`,
        });
      } else {
        saved = await dishesApi.createDish(dish, staffId);
        setDishes((prev) => [saved, ...prev]);
        showAdminFeedback({
          type: 'success',
          title: 'Đã thêm món mới',
          message: `Món ăn "${saved.name}" đã được thêm mới thành công vào thực đơn quán Huy CV.`,
        });
      }
      dishesApi.fetchCategories().then(setCategories).catch(() => {});
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi lưu thông tin món ăn';
      showAdminFeedback({
        type: 'error',
        title: 'Không thể lưu món ăn',
        message: msg,
      });
      throw err;
    }
  };

  const deleteDish = async (dishId: string): Promise<boolean> => {
    if (!currentUser) {
      showAdminFeedback({
        type: 'error',
        title: 'Yêu cầu đăng nhập',
        message: 'Vui lòng đăng nhập với tài khoản quản lý để xóa món ăn.',
      });
      return false;
    }
    const staffId = currentUser.id;
    try {
      const result = await dishesApi.deleteDish(dishId, staffId);
      if (result.archived) {
        setDishes((prev) =>
          prev.map((d) => (d.id === dishId ? { ...d, isArchived: true, isAvailable: false } : d))
        );
      } else {
        setDishes((prev) => prev.filter((d) => d.id !== dishId));
      }
      showAdminFeedback({
        type: result.archived ? 'info' : 'success',
        title: result.archived ? 'Đã lưu trữ món' : 'Đã xóa món ăn',
        message: result.message,
      });
      dishesApi.fetchCategories().then(setCategories).catch(() => {});
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa món ăn';
      showAdminFeedback({
        type: 'error',
        title: 'Không thể xóa món',
        message: msg,
      });
      return false;
    }
  };

  const refreshCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    try {
      const liveCategories = await dishesApi.fetchCategories();
      setCategories(liveCategories);
    } catch (err) {
      console.warn('Could not refresh categories:', err);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  const addCategory = async (name: string, icon: string, order?: number): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      showAdminFeedback({
        title: 'Yêu Cầu Đăng Nhập',
        message: 'Vui lòng đăng nhập với tài khoản quản lý để thêm danh mục.',
        type: 'error',
      });
      throw new Error('Yêu cầu đăng nhập');
    }
    try {
      const staffId = currentUser.id;
      const created = await dishesApi.createCategory({ name, icon, order }, staffId);
      setCategories((prev) => [...prev, created]);
      await refreshDishes();
      showAdminFeedback({
        title: 'Thêm Danh Mục Thành Công',
        message: `Đã thêm danh mục "${created.name}" vào thực đơn của quán.`,
        type: 'success',
      });
      return { success: true, message: `Thêm danh mục "${created.name}" thành công` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo danh mục';
      showAdminFeedback({
        title: 'Lỗi Thêm Danh Mục',
        message: msg,
        type: 'error',
      });
      throw new Error(msg);
    }
  };

  const updateCategory = async (id: string, name: string, icon: string, order?: number): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      showAdminFeedback({
        title: 'Yêu Cầu Đăng Nhập',
        message: 'Vui lòng đăng nhập với tài khoản quản lý để sửa danh mục.',
        type: 'error',
      });
      throw new Error('Yêu cầu đăng nhập');
    }
    try {
      const staffId = currentUser.id;
      const updated = await dishesApi.updateCategory(id, { name, icon, order }, staffId);
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
      await refreshDishes();
      showAdminFeedback({
        title: 'Cập Nhật Danh Mục Thành Công',
        message: `Đã cập nhật danh mục "${updated.name}" thành công!`,
        type: 'success',
      });
      return { success: true, message: `Cập nhật danh mục "${updated.name}" thành công` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật danh mục';
      showAdminFeedback({
        title: 'Lỗi Cập Nhật Danh Mục',
        message: msg,
        type: 'error',
      });
      throw new Error(msg);
    }
  };

  const deleteCategory = async (catId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      showAdminFeedback({
        title: 'Yêu Cầu Đăng Nhập',
        message: 'Vui lòng đăng nhập với tài khoản quản lý để xóa danh mục.',
        type: 'error',
      });
      throw new Error('Yêu cầu đăng nhập');
    }
    try {
      const staffId = currentUser.id;
      const res = await dishesApi.deleteCategory(catId, staffId);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      await refreshDishes();
      showAdminFeedback({
        title: 'Xóa Danh Mục Thành Công',
        message: res.message,
        type: 'success',
      });
      return { success: true, message: res.message };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa danh mục';
      showAdminFeedback({
        title: 'Lỗi Xóa Danh Mục',
        message: msg,
        type: 'error',
      });
      throw new Error(msg);
    }
  };

  const saveBanner = async (bannerData: Partial<Banner>): Promise<boolean> => {
    if (!currentUser) {
      showAdminFeedback({
        title: 'Yêu Cầu Đăng Nhập',
        message: 'Vui lòng đăng nhập với tài khoản quản lý để lưu banner.',
        type: 'error',
      });
      return false;
    }
    const staffId = currentUser.id;
    try {
      const exists = bannerData.id && banners.some((b) => b.id === bannerData.id);
      let saved: Banner;
      if (exists && bannerData.id) {
        saved = await bannersApi.updateBanner(bannerData.id, bannerData, staffId);
        setBanners((prev) => prev.map((b) => (b.id === bannerData.id ? saved : b)));
        showAdminFeedback({
          title: 'Cập Nhật Banner Thành Công',
          message: `Đã cập nhật banner "${saved.adminName || saved.title}" thành công!`,
          type: 'success',
        });
      } else {
        saved = await bannersApi.createBanner(bannerData, staffId);
        setBanners((prev) => [...prev, saved].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
        showAdminFeedback({
          title: 'Thêm Banner Thành Công',
          message: `Đã thêm banner "${saved.adminName || saved.title}" thành công!`,
          type: 'success',
        });
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu banner';
      showAdminFeedback({
        title: 'Lỗi Lưu Banner',
        message: msg,
        type: 'error',
      });
      throw err;
    }
  };

  const toggleBannerActive = async (bannerId: string): Promise<boolean> => {
    if (!currentUser) {
      showAdminFeedback({
        title: 'Yêu Cầu Đăng Nhập',
        message: 'Vui lòng đăng nhập với tài khoản quản lý để đổi trạng thái banner.',
        type: 'error',
      });
      return false;
    }
    const staffId = currentUser.id;
    try {
      const updated = await bannersApi.toggleBannerStatus(bannerId, staffId);
      setBanners((prev) => prev.map((b) => (b.id === bannerId ? updated : b)));
      showAdminFeedback({
        title: updated.isActive ? 'Đã Bật Hiển Thị Banner' : 'Đã Ẩn Banner',
        message: updated.isActive
          ? `Đã hiển thị banner "${updated.adminName || updated.title}" trên sảnh khách`
          : `Đã tạm ẩn banner "${updated.adminName || updated.title}"`,
        type: 'info',
      });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi đổi trạng thái banner';
      showAdminFeedback({
        title: 'Lỗi Trạng Thái Banner',
        message: msg,
        type: 'error',
      });
      return false;
    }
  };

  const reorderBanners = async (items: { id: string; displayOrder: number }[]): Promise<boolean> => {
    if (!currentUser) {
      showAdminFeedback({
        title: 'Yêu Cầu Đăng Nhập',
        message: 'Vui lòng đăng nhập với tài khoản quản lý để sắp xếp banner.',
        type: 'error',
      });
      return false;
    }
    const staffId = currentUser.id;
    try {
      await bannersApi.reorderBanners(items, staffId);
      setBanners((prev) => {
        const orderMap = new Map(items.map((i) => [i.id, i.displayOrder]));
        return [...prev]
          .map((b) => (orderMap.has(b.id) ? { ...b, displayOrder: orderMap.get(b.id)! } : b))
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      });
      showAdminFeedback({
        title: 'Sắp Xếp Banner Thành Công',
        message: 'Đã lưu thứ tự hiển thị banner thành công!',
        type: 'success',
      });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi sắp xếp thứ tự banner';
      showAdminFeedback({
        title: 'Lỗi Sắp Xếp Banner',
        message: msg,
        type: 'error',
      });
      return false;
    }
  };

  const deleteBanner = async (bannerId: string): Promise<boolean> => {
    if (!currentUser) {
      showAdminFeedback({
        title: 'Yêu Cầu Đăng Nhập',
        message: 'Vui lòng đăng nhập với tài khoản quản lý để xóa banner.',
        type: 'error',
      });
      return false;
    }
    const staffId = currentUser.id;
    try {
      const target = banners.find((b) => b.id === bannerId);
      await bannersApi.deleteBanner(bannerId, staffId);
      setBanners((prev) => prev.filter((b) => b.id !== bannerId));
      showAdminFeedback({
        title: 'Xóa Banner Thành Công',
        message: `Đã xóa banner "${target?.adminName || target?.title || bannerId}" thành công!`,
        type: 'success',
      });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa banner';
      showAdminFeedback({
        title: 'Lỗi Xóa Banner',
        message: msg,
        type: 'error',
      });
      return false;
    }
  };

  const loginAs = (staff: Staff) => {
    setCurrentUser(staff);
    try {
      localStorage.setItem('huycv_staff_session', JSON.stringify(staff));
    } catch {}
    // Direct staff to Table Management upon login per operational specs
    setViewRoute('admin/tables');
  };

  const loginWithCredentials = async (
    username: string,
    pass: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const staff = await staffApi.loginStaff({ username, password: pass });
      loginAs(staff);
      showToast(`Chào mừng ${staff.name} (${staff.roleName}) đã vào ca trực!`, 'success');
      return { success: true, message: 'Đăng nhập thành công' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập không thành công';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('huycv_staff_session');
    } catch {}
    setViewRoute('login');
    showToast('Đã đăng xuất ca trực thành công.', 'info');
  };

  const addStaff = async (
    staffData: Partial<Staff> & { password: string },
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      showAdminFeedback({
        title: 'Yêu Cầu Đăng Nhập',
        message: 'Vui lòng đăng nhập với tài khoản Quản trị viên để thêm nhân viên.',
        type: 'error',
      });
      throw new Error('Yêu cầu đăng nhập');
    }
    const staffId = currentUser.id;
    try {
      const created = await staffApi.createStaff(staffData, staffId);
      setStaffList((prev) => [...prev, created]);
      showAdminFeedback({
        title: 'Thêm Nhân Viên Thành Công',
        message: `Đã thêm nhân viên "${created.name}" (${created.roleName}) vào hệ thống.`,
        type: 'success',
      });
      return { success: true, message: 'Thêm nhân viên thành công' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi thêm nhân viên';
      showAdminFeedback({
        title: 'Lỗi Thêm Nhân Viên',
        message: msg,
        type: 'error',
      });
      throw err;
    }
  };

  const updateStaff = async (
    id: string,
    staffData: Partial<Staff> & { password?: string },
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      showAdminFeedback({
        title: 'Yêu Cầu Đăng Nhập',
        message: 'Vui lòng đăng nhập với tài khoản Quản trị viên để cập nhật nhân viên.',
        type: 'error',
      });
      throw new Error('Yêu cầu đăng nhập');
    }
    const staffId = currentUser.id;
    try {
      const updated = await staffApi.updateStaff(id, staffData, staffId);
      setStaffList((prev) => prev.map((s) => (s.id === id ? updated : s)));
      if (currentUser?.id === id) {
        setCurrentUser(updated);
        try {
          localStorage.setItem('huycv_staff_session', JSON.stringify(updated));
        } catch {}
      }
      showAdminFeedback({
        title: 'Cập Nhật Nhân Viên Thành Công',
        message: `Đã cập nhật thông tin nhân viên "${updated.name}" thành công!`,
        type: 'success',
      });
      return { success: true, message: 'Cập nhật thành công' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật nhân viên';
      showAdminFeedback({
        title: 'Lỗi Cập Nhật Nhân Viên',
        message: msg,
        type: 'error',
      });
      throw err;
    }
  };

  const updateProfile = async (
    data: { name?: string; phone?: string; shift?: string },
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập' };
    try {
      const updated = await staffApi.updateProfile(currentUser.id, data, currentUser.id);
      setCurrentUser(updated);
      setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      try {
        localStorage.setItem('huycv_staff_session', JSON.stringify(updated));
      } catch {}
      showAdminFeedback({
        title: 'Cập Nhật Hồ Sơ Thành Công',
        message: 'Đã cập nhật hồ sơ cá nhân thành công!',
        type: 'success',
      });
      return { success: true, message: 'Cập nhật thành công' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật hồ sơ';
      showAdminFeedback({
        title: 'Lỗi Cập Nhật Hồ Sơ',
        message: msg,
        type: 'error',
      });
      throw err;
    }
  };

  const toggleStaffStatus = async (staffId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      showAdminFeedback({
        title: 'Yêu Cầu Đăng Nhập',
        message: 'Vui lòng đăng nhập với tài khoản Quản trị viên để khóa/mở khóa nhân viên.',
        type: 'error',
      });
      throw new Error('Yêu cầu đăng nhập');
    }
    const requesterId = currentUser.id;
    try {
      const updated = await staffApi.toggleStaffStatus(staffId, requesterId);
      setStaffList((prev) => prev.map((s) => (s.id === staffId ? updated : s)));
      showAdminFeedback({
        title: updated.status === 'suspended' ? 'Đã Tạm Khóa Tài Khoản' : 'Đã Mở Khóa Tài Khoản',
        message: updated.status === 'suspended'
          ? `Đã tạm khóa tài khoản nhân viên "${updated.name}"`
          : `Đã mở khóa tài khoản nhân viên "${updated.name}"`,
        type: 'info',
      });
      return { success: true, message: 'Thao tác thành công' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi đổi trạng thái tài khoản';
      showAdminFeedback({
        title: 'Lỗi Đổi Trạng Thái',
        message: msg,
        type: 'error',
      });
      throw err;
    }
  };

  const resetStaffPassword = async (
    staffId: string,
    newPass: string,
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      showAdminFeedback({
        title: 'Yêu Cầu Đăng Nhập',
        message: 'Vui lòng đăng nhập để thực hiện đặt lại mật khẩu.',
        type: 'error',
      });
      throw new Error('Yêu cầu đăng nhập');
    }
    const requesterId = currentUser.id;
    try {
      const res = await staffApi.resetStaffPassword(staffId, newPass, requesterId);
      showAdminFeedback({
        title: 'Đặt Lại Mật Khẩu Thành Công',
        message: res.message,
        type: 'success',
      });
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi đặt lại mật khẩu';
      showAdminFeedback({
        title: 'Lỗi Đặt Lại Mật Khẩu',
        message: msg,
        type: 'error',
      });
      throw err;
    }
  };

  const toggleStaffMoneyPermission = async (staffId: string) => {
    const target = staffList.find((s) => s.id === staffId);
    if (!target) return;
    try {
      await updateStaff(staffId, { canCollectMoney: !target.canCollectMoney });
    } catch {}
  };

  return (
    <RestaurantContext.Provider
      value={{
        currentTable,
        setCurrentTable,
        viewRoute,
        setViewRoute,
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        selectedDishForDetail,
        openDishDetail,
        closeDishDetail,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotalCount,
        cartTotalPrice,
        appliedVoucher,
        applyVoucher,
        removeVoucher,
        voucherDiscountAmount,
        currentOrder,
        orderSuccessModalData,
        closeOrderSuccessModal,
        submitOrder,
        updateOrderStatus,
        dishes,
        isDishesLoading,
        dishesError,
        refreshDishes,
        toggleDishAvailability,
        saveDish,
        deleteDish,
        categories,
        isCategoriesLoading,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshCategories,
        banners,
        refreshBanners,
        saveBanner,
        toggleBannerActive,
        reorderBanners,
        deleteBanner,
        isBannersLoading,
        staffList,
        currentUser,
        isStaffLoading,
        isAuthChecking,
        refreshStaffList,
        loginAs,
        loginWithCredentials,
        logout,
        addStaff,
        updateStaff,
        updateProfile,
        toggleStaffStatus,
        resetStaffPassword,
        toggleStaffMoneyPermission,
        adminFeedback,
        showAdminFeedback,
        closeAdminFeedback,
        toast,
        showToast,
        clearToast,
        currentCustomer,
        isCustomerAuthModalOpen,
        setIsCustomerAuthModalOpen,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        tables,
        selectedTableForDetail,
        setSelectedTableForDetail,
        isTableQrConfigModalOpen,
        setIsTableQrConfigModalOpen,
        markTableServedAndPaid,
        markTableEmpty,
        addNewTable,
        refreshTables,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};
