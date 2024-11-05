import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; version: string; endpoints: string[] } {
    return {
      message: 'Welcome to the User Registration API',
      version: '1.0.0',
      endpoints: [
        '/user/register - POST: Register a new user',
        '/user/login - POST: User login',
      ],
    };
  }
}
