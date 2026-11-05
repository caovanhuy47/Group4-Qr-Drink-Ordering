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
    if (staffId) {
      headers['x-staff-id'] = staffId;
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

