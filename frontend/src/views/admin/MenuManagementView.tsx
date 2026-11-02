import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import { AdminLayout } from '../../components/admin/AdminLayout';
import type { Dish } from '../../types/restaurant';
import { MenuItemFormModal } from './MenuItemFormModal';

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

export const MenuManagementView: React.FC = () => {
  const {
    dishes,
    categories,
    isDishesLoading,
    dishesError,
    refreshDishes,
    toggleDishAvailability,
    deleteDish,
  } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 8;

  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);
  const [processingDishId, setProcessingDishId] = useState<string | null>(null);

  // Active dishes (excluding archived)
  const activeDishes = useMemo(() => dishes.filter((d) => !d.isArchived), [dishes]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return activeDishes.filter((dish) => {
      const matchesCat =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'trending'
          ? dish.badge === 'Bán chạy' || dish.badgeType === 'hot'
          : dish.categoryId === selectedCategory;

      const matchesSearch =
        searchTerm === '' ||
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAvailability =
        availabilityFilter === 'all'
          ? true
          : availabilityFilter === 'available'
          ? dish.isAvailable
          : !dish.isAvailable;

      return matchesCat && matchesSearch && matchesAvailability;
    });
  }, [activeDishes, selectedCategory, searchTerm, availabilityFilter]);

  // Pagination calculation
  const totalItems = filteredDishes.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const pagedDishes = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredDishes.slice(start, start + limit);
  }, [filteredDishes, page, limit]);

  // Statistics
  const stats = useMemo(() => {
    const total = activeDishes.length;
    const available = activeDishes.filter((d) => d.isAvailable).length;
    const unavailable = total - available;
    return { total, available, unavailable };
  }, [activeDishes]);

  const handleAddNew = () => {
    setEditingDish(null);
    setIsFormOpen(true);
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (dish: Dish) => {
    if (processingDishId) return;
    setProcessingDishId(dish.id);
    try {
      await toggleDishAvailability(dish.id);
    } finally {
      setProcessingDishId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!dishToDelete) return;
    setProcessingDishId(dishToDelete.id);
    try {
      await deleteDish(dishToDelete.id);
      setDishToDelete(null);
    } finally {
      setProcessingDishId(null);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setAvailabilityFilter('all');
    setPage(1);
  };

  return (
    <AdminLayout
      title="Quản Lý Món Ăn"
      subtitle="Quản lý danh sách món, trạng thái kinh doanh, đơn giá và cấu hình món ăn thật từ database"
    >
      <div className="space-y-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-border shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block">
                Tổng số món
              </span>
              <span className="font-headline font-black text-2xl text-on-surface">
                {isDishesLoading && dishes.length === 0 ? '...' : stats.total}
              </span>
            </div>
            <span className="material-symbols-outlined text-[28px] text-primary/70">restaurant_menu</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-border shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block">
                Đang mở bán
              </span>
              <span className="font-headline font-black text-2xl text-tertiary">
                {isDishesLoading && dishes.length === 0 ? '...' : stats.available}
              </span>
            </div>
            <span className="material-symbols-outlined text-[28px] text-tertiary/70">check_circle</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-border shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block">
                Tạm hết món
              </span>
              <span className="font-headline font-black text-2xl text-on-surface-variant">
                {isDishesLoading && dishes.length === 0 ? '...' : stats.unavailable}
              </span>
            </div>
            <span className="material-symbols-outlined text-[28px] text-on-surface-variant/70">do_not_disturb_on</span>
          </div>
        </div>

        {/* Top Control Bar: Search, Category Filter, Availability, Refresh, and Add Button */}
        <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm tên món ăn hoặc thành phần..."
              className="w-full h-10 pl-9 pr-4 bg-surface-container-low rounded-xl text-xs md:text-sm text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
            />
          </div>

          {/* Filter Dropdowns and Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface outline-none focus:border-primary transition-all"
            >
              <option value="all">Tất cả danh mục ({categories.length})</option>
              {categories
                .filter((c) => c.id !== 'all')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.count})
                  </option>
                ))}
            </select>

            {/* Availability Filter */}
            <select
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value as typeof availabilityFilter);
                setPage(1);
              }}
              className="h-10 px-3 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface outline-none focus:border-primary transition-all"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="available">Còn món</option>
              <option value="unavailable">Hết món</option>
            </select>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => refreshDishes()}
              aria-label="Làm mới thực đơn"
              className="h-10 px-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center gap-1.5 transition-colors"
              title="Làm mới thực đơn từ máy chủ"
            >
              <span className={`material-symbols-outlined text-[16px] ${isDishesLoading ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            {/* Add New Dish CTA */}
            <button
              onClick={handleAddNew}
              className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-xs transition-colors shrink-0 active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Thêm món</span>
            </button>
          </div>
        </div>

        {/* Error message banner */}
        {dishesError && (
          <div className="p-4 rounded-2xl bg-error-container/40 border border-error/30 text-error text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{dishesError}</span>
            </div>
            <button
              onClick={() => refreshDishes()}
              className="px-3.5 py-1.5 bg-error text-on-error rounded-xl font-bold shadow-xs hover:opacity-90"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Content Box */}
        <div className="bg-surface-container-lowest border border-border rounded-2xl overflow-hidden shadow-xs">
          {isDishesLoading && dishes.length === 0 ? (
            <div className="p-12 text-center text-xs text-on-surface-variant space-y-2">
              <span className="material-symbols-outlined text-[32px] animate-spin text-primary">sync</span>
              <p>Đang tải danh sách món ăn từ máy chủ MySQL...</p>
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="p-12 text-center text-xs text-on-surface-variant space-y-3">
              <div className="w-14 h-14 rounded-full bg-surface-container mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px] text-on-surface-variant/60">
                  search_off
                </span>
              </div>
              <p className="font-headline font-bold text-sm text-on-surface">
                {activeDishes.length === 0
                  ? 'Thực đơn của quán hiện chưa có món ăn nào'
                  : 'Không tìm thấy món ăn nào phù hợp với bộ lọc'}
              </p>
              {activeDishes.length === 0 ? (
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover"
                >
                  Thêm món đầu tiên
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover"
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Data Table (> 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm min-w-[700px]">
                  <thead className="bg-surface-container-low border-b border-border text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 w-[38%]">Món ăn</th>
                      <th className="py-3.5 px-4 w-[18%]">Danh mục</th>
                      <th className="py-3.5 px-4 w-[16%]">Giá bán</th>
                      <th className="py-3.5 px-4 w-[16%]">Trạng thái bán</th>
                      <th className="py-3.5 px-4 w-[12%] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {pagedDishes.map((dish) => (
                      <tr key={dish.id} className="hover:bg-surface-container-low/40 transition-colors">
                        {/* Dish Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={dish.image}
                              alt={dish.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                              }}
                              className="w-12 h-12 rounded-xl object-cover bg-surface-container shrink-0 border border-border"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-on-surface block">{dish.name}</span>
                                {dish.badge && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-secondary-container text-on-secondary-container">
                                    {dish.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-on-surface-variant line-clamp-1 max-w-xs mt-0.5">
                                {dish.description}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                          {dish.categoryName}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-headline font-bold text-primary">
                          <span>{dish.price.toLocaleString('vi-VN')}đ</span>
                          {dish.oldPrice && dish.oldPrice > dish.price && (
                            <span className="text-[11px] text-on-surface-variant line-through font-normal block">
                              {dish.oldPrice.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(dish)}
                            disabled={processingDishId === dish.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              dish.isAvailable
                                ? 'bg-tertiary-soft text-tertiary border border-tertiary-container/30 hover:opacity-85'
                                : 'bg-surface-container text-on-surface-variant border border-border hover:opacity-85'
                            } disabled:opacity-50`}
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
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(dish)}
                              aria-label={`Chỉnh sửa ${dish.name}`}
                              className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                              title="Chỉnh sửa món"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDishToDelete(dish)}
                              aria-label={`Xóa ${dish.name}`}
                              className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-surface-container rounded-lg transition-colors"
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
              <div className="md:hidden divide-y divide-border/60">
                {pagedDishes.map((dish) => (
                  <div key={dish.id} className="p-4 space-y-3 hover:bg-surface-container-low/40 transition-colors">
                    <div className="flex gap-3">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                        }}
                        className="w-16 h-16 rounded-xl object-cover bg-surface-container shrink-0 border border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                            {dish.categoryName}
                          </span>
                          {dish.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-secondary-container text-on-secondary-container">
                              {dish.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="font-headline font-bold text-sm text-on-surface truncate mt-0.5">
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
                        type="button"
                        onClick={() => handleToggleStatus(dish)}
                        disabled={processingDishId === dish.id}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                          dish.isAvailable
                            ? 'bg-tertiary-soft text-tertiary border border-tertiary-container/30'
                            : 'bg-surface-container text-on-surface-variant border border-border'
                        } disabled:opacity-50`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            dish.isAvailable ? 'bg-tertiary' : 'bg-on-surface-variant'
                          }`}
                        />
                        <span>{dish.isAvailable ? 'Còn món' : 'Hết món'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(dish)}
                          aria-label={`Sửa ${dish.name}`}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDishToDelete(dish)}
                          aria-label={`Xóa ${dish.name}`}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container text-error hover:bg-error-container/30 transition-colors"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-border bg-surface-container-low/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-on-surface-variant">
                    Hiển thị trang <strong>{page}</strong> / <strong>{totalPages}</strong> (Tổng {totalItems} món)
                  </span>

                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed text-on-surface"
                      title="Trang trước"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => setPage(pNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          page === pNum
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed text-on-surface"
                      title="Trang tiếp"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Menu Item Add/Edit Modal */}
      {isFormOpen && (
        <MenuItemFormModal
          dish={editingDish}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {dishToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div className="absolute inset-0" onClick={() => !processingDishId && setDishToDelete(null)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-md bg-surface-container-lowest border border-border rounded-2xl p-5 shadow-warm-lg space-y-4 animate-pop-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-error-container/40 text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">delete</span>
              </div>
              <div className="space-y-1">
                <h3 id="delete-dialog-title" className="font-headline font-bold text-base text-on-surface">
                  Xác nhận xóa món ăn?
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Bạn có chắc chắn muốn xóa món <strong className="text-on-surface">"{dishToDelete.name}"</strong>?
                </p>
                <p className="text-[11px] text-tertiary bg-tertiary-soft p-2.5 rounded-xl mt-2 leading-relaxed">
                  Lưu ý: Nếu món đã từng có trong lịch sử đơn hàng, hệ thống sẽ tự động chuyển sang lưu trữ và ngừng bán để bảo vệ sổ sách kế toán.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <button
                type="button"
                disabled={Boolean(processingDishId)}
                onClick={() => setDishToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors disabled:opacity-50 min-h-[38px]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={Boolean(processingDishId)}
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-error hover:bg-error/90 text-on-error text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 min-h-[38px]"
              >
                {processingDishId && (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-on-error border-t-transparent animate-spin" />
                )}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
export default MenuManagementView;
