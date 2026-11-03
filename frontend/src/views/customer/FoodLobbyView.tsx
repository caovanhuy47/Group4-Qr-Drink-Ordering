import React from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { HeroBannerCarousel } from '../../components/customer/HeroBannerCarousel';
import { DishCard } from '../../components/customer/DishCard';
import { FloatingCartBar } from '../../components/customer/FloatingCartBar';

export const FoodLobbyView: React.FC = () => {
  const {
    dishes,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    banners,
  } = useRestaurant();

  // Stable category sorting by order
  const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Derive valid selected category (fallback to 'all' if selected category no longer exists)
  const effectiveCategory =
    selectedCategory !== 'all' &&
    selectedCategory !== 'trending' &&
    categories.length > 0 &&
    !categories.some((c) => c.id === selectedCategory)
      ? 'all'
      : selectedCategory;

  // Filter active dishes (exclude archived)
  const activeDishes = dishes.filter((dish) => !dish.isArchived);

  // Filter dishes by search term and category
  const filteredDishes = activeDishes.filter((dish) => {
    const matchesSearch =
      searchTerm === '' ||
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      effectiveCategory === 'all'
        ? true
        : effectiveCategory === 'trending'
        ? dish.badge === 'Bán chạy' || dish.badge === 'Món hot'
        : dish.categoryId === effectiveCategory;

    return matchesSearch && matchesCategory;
  });

  const bestSellerDishes = activeDishes.filter(
    (d) => d.badge === 'Bán chạy' || d.badge === 'Món hot' || d.badge === 'Đặc trưng'
  );

  return (
    <div className="min-h-screen bg-background pb-36 sm:pb-36 md:pb-16 flex flex-col">
      {/* Customer Header */}
      <CustomerHeader />

      <main className="max-w-[1200px] mx-auto w-full px-4 md:px-8 py-3 md:py-4 space-y-6 flex-1">
        {/* 1. HERO BANNER CAROUSEL */}
        {searchTerm === '' && selectedCategory === 'all' && (
          <HeroBannerCarousel banners={banners} />
        )}

        {/* 2. CATEGORY FILTER PILLS - Synchronized sticky offset for 0 overlap */}
        <section className="sticky top-[98px] md:top-[64px] z-30 bg-background/95 backdrop-blur-md py-2 -mx-3 sm:-mx-4 px-3 sm:px-4 md:-mx-8 md:px-8 border-b border-border/40 overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full">
            {sortedCategories.map((cat) => {
              const isActive = effectiveCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSearchTerm('');
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full font-semibold text-xs md:text-sm transition-all shadow-xs ${
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-warm-xs'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-border/70'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. BEST SELLERS ROW (Shown when browsing all and no search) */}
        {searchTerm === '' && effectiveCategory === 'all' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
                <h3 className="font-headline font-bold text-base md:text-xl text-on-surface">
                  MÓN BÁN CHẠY NHẤT
                </h3>
              </div>
              <button
                onClick={() => setSelectedCategory('trending')}
                className="flex items-center gap-0.5 text-primary text-xs font-bold hover:underline"
              >
                <span>Xem tất cả</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>

            {/* Grid for Best Sellers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {bestSellerDishes.slice(0, 3).map((dish) => (
                <DishCard key={dish.id} dish={dish} layout="grid" />
              ))}
            </div>
          </section>
        )}

        {/* 4. MAIN DISHES SECTION */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <h3 className="font-headline font-bold text-base md:text-xl text-on-surface">
                {searchTerm
                  ? `Kết quả tìm kiếm ("${searchTerm}")`
                  : selectedCategory === 'all'
                  ? 'TOÀN BỘ THỰC ĐƠN'
                  : categories.find((c) => c.id === selectedCategory)?.name.toUpperCase()}
              </h3>
            </div>
            <span className="text-xs text-on-surface-variant">
              {filteredDishes.length} món sẵn sàng
            </span>
          </div>

          {filteredDishes.length === 0 ? (
            /* Empty State */
            <div className="w-full bg-surface-container-lowest rounded-2xl border border-border p-8 text-center space-y-3 my-4">
              <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px]">no_meals</span>
              </div>
              <h4 className="font-headline font-bold text-base text-on-surface">
                Không tìm thấy món phù hợp
              </h4>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Quán chưa có món bạn đang tìm. Bạn thử tìm từ khóa khác hoặc bấm xem toàn bộ thực đơn nhé.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover"
              >
                Xem tất cả món
              </button>
            </div>
          ) : (
            /* Responsive Grid: 1 col on mobile, 2 col on tablet, 3-4 col on desktop */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} layout="grid" />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer Branding Huy CV & Discreet Staff Portal Link */}
      <footer className="mt-10 border-t border-border/70 bg-surface-container-low/50 py-8 px-4 text-center">
        <div className="max-w-[1200px] mx-auto space-y-2.5">
          <div className="flex items-center justify-center gap-2">
            <span className="font-headline font-extrabold text-lg text-primary">Huy CV</span>
            <span className="text-on-surface-variant text-xs">•</span>
            <span className="text-xs text-on-surface font-semibold">Ẩm Thực & Nước Uống Vỉa Hè</span>
          </div>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Hệ thống đặt món bằng mã QR tại bàn • Phục vụ tận nơi • Thanh toán khi nhận món
          </p>
          <div className="pt-2">
            <a
              href="#/staff/login"
              className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors underline font-medium"
            >
              <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
              <span>Cổng nhân viên & quản lý quán</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Cart Bar (Mobile only) */}
      <FloatingCartBar />
    </div>
  );
};
export default FoodLobbyView;
