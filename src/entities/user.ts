import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { STRING_MAX_LENGTH } from '../constants/global'
import { IExtendedUser } from '../types/users'
import { DeviceEntity } from './devices'
import { CommentEntity } from './comment'

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity implements IExtendedUser {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: STRING_MAX_LENGTH })
  login: string

  @Column()
  email: string

  @Column()
  confirmationCode: string

  @Column()
  expirationDate: string

  @Column()
  passwordHash: string

  @Column()
  passwordSalt: string

  @Column({ default: false })
  isConfirmed: boolean

  @Column()
  createdAt: string

  @OneToMany(() => DeviceEntity, (device) => device.user)
  devices: DeviceEntity[]

  @OneToMany(() => CommentEntity, comment => comment.user)
  comments: CommentEntity[]
}
