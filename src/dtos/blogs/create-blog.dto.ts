import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
  MinLength
} from 'class-validator'
import {
  STRING_MAX_LENGTH,
} from '../../constants/global'
import {
  BLOG_DESCRIPTION_MAX_LENGTH,
  BLOG_DESCRIPTION_MIN_LENGTH,
  BLOG_NAME_MAX_LENGTH,
  BLOG_NAME_MIN_LENGTH
} from '../../constants/blogs'

export class CreateBlogDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(BLOG_NAME_MIN_LENGTH)
  @MaxLength(BLOG_NAME_MAX_LENGTH)
  name: string

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(BLOG_DESCRIPTION_MIN_LENGTH)
  @MaxLength(BLOG_DESCRIPTION_MAX_LENGTH)
  description: string

  @IsDefined()
  @IsString()
  @IsUrl()
  @MaxLength(STRING_MAX_LENGTH)
  websiteUrl: string
}
