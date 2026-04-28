import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '../../../generated/prisma/enums';
import { ROLES_KEY } from 'src/tools/decorators/roles.decorators';

@Injectable()
class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request['role'];

    if (!userRole) {
      throw new UnauthorizedException('User role not found in request');
    }

    // Rollarni solishtirishda harf kattaligiga (case) e'tibor bermaslik - Sifat uchun
    const hasRole = requiredRoles.some(
      (role) =>
        role.toString().toUpperCase() === userRole.toString().toUpperCase(),
    );

    if (hasRole) {
      return true;
    }

    throw new UnauthorizedException(
      `You need one of these roles: ${requiredRoles.join(', ')}`,
    );
  }
}

export default RoleGuard;
