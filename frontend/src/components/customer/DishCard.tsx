import React from 'react';
import type { Dish } from '../../types/restaurant';
import { useRestaurant } from '../../contexts/useRestaurant';

interface DishCardProps {
  dish: Dish;
  layout?: 'grid' | 'horizontal';
}

export const DishCard: React.FC<DishCardProps> = ({ dish, layout = 'grid' }) => {
  const { openDishDetail } = useRestaurant();

  const getBadgeStyle = (type?: string) => {
    switch (type) {
      case 'hot':
        return 'bg-secondary-container text-on-secondary-container';
      case 'new':
        return 'bg-primary-fixed text-primary';
      case 'veg':
        return 'bg-tertiary-fixed text-tertiary';
      default:
        return 'bg-primary-container text-on-primary';
    }
  };

  if (layout === 'horizontal') {
    return (
      <div
        onClick={() => openDishDetail(dish)}
        className="w-full bg-surface-container-lowest border border-border/80 rounded-xl p-3 flex gap-3 cursor-pointer hover:border-primary-container/40 hover:shadow-warm-sm transition-all relative overflow-hidden group select-none"
      >
        {/* Dish Thumbnail */}
        <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-container">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {dish.badge && (
            <span
              className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(
                dish.badgeType
              )}`}
            >
              {dish.badge}
            </span>
          )}
          {!dish.isAvailable && (
            <div className="absolute inset-0 bg-on-surface/60 backdrop-blur-[1px] flex items-center justify-center p-1">
              <span className="text-[11px] font-bold text-on-primary bg-on-surface/90 px-1.5 py-0.5 rounded">
                Tạm hết
              </span>
            </div>
          )}
        </div>

        {/* Dish Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h4 className="font-headline font-bold text-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
              {dish.name}
            </h4>
            <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5 leading-relaxed">
              {dish.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline font-bold text-sm md:text-base text-primary">
                {dish.price.toLocaleString('vi-VN')}đ
              </span>
              {dish.oldPrice && (
                <span className="text-xs text-on-surface-variant/60 line-through">
                  {dish.oldPrice.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!dish.isAvailable}
              onClick={(e) => {
                e.stopPropagation();
                openDishDetail(dish);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                dish.isAvailable
                  ? 'bg-primary-container text-on-primary hover:bg-primary-hover shadow-xs'
                  : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid / Vertical Layout
  return (
    <div
      onClick={() => openDishDetail(dish)}
      className="bg-surface-container-lowest border border-border/80 rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer hover:border-primary-container/40 hover:shadow-warm-sm transition-all group select-none relative"
    >
      {/* Food Photo */}
      <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {dish.badge && (
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider shadow-xs ${getBadgeStyle(
              dish.badgeType
            )}`}
          >
            {dish.badge}
          </span>
        )}
        {!dish.isAvailable && (
          <div className="absolute inset-0 bg-on-surface/65 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-xs font-bold text-on-primary bg-on-surface/90 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Hết món hôm nay
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-headline font-bold text-sm md:text-base text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
            {dish.name}
          </h4>
          <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
            {dish.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/40">
          <div className="flex flex-col">
            <span className="font-headline font-bold text-base md:text-lg text-primary leading-tight">
              {dish.price.toLocaleString('vi-VN')}đ
            </span>
            {dish.oldPrice && (
              <span className="text-[11px] text-on-surface-variant/60 line-through">
                {dish.oldPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!dish.isAvailable}
            onClick={(e) => {
              e.stopPropagation();
              openDishDetail(dish);
            }}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-bold transition-transform active:scale-95 ${
              dish.isAvailable
                ? 'bg-primary-container text-on-primary hover:bg-primary-hover shadow-xs'
                : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Chọn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
