import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import { AdminLayout } from '../../components/admin/AdminLayout';
import type { StaffRole } from '../../types/restaurant';

export const StaffRbacView: React.FC = () => {
  const { staffList, toggleStaffMoneyPermission, addStaff } = useRestaurant();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<StaffRole>('waiter');
  const [phone, setPhone] = useState('');
  const [canCollectMoney, setCanCollectMoney] = useState(true);
  const [shift, setShift] = useState('Ca Tối (17:00 - 23:00)');

  const roleNameMap: Record<StaffRole, string> = {
    admin: 'Chủ quán / Admin',
    cashier: 'Thu ngân quầy',
    waiter: 'Nhân viên phục vụ',
    kitchen: 'Đầu bếp & Pha chế',
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    addStaff({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      role,
      roleName: roleNameMap[role],
      phone: phone.trim() || '0900 000 000',
      canCollectMoney,
      shift,
      status: 'active',
    });

    setName('');
    setUsername('');
    setPhone('');
    setIsAdding(false);
  };

  return (
    <AdminLayout
      title="Nhân Viên & Phân Quyền (RBAC)"
      subtitle="Thiết lập danh sách nhân sự vận hành quán và cấp quyền xác nhận thu tiền tại bàn"
    >
      <div className="space-y-6">
        {/* Top Control Header */}
        <div className="bg-surface-container-lowest border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <h3 className="font-headline font-bold text-base text-on-surface">
              Danh Sách Nhân Sự ({staffList.length} người)
            </h3>
            <p className="text-xs text-on-surface-variant">
              Theo quy tắc vận hành, chỉ nhân viên có quyền "Thu tiền" mới được bấm xác nhận đã nhận đủ tiền từ khách.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isAdding ? 'close' : 'person_add'}
            </span>
            <span>{isAdding ? 'Đóng' : 'Thêm nhân viên'}</span>
          </button>
        </div>

        {/* Add Staff Modal/Form */}
        {isAdding && (
          <form
            onSubmit={handleAddStaff}
            className="bg-surface-container-lowest border-2 border-primary-container/30 rounded-xl p-5 shadow-warm-xs space-y-4 animate-slide-up"
          >
            <h4 className="font-headline font-bold text-sm text-primary">Tạo Hồ Sơ Nhân Viên Mới</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Họ và tên <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-border text-xs text-on-surface outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Tên tài khoản (Username) <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="anv"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-border text-xs text-on-surface outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Vai trò</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-border text-xs text-on-surface outline-none focus:border-primary-container"
                >
                  <option value="waiter">Nhân viên phục vụ</option>
                  <option value="cashier">Thu ngân quầy</option>
                  <option value="kitchen">Đầu bếp & Pha chế</option>
                  <option value="admin">Quản lý / Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-border text-xs text-on-surface outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Ca làm việc</label>
                <input
                  type="text"
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-border text-xs text-on-surface outline-none focus:border-primary-container"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="canCollect"
                  checked={canCollectMoney}
                  onChange={(e) => setCanCollectMoney(e.target.checked)}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="canCollect" className="text-xs font-bold text-on-surface cursor-pointer">
                  Cấp quyền thu tiền tại bàn
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-on-surface"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover"
              >
                Lưu nhân sự
              </button>
            </div>
          </form>
        )}

        {/* Staff Table for Desktop */}
        <div className="hidden md:block bg-surface-container-lowest border border-border rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-surface-container-low border-b border-border text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Nhân viên</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Ca trực</th>
                <th className="py-3 px-4">Quyền thu tiền</th>
                <th className="py-3 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-on-surface block">{staff.name}</span>
                        <span className="text-[11px] text-on-surface-variant">@{staff.username} • {staff.phone}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-on-surface">{staff.roleName}</span>
                  </td>

                  <td className="py-3 px-4 text-on-surface-variant">{staff.shift}</td>

                  {/* Money Collection Permission Toggle */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleStaffMoneyPermission(staff.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        staff.canCollectMoney
                          ? 'bg-tertiary-soft text-tertiary border border-tertiary-container/30'
                          : 'bg-surface-container text-on-surface-variant border border-border'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {staff.canCollectMoney ? 'payments' : 'block'}
                      </span>
                      <span>{staff.canCollectMoney ? 'Được thu tiền' : 'Không có quyền'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-xs text-tertiary font-bold">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                      <span>Đang trong ca</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Staff Mobile Cards */}
        <div className="md:hidden space-y-3">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="bg-surface-container-lowest border border-border rounded-xl p-3.5 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-on-surface">{staff.name}</h4>
                    <span className="text-[11px] text-primary font-bold">{staff.roleName}</span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              </div>

              <div className="text-xs text-on-surface-variant">Ca: {staff.shift}</div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-medium text-on-surface-variant">Quyền thu tiền:</span>
                <button
                  onClick={() => toggleStaffMoneyPermission(staff.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    staff.canCollectMoney
                      ? 'bg-tertiary-soft text-tertiary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {staff.canCollectMoney ? 'payments' : 'block'}
                  </span>
                  <span>{staff.canCollectMoney ? 'Cho phép' : 'Khóa'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
