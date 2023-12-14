import {
  IsEnum, IsString
} from 'class-validator'
import { LikeStatusEnum } from '../../constants/likes'
import { appMessages } from '../../constants/messages'

export class CreateLikeDto {
  @IsEnum(LikeStatusEnum, {
    message: appMessages().errors.incorrectLikeStatus
  })
  status: LikeStatusEnum

  @IsString()
  authorId: string

  @IsString()
  login: string

  @IsString()
  sourceId: string
}
