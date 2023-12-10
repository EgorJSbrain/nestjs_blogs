import {
  IsEnum
} from 'class-validator'
import { LikeStatusEnum } from '../../constants/like'

export class LikeDto {
  @IsEnum(LikeStatusEnum, {
    message: 'Is\'t correct forma of like'
  })
  likeStatus: LikeStatusEnum
}
