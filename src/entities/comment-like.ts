import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { ILike } from '../types/likes'
import { LikeStatusEnum } from '../constants/likes'
import { CommentEntity } from './comment'
import { UserEntity } from './user'

@Entity()
export class CommentLikeEntity extends BaseEntity implements ILike {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  sourceId: string

  @Column({ nullable: false })
  authorId: string

  @Column()
  createdAt: string

  @Column({ type: 'enum', enum: LikeStatusEnum })
  status: LikeStatusEnum

  @OneToOne(() => CommentEntity)
  comment: CommentEntity

  @OneToOne(() => UserEntity)
  user: UserEntity
}
