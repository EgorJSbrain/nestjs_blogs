import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { PostEntity } from './post'
import { IComment } from '../types/comments'
import { UserEntity } from './user'
import { CommentLikeEntity } from './comment-like'

@Entity({
  name: 'comments'
})
export class CommentEntity extends BaseEntity implements IComment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 1000 })
  content: string

  @Column({ nullable: false })
  sourceId: string

  @Column({ nullable: false })
  authorId: string

  @Column()
  createdAt: string

  @ManyToOne(() => PostEntity, post => post.comments)
  @JoinColumn({
    name: 'sourceId'
  })
  post: PostEntity

  @ManyToOne(() => UserEntity, user => user.comments)
  @JoinColumn({
    name: 'authorId'
  })
  user: UserEntity

  @OneToMany(() => CommentLikeEntity, like => like.comment)
  likes: CommentLikeEntity[]
}
