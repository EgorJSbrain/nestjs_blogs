import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { STRING_MAX_LENGTH } from '../constants/global'
import { IBlog } from '../types/blogs'
import { PostEntity } from './post'

@Entity()
export class BlogEntity extends BaseEntity implements IBlog {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: STRING_MAX_LENGTH })
  name: string

  @Column({ length: 1000 })
  description: string

  @Column({ length: STRING_MAX_LENGTH })
  websiteUrl: string

  @Column({ default: false })
  isMembership: boolean

  @Column()
  createdAt: string

  @OneToMany(() => PostEntity, (p) => p.blog)
  posts: PostEntity[]
}
