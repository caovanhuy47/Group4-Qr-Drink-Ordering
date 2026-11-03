import { Injectable, OnModuleInit, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity.js';
import { Category } from './entities/category.entity.js';
import { TableSessionRecord } from '../reports/entities/table-session-record.entity.js';
import { CreateDishDto } from './dto/create-dish.dto.js';
import { UpdateDishDto } from './dto/update-dish.dto.js';
import { QueryDishDto } from './dto/query-dish.dto.js';
import { ValidateOrderDto } from './dto/validate-order.dto.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { StaffService } from '../staff/staff.service.js';

@Injectable()
export class DishesService implements OnModuleInit {
  constructor(
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(TableSessionRecord)
    private readonly sessionRecordRepo: Repository<TableSessionRecord>,
    private readonly staffService: StaffService,
  ) {}

  async onModuleInit() {
    await this.seedInitialDataIfEmpty();
  }

  private async verifyMenuPermission(staffIdHeader?: string) {
    return this.staffService.verifyStaffPermission(staffIdHeader, 'canManageMenu');
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
        order: cat.order,
        count,
      };
    });
  }

  async findCategory(id: string) {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) {
      throw new NotFoundException(`Không tìm thấy danh mục có mã [${id}]`);
    }
    const count = await this.dishRepo.count({ where: { categoryId: id, isArchived: false } });
    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      order: cat.order,
      count,
    };
  }

  async createCategory(dto: CreateCategoryDto, staffId?: string) {
    await this.verifyMenuPermission(staffId);

    const cleanName = dto.name?.trim();
    if (!cleanName) {
      throw new BadRequestException('Tên danh mục không được để trống');
    }

    // Check duplicate name (case-insensitive)
    const allCats = await this.categoryRepo.find();
    const isDuplicate = allCats.some(
      (c) => c.name.toLowerCase() === cleanName.toLowerCase(),
    );
    if (isDuplicate) {
      throw new BadRequestException(`Tên danh mục "${cleanName}" đã tồn tại trong thực đơn`);
    }

    let catId = dto.id?.trim();
    if (!catId) {
      catId = `cat-${Date.now()}`;
    } else {
      const existingId = await this.categoryRepo.findOne({ where: { id: catId } });
      if (existingId) {
        throw new BadRequestException(`Mã danh mục [${catId}] đã tồn tại`);
      }
    }

    let order = dto.order;
    if (order === undefined || order === null) {
      const maxOrder = allCats.reduce((max, c) => Math.max(max, c.order || 0), 0);
      order = maxOrder + 1;
    }

    const newCat = this.categoryRepo.create({
      id: catId,
      name: cleanName,
      icon: dto.icon?.trim() || 'restaurant_menu',
      order,
    });

    try {
      const saved = await this.categoryRepo.save(newCat);
      return {
        id: saved.id,
        name: saved.name,
        icon: saved.icon,
        order: saved.order,
        count: 0,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '';
      if (errMsg.includes('Duplicate entry') || (err as { code?: string })?.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(`Tên danh mục "${cleanName}" đã tồn tại trong thực đơn`);
      }
      throw err;
    }
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, staffId?: string) {
    await this.verifyMenuPermission(staffId);

    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) {
      throw new NotFoundException(`Không tìm thấy danh mục [${id}] để cập nhật`);
    }

    if (dto.name !== undefined) {
      const cleanName = dto.name.trim();
      if (!cleanName) {
        throw new BadRequestException('Tên danh mục không được để trống');
      }

      // Check duplicate name with other categories
      const allCats = await this.categoryRepo.find();
      const isDuplicate = allCats.some(
        (c) => c.id !== id && c.name.toLowerCase() === cleanName.toLowerCase(),
      );
      if (isDuplicate) {
        throw new BadRequestException(`Tên danh mục "${cleanName}" đã tồn tại trong thực đơn`);
      }

      const oldName = cat.name;
      cat.name = cleanName;

      // Synchronize categoryName on all dishes referencing this category
      if (oldName !== cleanName) {
        await this.dishRepo.update({ categoryId: id }, { categoryName: cleanName });
      }
    }

    if (dto.icon !== undefined) {
      cat.icon = dto.icon.trim() || 'restaurant_menu';
    }

    if (dto.order !== undefined) {
      cat.order = Number(dto.order);
    }

    try {
      const saved = await this.categoryRepo.save(cat);
      const count = await this.dishRepo.count({ where: { categoryId: id, isArchived: false } });
      return {
        id: saved.id,
        name: saved.name,
        icon: saved.icon,
        order: saved.order,
        count,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '';
      if (errMsg.includes('Duplicate entry') || (err as { code?: string })?.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(`Tên danh mục "${dto.name}" đã tồn tại trong thực đơn`);
      }
      throw err;
    }
  }

  async deleteCategory(id: string, staffId?: string) {
    await this.verifyMenuPermission(staffId);

    if (id === 'all' || id === 'trending') {
      throw new BadRequestException('Không thể xóa danh mục hệ thống mặc định.');
    }

    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) {
      throw new NotFoundException(`Không tìm thấy danh mục [${id}] hoặc đã bị xóa`);
    }

    // Safe deletion rule: check if any active dish references this category
    const activeDishCount = await this.dishRepo.count({ where: { categoryId: id, isArchived: false } });
    if (activeDishCount > 0) {
      throw new BadRequestException(
        `Không thể xóa danh mục "${cat.name}" vì vẫn còn ${activeDishCount} món ăn đang thuộc nhóm này. Vui lòng chuyển các món sang danh mục khác trước khi xóa.`,
      );
    }

    // Also check if any archived dishes reference this category
    const totalDishCount = await this.dishRepo.count({ where: { categoryId: id } });
    if (totalDishCount > 0) {
      throw new BadRequestException(
        `Không thể xóa danh mục "${cat.name}" vì có ${totalDishCount} món ăn đang tham chiếu đến danh mục này. Vui lòng chuyển các món sang danh mục khác trước khi xóa.`,
      );
    }

    await this.categoryRepo.delete(id);
    return {
      success: true,
      message: `Đã xóa danh mục "${cat.name}" thành công khỏi thực đơn.`,
    };
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
    await this.verifyMenuPermission(staffId);

    const cleanName = dto.name.trim();
    if (!cleanName) {
      throw new BadRequestException('Tên món ăn không được để trống');
    }

    // Validate category existence
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category || dto.categoryId === 'all' || dto.categoryId === 'trending') {
      throw new BadRequestException(`Danh mục món [${dto.categoryId}] không tồn tại trên hệ thống.`);
    }

    const categoryName = category.name;
    const dishId = dto.id?.trim() || `dish-${Date.now()}`;

    const newDish = this.dishRepo.create({
      id: dishId,
      name: cleanName,
      description: dto.description?.trim() || '',
      price: Math.max(0, Math.floor(dto.price)),
      oldPrice: dto.oldPrice ? Math.max(0, Math.floor(dto.oldPrice)) : null,
      image: dto.image.trim(),
      categoryId: category.id,
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
    await this.verifyMenuPermission(staffId);

    const existing = await this.findOne(id);

    if (dto.name !== undefined) {
      const cleanName = dto.name.trim();
      if (!cleanName) {
        throw new BadRequestException('Tên món ăn không được để trống');
      }
      existing.name = cleanName;
    }

    if (dto.description !== undefined) {
      existing.description = dto.description ? dto.description.trim() : '';
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
      if (!cat || dto.categoryId === 'all' || dto.categoryId === 'trending') {
        throw new BadRequestException(`Danh mục món [${dto.categoryId}] không tồn tại trên hệ thống.`);
      }
      existing.categoryId = cat.id;
      existing.categoryName = cat.name;
    }

    if (dto.badge !== undefined) {
      existing.badge = dto.badge ? dto.badge.trim() || null : null;
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
    await this.verifyMenuPermission(staffId);
    const dish = await this.findOne(id);
    dish.isAvailable = !dish.isAvailable;
    return this.dishRepo.save(dish);
  }

  async remove(id: string, staffId?: string) {
    await this.verifyMenuPermission(staffId);
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

  // Validate customer order items against current database dish prices and availability
  async validateOrder(dto: ValidateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Giỏ hàng chưa có món nào');
    }

    let calculatedTotalAmount = 0;
    let calculatedTotalQuantity = 0;
    const verifiedItems: Array<{
      cartItemId: string;
      dishId: string;
      name: string;
      sizeName: string;
      toppings: string[];
      unitPrice: number;
      quantity: number;
      totalPrice: number;
    }> = [];

    for (const item of dto.items) {
      const dish = await this.dishRepo.findOne({ where: { id: item.dishId } });

      if (!dish || dish.isArchived) {
        return {
          valid: false,
          reason: 'dish_not_found',
          dishId: item.dishId,
          dishName: item.name || dish?.name || item.dishId,
          message: `Món "${item.name || dish?.name || item.dishId}" hiện không còn trong thực đơn quán.`,
        };
      }

      if (!dish.isAvailable) {
        return {
          valid: false,
          reason: 'dish_unavailable',
          dishId: dish.id,
          dishName: dish.name,
          message: `Món "${dish.name}" hiện đã tạm hết món. Vui lòng bỏ món này khỏi giỏ hàng trước khi đặt.`,
        };
      }

      // Calculate size surcharge
      let sizePrice = 0;
      let matchedSizeName = 'Tiêu chuẩn';
      if (dish.sizes && Array.isArray(dish.sizes) && item.sizeName) {
        const matchedSize = dish.sizes.find(
          (s) => s.id === item.sizeId || s.name === item.sizeName
        );
        if (matchedSize) {
          sizePrice = matchedSize.price || 0;
          matchedSizeName = matchedSize.name;
        }
      }

      // Calculate toppings surcharge
      let toppingsPrice = 0;
      const matchedToppings: string[] = [];
      if (dish.toppings && Array.isArray(dish.toppings) && item.toppings) {
        for (const topName of item.toppings) {
          const matchedTop = dish.toppings.find((t) => t.name === topName || t.id === topName);
          if (matchedTop) {
            toppingsPrice += matchedTop.price || 0;
            matchedToppings.push(matchedTop.name);
          }
        }
      }

      const serverUnitPrice = dish.price + sizePrice + toppingsPrice;
      const serverItemTotal = serverUnitPrice * item.quantity;

      // Price changed validation
      if (serverUnitPrice !== item.clientUnitPrice) {
        return {
          valid: false,
          reason: 'price_changed',
          dishId: dish.id,
          dishName: dish.name,
          oldUnitPrice: item.clientUnitPrice,
          newUnitPrice: serverUnitPrice,
          message: `Đơn giá của món "${dish.name}" đã được cập nhật thành ${serverUnitPrice.toLocaleString('vi-VN')}đ (trước đó: ${item.clientUnitPrice.toLocaleString('vi-VN')}đ). Vui lòng xác nhận lại giỏ hàng.`,
        };
      }

      calculatedTotalAmount += serverItemTotal;
      calculatedTotalQuantity += item.quantity;

      verifiedItems.push({
        cartItemId: item.cartItemId,
        dishId: dish.id,
        name: dish.name,
        sizeName: matchedSizeName,
        toppings: matchedToppings,
        unitPrice: serverUnitPrice,
        quantity: item.quantity,
        totalPrice: serverItemTotal,
      });
    }

    return {
      valid: true,
      totalAmount: calculatedTotalAmount,
      totalQuantity: calculatedTotalQuantity,
      items: verifiedItems,
      message: 'Giỏ hàng hợp lệ, đã xác thực với cơ sở dữ liệu thực đơn.',
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
