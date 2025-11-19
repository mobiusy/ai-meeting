import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('UploadService', () => {
  let service: UploadService;
  let configService: ConfigService;
  let s3Client: S3Client;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config = {
        MINIO_BUCKET: 'test-bucket',
        MINIO_ENDPOINT: 'http://localhost:9000',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockS3Client = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: 'S3_CLIENT',
          useValue: mockS3Client,
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    configService = module.get<ConfigService>(ConfigService);
    s3Client = module.get<S3Client>('S3_CLIENT');

    jest.clearAllMocks();
  });

  describe('文件上传', () => {
    it('应该成功上传文件', async () => {
      const key = 'test/file.txt';
      const buffer = Buffer.from('test content');
      const contentType = 'text/plain';

      // Mock the command properly
      const mockCommand = {
        input: {
          Bucket: 'test-bucket',
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }
      };
      mockS3Client.send.mockResolvedValue({});

      const result = await service.uploadFile(key, buffer, contentType);

      expect(result).toBeDefined();
      expect(result.key).toBe(key);
      expect(result.url).toBe('http://localhost:9000/test-bucket/test/file.txt');

      expect(S3Client).toHaveBeenCalled;
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('应该处理上传错误', async () => {
      const key = 'test/file.txt';
      const buffer = Buffer.from('test content');
      const contentType = 'text/plain';

      mockS3Client.send.mockRejectedValue(new Error('S3 upload failed'));

      await expect(service.uploadFile(key, buffer, contentType))
        .rejects
        .toThrow('S3 upload failed');
    });
  });

  describe('获取预签名URL', () => {
    it('应该生成预签名URL', async () => {
      const key = 'test/file.txt';
      const expiresIn = 3600;
      const mockSignedUrl = 'https://signed-url.example.com/file.txt';

      (getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl);

      const result = await service.getSignedUrl(key, expiresIn);

      expect(result).toBe(mockSignedUrl);
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(GetObjectCommand),
        { expiresIn }
      );
    });

    it('应该使用默认过期时间', async () => {
      const key = 'test/file.txt';
      const mockSignedUrl = 'https://signed-url.example.com/file.txt';

      (getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl);

      await service.getSignedUrl(key);

      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 3600 }
      );
    });

    it('应该处理预签名URL生成错误', async () => {
      const key = 'test/file.txt';

      (getSignedUrl as jest.Mock).mockRejectedValue(new Error('URL generation failed'));

      await expect(service.getSignedUrl(key)).rejects.toThrow('URL generation failed');
    });
  });

  describe('文件删除', () => {
    it('应该成功删除文件', async () => {
      const key = 'test/file.txt';

      mockS3Client.send.mockResolvedValue({});

      const result = await service.deleteFile(key);

      expect(result).toEqual({ success: true });
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });

    it('应该处理删除错误', async () => {
      const key = 'test/file.txt';

      mockS3Client.send.mockRejectedValue(new Error('S3 delete failed'));

      await expect(service.deleteFile(key))
        .rejects
        .toThrow('S3 delete failed');
    });
  });

  describe('生成文件键名', () => {
    it('应该生成唯一的文件键名', () => {
      const prefix = 'images';
      const filename = 'test.jpg';

      const result = service.generateKey(prefix, filename);

      expect(result).toMatch(/^images\/\d+-[a-z0-9]+\.jpg$/);
      expect(result).toContain('images/');
      expect(result).toContain('.jpg');
    });

    it('应该处理没有扩展名的文件名', () => {
      const prefix = 'documents';
      const filename = 'README';

      const result = service.generateKey(prefix, filename);

      expect(result).toMatch(/^documents\/\d+-[a-z0-9]+\.README$/);
    });

    it('应该处理复杂的文件扩展名', () => {
      const prefix = 'files';
      const filename = 'document.backup.tar.gz';

      const result = service.generateKey(prefix, filename);

      expect(result).toMatch(/^files\/\d+-[a-z0-9]+\.gz$/);
    });

    it('应该生成不同的键名每次调用', () => {
      const prefix = 'test';
      const filename = 'file.txt';

      const result1 = service.generateKey(prefix, filename);
      const result2 = service.generateKey(prefix, filename);

      expect(result1).not.toBe(result2);
    });
  });

  describe('配置验证', () => {
    it('应该使用默认存储桶名称', () => {
      const mockConfig = {
        get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
          if (key === 'MINIO_BUCKET') return defaultValue;
          return 'http://localhost:9000';
        }),
      } as unknown as ConfigService;

      const mockS3 = {
        send: jest.fn(),
      } as unknown as S3Client;

      const serviceWithDefaultBucket = new UploadService(mockConfig, mockS3);

      // 验证默认存储桶名称被使用
      expect(mockConfig.get).toHaveBeenCalledWith('MINIO_BUCKET', 'meeting-system');
    });

    it('应该使用配置的存储桶名称', () => {
      const mockConfig = {
        get: jest.fn().mockImplementation((key: string) => {
          const config = {
            MINIO_BUCKET: 'custom-bucket',
            MINIO_ENDPOINT: 'http://custom-endpoint:9000',
          };
          return config[key];
        }),
      } as unknown as ConfigService;

      const mockS3 = {
        send: jest.fn(),
      } as unknown as S3Client;

      const serviceWithCustomBucket = new UploadService(mockConfig, mockS3);

      // 验证自定义存储桶名称被使用
      expect(mockConfig.get).toHaveBeenCalledWith('MINIO_BUCKET', 'meeting-system');
    });
  });
});