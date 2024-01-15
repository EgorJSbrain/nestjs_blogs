import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import {
  POST_TITLE_MIN_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_CONTENT_MIN_LENGTH,
  POST_CONTENT_MAX_LENGTH,
  POST_SHORT_DESCRIPTION_MIN_LENGTH,
  POST_SHORT_DESCRIPTION_MAX_LENGTH,
} from '../../constants/posts'

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(POST_TITLE_MIN_LENGTH)
  @MaxLength(POST_TITLE_MAX_LENGTH)
  title: string

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(POST_CONTENT_MIN_LENGTH)
  @MaxLength(POST_CONTENT_MAX_LENGTH)
  content: string

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(POST_SHORT_DESCRIPTION_MIN_LENGTH)
  @MaxLength(POST_SHORT_DESCRIPTION_MAX_LENGTH)
  shortDescription: string
}