import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm'

import { STRING_MAX_LENGTH } from '../constants/global'
import { IQuestion } from '../types/questions'

@Entity({
  name: 'questions'
})
export class QuestionEntity extends BaseEntity implements IQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: STRING_MAX_LENGTH })
  body: string

  @Column("character varying", { array: true })
  correctAnswers: string[]

  @Column({ default: false })
  published: boolean

  @Column()
  createdAt: string

  @Column()
  updatedAt: string
}
