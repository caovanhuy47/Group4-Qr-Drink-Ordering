import React, { useState, useEffect } from 'react';
import type { Category } from '../../types/restaurant';
import { useRestaurant } from '../../contexts/useRestaurant';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const CategoryManagementView: React.FC = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
    dishes,
    setViewRoute,
  } = useRestaurant();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('restaurant_menu');
  const [newCatOrder, setNewCatOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit category modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('restaurant_menu');
  const [editOrder, setEditOrder] = useState<number>(0);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete category confirmation state
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Keyboard Escape listener for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingCategory && !isEditSubmitting) setEditingCategory(null);
        if (catToDelete && !isDeleting) setCatToDelete(null);
        if (isAdding && !isSubmitting) setIsAdding(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCategory, isEditSubmitting, catToDelete, isDeleting, isAdding, isSubmitting]);

  const iconsList = [
    'restaurant_menu',
    'ramen_dining',
    'kebab_dining',
    'local_cafe',
    'whatshot',
    'soup_kitchen',
    'bakery_dining',
    'local_pizza',
    'fastfood',
    'lunch_dining',
    'set_meal',
    'icecream',
  ];

  const handleOpenAdd = () => {
    setNewCatName('');
    setNewCatIcon('restaurant_menu');
    setNewCatOrder(categories.length + 1);
    setFormError(null);
    setIsAdding(true);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setFormError('Vui lòng nhập tên danh mục');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await addCategory(trimmed, newCatIcon, newCatOrder);
      setNewCatName('');
      setIsAdding(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Không thể tạo danh mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditIcon(cat.icon || 'restaurant_menu');
    setEditOrder(cat.order || 0);
    setEditError(null);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError('Vui lòng nhập tên danh mục');
      return;
    }

    setIsEditSubmitting(true);
    setEditError(null);
    try {
      await updateCategory(editingCategory.id, trimmed, editIcon, editOrder);
      setEditingCategory(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Không thể cập nhật danh mục');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!catToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCategory(catToDelete.id);
      setCatToDelete(null);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Không thể xóa danh mục');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((c) =>
    searchTerm.trim() === ''
      ? true
      : c.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <AdminLayout
      title="Quản Lý Danh Mục Món"
      subtitle="Thiết lập các nhóm món ăn hiển thị trên thanh trượt thực đơn khách hàng"
    >
      <div className="space-y-5">
        {/* Stat Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-on-surface-variant font-medium block">Tổng số danh mục</span>
              <span className="font-headline font-black text-2xl text-on-surface mt-0.5">
                {categories.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">category</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-on-surface-variant font-medium block">Danh mục quán tạo</span>
              <span className="font-headline font-black text-2xl text-primary mt-0.5">
                {categories.filter((c) => c.id !== 'all' && c.id !== 'trending').length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">storefront</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-on-surface-variant font-medium block">Danh mục hệ thống</span>
              <span className="font-headline font-black text-2xl text-secondary mt-0.5">
                {categories.filter((c) => c.id === 'all' || c.id === 'trending').length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary-soft text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            </div>
          </div>
        </div>

        {/* Top Control Bar with Search and Add CTA */}
        <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          {/* Search box */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm danh mục..."
              className="w-full h-10 pl-9 pr-4 bg-surface-container-low rounded-xl text-xs md:text-sm text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refreshCategories()}
              aria-label="Làm mới danh mục"
              className="h-10 px-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center gap-1.5 transition-colors"
              title="Làm mới danh mục từ máy chủ"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-xs transition-colors shrink-0 active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Thêm danh mục mới</span>
            </button>
          </div>
        </div>

        {/* Add Category Collapsible Form */}
        {isAdding && (
          <form
            onSubmit={handleAddCategory}
            className="bg-surface-container-lowest border-2 border-primary-container/40 rounded-2xl p-5 shadow-warm-xs space-y-4 animate-slide-up"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h4 className="font-headline font-bold text-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>Tạo Danh Mục Món Mới</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
                aria-label="Đóng form tạo danh mục"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-error-container/30 border border-error/30 rounded-xl text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-on-surface">
                  Tên danh mục <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="VD: Trà trái cây, Món nướng than..."
                  className="w-full h-10 px-3 bg-surface-container-low rounded-xl border border-border text-xs md:text-sm text-on-surface outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={newCatOrder}
                  onChange={(e) => setNewCatOrder(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-xl border border-border text-xs md:text-sm text-on-surface outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="block text-xs font-bold text-on-surface">
                  Biểu tượng hiển thị trên thực đơn
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {iconsList.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setNewCatIcon(icon)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        newCatIcon === icon
                          ? 'bg-primary text-on-primary ring-2 ring-primary ring-offset-2 ring-offset-surface shadow-xs'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      aria-label={`Chọn biểu tượng ${icon}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting && (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                )}
                <span>Lưu danh mục</span>
              </button>
            </div>
          </form>
        )}

        {/* Category Cards Grid */}
        <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 shadow-xs">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-xs text-on-surface-variant space-y-3">
              <div className="w-14 h-14 rounded-full bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant/60">
                <span className="material-symbols-outlined text-[28px]">category</span>
              </div>
              <p className="font-headline font-bold text-sm text-on-surface">
                {searchTerm ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục nào'}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover"
                >
                  Xóa từ khóa tìm kiếm
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {filteredCategories.map((cat) => {
                const isSystem = cat.id === 'all' || cat.id === 'trending';
                const dishCount =
                  cat.id === 'all'
                    ? dishes.filter((d) => !d.isArchived).length
                    : cat.id === 'trending'
                    ? dishes.filter((d) => !d.isArchived && (d.badge === 'Bán chạy' || d.badgeType === 'hot')).length
                    : dishes.filter((d) => !d.isArchived && d.categoryId === cat.id).length;

                return (
                  <div
                    key={cat.id}
                    className="bg-surface-container-low/40 border border-border/80 hover:border-primary-container/40 rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center shrink-0 border border-primary-container/20 group-hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined text-[26px]">{cat.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-headline font-bold text-sm text-on-surface">
                              {cat.name}
                            </h4>
                            {isSystem && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-secondary-container text-on-secondary-container">
                                Hệ thống
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-on-surface-variant block mt-0.5 font-medium">
                            {dishCount} món đang mở bán
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          aria-label={`Chỉnh sửa ${cat.name}`}
                          className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                          title="Chỉnh sửa danh mục"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>

                        {!isSystem && (
                          <button
                            type="button"
                            onClick={() => {
                              setCatToDelete(cat);
                              setDeleteError(null);
                            }}
                            aria-label={`Xóa danh mục ${cat.name}`}
                            className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
                            title="Xóa danh mục"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>Mã: <code className="bg-surface-container px-1 py-0.5 rounded text-[10px]">{cat.id}</code></span>
                      <span>Thứ tự: <strong>#{cat.order ?? 0}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-cat-dialog-title"
        >
          <div
            className="absolute inset-0"
            onClick={() => !isEditSubmitting && setEditingCategory(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg bg-surface-container-lowest border border-border rounded-2xl p-5 md:p-6 shadow-warm-lg space-y-4 animate-pop-in">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 id="edit-cat-dialog-title" className="font-headline font-bold text-base text-on-surface">
                Chỉnh Sửa Danh Mục
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                disabled={isEditSubmitting}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors disabled:opacity-50"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-error-container/30 border border-error/30 rounded-xl text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface">
                  Tên danh mục <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-xl border border-border text-xs md:text-sm text-on-surface outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={editOrder}
                  onChange={(e) => setEditOrder(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-xl border border-border text-xs md:text-sm text-on-surface outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface">
                  Biểu tượng
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {iconsList.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setEditIcon(icon)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        editIcon === icon
                          ? 'bg-primary text-on-primary ring-2 ring-primary ring-offset-2 ring-offset-surface shadow-xs'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <button
                  type="button"
                  disabled={isEditSubmitting}
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isEditSubmitting && (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                  )}
                  <span>Cập nhật danh mục</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {catToDelete && (() => {
        const referencingDishCount = dishes.filter(
          (d) => !d.isArchived && d.categoryId === catToDelete.id
        ).length;
        const hasReferencingDishes = referencingDishCount > 0;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-cat-dialog-title"
          >
            <div
              className="absolute inset-0"
              onClick={() => !isDeleting && setCatToDelete(null)}
              aria-hidden="true"
            />
            <div className="relative z-10 w-full max-w-md bg-surface-container-lowest border border-border rounded-2xl p-5 shadow-warm-lg space-y-4 animate-pop-in">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  hasReferencingDishes ? 'bg-amber-100 text-amber-700' : 'bg-error-container/40 text-error'
                }`}>
                  <span className="material-symbols-outlined text-[24px]">
                    {hasReferencingDishes ? 'warning' : 'delete'}
                  </span>
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 id="delete-cat-dialog-title" className="font-headline font-bold text-base text-on-surface">
                    {hasReferencingDishes ? 'Không Thể Xóa Danh Mục' : 'Xác Nhận Xóa Danh Mục?'}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Bạn đang thao tác với danh mục <strong className="text-on-surface">"{catToDelete.name}"</strong>.
                  </p>

                  {hasReferencingDishes ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">block</span>
                        <span>Đang chứa {referencingDishCount} món ăn</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        Để bảo vệ tính toàn vẹn thực đơn, bạn cần chuyển hoặc xóa các món thuộc danh mục này trong trang <strong>Quản lý món</strong> trước khi thực hiện xóa nhóm.
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-tertiary bg-tertiary-soft p-2.5 rounded-xl">
                      Danh mục này hiện không có món ăn nào tham chiếu. Hành động này sẽ xóa nhóm món hoàn toàn khỏi cơ sở dữ liệu.
                    </p>
                  )}

                  {deleteError && (
                    <div className="p-2.5 bg-error-container/30 border border-error/30 rounded-xl text-error text-[11px] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      <span>{deleteError}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCatToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors disabled:opacity-50 min-h-[38px]"
                >
                  {hasReferencingDishes ? 'Đóng' : 'Hủy bỏ'}
                </button>

                {hasReferencingDishes ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCatToDelete(null);
                      setViewRoute('admin/menu');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition-colors min-h-[38px] flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">restaurant_menu</span>
                    <span>Đến Quản lý món</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
                    className="px-4 py-2.5 rounded-xl bg-error hover:bg-error/90 text-on-error text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 min-h-[38px]"
                  >
                    {isDeleting && (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-on-error border-t-transparent animate-spin" />
                    )}
                    <span>Xác nhận xóa</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </AdminLayout>
  );
};
export default CategoryManagementView;
