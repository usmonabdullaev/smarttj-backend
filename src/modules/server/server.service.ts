import { Injectable } from '@nestjs/common';
import * as os from 'os';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class ServerService {
  constructor(private prisma: PrismaService) {}

  async info() {
    const dbUrl = new URL(process.env.DATABASE_URL as string);

    const dbVersion: [
      {
        version: string;
      },
    ] = await this.prisma.$queryRaw`SELECT version()`;

    return {
      node: {
        version: process.version,
      },
      os: {
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        arch: os.arch(),
        cpu: os.cpus()[0].model,
        memory: {
          total: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
          free: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        },
        hostname: os.hostname(),
        uptime: this.formatUptime(os.uptime()),
      },
      database: {
        version: dbVersion[0].version,
        host: dbUrl.host,
        name: dbUrl.pathname.split('/')[1],
      },
    };
  }

  async status() {
    const dbVersion: [
      {
        version: string;
      },
    ] = await this.prisma.$queryRaw`SELECT version()`;

    if (!dbVersion[0].version) {
      return { database: 'error', server: 'ok' };
    }

    return {
      database: 'ok',
      server: 'ok',
    };
  }

  private formatUptime(seconds: number) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (d > 0) parts.push(`${d} дн.`);
    if (h > 0) parts.push(`${h} ч.`);
    if (m > 0) parts.push(`${m} мин.`);
    if (s > 0 || parts.length === 0) parts.push(`${s} сек.`);

    return `Система работает уже: ${parts.join(' ')}`;
  }
}
