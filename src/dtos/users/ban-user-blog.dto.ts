import {
  IsString,
  MaxLength,
  MinLength,
  IsBoolean,
  IsDefined,
  IsUUID
} from 'class-validator'
import {
  STRING_MIN_LENGTH,
  STRING_MAX_LENGTH
} from '../../constants/global'

export class BanUserBlogDto {
  @IsBoolean()
  @IsDefined()
  isBanned: boolean

  @IsString()
  @MinLength(STRING_MIN_LENGTH)
  @MaxLength(STRING_MAX_LENGTH)
  banReason: string

  @IsString()
  @IsDefined()
  @IsUUID()
  blogId: string
}
