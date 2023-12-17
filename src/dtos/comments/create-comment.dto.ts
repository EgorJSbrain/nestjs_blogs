import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'
import {
  COMMENT_CONTENT_MIN_LENGTH,
  COMMENT_CONTENT_MAX_LENGTH
} from '../../constants/comments'

export class CommentDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(COMMENT_CONTENT_MIN_LENGTH)
  @MaxLength(COMMENT_CONTENT_MAX_LENGTH)
  content: string
}
