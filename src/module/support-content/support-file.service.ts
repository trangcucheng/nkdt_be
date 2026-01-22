import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSupportFileDto } from './dto/create-support-file.dto';
import { UpdateSupportFileDto } from './dto/update-support-file.dto';
import { GetSupportFileQueryDto } from './dto/get-support-file-query.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SupportFileService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo record file hỗ trợ mới sau khi upload thành công
   */
  async create(userId: string, createSupportFileDto: CreateSupportFileDto, file: Express.Multer.File) {
    // Tạo đường dẫn lưu trữ
    const uploadDir = path.join(process.cwd(), 'uploads', 'support-files');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Tạo tên file unique
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    const relativePath = path.join('support-files', uniqueFileName);

    // Lưu file
    fs.writeFileSync(filePath, file.buffer);

    // Decode filename to handle UTF-8 properly
    const decodedFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    // Tạo record trong database
    const createdFile = await this.prisma.supportFile.create({
      data: {
        ...createSupportFileDto,
        fileName: decodedFileName,
        filePath: relativePath,
        fileSize: BigInt(file.size),
        fileType: file.mimetype,
        uploadedBy: userId,
      },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Convert BigInt to Number for JSON serialization
    return {
      ...createdFile,
      fileSize: Number(createdFile.fileSize),
    };
  }

  /**
   * Lấy danh sách file (cho user thường)
   */
  async findAllForUsers(query: GetSupportFileQueryDto) {
    const { category, fileType, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (fileType) {
      where.fileType = fileType;
    }

    const [files, total] = await Promise.all([
      this.prisma.supportFile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          fileName: true,
          fileType: true,
          category: true,
          description: true,
          fileSize: true,
          downloadCount: true,
          createdAt: true,
          uploader: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.supportFile.count({ where }),
    ]);

    // Convert BigInt to Number for JSON serialization
    const filesWithSize = files.map(file => ({
      ...file,
      fileSize: Number(file.fileSize),
    }));

    return {
      data: filesWithSize,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy danh sách file (cho admin - bao gồm inactive)
   */
  async findAllForAdmin(query: GetSupportFileQueryDto) {
    const { category, fileType, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (fileType) {
      where.fileType = fileType;
    }

    const [files, total] = await Promise.all([
      this.prisma.supportFile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.supportFile.count({ where }),
    ]);

    // Convert BigInt to Number for JSON serialization
    const filesWithSize = files.map(file => ({
      ...file,
      fileSize: Number(file.fileSize),
    }));

    return {
      data: filesWithSize,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết file và tăng download count
   */
  async findOne(id: string) {
    const file = await this.prisma.supportFile.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException('Không tìm thấy file');
    }

    return {
      ...file,
      fileSize: Number(file.fileSize),
    };
  }

  /**
   * Cập nhật thông tin file
   */
  async update(id: string, updateSupportFileDto: UpdateSupportFileDto) {
    const file = await this.prisma.supportFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('Không tìm thấy file');
    }

    const updatedFile = await this.prisma.supportFile.update({
      where: { id },
      data: updateSupportFileDto,
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      ...updatedFile,
      fileSize: Number(updatedFile.fileSize),
    };
  }

  /**
   * Xóa file
   */
  async remove(id: string) {
    const file = await this.prisma.supportFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('Không tìm thấy file');
    }

    // Xóa file vật lý
    const fullPath = path.join(process.cwd(), 'uploads', file.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Xóa record trong database
    await this.prisma.supportFile.delete({
      where: { id },
    });

    return { message: 'Xóa file thành công' };
  }

  /**
   * Download file và tăng counter
   */
  async downloadFile(id: string) {
    const file = await this.prisma.supportFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('Không tìm thấy file');
    }

    if (!file.isActive) {
      throw new BadRequestException('File không khả dụng');
    }

    const fullPath = path.join(process.cwd(), 'uploads', file.filePath);
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('File không tồn tại trên server');
    }

    // Tăng download count
    await this.prisma.supportFile.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return {
      filePath: fullPath,
      fileName: file.fileName,
      fileType: file.fileType,
    };
  }

  /**
   * Thống kê file
   */
  async getStatistics() {
    const totalFiles = await this.prisma.supportFile.count();
    const activeFiles = await this.prisma.supportFile.count({
      where: { isActive: true },
    });

    const filesByCategory = await this.prisma.supportFile.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      where: { isActive: true },
    });

    const filesByType = await this.prisma.supportFile.groupBy({
      by: ['fileType'],
      _count: {
        id: true,
      },
      where: { isActive: true },
    });

    const totalDownloads = await this.prisma.supportFile.aggregate({
      _sum: {
        downloadCount: true,
      },
      where: { isActive: true },
    });

    return {
      totalFiles,
      activeFiles,
      inactiveFiles: totalFiles - activeFiles,
      filesByCategory: filesByCategory.map(item => ({
        category: item.category,
        count: item._count.id,
      })),
      filesByType: filesByType.map(item => ({
        type: item.fileType,
        count: item._count.id,
      })),
      totalDownloads: totalDownloads._sum.downloadCount || 0,
    };
  }
}