import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity.js';
import { CreateBannerDto } from './dto/create-banner.dto.js';
import { UpdateBannerDto } from './dto/update-banner.dto.js';
import { ReorderBannersDto } from './dto/reorder-banners.dto.js';

interface StaffPermission {
  id: string;
  name: string;
  role: string;
  roleName: string;
  canManageMenu: boolean;
  status: 'active' | 'offline';
}

const AUTHORIZED_STAFF_BANNERS: Record<string, StaffPermission> = {
  'staff-1': {
    id: 'staff-1',
    name: 'Nguyễn Văn Hùng',
    role: 'admin',
    roleName: 'Chủ quán / Quản lý',
    canManageMenu: true,
    status: 'active',
  },
  'staff-2': {
    id: 'staff-2',
    name: 'Trần Thị Mai',
    role: 'cashier',
    roleName: 'Thu ngân / Quản lý ca',
    canManageMenu: true,
    status: 'active',
  },
  'staff-3': {
    id: 'staff-3',
    name: 'Lê Hoàng Nam',
    role: 'waiter',
    roleName: 'Nhân viên phục vụ',
    canManageMenu: false,
    status: 'active',
  },
  'staff-4': {
    id: 'staff-4',
    name: 'Phạm Đức Tuấn',
    role: 'kitchen',
    roleName: 'Đầu bếp & Pha chế chính',
    canManageMenu: false,
    status: 'active',
  },
};

