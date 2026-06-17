import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { Express } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';

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

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
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

  async uploadFiles(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<UploadApiResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException({
        message: 'Files not found',
        code: 'FILES_NOT_FOUND',
        error: null,
      });
    }

    for (const f of files) {
      if (!ALLOWED_MIME_TYPES.includes(f.mimetype)) {
        throw new BadRequestException({
          message: 'Incorrect file type',
          code: 'INCORRECT_FILE_TYPE',
          error: f.mimetype,
        });
      }
    }

    return Promise.all(files.map((file) => this.uploadFile(file, folder)));
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
