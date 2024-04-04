import { Injectable } from '@nestjs/common'
import { S3StorageAdapter } from '../adapters/s3-storage-adapter.service'
import { ImageSizeEnum } from 'src/enums/ImageSizeEnum'
import { IImageMainForPost, Image } from 'src/types/files'

@Injectable()
export class UploadPostMainUseCase {
  constructor(private s3StorageAdapter: S3StorageAdapter) {}

  async execute(
    userId: string,
    fileName: string,
    resizedFile: IImageMainForPost
  ): Promise<Image | null> {
    const { buffer, size, width, height, fileSize } = resizedFile

    const url = await this.s3StorageAdapter.saveWallpaper(
      userId,
      buffer,
      `postsmain/${size}/${userId}/${fileName}`
    )

    return {
      url: url ?? '',
      width,
      height,
      fileSize,
      size
    }
  }
}
