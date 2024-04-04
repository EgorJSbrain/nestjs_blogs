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

import { STRING_MAX_LENGTH } from '../constants/global'
import { IBlog } from '../types/blogs'
import { PostEntity } from './post'
import { UserEntity } from './user'
import { FileEntity } from './files'

@Entity({
  name: 'blogs'
})
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

  @Column({ default: false })
  isBanned?: boolean

  @Column({ nullable: true, type: 'timestamp' })
  banDate?: string | null

  @Column({ nullable: true })
  ownerId: string

  @Column()
  createdAt: string

  @ManyToOne(() => UserEntity, user => user.blogs)
  @JoinColumn({
    name: 'ownerId'
  })
  user: UserEntity

  @OneToMany(() => PostEntity, (p) => p.blog)
  posts: PostEntity[]

  @OneToOne(() => FileEntity, file => file.blog, { eager: true })
  wallpaper: FileEntity

  @OneToMany(() => FileEntity, file => file.blog, { eager: true })
  main: FileEntity[]
}
