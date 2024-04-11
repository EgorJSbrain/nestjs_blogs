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

import { IUsersBlogs } from '../types/users-blogs'
import { SubscriptionStatusEnum } from '../enums/SubscriptionStatusEnum'
import { UserEntity } from './user'

@Entity({
  name: 'users_blogs'
})
export class UsersBlogsEntity extends BaseEntity implements IUsersBlogs {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  blogId: string

  @Column({ type: 'enum', enum: SubscriptionStatusEnum })
  status: SubscriptionStatusEnum | null

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({
    name: 'userId'
  })
  user: UserEntity

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    name: 'createdAt',
  })
  createdAt: Date

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'updatedAt',
  })
  updatedAt: Date | null;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'deletedAt',
  })
  deletedAt: Date | null;
}
