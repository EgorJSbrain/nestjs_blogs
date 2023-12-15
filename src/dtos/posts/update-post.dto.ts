import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Validate
} from 'class-validator'
import {
  STRING_MAX_LENGTH,
} from '../../constants/global'
import {
  POST_TITLE_MIN_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_CONTENT_MIN_LENGTH,
  POST_CONTENT_MAX_LENGTH,
  POST_SHORT_DESCRIPTION_MIN_LENGTH,
  POST_SHORT_DESCRIPTION_MAX_LENGTH,
} from '../../constants/posts'
import { BlogIdValidator } from '../../validators/blog-id.validator'

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

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(STRING_MAX_LENGTH)
  @Validate(BlogIdValidator)
  blogId: string
}