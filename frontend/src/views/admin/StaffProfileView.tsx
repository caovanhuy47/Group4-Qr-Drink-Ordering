import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { reportsApi } from '../../services/reportsApi';

export const StaffProfileView: React.FC = () => {
  const { currentUser, logout, setViewRoute, updateProfile, resetStaffPassword, showToast } = useRestaurant();

  // Shift performance metrics from real backend database
  const [shiftOrdersCount, setShiftOrdersCount] = useState<number>(0);
  const [shiftRevenue, setShiftRevenue] = useState<number>(0);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);

  // Edit Profile Modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editShift, setEditShift] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Change Password/PIN Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');

  // Sound notification preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('huycv_notification_sound') !== 'false';
    } catch {
      return true;
    }
  });

  // Fetch real performance metrics for currentUser from MySQL payment history
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;

    reportsApi
      .fetchPaymentHistory({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const records = res.data || [];
        const staffName = currentUser.name.toLowerCase();

        // Match records confirmed by current staff member
        const userRecords = records.filter(
          (r) => r.confirmedBy && r.confirmedBy.toLowerCase().includes(staffName)
        );

        const count = userRecords.length;
        const total = userRecords.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);

        setShiftOrdersCount(count);
        setShiftRevenue(total);
      })
      .catch((err) => {
        console.error('Không thể tải hiệu suất ca trực:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMetrics(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleOpenEditProfile = () => {
    if (!currentUser) return;
    setEditName(currentUser.name);
    setEditPhone(currentUser.phone || '');
    setEditShift(currentUser.shift || 'Ca Chiều (15h - 23h)');
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const cleanName = editName.trim();
    if (!cleanName) {
      showToast('Họ và tên không được để trống', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateProfile({
        name: cleanName,
        phone: editPhone.trim() || undefined,
        shift: editShift.trim() || undefined,
      });

      if (res.success) {
        showToast('Cập nhật thông tin hồ sơ thành công!', 'success');
        setIsEditProfileOpen(false);
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi cập nhật hồ sơ', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setPasswordError('');

    if (newPassword.length < 4) {
      setPasswordError('Mật khẩu / Mã PIN ca trực phải có ít nhất 4 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await resetStaffPassword(currentUser.id, newPassword);
      if (res.success) {
        showToast('Đã đổi mật khẩu / mã PIN đăng nhập thành công!', 'success');
        setIsPasswordModalOpen(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.message);
      }
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Không thể cập nhật mật khẩu');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleToggleSound = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setSoundEnabled(val);
    try {
      localStorage.setItem('huycv_notification_sound', String(val));
    } catch {}
    showToast(val ? 'Đã bật chuông báo đơn mới' : 'Đã tắt chuông báo đơn mới', 'info');
  };

  if (!currentUser) {
    return (
      <AdminLayout title="Hồ Sơ Cá Nhân">
        <div className="p-8 text-center space-y-3">
          <p className="text-sm text-on-surface-variant">Bạn chưa đăng nhập vào hệ thống quản lý.</p>
          <button
            onClick={() => setViewRoute('login')}
            className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-bold text-xs"
          >
            Đến trang đăng nhập
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Tài Khoản & Ca Làm Việc"
      subtitle="Theo dõi hiệu suất phục vụ thực tế trong ca trực và thông tin phân công nhiệm vụ"
    >
      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest border border-border rounded-2xl p-5 md:p-6 shadow-warm-xs flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center font-headline font-bold text-2xl sm:text-3xl shadow-warm-sm shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-bold uppercase tracking-wider">
                {currentUser.roleName}
              </div>
              <h3 className="font-headline font-bold text-xl md:text-2xl text-on-surface truncate">
                {currentUser.name}
              </h3>
              <p className="text-xs text-on-surface-variant truncate">
                Tài khoản: @{currentUser.username} • SĐT: {currentUser.phone || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenEditProfile}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Chỉnh sửa hồ sơ</span>
          </button>
        </div>

        {/* Real Shift Summary Cards from Backend MySQL Database */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface-container-lowest border border-border rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-on-surface-variant font-medium block">
              Ca trực hiện tại
            </span>
            <span className="font-headline font-bold text-sm text-on-surface mt-1 block truncate">
              {currentUser.shift || 'Toàn thời gian'}
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-on-surface-variant font-medium block">
              Đơn đã phục vụ (Database)
            </span>
            {isLoadingMetrics ? (
              <div className="h-7 w-16 bg-surface-container rounded animate-pulse mt-1" />
            ) : (
              <span className="font-headline font-bold text-xl text-primary mt-1 block">
                {shiftOrdersCount} đơn
              </span>
            )}
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-on-surface-variant font-medium block">
              Doanh số thu tại bàn
            </span>
            {isLoadingMetrics ? (
              <div className="h-7 w-24 bg-surface-container rounded animate-pulse mt-1" />
            ) : (
              <span className="font-headline font-bold text-xl text-tertiary mt-1 block">
                {shiftRevenue.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>
        </div>

        {/* Settings and Options */}
        <div className="bg-surface-container-lowest border border-border rounded-xl overflow-hidden shadow-xs divide-y divide-border/60">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">
                notifications_active
              </span>
              <div>
                <span className="font-bold text-xs md:text-sm text-on-surface block">
                  Chuông báo khi có đơn món mới
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Phát âm thanh chuông khi khách tại bàn gửi đơn vào bếp
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={handleToggleSound}
              className="accent-primary w-5 h-5 cursor-pointer"
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                password
              </span>
              <div>
                <span className="font-bold text-xs md:text-sm text-on-surface block">
                  Đổi mật khẩu / Mã PIN ca trực
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Cập nhật mã bảo mật đăng nhập tài khoản cá nhân
                </span>
              </div>
            </div>
            <button
              onClick={handleOpenPasswordModal}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
            >
              Đổi PIN
            </button>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-error text-[20px]">logout</span>
              <div>
                <span className="font-bold text-xs md:text-sm text-error block">
                  Đăng xuất tài khoản
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Kết thúc phiên làm việc trên thiết bị này
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-3.5 py-1.5 rounded-lg bg-error-container/20 text-error hover:bg-error-container text-xs font-bold transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-warm-lg border border-border p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Chỉnh sửa thông tin cá nhân
              </h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Họ và tên <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface focus:border-primary-container outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface focus:border-primary-container outline-none"
                  placeholder="09xx xxx xxx"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Ca làm việc
                </label>
                <select
                  value={editShift}
                  onChange={(e) => setEditShift(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface focus:border-primary-container outline-none"
                >
                  <option value="Toàn thời gian (08:00 - 23:00)">Toàn thời gian (08:00 - 23:00)</option>
                  <option value="Ca Sáng (06:00 - 12:00)">Ca Sáng (06:00 - 12:00)</option>
                  <option value="Ca Chiều (12:00 - 17:00)">Ca Chiều (12:00 - 17:00)</option>
                  <option value="Ca Chiều - Tối (15:00 - 23:00)">Ca Chiều - Tối (15:00 - 23:00)</option>
                  <option value="Ca Tối (17:00 - 23:30)">Ca Tối (17:00 - 23:30)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-container-high transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary-hover font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password / PIN Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-warm-lg border border-border p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Đổi mật khẩu / Mã PIN ca trực
              </h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Mật khẩu mới (ít nhất 4 ký tự) <span className="text-error">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface focus:border-primary-container outline-none"
                    placeholder="Nhập mã mới"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Xác nhận mật khẩu mới <span className="text-error">*</span>
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface focus:border-primary-container outline-none"
                  placeholder="Nhập lại mã mới"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-container-high transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary-hover font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSavingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default StaffProfileView;
