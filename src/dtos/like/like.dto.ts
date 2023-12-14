import {
  IsEnum, IsNotEmpty
} from 'class-validator'
import { LikeStatusEnum } from '../../constants/likes'
import { appMessages } from '../../constants/messages'

export class LikeDto {
  @IsEnum(LikeStatusEnum, {
    message: appMessages().errors.incorrectLikeStatus
  })
  likeStatus: LikeStatusEnum
}
