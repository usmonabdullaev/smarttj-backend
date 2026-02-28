import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { Express } from 'express';

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

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException({
        message: 'File not found',
        code: 'FILE_NOT_FOUND',
        error: null,
      });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException({
        message: 'Incorrect file type',
        code: 'INCORRECT_FILE_TYPE',
        error: file.mimetype,
      });
    }

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
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
}
