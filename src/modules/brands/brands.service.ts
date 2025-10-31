import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from 'src/database/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class BrandsService {
  constructor(
    readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createBrandDto: CreateBrandDto, logoId?: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug: createBrandDto.slug },
    });

    if (brand) {
      throw new ConflictException();
    }

    return await this.prisma.brand.create({
      data: {
        name: createBrandDto.name,
        slug: createBrandDto.slug,
        order: createBrandDto.order,
        popular: createBrandDto.popular,
        logo: createBrandDto.logo,
        logoId,
      },
    });
  }

  async findAll() {
    return await this.prisma.brand.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} brand`;
  }

  update(id: number, updateBrandDto: UpdateBrandDto) {
    return `This action updates a #${id} brand`;
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });

    if (!brand) {
      throw new NotFoundException();
    }

    if (brand.logoId) {
      await this.cloudinary.deleteFile(brand.logoId);
    }

    return await this.prisma.brand.delete({ where: { id } });
  }
}
