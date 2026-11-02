import type { Dish, Category } from '../types/restaurant';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const dishesApi = {
  async fetchDishes(
    params?: {
      categoryId?: string;
      search?: string;
      onlyAvailable?: boolean;
      includeArchived?: boolean;
    },
    signal?: AbortSignal,
  ): Promise<Dish[]> {
    const q = new URLSearchParams();
    if (params?.categoryId && params.categoryId !== 'all') {
      q.set('categoryId', params.categoryId);
    }
    if (params?.search?.trim()) {
      q.set('search', params.search.trim());
    }
    if (params?.onlyAvailable) {
      q.set('onlyAvailable', 'true');
    }
    if (params?.includeArchived) {
      q.set('includeArchived', 'true');
    }

    const res = await fetch(`${API_BASE_URL}/api/dishes?${q.toString()}`, { signal });
    if (!res.ok) {
      throw new Error(`Không thể tải danh sách món ăn: HTTP ${res.status}`);
    }
    return res.json();
  },

  async fetchCategories(signal?: AbortSignal): Promise<Category[]> {
    const res = await fetch(`${API_BASE_URL}/api/dishes/categories`, { signal });
    if (!res.ok) {
      throw new Error(`Không thể tải danh mục món ăn: HTTP ${res.status}`);
    }
    return res.json();
  },

  async fetchDishDetail(id: string): Promise<Dish> {
    const res = await fetch(`${API_BASE_URL}/api/dishes/${id}`);
    if (!res.ok) {
      throw new Error(`Không thể tải chi tiết món ăn [${id}]: HTTP ${res.status}`);
    }
    return res.json();
  },

  async createDish(data: Partial<Dish>, staffId?: string): Promise<Dish> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (staffId) headers['x-staff-id'] = staffId;

    const res = await fetch(`${API_BASE_URL}/api/dishes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errMsg = `Lỗi thêm món (${res.status})`;
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

  async updateDish(id: string, data: Partial<Dish>, staffId?: string): Promise<Dish> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (staffId) headers['x-staff-id'] = staffId;

    const res = await fetch(`${API_BASE_URL}/api/dishes/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errMsg = `Lỗi cập nhật món (${res.status})`;
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

  async toggleDishStatus(id: string, staffId?: string): Promise<Dish> {
    const headers: Record<string, string> = {};
    if (staffId) headers['x-staff-id'] = staffId;

    const res = await fetch(`${API_BASE_URL}/api/dishes/${id}/status`, {
      method: 'PATCH',
      headers,
    });

    if (!res.ok) {
      let errMsg = `Lỗi đổi trạng thái món (${res.status})`;
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

  async deleteDish(id: string, staffId?: string): Promise<{ success: boolean; archived: boolean; message: string }> {
    const headers: Record<string, string> = {};
    if (staffId) headers['x-staff-id'] = staffId;

    const res = await fetch(`${API_BASE_URL}/api/dishes/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      let errMsg = `Lỗi xóa món (${res.status})`;
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
