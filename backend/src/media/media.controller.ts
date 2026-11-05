import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { MediaService, type UploadResult, type UploadedMediaFile } from './media.service.js';

@ApiTags('Media & Uploads')
@Controller('api/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Tải ảnh món ăn hoặc banner từ máy lên máy chủ Huy CV (< 10 MB, JPG/PNG/WebP)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'x-staff-id',
    description: 'Mã định danh nhân viên thực hiện upload (yêu cầu quyền quản lý món hoặc banner)',
    required: true,
  })
  @ApiQuery({
    name: 'folder',
    description: 'Thư mục phân loại: dishes (món ăn) hoặc banners (banner quảng cáo)',
    required: false,
    enum: ['dishes', 'banners'],
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit in Multer
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: UploadedMediaFile | undefined,
    @Query('folder') folder: string = 'dishes',
    @Headers('x-staff-id') staffId?: string,
  ): Promise<UploadResult> {
    return this.mediaService.uploadImage(file, folder, staffId);
  }
}
