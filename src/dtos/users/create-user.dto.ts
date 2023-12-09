import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator'
import {
  EMAIL_REGEX,
  LOGIN_MAX_LENGTH,
  LOGIN_MIN_LENGTH,
  LOGIN_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  STRING_MAX_LENGTH
} from '../../constants/global'

export class CreateUserDto {
  @IsString()
  @MinLength(LOGIN_MIN_LENGTH)
  @MaxLength(LOGIN_MAX_LENGTH)
  @Matches(LOGIN_REGEX)
  login: string

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string

  @IsString()
  @IsEmail()
  @MaxLength(STRING_MAX_LENGTH)
  @Matches(EMAIL_REGEX)
  email: string
}
