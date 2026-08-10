import { UserRole } from '@prisma/client';
import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { ValidateRequest } from '@/auth/strategies/dto/requests/validate.request';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user: ValidateRequest }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        error: null,
      });
    }

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
