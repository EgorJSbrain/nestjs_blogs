import { Injectable, PipeTransform, BadRequestException, HttpException, HttpStatus } from '@nestjs/common'
import { IMG_MAX_SIZE } from '../../constants/global'
import { getFileMetadata } from '../../utils/getFileMetadata'
import { checkIsAllowedImgFileFormat } from '../../utils/checkImgFileFormat'
import { appMessages } from '../../constants/messages'

@Injectable()
export class FileValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File): Promise<Express.Multer.File> {
    try {
      if (!value) {
        throw new BadRequestException('No file uploaded')
      }

      const { format, size } = await getFileMetadata(value.buffer)

      if (format && !checkIsAllowedImgFileFormat(format)) {
        throw new BadRequestException({
          message: [`Unsupported file extension: ${format}`]
        })
      }

      if (size && size > IMG_MAX_SIZE) {
        throw new BadRequestException({
          message: ['File size exceeded. Max size: 100KB']
        })
      }

      return value
    } catch(err) {
      throw new HttpException(
        { message: err.messages || appMessages().errors.somethingIsWrong },
        HttpStatus.BAD_REQUEST
      )
    }
  }
}
