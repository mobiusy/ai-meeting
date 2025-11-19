import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { Express } from 'express';

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: UploadService;

  const mockUploadService = {
    uploadFile: jest.fn(),
    generateKey: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    uploadService = module.get<UploadService>(UploadService);

    jest.clearAllMocks();
  });

  describe('上传图片', () => {
    it('应该成功上传图片文件', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test image content'),
      };

      const mockKey = 'images/1234567890-abc123.jpg';
      const mockUploadResult = {
        key: mockKey,
        url: 'http://localhost:9000/test-bucket/images/1234567890-abc123.jpg',
      };

      mockUploadService.generateKey.mockReturnValue(mockKey);
      mockUploadService.uploadFile.mockResolvedValue(mockUploadResult);

      const result = await controller.uploadImage(mockFile);

      expect(result).toEqual({
        success: true,
        data: {
          key: mockKey,
          url: mockUploadResult.url,
          size: mockFile.size,
          mimetype: mockFile.mimetype,
        },
      });

      expect(uploadService.generateKey).toHaveBeenCalledWith('images', mockFile.originalname);
      expect(uploadService.uploadFile).toHaveBeenCalledWith(
        mockKey,
        mockFile.buffer,
        mockFile.mimetype
      );
    });

    it('应该抛出错误当文件为空', async () => {
      const mockFile = undefined;

      await expect(controller.uploadImage(mockFile)).rejects.toThrow('文件不能为空');
    });

    it('应该抛出错误当图片格式不支持', async () => {
      const mockFile = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('test content'),
      };

      await expect(controller.uploadImage(mockFile)).rejects.toThrow('不支持的图片格式');
    });

    it('应该支持多种图片格式', async () => {
      const supportedFormats = [
        { mimetype: 'image/jpeg', extension: 'jpg' },
        { mimetype: 'image/png', extension: 'png' },
        { mimetype: 'image/gif', extension: 'gif' },
        { mimetype: 'image/webp', extension: 'webp' },
      ];

      for (const format of supportedFormats) {
        const mockFile = {
          originalname: `test.${format.extension}`,
          mimetype: format.mimetype,
          size: 1024,
          buffer: Buffer.from('test content'),
        };

        const mockKey = `images/1234567890-abc123.${format.extension}`;
        const mockUploadResult = {
          key: mockKey,
          url: `http://localhost:9000/test-bucket/${mockKey}`,
        };

        mockUploadService.generateKey.mockReturnValue(mockKey);
        mockUploadService.uploadFile.mockResolvedValue(mockUploadResult);

        const result = await controller.uploadImage(mockFile);

        expect(result.success).toBe(true);
        expect(result.data.mimetype).toBe(format.mimetype);
        
        jest.clearAllMocks();
      }
    });
  });

  describe('上传文档', () => {
    it('应该成功上传PDF文档', async () => {
      const mockFile = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 2048,
        buffer: Buffer.from('PDF content'),
      };

      const mockKey = 'documents/1234567890-abc123.pdf';
      const mockUploadResult = {
        key: mockKey,
        url: 'http://localhost:9000/test-bucket/documents/1234567890-abc123.pdf',
      };

      mockUploadService.generateKey.mockReturnValue(mockKey);
      mockUploadService.uploadFile.mockResolvedValue(mockUploadResult);

      const result = await controller.uploadDocument(mockFile);

      expect(result).toEqual({
        success: true,
        data: {
          key: mockKey,
          url: mockUploadResult.url,
          size: mockFile.size,
          mimetype: mockFile.mimetype,
        },
      });

      expect(uploadService.generateKey).toHaveBeenCalledWith('documents', mockFile.originalname);
      expect(uploadService.uploadFile).toHaveBeenCalledWith(
        mockKey,
        mockFile.buffer,
        mockFile.mimetype
      );
    });

    it('应该成功上传Word文档', async () => {
      const mockFile = {
        originalname: 'document.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 3072,
        buffer: Buffer.from('Word document content'),
      };

      const mockKey = 'documents/1234567890-abc123.docx';
      const mockUploadResult = {
        key: mockKey,
        url: 'http://localhost:9000/test-bucket/documents/1234567890-abc123.docx',
      };

      mockUploadService.generateKey.mockReturnValue(mockKey);
      mockUploadService.uploadFile.mockResolvedValue(mockUploadResult);

      const result = await controller.uploadDocument(mockFile);

      expect(result.success).toBe(true);
      expect(result.data.mimetype).toBe(mockFile.mimetype);
    });

    it('应该成功上传纯文本文档', async () => {
      const mockFile = {
        originalname: 'notes.txt',
        mimetype: 'text/plain',
        size: 512,
        buffer: Buffer.from('Plain text content'),
      };

      const mockKey = 'documents/1234567890-abc123.txt';
      const mockUploadResult = {
        key: mockKey,
        url: 'http://localhost:9000/test-bucket/documents/1234567890-abc123.txt',
      };

      mockUploadService.generateKey.mockReturnValue(mockKey);
      mockUploadService.uploadFile.mockResolvedValue(mockUploadResult);

      const result = await controller.uploadDocument(mockFile);

      expect(result.success).toBe(true);
      expect(result.data.mimetype).toBe(mockFile.mimetype);
    });

    it('应该抛出错误当文件为空', async () => {
      const mockFile = undefined;

      await expect(controller.uploadDocument(mockFile)).rejects.toThrow('文件不能为空');
    });

    it('应该抛出错误当文档格式不支持', async () => {
      const mockFile = {
        originalname: 'document.exe',
        mimetype: 'application/x-msdownload',
        size: 1024,
        buffer: Buffer.from('executable content'),
      };

      await expect(controller.uploadDocument(mockFile)).rejects.toThrow('不支持的文档格式');
    });

    it('应该支持多种文档格式', async () => {
      const supportedFormats = [
        { mimetype: 'application/pdf', extension: 'pdf' },
        { mimetype: 'application/msword', extension: 'doc' },
        { mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: 'docx' },
        { mimetype: 'text/plain', extension: 'txt' },
      ];

      for (const format of supportedFormats) {
        const mockFile = {
          originalname: `document.${format.extension}`,
          mimetype: format.mimetype,
          size: 1024,
          buffer: Buffer.from('test content'),
        };

        const mockKey = `documents/1234567890-abc123.${format.extension}`;
        const mockUploadResult = {
          key: mockKey,
          url: `http://localhost:9000/test-bucket/${mockKey}`,
        };

        mockUploadService.generateKey.mockReturnValue(mockKey);
        mockUploadService.uploadFile.mockResolvedValue(mockUploadResult);

        const result = await controller.uploadDocument(mockFile);

        expect(result.success).toBe(true);
        expect(result.data.mimetype).toBe(format.mimetype);
        
        jest.clearAllMocks();
      }
    });
  });

  describe('错误处理', () => {
    it('应该处理上传服务错误', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test image content'),
      };

      mockUploadService.generateKey.mockReturnValue('images/test.jpg');
      mockUploadService.uploadFile.mockRejectedValue(new Error('Upload service error'));

      await expect(controller.uploadImage(mockFile)).rejects.toThrow('Upload service error');
    });

    it('应该处理键名生成错误', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test image content'),
      };

      mockUploadService.generateKey.mockImplementation(() => {
        throw new Error('Key generation failed');
      });

      await expect(controller.uploadImage(mockFile)).rejects.toThrow('Key generation failed');
    });
  });
});