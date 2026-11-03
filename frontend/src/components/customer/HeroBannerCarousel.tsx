import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Banner } from '../../types/restaurant';
import { useRestaurant } from '../../contexts/useRestaurant';

interface HeroBannerCarouselProps {
  banners: Banner[];
}

export const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = ({ banners }) => {
  const { dishes, categories, setSelectedCategory, setSearchTerm, openDishDetail, showToast } =
    useRestaurant();

  // Filter only active banners and sort stably by displayOrder
  const activeBanners = banners
    .filter((b) => b.isActive)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const touchStartXRef = useRef<number | null>(null);

  // Derive safe index within bounds
  const safeCurrentIndex =
    currentIndex < activeBanners.length ? currentIndex : 0;

  const handleNext = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const handlePrev = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  // Auto-advance every 5 seconds if multiple banners exist and not hovered/touched
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused, handleNext]);

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    setIsPaused(false);
  };

  const handleBannerAction = (banner: Banner) => {
    if (!banner.linkType || banner.linkType === 'none' || !banner.linkTargetId) {
      return;
    }

    if (banner.linkType === 'dish') {
      const targetDish = dishes.find((d) => d.id === banner.linkTargetId && !d.isArchived);
      if (targetDish) {
        openDishDetail(targetDish);
      } else {
        showToast('Món ăn trong ưu đãi hiện chưa sẵn sàng hoặc đã được cập nhật.', 'info');
      }
      return;
    }

    if (banner.linkType === 'category') {
      const targetCat = categories.find((c) => c.id === banner.linkTargetId);
      if (targetCat) {
        setSelectedCategory(targetCat.id);
        setSearchTerm('');
      } else {
        showToast('Danh mục ưu đãi hiện không còn khả dụng.', 'info');
      }
      return;
    }

    if (banner.linkType === 'custom' && /^https?:\/\//i.test(banner.linkTargetId)) {
      window.open(banner.linkTargetId, '_blank', 'noopener,noreferrer');
    }
  };

  // If no active banners, collapse hero section completely per requirements
  if (activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[safeCurrentIndex] || activeBanners[0];
  const hasImage = Boolean(currentBanner.imageUrl && !imageErrors[currentBanner.id]);

  return (
    <section
      className="relative overflow-hidden rounded-2xl shadow-warm-sm group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Banner quảng cáo và ưu đãi sảnh khách"
    >
      {/* Banner Card Body */}
      <div
        onClick={() => handleBannerAction(currentBanner)}
        className={`relative w-full rounded-2xl p-5 md:p-7 text-on-primary flex flex-col justify-between overflow-hidden min-h-[185px] md:min-h-[220px] transition-all duration-300 ${
          currentBanner.bgGradient || 'from-primary via-primary-container to-secondary-container'
        } ${currentBanner.linkType && currentBanner.linkType !== 'none' ? 'cursor-pointer hover:shadow-warm-md' : ''}`}
      >
        {/* Optional Background Image with Dark/Warm Overlay */}
        {hasImage && (
          <>
            <img
              src={currentBanner.imageUrl!}
              alt={currentBanner.title}
              onError={() =>
                setImageErrors((prev) => ({ ...prev, [currentBanner.id]: true }))
              }
              className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-overlay pointer-events-none select-none transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-on-surface/85 via-on-surface/50 to-transparent pointer-events-none" />
          </>
        )}

        {/* Ambient Decorative Shapes */}
        <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full bg-secondary-fixed/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-primary-fixed/15 blur-2xl pointer-events-none" />

        {/* Top Header: Tag & Discount Badge */}
        <div className="relative z-10 flex items-start justify-between gap-2">
          {currentBanner.tag ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-lowest/25 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-secondary-fixed border border-secondary-fixed/20 shadow-xs">
              <span className="material-symbols-outlined text-[13px]">bolt</span>
              <span>{currentBanner.tag}</span>
            </span>
          ) : (
            <span />
          )}

          {currentBanner.discountBadge && (
            <span className="font-headline font-black text-xl md:text-2xl text-secondary-fixed drop-shadow-sm tracking-tight">
              {currentBanner.discountBadge}
            </span>
          )}
        </div>

        {/* Middle Content: Title & Description */}
        <div className="relative z-10 my-3 max-w-xl">
          <h3 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl leading-snug text-white drop-shadow-xs line-clamp-2">
            {currentBanner.title}
          </h3>
          {currentBanner.description && (
            <p className="text-xs md:text-sm text-surface-container-lowest/90 font-medium leading-relaxed mt-1.5 line-clamp-2 drop-shadow-2xs">
              {currentBanner.description}
            </p>
          )}
        </div>

        {/* Bottom Bar: Action CTA Button & Price Note */}
        <div className="relative z-10 flex items-center justify-between pt-1 gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleBannerAction(currentBanner);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-lowest text-primary font-bold text-xs md:text-sm shadow-warm-xs hover:bg-surface-container active:scale-95 transition-all select-none"
          >
            <span>{currentBanner.ctaText || 'Khám phá ngay'}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>

          {currentBanner.priceNote && (
            <span className="text-xs md:text-sm text-secondary-fixed font-bold bg-surface-container-lowest/20 backdrop-blur-xs px-2.5 py-1 rounded-lg">
              {currentBanner.priceNote}
            </span>
          )}
        </div>
      </div>

      {/* Desktop Navigation Arrows (Only shown when activeBanners.length > 1) */}
      {activeBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Banner trước"
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-on-surface items-center justify-center shadow-warm-xs backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Banner kế tiếp"
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-on-surface items-center justify-center shadow-warm-xs backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>

          {/* Dots Indicator (Only shown when activeBanners.length > 1) */}
          <div className="absolute bottom-2.5 right-4 z-20 flex items-center gap-1.5 bg-on-surface/30 backdrop-blur-md px-2.5 py-1 rounded-full">
            {activeBanners.map((b, idx) => (
              <button
                key={b.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Chuyển tới banner ${idx + 1}`}
                className={`transition-all rounded-full ${
                  safeCurrentIndex === idx
                    ? 'w-4 h-1.5 bg-secondary-fixed'
                    : 'w-1.5 h-1.5 bg-surface-container-lowest/60 hover:bg-surface-container-lowest'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
