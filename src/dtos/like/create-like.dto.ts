import {
  IsEnum, IsString
} from 'class-validator'
import { LikeStatusEnum } from '../../constants/like'
import { appMessages } from '../../constants/messages'

export class CreateLikeDto {
  @IsEnum(LikeStatusEnum, {
    message: appMessages().errors.incorrectLikeStatus
  })
  likeStatus: LikeStatusEnum

  @IsString()
  authorId: string

  @IsString()
  login: string

  @IsString()
  sourceId: string
}
