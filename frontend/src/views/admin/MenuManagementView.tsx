import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import { AdminLayout } from '../../components/admin/AdminLayout';
import type { Dish } from '../../types/restaurant';
import { MenuItemFormModal } from './MenuItemFormModal';

export const MenuManagementView: React.FC = () => {
  const { dishes, categories, toggleDishAvailability, deleteDish } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const filteredDishes = dishes.filter((dish) => {
    const matchesCat = selectedCategory === 'all' || dish.categoryId === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddNew = () => {
    setEditingDish(null);
    setIsFormOpen(true);
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setIsFormOpen(true);
  };

  const handleDelete = (dish: Dish) => {
    if (confirm(`Bạn có chắc chắn muốn xóa món "${dish.name}" khỏi thực đơn?`)) {
      deleteDish(dish.id);
    }
  };

  return (
    <AdminLayout
      title="Quản Lý Món Ăn"
      subtitle="Quản lý danh sách món, trạng thái kinh doanh, đơn giá và công thức topping"
    >
      <div className="space-y-4">
        {/* Top Control Bar: Search, Category Filter, and Add Button */}
        <div className="bg-surface-container-lowest border border-border rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tên món ăn hoặc thành phần..."
              className="w-full h-10 pl-9 pr-4 bg-surface-container-low rounded-lg text-xs md:text-sm text-on-surface border border-border outline-none focus:border-primary-container"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 bg-surface-container-low border border-border rounded-lg text-xs md:text-sm text-on-surface outline-none focus:border-primary-container"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Add New Dish CTA */}
            <button
              onClick={handleAddNew}
              className="h-10 px-4 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">Thêm món mới</span>
              <span className="sm:hidden">Thêm</span>
            </button>
          </div>
        </div>

        {/* Desktop Data Table (> 768px) */}
        <div className="hidden md:block bg-surface-container-lowest border border-border rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-surface-container-low border-b border-border text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Món ăn</th>
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4">Giá bán</th>
                <th className="py-3 px-4">Trạng thái bán</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredDishes.map((dish) => (
                <tr key={dish.id} className="hover:bg-surface-container-low/50 transition-colors">
                  {/* Dish Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-12 h-12 rounded-lg object-cover bg-surface-container shrink-0"
                      />
                      <div>
                        <span className="font-bold text-on-surface block">{dish.name}</span>
                        <span className="text-[11px] text-on-surface-variant line-clamp-1 max-w-xs">
                          {dish.description}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 text-on-surface-variant">{dish.categoryName}</td>

                  {/* Price */}
                  <td className="py-3 px-4 font-headline font-bold text-primary">
                    {dish.price.toLocaleString('vi-VN')}đ
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleDishAvailability(dish.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        dish.isAvailable
                          ? 'bg-tertiary-soft text-tertiary border border-tertiary-container/30'
                          : 'bg-surface-container text-on-surface-variant border border-border'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          dish.isAvailable ? 'bg-tertiary' : 'bg-on-surface-variant'
                        }`}
                      />
                      <span>{dish.isAvailable ? 'Còn món' : 'Hết món'}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(dish)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                        title="Chỉnh sửa món"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(dish)}
                        className="p-1.5 text-on-surface-variant hover:text-error hover:bg-surface-container rounded-lg transition-colors"
                        title="Xóa món"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (< 768px) */}
        <div className="md:hidden space-y-3">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-surface-container-lowest border border-border rounded-xl p-3.5 shadow-xs space-y-3"
            >
              <div className="flex gap-3">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-16 h-16 rounded-lg object-cover bg-surface-container shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                    {dish.categoryName}
                  </span>
                  <h4 className="font-headline font-bold text-sm text-on-surface truncate">
                    {dish.name}
                  </h4>
                  <div className="font-headline font-bold text-sm text-primary mt-1">
                    {dish.price.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <button
                  onClick={() => toggleDishAvailability(dish.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    dish.isAvailable
                      ? 'bg-tertiary-soft text-tertiary border border-tertiary-container/30'
                      : 'bg-surface-container text-on-surface-variant border border-border'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      dish.isAvailable ? 'bg-tertiary' : 'bg-on-surface-variant'
                    }`}
                  />
                  <span>{dish.isAvailable ? 'Còn món' : 'Hết món'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(dish)}
                    className="p-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(dish)}
                    className="p-1.5 rounded-lg bg-surface-container text-error hover:bg-error-container/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Item Add/Edit Modal */}
      {isFormOpen && (
        <MenuItemFormModal
          dish={editingDish}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </AdminLayout>
  );
};
