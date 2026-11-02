import React, { useState, useEffect } from 'react';
import type { Dish, SizeOption, Topping } from '../../types/restaurant';
import { useRestaurant } from '../../contexts/useRestaurant';

interface MenuItemFormModalProps {
  dish: Dish | null;
  onClose: () => void;
}

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

export const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({ dish, onClose }) => {
  const { categories, saveDish } = useRestaurant();

  const [name, setName] = useState(dish?.name || '');
  const [description, setDescription] = useState(dish?.description || '');
  const [price, setPrice] = useState<number>(dish?.price ?? 35000);
  const [oldPrice, setOldPrice] = useState<number | undefined>(dish?.oldPrice);
  const [categoryId, setCategoryId] = useState<string>(
    dish?.categoryId || categories.find((c) => c.id !== 'all' && c.id !== 'trending')?.id || 'main'
  );
  const [badge, setBadge] = useState<string>(dish?.badge || '');
  const [badgeType, setBadgeType] = useState<'hot' | 'new' | 'veg' | 'special'>(
    dish?.badgeType || 'hot'
  );
  const [image, setImage] = useState<string>(dish?.image || DEFAULT_FALLBACK_IMAGE);
  const [isAvailable, setIsAvailable] = useState<boolean>(dish ? dish.isAvailable : true);

  const [sizes] = useState<SizeOption[]>(
    dish?.sizes || [
      { id: 's-1', name: 'Tiêu chuẩn', price: 0 },
      { id: 's-2', name: 'Tô lớn', price: 10000 },
    ]
  );
  const [toppings] = useState<Topping[]>(
    dish?.toppings || [
      { id: 't-1', name: 'Trứng thêm', price: 7000 },
      { id: 't-2', name: 'Thịt thêm', price: 15000 },
    ]
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Vui lòng nhập tên món ăn');
      return;
    }

    if (price < 0) {
      setErrorMessage('Đơn giá không được âm');
      return;
    }

    if (oldPrice !== undefined && oldPrice < 0) {
      setErrorMessage('Giá gốc cũ không được âm');
      return;
    }

    const trimmedImage = image.trim();
    if (!trimmedImage) {
      setErrorMessage('Vui lòng nhập đường dẫn ảnh món ăn');
      return;
    }

    // Disallow local machine file paths (C:\, file://) and temporary blob URLs per Task D
    if (
      trimmedImage.startsWith('file://') ||
      trimmedImage.startsWith('blob:') ||
      /^[a-zA-Z]:\\/.test(trimmedImage)
    ) {
      setErrorMessage('Không dùng đường dẫn file máy cá nhân hoặc blob tạm. Vui lòng dùng URL trực tuyến (https://...).');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const catObj = categories.find((c) => c.id === categoryId);
    const newDish: Dish = {
      id: dish ? dish.id : `dish-${Date.now()}`,
      name: trimmedName,
      description: description.trim(),
      price: Math.floor(Number(price)),
      oldPrice: oldPrice ? Math.floor(Number(oldPrice)) : undefined,
      categoryId,
      categoryName: catObj ? catObj.name : 'Món chính',
      badge: badge.trim() || undefined,
      badgeType,
      image: trimmedImage,
      isAvailable,
      sizes,
      toppings,
    };

    try {
      await saveDish(newDish);
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi khi lưu món ăn vào máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-on-surface/50 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0" onClick={() => !isSubmitting && onClose()} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-4xl bg-surface-container-lowest rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-warm-lg animate-pop-in border border-border">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-container-low/50">
          <div>
            <h3 id="modal-title" className="font-headline font-bold text-lg text-on-surface">
              {dish ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Mới Vào Thực Đơn'}
            </h3>
            <span className="text-xs text-on-surface-variant">
              Cập nhật dữ liệu thật và xem trước hiển thị thời gian thực
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng cửa sổ"
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body: 2 Columns on Desktop */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
          {/* Left Form: 7 cols */}
          <form id="dish-form" onSubmit={handleSubmit} className="md:col-span-7 space-y-4 text-xs md:text-sm">
            {/* Dish Name */}
            <div>
              <label className="block font-bold text-on-surface mb-1">
                Tên món ăn <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Bún Bò Huế Đặc Biệt"
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>

            {/* Category & Availability */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Danh mục món <span className="text-primary">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                >
                  {categories
                    .filter((c) => c.id !== 'all' && c.id !== 'trending')
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Trạng thái bán
                </label>
                <select
                  value={isAvailable ? 'available' : 'unavailable'}
                  onChange={(e) => setIsAvailable(e.target.value === 'available')}
                  className="w-full px-3 py-2.5 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                >
                  <option value="available">Còn món (Mở bán)</option>
                  <option value="unavailable">Tạm hết món</option>
                </select>
              </div>
            </div>

            {/* Price & Old Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Đơn giá bán (VNĐ) <span className="text-primary">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-border rounded-xl text-on-surface font-headline font-bold outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Giá gốc cũ (Nếu giảm giá)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={oldPrice || ''}
                  onChange={(e) => setOldPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Để trống nếu không giảm"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                />
              </div>
            </div>

            {/* Image URL with preview feedback */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-on-surface">
                  Đường dẫn ảnh món (URL) <span className="text-primary">*</span>
                </label>
                {imageLoadError && (
                  <span className="text-[11px] text-error font-medium">Link ảnh không tải được, hiển thị ảnh mẫu</span>
                )}
              </div>
              <input
                type="url"
                required
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  setImageLoadError(false);
                }}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all text-xs font-mono"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-on-surface mb-1">
                Mô tả món ăn & Thành phần
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Nước dùng đậm đà, thịt bò mềm thơm, kèm rau sống tươi sạch..."
                className="w-full px-3.5 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all resize-none"
              />
            </div>

            {/* Badge & BadgeType */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-on-surface mb-1">Nhãn hiển thị</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Ví dụ: Bán chạy, Món mới..."
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Kiểu nhãn</label>
                <select
                  value={badgeType}
                  onChange={(e) => setBadgeType(e.target.value as typeof badgeType)}
                  className="w-full px-3 py-2.5 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                >
                  <option value="hot">Nổi bật (Đỏ / Cam)</option>
                  <option value="new">Mới ra mắt (Xanh lá)</option>
                  <option value="special">Đặc sản (Tím)</option>
                  <option value="veg">Thanh đạm (Xanh dương)</option>
                </select>
              </div>
            </div>
          </form>

          {/* Right Column: Live Customer Preview (5 cols) */}
          <div className="md:col-span-5 bg-surface-container-low/50 border border-border rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">
                  Xem trước thẻ món ăn
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-tertiary font-bold bg-tertiary-soft px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[12px]">visibility</span>
                  <span>Thời gian thực</span>
                </span>
              </div>

              {/* Live Preview Card */}
              <div className="bg-surface-container-lowest border border-border rounded-2xl overflow-hidden shadow-warm-xs">
                <div className="relative aspect-[4/3] bg-surface-container">
                  <img
                    src={imageLoadError ? DEFAULT_FALLBACK_IMAGE : (image || DEFAULT_FALLBACK_IMAGE)}
                    alt={name || 'Tên món'}
                    onError={() => setImageLoadError(true)}
                    className="w-full h-full object-cover"
                  />
                  {badge && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-secondary-container text-on-secondary-container shadow-xs">
                      {badge}
                    </span>
                  )}
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-on-surface/65 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-xs font-bold text-on-primary bg-on-surface/90 px-3 py-1 rounded-full shadow-xs">
                        Tạm hết món
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3.5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                    {categories.find((c) => c.id === categoryId)?.name || 'Món chính'}
                  </span>
                  <h4 className="font-headline font-bold text-sm text-on-surface leading-snug">
                    {name || 'Tên món ăn mẫu'}
                  </h4>
                  <p className="text-xs text-on-surface-variant line-clamp-2">
                    {description || 'Mô tả hương vị món ăn sẽ xuất hiện ở đây...'}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div>
                      <span className="font-headline font-black text-base text-primary">
                        {price.toLocaleString('vi-VN')}đ
                      </span>
                      {oldPrice && oldPrice > price && (
                        <span className="text-[11px] text-on-surface-variant line-through ml-1.5">
                          {oldPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-xs">
                      + Chọn món
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-on-surface-variant/70 text-center pt-3 mt-4 border-t border-border/40">
              Khách quét QR sẽ nhìn thấy thẻ này ngay sau khi bạn lưu.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-surface-container-low border-t border-border flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="dish-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
            )}
            <span>{dish ? 'Cập nhật món ăn' : 'Lưu món vào thực đơn'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default MenuItemFormModal;
