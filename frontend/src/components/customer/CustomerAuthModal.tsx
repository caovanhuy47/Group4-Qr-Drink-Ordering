import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';

export const CustomerAuthModal: React.FC = () => {
  const {
    isCustomerAuthModalOpen,
    setIsCustomerAuthModalOpen,
    loginCustomer,
    registerCustomer,
    currentTable,
  } = useRestaurant();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isCustomerAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!phone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại');
      return;
    }
    if (phone.trim().length < 9) {
      setErrorMessage('Số điện thoại không hợp lệ (ít nhất 9 số)');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu tối thiểu 6 ký tự');
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMessage('Vui lòng nhập họ và tên');
        return;
      }
      const res = registerCustomer(fullName, phone, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } else {
      const res = loginCustomer(phone, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    }
  };

  const handleClose = () => {
    setIsCustomerAuthModalOpen(false);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-warm-lg border border-border overflow-hidden animate-pop-in">
        {/* Header with Brand Accent */}
        <div className="bg-gradient-to-r from-primary to-primary-container p-5 text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-on-primary/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">account_circle</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg leading-tight">
                Tài Khoản Khách Hàng
              </h3>
              <p className="text-[11px] text-on-primary-container">
                Huy CV • Đang phục vụ tại {currentTable}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-on-primary/15 hover:bg-on-primary/25 flex items-center justify-center text-on-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Switcher: Đăng nhập vs Đăng ký */}
        <div className="flex border-b border-border bg-surface-container-low/60">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-xs md:text-sm font-headline font-bold transition-colors ${
              mode === 'login'
                ? 'text-primary border-b-2 border-primary bg-surface-container-lowest'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-xs md:text-sm font-headline font-bold transition-colors ${
              mode === 'register'
                ? 'text-primary border-b-2 border-primary bg-surface-container-lowest'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Đăng ký thành viên
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Họ và tên quý khách <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                  badge
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Huy"
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low rounded-xl text-xs md:text-sm text-on-surface border border-border focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Số điện thoại <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                phone_iphone
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912345678"
                className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low rounded-xl text-xs md:text-sm text-on-surface border border-border focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Mật khẩu <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full pl-10 pr-10 py-2.5 bg-surface-container-low rounded-xl text-xs md:text-sm text-on-surface border border-border focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-on-surface-variant hover:text-on-surface p-0.5"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Guest Reminder */}
          <div className="bg-secondary-soft/70 border border-secondary-container/60 rounded-xl p-3 text-[11px] text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">
              info
            </span>
            <p>
              Khách vãng lai quét mã QR tại bàn vẫn có thể chọn món và gửi đơn bình thường mà không bắt buộc phải đăng nhập. Giỏ hàng và bàn <strong>{currentTable}</strong> sẽ luôn được giữ nguyên.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-primary-container text-on-primary font-headline font-bold text-xs md:text-sm shadow-warm-sm hover:bg-primary-hover active:scale-98 transition-all"
            >
              {mode === 'login' ? 'Đăng nhập vào bàn' : 'Tạo tài khoản thành viên'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2 text-xs text-on-surface-variant hover:text-on-surface font-semibold"
            >
              Tiếp tục gọi món với tư cách khách vãng lai
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CustomerAuthModal;

