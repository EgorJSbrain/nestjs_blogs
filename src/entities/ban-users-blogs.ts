import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { IBanUsersBlogs } from '../types/ban-users-blogs'
import { STRING_MAX_LENGTH } from '../constants/global'
import { UserEntity } from './user'
import { BlogEntity } from './blog'

@Entity({
  name: 'ban_users_blogs'
})
export class BanUsersBlogsEntity extends BaseEntity implements IBanUsersBlogs {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  blogId: string

  @Column({ nullable: false })
  userId: string

  @Column({ nullable: true, type: 'timestamp' })
  banDate: string | null

  @Column({
    length: STRING_MAX_LENGTH,
    nullable: true,
    type: 'character varying'
  })
  banReason: string | null

  @Column({ nullable: true })
  isBanned: boolean

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'userId'
  })

  user: UserEntity
  @ManyToOne(() => BlogEntity)
  @JoinColumn({
    name: 'blogId'
  })
  blog: BlogEntity

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    name: 'createdAt'
  })
  createdAt: Date

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'updatedAt'
  })
  updatedAt: Date | null

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'deletedAt'
  })
  deletedAt: Date | null
}
