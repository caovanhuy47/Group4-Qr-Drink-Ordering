import type { Staff } from '../types/restaurant';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function sanitizeStaffPayload(data: Partial<Staff> & { password?: string }, isCreate = false): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (isCreate && data.id && typeof data.id === 'string' && data.id.trim()) {
    payload.id = data.id.trim();
  }

  if (data.name !== undefined) {
    payload.name = typeof data.name === 'string' ? data.name.trim() : data.name;
  }

  if (data.username !== undefined) {
    payload.username = typeof data.username === 'string' ? data.username.trim().toLowerCase() : data.username;
  }

  if (data.password !== undefined && data.password.trim()) {
    payload.password = data.password.trim();
  }

  if (data.role !== undefined) {
    payload.role = data.role;
  }

  if (data.roleName !== undefined) {
    payload.roleName = data.roleName ? String(data.roleName).trim() : undefined;
  }

  if (data.phone !== undefined) {
    payload.phone = data.phone ? String(data.phone).trim() : undefined;
  }

  if (data.shift !== undefined) {
    payload.shift = data.shift ? String(data.shift).trim() : undefined;
  }

  if (data.status !== undefined) {
    payload.status = data.status === 'suspended' ? 'suspended' : 'active';
  }

  // Permissions
  if (data.canViewTables !== undefined) payload.canViewTables = Boolean(data.canViewTables);
  if (data.canCollectMoney !== undefined) payload.canCollectMoney = Boolean(data.canCollectMoney);
  if (data.canManageTables !== undefined) payload.canManageTables = Boolean(data.canManageTables);
  if (data.canViewOverview !== undefined) payload.canViewOverview = Boolean(data.canViewOverview);
  if (data.canViewHistory !== undefined) payload.canViewHistory = Boolean(data.canViewHistory);
  if (data.canManageMenu !== undefined) payload.canManageMenu = Boolean(data.canManageMenu);
  if (data.canManageBanners !== undefined) payload.canManageBanners = Boolean(data.canManageBanners);
  if (data.canManageStaff !== undefined) payload.canManageStaff = Boolean(data.canManageStaff);

  return payload;
}

export const staffApi = {
  async loginStaff(credentials: { username: string; password: string }): Promise<Staff> {
    const res = await fetch(`${API_BASE_URL}/api/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      let errMsg = `Đăng nhập không thành công (${res.status})`;
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

  async fetchStaffList(staffId?: string, signal?: AbortSignal): Promise<Staff[]> {
    const headers: Record<string, string> = {};
    if (staffId) headers['x-staff-id'] = staffId;

    const res = await fetch(`${API_BASE_URL}/api/staff`, { headers, signal });
    if (!res.ok) {
      throw new Error(`Không thể tải danh sách nhân viên: HTTP ${res.status}`);
    }
    return res.json();
  },

  async fetchStaffDetail(id: string, staffId?: string): Promise<Staff> {
    const headers: Record<string, string> = {};
    if (staffId) headers['x-staff-id'] = staffId;

    const res = await fetch(`${API_BASE_URL}/api/staff/${id}`, { headers });
    if (!res.ok) {
      throw new Error(`Không thể tải thông tin nhân viên [${id}]: HTTP ${res.status}`);
    }
    return res.json();
  },

  async createStaff(data: Partial<Staff> & { password: string }, staffId?: string): Promise<Staff> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (staffId) headers['x-staff-id'] = staffId;

    const payload = sanitizeStaffPayload(data, true);
    const res = await fetch(`${API_BASE_URL}/api/staff`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errMsg = `Lỗi tạo nhân viên (${res.status})`;
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

  async updateStaff(id: string, data: Partial<Staff> & { password?: string }, staffId?: string): Promise<Staff> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (staffId) headers['x-staff-id'] = staffId;

    const payload = sanitizeStaffPayload(data, false);
    const res = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errMsg = `Lỗi cập nhật nhân viên (${res.status})`;
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

  async updateProfile(id: string, data: { name?: string; phone?: string; shift?: string }, staffId?: string): Promise<Staff> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (staffId) headers['x-staff-id'] = staffId;

    const res = await fetch(`${API_BASE_URL}/api/staff/${id}/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errMsg = `Lỗi cập nhật hồ sơ (${res.status})`;
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

  async toggleStaffStatus(id: string, staffId?: string): Promise<Staff> {
    const headers: Record<string, string> = {};
    if (staffId) headers['x-staff-id'] = staffId;

    const res = await fetch(`${API_BASE_URL}/api/staff/${id}/status`, {
      method: 'PATCH',
      headers,
    });

    if (!res.ok) {
      let errMsg = `Lỗi đổi trạng thái nhân viên (${res.status})`;
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

  async resetStaffPassword(id: string, newPassword: string, staffId?: string): Promise<{ success: boolean; message: string }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (staffId) headers['x-staff-id'] = staffId;

    const res = await fetch(`${API_BASE_URL}/api/staff/${id}/reset-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ newPassword }),
    });

    if (!res.ok) {
      let errMsg = `Lỗi đặt lại mật khẩu (${res.status})`;
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
