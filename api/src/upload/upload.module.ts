import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    {
      provide: 'S3_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new S3Client({
          endpoint: configService.get('MINIO_ENDPOINT', 'http://localhost:9000'),
          region: configService.get('AWS_REGION', 'us-east-1'),
          credentials: {
            accessKeyId: configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
            secretAccessKey: configService.get('MINIO_SECRET_KEY', 'minioadmin'),
          },
          forcePathStyle: true,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['S3_CLIENT', UploadService],
})
export class UploadModule { }