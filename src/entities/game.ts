import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { AnswerStatusEnum } from '../constants/answer'
import { ProgressEntity } from './progress'
import { IGame } from 'src/types/game'
import { GameStatusEnum } from '../enums/gameStatusEnum'
import { GameQuestionEntity } from './game-question'

@Entity({
  name: 'games'
})

export class GameEntity extends BaseEntity implements IGame {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  firstPlayerProgressId: string | null

  @Column()
  secondPlayerProgressId: string | null

  @Column({
    type: 'timestamp',
    name: 'startGameDate',
  })
  startGameDate: Date | null

  @Column({
    type: 'timestamp',
    name: 'finishGameDate',
  })
  finishGameDate: Date | null

  @Column({ type: 'enum', enum: GameStatusEnum })
  status: GameStatusEnum

  @OneToMany(() => GameQuestionEntity, questions => questions.game)
  questions: GameQuestionEntity[] | null

  @OneToOne(() => ProgressEntity)
  @JoinColumn({
    name: 'firstPlayerProgressId',
  })
  firstPlayerProgress: ProgressEntity

  @OneToOne(() => ProgressEntity)
  @JoinColumn({
    name: 'secondPlayerProgressId'
  })
  secondPlayerProgress: ProgressEntity

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
