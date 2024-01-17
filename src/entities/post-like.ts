import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { PostEntity } from './post'
import { ILike } from '../types/likes'
import { LikeStatusEnum } from '../constants/likes'
import { UserEntity } from './user'

@Entity()
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

  @OneToOne(() => PostEntity)
  post: PostEntity

  @OneToOne(() => UserEntity)
  user: UserEntity
}
