import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestApp } from '../utils/test-app';
import { TestAuth } from '../utils/test-auth';
import * as fs from 'fs';
import * as path from 'path';

describe('UploadController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const { app: testApp } = await TestApp.createApp();
    app = testApp;
    TestAuth.setApp(app);
  });

  afterAll(async () => {
    await TestApp.closeApp();
  });

  beforeEach(async () => {
    await TestApp.cleanDatabase();
    
    // 创建已认证用户
    const user = await TestAuth.createAuthenticatedUser();
    authToken = user.token;
  });

  describe('上传图片 (POST /upload/image)', () => {
    it('应该成功上传JPEG图片', async () => {
      const testImagePath = path.join(__dirname, '../../test-upload.txt');
      
      // 创建一个测试图片文件
      const testContent = 'test image content';
      fs.writeFileSync(testImagePath, testContent);

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath, {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.key).toMatch(/^images\/\d+-[a-z0-9]+\.jpg$/);
      expect(response.body.data.url).toContain('http://localhost:9000');
      expect(response.body.data.size).toBe(testContent.length);
      expect(response.body.data.mimetype).toBe('image/jpeg');

      // 清理测试文件
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    it('应该成功上传PNG图片', async () => {
      const testImagePath = path.join(__dirname, '../../test-upload.txt');
      
      // 创建一个测试图片文件
      const testContent = 'test png content';
      fs.writeFileSync(testImagePath, testContent);

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath, {
          filename: 'test.png',
          contentType: 'image/png',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mimetype).toBe('image/png');

      // 清理测试文件
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    it('应该成功上传GIF图片', async () => {
      const testImagePath = path.join(__dirname, '../../test-upload.txt');
      
      // 创建一个测试图片文件
      const testContent = 'test gif content';
      fs.writeFileSync(testImagePath, testContent);

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath, {
          filename: 'test.gif',
          contentType: 'image/gif',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mimetype).toBe('image/gif');

      // 清理测试文件
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    it('应该成功上传WebP图片', async () => {
      const testImagePath = path.join(__dirname, '../../test-upload.txt');
      
      // 创建一个测试图片文件
      const testContent = 'test webp content';
      fs.writeFileSync(testImagePath, testContent);

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath, {
          filename: 'test.webp',
          contentType: 'image/webp',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mimetype).toBe('image/webp');

      // 清理测试文件
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    it('应该失败当上传不支持的图片格式', async () => {
      const testFilePath = path.join(__dirname, '../../test-upload.txt');
      
      // 创建一个测试文件
      fs.writeFileSync(testFilePath, 'test content');

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath, {
          filename: 'test.bmp',
          contentType: 'image/bmp',
        })
        .expect(500);

      expect(response.body.message).toContain('不支持的图片格式');

      // 清理测试文件
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    it('应该失败当没有上传文件', async () => {
      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.message).toContain('文件不能为空');
    });

    it('应该失败当未认证', async () => {
      const testFilePath = path.join(__dirname, '../../test-upload.txt');
      
      fs.writeFileSync(testFilePath, 'test content');

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .attach('file', testFilePath, {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(401);

      expect(response.body).toBeDefined();

      // 清理测试文件
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });
  });

  describe('上传文档 (POST /upload/document)', () => {
    it('应该成功上传PDF文档', async () => {
      const testDocPath = path.join(__dirname, '../../test-upload.txt');
      
      // 创建一个测试文档
      const testContent = 'PDF document content';
      fs.writeFileSync(testDocPath, testContent);

      const response = await request(app.getHttpServer())
        .post('/upload/document')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testDocPath, {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        })
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.key).toMatch(/^documents\/\d+-[a-z0-9]+\.pdf$/);
      expect(response.body.data.url).toContain('http://localhost:9000');
      expect(response.body.data.size).toBe(testContent.length);
      expect(response.body.data.mimetype).toBe('application/pdf');

      // 清理测试文件
      if (fs.existsSync(testDocPath)) {
        fs.unlinkSync(testDocPath);
      }
    });

    it('应该成功上传Word文档(.doc)', async () => {
      const testDocPath = path.join(__dirname, '../../test-upload.txt');
      
      fs.writeFileSync(testDocPath, 'Word document content');

      const response = await request(app.getHttpServer())
        .post('/upload/document')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testDocPath, {
          filename: 'document.doc',
          contentType: 'application/msword',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mimetype).toBe('application/msword');

      if (fs.existsSync(testDocPath)) {
        fs.unlinkSync(testDocPath);
      }
    });

    it('应该成功上传Word文档(.docx)', async () => {
      const testDocPath = path.join(__dirname, '../../test-upload.txt');
      
      fs.writeFileSync(testDocPath, 'Word 2007+ document content');

      const response = await request(app.getHttpServer())
        .post('/upload/document')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testDocPath, {
          filename: 'document.docx',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mimetype).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');

      if (fs.existsSync(testDocPath)) {
        fs.unlinkSync(testDocPath);
      }
    });

    it('应该成功上传纯文本文档', async () => {
      const testDocPath = path.join(__dirname, '../../test-upload.txt');
      
      fs.writeFileSync(testDocPath, 'Plain text document content');

      const response = await request(app.getHttpServer())
        .post('/upload/document')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testDocPath, {
          filename: 'notes.txt',
          contentType: 'text/plain',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mimetype).toBe('text/plain');

      if (fs.existsSync(testDocPath)) {
        fs.unlinkSync(testDocPath);
      }
    });

    it('应该失败当上传不支持的文档格式', async () => {
      const testFilePath = path.join(__dirname, '../../test-upload.txt');
      
      fs.writeFileSync(testFilePath, 'executable content');

      const response = await request(app.getHttpServer())
        .post('/upload/document')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath, {
          filename: 'program.exe',
          contentType: 'application/x-msdownload',
        })
        .expect(500);

      expect(response.body.message).toContain('不支持的文档格式');

      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    it('应该失败当没有上传文件', async () => {
      const response = await request(app.getHttpServer())
        .post('/upload/document')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.message).toContain('文件不能为空');
    });

    it('应该失败当未认证', async () => {
      const testFilePath = path.join(__dirname, '../../test-upload.txt');
      
      fs.writeFileSync(testFilePath, 'document content');

      const response = await request(app.getHttpServer())
        .post('/upload/document')
        .attach('file', testFilePath, {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        })
        .expect(401);

      expect(response.body).toBeDefined();

      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });
  });

  describe('文件上传错误处理', () => {
    it('应该处理大文件上传', async () => {
      const testFilePath = path.join(__dirname, '../../large-test-file.txt');
      
      // 创建一个大文件 (10MB)
      const largeContent = 'x'.repeat(10 * 1024 * 1024);
      fs.writeFileSync(testFilePath, largeContent);

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath, {
          filename: 'large-image.jpg',
          contentType: 'image/jpeg',
        });

      // 根据配置，可能会成功或失败
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);

      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    it('应该处理特殊文件名的上传', async () => {
      const testFilePath = path.join(__dirname, '../../test-upload.txt');
      
      fs.writeFileSync(testFilePath, 'test content');

      const specialFilenames = [
        '文件 名称 中文.jpg',
        'file-with-special-chars-@#$%.jpg',
        'very_long_filename_with_many_characters_that_might_cause_issues.jpg',
        'file with spaces and (parentheses).jpg',
      ];

      for (const filename of specialFilenames) {
        const response = await request(app.getHttpServer())
          .post('/upload/image')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', testFilePath, {
            filename: filename,
            contentType: 'image/jpeg',
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      }

      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });
  });
});