import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject } from '@nestjs/common';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly bucket: string;

  constructor(
    private configService: ConfigService,
    @Inject('S3_CLIENT') private s3Client: S3Client,
  ) {
    this.bucket = this.configService.get('MINIO_BUCKET', 'meeting-system');
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string) {
    await this.ensureBucket();
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
    return {
      key,
      url: `${this.configService.get('MINIO_ENDPOINT')}/${this.bucket}/${key}`,
    };
  }

  async getSignedUrl(key: string, expiresIn: number = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
    return { success: true };
  }

  generateKey(prefix: string, filename: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = filename.split('.').pop();
    return `${prefix}/${timestamp}-${randomString}.${extension}`;
  }

  private async ensureBucket() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (_) {
      const region = this.configService.get('AWS_REGION', 'us-east-1');
      try {
        await this.s3Client.send(
          new CreateBucketCommand({
            Bucket: this.bucket,
            CreateBucketConfiguration: region === 'us-east-1' ? undefined : { LocationConstraint: region },
          })
        );
      } catch (err: any) {
        const name = err?.name;
        if (name === 'BucketAlreadyOwnedByYou' || name === 'BucketAlreadyExists') {
          return;
        }
        throw err;
      }
      // ensure consistency
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    }
  }
}