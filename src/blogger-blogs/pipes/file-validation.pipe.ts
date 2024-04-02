import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common'
import { extname } from 'path'
import sharp from 'sharp';
import { IMG_MAX_HEIGHT, IMG_MAX_SIZE, IMG_MAX_WIDTH } from 'src/constants/global';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly allowedExtensions = ['jpg', 'jpeg', 'png']

  async transform(value: Express.Multer.File): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('No file uploaded')
    }
    const { format, size, width, height } = await sharp(value.buffer).metadata()

    if (format && !this.allowedExtensions.includes(format)) {
      throw new BadRequestException({
        message: [`Unsupported file extension: ${format}`]
      })
    }

    if (size && size > IMG_MAX_SIZE) {
      throw new BadRequestException({
        message: ['File size exceeded. Max size: 100KB']
      })
    }

    // if (width && width !== IMG_MAX_WIDTH) {
    //   throw new BadRequestException({
    //     message: ['File width exceeded. Max width: 1028px']
    //   })
    // }

    // if (height && height !== IMG_MAX_HEIGHT) {
    //   throw new BadRequestException({
    //     message: ['File height exceeded. Max height: 312px']
    //   })
    // }

    return value
  }
}
