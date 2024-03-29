import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { IProgress } from '../types/progress'
import { AnswerEntity } from './answer'
import { UserEntity } from './user'
import { ProgressStatusEnum } from '../enums/ProgressStatusEnum'

@Entity({
  name: 'progresses'
})
export class ProgressEntity extends BaseEntity implements IProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  score: number

  @Column({ type: 'enum', enum: ProgressStatusEnum, nullable: true })
  status: ProgressStatusEnum

  @Column({ default: false })
  userId: string

  @ManyToOne(() => UserEntity, (user) => user.progresses, { eager: true })
  user: UserEntity

  @OneToMany(() => AnswerEntity, (answer) => answer.progress, { eager: true })
  answers: AnswerEntity[]

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    name: 'createdAt'
  })
  createdAt: Date

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'updatedAt'
  })
  updatedAt: Date | null

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'deletedAt'
  })
  deletedAt: Date | null
}
