import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import type { Staff } from '../../types/restaurant';

export const StaffLoginView: React.FC = () => {
  const { staffList, loginAs, setViewRoute, showToast } = useRestaurant();

  // Step 1: Authentication, Step 2: Shift confirmation
  const [step, setStep] = useState<'auth' | 'shift'>('auth');
  const [authenticatedStaff, setAuthenticatedStaff] = useState<Staff | null>(null);

  // Form states (no prefilled secrets)
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedShift, setSelectedShift] = useState<string>('Ca Tối (17h - 23h)');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMsg('Vui lòng nhập mã nhân viên hoặc tên đăng nhập');
      return;
    }
    if (!cleanPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu hoặc mã PIN ca trực');
      return;
    }

    // Match with internal staff database
    const matchedStaff = staffList.find(
      (s) =>
        s.username.toLowerCase() === cleanUsername ||
        s.id.toLowerCase() === cleanUsername ||
        s.role.toLowerCase() === cleanUsername ||
        s.phone.replace(/\s+/g, '') === cleanUsername.replace(/\s+/g, '')
    );

    // Demonstration PIN check: allows standard PIN 1234 or any password >= 4 chars
    if (!matchedStaff || cleanPassword !== '1234') {
      setErrorMsg('Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.');
      return;
    }

    // Authentication successful -> proceed to shift verification
    setAuthenticatedStaff(matchedStaff);
    setSelectedShift(matchedStaff.shift || 'Ca Tối (17h - 23h)');
    setStep('shift');
  };

  const handleConfirmShiftAndEnter = () => {
    if (!authenticatedStaff) return;
    const staffWithShift: Staff = {
      ...authenticatedStaff,
      shift: selectedShift,
      status: 'active',
    };
    loginAs(staffWithShift);
    showToast(`Chào mừng ${authenticatedStaff.name} đã vào ca trực ${selectedShift}!`, 'success');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 md:p-8">
      {/* Top Bar with Back to Customer Lobby */}
      <div className="max-w-md md:max-w-4xl mx-auto w-full flex items-center justify-between pb-4">
        <button
          onClick={() => setViewRoute('lobby')}
          className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-primary hover:underline bg-surface-container-lowest px-3.5 py-1.5 rounded-full border border-border shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Về Sảnh Khách (Bàn 05)</span>
        </button>

        <span className="text-xs text-on-surface-variant font-medium">
          Cổng Nội Bộ • Huy CV
        </span>
      </div>

      {/* Main Authentication Box */}
      <div className="max-w-md mx-auto w-full bg-surface-container-lowest border border-border rounded-2xl p-6 md:p-8 shadow-warm-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary mx-auto flex items-center justify-center shadow-warm-sm">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>
          <h2 className="font-headline font-extrabold text-2xl text-primary">
            Huy CV • Quản Lý Quán
          </h2>
          <p className="text-xs text-on-surface-variant font-medium">
            {step === 'auth'
              ? 'Xác thực tài khoản nhân viên & quản lý nội bộ'
              : 'Xác nhận ca trực trước khi vào bàn giao'}
          </p>
        </div>

        {step === 'auth' ? (
          /* Step 1: Secure Credentials Form */
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0">warning</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Username / Staff ID */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Mã nhân viên hoặc Tên đăng nhập <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px] pointer-events-none">
                  badge
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="VD: admin, huynv, lannt..."
                  className="w-full pl-11 pr-3 py-2.5 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all"
                />
              </div>
            </div>

            {/* Password / Shift PIN */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Mật khẩu / Mã PIN ca trực <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px] pointer-events-none">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Nhập mã bảo mật"
                  className="w-full pl-11 pr-11 py-2.5 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-surface-container-low/80 rounded-xl p-3 text-[11px] text-on-surface-variant flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">
                security
              </span>
              <p>
                Cổng truy cập dành riêng cho nhân sự quán Huy CV. Tài khoản do quản trị viên cấp, không hỗ trợ đăng ký công khai.
              </p>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary-hover font-headline font-bold text-sm shadow-warm-sm transition-transform active:scale-98 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Xác thực tài khoản ca trực</span>
            </button>
          </form>
        ) : (
          /* Step 2: Shift Selection Confirmation */
          <div className="space-y-5 animate-fade-in">
            {authenticatedStaff && (
              <div className="p-4 rounded-xl bg-primary-soft/60 border border-primary/20 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-base shadow-xs">
                  {authenticatedStaff.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-on-surface">
                    {authenticatedStaff.name}
                  </h4>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-primary-container text-on-primary text-[10px] font-bold mt-0.5">
                    {authenticatedStaff.roleName}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                Chọn ca làm việc hôm nay
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'Ca Sáng (06h - 12h)', label: 'Ca Sáng (06h00 - 12h00)' },
                  { id: 'Ca Chiều (12h - 17h)', label: 'Ca Chiều (12h00 - 17h00)' },
                  { id: 'Ca Tối (17h - 23h)', label: 'Ca Tối (17h00 - 23h00) • Giờ cao điểm' },
                ].map((shift) => (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={() => setSelectedShift(shift.id)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      selectedShift === shift.id
                        ? 'border-primary-container bg-primary-soft text-primary font-bold'
                        : 'border-border bg-surface-container-low hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span>{shift.label}</span>
                    {selectedShift === shift.id && (
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        check_circle
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('auth');
                  setPassword('');
                }}
                className="w-1/3 py-3 rounded-xl bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-container-high transition-colors"
              >
                Đổi tài khoản
              </button>
              <button
                type="button"
                onClick={handleConfirmShiftAndEnter}
                className="flex-1 py-3 rounded-xl bg-primary-container text-on-primary hover:bg-primary-hover font-headline font-bold text-xs md:text-sm shadow-warm-sm flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <span>Bắt đầu ca trực</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-on-surface-variant/70 pt-4">
        Hệ thống vận hành quán nước vỉa hè Huy CV
      </div>
    </div>
  );
};
export default StaffLoginView;
