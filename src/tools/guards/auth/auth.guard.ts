import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token not provided!');
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.ACCESS_SECRET,
      });
      request['user'] = {
        id: payload.id,
        role: payload.role,
        email: payload.email,
      };

      request['role'] = payload.role;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token!');
    }
  }
}

export default AuthGuard;
