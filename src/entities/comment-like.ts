import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { ILike } from '../types/likes'
import { LikeStatusEnum } from '../constants/likes'
import { CommentEntity } from './comment'
import { UserEntity } from './user'

@Entity({
  name: 'comments-likes'
})
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

  @ManyToOne(() => CommentEntity, comment => comment.likes)
  @JoinColumn({
    name: 'sourceId'
  })
  comment: CommentEntity

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'authorId'
  })
  user: UserEntity
}
