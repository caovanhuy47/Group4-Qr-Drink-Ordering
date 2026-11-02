import React from 'react';
import type { TableOperationalStatus } from '../../types/restaurant';

export type TableStatus = TableOperationalStatus;

interface TableStatusBadgeProps {
  status: TableStatus;
  variant?: 'compact' | 'full';
  className?: string;
}

export const TableStatusIcon: React.FC<{ status: TableStatus; size?: 'sm' | 'md' | 'lg' }> = ({
  status,
  size = 'md',
}) => {
  const iconSizeClass = size === 'sm' ? 'text-[14px]' : size === 'lg' ? 'text-[22px]' : 'text-[17px]';
  const subIconSizeClass = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-[12px]' : 'text-[10px]';

  if (status === 'ordered') {
    return (
      <span className="relative inline-flex items-center justify-center shrink-0" aria-hidden="true">
        <span className={`material-symbols-outlined ${iconSizeClass} text-primary`}>
          receipt_long
        </span>
        <span
          className={`material-symbols-outlined ${subIconSizeClass} text-emerald-600 absolute -bottom-1 -right-1 font-black bg-surface-container-lowest rounded-full ring-1 ring-surface-container-lowest`}
        >
          check_circle
        </span>
      </span>
    );
  }

  if (status === 'seated') {
    return (
      <span className={`material-symbols-outlined ${iconSizeClass} text-tertiary shrink-0`} aria-hidden="true">
        groups
      </span>
    );
  }

  // status === 'empty'
  return (
    <span className={`material-symbols-outlined ${iconSizeClass} text-on-surface-variant shrink-0`} aria-hidden="true">
      chair_alt
    </span>
  );
};

export const TableStatusBadge: React.FC<TableStatusBadgeProps> = ({
  status,
  variant = 'compact',
  className = '',
}) => {
  if (status === 'ordered') {
    if (variant === 'compact') {
      return (
        <div
          title="Order thành công (đã ghi nhận món, chưa thu tiền)"
          aria-label="Order thành công"
          className={`inline-flex items-center justify-center w-8 h-8 rounded-xl bg-primary-soft/90 border border-primary/30 text-primary shadow-xs shrink-0 transition-transform hover:scale-105 ${className}`}
        >
          <TableStatusIcon status="ordered" size="md" />
        </div>
      );
    }

    return (
      <span
        title="Order thành công (đã ghi nhận món, chưa thu tiền)"
        aria-label="Order thành công"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/25 shrink-0 ${className}`}
      >
        <TableStatusIcon status="ordered" size="sm" />
        <span className="whitespace-nowrap">Order thành công</span>
      </span>
    );
  }

  if (status === 'seated') {
    if (variant === 'compact') {
      return (
        <div
          title="Bàn đang ngồi (đã phục vụ và thu tiền)"
          aria-label="Bàn đang ngồi"
          className={`inline-flex items-center justify-center w-8 h-8 rounded-xl bg-tertiary-soft/90 border border-tertiary/30 text-tertiary shadow-xs shrink-0 transition-transform hover:scale-105 ${className}`}
        >
          <TableStatusIcon status="seated" size="md" />
        </div>
      );
    }

    return (
      <span
        title="Bàn đang ngồi (đã phục vụ và thu tiền)"
        aria-label="Bàn đang ngồi"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-soft text-tertiary text-xs font-bold border border-tertiary/25 shrink-0 ${className}`}
      >
        <TableStatusIcon status="seated" size="sm" />
        <span className="whitespace-nowrap">Đang ngồi</span>
      </span>
    );
  }

  // status === 'empty'
  if (variant === 'compact') {
    return (
      <div
        title="Bàn trống (sẵn sàng đón khách)"
        aria-label="Bàn trống"
        className={`inline-flex items-center justify-center w-8 h-8 rounded-xl bg-surface-container border border-border text-on-surface-variant shadow-xs shrink-0 transition-transform hover:scale-105 ${className}`}
      >
        <TableStatusIcon status="empty" size="md" />
      </div>
    );
  }

  return (
    <span
      title="Bàn trống (sẵn sàng đón khách)"
      aria-label="Bàn trống"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold border border-border shrink-0 ${className}`}
    >
      <TableStatusIcon status="empty" size="sm" />
      <span className="whitespace-nowrap">Trống</span>
    </span>
  );
};
