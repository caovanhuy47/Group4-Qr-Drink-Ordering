import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import crypto from 'node:crypto';
import { Staff } from './entities/staff.entity.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import { UpdateStaffDto, UpdateProfileDto } from './dto/update-staff.dto.js';
import { LoginStaffDto } from './dto/login-staff.dto.js';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  // For backwards compatibility with plain PINs in demo environment
  if (storedHash === password || (storedHash === '1234' && password === '1234')) return true;
  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    return storedHash === password;
  }
  const [salt, hash] = parts;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

export type SafeStaff = Omit<Staff, 'passwordHash'>;

function sanitizeStaff(staff: Staff): SafeStaff {
  const { passwordHash: _hash, ...safe } = staff;
  return safe;
}

@Injectable()
export class StaffService implements OnModuleInit {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {}

  async onModuleInit() {
    await this.seedInitialStaffIfEmpty();
  }

  private async seedInitialStaffIfEmpty() {
    const count = await this.staffRepo.count();
    if (count > 0) return;

    const initialStaff: Partial<Staff>[] = [
      {
        id: 'staff-1',
        name: 'Nguyễn Văn Hùng',
        username: 'hungnv',
        passwordHash: hashPassword('1234'),
        role: 'admin',
        roleName: 'Chủ quán / Quản lý',
        phone: '0912 345 678',
        shift: 'Toàn thời gian (08:00 - 23:00)',
        status: 'active',
        canViewTables: true,
        canCollectMoney: true,
        canManageTables: true,
        canViewOverview: true,
        canViewHistory: true,
        canManageMenu: true,
        canManageBanners: true,
        canManageStaff: true,
      },
      {
        id: 'staff-2',
        name: 'Trần Thị Mai',
        username: 'maitt',
        passwordHash: hashPassword('1234'),
        role: 'cashier',
        roleName: 'Thu ngân quầy',
        phone: '0988 765 432',
        shift: 'Ca Chiều - Tối (15:00 - 23:00)',
        status: 'active',
        canViewTables: true,
        canCollectMoney: true,
        canManageTables: true,
        canViewOverview: false,
        canViewHistory: true,
        canManageMenu: true,
        canManageBanners: false,
        canManageStaff: false,
      },
      {
        id: 'staff-3',
        name: 'Lê Hoàng Nam',
        username: 'namlh',
        passwordHash: hashPassword('1234'),
        role: 'waiter',
        roleName: 'Nhân viên phục vụ',
        phone: '0933 112 233',
        shift: 'Ca Tối (17:00 - 23:30)',
        status: 'active',
        canViewTables: true,
        canCollectMoney: true,
        canManageTables: false,
        canViewOverview: false,
        canViewHistory: false,
        canManageMenu: false,
        canManageBanners: false,
        canManageStaff: false,
      },
      {
        id: 'staff-4',
        name: 'Phạm Đức Tuấn',
        username: 'tuanpd',
        passwordHash: hashPassword('1234'),
        role: 'kitchen',
        roleName: 'Đầu bếp & Pha chế chính',
        phone: '0977 445 566',
        shift: 'Ca Chiều (15:00 - 23:00)',
        status: 'active',
        canViewTables: true,
        canCollectMoney: false,
        canManageTables: false,
        canViewOverview: false,
        canViewHistory: false,
        canManageMenu: false,
        canManageBanners: false,
        canManageStaff: false,
      },
    ];

    await this.staffRepo.save(initialStaff as Staff[]);
  }

  /**
   * Helper kiểm tra tài khoản và quyền hạn thực tế từ MySQL.
   * Dùng chung cho tất cả các service (Dishes, Banners, Reports, Staff).
   */
  async verifyStaffPermission(staffIdHeader?: string, requiredPermission?: keyof Staff): Promise<Staff> {
    if (!staffIdHeader) {
      throw new ForbiddenException('Yêu cầu định danh tài khoản nhân viên (thiếu x-staff-id).');
    }
    const staffId = staffIdHeader;
    const staff = await this.staffRepo.findOne({ where: { id: staffId } });

    if (!staff) {
      throw new ForbiddenException(`Tài khoản nhân viên [${staffId}] không tồn tại trên hệ thống.`);
    }

    if (staff.status === 'suspended') {
      throw new ForbiddenException(`Tài khoản ${staff.name} đang bị tạm khóa hoặc không hoạt động.`);
    }

    if (requiredPermission && !staff[requiredPermission]) {
      throw new ForbiddenException(`Nhân viên ${staff.name} (${staff.roleName}) không có quyền thực hiện thao tác này.`);
    }

    return staff;
  }

