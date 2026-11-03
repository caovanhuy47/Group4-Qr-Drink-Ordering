import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import { AdminLayout } from '../../components/admin/AdminLayout';
import type { Staff, StaffRole } from '../../types/restaurant';

interface PermissionOption {
  key: keyof Staff;
  label: string;
  desc: string;
  riskNote?: string;
}

interface PermissionGroup {
  name: string;
  icon: string;
  permissions: PermissionOption[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: '1. Vận hành bàn & Thu tiền',
    icon: 'table_restaurant',
    permissions: [
      {
        key: 'canViewTables',
        label: 'Xem trạng thái bàn & món ăn',
        desc: 'Xem danh sách bàn, trạng thái có khách, các món đang gọi của từng bàn.',
      },
      {
        key: 'canCollectMoney',
        label: 'Xác nhận phục vụ & thu tiền',
        desc: 'Bấm xác nhận "Đã phục vụ & thu đủ tiền" và ghi nhận lịch sử doanh thu.',
        riskNote: 'Tác động trực tiếp đến tiền mặt và lịch sử thu tiền.',
      },
      {
        key: 'canManageTables',
        label: 'Quản lý bàn & Chuyển bàn trống',
        desc: 'Chuyển bàn về trạng thái "Bàn trống" và tạo/cấu hình mã QR bàn.',
      },
    ],
  },
  {
    name: '2. Báo cáo & Lịch sử',
    icon: 'analytics',
    permissions: [
      {
        key: 'canViewOverview',
        label: 'Xem tổng quan doanh thu',
        desc: 'Xem báo cáo doanh thu, số lượt khách, biểu đồ kinh doanh của quán.',
        riskNote: 'Chỉ nên cấp cho Chủ quán / Quản lý cấp cao.',
      },
      {
        key: 'canViewHistory',
        label: 'Xem lịch sử thu tiền',
        desc: 'Xem danh sách các lượt thu tiền, chi tiết món và nhân viên xác nhận.',
      },
    ],
  },
  {
    name: '3. Quản lý thực đơn & Banner',
    icon: 'restaurant_menu',
    permissions: [
      {
        key: 'canManageMenu',
        label: 'Quản lý món ăn & Danh mục',
        desc: 'Thêm, sửa giá, ẩn/hiện và xóa món ăn hoặc danh mục trong thực đơn.',
      },
      {
        key: 'canManageBanners',
        label: 'Quản lý banner sảnh khách',
        desc: 'Thiết lập các banner ưu đãi, giờ vàng và sắp xếp thứ tự hiển thị.',
      },
    ],
  },
  {
    name: '4. Quản trị nhân sự & Phân quyền',
    icon: 'admin_panel_settings',
    permissions: [
      {
        key: 'canManageStaff',
        label: 'Quản lý nhân viên & Cấp quyền',
        desc: 'Tạo tài khoản, phân quyền, khóa tài khoản và đặt lại mật khẩu.',
        riskNote: 'Quyền cao nhất — Mặc định chỉ Admin quản trị.',
      },
    ],
  },
];

