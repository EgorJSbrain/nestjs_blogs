import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { PostEntity } from './post'
import { IComment } from 'src/types/comments'
import { UserEntity } from './user'

@Entity()
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

  @OneToOne(() => PostEntity)
  post: PostEntity

  @OneToOne(() => UserEntity)
  user: UserEntity
}
