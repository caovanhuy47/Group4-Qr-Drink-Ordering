import type { Banner } from '../types/restaurant';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function sanitizeBannerPayload(data: Partial<Banner>, isCreate = false): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (isCreate && data.id && typeof data.id === 'string' && data.id.trim()) {
    payload.id = data.id.trim();
  }

  if (data.adminName !== undefined) {
    payload.adminName = typeof data.adminName === 'string' ? data.adminName.trim() : data.adminName;
  }

  if (data.title !== undefined) {
    payload.title = typeof data.title === 'string' ? data.title.trim() : data.title;
  }

  if (data.description !== undefined) {
    payload.description = data.description ? String(data.description).trim() : '';
  }

  if (data.tag !== undefined) {
    payload.tag = data.tag ? String(data.tag).trim() : '';
  }

  if (data.discountBadge !== undefined) {
    payload.discountBadge = data.discountBadge ? String(data.discountBadge).trim() : '';
  }

  if (data.priceNote !== undefined) {
    payload.priceNote = data.priceNote ? String(data.priceNote).trim() : '';
  }

  if (data.ctaText !== undefined) {
    payload.ctaText = data.ctaText ? String(data.ctaText).trim() : 'Khám phá ngay';
  }

  if (data.bgGradient !== undefined) {
    payload.bgGradient = data.bgGradient ? String(data.bgGradient).trim() : 'from-primary via-primary-container to-secondary-container';
  }

  if (data.imageUrl !== undefined) {
    payload.imageUrl = data.imageUrl ? String(data.imageUrl).trim() : '';
  }

  if (data.mobileImageUrl !== undefined) {
    payload.mobileImageUrl = data.mobileImageUrl ? String(data.mobileImageUrl).trim() : '';
  }

  if (data.linkType !== undefined) {
    payload.linkType = data.linkType;
  }

  if (data.linkTargetId !== undefined) {
    payload.linkTargetId = data.linkTargetId ? String(data.linkTargetId).trim() : '';
  }

  if (data.displayOrder !== undefined) {
    payload.displayOrder = Math.max(0, Math.floor(Number(data.displayOrder) || 0));
  }

  if (data.isActive !== undefined) {
    payload.isActive = Boolean(data.isActive);
  }

  return payload;
}

export const bannersApi = {
  async fetchBanners(includeInactive = false, signal?: AbortSignal): Promise<Banner[]> {
    const q = includeInactive ? '?includeInactive=true' : '';
    const res = await fetch(`${API_BASE_URL}/api/banners${q}`, { signal });
    if (!res.ok) {
      throw new Error(`Không thể tải danh sách banner: HTTP ${res.status}`);
    }
    return res.json();
  },

  async fetchBannerDetail(id: string): Promise<Banner> {
    const res = await fetch(`${API_BASE_URL}/api/banners/${id}`);
    if (!res.ok) {
      throw new Error(`Không thể tải chi tiết banner [${id}]: HTTP ${res.status}`);
    }
    return res.json();
  },

  async createBanner(data: Partial<Banner>, staffId?: string): Promise<Banner> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (staffId) headers['x-staff-id'] = staffId;

    const payload = sanitizeBannerPayload(data, true);
    const res = await fetch(`${API_BASE_URL}/api/banners`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errMsg = `Lỗi thêm banner (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.message) {
          errMsg = Array.isArray(errJson.message) ? errJson.message.join(', ') : errJson.message;
        }
      } catch {}
      throw new Error(errMsg);
    }

    return res.json();
  },

  async updateBanner(id: string, data: Partial<Banner>, staffId?: string): Promise<Banner> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (staffId) headers['x-staff-id'] = staffId;

    const payload = sanitizeBannerPayload(data, false);
    const res = await fetch(`${API_BASE_URL}/api/banners/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errMsg = `Lỗi cập nhật banner (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.message) {
          errMsg = Array.isArray(errJson.message) ? errJson.message.join(', ') : errJson.message;
        }
      } catch {}
      throw new Error(errMsg);
    }

    return res.json();
  },

  async toggleBannerStatus(id: string, staffId?: string): Promise<Banner> {
    const headers: Record<string, string> = {};
    if (staffId) headers['x-staff-id'] = staffId;

    const res = await fetch(`${API_BASE_URL}/api/banners/${id}/status`, {
      method: 'PATCH',
      headers,
    });

    if (!res.ok) {
      let errMsg = `Lỗi đổi trạng thái banner (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.message) {
          errMsg = Array.isArray(errJson.message) ? errJson.message.join(', ') : errJson.message;
        }
      } catch {}
      throw new Error(errMsg);
    }

    return res.json();
  },

  async reorderBanners(
    items: { id: string; displayOrder: number }[],
    staffId?: string,
  ): Promise<{ success: boolean; message: string }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (staffId) headers['x-staff-id'] = staffId;

    const res = await fetch(`${API_BASE_URL}/api/banners/reorder`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      let errMsg = `Lỗi sắp xếp banner (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.message) {
          errMsg = Array.isArray(errJson.message) ? errJson.message.join(', ') : errJson.message;
        }
      } catch {}
      throw new Error(errMsg);
    }

    return res.json();
  },

  async deleteBanner(id: string, staffId?: string): Promise<{ success: boolean; message: string }> {
    const headers: Record<string, string> = {};
    if (staffId) headers['x-staff-id'] = staffId;

    const res = await fetch(`${API_BASE_URL}/api/banners/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      let errMsg = `Lỗi xóa banner (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.message) {
          errMsg = Array.isArray(errJson.message) ? errJson.message.join(', ') : errJson.message;
        }
      } catch {}
      throw new Error(errMsg);
    }

    return res.json();
  },
};
