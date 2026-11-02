const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface OverviewData {
  period: 'today' | '7days' | 'this_month' | 'custom';
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalPaidSessions: number;
  totalItemsSold: number;
  currentUsingTables: number;
  tableStatusCounts: {
    empty: number;
    ordered: number;
    seated: number;
    total: number;
  };
  longestWaitingTables: Array<{
    tableNumber: string;
    sessionId: string;
    totalQuantity: number;
    totalAmount: number;
    firstOrderAt: string;
    waitingMinutes: number;
  }>;
  revenueChartData: Array<{
    timeLabel: string;
    revenue: number;
  }>;
  topSellingDishes: Array<{
    name: string;
    quantity: number;
    revenue: number;
    image?: string;
  }>;
  recentPaidSessions: Array<{
    id: string;
    sessionId: string;
    tableNumber: string;
    confirmedAt: string;
    confirmedDate: string;
    totalAmount: number;
    confirmedBy: string;
  }>;
}

export interface HistoryOrderItem {
  itemId: string;
  dishId: string;
  name: string;
  sizeName: string;
  toppings: string[];
  notes: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentHistoryRecord {
  id: string;
  sessionId: string;
  tableNumber: string;
  area: string;
  status: 'ordered' | 'seated' | 'completed';
  firstOrderAt: string;
  confirmedAt: string;
  confirmedAtIso?: string;
  confirmedBy: string;
  completedAt: string | null;
  totalQuantity: number;
  totalAmount: number;
  itemSummary: string;
  items: HistoryOrderItem[];
}

export interface PaymentHistoryResponse {
  summary: {
    totalSessions: number;
    totalRevenue: number;
    totalItems: number;
  };
  filterOptions?: {
    tables: string[];
    staffMembers: string[];
  };
  data: PaymentHistoryRecord[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export const reportsApi = {
  async fetchOverview(period: string = 'today', startDate?: string, endDate?: string): Promise<OverviewData> {
    const params = new URLSearchParams({ period });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const res = await fetch(`${API_BASE_URL}/api/reports/overview?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Lỗi máy chủ: HTTP ${res.status}`);
    }
    return res.json();
  },

  async fetchPaymentHistory(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      tableNumber?: string;
      confirmedBy?: string;
      startDate?: string;
      endDate?: string;
    },
    signal?: AbortSignal,
  ): Promise<PaymentHistoryResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.tableNumber) q.set('tableNumber', params.tableNumber);
    if (params.confirmedBy) q.set('confirmedBy', params.confirmedBy);
    if (params.startDate) q.set('startDate', params.startDate);
    if (params.endDate) q.set('endDate', params.endDate);

    const res = await fetch(`${API_BASE_URL}/api/reports/payment-history?${q.toString()}`, { signal });
    if (!res.ok) {
      let errMsg = `Lỗi máy chủ: HTTP ${res.status}`;
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

  async fetchPaymentDetail(idOrSessionId: string): Promise<PaymentHistoryRecord> {
    const res = await fetch(`${API_BASE_URL}/api/reports/payment-history/${idOrSessionId}`);
    if (!res.ok) {
      let errMsg = `Lỗi máy chủ: HTTP ${res.status}`;
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

  async recordPayment(data: {
    sessionId: string;
    tableNumber: string;
    area?: string;
    firstOrderAt: string;
    confirmedAt?: string;
    confirmedBy?: string;
    staffId?: string;
    totalQuantity: number;
    totalAmount: number;
    items: unknown[];
  }): Promise<{ success: boolean; message: string; record?: unknown }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (data.staffId) {
      headers['x-staff-id'] = data.staffId;
    }

    const res = await fetch(`${API_BASE_URL}/api/reports/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errMsg = `Lỗi máy chủ (${res.status})`;
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
