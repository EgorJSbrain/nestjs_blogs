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

import { IProgress } from 'src/types/progress'
import { AnswerEntity } from './answer'
import { UserEntity } from './user'

@Entity({
  name: 'progresses'
})
export class ProgressEntity extends BaseEntity implements IProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  score: number

  @Column({ default: false })
  userId: string

  @ManyToOne(() => UserEntity, user => user.progresses, { eager: true })
  user: UserEntity

  @OneToMany(() => AnswerEntity, answer => answer.progress)
  answers: AnswerEntity[]

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
