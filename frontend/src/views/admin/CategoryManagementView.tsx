import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const CategoryManagementView: React.FC = () => {
  const { categories, addCategory, deleteCategory, dishes } = useRestaurant();
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('restaurant_menu');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatIcon);
    setNewCatName('');
    setIsAdding(false);
  };

  const iconsList = [
    'restaurant_menu',
    'ramen_dining',
    'kebab_dining',
    'local_cafe',
    'whatshot',
    'soup_kitchen',
    'bakery_dining',
    'local_pizza',
  ];

  return (
    <AdminLayout
      title="Quản Lý Danh Mục Món"
      subtitle="Thiết lập các nhóm món ăn hiển thị trên thanh trượt thực đơn khách hàng"
    >
      <div className="space-y-6">
        {/* Top Header Row with Add CTA */}
        <div className="bg-surface-container-lowest border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <h3 className="font-headline font-bold text-base text-on-surface">
              Danh Sách Nhóm Món ({categories.length})
            </h3>
            <p className="text-xs text-on-surface-variant">
              Các danh mục sẽ tự động hiển thị dưới dạng thanh trượt lướt nhanh cho khách.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isAdding ? 'close' : 'add'}
            </span>
            <span>{isAdding ? 'Đóng' : 'Thêm danh mục mới'}</span>
          </button>
        </div>

        {/* Add Category Form Box */}
        {isAdding && (
          <form
            onSubmit={handleAddCategory}
            className="bg-surface-container-lowest border-2 border-primary-container/30 rounded-xl p-4 md:p-5 shadow-warm-xs space-y-4 animate-slide-up"
          >
            <h4 className="font-headline font-bold text-sm text-primary">Tạo Danh Mục Món Mới</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Tên danh mục <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="VD: Trà trái cây, Món nướng than..."
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-border text-xs md:text-sm text-on-surface outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Biểu tượng hiển thị
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {iconsList.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setNewCatIcon(icon)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                        newCatIcon === icon
                          ? 'bg-primary-container text-on-primary ring-2 ring-primary-container'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3.5 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-on-surface"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover"
              >
                Lưu danh mục
              </button>
            </div>
          </form>
        )}

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {categories.map((cat) => {
            const dishCount =
              cat.id === 'all'
                ? dishes.length
                : dishes.filter((d) => d.categoryId === cat.id).length;

            return (
              <div
                key={cat.id}
                className="bg-surface-container-lowest border border-border rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-primary-container/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-on-surface">{cat.name}</h4>
                    <span className="text-xs text-on-surface-variant">{dishCount} món hiện có</span>
                  </div>
                </div>

                {cat.id !== 'all' && (
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                    title="Xóa danh mục"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};
