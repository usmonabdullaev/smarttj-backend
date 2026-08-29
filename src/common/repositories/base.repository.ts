import * as runtime from '@prisma/client/runtime/client.js';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import $Utils = runtime.Types.Utils;

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class BaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>> {
    return this.prisma.$transaction(arg);
  }
}
