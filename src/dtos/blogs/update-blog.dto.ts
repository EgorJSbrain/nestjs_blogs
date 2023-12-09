import {
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator'
import {
  STRING_MAX_LENGTH,
  URL_REGEX
} from '../../constants/global'
import {
  BLOG_DESCRIPTION_MAX_LENGTH,
  BLOG_DESCRIPTION_MIN_LENGTH,
  BLOG_NAME_MAX_LENGTH,
  BLOG_NAME_MIN_LENGTH
} from 'src/constants/blogs'

export class UpdateBlogDto {
  @IsString()
  @MinLength(BLOG_NAME_MIN_LENGTH)
  @MaxLength(BLOG_NAME_MAX_LENGTH)
  name: string

  @IsString()
  @MinLength(BLOG_DESCRIPTION_MIN_LENGTH)
  @MaxLength(BLOG_DESCRIPTION_MAX_LENGTH)
  description: string

  @IsString()
  @IsUrl()
  @MaxLength(STRING_MAX_LENGTH)
  @Matches(URL_REGEX)
  websiteUrl: string
}
