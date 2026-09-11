import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PartnerRepository, UserRepository } from '@/common/repositories';
import { UpdatePartnerProfileDto } from './dto';

@Injectable()
export class PartnerProfileService {
  constructor(
    private readonly partnerRepository: PartnerRepository,
    private readonly userRepository: UserRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  /**
   * Получить профиль партнёра по userId
   */
  async getProfile(userId: string) {
    const partner = await this.partnerRepository.findByUserId(userId);

    if (!partner) {
      throw new NotFoundException({
        message: 'Partner profile not found',
        code: 'PARTNER_NOT_FOUND',
      });
    }

    return partner;
  }

  /**
   * Обновить данные партнёра
   */
  async updateProfile(userId: string, dto: UpdatePartnerProfileDto) {
    await this.getProfile(userId);

    return await this.partnerRepository.updateByUserId(userId, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.about !== undefined && { about: dto.about }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.phone1 !== undefined && { phone1: dto.phone1 }),
      ...(dto.phone2 !== undefined && { phone2: dto.phone2 }),
      ...(dto.address1 !== undefined && { address1: dto.address1 }),
      ...(dto.address2 !== undefined && { address2: dto.address2 }),
      ...(dto.inn !== undefined && { inn: dto.inn }),
      ...(dto.alifTerminalId !== undefined && {
        alifTerminalId: dto.alifTerminalId,
      }),
      ...(dto.bankName !== undefined && { bankName: dto.bankName }),
      ...(dto.bankAccount !== undefined && { bankAccount: dto.bankAccount }),
      ...(dto.bik !== undefined && { bik: dto.bik }),
      ...(dto.cardAccount !== undefined && { cardAccount: dto.cardAccount }),
    });
  }

  /**
   * Загрузка или обновление логотипа партнёра
   */
  async uploadLogo(userId: string, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        message: 'File not provided',
        code: 'FILE_NOT_FOUND',
      });
    }

    const partner = await this.getProfile(userId);

    const upload = await this.cloudinary.uploadFile({
      file,
      folder: 'partner',
    });

    if (!upload) {
      throw new BadRequestException({
        message: 'Failed to upload logo',
        code: 'UPLOAD_FAILED',
      });
    }

    // Если у партнёра уже был логотип в Cloudinary, удаляем старый
    if (partner.logoId) {
      await this.cloudinary.deleteFile(partner.logoId);
    }

    return await this.partnerRepository.updateByUserId(userId, {
      logo: upload.secure_url,
      logoId: upload.public_id,
    });
  }

  /**
   * Удаление логотипа партнёра
   */
  async deleteLogo(userId: string) {
    const partner = await this.getProfile(userId);

    if (partner.logoId) {
      await this.cloudinary.deleteFile(partner.logoId);
    }

    return await this.partnerRepository.updateByUserId(userId, {
      logo: null,
      logoId: null,
    });
  }
}
