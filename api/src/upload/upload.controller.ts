import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('文件上传')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '图片文件',
        },
      },
    },
  })
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('文件不能为空');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('不支持的图片格式');
    }

    const key = this.uploadService.generateKey('images', file.originalname);
    const result = await this.uploadService.uploadFile(key, file.buffer, file.mimetype);

    return {
      success: true,
      data: {
        key: result.key,
        url: result.url,
        size: file.size,
        mimetype: file.mimetype,
      },
    };
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传文档' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '文档文件',
        },
      },
    },
  })
  async uploadDocument(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('文件不能为空');
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('不支持的文档格式');
    }

    const key = this.uploadService.generateKey('documents', file.originalname);
    const result = await this.uploadService.uploadFile(key, file.buffer, file.mimetype);

    return {
      success: true,
      data: {
        key: result.key,
        url: result.url,
        size: file.size,
        mimetype: file.mimetype,
      },
    };
  }
}