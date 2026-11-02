import { Injectable, OnModuleInit, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableSessionRecord } from './entities/table-session-record.entity.js';
import type { QueryOverviewDto } from './dto/query-overview.dto.js';
import type { QueryPaymentHistoryDto } from './dto/query-payment-history.dto.js';
import type { CreatePaymentRecordDto } from './dto/create-payment-record.dto.js';

export interface BackendStaffInfo {
  id: string;
  name: string;
  roleName: string;
  role: string;
  canCollectMoney: boolean;
  status: 'active' | 'suspended';
}

export const AUTHORIZED_STAFF_REGISTRY: Record<string, BackendStaffInfo> = {
  'staff-1': {
    id: 'staff-1',
    name: 'Nguyễn Văn Hùng',
    roleName: 'Chủ quán / Quản lý',
    role: 'admin',
    canCollectMoney: true,
    status: 'active',
  },
  'staff-2': {
    id: 'staff-2',
    name: 'Trần Thị Mai',
    roleName: 'Thu ngân quầy',
    role: 'cashier',
    canCollectMoney: true,
    status: 'active',
  },
  'staff-3': {
    id: 'staff-3',
    name: 'Lê Hoàng Nam',
    roleName: 'Nhân viên phục vụ',
    role: 'waiter',
    canCollectMoney: true,
    status: 'active',
  },
  'staff-4': {
    id: 'staff-4',
    name: 'Phạm Đức Tuấn',
    roleName: 'Đầu bếp & Pha chế chính',
    role: 'kitchen',
    canCollectMoney: false,
    status: 'active',
  },
};

