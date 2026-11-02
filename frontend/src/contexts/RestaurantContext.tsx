import React, { useState, useEffect, useRef, type ReactNode } from 'react';
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
  TableOrderItem,
} from '../types/restaurant';
import {
  INITIAL_CATEGORIES,
  INITIAL_DISHES,
  INITIAL_BANNERS,
  INITIAL_STAFF,
  INITIAL_TABLES,
} from '../data/mockData';
import { reportsApi } from '../services/reportsApi';
import { RestaurantContext } from './restaurantContextDef';

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

  // Toast Notification System
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ text, type });
  };

  const clearToast = () => {
    setToast(null);
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

  const [dishes, setDishes] = useState<Dish[]>(INITIAL_DISHES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [staffList, setStaffList] = useState<Staff[]>(INITIAL_STAFF);
  const [currentUser, setCurrentUser] = useState<Staff | null>(INITIAL_STAFF[0]);

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

  // Tables State
  const [tables, setTables] = useState<DiningTable[]>(INITIAL_TABLES);
  const [selectedTableForDetail, setSelectedTableForDetail] = useState<DiningTable | null>(null);
  const [isTableQrConfigModalOpen, setIsTableQrConfigModalOpen] = useState<boolean>(false);

  const markTableServedAndPaid = async (tableId: string): Promise<{ success: boolean; message: string }> => {
    // Check staff permission
    if (currentUser && currentUser.canCollectMoney === false) {
      showToast('Tài khoản của bạn không có quyền xác nhận thu tiền tại bàn.', 'error');
      return { success: false, message: 'Không có quyền thu tiền' };
    }

    const targetTable = tables.find((t) => t.id === tableId);
    if (!targetTable || !targetTable.currentSession) {
      return { success: false, message: 'Bàn không tồn tại hoặc chưa có đơn gọi món' };
    }

    const staffId = currentUser?.id || 'staff-1';
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
          sizeName: i.selectedSize.name,
          toppings: i.selectedToppings.map((t) => t.name),
          notes: i.notes,
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

      showToast(
        `Đã phục vụ & thu đủ ${updatedSession.totalAmount.toLocaleString('vi-VN')}đ tại ${targetTable.number}! Bàn chuyển sang trạng thái "Đang ngồi".`,
        'success'
      );
      return { success: true, message: 'Xác nhận thành công' };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi hệ thống khi lưu lịch sử thu tiền';
      showToast(`Không thể xác nhận thu tiền: ${errMsg}`, 'error');
      return { success: false, message: errMsg };
    }
  };

  const markTableEmpty = (tableId: string): { success: boolean; message: string } => {
    const targetTable = tables.find((t) => t.id === tableId);
    if (!targetTable) {
      return { success: false, message: 'Bàn không tồn tại' };
    }

    // Safety rule per specs: cannot mark empty if still in 'ordered' status
    if (targetTable.status === 'ordered') {
      showToast('Bàn đang có đơn "Order thành công", cần phục vụ và thu tiền trước khi giải phóng bàn.', 'error');
      return { success: false, message: 'Chưa phục vụ và thu tiền' };
    }

    const updatedTable: DiningTable = {
      ...targetTable,
      status: 'empty',
      currentSession: undefined,
    };

    setTables((prev) => prev.map((t) => (t.id === tableId ? updatedTable : t)));

    if (selectedTableForDetail && selectedTableForDetail.id === tableId) {
      setSelectedTableForDetail(updatedTable);
    }

    showToast(`${targetTable.number} đã sẵn sàng đón lượt khách mới!`, 'info');
    return { success: true, message: 'Đã chuyển bàn về Trống' };
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
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://huycv.vn/%23/?table=${encodeURIComponent(cleanNumber)}`,
    };
    setTables((prev) => [...prev, newTable]);
    showToast(`Đã thêm mới ${newTable.number} (${newTable.area})`, 'success');
  };

  const refreshTables = () => {
    // Refresh and re-evaluate waiting minutes
    setTables((prev) =>
      prev.map((t) => {
        if (t.status === 'ordered' && t.currentSession) {
          return {
            ...t,
            currentSession: {
              ...t.currentSession,
              waitingMinutes: t.currentSession.waitingMinutes + 1,
            },
          };
        }
        return t;
      })
    );
    showToast('Dữ liệu bàn đã được đồng bộ mới nhất!', 'info');
  };

  const submitOrder = (orderNotes?: string) => {
    // Total amount is strictly equal to cartTotalPrice (no voucher in customer flow)
    const finalAmount = cartTotalPrice;
    const orderId = `DH-${Math.floor(1000 + Math.random() * 9000)}`;
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

    // Sync to Table Management (real-time order reflection)
    const orderItems: TableOrderItem[] = cart.map((c) => ({
      itemId: c.cartItemId,
      dishId: c.dishId,
      name: c.name,
      selectedSize: c.selectedSize,
      selectedToppings: c.selectedToppings,
      notes: c.notes,
      quantity: c.quantity,
      unitPrice: c.totalPrice / c.quantity,
      totalPrice: c.totalPrice,
    }));

    setTables((prev) =>
      prev.map((t) => {
        // Match table number (e.g. "Bàn 05" vs "BÀN 05")
        if (t.number.toLowerCase() === currentTable.toLowerCase()) {
          const existingSession = t.currentSession;
          const mergedItems: TableOrderItem[] = existingSession
            ? [...existingSession.items, ...orderItems]
            : orderItems;

          const newSession: TableSession = {
            sessionId: existingSession ? existingSession.sessionId : `LT-${Math.floor(2000 + Math.random() * 8000)}`,
            tableId: t.id,
            tableNumber: t.number,
            firstOrderAt: existingSession ? existingSession.firstOrderAt : orderTime,
            waitingMinutes: 1,
            items: mergedItems,
            totalQuantity: (existingSession?.totalQuantity || 0) + cartTotalCount,
            totalAmount: (existingSession?.totalAmount || 0) + finalAmount,
          };

          return {
            ...t,
            status: 'ordered',
            currentSession: newSession,
          };
        }
        return t;
      })
    );

    setCart([]);
    setViewRoute('order-tracking');
  };

  const updateOrderStatus = (status: OrderStatus) => {
    if (currentOrder) {
      setCurrentOrder({ ...currentOrder, status });
    }
  };

  const toggleDishAvailability = (dishId: string) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, isAvailable: !d.isAvailable } : d))
    );
  };

  const saveDish = (dish: Dish) => {
    setDishes((prev) => {
      const exists = prev.some((d) => d.id === dish.id);
      if (exists) {
        return prev.map((d) => (d.id === dish.id ? dish : d));
      }
      return [dish, ...prev];
    });
  };

  const deleteDish = (dishId: string) => {
    setDishes((prev) => prev.filter((d) => d.id !== dishId));
  };

  const addCategory = (name: string, icon: string) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      icon: icon || 'restaurant',
      count: 0,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const deleteCategory = (catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  const toggleBannerActive = (bannerId: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === bannerId ? { ...b, isActive: !b.isActive } : b))
    );
  };

  const loginAs = (staff: Staff) => {
    setCurrentUser(staff);
    // Direct staff to Table Management upon login per operational specs
    setViewRoute('admin/tables');
  };

  const logout = () => {
    setCurrentUser(null);
    setViewRoute('login');
  };

  const addStaff = (staffData: Omit<Staff, 'id'>) => {
    const newStaff: Staff = {
      ...staffData,
      id: `staff-${Date.now()}`,
    };
    setStaffList((prev) => [...prev, newStaff]);
  };

  const toggleStaffMoneyPermission = (staffId: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, canCollectMoney: !s.canCollectMoney } : s))
    );
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
        submitOrder,
        updateOrderStatus,
        dishes,
        toggleDishAvailability,
        saveDish,
        deleteDish,
        categories,
        addCategory,
        deleteCategory,
        banners,
        toggleBannerActive,
        staffList,
        currentUser,
        loginAs,
        logout,
        addStaff,
        toggleStaffMoneyPermission,
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
