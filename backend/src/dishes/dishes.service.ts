import { Injectable, OnModuleInit, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity.js';
import { Category } from './entities/category.entity.js';
import { TableSessionRecord } from '../reports/entities/table-session-record.entity.js';
import { CreateDishDto } from './dto/create-dish.dto.js';
import { UpdateDishDto } from './dto/update-dish.dto.js';
import { QueryDishDto } from './dto/query-dish.dto.js';

interface StaffPermission {
  id: string;
  name: string;
  role: string;
  roleName: string;
  canManageMenu: boolean;
  status: 'active' | 'suspended';
}

const AUTHORIZED_STAFF_MENU: Record<string, StaffPermission> = {
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
    roleName: 'Thu ngân quầy',
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
export class DishesService implements OnModuleInit {
  constructor(
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(TableSessionRecord)
    private readonly sessionRecordRepo: Repository<TableSessionRecord>,
  ) {}

  async onModuleInit() {
    await this.seedInitialDataIfEmpty();
  }

  private verifyMenuPermission(staffIdHeader?: string) {
    const staffId = staffIdHeader || 'staff-1';
    const staff = AUTHORIZED_STAFF_MENU[staffId];

    if (!staff) {
      throw new ForbiddenException(`Tài khoản nhân viên [${staffId}] không tồn tại trên hệ thống.`);
    }

    if (!staff.canManageMenu) {
      throw new ForbiddenException(`Nhân viên ${staff.name} (${staff.roleName}) không có quyền chỉnh sửa thực đơn.`);
    }

    if (staff.status !== 'active') {
      throw new ForbiddenException(`Tài khoản ${staff.name} đang bị tạm khóa hoặc không hoạt động.`);
    }

    return staff;
  }

  async findAllCategories() {
    const categories = await this.categoryRepo.find({ order: { order: 'ASC' } });
    const allDishes = await this.dishRepo.find({ where: { isArchived: false } });

    // Compute dynamic dish counts per category
    return categories.map((cat) => {
      let count = 0;
      if (cat.id === 'all') {
        count = allDishes.length;
      } else if (cat.id === 'trending') {
        count = allDishes.filter((d) => d.badge === 'Bán chạy' || d.badgeType === 'hot').length;
      } else {
        count = allDishes.filter((d) => d.categoryId === cat.id).length;
      }
      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        count,
      };
    });
  }

  async findAll(query: QueryDishDto) {
    const qb = this.dishRepo.createQueryBuilder('d');

    // Archive filter: hide archived dishes by default
    if (!query.includeArchived) {
      qb.andWhere('d.isArchived = :isArchived', { isArchived: false });
    }

    // Availability filter for customer menu
    if (query.onlyAvailable) {
      qb.andWhere('d.isAvailable = :isAvailable', { isAvailable: true });
    }

    // Category filter
    if (query.categoryId && query.categoryId !== 'all') {
      if (query.categoryId === 'trending') {
        qb.andWhere('(d.badge = :badge OR d.badgeType = :badgeType)', {
          badge: 'Bán chạy',
          badgeType: 'hot',
        });
      } else {
        qb.andWhere('d.categoryId = :categoryId', { categoryId: query.categoryId });
      }
    }

    // Search query
    if (query.search?.trim()) {
      const kw = `%${query.search.trim()}%`;
      qb.andWhere('(d.name LIKE :kw OR d.description LIKE :kw)', { kw });
    }

    qb.orderBy('d.createdAt', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const dish = await this.dishRepo.findOne({ where: { id } });
    if (!dish) {
      throw new NotFoundException(`Không tìm thấy món ăn với mã [${id}]`);
    }
    return dish;
  }

  async create(dto: CreateDishDto, staffId?: string) {
    this.verifyMenuPermission(staffId);

    const cleanName = dto.name.trim();
    if (!cleanName) {
      throw new BadRequestException('Tên món ăn không được để trống');
    }

    // Validate category existence
    let category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category && dto.categoryId !== 'all' && dto.categoryId !== 'trending') {
      // Default to main category if not found
      category = await this.categoryRepo.findOne({ where: { id: 'main' } });
    }

    const categoryName = category ? category.name : 'Món chính';
    const dishId = dto.id?.trim() || `dish-${Date.now()}`;

    const newDish = this.dishRepo.create({
      id: dishId,
      name: cleanName,
      description: dto.description?.trim() || '',
      price: Math.max(0, Math.floor(dto.price)),
      oldPrice: dto.oldPrice ? Math.max(0, Math.floor(dto.oldPrice)) : null,
      image: dto.image.trim(),
      categoryId: category ? category.id : 'main',
      categoryName,
      badge: dto.badge?.trim() || null,
      badgeType: dto.badgeType || null,
      isAvailable: dto.isAvailable !== false,
      isArchived: false,
      sizes: dto.sizes || [
        { id: 's-1', name: 'Tiêu chuẩn', price: 0 },
        { id: 's-2', name: 'Tô lớn', price: 10000 },
      ],
      toppings: dto.toppings || [],
    });

    return this.dishRepo.save(newDish);
  }

  async update(id: string, dto: UpdateDishDto, staffId?: string) {
    this.verifyMenuPermission(staffId);

    const existing = await this.findOne(id);

    if (dto.name !== undefined) {
      const cleanName = dto.name.trim();
      if (!cleanName) {
        throw new BadRequestException('Tên món ăn không được để trống');
      }
      existing.name = cleanName;
    }

    if (dto.description !== undefined) {
      existing.description = dto.description.trim();
    }

    if (dto.price !== undefined) {
      existing.price = Math.max(0, Math.floor(dto.price));
    }

    if (dto.oldPrice !== undefined) {
      existing.oldPrice = dto.oldPrice ? Math.max(0, Math.floor(dto.oldPrice)) : null;
    }

    if (dto.image !== undefined && dto.image.trim()) {
      existing.image = dto.image.trim();
    }

    if (dto.categoryId !== undefined) {
      const cat = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (cat) {
        existing.categoryId = cat.id;
        existing.categoryName = cat.name;
      }
    }

    if (dto.badge !== undefined) {
      existing.badge = dto.badge.trim() || null;
    }

    if (dto.badgeType !== undefined) {
      existing.badgeType = dto.badgeType || null;
    }

    if (dto.isAvailable !== undefined) {
      existing.isAvailable = dto.isAvailable;
    }

    if (dto.isArchived !== undefined) {
      existing.isArchived = dto.isArchived;
    }

    if (dto.sizes !== undefined) {
      existing.sizes = dto.sizes;
    }

    if (dto.toppings !== undefined) {
      existing.toppings = dto.toppings;
    }

    return this.dishRepo.save(existing);
  }

  async toggleAvailability(id: string, staffId?: string) {
    this.verifyMenuPermission(staffId);
    const dish = await this.findOne(id);
    dish.isAvailable = !dish.isAvailable;
    return this.dishRepo.save(dish);
  }

  async remove(id: string, staffId?: string) {
    this.verifyMenuPermission(staffId);
    const dish = await this.findOne(id);

    // Check if dish was ever ordered in table_session_records
    const allRecords = await this.sessionRecordRepo.find({ select: { id: true, items: true } });
    const isReferenced = allRecords.some(
      (rec) => rec.items && Array.isArray(rec.items) && rec.items.some((i) => i.dishId === id),
    );

    if (isReferenced) {
      // Dish is referenced in historical orders: safely archive it to protect history integrity!
      dish.isArchived = true;
      dish.isAvailable = false;
      await this.dishRepo.save(dish);
      return {
        success: true,
        archived: true,
        message: `Món "${dish.name}" đã từng phát sinh trong đơn hàng trước đó nên được chuyển sang lưu trữ thay vì xóa cứng. Lịch sử đơn hàng được bảo toàn tuyệt đối.`,
      };
    }

    // Dish has never been ordered: safely delete
    await this.dishRepo.delete(id);
    return {
      success: true,
      archived: false,
      message: `Đã xóa món "${dish.name}" hoàn toàn khỏi thực đơn.`,
    };
  }

  // Seed initial realistic dishes if the database table is empty
  private async seedInitialDataIfEmpty() {
    // 1. Seed Categories
    const catCount = await this.categoryRepo.count();
    if (catCount === 0) {
      const initialCategories: Partial<Category>[] = [
        { id: 'all', name: 'Tất cả món', icon: 'restaurant_menu', order: 1 },
        { id: 'trending', name: 'Món bán chạy', icon: 'whatshot', order: 2 },
        { id: 'main', name: 'Món chính', icon: 'ramen_dining', order: 3 },
        { id: 'snack', name: 'Ăn vặt phố', icon: 'kebab_dining', order: 4 },
        { id: 'drinks', name: 'Đồ uống hè', icon: 'local_cafe', order: 5 },
      ];
      for (const c of initialCategories) {
        await this.categoryRepo.save(this.categoryRepo.create(c));
      }
    }

    // 2. Seed Dishes
    const seeds: Partial<Dish>[] = [
        {
          id: 'dish-1',
          name: 'Bún Bò Huế Đặc Biệt',
          description: 'Thịt bắp hoa, giò gân béo mềm, chả cua Huế, nước dùng thơm nồng sả ớt chuẩn vị cố đô.',
          price: 55000,
          oldPrice: 65000,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGxPkMU_3kD-RE9ELJkmkHpBAlmJI6hScn1YU_tXH_Hl7ZQ9tyX1vQOuxFEyN-a18_WeTjDdey1f1XuFBXCfS7vPtvSvQ1SvWmidWEKmkufe2OfwqJ4voxXRVQ_plCy_f0t6vvKTbDGjxvm-1wr5K1BaF4avKJOswg8Rg7qv0YHqq3DLpEsf6VoiIfEukV3-W3Ci7Fx9MwYyYL5f7NohpG4vagHbUdF_55aYQpLMY',
          categoryId: 'main',
          categoryName: 'Món chính',
          badge: 'Bán chạy',
          badgeType: 'hot',
          isAvailable: true,
          isArchived: false,
          sizes: [
            { id: 's-std', name: 'Tiêu chuẩn', price: 0 },
            { id: 's-big', name: 'Tô lớn (+thịt)', price: 10000 },
            { id: 's-spec', name: 'Đặc biệt (+chả cua)', price: 15000 },
          ],
          toppings: [
            { id: 'top-1', name: 'Chả cua thêm', price: 10000 },
            { id: 'top-2', name: 'Thịt bò tái bắp', price: 15000 },
            { id: 'top-3', name: 'Giò heo khoanh', price: 12000 },
            { id: 'top-4', name: 'Rau chuối trụng', price: 5000 },
          ],
        },
        {
          id: 'dish-2',
          name: 'Bánh Tráng Nướng Trứng Xúc Xích',
          description: 'Bánh tráng nướng than hoa giòn rụm, bơ thơm béo, tép khô, trứng gà, phô mai và khô bò đỏ.',
          price: 30000,
          oldPrice: 35000,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOYWMD3I9GaRplV5dxtweRgOTbtUIBUwrrHP6zrD2_GTOuHxSWkC8T-MJ2spGaF3gVhs8NIUS1pGAIUz8A50VgcLzV3-S0VHESSroNSYdkMty8sv2g1yeD679Dfigey9vMwJ1PzrAWOMp_Tf7NCb0zR_RPQwOC-r74PvI7YqLLb-FIAaqKB5ySVVCtriWRmF9QSxKdcQVhUDXX7Zp2VfrtEdS7FSB8Ukaa08JmhQc',
          categoryId: 'snack',
          categoryName: 'Ăn vặt phố',
          badge: 'Món hot',
          badgeType: 'hot',
          isAvailable: true,
          isArchived: false,
          sizes: [
            { id: 's-std', name: '1 Bánh truyền thống', price: 0 },
            { id: 's-big', name: 'Gấp đôi phô mai kéo sợi', price: 8000 },
          ],
          toppings: [
            { id: 'top-phomai', name: 'Phô mai sợi kéo', price: 8000 },
            { id: 'top-xucxich', name: 'Xúc xích nướng', price: 6000 },
            { id: 'top-khobo', name: 'Khô bò cay', price: 7000 },
          ],
        },
        {
          id: 'dish-3',
          name: 'Cơm Tấm Sườn Bì Chả Trứng',
          description: 'Hạt tấm tơi xốp, sườn nướng mật ong thơm lừng, bì thính vàng giòn, chả trứng hấp béo ngậy.',
          price: 50000,
          oldPrice: 55000,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3K-N_y0vVv8t-K0U2v1lC0h_F3p1G4s7q6v-8_d0t_r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0',
          categoryId: 'main',
          categoryName: 'Món chính',
          badge: 'Đặc sản',
          badgeType: 'special',
          isAvailable: true,
          isArchived: false,
          sizes: [
            { id: 's-std', name: 'Phần tiêu chuẩn', price: 0 },
            { id: 's-big', name: 'Cơm thêm + Sườn lớn', price: 15000 },
          ],
          toppings: [
            { id: 'top-trungopla', name: 'Trứng ốp la lòng đào', price: 7000 },
            { id: 'top-chahap', name: 'Chả hấp thêm', price: 10000 },
            { id: 'top-canh', name: 'Canh rong biển thịt bằm', price: 8000 },
          ],
        },
        {
          id: 'dish-4',
          name: 'Trà Tắc Xí Muội Đường Phèn',
          description: 'Vị chua thanh mát lành của tắc tươi hòa quyện xí muội mặn ngọt, nấu cùng đường phèn thanh khiết.',
          price: 20000,
          oldPrice: 25000,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFh4i7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z',
          categoryId: 'drinks',
          categoryName: 'Đồ uống hè',
          badge: 'Giải nhiệt',
          badgeType: 'hot',
          isAvailable: true,
          isArchived: false,
          sizes: [
            { id: 's-std', name: 'Ly vừa (500ml)', price: 0 },
            { id: 's-large', name: 'Ly lớn khổng lồ (700ml)', price: 5000 },
          ],
          toppings: [
            { id: 'top-ximuoi', name: 'Xí muội ngâm thêm', price: 5000 },
            { id: 'top-nhadam', name: 'Thạch nha đam giòn', price: 5000 },
            { id: 'top-hat-chia', name: 'Hạt chia hữu cơ', price: 4000 },
          ],
        },
        {
          id: 'dish-5',
          name: 'Trà Sữa Thái Xanh Thạch Phô Mai',
          description: 'Trà Thái xanh đậm đà béo ngậy vị sữa thơm lừng kết hợp viên thạch phô mai tươi béo giòn.',
          price: 28000,
          oldPrice: 32000,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6',
          categoryId: 'drinks',
          categoryName: 'Đồ uống hè',
          badge: 'Mới ra mắt',
          badgeType: 'new',
          isAvailable: true,
          isArchived: false,
          sizes: [
            { id: 's-std', name: 'Ly 500ml', price: 0 },
            { id: 's-large', name: 'Ly 700ml', price: 6000 },
          ],
          toppings: [
            { id: 'top-phomai-vien', name: 'Viên phô mai tươi (3 viên)', price: 10000 },
            { id: 'top-tranchau', name: 'Trân châu hoàng kim', price: 5000 },
          ],
        },
      ];

      for (const s of seeds) {
        const existing = await this.dishRepo.findOne({ where: { id: s.id } });
        if (!existing) {
          await this.dishRepo.save(this.dishRepo.create(s));
        }
      }
  }
}
