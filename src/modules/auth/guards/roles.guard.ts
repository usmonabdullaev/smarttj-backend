import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { JwtPayload } from '../jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. забираем роли с декоратора
    const requiredRoles = this.reflector.get<UserRole[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // если не указаны роли → доступ открыт
    }

    // 2. достаём request.user (устанавливается JwtAuthGuard → JwtStrategy)
    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    }

    // 3. сверяем роль юзера
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException({
        message: 'Forbidden: insufficient role',
        code: 'FORBIDDEN',
        error: { requiredRoles, userRole: user.role },
      });
    }

    return true;
  }
}
