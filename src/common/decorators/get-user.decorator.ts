import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { GetUserRequest } from '@/common/decorators/dto/requests/get-user.request';
import { ValidateRequest } from '@/auth/strategies/dto/requests/validate.request';

export const GetUser = createParamDecorator(
  (dto: GetUserRequest | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as ValidateRequest;

    return dto ? user?.[dto] : user;
  },
);
