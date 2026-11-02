import React, { useState } from 'react';
import type { SizeOption, Topping } from '../../types/restaurant';
import { useRestaurant } from '../../contexts/useRestaurant';
import { DEFAULT_FALLBACK_IMAGE } from '../../services/dishesApi';

export const DishDetailModal: React.FC = () => {
  const { selectedDishForDetail, closeDishDetail, addToCart } = useRestaurant();

  const dish = selectedDishForDetail;

  const [selectedSize, setSelectedSize] = useState<SizeOption>(
    dish?.sizes[0] || { id: 'default', name: 'Tiêu chuẩn', price: 0 }
  );
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  if (!dish) return null;

  const toggleTopping = (topping: Topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      }
      return [...prev, topping];
    });
  };

  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const sizePrice = selectedSize ? selectedSize.price : 0;
  const singleItemPrice = dish.price + sizePrice + toppingsPrice;
  const totalPrice = singleItemPrice * quantity;

  const handleAddToCart = () => {
    addToCart(dish, selectedSize, selectedToppings, notes, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-on-surface/50 backdrop-blur-sm animate-fade-in p-0 md:p-4">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={closeDishDetail} />

      {/* Container: Bottom Sheet on Mobile, Centered Modal on Desktop */}
      <div className="relative z-10 w-full md:max-w-2xl bg-surface-container-lowest rounded-t-2xl md:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-warm-lg animate-slide-up md:animate-pop-in">
        {/* Mobile Drag Indicator */}
        <div className="md:hidden w-full flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-border" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
          <h3 className="font-headline font-bold text-base md:text-lg text-on-surface">
            Tùy Chỉnh Món Ăn
          </h3>
          <button
            onClick={closeDishDetail}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Dish Hero Preview */}
          <div className="flex flex-col sm:flex-row gap-4 items-start pb-4 border-b border-border/50">
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full sm:w-36 aspect-[4/3] sm:aspect-square object-cover rounded-xl bg-surface-container"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE; }}
            />
            <div className="flex-1">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                {dish.categoryName}
              </span>
              <h2 className="font-headline font-bold text-lg md:text-xl text-on-surface mt-0.5">
                {dish.name}
              </h2>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {dish.description}
              </p>
              <div className="mt-2 text-primary font-headline font-bold text-lg">
                {dish.price.toLocaleString('vi-VN')}đ
              </div>
            </div>
          </div>

          {/* Size Options (Radio) */}
          {dish.sizes.length > 0 && (
            <div>
              <label className="block font-headline font-bold text-sm text-on-surface mb-2.5">
                1. Chọn kích cỡ <span className="text-primary">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dish.sizes.map((size) => {
                  const isChecked = selectedSize?.id === size.id;
                  return (
                    <label
                      key={size.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-primary-container bg-primary-soft shadow-xs'
                          : 'border-border bg-surface-container-lowest hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="sizeOption"
                          checked={isChecked}
                          onChange={() => setSelectedSize(size)}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm font-semibold text-on-surface">{size.name}</span>
                      </div>
                      <span className="text-xs font-bold text-primary">
                        {size.price > 0 ? `+${size.price.toLocaleString('vi-VN')}đ` : '0đ'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Toppings (Checkboxes) */}
          {dish.toppings.length > 0 && (
            <div>
              <label className="block font-headline font-bold text-sm text-on-surface mb-2.5">
                2. Đồ ăn kèm / Topping thêm (tùy chọn)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dish.toppings.map((topping) => {
                  const isChecked = selectedToppings.some((t) => t.id === topping.id);
                  return (
                    <label
                      key={topping.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-tertiary bg-tertiary-soft shadow-xs'
                          : 'border-border bg-surface-container-lowest hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTopping(topping)}
                          className="accent-tertiary w-4 h-4 rounded"
                        />
                        <span className="text-sm font-medium text-on-surface">{topping.name}</span>
                      </div>
                      <span className="text-xs font-bold text-tertiary">
                        +{topping.price.toLocaleString('vi-VN')}đ
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kitchen Notes */}
          <div>
            <label className="block font-headline font-bold text-sm text-on-surface mb-1.5">
              3. Ghi chú cho bếp & pha chế
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Không hành, nhiều rau, ít ngọt, đá riêng..."
              className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-xl text-sm text-on-surface border border-border focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all placeholder:text-on-surface-variant/60"
            />
          </div>
        </div>

        {/* Modal Sticky Footer / Action Bar */}
        <div className="p-4 bg-surface-container-low border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3 bg-surface-container-lowest border border-border px-3 py-1.5 rounded-full shadow-xs w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-xs text-on-surface-variant font-medium sm:hidden">Số lượng:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="font-bold text-base w-6 text-center text-on-surface">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            disabled={!dish.isAvailable}
            onClick={handleAddToCart}
            className="w-full sm:flex-1 py-3 px-6 rounded-full bg-primary-container text-on-primary hover:bg-primary-hover font-headline font-bold text-sm shadow-warm-sm flex items-center justify-between transition-all active:scale-98 disabled:opacity-50"
          >
            <span>Thêm vào giỏ</span>
            <span className="bg-on-primary/20 px-2.5 py-0.5 rounded-full text-xs">
              {totalPrice.toLocaleString('vi-VN')}đ
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
