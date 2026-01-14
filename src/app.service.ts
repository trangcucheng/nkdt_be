import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Chào bạn tôi là Đức! Lập trình viên fullstack, rất vui được gặp bạn!';
  }
}
