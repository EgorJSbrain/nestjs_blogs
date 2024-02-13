import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
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
    // onUpdate: 'CURRENT_TIMESTAMP(6)',
    name: 'updatedAt',
  })
  updatedAt: Date | null;

  @DeleteDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    name: 'deletedAt',
  })
  deletedAt: Date | null;
}
