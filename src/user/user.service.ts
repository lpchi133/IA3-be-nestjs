// src/user/user.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Đăng ký người dùng mới với email và username duy nhất
  async register(data: { username: string; email: string; password: string }) {
    // Kiểm tra xem người dùng với email hoặc username đã tồn tại chưa
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });

    if (existingUser) {
      // Ném lỗi nếu username hoặc email đã được sử dụng
      throw new BadRequestException('Username or email already exists');
    }

    // Băm mật khẩu để lưu trữ an toàn
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
    });

    // Trả về thông báo thành công với ID của người dùng
    return { message: 'User registered successfully', userId: user.id };
  }

  // Đăng nhập người dùng hiện có bằng cách xác thực username và password
  async login(data: { username: string; password: string }) {
    // Tìm người dùng theo username
    const user = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (!user) {
      // Ném lỗi nếu username không tồn tại
      throw new UnauthorizedException('Invalid username');
    }

    // So sánh mật khẩu đã cung cấp với mật khẩu đã băm được lưu trữ
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      // Ném lỗi nếu mật khẩu không chính xác
      throw new UnauthorizedException('Invalid password');
    }

    // Trả về thông tin người dùng (không bao gồm mật khẩu)
    const userInfo = {
      username: user.username,
      email: user.email,
    };
    return { message: 'Login successful', user: userInfo }; // Trả về thông tin người dùng
  }
}
