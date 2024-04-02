import { Injectable } from '@nestjs/common'
import { S3StorageAdapter } from '../adapters/s3-storage-adapter.service'
import sharp from 'sharp';
import { resizeImage } from 'src/utils/resizeImage';

@Injectable()
export class UploadWallpaperUseCase {
  constructor(private s3StorageAdapter: S3StorageAdapter) {}

  async execute(
    userId: string,
    fileName: string,
    buffer: Buffer
  ) {
    this.s3StorageAdapter.saveWallpaper(userId, buffer, `wallpapers/${userId}/${fileName}`)
    // console.log("buffer:", buffer)
    // console.log("fileName:", fileName)
    // console.log('userId', userId)
  }
}