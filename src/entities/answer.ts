import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { IAnswer } from '../types/answer'
import { AnswerStatusEnum } from '../constants/answer'
import { UserEntity } from './user'
import { ProgressEntity } from './progress'
import { GameQuestionEntity } from './game-question'

@Entity({
  name: 'answers'
})

export class AnswerEntity extends BaseEntity implements IAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  progressId: string

  @Column()
  questionId: string

  @Column({ type: 'enum', enum: AnswerStatusEnum })
  answerStatus: AnswerStatusEnum

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

  @ManyToOne(() => GameQuestionEntity, question => question.answers)
  @JoinColumn({
    name: 'questionId'
  })
  question: GameQuestionEntity

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
