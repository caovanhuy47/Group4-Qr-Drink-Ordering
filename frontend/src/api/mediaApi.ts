export interface UploadMediaResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export const mediaApi = {
  async uploadImage(
    file: File,
    folder: 'dishes' | 'banners' = 'dishes',
    staffId?: string,
  ): Promise<UploadMediaResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    let effectiveStaffId = staffId;
    if (!effectiveStaffId && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('huycv_staff_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          effectiveStaffId = parsed?.id;
        }
      } catch {}
    }
    if (effectiveStaffId) {
      headers['x-staff-id'] = effectiveStaffId;
    }

    const response = await fetch(`/api/media/upload?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tải ảnh lên máy chủ');
    }

    return data;
  },
};

