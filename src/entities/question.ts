import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { STRING_MAX_LENGTH } from '../constants/global'
import { IQuestion } from '../types/questions'
import { AnswerEntity } from './answer'

@Entity({
  name: 'questions'
})
export class QuestionEntity extends BaseEntity implements IQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: STRING_MAX_LENGTH })
  body: string

  @Column("json")
  correctAnswers: string

  @Column({ default: false })
  published: boolean

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    name: 'createdAt',
  })
  createdAt: Date

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'updatedAt',
  })
  updatedAt: Date | null;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'deletedAt',
  })
  deletedAt: Date | null;
}
