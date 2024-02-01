import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { STRING_MAX_LENGTH } from '../constants/global'
import { IDevice } from '../types/devices'
import { UserEntity } from './user'

@Entity({ name: 'devices' })
export class DeviceEntity extends BaseEntity implements IDevice {
  @PrimaryGeneratedColumn('uuid')
  deviceId: string

  @Column({ nullable: false })
  ip: string

  @Column({ length: STRING_MAX_LENGTH })
  title: string

  @Column({ nullable: false })
  userId: string

  @Column()
  lastActiveDate: string

  @Column()
  expiredDate: string

  @ManyToOne(() => UserEntity, (user) => user.devices)
  user: UserEntity
}