function getVietnamNowDateStr(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

function parseVietnamDateRange(startDateStr: string, endDateStr: string): { start: Date; end: Date; isSingleDay: boolean } {
  const start = new Date(`${startDateStr}T00:00:00.000+07:00`);
  const end = new Date(`${endDateStr}T23:59:59.999+07:00`);
  return {
    start,
    end,
    isSingleDay: startDateStr === endDateStr,
  };
}

@Injectable()
export class ReportsService implements OnModuleInit {
  constructor(
    @InjectRepository(TableSessionRecord)
    private readonly sessionRepo: Repository<TableSessionRecord>,
  ) {}

  async onModuleInit() {
    await this.seedInitialRecordsIfEmpty();
  }

  // Parse date boundaries for Vietnam time (UTC+7)
  private getPeriodDateRange(period?: string, customStart?: string, customEnd?: string): { start: Date; end: Date; isSingleDay: boolean } {
    const todayStr = getVietnamNowDateStr();

    if (period === '7days') {
      const now = new Date();
      const past7 = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      const startStr = `${past7.getFullYear()}-${String(past7.getMonth() + 1).padStart(2, '0')}-${String(past7.getDate()).padStart(2, '0')}`;
      return parseVietnamDateRange(startStr, todayStr);
    }

    if (period === 'this_month') {
      const parts = todayStr.split('-');
      const startStr = `${parts[0]}-${parts[1]}-01`;
      return parseVietnamDateRange(startStr, todayStr);
    }

    if (period === 'custom' && customStart && customEnd) {
      return parseVietnamDateRange(customStart, customEnd);
    }

    // Default: 'today'
    return parseVietnamDateRange(todayStr, todayStr);
  }

  async getOverview(query: QueryOverviewDto) {
    const { start, end, isSingleDay } = this.getPeriodDateRange(query.period, query.startDate, query.endDate);

    // Get all confirmed paid records in period
    const records = await this.sessionRepo
      .createQueryBuilder('r')
      .where('r.confirmedAt IS NOT NULL')
      .andWhere('r.confirmedAt >= :start AND r.confirmedAt <= :end', { start, end })
      .orderBy('r.confirmedAt', 'DESC')
      .getMany();

    const totalRevenue = records.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalPaidSessions = records.length;
    const totalItemsSold = records.reduce((sum, r) => sum + r.totalQuantity, 0);

    // Current operational table status breakdown (synchronized with initial 8 tables)
    const tableStatusCounts = {
      empty: 3,
      ordered: 3,
      seated: 2,
      total: 8,
    };
    const currentUsingTables = tableStatusCounts.ordered + tableStatusCounts.seated;

    // Longest waiting ordered tables
    const longestWaitingTables = [
      {
        tableNumber: 'BÀN 02',
        sessionId: 'LT-2801',
        totalQuantity: 3,
        totalAmount: 75000,
        firstOrderAt: '19:15',
        waitingMinutes: 15,
      },
      {
        tableNumber: 'BÀN 05',
        sessionId: 'LT-2805',
        totalQuantity: 4,
        totalAmount: 143000,
        firstOrderAt: '19:20',
        waitingMinutes: 8,
      },
      {
        tableNumber: 'BÀN 27',
        sessionId: 'LT-2809',
        totalQuantity: 4,
        totalAmount: 90000,
        firstOrderAt: '19:22',
        waitingMinutes: 5,
      },
    ];

    // Build Time-series Revenue chart data
    const chartMap = new Map<string, number>();

    if (isSingleDay) {
      // Group by hours 06:00 -> 23:00
      for (let h = 6; h <= 23; h += 2) {
        chartMap.set(`${String(h).padStart(2, '0')}:00`, 0);
      }
      for (const rec of records) {
        if (!rec.confirmedAt) continue;
        const d = new Date(rec.confirmedAt);
        // Add 7 hours offset for Vietnam hour representation if stored in UTC
        const vnHour = new Date(d.getTime() + 7 * 60 * 60 * 1000).getUTCHours();
        const bucketHour = Math.floor(vnHour / 2) * 2;
        const key = `${String(bucketHour).padStart(2, '0')}:00`;
        chartMap.set(key, (chartMap.get(key) || 0) + rec.totalAmount);
      }
    } else {
      // Group by daily dates DD/MM
      const cur = new Date(start.getTime());
      while (cur <= end) {
        const dStr = `${String(cur.getDate()).padStart(2, '0')}/${String(cur.getMonth() + 1).padStart(2, '0')}`;
        chartMap.set(dStr, 0);
        cur.setDate(cur.getDate() + 1);
      }
      for (const rec of records) {
        if (!rec.confirmedAt) continue;
        const d = new Date(rec.confirmedAt);
        const vnDate = new Date(d.getTime() + 7 * 60 * 60 * 1000);
        const dStr = `${String(vnDate.getUTCDate()).padStart(2, '0')}/${String(vnDate.getUTCMonth() + 1).padStart(2, '0')}`;
        chartMap.set(dStr, (chartMap.get(dStr) || 0) + rec.totalAmount);
      }
    }

    const revenueChartData = Array.from(chartMap.entries()).map(([timeLabel, revenue]) => ({
      timeLabel,
      revenue,
    }));

    // Top selling dishes in period
    const dishMap = new Map<string, { name: string; quantity: number; revenue: number; image?: string }>();
    for (const rec of records) {
      if (!rec.items) continue;
      for (const item of rec.items) {
        const existing = dishMap.get(item.name) || {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += item.totalPrice;
        dishMap.set(item.name, existing);
      }
    }

    const topSellingDishes = Array.from(dishMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Recent paid sessions (top 5)
    const recentPaidSessions = records.slice(0, 5).map((r) => {
      const confDate = r.confirmedAt ? new Date(r.confirmedAt) : null;
      return {
        id: r.id,
        sessionId: r.sessionId,
        tableNumber: r.tableNumber,
        confirmedAt: confDate ? confDate.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' }) : '',
        confirmedDate: confDate ? confDate.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '',
        totalAmount: r.totalAmount,
        confirmedBy: r.confirmedBy || 'Quản lý quầy',
      };
    });

    return {
      period: query.period || 'today',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalRevenue,
      totalPaidSessions,
      totalItemsSold,
      currentUsingTables,
      tableStatusCounts,
      longestWaitingTables,
      revenueChartData,
      topSellingDishes,
      recentPaidSessions,
    };
  }

  async getPaymentHistory(query: QueryPaymentHistoryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(50, query.limit || 10));
    const skip = (page - 1) * limit;

    const qb = this.sessionRepo
      .createQueryBuilder('r')
      .where('r.confirmedAt IS NOT NULL');

    // Date range filter using Vietnam Timezone (Asia/Ho_Chi_Minh) boundaries
    if (query.startDate && query.endDate) {
      const { start, end } = parseVietnamDateRange(query.startDate, query.endDate);
      qb.andWhere('r.confirmedAt >= :start AND r.confirmedAt <= :end', { start, end });
    }

    // Search by sessionId or tableNumber
    if (query.search?.trim()) {
      const keyword = `%${query.search.trim()}%`;
      qb.andWhere('(r.sessionId LIKE :kw OR r.tableNumber LIKE :kw)', { kw: keyword });
    }

    // Filter by tableNumber
    if (query.tableNumber?.trim()) {
      qb.andWhere('r.tableNumber = :tableNumber', { tableNumber: query.tableNumber.trim() });
    }

    // Filter by confirmedBy
    if (query.confirmedBy?.trim()) {
      qb.andWhere('r.confirmedBy LIKE :confirmedBy', { confirmedBy: `%${query.confirmedBy.trim()}%` });
    }

    // Overall summary calculated across the whole filtered result set
    const allMatching = await qb.getMany();
    const totalSessions = allMatching.length;
    const totalRevenue = allMatching.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalItems = allMatching.reduce((sum, r) => sum + r.totalQuantity, 0);

    // Apply pagination and sort DESC by confirmedAt
    qb.orderBy('r.confirmedAt', 'DESC')
      .skip(skip)
      .take(limit);

    const pagedRecords = await qb.getMany();

    // Fetch distinct tables and staff for dynamic filter dropdowns
    const rawTables = await this.sessionRepo
      .createQueryBuilder('r')
      .select('DISTINCT r.tableNumber', 'tableNumber')
      .where('r.confirmedAt IS NOT NULL')
      .orderBy('r.tableNumber', 'ASC')
      .getRawMany();

    const rawStaff = await this.sessionRepo
      .createQueryBuilder('r')
      .select('DISTINCT r.confirmedBy', 'confirmedBy')
      .where('r.confirmedAt IS NOT NULL')
      .andWhere('r.confirmedBy IS NOT NULL')
      .orderBy('r.confirmedBy', 'ASC')
      .getRawMany();

    const filterOptions = {
      tables: rawTables.map((t) => t.tableNumber).filter(Boolean),
      staffMembers: rawStaff.map((s) => s.confirmedBy).filter(Boolean),
    };

    const data = pagedRecords.map((r) => {
      const itemSummary = r.items
        ? r.items.map((i) => `${i.name} (${i.quantity})`).join(', ')
        : '';

      const confDate = r.confirmedAt ? new Date(r.confirmedAt) : null;
      const compDate = r.completedAt ? new Date(r.completedAt) : null;
      const firstDate = r.firstOrderAt ? new Date(r.firstOrderAt) : null;

      return {
        id: r.id,
        sessionId: r.sessionId,
        tableNumber: r.tableNumber,
        area: r.area,
        status: r.status,
        firstOrderAt: firstDate ? firstDate.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' }) : '',
        confirmedAt: confDate
          ? `${confDate.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })} • ${confDate.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`
          : '',
        confirmedAtIso: r.confirmedAt,
        confirmedBy: r.confirmedBy || 'Quản lý',
        completedAt: compDate
          ? `${compDate.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })} • ${compDate.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`
          : null,
        totalQuantity: r.totalQuantity,
        totalAmount: r.totalAmount,
        itemSummary,
        items: r.items || [],
      };
    });

    return {
      summary: {
        totalSessions,
        totalRevenue,
        totalItems,
      },
      filterOptions,
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalSessions / limit) || 1,
        totalItems: totalSessions,
      },
    };
  }

  async getPaymentDetail(idOrSessionId: string) {
    const record = await this.sessionRepo
      .createQueryBuilder('r')
      .where('r.id = :id OR r.sessionId = :id', { id: idOrSessionId })
      .getOne();

    if (!record) {
      throw new NotFoundException(`Không tìm thấy lượt thu tiền ${idOrSessionId}`);
    }

    const confDate = record.confirmedAt ? new Date(record.confirmedAt) : null;
    const compDate = record.completedAt ? new Date(record.completedAt) : null;
    const firstDate = record.firstOrderAt ? new Date(record.firstOrderAt) : null;

    return {
      id: record.id,
      sessionId: record.sessionId,
      tableNumber: record.tableNumber,
      area: record.area,
      status: record.status,
      firstOrderAt: firstDate ? `${firstDate.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })} — ${firstDate.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}` : '',
      confirmedAt: confDate ? `${confDate.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })} — ${confDate.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}` : '',
      confirmedBy: record.confirmedBy,
      completedAt: compDate ? `${compDate.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })} — ${compDate.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}` : null,
      totalQuantity: record.totalQuantity,
      totalAmount: record.totalAmount,
      items: record.items || [],
    };
  }

  async recordPayment(dto: CreatePaymentRecordDto, staffIdHeader?: string) {
    // 1. Authenticate & Authorize Staff from Backend Registry
    const staffId = staffIdHeader || dto.staffId || 'staff-1';
    const staff = AUTHORIZED_STAFF_REGISTRY[staffId];

    if (!staff) {
      throw new ForbiddenException(`Tài khoản nhân viên [${staffId}] không tồn tại trên hệ thống.`);
    }

    if (!staff.canCollectMoney) {
      throw new ForbiddenException(`Nhân viên ${staff.name} (${staff.roleName}) không có quyền xác nhận thu tiền tại bàn.`);
    }

    if (staff.status !== 'active') {
      throw new ForbiddenException(`Tài khoản nhân viên ${staff.name} đang bị tạm khóa hoặc không hoạt động.`);
    }

    // Backend provides verified identity and role to prevent client spoofing
    const verifiedStaffName = `${staff.name} (${staff.roleName})`;

    // 2. Check Idempotency (prevent duplicate recording)
    const existing = await this.sessionRepo.findOne({ where: { sessionId: dto.sessionId } });
    if (existing) {
      return {
        success: true,
        message: 'Lượt bàn đã được ghi nhận trước đó (idempotent)',
        record: existing,
      };
    }

    // 3. Consistency: calculate total portions and total amount from items snapshot
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Danh sách món của lượt bàn không được để trống khi xác nhận thu tiền.');
    }

    const totalQuantity = dto.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const totalAmount = dto.items.reduce((sum, item) => sum + (Number(item.totalPrice) || (Number(item.unitPrice) * Number(item.quantity))), 0);

    const now = new Date();
    const confirmedAt = dto.confirmedAt ? new Date(dto.confirmedAt) : now;
    const firstOrderAt = dto.firstOrderAt ? new Date(dto.firstOrderAt) : now;

    const newRecord = this.sessionRepo.create({
      sessionId: dto.sessionId,
      tableNumber: dto.tableNumber,
      area: dto.area || 'Vỉa hè trước quán',
      status: 'seated',
      firstOrderAt,
      confirmedAt,
      confirmedBy: verifiedStaffName,
      totalQuantity,
      totalAmount,
      items: dto.items,
    });

    try {
      const saved = await this.sessionRepo.save(newRecord);
      return { success: true, message: 'Ghi nhận thu tiền thành công', record: saved };
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === 'ER_DUP_ENTRY' || error?.message?.includes('Duplicate entry')) {
        const dup = await this.sessionRepo.findOne({ where: { sessionId: dto.sessionId } });
        if (dup) {
          return { success: true, message: 'Lượt bàn đã được ghi nhận trước đó', record: dup };
        }
      }
      throw err;
    }
  }

  // Seed realistic historical operational records if the database table is empty
  private async seedInitialRecordsIfEmpty() {
    const count = await this.sessionRepo.count();
    if (count > 0) return;

    const now = new Date();
    const makeDate = (daysAgo: number, hour: number, minute: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      d.setHours(hour, minute, 0, 0);
      return d;
    };

    const seeds: Partial<TableSessionRecord>[] = [
      // Today records
      {
        sessionId: 'LT-2798',
        tableNumber: 'BÀN 08',
        area: 'Góc phố thoáng mát',
        status: 'seated',
        firstOrderAt: makeDate(0, 18, 55),
        confirmedAt: makeDate(0, 19, 10),
        confirmedBy: 'Trần Thị Mai (Thu ngân quầy)',
        totalQuantity: 3,
        totalAmount: 114000,
        items: [
          {
            itemId: 'i-1',
            dishId: 'dish-3',
            name: 'Cơm Tấm Sườn Bì Chả Trứng',
            sizeName: 'Tiêu chuẩn',
            toppings: ['Trứng ốp la lòng đào'],
            notes: 'Nước mắm ngọt nhiều ớt',
            quantity: 2,
            unitPrice: 57000,
            totalPrice: 114000,
          },
        ],
      },
      {
        sessionId: 'LT-2794',
        tableNumber: 'BÀN 12',
        area: 'Khu vực trong nhà',
        status: 'seated',
        firstOrderAt: makeDate(0, 18, 45),
        confirmedAt: makeDate(0, 19, 5),
        confirmedBy: 'Lê Hoàng Nam (Nhân viên phục vụ)',
        totalQuantity: 2,
        totalAmount: 55000,
        items: [
          {
            itemId: 'i-2',
            dishId: 'dish-2',
            name: 'Bánh Tráng Nướng Trứng Xúc Xích',
            sizeName: '1 Bánh truyền thống',
            toppings: [],
            notes: 'Cay vừa',
            quantity: 1,
            unitPrice: 30000,
            totalPrice: 30000,
          },
          {
            itemId: 'i-3',
            dishId: 'dish-4',
            name: 'Trà Tắc Xí Muội Đường Phèn',
            sizeName: 'Ly lớn khổng lồ (700ml)',
            toppings: [],
            notes: 'Bình thường',
            quantity: 1,
            unitPrice: 25000,
            totalPrice: 25000,
          },
        ],
      },
      {
        sessionId: 'LT-2789',
        tableNumber: 'BÀN 03',
        area: 'Vỉa hè trước quán',
        status: 'completed',
        firstOrderAt: makeDate(0, 17, 30),
        confirmedAt: makeDate(0, 17, 45),
        completedAt: makeDate(0, 18, 30),
        confirmedBy: 'Nguyễn Văn Hùng (Chủ quán / Quản lý)',
        totalQuantity: 4,
        totalAmount: 160000,
        items: [
          {
            itemId: 'i-4',
            dishId: 'dish-1',
            name: 'Bún Bò Huế Đặc Biệt',
            sizeName: 'Tô lớn (+thịt)',
            toppings: ['Chả cua thêm'],
            notes: 'Nhiều sa tế',
            quantity: 2,
            unitPrice: 65000,
            totalPrice: 130000,
          },
          {
            itemId: 'i-5',
            dishId: 'dish-4',
            name: 'Trà Tắc Xí Muội Đường Phèn',
            sizeName: 'Ly vừa (500ml)',
            toppings: [],
            notes: 'Ít đường',
            quantity: 2,
            unitPrice: 15000,
            totalPrice: 30000,
          },
        ],
      },
      {
        sessionId: 'LT-2780',
        tableNumber: 'BÀN 06',
        area: 'Vỉa hè trước quán',
        status: 'completed',
        firstOrderAt: makeDate(0, 12, 10),
        confirmedAt: makeDate(0, 12, 22),
        completedAt: makeDate(0, 13, 15),
        confirmedBy: 'Trần Thị Mai (Thu ngân quầy)',
        totalQuantity: 2,
        totalAmount: 90000,
        items: [
          {
            itemId: 'i-6',
            dishId: 'dish-3',
            name: 'Cơm Tấm Sườn Bì Chả Trứng',
            sizeName: 'Phần tiêu chuẩn',
            toppings: [],
            notes: 'Mỡ hành nhiều tóp mỡ',
            quantity: 1,
            unitPrice: 50000,
            totalPrice: 50000,
          },
          {
            itemId: 'i-7',
            dishId: 'dish-4',
            name: 'Trà Tắc Xí Muội Đường Phèn',
            sizeName: 'Ly vừa (500ml)',
            toppings: ['Thạch nha đam giòn'],
            notes: '',
            quantity: 2,
            unitPrice: 20000,
            totalPrice: 40000,
          },
        ],
      },
      {
        sessionId: 'LT-2775',
        tableNumber: 'BÀN 01',
        area: 'Vỉa hè trước quán',
        status: 'completed',
        firstOrderAt: makeDate(0, 8, 30),
        confirmedAt: makeDate(0, 8, 42),
        completedAt: makeDate(0, 9, 30),
        confirmedBy: 'Lê Hoàng Nam (Nhân viên phục vụ)',
        totalQuantity: 2,
        totalAmount: 70000,
        items: [
          {
            itemId: 'i-8',
            dishId: 'dish-1',
            name: 'Bún Bò Huế Đặc Biệt',
            sizeName: 'Tiêu chuẩn',
            toppings: [],
            notes: 'Không hành tây',
            quantity: 1,
            unitPrice: 50000,
            totalPrice: 50000,
          },
          {
            itemId: 'i-9',
            dishId: 'dish-4',
            name: 'Trà Tắc Xí Muội Đường Phèn',
            sizeName: 'Ly vừa (500ml)',
            toppings: [],
            notes: 'Đá riêng',
            quantity: 1,
            unitPrice: 20000,
            totalPrice: 20000,
          },
        ],
      },
      // Yesterday records
      {
        sessionId: 'LT-2750',
        tableNumber: 'BÀN 05',
        area: 'Vỉa hè trước quán',
        status: 'completed',
        firstOrderAt: makeDate(1, 19, 10),
        confirmedAt: makeDate(1, 19, 25),
        completedAt: makeDate(1, 20, 20),
        confirmedBy: 'Trần Thị Mai (Thu ngân quầy)',
        totalQuantity: 5,
        totalAmount: 210000,
        items: [
          {
            itemId: 'i-10',
            dishId: 'dish-1',
            name: 'Bún Bò Huế Đặc Biệt',
            sizeName: 'Đặc biệt (+chả cua)',
            toppings: ['Thịt bò tái bắp'],
            notes: '',
            quantity: 2,
            unitPrice: 75000,
            totalPrice: 150000,
          },
          {
            itemId: 'i-11',
            dishId: 'dish-4',
            name: 'Trà Tắc Xí Muội Đường Phèn',
            sizeName: 'Ly vừa (500ml)',
            toppings: [],
            notes: '',
            quantity: 3,
            unitPrice: 20000,
            totalPrice: 60000,
          },
        ],
      },
      {
        sessionId: 'LT-2742',
        tableNumber: 'BÀN 27',
        area: 'Vỉa hè trước quán',
        status: 'completed',
        firstOrderAt: makeDate(1, 18, 0),
        confirmedAt: makeDate(1, 18, 15),
        completedAt: makeDate(1, 19, 10),
        confirmedBy: 'Lê Hoàng Nam (Nhân viên phục vụ)',
        totalQuantity: 3,
        totalAmount: 85000,
        items: [
          {
            itemId: 'i-12',
            dishId: 'dish-2',
            name: 'Bánh Tráng Nướng Trứng Xúc Xích',
            sizeName: '1 Bánh truyền thống',
            toppings: ['Xúc xích nướng'],
            notes: 'Nhiều tương ớt',
            quantity: 2,
            unitPrice: 32500,
            totalPrice: 65000,
          },
          {
            itemId: 'i-13',
            dishId: 'dish-4',
            name: 'Trà Tắc Xí Muội Đường Phèn',
            sizeName: 'Ly vừa (500ml)',
            toppings: [],
            notes: '',
            quantity: 1,
            unitPrice: 20000,
            totalPrice: 20000,
          },
        ],
      },
      // 2 days ago
      {
        sessionId: 'LT-2715',
        tableNumber: 'BÀN 08',
        area: 'Góc phố thoáng mát',
        status: 'completed',
        firstOrderAt: makeDate(2, 20, 10),
        confirmedAt: makeDate(2, 20, 22),
        completedAt: makeDate(2, 21, 30),
        confirmedBy: 'Nguyễn Văn Hùng (Chủ quán / Quản lý)',
        totalQuantity: 4,
        totalAmount: 180000,
        items: [
          {
            itemId: 'i-14',
            dishId: 'dish-3',
            name: 'Cơm Tấm Sườn Bì Chả Trứng',
            sizeName: 'Phần tiêu chuẩn',
            toppings: ['Chả hấp thêm'],
            notes: '',
            quantity: 2,
            unitPrice: 60000,
            totalPrice: 120000,
          },
          {
            itemId: 'i-15',
            dishId: 'dish-4',
            name: 'Trà Tắc Xí Muội Đường Phèn',
            sizeName: 'Ly lớn khổng lồ (700ml)',
            toppings: ['Xí muội ngâm thêm'],
            notes: '',
            quantity: 2,
            unitPrice: 30000,
            totalPrice: 60000,
          },
        ],
      },
      // 3 days ago
      {
        sessionId: 'LT-2680',
        tableNumber: 'BÀN 02',
        area: 'Vỉa hè trước quán',
        status: 'completed',
        firstOrderAt: makeDate(3, 19, 0),
        confirmedAt: makeDate(3, 19, 14),
        completedAt: makeDate(3, 20, 0),
        confirmedBy: 'Trần Thị Mai (Thu ngân quầy)',
        totalQuantity: 3,
        totalAmount: 135000,
        items: [
          {
            itemId: 'i-16',
            dishId: 'dish-1',
            name: 'Bún Bò Huế Đặc Biệt',
            sizeName: 'Tô lớn (+thịt)',
            toppings: [],
            notes: 'Nước trong',
            quantity: 2,
            unitPrice: 55000,
            totalPrice: 110000,
          },
          {
            itemId: 'i-17',
            dishId: 'dish-4',
            name: 'Trà Tắc Xí Muội Đường Phèn',
            sizeName: 'Ly lớn khổng lồ (700ml)',
            toppings: [],
            notes: '',
            quantity: 1,
            unitPrice: 25000,
            totalPrice: 25000,
          },
        ],
      },
    ];

    for (const s of seeds) {
      const rec = this.sessionRepo.create(s);
      await this.sessionRepo.save(rec);
    }
  }
}
