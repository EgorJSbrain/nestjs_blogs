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

import { IGameQuestion } from '../types/game-question'
import { GameEntity } from './game'
import { QuestionEntity } from './question'
import { AnswerEntity } from './answer'

@Entity({
  name: 'game_questions'
})

export class GameQuestionEntity extends BaseEntity implements IGameQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'int', name: 'order' })
  order: number

  @Column()
  gameId: string

  @ManyToOne(() => GameEntity, game => game.questions)
  @JoinColumn({
    name: 'gameId'
  })
  game: GameEntity

  @Column()
  answerId: string

  @OneToOne(() => AnswerEntity, answer => answer.question, { eager: true })
  @JoinColumn({
    name: 'answerId'
  })
  answer: AnswerEntity

  @Column()
  questionId: string

  @ManyToOne(() => QuestionEntity, { eager: true })
  @JoinColumn({
    name: 'questionId'
  })
  question: QuestionEntity

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
