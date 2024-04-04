import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common'
import { BLOG_MAIN_IMG_MAX } from '../../constants/global';
import { getFileMetadata } from '../../utils/getFileMetadata'

@Injectable()
export class FileBlogMainValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('No file uploaded')
    }
    const { width, height } = await getFileMetadata(value.buffer)

    if (width && width !== BLOG_MAIN_IMG_MAX) {
      throw new BadRequestException({
        message: ['File width exceeded. Max width: 156px']
      })
    }

    if (height && height !== BLOG_MAIN_IMG_MAX) {
      throw new BadRequestException({
        message: ['File height exceeded. Max height: 156px']
      })
    }

    return value
  }
}
