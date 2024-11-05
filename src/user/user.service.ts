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

  // Register a new user with unique email and username
  async register(data: { username: string; email: string; password: string }) {
    // Check if user with the same email or username already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });

    if (existingUser) {
      // Throw error if username or email is taken
      throw new BadRequestException('Username or email already exists');
    }

    // Hash the password for secure storage
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
    });

    // Return a success message with the user ID
    return { message: 'User registered successfully', userId: user.id };
  }

  // Log in an existing user by verifying username and password
  async login(data: { username: string; password: string }) {
    // Find the user by username
    const user = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (!user) {
      // Throw error if the username does not exist
      throw new UnauthorizedException('Invalid username');
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      // Throw error if the password is incorrect
      throw new UnauthorizedException('Invalid password');
    }

    // Return a success message with the user ID
    return { message: 'Login successful', userId: user.id };
  }
}