export const StaffRbacView: React.FC = () => {
  const {
    staffList,
    currentUser,
    isStaffLoading,
    refreshStaffList,
    addStaff,
    updateStaff,
    toggleStaffStatus,
    resetStaffPassword,
    showToast,
  } = useRestaurant();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Modal Create/Edit state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('waiter');
  const [phone, setPhone] = useState('');
  const [shift, setShift] = useState('Ca Tối (17:00 - 23:00)');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    canViewTables: true,
    canCollectMoney: false,
    canManageTables: false,
    canViewOverview: false,
    canViewHistory: false,
    canManageMenu: false,
    canManageBanners: false,
    canManageStaff: false,
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Lock / Unlock Confirm
  const [staffToToggle, setStaffToToggle] = useState<Staff | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Modal Reset Password
  const [staffToReset, setStaffToReset] = useState<Staff | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const canManage = Boolean(currentUser?.role === 'admin' || currentUser?.canManageStaff);

  const roleNameMap: Record<StaffRole, string> = {
    admin: 'Chủ quán / Quản lý',
    cashier: 'Thu ngân quầy',
    waiter: 'Nhân viên phục vụ',
    kitchen: 'Đầu bếp & Pha chế',
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchSearch =
        searchTerm.trim() === '' ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.phone && s.phone.includes(searchTerm.trim()));

      const matchRole = roleFilter === 'all' || s.role === roleFilter;

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? s.status === 'active'
          : s.status === 'suspended';

      return matchSearch && matchRole && matchStatus;
    });
  }, [staffList, searchTerm, roleFilter, statusFilter]);

  // Metric counts
  const activeCount = staffList.filter((s) => s.status === 'active').length;
  const suspendedCount = staffList.filter((s) => s.status === 'suspended').length;
  const adminCount = staffList.filter((s) => s.role === 'admin' && s.status === 'active').length;

  // Set default permissions based on chosen role
  const applyRoleDefaults = (newRole: StaffRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setPermissions({
        canViewTables: true,
        canCollectMoney: true,
        canManageTables: true,
        canViewOverview: true,
        canViewHistory: true,
        canManageMenu: true,
        canManageBanners: true,
        canManageStaff: true,
      });
    } else if (newRole === 'cashier') {
      setPermissions({
        canViewTables: true,
        canCollectMoney: true,
        canManageTables: true,
        canViewOverview: false,
        canViewHistory: true,
        canManageMenu: true,
        canManageBanners: false,
        canManageStaff: false,
      });
    } else if (newRole === 'waiter') {
      setPermissions({
        canViewTables: true,
        canCollectMoney: true,
        canManageTables: false,
        canViewOverview: false,
        canViewHistory: false,
        canManageMenu: false,
        canManageBanners: false,
        canManageStaff: false,
      });
    } else {
      // kitchen
      setPermissions({
        canViewTables: true,
        canCollectMoney: false,
        canManageTables: false,
        canViewOverview: false,
        canViewHistory: false,
        canManageMenu: false,
        canManageBanners: false,
        canManageStaff: false,
      });
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingStaff(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('waiter');
    setPhone('');
    setShift('Ca Tối (17:00 - 23:00)');
    applyRoleDefaults('waiter');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setName(staff.name);
    setUsername(staff.username);
    setPassword(''); // Leave blank unless changing
    setRole(staff.role);
    setPhone(staff.phone || '');
    setShift(staff.shift || 'Ca linh hoạt');
    setPermissions({
      canViewTables: Boolean(staff.canViewTables ?? true),
      canCollectMoney: Boolean(staff.canCollectMoney),
      canManageTables: Boolean(staff.canManageTables),
      canViewOverview: Boolean(staff.canViewOverview),
      canViewHistory: Boolean(staff.canViewHistory),
      canManageMenu: Boolean(staff.canManageMenu),
      canManageBanners: Boolean(staff.canManageBanners),
      canManageStaff: Boolean(staff.canManageStaff),
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Toggle individual permission checkbox
  const handleTogglePerm = (key: string) => {
    setPermissions((prev) => {
      const nextVal = !prev[key];
      const updated = { ...prev, [key]: nextVal };

      // Dependency logic: If granting collect money, must be able to view tables
      if (key === 'canCollectMoney' && nextVal) {
        updated.canViewTables = true;
      }
      return updated;
    });
  };

  // Submit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      showToast('Bạn không có quyền chỉnh sửa nhân sự.', 'error');
      return;
    }

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanName) {
      setFormError('Vui lòng nhập họ và tên nhân viên.');
      return;
    }

    if (!cleanUsername) {
      setFormError('Vui lòng nhập tên tài khoản đăng nhập.');
      return;
    }

    if (!editingStaff && (!password.trim() || password.trim().length < 4)) {
      setFormError('Vui lòng nhập mật khẩu khởi tạo (tối thiểu 4 ký tự).');
      return;
    }

    // Protection rule check for last admin
    if (editingStaff?.role === 'admin' && (role !== 'admin' || !permissions.canManageStaff)) {
      if (adminCount <= 1) {
        setFormError('Không thể hạ vai trò hoặc thu hồi quyền của Quản trị viên (Admin) đang hoạt động duy nhất.');
        return;
      }
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, {
          name: cleanName,
          phone: phone.trim() || null,
          shift: shift.trim(),
          role,
          roleName: roleNameMap[role],
          password: password.trim() || undefined,
          ...permissions,
        });
      } else {
        await addStaff({
          name: cleanName,
          username: cleanUsername,
          password: password.trim(),
          phone: phone.trim() || null,
          shift: shift.trim(),
          role,
          roleName: roleNameMap[role],
          status: 'active',
          ...permissions,
        });
      }
      setIsFormModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Lỗi khi lưu dữ liệu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status Confirm
  const handleConfirmToggleStatus = async () => {
    if (!staffToToggle || !canManage) return;

    // Check last admin protection
    if (staffToToggle.role === 'admin' && staffToToggle.status === 'active' && adminCount <= 1) {
      showToast('Không thể tạm khóa Quản trị viên (Admin) đang hoạt động duy nhất!', 'error');
      setStaffToToggle(null);
      return;
    }

    setIsTogglingStatus(true);
    try {
      await toggleStaffStatus(staffToToggle.id);
      setStaffToToggle(null);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Reset Password Submit
  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffToReset || !canManage) return;

    if (!newPasswordInput.trim() || newPasswordInput.trim().length < 4) {
      showToast('Mật khẩu mới phải có ít nhất 4 ký tự.', 'error');
      return;
    }

    setIsResetting(true);
    try {
      await resetStaffPassword(staffToReset.id, newPasswordInput.trim());
      setStaffToReset(null);
      setNewPasswordInput('');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AdminLayout
      title="Nhân Viên & Phân Quyền (RBAC)"
      subtitle="Quản lý tài khoản nội bộ và thiết lập chi tiết quyền hạn vận hành cho từng vị trí"
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 shadow-warm-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-medium">Tổng nhân sự</span>
              <h4 className="font-headline font-black text-2xl text-on-surface mt-0.5">
                {isStaffLoading ? (
                  <span className="inline-block h-7 w-10 bg-surface-container rounded-lg animate-pulse" />
                ) : (
                  staffList.length
                )}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 shadow-warm-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-tertiary font-medium">Đang hoạt động</span>
              <h4 className="font-headline font-black text-2xl text-tertiary mt-0.5">
                {isStaffLoading ? (
                  <span className="inline-block h-7 w-10 bg-surface-container rounded-lg animate-pulse" />
                ) : (
                  activeCount
                )}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-tertiary-soft text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 shadow-warm-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-medium">Đang bị khóa</span>
              <h4 className="font-headline font-black text-2xl text-error mt-0.5">
                {isStaffLoading ? (
                  <span className="inline-block h-7 w-10 bg-surface-container rounded-lg animate-pulse" />
                ) : (
                  suspendedCount
                )}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-error-container/40 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">lock</span>
            </div>
          </div>
        </div>

        {/* Action Bar & Controls */}
        <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 shadow-warm-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên, username, SĐT..."
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface outline-none focus:border-primary transition-all"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản lý / Admin</option>
              <option value="cashier">Thu ngân quầy</option>
              <option value="waiter">Nhân viên phục vụ</option>
              <option value="kitchen">Đầu bếp / Pha chế</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface outline-none focus:border-primary transition-all"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="suspended">Đã bị khóa</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refreshStaffList()}
              disabled={isStaffLoading}
              title="Làm mới danh sách từ máy chủ"
              className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border text-on-surface-variant hover:text-on-surface transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[20px] ${isStaffLoading ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>

            {canManage && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs md:text-sm shadow-warm-xs flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Thêm nhân viên</span>
              </button>
            )}
          </div>
        </div>

        {/* Staff Table for Desktop */}
        <div className="bg-surface-container-lowest border border-border rounded-2xl overflow-hidden shadow-warm-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-surface-container-low border-b border-border text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Nhân viên</th>
                  <th className="py-3 px-4">Vai trò</th>
                  <th className="py-3 px-4">Tóm tắt quyền</th>
                  <th className="py-3 px-4">Ca trực</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isStaffLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-surface-container-high/60 shrink-0" />
                          <div className="space-y-1.5 flex-1">
                            <div className="h-4 w-28 bg-surface-container-high/60 rounded" />
                            <div className="h-3 w-16 bg-surface-container/60 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-6 w-20 bg-surface-container-high/60 rounded-full" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-4 w-32 bg-surface-container/60 rounded" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-4 w-24 bg-surface-container/60 rounded" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-6 w-24 bg-surface-container-high/60 rounded-full" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="h-7 w-20 bg-surface-container-high/60 rounded-lg ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                      Không tìm thấy nhân viên phù hợp bộ lọc
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => {
                    const isSelf = currentUser?.id === staff.id;
                    const isSuspended = staff.status === 'suspended';

                    return (
                      <tr
                        key={staff.id}
                        className={`hover:bg-surface-container-low/50 transition-colors ${
                          isSuspended ? 'bg-surface-container-low/30 opacity-75' : ''
                        }`}
                      >
                        {/* Name & Avatar */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shadow-xs">
                              {staff.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-on-surface">{staff.name}</span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-primary text-on-primary text-[10px] font-bold">
                                    Bạn
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-on-surface-variant block">
                                @{staff.username} • {staff.phone || 'Chưa cập nhật SĐT'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              staff.role === 'admin'
                                ? 'bg-primary-soft text-primary border border-primary/20'
                                : staff.role === 'cashier'
                                ? 'bg-secondary-soft text-secondary border border-secondary/20'
                                : staff.role === 'kitchen'
                                ? 'bg-surface-container text-on-surface'
                                : 'bg-tertiary-soft text-tertiary border border-tertiary/20'
                            }`}
                          >
                            {staff.roleName || roleNameMap[staff.role]}
                          </span>
                        </td>

                        {/* Permissions Summary Chips */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap max-w-xs">
                            {staff.role === 'admin' ? (
                              <span className="px-2 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold">
                                Toàn quyền quản trị
                              </span>
                            ) : (
                              <>
                                {staff.canCollectMoney && (
                                  <span className="px-2 py-0.5 rounded bg-tertiary-soft text-tertiary text-[10px] font-bold border border-tertiary/20">
                                    Thu tiền
                                  </span>
                                )}
                                {staff.canManageMenu && (
                                  <span className="px-2 py-0.5 rounded bg-primary-soft text-primary text-[10px] font-bold">
                                    Món ăn
                                  </span>
                                )}
                                {staff.canViewHistory && (
                                  <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-semibold">
                                    Lịch sử
                                  </span>
                                )}
                                {staff.canManageTables && (
                                  <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-semibold">
                                    Quản lý bàn
                                  </span>
                                )}
                                {!staff.canCollectMoney && !staff.canManageMenu && !staff.canViewHistory && (
                                  <span className="text-[11px] text-on-surface-variant italic">
                                    Chỉ xem bàn & gọi món
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        {/* Shift */}
                        <td className="py-3 px-4 text-xs text-on-surface-variant font-medium">
                          {staff.shift}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isSuspended
                                ? 'bg-error-container/40 text-error border border-error/30'
                                : 'bg-tertiary-soft text-tertiary'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSuspended ? 'bg-error' : 'bg-tertiary animate-pulse'
                              }`}
                            />
                            <span>{isSuspended ? 'Đã khóa' : 'Đang hoạt động'}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Reset password button */}
                            {canManage && (
                              <button
                                type="button"
                                onClick={() => {
                                  setStaffToReset(staff);
                                  setNewPasswordInput('');
                                }}
                                title="Đặt lại mật khẩu"
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all"
                              >
                                <span className="material-symbols-outlined text-[16px]">key</span>
                              </button>
                            )}

                            {/* Lock / Unlock button */}
                            {canManage && !isSelf && (
                              <button
                                type="button"
                                onClick={() => setStaffToToggle(staff)}
                                title={isSuspended ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isSuspended
                                    ? 'bg-tertiary-soft hover:bg-tertiary hover:text-on-tertiary text-tertiary'
                                    : 'bg-error-container/30 hover:bg-error hover:text-on-error text-error'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {isSuspended ? 'lock_open' : 'lock'}
                                </span>
                              </button>
                            )}

                            {/* Edit button */}
                            {canManage && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(staff)}
                                title="Chỉnh sửa thông tin & quyền"
                                className="p-1.5 rounded-lg bg-primary-soft hover:bg-primary text-primary hover:text-on-primary transition-all"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL THÊM / SỬA NHÂN VIÊN ================= */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-on-surface/50 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0" onClick={() => !isSubmitting && setIsFormModalOpen(false)} />

          <div className="relative z-10 w-full max-w-4xl bg-surface-container-lowest rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-warm-lg animate-pop-in border border-border">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-container-low/50">
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  {editingStaff ? `Chỉnh Sửa Hồ Sơ & Quyền: ${editingStaff.name}` : 'Tạo Tài Khoản Nhân Viên Mới'}
                </h3>
                <span className="text-xs text-on-surface-variant">
                  Phân quyền chi tiết theo từng chức năng, lưu trực tiếp vào cơ sở dữ liệu
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs flex items-center gap-2 animate-fade-in">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span>{formError}</span>
              </div>
            )}

            {/* Body Form */}
            <form id="staff-form" onSubmit={handleSubmitForm} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs md:text-sm">
              {/* Top Section: Account Info (2 Cols) */}
              <div>
                <h4 className="font-headline font-bold text-sm text-primary mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  <span>1. Thông tin tài khoản & ca trực</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-on-surface mb-1">
                      Họ và tên <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">
                      Tên đăng nhập <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={Boolean(editingStaff)}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ví dụ: hungnv"
                      className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all font-mono disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">
                      {editingStaff ? 'Mật khẩu mới (để trống nếu giữ nguyên)' : 'Mật khẩu khởi tạo *'}
                    </label>
                    <input
                      type="password"
                      required={!editingStaff}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={editingStaff ? '••••••••' : 'Tối thiểu 4 ký tự'}
                      className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Vai trò chính</label>
                    <select
                      value={role}
                      onChange={(e) => applyRoleDefaults(e.target.value as StaffRole)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all font-semibold"
                    >
                      <option value="waiter">Nhân viên phục vụ</option>
                      <option value="cashier">Thu ngân quầy</option>
                      <option value="kitchen">Đầu bếp & Pha chế</option>
                      <option value="admin">Chủ quán / Quản lý (Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Ca làm việc</label>
                    <input
                      type="text"
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      placeholder="Ca Tối (17h-23h)"
                      className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Section: Permissions Groups */}
              <div className="pt-2 border-t border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-headline font-bold text-sm text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>2. Bảng phân quyền chi tiết (RBAC)</span>
                  </h4>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    Tùy chỉnh linh hoạt theo thẩm quyền phân công
                  </span>
                </div>

                <div className="space-y-4">
                  {PERMISSION_GROUPS.map((group) => (
                    <div
                      key={group.name}
                      className="bg-surface-container-low/50 border border-border rounded-xl p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center gap-2 border-b border-border/30 pb-1.5">
                        <span className="material-symbols-outlined text-[17px] text-primary">
                          {group.icon}
                        </span>
                        <span className="font-bold text-xs text-on-surface">{group.name}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {group.permissions.map((p) => {
                          const isChecked = Boolean(permissions[p.key]);
                          return (
                            <label
                              key={p.key}
                              className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all select-none ${
                                isChecked
                                  ? 'bg-primary-soft/30 border-primary/40'
                                  : 'bg-surface-container-lowest border-border hover:bg-surface-container'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePerm(p.key)}
                                className="accent-primary w-4 h-4 rounded mt-0.5 shrink-0 cursor-pointer"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-on-surface block leading-tight">
                                  {p.label}
                                </span>
                                <span className="text-[11px] text-on-surface-variant leading-tight block mt-0.5">
                                  {p.desc}
                                </span>
                                {p.riskNote && (
                                  <span className="text-[10px] text-primary font-semibold block mt-1">
                                    ⚠️ {p.riskNote}
                                  </span>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-4 bg-surface-container-low border-t border-border flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="staff-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                )}
                <span>{editingStaff ? 'Lưu thay đổi' : 'Tạo nhân viên'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN KHÓA / MỞ KHÓA ================= */}
      {staffToToggle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0" onClick={() => !isTogglingStatus && setStaffToToggle(null)} />
          <div className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-2xl overflow-hidden shadow-warm-lg animate-pop-in border border-border p-6 space-y-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                staffToToggle.status === 'active'
                  ? 'bg-error-container/40 text-error'
                  : 'bg-tertiary-soft text-tertiary'
              }`}
            >
              <span className="material-symbols-outlined text-[26px]">
                {staffToToggle.status === 'active' ? 'lock' : 'lock_open'}
              </span>
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                {staffToToggle.status === 'active' ? 'Khóa Tài Khoản Nhân Viên' : 'Mở Khóa Tài Khoản Nhân Viên'}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Bạn có chắc chắn muốn {staffToToggle.status === 'active' ? 'tạm khóa' : 'mở khóa lại'} tài khoản của{' '}
                <strong className="text-on-surface font-bold">&ldquo;{staffToToggle.name}&rdquo;</strong> (@{staffToToggle.username})?
                {staffToToggle.status === 'active' && (
                  <span className="block mt-1 text-error font-medium">
                    Nhân viên này sẽ ngay lập tức bị ngắt quyền truy cập nội bộ và không thể đăng nhập cho đến khi được mở lại.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isTogglingStatus}
                onClick={() => setStaffToToggle(null)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isTogglingStatus}
                onClick={handleConfirmToggleStatus}
                className={`px-5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 ${
                  staffToToggle.status === 'active'
                    ? 'bg-error text-on-error hover:bg-error/90'
                    : 'bg-tertiary text-on-tertiary hover:bg-tertiary/90'
                }`}
              >
                {isTogglingStatus && (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                )}
                <span>{staffToToggle.status === 'active' ? 'Xác nhận khóa' : 'Xác nhận mở khóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL ĐẶT LẠI MẬT KHẨU ================= */}
      {staffToReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0" onClick={() => !isResetting && setStaffToReset(null)} />
          <div className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-2xl overflow-hidden shadow-warm-lg animate-pop-in border border-border p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[26px]">key</span>
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-headline font-bold text-lg text-on-surface">Đặt Lại Mật Khẩu</h3>
              <p className="text-xs text-on-surface-variant">
                Cấp mật khẩu mới cho nhân viên <strong className="text-on-surface">{staffToReset.name}</strong> (@{staffToReset.username})
              </p>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Mật khẩu mới <span className="text-primary">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Tối thiểu 4 ký tự"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest text-xs transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => setStaffToReset(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isResetting && (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                  )}
                  <span>Lưu mật khẩu mới</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
export default StaffRbacView;
