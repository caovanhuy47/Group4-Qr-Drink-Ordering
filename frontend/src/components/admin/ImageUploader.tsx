import React, { useState, useRef, useEffect } from 'react';
import { mediaApi } from '../../api/mediaApi';
import { useRestaurant } from '../../contexts/useRestaurant';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
  onPreviewChange?: (previewUrl: string) => void;
  folder?: 'dishes' | 'banners';
  aspectRatio?: 'dish' | 'banner';
  label?: string;
  required?: boolean;
  disabled?: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl = '',
  onImageChange,
  onPreviewChange,
  folder = 'dishes',
  aspectRatio = 'dish',
  label = 'Ảnh đại diện',
  required = false,
  disabled = false,
  onUploadingChange,
}) => {
  const { currentUser } = useRestaurant();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab: 'file' (Tải từ máy) vs 'url' (Nhập link trực tuyến)
  const isServerUpload = currentImageUrl.startsWith('/uploads/');
  const [sourceMode, setSourceMode] = useState<'file' | 'url'>(
    isServerUpload || !currentImageUrl ? 'file' : 'url'
  );

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>(
    currentImageUrl.startsWith('http') || currentImageUrl.startsWith('/uploads/') ? currentImageUrl : ''
  );
  const [urlImageError, setUrlImageError] = useState<boolean>(false);

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const [prevPropUrl, setPrevPropUrl] = useState<string>(currentImageUrl);
  if (currentImageUrl !== prevPropUrl) {
    setPrevPropUrl(currentImageUrl);
    if (!selectedFile) {
      setPreviewUrl(currentImageUrl);
      if (currentImageUrl.startsWith('http') || currentImageUrl.startsWith('/uploads/')) {
        setUrlInput(currentImageUrl);
      }
    }
  }

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleValidateAndUploadFile = async (file: File) => {
    setUploadError('');

    // 1. Validate file size (< 10 MB)
    if (file.size >= MAX_FILE_SIZE_BYTES) {
      setUploadError(
        `Dung lượng ảnh vượt quá giới hạn (yêu cầu nhỏ hơn 10 MB, file hiện tại: ${formatFileSize(file.size)}).`
      );
      return;
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setUploadError('Định dạng ảnh chưa hỗ trợ. Vui lòng chọn ảnh JPG, PNG hoặc WebP.');
      return;
    }

    setSelectedFile(file);

    // Immediate local preview passed to parent immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onPreviewChange?.(objectUrl);

    // 3. Upload to backend
    setIsUploading(true);
    try {
      const staffId = currentUser?.id;
      const res = await mediaApi.uploadImage(file, folder, staffId);
      if (res.success && res.url) {
        onImageChange(res.url);
        onPreviewChange?.(res.url);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải ảnh lên máy chủ';
      setUploadError(msg);
      // Revert parent preview to current image on upload failure
      onPreviewChange?.(currentImageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleValidateAndUploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleValidateAndUploadFile(file);
    }
  };

  const handleCancelNewFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setUploadError('');
    setPreviewUrl(currentImageUrl);
    onImageChange(currentImageUrl);
    onPreviewChange?.(currentImageUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (val: string) => {
    const clean = val.trim();
    setUrlInput(val);
    setUrlImageError(false);
    setUploadError('');
    onImageChange(clean);
    setPreviewUrl(clean);
    onPreviewChange?.(clean);
  };

  const aspectClass = aspectRatio === 'banner' ? 'aspect-[21/9]' : 'aspect-square md:aspect-[4/3]';

  return (
    <div className="space-y-2">
      {/* Label and Source Mode Toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="font-bold text-xs md:text-sm text-on-surface">
          {label} {required && <span className="text-primary">*</span>}
        </label>

        {/* 2 Tabs: Tải ảnh từ máy vs Dùng URL */}
        <div className="inline-flex p-0.5 rounded-lg bg-surface-container border border-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setSourceMode('file');
              if (selectedFile && previewUrl) {
                onPreviewChange?.(previewUrl);
              } else if (currentImageUrl) {
                setPreviewUrl(currentImageUrl);
                onImageChange(currentImageUrl);
                onPreviewChange?.(currentImageUrl);
              }
            }}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              sourceMode === 'file'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">upload_file</span>
            <span>Tải ảnh từ máy</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSourceMode('url');
              const clean = urlInput.trim();
              onImageChange(clean);
              setPreviewUrl(clean);
              onPreviewChange?.(clean);
            }}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              sourceMode === 'url'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">link</span>
            <span>Dùng link URL</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Tải ảnh từ máy (File upload & Drag-drop) */}
      {sourceMode === 'file' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isUploading}
          />

          {/* Drag & Drop Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer select-none ${
              isDragging
                ? 'border-primary bg-primary-soft/50 ring-4 ring-primary/20 scale-[0.99]'
                : uploadError
                ? 'border-error/60 bg-error-container/10 hover:border-error'
                : 'border-border bg-surface-container-low/70 hover:bg-surface-container-low hover:border-primary/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary mb-2 shadow-xs">
              <span className="material-symbols-outlined text-[26px]">
                {isUploading ? 'progress_activity' : 'cloud_upload'}
              </span>
            </div>

            <p className="font-headline font-bold text-xs md:text-sm text-on-surface">
              {isUploading ? (
                <span className="text-primary flex items-center gap-1.5 animate-pulse">
                  Đang tải ảnh lên máy chủ...
                </span>
              ) : (
                <>
                  <span className="text-primary">Bấm để chọn ảnh từ máy</span> hoặc kéo thả vào đây
                </>
              )}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-1">
              Định dạng hỗ trợ: <strong>JPG, PNG, WebP</strong> • Dung lượng: <strong>&lt; 10 MB</strong>
            </p>
          </div>

          {/* Upload Error Banner */}
          {uploadError && (
            <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 flex items-start gap-2.5 text-xs text-error animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <div className="flex-1">
                <span className="font-bold block">Không thể tải ảnh</span>
                <p className="leading-relaxed">{uploadError}</p>
              </div>
            </div>
          )}

          {/* File Selected Meta Info & Controls */}
          {selectedFile && (
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-border flex items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">image</span>
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-on-surface block truncate max-w-[200px] md:max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type.replace('image/', '').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-[11px] transition-colors"
                >
                  Đổi ảnh
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelNewFile();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-error-container/30 hover:bg-error-container/50 text-error font-semibold text-[11px] transition-colors"
                  title="Hủy lựa chọn này"
                >
                  Hủy chọn
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Nhập link trực tuyến URL */}
      {sourceMode === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={urlInput}
              disabled={disabled}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://images.unsplash.com/... hoặc /uploads/..."
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-border rounded-xl text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest transition-all text-xs font-mono"
            />
            {urlInput && (
              <button
                type="button"
                onClick={() => handleUrlChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
          {urlImageError && (
            <p className="text-[11px] text-error font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">broken_image</span>
              Đường dẫn ảnh trực tuyến không tải được. Vui lòng kiểm tra lại URL.
            </p>
          )}
        </div>
      )}

      {/* Image Preview Box with Natural Aspect Ratio */}
      {previewUrl && (
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Xem trước ảnh ({aspectRatio === 'banner' ? 'Tỷ lệ Banner 21:9' : 'Tỷ lệ Món ăn 4:3'})
            </span>
            {previewUrl === currentImageUrl && !selectedFile && (
              <span className="text-[10px] text-tertiary font-bold bg-tertiary-soft px-2 py-0.5 rounded-full">
                Ảnh hiện tại
              </span>
            )}
          </div>

          <div
            className={`w-full ${aspectClass} rounded-2xl overflow-hidden border border-border bg-surface-container-low relative group shadow-xs`}
          >
            <img
              src={previewUrl}
              alt="Xem trước"
              onError={() => {
                if (sourceMode === 'url') setUrlImageError(true);
              }}
              className="w-full h-full object-cover object-center transition-transform group-hover:scale-102 duration-300"
            />

            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                <span className="material-symbols-outlined text-[32px] animate-spin text-primary">
                  progress_activity
                </span>
                <span className="text-xs font-bold">Đang lưu ảnh lên máy chủ...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

