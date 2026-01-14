import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import * as mammoth from 'mammoth';
import * as pdf from 'pdf-parse';
import sharp from 'sharp';
const saltOrRounds = 10;

// Hàm băm mật khẩu
export const hashPasswordHelper = async (plainPassword: string) => {
  try {
    const hash = await bcrypt.hash(plainPassword, saltOrRounds);
    return hash;
  } catch (error) {
    console.log('Lỗi băm mật khẩu: ', error);
  }
};

// Hàm so sánh mật khẩu đã băm với mật khẩu người dùng nhập vào
export const comparedPasswordHelper = async (
  plainPassword: string,
  hashPassword: string,
) => {
  try {
    const comparedPass = await bcrypt.compare(plainPassword, hashPassword);
    return comparedPass;
  } catch (error) {
    console.log('Lỗi so sánh mật khẩu: ', error);
  }
};

// Hàm mã hóa file
export const encryptedFileHelper = async (file: Express.Multer.File) => {
  // Đọc file từ hệ thống file (vì sử dụng diskStorage)
  // Nếu không sử dụng MulterModule thì không dùng cách này
  // const filePath = join(__dirname, '../../uploads/', file.filename);
  try {
    // Kiểm tra loại file và xử lý phù hợp
    if (file.mimetype.startsWith('image/')) {
      const encryptedFile = await sharp(file.buffer)
        .resize(800) // Thay đổi kích thước ảnh thành 800px
        .jpeg({ quality: 80 }) // Chuyển thành JPEG với chất lượng 80%
        .toBuffer();
      return encryptedFile;
    } else if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.convertToHtml({ buffer: file.buffer });
      return result.value;
    } else if (file.mimetype === 'application/pdf') {
      const pdfData = await pdf(file.buffer);
      return pdfData.text;
    } else {
      throw new BadRequestException('Unsupported file type');
    }
  } catch (error) {
    console.log('Lỗi mã hóa file:', error);
    throw new BadRequestException('Error encrypting file');
  }
};

// Hàm kiểm tra định dạng email hợp lệ
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

