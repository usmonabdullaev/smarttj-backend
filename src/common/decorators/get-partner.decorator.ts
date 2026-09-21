import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Partner } from '@prisma/client';

export const GetPartner = createParamDecorator(
  (property: keyof Partner | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const partner = request.partner as Partner;

    return property ? partner?.[property] : partner;
  },
);
