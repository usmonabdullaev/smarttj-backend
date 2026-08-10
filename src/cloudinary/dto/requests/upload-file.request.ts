import { Express } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';

export interface UploadFileRequest {
  file: Express.Multer.File;
  folder: string;
}
