import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { PostEntity } from './post'
import { ILike } from '../types/likes'
import { LikeStatusEnum } from '../constants/likes'
import { UserEntity } from './user'

@Entity({
  name: 'posts_likes'
})
export class PostLikeEntity extends BaseEntity implements ILike {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  sourceId: string

  @Column({ nullable: false })
  authorId: string

  @Column({ type: 'enum', enum: LikeStatusEnum })
  status: LikeStatusEnum

  @Column()
  createdAt: string

  @ManyToOne(() => PostEntity, post => post.likes)
  @JoinColumn({
    name: 'sourceId'
  })
  post: PostEntity

  @ManyToOne(() => UserEntity, user => user.postsLikes)
  @JoinColumn({
    name: 'authorId'
  })
  user: UserEntity
}
