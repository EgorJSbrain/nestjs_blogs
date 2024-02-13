import {
  IsBoolean,
  IsDefined,
} from 'class-validator'

export class QuestionPublishDto {
  @IsBoolean()
  @IsDefined()
  published: boolean
}
