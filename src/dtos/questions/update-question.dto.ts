import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

import {
  QUESTION_BODY_MAX_LENGTH,
  QUESTION_BODY_MIN_LENGTH
} from '../../constants/questions'

export class UpdateQuestionDto {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(QUESTION_BODY_MIN_LENGTH)
  @MaxLength(QUESTION_BODY_MAX_LENGTH)
  body: string

  @IsArray()
  @IsDefined()
  @IsNotEmpty()
  correctAnswers: string | number
}
