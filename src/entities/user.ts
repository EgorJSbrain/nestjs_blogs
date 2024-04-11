import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { STRING_MAX_LENGTH } from '../constants/global'
import { IExtendedUser } from '../types/users'
import { DeviceEntity } from './devices'
import { CommentEntity } from './comment'
import { PostLikeEntity } from './post-like'
import { AnswerEntity } from './answer'
import { ProgressEntity } from './progress'
import { BlogEntity } from './blog'

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity implements IExtendedUser {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: STRING_MAX_LENGTH })
  login: string

  @Column()
  email: string

  @Column({ length: STRING_MAX_LENGTH, nullable: true, type: 'character varying' })
  banReason: string | null

  @Column({ nullable: true })
  isBanned: boolean

  @Column({ nullable: true, type: 'timestamp' })
  banDate: string | null

  @Column()
  confirmationCode: string

  @Column()
  confirmationTelegramCode: string

  @Column()
  expirationDate: string

  @Column()
  passwordHash: string

  @Column()
  passwordSalt: string

  @Column({ nullable: true })
  telegramId?: string

  @Column({ default: false })
  isConfirmed: boolean

  @Column()
  createdAt: string

  @OneToMany(() => DeviceEntity, (device) => device.user)
  devices: DeviceEntity[]

  @OneToMany(() => BlogEntity, (blog) => blog.ownerId)
  blogs: BlogEntity[]

  @OneToMany(() => ProgressEntity, (progress) => progress.user)
  progresses: ProgressEntity[]

  @OneToMany(() => CommentEntity, comment => comment.user)
  comments: CommentEntity[]

  @OneToMany(() => PostLikeEntity, like => like.user)
  postsLikes: PostLikeEntity[]

  @OneToMany(() => AnswerEntity, answer => answer.user)
  answers: AnswerEntity[]

  // @ManyToMany(() => BlogEntity, (blog) => blog.user)
  // @JoinTable({
  //   name: 'users_blogs',
  //   joinColumn: {
  //     name: 'blogId',
  //   },
  //   inverseJoinColumn: {
  //     name: 'userId',
  //   },
  // })
  // blogs: BlogEntity[];
}
