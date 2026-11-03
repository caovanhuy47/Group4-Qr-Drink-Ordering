import React, { useState, useMemo } from 'react';
import type { Banner, BannerLinkType } from '../../types/restaurant';
import { useRestaurant } from '../../contexts/useRestaurant';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DEFAULT_FALLBACK_IMAGE } from '../../services/dishesApi';

const GRADIENT_PRESETS = [
  {
    id: 'preset-primary',
    name: 'Cam Ấm Phố (Mặc định)',
    value: 'from-primary via-primary-container to-secondary-container',
  },
  {
    id: 'preset-secondary',
    name: 'Đỏ Lửa Than Nướng',
    value: 'from-secondary via-secondary-container to-primary',
  },
  {
    id: 'preset-tertiary',
    name: 'Xanh Trà Mát Lạnh',
    value: 'from-tertiary via-tertiary-container to-secondary',
  },
  {
    id: 'preset-coffee',
    name: 'Nâu Trầm Vỉa Hè',
    value: 'from-stone-800 via-amber-950 to-orange-950',
  },
];

export const BannerManagementView: React.FC = () => {
  const {
    banners,
    saveBanner,
    toggleBannerActive,
    reorderBanners,
    deleteBanner,
    refreshBanners,
    isBannersLoading,
    dishes,
    categories,
    currentUser,
    showToast,
  } = useRestaurant();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form state
  const [adminName, setAdminName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [discountBadge, setDiscountBadge] = useState('');
  const [priceNote, setPriceNote] = useState('');
  const [ctaText, setCtaText] = useState('Khám phá ngay');
  const [imageUrl, setImageUrl] = useState('');
  const [bgGradient, setBgGradient] = useState(GRADIENT_PRESETS[0].value);
  const [linkType, setLinkType] = useState<BannerLinkType>('none');
  const [linkTargetId, setLinkTargetId] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  // Modal UI state
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [imageLoadError, setImageLoadError] = useState(false);

  // Delete modal state
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview only modal
  const [viewingBanner, setViewingBanner] = useState<Banner | null>(null);

  const canManage = Boolean(currentUser?.role === 'admin' || currentUser?.role === 'cashier');

  // Filtered & Sorted Banners
  const filteredBanners = useMemo(() => {
    return banners
      .filter((b) => {
        const matchesSearch =
          searchTerm.trim() === '' ||
          (b.adminName && b.adminName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.tag && b.tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'active'
            ? b.isActive
            : !b.isActive;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [banners, searchTerm, statusFilter]);

  const activeCount = banners.filter((b) => b.isActive).length;
  const inactiveCount = banners.length - activeCount;

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingBanner(null);
    setAdminName('');
    setTitle('');
    setDescription('');
    setTag('Giờ Vàng');
    setDiscountBadge('');
    setPriceNote('');
    setCtaText('Khám phá ngay');
    setImageUrl('');
    setBgGradient(GRADIENT_PRESETS[0].value);
    setLinkType('none');
    setLinkTargetId('');
    setDisplayOrder(banners.length + 1);
    setIsActive(true);
    setFormError('');
    setImageLoadError(false);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setAdminName(banner.adminName || banner.title);
    setTitle(banner.title);
    setDescription(banner.description || '');
    setTag(banner.tag || '');
    setDiscountBadge(banner.discountBadge || '');
    setPriceNote(banner.priceNote || '');
    setCtaText(banner.ctaText || 'Khám phá ngay');
    setImageUrl(banner.imageUrl || '');
    setBgGradient(banner.bgGradient || GRADIENT_PRESETS[0].value);
    setLinkType(banner.linkType || 'none');
    setLinkTargetId(banner.linkTargetId || '');
    setDisplayOrder(banner.displayOrder ?? 1);
    setIsActive(banner.isActive);
    setFormError('');
    setImageLoadError(false);
    setIsModalOpen(true);
  };

  // Submit banner form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      showToast('Bạn không có quyền chỉnh sửa banner.', 'error');
      return;
    }

    const trimmedAdminName = adminName.trim();
    const trimmedTitle = title.trim();

    if (!trimmedAdminName) {
      setFormError('Vui lòng nhập tên quản trị để nhận diện banner nội bộ.');
      return;
    }

    if (!trimmedTitle) {
      setFormError('Vui lòng nhập tiêu đề hiển thị cho khách hàng.');
      return;
    }

    if (
      imageUrl.trim() &&
      (/^(file:\/\/|[a-zA-Z]:\\|\/Users\/)/i.test(imageUrl.trim()) ||
        imageUrl.trim().startsWith('blob:'))
    ) {
      setFormError('Không dùng đường dẫn file cá nhân hoặc blob tạm. Vui lòng dùng URL trực tuyến (https://...).');
      return;
    }

    // Validate link target if selected
    if (linkType === 'dish' && !linkTargetId) {
      setFormError('Vui lòng chọn món ăn cần liên kết.');
      return;
    }

    if (linkType === 'category' && !linkTargetId) {
      setFormError('Vui lòng chọn danh mục cần liên kết.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const bannerPayload: Partial<Banner> = {
      id: editingBanner ? editingBanner.id : `banner-${Date.now()}`,
      adminName: trimmedAdminName,
      title: trimmedTitle,
      description: description.trim(),
      tag: tag.trim(),
      discountBadge: discountBadge.trim(),
      priceNote: priceNote.trim(),
      ctaText: ctaText.trim() || 'Khám phá ngay',
      bgGradient,
      imageUrl: imageUrl.trim(),
      linkType,
      linkTargetId: linkTargetId.trim(),
      displayOrder: Math.max(0, Math.floor(Number(displayOrder) || 1)),
      isActive,
    };

    try {
      await saveBanner(bannerPayload);
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Lỗi khi lưu dữ liệu vào máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reorder banner up/down
  const handleMoveOrder = async (banner: Banner, direction: 'up' | 'down') => {
    if (!canManage) return;

    const sorted = [...banners].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    const currentIndex = sorted.findIndex((b) => b.id === banner.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentItem = sorted[currentIndex];
    const targetItem = sorted[targetIndex];

    const currentOrder = currentItem.displayOrder ?? currentIndex + 1;
    const targetOrder = targetItem.displayOrder ?? targetIndex + 1;

    // Swap displayOrder values
    const newItems = [
      { id: currentItem.id, displayOrder: targetOrder },
      { id: targetItem.id, displayOrder: currentOrder },
    ];

    await reorderBanners(newItems);
  };

  // Delete banner confirm
  const handleConfirmDelete = async () => {
    if (!bannerToDelete || !canManage) return;
    setIsDeleting(true);
    try {
      await deleteBanner(bannerToDelete.id);
      setBannerToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to render link target badge
  const renderLinkTargetBadge = (banner: Banner) => {
    if (!banner.linkType || banner.linkType === 'none' || !banner.linkTargetId) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant font-medium bg-surface-container px-2 py-0.5 rounded-md">
          <span className="material-symbols-outlined text-[13px]">link_off</span>
          <span>Không liên kết</span>
        </span>
      );
    }

    if (banner.linkType === 'dish') {
      const dish = dishes.find((d) => d.id === banner.linkTargetId);
      if (!dish || dish.isArchived) {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-error font-bold bg-error-container/40 border border-error/30 px-2 py-0.5 rounded-md">
            <span className="material-symbols-outlined text-[13px]">warning</span>
            <span>Món đã xóa/ẩn ({banner.linkTargetId})</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-primary font-bold bg-primary-soft px-2 py-0.5 rounded-md border border-primary/20">
          <span className="material-symbols-outlined text-[13px]">restaurant_menu</span>
          <span>Món: {dish.name}</span>
        </span>
      );
    }

    if (banner.linkType === 'category') {
      const cat = categories.find((c) => c.id === banner.linkTargetId);
      if (!cat) {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-error font-bold bg-error-container/40 border border-error/30 px-2 py-0.5 rounded-md">
            <span className="material-symbols-outlined text-[13px]">warning</span>
            <span>Danh mục đã xóa ({banner.linkTargetId})</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-tertiary font-bold bg-tertiary-soft px-2 py-0.5 rounded-md border border-tertiary/20">
          <span className="material-symbols-outlined text-[13px]">category</span>
          <span>Nhóm: {cat.name}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-secondary font-bold bg-secondary-soft px-2 py-0.5 rounded-md">
        <span className="material-symbols-outlined text-[13px]">open_in_new</span>
        <span className="truncate max-w-[120px]">{banner.linkTargetId}</span>
      </span>
    );
  };

  return (
    <AdminLayout
      title="Quản Lý Banner Trang Chủ"
      subtitle="Thiết lập banner ưu đãi, giờ vàng và thông điệp nổi bật hiển thị ở đầu sảnh khách"
    >
      <div className="space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 shadow-warm-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-medium">Tổng số banner</span>
              <h4 className="font-headline font-black text-2xl text-on-surface mt-0.5">
                {isBannersLoading ? (
                  <span className="inline-block h-7 w-10 bg-surface-container rounded-lg animate-pulse" />
                ) : (
                  banners.length
                )}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">view_carousel</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 shadow-warm-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-tertiary font-medium">Đang hiển thị trên sảnh</span>
              <h4 className="font-headline font-black text-2xl text-tertiary mt-0.5">
                {isBannersLoading ? (
                  <span className="inline-block h-7 w-10 bg-surface-container rounded-lg animate-pulse" />
                ) : (
                  activeCount
                )}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-tertiary-soft text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">visibility</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 shadow-warm-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-medium">Đang tạm ẩn</span>
              <h4 className="font-headline font-black text-2xl text-on-surface-variant mt-0.5">
                {isBannersLoading ? (
                  <span className="inline-block h-7 w-10 bg-surface-container rounded-lg animate-pulse" />
                ) : (
                  inactiveCount
                )}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">visibility_off</span>
            </div>
          </div>
        </div>

        {/* Action Bar & Controls */}
        <div className="bg-surface-container-lowest border border-border rounded-2xl p-4 shadow-warm-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên quản trị, tiêu đề..."
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-border rounded-xl text-xs md:text-sm text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-border text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Tất cả ({banners.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === 'active'
                    ? 'bg-surface-container-lowest text-tertiary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Đang bật ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === 'inactive'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Tạm ẩn ({inactiveCount})
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refreshBanners()}
              disabled={isBannersLoading}
              title="Làm mới dữ liệu từ máy chủ"
              className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border text-on-surface-variant hover:text-on-surface transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[20px] ${isBannersLoading ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>

            {canManage && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs md:text-sm shadow-warm-xs flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Thêm banner mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Banners List */}
        {isBannersLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest border border-border rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-24 md:w-32 h-16 md:h-20 rounded-xl bg-surface-container-high/60 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-36 bg-surface-container-high/60 rounded" />
                    <div className="h-3 w-56 bg-surface-container/60 rounded" />
                    <div className="h-4 w-24 bg-surface-container-high/60 rounded-md" />
                  </div>
                </div>
                <div className="h-8 w-24 bg-surface-container-high/60 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="bg-surface-container-lowest border border-border rounded-2xl p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[28px]">image_not_supported</span>
            </div>
            <h4 className="font-headline font-bold text-base text-on-surface">
              {banners.length === 0 ? 'Chưa có banner nào trên hệ thống' : 'Không có banner phù hợp bộ lọc'}
            </h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              {banners.length === 0
                ? 'Hãy tạo banner đầu tiên để hiển thị các chương trình khuyến mãi, giờ vàng thu hút khách hàng.'
                : 'Thử xóa từ khóa tìm kiếm hoặc đổi sang xem tất cả banner.'}
            </p>
            {canManage && banners.length === 0 && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs"
              >
                + Tạo banner ngay
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBanners.map((banner, index) => (
              <div
                key={banner.id}
                className={`bg-surface-container-lowest border rounded-2xl p-4 md:p-5 shadow-warm-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all ${
                  banner.isActive ? 'border-border' : 'border-border/50 bg-surface-container-low/40 opacity-80'
                }`}
              >
                {/* Left: Order & Thumbnail & Info */}
                <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1 min-w-0">
                  {/* Order Controls */}
                  <div className="flex flex-col items-center justify-center bg-surface-container-low border border-border rounded-xl p-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0 || !canManage}
                      onClick={() => handleMoveOrder(banner, 'up')}
                      title="Chuyển lên trước"
                      className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container disabled:opacity-20 disabled:hover:bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    </button>
                    <span className="text-[11px] font-black text-on-surface my-0.5">
                      #{banner.displayOrder ?? index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={index === filteredBanners.length - 1 || !canManage}
                      onClick={() => handleMoveOrder(banner, 'down')}
                      title="Chuyển xuống sau"
                      className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container disabled:opacity-20 disabled:hover:bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    </button>
                  </div>

                  {/* Thumbnail / Visual Badge */}
                  <div
                    className={`w-28 h-20 md:w-36 md:h-24 rounded-xl shrink-0 relative overflow-hidden flex flex-col justify-between p-2 text-white border border-border/40 shadow-xs ${
                      banner.bgGradient || 'from-primary to-secondary'
                    }`}
                  >
                    {banner.imageUrl && (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay pointer-events-none"
                      />
                    )}
                    <span className="relative z-10 text-[9px] font-bold uppercase tracking-wider bg-surface-container-lowest/30 px-1.5 py-0.5 rounded backdrop-blur-xs self-start line-clamp-1 max-w-full">
                      {banner.tag || 'Banner'}
                    </span>
                    <span className="relative z-10 font-headline font-black text-xs self-end text-secondary-fixed">
                      {banner.discountBadge}
                    </span>
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-headline font-bold text-sm md:text-base text-on-surface truncate">
                        {banner.adminName || banner.title}
                      </h4>
                      {/* Active Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          banner.isActive
                            ? 'bg-tertiary-soft text-tertiary border border-tertiary/20'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            banner.isActive ? 'bg-tertiary animate-pulse' : 'bg-on-surface-variant'
                          }`}
                        />
                        <span>{banner.isActive ? 'Đang mở sảnh' : 'Đang tạm ẩn'}</span>
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant line-clamp-1">
                      <strong className="text-on-surface font-semibold">Khách thấy: </strong>
                      &ldquo;{banner.title}&rdquo;
                      {banner.description && ` — ${banner.description}`}
                    </p>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {renderLinkTargetBadge(banner)}
                      {banner.priceNote && (
                        <span className="text-[11px] text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">
                          {banner.priceNote}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center border-t lg:border-t-0 pt-2 lg:pt-0 w-full lg:w-auto justify-end">
                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={() => setViewingBanner(banner)}
                    title="Xem trước hiển thị"
                    className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-1 text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    <span className="hidden sm:inline">Xem trước</span>
                  </button>

                  {/* Toggle Active Status Button */}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => toggleBannerActive(banner.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        banner.isActive
                          ? 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          : 'bg-tertiary-soft text-tertiary hover:bg-tertiary-container hover:text-on-tertiary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {banner.isActive ? 'visibility_off' : 'visibility'}
                      </span>
                      <span>{banner.isActive ? 'Tạm ẩn' : 'Bật sảnh'}</span>
                    </button>
                  )}

                  {/* Edit Button */}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(banner)}
                      title="Chỉnh sửa banner"
                      className="p-2 rounded-xl bg-primary-soft hover:bg-primary-container text-primary hover:text-on-primary transition-all flex items-center gap-1 text-xs font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      <span className="hidden sm:inline">Sửa</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setBannerToDelete(banner)}
                      title="Xóa banner"
                      className="p-2 rounded-xl bg-error-container/30 hover:bg-error hover:text-on-error text-error transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL THÊM / SỬA BANNER ================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-on-surface/50 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0" onClick={() => !isSubmitting && setIsModalOpen(false)} />

          <div className="relative z-10 w-full max-w-4xl bg-surface-container-lowest rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-warm-lg animate-pop-in border border-border">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-container-low/50">
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  {editingBanner ? 'Chỉnh Sửa Banner' : 'Tạo Banner Mới Cho Trang Chủ'}
                </h3>
                <span className="text-xs text-on-surface-variant">
                  Cập nhật dữ liệu thật và xem trước hiển thị thời gian thực cho khách quét QR
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs flex items-center gap-2 animate-fade-in">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Body: 2 Columns on Desktop */}
            <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
              {/* Form Column (7 cols) */}
              <form id="banner-form" onSubmit={handleSubmitForm} className="md:col-span-7 space-y-4 text-xs md:text-sm">
                {/* Admin Name */}
                <div>
                  <label className="block font-bold text-on-surface mb-1">
                    Tên quản trị nội bộ <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Ví dụ: Banner Giờ Vàng Thứ 3, Banner Giới Thiệu Món Mới..."
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                  />
                  <span className="text-[11px] text-on-surface-variant mt-0.5 block">
                    Dùng để quản lý nội bộ, không hiển thị trên trang chủ của khách.
                  </span>
                </div>

                {/* Customer Title */}
                <div>
                  <label className="block font-bold text-on-surface mb-1">
                    Tiêu đề hiển thị cho khách <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Combo Huy CV Giờ Vàng, Lẩu Ếch Măng Cay Mới..."
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-border rounded-xl text-on-surface font-headline font-bold outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-on-surface mb-1">Mô tả chi tiết</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ví dụ: Nướng ngói béo ngậy kèm trà tắc mát lạnh phố xá..."
                    className="w-full px-3.5 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all resize-none"
                  />
                </div>

                {/* Tag & Discount Badge */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-on-surface mb-1">Thẻ nhãn (Tag)</label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="Ví dụ: Giờ Vàng 16h-19h, Món Mới..."
                      className="w-full px-3.5 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Huy hiệu nổi bật</label>
                    <input
                      type="text"
                      value={discountBadge}
                      onChange={(e) => setDiscountBadge(e.target.value)}
                      placeholder="Ví dụ: -20%, HOT, ĐẶC BIỆT..."
                      className="w-full px-3.5 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface font-headline font-bold outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>
                </div>

                {/* CTA Text & Price Note */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-on-surface mb-1">Chữ nút bấm (CTA)</label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Mặc định: Khám phá ngay"
                      className="w-full px-3.5 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Ghi chú giá</label>
                    <input
                      type="text"
                      value={priceNote}
                      onChange={(e) => setPriceNote(e.target.value)}
                      placeholder="Ví dụ: Chỉ từ 69k, Tặng kèm tráng miệng..."
                      className="w-full px-3.5 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-on-surface">Đường dẫn ảnh nền (URL)</label>
                    {imageLoadError && (
                      <span className="text-[11px] text-error font-medium">Link ảnh không tải được</span>
                    )}
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageLoadError(false);
                    }}
                    placeholder="https://... (để trống nếu chỉ dùng nền màu)"
                    className="w-full px-3.5 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all font-mono text-xs"
                  />
                </div>

                {/* Background Gradient Theme */}
                <div>
                  <label className="block font-bold text-on-surface mb-1.5">Tông màu chủ đạo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GRADIENT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setBgGradient(preset.value)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          bgGradient === preset.value
                            ? 'border-primary bg-primary-soft/30 shadow-xs'
                            : 'border-border bg-surface-container-low hover:bg-surface-container'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg bg-gradient-to-r ${preset.value} shrink-0 shadow-xs`} />
                        <span className="text-xs font-semibold text-on-surface truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link Target Type & Target Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/40">
                  <div>
                    <label className="block font-bold text-on-surface mb-1">Hành vi khi khách bấm</label>
                    <select
                      value={linkType}
                      onChange={(e) => {
                        const newType = e.target.value as BannerLinkType;
                        setLinkType(newType);
                        setLinkTargetId('');
                      }}
                      className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    >
                      <option value="none">Không liên kết (Chỉ hiển thị)</option>
                      <option value="dish">Mở món ăn cụ thể</option>
                      <option value="category">Chuyển sang nhóm món / danh mục</option>
                      <option value="custom">Mở đường dẫn ngoài (URL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">
                      {linkType === 'dish'
                        ? 'Chọn món ăn đích'
                        : linkType === 'category'
                        ? 'Chọn danh mục đích'
                        : linkType === 'custom'
                        ? 'Nhập liên kết ngoài'
                        : 'Đối tượng liên kết'}
                    </label>

                    {linkType === 'none' && (
                      <input
                        type="text"
                        disabled
                        value="Không có hành động liên kết"
                        className="w-full px-3 py-2 bg-surface-container border border-border/40 rounded-xl text-on-surface-variant/70 italic text-xs"
                      />
                    )}

                    {linkType === 'dish' && (
                      <select
                        value={linkTargetId}
                        onChange={(e) => setLinkTargetId(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                      >
                        <option value="">-- Chọn món ăn --</option>
                        {dishes
                          .filter((d) => !d.isArchived)
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.price.toLocaleString('vi-VN')}đ)
                            </option>
                          ))}
                      </select>
                    )}

                    {linkType === 'category' && (
                      <select
                        value={linkTargetId}
                        onChange={(e) => setLinkTargetId(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.count} món)
                          </option>
                        ))}
                      </select>
                    )}

                    {linkType === 'custom' && (
                      <input
                        type="url"
                        value={linkTargetId}
                        onChange={(e) => setLinkTargetId(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all font-mono text-xs"
                      />
                    )}
                  </div>
                </div>

                {/* Display Order & Active Toggle */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/40">
                  <div>
                    <label className="block font-bold text-on-surface mb-1">Thứ tự hiển thị</label>
                    <input
                      type="number"
                      min={1}
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Trạng thái sảnh</label>
                    <select
                      value={isActive ? 'active' : 'inactive'}
                      onChange={(e) => setIsActive(e.target.value === 'active')}
                      className="w-full px-3 py-2 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
                    >
                      <option value="active">Đang bật (Hiển thị ngay)</option>
                      <option value="inactive">Tạm ẩn (Lưu nháp)</option>
                    </select>
                  </div>
                </div>
              </form>

              {/* Right Column: Live Customer Preview (5 cols) */}
              <div className="md:col-span-5 bg-surface-container-low/50 border border-border rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">
                      Xem trước sảnh khách
                    </span>
                    <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => setPreviewMode('desktop')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          previewMode === 'desktop'
                            ? 'bg-surface-container-lowest text-primary shadow-2xs'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        Máy tính
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('mobile')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          previewMode === 'mobile'
                            ? 'bg-surface-container-lowest text-primary shadow-2xs'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        Điện thoại
                      </button>
                    </div>
                  </div>

                  {/* Card Container simulating responsive customer view */}
                  <div className={previewMode === 'mobile' ? 'max-w-[320px] mx-auto' : 'w-full'}>
                    <div
                      className={`relative w-full rounded-2xl p-4 md:p-5 text-on-primary flex flex-col justify-between overflow-hidden shadow-warm-sm transition-all duration-300 min-h-[175px] md:min-h-[200px] ${bgGradient}`}
                    >
                      {/* Background Image Preview */}
                      {imageUrl && !imageLoadError && (
                        <>
                          <img
                            src={imageUrl}
                            alt={title || 'Preview'}
                            onError={() => setImageLoadError(true)}
                            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay pointer-events-none select-none"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-on-surface/85 via-on-surface/50 to-transparent pointer-events-none" />
                        </>
                      )}

                      {/* Ambient Shapes */}
                      <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-secondary-fixed/15 blur-xl pointer-events-none" />

                      {/* Header in Preview */}
                      <div className="relative z-10 flex items-start justify-between gap-2">
                        {tag ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/25 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-secondary-fixed border border-secondary-fixed/20 shadow-xs">
                            <span className="material-symbols-outlined text-[11px]">bolt</span>
                            <span>{tag}</span>
                          </span>
                        ) : (
                          <span />
                        )}

                        {discountBadge && (
                          <span className="font-headline font-black text-lg md:text-xl text-secondary-fixed drop-shadow-sm">
                            {discountBadge}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="relative z-10 my-2.5">
                        <h4 className="font-headline font-extrabold text-base md:text-lg leading-snug text-white line-clamp-2">
                          {title || 'Tiêu đề banner mẫu...'}
                        </h4>
                        <p className="text-xs text-surface-container-lowest/90 font-medium leading-relaxed mt-1 line-clamp-2">
                          {description || 'Mô tả ưu đãi hoặc thông điệp cuốn hút sẽ hiển thị ở đây...'}
                        </p>
                      </div>

                      {/* Footer CTA & Price */}
                      <div className="relative z-10 flex items-center justify-between pt-1 gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary font-bold text-[11px] shadow-warm-xs">
                          <span>{ctaText || 'Khám phá ngay'}</span>
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </span>

                        {priceNote && (
                          <span className="text-[11px] text-secondary-fixed font-bold bg-surface-container-lowest/20 backdrop-blur-xs px-2 py-0.5 rounded">
                            {priceNote}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-on-surface-variant/70 text-center pt-3 mt-4 border-t border-border/40">
                  Banner sẽ tự động cập nhật lên sảnh khách ngay sau khi bạn lưu.
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-surface-container-low border-t border-border flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="banner-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                )}
                <span>{editingBanner ? 'Cập nhật banner' : 'Lưu banner mới'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XEM TRƯỚC (QUICK PREVIEW) ================= */}
      {viewingBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0" onClick={() => setViewingBanner(null)} />
          <div className="relative z-10 w-full max-w-2xl bg-surface-container-lowest rounded-2xl overflow-hidden shadow-warm-lg animate-pop-in border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Xem Trước: {viewingBanner.adminName || viewingBanner.title}
                </h3>
                <span className="text-xs text-on-surface-variant">
                  Thứ tự: #{viewingBanner.displayOrder} • Trạng thái: {viewingBanner.isActive ? 'Đang mở' : 'Tạm ẩn'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingBanner(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Simulated Banner Card */}
            <div
              className={`relative w-full rounded-2xl p-6 text-on-primary flex flex-col justify-between overflow-hidden shadow-warm-md min-h-[210px] ${
                viewingBanner.bgGradient || 'from-primary via-primary-container to-secondary-container'
              }`}
            >
              {viewingBanner.imageUrl && (
                <>
                  <img
                    src={viewingBanner.imageUrl}
                    alt={viewingBanner.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                    }}
                    className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay pointer-events-none select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-on-surface/85 via-on-surface/50 to-transparent pointer-events-none" />
                </>
              )}

              <div className="relative z-10 flex items-start justify-between">
                {viewingBanner.tag && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-lowest/25 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-secondary-fixed border border-secondary-fixed/20 shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">bolt</span>
                    <span>{viewingBanner.tag}</span>
                  </span>
                )}
                {viewingBanner.discountBadge && (
                  <span className="font-headline font-black text-2xl text-secondary-fixed">
                    {viewingBanner.discountBadge}
                  </span>
                )}
              </div>

              <div className="relative z-10 my-3">
                <h4 className="font-headline font-extrabold text-xl md:text-2xl text-white">
                  {viewingBanner.title}
                </h4>
                {viewingBanner.description && (
                  <p className="text-xs md:text-sm text-surface-container-lowest/90 font-medium mt-1 line-clamp-2">
                    {viewingBanner.description}
                  </p>
                )}
              </div>

              <div className="relative z-10 flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-lowest text-primary font-bold text-xs shadow-warm-xs">
                  <span>{viewingBanner.ctaText || 'Khám phá ngay'}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
                {viewingBanner.priceNote && (
                  <span className="text-xs text-secondary-fixed font-bold bg-surface-container-lowest/20 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                    {viewingBanner.priceNote}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingBanner(null)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN XÓA BANNER ================= */}
      {bannerToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0" onClick={() => !isDeleting && setBannerToDelete(null)} />
          <div className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-2xl overflow-hidden shadow-warm-lg animate-pop-in border border-border p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-error-container/40 text-error flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[26px]">delete_forever</span>
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-headline font-bold text-lg text-on-surface">Xác Nhận Xóa Banner</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn banner{' '}
                <strong className="text-on-surface font-bold">&ldquo;{bannerToDelete.adminName || bannerToDelete.title}&rdquo;</strong>{' '}
                khỏi hệ thống? Hành động này không thể hoàn tác.
              </p>
            </div>

            {/* Thumbnail preview */}
            <div className="bg-surface-container-low border border-border rounded-xl p-3 flex items-center gap-3">
              <div
                className={`w-16 h-12 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-xs ${
                  bannerToDelete.bgGradient || 'from-primary to-secondary'
                }`}
              >
                {bannerToDelete.tag || 'Banner'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-on-surface block truncate">
                  {bannerToDelete.adminName || bannerToDelete.title}
                </span>
                <span className="text-[11px] text-on-surface-variant block truncate">
                  Tiêu đề: {bannerToDelete.title}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setBannerToDelete(null)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-error text-on-error hover:bg-error/90 text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting && (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-on-error border-t-transparent animate-spin" />
                )}
                <span>Xóa banner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
export default BannerManagementView;