  async login(dto: LoginStaffDto): Promise<SafeStaff> {
    const cleanUsername = dto.username.trim().toLowerCase();
    const cleanPassword = dto.password.trim();

    const staff = await this.staffRepo.findOne({
      where: [{ username: cleanUsername }, { id: cleanUsername }],
    });

    if (!staff || !verifyPassword(cleanPassword, staff.passwordHash)) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác.');
    }

    if (staff.status === 'suspended') {
      throw new ForbiddenException('Tài khoản của bạn đang bị tạm khóa. Vui lòng liên hệ Quản lý.');
    }

    return sanitizeStaff(staff);
  }

  async findAll(requesterId?: string): Promise<SafeStaff[]> {
    // Check requester exists and is active
    await this.verifyStaffPermission(requesterId);
    const staffList = await this.staffRepo.find({ order: { role: 'ASC', createdAt: 'ASC' } });
    return staffList.map(sanitizeStaff);
  }

  async findOne(id: string, requesterId?: string): Promise<SafeStaff> {
    await this.verifyStaffPermission(requesterId);
    const staff = await this.staffRepo.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException(`Không tìm thấy nhân viên với mã [${id}]`);
    }
    return sanitizeStaff(staff);
  }

  async create(dto: CreateStaffDto, requesterId?: string): Promise<SafeStaff> {
    // Only staff with canManageStaff can create accounts
    await this.verifyStaffPermission(requesterId, 'canManageStaff');

    const cleanUsername = dto.username.trim().toLowerCase();
    const cleanName = dto.name.trim();

    if (!cleanUsername) {
      throw new BadRequestException('Tên đăng nhập không được để trống');
    }
    if (!cleanName) {
      throw new BadRequestException('Họ và tên nhân viên không được để trống');
    }

    // Check duplicate username
    const existing = await this.staffRepo.findOne({ where: { username: cleanUsername } });
    if (existing) {
      throw new BadRequestException(`Tên đăng nhập "${cleanUsername}" đã được sử dụng.`);
    }

    const staffId = dto.id?.trim() || `staff-${Date.now()}`;
    const role = dto.role || 'waiter';

    const roleNameMap: Record<string, string> = {
      admin: 'Chủ quán / Quản lý',
      cashier: 'Thu ngân quầy',
      waiter: 'Nhân viên phục vụ',
      kitchen: 'Đầu bếp & Pha chế chính',
    };

    const newStaff = this.staffRepo.create({
      id: staffId,
      name: cleanName,
      username: cleanUsername,
      passwordHash: hashPassword(dto.password),
      role,
      roleName: dto.roleName?.trim() || roleNameMap[role] || 'Nhân viên',
      phone: dto.phone?.trim() || null,
      shift: dto.shift?.trim() || 'Ca Tối (17:00 - 23:00)',
      status: dto.status || 'active',
      canViewTables: dto.canViewTables ?? true,
      canCollectMoney: dto.canCollectMoney ?? (role === 'admin' || role === 'cashier'),
      canManageTables: dto.canManageTables ?? (role === 'admin' || role === 'cashier'),
      canViewOverview: dto.canViewOverview ?? (role === 'admin'),
      canViewHistory: dto.canViewHistory ?? (role === 'admin' || role === 'cashier'),
      canManageMenu: dto.canManageMenu ?? (role === 'admin'),
      canManageBanners: dto.canManageBanners ?? (role === 'admin'),
      canManageStaff: dto.canManageStaff ?? (role === 'admin'),
    });

    const saved = await this.staffRepo.save(newStaff);
    return sanitizeStaff(saved);
  }

  async update(id: string, dto: UpdateStaffDto, requesterId?: string): Promise<SafeStaff> {
    // Only staff with canManageStaff can update other staff / permissions
    const requester = await this.verifyStaffPermission(requesterId, 'canManageStaff');

    const targetStaff = await this.staffRepo.findOne({ where: { id } });
    if (!targetStaff) {
      throw new NotFoundException(`Không tìm thấy nhân viên [${id}]`);
    }

    // Protection rule: Cannot lock or revoke admin of the last active admin!
    if (targetStaff.role === 'admin' && (dto.status === 'suspended' || dto.role !== undefined && dto.role !== 'admin' || dto.canManageStaff === false)) {
      const activeAdminCount = await this.staffRepo.count({
        where: { role: 'admin', status: 'active', canManageStaff: true },
      });
      if (activeAdminCount <= 1) {
        throw new BadRequestException('Không thể khóa hoặc hạ quyền của Quản trị viên (Admin) đang hoạt động cuối cùng trên hệ thống.');
      }
    }

    if (dto.name !== undefined) {
      const clean = dto.name.trim();
      if (!clean) throw new BadRequestException('Họ và tên không được để trống');
      targetStaff.name = clean;
    }

    if (dto.phone !== undefined) {
      targetStaff.phone = dto.phone ? dto.phone.trim() : null;
    }

    if (dto.shift !== undefined) {
      targetStaff.shift = dto.shift.trim();
    }

    if (dto.role !== undefined) {
      targetStaff.role = dto.role;
      const roleNameMap: Record<string, string> = {
        admin: 'Chủ quán / Quản lý',
        cashier: 'Thu ngân quầy',
        waiter: 'Nhân viên phục vụ',
        kitchen: 'Đầu bếp & Pha chế chính',
      };
      targetStaff.roleName = dto.roleName?.trim() || roleNameMap[dto.role] || targetStaff.roleName;
    }

    if (dto.status !== undefined) {
      targetStaff.status = dto.status;
    }

    if (dto.password && dto.password.trim()) {
      targetStaff.passwordHash = hashPassword(dto.password.trim());
    }

    // Permissions
    if (dto.canViewTables !== undefined) targetStaff.canViewTables = Boolean(dto.canViewTables);
    if (dto.canCollectMoney !== undefined) targetStaff.canCollectMoney = Boolean(dto.canCollectMoney);
    if (dto.canManageTables !== undefined) targetStaff.canManageTables = Boolean(dto.canManageTables);
    if (dto.canViewOverview !== undefined) targetStaff.canViewOverview = Boolean(dto.canViewOverview);
    if (dto.canViewHistory !== undefined) targetStaff.canViewHistory = Boolean(dto.canViewHistory);
    if (dto.canManageMenu !== undefined) targetStaff.canManageMenu = Boolean(dto.canManageMenu);
    if (dto.canManageBanners !== undefined) targetStaff.canManageBanners = Boolean(dto.canManageBanners);
    if (dto.canManageStaff !== undefined) targetStaff.canManageStaff = Boolean(dto.canManageStaff);

    const saved = await this.staffRepo.save(targetStaff);
    return sanitizeStaff(saved);
  }

  async updateProfile(id: string, dto: UpdateProfileDto, requesterId?: string): Promise<SafeStaff> {
    const requester = await this.verifyStaffPermission(requesterId);

    // Can only edit own profile unless requester is Admin
    if (requester.id !== id && !requester.canManageStaff) {
      throw new ForbiddenException('Bạn chỉ có thể chỉnh sửa hồ sơ của chính mình.');
    }

    const targetStaff = await this.staffRepo.findOne({ where: { id } });
    if (!targetStaff) {
      throw new NotFoundException(`Không tìm thấy nhân viên [${id}]`);
    }

    if (dto.name !== undefined) {
      const clean = dto.name.trim();
      if (!clean) throw new BadRequestException('Họ và tên không được để trống');
      targetStaff.name = clean;
    }

    if (dto.phone !== undefined) {
      targetStaff.phone = dto.phone ? dto.phone.trim() : null;
    }

    if (dto.shift !== undefined) {
      targetStaff.shift = dto.shift.trim();
    }

    const saved = await this.staffRepo.save(targetStaff);
    return sanitizeStaff(saved);
  }

  async toggleStatus(id: string, requesterId?: string): Promise<SafeStaff> {
    await this.verifyStaffPermission(requesterId, 'canManageStaff');

    const targetStaff = await this.staffRepo.findOne({ where: { id } });
    if (!targetStaff) {
      throw new NotFoundException(`Không tìm thấy nhân viên [${id}]`);
    }

    const newStatus = targetStaff.status === 'active' ? 'suspended' : 'active';

    // Protection rule: cannot suspend last active admin
    if (targetStaff.role === 'admin' && newStatus === 'suspended') {
      const activeAdminCount = await this.staffRepo.count({
        where: { role: 'admin', status: 'active', canManageStaff: true },
      });
      if (activeAdminCount <= 1) {
        throw new BadRequestException('Không thể tạm khóa Quản trị viên (Admin) đang hoạt động cuối cùng.');
      }
    }

    targetStaff.status = newStatus;
    const saved = await this.staffRepo.save(targetStaff);
    return sanitizeStaff(saved);
  }

  async resetPassword(id: string, newPassword: string, requesterId?: string): Promise<{ success: boolean; message: string }> {
    await this.verifyStaffPermission(requesterId, 'canManageStaff');

    const cleanPass = newPassword.trim();
    if (!cleanPass || cleanPass.length < 4) {
      throw new BadRequestException('Mật khẩu mới phải có tối thiểu 4 ký tự.');
    }

    const targetStaff = await this.staffRepo.findOne({ where: { id } });
    if (!targetStaff) {
      throw new NotFoundException(`Không tìm thấy nhân viên [${id}]`);
    }

    targetStaff.passwordHash = hashPassword(cleanPass);
    await this.staffRepo.save(targetStaff);

    return {
      success: true,
      message: `Đã đặt lại mật khẩu cho nhân viên "${targetStaff.name}" thành công.`,
    };
  }
}
