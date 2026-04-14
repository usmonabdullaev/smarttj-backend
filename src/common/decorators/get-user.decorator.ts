import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayload } from '../../modules/auth/strategies/jwt.strategy';

export type GetUserDataType = 'userId' | 'sessionId' | 'role';

export const GetUser = createParamDecorator(
  (data: GetUserDataType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    return data ? user?.[data] : user;
  },
);
