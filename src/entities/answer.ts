import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { IAnswer } from '../types/answer'
import { QuestionEntity } from './question'
import { AnswerStatusEnum } from '../constants/answer'
import { UserEntity } from './user'
import { ProgressEntity } from './progress'

@Entity({
  name: 'answers'
})

export class AnswerEntity extends BaseEntity implements IAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  questionId: string

  @Column()
  userId: string

  @Column()
  progressId: string

  @Column({ type: 'enum', enum: AnswerStatusEnum })
  answerStatus: AnswerStatusEnum

  @ManyToOne(() => QuestionEntity, question => question.answers)
  @JoinColumn({
    name: 'questionId'
  })
  question: QuestionEntity

  @ManyToOne(() => UserEntity, user => user.answers)
  @JoinColumn({
    name: 'userId'
  })
  user: UserEntity

  @ManyToOne(() => ProgressEntity, progress => progress.answers)
  @JoinColumn({
    name: 'progressId'
  })
  progress: ProgressEntity

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
