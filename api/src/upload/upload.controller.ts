import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException, UnauthorizedException, Get, Query, Res, HttpStatus, Request } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@ApiTags('文件上传')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService, private readonly configService: ConfigService) { }

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
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
  async uploadImage(@UploadedFile() file: any, @Request() req: any) {
    const auth = req.headers['authorization'] || req.headers['Authorization']
    if (!auth) throw new UnauthorizedException()
    if (!file) {
      throw new InternalServerErrorException('文件不能为空');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new InternalServerErrorException('不支持的图片格式');
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
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
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
  async uploadDocument(@UploadedFile() file: any, @Request() req: any) {
    const auth = req.headers['authorization'] || req.headers['Authorization']
    if (!auth) throw new UnauthorizedException()
    if (!file) {
      throw new InternalServerErrorException('文件不能为空');
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new InternalServerErrorException('不支持的文档格式');
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

  @Get('proxy')
  @ApiOperation({ summary: '图片代理' })
  async proxy(@Query('url') url: string, @Res() res: Response) {
    if (!url) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'url 参数不能为空' });
    }
    try {
      const parsed = new URL(url.startsWith('http') ? url : `http://${url}`);
      const endpoint = this.configService.get('MINIO_ENDPOINT');
      const endpointUrl = endpoint && (endpoint.startsWith('http') ? new URL(endpoint) : new URL(`http://${endpoint}`));
      const allowedHost = endpointUrl ? endpointUrl.host : undefined;
      if (allowedHost && parsed.host !== allowedHost) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: '不允许的目标主机' });
      }
      const path = parsed.pathname.replace(/^\//, '');
      const parts = path.split('/');
      const bucket = parts.shift();
      const key = parts.join('/');
      const configuredBucket = this.configService.get('MINIO_BUCKET', 'meeting-system');
      if (!bucket || !key || bucket !== configuredBucket) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: '无效的资源路径' });
      }
      const obj = await this.uploadService.getObject(key);
      res.setHeader('Content-Type', obj.contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      (obj.stream as any).pipe(res);
    } catch (_) {
      return res.status(HttpStatus.BAD_GATEWAY).end();
    }
  }
}
