import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common'
import {
  POST_MAIN_IMG_MAX_HEIGHT,
  POST_MAIN_IMG_MAX_WIDTH
} from '../../constants/global'
import { getFileMetadata } from '../../utils/getFileMetadata'

@Injectable()
export class FilePostMainValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('No file uploaded')
    }

    const { width, height } = await getFileMetadata(value.buffer)

    if (width && width !== POST_MAIN_IMG_MAX_WIDTH) {
      throw new BadRequestException({
        message: ['File width exceeded. Max width: 940px']
      })
    }

    if (height && height !== POST_MAIN_IMG_MAX_HEIGHT) {
      throw new BadRequestException({
        message: ['File height exceeded. Max height: 432px']
      })
    }

    return value
  }
}
