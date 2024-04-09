import { Injectable } from '@nestjs/common'
import { S3StorageAdapter } from '../../adapters/s3-storage.adapter'

@Injectable()
export class UploadBlogMainUseCase {
  constructor(private s3StorageAdapter: S3StorageAdapter) {}

  async execute(
    userId: string,
    fileName: string,
    buffer: Buffer
  ): Promise<string | null> {
    return await this.s3StorageAdapter.saveWallpaper(
      userId,
      buffer,
      `blogsmain/${userId}/${fileName}`
    )
  }
}
