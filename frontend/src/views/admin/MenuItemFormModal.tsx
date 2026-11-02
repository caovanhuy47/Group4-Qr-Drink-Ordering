import React, { useState } from 'react';
import type { Dish, SizeOption, Topping } from '../../types/restaurant';
import { useRestaurant } from '../../contexts/useRestaurant';

interface MenuItemFormModalProps {
  dish: Dish | null;
  onClose: () => void;
}

export const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({ dish, onClose }) => {
  const { categories, saveDish } = useRestaurant();

  const [name, setName] = useState(dish?.name || '');
  const [description, setDescription] = useState(dish?.description || '');
  const [price, setPrice] = useState<number>(dish?.price || 35000);
  const [oldPrice, setOldPrice] = useState<number | undefined>(dish?.oldPrice);
  const [categoryId, setCategoryId] = useState<string>(dish?.categoryId || categories[1]?.id || 'main');
  const [badge, setBadge] = useState<string>(dish?.badge || '');
  const [badgeType, setBadgeType] = useState<'hot' | 'new' | 'veg' | 'special'>(
    dish?.badgeType || 'hot'
  );
  const [image, setImage] = useState<string>(
    dish?.image ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGxPkMU_3kD-RE9ELJkmkHpBAlmJI6hScn1YU_tXH_Hl7ZQ9tyX1vQOuxFEyN-a18_WeTjDdey1f1XuFBXCfS7vPtvSvQ1SvWmidWEKmkufe2OfwqJ4voxXRVQ_plCy_f0t6vvKTbDGjxvm-1wr5K1BaF4avKJOswg8Rg7qv0YHqq3DLpEsf6VoiIfEukV3-W3Ci7Fx9MwYyYL5f7NohpG4vagHbUdF_55aYQpLMY'
  );
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên món ăn');
      return;
    }

    const catObj = categories.find((c) => c.id === categoryId);
    const newDish: Dish = {
      id: dish ? dish.id : `dish-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      categoryId,
      categoryName: catObj ? catObj.name : 'Món chính',
      badge: badge.trim() || undefined,
      badgeType,
      image,
      isAvailable,
      sizes,
      toppings,
    };

    saveDish(newDish);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-on-surface/50 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl bg-surface-container-lowest rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-warm-lg animate-pop-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-headline font-bold text-lg text-on-surface">
              {dish ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Mới Vào Thực Đơn'}
            </h3>
            <span className="text-xs text-on-surface-variant">
              Cập nhật thông tin và xem trước hiển thị thời gian thực
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

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
                placeholder="VD: Bún Bò Huế, Cơm Tấm..."
                className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg border border-border text-on-surface outline-none focus:border-primary-container"
              />
            </div>

            {/* Category & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-on-surface mb-1">Danh mục</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-border text-on-surface outline-none focus:border-primary-container"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Nhãn huy hiệu</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Bán chạy, Mới..."
                    className="flex-1 px-3 py-2 bg-surface-container-low rounded-lg border border-border text-on-surface outline-none focus:border-primary-container"
                  />
                  <select
                    value={badgeType}
                    onChange={(e) => setBadgeType(e.target.value as any)}
                    className="px-2 py-2 bg-surface-container-low rounded-lg border border-border text-xs"
                  >
                    <option value="hot">Hot</option>
                    <option value="new">Mới</option>
                    <option value="veg">Chay</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price & Old Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Giá bán (VNĐ) <span className="text-primary">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg border border-border text-on-surface font-bold text-primary outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Giá gốc gạch ngang</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={oldPrice || ''}
                  onChange={(e) => setOldPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Để trống nếu không giảm giá"
                  className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg border border-border text-on-surface outline-none focus:border-primary-container"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-on-surface mb-1">Mô tả thành phần & hương vị</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả các thành phần hấp dẫn, gia vị bí truyền..."
                className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg border border-border text-on-surface outline-none focus:border-primary-container resize-none"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block font-bold text-on-surface mb-1">Đường dẫn ảnh món (URL)</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg border border-border text-xs text-on-surface outline-none focus:border-primary-container"
              />
            </div>

            {/* Availability Switch */}
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-border">
              <input
                type="checkbox"
                id="isAvailable"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="accent-tertiary w-5 h-5 cursor-pointer"
              />
              <label htmlFor="isAvailable" className="cursor-pointer">
                <span className="font-bold text-on-surface block text-xs">Món đang sẵn sàng bán</span>
                <span className="text-[11px] text-on-surface-variant">
                  Nếu tắt, khách sẽ thấy nhãn "Hết món" và không thể bấm thêm vào giỏ.
                </span>
              </label>
            </div>
          </form>

          {/* Right Live Preview: 5 cols */}
          <div className="md:col-span-5 bg-surface-container-low rounded-xl p-4 border border-border/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-3">
                <span className="material-symbols-outlined text-[16px] text-primary">visibility</span>
                <span>Xem trước hiển thị trên sảnh khách</span>
              </div>

              {/* Live Preview Card */}
              <div className="bg-surface-container-lowest border border-border rounded-xl overflow-hidden shadow-warm-xs">
                <div className="relative aspect-[4/3] bg-surface-container">
                  <img src={image} alt={name || 'Tên món'} className="w-full h-full object-cover" />
                  {badge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary-container text-on-secondary-container">
                      {badge}
                    </span>
                  )}
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-on-surface/65 flex items-center justify-center">
                      <span className="text-[11px] font-bold text-on-primary bg-on-surface/90 px-2 py-0.5 rounded">
                        Tạm hết
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-headline font-bold text-sm text-on-surface">
                    {name || 'Tên món ăn'}
                  </h4>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                    {description || 'Mô tả hương vị món ăn...'}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                    <span className="font-headline font-bold text-base text-primary">
                      {price.toLocaleString('vi-VN')}đ
                    </span>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary text-xs font-bold"
                    >
                      + Chọn
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-on-surface-variant/70 text-center pt-3 mt-4 border-t border-border/40">
              Khách sẽ nhìn thấy thẻ này ngay sau khi bạn lưu.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-surface-container-low border-t border-border flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="dish-form"
            className="px-6 py-2 rounded-xl bg-primary-container hover:bg-primary-hover text-on-primary text-xs font-bold shadow-xs transition-colors"
          >
            {dish ? 'Cập nhật món ăn' : 'Lưu món vào thực đơn'}
          </button>
        </div>
      </div>
    </div>
  );
};
