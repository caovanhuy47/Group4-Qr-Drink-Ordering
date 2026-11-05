import React, { useEffect, useRef, useCallback } from 'react';

export type AdminFeedbackType = 'success' | 'error' | 'warning' | 'info';

export interface AdminFeedbackData {
  type: AdminFeedbackType;
  title: string;
  message: string;
  detail?: string;
  actionText?: string;
  onClose?: () => void;
}

interface AdminFeedbackModalProps {
  feedback: AdminFeedbackData | null;
  onClose: () => void;
}

export const AdminFeedbackModal: React.FC<AdminFeedbackModalProps> = ({ feedback, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleDismiss = useCallback(() => {
    feedback?.onClose?.();
    onClose();
  }, [feedback, onClose]);

  // Lock body scroll and handle Escape/Enter key
  useEffect(() => {
    if (feedback) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Auto focus action button for accessibility
      const focusTimer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          handleDismiss();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(focusTimer);
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [feedback, handleDismiss]);

  if (!feedback) return null;

  // Icon, color palette and badge style according to type
  const typeConfig: Record<
    AdminFeedbackType,
    { icon: string; bgClass: string; borderClass: string; iconClass: string; btnClass: string }
  > = {
    success: {
      icon: 'check_circle',
      bgClass: 'bg-tertiary-soft',
      borderClass: 'border-tertiary/25',
      iconClass: 'text-tertiary',
      btnClass: 'bg-primary-container text-on-primary hover:bg-primary-hover',
    },
    error: {
      icon: 'error',
      bgClass: 'bg-error-container/30',
      borderClass: 'border-error/30',
      iconClass: 'text-error',
      btnClass: 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-border',
    },
    warning: {
      icon: 'warning',
      bgClass: 'bg-amber-500/15',
      borderClass: 'border-amber-500/25',
      iconClass: 'text-amber-600',
      btnClass: 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-border',
    },
    info: {
      icon: 'info',
      bgClass: 'bg-blue-500/15',
      borderClass: 'border-blue-500/25',
      iconClass: 'text-blue-600',
      btnClass: 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-border',
    },
  };

  const currentCfg = typeConfig[feedback.type] || typeConfig.info;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-feedback-title"
    >
      <div className="relative w-full max-w-md bg-surface-container-lowest border border-border rounded-3xl p-6 shadow-warm-xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Top Close Button (X) */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          title="Đóng thông báo"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Dedicated Icon Badge */}
        <div className="flex items-center gap-3.5 pr-8">
          <div
            className={`w-14 h-14 rounded-2xl ${currentCfg.bgClass} border ${currentCfg.borderClass} flex items-center justify-center ${currentCfg.iconClass} shrink-0 shadow-xs`}
          >
            <span className="material-symbols-outlined text-[30px]">{currentCfg.icon}</span>
          </div>

          <div className="min-w-0">
            <h3
              id="admin-feedback-title"
              className="font-headline font-black text-lg md:text-xl text-on-surface leading-tight"
            >
              {feedback.title}
            </h3>
          </div>
        </div>

        {/* Full Message (Proper word wrapping and line-breaks) */}
        <div className="text-xs md:text-sm text-on-surface-variant leading-relaxed whitespace-pre-line break-words max-h-[40vh] overflow-y-auto pr-1">
          {feedback.message}
        </div>

        {/* Optional Technical or Sub-detail Box */}
        {feedback.detail && (
          <div className="p-3 rounded-xl bg-surface-container-low border border-border/80 text-[11px] text-on-surface-variant font-mono break-all leading-normal">
            {feedback.detail}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleDismiss}
            className={`w-full py-3 px-5 rounded-full font-headline font-bold text-xs md:text-sm shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-98 ${currentCfg.btnClass}`}
          >
            <span>{feedback.actionText || 'Đóng'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackModal;
