import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { Transform, TransformFnParams } from 'class-transformer'
import { STRING_MAX_LENGTH } from '../../constants/global'

export class CreateAnswerDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(STRING_MAX_LENGTH)
  answer: string
}