@Injectable()
export class BannersService implements OnModuleInit {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
  ) {}

  async onModuleInit() {
    await this.seedInitialBannersIfEmpty();
  }

  private verifyBannerPermission(staffIdHeader?: string) {
    const staffId = staffIdHeader || 'staff-1';
    const staff = AUTHORIZED_STAFF_BANNERS[staffId];

    if (!staff) {
      throw new ForbiddenException(`Tài khoản nhân viên [${staffId}] không tồn tại trên hệ thống.`);
    }

    if (!staff.canManageMenu) {
      throw new ForbiddenException(`Nhân viên ${staff.name} (${staff.roleName}) không có quyền quản lý banner.`);
    }

    if (staff.status !== 'active') {
      throw new ForbiddenException(`Tài khoản ${staff.name} đang bị tạm khóa hoặc không hoạt động.`);
    }

    return staff;
  }

  private async seedInitialBannersIfEmpty() {
    const count = await this.bannerRepo.count();
    if (count > 0) return;

    const initialBanners: Partial<Banner>[] = [
      {
        id: 'banner-1',
        adminName: 'Banner Giờ Vàng Chiều 16h-19h',
        tag: 'Giờ Vàng 16h-19h',
        title: 'Combo Huy CV Giờ Vàng',
        description: 'Nướng ngói béo ngậy kèm trà tắc mát lạnh phố xá',
        discountBadge: '-20%',
        priceNote: 'Chỉ từ 69k',
        ctaText: 'Khám phá ngay',
        bgGradient: 'from-primary via-primary-container to-secondary-container',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDJJIrpzEC_mteNZpkWj4kHJteToAcPjNk1GMhtRRoNGnoatxft20UAEWNKnDx-Ria_SxJ7rDT0vk-akI2Zca5SLPGrSzBrqhcHZ7gTLHxiVq-t-JCPoENzJXScqfW84Lxn1H_Vz-S-yID5VT8q9zKID5UkGC3GyD79XYZspdxMGAnxukXUEzJT8caK33anE65qUnLf2G223fUydXJRO3H3xfco3izW4jJxIKPo6Ak',
        linkType: 'category',
        linkTargetId: 'main',
        displayOrder: 1,
        isActive: true,
      },
      {
        id: 'banner-2',
        adminName: 'Banner Giới Thiệu Lẩu Ếch Mới',
        tag: 'Món Mới Trình Làng',
        title: 'Lẩu Ếch Măng Cay Mới',
        description: 'Ếch đồng xào sa tế cay the ấm lòng đêm hè phố',
        discountBadge: 'HOT',
        priceNote: 'Chỉ từ 149k',
        ctaText: 'Thử vị ngay',
        bgGradient: 'from-tertiary via-tertiary-container to-secondary',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBGxPkMU_3kD-RE9ELJkmkHpBAlmJI6hScn1YU_tXH_Hl7ZQ9tyX1vQOuxFEyN-a18_WeTjDdey1f1XuFBXCfS7vPtvSvQ1SvWmidWEKmkufe2OfwqJ4voxXRVQ_plCy_f0t6vvKTbDGjxvm-1wr5K1BaF4avKJOswg8Rg7qv0YHqq3DLpEsf6VoiIfEukV3-W3Ci7Fx9MwYyYL5f7NohpG4vagHbUdF_55aYQpLMY',
        linkType: 'dish',
        linkTargetId: 'dish-1',
        displayOrder: 2,
        isActive: true,
      },
    ];

    await this.bannerRepo.save(initialBanners as Banner[]);
  }

  async findAll(includeInactive = false): Promise<Banner[]> {
    const qb = this.bannerRepo.createQueryBuilder('b');

    if (!includeInactive) {
      qb.where('b.isActive = :isActive', { isActive: true });
    }

    qb.orderBy('b.displayOrder', 'ASC').addOrderBy('b.createdAt', 'ASC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Không tìm thấy banner với mã [${id}]`);
    }
    return banner;
  }

  async create(dto: CreateBannerDto, staffId?: string): Promise<Banner> {
    this.verifyBannerPermission(staffId);

    const cleanAdminName = dto.adminName?.trim();
    if (!cleanAdminName) {
      throw new BadRequestException('Tên quản trị banner không được để trống');
    }

    const cleanTitle = dto.title?.trim();
    if (!cleanTitle) {
      throw new BadRequestException('Tiêu đề hiển thị không được để trống');
    }

    // Determine display order if not specified
    let displayOrder = dto.displayOrder;
    if (displayOrder === undefined || displayOrder === null) {
      const maxOrderBanner = await this.bannerRepo
        .createQueryBuilder('b')
        .select('MAX(b.displayOrder)', 'max')
        .getRawOne();
      displayOrder = (Number(maxOrderBanner?.max) || 0) + 1;
    }

    const bannerId = dto.id?.trim() || `banner-${Date.now()}`;

    const newBanner = this.bannerRepo.create({
      id: bannerId,
      adminName: cleanAdminName,
      title: cleanTitle,
      description: dto.description?.trim() || null,
      tag: dto.tag?.trim() || null,
      discountBadge: dto.discountBadge?.trim() || null,
      priceNote: dto.priceNote?.trim() || null,
      ctaText: dto.ctaText?.trim() || 'Khám phá ngay',
      bgGradient: dto.bgGradient?.trim() || 'from-primary via-primary-container to-secondary-container',
      imageUrl: dto.imageUrl?.trim() || null,
      mobileImageUrl: dto.mobileImageUrl?.trim() || null,
      linkType: dto.linkType || 'none',
      linkTargetId: dto.linkTargetId?.trim() || null,
      displayOrder: Math.max(0, Math.floor(Number(displayOrder) || 0)),
      isActive: dto.isActive !== false,
    });

    return this.bannerRepo.save(newBanner);
  }

  async update(id: string, dto: UpdateBannerDto, staffId?: string): Promise<Banner> {
    this.verifyBannerPermission(staffId);

    const existing = await this.findOne(id);

    if (dto.adminName !== undefined) {
      const clean = dto.adminName.trim();
      if (!clean) {
        throw new BadRequestException('Tên quản trị banner không được để trống');
      }
      existing.adminName = clean;
    }

    if (dto.title !== undefined) {
      const clean = dto.title.trim();
      if (!clean) {
        throw new BadRequestException('Tiêu đề hiển thị không được để trống');
      }
      existing.title = clean;
    }

    if (dto.description !== undefined) {
      existing.description = dto.description ? dto.description.trim() || null : null;
    }

    if (dto.tag !== undefined) {
      existing.tag = dto.tag ? dto.tag.trim() || null : null;
    }

    if (dto.discountBadge !== undefined) {
      existing.discountBadge = dto.discountBadge ? dto.discountBadge.trim() || null : null;
    }

    if (dto.priceNote !== undefined) {
      existing.priceNote = dto.priceNote ? dto.priceNote.trim() || null : null;
    }

    if (dto.ctaText !== undefined) {
      existing.ctaText = dto.ctaText ? dto.ctaText.trim() || 'Khám phá ngay' : 'Khám phá ngay';
    }

    if (dto.bgGradient !== undefined) {
      existing.bgGradient = dto.bgGradient ? dto.bgGradient.trim() || 'from-primary via-primary-container to-secondary-container' : 'from-primary via-primary-container to-secondary-container';
    }

    if (dto.imageUrl !== undefined) {
      existing.imageUrl = dto.imageUrl ? dto.imageUrl.trim() || null : null;
    }

    if (dto.mobileImageUrl !== undefined) {
      existing.mobileImageUrl = dto.mobileImageUrl ? dto.mobileImageUrl.trim() || null : null;
    }

    if (dto.linkType !== undefined) {
      existing.linkType = dto.linkType;
    }

    if (dto.linkTargetId !== undefined) {
      existing.linkTargetId = dto.linkTargetId ? dto.linkTargetId.trim() || null : null;
    }

    if (dto.displayOrder !== undefined) {
      existing.displayOrder = Math.max(0, Math.floor(dto.displayOrder));
    }

    if (dto.isActive !== undefined) {
      existing.isActive = Boolean(dto.isActive);
    }

    return this.bannerRepo.save(existing);
  }

  async toggleStatus(id: string, staffId?: string): Promise<Banner> {
    this.verifyBannerPermission(staffId);
    const banner = await this.findOne(id);
    banner.isActive = !banner.isActive;
    return this.bannerRepo.save(banner);
  }

  async reorder(dto: ReorderBannersDto, staffId?: string): Promise<{ success: boolean; message: string }> {
    this.verifyBannerPermission(staffId);

    if (!dto.items || !Array.isArray(dto.items)) {
      throw new BadRequestException('Danh sách sắp xếp không hợp lệ');
    }

    for (const item of dto.items) {
      if (item.id && typeof item.displayOrder === 'number') {
        await this.bannerRepo.update(item.id, {
          displayOrder: Math.max(0, Math.floor(item.displayOrder)),
        });
      }
    }

    return {
      success: true,
      message: 'Cập nhật thứ tự hiển thị banner thành công',
    };
  }

  async remove(id: string, staffId?: string): Promise<{ success: boolean; message: string }> {
    this.verifyBannerPermission(staffId);
    const banner = await this.findOne(id);
    await this.bannerRepo.remove(banner);
    return {
      success: true,
      message: `Đã xóa banner "${banner.adminName}" thành công khỏi hệ thống`,
    };
  }
}
