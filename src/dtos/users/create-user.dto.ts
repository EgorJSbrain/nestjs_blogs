import { IsEmail, IsString, Length } from "class-validator"

export class CreateUserDto {
  @IsString()
  @Length(3, 255)
  login: string

  @IsString()
  @Length(5, 10)
  password: string

  @IsString()
  @IsEmail()
  email: string
}
