import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { IBanUsersBlogs } from '../types/ban-users-blogs'
import { STRING_MAX_LENGTH } from '../constants/global'

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

  @Column({
    length: STRING_MAX_LENGTH,
    nullable: true,
    type: 'character varying'
  })
  banReason: string | null

  @Column({ nullable: true })
  isBanned: boolean

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
