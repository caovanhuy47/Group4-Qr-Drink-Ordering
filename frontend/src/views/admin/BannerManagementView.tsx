import React from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const BannerManagementView: React.FC = () => {
  const { banners, toggleBannerActive } = useRestaurant();

  return (
    <AdminLayout
      title="Quản Lý Banner Trang Chủ"
      subtitle="Thiết lập các banner ưu đãi, giờ vàng và món mới hiển thị ở đầu sảnh khách"
    >
      <div className="space-y-6">
        {/* Banner Info Header */}
        <div className="bg-surface-container-lowest border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <h3 className="font-headline font-bold text-base text-on-surface">
              Banner Đang Hoạt Động ({banners.filter((b) => b.isActive).length}/{banners.length})
            </h3>
            <p className="text-xs text-on-surface-variant">
              Khách quét mã QR sẽ nhìn thấy các banner này đầu tiên khi mở menu.
            </p>
          </div>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-surface-container-lowest border border-border rounded-2xl p-4 md:p-5 shadow-warm-xs flex flex-col justify-between space-y-4"
            >
              {/* Banner Card Preview */}
              <div
                className={`bg-gradient-to-r ${banner.bgGradient} rounded-xl p-4 text-on-primary relative overflow-hidden shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/20 backdrop-blur-sm text-[11px] font-bold uppercase tracking-wider text-secondary-fixed">
                    {banner.tag}
                  </span>
                  <span className="font-headline font-bold text-base text-secondary-fixed">
                    {banner.discountBadge}
                  </span>
                </div>
                <div className="my-2">
                  <h4 className="font-headline font-bold text-base text-white line-clamp-1">
                    {banner.title}
                  </h4>
                  <p className="text-xs text-on-primary-container line-clamp-1 mt-0.5">
                    {banner.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="px-2.5 py-1 rounded bg-surface-container-lowest text-primary font-bold text-[11px]">
                    {banner.ctaText}
                  </span>
                  <span className="text-[11px] text-surface-container-highest/90">
                    {banner.priceNote}
                  </span>
                </div>
              </div>

              {/* Status and Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      banner.isActive ? 'bg-tertiary animate-pulse' : 'bg-on-surface-variant'
                    }`}
                  />
                  <span className="text-xs font-semibold text-on-surface">
                    {banner.isActive ? 'Đang hiển thị trên sảnh' : 'Đang tạm ẩn'}
                  </span>
                </div>

                <button
                  onClick={() => toggleBannerActive(banner.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    banner.isActive
                      ? 'bg-primary-soft text-primary hover:bg-primary-container hover:text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {banner.isActive ? 'Ẩn banner' : 'Bật hiển thị'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
