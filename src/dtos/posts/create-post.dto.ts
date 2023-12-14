import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength
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

export class CreatePostDto {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(POST_TITLE_MIN_LENGTH)
  @MaxLength(POST_TITLE_MAX_LENGTH)
  title: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(POST_CONTENT_MIN_LENGTH)
  @MaxLength(POST_CONTENT_MAX_LENGTH)
  content: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(POST_SHORT_DESCRIPTION_MIN_LENGTH)
  @MaxLength(POST_SHORT_DESCRIPTION_MAX_LENGTH)
  shortDescription: string
}

export class CreatePostByBlogIdDto extends CreatePostDto {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(STRING_MAX_LENGTH)
  blogId: string
}
