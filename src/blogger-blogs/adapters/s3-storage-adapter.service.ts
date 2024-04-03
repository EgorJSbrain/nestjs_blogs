import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'


@Injectable()
export class S3StorageAdapter {
  s3Client: S3Client
  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('S3.REGION') ?? '',
      endpoint: this.configService.get<string>('S3.ENDPOINT') ?? '',
      credentials: {
        accessKeyId: this.configService.get<string>('S3.ACCESS_ID') ?? '',
        secretAccessKey: this.configService.get<string>('S3.ACCESS_SECRET_KEY') ?? '',
      }
    })
  }

  async saveWallpaper(
    userId: string,
    buffer: Buffer,
    key: string
  ): Promise<string | null> {
    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('S3.BUCKET') ?? '',
      Key: key,
      Body: buffer,
      ContentType: 'image/png'
    });
    try {
      const response = await this.s3Client.send(command)

      if (!response) {
        return null
      }

      if (response.$metadata.httpStatusCode === 200) {
        const bucket = this.configService.get<string>('S3.BUCKET') ?? ''
        const region = this.configService.get<string>('S3.REGION') ?? ''

        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
      } else {
        return null
      }

    } catch (err) {
      console.error(err)
      throw new Error(err)
    }
  }
}
