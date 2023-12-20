import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator'
import {
  STRING_MAX_LENGTH,
} from '../../constants/global'

export class CreateDeviceDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(STRING_MAX_LENGTH)
  ip: string

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(STRING_MAX_LENGTH)
  userId: string

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(STRING_MAX_LENGTH)
  title: string
}