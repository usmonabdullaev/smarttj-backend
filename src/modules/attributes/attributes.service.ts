import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AttributesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttributeDto) {
    const exists = await this.prisma.attribute.findUnique({
      where: { slug: dto.slug },
    });

    if (exists) {
      throw new ConflictException({ message: '' });
    }

    if (dto.groupId) {
      const group = await this.prisma.attributeGroup.findUnique({
        where: { id: dto.groupId },
      });

      if (!group) {
        throw new NotFoundException({ message: 'Group not found' });
      }
    }

    const attribute = await this.prisma.attribute.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        type: dto.type,
        groupId: dto.groupId,
        filterable: dto.filterable,
        order: dto.order,

        values: {
          createMany: {
            data: dto.values,
          },
        },
      },
    });

    return attribute;
  }

  async findAll() {
    return await this.prisma.attribute.findMany({
      include: { values: true, group: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
      include: { values: true, group: true },
    });

    if (!attribute) {
      throw new NotFoundException();
    }

    return attribute;
  }

  async update(id: string, dto: UpdateAttributeDto) {
    const attribute = await this.prisma.attribute.findUnique({ where: { id } });

    if (!attribute) {
      throw new NotFoundException();
    }

    if (dto.slug && dto.slug !== attribute.slug) {
      const exists = await this.prisma.attribute.findUnique({
        where: { slug: dto.slug },
      });

      if (exists) {
        throw new ConflictException();
      }
    }

    if (dto.groupId && attribute.groupId !== dto.groupId) {
      const group = await this.prisma.attributeGroup.findUnique({
        where: { id: dto.groupId },
      });

      if (!group) {
        throw new NotFoundException();
      }
    }

    return await this.prisma.attribute.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        type: dto.type,
        groupId: dto.groupId,
        filterable: dto.filterable,
        order: dto.order,
      },
    });
  }

  async remove(id: string) {
    const attribute = await this.prisma.attribute.findUnique({ where: { id } });

    if (!attribute) {
      throw new NotFoundException();
    }

    return await this.prisma.attribute.delete({ where: { id } });
  }

  async deleteValue(id: string) {
    const attributeValue = await this.prisma.attributeValue.findUnique({
      where: { id },
    });

    if (!attributeValue) {
      throw new NotFoundException();
    }

    return await this.prisma.attributeValue.delete({ where: { id } });
  }
}
