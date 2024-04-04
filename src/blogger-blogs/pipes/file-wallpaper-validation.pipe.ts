import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common'
import {
  BLOG_WALLPAPER_IMG_MAX_HEIGHT,
  BLOG_WALLPAPER_IMG_MAX_WIDTH,
} from '../../constants/global'
import { getFileMetadata } from '../../utils/getFileMetadata'

@Injectable()
export class FileWallpaperValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('No file uploaded')
    }
    const { width, height } = await getFileMetadata(value.buffer)

    if (width && width !== BLOG_WALLPAPER_IMG_MAX_WIDTH) {
      throw new BadRequestException({
        message: ['File width exceeded. Max width: 1028px']
      })
    }

    if (height && height !== BLOG_WALLPAPER_IMG_MAX_HEIGHT) {
      throw new BadRequestException({
        message: ['File height exceeded. Max height: 312px']
      })
    }

    return value
  }
}
