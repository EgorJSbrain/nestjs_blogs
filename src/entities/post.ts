import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { STRING_MAX_LENGTH } from '../constants/global'
import { BlogEntity } from './blog'
import { IPost } from '../types/posts'
import { PostLikeEntity } from './post-like'
import { CommentEntity } from './comment'

@Entity({
  name: 'posts'
})
export class PostEntity extends BaseEntity implements IPost {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: STRING_MAX_LENGTH })
  title: string

  @Column()
  blogId: string

  @Column()
  content: string

  @Column()
  shortDescription: string

  @Column()
  createdAt: string

  @ManyToOne(() => BlogEntity)
  blog: BlogEntity

  @OneToMany(() => PostLikeEntity, like => like.post)
  likes: PostLikeEntity[]

  @OneToMany(() => CommentEntity, comment => comment.post)
  comments: CommentEntity[]
}
