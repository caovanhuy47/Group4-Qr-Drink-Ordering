import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { StaffService } from '../staff/staff.service.js';

export interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface UploadedMediaFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB (10,485,760 bytes)

@Injectable()
export class MediaService {
  constructor(private readonly staffService: StaffService) {}

  /**
   * Validate image magic numbers to prevent malicious or corrupted files
   */
  private detectImageFormat(buffer: Buffer): { ext: string; mimeType: string } | null {
    if (!buffer || buffer.length < 12) return null;

    // JPEG / JPG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { ext: 'jpg', mimeType: 'image/jpeg' };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { ext: 'png', mimeType: 'image/png' };
    }

    // WebP: RIFF ... WEBP
    const riff = buffer.toString('ascii', 0, 4);
    const webp = buffer.toString('ascii', 8, 12);
    if (riff === 'RIFF' && webp === 'WEBP') {
      return { ext: 'webp', mimeType: 'image/webp' };
    }

    return null;
  }

  async uploadImage(
    file: UploadedMediaFile | undefined,
    folder: string = 'dishes',
    staffIdHeader?: string,
  ): Promise<UploadResult> {
    // 1. Authorization: Only verified internal staff can upload media
    if (!staffIdHeader) {
      throw new ForbiddenException('Yêu cầu quyền nhân viên để tải ảnh lên máy chủ (thiếu x-staff-id).');
    }
    const staff = await this.staffService.verifyStaffPermission(staffIdHeader);
    const allowed =
      staff.role === 'admin' ||
      staff.canManageMenu ||
      staff.canManageBanners;
    if (!allowed) {
      throw new ForbiddenException('Tài khoản của bạn không có quyền quản lý ảnh món ăn hoặc banner.');
    }

    // 2. Validate file existence
    if (!file || !file.buffer) {
      throw new BadRequestException('Vui lòng chọn một tập tin ảnh để tải lên.');
    }

    // 3. Validate file size (strictly smaller than 10 MB per specification)
    if (file.size >= MAX_IMAGE_SIZE_BYTES) {
      const currentMb = (file.size / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `Dung lượng ảnh vượt quá giới hạn cho phép (yêu cầu nhỏ hơn 10 MB, ảnh hiện tại: ${currentMb} MB).`
      );
    }

    // 4. Validate image signature (Magic bytes)
    const detected = this.detectImageFormat(file.buffer);
    if (!detected) {
      throw new BadRequestException(
        'Định dạng tập tin không hợp lệ hoặc không phải ảnh thật. Chỉ hỗ trợ định dạng JPG, PNG và WebP.'
      );
    }

    // 5. Sanitize target folder name
    const safeFolder = folder === 'banners' ? 'banners' : 'dishes';
    const uploadsDir = path.resolve(process.cwd(), 'uploads', safeFolder);

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // 6. Generate non-colliding safe filename
      const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      const safeFilename = `${safeFolder}-${uniqueSuffix}.${detected.ext}`;
      const filePath = path.join(uploadsDir, safeFilename);

      // 7. Write file to disk
      await fs.promises.writeFile(filePath, file.buffer);

      // Return public URL relative to root
      return {
        success: true,
        url: `/uploads/${safeFolder}/${safeFilename}`,
        filename: safeFilename,
        size: file.size,
        mimeType: detected.mimeType,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi lưu ảnh';
      throw new BadRequestException(`Tải ảnh lên máy chủ thất bại: ${msg}`);
    }
  }
}
