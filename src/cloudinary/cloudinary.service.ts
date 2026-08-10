import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

import { UploadFilesRequest } from '@/cloudinary/dto/requests/upload-files.request';
import { UploadFileRequest } from '@/cloudinary/dto/requests/upload-file.request';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async uploadFile(dto: UploadFileRequest): Promise<UploadApiResponse> {
    if (!dto.file) {
      throw new BadRequestException({
        message: 'File not found',
        code: 'FILE_NOT_FOUND',
        error: null,
      });
    }

    if (!ALLOWED_MIME_TYPES.includes(dto.file.mimetype)) {
      throw new BadRequestException({
        message: 'Incorrect file type',
        code: 'INCORRECT_FILE_TYPE',
        error: dto.file.mimetype,
      });
    }

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: dto.folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(dto.file.buffer).pipe(upload);
    });
  }

  async uploadFiles(dto: UploadFilesRequest): Promise<UploadApiResponse[]> {
    if (!dto.files || dto.files.length === 0) {
      throw new BadRequestException({
        message: 'Files not found',
        code: 'FILES_NOT_FOUND',
        error: null,
      });
    }

    for (const f of dto.files) {
      if (!ALLOWED_MIME_TYPES.includes(f.mimetype)) {
        throw new BadRequestException({
          message: 'Incorrect file type',
          code: 'INCORRECT_FILE_TYPE',
          error: f.mimetype,
        });
      }
    }

    return Promise.all(
      dto.files.map((file) =>
        this.uploadFile({
          file,
          folder: dto.folder,
        }),
      ),
    );
  }

  async deleteFile(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      return result;
    } catch {
      throw new BadRequestException({
        message: 'Error while deleting',
        code: 'DELETE_ERROR',
        error: publicId,
      });
    }
  }

  async deleteFiles(publicIds: string[]) {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException({
        message: 'Files not found',
        code: 'FILES_NOT_FOUND',
        error: null,
      });
    }

    return Promise.all(
      publicIds.map(async (publicId) => {
        try {
          const result = await this.deleteFile(publicId);

          return {
            publicId,
            success: true,
            result,
          };
        } catch (error) {
          return {
            publicId,
            success: false,
            error,
          };
        }
      }),
    );
  }
}
